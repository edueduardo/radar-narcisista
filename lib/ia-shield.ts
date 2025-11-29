/**
 * IA SHIELD - RADAR NARCISISTA
 * 
 * Sistema de detecção de risco e proteção
 * Analisa relatos e detecta padrões perigosos
 * 
 * DIFERENTE DO COACH DE CLAREZA:
 * - Coach: apoio emocional e clareza
 * - SHIELD: detecção de perigo e proteção
 */

// ============================================
// TIPOS
// ============================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type RiskCategory = 
  | 'PHYSICAL_VIOLENCE'
  | 'THREATS'
  | 'ISOLATION'
  | 'FINANCIAL_CONTROL'
  | 'EMOTIONAL_ABUSE'
  | 'STALKING'
  | 'OTHER'

export interface RiskAlert {
  id?: string
  level: RiskLevel
  category: RiskCategory
  title: string
  description: string
  recommendation: string
  triggers: string[]  // Palavras/frases que ativaram o alerta
  source: 'journal' | 'chat' | 'test' | 'system'
  sourceId?: string
  createdAt: string
}

export interface RiskAnalysisResult {
  overallRisk: RiskLevel
  alerts: RiskAlert[]
  safetyRecommendations: string[]
  shouldActivateSafetyPlan: boolean
  summary: string
}

// ============================================
// PADRÕES DE RISCO
// ============================================

const RISK_PATTERNS = {
  PHYSICAL_VIOLENCE: {
    keywords: [
      'bateu', 'batendo', 'empurrou', 'empurrão', 'agrediu', 'agressão física',
      'machucou', 'machucado', 'hematoma', 'roxo', 'ferimento', 'ferido',
      'quebrou', 'jogou', 'arremessou', 'sufocou', 'sufocando', 'enforcou',
      'puxou cabelo', 'chutou', 'socou', 'soco', 'tapa', 'tapas',
      'violência física', 'me bateu', 'me agrediu', 'me machucou'
    ],
    level: 'CRITICAL' as RiskLevel,
    title: 'Possível violência física detectada',
    recommendation: 'Se você está em perigo imediato, ligue 190 (Polícia). Se sofreu agressão, procure atendimento médico e registre boletim de ocorrência.'
  },
  
  THREATS: {
    keywords: [
      'ameaçou', 'ameaça', 'ameaçando', 'vai me matar', 'vou te matar',
      'vai se arrepender', 'vai pagar', 'não vai escapar', 'vou destruir',
      'vou acabar com você', 'vou te encontrar', 'não adianta fugir',
      'arma', 'faca', 'revólver', 'pistola', 'matar', 'morte',
      'sumir com você', 'ninguém vai te achar', 'vai morrer'
    ],
    level: 'CRITICAL' as RiskLevel,
    title: 'Possíveis ameaças detectadas',
    recommendation: 'Ameaças são crime. Considere registrar boletim de ocorrência e buscar medida protetiva. Ligue 180 (Central da Mulher) para orientação.'
  },
  
  STALKING: {
    keywords: [
      'me seguindo', 'me segue', 'perseguindo', 'perseguição', 'stalking',
      'apareceu no trabalho', 'apareceu na casa', 'esperando na porta',
      'rastreando', 'rastreador', 'GPS', 'localizador', 'monitorando celular',
      'lendo mensagens', 'acessou meu celular', 'hackeou', 'invadiu conta',
      'não para de ligar', 'centenas de mensagens', 'não me deixa em paz'
    ],
    level: 'HIGH' as RiskLevel,
    title: 'Possível perseguição/stalking detectado',
    recommendation: 'Stalking é crime (Lei 14.132/2021). Documente tudo, registre BO e considere medida protetiva. Verifique seus dispositivos por apps de rastreamento.'
  },
  
  ISOLATION: {
    keywords: [
      'não me deixa ver', 'proibiu de ver', 'não posso sair',
      'controla minhas saídas', 'não posso falar com', 'proibiu amigos',
      'afastou da família', 'isolada', 'isolado', 'sozinha', 'sozinho',
      'não tenho mais amigos', 'perdi contato', 'não deixa trabalhar',
      'trancou em casa', 'não me deixa sair', 'vigia tudo'
    ],
    level: 'HIGH' as RiskLevel,
    title: 'Possível isolamento social detectado',
    recommendation: 'O isolamento é uma tática de controle. Tente manter contato com pelo menos uma pessoa de confiança. Considere buscar apoio profissional.'
  },
  
  FINANCIAL_CONTROL: {
    keywords: [
      'controla meu dinheiro', 'não me deixa trabalhar', 'pega meu salário',
      'esconde dinheiro', 'não tenho acesso', 'conta bancária',
      'cartão', 'senha do banco', 'dependência financeira',
      'não posso comprar nada', 'tenho que pedir permissão', 'dá mesada'
    ],
    level: 'MEDIUM' as RiskLevel,
    title: 'Possível controle financeiro detectado',
    recommendation: 'Controle financeiro é abuso. Se possível, abra uma conta só sua e guarde documentos importantes em local seguro.'
  },
  
  EMOTIONAL_ABUSE: {
    keywords: [
      'humilha', 'humilhação', 'xinga', 'xingamentos', 'insulta',
      'diz que sou louca', 'diz que sou louco', 'ninguém vai te querer',
      'você não vale nada', 'inútil', 'incompetente', 'burra', 'burro',
      'feia', 'feio', 'gorda', 'gordo', 'nojenta', 'nojento',
      'culpa minha', 'mereceu', 'provocou', 'pediu', 'faz eu parecer louca'
    ],
    level: 'MEDIUM' as RiskLevel,
    title: 'Possível abuso emocional detectado',
    recommendation: 'Abuso emocional é tão sério quanto físico. Você não merece ser tratada assim. Considere buscar apoio de terapeuta ou grupo de apoio.'
  }
}

