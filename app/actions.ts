'use server'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createOrganization(name: string) {
  const supabase = await createClient() // <-- await
  const { data: { user } } = await supabase.auth.getUser()

  console.log('server user id:', user?.id) // TEMP: helps us debug

  if (!user) throw new Error('Not signed in')

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({ name, created_by: user.id })
    .select('*')
    .single()
  if (orgErr) throw orgErr

  const { error: memErr } = await supabase
    .from('organization_members')
    .insert({ org_id: org.id, user_id: user.id, role: 'owner' })
  if (memErr) throw memErr

  revalidatePath('/dashboard')
  return org
}

