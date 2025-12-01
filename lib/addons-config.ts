/**
 * TEMA 12: Sistema de Add-ons e Upsells
 * 
 * Add-ons são recursos extras que podem ser comprados:
 * - Separadamente (avulso)
 * - Como upgrade pontual
 * - Como pacote promocional
 * 
 * Tipos de add-ons:
 * 1. Créditos extras (mensagens, entradas)
 * 2. Features avulsas (PDF, relatório)
 * 3. Pacotes temáticos (kit segurança, kit documentação)
 */

// =============================================================================
// TIPOS
// =============================================================================

export type AddonType = 'creditos' | 'feature' | 'pacote' | 'servico'
export type AddonCategory = 'chat' | 'diario' | 'exportacao' | 'seguranca' | 'premium'

export interface Addon {
  id: string
  name: string
  description: string
  shortDescription: string
  type: AddonType
  category: AddonCategory
  price: number
  originalPrice?: number // Para mostrar desconto
  stripePriceId?: string
  icon: string
  color: string
  bgColor: string
  
  // Detalhes específicos
  credits?: number          // Para tipo 'creditos'
  validityDays?: number     // Validade em dias (null = permanente)
  features?: string[]       // Lista de features incluídas
  
  // Condições
  availableForPlans: ('visitante' | 'guardar' | 'jornada' | 'defesa')[]
  oneTimePurchase?: boolean // Só pode comprar uma vez
  popular?: boolean
  comingSoon?: boolean
}

export interface UserAddon {
  addonId: string
  purchasedAt: string
  expiresAt?: string
  creditsRemaining?: number
  isActive: boolean
}

// =============================================================================
// CATÁLOGO DE ADD-ONS
// =============================================================================

export const ADDONS: Addon[] = [
  // -------------------------------------------------------------------------
  // CRÉDITOS EXTRAS
  // -------------------------------------------------------------------------
  {
    id: 'chat-50',
    name: '+50 Mensagens Coach IA',
    description: 'Pacote de 50 mensagens extras para o Coach IA. Ideal para momentos de crise ou quando você precisa de mais apoio.',
    shortDescription: '50 mensagens extras para o Coach IA',
    type: 'creditos',
    category: 'chat',
    price: 9.90,
    icon: 'MessageCircle',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    credits: 50,
    validityDays: 30,
    availableForPlans: ['guardar', 'jornada'],
  },
  {
    id: 'chat-200',
    name: '+200 Mensagens Coach IA',
    description: 'Pacote grande de 200 mensagens extras. Melhor custo-benefício para quem usa muito o Coach.',
    shortDescription: '200 mensagens extras (economia de 20%)',
    type: 'creditos',
    category: 'chat',
    price: 29.90,
    originalPrice: 39.60,
    icon: 'MessageCircle',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    credits: 200,
    validityDays: 60,
    popular: true,
    availableForPlans: ['guardar', 'jornada'],
  },
  {
    id: 'diario-10',
    name: '+10 Entradas no Diário',
    description: 'Pacote de 10 entradas extras no diário. Para quando você precisa documentar mais episódios.',
    shortDescription: '10 entradas extras no diário',
    type: 'creditos',
    category: 'diario',
    price: 4.90,
    icon: 'PenLine',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    credits: 10,
    validityDays: 30,
    availableForPlans: ['guardar'],
  },

  // -------------------------------------------------------------------------
  // FEATURES AVULSAS
  // -------------------------------------------------------------------------
  {
    id: 'pdf-export',
    name: 'Exportar PDF (Avulso)',
    description: 'Exporte seu resultado do Teste de Clareza em PDF uma vez. Ideal para quem quer guardar ou mostrar para um profissional.',
    shortDescription: 'Exportar 1 PDF do teste',
    type: 'feature',
    category: 'exportacao',
    price: 4.90,
    icon: 'FileDown',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    oneTimePurchase: false, // Pode comprar várias vezes
    availableForPlans: ['guardar'],
  },
  {
    id: 'relatorio-completo',
    name: 'Relatório Completo',
    description: 'Relatório detalhado com análise de todos os seus registros, padrões identificados e recomendações personalizadas. Ideal para compartilhar com profissionais de saúde ou advogados.',
    shortDescription: 'Análise completa dos seus dados',
    type: 'feature',
    category: 'exportacao',
    price: 19.90,
    stripePriceId: process.env.STRIPE_PRICE_ADDON_RELATORIO,
    icon: 'BarChart3',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    popular: true,
    features: [
      'Análise de padrões do diário',
      'Evolução temporal',
      'Categorias mais frequentes',
      'Recomendações personalizadas',
      'PDF profissional',
    ],
    availableForPlans: ['guardar', 'jornada'],
  },

  // -------------------------------------------------------------------------
  // PACOTES TEMÁTICOS
  // -------------------------------------------------------------------------
  {
    id: 'kit-seguranca',
    name: 'Kit Segurança',
    description: 'Pacote completo para situações de risco. Inclui guia de plano de fuga, checklist de documentos e contatos de emergência personalizados. Essencial para quem precisa se proteger.',
    shortDescription: 'Ferramentas para sua proteção',
    type: 'pacote',
    category: 'seguranca',
    price: 14.90,
    stripePriceId: process.env.STRIPE_PRICE_ADDON_KIT_SEGURANCA,
    icon: 'Shield',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    popular: true,
    features: [
      'Guia de Plano de Fuga (PDF)',
      'Checklist de Documentos',
      'Contatos de Emergência Personalizados',
      'Roteiro de Denúncia',
      'Acesso por 90 dias',
    ],
    validityDays: 90,
    availableForPlans: ['guardar', 'jornada', 'defesa'],
  },
  {
    id: 'kit-documentacao',
    name: 'Kit Documentação Legal',
    description: 'Ferramentas para documentar e organizar evidências. Útil para processos judiciais ou medidas protetivas.',
    shortDescription: 'Organize suas evidências',
    type: 'pacote',
    category: 'seguranca',
    price: 24.90,
    icon: 'FileText',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    features: [
      'Template de Linha do Tempo',
      'Guia de Coleta de Provas',
      'Modelo de Declaração',
      'Exportação formatada para advogado',
      'Acesso permanente',
    ],
    availableForPlans: ['guardar', 'jornada', 'defesa'],
  },

  // -------------------------------------------------------------------------
  // SERVIÇOS (FUTURO)
  // -------------------------------------------------------------------------
  {
    id: 'sessao-orientacao',
    name: 'Sessão de Orientação',
    description: 'Uma sessão de 30 minutos com profissional especializado para tirar dúvidas e receber orientação personalizada.',
    shortDescription: '30 min com especialista',
    type: 'servico',
    category: 'premium',
    price: 99.90,
    icon: 'Video',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    comingSoon: true,
    availableForPlans: ['guardar', 'jornada', 'defesa'],
  },
]

