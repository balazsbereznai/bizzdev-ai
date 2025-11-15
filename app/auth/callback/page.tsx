// app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function Callback() {
  const [msg, setMsg] = useState('Finishing sign in…')
  const [debug, setDebug] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const run = async () => {
      const next = searchParams.get('next') || '/profile'
      const code = searchParams.get('code') ?? undefined

      // 1) First try: do we already have a session?
      let { data, error } = await supabase.auth.getUser()

      if (data.user) {
        setMsg('Signed in. Redirecting…')
        setDebug(null)
        router.replace(next)
        return
      }

      // 2) If no user and no code in the URL, we cannot recover here
      if (!code) {
        setMsg('Could not sign in. Try again.')
        if (error) {
          console.error('Supabase getUser error on callback (no code)', error)
          setDebug(`Supabase getUser error: ${error.message}`)
        } else {
          setDebug('No user session and no auth code in URL.')
        }
        return
      }

      // 3) We have an auth code but no session yet.
      //    This covers flows where Supabase sends the magic link directly
      //    (e.g. admin/alpha_tester invites) and the browser has no session.
      setMsg('Finishing sign in…')

      const {
        data: exchangeData,
        error: exchangeError,
      } = await supabase.auth.exchangeCodeForSession({ code })

      if (!exchangeError && exchangeData.session) {
        setMsg('Signed in. Redirecting…')
        setDebug(null)
        router.replace(next)
        return
      }

      // 4) If exchange failed, log and try one last time to see if a session exists
      if (exchangeError) {
        console.error('Supabase exchangeCodeForSession error', exchangeError)
      }

      ;({ data, error } = await supabase.auth.getUser())
      if (data.user) {
        setMsg('Signed in. Redirecting…')
        setDebug(null)
        router.replace(next)
        return
      }

      // 5) Still no session: show a clear error for the user + debug info for us
      setMsg('Could not sign in. Try again.')
      if (exchangeError) {
        setDebug(
          `Supabase exchangeCodeForSession error: ${exchangeError.message}`,
        )
      } else if (error) {
        setDebug(`Supabase getUser error after exchange: ${error.message}`)
      } else {
        setDebug('No user session found after exchanging auth code.')
      }
    }

    void run()
  }, [router, searchParams, supabase])

  return (
    <main style={{ padding: 24 }}>
      <p>{msg}</p>
      {debug && (
        <pre
          style={{
            marginTop: 16,
            fontSize: 12,
            color: '#b91c1c',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {debug}
        </pre>
      )}
    </main>
  )
}

