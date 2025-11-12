import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(req: Request) {
  try {
    // Verify requester is a master email
    const cookieStore = await cookies()
    const supa = createServerClient(url, anon, {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set() {},
        remove() {},
      },
    })
    const { data: { user } } = await supa.auth.getUser()
    const email = user?.email?.toLowerCase() || ''
    const masters = (process.env.NEXT_PUBLIC_ALPHA_MASTERS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    if (!email || !masters.includes(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const pendingFirst = searchParams.get('pending') === '1'

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

    // Base query
    let query = admin
      .from('waitlist')
      .select('id,email,name,source,notes,created_at,decision,decision_comment,decided_at')
      .limit(100)

    // Search by email/name/notes (case-insensitive)
    if (q) {
      // Use ilike on multiple columns; Supabase doesn't support OR ILIKE chained nicely in the builder,
      // so use `or` with CSV conditions.
      const like = `%${q}%`
      query = query.or(
        `email.ilike.${like},name.ilike.${like},notes.ilike.${like}`
      )
    }

    // Ordering
    if (pendingFirst) {
      // pending first (decision null), then decided; each group newest first
      // Emulate by ordering on a boolean expression then created_at desc
      // In PostgREST syntax: order=decision.nullsfirst -> pending first
      query = query.order('decision', { ascending: true, nullsFirst: true }).order('created_at', { ascending: false })
    } else {
      // default: newest first
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

    return NextResponse.json({ rows: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

