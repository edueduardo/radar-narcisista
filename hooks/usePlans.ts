'use client'

import { useState, useEffect } from 'react'
import { getDisplayPlans, type PlanConfig } from '@/lib/plans-config'

export interface PlanWithPromotion extends PlanConfig {
  effectivePrice?: number
  effectivePriceAnnual?: number
  hasPromotion?: boolean
  promotionLabel?: string | null
  promotionBadgeColor?: string | null
  showOriginalPrice?: boolean
}

interface UsePlansOptions {
  audience?: 'consumer' | 'professional'
  locale?: string
  includeVisitante?: boolean
  includeProfissional?: boolean
}

interface UsePlansReturn {
  plans: PlanWithPromotion[]
  isLoading: boolean
  error: string | null
  source: 'database' | 'fallback' | 'loading'
  refetch: () => void
}

/**
 * Hook para buscar planos do banco de dados com fallback para dados hardcoded
 */
export function usePlans(options: UsePlansOptions = {}): UsePlansReturn {
  const { 
    audience = 'consumer', 
    locale = 'pt-BR',
    includeVisitante = false,
    includeProfissional = false
  } = options
  
  const [plans, setPlans] = useState<PlanWithPromotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'database' | 'fallback' | 'loading'>('loading')

  const fetchPlans = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/plans?audience=${audience}&locale=${locale}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar planos')
      }
      
      const data = await response.json()
      
      if (data.plans && data.plans.length > 0 && data.source === 'database') {
        // Usar dados do banco
        const transformedPlans: PlanWithPromotion[] = data.plans.map((plan: any) => ({
          id: plan.id,
          legacyId: plan.legacyId,
          name: plan.name,
          tagline: plan.tagline,
          description: plan.description,
          price: plan.price,
          priceAnnual: plan.priceAnnual,
          effectivePrice: plan.effectivePrice,
          effectivePriceAnnual: plan.effectivePriceAnnual,
          period: plan.isFree ? 'forever' : 'month',
          popular: plan.isPopular,
          comingSoon: plan.isComingSoon,
          icon: plan.icon,
          color: plan.color,
          bgColor: plan.bgColor,
          features: plan.features,
          limits: {
            testsPerMonth: plan.limits.testsPerMonth,
            diaryEntriesPerMonth: plan.limits.diaryEntriesPerMonth,
            chatMessagesPerDay: plan.limits.chatMessagesPerDay,
            pdfExport: plan.limits.canExportPdf,
            fullHistory: plan.limits.canViewFullHistory,
            collaborativeAI: plan.limits.canUseCollaborativeAi,
          },
          hasPromotion: plan.hasPromotion,
          promotionLabel: plan.promotionLabel,
          promotionBadgeColor: plan.promotionBadgeColor,
          showOriginalPrice: plan.showOriginalPrice,
        }))
        
        setPlans(transformedPlans)
        setSource('database')
      } else {
        // Fallback para dados hardcoded
        useFallbackPlans()
      }
    } catch (err) {
      console.warn('Usando fallback para planos:', err)
      useFallbackPlans()
    } finally {
      setIsLoading(false)
    }
  }

  const useFallbackPlans = () => {
    const fallbackPlans = getDisplayPlans(includeVisitante, includeProfissional)
      .filter(p => !p.comingSoon)
      .map(plan => ({
        ...plan,
        effectivePrice: plan.price,
        effectivePriceAnnual: plan.priceAnnual,
        hasPromotion: false,
        promotionLabel: null,
        promotionBadgeColor: null,
        showOriginalPrice: false,
      }))
    
    setPlans(fallbackPlans)
    setSource('fallback')
  }

  useEffect(() => {
    fetchPlans()
  }, [audience, locale, includeVisitante, includeProfissional])

  return {
    plans,
    isLoading,
    error,
    source,
    refetch: fetchPlans,
  }
}

/**
 * Hook simplificado para planos de consumidor (B2C)
 */
export function useConsumerPlans(locale?: string) {
  return usePlans({ audience: 'consumer', locale })
}

/**
 * Hook simplificado para planos profissionais (B2B)
 */
export function useProfessionalPlans(locale?: string) {
  return usePlans({ audience: 'professional', locale })
}
