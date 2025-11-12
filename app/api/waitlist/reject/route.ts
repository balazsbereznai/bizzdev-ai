export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import nodemailer from 'nodemailer';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function mailer() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    const comment = body.comment ? String(body.comment) : null;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Verify requester is master
    const cookieStore = await cookies();
    const supa = createServerClient(url, anon, {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set() {},
        remove() {},
      },
    });
    const {
      data: { user },
    } = await supa.auth.getUser();
    const email = user?.email?.toLowerCase() || '';
    const masters = (process.env.NEXT_PUBLIC_ALPHA_MASTERS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!email || !masters.includes(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const adminUserId = user?.id || null;

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Get target email
    const { data: row, error: rowErr } = await admin
      .from('waitlist')
      .select('email,name')
      .eq('id', id)
      .maybeSingle();
    if (rowErr || !row) return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    const wlEmail = String(row.email).toLowerCase();

    // Mark decision
    const { error } = await admin
      .from('waitlist')
      .update({
        decision: 'rejected',
        decision_comment: comment,
        decided_by: adminUserId,
        decided_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });

    // Send rejection email (best-effort)
    try {
      const transporter = mailer();
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;
      const name = row.name ? row.name : wlEmail;
      const subject = `About your BizzDev.ai access request`;
      const textLines = [
        `Hi ${name},`,
        ``,
        `Thanks for your interest in BizzDev.ai. We're not able to approve your request right now.`,
        comment ? `Reason: ${comment}` : '',
        ``,
        `We’ll keep your details and reach out as the alpha expands.`,
        ``,
        `— Balázs`,
      ].filter(Boolean);
      const text = textLines.join('\n');

      await transporter.sendMail({
        from,
        to: wlEmail,
        subject,
        text,
        html: text.replace(/\n/g, '<br/>'),
      });
    } catch {
      // swallow email errors
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

