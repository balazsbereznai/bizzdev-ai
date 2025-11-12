import ModalHost from './ModalHost';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import IcpEditor from '@/app/icps/[id]/icp-editor';

export const dynamic = 'force-dynamic';

export default async function ICPInterceptedEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth check (no business logic changes)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: n => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n, o) => cookieStore.delete({ name: n, ...o }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  // Header mirrors Companies/Product style: plain entity name
  return (
    <ModalHost title="Potential Customer Profile" backHref="/icps/inventory">
      <IcpEditor id={id} />
    </ModalHost>
  );
}

