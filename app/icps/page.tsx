'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type ICP = {
  id: string
  name: string | null
  ideal_customer: string | null
  buyer_roles: string[] | null
  pain_points: string[] | null
  use_cases: string | null
  decision_makers: string | null
  influencers: string | null
  triggers: string | null
  deal_breakers: string | null
  target_region: string | null
  objections: string | null
  company_size: string | null
  created_by: string | null
}

export default function ICPsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [icp, setIcp] = useState<ICP | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inModal, setInModal] = useState(false)

  const [name, setName] = useState('')
  const [ideal, setIdeal] = useState('')
  const [buyerRoles, setBuyerRoles] = useState('')
  const [pain, setPain] = useState('')
  const [usec, setUsec] = useState('')
  const [dm, setDm] = useState('')
  const [influ, setInflu] = useState('')
  const [trig, setTrig] = useState('')
  const [db, setDb] = useState('')
  const [region, setRegion] = useState('')
  const [obj, setObj] = useState('')
  const [size, setSize] = useState('')

  useEffect(() => { setInModal(window.location.pathname.startsWith('/dashboard/')) }, [])

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/signin'; return }

      const params = new URLSearchParams(window.location.search)
      const idFromQS = params.get('edit')
      const newFlag = params.get('new') === '1'
      setIsNew(newFlag)

      let row: ICP | null = null
      if (idFromQS) {
        const { data, error } = await supabase.from('icps').select('*')
          .eq('id', idFromQS).eq('created_by', user.id).single()
        if (!error) row = data as ICP
      } else {
        const { data } = await supabase.from('icps').select('*')
          .eq('created_by', user.id)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
        row = (data?.[0] as ICP) ?? null
      }

      if (row) {
        setIcp(row)
        setName(row.name ?? '')
        setIdeal(row.ideal_customer ?? '')
        setBuyerRoles(row.buyer_roles?.join(', ') ?? '')
        setPain(row.pain_points?.join(', ') ?? '')
        setUsec(row.use_cases ?? '')
        setDm(row.decision_makers ?? '')   
        setInflu(row.influencers ?? '')
        setTrig(row.triggers ?? '')
        setDb(row.deal_breakers ?? '')
        setRegion(row.target_region ?? '')
        setObj(row.objections ?? '')
        setSize(row.company_size ?? '')
      }
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleSaveExit() { onSave(true) }
    window.addEventListener('bd:save-exit', handleSaveExit)
    return () => window.removeEventListener('bd:save-exit', handleSaveExit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icp, name, ideal, buyerRoles, pain, usec, dm, influ, trig, db, region, obj, size])

  const toArray = (v: string) => {  
    if (!v) return null
    return v.split(',').map(s => s.trim()).filter(Boolean)
  }

  async function onSave(fromModal = false) {
    if (!icp?.id) return
    setSaving(true)
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
    }
    const { error } = await supabase.from('icps').update(updates).eq('id', icp.id)
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    if (fromModal) {
      window.dispatchEvent(new Event('bd:saved'))
    } else {
      window.location.href = '/icps/inventory'
    }
  }

  async function onCancel() {
    if (!icp?.id) return
    if (isNew) {
      const ok = confirm('Discard and delete this new ICP?')
      if (!ok) return
      await supabase.from('icps').delete().eq('id', icp.id)
    }
    window.location.href = '/icps/inventory'
  }

  if (loading) return <div className="container-px mx-auto max-w-4xl py-8">Loading…</div>

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
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <div className="rounded-2xl border border-[--border] bg-[color:var(--surface)] p-5 space-y-6">
        <div className="grid gap-4">
          <Field label="ICP name" value={name} onChange={setName} placeholder="Wynergy" />
          <Area label="Ideal customer (short)" value={ideal} onChange={setIdeal} placeholder="Fast-growing renewable energy firm (~120), scaling ops" />
          <Field label="Buyer roles (comma separated)" value={buyerRoles} onChange={setBuyerRoles} placeholder="CEO, HR/L&D lead, COO" />
          <Area label="Pain points (comma separated)" value={pain} onChange={setPain} placeholder="Internal collaboration, workflow delays, handoffs" />
          <Area label="Use cases" value={usec} onChange={setUsec} placeholder="AI-aided collaboration, leadership profiling, digital rollout" />
          <Field label="Decision makers" value={dm} onChange={setDm} placeholder="CEO, COO, HR/L&D" />
          <Field label="Influencers" value={influ} onChange={setInflu} placeholder="Middle managers, technical champions" />
          <Field label="Triggers" value={trig} onChange={setTrig} placeholder="Growth phase, new funding, digital OKR" />
          <Field label="Deal breakers" value={db} onChange={setDb} placeholder="Complex rollout, unclear ROI" />
          <Field label="Target region" value={region} onChange={setRegion} placeholder="Hungary / CEE" />
          <Area label="Common objections" value={obj} onChange={setObj} placeholder="‘Too complex’, ‘Won’t be used’, ‘Not proven yet’" />
          <Field label="Company size" value={size} onChange={setSize} placeholder="~120" />
        </div>
        {/* note hidden in modal */}
        {!inModal && <p className="text-sm text-[--muted-foreground]">Use Save & Exit or Cancel (no autosave).</p>}
      </div>
    </div>
  )
}

/* UI */
function Field(p:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return (
    <div>
      <div className="mb-1 text-sm text-[--muted-foreground]">{p.label}</div>
      <input className="input w-full" value={p.value} onChange={(e)=>p.onChange(e.target.value)} placeholder={p.placeholder}/>
    </div>
  )
}
function Area(p:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return (
    <div>
      <div className="mb-1 text-sm text-[--muted-foreground]">{p.label}</div>
      <textarea className="input w-full min-h-24" value={p.value} onChange={(e)=>p.onChange(e.target.value)} placeholder={p.placeholder}/>
    </div>
  )
}

