"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function bootstrapUser({ fullName, orgName }: { fullName?: string; orgName?: string }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {}
      },
      headers
    }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .rpc("bootstrap_profile_and_org", {
      p_user_id: user.id,
      p_full_name: fullName ?? user.user_metadata?.full_name ?? "",
      p_org_name: orgName ?? ""
    });

  if (error) throw error;
  return data?.[0]; // { org_id, created }
}

