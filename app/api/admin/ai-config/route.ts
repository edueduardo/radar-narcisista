/**
 * API Admin: AI Config
 * BLOCO 31-35 - ETAPA 32
 * 
 * Endpoints para gerenciar configuração de IAs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// GET - Obter configuração completa
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Obter parâmetros
    const { searchParams } = new URL(request.url)
    const planKey = searchParams.get('plan_key')
    const featureSlug = searchParams.get('feature_slug')
    const perfil = searchParams.get('perfil')

    // Buscar providers
    const { data: providers } = await supabase
      .from('ai_providers_core')
      .select('*')
      .order('display_name')

    // Buscar features
    const { data: features } = await supabase
      .from('ai_features_core')
      .select('*')
      .order('display_name')

    // Buscar matrix com filtros
    let matrixQuery = supabase
      .from('ai_plan_matrix')
      .select(`
        *,
        feature:ai_features_core(*),
        provider:ai_providers_core(*)
      `)

    if (planKey) matrixQuery = matrixQuery.eq('plan_key', planKey)
    if (perfil) matrixQuery = matrixQuery.eq('perfil', perfil)

    const { data: matrix } = await matrixQuery

    // Buscar overrides
    const { data: overrides } = await supabase
      .from('ai_group_overrides')
      .select(`
        *,
        feature:ai_features_core(*),
        provider:ai_providers_core(*)
      `)
      .eq('ativo', true)

    return NextResponse.json({
      providers: providers || [],
      features: features || [],
      matrix: matrix || [],
      overrides: overrides || []
    })

  } catch (error) {
    console.error('[API] Erro ao obter config:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

// POST - Atualizar configuração
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update_provider_status': {
        const { providerId, status } = data
        const { error } = await supabase
          .from('ai_providers_core')
          .update({ status })
          .eq('id', providerId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'update_matrix': {
        const { planKey, featureId, providerId, perfil, ativo, limiteDiario, limiteMensal } = data
        
        // Upsert na matrix
        const { error } = await supabase
          .from('ai_plan_matrix')
          .upsert({
            plan_key: planKey,
            feature_id: featureId,
            provider_id: providerId,
            perfil,
            papel: 'geracao',
            ativo,
            limite_diario: limiteDiario,
            limite_mensal: limiteMensal,
            origem: 'padrao'
          }, {
            onConflict: 'plan_key,feature_id,provider_id,perfil,papel'
          })

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'create_override': {
        const { groupKey, planKeyBase, featureId, providerId, perfil, limiteDiario, limiteMensal, validoAte, userId } = data
        
        const { error } = await supabase
          .from('ai_group_overrides')
          .insert({
            group_key: groupKey,
            plan_key_base: planKeyBase,
            feature_id: featureId,
            provider_id: providerId,
            perfil,
            papel: 'geracao',
            limite_diario: limiteDiario,
            limite_mensal: limiteMensal,
            valido_ate: validoAte,
            user_id: userId,
            ativo: true
          })

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'delete_override': {
        const { overrideId } = data
        const { error } = await supabase
          .from('ai_group_overrides')
          .delete()
          .eq('id', overrideId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

  } catch (error) {
    console.error('[API] Erro ao atualizar config:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
