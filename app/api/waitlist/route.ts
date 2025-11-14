// app/api/waitlist/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// dynamic import + ts-ignore to avoid adding @types/nodemailer
async function mailer() {
  // @ts-ignore - nodemailer types not present in this env; runtime import is valid
  const { createTransport } = await import("nodemailer");
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
    const email = String(body.email || "").trim().toLowerCase();
    const name = body.name ? String(body.name).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;
    const source = body.source ? String(body.source).trim() : "waitlist-api";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // Already enabled tester?
    const { data: tester } = await supabase
      .from("alpha_testers")
      .select("email, enabled")
      .ilike("email", email)
      .maybeSingle();
    if (tester?.enabled) {
      return NextResponse.json(
        { ok: true, alreadyTester: true },
        { status: 200 }
      );
    }

    // Already on waitlist?
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { ok: true, alreadyExists: true },
        { status: 200 }
      );
    }

    // Insert
    const { error: insertErr } = await supabase.from("waitlist").insert({
      email,
      name,
      notes,
      source,
    });
    if (insertErr) {
      return NextResponse.json(
        { error: "Database error." },
        { status: 500 }
      );
    }

    // Notify admin (best-effort)
    try {
      const transporter = await mailer();
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;
      const to = process.env.ADMIN_NOTIFY_TO || process.env.SMTP_USER!;
      const subject = `New waitlist signup: ${email}`;

      // Derive app base URL from env; fall back to localhost for dev
      const rawAppUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        "http://localhost:3000";
      const appUrl = rawAppUrl.replace(/\/+$/, "");
      const reviewUrl = `${appUrl}/dashboard/admin/waitlist`;

      const lines: string[] = [
        `Email: ${email}`,
        name ? `Name: ${name}` : "",
        source ? `Source: ${source}` : "",
        notes ? `Notes:\n${notes}` : "",
        "",
        `Review: ${reviewUrl}`,
      ].filter(Boolean);

      const text = lines.join("\n");

      const html = [
        `Email: ${email}`,
        name ? `Name: ${name}` : "",
        source ? `Source: ${source}` : "",
        notes ? `Notes:<br/>${notes.replace(/\n/g, "<br/>")}` : "",
        "",
        `Review: <a href="${reviewUrl}">${reviewUrl}</a>`,
      ]
        .filter(Boolean)
        .join("<br/>");

      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    } catch {
      // swallow email errors
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

