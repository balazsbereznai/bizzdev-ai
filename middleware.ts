// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = new Set<string>([
  '/signin',
  '/waitlist',
  '/auth/callback',
  '/api/waitlist',
])

const APP_HOME = '/dashboard/hub'
const DEBUG_GATE = process.env.NEXT_PUBLIC_DEBUG_GATE === '1'
const MASTER_EMAILS = (process.env.NEXT_PUBLIC_ALPHA_MASTERS || process.env.ALPHA_MASTERS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/waitlist/')) return true
  if (pathname.startsWith('/api/waitlist/')) return true
  if (pathname.startsWith('/auth/callback/')) return true
  return false
}

function isAssetOrSystemPath(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  )
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (isAssetOrSystemPath(pathname)) return NextResponse.next()

  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          res.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  // Not signed in
  if (!user || userErr) {
    if (isPublicPath(pathname)) return res
    const toSignin = new URL('/signin', req.url)
    toSignin.searchParams.set('next', `${pathname}${search || ''}`)
    if (DEBUG_GATE) toSignin.searchParams.set('dbg', 'no-user')
    return NextResponse.redirect(toSignin)
  }

  const emailLower = (user.email || '').toLowerCase()

  // Master bypass
  const isMaster = MASTER_EMAILS.includes(emailLower)
  if (isMaster) {
    if (pathname === '/signin') {
      const nextParam = req.nextUrl.searchParams.get('next')
      const target = new URL(nextParam || APP_HOME, req.url)
      if (DEBUG_GATE) target.searchParams.set('dbg', 'master')
      return NextResponse.redirect(target)
    }
  }

  // Check allow-list for non-masters
  if (!isMaster) {
    const { data: allowRow, error: allowErr } = await supabase
      .from('alpha_testers')
      .select('email, enabled')
      .ilike('email', emailLower)
      .eq('enabled', true)
      .maybeSingle()

    const isAllowListed = !!allowRow && !allowErr
    if (!isAllowListed) {
      if (isPublicPath(pathname)) return res
      const toWaitlist = new URL('/waitlist', req.url)
      if (DEBUG_GATE) {
        toWaitlist.searchParams.set('dbg', 'deny')
        if (allowErr) toWaitlist.searchParams.set('err', 'allow-query')
      }
      return NextResponse.redirect(toWaitlist)
    }
  }

  // Admin area: only masters
  if (pathname.startsWith('/dashboard/admin') && !isMaster) {
    const toHome = new URL(APP_HOME, req.url)
    if (DEBUG_GATE) toHome.searchParams.set('dbg', 'admin-deny')
    return NextResponse.redirect(toHome)
  }

  // If allow-listed and on /signin, forward to app home
  if (pathname === '/signin') {
    const nextParam = req.nextUrl.searchParams.get('next')
    const target = new URL(nextParam || APP_HOME, req.url)
    if (DEBUG_GATE) target.searchParams.set('dbg', isMaster ? 'master' : 'allow')
    return NextResponse.redirect(target)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}

