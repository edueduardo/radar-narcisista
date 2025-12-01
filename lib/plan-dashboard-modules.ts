/**
 * ETAPA 10: Matriz de Módulos de Dashboard por Plano
 * 
 * Define quais módulos aparecem no dashboard para cada nível de plano.
 * Usado nas ETAPAS 11, 12, 13 para redesenho dos dashboards.
 * 
 * NÃO altera telas ainda - apenas define a estrutura.
 */

import type { PlanLevel, PlanLimit } from './plans-config'

// =============================================================================
// TIPOS DE MÓDULOS DE DASHBOARD
// =============================================================================

export type DashboardModuleId =
  | 'onboarding'
  | 'teste_clareza'
  | 'diario'
  | 'chat_ia'
  | 'plano_seguranca'
  | 'provas_evidencias'
  | 'academy'
  | 'fanpage_viva'
  | 'conteudos_curados'
  | 'triangulo_status'
  | 'evolucao'
  | 'clientes'  // Apenas para profissional

// =============================================================================
// INTERFACE DE CONFIGURAÇÃO DE MÓDULO
// =============================================================================

export interface DashboardModuleConfig {
  id: DashboardModuleId
  label: string
  description: string
  icon: string  // Nome do ícone lucide-react
  order: number
  // Quais planos mostram esse módulo no dashboard
  visibleFor: PlanLevel[]
  // Mostrar módulo "apagado/cadeado" quando o plano não tem acesso
  showLockedFor?: PlanLevel[]
  // Qual feature de limite está associada (se houver)
  limitKey?: keyof PlanLimit | null
  // Se é módulo crítico (zona vermelha - não mexer)
  isCritical?: boolean
  // Rota do módulo
  route?: string
}

// =============================================================================
// ARRAY PRINCIPAL DE MÓDULOS
// =============================================================================

export const DASHBOARD_MODULES: DashboardModuleConfig[] = [
  {
    id: 'onboarding',
    label: 'Primeiros passos',
    description: 'Guia rápido para usar o Radar com segurança.',
    icon: 'Compass',
    order: 10,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    route: '/onboarding'
  },
  {
    id: 'triangulo_status',
    label: 'Estado do Triângulo',
    description: 'Visualize o status do Triângulo Clareza ⇄ Diário ⇄ Chat.',
    icon: 'Triangle',
    order: 15,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    isCritical: true,
    route: '/dashboard'
  },
  {
    id: 'teste_clareza',
    label: 'Teste de Clareza',
    description: 'Refaça o teste para ver sua evolução.',
    icon: 'ClipboardCheck',
    order: 20,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    limitKey: 'testes_mes',
    isCritical: true,
    route: '/teste-clareza'
  },
  {
    id: 'diario',
    label: 'Diário seguro',
    description: 'Registre o que acontece no dia a dia.',
    icon: 'BookOpen',
    order: 30,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    limitKey: 'entradas_diario_mes',
    isCritical: true,
    route: '/diario'
  },
  {
    id: 'chat_ia',
    label: 'Radar IA',
    description: 'Converse com a IA para organizar suas ideias.',
    icon: 'MessageCircle',
    order: 40,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    limitKey: 'mensagens_chat_dia',
    isCritical: true,
    route: '/chat'
  },
  {
    id: 'plano_seguranca',
    label: 'Plano de Segurança',
    description: 'Monte um plano de ação para situações de risco.',
    icon: 'Shield',
    order: 50,
    visibleFor: ['jornada', 'defesa', 'profissional'],
    showLockedFor: ['guardar'],
    isCritical: true,
    route: '/plano-seguranca'
  },
  {
    id: 'evolucao',
    label: 'Minha Evolução',
    description: 'Acompanhe seu progresso ao longo do tempo.',
    icon: 'TrendingUp',
    order: 55,
    visibleFor: ['jornada', 'defesa', 'profissional'],
    showLockedFor: ['guardar'],
    route: '/estatisticas'
  },
  {
    id: 'provas_evidencias',
    label: 'Provas & Evidências',
    description: 'Organize registros importantes de forma segura.',
    icon: 'FileCheck',
    order: 60,
    visibleFor: ['defesa', 'profissional'],
    showLockedFor: ['guardar', 'jornada'],
    route: '/documentos-premium'
  },
  {
    id: 'academy',
    label: 'Radar Academy',
    description: 'Trilhas e conteúdos aprofundados.',
    icon: 'GraduationCap',
    order: 70,
    visibleFor: ['jornada', 'defesa', 'profissional'],
    showLockedFor: ['guardar'],
    route: '/biblioteca'
  },
  {
    id: 'fanpage_viva',
    label: 'Radar em Números',
    description: 'Resumo público do Radar e conteúdos em destaque.',
    icon: 'BarChart3',
    order: 80,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    route: '/estatisticas/publicas'
  },
  {
    id: 'conteudos_curados',
    label: 'Conteúdos Curados',
    description: 'Artigos, vídeos e recursos selecionados.',
    icon: 'Newspaper',
    order: 90,
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    route: '/biblioteca'
  },
  {
    id: 'clientes',
    label: 'Meus Clientes',
    description: 'Gerencie seus clientes e acompanhe seu progresso.',
    icon: 'Users',
    order: 100,
    visibleFor: ['profissional'],
    route: '/profissional/clientes'
  },
]

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Retorna módulos visíveis para um plano específico
 */
export function getModulesForPlan(planLevel: PlanLevel): DashboardModuleConfig[] {
  return DASHBOARD_MODULES
    .filter(m => m.visibleFor.includes(planLevel))
    .sort((a, b) => a.order - b.order)
}

/**
 * Retorna módulos bloqueados (com cadeado) para um plano
 */
export function getLockedModulesForPlan(planLevel: PlanLevel): DashboardModuleConfig[] {
  return DASHBOARD_MODULES
    .filter(m => m.showLockedFor?.includes(planLevel))
    .sort((a, b) => a.order - b.order)
}

/**
 * Retorna todos os módulos (visíveis + bloqueados) para um plano
 */
export function getAllModulesForPlan(planLevel: PlanLevel): {
  visible: DashboardModuleConfig[]
  locked: DashboardModuleConfig[]
} {
  return {
    visible: getModulesForPlan(planLevel),
    locked: getLockedModulesForPlan(planLevel)
  }
}

/**
 * Verifica se um módulo é visível para um plano
 */
export function isModuleVisibleForPlan(moduleId: DashboardModuleId, planLevel: PlanLevel): boolean {
  const module = DASHBOARD_MODULES.find(m => m.id === moduleId)
  return module?.visibleFor.includes(planLevel) ?? false
}

/**
 * Verifica se um módulo está bloqueado para um plano
 */
export function isModuleLockedForPlan(moduleId: DashboardModuleId, planLevel: PlanLevel): boolean {
  const module = DASHBOARD_MODULES.find(m => m.id === moduleId)
  return module?.showLockedFor?.includes(planLevel) ?? false
}

/**
 * Retorna módulos críticos (zona vermelha)
 */
export function getCriticalModules(): DashboardModuleConfig[] {
  return DASHBOARD_MODULES.filter(m => m.isCritical)
}

/**
 * Retorna um módulo pelo ID
 */
export function getModuleById(moduleId: DashboardModuleId): DashboardModuleConfig | undefined {
  return DASHBOARD_MODULES.find(m => m.id === moduleId)
}

/**
 * Retorna módulos que têm limite associado
 */
export function getModulesWithLimits(): DashboardModuleConfig[] {
  return DASHBOARD_MODULES.filter(m => m.limitKey)
}
