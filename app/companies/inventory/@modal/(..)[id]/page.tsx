// app/companies/inventory/@modal/(..)[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import ModalHost from '@/components/ModalHost'
import ModalActionsPortal from '@/components/ModalActionsPortal'
import ModalDeleteButton from '@/components/ModalDeleteButton'
import ModalSaveExitButton from '@/components/ModalSaveExitButton'
import CompanyForm from '@/app/companies/CompanyForm'

export const dynamic = 'force-dynamic'

export default async function InventoryInterceptCompany({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: company, error } = await supabase
    .from('company_profile')
    .select('id, company_name, industry, region, size, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !company) return null

  return (
    <ModalHost title={`Company — ${company.company_name ?? ''}`} backHref="/companies/inventory">
      <ModalActionsPortal>
        <ModalDeleteButton table="company_profile" id={id} afterHref="/companies/inventory" />
        <ModalSaveExitButton onDoneHref="/companies/inventory" />
      </ModalActionsPortal>

      <CompanyForm
        mode="edit"
        id={company.id}
        minimal
        hideFooterActions
        initial={{
          company_name: company.company_name ?? '',
          industry: company.industry ?? '',
          region: company.region ?? '',
          size: company.size ?? '',
        }}
      />
    </ModalHost>
  )
}

