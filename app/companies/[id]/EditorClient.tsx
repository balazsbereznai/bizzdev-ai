'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import CompanyForm from '../CompanyForm'

export default function EditorClient({
  id,
  initialCompany,
}: {
  id: string
  initialCompany: any
}) {
  const supabase = createClient()
  const [company, setCompany] = useState<any>(initialCompany)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('organizations')
      .update(company)
      .eq('id', id)
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    window.location.href = '/companies/inventory'
  }

  function handleCancel() {
    window.location.href = '/companies/inventory'
  }

  return (
    <div className="container-px mx-auto max-w-4xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          Company — {company?.name || 'Untitled'}
        </h1>
        <div className="flex gap-2">
          <button className="btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save & Exit'}
          </button>
          <button className="btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      <CompanyForm company={company} onChange={setCompany} />
    </div>
  )
}

