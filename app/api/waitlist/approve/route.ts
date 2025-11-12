// app/api/waitlist/approve/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// dynamic import to avoid TS typing issues for nodemailer without extra files
async function mailer() {
  const { createTransport } = (await import("nodemailer")) as any;
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true") === "true";
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  return createTransport({ host, port, secure, auth: { user, pass } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || "");
    const comment = body.comment ? String(body.comment) : null;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Verify requester is master (via current session)
    const cookieStore = await cookies(); // Next 15 requires await
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

    const email = user?.email?.toLowerCase() || "";
    const masters = (process.env.NEXT_PUBLIC_ALPHA_MASTERS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!email || !masters.includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminUserId = user?.id || null;

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Load waitlist row
    const { data: row, error: rowErr } = await admin
      .from("waitlist")
      .select("id,email,name")
      .eq("id", id)
      .maybeSingle();
    if (rowErr || !row) return NextResponse.json({ error: "Row not found" }, { status: 404 });

    const wlEmail = String(row.email).toLowerCase();

    // Upsert into alpha_testers (enabled)
    const { error: upsertErr } = await admin
      .from("alpha_testers")
      .upsert(
        { email: wlEmail, enabled: true, added_by: adminUserId, added_at: new Date().toISOString() },
        { onConflict: "email" }
      );
    if (upsertErr) return NextResponse.json({ error: "Failed to enable tester" }, { status: 500 });

    // Mark decision on waitlist
    const { error: updErr } = await admin
      .from("waitlist")
      .update({
        decision: "approved",
        decision_comment: comment,
        decided_by: adminUserId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (updErr) return NextResponse.json({ error: "Failed to mark decision" }, { status: 500 });

    // Generate magic link
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: wlEmail,
      options: { redirectTo: `${appUrl}/auth/callback?next=/dashboard/hub` },
    });
    if (linkErr) return NextResponse.json({ error: "Failed to create magic link" }, { status: 500 });
    const magicLink = (linkData as any)?.properties?.action_link || null;

    // Send approval email (best-effort)
    try {
      const transporter = await mailer();
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;
      const subject = `You're in — access to BizzDev.ai`;
      const name = row.name ? row.name : wlEmail;
      const textLines = [
        `Hi ${name},`,
        ``,
        `You're approved for the BizzDev.ai alpha.`,
        `Click to sign in: ${magicLink}`,
        ``,
        comment ? `Note from us: ${comment}` : "",
        ``,
        `— Balázs`,
      ].filter(Boolean);
      const text = textLines.join("\n");

      await transporter.sendMail({
        from,
        to: wlEmail,
        subject,
        text,
        html: text.replace(/\n/g, "<br/>"),
      });
    } catch {
      // If email fails, still return magic link so you can copy
    }

    return NextResponse.json({ ok: true, magicLink });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

