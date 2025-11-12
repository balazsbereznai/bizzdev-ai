'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase-browser'
import BrandButton from '@/components/ui/BrandButton'

type Company = {
  company_name: string
  industry: string
  region: string
  size: string
}

type AfterSave =
  | { type: 'back' }
  | { type: 'href'; href: string }
  | { type: 'push'; href: string; refresh?: boolean }

type BaseProps = {
  minimal?: boolean
  hideFooterActions?: boolean // NEW: hide footer buttons in modals
  afterSave?: AfterSave
}

type Props =
  | ({ mode: 'create'; initial?: Partial<Company> } & BaseProps)
  | ({ mode: 'edit'; id: string; initial: Company } & BaseProps)

export default function CompanyForm(props: Props) {
  const supabase = createClient()
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [values, setValues] = React.useState<Company>({
    company_name: props.mode === 'edit' ? props.initial.company_name : props.initial?.company_name ?? '',
    industry:     props.mode === 'edit' ? props.initial.industry     : props.initial?.industry     ?? '',
    region:       props.mode === 'edit' ? props.initial.region       : props.initial?.region       ?? '',
    size:         props.mode === 'edit' ? props.initial.size         : props.initial?.size         ?? '',
  })

  function onChange<K extends keyof Company>(key: K, val: Company[K]) {
    setValues(v => ({ ...v, [key]: val }))
  }

  function performAfterSave(): boolean {
    const a = props.afterSave
    if (!a) return false

    if (a.type === 'href') {
      window.location.assign(a.href)
      return true
    }
    if (a.type === 'push') {
      window.location.assign(a.href) // ensure modal teardown
      return true
    }
    if (a.type === 'back') {
      window.history.back()
      setTimeout(() => {
        if (window.location.pathname.includes('/dashboard/(..)companies')) {
          window.location.assign('/dashboard/hub')
        }
      }, 75)
      return true
    }
    return false
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      if (props.mode === 'create') {
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        const userId = user?.id
        if (!userId) throw new Error('Not authenticated.')

        const { data, error } = await supabase
          .from('company_profile')
          .insert({
            user_id: userId,
            created_by: userId,
            company_name: values.company_name?.trim() || null,
            industry: values.industry?.trim() || null,
            region: values.region?.trim() || null,   
            size: values.size?.trim() || null,
          })
          .select('id')
          .single()

        if (error) throw error
        if (data?.id) {
          if (!performAfterSave()) {
            window.location.assign(`/companies/${data.id}?new=1`)
          }
        } else {
          setError('Save succeeded but no ID was returned.')
        }
      } else {
        const { error } = await supabase
          .from('company_profile')
          .update({
            company_name: values.company_name?.trim() || null,
            industry: values.industry?.trim() || null,
            region: values.region?.trim() || null,
            size: values.size?.trim() || null,
          })
          .eq('id', (props as any).id)

        if (error) throw error

        if (!performAfterSave()) {
          if (!window.location.pathname.includes('/dashboard')) {
            window.location.assign('/companies/inventory')
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Save failed.')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const formId = 'company-edit-form'

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="card rounded-2xl border-[--color-border] bg-[--color-surface] shadow-[--shadow-0]"
    >
      <div className="card-header bg-[--color-surface] rounded-t-2xl">
        <div className="font-medium text-[--color-primary]">
          {props.mode === 'create' ? 'Create Company' : 'Edit Company'}
        </div>
      </div>

      <div className="card-body space-y-5">
        {error && (
          <div className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {error}
          </div>
        )}

        <div>
          <label className="field-label">Company name</label>
          <input
            className="input rounded-lg"
            value={values.company_name}
            onChange={(e) => onChange('company_name', e.target.value)}
            placeholder="Acme Inc."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Industry</label>
            <input
              className="input rounded-lg"
              value={values.industry}
              onChange={(e) => onChange('industry', e.target.value)}
              placeholder="SaaS"
            />
          </div>
          <div>
            <label className="field-label">Region</label>
            <input
              className="input rounded-lg"
              value={values.region}
              onChange={(e) => onChange('region', e.target.value)}
              placeholder="Hungary"
            />
          </div>
          <div>
            <label className="field-label">Size</label>
            <input
              className="input rounded-lg"
              value={values.size}
              onChange={(e) => onChange('size', e.target.value)}
              placeholder="1–10"
            />
          </div>
        </div>
      </div>

      {/* Footer actions are hidden in modals for cleaner header-only controls */}
      {!props.hideFooterActions && (
        <div className="card-footer flex items-center justify-between bg-[--color-surface] rounded-b-2xl">
          {!props.minimal && (
            <div className="flex gap-2">
              <BrandButton
                href="/companies/inventory"
                outline
                className="btn-back !inline-flex !items-center !py-2 !px-3 !border-[--primary] !text-[--primary] bg-transparent"
              >
                Back to companies
              </BrandButton>
              <BrandButton
                href="/dashboard/hub"
                outline
                className="btn-back !inline-flex !items-center !py-2 !px-3 !border-[--primary] !text-[--primary] bg-transparent"
              >
                Back to Hub
              </BrandButton>
            </div>
          )}

          <BrandButton
            type="submit"
            data-save-exit
            disabled={isSaving}
            className="!py-2 !px-3 !text-[#0b1220]"
          >
            {isSaving ? 'Saving…' : (props.mode === 'create' ? 'Create company' : 'Save changes')}
          </BrandButton>
        </div>
      )}
    </form>
  )
}

