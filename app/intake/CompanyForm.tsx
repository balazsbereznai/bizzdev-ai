'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Props = {
  orgId: string | null
  initial: {
    name: string
    industry: string
    region: string
    size: string
  }
}

/** Option catalogs (extend freely) */
const INDUSTRIES = [
  'SaaS','Software & IT Services','AI / ML','Data & Analytics','Cybersecurity',
  'FinTech','InsurTech','HealthTech','EdTech','GovTech',
  'Consulting','Legal Services','Accounting & Audit','Marketing & Advertising','HR / Recruitment',
  'Energy','Renewable Energy','Solar','Battery Storage','Utilities',
  'Manufacturing','Industrial Automation','Automotive','Aerospace','Chemicals',
  'Public Sector','NGO / Nonprofit','Education','Healthcare Providers','Pharmaceuticals','Biotech',
  'Telecom','Media & Entertainment','Retail','E-commerce','Logistics & Supply Chain','Real Estate & Construction',
  'Banking','Asset Management','Private Equity / VC','Insurance',
]

const REGIONS = [
  'Global','Europe','Asia','North America','South America','Africa','Oceania',
  'CEE','DACH','Nordics','Benelux','Southern Europe','Iberia','Balkans','Baltics','MEA','GCC','MENA','APAC','ANZ','UK & Ireland',
  'Hungary','Poland','Czechia','Slovakia','Romania','Austria','Germany','Switzerland',
  'United Kingdom','Ireland','France','Spain','Portugal','Italy','Netherlands','Belgium','Luxembourg',
  'Sweden','Norway','Denmark','Finland','Iceland','Estonia','Latvia','Lithuania',
  'United Arab Emirates','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','Egypt','Turkey',
  'United States','Canada','Brazil','Argentina','Chile','Mexico',
  'India','China','Japan','South Korea','Singapore','Indonesia','Philippines','Malaysia',
]

const SIZE_BANDS = ['1-10','11-50','51-200','201-1000','1000+']

/** Helpers */
function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }
function useTransient(ms = 1500) {
  const [flag, setFlag] = useState(false)
  useEffect(() => { if (!flag) return; const t = setTimeout(() => setFlag(false), ms); return () => clearTimeout(t) }, [flag, ms])
  return { flag, trigger: () => setFlag(true) }
}

