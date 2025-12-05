// API para gerenciar Push Subscriptions
// /api/notifications/push-subscribe

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST - Registrar subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 })
    }

    // Salvar subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        subscription: subscription,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      })

    if (error) {
      // Se tabela não existe, retornar sucesso simulado
      if (error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          source: 'simulated',
          message: 'Tabela push_subscriptions não existe'
        })
      }
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao registrar subscription:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover subscription
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    if (error && error.code !== '42P01') throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao remover subscription:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Verificar VAPID public key
export async function GET(request: NextRequest) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  return NextResponse.json({
    vapidPublicKey: vapidPublicKey || null,
    configured: !!vapidPublicKey
  })
}
