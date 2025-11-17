// app/dev/doc/page.tsx
import DocShell from "@/components/DocShell";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { generatePlaybookAction } from "@/app/actions/generate";
import { createClient } from "@supabase/supabase-js";

// Dev helper page – do not pre-render at build time
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey);
}

export default async function Page() {
  const docId = process.env.NEXT_PUBLIC_TEST_DOC_ID ?? "";

  if (!docId) {
    return (
      <div className="p-6 text-zinc-300">
        Set{" "}
        <code className="text-zinc-100">NEXT_PUBLIC_TEST_DOC_ID</code> in the
        environment to a document UUID.
      </div>
    );
  }

  const supabase = getSupabase();

  if (!supabase) {
    return (
      <div className="p-6 text-zinc-300">
        Supabase environment variables are not configured, so this dev page
        cannot load the document <code className="text-zinc-100">{docId}</code>.
      </div>
    );
  }

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .single();

  if (error || !doc) {
    return (
      <div className="p-6 text-zinc-300">
        Could not load document{" "}
        <code className="text-zinc-100">{docId}</code>.
      </div>
    );
  }

  async function onGenerate() {
    "use server";

    const vars = (doc as any).vars ?? {};

    await generatePlaybookAction({
      docId,
      input: {
        company_name: vars.company ?? "Acme Corp",
        product_name: vars.product ?? "WidgetX",
        industry: vars.industry ?? "B2B Software",
        sales_motion: vars.sales_motion ?? "Solution",
        tone: vars.tone ?? "Pragmatic",
        experience_level: vars.experience_level ?? "Experienced",
        output_language: "en",
      } as any,
    });
  }

  return (
    <div className="p-6">
      <DocShell
        title={doc.title ?? "Untitled"}
        subtitle={`${doc.type ?? "Doc"} • ${doc.status ?? "draft"}`}
        right={
          <form action={onGenerate}>
            <button className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-emerald-200 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30">
              Regenerate
            </button>
          </form>
        }
      >
        {doc.markdown ? (
          <MarkdownRenderer md={doc.markdown} />
        ) : (
          <div className="text-zinc-400">
            No content yet. Click Regenerate to create it.
          </div>
        )}
      </DocShell>
    </div>
  );
}

