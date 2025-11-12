// app/companies/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import CompanyForm from '../CompanyForm'
import BrandButton from '@/components/ui/BrandButton'

export const dynamic = 'force-dynamic'

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ✅ RSC-safe: read-only cookies
      cookies: { get: (n) => cookieStore.get(n)?.value },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: company, error } = await supabase
    .from('company_profile')
    .select('id, company_name, industry, region, size, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !company) {
    return (
      <section className="container-px mx-auto max-w-3xl py-10">
        <div className="mx-auto max-w-2xl rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface]/95 backdrop-blur-md shadow-[--shadow-1]">
          <div className="card-header">
            <h1 className="text-2xl font-semibold text-[--color-primary]">Company</h1>
          </div>
          <div className="card-body space-y-4">
            <div className="rounded-lg border border-amber-400/60 bg-amber-500/10 p-3 text-sm text-amber-200">
              {error?.message || 'Not found or no access.'}
            </div>
            <div className="flex gap-2">
              <BrandButton href="/companies/inventory" variant="outline" className="!py-2 !px-3 !border !border-[--primary] !text-[--primary] !bg-[--surface]/60 hover:!bg-[--surface]">
                Back to companies
              </BrandButton>
              <BrandButton href="/dashboard/hub" variant="outline" className="!py-2 !px-3 !border !border-[--primary] !text-[--primary] !bg-[--surface]/60 hover:!bg-[--surface]">
                Back to Hub
              </BrandButton>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container-px mx-auto max-w-3xl py-10">
      <div className="mx-auto max-w-2xl rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface]/95 backdrop-blur-md shadow-[--shadow-1]">
        <div className="card-header">
          <h1 className="text-2xl font-semibold text-[--color-primary]">Company</h1>
        </div>
        <div className="card-body">
          <CompanyForm
            mode="edit"
            id={company.id}
            initial={{
              company_name: company.company_name ?? '',
              industry: company.industry ?? '',
              region: company.region ?? '',
              size: company.size ?? '',
            }}
          />
        </div>
      </div>
    </section>
  )
}

