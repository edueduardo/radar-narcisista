import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT COLLECTIONS [ID] (GET, PATCH, DELETE)
// ============================================================================

/**
 * GET /api/admin/content/collections/[id]
 * Retorna uma coleção específica
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
      .from('content_collections')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[CONTENT COLLECTIONS GET ID] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/content/collections/[id]
 * Atualiza uma coleção existente
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

    // Verificar se coleção existe
    const { data: existing } = await supabaseAdmin
      .from('content_collections')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Se slug está sendo alterado, verificar unicidade
    if (body.slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('content_collections')
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
      'slug', 'collection_type',
      'name_pt', 'name_en', 'name_es',
      'description_pt', 'description_en', 'description_es',
      'icon', 'color', 'cover_image_url',
      'target_audience', 'difficulty_level', 'estimated_duration_minutes',
      'visibility', 'is_featured', 'is_premium', 'required_plan_code',
      'sort_order'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const { data, error } = await supabaseAdmin
      .from('content_collections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[CONTENT COLLECTIONS PATCH] Erro:', error)
      return NextResponse.json({ error: 'Erro ao atualizar coleção' }, { status: 500 })
    }

    console.log('[CONTENT COLLECTIONS] Atualizada:', id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[CONTENT COLLECTIONS PATCH] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/content/collections/[id]
 * Arquiva uma coleção (soft delete via visibility='archived')
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

    // Verificar se coleção existe
    const { data: existing } = await supabaseAdmin
      .from('content_collections')
      .select('id, slug')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Soft delete: marcar como archived
    const { error } = await supabaseAdmin
      .from('content_collections')
      .update({
        visibility: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('[CONTENT COLLECTIONS DELETE] Erro:', error)
      return NextResponse.json({ error: 'Erro ao arquivar coleção' }, { status: 500 })
    }

    console.log('[CONTENT COLLECTIONS] Arquivada:', id, existing.slug)

    return NextResponse.json({ success: true, message: 'Coleção arquivada' })
  } catch (error) {
    console.error('[CONTENT COLLECTIONS DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
