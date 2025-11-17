// app/account/page.tsx — FULL REPLACE (client-side account page, fixed sign-out prefetch)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import SendMagicLinkButton from "@/components/account/SendMagicLinkButton";

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

// One browser Supabase client for this page
const supabase = createClient();

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [runsUsed, setRunsUsed] = useState<number | null>(null);
  const [runsRemaining, setRunsRemaining] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        if (!cancelled) {
          // Mirror server guard: if no user, go to signin
          window.location.assign("/signin?next=/account&dbg=no-user-account");
        }
        return;
      }

      const u = data.user;

      // Usage calc — same logic as before but client-side
      const now = new Date();
      const monthStartUtc = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
      );
      const nextMonthStartUtc = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)
      );
      const MONTHLY_LIMIT = 10;

      let used = 0;
      let remaining = MONTHLY_LIMIT;

      if (u.id === "c444634f-c1fb-4792-a7d6-6a2dab9006b1") {
        // Your account: display-only unlimited
        used = 0;
        remaining = Number.POSITIVE_INFINITY;
      } else {
        const { count, error: countErr } = await supabase
          .from("runs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", u.id)
          .gte("created_at", monthStartUtc.toISOString())
          .lt("created_at", nextMonthStartUtc.toISOString());

        if (countErr) {
          if (!cancelled) {
            setLoadError("Couldn’t fetch usage right now. Please refresh.");
          }
        } else {
          used = count ?? 0;
          remaining = Math.max(MONTHLY_LIMIT - used, 0);
        }
      }

      if (!cancelled) {
        setUser(u);
        setRunsUsed(used);
        setRunsRemaining(remaining);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // While loading, show a simple shell
  if (loading && !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card title="Account">
          <p className="text-sm opacity-80">Loading your account…</p>
        </Card>
      </main>
    );
  }

  if (!user) {
    // In practice we redirect above, but keep a fallback
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

  const now = new Date();
  const nextMonthStartUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)
  );
  const resetDateDisplay = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(nextMonthStartUtc);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Profile */}
      <Card
        title="Profile"
        footer={
          <div className="flex items-center gap-3">
            <Link
              href="/signout"
              prefetch={false}
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
            <div className="mt-1">
              Resets on {resetDateDisplay} (Europe/Budapest)
            </div>
          </div>
        ) : loadError ? (
          <div className="text-sm opacity-80">{loadError}</div>
        ) : runsUsed == null || runsRemaining == null ? (
          <div className="text-sm opacity-80">Loading usage…</div>
        ) : (
          <div className="text-sm opacity-80">
            Runs this month:{" "}
            <span className="font-medium">
              {runsUsed} of {10}
            </span>
            <div className="mt-1">Remaining: {runsRemaining}</div>
            <div className="mt-1">
              Resets on {resetDateDisplay} (Europe/Budapest)
            </div>
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


