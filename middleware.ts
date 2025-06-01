import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip middleware for static files, API routes, and root
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.includes(".")
  ) {
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log("Middleware - Path:", request.nextUrl.pathname, "User:", !!user, "Error:", error)

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/claims", "/patients", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // Auth routes
    const authRoutes = ["/auth/login", "/auth/signup"]
    const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

    // If there's an error getting the user, allow access to auth routes
    if (error) {
      console.log("User error:", error)
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
      return response
    }

    // If user is not signed in and trying to access protected route
    if (!user && isProtectedRoute) {
      console.log("No user, redirecting to login from:", request.nextUrl.pathname)
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (user && isAuthRoute) {
      console.log("User logged in, redirecting to dashboard from:", request.nextUrl.pathname)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)

    // On error, allow access to auth routes but protect others
    const protectedRoutes = ["/dashboard", "/claims", "/patients", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    return response
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
