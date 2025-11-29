import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// POST - Duplicar fluxo para teste
export async function POST(
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

    // Buscar fluxo original
    const { data: originalFlow, error: flowError } = await supabaseAdmin
      .from('ai_flows')
      .select('*')
      .eq('id', flowId)
      .single()

    if (flowError || !originalFlow) {
      return NextResponse.json(
        { success: false, error: 'Fluxo original não encontrado' },
        { status: 404 }
      )
    }

    // Criar novo fluxo baseado no original
    const newName = `${originalFlow.name} [EXPERIMENTAL]`

    const { data: newFlow, error: newFlowError } = await supabaseAdmin
      .from('ai_flows')
      .insert({
        name: newName,
        description: originalFlow.description,
        is_active: false, // duplicata começa inativa
        mode_default: 'simulation', // sempre começa em simulação
        created_by: (auth as any).user?.email || (auth as any).user?.id || 'system'
      })
      .select('*')
      .single()

    if (newFlowError || !newFlow) {
      throw newFlowError
    }

    // Buscar nós e edges do fluxo original
    const [nodesResult, edgesResult] = await Promise.all([
      supabaseAdmin
        .from('ai_flow_nodes')
        .select('*')
        .eq('flow_id', flowId)
        .order('created_at'),
      supabaseAdmin
        .from('ai_flow_edges')
        .select('*')
        .eq('flow_id', flowId)
        .order('created_at')
    ])

    if (nodesResult.error) throw nodesResult.error
    if (edgesResult.error) throw edgesResult.error

    const originalNodes = nodesResult.data || []
    const originalEdges = edgesResult.data || []

    let insertedNodes: any[] = []

    // Copiar nós
    if (originalNodes.length > 0) {
      const nodesToInsert = originalNodes.map((node: any) => ({
        flow_id: newFlow.id,
        type: node.type,
        subtype: node.subtype,
        ai_agent_id: node.ai_agent_id || null,
        position_x: node.position_x || 0,
        position_y: node.position_y || 0,
        config: node.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data: newNodes, error: insertNodesError } = await supabaseAdmin
        .from('ai_flow_nodes')
        .insert(nodesToInsert)
        .select('*')

      if (insertNodesError) throw insertNodesError

      insertedNodes = newNodes || []
    }

    // Mapear IDs antigos -> novos para recriar edges
    if (originalEdges.length > 0 && insertedNodes.length > 0) {
      const idMap = new Map<string, string>()

      originalNodes.forEach((node: any, index: number) => {
        const newNode = insertedNodes[index]
        if (newNode && newNode.id) {
          idMap.set(node.id, newNode.id)
        }
      })

      const edgesToInsert = originalEdges
        .map((edge: any) => {
          const newSourceId = idMap.get(edge.source_node_id)
          const newTargetId = idMap.get(edge.target_node_id)

          if (!newSourceId || !newTargetId) {
            return null
          }

          return {
            flow_id: newFlow.id,
            source_node_id: newSourceId,
            source_handle: edge.source_handle || 'output',
            target_node_id: newTargetId,
            target_handle: edge.target_handle || 'input',
            created_at: new Date().toISOString()
          }
        })
        .filter(Boolean) as any[]

      if (edgesToInsert.length > 0) {
        const { error: insertEdgesError } = await supabaseAdmin
          .from('ai_flow_edges')
          .insert(edgesToInsert)

        if (insertEdgesError) throw insertEdgesError
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Fluxo duplicado com sucesso',
      data: {
        id: newFlow.id,
        name: newFlow.name
      }
    })
  } catch (error) {
    console.error('Erro ao duplicar fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao duplicar fluxo' },
      { status: 500 }
    )
  }
}
