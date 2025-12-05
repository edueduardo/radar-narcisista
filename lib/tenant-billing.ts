/**
 * Sistema de Billing Multi-tenant
 * FASE 9.3 - White Label
 */

import { Tenant } from './multi-tenant'

export interface TenantPlan {
  slug: string
  name: string
  description: string
  
  // Preços
  priceMonthly: number
  priceYearly: number
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
  
  // Limites
  limits: {
    maxUsers: number
    maxStorageGB: number
    maxAIRequestsPerDay: number
    maxProfessionalClients: number
  }
  
  // Features
  features: {
    customDomain: boolean
    apiAccess: boolean
    whitelabel: boolean
    prioritySupport: boolean
    sla: string | null
  }
}

// Planos disponíveis para tenants
export const TENANT_PLANS: TenantPlan[] = [
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Para começar seu projeto',
    priceMonthly: 97,
    priceYearly: 970,
    limits: {
      maxUsers: 100,
      maxStorageGB: 5,
      maxAIRequestsPerDay: 1000,
      maxProfessionalClients: 10
    },
    features: {
      customDomain: false,
      apiAccess: false,
      whitelabel: false,
      prioritySupport: false,
      sla: null
    }
  },
  {
    slug: 'professional',
    name: 'Professional',
    description: 'Para negócios em crescimento',
    priceMonthly: 297,
    priceYearly: 2970,
    limits: {
      maxUsers: 500,
      maxStorageGB: 25,
      maxAIRequestsPerDay: 5000,
      maxProfessionalClients: 50
    },
    features: {
      customDomain: true,
      apiAccess: true,
      whitelabel: false,
      prioritySupport: true,
      sla: '99.5%'
    }
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizações',
    priceMonthly: 997,
    priceYearly: 9970,
    limits: {
      maxUsers: -1, // Ilimitado
      maxStorageGB: 100,
      maxAIRequestsPerDay: -1, // Ilimitado
      maxProfessionalClients: -1 // Ilimitado
    },
    features: {
      customDomain: true,
      apiAccess: true,
      whitelabel: true,
      prioritySupport: true,
      sla: '99.9%'
    }
  }
]

/**
 * Buscar plano por slug
 */
export function getTenantPlan(slug: string): TenantPlan | undefined {
  return TENANT_PLANS.find(p => p.slug === slug)
}

/**
 * Verificar se tenant está dentro dos limites
 */
export async function checkTenantLimits(
  tenant: Tenant,
  supabase: any
): Promise<{
  withinLimits: boolean
  usage: Record<string, { current: number; limit: number; percent: number }>
}> {
  const limits = tenant.limits
  const usage: Record<string, { current: number; limit: number; percent: number }> = {}

  // Contar usuários
  const { count: userCount } = await supabase
    .from('tenant_users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  usage.users = {
    current: userCount || 0,
    limit: limits.maxUsers,
    percent: limits.maxUsers > 0 ? ((userCount || 0) / limits.maxUsers) * 100 : 0
  }

  // Contar requisições de IA hoje
  const today = new Date().toISOString().split('T')[0]
  const { count: aiCount } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)
    .gte('created_at', today)

  usage.aiRequests = {
    current: aiCount || 0,
    limit: limits.maxAIRequestsPerDay,
    percent: limits.maxAIRequestsPerDay > 0 ? ((aiCount || 0) / limits.maxAIRequestsPerDay) * 100 : 0
  }

  // Verificar se está dentro dos limites
  const withinLimits = Object.values(usage).every(u => 
    u.limit < 0 || u.current <= u.limit
  )

  return { withinLimits, usage }
}

/**
 * Criar checkout session para tenant
 */
export async function createTenantCheckout(
  tenantId: string,
  planSlug: string,
  periodo: 'mensal' | 'anual',
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error: string | null }> {
  const plan = getTenantPlan(planSlug)
  if (!plan) {
    return { url: null, error: 'Plano não encontrado' }
  }

  const priceId = periodo === 'anual' 
    ? plan.stripePriceIdYearly 
    : plan.stripePriceIdMonthly

  if (!priceId) {
    return { url: null, error: 'Preço não configurado' }
  }

  try {
    const response = await fetch('/api/stripe/tenant-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        priceId,
        successUrl,
        cancelUrl
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao criar checkout')
    }

    const data = await response.json()
    return { url: data.url, error: null }

  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

/**
 * Processar webhook de subscription do tenant
 */
export async function handleTenantSubscriptionWebhook(
  event: any,
  supabase: any
): Promise<{ success: boolean; error: string | null }> {
  const subscription = event.data.object
  const tenantId = subscription.metadata?.tenant_id

  if (!tenantId) {
    return { success: false, error: 'Tenant ID não encontrado' }
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await supabase
          .from('tenants')
          .update({
            subscription_id: subscription.id,
            status: subscription.status === 'active' ? 'active' : 'suspended',
            plan_slug: subscription.metadata?.plan_slug,
            updated_at: new Date().toISOString()
          })
          .eq('id', tenantId)
        break

      case 'customer.subscription.deleted':
        await supabase
          .from('tenants')
          .update({
            subscription_id: null,
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', tenantId)
        break
    }

    return { success: true, error: null }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Calcular uso e custos do tenant
 */
export async function calculateTenantUsage(
  tenantId: string,
  startDate: string,
  endDate: string,
  supabase: any
): Promise<{
  users: number
  aiRequests: number
  storageGB: number
  estimatedCost: number
}> {
  // Contar usuários ativos
  const { count: users } = await supabase
    .from('tenant_users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  // Contar requisições de IA
  const { count: aiRequests } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  // Calcular storage (simplificado)
  const { data: storageData } = await supabase
    .from('tenant_storage')
    .select('size_bytes')
    .eq('tenant_id', tenantId)

  const storageBytes = storageData?.reduce((sum: number, item: any) => sum + (item.size_bytes || 0), 0) || 0
  const storageGB = storageBytes / (1024 * 1024 * 1024)

  // Estimar custo (simplificado)
  const aiCostPerRequest = 0.002 // $0.002 por request
  const storageCostPerGB = 0.10 // $0.10 por GB
  const estimatedCost = (aiRequests || 0) * aiCostPerRequest + storageGB * storageCostPerGB

  return {
    users: users || 0,
    aiRequests: aiRequests || 0,
    storageGB,
    estimatedCost
  }
}
