import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import CompaniesInventoryClient from './CompaniesInventoryClient'
import BrandButton from '@/components/ui/BrandButton'
import CreateNewHardButton from './CreateNewHardButton'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ✅ RSC-safe: read-only cookie access (no set/remove)
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="container-px mx-auto max-w-[1280px] py-8">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Not signed in.
        </div>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('company_profile')
    .select('id, company_name, industry, region, size')
    .eq('user_id', user.id)
    .order('company_name', { ascending: true })

  return (
    <div className="container-px mx-auto max-w-[1280px] py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your Companies</h1>
        <div className="flex gap-2">
          <BrandButton
            href="/dashboard/hub"
            outline
            className="!py-2 !px-3 !border-[--primary] !text-[--primary] !bg-[--surface]/60 hover:!bg-[--surface] hover:shadow-[--shadow-1]"
          >
            Back to Hub
          </BrandButton>

          {/* Opens /companies/new (intercepted by @modal/(..)new from inventory) */}
          <CreateNewHardButton />
        </div>
      </div>

      <CompaniesInventoryClient data={data ?? []} error={error?.message ?? null} />
    </div>
  )
}

