'use client'

/**
 * Hook para buscar planos do plan_catalog
 * TAREFA 10 - Integrar frontpage com plan_catalog dinamicamente
 * 
 * @see app/api/plan-catalog/route.ts
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 10
 */

import { useState, useEffect, useCallback } from 'react'

// Tipo para plano do catálogo
export interface CatalogPlan {
  id: string
  key: string
  name: string
  description: string
  price: number
  priceAnnual: number
  currency: string
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  features: string[]
  limits: {
    clarityTestsPerMonth: number
    journalEntriesPerMonth: number
    chatMessagesPerMonth: number
    clientsLimit?: number
  }
  isActive: boolean
  displayOrder: number
  isFree: boolean
  isPopular: boolean
  icon: string
  color: string
  bgColor: string
}

interface UsePlanCatalogReturn {
  plans: CatalogPlan[]
  isLoading: boolean
  error: string | null
  source: 'database' | 'fallback' | 'loading' | 'error'
  refetch: () => void
}

// Planos de fallback caso o banco não esteja disponível
const FALLBACK_PLANS: CatalogPlan[] = [
  {
    id: 'fallback-free',
    key: 'free',
    name: 'Gratuito',
    description: 'Acesso básico ao sistema',
    price: 0,
    priceAnnual: 0,
    currency: 'BRL',
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: ['Teste de Clareza', 'Diário de Emoções'],
    limits: {
      clarityTestsPerMonth: 1,
      journalEntriesPerMonth: 5,
      chatMessagesPerMonth: 0
    },
    isActive: true,
    displayOrder: 1,
    isFree: true,
    isPopular: false,
    icon: '🆓',
    color: 'gray',
    bgColor: 'bg-gray-500/20'
  },
  {
    id: 'fallback-basic',
    key: 'basic',
    name: 'Básico',
    description: 'Para quem está começando',
    price: 29.90,
    priceAnnual: 299.00,
    currency: 'BRL',
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: ['Teste de Clareza', 'Diário de Emoções', 'Chat com IA', 'Plano de Segurança'],
    limits: {
      clarityTestsPerMonth: 3,
      journalEntriesPerMonth: 30,
      chatMessagesPerMonth: 50
    },
    isActive: true,
    displayOrder: 2,
    isFree: false,
    isPopular: false,
    icon: '⚡',
    color: 'blue',
    bgColor: 'bg-blue-500/20'
  },
  {
    id: 'fallback-premium',
    key: 'premium',
    name: 'Premium',
    description: 'Acesso completo',
    price: 49.90,
    priceAnnual: 499.00,
    currency: 'BRL',
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: ['Teste de Clareza', 'Diário de Emoções', 'Chat com IA', 'Plano de Segurança', 'Exportar PDF', 'Entrada por Voz'],
    limits: {
      clarityTestsPerMonth: -1,
      journalEntriesPerMonth: -1,
      chatMessagesPerMonth: -1
    },
    isActive: true,
    displayOrder: 3,
    isFree: false,
    isPopular: true,
    icon: '👑',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20'
  },
  {
    id: 'fallback-professional',
    key: 'professional',
    name: 'Profissional',
    description: 'Para terapeutas e advogados',
    price: 99.90,
    priceAnnual: 999.00,
    currency: 'BRL',
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: ['Teste de Clareza', 'Diário de Emoções', 'Chat com IA', 'Plano de Segurança', 'Exportar PDF', 'Entrada por Voz', 'Gestão de Clientes', 'Relatórios Avançados'],
    limits: {
      clarityTestsPerMonth: -1,
      journalEntriesPerMonth: -1,
      chatMessagesPerMonth: -1,
      clientsLimit: 50
    },
    isActive: true,
    displayOrder: 4,
    isFree: false,
    isPopular: false,
    icon: '🏢',
    color: 'purple',
    bgColor: 'bg-purple-500/20'
  }
]

/**
 * Hook para buscar planos do plan_catalog com fallback
 */
export function usePlanCatalog(): UsePlanCatalogReturn {
  const [plans, setPlans] = useState<CatalogPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'database' | 'fallback' | 'loading' | 'error'>('loading')

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/plan-catalog')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar planos')
      }
      
      const data = await response.json()
      
      if (data.plans && data.plans.length > 0 && data.source === 'database') {
        setPlans(data.plans)
        setSource('database')
      } else {
        // Usar fallback
        setPlans(FALLBACK_PLANS)
        setSource('fallback')
      }
    } catch (err) {
      console.warn('Usando fallback para plan_catalog:', err)
      setPlans(FALLBACK_PLANS)
      setSource('fallback')
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return {
    plans,
    isLoading,
    error,
    source,
    refetch: fetchPlans
  }
}

/**
 * Hook simplificado para planos de consumidor (exclui professional)
 */
export function useConsumerCatalogPlans(): UsePlanCatalogReturn {
  const result = usePlanCatalog()
  return {
    ...result,
    plans: result.plans.filter(p => p.key !== 'professional')
  }
}

/**
 * Hook para obter um plano específico por key
 */
export function usePlanByKey(key: string): CatalogPlan | null {
  const { plans } = usePlanCatalog()
  return plans.find(p => p.key === key) || null
}

export default usePlanCatalog
