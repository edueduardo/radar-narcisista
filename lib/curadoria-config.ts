import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// CURADORIA CONFIG - Configurações da IA Curadora
// ETAPA 9: Painel de Curadoria + Semáforo de Edição
// ============================================================================

export interface CuradoriaConfig {
  enabled: boolean
  allowed_types: {
    article: boolean
    faq: boolean
    video: boolean
    story: boolean
    image: boolean
  }
  notes?: string
  updated_at?: string
}

const DEFAULT_CONFIG: CuradoriaConfig = {
  enabled: false,
  allowed_types: {
    article: true,
    faq: true,
    video: false,
    story: false,
    image: false
  },
  notes: 'Configurações da IA Curadora para FanPage Viva. NÃO roda automático, só quando admin manda.'
}

const CONFIG_KEY = 'curadoria_config'

/**
 * Busca a configuração atual da curadoria
 * Usa a tabela frontpage_config (key/value com JSONB)
 */
export async function getCuradoriaConfig(
  supabase: SupabaseClient
): Promise<CuradoriaConfig> {
  try {
    const { data, error } = await supabase
      .from('frontpage_config')
      .select('config_value, updated_at')
      .eq('config_key', CONFIG_KEY)
      .single()

    if (error || !data) {
      console.log('[CURADORIA CONFIG] Usando defaults (registro não existe)')
      return DEFAULT_CONFIG
    }

    // Merge com defaults para garantir campos novos
    const config = {
      ...DEFAULT_CONFIG,
      ...(data.config_value as Partial<CuradoriaConfig>),
      updated_at: data.updated_at
    }

    return config
  } catch (error) {
    console.error('[CURADORIA CONFIG] Erro ao buscar:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * Atualiza a configuração da curadoria (merge parcial)
 */
export async function updateCuradoriaConfig(
  supabase: SupabaseClient,
  partialConfig: Partial<CuradoriaConfig>
): Promise<{ success: boolean; config: CuradoriaConfig; error?: string }> {
  try {
    // Buscar config atual
    const currentConfig = await getCuradoriaConfig(supabase)

    // Merge profundo para allowed_types
    const newConfig: CuradoriaConfig = {
      ...currentConfig,
      ...partialConfig,
      allowed_types: {
        ...currentConfig.allowed_types,
        ...(partialConfig.allowed_types || {})
      }
    }

    // Remover updated_at do valor (é gerenciado pelo banco)
    const { updated_at, ...configValue } = newConfig

    // Upsert na tabela
    const { data, error } = await supabase
      .from('frontpage_config')
      .upsert({
        config_key: CONFIG_KEY,
        config_value: configValue,
        description: 'Configurações da IA Curadora (ETAPA 9)',
        is_active: true
      }, {
        onConflict: 'config_key'
      })
      .select('config_value, updated_at')
      .single()

    if (error) {
      console.error('[CURADORIA CONFIG] Erro ao salvar:', error)
      return { success: false, config: currentConfig, error: error.message }
    }

    return {
      success: true,
      config: {
        ...configValue,
        updated_at: data?.updated_at
      }
    }
  } catch (error) {
    console.error('[CURADORIA CONFIG] Erro:', error)
    return {
      success: false,
      config: DEFAULT_CONFIG,
      error: 'Erro interno ao atualizar configuração'
    }
  }
}

/**
 * Verifica se a IA Curadora está habilitada
 */
export async function isCuradoriaEnabled(supabase: SupabaseClient): Promise<boolean> {
  const config = await getCuradoriaConfig(supabase)
  return config.enabled
}

/**
 * Verifica se um tipo de conteúdo está permitido
 */
export async function isContentTypeAllowed(
  supabase: SupabaseClient,
  type: keyof CuradoriaConfig['allowed_types']
): Promise<boolean> {
  const config = await getCuradoriaConfig(supabase)
  return config.enabled && config.allowed_types[type]
}
