/**
 * AI_CONFIG_CORE - Configuração Dinâmica de IAs
 * 
 * BLOCO 31-35 - Complementar ao PLANOS_CORE
 * 
 * - PLANOS_CORE: controla QUAIS FEATURES o usuário tem acesso
 * - AI_CONFIG_CORE: controla QUAIS IAs trabalham em cada feature
 * 
 * Permite configurar por:
 * - Plano (free, profissional, premium)
 * - Feature (diário, chat, oráculo)
 * - Perfil (usuária, profissional, admin)
 * - Grupo (Black Friday, beta, cliente VIP)
 */

import { createClient } from '@/lib/supabase/client'

// =============================================================================
// TIPOS
// =============================================================================

export interface AIProvider {
  id: string
  slug: string
  displayName: string
  status: 'ativo' | 'desativado' | 'em_teste'
  custoRelativo: number
  apiKeyEnv?: string
  modeloPadrao?: string
  maxTokensPadrao?: number
}

export interface AIFeature {
  id: string
  slug: string
  displayName: string
  descricaoCurta?: string
  categoria: string
}

export interface AIProviderConfig {
  providerSlug: string
  providerName: string
  papel: string
  peso: number
  limiteDiario?: number
  limiteMensal?: number
  modelo?: string
  origem: string
}

export interface AIConfigContext {
  planKey: string
  featureSlug: string
  perfil: 'usuaria' | 'profissional' | 'admin' | 'whitelabel' | 'gerador'
  groupKey?: string
  userId?: string
}

export interface AIUsageLog {
  userId: string
  featureSlug: string
  providerSlug: string
  tokensUsados: number
  custoEstimado: number
  sucesso: boolean
}

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

export class AIConfigCore {
  private supabase = createClient()

  /**
   * Obtém os provedores configurados para um contexto específico
   */
  async getProvidersForContext(context: AIConfigContext): Promise<AIProviderConfig[]> {
    const { data, error } = await this.supabase.rpc('ai_get_providers_for_context', {
      p_plan_key: context.planKey,
      p_feature_slug: context.featureSlug,
      p_perfil: context.perfil,
      p_group_key: context.groupKey || null,
      p_user_id: context.userId || null
    })

    if (error) {
      console.error('[AIConfigCore] Erro ao obter providers:', error)
      // Fallback para OpenAI
      return [{
        providerSlug: 'openai',
        providerName: 'OpenAI GPT',
        papel: 'geracao',
        peso: 1.0,
        modelo: 'gpt-4o-mini',
        origem: 'fallback'
      }]
    }

    return (data || []).map((row: any) => ({
      providerSlug: row.provider_slug,
      providerName: row.provider_name,
      papel: row.papel,
      peso: row.peso,
      limiteDiario: row.limite_diario,
      limiteMensal: row.limite_mensal,
      modelo: row.modelo,
      origem: row.origem
    }))
  }

  /**
   * Obtém o provider principal para uma feature
   */
  async getPrimaryProvider(context: AIConfigContext): Promise<AIProviderConfig | null> {
    const providers = await this.getProvidersForContext(context)
    
    if (providers.length === 0) return null
    
    // Retorna o de maior peso
    return providers.reduce((prev, curr) => 
      curr.peso > prev.peso ? curr : prev
    )
  }

  /**
   * Verifica se o usuário ainda tem limite disponível
   */
  async checkLimits(
    userId: string,
    featureSlug: string,
    providerSlug: string,
    limiteDiario?: number,
    limiteMensal?: number
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    // Se não há limites, permitir
    if (!limiteDiario && !limiteMensal) {
      return { allowed: true }
    }

    // Buscar uso atual
    const hoje = new Date().toISOString().split('T')[0]
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const { data: usoDiario } = await this.supabase
      .from('ai_usage_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_slug', featureSlug)
      .eq('provider_slug', providerSlug)
      .gte('created_at', hoje)

    const { data: usoMensal } = await this.supabase
      .from('ai_usage_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_slug', featureSlug)
      .eq('provider_slug', providerSlug)
      .gte('created_at', inicioMes)

    const countDiario = usoDiario?.length || 0
    const countMensal = usoMensal?.length || 0

    // Verificar limite diário
    if (limiteDiario && countDiario >= limiteDiario) {
      return {
        allowed: false,
        reason: 'Limite diário atingido',
        remaining: 0
      }
    }

    // Verificar limite mensal
    if (limiteMensal && countMensal >= limiteMensal) {
      return {
        allowed: false,
        reason: 'Limite mensal atingido',
        remaining: 0
      }
    }

    return {
      allowed: true,
      remaining: Math.min(
        limiteDiario ? limiteDiario - countDiario : Infinity,
        limiteMensal ? limiteMensal - countMensal : Infinity
      )
    }
  }

  /**
   * Registra uso de IA
   */
  async logUsage(log: AIUsageLog): Promise<void> {
    await this.supabase.from('ai_usage_logs').insert({
      user_id: log.userId,
      feature_slug: log.featureSlug,
      provider_slug: log.providerSlug,
      tokens_usados: log.tokensUsados,
      custo_estimado: log.custoEstimado,
      sucesso: log.sucesso,
      created_at: new Date().toISOString()
    })
  }

