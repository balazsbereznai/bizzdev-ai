'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Company = {
  id: string;
  company_name: string | null;
  industry: string | null;
  region: string | null;
  size: string | null;
};

type Outline = {
  meta: { generatedAt: string; company: string; industry: string; region: string; size: string; version: string; };
  narrative: string[];
  valueProps: string[];
  discovery: string[];
  objections: string[];
  proof: string[];
  outreach: { email: string[]; linkedin: string[]; call: string[]; };
};

export default function PlaybookPage() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; return; }

      const { data, error } = await supabase
        .from('company_profile')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (error) { setError(error.message); setLoading(false); return; }
      if (!data) { setError('No company profile found.'); setLoading(false); return; }

      setCompany(data);

      const res = await fetch('/api/generate-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: data.company_name,
          industry: data.industry,
          region: data.region,
          size: data.size,
        }),
      });
      if (!res.ok) { setError('Failed to generate playbook'); setLoading(false); return; }
      const json = (await res.json()) as Outline;
      setOutline(json);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main style={{ padding: 24 }}>Generating playbook…</main>;
  if (error) return <main style={{ padding: 24, color: 'crimson' }}>Error: {error}</main>;
  if (!outline) return <main style={{ padding: 24 }}>No outline.</main>;

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{outline.meta.company} — Playbook Outline</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()}>Print / Save PDF</button>
          <a href="/profile"><button>Back to Profile</button></a>
        </div>
      </header>

      <section style={{ opacity: 0.8, fontSize: 13, marginBottom: 12 }}>
        <div>Industry: <strong>{outline.meta.industry}</strong></div>
        <div>Region: <strong>{outline.meta.region}</strong></div>
        <div>Size: <strong>{outline.meta.size}</strong></div>
        <div>Generated: {new Date(outline.meta.generatedAt).toLocaleString()}</div>
        <div>Version: {outline.meta.version}</div>
      </section>

      <Grid title="Narrative" items={outline.narrative} />
      <Grid title="Value Props" items={outline.valueProps} />
      <Grid title="Discovery" items={outline.discovery} />
      <Grid title="Top Objections" items={outline.objections} />
      <Grid title="Proof" items={outline.proof} />

      <section style={{ marginTop: 20 }}>
        <h2>Outreach</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <Block title="Email" items={outline.outreach.email} />
          <Block title="LinkedIn" items={outline.outreach.linkedin} />
          <Block title="Call" items={outline.outreach.call} />
        </div>
      </section>
    </main>
  );
}

function Grid({ title, items }: { title: string; items: string[] }) {
  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <ul style={{ display: 'grid', gap: 6, paddingLeft: 18 }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </section>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: 12, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <ul style={{ display: 'grid', gap: 6, paddingLeft: 18 }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
