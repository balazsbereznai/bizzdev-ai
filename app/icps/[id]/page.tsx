// app/icps/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import IcpEditor from './icp-editor'

export const dynamic = 'force-dynamic'

export default async function IcpEditPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // RSC-safe cookie adapter: get only
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { error } = await supabase
    .from('icps')
    .select('id')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (error) {
    return (
      <div className="container-px mx-auto max-w-4xl py-8">
        <p className="text-red-600">Not found or no access.</p>
        <p className="mt-4">
          <a className="underline text-[--primary]" href="/icps/inventory">
            Back to All ICPs
          </a>
        </p>
      </div>
    )
  }

  return <IcpEditor id={id} />
}

