import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const url = request.nextUrl.clone()
  const isHomeRoute = url.pathname === '/'
  const isLoginRoute = url.pathname.startsWith('/login')
  const isResetPasswordRoute = url.pathname.startsWith('/reset-password')
  const isAuthCallbackRoute = url.pathname.startsWith('/auth/callback')
  const hasRecoveryCode = Boolean(url.searchParams.get('code'))
  const hasRecoveryTokenHash = Boolean(url.searchParams.get('token_hash'))
  const isRecoveryFlow =
    url.searchParams.get('type') === 'recovery' ||
    hasRecoveryCode ||
    hasRecoveryTokenHash

  if (isRecoveryFlow && !isResetPasswordRoute && !isAuthCallbackRoute) {
    url.pathname = '/auth/callback'
    if (!url.searchParams.has('next')) {
      url.searchParams.set('next', '/reset-password')
    }
    return NextResponse.redirect(url)
  }

  if (!user && !isHomeRoute && !isLoginRoute && !isResetPasswordRoute && !isAuthCallbackRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginRoute) {
    url.pathname = '/overview'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
