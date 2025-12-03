/**
 * DETECÇÃO DE RISCO - Sistema Unificado
 * PENDENTE-V2 - IMPLEMENTADO
 * 
 * Sistema centralizado para detectar riscos em:
 * - Tags do diário
 * - Texto do chat
 * - Respostas do teste de clareza
 * 
 * Cria risk_alerts automaticamente quando detecta padrões de risco.
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TIPOS
// ============================================================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RiskCategory = 'PHYSICAL_VIOLENCE' | 'EMOTIONAL_ABUSE' | 'FINANCIAL_ABUSE' | 'ISOLATION' | 'OTHER'
export type RiskSource = 'clarity_test' | 'chat' | 'diary' | 'manual'

export interface RiskDetectionResult {
  detected: boolean
  level: RiskLevel
  category: RiskCategory
  triggers: string[]
  recommendation: string
}

export interface RiskAlert {
  user_id: string
  source: RiskSource
  level: RiskLevel
  category: RiskCategory
  recommendation: string
  trigger_data?: Record<string, unknown>
}

// ============================================================================
// PADRÕES DE RISCO
// ============================================================================

// Tags que indicam risco físico (CRITICAL)
const CRITICAL_TAGS = [
  'violencia',
  'violência',
  'agressao',
  'agressão',
  'bater',
  'bateu',
  'apanhar',
  'apanhei',
  'empurrar',
  'empurrou',
  'estrangular',
  'estrangulou',
  'ameaca',
  'ameaça',
  'ameacou',
  'ameaçou',
  'matar',
  'morte',
  'suicidio',
  'suicídio',
  'arma',
  'faca',
  'sangue',
  'hospital',
  'policia',
  'polícia',
  'delegacia'
]

// Tags que indicam risco alto (HIGH)
const HIGH_RISK_TAGS = [
  'medo',
  'panico',
  'pânico',
  'terror',
  'perigo',
  'fuga',
  'fugir',
  'esconder',
  'socorro',
  'ajuda',
  'desespero',
  'desesperada',
  'presa',
  'refem',
  'refém',
  'trancada',
  'isolada',
  'sozinha',
  'ninguem',
  'ninguém'
]

// Tags que indicam risco médio (MEDIUM)
const MEDIUM_RISK_TAGS = [
  'abuso',
  'manipulacao',
  'manipulação',
  'controle',
  'ciumes',
  'ciúmes',
  'possessivo',
  'possessiva',
  'humilhacao',
  'humilhação',
  'xingamento',
  'insulto',
  'grito',
  'gritar',
  'ameaca',
  'ameaça',
  'chantagem',
  'culpa',
  'vergonha'
]

// Regex para detecção em texto
const PHYSICAL_RISK_REGEX = /\b(bate|bateu|batendo|apanha|apanhei|apanhou|agred|agress|violen|ameaç|ameac|mata|matar|morr|suicid|arma|faca|sangue|hospital|policia|polícia|delegacia|socorro|ajuda|perigo|medo|panico|pânico|terror)\w*/gi

const EMOTIONAL_RISK_REGEX = /\b(manipul|control|ciúme|ciume|possess|humilh|xing|insult|grit|chantag|culp|vergonha|isol|sozinha|ninguém|ninguem|presa|refém|refem|trancada)\w*/gi

// ============================================================================
// FUNÇÕES DE DETECÇÃO
// ============================================================================

/**
 * Detecta risco em uma lista de tags
 */
export function detectRiskFromTags(tags: string[]): RiskDetectionResult {
  const normalizedTags = tags.map(t => t.toLowerCase().trim())
  const triggers: string[] = []
  let maxLevel: RiskLevel = 'LOW'
  let category: RiskCategory = 'OTHER'

  // Verificar tags críticas
  for (const tag of normalizedTags) {
    if (CRITICAL_TAGS.some(ct => tag.includes(ct))) {
      triggers.push(tag)
      maxLevel = 'CRITICAL'
      category = 'PHYSICAL_VIOLENCE'
    }
  }

  // Verificar tags de alto risco
  if (maxLevel !== 'CRITICAL') {
    for (const tag of normalizedTags) {
      if (HIGH_RISK_TAGS.some(ht => tag.includes(ht))) {
        triggers.push(tag)
        if (maxLevel !== 'HIGH') maxLevel = 'HIGH'
        if (category === 'OTHER') category = 'PHYSICAL_VIOLENCE'
      }
    }
  }

  // Verificar tags de risco médio
  if (maxLevel === 'LOW') {
    for (const tag of normalizedTags) {
      if (MEDIUM_RISK_TAGS.some(mt => tag.includes(mt))) {
        triggers.push(tag)
        maxLevel = 'MEDIUM'
        category = 'EMOTIONAL_ABUSE'
      }
    }
  }

  return {
    detected: triggers.length > 0,
    level: maxLevel,
    category,
    triggers,
    recommendation: getRecommendation(maxLevel, category)
  }
}

/**
 * Detecta risco em texto livre (chat, diário)
 */