  // ===========================================================================
  // MÉTODOS ADMIN
  // ===========================================================================

  /**
   * Lista todos os provedores
   */
  async listProviders(): Promise<AIProvider[]> {
    const { data, error } = await this.supabase
      .from('ai_providers_core')
      .select('*')
      .order('display_name')

    if (error) {
      console.error('[AIConfigCore] Erro ao listar providers:', error)
      return []
    }

    return (data || []).map(row => ({
      id: row.id,
      slug: row.slug,
      displayName: row.display_name,
      status: row.status,
      custoRelativo: row.custo_relativo,
      apiKeyEnv: row.api_key_env,
      modeloPadrao: row.modelo_padrao,
      maxTokensPadrao: row.max_tokens_padrao
    }))
  }

  /**
   * Lista todas as features
   */
  async listFeatures(): Promise<AIFeature[]> {
    const { data, error } = await this.supabase
      .from('ai_features_core')
      .select('*')
      .order('display_name')

    if (error) {
      console.error('[AIConfigCore] Erro ao listar features:', error)
      return []
    }

    return (data || []).map(row => ({
      id: row.id,
      slug: row.slug,
      displayName: row.display_name,
      descricaoCurta: row.descricao_curta,
      categoria: row.categoria
    }))
  }

  /**
   * Atualiza status de um provider
   */
  async updateProviderStatus(
    providerId: string,
    status: 'ativo' | 'desativado' | 'em_teste'
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('ai_providers_core')
      .update({ status })
      .eq('id', providerId)

    if (error) {
      console.error('[AIConfigCore] Erro ao atualizar provider:', error)
      return false
    }

    return true
  }

  /**
   * Atualiza configuração na matrix
   */
  async updatePlanMatrix(
    planKey: string,
    featureId: string,
    providerId: string,
    perfil: string,
    config: {
      ativo?: boolean
      limiteDiario?: number
      limiteMensal?: number
    }
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('ai_plan_matrix')
      .upsert({
        plan_key: planKey,
        feature_id: featureId,
        provider_id: providerId,
        perfil,
        ativo: config.ativo ?? true,
        limite_diario: config.limiteDiario,
        limite_mensal: config.limiteMensal
      }, {
        onConflict: 'plan_key,feature_id,provider_id,perfil,papel'
      })

    if (error) {
      console.error('[AIConfigCore] Erro ao atualizar matrix:', error)
      return false
    }

    return true
  }

  /**
   * Cria override de grupo
   */
  async createGroupOverride(
    groupKey: string,
    planKeyBase: string,
    featureId: string,
    providerId: string,
    perfil: string,
    config: {
      limiteDiario?: number
      limiteMensal?: number
      validoAte?: string
      userId?: string
    }
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('ai_group_overrides')
      .insert({
        group_key: groupKey,
        plan_key_base: planKeyBase,
        feature_id: featureId,
        provider_id: providerId,
        perfil,
        limite_diario: config.limiteDiario,
        limite_mensal: config.limiteMensal,
        valido_ate: config.validoAte,
        user_id: config.userId,
        ativo: true
      })

    if (error) {
      console.error('[AIConfigCore] Erro ao criar override:', error)
      return false
    }

    return true
  }

  /**
   * Obtém matrix completa para visualização
   */
  async getFullMatrix(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_plan_matrix')
      .select(`
        *,
        feature:ai_features_core(slug, display_name),
        provider:ai_providers_core(slug, display_name, status)
      `)
      .order('plan_key')

    if (error) {
      console.error('[AIConfigCore] Erro ao obter matrix:', error)
      return []
    }

    return data || []
  }

  // ===========================================================================
  // MÉTODOS DO PATCH 31-35 (Menu e Usuário)
  // ===========================================================================

  /**
   * Obtém configuração de IA para um menu específico
   */
  async getMenuConfig(menuKey: string, planKey: string, perfil: string): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('ai_get_menu_config', {
      p_menu_key: menuKey,
      p_plan_key: planKey,
      p_perfil: perfil
    })

    if (error) {
      console.error('[AIConfigCore] Erro ao obter menu config:', error)
      return []
    }

