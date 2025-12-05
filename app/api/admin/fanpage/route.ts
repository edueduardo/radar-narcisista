// API para configuração da Fanpage (Admin)
// /api/admin/fanpage

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Listar configurações da fanpage
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

    // Buscar configurações dos blocos
    const { data: blocks, error: blocksError } = await supabase
      .from('fanpage_config')
      .select('*')
      .order('display_order', { ascending: true })

    if (blocksError) throw blocksError

    // Buscar insights
    const { data: insights, error: insightsError } = await supabase
      .from('content_insights')
      .select('*')
      .order('frontpage_order', { ascending: true })

    if (insightsError) throw insightsError

    return NextResponse.json({
      blocks: blocks || [],
      insights: insights || []
    })

  } catch (error) {
    console.error('Erro ao listar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configuração de bloco
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
    const { block_key, ...updateData } = body

    if (!block_key) {
      return NextResponse.json({ error: 'block_key é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('fanpage_config')
      .update(updateData)
      .eq('block_key', block_key)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Reordenar blocos
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

    const body = await request.json()
    const { action, blocks } = body

    if (action === 'reorder' && Array.isArray(blocks)) {
      // Atualizar ordem de cada bloco
      for (let i = 0; i < blocks.length; i++) {
        await supabase
          .from('fanpage_config')
          .update({ display_order: i + 1 })
          .eq('block_key', blocks[i])
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })

  } catch (error) {
    console.error('Erro ao reordenar blocos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
