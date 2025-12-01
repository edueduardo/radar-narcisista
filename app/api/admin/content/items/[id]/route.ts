import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT ITEMS [ID] (GET, PATCH, DELETE)
// ============================================================================

/**
 * GET /api/admin/content/items/[id]
 * Retorna um content_item específico
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
      .from('content_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[CONTENT ITEMS GET ID] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/content/items/[id]
 * Atualiza um content_item existente
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

    // Verificar se item existe
    const { data: existing } = await supabaseAdmin
      .from('content_items')
      .select('id, visibility, published_at')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    // Se slug está sendo alterado, verificar unicidade
    if (body.slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('content_items')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .single()

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug já existe. Escolha outro.' },
          { status: 400 }
        )
      }
    }

    const now = new Date().toISOString()

    // Campos permitidos para atualização
    const updateData: Record<string, any> = {
      updated_at: now
    }

    const allowedFields = [
      'slug', 'content_type', 'source_type', 'source_id', 'original_url',
      'title_pt', 'title_en', 'title_es',
      'summary_pt', 'summary_en', 'summary_es',
      'body_pt', 'body_en', 'body_es',
      'cover_image_url', 'thumbnail_url', 'media_type', 'media_url',
      'topics', 'target_audience', 'difficulty_level', 'reading_time_minutes',
      'visibility', 'is_featured', 'is_pinned',
      'meta_title', 'meta_description', 'sort_order'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Se mudou para public e não tinha published_at, definir agora
    if (body.visibility === 'public' && !existing.published_at) {
      updateData.published_at = now
      updateData.approved_by = auth.user?.id || null
      updateData.approved_at = now
    }

    const { data, error } = await supabaseAdmin
      .from('content_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[CONTENT ITEMS PATCH] Erro:', error)
      return NextResponse.json({ error: 'Erro ao atualizar conteúdo' }, { status: 500 })
    }

    console.log('[CONTENT ITEMS] Atualizado:', id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[CONTENT ITEMS PATCH] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/content/items/[id]
 * Arquiva um content_item (soft delete via visibility='archived')
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

    // Verificar se item existe
    const { data: existing } = await supabaseAdmin
      .from('content_items')
      .select('id, slug')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    // Soft delete: marcar como archived
    const { error } = await supabaseAdmin
      .from('content_items')
      .update({
        visibility: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('[CONTENT ITEMS DELETE] Erro:', error)
      return NextResponse.json({ error: 'Erro ao arquivar conteúdo' }, { status: 500 })
    }

    console.log('[CONTENT ITEMS] Arquivado:', id, existing.slug)

    return NextResponse.json({ success: true, message: 'Conteúdo arquivado' })
  } catch (error) {
    console.error('[CONTENT ITEMS DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
