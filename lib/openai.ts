import OpenAI from 'openai'
import { COACH_CLARITY_SYSTEM_PROMPT } from './prompts/coachPrompt'

// ✅ FUNÇÃO SEGURA PARA VERIFICAR CHAVES (só roda quando chamada)
function getAIKeys() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim()
  const togetherApiKey = process.env.TOGETHER_API_KEY?.trim()
  
  return {
    apiKey,
    anthropicApiKey,
    togetherApiKey,
    hasAnyKey: !!(apiKey || anthropicApiKey || togetherApiKey)
  }
}

// ✅ VALIDAÇÃO SÓ QUANDO NECESSÁRIO
function assertHasAIKey() {
  const { hasAnyKey } = getAIKeys()
  if (!hasAnyKey) {
    console.error('ERRO: Nenhuma chave de API encontrada (OPENAI, ANTHROPIC ou TOGETHER)')
    throw new Error('Nenhuma chave de API de IA encontrada no ambiente')
  }
}

// ✅ CLIENTS SÃO CRIADOS SOB DEMANDA
function getOpenAIClient() {
  const { apiKey } = getAIKeys()
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

function getAnthropicClient() {
  const { anthropicApiKey } = getAIKeys()
  if (!anthropicApiKey) return null
  return anthropicApiKey
}

function getTogetherClient() {
  const { togetherApiKey } = getAIKeys()
  if (!togetherApiKey) return null
  return togetherApiKey
}

// Função para chat com Coach de Clareza
export async function chatWithCoach(message: string, conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>) {
  assertHasAIKey() // Só valida quando a função é chamada
  
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('Chave da API OpenAI não configurada. Adicione OPENAI_API_KEY no .env.local')
  }
  
  const messages = [
    { role: 'system' as const, content: COACH_CLARITY_SYSTEM_PROMPT },
    ...(conversationHistory || []),
    { role: 'user' as const, content: message }
  ]

  try {
    // Tentar com GPT-4 primeiro
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })
    return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'
  } catch (error) {
    // Se GPT-4 falhar (quota, modelo não disponível), tentar GPT-3.5
    console.warn('GPT-4 falhou, tentando GPT-3.5-turbo:', error)
    
    try {
      const fallbackCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      })
      return fallbackCompletion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'
    } catch (fallbackError) {
      console.error('Ambos os modelos falharam:', fallbackError)
      throw fallbackError
    }
  }
}

// Função para transcrever áudio com Whisper
export async function transcribeAudio(audioFile: File | Blob) {
  assertHasAIKey() // Só valida quando a função é chamada
  
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('Cliente OpenAI não disponível')
  }
  
  try {
    // Converter para formato compatível com a API da OpenAI
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Criar um File-like object para a API
    const file = new File([buffer], 'audio.webm', { 
      type: audioFile.type || 'audio/webm' 
    })
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'pt',
    })

    return transcription.text
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error)
    throw new Error(`Erro na transcrição OpenAI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Função para analisar padrões com múltiplos providers (fallback)
export async function analyzePatterns(text: string) {
  const analysisPrompt = `Analise o texto abaixo e extraia informações estruturadas sobre padrões emocionais e comportamentais, sem expor o conteúdo original:

Texto: "${text}"

Retorne SOMENTE um JSON com este formato:
{
  "themes": ["tema1", "tema2"],
  "emotions": ["emoção1", "emoção2"],
  "intensity": 0.0,
  "risk_flags": ["flag1" se houver],
  "suggestions": ["sugestão1", "sugestão2"]
}`

  const { apiKey, anthropicApiKey, togetherApiKey } = getAIKeys()

  // Tentar OpenAI primeiro
  if (apiKey) {
    try {
      console.log('Tentando análise com OpenAI...')
      const openai = getOpenAIClient()
      if (!openai) throw new Error('Cliente OpenAI não disponível')
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Você é um analista de padrões emocionais que retorna apenas JSON estruturado.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      })

      const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
      console.log('Análise OpenAI bem-sucedida:', result)
      return result
    } catch (error) {
      console.error('Erro na análise OpenAI:', error)
    }
  }

  // Tentar Anthropic Claude
  if (anthropicApiKey) {
    try {
      console.log('Tentando análise com Anthropic Claude...')
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          messages: [
            { role: 'user', content: `Você é um analista de padrões emocionais que retorna apenas JSON estruturado. ${analysisPrompt}` }
          ]
        })
      })

      const result = await response.json()
      const parsed = JSON.parse(result.content[0]?.text || '{}')
      console.log('Análise Anthropic bem-sucedida:', parsed)
      return parsed
    } catch (error) {
      console.error('Erro na análise Anthropic:', error)
    }
  }

  // Tentar Together.ai
  if (togetherApiKey) {
    try {
      console.log('Tentando análise com Together.ai...')
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${togetherApiKey}`
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
          messages: [
            { role: 'system', content: 'Você é um analista de padrões emocionais que retorna apenas JSON estruturado.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 500,
        })
      })

      const result = await response.json()
      const parsed = JSON.parse(result.choices[0]?.message?.content || '{}')
      console.log('Análise Together.ai bem-sucedida:', parsed)
      return parsed
    } catch (error) {
      console.error('Erro na análise Together.ai:', error)
    }
  }

  // Fallback se todos falharem
  console.error('Todos os providers falharam, retornando resultado vazio')
  return {
    themes: [],
    emotions: [],
    intensity: 0,
    risk_flags: [],
    suggestions: []
  }
}
