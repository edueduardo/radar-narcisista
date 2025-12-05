/**
 * API para listar add-ons do usuário
 * ETAPA 21 - Billing Sólido & Add-ons
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar add-ons do usuário
    const { data: addons, error } = await supabase
      .from('user_addons')
      .select('*')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar add-ons:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar add-ons' },
        { status: 500 }
      )
    }

    // Separar ativos de expirados/inativos
    const now = new Date()
    const active = (addons || []).filter(addon => {
      if (addon.status !== 'active') return false
      if (!addon.expires_at) return true
      return new Date(addon.expires_at) > now
    })

    const inactive = (addons || []).filter(addon => {
      if (addon.status !== 'active') return true
      if (!addon.expires_at) return false
      return new Date(addon.expires_at) <= now
    })

    // Calcular totais de créditos
    const credits = {
      chat: 0,
      diario: 0
    }

    for (const addon of active) {
      if (!addon.credits_remaining) continue
      if (addon.addon_key.startsWith('chat-')) {
        credits.chat += addon.credits_remaining
      } else if (addon.addon_key.startsWith('diario-')) {
        credits.diario += addon.credits_remaining
      }
    }

    return NextResponse.json({
      addons: active,
      inactive,
      credits,
      total: active.length
    })

  } catch (error) {
    console.error('Erro na API de add-ons:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
