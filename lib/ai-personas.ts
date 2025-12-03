/**
 * AI PERSONAS - Camada de Avatares/Personas de IA
 * 
 * Este módulo implementa a separação entre:
 * - PROVIDERS (visão admin): OpenAI, Claude, Together, Grok
 * - PERSONAS (visão usuário): Mentora Calma, Analista Lógico, etc.
 * 
 * @see docs/PATCH-AI-PERSONAS.md para documentação completa
 */

import { supabase } from '@/lib/supabaseClient'

// ============================================================================
// TIPOS
// ============================================================================

export interface AIProvider {
  id: string
  key: string
  display_name: string
  status: 'active' | 'disabled' | 'testing'
  type: 'llm' | 'embedding' | 'image' | 'audio' | 'multimodal'
  default_model?: string
  config?: Record<string, unknown>
}

export interface AIPersona {
  id: string
  slug: string
  display_name: string
  avatar_emoji: string
  avatar_url?: string
  short_bio: string
  long_description?: string
  personality_traits?: string[]
  communication_style?: string
  default_provider_key: string
  fallback_providers?: string[]
  system_prompt_template?: string
  roles_visible: string[]
  is_collaborative_member: boolean
  is_user_visible: boolean
  is_internal_debug: boolean
  ordem_exibicao: number
  cor_tema?: string
}

export interface AIPersonaBinding {
  id: string
  persona_id: string
  context_type: string
  context_key: string
  allowed_profiles: string[]
  allowed_plans: string[]
  allowed_segments?: string[]
  is_default: boolean
  is_active: boolean
  weight: number
  priority: number
}

export interface PersonaForContext {
  persona_id: string
  persona_slug: string
  display_name: string
  avatar_emoji: string
  avatar_url?: string
  short_bio: string
  provider_key: string
  weight: number
  is_default: boolean
}

export interface TransparencySettings {
  show_persona_name: boolean
  show_persona_avatar: boolean
  show_persona_bio: boolean
  show_collaborative_info: boolean
  show_provider_hint: boolean
  generic_assistant_name: string
  transparency_message: string
}

export interface PersonaUsageLog {
  user_id?: string
  persona_slug: string
  provider_key: string
  context_type: string
  context_key?: string
  user_role?: string
  plan_key?: string
  segment?: string
  tokens_input: number
  tokens_output: number
  response_time_ms: number
  success: boolean
  error_message?: string
}

// ============================================================================
// FUNÇÕES DE LEITURA - PERSONAS
// ============================================================================

/**
 * Obtém personas ativas para um contexto específico
 * Filtra por role, plano e segmento do usuário
 */
export async function getActivePersonasForContext(options: {
  contextType: string
  contextKey: string
  userRole?: string
  planKey?: string
  segment?: string
}): Promise<PersonaForContext[]> {
  const { contextType, contextKey, userRole = 'usuaria', planKey = 'free', segment } = options

  const { data, error } = await supabase.rpc('get_active_personas_for_context', {
    p_context_type: contextType,
    p_context_key: contextKey,
    p_user_role: userRole,
    p_plan_key: planKey,
    p_segment: segment || null
  })

  if (error) {
    console.error('Erro ao buscar personas:', error)
    return []
  }

  return data || []
}

/**
 * Obtém uma persona específica pelo slug
 */
export async function getPersonaBySlug(slug: string): Promise<AIPersona | null> {
  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Erro ao buscar persona:', error)
    return null
  }

  return data
}

/**
 * Obtém todas as personas visíveis para um role
 */
export async function getVisiblePersonas(userRole: string = 'usuaria'): Promise<AIPersona[]> {
  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
    .eq('is_user_visible', true)
    .contains('roles_visible', [userRole])
    .order('ordem_exibicao')

  if (error) {
    console.error('Erro ao buscar personas:', error)
    return []
  }

  return data || []
}

/**
 * Obtém a persona padrão para um contexto
 */
export async function getDefaultPersonaForContext(
  contextType: string,
  contextKey: string
): Promise<PersonaForContext | null> {
  const personas = await getActivePersonasForContext({
    contextType,
    contextKey
  })

  return personas.find(p => p.is_default) || personas[0] || null
}

// ============================================================================
// FUNÇÕES DE LEITURA - PROVIDERS (ADMIN ONLY)
// ============================================================================

/**
 * Obtém todos os providers (apenas admin)
 */
export async function getAllProviders(): Promise<AIProvider[]> {
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .order('key')

  if (error) {
    console.error('Erro ao buscar providers:', error)
    return []
  }

  return data || []
}

/**
 * Obtém provider por key
 */
export async function getProviderByKey(key: string): Promise<AIProvider | null> {
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('key', key)
    .single()

  if (error) {
    console.error('Erro ao buscar provider:', error)
    return null
  }

  return data
}

