import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT COLLECTIONS (CRUD)
// Gerencia coleções/trilhas de conteúdo (Radar Academy)
// ============================================================================

/**
 * GET /api/admin/content/collections
 * Lista content_collections com filtros e paginação
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
    const collectionType = searchParams.get('collection_type') // trail, series, topic, featured
    const featured = searchParams.get('featured') // true/false
    const premium = searchParams.get('premium') // true/false

    const offset = (page - 1) * pageSize

    // Construir query
    let query = supabaseAdmin
      .from('content_collections')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (visibility) {
      query = query.eq('visibility', visibility)
    }
    if (collectionType) {
      query = query.eq('collection_type', collectionType)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    if (premium === 'true') {
      query = query.eq('is_premium', true)
    }

    // Ordenar e paginar
    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[CONTENT COLLECTIONS GET] Erro:', error)
      return NextResponse.json({ error: 'Erro ao buscar coleções' }, { status: 500 })
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
    console.error('[CONTENT COLLECTIONS GET] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * POST /api/admin/content/collections
 * Cria nova coleção
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.slug || !body.name_pt) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: slug, name_pt' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const { data: existing } = await supabaseAdmin
      .from('content_collections')
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
      collection_type: body.collection_type || 'trail',
      name_pt: body.name_pt,
      name_en: body.name_en || null,
      name_es: body.name_es || null,
      description_pt: body.description_pt || null,
      description_en: body.description_en || null,
      description_es: body.description_es || null,
      icon: body.icon || 'BookOpen',
      color: body.color || 'purple',
      cover_image_url: body.cover_image_url || null,
      target_audience: body.target_audience || 'all',
      difficulty_level: body.difficulty_level || 'beginner',
      estimated_duration_minutes: body.estimated_duration_minutes || null,
      visibility: body.visibility || 'draft',
      is_featured: body.is_featured || false,
      is_premium: body.is_premium || false,
      required_plan_code: body.required_plan_code || null,
      sort_order: body.sort_order || 0,
      item_count: 0,
      created_at: now,
      updated_at: now,
      created_by: auth.user?.id || null
    }

    const { data, error } = await supabaseAdmin
      .from('content_collections')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[CONTENT COLLECTIONS POST] Erro:', error)
      return NextResponse.json({ error: 'Erro ao criar coleção' }, { status: 500 })
    }

    console.log('[CONTENT COLLECTIONS] Criada:', data.id, data.slug)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[CONTENT COLLECTIONS POST] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
