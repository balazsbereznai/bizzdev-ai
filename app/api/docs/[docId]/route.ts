import { supabaseServer } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ docId: string }> }
) {
  const { docId } = await ctx.params;

  const supabase = await supabaseServer();
  const { data: doc, error } = await supabase
    .from("docs")
    .select("*")
    .eq("id", docId)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ doc });
}

