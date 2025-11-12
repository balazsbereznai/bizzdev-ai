'use client'

import { useEffect } from 'react'
import ICPsPage from '@/app/icps/page'

export default function IcpEditor({ id, newFlag }: { id: string; newFlag?: boolean }) {
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('edit', id)
    if (newFlag) url.searchParams.set('new', '1')
    window.history.replaceState({}, '', url.toString())
  }, [id, newFlag])

  return <ICPsPage />
}

