import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

/**
 * API para buscar planos do plan_catalog
 * TAREFA 10 - Integrar frontpage com plan_catalog dinamicamente
 * 
 * @see database/sql_consolidado/SQL_CONSOLIDADO_01_BASE.sql
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 10
 */

// Tipo para plano do catálogo
interface PlanCatalogRow {
  id: string
  plan_key: string
  name: string
  description: string | null
  price_monthly: number
  price_yearly: number
  currency: string
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  features: Record<string, boolean>
  limits: Record<string, number>
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Tipo para resposta formatada
interface FormattedPlan {
  id: string
  key: string
  name: string
  description: string
  price: number
  priceAnnual: number
  currency: string
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  features: string[]
  limits: {
    clarityTestsPerMonth: number
    journalEntriesPerMonth: number
    chatMessagesPerMonth: number
    clientsLimit?: number
  }
  isActive: boolean
  displayOrder: number
  // Campos derivados para compatibilidade com UI
  isFree: boolean
  isPopular: boolean
  icon: string
  color: string
  bgColor: string
}

// Mapear features para lista de strings legíveis
function formatFeatures(features: Record<string, boolean>): string[] {
  const featureLabels: Record<string, string> = {
    clarity_test: 'Teste de Clareza',
    journal: 'Diário de Emoções',
    chat: 'Chat com IA',
    safety_plan: 'Plano de Segurança',
    pdf_export: 'Exportar PDF',
    voice_input: 'Entrada por Voz',
    client_management: 'Gestão de Clientes',
    reports: 'Relatórios Avançados'
  }
  
  return Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => featureLabels[key] || key)
}

// Obter ícone baseado no plano
function getPlanIcon(planKey: string): string {
  const icons: Record<string, string> = {
    free: '🆓',
    basic: '⚡',
    premium: '👑',
    professional: '🏢'
  }
  return icons[planKey] || '📦'
}

// Obter cor baseado no plano
function getPlanColor(planKey: string): string {
  const colors: Record<string, string> = {
    free: 'gray',
    basic: 'blue',
    premium: 'yellow',
    professional: 'purple'
  }
  return colors[planKey] || 'gray'
}

// Obter bgColor baseado no plano
function getPlanBgColor(planKey: string): string {
  const bgColors: Record<string, string> = {
    free: 'bg-gray-500/20',
    basic: 'bg-blue-500/20',
    premium: 'bg-yellow-500/20',
    professional: 'bg-purple-500/20'
  }
  return bgColors[planKey] || 'bg-gray-500/20'
}

// GET /api/plan-catalog - Retorna planos do catálogo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    
    const supabase = await createServerComponentClient()
    
    // Buscar planos do catálogo
    let query = supabase
      .from('plan_catalog')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data: plans, error } = await query
    
    if (error) {
      console.error('Erro ao buscar plan_catalog:', error)
      return NextResponse.json({ 
        plans: [], 
        source: 'error',
        error: error.message 
      }, { status: 500 })
    }
    
    if (!plans || plans.length === 0) {
      return NextResponse.json({ 
        plans: [], 
        source: 'empty' 
      })
    }
    
    // Formatar planos para o frontend
    const formattedPlans: FormattedPlan[] = plans.map((plan: PlanCatalogRow) => ({
      id: plan.id,
      key: plan.plan_key,
      name: plan.name,
      description: plan.description || '',
      price: plan.price_monthly / 100, // Converter centavos para reais
      priceAnnual: plan.price_yearly / 100,
      currency: plan.currency,
      stripePriceIdMonthly: plan.stripe_price_id_monthly,
      stripePriceIdYearly: plan.stripe_price_id_yearly,
      features: formatFeatures(plan.features || {}),
      limits: {
        clarityTestsPerMonth: plan.limits?.clarity_tests_per_month ?? 0,
        journalEntriesPerMonth: plan.limits?.journal_entries_per_month ?? 0,
        chatMessagesPerMonth: plan.limits?.chat_messages_per_month ?? 0,
        clientsLimit: plan.limits?.clients_limit
      },
      isActive: plan.is_active,
      displayOrder: plan.display_order,
      // Campos derivados
      isFree: plan.price_monthly === 0,
      isPopular: plan.plan_key === 'premium',
      icon: getPlanIcon(plan.plan_key),
      color: getPlanColor(plan.plan_key),
      bgColor: getPlanBgColor(plan.plan_key)
    }))
    
    return NextResponse.json({
      plans: formattedPlans,
      source: 'database',
      count: formattedPlans.length
    })
    
  } catch (error) {
    console.error('Erro na API plan-catalog:', error)
    return NextResponse.json({ 
      plans: [], 
      source: 'error',
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