    return data || []
  }

  /**
   * Obtém perfil completo de IA de um usuário
   */
  async getUserIAProfile(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('ai_get_user_ia_profile', {
      p_user_id: userId
    })

    if (error) {
      console.error('[AIConfigCore] Erro ao obter user IA profile:', error)
      return []
    }

    return data || []
  }

  /**
   * Registra log de uso de IA (detalhado)
   */
  async logDetailedUsage(log: {
    userId?: string
    featureSlug: string
    providerSlug: string
    menuKey?: string
    planKey?: string
    groupKey?: string
    perfil?: string
    tokensInput?: number
    tokensOutput?: number
    custoEstimado?: number
    latenciaMs?: number
    sucesso?: boolean
    erro?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    await this.supabase.from('ai_usage_logs').insert({
      user_id: log.userId,
      feature_slug: log.featureSlug,
      provider_slug: log.providerSlug,
      menu_key: log.menuKey,
      plan_key: log.planKey,
      group_key: log.groupKey,
      perfil: log.perfil || 'usuaria',
      tokens_input: log.tokensInput || 0,
      tokens_output: log.tokensOutput || 0,
      tokens_total: (log.tokensInput || 0) + (log.tokensOutput || 0),
      custo_estimado: log.custoEstimado || 0,
      latencia_ms: log.latenciaMs,
      sucesso: log.sucesso ?? true,
      erro: log.erro,
      metadata: log.metadata || {},
      created_at: new Date().toISOString()
    })
  }

  /**
   * Obtém estatísticas de uso por provider
   */
  async getUsageByProvider(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_usage_by_provider')
      .select('*')

    if (error) {
      console.error('[AIConfigCore] Erro ao obter usage by provider:', error)
      return []
    }

    return data || []
  }

  /**
   * Obtém estatísticas de uso por feature
   */
  async getUsageByFeature(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_usage_by_feature')
      .select('*')

    if (error) {
      console.error('[AIConfigCore] Erro ao obter usage by feature:', error)
      return []
    }

    return data || []
  }

  /**
   * Obtém mapeamento de menus
   */
  async getMenuMappings(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ai_feature_menu_map')
      .select(`
        *,
        feature:ai_features_core(slug, display_name, categoria)
      `)
      .order('menu_path')

    if (error) {
      console.error('[AIConfigCore] Erro ao obter menu mappings:', error)
      return []
    }

    return data || []
  }

  /**
   * Consolida estatísticas diárias
   */
  async consolidateDailyStats(date?: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('ai_consolidate_daily_stats', {
      p_date: date || new Date().toISOString().split('T')[0]
    })

    if (error) {
      console.error('[AIConfigCore] Erro ao consolidar stats:', error)
      return 0
    }

    return data || 0
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

let aiConfigInstance: AIConfigCore | null = null

export function getAIConfigCore(): AIConfigCore {
  if (!aiConfigInstance) {
    aiConfigInstance = new AIConfigCore()
  }
  return aiConfigInstance
}

// =============================================================================
// HOOK REACT
// =============================================================================

export function useAIConfig() {
  const aiConfig = getAIConfigCore()
  
  return {
    // Métodos originais
    getProvidersForContext: aiConfig.getProvidersForContext.bind(aiConfig),
    getPrimaryProvider: aiConfig.getPrimaryProvider.bind(aiConfig),
    checkLimits: aiConfig.checkLimits.bind(aiConfig),
    logUsage: aiConfig.logUsage.bind(aiConfig),
    listProviders: aiConfig.listProviders.bind(aiConfig),
    listFeatures: aiConfig.listFeatures.bind(aiConfig),
    updateProviderStatus: aiConfig.updateProviderStatus.bind(aiConfig),
    updatePlanMatrix: aiConfig.updatePlanMatrix.bind(aiConfig),
    createGroupOverride: aiConfig.createGroupOverride.bind(aiConfig),
    getFullMatrix: aiConfig.getFullMatrix.bind(aiConfig),
    // Métodos do PATCH 31-35
    getMenuConfig: aiConfig.getMenuConfig.bind(aiConfig),
    getUserIAProfile: aiConfig.getUserIAProfile.bind(aiConfig),
    logDetailedUsage: aiConfig.logDetailedUsage.bind(aiConfig),
    getUsageByProvider: aiConfig.getUsageByProvider.bind(aiConfig),
    getUsageByFeature: aiConfig.getUsageByFeature.bind(aiConfig),
    getMenuMappings: aiConfig.getMenuMappings.bind(aiConfig),
    consolidateDailyStats: aiConfig.consolidateDailyStats.bind(aiConfig)
  }
}

// =============================================================================
// HELPER PARA ORQUESTRADOR
// =============================================================================

/**
 * Resolve qual IA usar para uma requisição
 * Integra com PLANOS_CORE para verificar se usuário tem acesso à feature
 */
export async function resolveAIForRequest(
  userId: string,
  featureSlug: string,
  planKey: string,
  perfil: 'usuaria' | 'profissional' | 'admin' = 'usuaria',
  groupKey?: string
): Promise<{
  provider: AIProviderConfig | null
  allowed: boolean
  reason?: string
}> {
  const aiConfig = getAIConfigCore()
  
  // 1. Obter provider configurado
  const provider = await aiConfig.getPrimaryProvider({
    planKey,
    featureSlug,
    perfil,
    groupKey,
    userId
  })

  if (!provider) {
    return {
      provider: null,
      allowed: false,
      reason: 'Nenhuma IA configurada para esta feature'
    }
  }

  // 2. Verificar limites
  const limitsCheck = await aiConfig.checkLimits(
    userId,
    featureSlug,
    provider.providerSlug,
    provider.limiteDiario,
    provider.limiteMensal
  )

  if (!limitsCheck.allowed) {
    return {
      provider,
      allowed: false,
      reason: limitsCheck.reason
    }
  }

  return {
    provider,
    allowed: true
  }
}
