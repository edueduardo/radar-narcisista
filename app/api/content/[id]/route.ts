import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Conteúdo Individual - FANPAGE VIVA
 * 
 * GET /api/content/[id] - Busca conteúdo por ID ou slug
 * PUT /api/content/[id] - Atualiza conteúdo (admin)
 * DELETE /api/content/[id] - Remove conteúdo (admin)
 */

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Busca conteúdo por ID ou slug
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id } = await params
    
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
    
    // Buscar por ID ou slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let query = supabase
      .from('content_items')
      .select('*')
    
    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }
    
    const { data, error } = await query.single()
    
    if (error || !data) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }
    
    // Verificar permissão
    if (!isAdmin && (data.status !== 'published' || data.visibility !== 'public')) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }
    
    // Incrementar view_count para conteúdos públicos
    if (data.status === 'published' && !isAdmin) {
      await supabase
        .from('content_items')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualiza conteúdo (admin only)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id } = await params
    
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
    
    // Buscar conteúdo atual
    const { data: current } = await supabase
      .from('content_items')
      .select('status')
      .eq('id', id)
      .single()
    
    if (!current) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }
    
    // Preparar dados de atualização
    const updateData: Record<string, any> = {}
    
    const allowedFields = [
      'title', 'summary', 'body', 'type', 'source_type', 'tags',
      'category', 'featured_image', 'external_url', 'visibility',
      'status', 'meta_title', 'meta_description', 'scheduled_for'
    ]
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Se mudou para published, atualizar published_at e published_by
    if (body.status === 'published' && current.status !== 'published') {
      updateData.published_at = new Date().toISOString()
      updateData.published_by = user.id
    }
    
    const { data, error } = await supabase
      .from('content_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar conteúdo:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar conteúdo', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erro na API de conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remove conteúdo (admin only)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createRouteHandlerClient()
    const { id } = await params
    
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
    
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao deletar conteúdo:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar conteúdo', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro na API de conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
