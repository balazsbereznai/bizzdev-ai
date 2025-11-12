'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendLink = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'http://localhost:3000/auth/callback' }
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Sign in</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={{ padding: 8, width: '100%', marginTop: 12 }}
      />
      <button onClick={sendLink} style={{ padding: 10, marginTop: 12 }}>
        Send login link
      </button>
      {sent && <p>Check your email for the link.</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </main>
  );
}
