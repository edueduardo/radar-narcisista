/**
 * ORACULO INSTANCES - Gerenciamento de Multi-instâncias
 * ETAPA 32 - Matriz Oráculo Multi-instância
 * 
 * Este módulo permite:
 * - Múltiplas instâncias do Oráculo (whitelabel)
 * - Configurações personalizadas por instância
 * - Prompts e branding customizados
 * - Métricas por instância
 */

import { createClient } from '@supabase/supabase-js'
import { OraculoUserRole } from './oraculo-core'

// ============================================================================
// TIPOS
// ============================================================================

export interface OraculoInstance {
  id: string
  instance_slug: string
  instance_name: string
  owner_id: string | null
  status: 'active' | 'inactive' | 'suspended'
  modelo_ia: string
  temperatura: number
  max_tokens: number
  prompt_base_override: string | null
  prompt_adicional: string | null
  nome_assistente: string
  tom_comunicacao: 'acolhedor' | 'profissional' | 'tecnico' | 'casual'
  cor_primaria: string
  cor_secundaria: string
  logo_url: string | null
  limite_diario_global: number | null
  limite_mensal_global: number | null
  features_enabled: Record<string, boolean>
  contexto_produto: string | null
  contexto_empresa: string | null
  dominios_permitidos: string[] | null
  created_at: string
  updated_at: string
}

export interface OraculoInstanceRole {
  id: string
  instance_id: string
  user_role: string
  status: number
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  modelo_ia_override: string | null
  temperatura_override: number | null
  max_tokens_override: number | null
  prompt_perfil: string | null
  features_override: Record<string, boolean> | null
}

export interface InstanceConfig {
  instance_id: string
  instance_slug: string
  instance_name: string
  modelo_ia: string
  temperatura: number
  max_tokens: number
  nome_assistente: string
  tom_comunicacao: string
  cor_primaria: string
  cor_secundaria: string
  prompt_base_override: string | null
  prompt_adicional: string | null
  prompt_perfil: string | null
  contexto_produto: string | null
  contexto_empresa: string | null
  features_enabled: Record<string, boolean>
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  role_status: number
}

export interface InstanceUsage {
  total_perguntas: number
  total_tokens_input: number
  total_tokens_output: number
  custo_estimado_cents: number
}

// ============================================================================
// CLIENTE SUPABASE
// ============================================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase não configurado')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ============================================================================
// FUNÇÕES DE INSTÂNCIA
// ============================================================================

/**
 * Busca configuração completa de uma instância para um perfil
 */
export async function getInstanceConfig(
  instanceSlug: string,
  userRole: OraculoUserRole
): Promise<InstanceConfig | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('get_instance_config', {
      p_instance_slug: instanceSlug,
      p_user_role: userRole
    })
    
    if (error || !data || data.error) {
      console.error('Erro ao buscar config da instância:', error || data?.error)
      return null
    }
    
    return data as InstanceConfig
  } catch (error) {
    console.error('Erro ao buscar config da instância:', error)
    return null
  }
}

/**
 * Lista todas as instâncias (para admin)
 */
export async function listInstances(): Promise<OraculoInstance[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instances')
      .select('*')
      .order('instance_name')
    
    if (error) {
      console.error('Erro ao listar instâncias:', error)
      return []
    }
    
    return data as OraculoInstance[]
  } catch (error) {
    console.error('Erro ao listar instâncias:', error)
    return []
  }
}

/**
 * Busca uma instância por slug
 */
export async function getInstanceBySlug(slug: string): Promise<OraculoInstance | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instances')
      .select('*')
      .eq('instance_slug', slug)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as OraculoInstance
  } catch (error) {
    console.error('Erro ao buscar instância:', error)
    return null
  }
}

/**
 * Busca instâncias de um owner
 */
export async function getInstancesByOwner(ownerId: string): Promise<OraculoInstance[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instances')
      .select('*')
      .eq('owner_id', ownerId)
      .order('instance_name')
    
    if (error) {
      console.error('Erro ao buscar instâncias do owner:', error)
      return []
    }
    
    return data as OraculoInstance[]
  } catch (error) {
    console.error('Erro ao buscar instâncias do owner:', error)
    return []
  }
}

/**
 * Cria uma nova instância
 */
export async function createInstance(
  instance: Partial<OraculoInstance>
): Promise<OraculoInstance | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instances')
      .insert(instance)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar instância:', error)
      return null
    }
    
    return data as OraculoInstance
  } catch (error) {
    console.error('Erro ao criar instância:', error)
    return null
  }
}

