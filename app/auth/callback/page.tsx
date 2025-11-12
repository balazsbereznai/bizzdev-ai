'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Callback() {
  const [msg, setMsg] = useState('Finishing sign in…');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setMsg('Signed in. Redirecting…');
        router.replace('/intake');
      } else {
        setMsg('Could not sign in. Try again.');
      }
    })();
  }, [router]);

  return <main style={{ padding: 24 }}>{msg}</main>;
}
