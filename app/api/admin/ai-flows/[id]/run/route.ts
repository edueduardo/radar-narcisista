import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// POST - Executar fluxo
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
    const body = await request.json()
    const { mode = 'simulation', payload = {} } = body
    const flowId = id

    // Validar modo
    if (!['simulation', 'real'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Modo inválido. Use simulation ou real' },
        { status: 400 }
      )
    }

    // Ambiente de laboratório seguro: bloquear modo real
    if (mode === 'real') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Execução em modo REAL está desativada neste ambiente. Use apenas "Testar (Simulação)".'
        },
        { status: 400 }
      )
    }

    // Buscar fluxo e nós
    const [flowResult, nodesResult, edgesResult] = await Promise.all([
      supabaseAdmin.from('ai_flows').select('*').eq('id', flowId).single(),
      supabaseAdmin.from('ai_flow_nodes').select('*').eq('flow_id', flowId),
      supabaseAdmin.from('ai_flow_edges').select('*').eq('flow_id', flowId)
    ])

    if (flowResult.error || !flowResult.data) {
      return NextResponse.json(
        { success: false, error: 'Fluxo não encontrado' },
        { status: 404 }
      )
    }

    const flow = flowResult.data
    const nodes = nodesResult.data || []
    const edges = edgesResult.data || []

    // Criar registro de execução
    const startTime = Date.now()
    const { data: run, error: runError } = await supabaseAdmin
      .from('ai_flow_runs')
      .insert({
        flow_id: flowId,
        mode,
        triggered_by_event: payload,
        status: 'RUNNING',
        started_at: new Date().toISOString(),
        error_count: 0,
        warning_count: 0,
        latency_ms: null
      })
      .select()
      .single()

    if (runError) throw runError

    // Executar fluxo (síncrono para MVP)
    try {
      await executeFlow(run.id, nodes, edges, mode, payload)
      
      // Calcular métricas finais
      const endTime = Date.now()
      const latencyMs = endTime - startTime
      
      // Contar erros e warnings dos logs
      const { data: logs } = await supabaseAdmin
        .from('ai_flow_run_logs')
        .select('level')
        .eq('run_id', run.id)
      const errorCount = logs?.filter(l => l.level === 'ERROR').length || 0
      const warningCount = logs?.filter(l => l.level === 'WARN').length || 0
      
      // Atualizar status para sucesso com métricas
      await supabaseAdmin
        .from('ai_flow_runs')
        .update({
          status: 'SUCCESS',
          finished_at: new Date().toISOString(),
          latency_ms: latencyMs,
          error_count: errorCount,
          warning_count: warningCount
        })
        .eq('id', run.id)

    } catch (execError) {
      console.error('Erro na execução do fluxo:', execError)
      
      // Calcular métricas mesmo em erro
      const endTime = Date.now()
      const latencyMs = endTime - startTime
      const { data: logs } = await supabaseAdmin
        .from('ai_flow_run_logs')
        .select('level')
        .eq('run_id', run.id)
      const errorCount = (logs?.filter(l => l.level === 'ERROR').length || 0) + 1 // conta este erro
      const warningCount = logs?.filter(l => l.level === 'WARN').length || 0
      
      // Atualizar status para erro com métricas
      await supabaseAdmin
        .from('ai_flow_runs')
        .update({
          status: 'ERROR',
          error_message: execError instanceof Error ? execError.message : 'Erro desconhecido',
          finished_at: new Date().toISOString(),
          latency_ms: latencyMs,
          error_count: errorCount,
          warning_count: warningCount
        })
        .eq('id', run.id)

      throw execError
    }

    return NextResponse.json({
      success: true,
      message: `Fluxo executado com sucesso em modo ${mode}`,
      data: {
        run_id: run.id,
        mode,
        status: 'SUCCESS'
      }
    })

  } catch (error) {
    console.error('Erro ao executar fluxo:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: `Erro ao executar fluxo: ${message}`
      },
      { status: 500 }
    )
  }
}

// Função principal de execução do fluxo
async function executeFlow(
  runId: string,
  nodes: any[],
  edges: any[],
  mode: 'simulation' | 'real',
  payload: any
) {
  // Construir grafo de execução
  const graph = buildExecutionGraph(nodes, edges)
  
  // Encontrar nó inicial (trigger)
  const triggerNodes = nodes.filter(n => n.type === 'TRIGGER')
  if (triggerNodes.length === 0) {
    throw new Error('Nenhum nó de trigger encontrado no fluxo')
  }

  // Executar nós em ordem
  for (const triggerNode of triggerNodes) {
    await executeNode(runId, triggerNode, mode, payload, graph)
  }
}

// Construir grafo de dependências (adjacência + mapa de nós)
function buildExecutionGraph(nodes: any[], edges: any[]) {
  const adjacency: { [key: string]: string[] } = {}
  const nodesById: Record<string, any> = {}
  
  // Inicializar estruturas
  nodes.forEach((node) => {
    adjacency[node.id] = []
    nodesById[node.id] = node
  })
  
  // Adicionar arestas
  edges.forEach((edge) => {
    if (adjacency[edge.source_node_id]) {
      adjacency[edge.source_node_id].push(edge.target_node_id)
    }
  })
  
  return { adjacency, nodesById }
}

