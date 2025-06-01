import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip middleware for static files, API routes, and root
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.includes(".")
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    console.log("Middleware - Path:", req.nextUrl.pathname, "Session:", !!session, "Error:", error)

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/claims", "/patients", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Auth routes
    const authRoutes = ["/auth/login", "/auth/signup"]
    const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

    // If there's an error getting the session, allow access to auth routes
    if (error) {
      console.log("Session error:", error)
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
      return res
    }

    // If user is not signed in and trying to access protected route
    if (!session && isProtectedRoute) {
      console.log("No session, redirecting to login from:", req.nextUrl.pathname)
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (session && isAuthRoute) {
      console.log("User logged in, redirecting to dashboard from:", req.nextUrl.pathname)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)

    // On error, allow access to auth routes but protect others
    const protectedRoutes = ["/dashboard", "/claims", "/patients", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
