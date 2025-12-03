/**
 * LIMIT NOTIFICATIONS - Sistema de Notificações de Limite
 * Bloco 36-40 - ETAPA 40
 * Notifica usuários quando atingem 80% e 100% do limite
 */

import { createClient } from '@supabase/supabase-js'

// Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Tipos
export interface LimitNotification {
  id: string
  user_id: string
  feature_key: string
  notification_type: 'warning_80' | 'limit_100' | 'reset'
  message: string
  read: boolean
  created_at: string
}

export interface UsageStatus {
  feature_key: string
  usage_today: number
  usage_month: number
  limite_diario: number | null
  limite_mensal: number | null
  percentage_daily: number
  percentage_monthly: number
  status: 'ok' | 'warning' | 'limit_reached'
}

/**
 * Verificar uso e criar notificações se necessário
 */
export async function checkAndNotifyLimits(userId: string, featureKey: string): Promise<UsageStatus> {
  try {
    // Buscar uso atual
    const { data: limitCheck } = await supabaseAdmin
      .rpc('check_feature_limit', { p_user_id: userId, p_feature_key: featureKey })

    if (!limitCheck) {
      return {
        feature_key: featureKey,
        usage_today: 0,
        usage_month: 0,
        limite_diario: null,
        limite_mensal: null,
        percentage_daily: 0,
        percentage_monthly: 0,
        status: 'ok'
      }
    }

    const usageToday = limitCheck.usage_today || 0
    const usageMonth = limitCheck.usage_month || 0
    const limitDaily = limitCheck.limite_diario
    const limitMonthly = limitCheck.limite_mensal

    // Calcular percentuais
    const percentDaily = limitDaily ? (usageToday / limitDaily) * 100 : 0
    const percentMonthly = limitMonthly ? (usageMonth / limitMonthly) * 100 : 0

    // Determinar status
    let status: 'ok' | 'warning' | 'limit_reached' = 'ok'
    
    if (percentDaily >= 100 || percentMonthly >= 100) {
      status = 'limit_reached'
    } else if (percentDaily >= 80 || percentMonthly >= 80) {
      status = 'warning'
    }

    // Criar notificações se necessário
    if (status === 'warning') {
      await createNotificationIfNotExists(userId, featureKey, 'warning_80', 
        `Você já usou ${Math.round(Math.max(percentDaily, percentMonthly))}% do limite de ${featureKey}. Considere fazer upgrade do seu plano.`)
    } else if (status === 'limit_reached') {
      await createNotificationIfNotExists(userId, featureKey, 'limit_100',
        `Você atingiu o limite de ${featureKey}. Faça upgrade para continuar usando.`)
    }

    return {
      feature_key: featureKey,
      usage_today: usageToday,
      usage_month: usageMonth,
      limite_diario: limitDaily,
      limite_mensal: limitMonthly,
      percentage_daily: percentDaily,
      percentage_monthly: percentMonthly,
      status
    }
  } catch (error) {
    console.error('Erro ao verificar limites:', error)
    return {
      feature_key: featureKey,
      usage_today: 0,
      usage_month: 0,
      limite_diario: null,
      limite_mensal: null,
      percentage_daily: 0,
      percentage_monthly: 0,
      status: 'ok'
    }
  }
}

/**
 * Criar notificação se não existir uma recente
 */
async function createNotificationIfNotExists(
  userId: string, 
  featureKey: string, 
  type: 'warning_80' | 'limit_100' | 'reset',
  message: string
): Promise<void> {
  try {
    // Verificar se já existe notificação recente (últimas 24h)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: existing } = await supabaseAdmin
      .from('limit_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .eq('notification_type', type)
      .gte('created_at', oneDayAgo.toISOString())
      .limit(1)

    if (existing && existing.length > 0) {
      return // Já existe notificação recente
    }

    // Criar nova notificação
    await supabaseAdmin
      .from('limit_notifications')
      .insert({
        user_id: userId,
        feature_key: featureKey,
        notification_type: type,
        message,
        read: false
      })

    console.log(`📢 Notificação criada: ${type} para ${userId} - ${featureKey}`)
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
  }
}

/**
 * Obter notificações não lidas do usuário
 */
export async function getUnreadNotifications(userId: string): Promise<LimitNotification[]> {
  const { data, error } = await supabaseAdmin
    .from('limit_notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Erro ao buscar notificações:', error)
    return []
  }

  return data || []
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('limit_notifications')
    .update({ read: true })
    .eq('id', notificationId)

  return !error
}

/**
 * Marcar todas notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('limit_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  return !error
}

/**
 * Obter resumo de uso de todas as features do usuário
 */
export async function getUserUsageSummary(userId: string): Promise<UsageStatus[]> {
  try {
    // Buscar features que o usuário tem acesso
    const { data: effectiveFeatures } = await supabaseAdmin
      .rpc('get_effective_features', { p_user_id: userId })

    if (!effectiveFeatures) return []

    const summaries: UsageStatus[] = []

    for (const featureKey of Object.keys(effectiveFeatures)) {
      const status = await checkAndNotifyLimits(userId, featureKey)
      if (status.limite_diario || status.limite_mensal) {
        summaries.push(status)
      }
    }

    return summaries
  } catch (error) {
    console.error('Erro ao buscar resumo de uso:', error)
    return []
  }
}
