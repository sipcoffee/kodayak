import { NextRequest, NextResponse } from "next/server";

interface SessionUser {
  role?: string;
  [key: string]: unknown;
}

interface SessionResponse {
  session?: {
    user?: SessionUser;
  };
  user?: SessionUser;
}

async function getSessionRole(request: NextRequest): Promise<string | null> {
  try {
    const response = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!response.ok) return null;

    const data: SessionResponse = await response.json();
    return data?.session?.user?.role || data?.user?.role || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("__session");

  // Auth routes - redirect based on role if logged in
  const authRoutes = ["/login", "/signup"];

  // Client routes - require CLIENT role
  const clientRoutes = ["/dashboard", "/events", "/billing", "/settings"];

  // Admin routes - require ADMIN role
  const adminRoutes = ["/admin"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isClientRoute = clientRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected pages
  if (!sessionCookie && (isClientRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL(`${origin}/login`, request.url));
  }

  // For authenticated users, check role-based access
  if (sessionCookie) {
    // Redirect authenticated users away from auth pages based on role
    if (isAuthRoute) {
      const role = await getSessionRole(request);
      // Only redirect if session is actually valid
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL(`${origin}/admin`, request.url));
      } else if (role === "CLIENT") {
        return NextResponse.redirect(new URL(`${origin}/dashboard`, request.url));
      }
      // If role is null, session is invalid - let them through to login page
    }

    // Check role-based access for protected routes
    if (isClientRoute || isAdminRoute) {
      const role = await getSessionRole(request);

      // ADMIN trying to access client routes → redirect to /admin
      if (role === "ADMIN" && isClientRoute) {
        return NextResponse.redirect(new URL(`${origin}/admin`, request.url));
      }

      // CLIENT trying to access admin routes → redirect to /dashboard
      if (role === "CLIENT" && isAdminRoute) {
        return NextResponse.redirect(
          new URL(`${origin}/dashboard`, request.url)
        );
      }

      // No role found (session invalid) → redirect to login
      if (!role) {
        return NextResponse.redirect(new URL(`${origin}/login`, request.url));
      }
    }
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
