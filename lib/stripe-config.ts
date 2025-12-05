/**
 * Configuração de Stripe - Price IDs e Planos
 * 
 * IMPORTANTE: Substituir os price_id de teste pelos reais do Stripe Dashboard
 * 
 * Para configurar:
 * 1. Acesse https://dashboard.stripe.com/products
 * 2. Crie os produtos e preços
 * 3. Copie os price_id (começam com price_)
 * 4. Cole aqui ou configure via variáveis de ambiente
 */

export interface StripePriceConfig {
  slug: string
  name: string
  description: string
  priceIdMensal: string | null
  priceIdAnual: string | null
  priceMonthly: number
  priceYearly: number
  features: string[]
  popular?: boolean
  trial_days?: number
}

// Configuração dos planos com Price IDs
// Em produção, use variáveis de ambiente para os price_ids
export const STRIPE_PLANS: StripePriceConfig[] = [
  {
    slug: 'gratuito',
    name: 'Gratuito',
    description: 'Para começar sua jornada',
    priceIdMensal: null, // Plano gratuito não tem price_id
    priceIdAnual: null,
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Teste de Clareza (1x)',
      'Chat com IA (5 msgs/dia)',
      'Diário básico',
      'Conteúdo educativo'
    ],
    trial_days: 0
  },
  {
    slug: 'essencial',
    name: 'Essencial',
    description: 'Para quem quer mais clareza',
    priceIdMensal: process.env.STRIPE_PRICE_ESSENCIAL_MENSAL || 'price_essencial_mensal_test',
    priceIdAnual: process.env.STRIPE_PRICE_ESSENCIAL_ANUAL || 'price_essencial_anual_test',
    priceMonthly: 29.90,
    priceYearly: 287.00, // ~20% desconto
    features: [
      'Teste de Clareza ilimitado',
      'Chat com IA (50 msgs/dia)',
      'Diário completo com tags',
      'Timeline visual',
      'Exportação PDF'
    ],
    trial_days: 7
  },
  {
    slug: 'completo',
    name: 'Completo',
    description: 'Proteção total',
    priceIdMensal: process.env.STRIPE_PRICE_COMPLETO_MENSAL || 'price_completo_mensal_test',
    priceIdAnual: process.env.STRIPE_PRICE_COMPLETO_ANUAL || 'price_completo_anual_test',
    priceMonthly: 49.90,
    priceYearly: 479.00, // ~20% desconto
    features: [
      'Tudo do Essencial',
      'Chat ilimitado',
      'Plano de Segurança',
      'Alertas de risco',
      'Cadeia de custódia',
      'Suporte prioritário'
    ],
    popular: true,
    trial_days: 7
  },
  {
    slug: 'profissional',
    name: 'Profissional',
    description: 'Para psicólogos e advogados',
    priceIdMensal: process.env.STRIPE_PRICE_PROFISSIONAL_MENSAL || 'price_profissional_mensal_test',
    priceIdAnual: process.env.STRIPE_PRICE_PROFISSIONAL_ANUAL || 'price_profissional_anual_test',
    priceMonthly: 149.90,
    priceYearly: 1439.00, // ~20% desconto
    features: [
      'Tudo do Completo',
      'Até 20 clientes',
      'Dashboard profissional',
      'Relatórios para clientes',
      'Marca própria',
      'API de integração'
    ],
    trial_days: 14
  }
]

/**
 * Busca configuração de plano por slug
 */
export function getPlanConfig(slug: string): StripePriceConfig | undefined {
  return STRIPE_PLANS.find(p => p.slug === slug)
}

/**
 * Busca price_id por slug e período
 */
export function getPriceId(slug: string, periodo: 'mensal' | 'anual'): string | null {
  const plan = getPlanConfig(slug)
  if (!plan) return null
  return periodo === 'anual' ? plan.priceIdAnual : plan.priceIdMensal
}

/**
 * Valida se um price_id é de teste
 */
export function isTestPriceId(priceId: string): boolean {
  return priceId.includes('_test') || !priceId.startsWith('price_')
}

/**
 * Retorna todos os planos formatados para a frontpage
 */
export function getPlansForFrontpage() {
  return STRIPE_PLANS.map(plan => ({
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    features: plan.features,
    popular: plan.popular || false,
    hasTrial: (plan.trial_days || 0) > 0,
    trialDays: plan.trial_days || 0
  }))
}

/**
 * Sincroniza planos com o banco de dados (plan_catalog)
 */
export async function syncPlansToDatabase(supabase: any): Promise<{ success: boolean; synced: number }> {
  let synced = 0

  for (const plan of STRIPE_PLANS) {
    const { error } = await supabase
      .from('plan_catalog')
      .upsert({
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        stripe_price_id_mensal: plan.priceIdMensal,
        stripe_price_id_anual: plan.priceIdAnual,
        price_monthly: plan.priceMonthly,
        price_yearly: plan.priceYearly,
        features: plan.features,
        is_popular: plan.popular || false,
        trial_days: plan.trial_days || 0,
        active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'slug'
      })

    if (!error) synced++
  }

  return { success: synced === STRIPE_PLANS.length, synced }
}
