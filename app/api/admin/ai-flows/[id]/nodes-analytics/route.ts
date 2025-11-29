import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

interface NodeAnalytics {
  node_id: string
  type: string
  subtype: string
  total_logs: number
  error_logs: number
  warn_logs: number
  info_logs: number
  runs_impacted: number
  last_timestamp: string | null
  error_rate: number
}

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

    // Buscar nós do fluxo
    const { data: nodes, error: nodesError } = await supabaseAdmin
      .from('ai_flow_nodes')
      .select('id, type, subtype')
      .eq('flow_id', flowId)

    if (nodesError) throw nodesError

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({
        success: true,
        nodes_analytics: []
      })
    }

    const nodeIds = nodes.map((n: any) => n.id)

    // Buscar logs por nó
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('ai_flow_run_logs')
      .select('node_id, run_id, timestamp, level')
      .in('node_id', nodeIds)

    if (logsError) throw logsError

    const analyticsMap: Record<string, NodeAnalytics & { runIds: Set<string> }> = {}

    for (const node of nodes as any[]) {
      analyticsMap[node.id] = {
        node_id: node.id,
        type: node.type,
        subtype: node.subtype,
        total_logs: 0,
        error_logs: 0,
        warn_logs: 0,
        info_logs: 0,
        runs_impacted: 0,
        last_timestamp: null,
        error_rate: 0,
        runIds: new Set<string>()
      }
    }

    for (const log of (logs || []) as any[]) {
      const a = analyticsMap[log.node_id]
      if (!a) continue

      a.total_logs += 1
      if (log.level === 'ERROR') a.error_logs += 1
      else if (log.level === 'WARN') a.warn_logs += 1
      else if (log.level === 'INFO') a.info_logs += 1

      if (!a.last_timestamp || new Date(log.timestamp) > new Date(a.last_timestamp)) {
        a.last_timestamp = log.timestamp
      }

      if (log.run_id) {
        a.runIds.add(log.run_id)
      }
    }

    const result: NodeAnalytics[] = Object.values(analyticsMap).map((a) => {
      const error_rate = a.total_logs > 0 ? a.error_logs / a.total_logs : 0
      return {
        node_id: a.node_id,
        type: a.type,
        subtype: a.subtype,
        total_logs: a.total_logs,
        error_logs: a.error_logs,
        warn_logs: a.warn_logs,
        info_logs: a.info_logs,
        runs_impacted: a.runIds.size,
        last_timestamp: a.last_timestamp,
        error_rate
      }
    })

    return NextResponse.json({
      success: true,
      nodes_analytics: result
    })
  } catch (error) {
    console.error('Erro ao calcular analytics por nó de fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao calcular analytics por nó de fluxo' },
      { status: 500 }
    )
  }
}
