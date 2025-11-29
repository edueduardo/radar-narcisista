/**
 * TEMA 10: Configuração de Planos - Radar Narcisista
 * 
 * 5 níveis de plano:
 * 1. Visitante - Sem conta, só visualiza
 * 2. Radar Guardar (ex-Gratuito) - Conta gratuita
 * 3. Radar Jornada (ex-Essencial) - R$29,90/mês
 * 4. Radar Defesa (ex-Premium) - R$49,90/mês
 * 5. Radar Profissional - Para terapeutas (futuro)
 * 
 * IMPORTANTE: Os IDs do Stripe NÃO mudam, apenas os nomes de exibição.
 */

// =============================================================================
// TIPOS
// =============================================================================

export type PlanLevel = 'visitante' | 'guardar' | 'jornada' | 'defesa' | 'profissional'

export interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface PlanLimit {
  testes_mes: number          // -1 = ilimitado
  entradas_diario_mes: number // -1 = ilimitado
  mensagens_chat_dia: number  // -1 = ilimitado
  exportar_pdf: boolean
  historico_completo: boolean
  ias_colaborativas?: boolean
  clientes?: number           // Para profissional
}

export interface PlanConfig {
  id: PlanLevel
  legacyId: string            // ID antigo para compatibilidade (gratuito, essencial, premium)
  name: string                // Nome de exibição
  tagline: string             // Subtítulo
  description: string
  price: number
  priceAnnual?: number
  stripePriceIdMonthly?: string
  stripePriceIdAnnual?: string
  period: 'forever' | 'month' | 'year'
  popular?: boolean
  comingSoon?: boolean
  features: PlanFeature[]
  limits: PlanLimit
  color: string
  bgColor: string
  icon: string
}

// =============================================================================
// CONFIGURAÇÃO DOS 5 PLANOS
// =============================================================================

