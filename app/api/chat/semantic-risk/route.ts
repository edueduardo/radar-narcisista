import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { analyzeRiskWithAI, getSuggestedResponse } from '@/lib/semantic-risk-detector'
import { sendRiskNotifications } from '@/lib/risk-notifications'

/**
 * API de Análise Semântica de Risco
 * 
 * POST /api/chat/semantic-risk
 * Analisa texto usando IA para detectar riscos sutis
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { text, source = 'chat', createAlert = true, notify = true } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto é obrigatório' },
        { status: 400 }
      )
    }

    // Analisar risco com IA
    const analysis = await analyzeRiskWithAI(text)

    // Se risco médio ou maior, criar alerta
    if (createAlert && ['medium', 'high', 'critical'].includes(analysis.riskLevel)) {
      try {
        await supabase.from('risk_alerts').insert({
          user_id: user.id,
          source,
          risk_level: analysis.riskLevel.toUpperCase(),
          risk_type: analysis.categories[0]?.type || 'semantic_analysis',
          details: {
            riskScore: analysis.riskScore,
            categories: analysis.categories,
            reasoning: analysis.reasoning,
            textPreview: text.substring(0, 100)
          },
          status: 'active',
          created_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Erro ao criar alerta:', error)
      }
    }

    // Enviar notificações se risco alto ou crítico
    if (notify && ['high', 'critical'].includes(analysis.riskLevel)) {
      try {
        await sendRiskNotifications({
          userId: user.id,
          userEmail: user.email || '',
          riskLevel: analysis.riskLevel as 'high' | 'critical',
          riskType: analysis.categories[0]?.type || 'semantic_analysis',
          source: source as 'chat' | 'diary',
          details: {
            riskScore: analysis.riskScore,
            reasoning: analysis.reasoning
          }
        }, supabase)
      } catch (error) {
        console.error('Erro ao enviar notificações:', error)
      }
    }

    // Gerar resposta sugerida
    const suggestedResponse = getSuggestedResponse(analysis)

    return NextResponse.json({
      success: true,
      analysis: {
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        categories: analysis.categories,
        urgentAction: analysis.urgentAction,
        reasoning: analysis.reasoning
      },
      suggestedResponse,
      alertCreated: createAlert && ['medium', 'high', 'critical'].includes(analysis.riskLevel),
      notificationSent: notify && ['high', 'critical'].includes(analysis.riskLevel)
    })

  } catch (error) {
    console.error('Erro na análise semântica:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar texto' },
      { status: 500 }
    )
  }
}
