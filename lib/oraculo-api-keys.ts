/**
 * ORACULO API KEYS - Gerenciamento de API Keys
 * ETAPA 36 - Sistema de API Keys para Whitelabel
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ============================================================================
// TIPOS
// ============================================================================

export interface ApiKey {
  id: string
  instance_id: string
  key_name: string
  api_key: string
  key_prefix: string
  status: 'active' | 'revoked' | 'expired'
  permissions: {
    read: boolean
    write: boolean
  }
  allowed_roles: string[]
  rate_limit_per_minute: number
  rate_limit_per_day: number
  total_requests: number
  last_used_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ApiKeyValidation {
  is_valid: boolean
  instance_id: string | null
  instance_slug: string | null
  key_name: string | null
  permissions: { read: boolean; write: boolean } | null
  allowed_roles: string[] | null
  rate_limit_per_minute: number | null
  error_message: string | null
}

export interface CreateApiKeyInput {
  instance_id: string
  key_name: string
  permissions?: { read: boolean; write: boolean }
  allowed_roles?: string[]
  rate_limit_per_minute?: number
  rate_limit_per_day?: number
  expires_at?: string | null
  created_by?: string
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
// FUNÇÕES DE GERAÇÃO
// ============================================================================

/**
 * Gera uma API key segura
 */
export function generateApiKey(instanceSlug: string): { key: string; prefix: string } {
  // Gerar 32 bytes aleatórios
  const randomBytes = crypto.randomBytes(32)
  const randomHex = randomBytes.toString('hex')
  
  // Formato: {slug}_sk_{random}
  const key = `${instanceSlug}_sk_${randomHex}`
  const prefix = `${instanceSlug}_sk_${randomHex.slice(0, 8)}`
  
  return { key, prefix }
}

/**
 * Mascara uma API key para exibição
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 20) return '***'
  
  const parts = apiKey.split('_sk_')
  if (parts.length !== 2) return apiKey.slice(0, 8) + '...' + apiKey.slice(-4)
  
  return `${parts[0]}_sk_${parts[1].slice(0, 8)}...${parts[1].slice(-4)}`
}

// ============================================================================
// FUNÇÕES DE CRUD
// ============================================================================

/**
 * Cria uma nova API key
 */
export async function createApiKey(input: CreateApiKeyInput): Promise<{ apiKey: ApiKey; fullKey: string } | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar slug da instância
    const { data: instance } = await supabase
      .from('oraculo_instances')
      .select('instance_slug')
      .eq('id', input.instance_id)
      .single()
    
    if (!instance) {
      console.error('Instância não encontrada')
      return null
    }
    
    // Gerar key
    const { key, prefix } = generateApiKey(instance.instance_slug)
    
    // Inserir no banco
    const { data, error } = await supabase
      .from('oraculo_api_keys')
      .insert({
        instance_id: input.instance_id,
        key_name: input.key_name,
        api_key: key,
        key_prefix: prefix,
        permissions: input.permissions || { read: true, write: true },
        allowed_roles: input.allowed_roles || ['usuaria', 'profissional'],
        rate_limit_per_minute: input.rate_limit_per_minute || 60,
        rate_limit_per_day: input.rate_limit_per_day || 1000,
        expires_at: input.expires_at || null,
        created_by: input.created_by || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar API key:', error)
      return null
    }
    
    return {
      apiKey: data as ApiKey,
      fullKey: key // Retorna a key completa apenas na criação
    }
  } catch (error) {
    console.error('Erro ao criar API key:', error)
    return null
  }
}

/**
 * Lista API keys de uma instância
 */
export async function listApiKeys(instanceId: string): Promise<ApiKey[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_api_keys')
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao listar API keys:', error)
      return []
    }
    
    return data as ApiKey[]
  } catch (error) {
    console.error('Erro ao listar API keys:', error)
    return []
  }
}

/**
 * Busca uma API key por ID
 */
export async function getApiKey(keyId: string): Promise<ApiKey | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_api_keys')
      .select('*')
      .eq('id', keyId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as ApiKey
  } catch (error) {
    console.error('Erro ao buscar API key:', error)
    return null
  }
}

/**
 * Atualiza uma API key
 */
export async function updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Remover campos que não devem ser atualizados
    delete updates.id
    delete updates.api_key
    delete updates.key_prefix
    delete updates.created_at
    delete updates.instance_id
    
    const { error } = await supabase
      .from('oraculo_api_keys')
      .update(updates)
      .eq('id', keyId)
    
    if (error) {
      console.error('Erro ao atualizar API key:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar API key:', error)
    return false
  }
}

