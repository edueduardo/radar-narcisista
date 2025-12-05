'use client'

/**
 * Hook de Gamificação
 * Facilita o uso do sistema de conquistas em qualquer componente
 */

import { useState, useCallback } from 'react'
import { Achievement } from '@/lib/gamification'

interface GamificationState {
  loading: boolean
  error: string | null
  newlyUnlocked: Achievement[]
}

export function useGamification() {
  const [state, setState] = useState<GamificationState>({
    loading: false,
    error: null,
    newlyUnlocked: []
  })

  /**
   * Incrementa uma métrica e verifica conquistas
   */
  const trackAction = useCallback(async (metric: string, value: number = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment',
          metric,
          value
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar progresso')
      }

      const data = await response.json()

      setState(prev => ({
        ...prev,
        loading: false,
        newlyUnlocked: data.newlyUnlocked || []
      }))

      return data
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
      return null
    }
  }, [])

  /**
   * Define uma métrica com valor específico
   */
  const setMetric = useCallback(async (metric: string, value: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          metric,
          value
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar progresso')
      }

      const data = await response.json()

      setState(prev => ({
        ...prev,
        loading: false,
        newlyUnlocked: data.newlyUnlocked || []
      }))

      return data
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
      return null
    }
  }, [])

  /**
   * Busca progresso atual do usuário
   */
  const getProgress = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/gamification')

      if (!response.ok) {
        throw new Error('Erro ao buscar progresso')
      }

      const data = await response.json()

      setState(prev => ({ ...prev, loading: false }))

      return data
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
      return null
    }
  }, [])

  /**
   * Limpa conquistas recém-desbloqueadas
   */
  const clearNewlyUnlocked = useCallback(() => {
    setState(prev => ({ ...prev, newlyUnlocked: [] }))
  }, [])

  // Ações pré-definidas comuns
  const actions = {
    // Diário
    journalEntry: () => trackAction('journal_entry'),
    journalStreak: (days: number) => setMetric('journal_streak', days),
    
    // Teste de clareza
    clarityTest: () => trackAction('clarity_test'),
    clarityImprovement: () => trackAction('clarity_improvement'),
    
    // Chat
    chatSession: () => trackAction('chat_sessions'),
    
    // Aprendizado
    articleRead: () => trackAction('articles_read'),
    academyTrack: () => trackAction('academy_track'),
    
    // Segurança
    safetyPlan: () => trackAction('safety_plan'),
    boundarySet: () => trackAction('boundaries_set'),
    
    // Padrões
    patternIdentified: () => trackAction('patterns_identified'),
    
    // Especiais
    lateNightEntry: () => trackAction('late_night_entry'),
    voiceEntry: () => trackAction('voice_entry'),
    comeback: () => trackAction('comeback'),
    
    // Dias ativos
    dailyLogin: () => trackAction('daily_login'),
    daysActive: (days: number) => setMetric('days_active', days)
  }

  return {
    ...state,
    trackAction,
    setMetric,
    getProgress,
    clearNewlyUnlocked,
    actions
  }
}
