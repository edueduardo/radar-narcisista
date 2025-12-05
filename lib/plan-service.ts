/**
 * SERVIÇO DE PLANOS
 * 
 * Camada de serviço para acessar planos e promoções do banco de dados.
 * Substitui gradualmente o uso direto de plans-config.ts.
 */

import { createServerComponentClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import {
  BillingPlan,
  BillingPlanPromotion,
  AppPlan,
  AppPlanPromotion,
  AppPlanWithEffectivePrice,
  PlanInput,
  PromotionInput,
  Locale,
  centsToReais,
  isPromotionActiveNow,
  applyDiscount,
} from './types/billing'

// =============================================================================
// HELPERS INTERNOS
// =============================================================================

function resolveText(
  pt: string | null,
  en: string | null,
  es: string | null,
  locale: Locale = 'pt-BR'
): string {
  switch (locale) {
    case 'en': return en || pt || ''
    case 'es': return es || pt || ''
    default: return pt || ''
  }
}

function toAppPlan(plan: BillingPlan, locale: Locale = 'pt-BR'): AppPlan {
  return {
    id: plan.id,
    code: plan.code,
    legacyId: plan.legacy_id,
    audience: plan.audience,
    isFree: plan.is_free,
    isPublic: plan.is_public,
    isMidBridge: plan.is_mid_bridge,
    name: resolveText(plan.name_pt, plan.name_en, plan.name_es, locale),
    tagline: resolveText(plan.tagline_pt, plan.tagline_en, plan.tagline_es, locale),
    description: resolveText(plan.description_pt, plan.description_en, plan.description_es, locale),
    priceMonthly: centsToReais(plan.price_monthly_cents),
    priceYearly: centsToReais(plan.price_yearly_cents),
    currency: plan.currency,
    limits: {
      testsPerMonth: plan.max_tests_per_month,
      diaryEntriesPerMonth: plan.max_diary_entries_per_month,
      chatMessagesPerDay: plan.max_chat_messages_per_day,
      canExportPdf: plan.can_export_pdf,
      canViewFullHistory: plan.can_view_full_history,
      canUseCollaborativeAi: plan.can_use_collaborative_ai,
      maxClients: plan.max_clients,
    },
    stripePriceMonthlyId: plan.stripe_price_monthly_id,
    stripePriceYearlyId: plan.stripe_price_yearly_id,
    icon: plan.icon,
    color: plan.color,
    bgColor: plan.bg_color,
    isPopular: plan.is_popular,
    isComingSoon: plan.is_coming_soon,
    sortOrder: plan.sort_order,
  }
}

function toAppPromotion(promo: BillingPlanPromotion, locale: Locale = 'pt-BR'): AppPlanPromotion {
  return {
    id: promo.id,
    planId: promo.plan_id,
    label: resolveText(promo.label_pt, promo.label_en, promo.label_es, locale),
    startsAt: promo.starts_at ? new Date(promo.starts_at) : null,
    endsAt: promo.ends_at ? new Date(promo.ends_at) : null,
    promoPriceMonthly: promo.promo_price_monthly_cents ? centsToReais(promo.promo_price_monthly_cents) : null,
    promoPriceYearly: promo.promo_price_yearly_cents ? centsToReais(promo.promo_price_yearly_cents) : null,
    discountPercent: promo.discount_percent,
    isActive: promo.is_active,
    showOriginalPrice: promo.show_original_price,
    badgeColor: promo.badge_color,
  }
}

function calculateEffectivePrice(
  originalPrice: number,
  promo: AppPlanPromotion | null,
  period: 'monthly' | 'yearly'
): number {
  if (!promo) return originalPrice
  const promoPrice = period === 'monthly' ? promo.promoPriceMonthly : promo.promoPriceYearly
  if (promoPrice !== null) return promoPrice
  if (promo.discountPercent) return applyDiscount(originalPrice, promo.discountPercent)
  return originalPrice
}

// =============================================================================
// FUNÇÕES PÚBLICAS - LEITURA
// =============================================================================

export async function getPublicConsumerPlans(locale: Locale = 'pt-BR'): Promise<AppPlanWithEffectivePrice[]> {
  
  const supabase = await createServerComponentClient()
  
  const { data: plans, error } = await supabase
    .from('billing_plans')
    .select('*')
    .eq('audience', 'consumer')
    .eq('is_public', true)
    .order('sort_order', { ascending: true })
  
  if (error || !plans) {
    console.error('Erro ao buscar planos:', error)
    return []
  }
  
  const planIds = plans.map(p => p.id)
  const { data: promotions } = await supabase
    .from('billing_plan_promotions')
    .select('*')
    .in('plan_id', planIds)
    .eq('is_active', true)
  
  const promoMap = new Map<string, BillingPlanPromotion>()
  if (promotions) {
    for (const promo of promotions) {
      if (isPromotionActiveNow(promo)) {
        promoMap.set(promo.plan_id, promo)
      }
    }
  }
  
  return plans.map(plan => {
    const appPlan = toAppPlan(plan, locale)
    const rawPromo = promoMap.get(plan.id)
    const promo = rawPromo ? toAppPromotion(rawPromo, locale) : null
    
    return {
      ...appPlan,
      activePromotion: promo,
      effectivePriceMonthly: calculateEffectivePrice(appPlan.priceMonthly, promo, 'monthly'),
      effectivePriceYearly: calculateEffectivePrice(appPlan.priceYearly, promo, 'yearly'),
      hasActivePromotion: !!promo,
      promotionLabel: promo?.label || null,
      promotionBadgeColor: promo?.badgeColor || null,
      originalPriceMonthly: appPlan.priceMonthly,
      originalPriceYearly: appPlan.priceYearly,
      showOriginalPrice: promo?.showOriginalPrice ?? false,
    }
  })
}

export async function getPublicProfessionalPlans(locale: Locale = 'pt-BR'): Promise<AppPlanWithEffectivePrice[]> {
  
  const supabase = await createServerComponentClient()
  
  const { data: plans, error } = await supabase
    .from('billing_plans')
    .select('*')
    .eq('audience', 'professional')
    .eq('is_public', true)
    .order('sort_order', { ascending: true })
  
  if (error || !plans) return []
  
  return plans.map(plan => {
    const appPlan = toAppPlan(plan, locale)
    return {
      ...appPlan,
      activePromotion: null,
      effectivePriceMonthly: appPlan.priceMonthly,
      effectivePriceYearly: appPlan.priceYearly,
      hasActivePromotion: false,
      promotionLabel: null,
      promotionBadgeColor: null,
      originalPriceMonthly: appPlan.priceMonthly,
      originalPriceYearly: appPlan.priceYearly,
      showOriginalPrice: false,
    }
  })
}

export async function getAdminPlans(): Promise<{ plans: BillingPlan[], promotions: BillingPlanPromotion[] }> {
  
  const supabase = await createServerComponentClient()
  
  const [plansResult, promosResult] = await Promise.all([
    supabase.from('billing_plans').select('*').order('sort_order'),
    supabase.from('billing_plan_promotions').select('*').order('created_at', { ascending: false }),
  ])
  
  return {
    plans: plansResult.data || [],
    promotions: promosResult.data || [],
  }
}

export async function getPlanByCode(code: string, locale: Locale = 'pt-BR'): Promise<AppPlan | null> {
  
  const supabase = await createServerComponentClient()
  
  const { data: plan } = await supabase
    .from('billing_plans')
    .select('*')
    .eq('code', code)
    .single()
  
  if (!plan) return null
  return toAppPlan(plan, locale)
}

// =============================================================================
// FUNÇÕES PÚBLICAS - ESCRITA (ADMIN)
// =============================================================================

export async function upsertPlan(input: PlanInput & { id?: string }): Promise<{ success: boolean, error?: string }> {
  
  const supabase = await createServerComponentClient()
  
  if (input.id) {
    const { error } = await supabase
      .from('billing_plans')
      .update(input)
      .eq('id', input.id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('billing_plans')
      .insert(input)
    if (error) return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function upsertPromotion(input: PromotionInput & { id?: string }): Promise<{ success: boolean, error?: string }> {
  
  const supabase = await createServerComponentClient()
  
  if (input.id) {
    const { error } = await supabase
      .from('billing_plan_promotions')
      .update(input)
      .eq('id', input.id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('billing_plan_promotions')
      .insert(input)
    if (error) return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function deletePromotion(id: string): Promise<{ success: boolean, error?: string }> {
  
  const supabase = await createServerComponentClient()
  
  const { error } = await supabase
    .from('billing_plan_promotions')
    .delete()
    .eq('id', id)
  
  if (error) return { success: false, error: error.message }
  return { success: true }
}
