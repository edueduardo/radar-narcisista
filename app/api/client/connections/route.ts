/**
 * API: /api/client/connections
 * ETAPA 12.1.2 - Gestão de Conexões pelo Cliente
 * 
 * Endpoints:
 * - GET: Lista profissionais conectados ao cliente
 * 
 * Segurança:
 * - Requer autenticação
 * - Cliente só vê suas próprias conexões
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// GET: Lista conexões do cliente com profissionais
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Buscar conexões onde o usuário é o cliente
    const { data: connections, error: connectionsError } = await supabase
      .from('professional_clients')
      .select(`
        id,
        professional_id,
        status,
        share_clarity_tests,
        share_journal_entries,
        share_chat_summaries,
        share_safety_plan,
        share_risk_alerts,
        invite_accepted_at,
        created_at,
        updated_at
      `)
      .eq('client_id', user.id)
      .in('status', ['active', 'paused', 'revoked'])
      .order('created_at', { ascending: false })
    
    if (connectionsError) {
      console.error('Erro ao buscar conexões:', connectionsError)
      return NextResponse.json(
        { error: 'Erro ao buscar conexões' },
        { status: 500 }
      )
    }
    
    // Enriquecer com dados do profissional
    const enrichedConnections = await Promise.all(
      (connections || []).map(async (conn) => {
        const { data: professionalProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', conn.professional_id)
          .single()
        
        return {
          ...conn,
          professional_name: professionalProfile?.full_name || 'Profissional',
          professional_email: professionalProfile?.email || null
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      connections: enrichedConnections,
      count: enrichedConnections.length
    })
    
  } catch (error) {
    console.error('Erro na API client/connections:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
