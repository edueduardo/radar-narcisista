/**
 * TELEMETRY CORE - Sistema de Monitoramento Global
 * ETAPA 33 - BLOCO 32-35
 * 
 * Este módulo gerencia:
 * - Heartbeats de todos os projetos
 * - Registro de erros
 * - Métricas agregadas
 * - Resumo de telemetria para Control Tower
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TIPOS
// ============================================================================

export type TelemetryStatus = 'healthy' | 'degraded' | 'down'
export type TelemetryAmbiente = 'dev' | 'staging' | 'prod'
export type TelemetryErrorType = 'api' | 'banco' | 'third_party' | 'front_end' | 'auth' | 'unknown'
export type TelemetrySeverity = 'baixo' | 'medio' | 'alto' | 'critico'

export interface TelemetryHeartbeat {
  id: string
  project_id: string
  core_version: string
  ambiente: TelemetryAmbiente
  status: TelemetryStatus
  info_resumida: Record<string, unknown>
  latency_ms: number | null
  memory_usage_mb: number | null
  cpu_usage_percent: number | null
  requests_last_hour: number
  errors_last_hour: number
  active_users: number
  created_at: string
}

export interface TelemetryError {
  id: string
  project_id: string
  tipo_erro: TelemetryErrorType
  codigo_erro: string | null
  mensagem_resumida: string
  contexto: Record<string, unknown>
  nivel_severidade: TelemetrySeverity
  error_hash: string | null
  ocorrencias: number
  resolvido: boolean
  resolvido_em: string | null
  notas_resolucao: string | null
  created_at: string
}

export interface TelemetrySummary {
  project_id: string
  project_slug: string
  project_nome: string
  ultimo_heartbeat: string | null
  ultimo_status: TelemetryStatus | null
  total_erros_24h: number
  erros_criticos_24h: number
}

export interface HeartbeatInput {
  project_id: string
  core_version: string
  ambiente: TelemetryAmbiente
  status: TelemetryStatus
  info_resumida?: Record<string, unknown>
  latency_ms?: number
  memory_usage_mb?: number
  requests_last_hour?: number
  errors_last_hour?: number
  active_users?: number
}

export interface ErrorInput {
  project_id: string
  tipo_erro: TelemetryErrorType
  mensagem_resumida: string
  nivel_severidade: TelemetrySeverity
  codigo_erro?: string
  contexto?: Record<string, unknown>
}

// ============================================================================
// CLIENTE SUPABASE ADMIN
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
// FUNÇÕES DE HEARTBEAT
// ============================================================================

/**
 * Registra um heartbeat de um projeto
 */
export async function registerHeartbeat(input: HeartbeatInput): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('register_heartbeat', {
      p_project_id: input.project_id,
      p_core_version: input.core_version,
      p_ambiente: input.ambiente,
      p_status: input.status,
      p_info_resumida: input.info_resumida || {},
      p_latency_ms: input.latency_ms || null,
      p_memory_usage_mb: input.memory_usage_mb || null,
      p_requests_last_hour: input.requests_last_hour || 0,
      p_errors_last_hour: input.errors_last_hour || 0,
      p_active_users: input.active_users || 0
    })
    
    if (error) {
      console.error('Erro ao registrar heartbeat:', error)
      return null
    }
    
    return data as string
  } catch (error) {
    console.error('Erro ao registrar heartbeat:', error)
    return null
  }
}

/**
 * Obtém o último heartbeat de um projeto
 */
export async function getLastHeartbeat(projectId: string): Promise<TelemetryHeartbeat | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('telemetry_heartbeats_core')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as TelemetryHeartbeat
  } catch (error) {
    console.error('Erro ao buscar último heartbeat:', error)
    return null
  }
}

/**
 * Lista heartbeats recentes de um projeto
 */
export async function listRecentHeartbeats(
  projectId: string, 
  limit: number = 24
): Promise<TelemetryHeartbeat[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('telemetry_heartbeats_core')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Erro ao listar heartbeats:', error)
      return []
    }
    
    return data as TelemetryHeartbeat[]
  } catch (error) {
    console.error('Erro ao listar heartbeats:', error)
    return []
  }
}

// ============================================================================
// FUNÇÕES DE ERROS
// ============================================================================

/**
 * Registra um erro de telemetria
 */
