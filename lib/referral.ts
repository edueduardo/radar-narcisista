/**
 * SISTEMA DE REFERRAL - RADAR NARCISISTA
 * Programa de indicação para crescimento orgânico
 * 
 * BACKUP: Criado em 24/11/2025 23:12
 * LOCAL: lib/referral.ts
 */

import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface ReferralCode {
  id: string
  user_id: string
  code: string
  uses: number
  max_uses: number | null
  reward_type: 'days_free' | 'discount' | 'credits'
  reward_value: number
  created_at: string
  expires_at: string | null
}

export interface ReferralUse {
  id: string
  referral_code_id: string
  referred_user_id: string
  referrer_user_id: string
  status: 'pending' | 'completed' | 'expired'
  reward_given: boolean
  created_at: string
  completed_at: string | null
}

export interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalRewardsEarned: number
  currentCode: string | null
}

// ============================================
// CONFIGURAÇÃO
// ============================================

export const REFERRAL_CONFIG = {
  // Recompensa para quem indica
  referrerReward: {
    type: 'days_free' as const,
    value: 7, // 7 dias grátis por indicação
  },
  // Recompensa para quem é indicado
  referredReward: {
    type: 'days_free' as const,
    value: 7, // 7 dias grátis ao usar código
  },
  // Limite de indicações por código
  maxUsesPerCode: null, // null = ilimitado
  // Dias até expirar o código
  codeExpirationDays: null, // null = nunca expira
}

// ============================================
// FUNÇÕES
// ============================================

/**
 * Gera um código de referral único
 */
export function generateReferralCode(userId: string): string {
  const prefix = 'RADAR'
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const userPart = userId.substring(0, 4).toUpperCase()
  return `${prefix}-${userPart}-${random}`
}

/**
 * Cria ou retorna código de referral do usuário
 */
export async function getOrCreateReferralCode(userId: string): Promise<ReferralCode | null> {
  const supabase = createClient()

  try {
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) {
      return existing as ReferralCode
    }

    // Criar novo código
    const code = generateReferralCode(userId)
    
    const { data: newCode, error } = await supabase
      .from('referrals')
      .insert({
        user_id: userId,
        code,
        uses: 0,
        max_uses: REFERRAL_CONFIG.maxUsesPerCode,
        reward_type: REFERRAL_CONFIG.referrerReward.type,
        reward_value: REFERRAL_CONFIG.referrerReward.value,
        expires_at: REFERRAL_CONFIG.codeExpirationDays 
          ? new Date(Date.now() + REFERRAL_CONFIG.codeExpirationDays * 24 * 60 * 60 * 1000).toISOString()
          : null
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar código:', error)
      return null
    }

    return newCode as ReferralCode
  } catch (error) {
    console.error('Erro no referral:', error)
    return null
  }
}

/**
 * Aplica código de referral para novo usuário
 */
export async function applyReferralCode(
  code: string, 
  newUserId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  try {
    // Buscar código
    const { data: referral, error: findError } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (findError || !referral) {
      return { success: false, message: 'Código inválido ou não encontrado.' }
    }

    // Verificar se não é o próprio usuário
    if (referral.user_id === newUserId) {
      return { success: false, message: 'Você não pode usar seu próprio código.' }
    }

    // Verificar se já usou algum código
    const { data: alreadyUsed } = await supabase
      .from('referral_uses')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single()

    if (alreadyUsed) {
      return { success: false, message: 'Você já usou um código de indicação.' }
    }

    // Verificar limite de usos
    if (referral.max_uses && referral.uses >= referral.max_uses) {
      return { success: false, message: 'Este código atingiu o limite de usos.' }
    }

    // Verificar expiração
    if (referral.expires_at && new Date(referral.expires_at) < new Date()) {
      return { success: false, message: 'Este código expirou.' }
    }

    // Registrar uso
    const { error: useError } = await supabase
      .from('referral_uses')
      .insert({
        referral_code_id: referral.id,
        referred_user_id: newUserId,
        referrer_user_id: referral.user_id,
        status: 'completed',
        reward_given: true,
        completed_at: new Date().toISOString()
      })

    if (useError) {
      console.error('Erro ao registrar uso:', useError)
      return { success: false, message: 'Erro ao aplicar código. Tente novamente.' }
    }

    // Incrementar contador
    await supabase
      .from('referrals')
      .update({ uses: referral.uses + 1 })
      .eq('id', referral.id)

    // TODO: Aplicar recompensas (dias grátis) para ambos os usuários

    return { 
      success: true, 
      message: `🎉 Código aplicado! Você ganhou ${REFERRAL_CONFIG.referredReward.value} dias grátis!` 
    }
  } catch (error) {
    console.error('Erro ao aplicar código:', error)
    return { success: false, message: 'Erro interno. Tente novamente.' }
  }
}

/**
 * Busca estatísticas de referral do usuário
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = createClient()

  try {
    // Buscar código do usuário
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Buscar usos do código
    const { data: uses } = await supabase
      .from('referral_uses')
      .select('*')
      .eq('referrer_user_id', userId)

    const completed = uses?.filter(u => u.status === 'completed') || []
    const pending = uses?.filter(u => u.status === 'pending') || []

    return {
      totalReferrals: uses?.length || 0,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      totalRewardsEarned: completed.length * REFERRAL_CONFIG.referrerReward.value,
      currentCode: referral?.code || null
    }
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalRewardsEarned: 0,
      currentCode: null
    }
  }
}

/**
 * Gera link de compartilhamento
 */
export function generateShareLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://radarnarcisista.com.br'
  return `${baseUrl}/cadastro?ref=${code}`
}

/**
 * Gera texto para compartilhamento
 */
export function generateShareText(code: string): string {
  return `🔍 Descobri o Radar Narcisista - uma ferramenta que me ajudou a ter mais clareza sobre meus relacionamentos. Use meu código ${code} e ganhe 7 dias grátis! ${generateShareLink(code)}`
}
