import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/verify-otp", "/reset-password", "/set-password", "/auth/set-password", "/signup"];
const PROTECTED_PREFIXES = [
  "/dashboard", "/profile", "/settings", "/products",
  "/leads", "/payments", "/campaigns", "/staffs",
  "/website-cms", "/reports", "/activity-log"
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!accessToken;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/set-password",
    "/login",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/set-password",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/products/:path*",
    "/leads/:path*",
    "/payments/:path*",
    "/campaigns/:path*",
    "/staffs/:path*",
    "/website-cms/:path*",
    "/reports/:path*",
    "/activity-log/:path*",
  ],
};