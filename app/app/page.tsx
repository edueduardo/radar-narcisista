'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Esta página agora redireciona para /dashboard-v2
// A dashboard premium está em /dashboard-v2
export default function AppPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard-v2')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
