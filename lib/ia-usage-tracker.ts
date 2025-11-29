/**
 * RASTREADOR DE USO E CUSTOS DE IA
 * 
 * Rastreia todos os gastos com IA do sistema
 * Separa por: Sistema, Admin, Clientes
 */

// ============================================
// TIPOS
// ============================================

export interface IAUsageRecord {
  id: string
  timestamp: string
  provider: string // openai, groq, etc
  feature: string // chat, analise, geracao, etc
  source: 'system' | 'admin' | 'client'
  userId?: string
  tokensInput: number
  tokensOutput: number
  cost: number // em USD
  model: string
}

export interface IAUsageSummary {
  totalCost: number
  totalTokens: number
  byProvider: Record<string, { cost: number; tokens: number; requests: number }>
  byFeature: Record<string, { cost: number; tokens: number; requests: number }>
  bySource: Record<string, { cost: number; tokens: number; requests: number }>
  byHour: Record<string, number>
}

export interface IAControlConfig {
  provider: string
  enabled: boolean
  usagePercent: number // 0-100
  maxTokensPerDay: number
  maxCostPerDay: number // em USD
}

// ============================================
// PREÇOS POR PROVEDOR (USD por 1K tokens)
// ============================================

export const IA_PRICES: Record<string, { input: number; output: number }> = {
  // OpenAI
  'openai': { input: 0.01, output: 0.03 }, // GPT-4
  'openai-mini': { input: 0.00015, output: 0.0006 }, // GPT-4o-mini
  
  // Anthropic
  'claude': { input: 0.003, output: 0.015 }, // Claude 3 Sonnet
  'claude-haiku': { input: 0.00025, output: 0.00125 }, // Claude 3 Haiku
  
  // Google
  'gemini': { input: 0.00025, output: 0.0005 }, // Gemini Pro
  
  // Mistral
  'mistral': { input: 0.002, output: 0.006 }, // Mistral Large
  'mistral-small': { input: 0.0002, output: 0.0006 },
  
  // Together
  'together': { input: 0.0002, output: 0.0002 }, // LLaMA 70B
  
  // Cohere
  'cohere': { input: 0.0004, output: 0.0004 },
  
  // DeepSeek
  'deepseek': { input: 0.00014, output: 0.00028 }, // Muito barato!
  
  // Gratuitos
  'groq': { input: 0, output: 0 },
  'huggingface': { input: 0, output: 0 },
  'cerebras': { input: 0, output: 0 },
  
  // Perplexity
  'perplexity': { input: 0.001, output: 0.001 },
  
  // OpenRouter (varia)
  'openrouter': { input: 0.001, output: 0.002 },
}

// ============================================
// FEATURES DO SISTEMA QUE USAM IA
// ============================================

export const IA_FEATURES = {
  // Features para CLIENTES
  client: [
    { id: 'chat', name: 'Chat com IA', description: 'Conversa com assistente', avgTokens: 500 },
    { id: 'analise', name: 'Análise de Texto', description: 'Analisar mensagens do abusador', avgTokens: 800 },
    { id: 'diario', name: 'Análise do Diário', description: 'Processar entradas do diário', avgTokens: 600 },
    { id: 'teste', name: 'Teste de Clareza', description: 'Gerar resultado do teste', avgTokens: 400 },
    { id: 'transcricao', name: 'Transcrição de Áudio', description: 'Whisper para áudio', avgTokens: 200 },
  ],
  
  // Features para ADMIN
  admin: [
    { id: 'gerar-reels', name: 'Gerar Ideias Reels', description: 'IA Assistente - Reels', avgTokens: 1000 },
    { id: 'gerar-youtube', name: 'Gerar Ideias YouTube', description: 'IA Assistente - YouTube', avgTokens: 1500 },
    { id: 'gerar-tendencias', name: 'Analisar Tendências', description: 'IA Assistente - Trends', avgTokens: 800 },
    { id: 'gerar-roteiro', name: 'Gerar Roteiro', description: 'IA Assistente - Roteiros', avgTokens: 2000 },
    { id: 'moderar', name: 'Moderar Conteúdo', description: 'Aprovar/rejeitar histórias', avgTokens: 300 },
    { id: 'biblioteca', name: 'Gerar Respostas', description: 'Biblioteca de respostas', avgTokens: 500 },
  ],
  
  // Features do SISTEMA (automático)
  system: [
    { id: 'consenso', name: 'Consenso Multi-IA', description: 'Votação entre IAs', avgTokens: 1500 },
    { id: 'relatorio', name: 'Gerar Relatórios', description: 'Relatórios automáticos', avgTokens: 1000 },
    { id: 'backup-analise', name: 'Análise de Backup', description: 'Verificar integridade', avgTokens: 200 },
  ],
}

