/**
 * API: /api/professional/invite/validate
 * ETAPA 12.1.1 - Validação de Código de Convite
 * 
 * POST: Valida se um código de convite existe e está pendente
 * 
 * Segurança:
 * - Não requer autenticação (para permitir validação antes do login)
 * - Retorna apenas informações básicas do profissional
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código de convite é obrigatório' },
        { status: 400 }
      )
    }
    
    // Normalizar código (uppercase, sem espaços)
    const normalizedCode = code.trim().toUpperCase()
    
    const supabase = await createRouteHandlerClient()
    
    // Buscar convite pelo código
    // Nota: Usamos service role ou query direta pois RLS pode bloquear
    // Para contornar RLS, buscamos apenas campos não-sensíveis
    const { data: invite, error: inviteError } = await supabase
      .from('professional_clients')
      .select('id, professional_id, status, invite_code, share_clarity_tests, share_journal_entries, share_chat_summaries, share_safety_plan, share_risk_alerts')
      .eq('invite_code', normalizedCode)
      .single()
    
    if (inviteError || !invite) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Convite não encontrado. Verifique o código e tente novamente.' 
        },
        { status: 404 }
      )
    }
    
    // Verificar status
    if (invite.status !== 'pending') {
      const statusMessages: Record<string, string> = {
        'active': 'Este convite já foi aceito.',
        'paused': 'Este convite está pausado.',
        'revoked': 'Este convite foi revogado.'
      }
      
      return NextResponse.json(
        { 
          valid: false,
          error: statusMessages[invite.status] || 'Este convite não está mais disponível.' 
        },
        { status: 400 }
      )
    }
    
    // Buscar informações básicas do profissional
    const { data: professional } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', invite.professional_id)
      .single()
    
    // Retornar dados do convite válido
    return NextResponse.json({
      valid: true,
      invite: {
        id: invite.id,
        professionalName: professional?.full_name || 'Profissional',
        // Permissões sugeridas (padrão definido pelo profissional)
        suggestedPermissions: {
          share_clarity_tests: invite.share_clarity_tests,
          share_journal_entries: invite.share_journal_entries,
          share_chat_summaries: invite.share_chat_summaries,
          share_safety_plan: invite.share_safety_plan,
          share_risk_alerts: invite.share_risk_alerts
        }
      }
    })
    
  } catch (error) {
    console.error('Erro ao validar convite:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
