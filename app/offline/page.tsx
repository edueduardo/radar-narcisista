'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Shield, 
  MessageCircle,
  AlertTriangle,
  Battery,
  Download
} from 'lucide-react'

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Tentar reconectar automaticamente a cada 30 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
        if (response.ok) {
          window.location.href = '/'
        }
      } catch (error) {
        // Ainda offline
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    try {
      // Tentar conectar com o servidor
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        window.location.href = '/'
      } else {
        throw new Error('Servidor indisponível')
      }
    } catch (error) {
      setTimeout(() => setIsRetrying(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        
        {/* Ícone animado */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center animate-pulse">
            <WifiOff className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="w-8 h-8 text-orange-400 animate-bounce" />
          </div>
        </div>

        {/* Título e descrição */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Você está offline
        </h1>
        <h2 className="text-xl font-semibold text-orange-300 mb-4">
          Sem conexão com a internet
        </h2>
        <p className="text-slate-400 mb-8 text-lg">
          Não se preocupe! Algumas funcionalidades ainda estão disponíveis offline.
        </p>

        {/* Funcionalidades disponíveis offline */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-orange-500/20">
          <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center justify-center gap-2">
            <Battery className="w-5 h-5" />
            Disponível offline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="text-white font-medium mb-1">Diário Seguro</h4>
              <p className="text-slate-400 text-sm">Continue registrando episódios. Sincronizará quando voltar online.</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-medium mb-1">Chat Local</h4>
              <p className="text-slate-400 text-sm">Conversas anteriores ficam disponíveis para leitura.</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Tentando...' : 'Tentar novamente'}
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5" />
            Página Inicial
          </Link>
        </div>

        {/* Informações de retry */}
        {retryCount > 0 && (
          <div className="text-sm text-slate-500 mb-4">
            Tentativas de reconexão: {retryCount}
          </div>
        )}

        {/* Dicas offline */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-8">
          <h3 className="text-purple-200 font-medium mb-2 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Dicas para offline
          </h3>
          <ul className="text-purple-300 text-sm space-y-1 text-left max-w-md mx-auto">
            <li>• Seus dados são salvos localmente</li>
            <li>• A sincronização é automática ao voltar</li>
            <li>• Emergência (ESC) sempre funciona</li>
            <li>• Teste de Clareza precisa de internet</li>
          </ul>
        </div>

        {/* Status da conexão */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Verificando conexão automaticamente...</span>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-xs text-slate-600">
          <p>O Radar Narcisista funciona mesmo offline para suas funcionalidades críticas.</p>
          <p className="mt-1">Seu bem-estar é nossa prioridade, com ou sem internet.</p>
        </div>
      </div>

      {/* Background decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
