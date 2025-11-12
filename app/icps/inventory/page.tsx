import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import InventoryTableClient from './InventoryTableClient'
import BrandButton from '@/components/ui/BrandButton'

export const dynamic = 'force-dynamic'

export default async function ICPInventoryPage({
  searchParams,
}: { searchParams: Promise<{ err?: string }> }) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get: n => cookieStore.get(n)?.value,
      set: (n,v,o) => cookieStore.set({ name:n, value:v, ...o }),
      remove: (n,o) => cookieStore.delete({ name:n, ...o }),
    }}
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data, error } = await supabase
    .from('icps')
    .select('id,name,target_region,company_size,updated_at,created_at')
    .eq('created_by', user.id)
    .order('updated_at', { ascending: false })

  const errMsg = (await sp)?.err ? decodeURIComponent((await sp).err!) : null

  return (
    <div className="container-px mx-auto max-w-5xl py-8 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Your Potential Customer Profiles</h1>
        <div className="flex items-center gap-3">
          <BrandButton
            href="/dashboard/hub"
            variant="outline"
            className="!py-2 !px-3 !border !border-[--primary] !text-[--primary] !bg-[--surface]/60 hover:!bg-[--surface] hover:shadow-[--shadow-1]"
          >
            Back to Hub
          </BrandButton>
          <form action={async () => {
            'use server'
            const cs = await cookies()
            const sb = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              { cookies: {
                get: n => cs.get(n)?.value,
                set: (n,v,o) => cs.set({ name:n, value:v, ...o }),
                remove: (n,o) => cs.delete({ name:n, ...o }),
              }}
            )
            const { data: { user } } = await sb.auth.getUser()
            if (!user) redirect('/signin')

            // ensure org
            let orgId: string | undefined
            const { data: orgRow } = await sb.from('organizations').select('id')
              .eq('created_by', user.id).order('updated_at',{ascending:false}).limit(1).maybeSingle()
            if (!orgRow?.id) {
              const { data: createdOrg } = await sb
                .from('organizations')
                .insert({ name: 'My Company', created_by: user.id })
                .select('id').single()
              orgId = createdOrg?.id
            } else orgId = orgRow.id

            const { data: row, error: insErr } = await sb
              .from('icps')
              .insert({ name: '', created_by: user.id, org_id: orgId })
              .select('id').single()

            if (insErr || !row)
              redirect(`/icps/inventory?err=${encodeURIComponent(insErr?.message ?? 'insert_failed')}`)

            redirect(`/icps/${row.id}?new=1`)
          }}>
            <BrandButton
              type="submit"
              className="!py-2 !px-3 !text-[--color-cream]"
            >
              Create New
            </BrandButton>
          </form>
        </div>
      </div>

      {errMsg && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          Couldn’t create an ICP: <code>{errMsg}</code>
        </div>
      )}

      <InventoryTableClient data={data} error={error?.message ?? null} />
    </div>
  )
}

