'use client'

/**
 * OraculoHint - Dica contextual do Oráculo
 * ETAPA 29 - Expor Oráculo V2 para outros perfis
 * 
 * Componente inline que sugere perguntar ao Oráculo
 * Pode ser usado em qualquer página para dar contexto
 */

import { useState } from 'react'
import { Sparkles, X, ChevronRight } from 'lucide-react'

type UserRole = 'admin' | 'usuaria' | 'profissional' | 'dev' | 'whitelabel'

interface OraculoHintProps {
  userRole: UserRole
  userPlan?: string
  message: string
  suggestedQuestion?: string
  variant?: 'inline' | 'banner' | 'card'
  dismissible?: boolean
  className?: string
}

export default function OraculoHint({
  userRole,
  userPlan = 'free',
  message,
  suggestedQuestion,
  variant = 'inline',
  dismissible = true,
  className = ''
}: OraculoHintProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (isDismissed) return null

  const handleAsk = async () => {
    if (!suggestedQuestion || isAsking) return

    setIsAsking(true)
    setError(null)

    try {
      const res = await fetch('/api/oraculo-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: suggestedQuestion,
          user_role: userRole,
          plan: userPlan,
          url_atual: typeof window !== 'undefined' ? window.location.pathname : ''
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao consultar')
      }

      setResponse(data.response?.resposta_principal || 'Sem resposta')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro')
    } finally {
      setIsAsking(false)
    }
  }

  // Variante inline (pequena, dentro do texto)
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-violet-600 ${className}`}>
        <Sparkles className="w-3 h-3" />
        <span className="text-sm">{message}</span>
        {suggestedQuestion && (
          <button
            onClick={handleAsk}
            disabled={isAsking}
            className="text-sm underline hover:no-underline"
          >
            {isAsking ? '...' : 'Perguntar'}
          </button>
        )}
      </span>
    )
  }

  // Variante banner (faixa no topo/rodapé)
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500 
        p-3 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <div>
            <p className="text-sm text-gray-700">{message}</p>
            {response && (
              <p className="text-sm text-gray-600 mt-1 bg-white/50 p-2 rounded">
                {response}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {suggestedQuestion && !response && (
            <button
              onClick={handleAsk}
              disabled={isAsking}
              className="text-sm px-3 py-1 bg-violet-600 text-white rounded-full 
                hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isAsking ? 'Perguntando...' : (
                <>
                  Perguntar <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Variante card (caixa destacada)
  return (
    <div className={`bg-white border border-violet-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-violet-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{message}</p>
          
          {response && (
            <div className="mt-3 p-3 bg-violet-50 rounded-lg">
              <p className="text-sm text-gray-700">{response}</p>
            </div>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {suggestedQuestion && !response && (
            <button
              onClick={handleAsk}
              disabled={isAsking}
              className="mt-3 text-sm px-4 py-2 bg-violet-600 text-white rounded-lg 
                hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isAsking ? 'Consultando Oráculo...' : suggestedQuestion}
            </button>
          )}
        </div>
        
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
