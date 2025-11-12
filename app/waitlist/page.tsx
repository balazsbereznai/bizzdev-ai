'use client'

import { useState } from 'react'

type SubmitState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; message?: string }
  | { status: 'error'; message: string }

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<SubmitState>({ status: 'idle' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return setState({ status: 'error', message: 'Email is required.' })
    setState({ status: 'loading' })

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || null,
          notes: notes || null,
          source: 'waitlist-page',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setState({ status: 'error', message: data?.error || 'Something went wrong.' })
        return
      }

      setState({
        status: 'ok',
        message:
          data?.alreadyExists
            ? 'You’re already on the list. We’ll reach out soon.'
            : 'Thanks! You’re on the list. We’ll email you as soon as invites open.',
      })
    } catch (err) {
      setState({ status: 'error', message: 'Network error. Please try again.' })
    }
  }

  if (state.status === 'ok') {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="rounded-2xl border border-[--border] bg-[--card] p-6 elev-1">
          <h1 className="text-2xl font-semibold">You’re on the list ✨</h1>
          <p className="mt-2 text-[--muted-foreground]">{state.message}</p>
          <div className="mt-6 text-sm text-[--muted-foreground]">
            <p>
              If you used the wrong email, go back and submit again with the one you’ll use to sign in.
            </p>
          </div>
          <button
            className="btn mt-6"
            onClick={() => {
              setEmail('')
              setName('')
              setNotes('')
              setState({ status: 'idle' })
            }}
          >
            Add another email
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div
        className="
          rounded-2xl border border-[--border] bg-[--card] p-6 elev-1
          bg-[linear-gradient(180deg,#283c63_0%,#22324a_100%)]
        "
      >
        <h1 className="text-2xl font-semibold text-white">Request early access</h1>
        <p className="mt-2 text-[--muted-foreground]">
          We’re rolling out invite-only access. Leave your email and we’ll get you in as slots open.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm text-[--muted-foreground]">Email</label>
            <input
              className="input w-full"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[--muted-foreground]">Name <span className="opacity-60">(optional)</span></label>
            <input
              className="input w-full"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[--muted-foreground]">Notes <span className="opacity-60">(optional)</span></label>
            <textarea
              className="textarea w-full"
              rows={4}
              placeholder="Anything we should know about your use case?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button className="btn w-full" type="submit" disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Submitting…' : 'Join waitlist'}
          </button>

          {state.status === 'error' && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}
        </form>

        <p className="mt-4 text-xs text-[--muted-foreground]">
          Already invited? <a className="underline" href="/signin">Sign in</a>
        </p>
      </div>
    </main>
  )
}

