'use client'

import { useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import BrandButton from '@/components/ui/BrandButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CompaniesInventoryClient({
  data,
  error,
}: {
  data: any[] | null
  error: string | null
}) {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleDelete(id: string) {
    const ok = confirm('Delete this company?')
    if (!ok) return
    startTransition(async () => {
      const { error } = await supabase.from('company_profile').delete().eq('id', id)
      if (error) {
        alert(`Delete failed: ${error.message}`)
        console.error(error)
      } else {
        window.location.reload()
      }
    })
  }

  function openModal(id: string) {
    // Client-side nav so @modal intercepts (..)[id]
    router.push(`/companies/${id}`)
  }

  return (
    <div className="card overflow-hidden">
      <table className="table">
        <thead>
          <tr>
            <th className="w-[28%]">Name</th>
            <th>Industry</th>
            <th>Region</th>
            <th>Size</th>
            <th className="w-[200px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td className="px-3 py-2 text-red-500" colSpan={5}>Error: {error}</td>
            </tr>
          ) : data?.length ? (
            data.map((org) => (
              <tr key={org.id}>
                <td className="px-3 py-2">
                  {/* Link also uses client nav so interception works */}
                  <Link href={`/companies/${org.id}`} className="link font-medium">
                    {org.company_name || 'Untitled'}
                  </Link>
                </td>
                <td className="px-3 py-2">{org.industry}</td>
                <td className="px-3 py-2">{org.region}</td>
                <td className="px-3 py-2">{org.size}</td>
                <td className="px-3 py-2">
                  <div className="table-actions">
                    <BrandButton
                      onClick={() => openModal(org.id)}
                      className="!py-1.5 !px-2.5 !text-[#0b1220]"
                    >
                      Open
                    </BrandButton>
                    <BrandButton
                      onClick={() => handleDelete(org.id)}
                      disabled={isPending}
                      hex="#E11D48"
                      borderHex="#BE123C"
                      className="!py-1.5 !px-2.5"
                    >
                      {isPending ? '…' : 'Delete'}
                    </BrandButton>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-6 text-[--muted-foreground] text-sm" colSpan={5}>
                No companies yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

