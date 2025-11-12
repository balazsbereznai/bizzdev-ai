'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export async function createCompanyFromHub() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // In a Server Action we may read/write cookies
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
        set: (n, v, o) => cookieStore.set({ name: n, value: v, ...(o as any) }),
        setAll: (list: { name: string; value: string; options?: any }[]) =>
          list.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...(options as any) })
          ),
        remove: (n, o) => cookieStore.delete({ name: n, ...(o as any) }),
      },
    }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) redirect('/signin');

  const { data: row, error: insErr } = await supabase
    .from('company_profile')
    .insert({
      user_id: user.id,
      created_by: user.id,
      company_name: '',
      industry: null,
      region: null,
      size: null,
    })
    .select('id')
    .single();

  if (insErr || !row?.id) {
    // fall back to hub with an error message if needed
    redirect('/dashboard/hub?err=create_company_failed');
  }

  // Send user to the canonical editor route; the hub @modal interceptor will open the modal
  redirect(`/companies/${row.id}?new=1`);
}

