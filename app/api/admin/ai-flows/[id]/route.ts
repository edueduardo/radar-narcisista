import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// Tipos
interface FlowNode {
  id: string
  flow_id: string
  type: 'TRIGGER' | 'IA' | 'ACTION'
  subtype: string
  ai_agent_id: string | null
  position_x: number
  position_y: number
  config: any
  created_at: string
  updated_at: string
}

interface FlowEdge {
  id: string
  flow_id: string
  source_node_id: string
  source_handle: string
  target_node_id: string
  target_handle: string
  created_at: string
}

interface FlowRun {
  id: string
  flow_id: string
  mode: 'simulation' | 'real'
  triggered_by_event: any
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR'
  started_at: string
  finished_at: string | null
  error_message: string | null
}

// GET - Buscar fluxo específico com nós e edges
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Verificar permissão de admin
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const useMock = searchParams.get('mock') === 'true'
    const flowId = id

    if (useMock) {
      // Dados mock para demonstração
      const mockFlow = {
        id: flowId,
        name: 'Fluxo de Análise de Diário',
        description: 'Analisa novos episódios do diário e detecta padrões de risco',
        is_active: true,
        mode_default: 'simulation',
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockNodes = [
        {
          id: 'node-1',
          flow_id: flowId,
          type: 'TRIGGER' as const,
          subtype: 'diario_novo',
          ai_agent_id: null,
          position_x: 100,
          position_y: 100,
          config: { min_intensidade: 3 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'node-2',
          flow_id: flowId,
          type: 'IA' as const,
          subtype: 'coach_clareza_v1',
          ai_agent_id: 'coach_clareza_v1',
          position_x: 300,
          position_y: 100,
          config: { profundidade: 'media' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'node-3',
          flow_id: flowId,
          type: 'ACTION' as const,
          subtype: 'atualizar_flags_risco',
          ai_agent_id: null,
          position_x: 500,
          position_y: 100,
          config: { flag_risco: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      const mockEdges = [
        {
          id: 'edge-1',
          flow_id: flowId,
          source_node_id: 'node-1',
          source_handle: 'output',
          target_node_id: 'node-2',
          target_handle: 'input',
          created_at: new Date().toISOString()
        },
        {
          id: 'edge-2',
          flow_id: flowId,
          source_node_id: 'node-2',
          source_handle: 'output',
          target_node_id: 'node-3',
          target_handle: 'input',
          created_at: new Date().toISOString()
        }
      ]

      return NextResponse.json({
        success: true,
        mode: 'mock',
        data: {
          flow: mockFlow,
          nodes: mockNodes,
          edges: mockEdges
        }
      })
    }

    // MODO REAL - Buscar do Supabase
    const [flowResult, nodesResult, edgesResult] = await Promise.all([
      supabaseAdmin.from('ai_flows').select('*').eq('id', flowId).single(),
      supabaseAdmin.from('ai_flow_nodes').select('*').eq('flow_id', flowId).order('created_at'),
      supabaseAdmin.from('ai_flow_edges').select('*').eq('flow_id', flowId).order('created_at')
    ])

    if (flowResult.error) throw flowResult.error

    return NextResponse.json({
      success: true,
      mode: 'real',
      data: {
        flow: flowResult.data,
        nodes: nodesResult.data || [],
        edges: edgesResult.data || []
      }
    })

  } catch (error) {
    console.error('Erro ao buscar fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar fluxo' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar fluxo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Verificar permissão de admin
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, description, is_active, mode_default, review_status, validation_window_days } = body
    const flowId = id

    // Buscar fluxo atual para detectar mudança de status
    const { data: currentFlow, error: fetchError } = await supabaseAdmin
      .from('ai_flows')
      .select('review_status, validation_started_at')
      .eq('id', flowId)
      .single()
    if (fetchError) throw fetchError

    const updatePayload: any = {
      name,
      description,
      is_active,
      mode_default,
      updated_at: new Date().toISOString()
    }
    if (review_status !== undefined) updatePayload.review_status = review_status
    if (validation_window_days !== undefined) updatePayload.validation_window_days = validation_window_days

    // Se mudou para 'in_validation' e ainda não tem data de início, setar agora
    if (review_status === 'in_validation' && currentFlow.review_status !== 'in_validation' && !currentFlow.validation_started_at) {
      const now = new Date()
      updatePayload.validation_started_at = now.toISOString()
      if (validation_window_days) {
        const endsAt = new Date(now.getTime() + validation_window_days * 24 * 60 * 60 * 1000)
        updatePayload.validation_ends_at = endsAt.toISOString()
      }
    }

    const { data: flow, error } = await supabaseAdmin
      .from('ai_flows')
      .update(updatePayload)
      .eq('id', flowId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: flow
    })

  } catch (error) {
    console.error('Erro ao atualizar fluxo:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: `Erro ao atualizar fluxo: ${message}`
      },
      { status: 500 }
    )
  }
}

// DELETE - Remover fluxo (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Verificar permissão de admin
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const flowId = id

    // Soft delete - marcar como inativo
    const { error } = await supabaseAdmin
      .from('ai_flows')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', flowId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Fluxo removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao remover fluxo' },
      { status: 500 }
    )
  }
}
