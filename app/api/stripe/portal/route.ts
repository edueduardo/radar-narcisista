import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { criarPortalSession } from '../../../../lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Buscar usuário autenticado
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar customer_id do usuário no banco
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Usuário não possui assinatura ativa' },
        { status: 400 }
      )
    }

    // Criar sessão do portal
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const portalUrl = await criarPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${baseUrl}/configuracoes`,
    })

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'Erro ao criar portal de billing' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Erro no portal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
