"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Client Supabase (public anon)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type WizardState = {
  companyName: string;
  productName: string;
  icp: { industry?: string; size?: string; buyer_roles?: string[]; pains?: string[] };
  geo: { source_geo?: string; target_geos: string[] };
  preferences: { first_tool: "playbook" | "simulator" };
};

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [w, setW] = useState<WizardState>({
    companyName: "",
    productName: "",
    icp: { buyer_roles: [], pains: [] },
    geo: { target_geos: [] },
    preferences: { first_tool: "playbook" }
  });

  // Bootstrap via RPC directly from the client
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data, error } = await supabase.rpc("bootstrap_profile_and_org", {
          p_user_id: user.id,
          p_full_name: (user.user_metadata as any)?.full_name ?? "",
          p_org_name: ""
        });
        if (error) { console.error(error); return; }

        // function returns a row (org_id, created)
        const row = Array.isArray(data) ? data[0] : data;
        setOrgId(row?.org_id ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function saveAndFinish() {
    if (!orgId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (w.companyName.trim()) {
      await supabase.from("organizations").update({ name: w.companyName.trim() }).eq("id", orgId);
    }

    const { error } = await supabase.from("sales_profiles").insert({
      user_id: user.id,
      org_id: orgId,
      name: "Default",
      icp: {
        industry: w.icp.industry,
        size: w.icp.size,
        buyer_roles: w.icp.buyer_roles,
        pain_points: w.icp.pains
      },
      geo: w.geo,
      product: { name: w.productName, value_props: [], proof_points: [] },
      preferences: w.preferences
    });
    if (error) { console.error(error.message); return; }

    router.push("/workspace");
  }

  if (loading) return <div className="p-8">Loading…</div>;

return (
  <div className="mx-auto max-w-[48rem] px-4 md:px-6 py-8">
    <h1 className="text-3xl md:text-4xl font-semibold mb-6">Let’s set you up</h1>
 
      {step === 1 && (
        <StepCard title="Company">
          <TextInput label="Company name" value={w.companyName} onChange={(v)=>setW({...w, companyName:v})}/>
          <Primary onClick={()=>setStep(2)} disabled={!w.companyName.trim()}>Continue</Primary>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="Product">
          <TextInput label="Product / Offering name" value={w.productName} onChange={(v)=>setW({...w, productName:v})}/>
          <Nav prev={()=>setStep(1)} next={()=>setStep(3)} disabledNext={!w.productName.trim()}/>
        </StepCard>
      )}

      {step === 3 && (
        <StepCard title="ICP basics">
          <TextInput label="Industry" value={w.icp.industry ?? ""} onChange={(v)=>setW({...w, icp:{...w.icp, industry:v}})}/>
          <TextInput label="Company size (e.g. 100–500)" value={w.icp.size ?? ""} onChange={(v)=>setW({...w, icp:{...w.icp, size:v}})}/>
          <ChipInput label="Buyer roles" values={w.icp.buyer_roles ?? []} onChange={(vals)=>setW({...w, icp:{...w.icp, buyer_roles:vals}})}/>
          <ChipInput label="Top pains" values={w.icp.pains ?? []} onChange={(vals)=>setW({...w, icp:{...w.icp, pains:vals}})}/>
          <Nav prev={()=>setStep(2)} next={()=>setStep(4)}/>
        </StepCard>
      )}

      {step === 4 && (
        <StepCard title="Geographies">
          <TextInput label="Your location" value={w.geo.source_geo ?? ""} onChange={(v)=>setW({...w, geo:{...w.geo, source_geo:v}})}/>
          <ChipInput label="Target regions/countries" values={w.geo.target_geos} onChange={(vals)=>setW({...w, geo:{...w.geo, target_geos:vals}})}/>
          <Nav prev={()=>setStep(3)} next={()=>setStep(5)}/>
        </StepCard>
      )}

      {step === 5 && (
        <StepCard title="What do you want first?">
          <Radio
            options={[{label:'Sales Playbook', value:'playbook'},{label:'Negotiation Simulator', value:'simulator'}]}
            value={w.preferences.first_tool}
            onChange={(v)=>setW({...w, preferences:{first_tool:v as 'playbook'|'simulator'}})}
          />
          <div className="flex gap-2">
            <Secondary onClick={()=>setStep(4)}>Back</Secondary>
            <Primary onClick={saveAndFinish}>Finish</Primary>
          </div>
        </StepCard>
      )}
    </div>
  );
}

/* UI helpers */
function StepCard({title, children}:{title:string;children:React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.15)] p-6 bg-[color-mix(in_hsl,hsl(var(--card))_22%,hsl(var(--bg)))]">
      <h2 className="text-xl md:text-2xl font-medium mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TextInput({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-[hsl(var(--text2))]">{label}</div>
      <input
        value={value}
        onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
      />
    </label>
  );
}

function ChipInput({label,values,onChange}:{label:string;values:string[];onChange:(v:string[])=>void}) {
  const [inp,setInp]=useState("");
  return (
    <div>
      <div className="text-sm mb-1 text-[hsl(var(--text2))]">{label}</div>
      <div className="flex gap-2 flex-wrap mb-2">
        {values.map((v,i)=>(
          <span key={i} className="px-2 py-1 rounded-full border border-white/15 text-sm">{v}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={inp}
          onChange={(e)=>setInp(e.target.value)}
          className="flex-1 w-full px-3 py-2 rounded-xl bg-black/20 border border-white/15 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          placeholder="Type and add"
        />
        <button
          onClick={()=>{ if(!inp.trim()) return; onChange([...values, inp.trim()]); setInp(""); }}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/25 hover:border-white/50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function Radio({options,value,onChange}:{options:{label:string,value:string}[];value:string;onChange:(v:string)=>void}) {
  return (
    <div className="flex gap-3">
      {options.map(o=>(
        <button
          key={o.value}
          onClick={()=>onChange(o.value)}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-xl ${
            value===o.value
              ? "border border-[hsl(var(--brand))] text-[hsl(var(--brand))]"
              : "border border-white/25 hover:border-white/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Primary(props:any){
  return <button {...props} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[hsl(var(--brand))] text-black disabled:opacity-50" />;
}
function Secondary(props:any){
  return <button {...props} className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/25 hover:border-white/50" />;
}
function Nav({prev,next,disabledNext}:{prev:()=>void;next:()=>void;disabledNext?:boolean}) {
  return (
    <div className="flex gap-2">
      <Secondary onClick={prev}>Back</Secondary>
      <Primary onClick={next} disabled={disabledNext}>Next</Primary>
    </div>
  );
}
