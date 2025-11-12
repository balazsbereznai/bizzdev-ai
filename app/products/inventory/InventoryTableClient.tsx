'use client'

import { useTransition } from 'react'
import { createClient } from '@/lib/supabase-browser'
import BrandButton from '@/components/ui/BrandButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function InventoryTableClient({ data, error }: { data: any[] | null; error: string | null }) {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleDelete(id: string) {
    const ok = confirm('Delete this product?')
    if (!ok) return
    startTransition(async () => {
      await supabase.from('products').delete().eq('id', id)
      window.location.reload()
    })
  }

  function openModal(id: string) {
    // Use client-side navigation so the intercepted @modal route catches
    router.push(`/products/${id}`)
  }

  return (
    <div className="card overflow-hidden">
      <table className="table">
        <thead>
          <tr>
            <th className="w-[28%]">Name</th>
            <th>One-liner</th>
            <th>Category</th>
            <th>Region</th>
            <th className="w-[200px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr><td className="px-3 py-2 text-red-600" colSpan={5}>Error: {error}</td></tr>
          ) : data?.length ? (
            data.map(r => (
              <tr key={r.id}>
                <td className="px-3 py-2">
                  {/* Use next/link for client-side navigation (enables interception) */}
                  <Link className="link font-medium" href={`/products/${r.id}`}>
                    {r.name || 'Untitled'}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.one_liner}</td>
                <td className="px-3 py-2">{r.category}</td>
                <td className="px-3 py-2">{r.region_scope}</td>
                <td className="px-3 py-2">
                  <div className="table-actions">
                    {/* Use router.push to ensure client-side nav for interception */}
                    <BrandButton onClick={() => openModal(r.id)} className="!py-1.5 !px-2.5 !text-[--color-cream]">
                      Open
                    </BrandButton>
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
            <tr><td className="px-3 py-6 text-[--muted-foreground] text-sm" colSpan={5}>No products yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

