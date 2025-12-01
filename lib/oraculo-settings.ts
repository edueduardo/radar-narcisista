/**
 * ORACULO SETTINGS - Helpers para verificação de acesso e limites
 * ETAPA 28 - Infra Multiperfil do Oráculo
 * 
 * Este módulo gerencia:
 * - Verificação de permissões por plano/perfil
 * - Controle de limites de uso
 * - Registro de consumo
 */

import { createClient } from '@supabase/supabase-js'
import { OraculoUserRole } from './oraculo-core'

// ============================================================================
// TIPOS
// ============================================================================

export interface OraculoPermission {
  allowed: boolean
  reason?: string
  status?: number
  modelo?: string
  limite?: number
  usado?: number
  reset?: string
  uso_diario?: number
  limite_diario?: number | null
  uso_semanal?: number
  limite_semanal?: number | null
  uso_mensal?: number
  limite_mensal?: number | null
}

export interface OraculoSettings {
  id: string
  plan_slug: string
  user_role: string
  status: number
  limite_diario: number | null
  limite_semanal: number | null
  limite_quinzenal: number | null
  limite_mensal: number | null
  modelo_ia: string
  temperatura: number
  max_tokens: number
  descricao: string | null
}

// ============================================================================
// CLIENTE SUPABASE ADMIN
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
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Verifica se o usuário pode usar o Oráculo
 * Chama a função do banco de dados que verifica plano, perfil e limites
 */
export async function canUseOraculo(
  userId: string,
  userRole: OraculoUserRole,
  planSlug: string
): Promise<OraculoPermission> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase.rpc('can_use_oraculo', {
      p_user_id: userId,
      p_user_role: userRole,
      p_plan_slug: planSlug
    })
    
    if (error) {
      console.error('Erro ao verificar permissão do Oráculo:', error)
      // Em caso de erro, permite para admin, bloqueia para outros
      if (userRole === 'admin') {
        return { allowed: true, reason: 'Admin bypass (erro na verificação)' }
      }
      return { allowed: false, reason: 'Erro ao verificar permissões' }
    }
    
    return data as OraculoPermission
  } catch (error) {
    console.error('Erro ao verificar permissão do Oráculo:', error)
    // Fallback: admin sempre pode, outros não
    if (userRole === 'admin') {
      return { allowed: true, reason: 'Admin bypass (fallback)' }
    }
    return { allowed: false, reason: 'Erro interno' }
  }
}

/**
 * Registra o uso do Oráculo
 * Incrementa os contadores diário, semanal e mensal
 */
export async function registerOraculoUsage(
  userId: string,
  userRole: OraculoUserRole,
  planSlug: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase.rpc('register_oraculo_usage', {
      p_user_id: userId,
      p_user_role: userRole,
      p_plan_slug: planSlug
    })
    
    if (error) {
      console.error('Erro ao registrar uso do Oráculo:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao registrar uso do Oráculo:', error)
    return false
  }
}

/**
 * Busca as configurações do Oráculo para um plano/perfil
 */
export async function getOraculoSettings(
  planSlug: string,
  userRole: OraculoUserRole
): Promise<OraculoSettings | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_plan_settings')
      .select('*')
      .eq('plan_slug', planSlug)
      .eq('user_role', userRole)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as OraculoSettings
  } catch (error) {
    console.error('Erro ao buscar configurações do Oráculo:', error)
    return null
  }
}

/**
 * Atualiza as configurações do Oráculo para um plano/perfil
 * Apenas admin pode usar esta função
 */
export async function updateOraculoSettings(
  planSlug: string,
  userRole: OraculoUserRole,
  settings: Partial<Omit<OraculoSettings, 'id' | 'plan_slug' | 'user_role'>>
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('oraculo_plan_settings')
      .update(settings)
      .eq('plan_slug', planSlug)
      .eq('user_role', userRole)
    
    if (error) {
      console.error('Erro ao atualizar configurações do Oráculo:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar configurações do Oráculo:', error)
    return false
  }
}

/**
 * Lista todas as configurações do Oráculo
 * Útil para o painel admin
 */
export async function listAllOraculoSettings(): Promise<OraculoSettings[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_plan_settings')
      .select('*')
      .order('plan_slug')
      .order('user_role')
    
    if (error) {
      console.error('Erro ao listar configurações do Oráculo:', error)
      return []
    }
    
    return data as OraculoSettings[]
  } catch (error) {
    console.error('Erro ao listar configurações do Oráculo:', error)
    return []
  }
}

/**
 * Busca o uso do Oráculo de um usuário
 */
export async function getOraculoUsage(userId: string): Promise<{
  diario: number
  semanal: number
  mensal: number
}> {
  try {
    const supabase = getSupabaseAdmin()
    const hoje = new Date().toISOString().split('T')[0]
    
    // Calcular início da semana (segunda-feira)
    const dataHoje = new Date()
    const diaSemana = dataHoje.getDay()
    const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana
    const inicioSemana = new Date(dataHoje)
    inicioSemana.setDate(dataHoje.getDate() + diffSegunda)
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0]
    
    // Calcular início do mês
    const inicioMes = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1)
    const inicioMesStr = inicioMes.toISOString().split('T')[0]
    
    // Buscar uso diário
    const { data: usoDiario } = await supabase
      .from('oraculo_usage')
      .select('qtd_perguntas')
      .eq('user_id', userId)
      .eq('periodo_tipo', 'diario')
      .eq('periodo_inicio', hoje)
      .single()
    
    // Buscar uso semanal
    const { data: usoSemanal } = await supabase
      .from('oraculo_usage')
      .select('qtd_perguntas')
      .eq('user_id', userId)
      .eq('periodo_tipo', 'semanal')
      .eq('periodo_inicio', inicioSemanaStr)
      .single()
    
    // Buscar uso mensal
    const { data: usoMensal } = await supabase
      .from('oraculo_usage')
      .select('qtd_perguntas')
      .eq('user_id', userId)
      .eq('periodo_tipo', 'mensal')
      .eq('periodo_inicio', inicioMesStr)
      .single()
    
    return {
      diario: usoDiario?.qtd_perguntas || 0,
      semanal: usoSemanal?.qtd_perguntas || 0,
      mensal: usoMensal?.qtd_perguntas || 0
    }
  } catch (error) {
    console.error('Erro ao buscar uso do Oráculo:', error)
    return { diario: 0, semanal: 0, mensal: 0 }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_SETTINGS = {
  canUseOraculo,
  registerOraculoUsage,
  getOraculoSettings,
  updateOraculoSettings,
  listAllOraculoSettings,
  getOraculoUsage
}

export default ORACULO_SETTINGS
