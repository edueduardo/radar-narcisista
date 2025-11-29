import { NextRequest, NextResponse } from 'next/server'
import { stripe, webhookHandlers } from '../../../../lib/stripe'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Verificar se Stripe esta configurado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Processar eventos
    switch (event.type) {
      case 'checkout.session.completed':
        await webhookHandlers['checkout.session.completed'](
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'customer.subscription.updated':
        await webhookHandlers['customer.subscription.updated'](
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.deleted':
        await webhookHandlers['customer.subscription.deleted'](
          event.data.object as Stripe.Subscription
        )
        break

      case 'invoice.payment_failed':
        await webhookHandlers['invoice.payment_failed'](
          event.data.object as Stripe.Invoice
        )
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
