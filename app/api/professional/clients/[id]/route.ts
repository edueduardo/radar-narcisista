/**
 * API: /api/professional/clients/[id]
 * ETAPA 12.1 - Operações em cliente específico
 * 
 * Endpoints:
 * - GET: Detalhes de um cliente
 * - PATCH: Atualizar notas/status
 * - DELETE: Remover cliente (apenas pendentes)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// Verificar se usuário tem plano profissional
async function checkProfessionalAccess(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, subscription_status')
    .eq('id', userId)
    .single()
  
  if (!profile) return false
  
  const p = profile as { plan_id?: string; subscription_status?: string }
  return p.plan_id === 'profissional' || p.subscription_status === 'professional'
}

// GET: Detalhes de um cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar plano profissional
    if (!(await checkProfessionalAccess(supabase, user.id))) {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
    }
    
    // Buscar cliente (RLS garante que só vê os próprios)
    const { data: client, error } = await supabase
      .from('professional_clients')
      .select('*')
      .eq('id', id)
      .eq('professional_id', user.id)
      .single()
    
    if (error || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }
    
    // Se ativo, buscar dados agregados do cliente
    let clientData = null
    if (client.status === 'active') {
      const [clarityTests, journalEntries, chatSessions] = await Promise.all([
        // Testes de clareza (se autorizado)
        client.share_clarity_tests
          ? supabase
              .from('clarity_tests')
              .select('id, created_at, global_zone')
              .eq('user_id', client.client_id)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] }),
        
        // Entradas do diário (se autorizado)
        client.share_journal_entries
          ? supabase
              .from('journal_entries')
              .select('id, created_at, title, mood_intensity, entry_type')
              .eq('user_id', client.client_id)
              .is('deleted_at', null)
              .order('created_at', { ascending: false })
              .limit(10)
          : Promise.resolve({ data: [] }),
        
        // Sessões de chat (se autorizado)
        client.share_chat_summaries
          ? supabase
              .from('ai_chat_sessions')
              .select('id, created_at, name')
              .eq('user_id', client.client_id)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [] })
      ])
      
      clientData = {
        clarityTests: clarityTests.data || [],
        journalEntries: journalEntries.data || [],
        chatSessions: chatSessions.data || []
      }
    }
    
    return NextResponse.json({
      success: true,
      client: {
        ...client,
        data: clientData
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH: Atualizar cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar plano profissional
    if (!(await checkProfessionalAccess(supabase, user.id))) {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
    }
    
    const body = await request.json()
    const { client_display_name, professional_notes, status } = body
    
    // Campos permitidos para atualização pelo profissional
    const updateData: Record<string, unknown> = {}
    
    if (client_display_name !== undefined) {
      updateData.client_display_name = client_display_name
    }
    
    if (professional_notes !== undefined) {
      updateData.professional_notes = professional_notes
    }
    
    // Profissional só pode pausar, não pode ativar ou revogar (isso é do cliente)
    if (status === 'paused') {
      updateData.status = 'paused'
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }
    
    const { data: updated, error } = await supabase
      .from('professional_clients')
      .update(updateData)
      .eq('id', id)
      .eq('professional_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar cliente:', error)
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      client: updated
    })
    
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE: Remover convite pendente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar plano profissional
    if (!(await checkProfessionalAccess(supabase, user.id))) {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
    }
    
    // Só pode deletar convites pendentes
    const { error } = await supabase
      .from('professional_clients')
      .delete()
      .eq('id', id)
      .eq('professional_id', user.id)
      .eq('status', 'pending')
    
    if (error) {
      console.error('Erro ao deletar:', error)
      return NextResponse.json({ error: 'Erro ao deletar ou cliente não é pendente' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Convite removido'
    })
    
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
