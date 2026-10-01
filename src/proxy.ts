import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/set-password",
  "/auth/set-password",
  "/signup",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/leads",
  "/campaigns",
  "/marketing",
  "/teams",
  "/templates",
  "/notifications",
  "/ai-chatbox",
  "/payments",
  "/reports",
  "/settings",
  "/website-cms",
  "/activity-log",
];

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const jsonPayload = atob(padded);
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function checkIsAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) return false;

  const payload = parseJwt(accessToken);
  // If not a valid JWT structure, reject immediately
  if (!payload) return false;

  // Check expiration if exp field is present
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    // If refreshToken exists, allow access so client-side silent refresh can renew the session
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      return true;
    }
    // Access token expired and no refresh token available
    return false;
  }

  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = checkIsAuthenticated(request);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If already authenticated and trying to access login/auth pages, redirect to dashboard
  if (isAuthenticated && isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If visiting root "/" while authenticated, redirect to dashboard
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If unauthenticated and trying to access protected admin pages, redirect to login
  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/set-password",
    "/login",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/set-password",
    "/signup",
    "/dashboard/:path*",
    "/leads/:path*",
    "/campaigns/:path*",
    "/marketing/:path*",
    "/teams/:path*",
    "/templates/:path*",
    "/notifications/:path*",
    "/ai-chatbox/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/website-cms/:path*",
    "/activity-log/:path*",
  ],
};
