import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import ViewerPageClient from './ViewerPageClient'

export const dynamic = 'force-dynamic'

export default async function DocPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>
}) {
  const { id: runId, docId } = await params

  // Auth (read-only adapter)
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: doc, error } = await supabase
    .from('docs')
    .select('*')
    .eq('id', docId)
    .single()

  if (error || !doc) {
    return (
      <div className="container-px mx-auto max-w-[860px] py-8 space-y-4">
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {error?.message || 'Document not found.'}
        </div>
        <div><a href="/runs" className="btn-subtle">Back to runs</a></div>
      </div>
    )
  }

  const markdown: string = doc.markdown ?? doc.content ?? ''
  const pdfHref = `/api/docs/${doc.id}/pdf`

  return (
    <div className="container-px mx-auto max-w-[1280px] py-4 space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-[--muted-foreground]">
          Workspace <span className="opacity-60">· Doc tools</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={pdfHref} className="toolbar-btn">{'Export PDF'}</a>
          <a href="/runs" className="toolbar-btn">Back to runs</a>
        </div>
      </div>

      {/* Client wrapper renders the same pretty skin as the modal */}
      <ViewerPageClient markdown={markdown} />
    </div>
  )
}

