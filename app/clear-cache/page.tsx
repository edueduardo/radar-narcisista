'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCache() {
  const router = useRouter()

  useEffect(() => {
    // Limpar localStorage
    localStorage.clear()
    
    // Limpar sessionStorage
    sessionStorage.clear()
    
    // Limpar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister()
        }
      })
    }
    
    // Limpar todos os caches
    if ('caches' in window) {
      caches.keys().then(function(names) {
        names.forEach(function(name) {
          caches.delete(name)
        })
      })
    }
    
    // Redirecionar para dashboard correto após 2 segundos
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Limpando Cache</h1>
        <p className="text-gray-600 mb-4">
          Estamos limpando todo o cache e redirecionando você para o dashboard correto...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Aguarde um momento...
        </p>
      </div>
    </div>
  )
}
