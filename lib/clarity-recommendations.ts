/**
 * CLARITY RECOMMENDATIONS
 * 
 * Helper para gerar recomendações personalizadas baseadas no perfil de clareza.
 * Usado pelo dashboard, curso, plano de segurança e outras partes do sistema.
 */

import { GlobalZone, Category, Axis } from './clarity-unified-config'

export interface ClarityRecommendation {
  id: string
  title: string
  description: string
  priority: 'alta' | 'media' | 'baixa'
  type: 'modulo' | 'acao' | 'recurso' | 'alerta'
  link?: string
  icon?: string
}

export interface ClarityProfileInput {
  globalZone: GlobalZone
  overallPercentage: number
  topCategories: Category[]
  topAxes: Array<{ axis: Axis; score: number }>
  hasPhysicalRisk: boolean
}

/**
 * Gera recomendações personalizadas baseadas no perfil de clareza
 */
export function getClarityRecommendations(profile: ClarityProfileInput): ClarityRecommendation[] {
  const recommendations: ClarityRecommendation[] = []
  
  // =========================================================================
  // ALERTA DE RISCO FÍSICO (sempre primeiro se existir)
  // =========================================================================
  if (profile.hasPhysicalRisk) {
    recommendations.push({
      id: 'alerta_risco_fisico',
      title: '⚠️ Criar Plano de Segurança',
      description: 'Seu teste indicou sinais de possível risco físico. É importante organizar sua proteção.',
      priority: 'alta',
      type: 'alerta',
      link: '/plano-seguranca',
      icon: 'Shield',
    })
  }
  
  // =========================================================================
  // RECOMENDAÇÕES POR ZONA
  // =========================================================================
  if (profile.globalZone === 'vermelha') {
    recommendations.push({
      id: 'zona_vermelha_apoio',
      title: 'Conversar com Coach IA',
      description: 'Você está em uma situação difícil. O Coach pode te ajudar a processar e encontrar próximos passos.',
      priority: 'alta',
      type: 'acao',
      link: '/chat',
      icon: 'MessageCircle',
    })
    
    recommendations.push({
      id: 'zona_vermelha_contatos',
      title: 'Revisar contatos de emergência',
      description: 'Tenha números importantes salvos e acessíveis.',
      priority: 'alta',
      type: 'acao',
      link: '/plano-seguranca',
      icon: 'Phone',
    })
  }
  
  // =========================================================================
  // RECOMENDAÇÕES POR CATEGORIA PRINCIPAL
  // =========================================================================
  const topCategory = profile.topCategories[0]
  
  if (topCategory === 'gaslighting') {
    recommendations.push({
      id: 'modulo_gaslighting',
      title: 'Módulo: Você não está louca',
      description: 'Entenda o que é gaslighting e como ele afeta sua percepção da realidade.',
      priority: 'alta',
      type: 'modulo',
      link: '/biblioteca?tema=gaslighting',
      icon: 'Brain',
    })
    
    recommendations.push({
      id: 'diario_gaslighting',
      title: 'Registrar episódios de confusão',
      description: 'Documente momentos em que você duvidou de si mesma. Isso ajuda a ver padrões.',
      priority: 'media',
      type: 'acao',
      link: '/diario/novo',
      icon: 'PenLine',
    })
  }
  
  if (topCategory === 'invalidacao') {
    recommendations.push({
      id: 'modulo_invalidacao',
      title: 'Módulo: Suas emoções são válidas',
      description: 'Aprenda a reconhecer e validar suas próprias emoções.',
      priority: 'alta',
      type: 'modulo',
      link: '/biblioteca?tema=invalidacao',
      icon: 'Heart',
    })
  }
  
  if (topCategory === 'controle') {
    recommendations.push({
      id: 'modulo_controle',
      title: 'Módulo: Reconhecendo o controle',
      description: 'Identifique padrões de controle e como eles limitam sua liberdade.',
      priority: 'alta',
      type: 'modulo',
      link: '/biblioteca?tema=controle',
      icon: 'Lock',
    })
  }
  
  if (topCategory === 'isolamento') {
    recommendations.push({
      id: 'modulo_isolamento',
      title: 'Módulo: Reconstruindo sua rede',
      description: 'Estratégias para reconectar com pessoas de confiança.',
      priority: 'alta',
      type: 'modulo',
      link: '/biblioteca?tema=isolamento',
      icon: 'Users',
    })
    
    recommendations.push({
      id: 'acao_contato',
      title: 'Reconectar com alguém de confiança',
      description: 'Pense em uma pessoa com quem você poderia conversar esta semana.',
      priority: 'media',
      type: 'acao',
      icon: 'UserPlus',
    })
  }
  
  if (topCategory === 'emocional') {
    recommendations.push({
      id: 'modulo_emocional',
      title: 'Módulo: Entendendo o abuso emocional',
      description: 'O que é abuso emocional e como ele afeta sua saúde mental.',
      priority: 'alta',
      type: 'modulo',
      link: '/biblioteca?tema=abuso-emocional',
      icon: 'Heart',
    })
  }
  
  if (topCategory === 'fisico') {
    recommendations.push({
      id: 'modulo_seguranca',
      title: 'Módulo: Plano de Segurança',
      description: 'Organize documentos, contatos e um plano de saída se necessário.',
      priority: 'alta',
      type: 'modulo',
      link: '/plano-seguranca',
      icon: 'Shield',
    })
  }
  
  // =========================================================================
  // RECOMENDAÇÕES GERAIS (sempre incluir)
  // =========================================================================
  recommendations.push({
    id: 'diario_geral',
    title: 'Começar seu diário',
    description: 'Registre episódios para ter clareza sobre padrões ao longo do tempo.',
    priority: 'media',
    type: 'acao',
    link: '/diario/novo',
    icon: 'PenLine',
  })
  
  if (profile.globalZone !== 'atencao') {
    recommendations.push({
      id: 'recurso_cvv',
      title: 'Conheça o CVV (188)',
      description: 'Apoio emocional 24h, gratuito e sigiloso.',
      priority: 'baixa',
      type: 'recurso',
      link: 'tel:188',
      icon: 'Phone',
    })
  }
  
  // Ordenar por prioridade
  const priorityOrder = { alta: 0, media: 1, baixa: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return recommendations
}

/**
 * Retorna o foco principal baseado no perfil
 */
export function getMainFocus(profile: ClarityProfileInput): {
  category: Category | null
  axis: Axis | null
  description: string
} {
  const topCategory = profile.topCategories[0] || null
  const topAxis = profile.topAxes[0]?.axis || null
  
  const categoryDescriptions: Record<Category, string> = {
    invalidacao: 'Suas emoções estão sendo minimizadas ou ignoradas',
    gaslighting: 'Você está sendo levada a duvidar da própria realidade',
    controle: 'Sua liberdade e autonomia estão sendo limitadas',
    isolamento: 'Você está sendo afastada de pessoas importantes',
    emocional: 'Você está sofrendo punições emocionais e humilhação',
    fisico: 'Existem sinais de possível violência física',
  }
  
  return {
    category: topCategory,
    axis: topAxis,
    description: topCategory ? categoryDescriptions[topCategory] : 'Continue observando e registrando',
  }
}

/**
 * Gera um resumo curto para exibir no dashboard
 */
export function getClaritySummary(profile: ClarityProfileInput): string {
  const zoneLabels: Record<GlobalZone, string> = {
    atencao: 'Zona de Atenção',
    alerta: 'Zona de Alerta',
    vermelha: 'Zona de Alto Risco',
  }
  
  const percentage = Math.round(profile.overallPercentage * 100)
  const zone = zoneLabels[profile.globalZone]
  
  if (profile.hasPhysicalRisk) {
    return `${zone} (${percentage}%) - ⚠️ Sinais de risco físico detectados`
  }
  
  return `${zone} (${percentage}%)`
}
