/**
 * CONEXÕES REAIS COM APIs DE IAs
 * Este arquivo implementa as chamadas REAIS para cada provedor de IA
 * 
 * BACKUP: Este arquivo foi criado em 24/11/2025 22:25
 * LOCAL: lib/ia-conexoes-reais.ts
 */

import OpenAI from 'openai'

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface IAResponse {
  success: boolean
  provider: string
  response: string
  themes: string[]
  emotions: string[]
  intensity: number
  risk_flags: string[]
  suggestions: string[]
  confidence: number
  latency_ms: number
  error?: string
}

export interface AnalysisPrompt {
  text: string
  context?: string
  userId?: string
  previousAnalyses?: IAResponse[]
}

// ============================================
// PROMPTS DO SISTEMA
// ============================================

const ANALYSIS_SYSTEM_PROMPT = `Você é um analista especializado em identificar padrões de comportamento em relações interpessoais.

IMPORTANTE:
- NÃO faça diagnósticos clínicos
- NÃO rotule pessoas como "narcisistas"
- FOQUE em comportamentos e padrões observáveis
- SEJA empático e não-julgador
- NÃO dê pareceres jurídicos nem prometa resultado em processos

Analise o texto e retorne um JSON com:
{
  "themes": ["lista de temas identificados como gaslighting, manipulação, controle, etc"],
  "emotions": ["emoções detectadas no texto como medo, confusão, tristeza, etc"],
  "intensity": 0.0 a 1.0 (intensidade emocional),
  "risk_flags": ["alertas de risco se houver"],
  "suggestions": ["sugestões de apoio"],
  "confidence": 0.0 a 1.0 (confiança na análise)
}

Regras adicionais de segurança e ética:
- NÃO sugira planos de vingança, exposição pública, perseguição, destruição de reputação ou uso do sistema como arma contra alguém.
- Se o texto mencionar desejo de se vingar, "acabar com" a outra pessoa ou usar a situação para prejudicá-la, registre isso em "risk_flags" e, em "suggestions", foque em proteção pessoal, autocuidado e busca de ajuda profissional (psicólogos, advogados, serviços de apoio), nunca em estratégias de ataque.
- Se o texto indicar risco de suicídio, autoagressão, violência física iminente ou risco grave para crianças, idosos ou pessoas vulneráveis, reflita isso claramente em "risk_flags" e, nas "suggestions", recomende buscar ajuda humana imediata (por exemplo, CVV 188, Polícia 190, Central 180, SAMU 192 ou serviços locais de proteção), SEM detalhar planos perigosos.
- NÃO dê instruções de autoagressão, confronto físico, invasão de privacidade, perseguição, chantagem ou qualquer outra ação ilegal.
- Lembre-se: seu papel é apoiar na organização das informações e detecção de riscos, não substituir profissionais humanos.

Responda APENAS com o JSON, sem texto adicional.`

const VOTING_SYSTEM_PROMPT = `Você é um validador de análises. Recebeu análises de outras IAs e deve votar se concorda ou não.

Analise as análises anteriores e o texto original. Retorne um JSON:
{
  "approved": true/false,
  "agreement_score": 0.0 a 1.0,
  "justification": "breve justificativa",
  "concerns": ["preocupações se houver"]
}

Responda APENAS com o JSON.`

const CONSENSUS_SYSTEM_PROMPT = `Você é um mediador de consenso. Baseado nas análises e votações, determine o resultado final.

Retorne um JSON:
{
  "final_consensus": true/false,
  "confidence_level": 0.0 a 1.0,
  "summary": "resumo do consenso",
  "final_themes": ["temas finais acordados"],
  "final_emotions": ["emoções finais acordadas"],
  "final_intensity": 0.0 a 1.0,
  "recommendations": ["recomendações finais"]
}

Responda APENAS com o JSON.`

