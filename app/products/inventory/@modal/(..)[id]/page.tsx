// app/products/inventory/@modal/(..)[id]/page.tsx
import ModalHost from './ModalHost';
import ProductEditor from '@/app/products/[id]/product-editor';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductsInterceptedEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Read-only auth check so we avoid loops; no business logic changes
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // RSC-safe: read-only cookie adapter
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  // Modal header mirrors Companies: plain “Product”
  return (
    <ModalHost title="Product" backHref="/products/inventory">
      <ProductEditor id={id} />
    </ModalHost>
  );
}


