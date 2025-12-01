/**
 * ETAPA 10 + 11: Matriz de Módulos de Dashboard por Plano
 * 
 * Define quais módulos aparecem no dashboard para cada nível de plano.
 * ETAPA 11: Adicionado heroStep para organização em trilha do herói.
 * 
 * heroStep:
 *   1 = ENTENDER (Teste/Perfil de Clareza)
 *   2 = REGISTRAR (Diário)
 *   3 = CONVERSAR (Chat IA / Coach)
 *   4 = PROTEGER (Plano de Segurança / Alertas)
 *   5 = GUARDAR PROVAS / RECURSOS (PDFs, Academy, conteúdos)
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

// Etapas da trilha do herói
export type HeroStep = 1 | 2 | 3 | 4 | 5

// ETAPA 11.2: Microcópias refinadas - linguagem acolhedora, sem promessas de terapia
export const HERO_STEP_LABELS: Record<HeroStep, { title: string; description: string }> = {
  1: { title: 'Entender', description: 'Veja sua situação com mais clareza' },
  2: { title: 'Registrar', description: 'Guarde o que acontece, no seu tempo' },
  3: { title: 'Conversar', description: 'Organize ideias com apoio da IA' },
  4: { title: 'Proteger', description: 'Prepare-se para emergências' },
  5: { title: 'Recursos', description: 'Provas, conteúdos e ferramentas' },
}

// =============================================================================
// INTERFACE DE CONFIGURAÇÃO DE MÓDULO
// =============================================================================

export interface DashboardModuleConfig {
  id: DashboardModuleId
  label: string
  description: string
  icon: string  // Nome do ícone lucide-react
  order: number
  // Posição na trilha do herói (1-5)
  heroStep: HeroStep
  // Plano mínimo necessário para acessar
  minPlanLevel: PlanLevel
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
  // =========================================================================
  // ETAPA 1: ENTENDER (heroStep = 1)
  // =========================================================================
  {
    id: 'onboarding',
    label: 'Primeiros passos',
    description: 'Guia rápido para usar o Radar com segurança.',
    icon: 'Compass',
    order: 10,
    heroStep: 1,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    route: '/onboarding'
  },
  {
    id: 'triangulo_status',
    label: 'Estado do Triângulo',
    description: 'Visualize o status do Triângulo Clareza ⇄ Diário ⇄ Chat.',
    icon: 'Triangle',
    order: 15,
    heroStep: 1,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    isCritical: true,
    route: '/dashboard'
  },
  {
    id: 'teste_clareza',
    label: 'Teste de Clareza',
    description: 'Entenda sua situação em 5-10 minutos.',
    icon: 'ClipboardCheck',
    order: 20,
    heroStep: 1,
    minPlanLevel: 'visitante',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    limitKey: 'testes_mes',
    isCritical: true,
    route: '/teste-clareza'
  },
  
  // =========================================================================
  // ETAPA 2: REGISTRAR (heroStep = 2)
  // =========================================================================
  {
    id: 'diario',
    label: 'Diário Seguro',
    description: 'Registre o que acontece no dia a dia.',
    icon: 'BookOpen',
    order: 30,
    heroStep: 2,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    limitKey: 'entradas_diario_mes',
    isCritical: true,
    route: '/diario'
  },
  {
    id: 'evolucao',
    label: 'Minha Evolução',
    description: 'Acompanhe seu progresso ao longo do tempo.',
    icon: 'TrendingUp',
    order: 35,
    heroStep: 2,
    minPlanLevel: 'jornada',
    visibleFor: ['jornada', 'defesa', 'profissional'],
    showLockedFor: ['guardar'],
    route: '/estatisticas'
  },
  
  // =========================================================================
  // ETAPA 3: CONVERSAR (heroStep = 3)
  // =========================================================================
  {
    id: 'chat_ia',
    label: 'Coach de Clareza',
    description: 'Converse com a IA para organizar suas ideias.',
    icon: 'MessageCircle',
    order: 40,
    heroStep: 3,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    limitKey: 'mensagens_chat_dia',
    isCritical: true,
    route: '/chat'
  },
  
  // =========================================================================
  // ETAPA 4: PROTEGER (heroStep = 4)
  // =========================================================================
  {
    id: 'plano_seguranca',
    label: 'Plano de Segurança',
    description: 'Monte um plano de ação para situações de risco.',
    icon: 'Shield',
    order: 50,
    heroStep: 4,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    isCritical: true,
    route: '/plano-seguranca'
  },
  
  // =========================================================================
  // ETAPA 5: RECURSOS (heroStep = 5)
  // =========================================================================
  {
    id: 'provas_evidencias',
    label: 'Provas & Evidências',
    description: 'Organize registros importantes de forma segura.',
    icon: 'FileCheck',
    order: 60,
    heroStep: 5,
    minPlanLevel: 'defesa',
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
    heroStep: 5,
    minPlanLevel: 'jornada',
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
    heroStep: 5,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    route: '/estatisticas/publicas'
  },
  {
    id: 'conteudos_curados',
    label: 'Conteúdos Curados',
    description: 'Artigos, vídeos e recursos selecionados.',
    icon: 'Newspaper',
    order: 90,
    heroStep: 5,
    minPlanLevel: 'guardar',
    visibleFor: ['guardar', 'jornada', 'defesa', 'profissional'],
    route: '/biblioteca'
  },
  {
    id: 'clientes',
    label: 'Meus Clientes',
    description: 'Gerencie seus clientes e acompanhe seu progresso.',
    icon: 'Users',
    order: 100,
    heroStep: 5,
    minPlanLevel: 'profissional',
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

/**
 * Retorna módulos agrupados por heroStep
 */
export function getModulesByHeroStep(planLevel: PlanLevel): Record<HeroStep, {
  visible: DashboardModuleConfig[]
  locked: DashboardModuleConfig[]
}> {
  const result: Record<HeroStep, { visible: DashboardModuleConfig[]; locked: DashboardModuleConfig[] }> = {
    1: { visible: [], locked: [] },
    2: { visible: [], locked: [] },
    3: { visible: [], locked: [] },
    4: { visible: [], locked: [] },
    5: { visible: [], locked: [] },
  }
  
  for (const module of DASHBOARD_MODULES) {
    const step = module.heroStep
    if (module.visibleFor.includes(planLevel)) {
      result[step].visible.push(module)
    } else if (module.showLockedFor?.includes(planLevel)) {
      result[step].locked.push(module)
    }
  }
  
  // Ordenar por order dentro de cada grupo
  for (const step of [1, 2, 3, 4, 5] as HeroStep[]) {
    result[step].visible.sort((a, b) => a.order - b.order)
    result[step].locked.sort((a, b) => a.order - b.order)
  }
  
  return result
}

/**
 * Retorna o label de um heroStep
 */
export function getHeroStepLabel(step: HeroStep): { title: string; description: string } {
  return HERO_STEP_LABELS[step]
}
