/**
 * API para consumir créditos de add-ons
 * ETAPA 21 - Billing Sólido & Add-ons
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { addonKey, amount = 1 } = await request.json()

    if (!addonKey) {
      return NextResponse.json(
        { error: 'addon_key é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar add-on ativo com créditos disponíveis (mais antigo primeiro)
    const { data: addon, error: fetchError } = await supabase
      .from('user_addons')
      .select('*')
      .eq('user_id', user.id)
      .eq('addon_key', addonKey)
      .eq('status', 'active')
      .gte('credits_remaining', amount)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('purchased_at', { ascending: true })
      .limit(1)
      .single()

    if (fetchError || !addon) {
      return NextResponse.json(
        { error: 'Créditos insuficientes', success: false },
        { status: 400 }
      )
    }

    // Consumir crédito
    const { error: updateError } = await supabase
      .from('user_addons')
      .update({ 
        credits_remaining: addon.credits_remaining - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', addon.id)

    if (updateError) {
      console.error('Erro ao consumir crédito:', updateError)
      return NextResponse.json(
        { error: 'Erro ao consumir crédito', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      creditsRemaining: addon.credits_remaining - amount,
      addonId: addon.id
    })

  } catch (error) {
    console.error('Erro na API de consumo:', error)
    return NextResponse.json(
      { error: 'Erro interno', success: false },
      { status: 500 }
    )
  }
}
