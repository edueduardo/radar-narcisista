'use client'

import { useState, useEffect } from 'react'

interface TermsStatus {
  hasAccepted: boolean | null
  isLoading: boolean
  acceptanceId: string | null
  acceptedAt: string | null
  eventHash: string | null
  needsReacceptance: boolean
}

export function useTermsStatus(termsSlug: string = 'responsabilidade-v1-2025-11-28') {
  const [status, setStatus] = useState<TermsStatus>({
    hasAccepted: null,
    isLoading: true,
    acceptanceId: null,
    acceptedAt: null,
    eventHash: null,
    needsReacceptance: false
  })

  useEffect(() => {
    checkTermsStatus()
  }, [termsSlug])

  const checkTermsStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/terms/accept', {
        method: 'GET'
      })
      
      const result = await response.json()
      
      // Verificar se precisa reaceitar (ex: versão atualizada)
      const acceptedAt = result.acceptedAt
      let needsReacceptance = false
      
      if (acceptedAt) {
        // Se aceitou há mais de 30 dias, sugerir reaceitação
        const acceptanceDate = new Date(acceptedAt)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        needsReacceptance = acceptanceDate < thirtyDaysAgo
      }
      
      setStatus({
        hasAccepted: result.hasAccepted || false,
        isLoading: false,
        acceptanceId: result.acceptanceId || null,
        acceptedAt: result.acceptedAt || null,
        eventHash: result.eventHash || null,
        needsReacceptance
      })
      
    } catch (error) {
      console.error('Erro ao verificar status dos termos:', error)
      setStatus({
        hasAccepted: false,
        isLoading: false,
        acceptanceId: null,
        acceptedAt: null,
        eventHash: null,
        needsReacceptance: true // Em caso de erro, exigir aceitação
      })
    }
  }

  const markAsAccepted = (acceptanceData?: {
    acceptanceId: string
    eventHash: string
    acceptedAt: string
  }) => {
    setStatus(prev => ({
      ...prev,
      hasAccepted: true,
      needsReacceptance: false,
      ...(acceptanceData && {
        acceptanceId: acceptanceData.acceptanceId,
        eventHash: acceptanceData.eventHash,
        acceptedAt: acceptanceData.acceptedAt
      })
    }))
  }

  const forceReacceptance = () => {
    setStatus(prev => ({
      ...prev,
      hasAccepted: false,
      needsReacceptance: true
    }))
  }

  return {
    ...status,
    checkTermsStatus,
    markAsAccepted,
    forceReacceptance
  }
}
