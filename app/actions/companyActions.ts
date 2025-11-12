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
      // For @supabase/ssr v0.7.x the cookies option must provide get/set/remove only
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No cookie mutation needed in this action; keep as no-ops for type compatibility
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
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
    redirect('/dashboard/hub?err=create_company_failed');
  }

  // Send user to the canonical editor route; the hub @modal interceptor will open the modal
  redirect(`/companies/${row.id}?new=1`);
}