/** Minimal searchable combobox (supports custom values) */
function Combo({
  label, value, options, placeholder, onSelect, disabled, saving, saved, error,
}: {
  label: string
  value: string
  options: string[]
  placeholder: string
  onSelect: (v: string) => void
  disabled?: boolean
  saving?: boolean
  saved?: boolean
  error?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const filtered = useMemo(
    () => (q ? options.filter(o => o.toLowerCase().includes(q.toLowerCase())) : options),
    [options, q]
  )
  const showCustom = q.trim() && !options.some(o => o.toLowerCase() === q.trim().toLowerCase())

  function commit(v: string) {
    onSelect(v)
    setOpen(false)
    setQ('')
  }

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-[--muted-foreground]">{label}</span>
        <div className="text-xs">
          {saving && <span className="animate-pulse">Saving…</span>}
          {saved && <span className="text-[--success]">✔︎ Saved</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 0) }}
          className={cn('input w-full text-left flex items-center justify-between', disabled && 'opacity-60')}
          aria-haspopup="listbox" aria-expanded={open}
        >
          <span className={cn(!value && 'text-[--muted-foreground]')}>{value || placeholder}</span>
          <span className="ml-2">▾</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-[color:var(--surface)] shadow-lg">
            <div className="p-2 border-b">
              <input
                ref={inputRef}
                className="input w-full"
                placeholder={`Search ${label.toLowerCase()}…`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <ul className="max-h-64 overflow-auto py-1" role="listbox">
              {showCustom && (
                <li>
                  <button type="button" className="w-full text-left px-3 py-2 hover:bg-black/5" onClick={() => commit(q.trim())}>
                    Use “{q.trim()}” <span className="text-[--muted-foreground]">(custom)</span>
                  </button>
                </li>
              )}

              {filtered.map(opt => (
                <li key={opt}>
                  <button
                    type="button"
                    className={cn('w-full text-left px-3 py-2 hover:bg-black/5', value === opt && 'bg-[--primary]/10')}
                    onClick={() => commit(opt)}
                  >
                    {opt}{value === opt && <span className="ml-2 text-[--primary]">•</span>}
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
  )
}

export default function CompanyForm({ orgId, initial }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [name, setName] = useState(initial.name)
  const [editingName, setEditingName] = useState(false)
  const [industry, setIndustry] = useState(initial.industry)
  const [region, setRegion] = useState(initial.region)
  const [size, setSize] = useState(initial.size)

  const [busy, setBusy] = useState<null | 'name' | 'industry' | 'region' | 'size'>(null)
  const [err, setErr] = useState<string | null>(null)
  const savedName = useTransient()
  const savedIndustry = useTransient()
  const savedRegion = useTransient()
  const savedSize = useTransient()

  const canWrite = Boolean(orgId)

  async function write(patch: Record<string, string>, key: 'name'|'industry'|'region'|'size') {
    if (!canWrite) { setErr('No organization to update.'); return false }
    setBusy(key); setErr(null)
    const { error } = await supabase.from('organizations').update(patch).eq('id', orgId!)
    setBusy(null)
    if (error) { setErr(error.message); return false }
    if (key === 'name') savedName.trigger()
    if (key === 'industry') savedIndustry.trigger()
    if (key === 'region') savedRegion.trigger()
    if (key === 'size') savedSize.trigger()
    return true
  }

  async function saveName() {
    if (name.trim() === (initial.name || '').trim()) { setEditingName(false); return }
    const ok = await write({ name: name.trim() }, 'name')
    if (ok) setEditingName(false)
  }

  return (
    <div className="rounded-2xl border border-[--border] bg-[color:var(--surface)] p-5 space-y-6">
      <div className="text-sm text-[--muted-foreground]">Company</div>

      {/* Name */}
      <div className="flex items-center justify-between gap-3">
        {editingName ? (
          <div className="flex items-center gap-2 w-full">
            <input className="input flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" />
            <button className="btn" type="button" onClick={saveName} disabled={busy === 'name'} aria-busy={busy === 'name'}>
              {busy === 'name' ? 'Saving…' : 'Save'}
            </button>
            <button className="btn-secondary" type="button" onClick={() => { setName(initial.name); setEditingName(false) }}>
              Cancel
            </button>
            {savedName.flag && <span className="text-[--success] text-sm">✔︎ Saved</span>}
          </div>
        ) : (
          <>
            <div className="text-xl font-semibold">{name || '—'}</div>
            <button className="chip" type="button" onClick={() => setEditingName(true)}>Edit</button>
          </>
        )}
      </div>

      {/* Industry (searchable + custom) */}
      <Combo
        label="Industry"
        value={industry}
        options={INDUSTRIES}
        placeholder="Select or type an industry…"
        disabled={!canWrite}
        saving={busy === 'industry'}
        saved={savedIndustry.flag}
        error={err}
        onSelect={async (v) => { setIndustry(v); await write({ industry: v }, 'industry') }}
      />

      {/* Region (searchable + custom) */}
      <Combo
        label="Region"
        value={region}
        options={REGIONS}
        placeholder="Select or type a region/country…"
        disabled={!canWrite}
        saving={busy === 'region'}
        saved={savedRegion.flag}
        error={err}
        onSelect={async (v) => { setRegion(v); await write({ region: v }, 'region') }}
      />

      {/* Size (chips with feedback) */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm text-[--muted-foreground]">Size</span>
          <div className="text-xs">
            {busy === 'size' && <span className="animate-pulse">Saving…</span>}
            {savedSize.flag && <span className="text-[--success]">✔︎ Saved</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZE_BANDS.map(opt => (
            <button
              key={opt}
              type="button"
              disabled={!canWrite || busy === 'size'}
              onClick={async () => { setSize(opt); await write({ size: opt }, 'size') }}
              className={cn(
                'section-chip',
                size === opt && 'bg-[--primary]/10 border-[--primary] text-[--primary]',
                busy === 'size' && 'opacity-60'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="border-t border-dashed pt-4 text-sm text-[--muted-foreground]">
        Search or type your own value and select <strong>Use “…” (custom)</strong>.  
        Each change saves instantly and shows a ✔︎ confirmation.
      </div>
    </div>
  )
}

