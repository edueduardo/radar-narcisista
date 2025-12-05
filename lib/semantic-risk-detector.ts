/**
 * Detector de Risco Semântico via IA
 * Análise além do regex simples - usa IA para detectar riscos sutis
 */

export interface RiskAnalysis {
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
  riskScore: number // 0-100
  categories: RiskCategory[]
  urgentAction: boolean
  suggestedResponse?: string
  reasoning: string
}

export interface RiskCategory {
  type: string
  confidence: number
  indicators: string[]
}

// Prompt otimizado para detecção de risco
const RISK_DETECTION_PROMPT = `Você é um especialista em identificar sinais de risco em relacionamentos abusivos.

Analise o texto a seguir e retorne um JSON com a seguinte estrutura:
{
  "riskLevel": "none" | "low" | "medium" | "high" | "critical",
  "riskScore": 0-100,
  "categories": [
    {
      "type": "tipo do risco",
      "confidence": 0-100,
      "indicators": ["indicador1", "indicador2"]
    }
  ],
  "urgentAction": true/false,
  "reasoning": "explicação breve"
}

CATEGORIAS DE RISCO:
- physical_violence: Violência física ou ameaça de
- emotional_abuse: Abuso emocional, humilhação, desvalorização
- gaslighting: Fazer a pessoa duvidar da própria percepção
- isolation: Isolamento de amigos e família
- financial_control: Controle financeiro abusivo
- stalking: Perseguição, monitoramento excessivo
- coercion: Coerção, chantagem, manipulação
- sexual_abuse: Abuso ou coerção sexual
- child_risk: Risco para crianças envolvidas

NÍVEIS DE RISCO:
- none: Sem indicadores de risco
- low: Sinais leves, pode ser situação normal
- medium: Padrões preocupantes, monitorar
- high: Risco significativo, sugerir plano de segurança
- critical: Perigo iminente, sugerir ajuda profissional imediata

IMPORTANTE:
- Seja sensível e não alarmista
- Considere o contexto cultural brasileiro
- Priorize a segurança da pessoa
- Se houver menção a armas, estrangulamento ou ameaças de morte, sempre marque como critical

TEXTO PARA ANÁLISE:
`

/**
 * Analisa texto usando IA para detectar riscos
 */
export async function analyzeRiskWithAI(
  text: string,
  options: {
    provider?: string
    model?: string
    apiKey?: string
  } = {}
): Promise<RiskAnalysis> {
  const { 
    provider = 'openai', 
    model = 'gpt-4o-mini',
    apiKey = process.env.OPENAI_API_KEY 
  } = options

  if (!apiKey) {
    console.warn('API key não configurada, usando análise básica')
    return basicRiskAnalysis(text)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em análise de risco em relacionamentos. Responda apenas com JSON válido.'
          },
          {
            role: 'user',
            content: RISK_DETECTION_PROMPT + text
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da IA')
    }

    const analysis = JSON.parse(content) as RiskAnalysis
    
    // Validar e normalizar
    return normalizeAnalysis(analysis)

  } catch (error) {
    console.error('Erro na análise de IA:', error)
    return basicRiskAnalysis(text)
  }
}

/**
 * Análise básica de risco (fallback sem IA)
 */
