/**
 * API: /api/professional/invite/accept
 * ETAPA 12.1.1 - Aceite de Convite pelo Cliente
 * 
 * POST: Cliente aceita convite e define permissões de compartilhamento
 * 
 * Segurança:
 * - Requer autenticação (cliente precisa estar logado)
 * - Atualiza client_id, status e permissões
 * - Garante que convite não seja reutilizado
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para aceitar um convite' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { 
      code, 
      share_clarity_tests,
      share_journal_entries,
      share_chat_summaries,
      share_safety_plan,
      share_risk_alerts
    } = body
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código de convite é obrigatório' },
        { status: 400 }
      )
    }
    
    // Normalizar código
    const normalizedCode = code.trim().toUpperCase()
    
    // Buscar convite
    const { data: invite, error: inviteError } = await supabase
      .from('professional_clients')
      .select('id, professional_id, status, client_id')
      .eq('invite_code', normalizedCode)
      .single()
    
    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se ainda está pendente
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Este convite não está mais disponível' },
        { status: 400 }
      )
    }
    
    // Verificar se o cliente não é o próprio profissional
    if (invite.professional_id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode aceitar seu próprio convite' },
        { status: 400 }
      )
    }
    
    // Verificar se já existe conexão ativa entre este cliente e profissional
    const { data: existingConnection } = await supabase
      .from('professional_clients')
      .select('id, status')
      .eq('professional_id', invite.professional_id)
      .eq('client_id', user.id)
      .neq('id', invite.id)
      .single()
    
    if (existingConnection && existingConnection.status === 'active') {
      return NextResponse.json(
        { error: 'Você já está conectado com este profissional' },
        { status: 400 }
      )
    }
    
    // Atualizar convite com dados do cliente
    const { data: updatedInvite, error: updateError } = await supabase
      .from('professional_clients')
      .update({
        client_id: user.id,
        status: 'active',
        invite_accepted_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        // Permissões escolhidas pelo cliente
        share_clarity_tests: share_clarity_tests ?? true,
        share_journal_entries: share_journal_entries ?? true,
        share_chat_summaries: share_chat_summaries ?? true,
        share_safety_plan: share_safety_plan ?? false,
        share_risk_alerts: share_risk_alerts ?? false
      })
      .eq('id', invite.id)
      .eq('status', 'pending') // Garantir que ainda está pendente
      .select()
      .single()
    
    if (updateError) {
      console.error('Erro ao aceitar convite:', updateError)
      return NextResponse.json(
        { error: 'Erro ao aceitar convite. Tente novamente.' },
        { status: 500 }
      )
    }
    
    if (!updatedInvite) {
      return NextResponse.json(
        { error: 'Convite não pôde ser aceito. Pode já ter sido usado.' },
        { status: 400 }
      )
    }
    
    // Buscar nome do profissional para confirmação
    const { data: professional } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', invite.professional_id)
      .single()
    
    return NextResponse.json({
      success: true,
      message: 'Convite aceito com sucesso!',
      connection: {
        id: updatedInvite.id,
        professionalName: professional?.full_name || 'Profissional',
        permissions: {
          share_clarity_tests: updatedInvite.share_clarity_tests,
          share_journal_entries: updatedInvite.share_journal_entries,
          share_chat_summaries: updatedInvite.share_chat_summaries,
          share_safety_plan: updatedInvite.share_safety_plan,
          share_risk_alerts: updatedInvite.share_risk_alerts
        }
      }
    })
    
  } catch (error) {
    console.error('Erro ao aceitar convite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
