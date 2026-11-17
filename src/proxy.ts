import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Next.js 16: this file replaces middleware.ts and exports `proxy`.
// This is the first gate only. The real protection is RLS in Supabase.

const AUTH_PAGES = ["/login", "/signup"];
const SIGNED_IN_ONLY = ["/profile"];

const isUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const signedIn = Boolean(claims?.sub);
  const isAdmin = claims?.app_metadata?.role === "admin";

  // Keep refreshed auth cookies when we redirect
  const redirectTo = (path: string, next?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = next ? `?next=${encodeURIComponent(next)}` : "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (isUnder(pathname, "/admin")) {
    if (!signedIn) return redirectTo("/login", pathname);
    if (!isAdmin) return redirectTo("/");
  }

  if (SIGNED_IN_ONLY.some((base) => isUnder(pathname, base)) && !signedIn) {
    return redirectTo("/login", pathname);
  }

  if (AUTH_PAGES.includes(pathname) && signedIn) {
    return redirectTo(isAdmin ? "/admin/dashboard" : "/");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
