/**
 * API: /api/professional/reports/[clientId]
 * ETAPA 12.2 - Relatório Básico por Cliente
 * 
 * GET: Retorna dados agregados do cliente para o profissional
 * 
 * Segurança:
 * - Requer autenticação
 * - Requer plano profissional
 * - Só retorna dados autorizados pelo cliente (share_*)
 * - RLS + verificação de vínculo ativo
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar plano profissional
    if (!(await checkProfessionalAccess(supabase, user.id))) {
      return NextResponse.json({ error: 'Acesso restrito ao plano Profissional' }, { status: 403 })
    }
    
    // Buscar conexão com o cliente
    const { data: connection, error: connError } = await supabase
      .from('professional_clients')
      .select('*')
      .eq('id', clientId)
      .eq('professional_id', user.id)
      .single()
    
    if (connError || !connection) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }
    
    // Verificar se conexão está ativa
    if (connection.status !== 'active') {
      return NextResponse.json({ 
        error: 'Conexão não está ativa',
        status: connection.status 
      }, { status: 403 })
    }
    
    // Buscar dados do cliente (perfil básico)
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name, email, created_at')
      .eq('id', connection.client_id)
      .single()
    
    // Preparar objeto de relatório
    const report: Record<string, unknown> = {
      client: {
        id: connection.id,
        name: connection.client_display_name || clientProfile?.full_name || 'Cliente',
        connectedSince: connection.invite_accepted_at || connection.created_at,
        lastActivity: connection.last_activity_at
      },
      permissions: {
        share_clarity_tests: connection.share_clarity_tests,
        share_journal_entries: connection.share_journal_entries,
        share_chat_summaries: connection.share_chat_summaries,
        share_safety_plan: connection.share_safety_plan,
        share_risk_alerts: connection.share_risk_alerts
      },
      professionalNotes: connection.professional_notes,
      modules: {}
    }
    
    // =======================================================================
    // MÓDULO: TESTE DE CLAREZA
    // =======================================================================
    if (connection.share_clarity_tests) {
      const { data: clarityTests, count: clarityCount } = await supabase
        .from('clarity_tests')
        .select('id, created_at, global_zone, global_score, answers', { count: 'exact' })
        .eq('user_id', connection.client_id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      const tests = clarityTests || []
      const latestTest = tests[0]
      
      // Calcular evolução se houver mais de um teste
      let evolution = null
      if (tests.length >= 2) {
        const firstScore = tests[tests.length - 1]?.global_score || 0
        const lastScore = latestTest?.global_score || 0
        evolution = {
          direction: lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'stable',
          change: lastScore - firstScore
        }
      }
      
      report.modules = {
        ...report.modules as object,
        clarity: {
          totalTests: clarityCount || 0,
          latestTest: latestTest ? {
            date: latestTest.created_at,
            zone: latestTest.global_zone,
            score: latestTest.global_score
          } : null,
          recentTests: tests.map(t => ({
            date: t.created_at,
            zone: t.global_zone,
            score: t.global_score
          })),
          evolution
        }
      }
    }
    
    // =======================================================================
    // MÓDULO: DIÁRIO
    // =======================================================================
    if (connection.share_journal_entries) {
      const { data: journalEntries, count: journalCount } = await supabase
        .from('journal_entries')
        .select('id, created_at, title, mood_intensity, entry_type', { count: 'exact' })
        .eq('user_id', connection.client_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10)
      
      const entries = journalEntries || []
      
      // Calcular média de intensidade emocional
      const intensities = entries.filter(e => e.mood_intensity).map(e => e.mood_intensity)
      const avgIntensity = intensities.length > 0 
        ? intensities.reduce((a, b) => a + b, 0) / intensities.length 
        : null
      
      // Contar por tipo de entrada
      const entryTypes = entries.reduce((acc, e) => {
        const type = e.entry_type || 'normal'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Calcular frequência (entradas por semana nos últimos 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentEntries = entries.filter(e => new Date(e.created_at) >= thirtyDaysAgo)
      const entriesPerWeek = (recentEntries.length / 4.3).toFixed(1)
      
      report.modules = {
        ...report.modules as object,
        journal: {
          totalEntries: journalCount || 0,
          entriesPerWeek: parseFloat(entriesPerWeek),
          averageIntensity: avgIntensity ? Math.round(avgIntensity * 10) / 10 : null,
          entryTypes,
          recentEntries: entries.slice(0, 5).map(e => ({
            date: e.created_at,
            title: e.title || 'Sem título',
            type: e.entry_type || 'normal',
            intensity: e.mood_intensity
          }))
        }
      }
    }
    
    // =======================================================================
    // MÓDULO: CHAT/COACH IA
    // =======================================================================
    if (connection.share_chat_summaries) {
      const { data: chatSessions, count: chatCount } = await supabase
        .from('ai_chat_sessions')
        .select('id, created_at, name, updated_at', { count: 'exact' })
        .eq('user_id', connection.client_id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      const sessions = chatSessions || []
      
      report.modules = {
        ...report.modules as object,
        chat: {
          totalSessions: chatCount || 0,
          recentSessions: sessions.map(s => ({
            date: s.created_at,
            name: s.name || 'Conversa',
            lastActivity: s.updated_at
          }))
        }
      }
    }
    
    // =======================================================================
    // MÓDULO: PLANO DE SEGURANÇA
    // =======================================================================
    if (connection.share_safety_plan) {
      const { data: safetyPlan } = await supabase
        .from('safety_plans')
        .select('id, created_at, updated_at, status')
        .eq('user_id', connection.client_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      report.modules = {
        ...report.modules as object,
        safetyPlan: {
          exists: !!safetyPlan,
          status: safetyPlan?.status || null,
          lastUpdated: safetyPlan?.updated_at || null
        }
      }
    }
    
    // =======================================================================
    // MÓDULO: ALERTAS DE RISCO
    // =======================================================================
    if (connection.share_risk_alerts) {
      const { data: riskAlerts, count: alertCount } = await supabase
        .from('risk_alerts')
        .select('id, created_at, alert_type, severity, resolved_at', { count: 'exact' })
        .eq('user_id', connection.client_id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      const alerts = riskAlerts || []
      const unresolvedAlerts = alerts.filter(a => !a.resolved_at)
      
      report.modules = {
        ...report.modules as object,
        riskAlerts: {
          totalAlerts: alertCount || 0,
          unresolvedCount: unresolvedAlerts.length,
          recentAlerts: alerts.slice(0, 5).map(a => ({
            date: a.created_at,
            type: a.alert_type,
            severity: a.severity,
            resolved: !!a.resolved_at
          }))
        }
      }
    }
    
    // Atualizar last_activity_at da conexão
    await supabase
      .from('professional_clients')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', clientId)
    
    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
