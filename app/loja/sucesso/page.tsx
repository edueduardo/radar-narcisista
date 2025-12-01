'use client'

/**
 * Página de Sucesso - Compra de Add-on
 * ETAPA 14 - Loja Simplificada
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles, Gift, Home, Loader2 } from 'lucide-react'
import { getAddonById } from '@/lib/addons-config'

function LojaSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const addonId = searchParams.get('addon')
  
  const [addon, setAddon] = useState<any>(null)
  
  useEffect(() => {
    if (addonId) {
      const foundAddon = getAddonById(addonId)
      setAddon(foundAddon)
    }
  }, [addonId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
          {/* Ícone de sucesso */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Compra realizada com sucesso!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Obrigada por confiar no Radar Narcisista.
          </p>
          
          {/* Detalhes do add-on */}
          {addon && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                  <Gift className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {addon.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {addon.shortDescription}
                  </p>
                </div>
              </div>
              
              {addon.credits && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <Sparkles className="w-4 h-4 inline mr-1 text-amber-500" />
                  {addon.credits} créditos adicionados à sua conta
                </p>
              )}
              
              {addon.validityDays && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Válido por {addon.validityDays} dias
                </p>
              )}
            </div>
          )}
          
          {/* Aviso importante */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Importante:</strong> Seu recurso já está disponível. 
              Se não aparecer imediatamente, faça logout e login novamente.
            </p>
          </div>
          
          {/* Botões de ação */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
            >
              <Home className="w-5 h-5" />
              Ir para o Dashboard
            </Link>
            
            <Link
              href="/loja"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
            >
              Ver mais recursos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Suporte */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Problemas com sua compra?{' '}
            <Link href="/contato" className="text-violet-600 dark:text-violet-400 hover:underline">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}

export default function LojaSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LojaSuccessContent />
    </Suspense>
  )
}
