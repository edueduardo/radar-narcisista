/**
 * TEMA 11: Sistema de Limites por Plano
 * 
 * Verifica e gerencia limites de uso baseados no plano do usuário.
 * Integra com a configuração de planos (plans-config.ts).
 */

import { createClient } from '@/lib/supabase/client'
import { PLANS, PlanLevel, PlanLimit } from './plans-config'

// =============================================================================
// TIPOS
// =============================================================================

export interface UsageCount {
  mensagens_chat_hoje: number
  entradas_diario_mes: number
  testes_mes: number
}

export interface LimitCheckResult {
  allowed: boolean
  currentUsage: number
  limit: number
  remaining: number
  message?: string
  upgradeRequired?: boolean
}

export interface UserPlanInfo {
  planLevel: PlanLevel
  planName: string
  limits: PlanLimit
  usage: UsageCount
}

// =============================================================================
// FUNÇÕES DE CONTAGEM DE USO
// =============================================================================

/**
 * Conta mensagens de chat do usuário hoje
 */
export async function countTodayMessages(userId: string): Promise<number> {
  const supabase = createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count, error } = await supabase
    .from('ai_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', today.toISOString())
  
  if (error) {
    console.error('Erro ao contar mensagens:', error)
    return 0
  }
  
  return count || 0
}

/**
 * Conta entradas de diário do usuário este mês
 */
export async function countMonthDiaryEntries(userId: string): Promise<number> {
  const supabase = createClient()
  
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)
  
  const { count, error } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('created_at', firstDayOfMonth.toISOString())
  
  if (error) {
    console.error('Erro ao contar entradas:', error)
    return 0
  }
  
  return count || 0
}

/**
 * Conta testes de clareza do usuário este mês
 */
export async function countMonthTests(userId: string): Promise<number> {
  const supabase = createClient()
  
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)
  
  const { count, error } = await supabase
    .from('clarity_tests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth.toISOString())
  
  if (error) {
    console.error('Erro ao contar testes:', error)
    return 0
  }
  
  return count || 0
}

/**
 * Obtém todo o uso do usuário
 */
export async function getUserUsage(userId: string): Promise<UsageCount> {
  const [mensagens, entradas, testes] = await Promise.all([
    countTodayMessages(userId),
    countMonthDiaryEntries(userId),
    countMonthTests(userId),
  ])
  
  return {
    mensagens_chat_hoje: mensagens,
    entradas_diario_mes: entradas,
    testes_mes: testes,
  }
}

// =============================================================================
// FUNÇÕES DE VERIFICAÇÃO DE LIMITE
// =============================================================================

/**
 * Verifica se o usuário pode enviar mais mensagens de chat
 */
export function checkChatLimit(
  planLevel: PlanLevel,
  currentMessages: number
): LimitCheckResult {
  const plan = PLANS[planLevel]
  const limit = plan.limits.mensagens_chat_dia
  
  // -1 = ilimitado
  if (limit === -1) {
    return {
      allowed: true,
      currentUsage: currentMessages,
      limit: -1,
      remaining: -1,
    }
  }
  
  const remaining = Math.max(0, limit - currentMessages)
  const allowed = currentMessages < limit
  
  return {
    allowed,
    currentUsage: currentMessages,
    limit,
    remaining,
    message: allowed 
      ? `${remaining} mensagens restantes hoje`
      : 'Limite de mensagens atingido hoje',
    upgradeRequired: !allowed,
  }
}

/**
 * Verifica se o usuário pode criar mais entradas no diário
 */
export function checkDiaryLimit(
  planLevel: PlanLevel,
  currentEntries: number
): LimitCheckResult {
  const plan = PLANS[planLevel]
  const limit = plan.limits.entradas_diario_mes
  
  // -1 = ilimitado
  if (limit === -1) {
    return {
      allowed: true,
      currentUsage: currentEntries,
      limit: -1,
      remaining: -1,
    }
  }
  
  const remaining = Math.max(0, limit - currentEntries)
  const allowed = currentEntries < limit
  
  return {
    allowed,
    currentUsage: currentEntries,
    limit,
    remaining,
    message: allowed 
      ? `${remaining} entradas restantes este mês`
      : 'Limite de entradas atingido este mês',
    upgradeRequired: !allowed,
  }
}

/**
 * Verifica se o usuário pode fazer mais testes
 */
