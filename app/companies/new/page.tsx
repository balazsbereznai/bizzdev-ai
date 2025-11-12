// app/companies/new/page.tsx
import CompanyForm from '../CompanyForm'

export const dynamic = 'force-dynamic'

export default function NewCompanyPage() {
  return (
    <section className="container-px mx-auto max-w-[860px] py-8 space-y-6">
      <div className="mx-auto max-w-[820px] rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface]/95 backdrop-blur-md shadow-[--shadow-2]">
        <div className="card-header">
          <h1 className="text-2xl font-semibold text-[--color-primary]">Company</h1>
        </div>
        <div className="card-body">
          <CompanyForm mode="create" />
        </div>
      </div>
    </section>
  )
}
