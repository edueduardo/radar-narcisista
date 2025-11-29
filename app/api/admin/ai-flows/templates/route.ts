import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// GET - Listar templates
export async function GET(request: Request) {
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isOfficial = searchParams.get('official')

    let query = supabaseAdmin
      .from('ai_flow_templates')
      .select('*')
      .order('is_official', { ascending: false })
      .order('name')

    if (category) {
      query = query.eq('category', category)
    }
    if (isOfficial !== null) {
      query = query.eq('is_official', isOfficial === 'true')
    }

    const { data, error } = await query

    if (error) {
      // Se tabela não existe, retorna vazio amigável
      if ((error as any).code === '42P01') {
        return NextResponse.json({
          success: true,
          templates: [],
          message: 'Tabela de templates não encontrada. Execute a migração SQL.'
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      templates: data || []
    })

  } catch (error) {
    console.error('Erro ao listar templates:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar templates' },
      { status: 500 }
    )
  }
}

// POST - Criar fluxo a partir de template
export async function POST(request: Request) {
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { templateId, flowName } = await request.json()

    if (!templateId || !flowName) {
      return NextResponse.json(
        { success: false, error: 'templateId e flowName são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('ai_flow_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Criar fluxo
    const { data: flow, error: flowError } = await supabaseAdmin
      .from('ai_flows')
      .insert({
        name: flowName,
        description: `Criado a partir do template: ${template.name}`,
        is_active: false,
        mode_default: 'simulation',
        review_status: 'draft',
        simulation_only: true
      })
      .select()
      .single()

    if (flowError || !flow) {
      throw flowError || new Error('Erro ao criar fluxo')
    }

    // Clonar nós do template
    const templateNodes = template.definition.nodes || []
    const nodesToInsert = templateNodes.map((node: any) => ({
      flow_id: flow.id,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `node-${Date.now()}-${Math.random()}`,
      type: node.type,
      subtype: node.subtype,
      ai_agent_id: null,
      position_x: node.position_x,
      position_y: node.position_y,
      config: node.config || {}
    }))

    if (nodesToInsert.length > 0) {
      const { error: nodesError } = await supabaseAdmin
        .from('ai_flow_nodes')
        .insert(nodesToInsert)

      if (nodesError) throw nodesError
    }

    // Clonar edges do template (ajustando IDs dos nós)
    const templateEdges = template.definition.edges || []
    const edgesToInsert = templateEdges.map((edge: any, index: number) => ({
      flow_id: flow.id,
      id: `edge-${index}`,
      source_node_id: nodesToInsert[edge.source_node_id.replace('node-', '') - 1]?.id,
      target_node_id: nodesToInsert[edge.target_node_id.replace('node-', '') - 1]?.id,
      source_handle: edge.source_handle,
      target_handle: edge.target_handle
    })).filter((e: any) => e.source_node_id && e.target_node_id)

    if (edgesToInsert.length > 0) {
      const { error: edgesError } = await supabaseAdmin
        .from('ai_flow_edges')
        .insert(edgesToInsert)

      if (edgesError) throw edgesError
    }

    return NextResponse.json({
      success: true,
      data: {
        flow,
        message: `Fluxo "${flowName}" criado a partir do template "${template.name}"`
      }
    })

  } catch (error) {
    console.error('Erro ao criar fluxo a partir de template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar fluxo a partir de template' },
      { status: 500 }
    )
  }
}
