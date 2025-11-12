// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers'

// Canonical Supabase server client for Next.js 15.
// Works in server actions, route handlers, and server components.
export async function supabaseServer() {
  const cookieStore = await nextCookies()
  const hdrs = await nextHeaders()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Next 15 requires getAll/setAll (and friends)
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        getAll: () =>
          cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
        set: (name: string, value: string, options?: Parameters<typeof cookieStore.set>[0]) =>
          cookieStore.set({ name, value, ...(options as any) }),
        setAll: (list: { name: string; value: string; options?: any }[]) => {
          list.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...(options as any) })
          )
        },
        remove: (name: string, options?: Parameters<typeof cookieStore.delete>[0]) =>
          cookieStore.delete({ name, ...(options as any) }),
      },
      headers: {
        get: (key: string) => hdrs.get(key) ?? undefined,
      },
    }
  )

  return supabase
}

// Also export default for convenience in places that do default import
export default supabaseServer

