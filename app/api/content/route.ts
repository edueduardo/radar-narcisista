import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Conteúdos - FANPAGE VIVA
 * 
 * GET /api/content - Lista conteúdos publicados
 * POST /api/content - Cria novo conteúdo (admin)
 */

// GET - Lista conteúdos publicados
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') // article, news, faq, stat, external_link
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') || 'published'
    
    // Verificar se é admin para ver todos os status
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
    
    // Query base
    let query = supabase
      .from('content_items')
      .select('*', { count: 'exact' })
    
    // Filtros
    if (!isAdmin) {
      // Usuários normais só veem publicados e públicos
      query = query
        .eq('status', 'published')
        .eq('visibility', 'public')
    } else if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    if (tag) {
      query = query.contains('tags', [tag])
    }
    
    // Ordenação e paginação
    query = query
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar conteúdos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar conteúdos', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      items: data || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    })
    
  } catch (error) {
    console.error('Erro na API de conteúdos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Cria novo conteúdo (admin only)
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
    
    // Validação básica
    if (!body.title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }
    
    // Gerar slug se não fornecido
    const slug = body.slug || generateSlug(body.title)
    
    // Preparar dados
    const contentData = {
      slug,
      title: body.title,
      summary: body.summary || null,
      body: body.body || null,
      type: body.type || 'article',
      source_type: body.source_type || 'manual',
      tags: body.tags || [],
      category: body.category || null,
      featured_image: body.featured_image || null,
      external_url: body.external_url || null,
      visibility: body.visibility || 'public',
      status: body.status || 'draft',
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      created_by: user.id,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      published_by: body.status === 'published' ? user.id : null
    }
    
    const { data, error } = await supabase
      .from('content_items')
      .insert(contentData)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar conteúdo:', error)
      return NextResponse.json(
        { error: 'Erro ao criar conteúdo', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de conteúdos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para gerar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
    .substring(0, 100) // Limita tamanho
    + '-' + Date.now().toString(36) // Adiciona timestamp para unicidade
}
