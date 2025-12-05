import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Insights da Fanpage - FANPAGE VIVA
 * 
 * GET /api/fanpage/insights - Busca insights públicos para frontpage
 * POST /api/fanpage/insights - Atualiza insight (admin/sistema)
 */

// GET - Busca insights públicos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const frontpageOnly = searchParams.get('frontpage') === 'true'
    const category = searchParams.get('category')
    
    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      isAdmin = profile?.role === 'admin'
    }
    
    let query = supabase
      .from('content_insights')
      .select('*')
    
    // Filtros
    if (!isAdmin) {
      query = query.eq('is_public', true)
    }
    
    if (frontpageOnly) {
      query = query.eq('show_on_frontpage', true)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    query = query.order('frontpage_order', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar insights:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar insights', details: error.message },
        { status: 500 }
      )
    }
    
    // Formatar para exibição
    const formatted = (data || []).map(insight => ({
      key: insight.insight_key,
      name: insight.display_name,
      description: insight.description,
      category: insight.category,
      value: insight.value_json,
      computedAt: insight.computed_at,
      order: insight.frontpage_order
    }))
    
    return NextResponse.json(formatted)
    
  } catch (error) {
    console.error('Erro na API de insights:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Atualiza insight (admin/sistema)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const body = await request.json()
    const { insight_key, value_json, display_name, description, category, is_public, show_on_frontpage, frontpage_order } = body
    
    if (!insight_key) {
      return NextResponse.json({ error: 'insight_key é obrigatório' }, { status: 400 })
    }
    
    // Upsert
    const { data, error } = await supabase
      .from('content_insights')
      .upsert({
        insight_key,
        value_json: value_json || {},
        display_name: display_name || insight_key,
        description: description || null,
        category: category || 'general',
        is_public: is_public ?? false,
        show_on_frontpage: show_on_frontpage ?? false,
        frontpage_order: frontpage_order ?? 0,
        computed_at: new Date().toISOString()
      }, {
        onConflict: 'insight_key'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar insight:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar insight', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erro na API de insights:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
