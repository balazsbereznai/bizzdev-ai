// app/api/icps/new/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // no cookie writes here
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Disambiguate overload: send both args
  const { data: orgId, error: orgErr } = await supabase.rpc("ensure_org_for_user", {
    uid: user.id,
    org_name: null,
  });

  if (orgErr || !orgId) {
    return NextResponse.json(
      { error: orgErr?.message || "org resolution failed" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("icps")
    .insert({
      org_id: orgId as string,
      created_by: user.id,
      // keep DB NOT NULL happy but visually blank
      name: "",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return NextResponse.json(
      { error: error?.message || "create failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}