/**
 * Resolve o provider real para uma persona
 * Retorna o provider principal ou fallback se necessário
 */
export async function resolveProviderForPersona(
  personaSlug: string,
  preferredProvider?: string
): Promise<AIProvider | null> {
  const persona = await getPersonaBySlug(personaSlug)
  if (!persona) return null

  // Se tem provider preferido e está na lista, usa ele
  if (preferredProvider) {
    const providers = [persona.default_provider_key, ...(persona.fallback_providers || [])]
    if (providers.includes(preferredProvider)) {
      const provider = await getProviderByKey(preferredProvider)
      if (provider?.status === 'active') return provider
    }
  }

  // Tenta o provider padrão
  const defaultProvider = await getProviderByKey(persona.default_provider_key)
  if (defaultProvider?.status === 'active') return defaultProvider

  // Tenta fallbacks
  for (const fallbackKey of persona.fallback_providers || []) {
    const fallback = await getProviderByKey(fallbackKey)
    if (fallback?.status === 'active') return fallback
  }

  return null
}

// ============================================================================
// FUNÇÕES DE TRANSPARÊNCIA
// ============================================================================

/**
 * Obtém configurações de transparência
 */
export async function getTransparencySettings(options?: {
  planKey?: string
  segment?: string
  userId?: string
}): Promise<TransparencySettings> {
  const { data, error } = await supabase.rpc('get_transparency_settings', {
    p_plan_key: options?.planKey || null,
    p_segment: options?.segment || null,
    p_user_id: options?.userId || null
  })

  if (error || !data || data.length === 0) {
    // Retorna configuração padrão
    return {
      show_persona_name: true,
      show_persona_avatar: true,
      show_persona_bio: true,
      show_collaborative_info: false,
      show_provider_hint: false,
      generic_assistant_name: 'Assistente do Radar',
      transparency_message: 'Respostas geradas por IAs internas do Radar.'
    }
  }

  return data[0]
}

/**
 * Formata persona para exibição ao usuário
 * Aplica configurações de transparência
 */
export async function formatPersonaForUser(
  persona: AIPersona | PersonaForContext,
  transparencySettings?: TransparencySettings
): Promise<{
  name: string
  avatar: string
  bio?: string
  message?: string
}> {
  const settings = transparencySettings || await getTransparencySettings()

  if (!settings.show_persona_name) {
    return {
      name: settings.generic_assistant_name,
      avatar: '🤖',
      message: settings.transparency_message
    }
  }

  return {
    name: persona.display_name,
    avatar: settings.show_persona_avatar ? persona.avatar_emoji : '🤖',
    bio: settings.show_persona_bio ? persona.short_bio : undefined,
    message: settings.show_collaborative_info ? settings.transparency_message : undefined
  }
}

// ============================================================================
// FUNÇÕES DE LOGGING
// ============================================================================

/**
 * Registra uso de persona
 */
export async function logPersonaUsage(log: PersonaUsageLog): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_persona_usage', {
    p_user_id: log.user_id || null,
    p_persona_slug: log.persona_slug,
    p_provider_key: log.provider_key,
    p_context_type: log.context_type,
    p_context_key: log.context_key || null,
    p_user_role: log.user_role || null,
    p_plan_key: log.plan_key || null,
    p_segment: log.segment || null,
    p_tokens_input: log.tokens_input,
    p_tokens_output: log.tokens_output,
    p_response_time_ms: log.response_time_ms,
    p_success: log.success,
    p_error_message: log.error_message || null
  })

  if (error) {
    console.error('Erro ao registrar log:', error)
    return null
  }

  return data
}

// ============================================================================
// FUNÇÕES DE ADMIN - BINDINGS
// ============================================================================

/**
 * Obtém todos os bindings de uma persona
 */
export async function getPersonaBindings(personaId: string): Promise<AIPersonaBinding[]> {
  const { data, error } = await supabase
    .from('ai_persona_bindings')
    .select('*')
    .eq('persona_id', personaId)
    .order('context_type')

  if (error) {
    console.error('Erro ao buscar bindings:', error)
    return []
  }

  return data || []
}

/**
 * Obtém todos os bindings de um contexto
 */
export async function getContextBindings(
  contextType: string,
  contextKey: string
): Promise<(AIPersonaBinding & { persona: AIPersona })[]> {
  const { data, error } = await supabase
    .from('ai_persona_bindings')
    .select(`
      *,
      persona:ai_personas(*)
    `)
    .eq('context_type', contextType)
    .eq('context_key', contextKey)
    .order('weight', { ascending: false })

  if (error) {
    console.error('Erro ao buscar bindings:', error)
    return []
  }

  return data || []
}

/**
 * Atualiza um binding
 */
