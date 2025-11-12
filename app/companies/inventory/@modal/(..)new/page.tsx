// app/companies/inventory/@modal/(..)new/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import ModalHost from '@/components/ModalHost'
import ModalActionsPortal from '@/components/ModalActionsPortal'
import ModalSaveExitButton from '@/components/ModalSaveExitButton'
import CompanyForm from '@/app/companies/CompanyForm'

export const dynamic = 'force-dynamic'

export default async function InventoryNewCompanyModal() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  return (
    <ModalHost title="Company — New" backHref="/companies/inventory">
      <ModalActionsPortal>
        <ModalSaveExitButton to="/companies/inventory" />
      </ModalActionsPortal>

      <CompanyForm mode="create" minimal />
    </ModalHost>
  )
}

