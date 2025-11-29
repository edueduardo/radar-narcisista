/**
 * CHAT COM IAs COLABORATIVAS - RADAR NARCISISTA
 * Sistema de múltiplas IAs analisando e respondendo juntas
 * 
 * BACKUP: Criado em 24/11/2025 23:20
 * LOCAL: lib/chat-colaborativo.ts
 */

import { chatOpenAI, chatGroq } from './ia-conexoes-reais'
import { COACH_PROFISSIONAL_SYSTEM_PROMPT } from './prompts/coach-profissional'

// ============================================
// TIPOS
// ============================================

export interface ChatColaborativoConfig {
  usarMultiplasIAs: boolean
  iasAtivas: string[]
  exigirConsenso: boolean
  thresholdConsenso: number // 0-1
  mostrarTransparencia: boolean
}

export interface RespostaColaborativa {
  respostaFinal: string
  analises: {
    ia: string
    resposta: string
    confianca: number
    latencia: number
    sucesso: boolean
  }[]
  consenso: {
    alcancado: boolean
    nivel: number
    divergencias: string[]
  }
  transparencia: {
    iasUsadas: string[]
    tempoTotal: number
    metodo: string
  }
}

// ============================================
// CONFIGURAÇÃO PADRÃO
// ============================================

const CONFIG_PADRAO: ChatColaborativoConfig = {
  usarMultiplasIAs: true,
  iasAtivas: ['openai', 'groq'], // Groq é rápido e gratuito
  exigirConsenso: false,
  thresholdConsenso: 0.7,
  mostrarTransparencia: false
}

// ============================================
// PROMPT DO COACH DE CLAREZA
// Agora usa o prompt profissional completo
// ============================================

const COACH_SYSTEM_PROMPT = COACH_PROFISSIONAL_SYSTEM_PROMPT

// ============================================
// FUNÇÃO PRINCIPAL: CHAT COLABORATIVO
// ============================================

