"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanBaseTitle(s: string | null): string {
  const base = (s ?? "Run").trim();
  return base.length ? base : "Run";
}

export async function createDocAction(runId: string, title?: string) {
  if (!runId || !UUID.test(runId)) {
    return { error: "Run id must be a UUID. Create a real run first." };
  }

  const supabase = await supabaseServer();

  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) return { error: "Not signed in" };

  // Ensure the run exists (RLS protects, but we want a friendly message)
  const { data: runRow, error: runErr } = await supabase
    .from("runs")
    .select("id,title")
    .eq("id", runId)
    .single();
  if (runErr || !runRow) return { error: "Run not found." };

  // If no title provided, auto-generate: "<Run Title> — Doc <N+1>"
  let finalTitle = (title ?? "").trim();
  if (!finalTitle) {
    const { count } = await supabase
      .from("docs")
      .select("id", { count: "exact", head: true })
      .eq("run_id", runId);

    const base = cleanBaseTitle(runRow.title);
    const n = (count ?? 0) + 1;
    finalTitle = `${base} — Doc ${n}`;
  }

  const { data, error } = await supabase
    .from("docs")
    .insert({
      run_id: runId,
      title: finalTitle,
      markdown: `# ${finalTitle}\n\nStart writing…`,
    })
    .select("id, title, created_at")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/runs/${runId}`);
  return { doc: data };
}

export async function updateDocAction(
  docId: string,
  fields: { title?: string; markdown?: string }
) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();
  if (uerr || !user) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("docs")
    .update({
      ...(fields.title && { title: fields.title }),
      ...(fields.markdown && { markdown: fields.markdown }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { doc: data };
}

