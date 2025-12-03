/**
 * STRIPE PLANOS_CORE - Integração com Checkout e Webhooks
 * Bloco 36-40 - ETAPA 39
 */

import Stripe from 'stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization para evitar erros durante build
let _stripe: Stripe | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não configurada')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover' as any
    })
  }
  return _stripe
}

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }
  return _supabaseAdmin
}


// Tipos
export interface CheckoutSessionParams {
  userId: string
  userEmail: string
  planSlug: string
  periodo: 'mensal' | 'anual'
  successUrl: string
  cancelUrl: string
  cohortTag?: string
}

export interface SubscriptionData {
  userId: string
  planSlug: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: string
  periodo: string
  featureProfileId: string | null
  cohortTag?: string
}

/**
 * Criar sessão de checkout do Stripe
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<string | null> {
  try {
    // Buscar plano no catálogo
    const { data: plan, error: planError } = await getSupabaseAdmin()
      .from('plan_catalog')
      .select('*, feature_profiles(*)')
      .eq('slug', params.planSlug)
      .single()

    if (planError || !plan) {
      console.error('Plano não encontrado:', params.planSlug)
      return null
    }

    // Determinar price_id baseado no período
    const priceId = params.periodo === 'anual' 
      ? plan.stripe_price_id_anual 
      : plan.stripe_price_id_mensal

    if (!priceId) {
      console.error('Price ID não configurado para o plano:', params.planSlug)
      return null
    }

    // Buscar ou criar customer no Stripe
    let customerId: string | undefined

    const { data: existingSub } = await getSupabaseAdmin()
      .from('user_subscriptions_core')
      .select('stripe_customer_id')
      .eq('user_id', params.userId)
      .single()

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    } else {
      // Criar novo customer
      const customer = await getStripe().customers.create({
        email: params.userEmail,
        metadata: {
          user_id: params.userId,
          source: 'radar_narcisista'
        }
      })
      customerId = customer.id
    }

    // Criar sessão de checkout
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      metadata: {
        user_id: params.userId,
        plan_slug: params.planSlug,
        periodo: params.periodo,
        feature_profile_id: plan.current_profile_id || '',
        cohort_tag: params.cohortTag || ''
      },
      subscription_data: {
        metadata: {
          user_id: params.userId,
          plan_slug: params.planSlug,
          periodo: params.periodo
        }
      }
    })

    return session.url
  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    return null
  }
}

/**
 * Processar webhook de subscription criada/atualizada
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<boolean> {
  try {
    const metadata = subscription.metadata
    const userId = metadata.user_id
    const planSlug = metadata.plan_slug
    const periodo = metadata.periodo || 'mensal'

    if (!userId || !planSlug) {
      console.error('Metadata incompleta na subscription:', subscription.id)
      return false
    }

    // Buscar profile_id do plano
    const { data: plan } = await getSupabaseAdmin()
      .from('plan_catalog')
      .select('current_profile_id')
      .eq('slug', planSlug)
      .single()

    // Upsert na tabela user_subscriptions_core
    // Na API 2025-11-17.clover, current_period_start/end podem estar em subscription ou items
    const sub = subscription as any
    const periodStart = sub.current_period_start || Math.floor(Date.now() / 1000)
    const periodEnd = sub.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

    const { error } = await getSupabaseAdmin()
      .from('user_subscriptions_core')
      .upsert({
        user_id: userId,
        plan_slug: planSlug,
        feature_profile_id: plan?.current_profile_id || null,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status === 'active' ? 'active' : subscription.status,
        periodo: periodo,
        data_inicio: new Date(periodStart * 1000).toISOString(),
        data_fim: new Date(periodEnd * 1000).toISOString(),
        proximo_pagamento: new Date(periodEnd * 1000).toISOString(),
        cohort_tag: metadata.cohort_tag || null,
        metadata: {
          stripe_status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end
        }
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Erro ao salvar subscription:', error)
      return false
    }

    console.log(`✅ Subscription criada/atualizada: ${userId} -> ${planSlug}`)
    return true
  } catch (error) {
    console.error('Erro no handleSubscriptionCreated:', error)
    return false
  }
}

/**
 * Processar webhook de subscription cancelada
 */
export async function handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<boolean> {
  try {
    const metadata = subscription.metadata
    const userId = metadata.user_id

    if (!userId) {
      console.error('user_id não encontrado na subscription:', subscription.id)
      return false
    }

    // Atualizar status para canceled
    const { error } = await getSupabaseAdmin()
      .from('user_subscriptions_core')
      .update({
        status: 'canceled',
        data_fim: new Date().toISOString(),
        metadata: {
          canceled_at: new Date().toISOString(),
          stripe_status: subscription.status
        }
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Erro ao cancelar subscription:', error)
      return false
    }

    console.log(`❌ Subscription cancelada: ${userId}`)
    return true
  } catch (error) {
    console.error('Erro no handleSubscriptionCanceled:', error)
    return false
  }
}

/**
 * Processar webhook de pagamento falhou
 */
export async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<boolean> {
  try {
    const inv = invoice as any
    const subscriptionId = inv.subscription as string
    
    if (!subscriptionId) return false

    // Atualizar status para past_due
    const { error } = await getSupabaseAdmin()
      .from('user_subscriptions_core')
      .update({
        status: 'past_due',
        metadata: {
          payment_failed_at: new Date().toISOString(),
          last_invoice_id: invoice.id
        }
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Erro ao marcar payment failed:', error)
      return false
    }

    console.log(`⚠️ Payment failed para subscription: ${subscriptionId}`)
    return true
  } catch (error) {
    console.error('Erro no handlePaymentFailed:', error)
    return false
  }
}

/**
 * Criar portal de billing do Stripe
 */
export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    })

    return session.url
  } catch (error) {
    console.error('Erro ao criar billing portal:', error)
    return null
  }
}

/**
 * Sincronizar preços do Stripe com plan_catalog
 */
export async function syncStripePrices(): Promise<void> {
  try {
    const { data: plans } = await getSupabaseAdmin()
      .from('plan_catalog')
      .select('slug, stripe_price_id_mensal, stripe_price_id_anual')

    if (!plans) return

    for (const plan of plans) {
      // Verificar preço mensal
      if (plan.stripe_price_id_mensal) {
        try {
          const price = await getStripe().prices.retrieve(plan.stripe_price_id_mensal)
          console.log(`✅ Preço mensal válido para ${plan.slug}: ${price.unit_amount}`)
        } catch {
          console.error(`❌ Preço mensal inválido para ${plan.slug}`)
        }
      }

      // Verificar preço anual
      if (plan.stripe_price_id_anual) {
        try {
          const price = await getStripe().prices.retrieve(plan.stripe_price_id_anual)
          console.log(`✅ Preço anual válido para ${plan.slug}: ${price.unit_amount}`)
        } catch {
          console.error(`❌ Preço anual inválido para ${plan.slug}`)
        }
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar preços:', error)
  }
}

/**
 * Obter subscription ativa do usuário
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('user_subscriptions_core')
    .select('*, feature_profiles(*), plan_catalog(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) return null
  return data
}

/**
 * Verificar se usuário tem plano ativo
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId)
  return sub !== null && sub.status === 'active'
}
