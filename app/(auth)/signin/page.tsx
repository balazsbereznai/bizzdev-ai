'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function SignIn() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Derive origin at runtime so it works locally and in previews
  const origin = useMemo(() => {
    if (typeof window !== 'undefined') return window.location.origin
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }, [])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const emailRedirectTo = `${origin}/auth/callback?next=/profile`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    })

    setLoading(false)

    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      {sent ? (
        <p className="text-[--muted-foreground]">
          Magic link sent to <strong>{email}</strong>. Open it on this device to finish.
        </p>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-3">
          <input
            className="input w-full"
            placeholder="you@example.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  )
}

