import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function createSecurityHeaders(): Headers {
  const headers = new Headers()
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co https://*.vercel.app https://emojihub.yurace.pro; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://emojihub.yurace.pro; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:"
  )
  return headers
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const securityHeaders = createSecurityHeaders()
  securityHeaders.forEach((value, key) => response.headers.set(key, value))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          const headers = createSecurityHeaders()
          headers.forEach((v, k) => response.headers.set(k, v))
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          const headers = createSecurityHeaders()
          headers.forEach((v, k) => response.headers.set(k, v))
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isHomeRoute = url.pathname === '/'
  const isLandingRoute = url.pathname.startsWith('/landing')
  const isLoginRoute = url.pathname.startsWith('/login')
  const isResetPasswordRoute = url.pathname.startsWith('/reset-password')
  const isAuthCallbackRoute = url.pathname.startsWith('/auth/callback')
  const isPublicApiRoute = url.pathname.startsWith('/api/auth/')
  const isKeepAliveRoute = url.pathname.startsWith('/api/keep-alive')
  const isRobotsRoute = url.pathname === '/robots.txt'
  const isSitemapRoute = url.pathname === '/sitemap.xml'
  const hasRecoveryCode = Boolean(url.searchParams.get('code'))
  const hasRecoveryTokenHash = Boolean(url.searchParams.get('token_hash'))
  const isRecoveryFlow =
    url.searchParams.get('type') === 'recovery' ||
    hasRecoveryCode ||
    hasRecoveryTokenHash

  const createRedirectResponse = (redirectUrl: URL) => {
    const redirectResponse = NextResponse.redirect(redirectUrl)
    const headers = createSecurityHeaders()
    headers.forEach((value, key) => redirectResponse.headers.set(key, value))
    return redirectResponse
  }

  if (isRecoveryFlow && !isResetPasswordRoute && !isAuthCallbackRoute) {
    url.pathname = '/auth/callback'
    if (!url.searchParams.has('next')) {
      url.searchParams.set('next', '/reset-password')
    }
    return createRedirectResponse(url)
  }

  if (
    !user &&
    !isHomeRoute &&
    !isLandingRoute &&
    !isLoginRoute &&
    !isResetPasswordRoute &&
    !isAuthCallbackRoute &&
    !isPublicApiRoute &&
    !isKeepAliveRoute &&
    !isRobotsRoute &&
    !isSitemapRoute
  ) {
    url.pathname = '/login'
    return createRedirectResponse(url)
  }

  if (user && isLoginRoute) {
    url.pathname = '/overview'
    return createRedirectResponse(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
