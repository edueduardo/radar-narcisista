/**
 * API de Help Desk - Tickets de Suporte
 * ETAPA 34 - BLOCO 32-35
 * 
 * Endpoint central para receber tickets de suporte de todos os projetos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createTicket, CreateTicketInput, listTickets, getTicketStats, ListTicketsParams } from '@/lib/helpdesk-core'
import { getProjectById } from '@/lib/control-tower'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

/**
 * POST - Cria novo ticket de suporte
 * 
 * Body esperado:
 * {
 *   project_id: string (UUID do projeto)
 *   origem: 'usuario_final' | 'profissional' | 'admin_cliente' | 'interno' | 'automatico'
 *   email_contato: string
 *   titulo: string
 *   descricao: string
 *   nome_contato?: string
 *   user_id_local?: string
 *   url_origem?: string
 *   contexto_tecnico?: object
 *   categoria?: 'bug' | 'duvida' | 'sugestao' | 'reclamacao' | 'geral'
 *   prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateTicketInput
    
    // Validar campos obrigatórios
    if (!body.project_id || !body.origem || !body.email_contato || !body.titulo || !body.descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: project_id, origem, email_contato, titulo, descricao' },
        { status: 400 }
      )
    }
    
    // Validar origem
    const origensValidas = ['usuario_final', 'profissional', 'admin_cliente', 'interno', 'automatico']
    if (!origensValidas.includes(body.origem)) {
      return NextResponse.json(
        { error: `origem inválida. Valores aceitos: ${origensValidas.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email_contato)) {
      return NextResponse.json(
        { error: 'email_contato inválido' },
        { status: 400 }
      )
    }
    
    // Verificar se projeto existe
    const project = await getProjectById(body.project_id)
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se projeto está ativo
    if (project.status !== 'ativo') {
      return NextResponse.json(
        { error: 'Projeto não está ativo' },
        { status: 403 }
      )
    }
    
    // Sanitizar contexto técnico
    const contextoSanitizado = sanitizeContext(body.contexto_tecnico || {})
    
    // Criar ticket
    const ticketId = await createTicket({
      ...body,
      contexto_tecnico: contextoSanitizado
    })
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Erro ao criar ticket' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      ticket_id: ticketId,
      message: 'Ticket criado com sucesso. Entraremos em contato em breve.'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de tickets:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar ticket' },
      { status: 500 }
    )
  }
}

/**
 * GET - Lista tickets (apenas para admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    const role = (profile as { role?: string } | null)?.role
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    // Obter parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id') || undefined
    const status = searchParams.get('status') as ListTicketsParams['status'] || undefined
    const prioridade = searchParams.get('prioridade') as ListTicketsParams['prioridade'] || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Buscar tickets e estatísticas
    const [tickets, stats] = await Promise.all([
      listTickets({ project_id: projectId, status, prioridade, limit, offset }),
      getTicketStats()
    ])
    
    return NextResponse.json({
      success: true,
      tickets,
      stats
    })
    
  } catch (error) {
    console.error('Erro ao listar tickets:', error)
    return NextResponse.json(
      { error: 'Erro ao listar tickets' },
      { status: 500 }
    )
  }
}

/**
 * Sanitiza o contexto removendo dados potencialmente sensíveis
 */
function sanitizeContext(contexto: Record<string, unknown>): Record<string, unknown> {
  const camposSensiveis = [
    'password', 'senha', 'token', 'api_key', 'apikey', 'secret',
    'authorization', 'auth', 'cookie', 'session', 'credit_card',
    'cpf', 'cnpj', 'telefone', 'endereco', 'address'
  ]
  
  const sanitizado: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(contexto)) {
    const keyLower = key.toLowerCase()
    
    const isSensitive = camposSensiveis.some(campo => keyLower.includes(campo))
    
    if (isSensitive) {
      sanitizado[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitizado[key] = sanitizeContext(value as Record<string, unknown>)
    } else {
      sanitizado[key] = value
    }
  }
  
  return sanitizado
}
