"use client";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Executes reCAPTCHA v3 for the given action and returns the token to send
 * along with the form submission. Returns null when no site key is
 * configured (dev/local) or the script hasn't loaded — callers should just
 * omit the token in that case; the server treats a missing key as "not
 * configured" and skips verification rather than rejecting the submission. */
export function useRecaptcha() {
  const getToken = async (action: string): Promise<string | null> => {
    if (!SITE_KEY || typeof window === "undefined" || !window.grecaptcha) return null;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve).catch(() => resolve(null));
      });
    });
  };

  return { getToken, enabled: Boolean(SITE_KEY) };
}
