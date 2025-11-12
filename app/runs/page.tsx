// app/runs/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import RunsListSkin from "@/components/skins/RunsListSkin";
import Link from "next/link";
import RunsPageClient from "@/components/runs/RunsPageClient";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Read-only cookie adapter for RSC: no-ops for set/remove to avoid Next error
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => {}, // no-op
        remove: () => {}, // no-op
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: runs, error } = await supabase
    .from("runs")
    .select(
      `
      id,
      name,
      created_at,
      meta,
      docs:docs (
        id,
        title,
        created_at,
        meta
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="container-px mx-auto max-w-[1280px] py-8">
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-[1280px] py-8">
      {/* Header + transparent body wrapper */}
      <RunsListSkin>
        {/* Client-only interactivity lives below */}
        <RunsPageClient runs={runs ?? []} />
      </RunsListSkin>
    </div>
  );
}