export function checkTestLimit(
  planLevel: PlanLevel,
  currentTests: number
): LimitCheckResult {
  const plan = PLANS[planLevel]
  const limit = plan.limits.testes_mes
  
  // -1 = ilimitado
  if (limit === -1) {
    return {
      allowed: true,
      currentUsage: currentTests,
      limit: -1,
      remaining: -1,
    }
  }
  
  const remaining = Math.max(0, limit - currentTests)
  const allowed = currentTests < limit
  
  return {
    allowed,
    currentUsage: currentTests,
    limit,
    remaining,
    message: allowed 
      ? `${remaining} testes restantes este mês`
      : 'Limite de testes atingido este mês',
    upgradeRequired: !allowed,
  }
}

/**
 * Verifica se o usuário pode exportar PDF
 */
export function checkPdfExportAccess(planLevel: PlanLevel): boolean {
  const plan = PLANS[planLevel]
  return plan.limits.exportar_pdf
}

/**
 * Verifica se o usuário tem acesso ao histórico completo
 */
export function checkHistoryAccess(planLevel: PlanLevel): boolean {
  const plan = PLANS[planLevel]
  return plan.limits.historico_completo
}

/**
 * Verifica se o usuário tem acesso às IAs colaborativas
 */
export function checkCollaborativeAIAccess(planLevel: PlanLevel): boolean {
  const plan = PLANS[planLevel]
  return plan.limits.ias_colaborativas || false
}

// =============================================================================
// FUNÇÕES DE ALTO NÍVEL
// =============================================================================

/**
 * Obtém informações completas do plano e uso do usuário
 */
export async function getUserPlanInfo(
  userId: string,
  subscriptionStatus: string | null,
  planId: string | null
): Promise<UserPlanInfo> {
  // Determinar nível do plano
  let planLevel: PlanLevel = 'guardar'
  
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    if (planId === 'premium' || planId === 'defesa') {
      planLevel = 'defesa'
    } else if (planId === 'essencial' || planId === 'jornada') {
      planLevel = 'jornada'
    }
  }
  
  const plan = PLANS[planLevel]
  const usage = await getUserUsage(userId)
  
  return {
    planLevel,
    planName: plan.name,
    limits: plan.limits,
    usage,
  }
}

/**
 * Verifica todos os limites de uma vez
 */
export async function checkAllLimits(
  userId: string,
  planLevel: PlanLevel
): Promise<{
  chat: LimitCheckResult
  diary: LimitCheckResult
  tests: LimitCheckResult
  pdfExport: boolean
  history: boolean
  collaborativeAI: boolean
}> {
  const usage = await getUserUsage(userId)
  
  return {
    chat: checkChatLimit(planLevel, usage.mensagens_chat_hoje),
    diary: checkDiaryLimit(planLevel, usage.entradas_diario_mes),
    tests: checkTestLimit(planLevel, usage.testes_mes),
    pdfExport: checkPdfExportAccess(planLevel),
    history: checkHistoryAccess(planLevel),
    collaborativeAI: checkCollaborativeAIAccess(planLevel),
  }
}

// =============================================================================
// MENSAGENS DE UPGRADE
// =============================================================================

export const UPGRADE_MESSAGES = {
  chat: {
    title: 'Limite de mensagens atingido',
    description: 'Você atingiu o limite de mensagens do Coach IA para hoje.',
    cta: 'Fazer upgrade para mais mensagens',
  },
  diary: {
    title: 'Limite de entradas atingido',
    description: 'Você atingiu o limite de entradas no diário este mês.',
    cta: 'Fazer upgrade para diário ilimitado',
  },
  tests: {
    title: 'Limite de testes atingido',
    description: 'Você atingiu o limite de testes de clareza este mês.',
    cta: 'Fazer upgrade para testes ilimitados',
  },
  pdf: {
    title: 'Recurso Premium',
    description: 'Exportar PDF está disponível nos planos pagos.',
    cta: 'Fazer upgrade para exportar PDF',
  },
  history: {
    title: 'Recurso Premium',
    description: 'Histórico completo está disponível nos planos pagos.',
    cta: 'Fazer upgrade para histórico completo',
  },
  collaborativeAI: {
    title: 'Recurso Radar Defesa',
    description: 'IAs colaborativas estão disponíveis no plano Radar Defesa.',
    cta: 'Fazer upgrade para Radar Defesa',
  },
}

// =============================================================================
// COMPONENTE DE BARRA DE USO (para usar em UIs)
// =============================================================================

export function getUsagePercentage(current: number, limit: number): number {
  if (limit === -1) return 0 // Ilimitado
  if (limit === 0) return 100 // Sem acesso
  return Math.min(100, Math.round((current / limit) * 100))
}

export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function formatLimit(limit: number): string {
  if (limit === -1) return 'Ilimitado'
  if (limit === 0) return 'Não disponível'
  return limit.toString()
}
