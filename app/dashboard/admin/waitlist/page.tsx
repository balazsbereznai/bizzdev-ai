'use client'

import { useEffect, useMemo, useState } from 'react'

type WL = {
  id: string
  email: string
  name: string | null
  source: string | null
  notes: string | null
  created_at: string
  decision: 'approved' | 'rejected' | null
  decision_comment: string | null
  decided_at: string | null
}

export default function AdminWaitlistPage() {
  const [rows, setRows] = useState<WL[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [q, setQ] = useState('')                // search query
  const [pendingFirst, setPendingFirst] = useState(false) // toggle

  // Build the query string for the list endpoint
  const listUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (pendingFirst) params.set('pending', '1')
    return `/api/waitlist/admin/list?${params.toString()}`
  }, [q, pendingFirst])

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(listUrl, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load waitlist')
      setRows(data.rows || [])
    } catch (e: any) {
      setErr(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // re-load whenever the query/toggle changes
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl])

  async function approve(id: string, comment?: string | null) {
    setBusyId(id)
    setErr(null)
    try {
      const res = await fetch('/api/waitlist/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, comment: comment ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Approve failed')
      if (data.magicLink) window.prompt('Copy the magic link to share:', data.magicLink)
      await load()
    } catch (e: any) {
      setErr(e.message || 'Error')
    } finally {
      setBusyId(null)
    }
  }

  async function reject(id: string, comment?: string | null) {
    setBusyId(id)
    setErr(null)
    try {
      const res = await fetch('/api/waitlist/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, comment: comment ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Reject failed')
      await load()
    } catch (e: any) {
      setErr(e.message || 'Error')
    } finally {
      setBusyId(null)
    }
  }

  // Local state to hold per-row comments
  const [commentById, setCommentById] = useState<Record<string, string>>({})

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Waitlist</h1>
      <p className="mt-1 text-[--muted-foreground]">Approve or reject access requests.</p>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input w-full sm:max-w-sm"
          placeholder="Search by email, name or notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pendingFirst}
            onChange={(e) => setPendingFirst(e.target.checked)}
          />
          Pending first
        </label>
        <button className="btn btn-ghost sm:ml-auto" onClick={load}>
          Refresh
        </button>
      </div>

      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

      {loading ? (
        <div className="mt-6 text-[--muted-foreground]">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[--border] p-6 text-[--muted-foreground]">
          No requests found.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-[--border] p-4 elev-1 bg-[--card]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{r.email}</div>
                  <div className="text-sm text-[--muted-foreground]">
                    {r.name ? `${r.name} • ` : ''}
                    {new Date(r.created_at).toLocaleString()}
                    {r.source ? ` • ${r.source}` : ''}
                  </div>
                </div>
                <div className="text-sm">
                  {r.decision ? (
                    <span className={r.decision === 'approved' ? 'text-green-500' : 'text-red-500'}>
                      {r.decision} {r.decided_at ? `• ${new Date(r.decided_at).toLocaleString()}` : ''}
                    </span>
                  ) : (
                    <span className="text-[--muted-foreground]">pending</span>
                  )}
                </div>
              </div>

              {r.notes && (
                <p className="mt-3 text-sm text-[--muted-foreground] whitespace-pre-wrap">
                  {r.notes}
                </p>
              )}

              <div className="mt-3">
                <textarea
                  className="textarea w-full"
                  rows={2}
                  placeholder="Optional comment (shown in rejection email; stored with decision)"
                  value={commentById[r.id] || ''}
                  onChange={(e) =>
                    setCommentById((p) => ({ ...p, [r.id]: e.target.value }))
                  }
                />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  className="btn"
                  onClick={() => approve(r.id, commentById[r.id])}
                  disabled={busyId === r.id}
                >
                  {busyId === r.id ? 'Approving…' : 'Approve + get magic link'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => reject(r.id, commentById[r.id])}
                  disabled={busyId === r.id}
                >
                  {busyId === r.id ? 'Rejecting…' : 'Reject'}
                </button>
              </div>

              {r.decision_comment && (
                <p className="mt-2 text-xs text-[--muted-foreground]">
                  Comment: {r.decision_comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

