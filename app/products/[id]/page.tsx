// app/products/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import ProductEditor from './product-editor'

export const dynamic = 'force-dynamic'

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ✅ RSC-safe: read-only cookies adapter
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // Verify access
  const { error } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (error) {
    return (
      <div className="container-px mx-auto max-w-4xl py-8">
        <p className="text-red-600">Not found or no access.</p>
        <p className="mt-4">
          <a className="underline text-[--primary]" href="/products/inventory">
            Back to All Products
          </a>
        </p>
      </div>
    )
  }

  return <ProductEditor id={id} />
}

