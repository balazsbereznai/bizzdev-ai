import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const ALLOWED = new Set(["playbook", "research", "culture", "proposal", "negotiation"]);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ type: string }> } // Next 15: params is async
) {
  try {
    // --- get dynamic param safely ---
    const { type: raw } = await context.params;
    const type = (raw || "").toLowerCase();
    if (!ALLOWED.has(type)) {
      return NextResponse.json({ error: "unsupported type" }, { status: 400 });
    }

    // --- read query ---
    const url = new URL(req.url);
    const runId = url.searchParams.get("runId");
    if (!runId) return NextResponse.json({ error: "runId missing" }, { status: 400 });

    // --- create Supabase server client WITHIN handler + cookie adapters ---
    const cookieStore = cookies(); // <-- inside the handler
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options?: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options?: any) {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          },
        },
      }
    );

    // --- load run (RLS applies via user cookie) ---
    const { data: run, error: erun } = await sb.from("runs").select("*").eq("id", runId).single();
    if (erun || !run) return NextResponse.json({ error: "run not found" }, { status: 404 });

    // optional joins
    const [{ data: product }, { data: icp }] = await Promise.all([
      run.product_id ? sb.from("products").select("*").eq("id", run.product_id).single() : Promise.resolve({ data: null }),
      run.icp_id ? sb.from("icps").select("*").eq("id", run.icp_id).single() : Promise.resolve({ data: null }),
    ]);

    // ---- placeholder content (we’ll replace with real prompts next) ----
    const titleDate = new Date().toISOString().slice(0, 10);
    const header = (h: string) =>
      `# ${h}\n\n**Product:** ${product?.name ?? "—"}\n**ICP:** ${icp?.name ?? "—"}\n**Geo:** ${run.source_geo ?? "—"} → ${(run.target_geos || []).join(", ")}\n\n`;
    let md = "";
    switch (type) {
      case "playbook":     md = header("Sales Playbook") + "## Positioning\nTBD — generated.\n"; break;
      case "research":     md = header("Client Research & Product Fit") + "## Company snapshot\nTBD — generated.\n"; break;
      case "culture":      md = header("Cultural Tips & Hints") + "## Meeting etiquette\nTBD — generated.\n"; break;
      case "proposal":     md = header("Proposal Skeleton") + "## Executive summary\nTBD — generated.\n"; break;
      case "negotiation":  md = header("Negotiation Preparation") + "## Strategy\nTBD — generated.\n"; break;
    }

    const { data: inserted, error: edoc } = await sb
      .from("documents")
      .insert({
        org_id: run.org_id,
        run_id: run.id,
        doc_type: type,
        title: `${type[0].toUpperCase()}${type.slice(1)} ${titleDate}`,
        content_md: md,
      })
      .select("id")
      .single();

    if (edoc) throw edoc;

    return NextResponse.json({ id: inserted!.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}

