import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

interface FlowRunRow {
  id: string
  flow_id: string
  mode: 'simulation' | 'real'
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR'
  started_at: string
  finished_at: string | null
  error_message: string | null
}

// GET - Listar execuções recentes de um fluxo + métricas simples
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
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    let limit = 20

    if (limitParam) {
      const parsed = parseInt(limitParam, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 100)
      }
    }

    // Primeiro, tentar buscar com colunas de métricas completas
    let runsData: any[] = []
    
    const runsResult = await supabaseAdmin
      .from('ai_flow_runs')
      .select('id, flow_id, mode, status, started_at, finished_at, error_message, error_count, warning_count, latency_ms')
      .eq('flow_id', flowId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (runsResult.error) {
      const code = (runsResult.error as any).code

      // Se a tabela não existir ainda, retorna vazio de forma amigável
      if (code === '42P01') {
        return NextResponse.json({
          success: true,
          runs: [],
          stats: {
            total_runs: 0,
            success_runs: 0,
            error_runs: 0,
            running_runs: 0,
            last_run_at: null,
            avg_duration_ms: null,
            total_errors: 0,
            total_warnings: 0,
          },
          message: 'Tabela de execuções não encontrada. Execute a migração SQL para habilitar logs de execução.'
        })
      }

      // Se o erro for coluna ausente (por exemplo, error_count/latency_ms),
      // faz uma segunda consulta apenas com campos básicos
      if (code === '42703') {
        const fallback = await supabaseAdmin
          .from('ai_flow_runs')
          .select('id, flow_id, mode, status, started_at, finished_at, error_message')
          .eq('flow_id', flowId)
          .order('started_at', { ascending: false })
          .limit(limit)

        if (fallback.error) {
          throw fallback.error
        }

        // Adicionar campos faltantes com valores default
        runsData = (fallback.data || []).map((row: any) => ({
          ...row,
          error_count: 0,
          warning_count: 0,
          latency_ms: null
        }))
      } else {
        throw runsResult.error
      }
    } else {
      runsData = runsResult.data || []
    }

    const runs = runsData

    const stats = runs.reduce(
      (acc: any, run: any) => {
        acc.total_runs += 1
        if (run.status === 'SUCCESS') acc.success_runs += 1
        if (run.status === 'ERROR') acc.error_runs += 1
        if (run.status === 'RUNNING') acc.running_runs += 1
        if (run.latency_ms) {
          acc.latency_sum += run.latency_ms
          acc.latency_count += 1
        }
        if (run.error_count) acc.total_errors += run.error_count
        if (run.warning_count) acc.total_warnings += run.warning_count
        return acc
      },
      {
        total_runs: 0,
        success_runs: 0,
        error_runs: 0,
        running_runs: 0,
        last_run_at: runs.length > 0 ? runs[0].started_at : null as string | null,
        avg_duration_ms: null as number | null,
        total_errors: 0,
        total_warnings: 0,
        latency_sum: 0,
        latency_count: 0
      }
    )
    // Calcular média de latência
    if (stats.latency_count > 0) {
      stats.avg_duration_ms = Math.round(stats.latency_sum / stats.latency_count)
    }
    // Remover campos temporários
    delete stats.latency_sum
    delete stats.latency_count

    return NextResponse.json({
      success: true,
      runs,
      stats
    })
  } catch (error) {
    console.error('Erro ao listar execuções do fluxo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar execuções do fluxo' },
      { status: 500 }
    )
  }
}
