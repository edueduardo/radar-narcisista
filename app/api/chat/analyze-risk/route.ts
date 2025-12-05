// API para análise semântica de risco via IA
// /api/chat/analyze-risk

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Tipos de risco detectáveis
type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
type RiskCategory = 'PHYSICAL_VIOLENCE' | 'EMOTIONAL_ABUSE' | 'FINANCIAL_ABUSE' | 'ISOLATION' | 'THREATS' | 'SELF_HARM' | 'NONE'

interface RiskAnalysis {
  hasRisk: boolean
  level: RiskLevel
  category: RiskCategory
  confidence: number // 0-1
  indicators: string[]
  suggestedAction: string
  explanation: string
}

// Prompt para análise de risco
const RISK_ANALYSIS_PROMPT = `Você é um especialista em identificação de sinais de abuso e violência em relacionamentos.

Analise o texto a seguir e identifique se há sinais de risco. Seja sensível e preciso.

CATEGORIAS DE RISCO:
- PHYSICAL_VIOLENCE: Violência física, agressões, empurrões, estrangulamento
- EMOTIONAL_ABUSE: Abuso emocional, manipulação, gaslighting, humilhação
- FINANCIAL_ABUSE: Controle financeiro, privação de recursos
- ISOLATION: Isolamento social, controle de contatos
- THREATS: Ameaças diretas ou veladas
- SELF_HARM: Sinais de automutilação ou ideação suicida
- NONE: Sem risco identificado

NÍVEIS DE RISCO:
- NONE: Sem risco
- LOW: Risco baixo, sinais sutis
- MEDIUM: Risco moderado, padrões preocupantes
- HIGH: Risco alto, situação perigosa
- CRITICAL: Risco crítico, perigo iminente

Responda APENAS em JSON válido no formato:
{
  "hasRisk": boolean,
  "level": "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "category": "PHYSICAL_VIOLENCE" | "EMOTIONAL_ABUSE" | "FINANCIAL_ABUSE" | "ISOLATION" | "THREATS" | "SELF_HARM" | "NONE",
  "confidence": number (0-1),
  "indicators": ["lista de sinais identificados"],
  "suggestedAction": "ação sugerida",
  "explanation": "explicação breve"
}

TEXTO PARA ANÁLISE:
`

