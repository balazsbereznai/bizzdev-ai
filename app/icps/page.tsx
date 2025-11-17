'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type ICP = {
  id: string;
  name: string | null;
  ideal_customer: string | null;
  buyer_roles: string[] | null;
  pain_points: string[] | null;
  use_cases: string | null;
  decision_makers: string | null;
  influencers: string | null;
  triggers: string | null;
  deal_breakers: string | null;
  target_region: string | null;
  objections: string | null;
  company_size: string | null;
  created_by: string | null;
};

export default function ICPsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [icp, setIcp] = useState<ICP | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inModal, setInModal] = useState(false);

  const [name, setName] = useState('');
  const [ideal, setIdeal] = useState('');
  const [buyerRoles, setBuyerRoles] = useState('');
  const [pain, setPain] = useState('');
  const [usec, setUsec] = useState('');
  const [dm, setDm] = useState('');
  const [influ, setInflu] = useState('');
  const [trig, setTrig] = useState('');
  const [db, setDb] = useState('');
  const [region, setRegion] = useState('');
  const [obj, setObj] = useState('');
  const [size, setSize] = useState('');

  useEffect(() => {
    setInModal(window.location.pathname.startsWith('/dashboard/'));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const idFromQS = params.get('edit');
      const newFlag = params.get('new') === '1';
      setIsNew(newFlag);

      let row: ICP | null = null;
      if (idFromQS) {
        const { data, error } = await supabase
          .from('icps')
          .select('*')
          .eq('id', idFromQS)
          .eq('created_by', user.id)
          .single();
        if (!error) row = data as ICP;
      } else {
        const { data } = await supabase
          .from('icps')
          .select('*')
          .eq('created_by', user.id)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1);
        row = (data?.[0] as ICP) ?? null;
      }

      if (row) {
        setIcp(row);
        setName(row.name ?? '');
        setIdeal(row.ideal_customer ?? '');
        setBuyerRoles(row.buyer_roles?.join(', ') ?? '');
        setPain(row.pain_points?.join(', ') ?? '');
        setUsec(row.use_cases ?? '');
        setDm(row.decision_makers ?? '');
        setInflu(row.influencers ?? '');
        setTrig(row.triggers ?? '');
        setDb(row.deal_breakers ?? '');
        setRegion(row.target_region ?? '');
        setObj(row.objections ?? '');
        setSize(row.company_size ?? '');
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleSaveExit() {
      onSave(true);
    }
    window.addEventListener('bd:save-exit', handleSaveExit);
    return () => window.removeEventListener('bd:save-exit', handleSaveExit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icp, name, ideal, buyerRoles, pain, usec, dm, influ, trig, db, region, obj, size]);

  const toArray = (v: string) => {
    if (!v) return null;
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  async function onSave(fromModal = false) {
    if (!icp?.id) return;
    setSaving(true);
    const updates = {
      name: name || null,
      ideal_customer: ideal || null,
      buyer_roles: toArray(buyerRoles),
      pain_points: toArray(pain),
      use_cases: usec || null,
      decision_makers: dm || null,
      influencers: influ || null,
      triggers: trig || null,
      deal_breakers: db || null,
      target_region: region || null,
      objections: obj || null,
      company_size: size || null,
    };
    const { error } = await supabase.from('icps').update(updates).eq('id', icp.id);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    if (fromModal) {
      window.dispatchEvent(new Event('bd:saved'));
    } else {
      window.location.href = '/icps/inventory';
    }
  }

  async function onCancel() {
    if (!icp?.id) return;
    if (isNew) {
      const ok = confirm('Discard and delete this new ICP?');
      if (!ok) return;
      await supabase.from('icps').delete().eq('id', icp.id);
    }
    window.location.href = '/icps/inventory';
  }

  if (loading) {
    return (
      <div className="container-px mx-auto max-w-4xl py-8">
        Loading…
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-4xl py-8 space-y-8">
      <div className={`flex items-center justify-between gap-4 ${inModal ? 'hidden' : ''}`}>
        <h1 className="text-3xl font-semibold">
          Ideal Customer Profile {name ? `— ${name}` : '— New'}
        </h1>
        <div className="flex items-center gap-2">
          <button className="btn" disabled={saving} onClick={() => onSave(false)}>
            {saving ? 'Saving…' : 'Save & Exit'}
          </button>
          <button className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[--border] bg-[color:var(--surface)] p-5 space-y-6">
        <p className="text-sm text-[--muted-foreground]">
          All fields are optional, but the more context you add here, the more tailored your
          playbook will be.
        </p>

        <div className="grid gap-4">
          <Field
            label="ICP name"
            value={name}
            onChange={setName}
            placeholder="What name do you want to give this ideal customer profile?"
          />

          <Area
            label="Ideal customer"
            value={ideal}
            onChange={setIdeal}
            placeholder="In one or two sentences, describe your ideal customer (industry, size, situation)."
          />

          <Field
            label="Buyer roles (people you usually speak with)"
            value={buyerRoles}
            onChange={setBuyerRoles}
            placeholder="For example: HR Director, Operations Manager, IT lead"
          />

          <Area
            label="Pain points"
            value={pain}
            onChange={setPain}
            placeholder="What problems or frustrations make this customer look for a solution? You can list several, separated by commas."
          />

          <Area
            label="Use cases"
            value={usec}
            onChange={setUsec}
            placeholder="How would this customer use your product or service in their daily work?"
          />

          <Field
            label="Decision makers (who signs off)"
            value={dm}
            onChange={setDm}
            placeholder="For example: CEO, CFO, Country Manager"
          />

          <Field
            label="Influencers (who shapes the decision)"
            value={influ}
            onChange={setInflu}
            placeholder="For example: team leads, specialists, trusted internal champions"
          />

          <Field
            label="Buying triggers"
            value={trig}
            onChange={setTrig}
            placeholder="Events that make them act now: new funding, expansion, regulation change, major incident…"
          />

          <Field
            label="Deal breakers"
            value={db}
            onChange={setDb}
            placeholder="What would make them say no immediately? For example: long contracts, on-prem only, high upfront fees."
          />

          <Field
            label="Target region"
            value={region}
            onChange={setRegion}
            placeholder="For example: Germany, Central Europe, Gulf countries"
          />

          <Area
            label="Common objections"
            value={obj}
            onChange={setObj}
            placeholder="What do they usually push back on? For example: ‘Too expensive’, ‘Too complex’, ‘We tried this before’."
          />

          <Field
            label="Company size (employees)"
            value={size}
            onChange={setSize}
            placeholder="Rough number of employees. For example: 50–200, ~500, enterprise."
          />
        </div>

        {/* note hidden in modal */}
        {!inModal && (
          <p className="text-sm text-[--muted-foreground]">
            Use Save &amp; Exit or Cancel (no autosave).
          </p>
        )}
      </div>
    </div>
  );
}

/* UI */

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { label, value, onChange, placeholder } = props;
  return (
    <div>
      <div className="mb-1 text-sm text-[--muted-foreground]">{label}</div>
      <input
        className="input w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Area(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { label, value, onChange, placeholder } = props;
  return (
    <div>
      <div className="mb-1 text-sm text-[--muted-foreground]">{label}</div>
      <textarea
        className="input w-full min-h-24"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

