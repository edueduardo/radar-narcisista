import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

interface FlowRow {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

interface FlowRunRow {
  id: string
  flow_id: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR'
  started_at: string
  finished_at: string | null
}

interface FlowAnalytics {
  flow_id: string
  total_runs: number
  success_runs: number
  error_runs: number
  running_runs: number
  last_run_at: string | null
  avg_duration_ms: number | null
}

interface FlowSuggestion {
  flow_id: string
  flow_name: string
  type: 'NO_RUNS' | 'HIGH_ERROR_RATE' | 'SLOW_FLOW'
  message: string
}

export async function GET(request: Request) {
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    // Buscar todos os fluxos
    const { data: flows, error: flowsError } = await supabaseAdmin
      .from('ai_flows')
      .select('id, name, description, is_active')

    if (flowsError) throw flowsError

    const flowIds = (flows || []).map(f => f.id)

    if (flowIds.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: [],
        suggestions: []
      })
    }

    // Buscar execuções recentes de todos os fluxos
    const { data: runs, error: runsError } = await supabaseAdmin
      .from('ai_flow_runs')
      .select('id, flow_id, status, started_at, finished_at, latency_ms')
      .in('flow_id', flowIds)

    if (runsError) throw runsError

    const analyticsByFlow: Record<string, FlowAnalytics> = {}

    for (const flow of flows || []) {
      analyticsByFlow[flow.id] = {
        flow_id: flow.id,
        total_runs: 0,
        success_runs: 0,
        error_runs: 0,
        running_runs: 0,
        last_run_at: null,
        avg_duration_ms: null
      }
    }

    const durationSums: Record<string, { totalMs: number; count: number }> = {}

    for (const run of runs || []) {
      const a = analyticsByFlow[run.flow_id]
      if (!a) continue

      a.total_runs += 1
      if (run.status === 'SUCCESS') a.success_runs += 1
      if (run.status === 'ERROR') a.error_runs += 1
      if (run.status === 'RUNNING') a.running_runs += 1

      if (!a.last_run_at || new Date(run.started_at) > new Date(a.last_run_at)) {
        a.last_run_at = run.started_at
      }

      // Usar latency_ms se disponível
      if (run.latency_ms) {
        if (!durationSums[run.flow_id]) {
          durationSums[run.flow_id] = { totalMs: 0, count: 0 }
        }
        durationSums[run.flow_id].totalMs += run.latency_ms
        durationSums[run.flow_id].count += 1
      }
    }

    // Calcular médias de duração
    for (const [flowId, info] of Object.entries(durationSums)) {
      const a = analyticsByFlow[flowId]
      if (!a) continue
      a.avg_duration_ms = info.count > 0 ? Math.round(info.totalMs / info.count) : null
    }

    const analytics: FlowAnalytics[] = Object.values(analyticsByFlow)

    // Gerar sugestões determinísticas simples
    const suggestions: FlowSuggestion[] = []

    for (const flow of flows || []) {
      const a = analyticsByFlow[flow.id]
      if (!a) continue

      // 1) Fluxo ativo sem execuções
      if (flow.is_active && a.total_runs === 0) {
        suggestions.push({
          flow_id: flow.id,
          flow_name: flow.name,
          type: 'NO_RUNS',
          message: `O fluxo "${flow.name}" está ativo, mas nunca foi executado. Considere testar, revisar ou desativar.`
        })
      }

      // 2) Alta taxa de erro
      if (a.total_runs >= 5 && a.error_runs / a.total_runs >= 0.3) {
        suggestions.push({
          flow_id: flow.id,
          flow_name: flow.name,
          type: 'HIGH_ERROR_RATE',
          message: `O fluxo "${flow.name}" tem taxa de erro acima de 30% (${a.error_runs}/${a.total_runs}). Vale revisar prompts e nós críticos.`
        })
      }

      // 3) Fluxo lento
      if (a.avg_duration_ms !== null && a.avg_duration_ms >= 5000 && a.success_runs >= 3) {
        suggestions.push({
          flow_id: flow.id,
          flow_name: flow.name,
          type: 'SLOW_FLOW',
          message: `O fluxo "${flow.name}" está lento (duração média ~${Math.round(
            a.avg_duration_ms / 1000
          )}s). Considere simplificar nós ou dividir em subfluxos.`
        })
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
      suggestions
    })
  } catch (error) {
    console.error('Erro ao calcular analytics de fluxos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao calcular analytics de fluxos' },
      { status: 500 }
    )
  }
}
