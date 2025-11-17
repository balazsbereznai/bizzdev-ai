'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Product = {
  id: string;
  name: string | null;
  one_liner: string | null;
  description: string | null;
  differentiator: string | null;
  pricing_model: string | null;
  assets: string | null;
  category: string | null;
  region_scope: string | null;
  integrations: string | null;
  created_by: string | null;
};

const CATEGORIES = [
  'AI platform',
  'Software / SaaS',
  'Service package',
  'Training program',
  'Assessment',
  'Consulting offer',
  'Physical product',
  'Subscription',
  'Other',
];

const REGIONS = [
  'Global',
  'CEE',
  'MEA',
  'UK',
  'DACH',
  'Nordics',
  'Benelux',
  'APAC',
  'ANZ',
  'North America',
  'Europe',
  'Hungary',
  'Poland',
  'Czechia',
  'Slovakia',
  'Romania',
  'Other',
];

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export default function ProductsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inModal, setInModal] = useState(false);

  // locals
  const [name, setName] = useState('');
  const [one, setOne] = useState('');
  const [desc, setDesc] = useState('');
  const [diff, setDiff] = useState('');
  const [pricing, setPricing] = useState('');
  const [assets, setAssets] = useState('');
  const [cat, setCat] = useState('');
  const [region, setRegion] = useState('');
  const [integrations, setIntegrations] = useState('');

  const snap = useRef<any>(null);

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

      let row: Product | null = null;
      if (idFromQS) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', idFromQS)
          .eq('created_by', user.id)
          .single();
        if (!error) row = data as Product;
      } else {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('created_by', user.id)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1);
        row = (data?.[0] as Product) ?? null;
      }

      if (row) {
        setProduct(row);
        setName(row.name ?? '');
        setOne(row.one_liner ?? '');
        setDesc(row.description ?? '');
        setDiff(row.differentiator ?? '');
        setPricing(row.pricing_model ?? '');
        setAssets(row.assets ?? '');
        setCat(row.category ?? '');
        setRegion(row.region_scope ?? '');
        setIntegrations(row.integrations ?? '');

        snap.current = {
          name: row.name ?? '',
          one: row.one_liner ?? '',
          desc: row.description ?? '',
          diff: row.differentiator ?? '',
          pricing: row.pricing_model ?? '',
          assets: row.assets ?? '',
          cat: row.category ?? '',
          region: row.region_scope ?? '',
          integrations: row.integrations ?? '',
        };
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for modal header Save&Exit
  useEffect(() => {
    function handleSaveExit() {
      onSave(true);
    }
    window.addEventListener('bd:save-exit', handleSaveExit);
    return () => window.removeEventListener('bd:save-exit', handleSaveExit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, name, one, desc, diff, pricing, assets, cat, region, integrations]);

  async function onSave(fromModal = false) {
    if (!product?.id) return;
    setSaving(true);
    const updates = {
      name,
      one_liner: one,
      description: desc,
      differentiator: diff,
      pricing_model: pricing,
      assets,
      category: cat,
      region_scope: region,
      integrations,
    };
    const { error } = await supabase.from('products').update(updates).eq('id', product.id);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    if (fromModal) {
      window.dispatchEvent(new Event('bd:saved'));
    } else {
      window.location.href = '/products/inventory';
    }
  }

  async function onCancel() {
    if (!product?.id) return;
    if (isNew) {
      const ok = confirm('Discard and delete this new product?');
      if (!ok) return;
      await supabase.from('products').delete().eq('id', product.id);
    }
    window.location.href = '/products/inventory';
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
      <div className={cn('flex items-center justify-between gap-4', inModal && 'hidden')}>
        <h1 className="text-3xl font-semibold">Product {name ? `— ${name}` : '— New'}</h1>
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
            label="Name"
            value={name}
            onChange={setName}
            placeholder="What is the name of your product?"
          />
          <Field
            label="One-liner"
            value={one}
            onChange={setOne}
            placeholder="How would you describe your product in one sentence?"
          />

          <Combo label="Category" value={cat} onChange={setCat} options={CATEGORIES} />
          <Combo label="Region scope" value={region} onChange={setRegion} options={REGIONS} />

          <Area
            label="Description (use case & value)"
            value={desc}
            onChange={setDesc}
            placeholder="How does this product create value for your customer and in which situations is it used?"
          />
          <Area
            label="Differentiator"
            value={diff}
            onChange={setDiff}
            placeholder="What makes your product unique vs. alternatives?"
          />
          <Area
            label="Pricing model"
            value={pricing}
            onChange={setPricing}
            placeholder="How do you usually price this product (for example per unit, per month, per project, per user)?"
          />
          <Area
            label="Assets (links, collaterals)"
            value={assets}
            onChange={setAssets}
            placeholder="Where can we find your decks, links, case studies or other materials?"
          />
          <Area
            label="Integrations / touchpoints"
            value={integrations}
            onChange={setIntegrations}
            placeholder="Where does this product show up in the customer journey (tools, channels, processes, locations)?"
          />
        </div>

        {/* Note hidden in modal */}
        {!inModal && (
          <p className="text-sm text-[--muted-foreground]">
            Use Save &amp; Exit or Cancel (no autosave).
          </p>
        )}
      </div>
    </div>
  );
}

/* UI helpers */

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
        className="input w-full min-h-28"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Combo({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const trimmed = q.trim();
  const showCustom =
    trimmed && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(' ');
  }

  return (
    <div>
      <div className="mb-1 text-sm text-[--muted-foreground]">{label}</div>
      <div className="relative">
        <button
          type="button"
          className="input w-full flex items-center justify-between"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={!value ? 'text-[--muted-foreground]' : ''}>
            {value || `Select or type ${label.toLowerCase()}…`}
          </span>
          <span>▾</span>
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-[color:var(--surface)] shadow">
            <div className="p-2 border-b">
              <input
                className="input w-full"
                placeholder={`Search or type ${label.toLowerCase()}…`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <ul className="max-h-64 overflow-auto py-1">
              {showCustom && (
                <li>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-black/5"
                    onClick={() => {
                      onChange(trimmed);
                      setOpen(false);
                    }}
                  >
                    Use “{trimmed}”
                  </button>
                </li>
              )}
              {filtered.map((opt) => (
                <li key={opt}>
                  <button
                    className={cx(
                      'w-full text-left px-3 py-2 hover:bg-black/5',
                      value === opt && 'bg-[--primary]/10'
                    )}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                  >
                    {opt}
                    {value === opt && <span className="ml-2 text-[--primary]">•</span>}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && !showCustom && (
                <li className="px-3 py-2 text-[--muted-foreground]">No matches</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

