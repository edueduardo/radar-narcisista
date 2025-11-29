/**
 * INTEGRAÇÃO STRIPE - RADAR NARCISISTA
 * Sistema de pagamentos e assinaturas
 * 
 * BACKUP: Criado em 24/11/2025 23:05
 * LOCAL: lib/stripe.ts
 */

import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// ============================================
// CONFIGURAÇÃO
// ============================================

// Cliente Stripe (server-side) - inicializado apenas quando a key existe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { typescript: true })
  : null

// Helper para verificar se Stripe esta configurado
export const isStripeConfigured = () => !!stripeSecretKey

// Cliente Stripe (client-side)
export const getStripePromise = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
}

// ============================================
// PLANOS DE ASSINATURA
// ============================================

export const PLANOS = {
  GRATUITO: {
    id: 'gratuito',
    nome: 'Gratuito',
    preco: 0,
    periodo: 'forever',
    features: [
      'Teste de Clareza (1x)',
      'Diário (3 entradas/mês)',
      'Chat IA (5 mensagens/dia)',
      'Recursos de emergência',
    ],
    limites: {
      testes_mes: 1,
      entradas_diario_mes: 3,
      mensagens_chat_dia: 5,
      exportar_pdf: false,
      historico_completo: false,
    }
  },
  ESSENCIAL: {
    id: 'essencial',
    nome: 'Essencial',
    preco: 29.90,
    precoAnual: 299.00, // ~R$25/mês
    stripePriceIdMensal: process.env.STRIPE_PRICE_ESSENCIAL_MENSAL || '',
    stripePriceIdAnual: process.env.STRIPE_PRICE_ESSENCIAL_ANUAL || '',
    periodo: 'month',
    features: [
      'Testes ilimitados',
      'Diário ilimitado',
      'Chat IA (50 mensagens/dia)',
      'Exportar PDF',
      'Histórico completo',
      'Análise de padrões IA',
    ],
    limites: {
      testes_mes: -1, // ilimitado
      entradas_diario_mes: -1,
      mensagens_chat_dia: 50,
      exportar_pdf: true,
      historico_completo: true,
    }
  },
  PREMIUM: {
    id: 'premium',
    nome: 'Premium',
    preco: 49.90,
    precoAnual: 499.00, // ~R$42/mês
    stripePriceIdMensal: process.env.STRIPE_PRICE_PREMIUM_MENSAL || '',
    stripePriceIdAnual: process.env.STRIPE_PRICE_PREMIUM_ANUAL || '',
    periodo: 'month',
    popular: true,
    features: [
      'Tudo do Essencial',
      'Chat IA ilimitado',
      'Múltiplas IAs colaborativas',
      'Relatórios avançados',
      'Prioridade no suporte',
      'Acesso antecipado a novidades',
    ],
    limites: {
      testes_mes: -1,
      entradas_diario_mes: -1,
      mensagens_chat_dia: -1,
      exportar_pdf: true,
      historico_completo: true,
      ias_colaborativas: true,
    }
  }
}

export type PlanoId = keyof typeof PLANOS

// ============================================
// FUNÇÕES DE CHECKOUT
// ============================================

/**
 * Cria uma sessão de checkout no Stripe
 */
export async function criarCheckoutSession({
  planoId,
  periodo,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  planoId: 'essencial' | 'premium'
  periodo: 'mensal' | 'anual'
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}): Promise<{ sessionId: string; url: string } | null> {
  try {
    if (!stripe) {
      console.error('Stripe nao configurado')
      return null
    }

    const plano = planoId === 'essencial' ? PLANOS.ESSENCIAL : PLANOS.PREMIUM
    const priceId = periodo === 'mensal' ? plano.stripePriceIdMensal : plano.stripePriceIdAnual

    if (!priceId) {
      console.error('Price ID nao configurado para:', planoId, periodo)
      return null
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planoId,
        periodo,
      },
      subscription_data: {
        metadata: {
          userId,
          planoId,
        },
      },
      // Configurações para Brasil
      locale: 'pt-BR',
      allow_promotion_codes: true,
    })

    return {
      sessionId: session.id,
      url: session.url || '',
    }
  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    return null
  }
}

/**
 * Cria portal do cliente para gerenciar assinatura
 */
export async function criarPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<string | null> {
  try {
    if (!stripe) {
      console.error('Stripe nao configurado')
      return null
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session.url
  } catch (error) {
    console.error('Erro ao criar portal session:', error)
    return null
  }
}

/**
 * Busca assinatura ativa do usuário
 */
export async function buscarAssinaturaAtiva(customerId: string) {
  try {
    if (!stripe) return null
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    return subscriptions.data[0] || null
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error)
    return null
  }
}

/**
 * Cancela assinatura
 */
export async function cancelarAssinatura(subscriptionId: string) {
  try {
    if (!stripe) return null
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return subscription
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    return null
  }
}

/**
 * Reativa assinatura cancelada
 */
export async function reativarAssinatura(subscriptionId: string) {
  try {
    if (!stripe) return null
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return subscription
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error)
    return null
  }
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

export const webhookHandlers = {
  'checkout.session.completed': async (session: Stripe.Checkout.Session) => {
    console.log('✅ Checkout completado:', session.id)
    // Atualizar usuário no banco com plano ativo
    const userId = session.client_reference_id
    const planoId = session.metadata?.planoId
    
    // TODO: Atualizar no Supabase
    console.log(`Usuário ${userId} assinou plano ${planoId}`)
  },

  'customer.subscription.updated': async (subscription: Stripe.Subscription) => {
    console.log('🔄 Assinatura atualizada:', subscription.id)
    // Atualizar status no banco
  },

  'customer.subscription.deleted': async (subscription: Stripe.Subscription) => {
    console.log('❌ Assinatura cancelada:', subscription.id)
    // Reverter usuário para plano gratuito
  },

  'invoice.payment_failed': async (invoice: Stripe.Invoice) => {
    console.log('⚠️ Pagamento falhou:', invoice.id)
    // Notificar usuário
  },
}

// ============================================
// HELPERS
// ============================================

/**
 * Verifica se usuário tem acesso a uma feature
 */
export function temAcesso(planoAtual: PlanoId, feature: string): boolean {
  const plano = PLANOS[planoAtual]
  if (!plano) return false

  switch (feature) {
    case 'exportar_pdf':
      return plano.limites.exportar_pdf === true
    case 'historico_completo':
      return plano.limites.historico_completo === true
    case 'ias_colaborativas':
      return 'ias_colaborativas' in plano.limites && plano.limites.ias_colaborativas === true
    default:
      return true
  }
}

/**
 * Verifica limite de uso
 */
export function dentroDoLimite(
  planoAtual: PlanoId, 
  tipo: 'testes' | 'entradas' | 'mensagens',
  usoAtual: number
): boolean {
  const plano = PLANOS[planoAtual]
  if (!plano) return false

  let limite: number
  switch (tipo) {
    case 'testes':
      limite = plano.limites.testes_mes
      break
    case 'entradas':
      limite = plano.limites.entradas_diario_mes
      break
    case 'mensagens':
      limite = plano.limites.mensagens_chat_dia
      break
    default:
      return true
  }

  // -1 = ilimitado
  if (limite === -1) return true
  return usoAtual < limite
}

/**
 * Formata preço em BRL
 */
export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}
