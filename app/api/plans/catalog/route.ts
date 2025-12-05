import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { STRIPE_PLANS, syncPlansToDatabase } from '@/lib/stripe-config'

/**
 * API de Catálogo de Planos
 * Integra frontpage com plan_catalog do banco
 * 
 * GET /api/plans/catalog - Lista planos ativos
 * POST /api/plans/catalog - Sincroniza planos (admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Tentar buscar do banco primeiro
    const { data: dbPlans, error } = await supabase
      .from('plan_catalog')
      .select('*')
      .eq('active', true)
      .order('price_monthly', { ascending: true })

    if (error || !dbPlans || dbPlans.length === 0) {
      // Fallback para configuração estática
      return NextResponse.json({
        source: 'static',
        plans: STRIPE_PLANS.map(plan => ({
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
      })
    }

    // Retornar do banco
    return NextResponse.json({
      source: 'database',
      plans: dbPlans.map(plan => ({
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.price_monthly,
        priceYearly: plan.price_yearly,
        features: plan.features || [],
        popular: plan.is_popular || false,
        hasTrial: (plan.trial_days || 0) > 0,
        trialDays: plan.trial_days || 0,
        featureProfileId: plan.feature_profile_id
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar planos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Sincronizar planos
    const result = await syncPlansToDatabase(supabase)

    return NextResponse.json({
      success: result.success,
      message: `${result.synced} planos sincronizados`,
      synced: result.synced
    })

  } catch (error) {
    console.error('Erro ao sincronizar planos:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar planos' },
      { status: 500 }
    )
  }
}
