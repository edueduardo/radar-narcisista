import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// Tipos simples para resposta
interface FlowVersionRow {
  id: string
  flow_id: string
  version: number
  label: string | null
  is_current: boolean
  stability_status: string | null
  nodes: any[]
  edges: any[]
  created_at: string
  created_by: string | null
}

// GET - listar versões de um fluxo
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
    const flowId = id

    const { data, error } = await supabaseAdmin
      .from('ai_flow_versions')
      .select('id, flow_id, version, label, is_current, stability_status, created_at, created_by')
      .eq('flow_id', flowId)
      .order('version', { ascending: false })

    if (error) {
      // Se a tabela não existir ainda, retorna mensagem amigável
      if ((error as any).code === '42P01') {
        return NextResponse.json({
          success: true,
          versions: [],
          message:
            'Tabela de versões não encontrada. Execute a migração SQL para habilitar versionamento.'
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      versions: data || []
    })
  } catch (error) {
    console.error('Erro ao listar versões de fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar versões de fluxo' },
      { status: 500 }
    )
  }
}

// POST - ações sobre versões (por enquanto: revert)
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
    const body = await request.json()
    const { action, version } = body as { action: string; version?: number }
    const flowId = id

    if (action !== 'revert' || typeof version !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Use action="revert" e informe a versão.' },
        { status: 400 }
      )
    }

    // Buscar versão alvo com snapshot de nós e edges
    const { data: versionRow, error: versionError } = await supabaseAdmin
      .from('ai_flow_versions')
      .select('*')
      .eq('flow_id', flowId)
      .eq('version', version)
      .single()

    if (versionError || !versionRow) {
      return NextResponse.json(
        { success: false, error: 'Versão não encontrada para este fluxo' },
        { status: 404 }
      )
    }

    const { nodes, edges } = versionRow as FlowVersionRow

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { success: false, error: 'Snapshot de versão inválido (nodes/edges)' },
        { status: 500 }
      )
    }

    // Remover nós e edges atuais
    await Promise.all([
      supabaseAdmin.from('ai_flow_nodes').delete().eq('flow_id', flowId),
      supabaseAdmin.from('ai_flow_edges').delete().eq('flow_id', flowId)
    ])

    // Recriar nós preservando IDs do snapshot (compatível com grafo salvo)
    if (nodes.length > 0) {
      const nodesToInsert = nodes.map((node: any) => ({
        id: node.id,
        flow_id: flowId,
        type: node.type,
        subtype: node.subtype,
        ai_agent_id: node.ai_agent_id || null,
        position_x: node.position_x ?? node.x ?? 0,
        position_y: node.position_y ?? node.y ?? 0,
        config: node.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error: nodesError } = await supabaseAdmin
        .from('ai_flow_nodes')
        .insert(nodesToInsert)

      if (nodesError) throw nodesError
    }

    // Recriar edges a partir do snapshot
    if (edges.length > 0) {
      const edgesToInsert = edges.map((edge: any) => ({
        flow_id: flowId,
        source_node_id: edge.source_node_id,
        source_handle: edge.source_handle || 'output',
        target_node_id: edge.target_node_id,
        target_handle: edge.target_handle || 'input',
        created_at: new Date().toISOString()
      }))

      const { error: edgesError } = await supabaseAdmin
        .from('ai_flow_edges')
        .insert(edgesToInsert)

      if (edgesError) throw edgesError
    }

    // Atualizar flags de is_current nas versões
    await supabaseAdmin
      .from('ai_flow_versions')
      .update({ is_current: false })
      .eq('flow_id', flowId)

    await supabaseAdmin
      .from('ai_flow_versions')
      .update({ is_current: true })
      .eq('flow_id', flowId)
      .eq('version', version)

    return NextResponse.json({
      success: true,
      message: `Fluxo revertido para a versão ${version} com sucesso`
    })
  } catch (error) {
    console.error('Erro ao reverter versão do fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao reverter versão do fluxo' },
      { status: 500 }
    )
  }
}

