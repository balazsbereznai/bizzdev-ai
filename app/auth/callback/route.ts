// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // Fallback to a route you definitely have (you confirmed /profile works)
  const next = url.searchParams.get('next') || '/profile'

  if (!code) {
    return NextResponse.redirect(new URL(next, url).toString())
  }

  // ✅ Next 15: await cookies()
  const cookieStore = await cookies()

  // Create an auth-aware Supabase client that can set cookies in this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // These writes are applied to the outgoing response
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string) {
          cookieStore.delete(name)
        },
      },
    }
  )

  // Exchange the one-time code for a session (sets sb-* cookies)
  await supabase.auth.exchangeCodeForSession(code)

  // Redirect into your app; session should now "stick"
  return NextResponse.redirect(new URL(next, url).toString())
}

