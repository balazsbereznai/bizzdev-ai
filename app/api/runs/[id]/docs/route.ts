import { supabaseServer } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: runId } = await ctx.params;
  const supabase = await supabaseServer();

  const body = await req.json().catch(() => ({}));
  const title: string =
    (typeof body?.title === "string" && body.title.trim()) || "Untitled";

  // Minimal insert; RLS should allow inserting your own doc for your run
  const { data, error } = await supabase
    .from("docs")
    .insert({
      run_id: runId,
      title,
      markdown: "# New Document\n\nStart writing…",
    })
    .select("id, title")
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message ?? "Insert failed" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ doc: data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

