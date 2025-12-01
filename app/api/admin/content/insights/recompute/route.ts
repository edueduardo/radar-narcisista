import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { recomputeContentInsights } from '@/lib/content-insights'

// ============================================================================
// API ADMIN: RECOMPUTE CONTENT INSIGHTS
// Recalcula métricas agregadas para "Radar em Números"
// ============================================================================

/**
 * POST /api/admin/content/insights/recompute
 * Recalcula todas as métricas de content_insights
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    console.log('[INSIGHTS RECOMPUTE] Iniciando recálculo por:', auth.user?.email)

    const startTime = Date.now()
    const result = await recomputeContentInsights()
    const duration = Date.now() - startTime

    console.log(`[INSIGHTS RECOMPUTE] Concluído em ${duration}ms:`, {
      success: result.success,
      metricsCount: result.metrics.length,
      errorsCount: result.errors.length
    })

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `${result.metrics.length} métricas recalculadas com sucesso`
        : `Recálculo concluído com ${result.errors.length} erro(s)`,
      metrics: result.metrics.map(m => ({
        key: m.metric_key,
        value: m.value_numeric,
        label: m.label_pt
      })),
      errors: result.errors,
      duration_ms: duration
    })
  } catch (error) {
    console.error('[INSIGHTS RECOMPUTE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * GET /api/admin/content/insights/recompute
 * Retorna status das métricas atuais (sem recalcular)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAPI(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { supabaseAdmin } = await import('@/lib/supabaseClient')

    const { data, error } = await supabaseAdmin
      .from('content_insights')
      .select('metric_key, metric_category, value_numeric, label_pt, visibility, is_featured, last_computed_at')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[INSIGHTS GET] Erro:', error)
      return NextResponse.json({ error: 'Erro ao buscar métricas' }, { status: 500 })
    }

    return NextResponse.json({
      metrics: data || [],
      total: data?.length || 0
    })
  } catch (error) {
    console.error('[INSIGHTS GET] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
