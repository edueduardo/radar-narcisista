import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT SUGGESTIONS (CRUD)
// Gerencia sugestões de conteúdo (IA ou manual) aguardando aprovação
// ============================================================================

/**
 * GET /api/admin/content/suggestions
 * Lista content_suggestions com filtros e paginação
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
    const status = searchParams.get('status') // pending, approved, rejected, edited, published
    const suggestionSource = searchParams.get('suggestion_source') // manual, ai_curator, ai_internal, user_submitted
    const search = searchParams.get('search')?.trim()
    const priority = searchParams.get('priority') // low, normal, high, urgent

    const offset = (page - 1) * pageSize

    // Construir query
    let query = supabaseAdmin
      .from('content_suggestions')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }
    if (suggestionSource) {
      query = query.eq('suggestion_source', suggestionSource)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (search) {
      query = query.or(`suggested_title_pt.ilike.%${search}%,original_url.ilike.%${search}%,original_title.ilike.%${search}%`)
    }

    // Ordenar por prioridade e data
    query = query
      .order('priority', { ascending: false }) // urgent primeiro
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[CONTENT SUGGESTIONS GET] Erro:', error)
      return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 })
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
    console.error('[CONTENT SUGGESTIONS GET] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * POST /api/admin/content/suggestions
 * Cria nova sugestão manual
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos mínimos
    if (!body.suggested_title_pt && !body.original_url) {
      return NextResponse.json(
        { error: 'Forneça ao menos suggested_title_pt ou original_url' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const insertData = {
      suggestion_source: body.suggestion_source || 'manual',
      source_id: body.source_id || null,
      original_url: body.original_url || null,
      original_title: body.original_title || null,
      original_content: body.original_content || null,
      suggested_title_pt: body.suggested_title_pt || null,
      suggested_summary_pt: body.suggested_summary_pt || null,
      suggested_body_pt: body.suggested_body_pt || null,
      suggested_type: body.suggested_type || 'article',
      suggested_topics: body.suggested_topics || [],
      ai_relevance_score: body.ai_relevance_score || null,
      ai_quality_score: body.ai_quality_score || null,
      ai_reasoning: body.ai_reasoning || null,
      status: 'pending',
      priority: body.priority || 'normal',
      admin_notes: body.admin_notes || null,
      created_at: now,
      updated_at: now
    }

    const { data, error } = await supabaseAdmin
      .from('content_suggestions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[CONTENT SUGGESTIONS POST] Erro:', error)
      return NextResponse.json({ error: 'Erro ao criar sugestão' }, { status: 500 })
    }

    console.log('[CONTENT SUGGESTIONS] Criada:', data.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[CONTENT SUGGESTIONS POST] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
