// API para gerenciamento de conteúdos (Admin)
// /api/admin/content

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Listar conteúdos (com filtros)
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

    // Parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // draft, published, archived, scheduled
    const type = searchParams.get('type') // article, news, faq, stat, external_link, video
    const visibility = searchParams.get('visibility') // public, premium, professional, admin
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Query base
    let query = supabase
      .from('content_items')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Aplicar filtros
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (visibility) query = query.eq('visibility', visibility)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      items: data,
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('Erro ao listar conteúdos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo conteúdo
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
    const {
      title,
      slug,
      summary,
      body: contentBody,
      type = 'article',
      source_type = 'manual',
      tags = [],
      category,
      featured_image,
      external_url,
      visibility = 'public',
      status = 'draft',
      meta_title,
      meta_description,
      scheduled_for
    } = body

    // Validações
    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    // Gerar slug se não fornecido
    const finalSlug = slug || title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Verificar se slug já existe
    const { data: existing } = await supabase
      .from('content_items')
      .select('id')
      .eq('slug', finalSlug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 400 })
    }

    // Criar conteúdo
    const { data, error } = await supabase
      .from('content_items')
      .insert({
        title,
        slug: finalSlug,
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
        meta_title: meta_title || title,
        meta_description: meta_description || summary,
        scheduled_for,
        created_by: user.id,
        published_by: status === 'published' ? user.id : null,
        published_at: status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
