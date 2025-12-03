/**
 * IMPERSONATION - Sistema de "Ver Como" com Auditoria
 * ETAPA 36 - BLOCO 36-40
 * 
 * MÓDULO CORE: SUPORTE_VER_COMO_CORE
 * 
 * Este módulo permite que ADMIN veja o sistema como outro usuário
 * para fins de suporte, mantendo auditoria completa.
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TIPOS
// ============================================================================

export type ImpersonationStatus = 'ativa' | 'encerrada' | 'expirada'
export type ImpersonationActionType = 
  | 'session_start' 
  | 'session_end' 
  | 'page_view' 
  | 'api_call' 
  | 'form_submit'
  | 'data_view'
  | 'action'

export interface ImpersonationSession {
  id: string
  admin_id: string
  admin_email: string
  target_user_id: string
  target_user_email: string
  target_user_role: string
  motivo: string
  ticket_id: string | null
  ip_admin: string | null
  user_agent: string | null
  status: ImpersonationStatus
  inicio: string
  fim: string | null
  duracao_segundos: number | null
  acoes_realizadas: unknown[]
  created_at: string
  total_acoes?: number
}

export interface ImpersonationLog {
  id: string
  session_id: string
  tipo_acao: ImpersonationActionType
  descricao: string
  url: string | null
  metodo: string | null
  dados_resumidos: Record<string, unknown>
  sucesso: boolean
  erro: string | null
  created_at: string
}

export interface StartSessionInput {
  admin_id: string
  admin_email: string
  target_user_id: string
  target_user_email: string
  target_user_role: string
  motivo: string
  ip_admin?: string
  user_agent?: string
  ticket_id?: string
}

export interface LogActionInput {
  session_id: string
  tipo_acao: ImpersonationActionType
  descricao: string
  url?: string
  metodo?: string
  dados_resumidos?: Record<string, unknown>
  sucesso?: boolean
  erro?: string
}

export interface ActiveSession {
  id: string
  target_user_id: string
  target_user_email: string
  target_user_role: string
  motivo: string
  inicio: string
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
// FUNÇÕES DE SESSÃO
// ============================================================================

/**
 * Inicia uma sessão de impersonação
 */
export async function startImpersonationSession(input: StartSessionInput): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('start_impersonation_session', {
      p_admin_id: input.admin_id,
      p_admin_email: input.admin_email,
      p_target_user_id: input.target_user_id,
      p_target_user_email: input.target_user_email,
      p_target_user_role: input.target_user_role,
      p_motivo: input.motivo,
      p_ip_admin: input.ip_admin || null,
      p_user_agent: input.user_agent || null,
      p_ticket_id: input.ticket_id || null
    })
    
    if (error) {
      console.error('Erro ao iniciar sessão de impersonação:', error)
      return null
    }
    
    return data as string
  } catch (error) {
    console.error('Erro ao iniciar sessão de impersonação:', error)
    return null
  }
}

/**
 * Encerra uma sessão de impersonação
 */
export async function endImpersonationSession(sessionId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('end_impersonation_session', {
      p_session_id: sessionId
    })
    
    if (error) {
      console.error('Erro ao encerrar sessão:', error)
      return false
    }
    
    return data as boolean
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error)
    return false
  }
}

/**
 * Obtém sessão ativa de um admin
 */
export async function getActiveSession(adminId: string): Promise<ActiveSession | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('get_active_impersonation_session', {
      p_admin_id: adminId
    })
    
    if (error || !data) {
      return null
    }
    
    return data as ActiveSession
  } catch (error) {
    console.error('Erro ao obter sessão ativa:', error)
    return null
  }
}

/**
 * Lista sessões de impersonação
 */
export async function listSessions(params: {
  limit?: number
  offset?: number
  admin_id?: string
  target_user_id?: string
  status?: ImpersonationStatus
} = {}): Promise<ImpersonationSession[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('list_impersonation_sessions', {
      p_limit: params.limit || 50,
      p_offset: params.offset || 0,
      p_admin_id: params.admin_id || null,
      p_target_user_id: params.target_user_id || null,
      p_status: params.status || null
    })
    
    if (error) {
      console.error('Erro ao listar sessões:', error)
      return []
    }
    
    return data as ImpersonationSession[]
  } catch (error) {
    console.error('Erro ao listar sessões:', error)
    return []
  }
}