// ============================================
// CLIENTE OPENAI
// ============================================

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function callOpenAI(prompt: string, systemPrompt: string): Promise<IAResponse> {
  const startTime = Date.now()
  
  try {
    const client = getOpenAIClient()
    if (!client) {
      return {
        success: false,
        provider: 'openai',
        response: '',
        themes: [],
        emotions: [],
        intensity: 0,
        risk_flags: [],
        suggestions: [],
        confidence: 0,
        latency_ms: Date.now() - startTime,
        error: 'API key não configurada'
      }
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    try {
      const parsed = JSON.parse(responseText)
      return {
        success: true,
        provider: 'openai',
        response: responseText,
        themes: parsed.themes || [],
        emotions: parsed.emotions || [],
        intensity: parsed.intensity || 0,
        risk_flags: parsed.risk_flags || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8,
        latency_ms: Date.now() - startTime
      }
    } catch {
      return {
        success: true,
        provider: 'openai',
        response: responseText,
        themes: [],
        emotions: [],
        intensity: 0,
        risk_flags: [],
        suggestions: [],
        confidence: 0.5,
        latency_ms: Date.now() - startTime
      }
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'openai',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

// ============================================
// CLIENTE ANTHROPIC (Claude)
// ============================================

export async function callAnthropic(prompt: string, systemPrompt: string): Promise<IAResponse> {
  const startTime = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'anthropic',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: 'API key não configurada'
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const responseText = data.content?.[0]?.text || '{}'

    try {
      const parsed = JSON.parse(responseText)
      return {
        success: true,
        provider: 'anthropic',
        response: responseText,
        themes: parsed.themes || [],
        emotions: parsed.emotions || [],
        intensity: parsed.intensity || 0,
        risk_flags: parsed.risk_flags || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8,
        latency_ms: Date.now() - startTime
      }
    } catch {
      return {
        success: true,
        provider: 'anthropic',
        response: responseText,
        themes: [],
        emotions: [],
        intensity: 0,
        risk_flags: [],
        suggestions: [],
        confidence: 0.5,
        latency_ms: Date.now() - startTime
      }
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'anthropic',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

// ============================================
// CLIENTE TOGETHER AI
// ============================================

export async function callTogether(prompt: string, systemPrompt: string): Promise<IAResponse> {
  const startTime = Date.now()
  const apiKey = process.env.TOGETHER_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'together',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: 'API key não configurada'
    }
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-70b-chat-hf',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content || '{}'

    try {
      const parsed = JSON.parse(responseText)
      return {
        success: true,
        provider: 'together',
        response: responseText,
        themes: parsed.themes || [],
        emotions: parsed.emotions || [],
        intensity: parsed.intensity || 0,
        risk_flags: parsed.risk_flags || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8,
        latency_ms: Date.now() - startTime
      }
    } catch {
      return {
        success: true,
        provider: 'together',
        response: responseText,
        themes: [],
        emotions: [],
        intensity: 0,
        risk_flags: [],
        suggestions: [],
        confidence: 0.5,
        latency_ms: Date.now() - startTime
      }
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'together',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

// ============================================
// CLIENTE GOOGLE GEMINI
// ============================================

export async function callGemini(prompt: string, systemPrompt: string): Promise<IAResponse> {
  const startTime = Date.now()
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'gemini',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: 'API key não configurada'
    }
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    })

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    try {
      const parsed = JSON.parse(responseText)
      return {
        success: true,
        provider: 'gemini',
        response: responseText,
        themes: parsed.themes || [],
        emotions: parsed.emotions || [],
        intensity: parsed.intensity || 0,
        risk_flags: parsed.risk_flags || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8,
        latency_ms: Date.now() - startTime
      }
    } catch {
      return {
        success: true,
        provider: 'gemini',
        response: responseText,
        themes: [],
        emotions: [],
        intensity: 0,
        risk_flags: [],
        suggestions: [],
        confidence: 0.5,
        latency_ms: Date.now() - startTime
      }
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'gemini',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

// ============================================
// CLIENTE GROQ (Rápido)
// ============================================

export async function callGroq(prompt: string, systemPrompt: string): Promise<IAResponse> {
  const startTime = Date.now()
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'groq',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: 'API key não configurada'
    }
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content || '{}'

    try {
      const parsed = JSON.parse(responseText)
      return {
        success: true,
        provider: 'groq',
        response: responseText,
        themes: parsed.themes || [],
        emotions: parsed.emotions || [],
        intensity: parsed.intensity || 0,
        risk_flags: parsed.risk_flags || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8,
        latency_ms: Date.now() - startTime
      }
    } catch {
      return {
        success: true,
        provider: 'groq',
        response: responseText,
        themes: [],
        emotions: [],
        intensity: 0,
        risk_flags: [],
        suggestions: [],
        confidence: 0.5,
        latency_ms: Date.now() - startTime
      }
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'groq',
      response: '',
      themes: [],
      emotions: [],
      intensity: 0,
      risk_flags: [],
      suggestions: [],
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

// ============================================
// FUNÇÃO PRINCIPAL: ANÁLISE COLABORATIVA REAL
// ============================================

export async function analiseColaborativaReal(
  text: string,
  providers: string[] = ['openai']
): Promise<{
  success: boolean
  analyses: IAResponse[]
  consensus: any
  finalResult: {
    themes: string[]
    emotions: string[]
    intensity: number
    risk_flags: string[]
    suggestions: string[]
    confidence: number
  }
  metadata: {
    total_providers: number
    successful_providers: number
    total_latency_ms: number
    timestamp: string
  }
}> {
  console.log('🚀 Iniciando análise colaborativa REAL...')
  console.log(`📊 Provedores: ${providers.join(', ')}`)
  
  const startTime = Date.now()
  const analyses: IAResponse[] = []

  // Mapeamento de provedores para funções
  const providerFunctions: Record<string, (prompt: string, system: string) => Promise<IAResponse>> = {
    'openai': callOpenAI,
    'anthropic': callAnthropic,
    'together': callTogether,
    'gemini': callGemini,
    'groq': callGroq
  }

  // ETAPA 1: Análise paralela de todos os provedores
  console.log('📝 ETAPA 1: Análise colaborativa...')
  
  const analysisPromises = providers.map(async (provider) => {
    const fn = providerFunctions[provider]
    if (fn) {
      const result = await fn(text, ANALYSIS_SYSTEM_PROMPT)
      console.log(`  ✅ ${provider}: ${result.success ? 'OK' : 'ERRO'} (${result.latency_ms}ms)`)
      return result
    }
    return null
  })

  const results = await Promise.all(analysisPromises)
  results.forEach(r => r && analyses.push(r))

  // ETAPA 2: Consolidar resultados
  console.log('🔄 ETAPA 2: Consolidando resultados...')
  
  const successfulAnalyses = analyses.filter(a => a.success)
  
  // Agregar temas (união de todos)
  const allThemes = new Set<string>()
  const allEmotions = new Set<string>()
  const allRiskFlags = new Set<string>()
  const allSuggestions = new Set<string>()
  let totalIntensity = 0
  let totalConfidence = 0

  successfulAnalyses.forEach(a => {
    a.themes.forEach(t => allThemes.add(t))
    a.emotions.forEach(e => allEmotions.add(e))
    a.risk_flags.forEach(r => allRiskFlags.add(r))
    a.suggestions.forEach(s => allSuggestions.add(s))
    totalIntensity += a.intensity
    totalConfidence += a.confidence
  })

  const avgIntensity = successfulAnalyses.length > 0 ? totalIntensity / successfulAnalyses.length : 0
  const avgConfidence = successfulAnalyses.length > 0 ? totalConfidence / successfulAnalyses.length : 0

  const finalResult = {
    themes: Array.from(allThemes),
    emotions: Array.from(allEmotions),
    intensity: avgIntensity,
    risk_flags: Array.from(allRiskFlags),
    suggestions: Array.from(allSuggestions),
    confidence: avgConfidence
  }

  console.log('✅ Análise colaborativa concluída!')
  console.log(`📊 Temas: ${finalResult.themes.length}`)
  console.log(`😔 Emoções: ${finalResult.emotions.length}`)
  console.log(`⚡ Intensidade: ${(finalResult.intensity * 100).toFixed(0)}%`)

  return {
    success: successfulAnalyses.length > 0,
    analyses,
    consensus: {
      agreement: successfulAnalyses.length / providers.length,
      themes_agreement: finalResult.themes.length > 0
    },
    finalResult,
    metadata: {
      total_providers: providers.length,
      successful_providers: successfulAnalyses.length,
      total_latency_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  }
}

// ============================================
// FUNÇÕES DE CHAT (retornam texto, não JSON)
// ============================================

export async function chatOpenAI(prompt: string, systemPrompt: string): Promise<{
  success: boolean
  response: string
  confidence: number
  latency_ms: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const client = getOpenAIClient()
    if (!client) {
      return {
        success: false,
        response: '',
        confidence: 0,
        latency_ms: Date.now() - startTime,
        error: 'API key não configurada'
      }
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    return {
      success: true,
      response: responseText,
      confidence: 0.9,
      latency_ms: Date.now() - startTime
    }
  } catch (error: any) {
    console.error('[chatOpenAI] Erro:', error.message)
    return {
      success: false,
      response: '',
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

export async function chatGroq(prompt: string, systemPrompt: string): Promise<{
  success: boolean
  response: string
  confidence: number
  latency_ms: number
  error?: string
}> {
  const startTime = Date.now()
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    return {
      success: false,
      response: '',
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: 'GROQ_API_KEY não configurada'
    }
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content || ''

    return {
      success: true,
      response: responseText,
      confidence: 0.85,
      latency_ms: Date.now() - startTime
    }
  } catch (error: any) {
    console.error('[chatGroq] Erro:', error.message)
    return {
      success: false,
      response: '',
      confidence: 0,
      latency_ms: Date.now() - startTime,
      error: error.message
    }
  }
}

// ============================================
// EXPORTAR PROMPTS PARA USO EXTERNO
// ============================================

export const PROMPTS = {
  ANALYSIS: ANALYSIS_SYSTEM_PROMPT,
  VOTING: VOTING_SYSTEM_PROMPT,
  CONSENSUS: CONSENSUS_SYSTEM_PROMPT
}
