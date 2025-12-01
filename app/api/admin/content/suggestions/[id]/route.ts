import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT SUGGESTIONS [ID] (GET, PATCH, DELETE)
// ============================================================================

/**
 * GET /api/admin/content/suggestions/[id]
 * Retorna uma sugestão específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('content_suggestions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Sugestão não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[CONTENT SUGGESTIONS GET ID] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/content/suggestions/[id]
 * Atualiza uma sugestão (status, review, etc.)
 * Se publish_now=true e status=approved, cria content_item automaticamente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verificar se sugestão existe
    const { data: existing } = await supabaseAdmin
      .from('content_suggestions')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Sugestão não encontrada' }, { status: 404 })
    }

    const now = new Date().toISOString()

    // Campos permitidos para atualização
    const updateData: Record<string, any> = {
      updated_at: now
    }

    const allowedFields = [
      'suggested_title_pt', 'suggested_summary_pt', 'suggested_body_pt',
      'suggested_type', 'suggested_topics',
      'status', 'priority', 'admin_notes', 'rejection_reason'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Se status mudou para approved/rejected/published, registrar reviewer
    if (body.status && ['approved', 'rejected', 'published'].includes(body.status)) {
      updateData.reviewed_by = auth.user?.id || null
      updateData.reviewed_at = now
    }

    // Se publish_now=true e status=approved ou published, criar content_item
    let publishedItem = null
    if (body.publish_now && (body.status === 'approved' || body.status === 'published')) {
      // Gerar slug único
      const baseSlug = (existing.suggested_title_pt || 'conteudo')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
      
      const slug = `${baseSlug}-${Date.now().toString(36)}`

      const itemData = {
        slug,
        content_type: existing.suggested_type || 'article',
        source_type: existing.suggestion_source === 'ai_curator' ? 'ai_generated' : 'internal',
        original_url: existing.original_url,
        title_pt: existing.suggested_title_pt || existing.original_title || 'Sem título',
        summary_pt: existing.suggested_summary_pt,
        body_pt: existing.suggested_body_pt,
        topics: existing.suggested_topics || [],
        visibility: 'public',
        is_featured: false,
        published_at: now,
        created_at: now,
        updated_at: now,
        created_by: auth.user?.id || null,
        approved_by: auth.user?.id || null,
        approved_at: now
      }

      const { data: newItem, error: itemError } = await supabaseAdmin
        .from('content_items')
        .insert(itemData)
        .select()
        .single()

      if (itemError) {
        console.error('[CONTENT SUGGESTIONS] Erro ao criar item:', itemError)
        return NextResponse.json({ error: 'Erro ao publicar conteúdo' }, { status: 500 })
      }

      publishedItem = newItem
      updateData.published_item_id = newItem.id
      updateData.status = 'published'

      console.log('[CONTENT SUGGESTIONS] Item publicado:', newItem.id, newItem.slug)
    }

    // Atualizar sugestão
    const { data, error } = await supabaseAdmin
      .from('content_suggestions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[CONTENT SUGGESTIONS PATCH] Erro:', error)
      return NextResponse.json({ error: 'Erro ao atualizar sugestão' }, { status: 500 })
    }

    console.log('[CONTENT SUGGESTIONS] Atualizada:', id, 'status:', data.status)

    return NextResponse.json({
      success: true,
      data,
      publishedItem
    })
  } catch (error) {
    console.error('[CONTENT SUGGESTIONS PATCH] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/content/suggestions/[id]
 * Remove uma sugestão (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id } = await params

    // Verificar se sugestão existe
    const { data: existing } = await supabaseAdmin
      .from('content_suggestions')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Sugestão não encontrada' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('content_suggestions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[CONTENT SUGGESTIONS DELETE] Erro:', error)
      return NextResponse.json({ error: 'Erro ao remover sugestão' }, { status: 500 })
    }

    console.log('[CONTENT SUGGESTIONS] Removida:', id)

    return NextResponse.json({ success: true, message: 'Sugestão removida' })
  } catch (error) {
    console.error('[CONTENT SUGGESTIONS DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
