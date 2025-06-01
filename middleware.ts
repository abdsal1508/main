import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is a protected route, redirect to login
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (!session && req.nextUrl.pathname.startsWith("/claims")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (!session && req.nextUrl.pathname.startsWith("/patients")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // If user is signed in and the current path is auth, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/claims/:path*", "/patients/:path*", "/admin/:path*", "/auth/:path*"],
}