export async function updateBinding(
  bindingId: string,
  updates: Partial<AIPersonaBinding>
): Promise<boolean> {
  const { error } = await supabase
    .from('ai_persona_bindings')
    .update(updates)
    .eq('id', bindingId)

  if (error) {
    console.error('Erro ao atualizar binding:', error)
    return false
  }

  return true
}

/**
 * Cria um novo binding
 */
export async function createBinding(
  binding: Omit<AIPersonaBinding, 'id'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('ai_persona_bindings')
    .insert(binding)
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao criar binding:', error)
    return null
  }

  return data.id
}

/**
 * Remove um binding
 */
export async function deleteBinding(bindingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ai_persona_bindings')
    .delete()
    .eq('id', bindingId)

  if (error) {
    console.error('Erro ao deletar binding:', error)
    return false
  }

  return true
}

// ============================================================================
// FUNÇÕES DE ADMIN - PERSONAS
// ============================================================================

/**
 * Obtém todas as personas (admin)
 */
export async function getAllPersonas(): Promise<AIPersona[]> {
  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
    .order('ordem_exibicao')

  if (error) {
    console.error('Erro ao buscar personas:', error)
    return []
  }

  return data || []
}

/**
 * Atualiza uma persona
 */
export async function updatePersona(
  personaId: string,
  updates: Partial<AIPersona>
): Promise<boolean> {
  const { error } = await supabase
    .from('ai_personas')
    .update(updates)
    .eq('id', personaId)

  if (error) {
    console.error('Erro ao atualizar persona:', error)
    return false
  }

  return true
}

/**
 * Cria uma nova persona
 */
export async function createPersona(
  persona: Omit<AIPersona, 'id'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('ai_personas')
    .insert(persona)
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao criar persona:', error)
    return null
  }

  return data.id
}

// ============================================================================
// FUNÇÕES DE ESTATÍSTICAS (ADMIN)
// ============================================================================

/**
 * Obtém estatísticas de uso por persona
 */
export async function getPersonaUsageStats(): Promise<{
  persona_slug: string
  total_calls: number
  total_tokens_input: number
  total_tokens_output: number
  avg_response_time_ms: number
  unique_users: number
  success_rate: number
}[]> {
  const { data, error } = await supabase
    .from('ai_persona_usage_stats')
    .select('*')

  if (error) {
    console.error('Erro ao buscar stats:', error)
    return []
  }

  return data || []
}

/**
 * Obtém estatísticas de uso por provider
 */
export async function getProviderUsageStats(): Promise<{
  provider_key: string
  total_calls: number
  total_tokens_input: number
  total_tokens_output: number
  avg_response_time_ms: number
  success_rate: number
}[]> {
  const { data, error } = await supabase
    .from('ai_provider_usage_stats')
    .select('*')

  if (error) {
    console.error('Erro ao buscar stats:', error)
    return []
  }

  return data || []
}

/**
 * Obtém estatísticas de uso por contexto
 */
export async function getContextUsageStats(): Promise<{
  context_type: string
  context_key: string
  total_calls: number
  unique_users: number
  personas_used: number
}[]> {
  const { data, error } = await supabase
    .from('ai_context_usage_stats')
    .select('*')

  if (error) {
    console.error('Erro ao buscar stats:', error)
    return []
  }

  return data || []
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const CONTEXT_TYPES = {
  CHAT: 'chat',
  DIARIO: 'diario',
  TESTE_CLAREZA: 'teste_clareza',
  ORACULO: 'oraculo',
  BIBLIOTECA: 'biblioteca',
  PROFISSIONAL: 'profissional'
} as const

export const DEFAULT_PERSONAS = {
  MENTORA_CALMA: 'mentora-calma',
  ANALISTA_LOGICO: 'analista-logico',
  GUARDIAO_SEGURANCA: 'guardiao-seguranca',
  CURADOR_CONTEUDO: 'curador-conteudo',
  ASSISTENTE_PROFISSIONAL: 'assistente-profissional',
  ORACULO_ADMIN: 'oraculo-admin'
} as const

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const AIPersonas = {
  // Leitura - Personas
  getActivePersonasForContext,
  getPersonaBySlug,
  getVisiblePersonas,
  getDefaultPersonaForContext,
  
  // Leitura - Providers
  getAllProviders,
  getProviderByKey,
  resolveProviderForPersona,
  
  // Transparência
  getTransparencySettings,
  formatPersonaForUser,
  
  // Logging
  logPersonaUsage,
  
  // Admin - Bindings
  getPersonaBindings,
  getContextBindings,
  updateBinding,
  createBinding,
  deleteBinding,
  
  // Admin - Personas
  getAllPersonas,
  updatePersona,
  createPersona,
  
  // Estatísticas
  getPersonaUsageStats,
  getProviderUsageStats,
  getContextUsageStats,
  
  // Constantes
  CONTEXT_TYPES,
  DEFAULT_PERSONAS
}

export default AIPersonas
