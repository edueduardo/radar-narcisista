/**
 * TIPOS PARA JSON DE EVOLUÇÃO DE CLAREZA
 * Estrutura completa para análise e acompanhamento
 * 
 * Criado em: 28/11/2025
 */

// ============================================
// TIPOS PRINCIPAIS
// ============================================

export interface ClarityEvolutionData {
  session_id: string
  user_id: string
  timestamp: string
  
  input_signals: InputSignals
  analysis: ClarityAnalysis
  recommendations: Recommendations
  disclaimer: string
}

// ============================================
// INPUT SIGNALS - Dados de entrada
// ============================================

export interface InputSignals {
  // Fontes dos dados
  source: ('coach' | 'diario' | 'teste_clareza')[]
  
  // Score de clareza atual (0-100)
  clarity_score_current: number
  
  // Score anterior (null se primeira sessão)
  clarity_score_previous: number | null
  
  // Tendência: subindo, descendo ou estável
  clarity_trend: 'up' | 'down' | 'stable'
  
  // Intensidade emocional global (0-100)
  emotional_intensity: number
  
  // Relevância de risco (0-100)
  risk_relevance: number
  
  // ProblemTags detectados agora
  problem_tags_current: string[]
  
  // Histórico de ProblemTags
  problem_tags_history: ProblemTagCount[]
}

export interface ProblemTagCount {
  tag: string
  count: number
}

// ============================================
// ANALYSIS - Análise gerada
// ============================================

export interface ClarityAnalysis {
  // Resumo da clareza atual
  current_clarity_summary: string
  
  // Comparação com sessões anteriores
  evolution_since_last: string
  
  // Temas dominantes
  dominant_themes: DominantTheme[]
  
  // Avaliação de risco
  risk_assessment: RiskAssessment
}

export interface DominantTheme {
  id: string
  label: string
  trend: 'up' | 'down' | 'stable'
  comment: string
}

export interface RiskAssessment {
  // Nível de risco
  level: 'none' | 'low' | 'moderate' | 'high' | 'imminent'
  
  // Sinais detectados
  signals: string[]
  
  // Recomendação de segurança
  safety_recommendation: string
}

// ============================================
// RECOMMENDATIONS - Recomendações
// ============================================

export interface Recommendations {
  // Mensagem de encorajamento
  encouragement_message: string
  
  // Ações sugeridas
  suggested_actions: SuggestedAction[]
}

export interface SuggestedAction {
  type: 'tool' | 'professional_help' | 'safety' | 'emotional'
  tool_id?: string
  label: string
  reason: string
  url?: string
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Cria um objeto de evolução vazio/inicial
 */
export function createEmptyClarityEvolution(
  sessionId: string,
  userId: string
): ClarityEvolutionData {
  return {
    session_id: sessionId,
    user_id: userId,
    timestamp: new Date().toISOString(),
    
    input_signals: {
      source: ['coach'],
      clarity_score_current: 50,
      clarity_score_previous: null,
      clarity_trend: 'stable',
      emotional_intensity: 50,
      risk_relevance: 0,
      problem_tags_current: [],
      problem_tags_history: []
    },
    
    analysis: {
      current_clarity_summary: 'Ainda estamos conhecendo sua situação.',
      evolution_since_last: 'Esta é nossa primeira conversa.',
      dominant_themes: [],
      risk_assessment: {
        level: 'none',
        signals: [],
        safety_recommendation: 'Continue compartilhando quando se sentir confortável.'
      }
    },
    
    recommendations: {
      encouragement_message: 'Obrigado por estar aqui. Estou pronto para te ouvir.',
      suggested_actions: []
    },
    
    disclaimer: 'Esta análise é gerada por uma IA para apoio emocional e organização de informações. Ela não substitui avaliação psicológica, psiquiátrica, jurídica ou de qualquer outro profissional. Em situações de risco, procure ajuda local imediatamente.'
  }
}

/**
 * Mapeia nível de risco para cor
 */
export function getRiskLevelColor(level: RiskAssessment['level']): string {
  switch (level) {
    case 'none': return 'green'
    case 'low': return 'blue'
    case 'moderate': return 'yellow'
    case 'high': return 'orange'
    case 'imminent': return 'red'
  }
}

/**
 * Mapeia nível de risco para label
 */
export function getRiskLevelLabel(level: RiskAssessment['level']): string {
  switch (level) {
    case 'none': return 'Sem risco identificado'
    case 'low': return 'Baixo risco'
    case 'moderate': return 'Risco moderado'
    case 'high': return 'Alto risco'
    case 'imminent': return 'Risco iminente - Busque ajuda agora'
  }
}

/**
 * Mapeia trend para emoji
 */
export function getTrendEmoji(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return '📈'
    case 'down': return '📉'
    case 'stable': return '➡️'
  }
}

/**
 * Mapeia tool_id para URL
 */
export function getToolUrl(toolId: string): string {
  const toolUrls: Record<string, string> = {
    'diario_episodios': '/diario',
    'teste_clareza': '/teste-clareza',
    'plano_seguranca': '/plano-seguranca',
    'modo_espelho': '/modo-espelho',
    'biblioteca': '/biblioteca',
    'chat': '/chat'
  }
  return toolUrls[toolId] || '/ferramentas'
}
