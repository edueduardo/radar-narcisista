/**
 * PLANOS_CORE - Sistema de Features, Profiles e Planos
 * 
 * Este módulo é parte do CORE do GERADOR DE SAAS.
 * Pode ser reutilizado em qualquer SaaS gerado.
 * 
 * Arquitetura:
 * - features: funcionalidades atômicas (diario, chat_ia, relatorios_pdf, etc.)
 * - feature_profiles: conjuntos versionados de features (free_v1, profissional_v1, etc.)
 * - plan_catalog: planos visíveis para venda (free, profissional, defesa, white-label)
 * - user_feature_overrides: ajustes individuais por usuário
 * - user_subscriptions_core: assinatura ativa do usuário
 */

import { createClient } from '@/lib/supabase/client'

// =============================================================================
// TIPOS
// =============================================================================

export interface Feature {
  feature_key: string
  nome: string
  descricao: string | null
  tipo: 'boolean' | 'number' | 'text'
  categoria: string
  metadata: Record<string, any>
  ordem_exibicao: number
  visivel_usuario: boolean
}

export interface FeatureProfile {
  id: string
  profile_key: string
  nome_exibicao: string
  descricao: string | null
  tipo_profile: 'padrao' | 'promo' | 'cohort' | 'exclusivo'
  cohort_label: string | null
  marketable: boolean
  ativo: boolean
  data_inicio: string | null
  data_fim: string | null
  metadata: Record<string, any>
}

export interface FeatureProfileFeature {
  id: string
  profile_id: string
  feature_key: string
  valor: any
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
}

export interface PlanCatalog {
  id: string
  slug: string
  nome_exibicao: string
  descricao_curta: string | null
  descricao_longa: string | null
  current_profile_id: string | null
  stripe_price_id_mensal: string | null
  stripe_price_id_anual: string | null
  preco_mensal_centavos: number
  preco_anual_centavos: number
  moeda: string
  tags: string[]
  ordem_exibicao: number
  visivel: boolean
  cor_destaque: string | null
  icone: string | null
}

export interface UserFeatureOverride {
  id: string
  user_id: string
  feature_key: string
  override_type: 'grant' | 'revoke' | 'limit_custom'
  valor: any
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  motivo: string | null
  concedido_por: string | null
  valido_ate: string | null
  ativo: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_slug: string
  feature_profile_id: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  periodo: 'mensal' | 'anual'
  data_inicio: string
  data_fim: string | null
  proximo_pagamento: string | null
  cohort_tag: string | null
  metadata: Record<string, any>
}

export interface EffectiveFeature {
  valor: any
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  override?: boolean
}

export type EffectiveFeatures = Record<string, EffectiveFeature>

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

