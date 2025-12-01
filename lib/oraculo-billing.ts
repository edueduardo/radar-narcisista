/**
 * ORACULO BILLING - Sistema de Billing por Instância
 * ETAPA 38 - Integração com Stripe
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// ============================================================================
// TIPOS
// ============================================================================

export interface InstancePlan {
  id: string
  plan_slug: string
  plan_name: string
  description: string | null
  stripe_product_id: string | null
  stripe_price_id: string | null
  max_queries_per_month: number
  max_tokens_per_month: number
  max_api_keys: number
  max_webhooks: number
  max_roles: number
  features: string[]
  price_cents: number
  currency: string
  billing_period: 'monthly' | 'yearly'
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface InstanceSubscription {
  id: string
  instance_id: string
  plan_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  canceled_at: string | null
  queries_used: number
  tokens_used: number
  created_at: string
  updated_at: string
  plan?: InstancePlan
}

export interface InstanceInvoice {
  id: string
  instance_id: string
  subscription_id: string | null
  stripe_invoice_id: string | null
  stripe_payment_intent_id: string | null
  amount_cents: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  period_start: string | null
  period_end: string | null
  description: string | null
  invoice_pdf_url: string | null
  hosted_invoice_url: string | null
  paid_at: string | null
  created_at: string
}

export interface BillingUsage {
  id: string
  instance_id: string
  subscription_id: string | null
  period_start: string
  period_end: string
  total_queries: number
  total_tokens: number
  total_api_calls: number
  estimated_cost_cents: number
  daily_breakdown: Array<{
    date: string
    queries: number
    tokens: number
  }>
  created_at: string
  updated_at: string
}

// ============================================================================
// CLIENTE SUPABASE
// ============================================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase não configurado')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ============================================================================
// CLIENTE STRIPE
// ============================================================================

function getStripe(): Stripe | null {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) return null
  return new Stripe(stripeSecretKey)
}

// ============================================================================
// FUNÇÕES DE PLANOS
// ============================================================================

/**
 * Lista todos os planos disponíveis
 */
export async function listPlans(): Promise<InstancePlan[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instance_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true })
    
    if (error) {
      console.error('Erro ao listar planos:', error)
      return []
    }
    
    return data as InstancePlan[]
  } catch (error) {
    console.error('Erro ao listar planos:', error)
    return []
  }
}

/**
 * Busca um plano por slug
 */
export async function getPlanBySlug(slug: string): Promise<InstancePlan | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instance_plans')
      .select('*')
      .eq('plan_slug', slug)
      .single()
    
    if (error || !data) return null
    
    return data as InstancePlan
  } catch (error) {
    console.error('Erro ao buscar plano:', error)
    return null
  }
}

/**
 * Busca o plano padrão (free)
 */
export async function getDefaultPlan(): Promise<InstancePlan | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instance_plans')
      .select('*')
      .eq('is_default', true)
      .single()
    
    if (error || !data) return null
    
    return data as InstancePlan
  } catch (error) {
    console.error('Erro ao buscar plano padrão:', error)
    return null
  }
}

// ============================================================================
// FUNÇÕES DE SUBSCRIPTION
// ============================================================================

/**
 * Busca a subscription de uma instância
 */
export async function getInstanceSubscription(instanceId: string): Promise<InstanceSubscription | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instance_subscriptions')
      .select(`
        *,
        plan:oraculo_instance_plans(*)
      `)
      .eq('instance_id', instanceId)
      .in('status', ['active', 'trialing'])
      .single()
    
    if (error || !data) return null
    
    return data as InstanceSubscription
  } catch (error) {
    console.error('Erro ao buscar subscription:', error)
    return null
  }
}

/**
 * Cria uma subscription para uma instância (plano free)
 */
export async function createFreeSubscription(instanceId: string): Promise<InstanceSubscription | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar plano free
    const freePlan = await getDefaultPlan()
    if (!freePlan) {
      console.error('Plano free não encontrado')
      return null
    }
    
    // Calcular período
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    
    const { data, error } = await supabase
      .from('oraculo_instance_subscriptions')
      .insert({
        instance_id: instanceId,
        plan_id: freePlan.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar subscription:', error)
      return null
    }
    
    return data as InstanceSubscription
  } catch (error) {
    console.error('Erro ao criar subscription:', error)
    return null
  }
}

/**
 * Atualiza uso da subscription
 */
