/**
 * API de Eventos para Observabilidade
 * ETAPA 15 - Beta com 5 Usuárias
 * 
 * POST: Registrar evento
 * GET: Listar eventos (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// Eventos importantes para rastrear
const TRACKED_EVENTS = [
  'page_view',           // Visualização de página
  'test_started',        // Iniciou teste de clareza
  'test_completed',      // Completou teste de clareza
  'diary_created',       // Criou entrada no diário
  'diary_edited',        // Editou entrada no diário
  'chat_started',        // Iniciou conversa com coach
  'chat_message_sent',   // Enviou mensagem no chat
  'safety_plan_viewed',  // Visualizou plano de segurança
  'export_pdf',          // Exportou PDF
  'login',               // Login
  'signup',              // Cadastro
  'plan_viewed',         // Visualizou planos
  'addon_clicked',       // Clicou em add-on
  'error_occurred',      // Erro ocorreu
  'feedback_sent',       // Enviou feedback
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Eventos podem ser registrados mesmo sem login (para tracking de conversão)
    const body = await request.json()
    const { event_type, event_data, page_path, session_id } = body

    // Validação básica
    if (!event_type) {
      return NextResponse.json(
        { error: 'Tipo de evento é obrigatório' },
        { status: 400 }
      )
    }

    // Inserir evento
    const { error } = await supabase
      .from('beta_events')
      .insert({
        user_id: user?.id || null,
        event_type,
        event_data: event_data || {},
        page_path,
        session_id,
      })

    if (error) {
      // Log silencioso - não queremos quebrar a UX por causa de tracking
      console.error('Erro ao registrar evento:', error)
      // Retorna sucesso mesmo com erro para não afetar UX
      return NextResponse.json({ success: true, tracked: false })
    }

    return NextResponse.json({ success: true, tracked: true })
  } catch (error) {
    console.error('Erro na API de eventos:', error)
    // Retorna sucesso mesmo com erro para não afetar UX
    return NextResponse.json({ success: true, tracked: false })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const event_type = searchParams.get('type')
    const user_id = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const days = parseInt(searchParams.get('days') || '7')

    // Calcular data limite
    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - days)

    let query = supabase
      .from('beta_events')
      .select('*')
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (event_type) {
      query = query.eq('event_type', event_type)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar eventos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar eventos' },
        { status: 500 }
      )
    }

    // Agregar estatísticas
    const stats = {
      total: data?.length || 0,
      by_type: {} as Record<string, number>,
      unique_users: new Set(data?.map(e => e.user_id).filter(Boolean)).size,
    }

    data?.forEach(event => {
      stats.by_type[event.event_type] = (stats.by_type[event.event_type] || 0) + 1
    })

    return NextResponse.json({ 
      events: data,
      stats,
      tracked_events: TRACKED_EVENTS,
    })
  } catch (error) {
    console.error('Erro na API de eventos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
