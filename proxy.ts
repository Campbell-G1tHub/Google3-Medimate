import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const user = session.user;
  if (!user.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  // Admin pages are for Medical Pantry staff only.
  if (request.nextUrl.pathname.startsWith("/dashboard/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/home", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/dashboard/:path*'],
}
