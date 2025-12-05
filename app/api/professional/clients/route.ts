/**
 * API: /api/professional/clients
 * ETAPA 12.1 - Infra de Clientes Profissionais
 * 
 * Endpoints:
 * - GET: Lista clientes do profissional autenticado
 * - POST: Cria convite para novo cliente
 * 
 * Segurança:
 * - Requer autenticação
 * - Requer plano profissional
 * - RLS no banco garante isolamento
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Gerar código de convite único (8 caracteres alfanuméricos)
function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// Tipo para cliente profissional
interface ProfessionalClient {
  id: string
  professional_id: string
  client_id: string
  status: 'pending' | 'active' | 'paused' | 'revoked'
  invite_code: string | null
  invite_sent_at: string | null
  invite_accepted_at: string | null
  share_clarity_tests: boolean
  share_journal_entries: boolean
  share_chat_summaries: boolean
  share_safety_plan: boolean
  share_risk_alerts: boolean
  client_display_name: string | null
  professional_notes: string | null
  created_at: string
  updated_at: string
  last_activity_at: string | null
}

// Verificar se usuário tem plano profissional
async function checkProfessionalAccess(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, subscription_status')
    .eq('id', userId)
    .single()
  
  if (!profile) return false
  
  // Verificar se tem plano profissional
  const p = profile as { plan_id?: string; subscription_status?: string }
  const isProfessional = 
    p.plan_id === 'profissional' ||
    p.subscription_status === 'professional'
  
  return isProfessional
}

// GET: Lista clientes do profissional
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
    
    // Verificar plano profissional
    const hasProfessionalAccess = await checkProfessionalAccess(supabase, user.id)
    
    if (!hasProfessionalAccess) {
      return NextResponse.json(
        { error: 'Acesso restrito ao plano Profissional' },
        { status: 403 }
      )
    }
    
    // Buscar clientes do profissional
    const { data: clients, error: clientsError } = await supabase
      .from('professional_clients')
      .select(`
        id,
        client_id,
        status,
        invite_code,
        invite_sent_at,
        invite_accepted_at,
        share_clarity_tests,
        share_journal_entries,
        share_chat_summaries,
        share_safety_plan,
        share_risk_alerts,
        client_display_name,
        professional_notes,
        created_at,
        updated_at,
        last_activity_at
      `)
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })
    
    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError)
      return NextResponse.json(
        { error: 'Erro ao buscar clientes' },
        { status: 500 }
      )
    }
    
    // Enriquecer com dados do cliente (nome, email) se autorizado
    const enrichedClients = await Promise.all(
      (clients || []).map(async (client) => {
        // Se o cliente aceitou, buscar dados básicos
        if (client.status === 'active' && client.client_id) {
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', client.client_id)
            .single()
          
          return {
            ...client,
            client_name: client.client_display_name || clientProfile?.full_name || 'Cliente',
            client_email: clientProfile?.email || null
          }
        }
        
        return {
          ...client,
          client_name: client.client_display_name || 'Convite pendente',
          client_email: null
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      clients: enrichedClients,
      count: enrichedClients.length
    })
    
  } catch (error) {
    console.error('Erro na API professional/clients:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST: Criar convite para novo cliente
export async function POST(request: NextRequest) {
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
    
    // Verificar plano profissional
    const hasProfessionalAccess = await checkProfessionalAccess(supabase, user.id)
    
    if (!hasProfessionalAccess) {
      return NextResponse.json(
        { error: 'Acesso restrito ao plano Profissional' },
        { status: 403 }
      )
    }
    
    // Verificar limite de clientes (20 para plano profissional)
    const { count: clientCount } = await supabase
      .from('professional_clients')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .neq('status', 'revoked')
    
    const CLIENT_LIMIT = 20
    if ((clientCount || 0) >= CLIENT_LIMIT) {
      return NextResponse.json(
        { error: `Limite de ${CLIENT_LIMIT} clientes atingido` },
        { status: 400 }
      )
    }
    
    // Ler dados do body
    const body = await request.json()
    const { clientDisplayName, clientEmail } = body
    
    // Gerar código de convite único
    const inviteCode = generateInviteCode() // Ex: "A1B2C3D4"
    
    // Criar registro de convite
    // NOTA: client_id fica NULL até o cliente aceitar o convite
    const { data: newClient, error: insertError } = await supabase
      .from('professional_clients')
      .insert({
        professional_id: user.id,
        // client_id será preenchido quando o cliente aceitar
        status: 'pending',
        invite_code: inviteCode,
        invite_sent_at: new Date().toISOString(),
        client_display_name: clientDisplayName || null,
        // Permissões padrão sugeridas (cliente pode alterar no aceite)
        share_clarity_tests: true,
        share_journal_entries: true,
        share_chat_summaries: true,
        share_safety_plan: false, // Sensível - começa desligado
        share_risk_alerts: false  // Sensível - começa desligado
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Erro ao criar convite:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar convite' },
        { status: 500 }
      )
    }
    
    // TODO: Enviar email de convite para o cliente (se clientEmail fornecido)
    // Por enquanto, retornar o código para o profissional compartilhar manualmente
    
    return NextResponse.json({
      success: true,
      invite: {
        id: newClient.id,
        code: inviteCode,
        displayName: clientDisplayName,
        createdAt: newClient.created_at
      },
      message: `Convite criado! Código: ${inviteCode}`
    })
    
  } catch (error) {
    console.error('Erro na API professional/clients POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