export async function updateSubscriptionUsage(
  subscriptionId: string, 
  queries: number = 0, 
  tokens: number = 0
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Buscar uso atual
    const { data: current } = await supabase
      .from('oraculo_instance_subscriptions')
      .select('queries_used, tokens_used')
      .eq('id', subscriptionId)
      .single()
    
    if (!current) return false
    
    const { error } = await supabase
      .from('oraculo_instance_subscriptions')
      .update({
        queries_used: (current.queries_used || 0) + queries,
        tokens_used: (current.tokens_used || 0) + tokens
      })
      .eq('id', subscriptionId)
    
    return !error
  } catch (error) {
    console.error('Erro ao atualizar uso:', error)
    return false
  }
}

/**
 * Verifica se instância pode fazer query (dentro dos limites)
 */
export async function canInstanceQuery(instanceId: string): Promise<{
  allowed: boolean
  reason?: string
  subscription?: InstanceSubscription
}> {
  try {
    const subscription = await getInstanceSubscription(instanceId)
    
    if (!subscription) {
      return { allowed: false, reason: 'Sem assinatura ativa' }
    }
    
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return { allowed: false, reason: 'Assinatura não está ativa' }
    }
    
    const plan = subscription.plan
    if (!plan) {
      return { allowed: false, reason: 'Plano não encontrado' }
    }
    
    // -1 significa ilimitado
    if (plan.max_queries_per_month !== -1 && subscription.queries_used >= plan.max_queries_per_month) {
      return { allowed: false, reason: 'Limite de queries atingido' }
    }
    
    if (plan.max_tokens_per_month !== -1 && subscription.tokens_used >= plan.max_tokens_per_month) {
      return { allowed: false, reason: 'Limite de tokens atingido' }
    }
    
    return { allowed: true, subscription }
  } catch (error) {
    console.error('Erro ao verificar limites:', error)
    return { allowed: false, reason: 'Erro ao verificar limites' }
  }
}

// ============================================================================
// FUNÇÕES DE STRIPE
// ============================================================================

/**
 * Cria checkout session para upgrade de plano
 */
export async function createCheckoutSession(
  instanceId: string,
  planSlug: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return { url: null, error: 'Stripe não configurado' }
    }
    
    const supabase = getSupabaseAdmin()
    
    // Buscar instância
    const { data: instance } = await supabase
      .from('oraculo_instances')
      .select('id, instance_name, owner_id')
      .eq('id', instanceId)
      .single()
    
    if (!instance) {
      return { url: null, error: 'Instância não encontrada' }
    }
    
    // Buscar plano
    const plan = await getPlanBySlug(planSlug)
    if (!plan || !plan.stripe_price_id) {
      return { url: null, error: 'Plano não encontrado ou sem preço Stripe' }
    }
    
    // Buscar ou criar customer
    let customerId: string | undefined
    const subscription = await getInstanceSubscription(instanceId)
    
    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    }
    
    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        price: plan.stripe_price_id,
        quantity: 1
      }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        instance_id: instanceId,
        plan_slug: planSlug
      },
      subscription_data: {
        metadata: {
          instance_id: instanceId,
          plan_slug: planSlug
        }
      }
    })
    
    return { url: session.url }
  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    return { url: null, error: 'Erro ao criar checkout' }
  }
}

