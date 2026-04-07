import { NextResponse, type NextRequest } from "next/server";

import { refreshSession } from "@/lib/supabase/middleware";

const AUTH_ROUTE = "/login";
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/about", "/privacy", "/terms", "/contact", "/sitemap"];
const GUEST_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

function isGuestOnlyRoute(pathname: string) {
  return GUEST_ONLY_ROUTES.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { user, response } = await refreshSession(request);
  const { pathname } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTH_ROUTE;
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isGuestOnlyRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