// POST - Analisar risco em mensagem
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { message, createAlertIfRisk = false } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    // Análise rápida com regex primeiro (fallback se IA falhar)
    const quickRiskCheck = performQuickRiskCheck(message)

    // Tentar análise com IA
    let aiAnalysis: RiskAnalysis | null = null
    
    try {
      // Buscar chave da OpenAI
      const { data: aiConfig } = await supabase
        .from('ai_providers_core')
        .select('api_key')
        .eq('provider_name', 'openai')
        .eq('is_active', true)
        .single()

      if (aiConfig?.api_key) {
        const openai = new OpenAI({ apiKey: aiConfig.api_key })
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Você é um especialista em identificação de sinais de abuso. Responda apenas em JSON válido.' },
            { role: 'user', content: RISK_ANALYSIS_PROMPT + message }
          ],
          temperature: 0.3,
          max_tokens: 500
        })

        const responseText = completion.choices[0]?.message?.content || ''
        
        // Extrair JSON da resposta
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]) as RiskAnalysis
        }
      }
    } catch (aiError) {
      console.error('Erro na análise IA:', aiError)
      // Continua com análise regex
    }

    // Usar análise IA se disponível, senão usar regex
    const finalAnalysis = aiAnalysis || quickRiskCheck

    // Se há risco e foi solicitado criar alerta
    if (finalAnalysis.hasRisk && createAlertIfRisk && finalAnalysis.level !== 'NONE' && finalAnalysis.level !== 'LOW') {
      try {
        await supabase.from('risk_alerts').insert({
          user_id: user.id,
          source: 'chat_ai_analysis',
          level: finalAnalysis.level,
          category: finalAnalysis.category,
          title: `⚠️ Risco detectado via análise de IA`,
          description: `Análise semântica identificou sinais de ${getCategoryLabel(finalAnalysis.category)}. Indicadores: ${finalAnalysis.indicators.join(', ')}`,
          recommended_action: finalAnalysis.suggestedAction,
          is_read: false,
          is_dismissed: false,
          metadata: {
            confidence: finalAnalysis.confidence,
            analysisType: aiAnalysis ? 'ai' : 'regex',
            indicators: finalAnalysis.indicators
          }
        })
      } catch (alertError) {
        console.error('Erro ao criar risk_alert:', alertError)
      }
    }

    return NextResponse.json({
      analysis: finalAnalysis,
      source: aiAnalysis ? 'ai' : 'regex'
    })

  } catch (error) {
    console.error('Erro na análise de risco:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Análise rápida com regex (fallback)
function performQuickRiskCheck(message: string): RiskAnalysis {
  const lowerMessage = message.toLowerCase()
  
  // Padrões de risco físico
  const physicalPatterns = [
    /\b(me\s+bateu|me\s+agrediu|me\s+machucou|socou|empurrou|estrangul|apanho|apanhei|me\s+bate|me\s+agride)\b/i,
    /\b(violência\s+física|agressão\s+física|me\s+espancou|me\s+chutou)\b/i
  ]
  
  // Padrões de ameaças
  const threatPatterns = [
    /\b(ameaç(ou|a|ando)|vai\s+me\s+matar|disse\s+que\s+vai|quer\s+me\s+matar|medo\s+de\s+morrer)\b/i,
    /\b(me\s+ameaça|ameaça\s+de\s+morte|vai\s+acabar\s+comigo)\b/i
  ]
  
  // Padrões de abuso emocional
  const emotionalPatterns = [
    /\b(me\s+humilha|me\s+xinga|me\s+diminui|diz\s+que\s+sou\s+(louc|burr|inútil))\b/i,
    /\b(gaslighting|manipula|controla\s+tudo|não\s+posso\s+fazer\s+nada)\b/i
  ]
  
  // Padrões de isolamento
  const isolationPatterns = [
    /\b(não\s+posso\s+(sair|ver|falar)|proíbe\s+de|controla\s+meu\s+(celular|telefone))\b/i,
    /\b(me\s+isola|afastou\s+de|não\s+deixa\s+eu\s+(ver|falar))\b/i
  ]
  
  // Padrões de autolesão
  const selfHarmPatterns = [
    /\b(quero\s+morrer|não\s+aguento\s+mais|vou\s+me\s+matar|suicíd|me\s+machucar)\b/i,
    /\b(não\s+vale\s+a\s+pena\s+viver|melhor\s+sem\s+mim)\b/i
  ]

  // Verificar padrões
  const hasPhysical = physicalPatterns.some(p => p.test(lowerMessage))
  const hasThreat = threatPatterns.some(p => p.test(lowerMessage))
  const hasEmotional = emotionalPatterns.some(p => p.test(lowerMessage))
  const hasIsolation = isolationPatterns.some(p => p.test(lowerMessage))
  const hasSelfHarm = selfHarmPatterns.some(p => p.test(lowerMessage))

  // Determinar categoria e nível
  if (hasSelfHarm) {
    return {
      hasRisk: true,
      level: 'CRITICAL',
      category: 'SELF_HARM',
      confidence: 0.8,
      indicators: ['Sinais de ideação suicida ou autolesão'],
      suggestedAction: 'Busque ajuda profissional imediatamente. CVV: 188',
      explanation: 'Detectados sinais de risco à própria vida.'
    }
  }

  if (hasPhysical) {
    return {
      hasRisk: true,
      level: 'HIGH',
      category: 'PHYSICAL_VIOLENCE',
      confidence: 0.85,
      indicators: ['Relato de violência física'],
      suggestedAction: 'Revise seu Plano de Segurança e considere buscar ajuda.',
      explanation: 'Detectados sinais de violência física.'
    }
  }

  if (hasThreat) {
    return {
      hasRisk: true,
      level: 'HIGH',
      category: 'THREATS',
      confidence: 0.8,
      indicators: ['Ameaças identificadas'],
      suggestedAction: 'Documente as ameaças e revise seu Plano de Segurança.',
      explanation: 'Detectadas ameaças diretas ou veladas.'
    }
  }

  if (hasEmotional) {
    return {
      hasRisk: true,
      level: 'MEDIUM',
      category: 'EMOTIONAL_ABUSE',
      confidence: 0.7,
      indicators: ['Sinais de abuso emocional'],
      suggestedAction: 'Considere buscar apoio profissional.',
      explanation: 'Detectados padrões de abuso emocional.'
    }
  }

  if (hasIsolation) {
    return {
      hasRisk: true,
      level: 'MEDIUM',
      category: 'ISOLATION',
      confidence: 0.7,
      indicators: ['Sinais de isolamento social'],
      suggestedAction: 'Mantenha contato com pessoas de confiança.',
      explanation: 'Detectados sinais de isolamento forçado.'
    }
  }

  return {
    hasRisk: false,
    level: 'NONE',
    category: 'NONE',
    confidence: 0.9,
    indicators: [],
    suggestedAction: '',
    explanation: 'Nenhum sinal de risco identificado.'
  }
}

// Helper para label de categoria
function getCategoryLabel(category: RiskCategory): string {
  const labels: Record<RiskCategory, string> = {
    PHYSICAL_VIOLENCE: 'violência física',
    EMOTIONAL_ABUSE: 'abuso emocional',
    FINANCIAL_ABUSE: 'abuso financeiro',
    ISOLATION: 'isolamento',
    THREATS: 'ameaças',
    SELF_HARM: 'risco à própria vida',
    NONE: 'sem categoria'
  }
  return labels[category] || category
}
