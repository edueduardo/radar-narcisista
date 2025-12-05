'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { ResponsibilityTermsModal } from './ResponsibilityTermsModal'

interface TermsConfirmationButtonProps {
  context?: 'chat' | 'diario' | 'geral'
  variant?: 'floating' | 'header' | 'inline'
  className?: string
}

export function TermsConfirmationButton({ 
  context = 'geral', 
  variant = 'floating',
  className = ''
}: TermsConfirmationButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastAcceptedAt, setLastAcceptedAt] = useState<string | null>(null)
  const [acceptanceId, setAcceptanceId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkTermsStatus()
  }, [])

  const checkTermsStatus = async () => {
    try {
      setIsLoading(true)
      
      // Verificar status via API (com cadeia de custódia)
      const response = await fetch('/api/terms/accept', {
        method: 'GET'
      })
      
      const result = await response.json()
      
      setHasAccepted(result.hasAccepted || false)
      setAcceptanceId(result.acceptanceId || null)
      setLastAcceptedAt(result.acceptedAt || null)
      
    } catch (error) {
      console.error('Erro ao verificar status dos termos:', error)
      setHasAccepted(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = () => {
    // Após aceitar, atualizar status
    setHasAccepted(true)
    setShowModal(false)
    checkTermsStatus() // Recarregar status para pegar novo acceptanceId
  }

  const handleReconfirm = () => {
    // Abrir modal para reconfirmar
    setShowModal(true)
  }

  // Se está carregando, não mostrar nada
  if (isLoading) {
    return null
  }

  // Botão flutuante (canto inferior direito)
  if (variant === 'floating') {
    return (
      <>
        {/* Botão flutuante */}
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <button
            onClick={handleReconfirm}
            className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 hover:scale-105"
            title="Termos de Responsabilidade"
          >
            {/* Ícone */}
            <div className="relative">
              {hasAccepted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              )}
            </div>
            
            {/* Texto */}
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold">
                {hasAccepted ? 'Termos Aceitos' : 'Aceitar Termos'}
              </span>
              {lastAcceptedAt && (
                <span className="text-xs opacity-75">
                  {new Date(lastAcceptedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              )}
            </div>

            {/* Indicador de status */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              hasAccepted ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
            }`} />
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <ResponsibilityTermsModal 
            onAccept={handleAccept}
            context={context}
          />
        )}
      </>
    )
  }

  // Botão no header
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleReconfirm}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            hasAccepted 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          } ${className}`}
          title="Termos de Responsabilidade"
        >
          {hasAccepted ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">
            {hasAccepted ? 'Termos OK' : 'Aceitar Termos'}
          </span>
        </button>

        {showModal && (
          <ResponsibilityTermsModal 
            onAccept={handleAccept}
            context={context}
          />
        )}
      </>
    )
  }

  // Botão inline
  return (
    <>
      <button
        onClick={handleReconfirm}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          hasAccepted 
            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' 
            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
        } ${className}`}
        title="Termos de Responsabilidade"
      >
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">
          {hasAccepted ? 'Termos Confirmados' : 'Confirmar Termos'}
        </span>
        {acceptanceId && (
          <span className="text-xs opacity-60">
            ID: {acceptanceId.slice(-8)}
          </span>
        )}
      </button>

      {showModal && (
        <ResponsibilityTermsModal 
          onAccept={handleAccept}
          context={context}
        />
      )}
    </>
  )
}
