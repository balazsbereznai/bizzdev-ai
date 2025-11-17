// app/actions/hubActions.ts
"use server";

import { redirect } from "next/navigation";
import { cookies as nextCookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generatePlaybookAction } from "./generate";

/* --------------------------------- utils ---------------------------------- */

function asString(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

/** Coerce DB value into a string[] Zod-friendly array */
function normalizeArray(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (v == null) return [];
  if (typeof v === "string") {
    const split = v
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return split;
  }
  try {
    if (typeof v === "object") {
      return Object.values(v as Record<string, unknown>).map((x) =>
        String(x)
      );
    }
  } catch {}
  return [];
}

/* ----------------------------- Supabase clients ---------------------------- */

function getSrvClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey)
    throw new Error("Missing Supabase env vars (service)");
  return createServiceClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Authenticated server client bound to current request cookies (Next 15).
 */
async function getAuthClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) throw new Error("Missing Supabase env vars (auth)");

  const store = await nextCookies();

  // @supabase/ssr v0.7.x expects cookies object with get/set/remove only
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      // We only need to read cookies in this action; keep setters as no-ops for type compatibility
      set() {},
      remove() {},
    },
  });
}

async function requireUserId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Auth error: ${error.message}`);
  const userId = data.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/* --------------------------- Monthly throttle 10 --------------------------- */

async function enforceMonthlyRunLimit(
  supabase: SupabaseClient,
  limit = 10
): Promise<string> {
  const { data: userData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !userData?.user) throw new Error("UNAUTHENTICATED");

  const user = userData.user;
  const email = (user.email || "").toLowerCase();

  // Master user bypass (always unlimited)
  const masterEnv = process.env.NEXT_PUBLIC_MASTER_USER_EMAILS;
  const masterEmails = (masterEnv && masterEnv.length > 0
    ? masterEnv.split(",")
    : ["balazs.bereznai@yahoo.com"]
  )
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (masterEmails.includes(email)) {
    return user.id;
  }

  // Environment-based throttle disable (e.g. UAT, local)
  const disableThrottle = process.env.NEXT_PUBLIC_DISABLE_THROTTLE === "1";
  if (disableThrottle) {
    return user.id;
  }

  const { data: allowed, error: throttleErr } = await supabase.rpc(
    "can_user_run_monthly",
    { _limit: limit }
  );

  if (throttleErr) {
    console.error("can_user_run_monthly RPC error:", throttleErr);
    throw new Error("RATE_LIMIT_CHECK_FAILED");
  }
  if (!allowed) throw new Error("RATE_LIMIT_REACHED");
  return user.id;
}

async function logSuccessfulRun(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("run_throttle")
    .insert({ user_id: userId });
  if (error) console.warn("run_throttle insert warning:", error);
}

/* ----------------------------- Prompt mappings ---------------------------- */

function mapToneToSchema(tone: string): string | undefined {
  const map: Record<string, string> = {
    trusted_advisor: "Trusted advisor",
    challenger: "Challenger",
    friendly_expert: "Friendly expert",
    formal: "Formal",
  };
  if (tone === "default" || !tone) return undefined;
  return map[tone] ?? undefined;
}

function mapExperienceToSchema(exp: string): "Experienced" | "Unexperienced" {
  return exp === "default" ? "Experienced" : "Unexperienced";
}

/* ------------------------- Main action: create run ------------------------- */

export async function createRunFromHub(formData: FormData) {
  const companyId = asString(formData.get("companyId"));
  const productId = asString(formData.get("productId"));
  const icpId = asString(formData.get("icpId"));

  const tone = asString(formData.get("tone"));
  const experience = asString(formData.get("experience"));
  const salesMotion = asString(formData.get("salesMotion"));
  const motion = salesMotion || asString(formData.get("motion"));

  // NEW: outputLanguage from UI (passed through unchanged)
  const outputLanguage = asString(formData.get("outputLanguage"));

  if (!companyId || !productId || !icpId) {
    throw new Error(
      "Please select a Company, Product and Potential Customer Profile."
    );
  }

  const supabase = await getAuthClient();
  const srv = getSrvClient();

  // must be logged in
  const userId = await requireUserId(supabase);

  // monthly limit (10) – will bypass for master users or when disabled via env
  const throttleUserId = await enforceMonthlyRunLimit(supabase, 10);
  void throttleUserId; // retained for semantics; not needed directly below

  // Fetch selected records (RLS-scoped)
  const [
    { data: company, error: compErr },
    { data: product, error: prodErr },
    { data: icp, error: icpErr },
  ] = await Promise.all([
    supabase
      .from("company_profile")
      .select("*")
      .eq("id", companyId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle(),
    supabase.from("icps").select("*").eq("id", icpId).maybeSingle(),
  ]);

  if (compErr) console.error("Company fetch error:", compErr);
  if (prodErr) console.error("Product fetch error:", prodErr);
  if (icpErr) console.error("ICP fetch error:", icpErr);

  if (!company) throw new Error("Company not found.");
  if (!product) throw new Error("Product not found.");
  if (!icp) throw new Error("ICP not found.");

  const companyName = company.company_name ?? "Company";
  const productName = product.name ?? "Product";
  const icpName = icp.name ?? "ICP";
  const title = `${companyName} ▸ ${productName} ▸ ${icpName}`;

  // Create run row (business logic unchanged)
  const { data: runRow, error: runErr } = await supabase
    .from("runs")
    .insert({
      user_id: userId,
      product_id: productId,
      icp_id: icpId,
      title,
      meta: {
        source: { page: "hub" },
        selections: { companyId, productId, icpId },
        ui: { tone, experience, motion, outputLanguage },
      },
    })
    .select("id")
    .single();

  if (runErr) {
    console.error("Run insert error:", runErr);
    throw new Error("Could not create run");
  }

  const runId = runRow!.id as string;

  // Create doc row tied to run (business logic unchanged)
  const { data: docRow, error: docErr } = await supabase
    .from("docs")
    .insert({
      run_id: runId,
      title,
      content: "",
    })
    .select("id")
    .single();

  if (docErr) {
    console.error("Doc insert error:", docErr);
    await srv.from("runs").delete().eq("id", runId); // cleanup best-effort
    throw new Error("Could not create document");
  }

  const docId = docRow!.id as string;

  // Build flat + nested input for generate.ts
  const baseInput = {
    company_name: companyName,
    product_name: productName,
    icp_name: icpName,

    // Company mapping
    industry: company.industry ?? null,
    hq_region: company.region ?? null,
    company_size: company.size ?? null,

    // Product mapping
    product_summary: product.description ?? product.one_liner ?? null,
    differentiator: product.differentiator ?? null,
    pricing_model: product.pricing_model ?? null,
    assets: product.assets ?? null,
    category: product.category ?? null,
    region_scope: product.region_scope ?? null,
    integrations: product.integrations ?? null,
    value_props: normalizeArray(product.value_props),
    proof_points: normalizeArray(product.proof_points),

    // ICP mapping
    icp_industry: icp.industry ?? null,
    icp_company_size: icp.company_size ?? icp.size ?? null,
    buyer_roles: normalizeArray(icp.buyer_roles),
    pain_points: normalizeArray(icp.pain_points),
    ideal_customer: icp.ideal_customer ?? null,
    use_cases: icp.use_cases ?? null,
    decision_makers: icp.decision_makers ?? null,
    influencers: icp.influencers ?? null,
    triggers: icp.triggers ?? null,
    deal_breakers: icp.deal_breakers ?? null,
    target_regions: icp.target_region ?? null,
    objections: icp.objections ?? null,

    // Style knobs
    tone: mapToneToSchema(tone) ?? (icp.tone as any) ?? undefined,
    experience_level:
      mapExperienceToSchema(experience) ??
      (icp.experience_level as any) ??
      undefined,

    // NEW: Output language (flat)
    output_language: outputLanguage || undefined,

    // Rich objects preserved
    company,
    product,
    icp,

    // UI/meta passthrough
    preferences: {
      tone: mapToneToSchema(tone),
      experience: mapExperienceToSchema(experience),
      motion: motion || undefined,
      output_language: outputLanguage || undefined,
    },
    meta: {
      runId,
      docId,
      startedAt: new Date().toISOString(),
    },
  };

  try {
    await generatePlaybookAction({ docId, input: baseInput } as any);

    await supabase
      .from("runs")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", runId);

    const throttleUserIdAfter = (await supabase.auth.getUser()).data.user!.id;
    await logSuccessfulRun(supabase, throttleUserIdAfter);
  } catch (err: any) {
    console.error("generatePlaybookAction error:", err);

    await supabase
      .from("runs")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", runId);

    if (err?.message === "RATE_LIMIT_REACHED") {
      throw new Error("You’ve reached your 10 playbook runs for this month.");
    }
    if (err?.message === "UNAUTHENTICATED") {
      throw new Error("Please sign in to generate a playbook.");
    }
    if (err?.message === "RATE_LIMIT_CHECK_FAILED") {
      throw new Error("Couldn’t verify your monthly quota. Please try again.");
    }
    throw err;
  }

  // IMPORTANT: explicitly return the redirect for the server action
  return redirect(`/runs/${runId}/docs/${docId}`);
}

