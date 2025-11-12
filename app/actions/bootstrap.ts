"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function bootstrapUser({
  fullName,
  orgName,
}: {
  fullName?: string;
  orgName?: string;
}) {
  // Next 15 dynamic API: await before using the cookie store
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[0] extends object ? Omit<Parameters<typeof cookieStore.set>[0], "name" | "value"> : any) {
          // Next cookie API accepts an object; keep it no-op in UAT if mutation isn't needed
          try {
            // @ts-expect-error accommodate differing signatures across Next minor versions
            cookieStore.set({ name, value, ...(options || {}) });
          } catch {
            // no-op on platforms that don't support setting here
          }
        },
        remove(name: string, options?: any) {
          try {
            // @ts-expect-error accommodate differing signatures across Next minor versions
            cookieStore.delete({ name, ...(options || {}) });
          } catch {
            // no-op
          }
        },
      },
      // NOTE: no `headers` here for @supabase/ssr v0.7.x
    }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("bootstrap_profile_and_org", {
    p_user_id: user.id,
    p_full_name: fullName ?? (user.user_metadata as any)?.full_name ?? "",
    p_org_name: orgName ?? "",
  });

  if (error) throw error;
  return data?.[0]; // { org_id, created }
}

