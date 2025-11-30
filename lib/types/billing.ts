/**
 * TIPOS PARA SISTEMA DE BILLING/PLANOS
 * 
 * Tipos TypeScript que espelham as tabelas billing_plans e billing_plan_promotions
 */

// =============================================================================
// TIPOS BASE (espelham as tabelas do banco)
// =============================================================================

export type PlanAudience = 'consumer' | 'professional'

export interface BillingPlan {
  id: string
  code: string
  legacy_id: string | null
  audience: PlanAudience
  is_free: boolean
  is_public: boolean
  is_mid_bridge: boolean
  
  // Textos
  name_pt: string
  name_en: string | null
  name_es: string | null
  tagline_pt: string | null
  tagline_en: string | null
  tagline_es: string | null
  description_pt: string | null
  description_en: string | null
  description_es: string | null
  
  // Preços (em centavos)
  price_monthly_cents: number
  price_yearly_cents: number
  currency: string
  
  // Limites
  max_tests_per_month: number
  max_diary_entries_per_month: number
  max_chat_messages_per_day: number
  can_export_pdf: boolean
  can_view_full_history: boolean
  can_use_collaborative_ai: boolean
  max_clients: number
  
  // Stripe
  stripe_price_monthly_id: string | null
  stripe_price_yearly_id: string | null
  
  // UI
  icon: string
  color: string
  bg_color: string
  is_popular: boolean
  is_coming_soon: boolean
  sort_order: number
  
  // Metadados
  created_at: string
  updated_at: string
}

export interface BillingPlanPromotion {
  id: string
  plan_id: string
  
  // Labels
  label_pt: string | null
  label_en: string | null
  label_es: string | null
  
  // Período
  starts_at: string | null
  ends_at: string | null
  
  // Preços promocionais (em centavos)
  promo_price_monthly_cents: number | null
  promo_price_yearly_cents: number | null
  discount_percent: number | null
  
  // Configurações
  is_active: boolean
  show_original_price: boolean
  badge_color: string
  
  // Metadados
  created_at: string
  updated_at: string
}

// =============================================================================
// TIPOS DERIVADOS (para uso na aplicação)
// =============================================================================

export type Locale = 'pt-BR' | 'en' | 'es'

/**
 * Plano com textos já resolvidos para o idioma atual
 */
export interface AppPlan {
  id: string
  code: string
  legacyId: string | null
  audience: PlanAudience
  isFree: boolean
  isPublic: boolean
  isMidBridge: boolean
  
  // Textos resolvidos
  name: string
  tagline: string
  description: string
  
  // Preços (em reais, não centavos)
  priceMonthly: number
  priceYearly: number
  currency: string
  
  // Limites
  limits: {
    testsPerMonth: number
    diaryEntriesPerMonth: number
    chatMessagesPerDay: number
    canExportPdf: boolean
    canViewFullHistory: boolean
    canUseCollaborativeAi: boolean
    maxClients: number
  }
  
  // Stripe
  stripePriceMonthlyId: string | null
  stripePriceYearlyId: string | null
  
  // UI
  icon: string
  color: string
  bgColor: string
  isPopular: boolean
  isComingSoon: boolean
  sortOrder: number
}

/**
 * Promoção com textos já resolvidos para o idioma atual
 */
export interface AppPlanPromotion {
  id: string
  planId: string
  
  // Label resolvido
  label: string
  
  // Período
  startsAt: Date | null
  endsAt: Date | null
  
  // Preços promocionais (em reais)
  promoPriceMonthly: number | null
  promoPriceYearly: number | null
  discountPercent: number | null
  
  // Configurações
  isActive: boolean
  showOriginalPrice: boolean
  badgeColor: string
}

/**
 * Plano com preço efetivo (considerando promoção ativa)
 */
export interface AppPlanWithEffectivePrice extends AppPlan {
  // Promoção ativa (se houver)
  activePromotion: AppPlanPromotion | null
  
  // Preços efetivos (considerando promoção)
  effectivePriceMonthly: number
  effectivePriceYearly: number
  
  // Flags de promoção
  hasActivePromotion: boolean
  promotionLabel: string | null
  promotionBadgeColor: string | null
  
  // Preços originais (para mostrar riscado)
  originalPriceMonthly: number
  originalPriceYearly: number
  showOriginalPrice: boolean
}

// =============================================================================
// TIPOS PARA ADMIN
// =============================================================================

/**
 * Input para criar/atualizar plano
 */
export interface PlanInput {
  code: string
  legacy_id?: string
  audience: PlanAudience
  is_free: boolean
  is_public: boolean
  is_mid_bridge: boolean
  
  name_pt: string
  name_en?: string
  name_es?: string
  tagline_pt?: string
  tagline_en?: string
  tagline_es?: string
  description_pt?: string
  description_en?: string
  description_es?: string
  
  price_monthly_cents: number
  price_yearly_cents: number
  
  max_tests_per_month: number
  max_diary_entries_per_month: number
  max_chat_messages_per_day: number
  can_export_pdf: boolean
  can_view_full_history: boolean
  can_use_collaborative_ai: boolean
  max_clients?: number
  
  stripe_price_monthly_id?: string
  stripe_price_yearly_id?: string
  
  icon?: string
  color?: string
  bg_color?: string
  is_popular?: boolean
  is_coming_soon?: boolean
  sort_order?: number
}

/**
 * Input para criar/atualizar promoção
 */
export interface PromotionInput {
  plan_id: string
  
  label_pt?: string
  label_en?: string
  label_es?: string
  
  starts_at?: string
  ends_at?: string
  
  promo_price_monthly_cents?: number
  promo_price_yearly_cents?: number
  discount_percent?: number
  
  is_active?: boolean
  show_original_price?: boolean
  badge_color?: string
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Converte centavos para reais
 */
export function centsToReais(cents: number): number {
  return cents / 100
}

/**
 * Converte reais para centavos
 */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100)
}

/**
 * Formata preço em BRL
 */
export function formatPriceBRL(value: number): string {
  if (value === 0) return 'Grátis'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Verifica se uma promoção está ativa agora
 */
export function isPromotionActiveNow(promo: BillingPlanPromotion): boolean {
  if (!promo.is_active) return false
  
  const now = new Date()
  
  if (promo.starts_at && new Date(promo.starts_at) > now) return false
  if (promo.ends_at && new Date(promo.ends_at) < now) return false
  
  return true
}

/**
 * Calcula preço com desconto percentual
 */
export function applyDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100)
}
