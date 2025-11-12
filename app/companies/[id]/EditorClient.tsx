// app/companies/[id]/EditorClient.tsx
'use client'

import { useState } from 'react'
import CompanyForm from '../CompanyForm'

export default function EditorClient({
  id,
  initialCompany,
}: {
  id: string
  initialCompany: any
}) {
  const [saving, setSaving] = useState(false)

  function handleCancel() {
    window.location.href = '/companies/inventory'
  }

  async function handleSave() {
    // Submit the inner CompanyForm (it owns the save logic)
    setSaving(true)
    try {
      const form = document.getElementById('company-edit-form') as HTMLFormElement | null
      if (form) {
        // requestSubmit triggers CompanyForm's onSubmit handler
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit()
        } else {
          form.submit()
        }
      }
    } finally {
      // CompanyForm navigates after save; we clear just in case
      setTimeout(() => setSaving(false), 300)
    }
  }

  return (
    <div className="container-px mx-auto max-w-4xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          Company — {initialCompany?.company_name || 'Untitled'}
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

      {/* Use CompanyForm in edit mode; hide its footer actions since we provide our own */}
      <CompanyForm
        mode="edit"
        id={id}
        initial={initialCompany}
        hideFooterActions
        minimal
      />
    </div>
  )
}

