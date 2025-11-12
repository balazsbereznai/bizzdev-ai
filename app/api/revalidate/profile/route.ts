// app/api/revalidate/profile/route.ts
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST() {
  // Force the /profile page to fetch fresh data on next render
  revalidatePath('/profile')
  return NextResponse.json({ ok: true })
}