// =============================================================================
// UPSELLS CONTEXTUAIS
// =============================================================================

export interface Upsell {
  id: string
  trigger: string           // Quando mostrar
  addonId: string           // Qual addon oferecer
  title: string
  message: string
  discount?: number         // Desconto em %
  priority: number          // Maior = mais importante
}

export const UPSELLS: Upsell[] = [
  {
    id: 'upsell-chat-limit',
    trigger: 'chat_limit_reached',
    addonId: 'chat-50',
    title: 'Precisa de mais mensagens?',
    message: 'Você atingiu o limite de hoje. Adicione 50 mensagens extras por apenas R$9,90.',
    priority: 10,
  },
  {
    id: 'upsell-chat-near-limit',
    trigger: 'chat_near_limit',
    addonId: 'chat-200',
    title: 'Suas mensagens estão acabando',
    message: 'Aproveite o pacote de 200 mensagens com 20% de desconto!',
    discount: 20,
    priority: 5,
  },
  {
    id: 'upsell-diary-limit',
    trigger: 'diary_limit_reached',
    addonId: 'diario-10',
    title: 'Limite de entradas atingido',
    message: 'Adicione 10 entradas extras por apenas R$4,90 ou faça upgrade para diário ilimitado.',
    priority: 10,
  },
  {
    id: 'upsell-pdf-result',
    trigger: 'test_result_view',
    addonId: 'pdf-export',
    title: 'Quer guardar este resultado?',
    message: 'Exporte em PDF para mostrar a um profissional ou guardar com segurança.',
    priority: 3,
  },
  {
    id: 'upsell-risk-detected',
    trigger: 'physical_risk_detected',
    addonId: 'kit-seguranca',
    title: 'Sua segurança é prioridade',
    message: 'Detectamos sinais de risco. O Kit Segurança pode te ajudar a se proteger.',
    priority: 15,
  },
  {
    id: 'upsell-many-entries',
    trigger: 'many_diary_entries',
    addonId: 'relatorio-completo',
    title: 'Você tem muitos registros!',
    message: 'Gere um relatório completo para visualizar padrões e compartilhar com profissionais.',
    priority: 4,
  },
]

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Retorna add-ons disponíveis para um plano
 */
export function getAddonsForPlan(planLevel: string): Addon[] {
  return ADDONS.filter(addon => 
    addon.availableForPlans.includes(planLevel as any) && !addon.comingSoon
  )
}

/**
 * Retorna add-ons por categoria
 */
export function getAddonsByCategory(category: AddonCategory): Addon[] {
  return ADDONS.filter(addon => addon.category === category && !addon.comingSoon)
}

/**
 * Retorna add-ons populares
 */
export function getPopularAddons(): Addon[] {
  return ADDONS.filter(addon => addon.popular && !addon.comingSoon)
}

/**
 * Retorna upsell para um trigger específico
 */
export function getUpsellForTrigger(trigger: string): Upsell | null {
  const upsells = UPSELLS.filter(u => u.trigger === trigger)
  if (upsells.length === 0) return null
  
  // Retorna o de maior prioridade
  return upsells.sort((a, b) => b.priority - a.priority)[0]
}

/**
 * Retorna addon por ID
 */
export function getAddonById(id: string): Addon | null {
  return ADDONS.find(addon => addon.id === id) || null
}

/**
 * Calcula preço com desconto
 */
export function calculateDiscountedPrice(addon: Addon, discountPercent?: number): number {
  if (!discountPercent) return addon.price
  return addon.price * (1 - discountPercent / 100)
}

/**
 * Formata preço
 */
export function formatAddonPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

/**
 * Verifica se addon está expirado
 */
export function isAddonExpired(userAddon: UserAddon): boolean {
  if (!userAddon.expiresAt) return false
  return new Date(userAddon.expiresAt) < new Date()
}

/**
 * Verifica se usuário tem addon ativo
 */
export function hasActiveAddon(userAddons: UserAddon[], addonId: string): boolean {
  const addon = userAddons.find(ua => ua.addonId === addonId)
  if (!addon) return false
  return addon.isActive && !isAddonExpired(addon)
}

/**
 * Retorna créditos restantes de um addon
 */
export function getAddonCredits(userAddons: UserAddon[], addonId: string): number {
  const addon = userAddons.find(ua => ua.addonId === addonId && ua.isActive)
  if (!addon || isAddonExpired(addon)) return 0
  return addon.creditsRemaining || 0
}
