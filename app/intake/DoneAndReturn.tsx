'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DoneAndReturn() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setBusy(true)
    setError(null)

    // 1) Ask server to revalidate /profile so changes appear immediately
    const res = await fetch('/api/revalidate/profile', { method: 'POST' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err?.error || 'Could not refresh profile view')
      setBusy(false)
      return
    }

    // 2) Go back to /profile and force a client refresh
    router.push('/profile')
    router.refresh()
  }

  return (
    <div className="mt-6">
      <button className="btn" onClick={handleClick} disabled={busy}>
        {busy ? 'Working…' : 'Done & Return to Profile'}
      </button>
      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  )
}

