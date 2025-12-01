/**
 * Sistema de Alertas do Oráculo
 * ETAPA 43 - Alertas automáticos
 */

import { createClient } from '@supabase/supabase-js'

// Tipos
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'
export type AlertType = 
  | 'quota_warning'
  | 'quota_exceeded'
  | 'error_spike'
  | 'latency_high'
  | 'api_key_expiring'
  | 'billing_issue'
  | 'instance_inactive'
  | 'webhook_failing'

export interface Alert {
  id: string
  instance_id: string
  alert_type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  metadata?: Record<string, unknown>
  is_read: boolean
  is_resolved: boolean
  created_at: string
  resolved_at?: string
}

export interface AlertRule {
  id: string
  instance_id: string
  alert_type: AlertType
  threshold: number
  is_enabled: boolean
  notification_email?: string
  notification_webhook?: string
}

export interface CreateAlertInput {
  instance_id: string
  alert_type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  metadata?: Record<string, unknown>
}

// Cliente Supabase
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Configurações padrão de alertas
export const DEFAULT_ALERT_THRESHOLDS = {
  quota_warning: 80, // % de uso
  quota_exceeded: 100,
  error_spike: 10, // erros por minuto
  latency_high: 5000, // ms
  api_key_expiring: 7, // dias
}

/**
 * Cria um novo alerta
 */
export async function createAlert(input: CreateAlertInput): Promise<Alert | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('oraculo_alerts')
      .insert({
        instance_id: input.instance_id,
        alert_type: input.alert_type,
        severity: input.severity,
        title: input.title,
        message: input.message,
        metadata: input.metadata || {},
        is_read: false,
        is_resolved: false
      })
      .select()
      .single()

    if (error) throw error
    return data as Alert
  } catch (error) {
    console.error('Erro ao criar alerta:', error)
    return null
  }
}

/**
 * Lista alertas de uma instância
 */
export async function listAlerts(
  instanceId: string,
  options?: {
    unreadOnly?: boolean
    unresolvedOnly?: boolean
    severity?: AlertSeverity
    limit?: number
  }
): Promise<Alert[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  try {
    let query = supabase
      .from('oraculo_alerts')
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: false })

    if (options?.unreadOnly) {
      query = query.eq('is_read', false)
    }
    if (options?.unresolvedOnly) {
      query = query.eq('is_resolved', false)
    }
    if (options?.severity) {
      query = query.eq('severity', options.severity)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as Alert[]
  } catch (error) {
    console.error('Erro ao listar alertas:', error)
    return []
  }
}

/**
 * Marca alerta como lido
 */
export async function markAlertAsRead(alertId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('oraculo_alerts')
      .update({ is_read: true })
      .eq('id', alertId)

    return !error
  } catch {
    return false
  }
}

/**
 * Resolve um alerta
 */
export async function resolveAlert(alertId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('oraculo_alerts')
      .update({ 
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)

    return !error
  } catch {
    return false
  }
}

/**
 * Conta alertas não lidos
 */
export async function countUnreadAlerts(instanceId: string): Promise<number> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return 0

  try {
    const { count, error } = await supabase
      .from('oraculo_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', instanceId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  } catch {
    return 0
  }
}

/**
 * Verifica e cria alertas automáticos para uma instância
 */