export async function chatColaborativo(
  mensagem: string,
  historico: { role: 'user' | 'assistant'; content: string }[] = [],
  config: Partial<ChatColaborativoConfig> = {}
): Promise<RespostaColaborativa> {
  const cfg = { ...CONFIG_PADRAO, ...config }
  const startTime = Date.now()
  
  console.log('🤖 Iniciando chat colaborativo...')
  console.log(`📊 IAs ativas: ${cfg.iasAtivas.join(', ')}`)

  // Construir prompt com histórico
  const promptCompleto = construirPrompt(mensagem, historico)

  // Se não usar múltiplas IAs, usar só OpenAI
  if (!cfg.usarMultiplasIAs || cfg.iasAtivas.length === 1) {
    const resposta = await chamarIA(cfg.iasAtivas[0] || 'openai', promptCompleto)
    return {
      respostaFinal: resposta.resposta,
      analises: [resposta],
      consenso: { alcancado: true, nivel: 1, divergencias: [] },
      transparencia: {
        iasUsadas: [resposta.ia],
        tempoTotal: Date.now() - startTime,
        metodo: 'single'
      }
    }
  }

  // Chamar múltiplas IAs em paralelo
  const promessas = cfg.iasAtivas.map(ia => chamarIA(ia, promptCompleto))
  const resultados = await Promise.all(promessas)

  // Filtrar respostas bem-sucedidas
  const respostasSucesso = resultados.filter(r => r.sucesso)

  if (respostasSucesso.length === 0) {
    // Fallback: resposta de emergência
    return {
      respostaFinal: gerarRespostaEmergencia(mensagem),
      analises: resultados,
      consenso: { alcancado: false, nivel: 0, divergencias: ['Nenhuma IA respondeu'] },
      transparencia: {
        iasUsadas: [],
        tempoTotal: Date.now() - startTime,
        metodo: 'emergency'
      }
    }
  }

  // Consolidar respostas
  const respostaFinal = consolidarRespostas(respostasSucesso, cfg)

  // Calcular consenso
  const consenso = calcularConsenso(respostasSucesso)

  return {
    respostaFinal,
    analises: resultados,
    consenso,
    transparencia: {
      iasUsadas: respostasSucesso.map(r => r.ia),
      tempoTotal: Date.now() - startTime,
      metodo: 'collaborative'
    }
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function construirPrompt(
  mensagem: string, 
  historico: { role: 'user' | 'assistant'; content: string }[]
): string {
  let prompt = ''
  
  // Adicionar últimas mensagens do histórico
  const ultimasMensagens = historico.slice(-6)
  if (ultimasMensagens.length > 0) {
    prompt += 'Contexto da conversa:\n'
    ultimasMensagens.forEach(msg => {
      prompt += `${msg.role === 'user' ? 'Usuário' : 'Coach'}: ${msg.content}\n`
    })
    prompt += '\n'
  }
  
  prompt += `Mensagem atual do usuário: ${mensagem}`
  
  return prompt
}

async function chamarIA(
  ia: string, 
  prompt: string
): Promise<{
  ia: string
  resposta: string
  confianca: number
  latencia: number
  sucesso: boolean
}> {
  const startTime = Date.now()
  
  try {
    let resultado: { success: boolean; response: string; confidence: number; latency_ms: number; error?: string }
    
    console.log(`[chamarIA] Chamando ${ia}...`)
    
    switch (ia) {
      case 'openai':
        resultado = await chatOpenAI(prompt, COACH_SYSTEM_PROMPT)
        break
      case 'groq':
        resultado = await chatGroq(prompt, COACH_SYSTEM_PROMPT)
        break
      default:
        // Fallback para OpenAI
        resultado = await chatOpenAI(prompt, COACH_SYSTEM_PROMPT)
    }

    console.log(`[chamarIA] ${ia} respondeu:`, {
      sucesso: resultado.success,
      temResposta: !!resultado.response,
      tamanho: resultado.response?.length || 0,
      latencia: resultado.latency_ms
    })

    if (!resultado.success) {
      console.error(`[chamarIA] ${ia} falhou:`, resultado.error)
      return {
        ia,
        resposta: '',
        confianca: 0,
        latencia: resultado.latency_ms,
        sucesso: false
      }
    }

    return {
      ia,
      resposta: resultado.response,
      confianca: resultado.confidence,
      latencia: resultado.latency_ms,
      sucesso: true
    }
  } catch (error: any) {
    console.error(`❌ Erro na IA ${ia}:`, error.message)
    return {
      ia,
      resposta: '',
      confianca: 0,
      latencia: Date.now() - startTime,
      sucesso: false
    }
  }
}

function consolidarRespostas(
  respostas: { ia: string; resposta: string; confianca: number }[],
  config: ChatColaborativoConfig
): string {
  if (respostas.length === 0) {
    return gerarRespostaEmergencia('')
  }

  if (respostas.length === 1) {
    return respostas[0].resposta
  }

  // Ordenar por confiança
  const ordenadas = [...respostas].sort((a, b) => b.confianca - a.confianca)

  // Se exigir consenso, verificar similaridade
  if (config.exigirConsenso) {
    const similaridade = calcularSimilaridade(ordenadas[0].resposta, ordenadas[1].resposta)
    if (similaridade < config.thresholdConsenso) {
      // Respostas muito diferentes - usar a mais confiante com aviso
      return ordenadas[0].resposta + '\n\n_[Nota: Esta resposta foi validada por múltiplas IAs]_'
    }
  }

  // Usar a resposta mais confiante
  return ordenadas[0].resposta
}

function calcularConsenso(
  respostas: { ia: string; resposta: string; confianca: number }[]
): { alcancado: boolean; nivel: number; divergencias: string[] } {
  if (respostas.length < 2) {
    return { alcancado: true, nivel: 1, divergencias: [] }
  }

  // Calcular similaridade média entre respostas
  let totalSimilaridade = 0
  let comparacoes = 0
  const divergencias: string[] = []

  for (let i = 0; i < respostas.length; i++) {
    for (let j = i + 1; j < respostas.length; j++) {
      const sim = calcularSimilaridade(respostas[i].resposta, respostas[j].resposta)
      totalSimilaridade += sim
      comparacoes++
      
      if (sim < 0.5) {
        divergencias.push(`${respostas[i].ia} vs ${respostas[j].ia}`)
      }
    }
  }

  const nivelConsenso = comparacoes > 0 ? totalSimilaridade / comparacoes : 1

  return {
    alcancado: nivelConsenso >= 0.6,
    nivel: nivelConsenso,
    divergencias
  }
}

function calcularSimilaridade(texto1: string, texto2: string): number {
  // Similaridade simples baseada em palavras comuns
  const palavras1 = new Set(texto1.toLowerCase().split(/\s+/))
  const palavras2 = new Set(texto2.toLowerCase().split(/\s+/))
  
  const intersecao = new Set([...palavras1].filter(x => palavras2.has(x)))
  const uniao = new Set([...palavras1, ...palavras2])
  
  return intersecao.size / uniao.size
}

function gerarRespostaEmergencia(mensagem: string): string {
  const respostasEmergencia = [
    'Entendo que você está passando por um momento difícil. Estou aqui para ouvir. Pode me contar mais sobre o que está sentindo?',
    'Obrigado por compartilhar isso comigo. Seus sentimentos são válidos. O que mais você gostaria de falar sobre isso?',
    'Percebo que essa situação está te afetando. Lembre-se: você não está sozinha. Quer explorar mais esse assunto?',
    'É corajoso da sua parte falar sobre isso. Como posso te ajudar a ter mais clareza sobre essa situação?'
  ]
  
  return respostasEmergencia[Math.floor(Math.random() * respostasEmergencia.length)]
}

// ============================================
// CONFIGURAÇÃO DO ADMIN
// ============================================

let configAtual: ChatColaborativoConfig = { ...CONFIG_PADRAO }

export function getConfigChatColaborativo(): ChatColaborativoConfig {
  return { ...configAtual }
}

export function setConfigChatColaborativo(novaConfig: Partial<ChatColaborativoConfig>): void {
  configAtual = { ...configAtual, ...novaConfig }
  console.log('⚙️ Config do chat atualizada:', configAtual)
}

export function resetConfigChatColaborativo(): void {
  configAtual = { ...CONFIG_PADRAO }
}
