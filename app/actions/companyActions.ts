// app/actions/companyActions.ts
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

  if (userErr || !user) {
    redirect('/signin');
  }

  // Ensure a matching user_profile row exists for this auth user.
  // company_profile.user_id has a FK to user_profile.id, and RLS uses auth.uid() = user_id,
  // so user_profile.id must equal auth.users.id for this user.
  const { data: profileRows, error: profileSelectErr } = await supabase
    .from('user_profile')
    .select('id')
    .eq('id', user.id)
    .limit(1);

  if (profileSelectErr) {
    // If we cannot verify the profile, fail gracefully back to the hub
    redirect('/dashboard/hub?err=load_user_profile_failed');
  }

  const hasProfile = Array.isArray(profileRows) && profileRows.length > 0;

  if (!hasProfile) {
    const { error: profileInsertErr } = await supabase.from('user_profile').insert({
      id: user.id,
      email: user.email ?? null,
      full_name: null,
      role: 'user',
    });

    if (profileInsertErr) {
      // If we cannot create the profile, the FK on company_profile will fail anyway,
      // so bail out early with a clear error.
      redirect('/dashboard/hub?err=create_user_profile_failed');
    }
  }

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