/**
 * Processa webhook do Stripe
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const instanceId = session.metadata?.instance_id
        const planSlug = session.metadata?.plan_slug
        
        if (!instanceId || !planSlug) break
        
        const plan = await getPlanBySlug(planSlug)
        if (!plan) break
        
        // Atualizar ou criar subscription
        await supabase
          .from('oraculo_instance_subscriptions')
          .upsert({
            instance_id: instanceId,
            plan_id: plan.id,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            queries_used: 0,
            tokens_used: 0
          }, {
            onConflict: 'instance_id'
          })
        
        break
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as unknown as Record<string, unknown>
        const subscriptionId = invoice.subscription as string
        
        if (!subscriptionId) break
        
        // Buscar subscription
        const { data: sub } = await supabase
          .from('oraculo_instance_subscriptions')
          .select('id, instance_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()
        
        if (!sub) break
        
        // Registrar invoice
        await supabase
          .from('oraculo_instance_invoices')
          .insert({
            instance_id: sub.instance_id,
            subscription_id: sub.id,
            stripe_invoice_id: invoice.id as string,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount_cents: invoice.amount_paid as number,
            currency: ((invoice.currency as string) || 'brl').toUpperCase(),
            status: 'paid',
            period_start: invoice.period_start ? new Date((invoice.period_start as number) * 1000).toISOString() : null,
            period_end: invoice.period_end ? new Date((invoice.period_end as number) * 1000).toISOString() : null,
            invoice_pdf_url: invoice.invoice_pdf as string,
            hosted_invoice_url: invoice.hosted_invoice_url as string,
            paid_at: new Date().toISOString()
          })
        
        // Resetar uso mensal
        await supabase
          .from('oraculo_instance_subscriptions')
          .update({
            queries_used: 0,
            tokens_used: 0,
            current_period_start: invoice.period_start ? new Date((invoice.period_start as number) * 1000).toISOString() : null,
            current_period_end: invoice.period_end ? new Date((invoice.period_end as number) * 1000).toISOString() : null
          })
          .eq('id', sub.id)
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('oraculo_instance_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
        
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as Record<string, unknown>
        
        await supabase
          .from('oraculo_instance_subscriptions')
          .update({
            status: subscription.status as InstanceSubscription['status'],
            current_period_start: subscription.current_period_start ? new Date((subscription.current_period_start as number) * 1000).toISOString() : null,
            current_period_end: subscription.current_period_end ? new Date((subscription.current_period_end as number) * 1000).toISOString() : null
          })
          .eq('stripe_subscription_id', subscription.id as string)
        
        break
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Erro no webhook Stripe:', error)
    return { success: false, error: 'Erro ao processar webhook' }
  }
}

// ============================================================================
// FUNÇÕES DE INVOICES
// ============================================================================

/**
 * Lista invoices de uma instância
 */
export async function listInstanceInvoices(instanceId: string): Promise<InstanceInvoice[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_instance_invoices')
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('Erro ao listar invoices:', error)
      return []
    }
    
    return data as InstanceInvoice[]
  } catch (error) {
    console.error('Erro ao listar invoices:', error)
    return []
  }
}

// ============================================================================
// FUNÇÕES DE USO
// ============================================================================

/**
 * Registra uso para billing
 */
export async function recordBillingUsage(
  instanceId: string,
  queries: number,
  tokens: number
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Período atual (mês)
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Buscar ou criar registro de uso
    const { data: existing } = await supabase
      .from('oraculo_billing_usage')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('period_start', periodStart.toISOString().split('T')[0])
      .single()
    
    if (existing) {
      // Atualizar
      const dailyBreakdown = existing.daily_breakdown || []
      const today = now.toISOString().split('T')[0]
      const todayIndex = dailyBreakdown.findIndex((d: { date: string }) => d.date === today)
      
      if (todayIndex >= 0) {
        dailyBreakdown[todayIndex].queries += queries
        dailyBreakdown[todayIndex].tokens += tokens
      } else {
        dailyBreakdown.push({ date: today, queries, tokens })
      }
      
      await supabase
        .from('oraculo_billing_usage')
        .update({
          total_queries: (existing.total_queries || 0) + queries,
          total_tokens: (existing.total_tokens || 0) + tokens,
          total_api_calls: (existing.total_api_calls || 0) + 1,
          daily_breakdown: dailyBreakdown
        })
        .eq('id', existing.id)
    } else {
      // Criar
      const subscription = await getInstanceSubscription(instanceId)
      
      await supabase
        .from('oraculo_billing_usage')
        .insert({
          instance_id: instanceId,
          subscription_id: subscription?.id || null,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          total_queries: queries,
          total_tokens: tokens,
          total_api_calls: 1,
          daily_breakdown: [{ date: now.toISOString().split('T')[0], queries, tokens }]
        })
    }
    
    // Atualizar uso na subscription
    const subscription = await getInstanceSubscription(instanceId)
    if (subscription) {
      await updateSubscriptionUsage(subscription.id, queries, tokens)
    }
    
    return true
  } catch (error) {
    console.error('Erro ao registrar uso:', error)
    return false
  }
}

/**
 * Busca uso atual da instância
 */
export async function getCurrentUsage(instanceId: string): Promise<BillingUsage | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { data, error } = await supabase
      .from('oraculo_billing_usage')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('period_start', periodStart.toISOString().split('T')[0])
      .single()
    
    if (error || !data) return null
    
    return data as BillingUsage
  } catch (error) {
    console.error('Erro ao buscar uso:', error)
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_BILLING = {
  listPlans,
  getPlanBySlug,
  getDefaultPlan,
  getInstanceSubscription,
  createFreeSubscription,
  updateSubscriptionUsage,
  canInstanceQuery,
  createCheckoutSession,
  handleStripeWebhook,
  listInstanceInvoices,
  recordBillingUsage,
  getCurrentUsage
}

export default ORACULO_BILLING
