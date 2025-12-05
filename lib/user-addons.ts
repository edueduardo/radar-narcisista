/**
 * ETAPA 21 - Billing Sólido & Add-ons
 * Funções para gerenciar add-ons do usuário
 */

import { createClient } from '@/lib/supabase/client'

// Tipos
export interface UserAddonDB {
  id: string
  user_id: string
  addon_key: string
  stripe_price_id: string | null
  stripe_payment_id: string | null
  stripe_session_id: string | null
  status: 'active' | 'expired' | 'cancelled' | 'refunded'
  credits_total: number | null
  credits_remaining: number | null
  purchased_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

/**
 * Busca todos os add-ons ativos do usuário
 */
export async function getUserAddons(userId?: string): Promise<UserAddonDB[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_addons')
    .select('*')
    .eq('status', 'active')
    .order('purchased_at', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar add-ons:', error)
    return []
  }
  
  // Filtrar expirados no cliente
  const now = new Date()
  return (data || []).filter(addon => {
    if (!addon.expires_at) return true
    return new Date(addon.expires_at) > now
  })
}

/**
 * Verifica se usuário tem um add-on específico ativo
 */
export async function hasAddon(addonKey: string): Promise<boolean> {
  const addons = await getUserAddons()
  return addons.some(a => a.addon_key === addonKey)
}

/**
 * Obtém créditos restantes de um add-on
 */
export async function getAddonCredits(addonKey: string): Promise<number> {
  const addons = await getUserAddons()
  const matching = addons.filter(a => a.addon_key === addonKey)
  
  return matching.reduce((total, addon) => {
    return total + (addon.credits_remaining || 0)
  }, 0)
}

/**
 * Consome créditos de um add-on (chamada server-side via API)
 */
export async function consumeAddonCredits(
  addonKey: string, 
  amount: number = 1
): Promise<boolean> {
  try {
    const response = await fetch('/api/addons/consume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addonKey, amount })
    })
    
    if (!response.ok) return false
    
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Erro ao consumir créditos:', error)
    return false
  }
}

/**
 * Agrupa add-ons por categoria
 */
export function groupAddonsByCategory(addons: UserAddonDB[]): Record<string, UserAddonDB[]> {
  const grouped: Record<string, UserAddonDB[]> = {}
  
  for (const addon of addons) {
    const category = addon.metadata?.addonCategory || 'outros'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(addon)
  }
  
  return grouped
}

/**
 * Calcula total de créditos por tipo
 */
export function getTotalCredits(addons: UserAddonDB[]): {
  chat: number
  diario: number
} {
  const result = { chat: 0, diario: 0 }
  
  for (const addon of addons) {
    if (!addon.credits_remaining) continue
    
    if (addon.addon_key.startsWith('chat-')) {
      result.chat += addon.credits_remaining
    } else if (addon.addon_key.startsWith('diario-')) {
      result.diario += addon.credits_remaining
    }
  }
  
  return result
}
