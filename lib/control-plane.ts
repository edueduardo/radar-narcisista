/**
 * CONTROL PLANE - Módulo de Gestão de Configurações
 * 
 * Este módulo implementa a camada de Control Plane do Radar Narcisista,
 * permitindo que configurações sejam alteradas SEM necessidade de deploy.
 * 
 * TRÊS CAMADAS:
 * 1. CÓDIGO (APP) - Muda com deploy (Vercel)
 * 2. CONFIGURAÇÃO (BANCO) - Muda sem deploy (Supabase)
 * 3. CONTROL PLANE (PAINEL) - Interface de gestão (/admin)
 * 
 * @see docs/CONTROL-PLANE.md para documentação completa
 */

import { supabase } from '@/lib/supabaseClient'

// Alias para compatibilidade
const createClient = () => supabase

// ============================================================================
// TIPOS
// ============================================================================

export type ConfigCategory = 
  | 'ia'           // Configurações de IA
  | 'planos'       // Planos e features
  | 'limites'      // Limites por plano/usuário
  | 'ui'           // Configurações de UI
  | 'integracao'   // Integrações externas
  | 'seguranca'    // Configurações de segurança

export type ConfigScope = 
  | 'global'       // Aplica a toda instância
  | 'plano'        // Aplica a um plano específico
  | 'grupo'        // Aplica a um grupo/cohort
  | 'usuario'      // Aplica a um usuário específico

export interface ConfigEntry {
  key: string
  value: unknown
  category: ConfigCategory
  scope: ConfigScope
  scope_id?: string  // ID do plano, grupo ou usuário (se scope != 'global')
  description?: string
  updated_at: string
  updated_by?: string
}

export interface InstanceInfo {
  id: string
  name: string
  type: 'radar' | 'whitelabel' | 'saas_filho'
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  owner_id?: string
  config_version: number
}

// ============================================================================
// FUNÇÕES DE LEITURA DE CONFIGURAÇÃO
// ============================================================================

/**
 * Busca uma configuração específica
 * Prioridade: usuário > grupo > plano > global
 */
export async function getConfig<T = unknown>(
  key: string,
  options?: {
    userId?: string
    groupId?: string
    planId?: string
  }
): Promise<T | null> {
  const supabase = createClient()
  
  // Tentar buscar na ordem de prioridade
  const scopes: Array<{ scope: ConfigScope; scope_id?: string }> = []
  
  if (options?.userId) {
    scopes.push({ scope: 'usuario', scope_id: options.userId })
  }
  if (options?.groupId) {
    scopes.push({ scope: 'grupo', scope_id: options.groupId })
  }
  if (options?.planId) {
    scopes.push({ scope: 'plano', scope_id: options.planId })
  }
  scopes.push({ scope: 'global' })
  
  for (const { scope, scope_id } of scopes) {
    let query = supabase
      .from('control_plane_configs')
      .select('value')
      .eq('key', key)
      .eq('scope', scope)
    
    if (scope_id) {
      query = query.eq('scope_id', scope_id)
    }
    
    const { data, error } = await query.single()
    
    if (!error && data) {
      return data.value as T
    }
  }
  
  return null
}

/**
 * Busca todas as configurações de uma categoria
 */