/**
 * Revoga uma API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  return updateApiKey(keyId, { status: 'revoked' })
}

/**
 * Deleta uma API key
 */
export async function deleteApiKey(keyId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('oraculo_api_keys')
      .delete()
      .eq('id', keyId)
    
    if (error) {
      console.error('Erro ao deletar API key:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao deletar API key:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

/**
 * Valida uma API key
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Tentar usar a função do banco
    const { data, error } = await supabase.rpc('validate_api_key', {
      p_api_key: apiKey
    })
    
    if (error) {
      // Fallback: validação manual
      return validateApiKeyManual(apiKey)
    }
    
    if (data && data.length > 0) {
      return data[0] as ApiKeyValidation
    }
    
    return {
      is_valid: false,
      instance_id: null,
      instance_slug: null,
      key_name: null,
      permissions: null,
      allowed_roles: null,
      rate_limit_per_minute: null,
      error_message: 'API key inválida'
    }
  } catch (error) {
    console.error('Erro ao validar API key:', error)
    return validateApiKeyManual(apiKey)
  }
}

/**
 * Validação manual (fallback)
 */
async function validateApiKeyManual(apiKey: string): Promise<ApiKeyValidation> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar key
    const { data: keyData, error: keyError } = await supabase
      .from('oraculo_api_keys')
      .select(`
        *,
        oraculo_instances (
          instance_slug,
          status
        )
      `)
      .eq('api_key', apiKey)
      .single()
    
    if (keyError || !keyData) {
      return {
        is_valid: false,
        instance_id: null,
        instance_slug: null,
        key_name: null,
        permissions: null,
        allowed_roles: null,
        rate_limit_per_minute: null,
        error_message: 'API key inválida'
      }
    }
    
    // Verificar status
    if (keyData.status === 'revoked') {
      return {
        is_valid: false,
        instance_id: null,
        instance_slug: null,
        key_name: null,
        permissions: null,
        allowed_roles: null,
        rate_limit_per_minute: null,
        error_message: 'API key revogada'
      }
    }
    
    // Verificar expiração
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      await supabase
        .from('oraculo_api_keys')
        .update({ status: 'expired' })
        .eq('id', keyData.id)
      
      return {
        is_valid: false,
        instance_id: null,
        instance_slug: null,
        key_name: null,
        permissions: null,
        allowed_roles: null,
        rate_limit_per_minute: null,
        error_message: 'API key expirada'
      }
    }
    
    // Verificar instância
    const instance = keyData.oraculo_instances as { instance_slug: string; status: string }
    if (instance.status !== 'active') {
      return {
        is_valid: false,
        instance_id: null,
        instance_slug: null,
        key_name: null,
        permissions: null,
        allowed_roles: null,
        rate_limit_per_minute: null,
        error_message: 'Instância inativa'
      }
    }
    
    // Atualizar uso
    await supabase
      .from('oraculo_api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        total_requests: (keyData.total_requests || 0) + 1
      })
      .eq('id', keyData.id)
    
    return {
      is_valid: true,
      instance_id: keyData.instance_id,
      instance_slug: instance.instance_slug,
      key_name: keyData.key_name,
      permissions: keyData.permissions,
      allowed_roles: keyData.allowed_roles,
      rate_limit_per_minute: keyData.rate_limit_per_minute,
      error_message: null
    }
  } catch (error) {
    console.error('Erro na validação manual:', error)
    return {
      is_valid: false,
      instance_id: null,
      instance_slug: null,
      key_name: null,
      permissions: null,
      allowed_roles: null,
      rate_limit_per_minute: null,
      error_message: 'Erro interno'
    }
  }
}

/**
 * Registra log de uso
 */
export async function logApiKeyUsage(
  apiKeyId: string,
  instanceId: string,
  data: {
    request_ip?: string
    request_origin?: string
    user_role?: string
    status_code: number
    tokens_used?: number
    latency_ms?: number
  }
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    
    await supabase
      .from('oraculo_api_key_logs')
      .insert({
        api_key_id: apiKeyId,
        instance_id: instanceId,
        ...data
      })
  } catch (error) {
    console.error('Erro ao registrar log:', error)
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_API_KEYS = {
  generateApiKey,
  maskApiKey,
  createApiKey,
  listApiKeys,
  getApiKey,
  updateApiKey,
  revokeApiKey,
  deleteApiKey,
  validateApiKey,
  logApiKeyUsage
}

export default ORACULO_API_KEYS
