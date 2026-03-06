import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("__session");

  // Auth routes - redirect to dashboard if logged in
  const authRoutes = ["/login", "/signup"];

  // Protected routes - require authentication
  const protectedRoutes = ["/dashboard", "/events", "/billing", "/settings"];

  // Admin routes - require admin role
  const adminRoutes = ["/admin"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL(`${origin}/dashboard`, request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!sessionCookie && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL(`${origin}/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