export async function checkAndCreateAlerts(instanceId: string): Promise<Alert[]> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return []

  const createdAlerts: Alert[] = []

  try {
    // Buscar dados da instância
    const { data: instance } = await supabase
      .from('oraculo_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (!instance) return []

    // Buscar subscription
    const { data: subscription } = await supabase
      .from('oraculo_instance_subscriptions')
      .select('*, plan:oraculo_instance_plans(*)')
      .eq('instance_id', instanceId)
      .eq('status', 'active')
      .single()

    // 1. Verificar quota de queries
    if (subscription?.plan) {
      const maxQueries = subscription.plan.max_queries_per_month
      const usedQueries = subscription.queries_used || 0
      
      if (maxQueries > 0) {
        const usagePercent = (usedQueries / maxQueries) * 100
        
        // Alerta de 80%
        if (usagePercent >= 80 && usagePercent < 100) {
          const existingAlert = await supabase
            .from('oraculo_alerts')
            .select('id')
            .eq('instance_id', instanceId)
            .eq('alert_type', 'quota_warning')
            .eq('is_resolved', false)
            .single()

          if (!existingAlert.data) {
            const alert = await createAlert({
              instance_id: instanceId,
              alert_type: 'quota_warning',
              severity: 'warning',
              title: 'Quota de queries em 80%',
              message: `Você já usou ${usedQueries.toLocaleString()} de ${maxQueries.toLocaleString()} queries este mês.`,
              metadata: { usagePercent, usedQueries, maxQueries }
            })
            if (alert) createdAlerts.push(alert)
          }
        }
        
        // Alerta de 100%
        if (usagePercent >= 100) {
          const existingAlert = await supabase
            .from('oraculo_alerts')
            .select('id')
            .eq('instance_id', instanceId)
            .eq('alert_type', 'quota_exceeded')
            .eq('is_resolved', false)
            .single()

          if (!existingAlert.data) {
            const alert = await createAlert({
              instance_id: instanceId,
              alert_type: 'quota_exceeded',
              severity: 'critical',
              title: 'Quota de queries excedida!',
              message: `Você atingiu o limite de ${maxQueries.toLocaleString()} queries. Faça upgrade do plano para continuar.`,
              metadata: { usagePercent, usedQueries, maxQueries }
            })
            if (alert) createdAlerts.push(alert)
          }
        }
      }
    }

    // 2. Verificar API keys expirando
    const { data: apiKeys } = await supabase
      .from('oraculo_api_keys')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('status', 'active')
      .not('expires_at', 'is', null)

    if (apiKeys) {
      const now = new Date()
      const warningDays = 7

      for (const key of apiKeys) {
        const expiresAt = new Date(key.expires_at)
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry <= warningDays && daysUntilExpiry > 0) {
          const existingAlert = await supabase
            .from('oraculo_alerts')
            .select('id')
            .eq('instance_id', instanceId)
            .eq('alert_type', 'api_key_expiring')
            .eq('is_resolved', false)
            .contains('metadata', { key_id: key.id })
            .single()

          if (!existingAlert.data) {
            const alert = await createAlert({
              instance_id: instanceId,
              alert_type: 'api_key_expiring',
              severity: 'warning',
              title: `API Key "${key.key_name}" expira em ${daysUntilExpiry} dias`,
              message: `A chave de API "${key.key_name}" irá expirar em ${expiresAt.toLocaleDateString('pt-BR')}.`,
              metadata: { key_id: key.id, key_name: key.key_name, expires_at: key.expires_at, daysUntilExpiry }
            })
            if (alert) createdAlerts.push(alert)
          }
        }
      }
    }

    // 3. Verificar erros recentes (últimas 24h)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: errorCount } = await supabase
      .from('oraculo_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', instanceId)
      .eq('status', 'error')
      .gte('created_at', yesterday.toISOString())

    if (errorCount && errorCount > 50) {
      const existingAlert = await supabase
        .from('oraculo_alerts')
        .select('id')
        .eq('instance_id', instanceId)
        .eq('alert_type', 'error_spike')
        .eq('is_resolved', false)
        .gte('created_at', yesterday.toISOString())
        .single()

      if (!existingAlert.data) {
        const alert = await createAlert({
          instance_id: instanceId,
          alert_type: 'error_spike',
          severity: 'error',
          title: 'Aumento de erros detectado',
          message: `${errorCount} erros nas últimas 24 horas. Verifique os logs para mais detalhes.`,
          metadata: { errorCount, period: '24h' }
        })
        if (alert) createdAlerts.push(alert)
      }
    }

    return createdAlerts
  } catch (error) {
    console.error('Erro ao verificar alertas:', error)
    return []
  }
}

/**
 * Retorna cor e ícone baseado na severidade
 */
export function getAlertStyle(severity: AlertSeverity): { color: string; bgColor: string; icon: string } {
  switch (severity) {
    case 'info':
      return { color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: 'Info' }
    case 'warning':
      return { color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: 'AlertTriangle' }
    case 'error':
      return { color: 'text-red-400', bgColor: 'bg-red-500/20', icon: 'XCircle' }
    case 'critical':
      return { color: 'text-red-500', bgColor: 'bg-red-500/30', icon: 'AlertOctagon' }
    default:
      return { color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: 'Bell' }
  }
}

export default {
  createAlert,
  listAlerts,
  markAlertAsRead,
  resolveAlert,
  countUnreadAlerts,
  checkAndCreateAlerts,
  getAlertStyle,
  DEFAULT_ALERT_THRESHOLDS
}
