import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const isAuthApiRoute = pathname.startsWith("/api/auth")
  const isPublicRoute = pathname === "/login" || pathname === "/register"
  const isAuthenticated = Boolean(req.auth)

  if (!isAuthenticated && !isPublicRoute && !isAuthApiRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
