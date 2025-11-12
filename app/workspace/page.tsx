"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function useOrgId() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => { (async () => {
    const { data, error } = await sb.from("memberships").select("org_id").limit(1);
    if (!error) setOrgId(data?.[0]?.org_id ?? null);
  })(); }, []);
  return orgId;
}

function RunBuilder() {
  const orgId = useOrgId();
  const [products, setProducts] = useState<any[]>([]);
  const [icps, setIcps] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [icpId, setIcpId] = useState("");
  const [source, setSource] = useState("");
  const [targets, setTargets] = useState("");

  useEffect(() => { (async () => {
    if (!orgId) return;
    const [{ data: ps }, { data: is }] = await Promise.all([
      sb.from("products").select("id,name").eq("org_id", orgId).order("created_at", { ascending: false }),
      sb.from("icps").select("id,name").eq("org_id", orgId).order("created_at", { ascending: false }),
    ]);
    setProducts(ps || []);
    setIcps(is || []);
  })(); }, [orgId]);

  async function createRun() {
    if (!orgId) return;
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb
      .from("runs")
      .insert({
        org_id: orgId,
        user_id: user?.id ?? null,
        product_id: productId || null,
        icp_id: icpId || null,
        source_geo: source || null,
        target_geos: targets ? targets.split(",").map(s => s.trim()).filter(Boolean) : []
      })
      .select("id")
      .single();
    if (error) { console.error(error.message); return; }
    window.location.href = `/runs/${data!.id}`;
  }

  return (
    <div className="grid md:grid-cols-5 gap-2">
      <select className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none" value={productId} onChange={e=>setProductId(e.target.value)}>
        <option value="">Select product</option>
        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none" value={icpId} onChange={e=>setIcpId(e.target.value)}>
        <option value="">Select ICP</option>
        {icps.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
      <input className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none" placeholder="Source geo" value={source} onChange={e=>setSource(e.target.value)} />
      <input className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none" placeholder="Target geos (comma-separated)" value={targets} onChange={e=>setTargets(e.target.value)} />
      <button onClick={createRun} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[hsl(var(--brand))] text-black disabled:opacity-50" disabled={!orgId}>
        Create Run
      </button>
    </div>
  );
}

export default function Workspace() {
  return (
    <div className="mx-auto max-w-[64rem] px-4 md:px-6 py-8 space-y-6">
      <h1 className="text-3xl md:text-4xl font-semibold">Workspace</h1>
      {/* --- Run Builder block goes here --- */}
      <div className="rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.15)] p-6 bg-[color-mix(in_hsl,hsl(var(--card))_22%,hsl(var(--bg)))] space-y-3">
        <div className="text-lg font-medium">Start a new Run</div>
        <RunBuilder />
      </div>
    </div>
  );
}

