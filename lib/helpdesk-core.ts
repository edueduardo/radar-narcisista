/**
 * HELP DESK CORE - Sistema de Tickets Global
 * ETAPA 34 - BLOCO 32-35
 * 
 * Este módulo gerencia:
 * - Criação de tickets de suporte
 * - Listagem e filtros de tickets
 * - Mensagens nos tickets
 * - Estatísticas de suporte
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TIPOS
// ============================================================================

export type TicketOrigem = 'usuario_final' | 'profissional' | 'admin_cliente' | 'interno' | 'automatico'
export type TicketCategoria = 'bug' | 'duvida' | 'sugestao' | 'reclamacao' | 'geral'
export type TicketStatus = 'aberto' | 'em_andamento' | 'aguardando_usuario' | 'resolvido' | 'fechado'
export type TicketPrioridade = 'baixa' | 'media' | 'alta' | 'critica'
export type MensagemAutorTipo = 'usuario' | 'suporte' | 'sistema'

export interface SupportTicket {
  id: string
  project_id: string
  project_nome?: string
  origem: TicketOrigem
  user_id_local: string | null
  email_contato: string
  nome_contato: string | null
  titulo: string
  descricao: string
  url_origem: string | null
  contexto_tecnico: Record<string, unknown>
  categoria: TicketCategoria
  status: TicketStatus
  prioridade: TicketPrioridade
  atribuido_a: string | null
  resolucao: string | null
  resolvido_em: string | null
  criado_em: string
  atualizado_em: string
  total_mensagens?: number
}

export interface TicketMessage {
  id: string
  ticket_id: string
  autor_tipo: MensagemAutorTipo
  autor_email: string | null
  autor_nome: string | null
  mensagem: string
  anexos: unknown[]
  interno: boolean
  criado_em: string
}

export interface CreateTicketInput {
  project_id: string
  origem: TicketOrigem
  email_contato: string
  titulo: string
  descricao: string
  nome_contato?: string
  user_id_local?: string
  url_origem?: string
  contexto_tecnico?: Record<string, unknown>
  categoria?: TicketCategoria
  prioridade?: TicketPrioridade
}

export interface TicketStats {
  total: number
  abertos: number
  em_andamento: number
  aguardando_usuario: number
  resolvidos: number
  fechados: number
  criticos: number
  altos: number
}

export interface ListTicketsParams {
  project_id?: string
  status?: TicketStatus
  prioridade?: TicketPrioridade
  limit?: number
  offset?: number
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
// FUNÇÕES DE TICKETS
// ============================================================================

/**
 * Cria um novo ticket de suporte
 */
export async function createTicket(input: CreateTicketInput): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('create_support_ticket', {
      p_project_id: input.project_id,
      p_origem: input.origem,
      p_email_contato: input.email_contato,
      p_titulo: input.titulo,
      p_descricao: input.descricao,
      p_nome_contato: input.nome_contato || null,
      p_user_id_local: input.user_id_local || null,
      p_url_origem: input.url_origem || null,
      p_contexto_tecnico: input.contexto_tecnico || {},
      p_categoria: input.categoria || 'geral',
      p_prioridade: input.prioridade || 'media'
    })
    
    if (error) {
      console.error('Erro ao criar ticket:', error)
      return null
    }
    
    return data as string
  } catch (error) {
    console.error('Erro ao criar ticket:', error)
    return null
  }
}

/**
 * Busca um ticket pelo ID
 */
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('support_tickets_core')
      .select(`
        *,
        projects_core (nome_publico)
      `)
      .eq('id', ticketId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return {
      ...data,
      project_nome: data.projects_core?.nome_publico
    } as SupportTicket
  } catch (error) {
    console.error('Erro ao buscar ticket:', error)
    return null
  }
}

/**
 * Lista tickets com filtros
 */
export async function listTickets(params: ListTicketsParams = {}): Promise<SupportTicket[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('list_tickets', {
      p_project_id: params.project_id || null,
      p_status: params.status || null,
      p_prioridade: params.prioridade || null,
      p_limit: params.limit || 50,
      p_offset: params.offset || 0
    })
    
    if (error) {
      console.error('Erro ao listar tickets:', error)
      return []
    }
    
    return data as SupportTicket[]
  } catch (error) {
    console.error('Erro ao listar tickets:', error)
    return []
  }
}

/**
 * Atualiza status de um ticket
 */
