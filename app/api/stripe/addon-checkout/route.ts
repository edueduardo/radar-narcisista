/**
 * API de Checkout para Add-ons
 * ETAPA 14 - Loja Simplificada
 * 
 * Cria sessão de pagamento único (não assinatura) para add-ons
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { getAddonById, type Addon } from '@/lib/addons-config'

// Mapeamento de add-ons para Price IDs do Stripe
// NOTA: Estes Price IDs devem ser criados no Stripe Dashboard como "one-time" (pagamento único)
const ADDON_PRICE_IDS: Record<string, string> = {
  'relatorio-completo': process.env.STRIPE_PRICE_ADDON_RELATORIO || '',
  'kit-seguranca': process.env.STRIPE_PRICE_ADDON_KIT_SEGURANCA || '',
  'kit-documentacao': process.env.STRIPE_PRICE_ADDON_KIT_DOCUMENTACAO || '',
  'chat-50': process.env.STRIPE_PRICE_ADDON_CHAT_50 || '',
  'chat-200': process.env.STRIPE_PRICE_ADDON_CHAT_200 || '',
  'diario-10': process.env.STRIPE_PRICE_ADDON_DIARIO_10 || '',
  'pdf-export': process.env.STRIPE_PRICE_ADDON_PDF_EXPORT || '',
}

export async function POST(request: NextRequest) {
  try {
    const { addonId } = await request.json()

    // Validar addon
    const addon = getAddonById(addonId)
    if (!addon) {
      return NextResponse.json(
        { error: 'Add-on não encontrado' },
        { status: 400 }
      )
    }

    if (addon.comingSoon) {
      return NextResponse.json(
        { error: 'Este add-on ainda não está disponível' },
        { status: 400 }
      )
    }

    // Buscar usuário autenticado
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    // Verificar se Stripe está configurado
    if (!isStripeConfigured() || !stripe) {
      console.error('Stripe não configurado')
      return NextResponse.json(
        { error: 'Sistema de pagamento não configurado. Entre em contato com o suporte.' },
        { status: 500 }
      )
    }

    // Buscar Price ID do addon
    const priceId = ADDON_PRICE_IDS[addonId]
    
    // Se não tiver Price ID configurado, criar checkout dinâmico
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    let sessionConfig: any = {
      mode: 'payment', // Pagamento único, não assinatura
      payment_method_types: ['card', 'boleto', 'pix'],
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      success_url: `${baseUrl}/loja/sucesso?session_id={CHECKOUT_SESSION_ID}&addon=${addonId}`,
      cancel_url: `${baseUrl}/loja`,
      metadata: {
        userId: user.id,
        addonId: addon.id,
        addonName: addon.name,
        addonType: addon.type,
        addonCategory: addon.category,
        credits: addon.credits?.toString() || '',
        validityDays: addon.validityDays?.toString() || '',
      },
      locale: 'pt-BR',
      allow_promotion_codes: true,
    }

    // Se tiver Price ID configurado no Stripe, usar ele
    if (priceId) {
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ]
    } else {
      // Criar produto/preço dinâmico (para desenvolvimento/teste)
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: addon.name,
              description: addon.shortDescription,
              metadata: {
                addonId: addon.id,
              },
            },
            unit_amount: Math.round(addon.price * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Erro no checkout de addon:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
