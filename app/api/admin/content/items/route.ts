import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT ITEMS (CRUD)
// Gerencia conteúdos publicados (artigos, FAQs, notícias, lições)
// ============================================================================

/**
 * GET /api/admin/content/items
 * Lista content_items com filtros e paginação
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const visibility = searchParams.get('visibility') // draft, private, public, archived
    const contentType = searchParams.get('content_type') // article, faq, news, lesson, tip, story, resource
    const sourceType = searchParams.get('source_type') // internal, external_curated, ai_generated
    const search = searchParams.get('search')?.trim()
    const topics = searchParams.get('topics') // comma-separated
    const featured = searchParams.get('featured') // true/false

    const offset = (page - 1) * pageSize

    // Construir query
    let query = supabaseAdmin
      .from('content_items')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (visibility) {
      query = query.eq('visibility', visibility)
    }
    if (contentType) {
      query = query.eq('content_type', contentType)
    }
    if (sourceType) {
      query = query.eq('source_type', sourceType)
    }
    if (search) {
      query = query.or(`title_pt.ilike.%${search}%,summary_pt.ilike.%${search}%`)
    }
    if (topics) {
      const topicsArray = topics.split(',').map(t => t.trim())
      query = query.overlaps('topics', topicsArray)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    // Ordenar e paginar
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[CONTENT ITEMS GET] Erro:', error)
      return NextResponse.json({ error: 'Erro ao buscar conteúdos' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('[CONTENT ITEMS GET] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * POST /api/admin/content/items
 * Cria novo content_item
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.slug || !body.title_pt) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: slug, title_pt' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const { data: existing } = await supabaseAdmin
      .from('content_items')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Slug já existe. Escolha outro.' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const insertData = {
      slug: body.slug,
      content_type: body.content_type || 'article',
      source_type: body.source_type || 'internal',
      source_id: body.source_id || null,
      original_url: body.original_url || null,
      title_pt: body.title_pt,
      title_en: body.title_en || null,
      title_es: body.title_es || null,
      summary_pt: body.summary_pt || null,
      summary_en: body.summary_en || null,
      summary_es: body.summary_es || null,
      body_pt: body.body_pt || null,
      body_en: body.body_en || null,
      body_es: body.body_es || null,
      cover_image_url: body.cover_image_url || null,
      thumbnail_url: body.thumbnail_url || null,
      media_type: body.media_type || null,
      media_url: body.media_url || null,
      topics: body.topics || [],
      target_audience: body.target_audience || 'all',
      difficulty_level: body.difficulty_level || 'beginner',
      reading_time_minutes: body.reading_time_minutes || 5,
      visibility: body.visibility || 'draft',
      is_featured: body.is_featured || false,
      is_pinned: body.is_pinned || false,
      published_at: body.visibility === 'public' ? now : null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      sort_order: body.sort_order || 0,
      created_at: now,
      updated_at: now,
      created_by: auth.user?.id || null
    }

    const { data, error } = await supabaseAdmin
      .from('content_items')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[CONTENT ITEMS POST] Erro:', error)
      return NextResponse.json({ error: 'Erro ao criar conteúdo' }, { status: 500 })
    }

    console.log('[CONTENT ITEMS] Criado:', data.id, data.slug)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[CONTENT ITEMS POST] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
