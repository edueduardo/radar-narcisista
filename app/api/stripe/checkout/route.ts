import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { criarCheckoutSession } from '../../../../lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { planoId, periodo } = await request.json()

    // Validar plano
    if (!['essencial', 'premium'].includes(planoId)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Validar período
    if (!['mensal', 'anual'].includes(periodo)) {
      return NextResponse.json(
        { error: 'Período inválido' },
        { status: 400 }
      )
    }

    // Buscar usuário autenticado
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Criar sessão de checkout
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const session = await criarCheckoutSession({
      planoId,
      periodo,
      userId: user.id,
      userEmail: user.email || '',
      successUrl: `${baseUrl}/planos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/planos`,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Erro ao criar sessão de pagamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    })
  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
