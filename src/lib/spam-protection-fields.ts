// Field-name constants shared between client form components and the
// server-side checks in spam-protection.ts. Split into their own file so
// client components can import just the names without pulling in
// server-only logic (fetch to Google, in-memory rate-limit map, etc.).
export const HONEYPOT_FIELD = "website_url";
export const RENDERED_AT_FIELD = "form_rendered_at";
export const RECAPTCHA_TOKEN_FIELD = "recaptcha_token";