export function basicRiskAnalysis(text: string): RiskAnalysis {
  const lowerText = text.toLowerCase()
  
  // Palavras-chave de alto risco
  const criticalKeywords = [
    'matar', 'morrer', 'arma', 'faca', 'estrangular', 
    'suicídio', 'me matar', 'vou acabar', 'não aguento mais'
  ]
  
  const highRiskKeywords = [
    'bater', 'bateu', 'agrediu', 'agressão', 'empurrou',
    'ameaçou', 'ameaça', 'medo', 'terror', 'pânico',
    'trancou', 'prendeu', 'não deixa sair'
  ]
  
  const mediumRiskKeywords = [
    'grita', 'xinga', 'humilha', 'controla', 'ciúmes',
    'não posso', 'não deixa', 'proíbe', 'isola',
    'gaslighting', 'manipula', 'culpa'
  ]

  const lowRiskKeywords = [
    'discussão', 'briga', 'desentendimento', 'chateado',
    'irritado', 'nervoso', 'estressado'
  ]

  // Contar matches
  const criticalCount = criticalKeywords.filter(k => lowerText.includes(k)).length
  const highCount = highRiskKeywords.filter(k => lowerText.includes(k)).length
  const mediumCount = mediumRiskKeywords.filter(k => lowerText.includes(k)).length
  const lowCount = lowRiskKeywords.filter(k => lowerText.includes(k)).length

  // Determinar nível
  let riskLevel: RiskAnalysis['riskLevel'] = 'none'
  let riskScore = 0
  const categories: RiskCategory[] = []

  if (criticalCount > 0) {
    riskLevel = 'critical'
    riskScore = 90 + (criticalCount * 2)
    categories.push({
      type: 'immediate_danger',
      confidence: 95,
      indicators: criticalKeywords.filter(k => lowerText.includes(k))
    })
  } else if (highCount >= 2) {
    riskLevel = 'high'
    riskScore = 70 + (highCount * 5)
    categories.push({
      type: 'physical_violence',
      confidence: 80,
      indicators: highRiskKeywords.filter(k => lowerText.includes(k))
    })
  } else if (highCount === 1 || mediumCount >= 3) {
    riskLevel = 'medium'
    riskScore = 40 + (mediumCount * 5) + (highCount * 10)
    categories.push({
      type: 'emotional_abuse',
      confidence: 70,
      indicators: mediumRiskKeywords.filter(k => lowerText.includes(k))
    })
  } else if (mediumCount > 0 || lowCount >= 2) {
    riskLevel = 'low'
    riskScore = 15 + (lowCount * 5) + (mediumCount * 10)
  }

  return {
    riskLevel,
    riskScore: Math.min(100, riskScore),
    categories,
    urgentAction: riskLevel === 'critical',
    reasoning: `Análise básica: ${criticalCount} termos críticos, ${highCount} alto risco, ${mediumCount} médio risco`
  }
}

/**
 * Normaliza e valida análise
 */
function normalizeAnalysis(analysis: Partial<RiskAnalysis>): RiskAnalysis {
  const validLevels = ['none', 'low', 'medium', 'high', 'critical']
  
  return {
    riskLevel: validLevels.includes(analysis.riskLevel || '') 
      ? analysis.riskLevel as RiskAnalysis['riskLevel']
      : 'none',
    riskScore: Math.max(0, Math.min(100, analysis.riskScore || 0)),
    categories: Array.isArray(analysis.categories) ? analysis.categories : [],
    urgentAction: analysis.urgentAction || analysis.riskLevel === 'critical',
    suggestedResponse: analysis.suggestedResponse,
    reasoning: analysis.reasoning || 'Análise concluída'
  }
}

/**
 * Gera resposta sugerida baseada no nível de risco
 */
export function getSuggestedResponse(analysis: RiskAnalysis): string {
  switch (analysis.riskLevel) {
    case 'critical':
      return `Percebo que você está passando por uma situação muito difícil e perigosa. Sua segurança é a prioridade. 

🆘 **Recursos de emergência:**
- Ligue 180 (Central de Atendimento à Mulher)
- Ligue 190 (Polícia)
- Procure uma delegacia ou hospital mais próximo

Você não está sozinha. Posso ajudar você a criar um plano de segurança?`

    case 'high':
      return `O que você está descrevendo me preocupa. Esses comportamentos não são normais em um relacionamento saudável.

Você já pensou em criar um Plano de Segurança? É um documento que pode te ajudar a se proteger.

Se precisar de ajuda profissional, o CVV (188) oferece apoio 24 horas.`

    case 'medium':
      return `Entendo que essa situação está te afetando. O que você descreve são sinais que merecem atenção.

Que tal explorarmos juntos o que você está sentindo? Às vezes, nomear as coisas ajuda a ter mais clareza.`

    case 'low':
      return `Obrigada por compartilhar isso comigo. Conflitos fazem parte de qualquer relacionamento, mas é importante observar os padrões.

Como você se sente depois dessas situações?`

    default:
      return `Estou aqui para ouvir você. Como posso ajudar?`
  }
}
