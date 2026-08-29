import { signOut } from "next-auth/react";

/**
 * Drop-in replacement for `fetch` in admin client components. Admin API routes
 * return 401 when the session is missing/expired; that means the session is no
 * longer good for anything, so force a real sign-out (clears the cookie) and
 * bounce to the login page instead of leaving the caller to show a dead-end
 * "Sign in required" error inline.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    await signOut({ callbackUrl: "/admin/login" });
  }
  return res;
}
