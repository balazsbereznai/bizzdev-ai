import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import ModalHost from './ModalHost';
import PlaybookModalClient from './PlaybookModalClient';

export const dynamic = 'force-dynamic';

export default async function PlaybookInterceptedModal({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id: runId, docId } = await params;

  // Auth check (no cookie writes here)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  return (
    <ModalHost title="Playbook" backHref="/runs">
      <PlaybookModalClient runId={runId} docId={docId} />
    </ModalHost>
  );
}