export async function registerError(input: ErrorInput): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('register_telemetry_error', {
      p_project_id: input.project_id,
      p_tipo_erro: input.tipo_erro,
      p_mensagem_resumida: input.mensagem_resumida,
      p_nivel_severidade: input.nivel_severidade,
      p_codigo_erro: input.codigo_erro || null,
      p_contexto: input.contexto || {}
    })
    
    if (error) {
      console.error('Erro ao registrar erro de telemetria:', error)
      return null
    }
    
    return data as string
  } catch (error) {
    console.error('Erro ao registrar erro de telemetria:', error)
    return null
  }
}

/**
 * Lista erros recentes de um projeto
 */
export async function listRecentErrors(
  projectId: string, 
  limit: number = 50
): Promise<TelemetryError[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('telemetry_errors_core')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Erro ao listar erros:', error)
      return []
    }
    
    return data as TelemetryError[]
  } catch (error) {
    console.error('Erro ao listar erros:', error)
    return []
  }
}

/**
 * Lista erros não resolvidos de um projeto
 */
export async function listUnresolvedErrors(projectId: string): Promise<TelemetryError[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('telemetry_errors_core')
      .select('*')
      .eq('project_id', projectId)
      .eq('resolvido', false)
      .order('nivel_severidade', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao listar erros não resolvidos:', error)
      return []
    }
    
    return data as TelemetryError[]
  } catch (error) {
    console.error('Erro ao listar erros não resolvidos:', error)
    return []
  }
}

/**
 * Marca um erro como resolvido
 */
export async function resolveError(
  errorId: string, 
  notas?: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('telemetry_errors_core')
      .update({
        resolvido: true,
        resolvido_em: new Date().toISOString(),
        notas_resolucao: notas || null
      })
      .eq('id', errorId)
    
    if (error) {
      console.error('Erro ao resolver erro:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao resolver erro:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE RESUMO
// ============================================================================

/**
 * Obtém resumo de telemetria de todos os projetos
 */
export async function getTelemetrySummary(): Promise<TelemetrySummary[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('get_telemetry_summary')
    
    if (error) {
      console.error('Erro ao obter resumo de telemetria:', error)
      return []
    }
    
    return data as TelemetrySummary[]
  } catch (error) {
    console.error('Erro ao obter resumo de telemetria:', error)
    return []
  }
}

/**
 * Calcula status geral baseado no último heartbeat
 */
export function calculateOverallStatus(
  lastHeartbeat: TelemetryHeartbeat | null,
  maxAgeMinutes: number = 5
): TelemetryStatus {
  if (!lastHeartbeat) {
    return 'down'
  }
  
  const heartbeatAge = Date.now() - new Date(lastHeartbeat.created_at).getTime()
  const maxAgeMs = maxAgeMinutes * 60 * 1000
  
  if (heartbeatAge > maxAgeMs) {
    return 'down'
  }
  
  return lastHeartbeat.status
}

/**
 * Obtém estatísticas de telemetria para a Control Tower
 */
export async function getTelemetryStats(): Promise<{
  total_projetos_monitorados: number
  projetos_healthy: number
  projetos_degraded: number
  projetos_down: number
  total_erros_24h: number
  erros_criticos_24h: number
}> {
  try {
    const summary = await getTelemetrySummary()
    
    const stats = {
      total_projetos_monitorados: summary.length,
      projetos_healthy: 0,
      projetos_degraded: 0,
      projetos_down: 0,
      total_erros_24h: 0,
      erros_criticos_24h: 0
    }
    
    for (const project of summary) {
      if (project.ultimo_status === 'healthy') {
        stats.projetos_healthy++
      } else if (project.ultimo_status === 'degraded') {
        stats.projetos_degraded++
      } else {
        stats.projetos_down++
      }
      
      stats.total_erros_24h += project.total_erros_24h
      stats.erros_criticos_24h += project.erros_criticos_24h
    }
    
    return stats
  } catch (error) {
    console.error('Erro ao obter estatísticas de telemetria:', error)
    return {
      total_projetos_monitorados: 0,
      projetos_healthy: 0,
      projetos_degraded: 0,
      projetos_down: 0,
      total_erros_24h: 0,
      erros_criticos_24h: 0
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TELEMETRY_CORE = {
  // Heartbeats
  registerHeartbeat,
  getLastHeartbeat,
  listRecentHeartbeats,
  // Erros
  registerError,
  listRecentErrors,
  listUnresolvedErrors,
  resolveError,
  // Resumo
  getTelemetrySummary,
  calculateOverallStatus,
  getTelemetryStats
}

export default TELEMETRY_CORE
