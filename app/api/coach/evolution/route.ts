/**
 * API: /api/coach/evolution
 * Gera análise de evolução de clareza usando IA
 * 
 * Retorna JSON estruturado com:
 * - Resumo da clareza atual
 * - Comparação com sessões anteriores
 * - Temas dominantes
 * - Avaliação de risco
 * - Recomendações e próximos passos
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { 
  ClarityEvolutionData, 
  InputSignals, 
  DominantTheme,
  RiskAssessment,
  SuggestedAction 
} from '@/lib/types/evolution-clarity'

// ============================================
// PROMPT PARA GERAR ANÁLISE DE EVOLUÇÃO
// ============================================

const EVOLUTION_ANALYSIS_PROMPT = `
Você é um analisador de evolução de clareza emocional. Sua tarefa é analisar a mensagem do usuário e gerar um JSON estruturado com a análise.

REGRAS:
1. Analise o texto buscando: clareza na descrição, emoções expressas, padrões de abuso, nível de risco
2. Compare com dados anteriores se fornecidos
3. Gere textos empáticos e úteis, NUNCA julgadores
4. Identifique padrões de comportamento abusivo (gaslighting, manipulação, etc.) sem diagnosticar pessoas
5. Avalie risco de segurança com cuidado

RESPONDA APENAS COM JSON VÁLIDO, sem markdown, sem explicações.

O JSON deve seguir EXATAMENTE esta estrutura:
{
  "clarity_score": número de 0 a 100,
  "emotional_intensity": número de 0 a 100,
  "risk_level": "none" | "low" | "moderate" | "high" | "imminent",
  "risk_signals": ["lista de sinais de risco detectados"],
  "problem_tags": ["lista de tags: gaslighting, manipulacao, invalidacao, isolamento, ameacas, etc"],
  "emotions_detected": ["lista de emoções: tristeza, medo, raiva, confusao, esperanca, etc"],
  "current_clarity_summary": "texto resumindo como está a clareza atual",
  "evolution_comment": "texto comparando com antes, se houver dados anteriores",
  "dominant_themes": [
    {
      "id": "identificador",
      "label": "Nome do tema",
      "trend": "up" | "down" | "stable",
      "comment": "comentário sobre este tema"
    }
  ],
  "safety_recommendation": "recomendação de segurança se houver risco",
  "encouragement_message": "mensagem de encorajamento empática",
  "suggested_actions": [
    {
      "type": "tool" | "professional_help" | "safety" | "emotional",
      "tool_id": "id da ferramenta se type=tool",
      "label": "descrição da ação",
      "reason": "por que esta ação é recomendada"
    }
  ]
}
`

// ============================================
// HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      message, 
      history = [], 
      previousScore = null,
      problemTagsHistory = [],
      userId = 'anonymous',
      sessionId = crypto.randomUUID()
    } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[/api/coach/evolution] OPENAI_API_KEY não configurada')
      return NextResponse.json(
        { error: 'API não configurada' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    // Construir contexto para a IA
    const contextParts: string[] = []
    
    if (previousScore !== null) {
      contextParts.push(`Score de clareza anterior: ${previousScore}/100`)
    }
    
    if (problemTagsHistory.length > 0) {
      contextParts.push(`Histórico de problemas detectados: ${JSON.stringify(problemTagsHistory)}`)
    }
    
    if (history.length > 0) {
      const recentHistory = history.slice(-5).map((m: any) => 
        `${m.role === 'user' ? 'Usuário' : 'Coach'}: ${m.content.substring(0, 200)}...`
      ).join('\n')
      contextParts.push(`Histórico recente:\n${recentHistory}`)
    }

    const contextString = contextParts.length > 0 
      ? `\n\nCONTEXTO ANTERIOR:\n${contextParts.join('\n\n')}`
      : ''

    // Chamar OpenAI
    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: EVOLUTION_ANALYSIS_PROMPT },
        { role: 'user', content: `Analise esta mensagem e gere o JSON de evolução:${contextString}\n\nMENSAGEM ATUAL:\n${message}` }
      ],
      temperature: 0.3, // Baixa para consistência
      max_tokens: 1500
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    const latency = Date.now() - startTime

    console.log('[/api/coach/evolution] Resposta da IA:', responseText.substring(0, 200))

    // Parsear JSON da resposta
    let analysisData: any
    try {
      // Limpar possíveis marcadores de código
      const cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      analysisData = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('[/api/coach/evolution] Erro ao parsear JSON:', parseError)
      // Retornar análise padrão se falhar
      analysisData = {
        clarity_score: 50,
        emotional_intensity: 50,
        risk_level: 'none',
        risk_signals: [],
        problem_tags: [],
        emotions_detected: [],
        current_clarity_summary: 'Estou analisando sua situação.',
        evolution_comment: 'Continue compartilhando para eu entender melhor.',
        dominant_themes: [],
        safety_recommendation: '',
        encouragement_message: 'Obrigado por compartilhar. Estou aqui para te ouvir.',
        suggested_actions: []
      }
    }

    // Construir resposta estruturada
    const evolutionData: ClarityEvolutionData = {
      session_id: sessionId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      
      input_signals: {
        source: ['coach'],
        clarity_score_current: analysisData.clarity_score || 50,
        clarity_score_previous: previousScore,
        clarity_trend: calculateTrend(analysisData.clarity_score, previousScore),
        emotional_intensity: analysisData.emotional_intensity || 50,
        risk_relevance: calculateRiskRelevance(analysisData.risk_level),
        problem_tags_current: analysisData.problem_tags || [],
        problem_tags_history: problemTagsHistory
      },
      
      analysis: {
        current_clarity_summary: analysisData.current_clarity_summary || '',
        evolution_since_last: analysisData.evolution_comment || '',
        dominant_themes: (analysisData.dominant_themes || []).map((t: any) => ({
          id: t.id || 'unknown',
          label: t.label || '',
          trend: t.trend || 'stable',
          comment: t.comment || ''
        })) as DominantTheme[],
        risk_assessment: {
          level: analysisData.risk_level || 'none',
          signals: analysisData.risk_signals || [],
          safety_recommendation: analysisData.safety_recommendation || ''
        } as RiskAssessment
      },
      
      recommendations: {
        encouragement_message: analysisData.encouragement_message || '',
        suggested_actions: (analysisData.suggested_actions || []).map((a: any) => ({
          type: a.type || 'emotional',
          tool_id: a.tool_id,
          label: a.label || '',
          reason: a.reason || ''
        })) as SuggestedAction[]
      },
      
      disclaimer: 'Esta análise é gerada por uma IA para apoio emocional e organização de informações. Ela não substitui avaliação psicológica, psiquiátrica, jurídica ou de qualquer outro profissional. Em situações de risco, procure ajuda local imediatamente.'
    }

    return NextResponse.json({
      success: true,
      evolution: evolutionData,
      emotions: analysisData.emotions_detected || [],
      latency_ms: latency
    })

  } catch (error: any) {
    console.error('[/api/coach/evolution] Erro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function calculateTrend(current: number, previous: number | null): 'up' | 'down' | 'stable' {
  if (previous === null) return 'stable'
  const diff = current - previous
  if (diff >= 10) return 'up'
  if (diff <= -10) return 'down'
  return 'stable'
}

function calculateRiskRelevance(riskLevel: string): number {
  switch (riskLevel) {
    case 'none': return 0
    case 'low': return 20
    case 'moderate': return 50
    case 'high': return 80
    case 'imminent': return 100
    default: return 0
  }
}
