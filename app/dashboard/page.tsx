import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createOrganization } from '@/app/actions'

export const dynamic = 'force-dynamic' // avoids static caching of cookies

export default async function Dashboard() {
  const supabase = await createClient() // <-- await

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: orgs, error } = await supabase
    .from('organization_members')
    .select('org_id, organizations(name)')
    .order('org_id')
  if (error) throw error

  async function NewOrg(formData: FormData) {
    'use server'
    const name = String(formData.get('name') || '')
    if (!name.trim()) return
    await createOrganization(name.trim())
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <form action={NewOrg} className="flex gap-2">
        <input name="name" placeholder="New org name" className="border rounded p-2 flex-1" />
        <button className="rounded px-4 py-2 bg-black text-white" type="submit">Create</button>
      </form>
      <div>
        <h2 className="text-lg font-medium mt-6 mb-2">Your organizations</h2>
        <ul className="list-disc ml-5">
          {(orgs || []).map((m: any) => (<li key={m.org_id}>{m.organizations?.name}</li>))}
        </ul>
      </div>
    </div>
  )
}

