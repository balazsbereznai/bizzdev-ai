// app/dev/generate/page.tsx
import { generatePlaybookAction } from "@/app/actions/generate";
import { createClient } from "@supabase/supabase-js";

// This is a dev-only helper page; do not pre-render it at build time.
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In UAT / production builds this might be missing; fail gracefully
  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey);
}

export default async function Page() {
  // Optional test doc id; leave empty to render without calling Supabase
  const docId = process.env.NEXT_PUBLIC_TEST_DOC_ID ?? "";
  let doc: any = null;

  const supabase = getSupabase();

  if (docId && supabase) {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();

    doc = data ?? null;
  }

  async function onGenerate() {
    "use server";

    if (!docId) {
      throw new Error(
        "Set NEXT_PUBLIC_TEST_DOC_ID in the environment to a real document UUID."
      );
    }

    // Minimal valid input for generatePlaybookAction
    await generatePlaybookAction({
      docId,
      input: {
        company_name: doc?.vars?.company ?? "Acme Corp",
        product_name: doc?.vars?.product ?? "WidgetX",
        industry: doc?.vars?.industry ?? "B2B Software",
        sales_motion: doc?.vars?.sales_motion ?? "Solution",
        tone: doc?.vars?.tone ?? "Pragmatic",
        experience_level: doc?.vars?.experience_level ?? "Experienced",
        output_language: "en",
      } as any,
    });
  }

  const hasSupabaseEnv = Boolean(getSupabase());

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dev: Generate Test</h1>

      {!hasSupabaseEnv && (
        <p className="text-sm text-amber-300">
          Supabase env vars are not configured; this dev page will not load a
          document but you can still trigger generation if the server action is configured.
        </p>
      )}

      <p className="text-sm text-zinc-400">
        Using docId:{" "}
        <code className="text-zinc-200">{docId || "(not set)"}</code>
      </p>

      <form action={onGenerate}>
        <button className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-emerald-200 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30">
          Generate Now
        </button>
      </form>

      <div className="text-sm text-zinc-400">
        <p>
          Doc type:{" "}
          <code className="text-zinc-200">{doc?.type ?? "(unknown)"}</code>
        </p>
        <p>
          Status:{" "}
          <code className="text-zinc-200">
            {doc?.status ?? "(unknown)"}
          </code>{" "}
          — refresh after clicking.
        </p>
      </div>
    </div>
  );
}

