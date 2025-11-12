import { generateDoc } from "@/app/actions/generate";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (runs in an RSC)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function Page() {
  // Set a real doc id in .env.local before using this page
  const docId = process.env.NEXT_PUBLIC_TEST_DOC_ID ?? "";
  let doc: any = null;

  if (docId) {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();
    doc = data;
  }

  async function onGenerate() {
    "use server";
    if (!docId) throw new Error("Set NEXT_PUBLIC_TEST_DOC_ID in .env.local to a real document UUID.");
    await generateDoc({
      docId,
      type: (doc?.type ?? "Playbook") as any,
      vars: doc?.vars ?? { company: "Acme", product: "WidgetX", geo: "US→CEE", buyer: "CIO" },
    });
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dev: Generate Test</h1>
      <p className="text-sm text-zinc-400">
        Using docId: <code className="text-zinc-200">{docId || "(not set)"}</code>
      </p>

      <form action={onGenerate}>
        <button className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-emerald-200 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30">
          Generate Now
        </button>
      </form>

      <div className="text-sm text-zinc-400">
        <p>Doc type: <code className="text-zinc-200">{doc?.type ?? "(unknown)"}</code></p>
        <p>Status: <code className="text-zinc-200">{doc?.status ?? "(unknown)"}</code> — refresh after clicking.</p>
      </div>
    </div>
  );
}