export async function updateTicketStatus(
  ticketId: string, 
  status: TicketStatus,
  resolucao?: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const updates: Record<string, unknown> = { status }
    
    if (status === 'resolvido' || status === 'fechado') {
      updates.resolvido_em = new Date().toISOString()
      if (resolucao) {
        updates.resolucao = resolucao
      }
    }
    
    const { error } = await supabase
      .from('support_tickets_core')
      .update(updates)
      .eq('id', ticketId)
    
    if (error) {
      console.error('Erro ao atualizar status:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return false
  }
}

/**
 * Atualiza prioridade de um ticket
 */
export async function updateTicketPriority(
  ticketId: string, 
  prioridade: TicketPrioridade
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('support_tickets_core')
      .update({ prioridade })
      .eq('id', ticketId)
    
    if (error) {
      console.error('Erro ao atualizar prioridade:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar prioridade:', error)
    return false
  }
}

/**
 * Atribui ticket a um responsável
 */
export async function assignTicket(
  ticketId: string, 
  atribuido_a: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('support_tickets_core')
      .update({ 
        atribuido_a,
        status: 'em_andamento'
      })
      .eq('id', ticketId)
    
    if (error) {
      console.error('Erro ao atribuir ticket:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atribuir ticket:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE MENSAGENS
// ============================================================================

/**
 * Adiciona mensagem a um ticket
 */
export async function addTicketMessage(
  ticketId: string,
  autorTipo: MensagemAutorTipo,
  mensagem: string,
  autorEmail?: string,
  autorNome?: string,
  interno: boolean = false
): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('add_ticket_message', {
      p_ticket_id: ticketId,
      p_autor_tipo: autorTipo,
      p_mensagem: mensagem,
      p_autor_email: autorEmail || null,
      p_autor_nome: autorNome || null,
      p_interno: interno
    })
    
    if (error) {
      console.error('Erro ao adicionar mensagem:', error)
      return null
    }
    
    return data as string
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error)
    return null
  }
}

/**
 * Lista mensagens de um ticket
 */
export async function listTicketMessages(
  ticketId: string,
  incluirInternas: boolean = true
): Promise<TicketMessage[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    let query = supabase
      .from('support_ticket_messages_core')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('criado_em', { ascending: true })
    
    if (!incluirInternas) {
      query = query.eq('interno', false)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao listar mensagens:', error)
      return []
    }
    
    return data as TicketMessage[]
  } catch (error) {
    console.error('Erro ao listar mensagens:', error)
    return []
  }
}

// ============================================================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================================================

/**
 * Obtém estatísticas gerais de tickets
 */
export async function getTicketStats(): Promise<TicketStats> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('get_ticket_stats')
    
    if (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {
        total: 0,
        abertos: 0,
        em_andamento: 0,
        aguardando_usuario: 0,
        resolvidos: 0,
        fechados: 0,
        criticos: 0,
        altos: 0
      }
    }
    
    return data as TicketStats
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return {
      total: 0,
      abertos: 0,
      em_andamento: 0,
      aguardando_usuario: 0,
      resolvidos: 0,
      fechados: 0,
      criticos: 0,
      altos: 0
    }
  }
}

/**
 * Obtém estatísticas de tickets por projeto
 */
export async function getTicketStatsByProject(projectId: string): Promise<TicketStats> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('support_tickets_core')
      .select('status, prioridade')
      .eq('project_id', projectId)
    
    if (error || !data) {
      return {
        total: 0,
        abertos: 0,
        em_andamento: 0,
        aguardando_usuario: 0,
        resolvidos: 0,
        fechados: 0,
        criticos: 0,
        altos: 0
      }
    }
    
    const stats: TicketStats = {
      total: data.length,
      abertos: 0,
      em_andamento: 0,
      aguardando_usuario: 0,
      resolvidos: 0,
      fechados: 0,
      criticos: 0,
      altos: 0
    }
    
    for (const ticket of data) {
      switch (ticket.status) {
        case 'aberto': stats.abertos++; break
        case 'em_andamento': stats.em_andamento++; break
        case 'aguardando_usuario': stats.aguardando_usuario++; break
        case 'resolvido': stats.resolvidos++; break
        case 'fechado': stats.fechados++; break
      }
      
      if (ticket.status !== 'resolvido' && ticket.status !== 'fechado') {
        if (ticket.prioridade === 'critica') stats.criticos++
        if (ticket.prioridade === 'alta') stats.altos++
      }
    }
    
    return stats
  } catch (error) {
    console.error('Erro ao obter estatísticas por projeto:', error)
    return {
      total: 0,
      abertos: 0,
      em_andamento: 0,
      aguardando_usuario: 0,
      resolvidos: 0,
      fechados: 0,
      criticos: 0,
      altos: 0
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const HELPDESK_CORE = {
  // Tickets
  createTicket,
  getTicketById,
  listTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  // Mensagens
  addTicketMessage,
  listTicketMessages,
  // Estatísticas
  getTicketStats,
  getTicketStatsByProject
}

export default HELPDESK_CORE
