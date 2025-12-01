/**
 * ETAPA 10: Taxonomia de Planos
 * 
 * Define famílias de planos e classificações para uso nos dashboards.
 * NÃO altera lógica existente, apenas adiciona metadados.
 */

import type { PlanLevel } from './plans-config'

// =============================================================================
// TIPOS DE FAMÍLIA DE PLANO
// =============================================================================

export type PlanFamily =
  | 'free'          // visitante, guardar
  | 'journey'       // jornada
  | 'defense'       // defesa
  | 'professional'  // profissional
  | 'promo'         // planos temporários / campanhas

export type PlanAudience = 'consumer' | 'professional'

// =============================================================================
// INTERFACE DE TAXONOMIA
// =============================================================================

export interface PlanTaxonomy {
  level: PlanLevel
  family: PlanFamily
  audience: PlanAudience
  // Campo para mapeamento futuro de promoções
  baseForPromotions?: boolean
  // Ordem de hierarquia (maior = mais features)
  tier: number
  // Cor tema para UI
  themeColor: string
}

// =============================================================================
// MAPA PRINCIPAL DE TAXONOMIA
// =============================================================================

export const PLAN_TAXONOMY: Record<PlanLevel, PlanTaxonomy> = {
  visitante: {
    level: 'visitante',
    family: 'free',
    audience: 'consumer',
    tier: 0,
    themeColor: 'gray'
  },
  guardar: {
    level: 'guardar',
    family: 'free',
    audience: 'consumer',
    baseForPromotions: true,
    tier: 1,
    themeColor: 'emerald'
  },
  jornada: {
    level: 'jornada',
    family: 'journey',
    audience: 'consumer',
    baseForPromotions: true,
    tier: 2,
    themeColor: 'violet'
  },
  defesa: {
    level: 'defesa',
    family: 'defense',
    audience: 'consumer',
    baseForPromotions: true,
    tier: 3,
    themeColor: 'amber'
  },
  profissional: {
    level: 'profissional',
    family: 'professional',
    audience: 'professional',
    tier: 4,
    themeColor: 'blue'
  },
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Retorna a família do plano
 */
export function getPlanFamily(level: PlanLevel): PlanFamily {
  return PLAN_TAXONOMY[level]?.family ?? 'free'
}

/**
 * Verifica se é plano profissional
 */
export function isProfessionalPlan(level: PlanLevel): boolean {
  return PLAN_TAXONOMY[level]?.audience === 'professional'
}

/**
 * Verifica se é plano de consumidor
 */
export function isConsumerPlan(level: PlanLevel): boolean {
  return PLAN_TAXONOMY[level]?.audience === 'consumer'
}

/**
 * Retorna o tier do plano (para comparações)
 */
export function getPlanTier(level: PlanLevel): number {
  return PLAN_TAXONOMY[level]?.tier ?? 0
}

/**
 * Verifica se plano A é maior que plano B
 */
export function isPlanHigherThan(planA: PlanLevel, planB: PlanLevel): boolean {
  return getPlanTier(planA) > getPlanTier(planB)
}

/**
 * Retorna planos de uma família específica
 */
export function getPlansByFamily(family: PlanFamily): PlanLevel[] {
  return Object.entries(PLAN_TAXONOMY)
    .filter(([_, tax]) => tax.family === family)
    .map(([level]) => level as PlanLevel)
}

/**
 * Retorna planos por audiência
 */
export function getPlansByAudience(audience: PlanAudience): PlanLevel[] {
  return Object.entries(PLAN_TAXONOMY)
    .filter(([_, tax]) => tax.audience === audience)
    .map(([level]) => level as PlanLevel)
}

/**
 * Retorna a cor tema do plano
 */
export function getPlanThemeColor(level: PlanLevel): string {
  return PLAN_TAXONOMY[level]?.themeColor ?? 'gray'
}
