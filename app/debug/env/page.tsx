// app/debug/env/page.tsx
// ⚠️ Dev-only. Blocks in production.
export const dynamic = 'force-dynamic';

function mask(v?: string) {
  if (!v) return '—';
  return v.length <= 8 ? '********' : `${v.slice(0,2)}***${v.slice(-4)}`;
}

const REQUIRED = [
  // client-visible
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
  // server-only (masked)
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

export default async function Page() {
  if (process.env.NODE_ENV === 'production') {
    return <div>Disabled in production.</div>;
  }
  return (
    <main style={{fontFamily:'Inter, system-ui', padding:24}}>
      <h1 style={{color:'#283c63'}}>Env Debug</h1>
      <table style={{borderCollapse:'collapse', marginTop:12}}>
        <thead>
          <tr>
            <th style={{border:'1px solid #ddd', padding:8}}>Key</th>
            <th style={{border:'1px solid #ddd', padding:8}}>Value</th>
            <th style={{border:'1px solid #ddd', padding:8}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {REQUIRED.map((k) => {
            const val = process.env[k];
            const isPublic = k.startsWith('NEXT_PUBLIC_');
            return (
              <tr key={k}>
                <td style={{border:'1px solid #ddd', padding:8}}>{k}</td>
                <td style={{border:'1px solid #ddd', padding:8}}>
                  {isPublic ? (val ?? '—') : mask(val)}
                </td>
                <td style={{border:'1px solid #ddd', padding:8, color: val ? 'green' : 'red'}}>
                  {val ? 'OK' : 'MISSING'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{marginTop:12, color:'#375287'}}>
        Server-only secrets are masked. This page is a server component and won’t leak keys to the client.
      </p>
    </main>
  );
}