/**
 * Busca sessão por ID
 */
export async function getSessionById(sessionId: string): Promise<ImpersonationSession | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('support_impersonation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as ImpersonationSession
  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return null
  }
}

// ============================================================================
// FUNÇÕES DE LOG
// ============================================================================

/**
 * Registra ação durante impersonação
 */
export async function logAction(input: LogActionInput): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('log_impersonation_action', {
      p_session_id: input.session_id,
      p_tipo_acao: input.tipo_acao,
      p_descricao: input.descricao,
      p_url: input.url || null,
      p_metodo: input.metodo || null,
      p_dados_resumidos: input.dados_resumidos || {},
      p_sucesso: input.sucesso !== false,
      p_erro: input.erro || null
    })
    
    if (error) {
      console.error('Erro ao registrar ação:', error)
      return null
    }
    
    return data as string
  } catch (error) {
    console.error('Erro ao registrar ação:', error)
    return null
  }
}

/**
 * Lista logs de uma sessão
 */
export async function listSessionLogs(sessionId: string): Promise<ImpersonationLog[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('support_impersonation_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Erro ao listar logs:', error)
      return []
    }
    
    return data as ImpersonationLog[]
  } catch (error) {
    console.error('Erro ao listar logs:', error)
    return []
  }
}

// ============================================================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================================================

/**
 * Obtém estatísticas de impersonação
 */
export async function getImpersonationStats(): Promise<{
  total_sessoes: number
  sessoes_ativas: number
  sessoes_hoje: number
  total_acoes: number
}> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Total de sessões
    const { count: totalSessoes } = await supabase
      .from('support_impersonation_sessions')
      .select('*', { count: 'exact', head: true })
    
    // Sessões ativas
    const { count: sessoesAtivas } = await supabase
      .from('support_impersonation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativa')
    
    // Sessões hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const { count: sessoesHoje } = await supabase
      .from('support_impersonation_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('inicio', hoje.toISOString())
    
    // Total de ações
    const { count: totalAcoes } = await supabase
      .from('support_impersonation_logs')
      .select('*', { count: 'exact', head: true })
    
    return {
      total_sessoes: totalSessoes || 0,
      sessoes_ativas: sessoesAtivas || 0,
      sessoes_hoje: sessoesHoje || 0,
      total_acoes: totalAcoes || 0
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return {
      total_sessoes: 0,
      sessoes_ativas: 0,
      sessoes_hoje: 0,
      total_acoes: 0
    }
  }
}

// ============================================================================
// COOKIE/TOKEN HELPERS
// ============================================================================

/**
 * Nome do cookie de sessão de impersonação
 */
export const IMPERSONATION_COOKIE_NAME = 'radar_impersonation_session'

/**
 * Gera token de impersonação (para uso em cookies)
 */
export function generateImpersonationToken(sessionId: string, targetUserId: string): string {
  const payload = {
    sid: sessionId,
    tuid: targetUserId,
    ts: Date.now()
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Decodifica token de impersonação
 */
export function decodeImpersonationToken(token: string): {
  sessionId: string
  targetUserId: string
  timestamp: number
} | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    return {
      sessionId: decoded.sid,
      targetUserId: decoded.tuid,
      timestamp: decoded.ts
    }
  } catch {
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const IMPERSONATION = {
  // Sessões
  startSession: startImpersonationSession,
  endSession: endImpersonationSession,
  getActiveSession,
  listSessions,
  getSessionById,
  // Logs
  logAction,
  listSessionLogs,
  // Stats
  getStats: getImpersonationStats,
  // Helpers
  COOKIE_NAME: IMPERSONATION_COOKIE_NAME,
  generateToken: generateImpersonationToken,
  decodeToken: decodeImpersonationToken
}

export default IMPERSONATION
