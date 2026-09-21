import type { NextRequest } from "next/server";
import { HONEYPOT_FIELD, RENDERED_AT_FIELD, RECAPTCHA_TOKEN_FIELD } from "@/lib/spam-protection-fields";

export { HONEYPOT_FIELD, RENDERED_AT_FIELD, RECAPTCHA_TOKEN_FIELD };

// ── Rate limiting ────────────────────────────────────────────────────────────
// In-memory sliding window, keyed by IP + route. Fine for a single Next.js
// instance (this app's deployment); if it's ever scaled to multiple
// instances/serverless, this needs to move to a shared store (Redis, DB row)
// since each instance would otherwise track its own counts independently.
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max submissions per IP per route per window

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function isRateLimited(req: NextRequest, routeKey: string): boolean {
  const key = `${routeKey}:${getClientIp(req)}`;
  const now = Date.now();
  const timestamps = (submissionLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    submissionLog.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  submissionLog.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded over the process
  // lifetime — cheap 1-in-50 chance per call rather than a separate timer.
  if (Math.random() < 0.02) {
    for (const [k, ts] of submissionLog) {
      const fresh = ts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) submissionLog.delete(k);
      else submissionLog.set(k, fresh);
    }
  }

  return false;
}

// ── Honeypot ─────────────────────────────────────────────────────────────────
// Every public form renders a field named HONEYPOT_FIELD, hidden from real
// users via CSS (not `display:none`/`type=hidden`, which some bots skip) but
// present in the DOM. A bot that auto-fills every input fills it too. Real
// visitors never see or touch it, so any non-empty value is a clear bot
// signal — the caller should silently pretend success rather than error, so
// the bot doesn't learn to adjust.
export function isHoneypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim().length > 0;
}

// ── Minimum fill time ────────────────────────────────────────────────────────
// Every form also renders a hidden field with the timestamp (ms) of when it
// mounted. Bots that script-submit immediately land well under human typing
// speed; real users take at least a couple of seconds to fill a multi-field
// form. Same "pretend success" handling as the honeypot.
const MIN_FILL_TIME_MS = 1500;

export function isSubmittedTooFast(formData: FormData): boolean {
  const renderedAt = Number(formData.get(RENDERED_AT_FIELD));
  if (!renderedAt || Number.isNaN(renderedAt)) return false; // missing field — don't block, just skip this check
  return Date.now() - renderedAt < MIN_FILL_TIME_MS;
}

// ── reCAPTCHA v3 ─────────────────────────────────────────────────────────────
// Score-based, invisible — the client executes it on submit and sends the
// token along; this verifies it server-side against Google. Skips cleanly
// (treated as pass) when RECAPTCHA_SECRET_KEY isn't configured, so local dev
// without a key doesn't break form submission — only enforced once the site
// is actually configured with a key pair.
const RECAPTCHA_MIN_SCORE = 0.5;

export async function verifyRecaptcha(formData: FormData): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: true }; // not configured — don't block submissions

  const token = formData.get(RECAPTCHA_TOKEN_FIELD);
  if (typeof token !== "string" || !token) return { ok: false, reason: "missing token" };

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const json = await res.json();
    if (!json.success || (typeof json.score === "number" && json.score < RECAPTCHA_MIN_SCORE)) {
      return { ok: false, reason: `score ${json.score}` };
    }
    return { ok: true };
  } catch {
    // Google's endpoint being unreachable shouldn't take the whole form down.
    return { ok: true };
  }
}

// ── Combined check ───────────────────────────────────────────────────────────
// Runs every layer. `silent: true` means the caller should return a normal
// success response without actually processing the submission (honeypot/
// timing — don't tip the bot off). `silent: false` means a real error should
// go back to the user (rate limit, failed reCAPTCHA — a real visitor should
// see and can act on these).
export async function checkSpamProtection(
  req: NextRequest,
  formData: FormData,
  routeKey: string
): Promise<{ blocked: false } | { blocked: true; silent: boolean; reason: string }> {
  if (isHoneypotTripped(formData)) return { blocked: true, silent: true, reason: "honeypot" };
  if (isSubmittedTooFast(formData)) return { blocked: true, silent: true, reason: "too fast" };
  if (isRateLimited(req, routeKey)) return { blocked: true, silent: false, reason: "rate limited" };

  const recaptcha = await verifyRecaptcha(formData);
  if (!recaptcha.ok) return { blocked: true, silent: false, reason: `recaptcha: ${recaptcha.reason}` };

  return { blocked: false };
}
