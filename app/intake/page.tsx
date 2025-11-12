// app/intake/page.tsx
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import CompanyForm from './CompanyForm'

export const dynamic = 'force-dynamic' // keep fresh while editing

type Org = {
  id: string
  name: string | null
  industry: string | null
  region: string | null
  size: string | null
  created_by: string | null
}

async function requireUserAndOrg(): Promise<{ userId: string; org: Org | null }> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set: (n: string, v: string, o: any) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n: string, o: any) => cookieStore.delete({ name: n, ...o }),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // Latest org for this user
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, industry, region, size, created_by')
    .eq('created_by', user.id)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(1)

  if (error) {
    console.error('organizations query failed', error.message)
    return { userId: user.id, org: null }
  }

  return { userId: user.id, org: (data?.[0] as Org) ?? null }
}

// ✅ Server action: force-refresh /profile and return there
export async function doneAndReturnAction() {
  'use server'
  revalidatePath('/profile')
  redirect('/profile')
}

export default async function IntakePage() {
  const { org } = await requireUserAndOrg()

  return (
    <div className="container-px mx-auto max-w-4xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Company Intake</h1>
      </div>

      <CompanyForm
        orgId={org?.id ?? null}
        initial={{
          name: org?.name ?? '',
          industry: org?.industry ?? '',
          region: org?.region ?? '',
          size: org?.size ?? '',
        }}
      />

      <div className="flex items-center gap-3">
        <form action={doneAndReturnAction}>
          <button className="btn" type="submit">Done & Return to Profile</button>
        </form>
        <a href="/profile" className="btn-secondary">Cancel</a>
      </div>
    </div>
  )
}

