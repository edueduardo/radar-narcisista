import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { 
  BillingPlan, 
  BillingPlanPromotion, 
  centsToReais, 
  isPromotionActiveNow 
} from '@/lib/types/billing'

// Tipo para locale
type Locale = 'pt-BR' | 'en' | 'es'

// Resolve texto para o idioma
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

// GET /api/plans - Retorna planos públicos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const audience = searchParams.get('audience') || 'consumer'
    const locale = (searchParams.get('locale') || 'pt-BR') as Locale
    
    
    const supabase = await createServerComponentClient()
    
    // Buscar planos públicos
    const { data: plans, error: plansError } = await supabase
      .from('billing_plans')
      .select('*')
      .eq('audience', audience)
      .eq('is_public', true)
      .order('sort_order', { ascending: true })
    
    if (plansError) {
      console.error('Erro ao buscar planos:', plansError)
      // Fallback: retornar array vazio (frontend usará dados hardcoded)
      return NextResponse.json({ plans: [], source: 'fallback' })
    }
    
    if (!plans || plans.length === 0) {
      return NextResponse.json({ plans: [], source: 'empty' })
    }
    
    // Buscar promoções ativas
    const planIds = plans.map(p => p.id)
    const { data: promotions } = await supabase
      .from('billing_plan_promotions')
      .select('*')
      .in('plan_id', planIds)
      .eq('is_active', true)
    
    // Mapear promoções por plan_id
    const promoMap = new Map<string, BillingPlanPromotion>()
    if (promotions) {
      for (const promo of promotions) {
        if (isPromotionActiveNow(promo)) {
          promoMap.set(promo.plan_id, promo)
        }
      }
    }
    
    // Transformar planos para formato do frontend
    const transformedPlans = plans.map((plan: BillingPlan) => {
      const promo = promoMap.get(plan.id)
      
      // Calcular preço efetivo
      let effectivePriceMonthly = centsToReais(plan.price_monthly_cents)
      let effectivePriceYearly = centsToReais(plan.price_yearly_cents)
      
      if (promo) {
        if (promo.promo_price_monthly_cents !== null) {
          effectivePriceMonthly = centsToReais(promo.promo_price_monthly_cents)
        } else if (promo.discount_percent) {
          effectivePriceMonthly = effectivePriceMonthly * (1 - promo.discount_percent / 100)
        }
        
        if (promo.promo_price_yearly_cents !== null) {
          effectivePriceYearly = centsToReais(promo.promo_price_yearly_cents)
        } else if (promo.discount_percent) {
          effectivePriceYearly = effectivePriceYearly * (1 - promo.discount_percent / 100)
        }
      }
      
      return {
        id: plan.code,
        code: plan.code,
        legacyId: plan.legacy_id,
        name: resolveText(plan.name_pt, plan.name_en, plan.name_es, locale),
        tagline: resolveText(plan.tagline_pt, plan.tagline_en, plan.tagline_es, locale),
        description: resolveText(plan.description_pt, plan.description_en, plan.description_es, locale),
        price: centsToReais(plan.price_monthly_cents),
        priceAnnual: centsToReais(plan.price_yearly_cents),
        effectivePrice: effectivePriceMonthly,
        effectivePriceAnnual: effectivePriceYearly,
        isFree: plan.is_free,
        isPopular: plan.is_popular,
        isComingSoon: plan.is_coming_soon,
        icon: plan.icon,
        color: plan.color,
        bgColor: plan.bg_color,
        limits: {
          testsPerMonth: plan.max_tests_per_month,
          diaryEntriesPerMonth: plan.max_diary_entries_per_month,
          chatMessagesPerDay: plan.max_chat_messages_per_day,
          canExportPdf: plan.can_export_pdf,
          canViewFullHistory: plan.can_view_full_history,
          canUseCollaborativeAi: plan.can_use_collaborative_ai,
        },
        // Promoção ativa
        hasPromotion: !!promo,
        promotionLabel: promo ? resolveText(promo.label_pt, promo.label_en, promo.label_es, locale) : null,
        promotionBadgeColor: promo?.badge_color || null,
        showOriginalPrice: promo?.show_original_price || false,
        // Features para compatibilidade com UI existente
        features: generateFeatures(plan, locale),
      }
    })
    
    return NextResponse.json({ 
      plans: transformedPlans, 
      source: 'database',
      count: transformedPlans.length 
    })
    
  } catch (error) {
    console.error('Erro na API de planos:', error)
    return NextResponse.json({ plans: [], source: 'error' })
  }
}

// Gera lista de features para compatibilidade com UI existente
function generateFeatures(plan: BillingPlan, locale: Locale) {
  const features = []
  
  // Testes
  if (plan.max_tests_per_month === -1) {
    features.push({ text: 'Testes de clareza ilimitados', included: true })
  } else if (plan.max_tests_per_month > 0) {
    features.push({ text: `${plan.max_tests_per_month} teste(s) de clareza/mês`, included: true })
  } else {
    features.push({ text: 'Testes de clareza', included: false })
  }
  
  // Diário
  if (plan.max_diary_entries_per_month === -1) {
    features.push({ text: 'Diário ilimitado', included: true, highlight: true })
  } else if (plan.max_diary_entries_per_month > 0) {
    features.push({ text: `${plan.max_diary_entries_per_month} entradas no diário/mês`, included: true })
  } else {
    features.push({ text: 'Diário de episódios', included: false })
  }
  
  // Chat
  if (plan.max_chat_messages_per_day === -1) {
    features.push({ text: 'Coach IA ilimitado', included: true, highlight: true })
  } else if (plan.max_chat_messages_per_day > 0) {
    features.push({ text: `${plan.max_chat_messages_per_day} mensagens/dia com Coach IA`, included: true })
  } else {
    features.push({ text: 'Coach IA', included: false })
  }
  
  // PDF
  features.push({ 
    text: 'Exportar relatórios PDF', 
    included: plan.can_export_pdf 
  })
  
  // Histórico
  features.push({ 
    text: 'Histórico completo', 
    included: plan.can_view_full_history 
  })
  
  // IA Colaborativa
  features.push({ 
    text: 'IAs colaborativas', 
    included: plan.can_use_collaborative_ai 
  })
  
  return features
}
