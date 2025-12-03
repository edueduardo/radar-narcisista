/**
 * PLANOS_CORE - Sistema de Features, Profiles e Catálogo
 * BLOCO 31-35 - Arquitetura de Planos do Radar e Gerador de SaaS
 * 
 * Este módulo fornece helpers para:
 * - Verificar features do usuário
 * - Consultar limites
 * - Gerenciar overrides
 * - Consultar catálogo de planos
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TIPOS
// ============================================================================

export interface Feature {
  feature_key: string
  nome: string
  descricao: string | null
  tipo: 'boolean' | 'number' | 'text'
  categoria: string
  metadata: Record<string, unknown>
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
}

export interface FeatureValue {
  valor: boolean | number | string
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  override?: boolean
}

export interface EffectiveFeatures {
  [feature_key: string]: FeatureValue
}

export interface PlanCatalogItem {
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
  features?: FeatureValue[]
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_slug: string
  feature_profile_id: string | null
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'paused'
  periodo: 'mensal' | 'anual' | 'lifetime'
  data_inicio: string
  data_fim: string | null
  cohort_tag: string | null
}

export interface FeatureOverride {
  id: string
  user_id: string
  feature_key: string
  override_type: 'grant' | 'revoke' | 'limit_custom'
  valor: unknown
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  motivo: string | null
  valido_ate: string | null
  ativo: boolean
}

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class PlanosCore {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // ==========================================================================
  // FEATURES
  // ==========================================================================

  /**
   * Lista todas as features do sistema
   */
  async listFeatures(): Promise<Feature[]> {
    const { data, error } = await this.supabase
      .from('features')
      .select('*')
      .order('ordem_exibicao')

    if (error) throw error
    return data || []
  }

  /**
   * Busca uma feature específica
   */
  async getFeature(featureKey: string): Promise<Feature | null> {
    const { data, error } = await this.supabase
      .from('features')
      .select('*')
      .eq('feature_key', featureKey)
      .single()

    if (error) return null
    return data
  }

  // ==========================================================================
  // EFFECTIVE FEATURES (via função SQL)
  // ==========================================================================

  /**
   * Retorna as features efetivas do usuário (profile + overrides)
   */
  async getEffectiveFeatures(userId: string): Promise<EffectiveFeatures> {
    const { data, error } = await this.supabase
      .rpc('get_effective_features', { p_user_id: userId })

    if (error) {
      console.error('Erro ao buscar features efetivas:', error)
      return {}
    }

    return data || {}
  }

  /**
   * Verifica se o usuário tem acesso a uma feature
   */
  async hasFeature(userId: string, featureKey: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('has_feature', { p_user_id: userId, p_feature_key: featureKey })

    if (error) {
      console.error('Erro ao verificar feature:', error)
      return false
    }

    return data === true
  }

  /**
   * Retorna o limite de uma feature para um período
   */
  async getFeatureLimit(
    userId: string, 
    featureKey: string, 
    periodo: 'diario' | 'semanal' | 'mensal' = 'diario'
  ): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('get_feature_limit', { 
        p_user_id: userId, 
        p_feature_key: featureKey,
        p_periodo: periodo
      })

    if (error) {
      console.error('Erro ao buscar limite:', error)
      return 0
    }

    return data || 0
  }

  // ==========================================================================
  // PROFILES
  // ==========================================================================

  /**
   * Lista todos os profiles
   */
  async listProfiles(apenasMarketable: boolean = false): Promise<FeatureProfile[]> {
    let query = this.supabase
      .from('feature_profiles')
      .select('*')
      .eq('ativo', true)

    if (apenasMarketable) {
      query = query.eq('marketable', true)
    }

    const { data, error } = await query.order('created_at')

    if (error) throw error
    return data || []
  }

  /**
   * Busca um profile específico
   */
  async getProfile(profileKey: string): Promise<FeatureProfile | null> {
    const { data, error } = await this.supabase
      .from('feature_profiles')
      .select('*')
      .eq('profile_key', profileKey)
      .single()

    if (error) return null
    return data
  }

  /**
   * Retorna as features de um profile
   */
  async getProfileFeatures(profileId: string): Promise<Record<string, FeatureValue>> {
    const { data, error } = await this.supabase
      .from('feature_profile_features')
      .select('feature_key, valor, limite_diario, limite_semanal, limite_mensal')
      .eq('profile_id', profileId)

    if (error) throw error

    const result: Record<string, FeatureValue> = {}
    for (const item of data || []) {
      result[item.feature_key] = {
        valor: item.valor,
        limite_diario: item.limite_diario,
        limite_semanal: item.limite_semanal,
        limite_mensal: item.limite_mensal
      }
    }

    return result
  }

  // ==========================================================================
  // CATÁLOGO DE PLANOS
  // ==========================================================================

  /**
   * Lista os planos do catálogo
   */
  async listPlans(apenasVisiveis: boolean = true): Promise<PlanCatalogItem[]> {
    let query = this.supabase
      .from('plan_catalog')
      .select('*')

    if (apenasVisiveis) {
      query = query.eq('visivel', true)
    }

    const { data, error } = await query.order('ordem_exibicao')

    if (error) throw error
    return data || []
  }

  /**
   * Busca um plano específico
   */
  async getPlan(slug: string): Promise<PlanCatalogItem | null> {
    const { data, error } = await this.supabase
      .from('plan_catalog')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) return null
    return data
  }

  /**
   * Retorna um plano com suas features
   */
  async getPlanWithFeatures(slug: string): Promise<PlanCatalogItem | null> {
    const plan = await this.getPlan(slug)
    if (!plan || !plan.current_profile_id) return plan

    const features = await this.getProfileFeatures(plan.current_profile_id)
    return { ...plan, features: Object.values(features) }
  }

  // ==========================================================================
  // ASSINATURAS
  // ==========================================================================

  /**
   * Retorna a assinatura ativa do usuário
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions_core')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error) return null
    return data
  }

  /**
   * Cria ou atualiza a assinatura do usuário
   */
  async upsertSubscription(subscription: Partial<UserSubscription> & { user_id: string }): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions_core')
      .upsert(subscription, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==========================================================================
  // OVERRIDES
  // ==========================================================================

  /**
   * Lista os overrides de um usuário
   */
  async listUserOverrides(userId: string): Promise<FeatureOverride[]> {
    const { data, error } = await this.supabase
      .from('user_feature_overrides')
      .select('*')
      .eq('user_id', userId)
      .eq('ativo', true)

    if (error) throw error
    return data || []
  }

  /**
   * Adiciona um override para o usuário
   */
  async addOverride(override: Omit<FeatureOverride, 'id' | 'ativo'>): Promise<FeatureOverride> {
    const { data, error } = await this.supabase
      .from('user_feature_overrides')
      .upsert({
        ...override,
        ativo: true
      }, { onConflict: 'user_id,feature_key' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Remove um override do usuário
   */
  async removeOverride(userId: string, featureKey: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_feature_overrides')
      .update({ ativo: false })
      .eq('user_id', userId)
      .eq('feature_key', featureKey)

    if (error) throw error
  }

  /**
   * Concede uma feature ao usuário (grant)
   */
  async grantFeature(
    userId: string, 
    featureKey: string, 
    options?: {
      limite_diario?: number
      limite_semanal?: number
      limite_mensal?: number
      motivo?: string
      valido_ate?: string
      concedido_por?: string
    }
  ): Promise<FeatureOverride> {
    return this.addOverride({
      user_id: userId,
      feature_key: featureKey,
      override_type: 'grant',
      valor: true,
      limite_diario: options?.limite_diario || null,
      limite_semanal: options?.limite_semanal || null,
      limite_mensal: options?.limite_mensal || null,
      motivo: options?.motivo || null,
      valido_ate: options?.valido_ate || null,
      concedido_por: options?.concedido_por || null
    } as FeatureOverride)
  }

  /**
   * Revoga uma feature do usuário (revoke)
   */
  async revokeFeature(
    userId: string, 
    featureKey: string, 
    motivo?: string
  ): Promise<FeatureOverride> {
    return this.addOverride({
      user_id: userId,
      feature_key: featureKey,
      override_type: 'revoke',
      valor: null,
      limite_diario: null,
      limite_semanal: null,
      limite_mensal: null,
      motivo: motivo || null,
      valido_ate: null,
      concedido_por: null
    } as FeatureOverride)
  }

  /**
   * Define limites customizados para uma feature
   */
  async setCustomLimits(
    userId: string, 
    featureKey: string, 
    limites: {
      diario?: number
      semanal?: number
      mensal?: number
    },
    motivo?: string
  ): Promise<FeatureOverride> {
    return this.addOverride({
      user_id: userId,
      feature_key: featureKey,
      override_type: 'limit_custom',
      valor: null,
      limite_diario: limites.diario || null,
      limite_semanal: limites.semanal || null,
      limite_mensal: limites.mensal || null,
      motivo: motivo || null,
      valido_ate: null,
      concedido_por: null
    } as FeatureOverride)
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

let instance: PlanosCore | null = null

export function getPlanosCore(): PlanosCore {
  if (!instance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    instance = new PlanosCore(supabaseUrl, supabaseKey)
  }

  return instance
}

// ============================================================================
// HOOKS PARA COMPONENTES REACT
// ============================================================================

/**
 * Hook para verificar se o usuário tem uma feature
 * Uso: const hasOraculo = await checkFeature(userId, 'oraculo_v2')
 */
export async function checkFeature(userId: string, featureKey: string): Promise<boolean> {
  const planos = getPlanosCore()
  return planos.hasFeature(userId, featureKey)
}

/**
 * Hook para obter o limite de uma feature
 * Uso: const limite = await getLimit(userId, 'chat_ia', 'diario')
 */
export async function getLimit(
  userId: string, 
  featureKey: string, 
  periodo: 'diario' | 'semanal' | 'mensal' = 'diario'
): Promise<number> {
  const planos = getPlanosCore()
  return planos.getFeatureLimit(userId, featureKey, periodo)
}

/**
 * Hook para obter todas as features do usuário
 * Uso: const features = await getUserFeatures(userId)
 */
export async function getUserFeatures(userId: string): Promise<EffectiveFeatures> {
  const planos = getPlanosCore()
  return planos.getEffectiveFeatures(userId)
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default PlanosCore
