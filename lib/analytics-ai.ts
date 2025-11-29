/**
 * ANALYTICS COACH IA - Radar Narcisista
 * 
 * Gera sugestões baseadas em métricas agregadas
 * Privacidade: NUNCA recebe dados pessoais
 */

import { exportMetricsForAI, saveIALog, IAExecutionLog } from './analytics-tracker'

// ============================================
// PROMPTS PRONTOS PARA CADA TIPO DE ANÁLISE
// ============================================

const PROMPTS = {
  geral: `Você é um Analytics Coach especialista em SaaS de saúde mental e segurança.
  
Analise estas métricas agregadas (sem dados pessoais) e gere 3-5 sugestões acionáveis:
- Foque em UX, SEO, conteúdo e otimização de custos
- Nunca sugira alterações que possam gatilhar ansiedade
- Priorize sugestões de alto impacto/baixo esforço
- Para cada sugestão: indique prioridade (alta/média/baixa) e motivo

Métricas:
{{METRICS}}`,

  seguranca: `Você é especialista em segurança digital e saúde mental.
  
Analise estas métricas de emergência e segurança:
- Picos de uso podem indicar gatilhos no conteúdo
- Horários críticos precisam atenção especial
- Páginas com mais emergências podem precisar de ajustes

Métricas:
{{METRICS}}`,

  funil: `Você é especialista em otimização de funil para produtos de saúde mental.
  
Analise o funil e identifique gargalos:
- Onde os usuários desistem?
- Taxas de conversão por etapa
- Sugestões para aumentar conclusão do teste

Métricas:
{{METRICS}}`,

  tecnico: `Você é especialista em performance e erros técnicos.
  
Analise estes dados técnicos:
- Rotas com mais erros precisam de atenção
- Performance lenta afeta experiência
- Drop-offs técnicos indicam bugs

Métricas:
{{METRICS}}`,

  feedback: `Você é especialista em análise de feedback qualitativo.
  
Analise estes ratings e feedbacks:
- O que os usuários gostam/não gostam?
- Pontos de confusão recorrentes
- Oportunidades de melhoria

Métricas:
{{METRICS}}`
}

// ============================================
// FUNÇÃO PRINCIPAL DE ANÁLISE
// ============================================

export interface AISuggestion {
  category: 'SEO' | 'FUNIL' | 'CUSTO' | 'CONTEUDO' | 'RETENCAO' | 'SEGURANCA' | 'TECNICO'
  suggestion: string
  priority: 'alta' | 'media' | 'baixa'
  reason: string
}

