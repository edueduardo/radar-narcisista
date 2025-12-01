/**
 * ORACULO USAGE LOGS - Logs Detalhados de Uso
 * ETAPA 39 - Sistema de Logging
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ============================================================================
// TIPOS
// ============================================================================

export interface UsageLog {
  id: string
  instance_id: string
  request_id: string
  api_key_id: string | null
  user_role: string | null
  question: string | null
  question_length: number
  response_text: string | null
  response_length: number
  tokens_input: number
  tokens_output: number
  tokens_total: number
  response_time_ms: number | null
  cost_cents: number
  model_used: string | null
  temperature: number | null
  status: 'success' | 'error' | 'rate_limited' | 'quota_exceeded'
  error_message: string | null
  error_code: string | null
  origin_domain: string | null
  origin_ip: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface CreateLogInput {
  instance_id: string
  api_key_id?: string
  user_role?: string
  question?: string
  response_text?: string
  tokens_input?: number
  tokens_output?: number
  response_time_ms?: number
  model_used?: string
  temperature?: number
  status?: UsageLog['status']
  error_message?: string
  error_code?: string
  origin_domain?: string
  origin_ip?: string
  user_agent?: string
  metadata?: Record<string, unknown>
}

export interface DailyStats {
  date: string
  total_requests: number
  successful_requests: number
  failed_requests: number
  rate_limited_requests: number
  total_tokens: number
  total_cost_cents: number
  avg_response_time_ms: number
  avg_tokens_per_request: number
}

export interface LogsFilter {
  instance_id: string
  start_date?: string
  end_date?: string
  status?: UsageLog['status']
  api_key_id?: string
  limit?: number
  offset?: number
}

// ============================================================================
// CLIENTE SUPABASE
// ============================================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase não configurado')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ============================================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================================

/**
 * Gera um ID único para a requisição
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
}

/**
 * Calcula custo estimado baseado em tokens
 */
export function calculateCost(tokensInput: number, tokensOutput: number, model: string): number {
  // Preços aproximados por 1M tokens (em centavos)
  let inputCost: number
  let outputCost: number
  
  if (model.includes('gpt-4')) {
    inputCost = (tokensInput / 1000000) * 3000
    outputCost = (tokensOutput / 1000000) * 6000
  } else {
    inputCost = (tokensInput / 1000000) * 50
    outputCost = (tokensOutput / 1000000) * 150
  }
  
  return Math.round((inputCost + outputCost) * 10000) / 10000
}

// ============================================================================
// FUNÇÕES DE CRUD
// ============================================================================

/**
 * Cria um novo log de uso
 */
export async function createUsageLog(input: CreateLogInput): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const requestId = generateRequestId()
    const tokensTotal = (input.tokens_input || 0) + (input.tokens_output || 0)
    const costCents = calculateCost(
      input.tokens_input || 0,
      input.tokens_output || 0,
      input.model_used || 'gpt-3.5-turbo'
    )
    
    const { data, error } = await supabase
      .from('oraculo_usage_logs')
      .insert({
        instance_id: input.instance_id,
        request_id: requestId,
        api_key_id: input.api_key_id || null,
        user_role: input.user_role || null,
        question: input.question?.slice(0, 5000) || null,
        question_length: input.question?.length || 0,
        response_text: input.response_text?.slice(0, 10000) || null,
        response_length: input.response_text?.length || 0,
        tokens_input: input.tokens_input || 0,
        tokens_output: input.tokens_output || 0,
        tokens_total: tokensTotal,
        response_time_ms: input.response_time_ms || null,
        cost_cents: costCents,
        model_used: input.model_used || null,
        temperature: input.temperature || null,
        status: input.status || 'success',
        error_message: input.error_message || null,
        error_code: input.error_code || null,
        origin_domain: input.origin_domain || null,
        origin_ip: input.origin_ip || null,
        user_agent: input.user_agent?.slice(0, 500) || null,
        metadata: input.metadata || {}
      })
      .select('request_id')
      .single()
    
    if (error) {
      console.error('Erro ao criar log:', error)
      return null
    }
    
    return data?.request_id || requestId
  } catch (error) {
    console.error('Erro ao criar log:', error)
    return null
  }
}

/**
 * Lista logs com filtros
 */
export async function listUsageLogs(filter: LogsFilter): Promise<UsageLog[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    let query = supabase
      .from('oraculo_usage_logs')
      .select('*')
      .eq('instance_id', filter.instance_id)
      .order('created_at', { ascending: false })
    
    if (filter.start_date) {
      query = query.gte('created_at', filter.start_date)
    }
    
    if (filter.end_date) {
      query = query.lte('created_at', filter.end_date)
    }
    
    if (filter.status) {
      query = query.eq('status', filter.status)
    }
    
    if (filter.api_key_id) {
      query = query.eq('api_key_id', filter.api_key_id)
    }
    
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1)
    } else {
      query = query.limit(filter.limit || 50)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao listar logs:', error)
      return []
    }
    
    return data as UsageLog[]
  } catch (error) {
    console.error('Erro ao listar logs:', error)
    return []
  }
}

/**
 * Busca um log por request_id
 */
export async function getLogByRequestId(requestId: string): Promise<UsageLog | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_usage_logs')
      .select('*')
      .eq('request_id', requestId)
      .single()
    
    if (error || !data) return null
    
    return data as UsageLog
  } catch (error) {
    console.error('Erro ao buscar log:', error)
    return null
  }
}

