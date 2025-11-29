import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função heurística simples para avaliar clareza (fallback)
function evaluateClarityHeuristic(message: string): { score: number; explanation: string } {
  const text = message.toLowerCase().trim()
  const length = text.length
  
  // Critérios heurísticos
  let score = 50 // base score
  
  // Comprimento adequado (nem muito curto, nem muito longo)
  if (length < 20) score -= 20 // muito curto
  else if (length < 50) score -= 10 // curto
  else if (length > 500) score -= 10 // muito longo
  else if (length > 200) score += 5 // bom detalhe
  
  // Indicadores de clareza
  const clarityIndicators = [
    'por exemplo', 'como quando', 'especificamente', 'concretamente',
    'lembro que', 'aconteceu quando', 'eu senti', 'foi que',
    'porque', 'motivo', 'razão', 'depois', 'antes'
  ]
  const clarityCount = clarityIndicators.filter(indicator => 
    text.includes(indicator)
  ).length
  score += Math.min(clarityCount * 5, 20)
  
  // Indicadores de confusão
  const confusionIndicators = [
    'não sei', 'talvez', 'acho que', 'pode ser', 'não lembro',
    'confuso', 'estranho', 'diferente', 'coisa'
  ]
  const confusionCount = confusionIndicators.filter(indicator => 
    text.includes(indicator)
  ).length
  score -= Math.min(confusionCount * 8, 25)
  
  // Detalhes específicos (datas, lugares, pessoas)
  const specificPatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // datas
    /\d{1,2}:\d{2}/, // horas
    /\b[aeiou]s{2,}\b/gi, // lugares com "ss" ou "ç"
    /\b[a-z]{3,}\s\b[a-z]{3,}/gi // pelo menos duas palavras
  ]
  const specificCount = specificPatterns.reduce((count, pattern) => 
    count + (text.match(pattern)?.length || 0), 0
  )
  score += Math.min(specificCount * 3, 15)
  
  // Garantir que o score fique entre 0 e 100
  score = Math.max(0, Math.min(100, score))
  
  // Gerar explicação
  let explanation = ''
  if (score >= 80) {
    explanation = 'Resposta clara e específica, com bons detalhes que ajudam a entender o contexto.'
  } else if (score >= 60) {
    explanation = 'Resposta boa, mas poderia incluir mais exemplos ou detalhes específicos.'
  } else if (score >= 40) {
    explanation = 'Resposta um pouco genérica. Tente incluir exemplos concretos do que aconteceu.'
  } else {
    explanation = 'Resposta muito vaga ou confusa. Tente ser mais específico e dar exemplos reais.'
  }
  
  return { score, explanation }
}

// Função para avaliar com IA (se disponível)
async function evaluateClarityWithAI(message: string): Promise<{ score: number; explanation: string }> {
  try {
    // Tentar usar OpenAI ou outro provider se disponível
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    
    if (!OPENAI_API_KEY) {
      throw new Error('AI não disponível')
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Avalie a clareza da mensagem do usuário em uma escala de 0 a 100.
            
Critérios:
- 80-100: Resposta clara, específica, com exemplos concretos, detalhes de contexto
- 60-79: Resposta boa, mas poderia ser mais detalhada ou específica  
- 40-59: Resposta vaga, genérica, poucos detalhes concretos
- 0-39: Resposta muito confusa, contraditória, evasiva ou sem informações úteis

Responda APENAS em formato JSON:
{
  "score": número de 0 a 100,
  "explanation": "breve explicação do porquê desse score"
}`
          },
          {
            role: 'user',
            content: `Avalie esta mensagem: "${message}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    })
    
    if (!response.ok) {
      throw new Error('Falha na API da IA')
    }
    
    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('Resposta inválida da IA')
    }
    
    // Tentar fazer parse do JSON
    const result = JSON.parse(content)
    return {
      score: Math.max(0, Math.min(100, result.score || 50)),
      explanation: result.explanation || 'Análise automática de clareza'
    }
    
  } catch (error) {
    console.error('Erro na avaliação com IA:', error)
    // Fallback para heurística
    return evaluateClarityHeuristic(message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida' },
        { status: 400 }
      )
    }
    
    // Tentar avaliação com IA primeiro, fallback para heurística
    const result = await evaluateClarityWithAI(message)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro ao avaliar clareza:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
