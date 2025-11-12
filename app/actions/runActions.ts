"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRunAction(title = "UI test run") {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();

  if (uerr || !user) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("runs")
    .insert({
      title,
      status: "draft",
      user_id: user.id,   // <- align to your schema
      // org_id: <set later when we wire orgs>; keep nullable for MVP
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/runs");
  return { run: data };
}

export async function getRunByIdAction(id: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("runs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { run: data };
}

