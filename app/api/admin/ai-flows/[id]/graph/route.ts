import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// PUT - Salvar grafo do fluxo (nós e edges)
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
    const { nodes, edges } = body
    const flowId = id

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { success: false, error: 'Nodes e edges são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o fluxo existe
    const { data: flow, error: flowError } = await supabaseAdmin
      .from('ai_flows')
      .select('id')
      .eq('id', flowId)
      .single()

    if (flowError || !flow) {
      return NextResponse.json(
        { success: false, error: 'Fluxo não encontrado' },
        { status: 404 }
      )
    }

    // Remover nós e edges existentes
    await Promise.all([
      supabaseAdmin.from('ai_flow_nodes').delete().eq('flow_id', flowId),
      supabaseAdmin.from('ai_flow_edges').delete().eq('flow_id', flowId)
    ])

    // Inserir novos nós
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

    // Inserir novos edges
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

    // Criar snapshot de versão (best-effort)
    try {
      // Descobrir última versão existente
      const { data: existingVersions, error: versionsError } = await supabaseAdmin
        .from('ai_flow_versions')
        .select('version')
        .eq('flow_id', flowId)
        .order('version', { ascending: false })
        .limit(1)

      let newVersion = 1
      if (!versionsError && existingVersions && existingVersions.length > 0) {
        const last = existingVersions[0] as any
        if (typeof last.version === 'number') {
          newVersion = last.version + 1
        }
      }

      // Resetar flags de versão atual
      await supabaseAdmin
        .from('ai_flow_versions')
        .update({ is_current: false })
        .eq('flow_id', flowId)

      // Inserir nova versão com snapshot de nodes/edges (como recebidos do client)
      await supabaseAdmin
        .from('ai_flow_versions')
        .insert({
          flow_id: flowId,
          version: newVersion,
          label: `v${newVersion}`,
          is_current: true,
          stability_status: 'EXPERIMENTAL',
          nodes,
          edges,
          created_at: new Date().toISOString(),
          created_by: (auth as any).user?.id || (auth as any).user?.email || 'system'
        })

    } catch (versionError: any) {
      // Se a tabela de versões ainda não existir ou houver outro erro, não quebrar o salvamento do grafo
      console.error(
        'Erro ao salvar versão do fluxo (ai_flow_versions):',
        versionError?.message || versionError
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Grafo salvo com sucesso',
      data: { nodes_count: nodes.length, edges_count: edges.length }
    })

  } catch (error) {
    console.error('Erro ao salvar grafo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar grafo' },
      { status: 500 }
    )
  }
}

