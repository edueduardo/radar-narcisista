/**
 * PROVEDORES DE IA
 * Conectores para múltiplas IAs: OpenAI, Gemini, Claude, Groq
 */

// ============================================
// TIPOS
// ============================================

export interface AIProvider {
  id: string
  name: string
  available: boolean
  model: string
}

export interface AIResponse {
  content: string
  provider: string
  model: string
  tokens?: number
}

// ============================================
// VERIFICAR DISPONIBILIDADE
// ============================================

export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = []

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      id: 'openai',
      name: 'OpenAI GPT-4',
      available: true,
      model: 'gpt-4'
    })
  }

  // Google Gemini
  if (process.env.GOOGLE_AI_API_KEY) {
    providers.push({
      id: 'gemini',
      name: 'Google Gemini',
      available: true,
      model: 'gemini-pro'
    })
  }

  // Anthropic Claude
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      id: 'claude',
      name: 'Anthropic Claude',
      available: true,
      model: 'claude-3-sonnet'
    })
  }

  // Groq (LLaMA)
  if (process.env.GROQ_API_KEY) {
    providers.push({
      id: 'groq',
      name: 'Groq LLaMA',
      available: true,
      model: 'llama-3.1-70b'
    })
  }

  return providers
}

// ============================================
// OPENAI
// ============================================

async function callOpenAI(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  const data = await response.json()
  
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model: 'gpt-4',
    tokens: data.usage?.total_tokens
  }
}

// ============================================
// GOOGLE GEMINI
// ============================================

async function callGemini(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    }
  )

  const data = await response.json()
  
  return {
    content: data.candidates[0].content.parts[0].text,
    provider: 'gemini',
    model: 'gemini-pro'
  }
}

// ============================================
// ANTHROPIC CLAUDE
// ============================================

async function callClaude(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  })

  const data = await response.json()
  
  return {
    content: data.content[0].text,
    provider: 'claude',
    model: 'claude-3-sonnet',
    tokens: data.usage?.input_tokens + data.usage?.output_tokens
  }
}

// ============================================
// GROQ (LLaMA)
// ============================================

async function callGroq(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  const data = await response.json()
  
  return {
    content: data.choices[0].message.content,
    provider: 'groq',
    model: 'llama-3.1-70b',
    tokens: data.usage?.total_tokens
  }
}

// ============================================
// FUNÇÃO PRINCIPAL - CHAMAR IA
// ============================================

export async function callAI(
  provider: string,
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse> {
  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, systemPrompt)
    case 'gemini':
      return callGemini(prompt, systemPrompt)
    case 'claude':
      return callClaude(prompt, systemPrompt)
    case 'groq':
      return callGroq(prompt, systemPrompt)
    default:
      throw new Error(`Provedor de IA não suportado: ${provider}`)
  }
}

// ============================================
// FUNÇÃO DE CONSENSO - MÚLTIPLAS IAs
// ============================================

export async function callMultipleAIs(
  providers: string[],
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse[]> {
  const results = await Promise.allSettled(
    providers.map(provider => callAI(provider, prompt, systemPrompt))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<AIResponse> => r.status === 'fulfilled')
    .map(r => r.value)
}