// ============================================
// FUNÇÕES DE RASTREAMENTO
// ============================================

const STORAGE_KEY = 'ia_usage_records'
const CONFIG_KEY = 'ia_control_config'

/**
 * Registrar uso de IA
 */
export function trackIAUsage(record: Omit<IAUsageRecord, 'id' | 'timestamp' | 'cost'>): IAUsageRecord {
  const prices = IA_PRICES[record.provider] || { input: 0.001, output: 0.002 }
  const cost = (record.tokensInput * prices.input / 1000) + (record.tokensOutput * prices.output / 1000)
  
  const fullRecord: IAUsageRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    cost,
  }
  
  // Salvar no localStorage
  const records = getUsageRecords()
  records.push(fullRecord)
  
  // Manter apenas últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const filtered = records.filter(r => new Date(r.timestamp) >= thirtyDaysAgo)
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  
  return fullRecord
}

/**
 * Obter todos os registros de uso
 */
export function getUsageRecords(): IAUsageRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Calcular resumo de uso
 */
export function calculateUsageSummary(period: 'hour' | 'day' | 'week' | 'month' = 'day'): IAUsageSummary {
  const records = getUsageRecords()
  
  // Filtrar por período
  const now = new Date()
  let startDate = new Date()
  
  switch (period) {
    case 'hour':
      startDate.setHours(now.getHours() - 1)
      break
    case 'day':
      startDate.setDate(now.getDate() - 1)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
  }
  
  const filtered = records.filter(r => new Date(r.timestamp) >= startDate)
  
  // Calcular totais
  const summary: IAUsageSummary = {
    totalCost: 0,
    totalTokens: 0,
    byProvider: {},
    byFeature: {},
    bySource: {},
    byHour: {},
  }
  
  for (const record of filtered) {
    const tokens = record.tokensInput + record.tokensOutput
    
    summary.totalCost += record.cost
    summary.totalTokens += tokens
    
    // Por provedor
    if (!summary.byProvider[record.provider]) {
      summary.byProvider[record.provider] = { cost: 0, tokens: 0, requests: 0 }
    }
    summary.byProvider[record.provider].cost += record.cost
    summary.byProvider[record.provider].tokens += tokens
    summary.byProvider[record.provider].requests++
    
    // Por feature
    if (!summary.byFeature[record.feature]) {
      summary.byFeature[record.feature] = { cost: 0, tokens: 0, requests: 0 }
    }
    summary.byFeature[record.feature].cost += record.cost
    summary.byFeature[record.feature].tokens += tokens
    summary.byFeature[record.feature].requests++
    
    // Por source
    if (!summary.bySource[record.source]) {
      summary.bySource[record.source] = { cost: 0, tokens: 0, requests: 0 }
    }
    summary.bySource[record.source].cost += record.cost
    summary.bySource[record.source].tokens += tokens
    summary.bySource[record.source].requests++
    
    // Por hora
    const hour = new Date(record.timestamp).getHours().toString().padStart(2, '0') + ':00'
    summary.byHour[hour] = (summary.byHour[hour] || 0) + record.cost
  }
  
  return summary
}

/**
 * Estimar custo mensal baseado no uso atual
 */
