// app/account/page.tsx — FULL REPLACE
import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import SendMagicLinkButton from "@/components/account/SendMagicLinkButton";

export const dynamic = "force-dynamic";

type BadgeProps = { children: React.ReactNode; tone?: "default" | "admin" };
function Badge({ children, tone = "default" }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const toneCls =
    tone === "admin"
      ? "bg-amber-100 text-amber-800 border border-amber-200"
      : "bg-emerald-100 text-emerald-800 border border-emerald-200";
  return <span className={`${base} ${toneCls}`}>{children}</span>;
}

function Card({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-black/10 bg-white/70 dark:bg-white/5 shadow-sm backdrop-blur p-5 space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold opacity-80">{title}</h2>
      </header>
      <div>{children}</div>
      {footer ? <div className="pt-2">{footer}</div> : null}
    </section>
  );
}

export default async function AccountPage() {
  // FIX 1: Next.js 15 requires awaiting cookies()
  const cookieStore = await cookies();

  // Server-side Supabase from cookies (no service-role)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // no-op in RSC
        },
        remove() {
          // no-op in RSC
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card title="Account">
          <p className="text-sm opacity-80">
            You are not signed in.{" "}
            <Link href="/signin" className="underline">
              Go to sign in
            </Link>
            .
          </p>
        </Card>
      </main>
    );
  }

  const email = user.email ?? "unknown@unknown";
  const userId = user.id;

  // Admin badge logic from NEXT_PUBLIC_ALPHA_MASTERS (comma-separated list)
  const adminList =
    process.env.NEXT_PUBLIC_ALPHA_MASTERS?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];
  const isAdmin = adminList.includes(email.toLowerCase());

  // Usage counting (Option A): UTC month window; display reset in Europe/Budapest
  const now = new Date();
  const monthStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const nextMonthStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  const resetDateDisplay = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(nextMonthStartUtc);

  const MONTHLY_LIMIT = 10;
  let runsUsed = 0;
  let runsRemaining = MONTHLY_LIMIT;

  if (userId === "c444634f-c1fb-4792-a7d6-6a2dab9006b1") {
    // Display-only override for your account; does not touch server-side limits
    runsUsed = 0;
    runsRemaining = Number.POSITIVE_INFINITY;
  } else {
    const { count, error: countErr } = await supabase
      .from("runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStartUtc.toISOString())
      .lt("created_at", nextMonthStartUtc.toISOString());

    if (countErr) {
      runsUsed = NaN as any;
    } else {
      runsUsed = count ?? 0;
      runsRemaining = Math.max(MONTHLY_LIMIT - runsUsed, 0);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Profile */}
      <Card
        title="Profile"
        footer={
          <div className="flex items-center gap-3">
            <Link
              href="/signout"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
            >
              Sign out
            </Link>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-medium">{email}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge>Invited tester</Badge>
              {isAdmin ? <Badge tone="admin">Admin</Badge> : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage */}
      <Card title="Usage">
        {userId === "c444634f-c1fb-4792-a7d6-6a2dab9006b1" ? (
          <div className="text-sm opacity-80">
            Runs this month: <span className="font-medium">Unlimited</span>
            <div className="mt-1">Resets on {resetDateDisplay} (Europe/Budapest)</div>
          </div>
        ) : Number.isNaN(runsUsed) ? (
          <div className="text-sm opacity-80">
            Couldn’t fetch usage right now. Please refresh.
          </div>
        ) : (
          <div className="text-sm opacity-80">
            Runs this month:{" "}
            <span className="font-medium">
              {runsUsed} of {MONTHLY_LIMIT}
            </span>
            <div className="mt-1">Remaining: {runsRemaining}</div>
            <div className="mt-1">Resets on {resetDateDisplay} (Europe/Budapest)</div>
          </div>
        )}
      </Card>

      {/* Security */}
      <Card title="Security">
        <div className="space-y-3">
          <div className="text-sm opacity-80">
            Sign-in method: <span className="font-medium">Magic link</span>
          </div>
          <SendMagicLinkButton email={email} />
        </div>
      </Card>
    </main>
  );
}

