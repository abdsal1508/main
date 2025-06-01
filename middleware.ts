import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip middleware for static files and API routes
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes
    const protectedRoutes = ["/dashboard", "/claims", "/patients", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Auth routes
    const authRoutes = ["/auth/login", "/auth/signup"]
    const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

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
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