export function estimateMonthlyCost(): { 
  current: number
  projected: number
  byProvider: Record<string, number>
  bySource: Record<string, number>
} {
  const daySummary = calculateUsageSummary('day')
  const weekSummary = calculateUsageSummary('week')
  
  // Projeção baseada na média dos últimos 7 dias
  const avgDailyCost = weekSummary.totalCost / 7
  const projectedMonthly = avgDailyCost * 30
  
  const byProvider: Record<string, number> = {}
  for (const [provider, data] of Object.entries(weekSummary.byProvider)) {
    byProvider[provider] = (data.cost / 7) * 30
  }
  
  const bySource: Record<string, number> = {}
  for (const [source, data] of Object.entries(weekSummary.bySource)) {
    bySource[source] = (data.cost / 7) * 30
  }
  
  return {
    current: daySummary.totalCost,
    projected: projectedMonthly,
    byProvider,
    bySource,
  }
}

// ============================================
// CONTROLE DE USO
// ============================================

/**
 * Obter configuração de controle
 */
export function getIAControlConfig(): Record<string, IAControlConfig> {
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Salvar configuração de controle
 */
export function saveIAControlConfig(config: Record<string, IAControlConfig>): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

/**
 * Verificar se pode usar IA (baseado em limites)
 */
export function canUseIA(provider: string): { allowed: boolean; reason?: string } {
  const config = getIAControlConfig()[provider]
  
  if (!config) {
    return { allowed: true }
  }
  
  if (!config.enabled) {
    return { allowed: false, reason: 'IA desativada' }
  }
  
  if (config.usagePercent === 0) {
    return { allowed: false, reason: 'Uso definido como 0%' }
  }
  
  // Verificar limite diário de tokens
  const daySummary = calculateUsageSummary('day')
  const providerUsage = daySummary.byProvider[provider]
  
  if (providerUsage && config.maxTokensPerDay > 0) {
    if (providerUsage.tokens >= config.maxTokensPerDay) {
      return { allowed: false, reason: 'Limite diário de tokens atingido' }
    }
  }
  
  // Verificar limite diário de custo
  if (providerUsage && config.maxCostPerDay > 0) {
    if (providerUsage.cost >= config.maxCostPerDay) {
      return { allowed: false, reason: 'Limite diário de custo atingido' }
    }
  }
  
  // Aplicar porcentagem de uso (probabilidade)
  if (config.usagePercent < 100) {
    const random = Math.random() * 100
    if (random > config.usagePercent) {
      return { allowed: false, reason: `Uso limitado a ${config.usagePercent}%` }
    }
  }
  
  return { allowed: true }
}

/**
 * Gerar dados de exemplo para demonstração
 */
export function generateSampleData(): void {
  const providers = ['openai', 'groq', 'gemini', 'claude']
  const features = ['chat', 'analise', 'gerar-reels', 'diario']
  const sources: ('client' | 'admin' | 'system')[] = ['client', 'admin', 'system']
  
  const records: IAUsageRecord[] = []
  const now = new Date()
  
  // Gerar 100 registros dos últimos 7 dias
  for (let i = 0; i < 100; i++) {
    const hoursAgo = Math.floor(Math.random() * 168) // últimas 168 horas (7 dias)
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    
    const provider = providers[Math.floor(Math.random() * providers.length)]
    const feature = features[Math.floor(Math.random() * features.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    
    const tokensInput = Math.floor(Math.random() * 500) + 100
    const tokensOutput = Math.floor(Math.random() * 1000) + 200
    
    const prices = IA_PRICES[provider] || { input: 0.001, output: 0.002 }
    const cost = (tokensInput * prices.input / 1000) + (tokensOutput * prices.output / 1000)
    
    records.push({
      id: `sample-${i}`,
      timestamp: timestamp.toISOString(),
      provider,
      feature,
      source,
      tokensInput,
      tokensOutput,
      cost,
      model: provider === 'openai' ? 'gpt-4' : provider,
    })
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}