export async function getConfigsByCategory(
  category: ConfigCategory,
  scope: ConfigScope = 'global',
  scopeId?: string
): Promise<ConfigEntry[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('control_plane_configs')
    .select('*')
    .eq('category', category)
    .eq('scope', scope)
  
  if (scopeId) {
    query = query.eq('scope_id', scopeId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar configs:', error)
    return []
  }
  
  return data || []
}

// ============================================================================
// FUNÇÕES DE ESCRITA DE CONFIGURAÇÃO
// ============================================================================

/**
 * Define uma configuração
 * Requer permissão de ADMIN ou SUPER_ADMIN
 */
export async function setConfig(
  key: string,
  value: unknown,
  options: {
    category: ConfigCategory
    scope: ConfigScope
    scopeId?: string
    description?: string
    updatedBy?: string
  }
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('control_plane_configs')
    .upsert({
      key,
      value,
      category: options.category,
      scope: options.scope,
      scope_id: options.scopeId,
      description: options.description,
      updated_at: new Date().toISOString(),
      updated_by: options.updatedBy
    }, {
      onConflict: 'key,scope,scope_id'
    })
  
  if (error) {
    console.error('Erro ao salvar config:', error)
    return false
  }
  
  return true
}

/**
 * Remove uma configuração
 */
export async function deleteConfig(
  key: string,
  scope: ConfigScope = 'global',
  scopeId?: string
): Promise<boolean> {
  const supabase = createClient()
  
  let query = supabase
    .from('control_plane_configs')
    .delete()
    .eq('key', key)
    .eq('scope', scope)
  
  if (scopeId) {
    query = query.eq('scope_id', scopeId)
  }
  
  const { error } = await query
  
  if (error) {
    console.error('Erro ao deletar config:', error)
    return false
  }
  
  return true
}

// ============================================================================
// FUNÇÕES DE IA
// ============================================================================

/**
 * Verifica se uma IA está ativa para um contexto
 */
export async function isIAActive(
  providerId: string,
  featureId: string,
  options?: {
    planKey?: string
    groupKey?: string
    userId?: string
  }
): Promise<boolean> {
  // Primeiro verifica override de usuário
  if (options?.userId) {
    const userOverride = await getConfig<boolean>(
      `ia.${providerId}.${featureId}.active`,
      { userId: options.userId }
    )
    if (userOverride !== null) return userOverride
  }
  
  // Depois verifica override de grupo
  if (options?.groupKey) {
    const groupOverride = await getConfig<boolean>(
      `ia.${providerId}.${featureId}.active`,
      { groupId: options.groupKey }
    )
    if (groupOverride !== null) return groupOverride
  }
  
  // Depois verifica configuração do plano
  if (options?.planKey) {
    const planConfig = await getConfig<boolean>(
      `ia.${providerId}.${featureId}.active`,
      { planId: options.planKey }
    )
    if (planConfig !== null) return planConfig
  }
  
  // Por fim, verifica configuração global
  const globalConfig = await getConfig<boolean>(
    `ia.${providerId}.${featureId}.active`
  )
  
  return globalConfig ?? true // Default: ativo
}

/**
 * Obtém limite de uso de IA para um contexto
 */
export async function getIALimit(
  featureId: string,
  period: 'diario' | 'semanal' | 'mensal',
  options?: {
    planKey?: string
    groupKey?: string
    userId?: string
  }
): Promise<number> {
  const key = `ia.${featureId}.limite_${period}`
  
  // Prioridade: usuário > grupo > plano > global
  const limit = await getConfig<number>(key, {
    userId: options?.userId,
    groupId: options?.groupKey,
    planId: options?.planKey
  })
  
  return limit ?? 0
}

// ============================================================================
// FUNÇÕES DE INSTÂNCIA
// ============================================================================

/**
 * Obtém informações da instância atual
 */
export async function getInstanceInfo(): Promise<InstanceInfo | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('control_plane_instance')
    .select('*')
    .single()
  
  if (error) {
    // Se não existe, é a instância principal (Radar)
    return {
      id: 'radar-main',
      name: 'Radar Narcisista',
      type: 'radar',
      status: 'active',
      created_at: new Date().toISOString(),
      config_version: 1
    }
  }
  
  return data
}

/**
 * Verifica se é a instância principal (Radar-mãe)
 */
export async function isMainInstance(): Promise<boolean> {
  const info = await getInstanceInfo()
  return info?.type === 'radar'
}

/**
 * Verifica se é uma instância White Label
 */
export async function isWhiteLabelInstance(): Promise<boolean> {
  const info = await getInstanceInfo()
  return info?.type === 'whitelabel'
}

/**
 * Verifica se é um SaaS filho gerado
 */
export async function isSaaSFilho(): Promise<boolean> {
  const info = await getInstanceInfo()
  return info?.type === 'saas_filho'
}

// ============================================================================
// FUNÇÕES DE FEATURE FLAGS
// ============================================================================

/**
 * Verifica se uma feature está habilitada
 */
export async function isFeatureEnabled(
  featureKey: string,
  options?: {
    planKey?: string
    groupKey?: string
    userId?: string
  }
): Promise<boolean> {
  const key = `feature.${featureKey}.enabled`
  
  const enabled = await getConfig<boolean>(key, {
    userId: options?.userId,
    groupId: options?.groupKey,
    planId: options?.planKey
  })
  
  return enabled ?? false
}

/**
 * Obtém valor de uma feature flag
 */
export async function getFeatureValue<T = unknown>(
  featureKey: string,
  options?: {
    planKey?: string
    groupKey?: string
    userId?: string
  }
): Promise<T | null> {
  const key = `feature.${featureKey}.value`
  
  return getConfig<T>(key, {
    userId: options?.userId,
    groupId: options?.groupKey,
    planId: options?.planKey
  })
}

// ============================================================================
// HOOKS PARA REACT
// ============================================================================

/**
 * Hook para usar configurações no React
 * @example
 * const { config, loading } = useControlPlaneConfig('ia.openai.active')
 */
export function useControlPlaneConfig<T = unknown>(key: string) {
  // Este hook seria implementado com React hooks
  // Por enquanto, retorna um placeholder
  return {
    config: null as T | null,
    loading: false,
    error: null as Error | null,
    refetch: async () => {}
  }
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const CONTROL_PLANE_VERSION = '1.0.0'

export const DEFAULT_IA_LIMITS = {
  free: {
    diario: 5,
    semanal: 20,
    mensal: 50
  },
  profissional: {
    diario: 20,
    semanal: 100,
    mensal: 300
  },
  defesa: {
    diario: 50,
    semanal: 250,
    mensal: 750
  },
  whitelabel: {
    diario: null, // Ilimitado
    semanal: null,
    mensal: null
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const ControlPlane = {
  // Leitura
  getConfig,
  getConfigsByCategory,
  
  // Escrita
  setConfig,
  deleteConfig,
  
  // IA
  isIAActive,
  getIALimit,
  
  // Instância
  getInstanceInfo,
  isMainInstance,
  isWhiteLabelInstance,
  isSaaSFilho,
  
  // Feature Flags
  isFeatureEnabled,
  getFeatureValue,
  
  // Constantes
  VERSION: CONTROL_PLANE_VERSION,
  DEFAULT_IA_LIMITS
}

export default ControlPlane
