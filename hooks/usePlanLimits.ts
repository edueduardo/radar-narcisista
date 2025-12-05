'use client'

/**
 * TEMA 11: Hook para verificar limites do plano
 * 
 * Uso:
 * const { canSendMessage, canCreateEntry, limits, usage, isLoading } = usePlanLimits()
 * 
 * if (!canSendMessage) {
 *   // Mostrar modal de upgrade
 * }
 */

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/compat'
import { PlanLevel, PLANS } from '@/lib/plans-config'
import {
  getUserUsage,
  checkChatLimit,
  checkDiaryLimit,
  checkTestLimit,
  checkPdfExportAccess,
  checkHistoryAccess,
  checkCollaborativeAIAccess,
  LimitCheckResult,
  UsageCount,
} from '@/lib/plan-limits'

interface UsePlanLimitsReturn {
  // Estado
  isLoading: boolean
  error: string | null
  
  // Nível do plano
  planLevel: PlanLevel
  planName: string
  
  // Uso atual
  usage: UsageCount | null
  
  // Verificações rápidas (booleanos)
  canSendMessage: boolean
  canCreateEntry: boolean
  canCreateTest: boolean
  canExportPdf: boolean
  canViewHistory: boolean
  canUseCollaborativeAI: boolean
  
  // Verificações detalhadas
  chatLimit: LimitCheckResult | null
  diaryLimit: LimitCheckResult | null
  testLimit: LimitCheckResult | null
  
  // Ações
  refetch: () => Promise<void>
  incrementChatUsage: () => void
  incrementDiaryUsage: () => void
  incrementTestUsage: () => void
}

export function usePlanLimits(): UsePlanLimitsReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planLevel, setPlanLevel] = useState<PlanLevel>('guardar')
  const [usage, setUsage] = useState<UsageCount | null>(null)
  const [chatLimit, setChatLimit] = useState<LimitCheckResult | null>(null)
  const [diaryLimit, setDiaryLimit] = useState<LimitCheckResult | null>(null)
  const [testLimit, setTestLimit] = useState<LimitCheckResult | null>(null)
  
  const supabase = createClientComponentClient()
  
  const fetchLimits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Obter usuário
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setPlanLevel('visitante')
        setUsage(null)
        setChatLimit(null)
        setDiaryLimit(null)
        setTestLimit(null)
        setIsLoading(false)
        return
      }
      
      // Obter assinatura do usuário
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, plan_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      
      // Determinar nível do plano
      let level: PlanLevel = 'guardar'
      if (subscription?.status === 'active') {
        if (subscription.plan_id === 'premium' || subscription.plan_id === 'defesa') {
          level = 'defesa'
        } else if (subscription.plan_id === 'essencial' || subscription.plan_id === 'jornada') {
          level = 'jornada'
        }
      }
      setPlanLevel(level)
      
      // Obter uso atual
      const currentUsage = await getUserUsage(user.id)
      setUsage(currentUsage)
      
      // Calcular limites
      setChatLimit(checkChatLimit(level, currentUsage.mensagens_chat_hoje))
      setDiaryLimit(checkDiaryLimit(level, currentUsage.entradas_diario_mes))
      setTestLimit(checkTestLimit(level, currentUsage.testes_mes))
      
    } catch (err) {
      console.error('Erro ao verificar limites:', err)
      setError('Erro ao verificar limites do plano')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])
  
  // Incrementar uso localmente (otimistic update)
  const incrementChatUsage = useCallback(() => {
    if (usage) {
      const newUsage = {
        ...usage,
        mensagens_chat_hoje: usage.mensagens_chat_hoje + 1,
      }
      setUsage(newUsage)
      setChatLimit(checkChatLimit(planLevel, newUsage.mensagens_chat_hoje))
    }
  }, [usage, planLevel])
  
  const incrementDiaryUsage = useCallback(() => {
    if (usage) {
      const newUsage = {
        ...usage,
        entradas_diario_mes: usage.entradas_diario_mes + 1,
      }
      setUsage(newUsage)
      setDiaryLimit(checkDiaryLimit(planLevel, newUsage.entradas_diario_mes))
    }
  }, [usage, planLevel])
  
  const incrementTestUsage = useCallback(() => {
    if (usage) {
      const newUsage = {
        ...usage,
        testes_mes: usage.testes_mes + 1,
      }
      setUsage(newUsage)
      setTestLimit(checkTestLimit(planLevel, newUsage.testes_mes))
    }
  }, [usage, planLevel])
  
  useEffect(() => {
    fetchLimits()
  }, [fetchLimits])
  
  // Calcular booleanos de acesso
  const plan = PLANS[planLevel]
  
  return {
    isLoading,
    error,
    planLevel,
    planName: plan.name,
    usage,
    
    // Verificações rápidas
    canSendMessage: chatLimit?.allowed ?? false,
    canCreateEntry: diaryLimit?.allowed ?? false,
    canCreateTest: testLimit?.allowed ?? false,
    canExportPdf: checkPdfExportAccess(planLevel),
    canViewHistory: checkHistoryAccess(planLevel),
    canUseCollaborativeAI: checkCollaborativeAIAccess(planLevel),
    
    // Verificações detalhadas
    chatLimit,
    diaryLimit,
    testLimit,
    
    // Ações
    refetch: fetchLimits,
    incrementChatUsage,
    incrementDiaryUsage,
    incrementTestUsage,
  }
}

export default usePlanLimits
