import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (!isLoginPage && !req.auth) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
    }

    if (isLoginPage && req.auth) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }

    return NextResponse.next();
  }

  if (pathname === "/maintenance") return NextResponse.next();

  // Public pages go dark when maintenance mode is on; /admin stays reachable
  // above so it can always be switched back off. Routed through an API route
  // rather than prisma directly — the proxy's bundle can't load the
  // better-sqlite3 native addon.
  try {
    const res = await fetch(new URL("/api/maintenance-status", req.nextUrl.origin), { cache: "no-store" });
    const { enabled } = (await res.json()) as { enabled: boolean };
    if (enabled) return NextResponse.rewrite(new URL("/maintenance", req.nextUrl.origin));
  } catch {
    // If the check itself fails, fail open rather than taking the site down.
  }
});

export const config = {
  // Skips anything with a file extension (public/ assets, uploads, etc.) so
  // maintenance mode never rewrites the logo, images, downloads, and so on —
  // only actual page routes get swapped to the maintenance page.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
