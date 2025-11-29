import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// GET - Listar sugestões do fluxo
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_flow_suggestions')
      .select('*')
      .eq('flow_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      // Se tabela não existe, retorna vazio amigável
      if ((error as any).code === '42P01') {
        return NextResponse.json({
          success: true,
          suggestions: [],
          message: 'Tabela de sugestões não encontrada. Execute a migração SQL.'
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      suggestions: data || []
    })

  } catch (error) {
    console.error('Erro ao listar sugestões:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar sugestões' },
      { status: 500 }
    )
  }
}

// POST - Criar nova sugestão
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { type, title, description } = await request.json()

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'type e title são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ai_flow_suggestions')
      .insert({
        flow_id: id,
        type,
        title,
        description: description || '',
        status: 'OPEN'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Erro ao criar sugestão:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar sugestão' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status da sugestão
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: flowId } = await params
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { suggestionId, status } = await request.json()

    if (!suggestionId || !status) {
      return NextResponse.json(
        { success: false, error: 'suggestionId e status são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ai_flow_suggestions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', suggestionId)
      .eq('flow_id', flowId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Erro ao atualizar sugestão:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar sugestão' },
      { status: 500 }
    )
  }
}
