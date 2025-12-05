/**
 * RATE LIMITER - PLANOS_CORE
 * Sistema de rate limiting baseado em features
 * Bloco 36-40 - ETAPA 37
 */

import { createClient } from '@/lib/supabase/client'

// Tipos
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: Date | null
  period: 'daily' | 'weekly' | 'monthly'
  message?: string
}

export interface FeatureUsage {
  feature_key: string
  user_id: string
  count_today: number
  count_week: number
  count_month: number
  last_used: Date | null
}

export interface FeatureLimits {
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
}

// Tabela de uso de features (criar no Supabase)
export const FEATURE_USAGE_TABLE = 'feature_usage_logs'

/**
 * Classe principal de Rate Limiting
 */
export class RateLimiter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: any

  constructor(supabaseClient?: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient || createClient()
  }

  /**
   * Verificar se o usuário pode usar uma feature
   */
  async checkLimit(userId: string, featureKey: string): Promise<RateLimitResult> {
    try {
      // Buscar limites efetivos do usuário
      const limits = await this.getEffectiveLimits(userId, featureKey)
      
      if (!limits) {
        // Feature não existe ou usuário não tem acesso
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          resetAt: null,
          period: 'daily',
          message: 'Feature não disponível para seu plano'
        }
      }

      // Buscar uso atual
      const usage = await this.getCurrentUsage(userId, featureKey)

      // Verificar limite diário
      if (limits.limite_diario !== null) {
        if (usage.count_today >= limits.limite_diario) {
          return {
            allowed: false,
            remaining: 0,
            limit: limits.limite_diario,
            resetAt: this.getNextReset('daily'),
            period: 'daily',
            message: `Limite diário atingido (${limits.limite_diario}). Tente novamente amanhã.`
          }
        }
      }

      // Verificar limite semanal
      if (limits.limite_semanal !== null) {
        if (usage.count_week >= limits.limite_semanal) {
          return {
            allowed: false,
            remaining: 0,
            limit: limits.limite_semanal,
            resetAt: this.getNextReset('weekly'),
            period: 'weekly',
            message: `Limite semanal atingido (${limits.limite_semanal}). Tente novamente na próxima semana.`
          }
        }
      }

      // Verificar limite mensal
      if (limits.limite_mensal !== null) {
        if (usage.count_month >= limits.limite_mensal) {
          return {
            allowed: false,
            remaining: 0,
            limit: limits.limite_mensal,
            resetAt: this.getNextReset('monthly'),
            period: 'monthly',
            message: `Limite mensal atingido (${limits.limite_mensal}). Tente novamente no próximo mês.`
          }
        }
      }

      // Calcular remaining (menor dos limites)
      const remaining = this.calculateRemaining(usage, limits)

      return {
        allowed: true,
        remaining,
        limit: limits.limite_diario || limits.limite_semanal || limits.limite_mensal || 999,
        resetAt: this.getNextReset('daily'),
        period: 'daily'
      }
    } catch (error) {
      console.error('Erro no rate limiter:', error)
      // Em caso de erro, permitir (fail-open)
      return {
        allowed: true,
        remaining: 999,
        limit: 999,
        resetAt: null,
        period: 'daily',
        message: 'Erro ao verificar limite'
      }
    }
  }

  /**
   * Registrar uso de uma feature
   */
  async recordUsage(userId: string, featureKey: string, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(FEATURE_USAGE_TABLE)
        .insert({
          user_id: userId,
          feature_key: featureKey,
          used_at: new Date().toISOString(),
          metadata: metadata || {}
        })

      return !error
    } catch (error) {
      console.error('Erro ao registrar uso:', error)
      return false
    }
  }

  /**
   * Verificar e registrar uso em uma única operação
   */
  async checkAndRecord(userId: string, featureKey: string, metadata?: Record<string, any>): Promise<RateLimitResult> {
    const result = await this.checkLimit(userId, featureKey)
    
    if (result.allowed) {
      await this.recordUsage(userId, featureKey, metadata)
      result.remaining = Math.max(0, result.remaining - 1)
    }

    return result
  }

  /**
   * Obter limites efetivos do usuário para uma feature
   */
  private async getEffectiveLimits(userId: string, featureKey: string): Promise<FeatureLimits | null> {
    // Primeiro verificar overrides
    const { data: override } = await this.supabase
      .from('user_feature_overrides')
      .select('limite_diario, limite_semanal, limite_mensal, override_type')
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .eq('ativo', true)
      .single()

    if (override) {
      if (override.override_type === 'revoke') {
        return null // Feature revogada
      }
      if (override.override_type === 'limit_custom') {
        return {
          limite_diario: override.limite_diario,
          limite_semanal: override.limite_semanal,
          limite_mensal: override.limite_mensal
        }
      }
      // grant = sem limite
      return {
        limite_diario: null,
        limite_semanal: null,
        limite_mensal: null
      }
    }

    // Buscar do profile do plano
    const { data: subscription } = await this.supabase
      .from('user_subscriptions_core')
      .select('feature_profile_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    let profileId = subscription?.feature_profile_id

    // Se não tem assinatura, usar free_v1
    if (!profileId) {
      const { data: freeProfile } = await this.supabase
        .from('feature_profiles')
        .select('id')
        .eq('profile_key', 'free_v1')
        .single()
      
      profileId = freeProfile?.id
    }

    if (!profileId) return null

    // Buscar limites do profile
    const { data: featureConfig } = await this.supabase
      .from('feature_profile_features')
      .select('limite_diario, limite_semanal, limite_mensal')
      .eq('profile_id', profileId)
      .eq('feature_key', featureKey)
      .single()

    if (!featureConfig) return null

    return {
      limite_diario: featureConfig.limite_diario,
      limite_semanal: featureConfig.limite_semanal,
      limite_mensal: featureConfig.limite_mensal
    }
  }

  /**
   * Obter uso atual do usuário
   */
  private async getCurrentUsage(userId: string, featureKey: string): Promise<FeatureUsage> {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Contar uso diário
    const { count: countToday } = await this.supabase
      .from(FEATURE_USAGE_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .gte('used_at', startOfDay.toISOString())

    // Contar uso semanal
    const { count: countWeek } = await this.supabase
      .from(FEATURE_USAGE_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .gte('used_at', startOfWeek.toISOString())

    // Contar uso mensal
    const { count: countMonth } = await this.supabase
      .from(FEATURE_USAGE_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .gte('used_at', startOfMonth.toISOString())

    return {
      feature_key: featureKey,
      user_id: userId,
      count_today: countToday || 0,
      count_week: countWeek || 0,
      count_month: countMonth || 0,
      last_used: null
    }
  }

  /**
   * Calcular remaining baseado nos limites
   */
  private calculateRemaining(usage: FeatureUsage, limits: FeatureLimits): number {
    const remainings: number[] = []

    if (limits.limite_diario !== null) {
      remainings.push(limits.limite_diario - usage.count_today)
    }
    if (limits.limite_semanal !== null) {
      remainings.push(limits.limite_semanal - usage.count_week)
    }
    if (limits.limite_mensal !== null) {
      remainings.push(limits.limite_mensal - usage.count_month)
    }

    return remainings.length > 0 ? Math.min(...remainings) : 999
  }

  /**
   * Calcular próximo reset
   */
  private getNextReset(period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date()
    
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      case 'weekly':
        const nextWeek = new Date(now)
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()))
        return nextWeek
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }
  }

  /**
   * Obter estatísticas de uso do usuário
   */
  async getUserStats(userId: string): Promise<Record<string, FeatureUsage>> {
    const { data: features } = await this.supabase
      .from('features')
      .select('feature_key')

    const stats: Record<string, FeatureUsage> = {}

    if (features) {
      for (const feature of features) {
        stats[feature.feature_key] = await this.getCurrentUsage(userId, feature.feature_key)
      }
    }

    return stats
  }
}

// Hook React para rate limiting
export function useRateLimiter() {
  const rateLimiter = new RateLimiter()

  return {
    checkLimit: rateLimiter.checkLimit.bind(rateLimiter),
    recordUsage: rateLimiter.recordUsage.bind(rateLimiter),
    checkAndRecord: rateLimiter.checkAndRecord.bind(rateLimiter),
    getUserStats: rateLimiter.getUserStats.bind(rateLimiter)
  }
}

// Singleton para uso em API routes
let rateLimiterInstance: RateLimiter | null = null

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter()
  }
  return rateLimiterInstance
}
