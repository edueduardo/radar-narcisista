/**
 * WEBHOOK STRIPE - PLANOS_CORE
 * Processa eventos de subscription do Stripe
 * Bloco 36-40 - ETAPA 39
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  handleSubscriptionCreated,
  handleSubscriptionCanceled,
  handlePaymentFailed
} from '@/lib/stripe-planos-core'

// Lazy initialization para evitar erros durante build
function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover' as any
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_PLANOS || ''

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event
    const stripe = getStripe()

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`📥 Webhook recebido: ${event.type}`)

    // Processar eventos
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const success = await handleSubscriptionCreated(subscription)
        if (!success) {
          return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const success = await handleSubscriptionCanceled(subscription)
        if (!success) {
          return NextResponse.json({ error: 'Failed to process cancellation' }, { status: 500 })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      case 'invoice.payment_succeeded': {
        // Pagamento bem sucedido - subscription já foi atualizada
        console.log('✅ Pagamento confirmado')
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`✅ Checkout completado: ${session.id}`)
        // A subscription será processada pelo evento customer.subscription.created
        break
      }

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Nota: No App Router do Next.js 13+, o body parser já é desabilitado por padrão
// para routes que usam request.text() ou request.json()
