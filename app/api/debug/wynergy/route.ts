// app/api/debug/wynergy/route.ts
import { NextResponse } from "next/server";

// If you already have these helpers, reuse them; if not, inline with supabase-js.
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
  );
}

export async function POST() {
  const supabase = sb();

  // 1) Prepare inputs (same structure your OpenAI generator expects)
  const title = "AI1Q x Wynergy Pilot";
  const company = {
    name: "Zynio",
    blurb:
      "Boutique leadership & AI training company combining human skills and technology.",
    markets: ["CEE", "MEA", "UK"],
    coreValue:
      "Ethical AI adoption, human communication, and charisma in leadership.",
    hq: "Budapest",
  };

  const product = {
    name: "AI1Q",
    oneLiner:
      "Modular AI engine for organizational development & leadership profiling.",
    details: [
      "Understands behavioral and decision-making patterns using AI.",
      "Integrates with corporate training and HR workflows.",
      "Provides cohort insights & practical job-aids.",
    ],
    integrations: ["HRIS touchpoints", "Workshop cadences", "Prompt packs"],
  };

  const icp = {
    name: "Wynergy",
    sizeNote: "~120 employees",
    focus: [
      "Solar and battery tech integration",
      "Renewable energy projects",
      "Internal collaboration",
    ],
    needs: [
      "Better internal collaboration",
      "AI-supported workflow optimization",
      "Leadership training for human-AI integration",
    ],
    decisionClimate:
      "CEO open to digital transformation and human-AI integration training.",
  };

  // 2) Create the run (store inputs in meta for traceability)
  const { data: run, error: runErr } = await supabase
    .from("runs")
    .insert({
      title,
      created_by: null, // or your authed user id if you want
      meta: { company, product, icp },
    })
    .select()
    .single();

  if (runErr || !run) {
    return NextResponse.json(
      { error: "Failed to create run", details: runErr?.message },
      { status: 500 }
    );
  }

  // 3) Call your EXISTING OpenAI-powered generate endpoint for this run
  //    If your generate route is at /api/runs/[runId]/generate, we can call it internally.
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const genRes = await fetch(`${baseUrl}/api/runs/${run.id}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!genRes.ok) {
    const err = await genRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: "Generate failed", details: err },
      { status: 500 }
    );
  }

  const { nextUrl, doc } = await genRes.json();
  return NextResponse.json({
    runId: run.id,
    docId: doc?.id,
    nextUrl, // e.g. /runs/:id/docs/:docId
  });
}

