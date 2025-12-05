import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Sugestões de Conteúdo - FANPAGE VIVA
 * 
 * GET /api/content/suggestions - Lista sugestões (admin)
 * POST /api/content/suggestions - Cria sugestão (admin/sistema)
 * PATCH /api/content/suggestions - Aprova/Rejeita sugestão (admin)
 */

// GET - Lista sugestões (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    // Verificar autenticação e admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let query = supabase
      .from('content_suggestions')
      .select('*', { count: 'exact' })
    
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    query = query
      .order('priority', { ascending: false })
      .order('ai_relevance_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar sugestões:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar sugestões', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      items: data || [],
      total: count || 0,
      limit,
      offset
    })
    
  } catch (error) {
    console.error('Erro na API de sugestões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Cria sugestão
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
    
    const suggestionData = {
      suggestion_source: body.suggestion_source || 'manual',
      original_url: body.original_url || null,
      original_title: body.original_title || null,
      original_content: body.original_content || null,
      suggested_title_pt: body.suggested_title_pt || null,
      suggested_summary_pt: body.suggested_summary_pt || null,
      suggested_body_pt: body.suggested_body_pt || null,
      suggested_type: body.suggested_type || 'article',
      suggested_topics: body.suggested_topics || [],
      suggested_tags: body.suggested_tags || [],
      ai_relevance_score: body.ai_relevance_score || null,
      ai_reasoning: body.ai_reasoning || null,
      ai_model: body.ai_model || null,
      ai_processed_at: body.ai_processed_at || null,
      status: 'pending',
      priority: body.priority || 'normal'
    }
    
    const { data, error } = await supabase
      .from('content_suggestions')
      .insert(suggestionData)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar sugestão:', error)
      return NextResponse.json(
        { error: 'Erro ao criar sugestão', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de sugestões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Aprova ou rejeita sugestão
export async function PATCH(request: NextRequest) {
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
    const { id, action, rejection_reason, review_notes } = body
    
    if (!id || !action) {
      return NextResponse.json({ error: 'ID e action são obrigatórios' }, { status: 400 })
    }
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action deve ser approve ou reject' }, { status: 400 })
    }
    
    // Buscar sugestão
    const { data: suggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError || !suggestion) {
      return NextResponse.json({ error: 'Sugestão não encontrada' }, { status: 404 })
    }
    
    if (action === 'reject') {
      // Rejeitar sugestão
      const { error } = await supabase
        .from('content_suggestions')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null,
          review_notes: review_notes || null
        })
        .eq('id', id)
      
      if (error) {
        return NextResponse.json({ error: 'Erro ao rejeitar sugestão' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true, action: 'rejected' })
    }
    
    // Aprovar e converter em content_item
    const slug = generateSlug(suggestion.suggested_title_pt || suggestion.original_title || 'conteudo')
    
    const contentData = {
      slug,
      title: suggestion.suggested_title_pt || suggestion.original_title,
      summary: suggestion.suggested_summary_pt || null,
      body: suggestion.suggested_body_pt || null,
      type: suggestion.suggested_type || 'article',
      source_type: suggestion.suggestion_source === 'ai_curator' ? 'external_world' : 'manual',
      tags: suggestion.suggested_tags || [],
      external_url: suggestion.original_url || null,
      visibility: 'public',
      status: 'draft', // Começa como rascunho
      created_by: user.id
    }
    
    const { data: newContent, error: contentError } = await supabase
      .from('content_items')
      .insert(contentData)
      .select()
      .single()
    
    if (contentError) {
      console.error('Erro ao criar conteúdo:', contentError)
      return NextResponse.json(
        { error: 'Erro ao criar conteúdo', details: contentError.message },
        { status: 500 }
      )
    }
    
    // Atualizar sugestão como convertida
    await supabase
      .from('content_suggestions')
      .update({
        status: 'converted',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: review_notes || null,
        linked_content_id: newContent.id
      })
      .eq('id', id)
    
    return NextResponse.json({
      success: true,
      action: 'approved',
      content: newContent
    })
    
  } catch (error) {
    console.error('Erro na API de sugestões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
    + '-' + Date.now().toString(36)
}