// Executar nó individual
async function executeNode(
  runId: string,
  node: any,
  mode: 'simulation' | 'real',
  input: any,
  graph: { adjacency: { [key: string]: string[] }; nodesById: Record<string, any> }
) {
  const startTime = new Date()
  
  try {
    // Log de início
    await logNodeExecution(runId, node.id, 'INFO', `Iniciando execução do nó ${node.type}:${node.subtype}`)
    
    let result: any = {}

    // Executar baseado no tipo
    switch (node.type) {
      case 'TRIGGER':
        result = await executeTrigger(node, mode, input)
        break
      case 'IA':
        result = await executeIA(node, mode, input)
        break
      case 'ACTION':
        result = await executeAction(node, mode, input)
        break
      default:
        throw new Error(`Tipo de nó desconhecido: ${node.type}`)
    }

    // Log de sucesso
    await logNodeExecution(runId, node.id, 'INFO', `Nó ${node.type}:${node.subtype} executado com sucesso`, result)

    // Executar próximos nós
    const nextNodes = graph.adjacency[node.id] || []
    for (const nextNodeId of nextNodes) {
      const nextNode = graph.nodesById[nextNodeId]
      if (nextNode) {
        await executeNode(runId, nextNode, mode, result, graph)
      }
    }

  } catch (error) {
    // Log de erro
    await logNodeExecution(runId, node.id, 'ERROR', `Erro no nó ${node.type}:${node.subtype}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    throw error
  }
}

// Executar trigger
async function executeTrigger(node: any, mode: 'simulation' | 'real', input: any) {
  if (mode === 'simulation') {
    return { 
      triggered: true, 
      trigger_type: node.subtype,
      mock_data: { timestamp: new Date().toISOString() }
    }
  }

  // Em modo real, aqui poderia validar o payload real
  switch (node.subtype) {
    case 'diario_novo':
      return { triggered: true, episode_id: input.episode_id, user_id: input.user_id }
    case 'teste_clareza_concluido':
      return { triggered: true, test_id: input.test_id, score: input.score }
    case 'chat_mensagem_nova':
      return { triggered: true, message_id: input.message_id, user_id: input.user_id }
    default:
      return { triggered: true, raw_input: input }
  }
}

// Executar IA
async function executeIA(node: any, mode: 'simulation' | 'real', input: any) {
  if (mode === 'simulation') {
    // Resposta mock baseada no tipo da IA
    const mockResponses: { [key: string]: any } = {
      'coach_clareza_v1': { response: 'Resposta empática simulada do coach', sentiment: 'positive' },
      'guardian_risco_v1': { risk_level: 'low', alerts: [] },
      'analise_contexto_diario_v1': { patterns: ['padrão1'], insights: ['insight1'] },
      'gerador_carta_selo_v1': { pdf_url: '/mock/carta-selo.pdf', title: 'Carta-Selo Simulada' }
    }

    return mockResponses[node.subtype] || { response: 'Resposta padrão simulada' }
  }

  // Em modo real, chamar a API da IA
  if (node.ai_agent_id) {
    // Buscar detalhes da IA
    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('*')
      .eq('id', node.ai_agent_id)
      .single()

    if (agent && agent.endpoint) {
      // Chamar endpoint real (implementar conforme necessário)
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${agent.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, config: node.config })
      })

      if (!response.ok) {
        throw new Error(`Erro na chamada da IA ${agent.id}: ${response.statusText}`)
      }

      return await response.json()
    }
  }

  throw new Error(`IA não configurada para modo real: ${node.subtype}`)
}

// Executar ação
async function executeAction(node: any, mode: 'simulation' | 'real', input: any) {
  if (mode === 'simulation') {
    return { 
      action_executed: true, 
      action_type: node.subtype,
      mock_result: 'Ação simulada com sucesso'
    }
  }

  // Em modo real, executar ações reais
  switch (node.subtype) {
    case 'atualizar_flags_risco':
      // Atualizar flags de risco no usuário
      if (input.user_id) {
        await supabaseAdmin
          .from('user_profiles')
          .update({ risk_flag: true })
          .eq('user_id', input.user_id)
      }
      return { action_executed: true, risk_flag_updated: true }

    case 'criar_incidente':
      // Criar registro de incidente
      await supabaseAdmin
        .from('ai_incidents')
        .insert({
          agent_id: node.ai_agent_id,
          reason: input.reason || 'Incidente criado pelo fluxo',
          created_at: new Date().toISOString()
        })
      return { action_executed: true, incident_created: true }

    case 'gerar_carta_selo_pdf':
      // Gerar PDF (implementar conforme necessário)
      return { action_executed: true, pdf_generated: true }

    default:
      return { action_executed: true, action_type: node.subtype }
  }
}

// Log de execução do nó
async function logNodeExecution(
  runId: string,
  nodeId: string,
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  payload: any = {}
) {
  try {
    await supabaseAdmin
      .from('ai_flow_run_logs')
      .insert({
        run_id: runId,
        node_id: nodeId,
        timestamp: new Date().toISOString(),
        level,
        message,
        payload
      })
  } catch (error) {
    console.error('Erro ao fazer log da execução:', error)
  }
}