export class PlanosCore {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient?: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient || createClient()
  }

  // ---------------------------------------------------------------------------
  // FEATURES
  // ---------------------------------------------------------------------------

  async getAllFeatures(): Promise<Feature[]> {
    const { data, error } = await this.supabase
      .from('features')
      .select('*')
      .order('ordem_exibicao')
    
    if (error) throw error
    return data || []
  }

  async getFeaturesByCategoria(categoria: string): Promise<Feature[]> {
    const { data, error } = await this.supabase
      .from('features')
      .select('*')
      .eq('categoria', categoria)
      .order('ordem_exibicao')
    
    if (error) throw error
    return data || []
  }

  // ---------------------------------------------------------------------------
  // FEATURE PROFILES
  // ---------------------------------------------------------------------------

  async getAllProfiles(): Promise<FeatureProfile[]> {
    const { data, error } = await this.supabase
      .from('feature_profiles')
      .select('*')
      .order('created_at')
    
    if (error) throw error
    return data || []
  }

  async getProfileByKey(profileKey: string): Promise<FeatureProfile | null> {
    const { data, error } = await this.supabase
      .from('feature_profiles')
      .select('*')
      .eq('profile_key', profileKey)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getProfileFeatures(profileId: string): Promise<FeatureProfileFeature[]> {
    const { data, error } = await this.supabase
      .from('feature_profile_features')
      .select('*')
      .eq('profile_id', profileId)
    
    if (error) throw error
    return data || []
  }

  // ---------------------------------------------------------------------------
  // PLAN CATALOG
  // ---------------------------------------------------------------------------

  async getAllPlans(): Promise<PlanCatalog[]> {
    const { data, error } = await this.supabase
      .from('plan_catalog')
      .select('*')
      .order('ordem_exibicao')
    
    if (error) throw error
    return data || []
  }

  async getVisiblePlans(): Promise<PlanCatalog[]> {
    const { data, error } = await this.supabase
      .from('plan_catalog')
      .select('*')
      .eq('visivel', true)
      .order('ordem_exibicao')
    
    if (error) throw error
    return data || []
  }

  async getPlanBySlug(slug: string): Promise<PlanCatalog | null> {
    const { data, error } = await this.supabase
      .from('plan_catalog')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getPlanWithFeatures(slug: string): Promise<{
    plan: PlanCatalog
    profile: FeatureProfile | null
    features: FeatureProfileFeature[]
  } | null> {
    const plan = await this.getPlanBySlug(slug)
    if (!plan) return null

    let profile: FeatureProfile | null = null
    let features: FeatureProfileFeature[] = []

    if (plan.current_profile_id) {
      const { data: profileData } = await this.supabase
        .from('feature_profiles')
        .select('*')
        .eq('id', plan.current_profile_id)
        .single()
      
      profile = profileData as FeatureProfile | null

      if (profile && profile.id) {
        features = await this.getProfileFeatures(profile.id)
      }
    }

    return { plan, profile, features }
  }

  // ---------------------------------------------------------------------------
  // USER SUBSCRIPTIONS
  // ---------------------------------------------------------------------------

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions_core')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async createSubscription(subscription: Omit<UserSubscription, 'id' | 'data_inicio'>): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions_core')
      .insert(subscription as any)
      .select()
      .single()
    
    if (error) throw error
    return data as UserSubscription
  }

  async updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('user_subscriptions_core')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data as UserSubscription
  }

  // ---------------------------------------------------------------------------
  // USER FEATURE OVERRIDES
  // ---------------------------------------------------------------------------

  async getUserOverrides(userId: string): Promise<UserFeatureOverride[]> {
    const { data, error } = await this.supabase
      .from('user_feature_overrides')
      .select('*')
      .eq('user_id', userId)
      .eq('ativo', true)
    
    if (error) throw error
    return data || []
  }

  async addOverride(override: Omit<UserFeatureOverride, 'id' | 'ativo'>): Promise<UserFeatureOverride> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('user_feature_overrides')
      .upsert({
        ...override,
        ativo: true
      }, {
        onConflict: 'user_id,feature_key'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async removeOverride(userId: string, featureKey: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase as any)
      .from('user_feature_overrides')
      .update({ ativo: false })
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
    
    if (error) throw error
  }

  // ---------------------------------------------------------------------------
  // EFFECTIVE FEATURES (CÁLCULO FINAL)
  // ---------------------------------------------------------------------------

  /**
   * Calcula as features efetivas de um usuário.
   * 
   * Lógica:
   * 1. Pega o profile da assinatura ativa (ou free_v1 se não tiver)
   * 2. Carrega as features do profile
   * 3. Aplica overrides individuais:
   *    - grant: adiciona feature mesmo que profile não tenha
   *    - revoke: remove feature mesmo que profile tenha
   *    - limit_custom: substitui limites
   */
  async getEffectiveFeatures(userId: string): Promise<EffectiveFeatures> {
    // Tenta usar a função SQL (mais eficiente)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .rpc('get_effective_features', { p_user_id: userId })
    
    if (!error && data) {
      return data as EffectiveFeatures
    }

    // Fallback: cálculo em TypeScript
    return this.calculateEffectiveFeaturesTS(userId)
  }

  private async calculateEffectiveFeaturesTS(userId: string): Promise<EffectiveFeatures> {
    const features: EffectiveFeatures = {}

    // 1. Pegar assinatura ativa
    const subscription = await this.getUserSubscription(userId)
    
    // 2. Determinar profile (assinatura ou free_v1)
    let profileId = subscription?.feature_profile_id
    if (!profileId) {
      const freeProfile = await this.getProfileByKey('free_v1')
      profileId = freeProfile?.id || null
    }

    // 3. Carregar features do profile
    if (profileId) {
      const profileFeatures = await this.getProfileFeatures(profileId)
      for (const pf of profileFeatures) {
        features[pf.feature_key] = {
          valor: pf.valor,
          limite_diario: pf.limite_diario,
          limite_semanal: pf.limite_semanal,
          limite_mensal: pf.limite_mensal
        }
      }
    }

    // 4. Aplicar overrides
    const overrides = await this.getUserOverrides(userId)
    for (const override of overrides) {
      if (override.override_type === 'grant') {
        features[override.feature_key] = {
          valor: override.valor ?? true,
          limite_diario: override.limite_diario,
          limite_semanal: override.limite_semanal,
          limite_mensal: override.limite_mensal,
          override: true
        }
      } else if (override.override_type === 'revoke') {
        delete features[override.feature_key]
      } else if (override.override_type === 'limit_custom') {
        if (features[override.feature_key]) {
          features[override.feature_key] = {
            ...features[override.feature_key],
            limite_diario: override.limite_diario ?? features[override.feature_key].limite_diario,
            limite_semanal: override.limite_semanal ?? features[override.feature_key].limite_semanal,
            limite_mensal: override.limite_mensal ?? features[override.feature_key].limite_mensal,
            override: true
          }
        }
      }
    }

    return features
  }

  /**
   * Verifica se o usuário tem acesso a uma feature específica.
   */
  async hasFeature(userId: string, featureKey: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .rpc('has_feature', { p_user_id: userId, p_feature_key: featureKey })
    
    if (!error && typeof data === 'boolean') {
      return data
    }

    // Fallback
    const features = await this.getEffectiveFeatures(userId)
    return featureKey in features
  }

  /**
   * Retorna o limite de uma feature para um período específico.
   */
  async getFeatureLimit(
    userId: string, 
    featureKey: string, 
    periodo: 'diario' | 'semanal' | 'mensal' = 'diario'
  ): Promise<number | null> {
    const features = await this.getEffectiveFeatures(userId)
    const feature = features[featureKey]
    
    if (!feature) return 0

    switch (periodo) {
      case 'diario': return feature.limite_diario
      case 'semanal': return feature.limite_semanal
      case 'mensal': return feature.limite_mensal
      default: return null
    }
  }

  // ---------------------------------------------------------------------------
  // HELPERS PARA FRONTPAGE
  // ---------------------------------------------------------------------------

  /**
   * Retorna os planos formatados para exibição na frontpage.
   */
  async getPlansForFrontpage(): Promise<Array<{
    slug: string
    nome: string
    descricao: string
    preco_mensal: string
    preco_anual: string
    features: string[]
    destaque: boolean
    cor: string
  }>> {
    const plans = await this.getVisiblePlans()
    const allFeatures = await this.getAllFeatures()
    
    const result = []

    for (const plan of plans) {
      const planData = await this.getPlanWithFeatures(plan.slug)
      
      // Lista de features para exibição
      const featureNames: string[] = []
      if (planData?.features) {
        for (const pf of planData.features) {
          const feature = allFeatures.find(f => f.feature_key === pf.feature_key)
          if (feature && feature.visivel_usuario) {
            let label = feature.nome
            if (pf.limite_mensal && pf.limite_mensal > 0) {
              label += ` (${pf.limite_mensal}/mês)`
            } else if (pf.limite_diario && pf.limite_diario > 0) {
              label += ` (${pf.limite_diario}/dia)`
            }
            featureNames.push(label)
          }
        }
      }

      result.push({
        slug: plan.slug,
        nome: plan.nome_exibicao,
        descricao: plan.descricao_curta || '',
        preco_mensal: this.formatPrice(plan.preco_mensal_centavos),
        preco_anual: this.formatPrice(plan.preco_anual_centavos),
        features: featureNames,
        destaque: plan.tags?.includes('mais_vendido') || plan.tags?.includes('destacado') || false,
        cor: plan.cor_destaque || '#6B7280'
      })
    }

    return result
  }

  private formatPrice(centavos: number): string {
    if (centavos === 0) return 'Grátis'
    return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`
  }
}

// =============================================================================
// HOOKS REACT
// =============================================================================

import { useState, useEffect } from 'react'

/**
 * Hook para obter as features efetivas do usuário atual.
 */
export function useEffectiveFeatures(userId: string | null) {
  const [features, setFeatures] = useState<EffectiveFeatures | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setFeatures(null)
      setLoading(false)
      return
    }

    const planosCore = new PlanosCore()
    
    planosCore.getEffectiveFeatures(userId)
      .then(setFeatures)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { features, loading, error }
}

/**
 * Hook para verificar se o usuário tem uma feature específica.
 */
export function useHasFeature(userId: string | null, featureKey: string) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const planosCore = new PlanosCore()
    
    planosCore.hasFeature(userId, featureKey)
      .then(setHasAccess)
      .catch(() => setHasAccess(false))
      .finally(() => setLoading(false))
  }, [userId, featureKey])

  return { hasAccess, loading }
}

/**
 * Hook para obter os planos para a frontpage.
 */
export function usePlansForFrontpage() {
  const [plans, setPlans] = useState<Awaited<ReturnType<PlanosCore['getPlansForFrontpage']>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const planosCore = new PlanosCore()
    
    planosCore.getPlansForFrontpage()
      .then(setPlans)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { plans, loading, error }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

let _planosCore: PlanosCore | null = null

export function getPlanosCore(): PlanosCore {
  if (!_planosCore) {
    _planosCore = new PlanosCore()
  }
  return _planosCore
}

export default PlanosCore
