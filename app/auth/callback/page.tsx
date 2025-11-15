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

      // Try this first: maybe a session already exists
      let { data, error } = await supabase.auth.getUser()
      if (data.user) {
        setMsg('Signed in. Redirecting…')
        setDebug(null)
        router.replace(next)
        return
      }

      // Parse hash params (for Supabase dashboard / invite-style links)
      let accessToken: string | undefined
      let refreshToken: string | undefined
      let code: string | undefined = searchParams.get('code') ?? undefined

      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.replace(/^#/, '')
        const hashParams = new URLSearchParams(hash)

        accessToken = hashParams.get('access_token') ?? undefined
        refreshToken = hashParams.get('refresh_token') ?? undefined

        // Some flows may pass `code` in the hash instead of query
        if (!code) {
          code = hashParams.get('code') ?? undefined
        }
      }

      // 1) Hash-token flow: access_token + refresh_token in URL fragment
      if (accessToken && refreshToken) {
        setMsg('Finishing sign in…')

        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (!sessionError && sessionData.session) {
          setMsg('Signed in. Redirecting…')
          setDebug(null)
          router.replace(next)
          return
        }

        // If setSession failed, log and fall through to other strategies
        if (sessionError) {
          console.error('Supabase setSession error on callback', sessionError)
          setDebug(`Supabase setSession error: ${sessionError.message}`)
        }
      }

      // 2) PKCE-style flow: ?code=... (or #code=...) → exchangeCodeForSession
      if (code) {
        setMsg('Finishing sign in…')

        const {
          data: exchangeData,
          error: exchangeError,
        } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError && exchangeData.session) {
          setMsg('Signed in. Redirecting…')
          setDebug(null)
          router.replace(next)
          return
        }

        if (exchangeError) {
          console.error(
            'Supabase exchangeCodeForSession error on callback',
            exchangeError,
          )
          setDebug(
            `Supabase exchangeCodeForSession error: ${exchangeError.message}`,
          )
        }
      }

      // 3) Final fallback: check getUser() once more in case a session appeared
      ;({ data, error } = await supabase.auth.getUser())
      if (data.user) {
        setMsg('Signed in. Redirecting…')
        setDebug(null)
        router.replace(next)
        return
      }

      // 4) Still no session → show friendly error and any debug info we have
      setMsg('Could not sign in. Try again.')
      if (!debug) {
        if (error) {
          console.error('Supabase getUser error on callback (final)', error)
          setDebug(`Supabase getUser error: ${error.message}`)
        } else if (!code && !accessToken && !refreshToken) {
          setDebug(
            'No user session and no auth parameters (code/access_token) found in URL.',
          )
        } else {
          setDebug('No user session found after processing auth callback.')
        }
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

