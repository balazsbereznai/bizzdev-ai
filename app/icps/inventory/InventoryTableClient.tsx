'use client'

import { useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import BrandButton from '@/components/ui/BrandButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function InventoryTableClient({ data, error }: { data: any[] | null; error: string | null }) {
  const supabase = createClient()
  const [isPending, start] = useTransition()
  const router = useRouter()

  async function handleDelete(id: string) {
    const ok = confirm('Delete this ICP?')
    if (!ok) return
    start(async () => {
      await supabase.from('icps').delete().eq('id', id)
      window.location.reload()
    })
  }

  function openModal(id: string) {
    router.push(`/icps/${id}`)
  }

  return (
    <div className="card overflow-hidden">
      <table className="table">
        <thead>
          <tr>
            <th className="w-[28%]">Name</th>
            <th>Target region</th>
            <th>Company size</th>
            <th className="w-[200px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr><td className="px-3 py-2 text-red-600" colSpan={4}>Error: {error}</td></tr>
          ) : data?.length ? (
            data.map(r => (
              <tr key={r.id}>
                <td className="px-3 py-2">
                  <Link className="link font-medium" href={`/icps/${r.id}`}>
                    {r.name || 'Untitled ICP'}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.target_region}</td>
                <td className="px-3 py-2">{r.company_size}</td>
                <td className="px-3 py-2">
                  <div className="table-actions">
                    <BrandButton onClick={() => openModal(r.id)} className="!py-1.5 !px-2.5 !text-[--color-cream]">Open</BrandButton>
                    <BrandButton
                      onClick={() => handleDelete(r.id)}
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
            <tr><td className="px-3 py-6 text-[--muted-foreground] text-sm" colSpan={4}>No ICPs yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