export function detectRiskFromText(text: string): RiskDetectionResult {
  const triggers: string[] = []
  let maxLevel: RiskLevel = 'LOW'
  let category: RiskCategory = 'OTHER'

  // Verificar padrões de risco físico
  const physicalMatches = text.match(PHYSICAL_RISK_REGEX)
  if (physicalMatches && physicalMatches.length > 0) {
    triggers.push(...physicalMatches.slice(0, 5))
    maxLevel = physicalMatches.length >= 3 ? 'CRITICAL' : 'HIGH'
    category = 'PHYSICAL_VIOLENCE'
  }

  // Verificar padrões de risco emocional
  if (maxLevel === 'LOW') {
    const emotionalMatches = text.match(EMOTIONAL_RISK_REGEX)
    if (emotionalMatches && emotionalMatches.length > 0) {
      triggers.push(...emotionalMatches.slice(0, 5))
      maxLevel = emotionalMatches.length >= 3 ? 'HIGH' : 'MEDIUM'
      category = 'EMOTIONAL_ABUSE'
    }
  }

  return {
    detected: triggers.length > 0,
    level: maxLevel,
    category,
    triggers: [...new Set(triggers)], // Remove duplicatas
    recommendation: getRecommendation(maxLevel, category)
  }
}

/**
 * Detecta risco combinando tags e texto
 */
export function detectRisk(input: {
  tags?: string[]
  text?: string
}): RiskDetectionResult {
  const results: RiskDetectionResult[] = []

  if (input.tags && input.tags.length > 0) {
    results.push(detectRiskFromTags(input.tags))
  }

  if (input.text) {
    results.push(detectRiskFromText(input.text))
  }

  if (results.length === 0) {
    return {
      detected: false,
      level: 'LOW',
      category: 'OTHER',
      triggers: [],
      recommendation: ''
    }
  }

  // Combinar resultados (pegar o mais grave)
  const combined = results.reduce((acc, curr) => {
    if (!acc.detected && curr.detected) return curr
    if (curr.detected && getLevelPriority(curr.level) > getLevelPriority(acc.level)) {
      return {
        ...curr,
        triggers: [...acc.triggers, ...curr.triggers]
      }
    }
    return {
      ...acc,
      triggers: [...acc.triggers, ...curr.triggers]
    }
  })

  return {
    ...combined,
    triggers: [...new Set(combined.triggers)]
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getLevelPriority(level: RiskLevel): number {
  const priorities: Record<RiskLevel, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  }
  return priorities[level]
}

function getRecommendation(level: RiskLevel, category: RiskCategory): string {
  if (level === 'CRITICAL') {
    return 'Situação de risco grave detectada. Se você está em perigo imediato, ligue 190 (Polícia) ou 180 (Central da Mulher). Considere ir a um local seguro.'
  }

  if (level === 'HIGH') {
    if (category === 'PHYSICAL_VIOLENCE') {
      return 'Sinais de risco físico detectados. Recomendamos revisar seu Plano de Segurança e identificar um local seguro caso precise sair rapidamente.'
    }
    return 'Sinais de risco detectados. Considere conversar com alguém de confiança ou um profissional sobre sua situação.'
  }

  if (level === 'MEDIUM') {
    return 'Alguns padrões preocupantes foram identificados. Lembre-se de que você não está sozinha e existem recursos disponíveis para ajudar.'
  }

  return ''
}

// ============================================================================
// CRIAÇÃO DE ALERTAS
// ============================================================================

/**
 * Cria um alerta de risco no banco de dados
 */
export async function createRiskAlert(
  supabaseUrl: string,
  supabaseKey: string,
  alert: RiskAlert
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('risk_alerts')
      .insert({
        user_id: alert.user_id,
        source: alert.source,
        level: alert.level,
        category: alert.category,
        recommendation: alert.recommendation,
        trigger_data: alert.trigger_data || {},
        is_resolved: false,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao criar alerta:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Erro ao criar alerta:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Processa entrada do diário e cria alerta se necessário
 */
export async function processJournalEntry(
  supabaseUrl: string,
  supabaseKey: string,
  entry: {
    user_id: string
    content: string
    tags: string[]
  }
): Promise<RiskDetectionResult & { alertCreated: boolean }> {
  const result = detectRisk({
    text: entry.content,
    tags: entry.tags
  })

  let alertCreated = false

  if (result.detected && result.level !== 'LOW') {
    const alertResult = await createRiskAlert(supabaseUrl, supabaseKey, {
      user_id: entry.user_id,
      source: 'diary',
      level: result.level,
      category: result.category,
      recommendation: result.recommendation,
      trigger_data: {
        triggers: result.triggers,
        tags: entry.tags
      }
    })

    alertCreated = alertResult.success
  }

  return { ...result, alertCreated }
}

/**
 * Processa mensagem do chat e cria alerta se necessário
 */
export async function processChatMessage(
  supabaseUrl: string,
  supabaseKey: string,
  message: {
    user_id: string
    content: string
  }
): Promise<RiskDetectionResult & { alertCreated: boolean }> {
  const result = detectRiskFromText(message.content)

  let alertCreated = false

  if (result.detected && result.level !== 'LOW') {
    const alertResult = await createRiskAlert(supabaseUrl, supabaseKey, {
      user_id: message.user_id,
      source: 'chat',
      level: result.level,
      category: result.category,
      recommendation: result.recommendation,
      trigger_data: {
        triggers: result.triggers
      }
    })

    alertCreated = alertResult.success
  }

  return { ...result, alertCreated }
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default {
  detectRisk,
  detectRiskFromTags,
  detectRiskFromText,
  createRiskAlert,
  processJournalEntry,
  processChatMessage,
  CRITICAL_TAGS,
  HIGH_RISK_TAGS,
  MEDIUM_RISK_TAGS
}