// ============================================================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================================================

/**
 * Busca estatísticas diárias
 */
export async function getDailyStats(instanceId: string, days: number = 30): Promise<DailyStats[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('oraculo_usage_logs')
      .select('created_at, status, tokens_total, cost_cents, response_time_ms')
      .eq('instance_id', instanceId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Erro ao buscar stats:', error)
      return []
    }
    
    // Agregar por dia
    const statsByDay: Record<string, DailyStats> = {}
    
    for (const log of data || []) {
      const date = new Date(log.created_at).toISOString().split('T')[0]
      
      if (!statsByDay[date]) {
        statsByDay[date] = {
          date,
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          rate_limited_requests: 0,
          total_tokens: 0,
          total_cost_cents: 0,
          avg_response_time_ms: 0,
          avg_tokens_per_request: 0
        }
      }
      
      const stats = statsByDay[date]
      stats.total_requests++
      stats.total_tokens += log.tokens_total || 0
      stats.total_cost_cents += parseFloat(log.cost_cents) || 0
      
      if (log.status === 'success') stats.successful_requests++
      else if (log.status === 'error') stats.failed_requests++
      else if (log.status === 'rate_limited') stats.rate_limited_requests++
      
      if (log.response_time_ms) {
        stats.avg_response_time_ms = 
          (stats.avg_response_time_ms * (stats.total_requests - 1) + log.response_time_ms) / stats.total_requests
      }
    }
    
    // Calcular médias finais
    for (const date in statsByDay) {
      const stats = statsByDay[date]
      stats.avg_tokens_per_request = stats.total_requests > 0 
        ? Math.round(stats.total_tokens / stats.total_requests) 
        : 0
      stats.avg_response_time_ms = Math.round(stats.avg_response_time_ms)
      stats.total_cost_cents = Math.round(stats.total_cost_cents * 100) / 100
    }
    
    return Object.values(statsByDay).sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return []
  }
}

/**
 * Busca resumo de uso
 */
export async function getUsageSummary(instanceId: string, periodDays: number = 30): Promise<{
  total_requests: number
  successful_requests: number
  failed_requests: number
  total_tokens: number
  total_cost_cents: number
  avg_response_time_ms: number
  requests_per_day: number
}> {
  try {
    const supabase = getSupabaseAdmin()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    
    const { data, error } = await supabase
      .from('oraculo_usage_logs')
      .select('status, tokens_total, cost_cents, response_time_ms')
      .eq('instance_id', instanceId)
      .gte('created_at', startDate.toISOString())
    
    if (error || !data) {
      return {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        total_tokens: 0,
        total_cost_cents: 0,
        avg_response_time_ms: 0,
        requests_per_day: 0
      }
    }
    
    const totalRequests = data.length
    const successfulRequests = data.filter(l => l.status === 'success').length
    const failedRequests = data.filter(l => l.status === 'error').length
    const totalTokens = data.reduce((sum, l) => sum + (l.tokens_total || 0), 0)
    const totalCost = data.reduce((sum, l) => sum + (parseFloat(l.cost_cents) || 0), 0)
    const avgResponseTime = data.length > 0
      ? data.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / data.length
      : 0
    
    return {
      total_requests: totalRequests,
      successful_requests: successfulRequests,
      failed_requests: failedRequests,
      total_tokens: totalTokens,
      total_cost_cents: Math.round(totalCost * 100) / 100,
      avg_response_time_ms: Math.round(avgResponseTime),
      requests_per_day: Math.round(totalRequests / periodDays * 10) / 10
    }
  } catch (error) {
    console.error('Erro ao buscar resumo:', error)
    return {
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      total_tokens: 0,
      total_cost_cents: 0,
      avg_response_time_ms: 0,
      requests_per_day: 0
    }
  }
}

/**
 * Busca logs recentes com erro
 */
export async function getRecentErrors(instanceId: string, limit: number = 10): Promise<UsageLog[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_usage_logs')
      .select('*')
      .eq('instance_id', instanceId)
      .in('status', ['error', 'rate_limited', 'quota_exceeded'])
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Erro ao buscar erros:', error)
      return []
    }
    
    return data as UsageLog[]
  } catch (error) {
    console.error('Erro ao buscar erros:', error)
    return []
  }
}

/**
 * Conta total de logs
 */
export async function countLogs(instanceId: string, filter?: { status?: string; start_date?: string }): Promise<number> {
  try {
    const supabase = getSupabaseAdmin()
    
    let query = supabase
      .from('oraculo_usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('instance_id', instanceId)
    
    if (filter?.status) {
      query = query.eq('status', filter.status)
    }
    
    if (filter?.start_date) {
      query = query.gte('created_at', filter.start_date)
    }
    
    const { count, error } = await query
    
    if (error) {
      console.error('Erro ao contar logs:', error)
      return 0
    }
    
    return count || 0
  } catch (error) {
    console.error('Erro ao contar logs:', error)
    return 0
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_USAGE_LOGS = {
  generateRequestId,
  calculateCost,
  createUsageLog,
  listUsageLogs,
  getLogByRequestId,
  getDailyStats,
  getUsageSummary,
  getRecentErrors,
  countLogs
}

export default ORACULO_USAGE_LOGS
