import { supabaseServer } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ docId: string }> }
) {
  const { docId } = await ctx.params;
  const supabase = await supabaseServer();

  const { data: doc, error } = await supabase
    .from("docs")
    .select("id, title, markdown")
    .eq("id", docId)
    .single();

  if (error || !doc) {
    return Response.json({ error: "Doc not found" }, { status: 404 });
  }

  // --- Stub regeneration: light rewrite without external APIs ---
  const now = new Date().toLocaleString();
  const title = (doc.title ?? "Document").trim();
  const body = (doc.markdown ?? "").trim();

  // Basic cleanup + prepend a generated notice (you can replace this with OpenAI later)
  const regenerated =
    `# ${title}\n\n` +
    `> _Regenerated draft — ${now}_\n\n` +
    body.replace(/\n{3,}/g, "\n\n");

  const { data: updated, error: uerr } = await supabase
    .from("docs")
    .update({
      markdown: regenerated,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId)
    .select()
    .single();

  if (uerr) return Response.json({ error: uerr.message }, { status: 400 });
  return Response.json({ doc: updated });
}

