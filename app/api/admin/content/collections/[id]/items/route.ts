import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API ADMIN: CONTENT COLLECTION ITEMS (CRUD)
// Gerencia itens dentro de uma coleção (ponte N:N)
// ============================================================================

/**
 * GET /api/admin/content/collections/[id]/items
 * Lista itens de uma coleção ordenados por position
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

    const { id: collectionId } = await params

    // Verificar se coleção existe
    const { data: collection } = await supabaseAdmin
      .from('content_collections')
      .select('id, name_pt')
      .eq('id', collectionId)
      .single()

    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Buscar itens da coleção com dados do content_item
    const { data, error } = await supabaseAdmin
      .from('content_collection_items')
      .select(`
        id,
        position,
        is_required,
        unlock_after_id,
        created_at,
        content_item_id,
        content_items (
          id,
          slug,
          title_pt,
          content_type,
          visibility,
          is_featured
        )
      `)
      .eq('collection_id', collectionId)
      .order('position', { ascending: true })

    if (error) {
      console.error('[COLLECTION ITEMS GET] Erro:', error)
      return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 })
    }

    return NextResponse.json({
      collection,
      items: data || []
    })
  } catch (error) {
    console.error('[COLLECTION ITEMS GET] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * POST /api/admin/content/collections/[id]/items
 * Adiciona item à coleção
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id: collectionId } = await params
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.content_item_id) {
      return NextResponse.json(
        { error: 'Campo obrigatório: content_item_id' },
        { status: 400 }
      )
    }

    // Verificar se coleção existe
    const { data: collection } = await supabaseAdmin
      .from('content_collections')
      .select('id, item_count')
      .eq('id', collectionId)
      .single()

    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    // Verificar se content_item existe
    const { data: contentItem } = await supabaseAdmin
      .from('content_items')
      .select('id')
      .eq('id', body.content_item_id)
      .single()

    if (!contentItem) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    // Verificar se já existe na coleção
    const { data: existing } = await supabaseAdmin
      .from('content_collection_items')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('content_item_id', body.content_item_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Item já está na coleção' },
        { status: 400 }
      )
    }

    // Determinar posição (se não informada, colocar no final)
    let position = body.position
    if (position === undefined || position === null) {
      const { data: lastItem } = await supabaseAdmin
        .from('content_collection_items')
        .select('position')
        .eq('collection_id', collectionId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      position = (lastItem?.position || 0) + 1
    }

    const insertData = {
      collection_id: collectionId,
      content_item_id: body.content_item_id,
      position,
      is_required: body.is_required || false,
      unlock_after_id: body.unlock_after_id || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('content_collection_items')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('[COLLECTION ITEMS POST] Erro:', error)
      return NextResponse.json({ error: 'Erro ao adicionar item' }, { status: 500 })
    }

    // Atualizar item_count da coleção
    await supabaseAdmin
      .from('content_collections')
      .update({
        item_count: (collection.item_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)

    console.log('[COLLECTION ITEMS] Adicionado:', data.id, 'à coleção', collectionId)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[COLLECTION ITEMS POST] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/content/collections/[id]/items
 * Atualiza posição/is_required/unlock_after_id de um item
 * Body: { item_id, position?, is_required?, unlock_after_id? }
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

    const { id: collectionId } = await params
    const body = await request.json()

    if (!body.item_id) {
      return NextResponse.json(
        { error: 'Campo obrigatório: item_id' },
        { status: 400 }
      )
    }

    // Verificar se item existe na coleção
    const { data: existing } = await supabaseAdmin
      .from('content_collection_items')
      .select('id')
      .eq('id', body.item_id)
      .eq('collection_id', collectionId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Item não encontrado na coleção' }, { status: 404 })
    }

    const updateData: Record<string, any> = {}

    if (body.position !== undefined) {
      updateData.position = body.position
    }
    if (body.is_required !== undefined) {
      updateData.is_required = body.is_required
    }
    if (body.unlock_after_id !== undefined) {
      updateData.unlock_after_id = body.unlock_after_id
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('content_collection_items')
      .update(updateData)
      .eq('id', body.item_id)
      .select()
      .single()

    if (error) {
      console.error('[COLLECTION ITEMS PATCH] Erro:', error)
      return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 })
    }

    console.log('[COLLECTION ITEMS] Atualizado:', body.item_id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[COLLECTION ITEMS PATCH] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/content/collections/[id]/items
 * Remove item da coleção
 * Body: { item_id }
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

    const { id: collectionId } = await params
    const body = await request.json()

    if (!body.item_id) {
      return NextResponse.json(
        { error: 'Campo obrigatório: item_id' },
        { status: 400 }
      )
    }

    // Verificar se item existe na coleção
    const { data: existing } = await supabaseAdmin
      .from('content_collection_items')
      .select('id')
      .eq('id', body.item_id)
      .eq('collection_id', collectionId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Item não encontrado na coleção' }, { status: 404 })
    }

    // Buscar item_count atual
    const { data: collection } = await supabaseAdmin
      .from('content_collections')
      .select('item_count')
      .eq('id', collectionId)
      .single()

    const { error } = await supabaseAdmin
      .from('content_collection_items')
      .delete()
      .eq('id', body.item_id)

    if (error) {
      console.error('[COLLECTION ITEMS DELETE] Erro:', error)
      return NextResponse.json({ error: 'Erro ao remover item' }, { status: 500 })
    }

    // Atualizar item_count da coleção
    await supabaseAdmin
      .from('content_collections')
      .update({
        item_count: Math.max(0, (collection?.item_count || 1) - 1),
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)

    console.log('[COLLECTION ITEMS] Removido:', body.item_id, 'da coleção', collectionId)

    return NextResponse.json({ success: true, message: 'Item removido da coleção' })
  } catch (error) {
    console.error('[COLLECTION ITEMS DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
