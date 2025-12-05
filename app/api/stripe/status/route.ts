// API para verificar status do Stripe
// /api/stripe/status

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET

    // Se tiver a chave, tentar verificar conexão
    let accountInfo = null
    if (hasStripeKey) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-11-17.clover' as any
        })
        
        const account = await stripe.accounts.retrieve()
        accountInfo = {
          id: account.id,
          country: account.country,
          email: account.email,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled
        }
      } catch (stripeError) {
        console.error('Erro ao verificar conta Stripe:', stripeError)
      }
    }

    return NextResponse.json({
      connected: hasStripeKey,
      webhookConfigured: hasWebhookSecret,
      account: accountInfo
    })

  } catch (error) {
    console.error('Erro ao verificar status Stripe:', error)
    return NextResponse.json({
      connected: false,
      error: 'Erro ao verificar status'
    })
  }
}