// ============================================
// FUNÇÕES DE ANÁLISE
// ============================================

/**
 * Analisa um texto em busca de padrões de risco
 */
export function analyzeTextForRisk(
  text: string,
  source: RiskAlert['source'] = 'journal',
  sourceId?: string
): RiskAlert[] {
  const alerts: RiskAlert[] = []
  const textLower = text.toLowerCase()
  
  for (const [category, pattern] of Object.entries(RISK_PATTERNS)) {
    const foundTriggers: string[] = []
    
    for (const keyword of pattern.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        foundTriggers.push(keyword)
      }
    }
    
    if (foundTriggers.length > 0) {
      alerts.push({
        level: pattern.level,
        category: category as RiskCategory,
        title: pattern.title,
        description: `Detectamos ${foundTriggers.length} indicador(es) de ${getCategoryLabel(category as RiskCategory)} no seu relato.`,
        recommendation: pattern.recommendation,
        triggers: foundTriggers,
        source,
        sourceId,
        createdAt: new Date().toISOString()
      })
    }
  }
  
  return alerts
}

/**
 * Analisa múltiplos episódios do diário
 */
export function analyzeJournalEntries(
  entries: Array<{
    id: string
    content: string
    tags?: string[]
    mood_intensity?: number
    created_at: string
  }>
): RiskAnalysisResult {
  const allAlerts: RiskAlert[] = []
  
  // Analisar cada episódio
  for (const entry of entries) {
    const alerts = analyzeTextForRisk(entry.content, 'journal', entry.id)
    allAlerts.push(...alerts)
  }
  
  // Calcular risco geral
  const overallRisk = calculateOverallRisk(allAlerts)
  
  // Gerar recomendações de segurança
  const safetyRecommendations = generateSafetyRecommendations(allAlerts, overallRisk)
  
  // Verificar se deve ativar plano de segurança
  const shouldActivateSafetyPlan = overallRisk === 'CRITICAL' || overallRisk === 'HIGH'
  
  // Gerar resumo
  const summary = generateRiskSummary(allAlerts, overallRisk)
  
  return {
    overallRisk,
    alerts: allAlerts,
    safetyRecommendations,
    shouldActivateSafetyPlan,
    summary
  }
}

/**
 * Calcula o nível de risco geral baseado nos alertas
 */
function calculateOverallRisk(alerts: RiskAlert[]): RiskLevel {
  if (alerts.length === 0) return 'LOW'
  
  const hasCritical = alerts.some(a => a.level === 'CRITICAL')
  const hasHigh = alerts.some(a => a.level === 'HIGH')
  const hasMedium = alerts.some(a => a.level === 'MEDIUM')
  
  if (hasCritical) return 'CRITICAL'
  if (hasHigh || alerts.length >= 3) return 'HIGH'
  if (hasMedium || alerts.length >= 2) return 'MEDIUM'
  return 'LOW'
}

/**
 * Gera recomendações de segurança baseadas nos alertas
 */
