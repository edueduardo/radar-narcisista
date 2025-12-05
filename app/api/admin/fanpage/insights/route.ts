// API para gerenciamento de insights (Admin)
// /api/admin/fanpage/insights

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Listar insights
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('content_insights')
      .select('*')
      .order('frontpage_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])

  } catch (error) {
    console.error('Erro ao listar insights:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar insight
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { insight_key, ...updateData } = body

    if (!insight_key) {
      return NextResponse.json({ error: 'insight_key é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content_insights')
      .update(updateData)
      .eq('insight_key', insight_key)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao atualizar insight:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Recalcular insights (job manual)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação e role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Calcular métricas agregadas
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Total de testes
    const { count: totalTests } = await supabase
      .from('clarity_tests')
      .select('*', { count: 'exact', head: true })

    // Ativos hoje (usuários que fizeram algo nas últimas 24h)
    const { count: activeToday } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', today.toISOString())

    // Score médio de clareza
    const { data: avgData } = await supabase
      .from('clarity_tests')
      .select('score')
    
    const avgScore = avgData && avgData.length > 0
      ? Math.round(avgData.reduce((sum, t) => sum + (t.score || 0), 0) / avgData.length)
      : 0

    // Atualizar insights
    const updates = [
      { insight_key: 'total_users', value_json: { value: totalUsers || 0, trend: 'up', change: 0 } },
      { insight_key: 'total_tests', value_json: { value: totalTests || 0, trend: 'up', change: 0 } },
      { insight_key: 'active_today', value_json: { value: activeToday || 0, trend: 'stable', change: 0 } },
      { insight_key: 'avg_clarity_score', value_json: { value: avgScore, trend: 'stable', change: 0 } }
    ]

    for (const update of updates) {
      await supabase
        .from('content_insights')
        .update({ value_json: update.value_json })
        .eq('insight_key', update.insight_key)
    }

    return NextResponse.json({ 
      success: true, 
      calculated: {
        total_users: totalUsers,
        total_tests: totalTests,
        active_today: activeToday,
        avg_clarity_score: avgScore
      }
    })

  } catch (error) {
    console.error('Erro ao recalcular insights:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
