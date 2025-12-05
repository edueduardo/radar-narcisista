// API para gerenciamento de conteúdo específico (Admin)
// /api/admin/content/[id]

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Obter conteúdo específico
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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
      .from('content_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao obter conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar conteúdo
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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
    const {
      title,
      slug,
      summary,
      body: contentBody,
      type,
      source_type,
      tags,
      category,
      featured_image,
      external_url,
      visibility,
      status,
      meta_title,
      meta_description,
      scheduled_for
    } = body

    // Buscar conteúdo atual
    const { data: current } = await supabase
      .from('content_items')
      .select('status, published_at, published_by')
      .eq('id', id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    // Preparar dados de atualização
    const updateData: Record<string, unknown> = {}
    
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (summary !== undefined) updateData.summary = summary
    if (contentBody !== undefined) updateData.body = contentBody
    if (type !== undefined) updateData.type = type
    if (source_type !== undefined) updateData.source_type = source_type
    if (tags !== undefined) updateData.tags = tags
    if (category !== undefined) updateData.category = category
    if (featured_image !== undefined) updateData.featured_image = featured_image
    if (external_url !== undefined) updateData.external_url = external_url
    if (visibility !== undefined) updateData.visibility = visibility
    if (meta_title !== undefined) updateData.meta_title = meta_title
    if (meta_description !== undefined) updateData.meta_description = meta_description
    if (scheduled_for !== undefined) updateData.scheduled_for = scheduled_for

    // Se mudando para published pela primeira vez
    if (status !== undefined) {
      updateData.status = status
      if (status === 'published' && current.status !== 'published') {
        updateData.published_at = new Date().toISOString()
        updateData.published_by = user.id
      }
    }

    const { data, error } = await supabase
      .from('content_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover conteúdo
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Ações rápidas (publicar, arquivar, etc)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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
    const { action } = body

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'publish':
        updateData = {
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: user.id
        }
        break
      case 'unpublish':
        updateData = { status: 'draft' }
        break
      case 'archive':
        updateData = { status: 'archived' }
        break
      case 'increment_views':
        const { data: current } = await supabase
          .from('content_items')
          .select('view_count')
          .eq('id', id)
          .single()
        updateData = { view_count: (current?.view_count || 0) + 1 }
        break
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao executar ação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