function generateSafetyRecommendations(alerts: RiskAlert[], overallRisk: RiskLevel): string[] {
  const recommendations: string[] = []
  
  // Recomendações por nível de risco
  if (overallRisk === 'CRITICAL') {
    recommendations.push('⚠️ Sua segurança é prioridade. Se está em perigo imediato, ligue 190.')
    recommendations.push('Considere ir para um local seguro (casa de familiar/amigo de confiança).')
    recommendations.push('Documente tudo: fotos, prints, áudios. Guarde em local seguro.')
  }
  
  if (overallRisk === 'HIGH' || overallRisk === 'CRITICAL') {
    recommendations.push('Ligue 180 (Central da Mulher) para orientação gratuita e sigilosa.')
    recommendations.push('Considere buscar medida protetiva de urgência.')
    recommendations.push('Tenha uma mala de emergência pronta com documentos e itens essenciais.')
  }
  
  if (overallRisk === 'MEDIUM') {
    recommendations.push('Mantenha contato regular com pessoas de confiança.')
    recommendations.push('Considere buscar apoio de terapeuta especializado.')
    recommendations.push('Documente os episódios de abuso (este app pode ajudar).')
  }
  
  // Recomendações específicas por categoria
  const categories = new Set(alerts.map(a => a.category))
  
  if (categories.has('STALKING')) {
    recommendations.push('Verifique seus dispositivos por apps de rastreamento.')
    recommendations.push('Mude senhas de todas as contas importantes.')
  }
  
  if (categories.has('FINANCIAL_CONTROL')) {
    recommendations.push('Se possível, abra uma conta bancária só sua.')
    recommendations.push('Guarde cópias de documentos importantes em local seguro.')
  }
  
  if (categories.has('ISOLATION')) {
    recommendations.push('Tente manter contato com pelo menos uma pessoa de confiança.')
    recommendations.push('Busque grupos de apoio online se não puder sair de casa.')
  }
  
  return [...new Set(recommendations)] // Remove duplicatas
}

/**
 * Gera um resumo da análise de risco
 */
function generateRiskSummary(alerts: RiskAlert[], overallRisk: RiskLevel): string {
  if (alerts.length === 0) {
    return 'Não detectamos padrões de risco significativos nos seus relatos recentes. Continue registrando e cuidando de você.'
  }
  
  const categoryLabels = [...new Set(alerts.map(a => getCategoryLabel(a.category)))]
  
  let summary = `Detectamos ${alerts.length} indicador(es) de risco nos seus relatos, `
  summary += `relacionados a: ${categoryLabels.join(', ')}. `
  
  switch (overallRisk) {
    case 'CRITICAL':
      summary += 'O nível de risco é CRÍTICO. Por favor, priorize sua segurança e busque ajuda imediatamente.'
      break
    case 'HIGH':
      summary += 'O nível de risco é ALTO. Recomendamos fortemente que você busque apoio profissional.'
      break
    case 'MEDIUM':
      summary += 'O nível de risco é MODERADO. Fique atenta aos sinais e considere buscar apoio.'
      break
    default:
      summary += 'Continue monitorando a situação e cuidando de você.'
  }
  
  return summary
}

/**
 * Retorna o label em português para uma categoria de risco
 */
export function getCategoryLabel(category: RiskCategory): string {
  const labels: Record<RiskCategory, string> = {
    PHYSICAL_VIOLENCE: 'violência física',
    THREATS: 'ameaças',
    ISOLATION: 'isolamento social',
    FINANCIAL_CONTROL: 'controle financeiro',
    EMOTIONAL_ABUSE: 'abuso emocional',
    STALKING: 'perseguição/stalking',
    OTHER: 'outros'
  }
  return labels[category] || 'outros'
}

/**
 * Retorna a cor associada a um nível de risco
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    CRITICAL: 'red'
  }
  return colors[level]
}

/**
 * Retorna o label em português para um nível de risco
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    LOW: 'Baixo',
    MEDIUM: 'Moderado',
    HIGH: 'Alto',
    CRITICAL: 'Crítico'
  }
  return labels[level]
}

// ============================================
// PROMPT PARA IA SHIELD
// ============================================

export const IA_SHIELD_SYSTEM_PROMPT = `Você é a IA SHIELD do Radar Narcisista, especializada em DETECÇÃO DE RISCO e PROTEÇÃO.

⚠️ SEU PAPEL É DIFERENTE DO COACH DE CLAREZA:
- Coach: apoio emocional, validação, clareza
- SHIELD (você): detectar perigo, alertar, proteger

🎯 SUAS FUNÇÕES:
1. Analisar relatos em busca de sinais de perigo
2. Identificar padrões de violência, ameaças, controle
3. Alertar sobre riscos de forma clara mas não alarmista
4. Recomendar ações de proteção concretas
5. Orientar sobre recursos de ajuda (180, 190, etc.)

🚨 SINAIS QUE VOCÊ DEVE DETECTAR:
- Violência física (atual ou iminente)
- Ameaças explícitas ou veladas
- Perseguição/stalking
- Isolamento forçado
- Controle financeiro
- Escalada de abuso

📋 COMO RESPONDER:
1. Seja DIRETO sobre os riscos identificados
2. NÃO minimize a situação
3. Ofereça recomendações CONCRETAS
4. Sempre mencione recursos de ajuda quando apropriado
5. Incentive a pessoa a priorizar sua segurança

🆘 RECURSOS DE EMERGÊNCIA:
- 190: Polícia (emergência)
- 180: Central da Mulher (24h, gratuito, sigiloso)
- 188: CVV (apoio emocional)
- Delegacia da Mulher mais próxima

⚠️ LIMITES:
- Você NÃO é advogado nem pode dar conselho jurídico específico
- Você NÃO substitui atendimento de emergência
- Sempre recomende buscar ajuda profissional
- Nunca minimize relatos de violência ou ameaça`