/**
 * Atualiza uma instância
 */
export async function updateInstance(
  instanceId: string,
  updates: Partial<OraculoInstance>
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('oraculo_instances')
      .update(updates)
      .eq('id', instanceId)
    
    if (error) {
      console.error('Erro ao atualizar instância:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar instância:', error)
    return false
  }
}

/**
 * Deleta uma instância
 */
export async function deleteInstance(instanceId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('oraculo_instances')
      .delete()
      .eq('id', instanceId)
    
    if (error) {
      console.error('Erro ao deletar instância:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao deletar instância:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE ROLES
// ============================================================================

/**
 * Lista roles de uma instância
 */
export async function getInstanceRoles(instanceId: string): Promise<OraculoInstanceRole[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instance_roles')
      .select('*')
      .eq('instance_id', instanceId)
      .order('user_role')
    
    if (error) {
      console.error('Erro ao buscar roles:', error)
      return []
    }
    
    return data as OraculoInstanceRole[]
  } catch (error) {
    console.error('Erro ao buscar roles:', error)
    return []
  }
}

/**
 * Cria ou atualiza role de uma instância
 */
export async function upsertInstanceRole(
  instanceId: string,
  userRole: string,
  config: Partial<OraculoInstanceRole>
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('oraculo_instance_roles')
      .upsert({
        instance_id: instanceId,
        user_role: userRole,
        ...config
      }, {
        onConflict: 'instance_id,user_role'
      })
    
    if (error) {
      console.error('Erro ao upsert role:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao upsert role:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE USO
// ============================================================================

/**
 * Registra uso de uma instância
 */
export async function registerInstanceUsage(
  instanceId: string,
  tokensInput: number,
  tokensOutput: number
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase.rpc('register_instance_usage', {
      p_instance_id: instanceId,
      p_tokens_input: tokensInput,
      p_tokens_output: tokensOutput
    })
    
    if (error) {
      console.error('Erro ao registrar uso:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao registrar uso:', error)
    return false
  }
}

/**
 * Busca uso de uma instância
 */
export async function getInstanceUsage(
  instanceId: string,
  periodoTipo: 'diario' | 'semanal' | 'mensal'
): Promise<InstanceUsage | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const hoje = new Date()
    let periodoInicio: string
    
    if (periodoTipo === 'diario') {
      periodoInicio = hoje.toISOString().split('T')[0]
    } else if (periodoTipo === 'semanal') {
      const diaSemana = hoje.getDay()
      const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() + diffSegunda)
      periodoInicio = inicioSemana.toISOString().split('T')[0]
    } else {
      periodoInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
    }
    
    const { data, error } = await supabase
      .from('oraculo_instance_usage')
      .select('total_perguntas, total_tokens_input, total_tokens_output, custo_estimado_cents')
      .eq('instance_id', instanceId)
      .eq('periodo_tipo', periodoTipo)
      .eq('periodo_inicio', periodoInicio)
      .single()
    
    if (error || !data) {
      return {
        total_perguntas: 0,
        total_tokens_input: 0,
        total_tokens_output: 0,
        custo_estimado_cents: 0
      }
    }
    
    return data as InstanceUsage
  } catch (error) {
    console.error('Erro ao buscar uso:', error)
    return null
  }
}

// ============================================================================
// HELPER: Detectar instância por domínio
// ============================================================================

/**
 * Detecta a instância baseado no domínio da requisição
 */
export async function detectInstanceByDomain(domain: string): Promise<OraculoInstance | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar instância que tenha este domínio permitido
    const { data, error } = await supabase
      .from('oraculo_instances')
      .select('*')
      .contains('dominios_permitidos', [domain])
      .eq('status', 'active')
      .single()
    
    if (error || !data) {
      // Retornar instância padrão
      return getInstanceBySlug('radar-narcisista')
    }
    
    return data as OraculoInstance
  } catch (error) {
    console.error('Erro ao detectar instância:', error)
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_INSTANCES = {
  getInstanceConfig,
  listInstances,
  getInstanceBySlug,
  getInstancesByOwner,
  createInstance,
  updateInstance,
  deleteInstance,
  getInstanceRoles,
  upsertInstanceRole,
  registerInstanceUsage,
  getInstanceUsage,
  detectInstanceByDomain
}
