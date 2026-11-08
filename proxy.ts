import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'
import { getVolunteerAccess } from './lib/volunteer-access'

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const user = session.user;
  const access = await getVolunteerAccess(user);
  const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding")

  // Dumb bug with onboarding and users who have been approved getting redirected to onboarding again this logic is to fix that case specifically
  if (access.onboardingCompleted) {
    if (isOnboardingPage) {
      return NextResponse.redirect(
        new URL(access.hasAppAccess ? "/home" : "/application-status", request.url),
      )
    }
    if (!access.hasAppAccess) {
      return NextResponse.redirect(new URL("/application-status", request.url))
    }
  } else if (!isOnboardingPage) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  if (request.nextUrl.pathname.startsWith("/dashboard/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/home", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/home/:path*',
    '/dashboard/:path*',
    // Nav destinations that have no page yet; guarding them now keeps them behind
    // authentication as soon as they are built.
    '/opportunities/:path*',
    '/inbox/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
}