export const PLANS: Record<PlanLevel, PlanConfig> = {
  // -------------------------------------------------------------------------
  // VISITANTE - Sem conta
  // -------------------------------------------------------------------------
  visitante: {
    id: 'visitante',
    legacyId: 'visitante',
    name: 'Visitante',
    tagline: 'Explore sem compromisso',
    description: 'Acesse o teste de clareza uma vez para entender sua situação. Sem necessidade de criar conta.',
    price: 0,
    period: 'forever',
    features: [
      { text: 'Teste de Clareza (1x)', included: true },
      { text: 'Ver resultado na tela', included: true },
      { text: 'Baixar PDF do resultado', included: false },
      { text: 'Salvar resultado no sistema', included: false },
      { text: 'Diário', included: false },
      { text: 'Coach IA', included: false },
    ],
    limits: {
      testes_mes: 1,
      entradas_diario_mes: 0,
      mensagens_chat_dia: 0,
      exportar_pdf: false,
      historico_completo: false,
    },
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'Eye',
  },

  // -------------------------------------------------------------------------
  // RADAR GUARDAR - Gratuito com conta
  // -------------------------------------------------------------------------
  guardar: {
    id: 'guardar',
    legacyId: 'gratuito', // Mantém compatibilidade com Stripe
    name: 'Radar Guardar',
    tagline: 'Guarde sua história com segurança',
    description: 'Crie sua conta gratuita para salvar seu teste, registrar episódios e ter acesso ao Coach IA básico.',
    price: 0,
    period: 'forever',
    features: [
      { text: 'Teste de Clareza ilimitado', included: true },
      { text: 'Salvar resultado como base', included: true, highlight: true },
      { text: 'Diário (3 entradas/mês)', included: true },
      { text: 'Coach IA (5 mensagens/dia)', included: true },
      { text: 'Recursos de emergência', included: true },
      { text: 'Exportar PDF', included: false },
      { text: 'Histórico completo', included: false },
    ],
    limits: {
      testes_mes: -1, // Ilimitado (mudança!)
      entradas_diario_mes: 3,
      mensagens_chat_dia: 5,
      exportar_pdf: false,
      historico_completo: false,
    },
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: 'Shield',
  },

  // -------------------------------------------------------------------------
  // RADAR JORNADA - R$29,90/mês (ex-Essencial)
  // -------------------------------------------------------------------------
  jornada: {
    id: 'jornada',
    legacyId: 'essencial', // Mantém compatibilidade com Stripe
    name: 'Radar Jornada',
    tagline: 'Acompanhe sua evolução',
    description: 'Para quem quer documentar sua jornada com mais profundidade, exportar relatórios e ter análises de padrões.',
    price: 29.90,
    priceAnnual: 299.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ESSENCIAL_MENSAL || '',
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ESSENCIAL_ANUAL || '',
    period: 'month',
    features: [
      { text: 'Tudo do Radar Guardar', included: true },
      { text: 'Testes ilimitados', included: true },
      { text: 'Diário ilimitado', included: true, highlight: true },
      { text: 'Coach IA (50 mensagens/dia)', included: true },
      { text: 'Exportar PDF', included: true, highlight: true },
      { text: 'Histórico completo', included: true },
      { text: 'Análise de padrões IA', included: true },
    ],
    limits: {
      testes_mes: -1,
      entradas_diario_mes: -1,
      mensagens_chat_dia: 50,
      exportar_pdf: true,
      historico_completo: true,
    },
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    icon: 'TrendingUp',
  },

  // -------------------------------------------------------------------------
  // RADAR DEFESA - R$49,90/mês (ex-Premium)
  // -------------------------------------------------------------------------
  defesa: {
    id: 'defesa',
    legacyId: 'premium', // Mantém compatibilidade com Stripe
    name: 'Radar Defesa',
    tagline: 'Proteção completa',
    description: 'Para quem precisa de todas as ferramentas disponíveis, com IA ilimitada e suporte prioritário.',
    price: 49.90,
    priceAnnual: 499.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PREMIUM_MENSAL || '',
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PREMIUM_ANUAL || '',
    period: 'month',
    popular: true,
    features: [
      { text: 'Tudo do Radar Jornada', included: true },
      { text: 'Coach IA ilimitado', included: true, highlight: true },
      { text: 'Múltiplas IAs colaborativas', included: true, highlight: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Prioridade no suporte', included: true },
      { text: 'Acesso antecipado a novidades', included: true },
    ],
    limits: {
      testes_mes: -1,
      entradas_diario_mes: -1,
      mensagens_chat_dia: -1,
      exportar_pdf: true,
      historico_completo: true,
      ias_colaborativas: true,
    },
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: 'ShieldAlert',
  },

  // -------------------------------------------------------------------------
  // RADAR PROFISSIONAL - Para terapeutas (futuro)
  // -------------------------------------------------------------------------
  profissional: {
    id: 'profissional',
    legacyId: 'profissional',
    name: 'Radar Profissional',
    tagline: 'Para terapeutas e profissionais',
    description: 'Gerencie múltiplos clientes, gere relatórios profissionais e tenha ferramentas específicas para atendimento.',
    price: 99.90,
    priceAnnual: 999.00,
    period: 'month',
    comingSoon: true,
    features: [
      { text: 'Tudo do Radar Defesa', included: true },
      { text: 'Painel de clientes', included: true, highlight: true },
      { text: 'Relatórios para laudos', included: true, highlight: true },
      { text: 'Até 20 clientes', included: true },
      { text: 'Exportação em massa', included: true },
      { text: 'Suporte dedicado', included: true },
    ],
    limits: {
      testes_mes: -1,
      entradas_diario_mes: -1,
      mensagens_chat_dia: -1,
      exportar_pdf: true,
      historico_completo: true,
      ias_colaborativas: true,
      clientes: 20,
    },
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'Users',
  },
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Retorna o plano pelo ID legado (para compatibilidade)
 */
export function getPlanByLegacyId(legacyId: string): PlanConfig | null {
  const plan = Object.values(PLANS).find(p => p.legacyId === legacyId)
  return plan || null
}

/**
 * Retorna o plano atual do usuário baseado no subscription status
 */
export function getUserPlanLevel(subscriptionStatus: string | null, planId: string | null): PlanLevel {
  if (!subscriptionStatus || subscriptionStatus === 'canceled' || !planId) {
    return 'guardar' // Usuário logado sem assinatura = Guardar
  }
  
  if (planId === 'premium' || planId === 'defesa') {
    return 'defesa'
  }
  
  if (planId === 'essencial' || planId === 'jornada') {
    return 'jornada'
  }
  
  return 'guardar'
}

/**
 * Verifica se o usuário tem acesso a uma feature
 */
export function hasFeatureAccess(userPlan: PlanLevel, feature: keyof PlanLimit): boolean {
  const plan = PLANS[userPlan]
  if (!plan) return false
  
  const limit = plan.limits[feature]
  
  if (typeof limit === 'boolean') {
    return limit
  }
  
  if (typeof limit === 'number') {
    return limit !== 0
  }
  
  return false
}

/**
 * Retorna o limite de uma feature para o plano
 */
export function getFeatureLimit(userPlan: PlanLevel, feature: keyof PlanLimit): number | boolean {
  const plan = PLANS[userPlan]
  if (!plan) return 0
  
  const limit = plan.limits[feature]
  return limit !== undefined ? limit : 0
}

/**
 * Formata preço em BRL
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Grátis'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

/**
 * Calcula economia anual
 */
export function getAnnualSavings(plan: PlanConfig): number {
  if (!plan.priceAnnual) return 0
  const monthlyTotal = plan.price * 12
  return monthlyTotal - plan.priceAnnual
}

/**
 * Retorna lista de planos para exibição (exclui visitante e profissional por padrão)
 */
export function getDisplayPlans(includeVisitante = false, includeProfissional = false): PlanConfig[] {
  const plans: PlanConfig[] = []
  
  if (includeVisitante) {
    plans.push(PLANS.visitante)
  }
  
  plans.push(PLANS.guardar)
  plans.push(PLANS.jornada)
  plans.push(PLANS.defesa)
  
  if (includeProfissional) {
    plans.push(PLANS.profissional)
  }
  
  return plans
}

/**
 * Mapeamento de nomes antigos para novos (para migração gradual)
 */
export const PLAN_NAME_MAPPING = {
  'Gratuito': 'Radar Guardar',
  'Essencial': 'Radar Jornada',
  'Premium': 'Radar Defesa',
} as const
