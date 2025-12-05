/**
 * API: /api/client/connections/[id]
 * ETAPA 12.1.2 - Gestão de Conexão Específica pelo Cliente
 * 
 * Endpoints:
 * - PATCH: Atualizar status ou permissões da conexão
 * 
 * Ações permitidas ao cliente:
 * - Revogar acesso (status → 'revoked')
 * - Pausar acesso (status → 'paused')
 * - Retomar acesso (status → 'active')
 * - Alterar permissões (share_*)
 * 
 * Segurança:
 * - Requer autenticação
 * - Cliente só pode alterar suas próprias conexões
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// PATCH: Atualizar conexão (status ou permissões)
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
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar se a conexão pertence ao cliente
    const { data: connection, error: connError } = await supabase
      .from('professional_clients')
      .select('id, status, client_id')
      .eq('id', id)
      .eq('client_id', user.id)
      .single()
    
    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Conexão não encontrada' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const { 
      action,
      share_clarity_tests,
      share_journal_entries,
      share_chat_summaries,
      share_safety_plan,
      share_risk_alerts
    } = body
    
    // Preparar dados de atualização
    const updateData: Record<string, unknown> = {}
    
    // Ações de status
    if (action === 'revoke') {
      updateData.status = 'revoked'
      // Opcionalmente zerar permissões ao revogar
      updateData.share_clarity_tests = false
      updateData.share_journal_entries = false
      updateData.share_chat_summaries = false
      updateData.share_safety_plan = false
      updateData.share_risk_alerts = false
    } else if (action === 'pause') {
      if (connection.status !== 'active') {
        return NextResponse.json(
          { error: 'Só é possível pausar conexões ativas' },
          { status: 400 }
        )
      }
      updateData.status = 'paused'
    } else if (action === 'resume') {
      if (connection.status !== 'paused') {
        return NextResponse.json(
          { error: 'Só é possível retomar conexões pausadas' },
          { status: 400 }
        )
      }
      updateData.status = 'active'
    } else if (action === 'update_permissions') {
      // Atualizar permissões individuais
      if (share_clarity_tests !== undefined) {
        updateData.share_clarity_tests = share_clarity_tests
      }
      if (share_journal_entries !== undefined) {
        updateData.share_journal_entries = share_journal_entries
      }
      if (share_chat_summaries !== undefined) {
        updateData.share_chat_summaries = share_chat_summaries
      }
      if (share_safety_plan !== undefined) {
        updateData.share_safety_plan = share_safety_plan
      }
      if (share_risk_alerts !== undefined) {
        updateData.share_risk_alerts = share_risk_alerts
      }
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use: revoke, pause, resume ou update_permissions' },
        { status: 400 }
      )
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma alteração solicitada' },
        { status: 400 }
      )
    }
    
    // Executar atualização
    const { data: updated, error: updateError } = await supabase
      .from('professional_clients')
      .update(updateData)
      .eq('id', id)
      .eq('client_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar conexão:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar conexão' },
        { status: 500 }
      )
    }
    
    // Mensagens de sucesso por ação
    const messages: Record<string, string> = {
      'revoke': 'Acesso revogado com sucesso',
      'pause': 'Acesso pausado temporariamente',
      'resume': 'Acesso retomado com sucesso',
      'update_permissions': 'Permissões atualizadas com sucesso'
    }
    
    return NextResponse.json({
      success: true,
      message: messages[action] || 'Conexão atualizada',
      connection: updated
    })
    
  } catch (error) {
    console.error('Erro ao atualizar conexão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
