'use client'

import { useEffect } from 'react'
import ProductsPage from '@/app/products/page'

export default function ProductEditor({ id, newFlag }: { id: string; newFlag?: boolean }) {
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('edit', id)
    if (newFlag) url.searchParams.set('new', '1')
    window.history.replaceState({}, '', url.toString())
  }, [id, newFlag])

  return <ProductsPage />
}