export async function generateAnalyticsInsights(
  model: 'openai' | 'anthropic' | 'groq' = 'openai',
  focus: 'geral' | 'seguranca' | 'funil' | 'tecnico' | 'feedback' = 'geral'
): Promise<AISuggestion[]> {
  const startTime = Date.now()
  const logId = `log_${startTime}`
  
  try {
    // Exportar métricas para IA
    const metricsJson = exportMetricsForAI()
    const prompt = PROMPTS[focus].replace('{{METRICS}}', metricsJson)
    
    // Chamar API da IA
    const response = await callAI(prompt, model)
    
    // Parse da resposta
    const suggestions = parseAIResponse(response)
    
    // Salvar log de auditoria
    saveIALog({
      id: logId,
      timestamp: new Date().toISOString(),
      model,
      metrics_analyzed: focus,
      suggestions_generated: suggestions.length,
      suggestions_text: suggestions.map(s => s.suggestion),
      status: 'success'
    })
    
    return suggestions
    
  } catch (error) {
    // Salvar log de erro
    saveIALog({
      id: logId,
      timestamp: new Date().toISOString(),
      model,
      metrics_analyzed: focus,
      suggestions_generated: 0,
      suggestions_text: [],
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
    
    throw error
  }
}

// ============================================
// INTEGRAÇÃO COM APIS DE IA
// ============================================

async function callAI(prompt: string, model: string): Promise<string> {
  const apiKey = getAPIKey(model)
  
  if (model === 'openai') {
    return await callOpenAI(prompt, apiKey)
  } else if (model === 'anthropic') {
    return await callAnthropic(prompt, apiKey)
  } else if (model === 'groq') {
    return await callGroq(prompt, apiKey)
  } else {
    throw new Error(`Modelo ${model} não suportado`)
  }
}

function getAPIKey(model: string): string {
  const keys = {
    openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    anthropic: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    groq: process.env.NEXT_PUBLIC_GROQ_API_KEY
  }
  
  const key = keys[model as keyof typeof keys]
  if (!key) {
    throw new Error(`API Key para ${model} não configurada`)
  }
  
  return key
}

// OpenAI (GPT-4)
async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um Analytics Coach especialista em SaaS de saúde emocional e segurança. Você analisa APENAS métricas agregadas, sem dados pessoais identificáveis. Não faça diagnósticos clínicos, não dê conselhos médicos ou jurídicos. Responda em português brasileiro.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// Anthropic (Claude)
async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Você é um Analytics Coach especialista em SaaS de saúde emocional e segurança. Você analisa APENAS métricas agregadas, sem dados pessoais identificáveis. Não faça diagnósticos clínicos, não dê conselhos médicos ou jurídicos. Responda em português brasileiro.\n\n${prompt}`
        }
      ]
    })
  })
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.content[0].text
}

// Groq (Llama 3 - grátis)
async function callGroq(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: 'Você é um Analytics Coach especialista em SaaS de saúde emocional e segurança. Você analisa APENAS métricas agregadas, sem dados pessoais identificáveis. Não faça diagnósticos clínicos, não dê conselhos médicos ou jurídicos. Responda em português brasileiro.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })
  
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

// ============================================
// PARSER DA RESPOSTA DA IA
// ============================================

function parseAIResponse(response: string): AISuggestion[] {
  const suggestions: AISuggestion[] = []
  
  // Procurar por sugestões no formato esperado
  const lines = response.split('\n')
  let currentSuggestion: Partial<AISuggestion> = {}
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Detectar categoria
    if (trimmed.match(/^(SEO|FUNIL|CUSTO|CONTEUDO|RETENCAO|SEGURANCA|TECNICO):/i)) {
      if (currentSuggestion.suggestion) {
        // Salvar sugestão anterior
        if (currentSuggestion.category && currentSuggestion.suggestion) {
          suggestions.push(currentSuggestion as AISuggestion)
        }
      }
      
      currentSuggestion = {
        category: trimmed.split(':')[0].toUpperCase() as AISuggestion['category']
      }
    }
    
    // Detectar prioridade
    if (trimmed.match(/prioridade:\s*(alta|média|baixa)/i)) {
      const priority = trimmed.match(/(alta|média|baixa)/i)?.[0]
      if (priority) {
        currentSuggestion.priority = priority === 'média' ? 'media' : priority as 'alta' | 'baixa'
      }
    }
    
    // Detectar sugestão
    if (trimmed.match(/^(sugestão|sugestao|ação|acao):/i) && !currentSuggestion.suggestion) {
      currentSuggestion.suggestion = trimmed.split(':').slice(1).join(':').trim()
    }
    
    // Detectar motivo
    if (trimmed.match(/^(motivo|porquê|por que):/i)) {
      currentSuggestion.reason = trimmed.split(':').slice(1).join(':').trim()
    }
  }
  
  // Adicionar última sugestão
  if (currentSuggestion.category && currentSuggestion.suggestion) {
    suggestions.push(currentSuggestion as AISuggestion)
  }
  
  // Se parsing falhar, criar sugestões genéricas
  if (suggestions.length === 0) {
    const paragraphs = response.split('\n\n').filter(p => p.trim())
    
    for (const para of paragraphs.slice(0, 5)) {
      suggestions.push({
        category: 'CONTEUDO',
        suggestion: para.trim(),
        priority: 'media',
        reason: 'Análise baseada nas métricas'
      })
    }
  }
  
  return suggestions
}

// ============================================
// FUNÇÕES DE CONFIGURAÇÃO
// ============================================

export interface AnalyticsConfig {
  enabled: boolean
  model: 'openai' | 'anthropic' | 'groq'
  auto_generate: boolean
  focus_areas: Array<'geral' | 'seguranca' | 'funil' | 'tecnico' | 'feedback'>
  privacy_mode: 'aggregated_only' | 'safe_samples'
}

export const defaultConfig: AnalyticsConfig = {
  enabled: true,
  model: 'openai',
  auto_generate: false,
  focus_areas: ['geral'],
  privacy_mode: 'aggregated_only'
}

// Salvar configuração
export const saveAnalyticsConfig = (config: AnalyticsConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rn_analytics_config', JSON.stringify(config))
  }
}

// Carregar configuração
export const getAnalyticsConfig = (): AnalyticsConfig => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('rn_analytics_config')
      return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig
    } catch {
      return defaultConfig
    }
  }
  return defaultConfig
}
