import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// CONTENT INSIGHTS - Funções para recalcular métricas agregadas
// Usado pelo endpoint /api/admin/content/insights/recompute
// ============================================================================

export interface InsightMetric {
  metric_key: string
  metric_category: string
  value_numeric: number
  label_pt: string
  label_en?: string
  description_pt?: string
  display_format: string
  display_suffix?: string
  icon: string
  color: string
  visibility: 'public' | 'private' | 'admin_only'
  is_featured: boolean
  sort_order: number
}

/**
 * Recalcula todas as métricas de content_insights
 * Retorna array de métricas atualizadas
 */
export async function recomputeContentInsights(): Promise<{
  success: boolean
  metrics: InsightMetric[]
  errors: string[]
}> {
  const metrics: InsightMetric[] = []
  const errors: string[] = []
  const now = new Date().toISOString()

  try {
    // ========================================
    // MÉTRICA 1: total_users
    // ========================================
    try {
      const { count: totalUsers } = await supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      metrics.push({
        metric_key: 'total_users',
        metric_category: 'general',
        value_numeric: totalUsers || 0,
        label_pt: 'Usuários',
        label_en: 'Users',
        description_pt: 'Total de pessoas usando o Radar',
        display_format: 'number',
        icon: 'Users',
        color: 'purple',
        visibility: 'public',
        is_featured: true,
        sort_order: 1
      })
    } catch (e) {
      errors.push('Erro ao calcular total_users')
    }

    // ========================================
    // MÉTRICA 2: tests_completed_30d
    // ========================================
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: testsCompleted } = await supabaseAdmin
        .from('clarity_tests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      metrics.push({
        metric_key: 'tests_completed_30d',
        metric_category: 'engagement',
        value_numeric: testsCompleted || 0,
        label_pt: 'Testes (30 dias)',
        label_en: 'Tests (30 days)',
        description_pt: 'Testes de Clareza realizados nos últimos 30 dias',
        display_format: 'number',
        icon: 'ClipboardCheck',
        color: 'blue',
        visibility: 'public',
        is_featured: true,
        sort_order: 2
      })
    } catch (e) {
      errors.push('Erro ao calcular tests_completed_30d')
    }

    // ========================================
    // MÉTRICA 3: diary_entries_30d
    // ========================================
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: diaryEntries } = await supabaseAdmin
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      metrics.push({
        metric_key: 'diary_entries_30d',
        metric_category: 'engagement',
        value_numeric: diaryEntries || 0,
        label_pt: 'Registros (30 dias)',
        label_en: 'Entries (30 days)',
        description_pt: 'Episódios documentados nos últimos 30 dias',
        display_format: 'number',
        icon: 'BookOpen',
        color: 'green',
        visibility: 'public',
        is_featured: true,
        sort_order: 3
      })
    } catch (e) {
      errors.push('Erro ao calcular diary_entries_30d')
    }

    // ========================================
    // MÉTRICA 4: risk_alerts_30d
    // ========================================
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: riskAlerts } = await supabaseAdmin
        .from('risk_alerts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      metrics.push({
        metric_key: 'risk_alerts_30d',
        metric_category: 'safety',
        value_numeric: riskAlerts || 0,
        label_pt: 'Alertas de Risco (30 dias)',
        label_en: 'Risk Alerts (30 days)',
        description_pt: 'Alertas de risco detectados nos últimos 30 dias',
        display_format: 'number',
        icon: 'AlertTriangle',
        color: 'red',
        visibility: 'admin_only', // Sensível, só admin vê
        is_featured: false,
        sort_order: 10
      })
    } catch (e) {
      errors.push('Erro ao calcular risk_alerts_30d')
    }

    // ========================================
    // MÉTRICA 5: percent_users_physical_risk_high
    // ========================================
    try {
      // Total de usuários com teste
      const { count: totalWithTest } = await supabaseAdmin
        .from('clarity_tests')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_profile_base', true)

      // Usuários com risco físico alto
      const { count: highRisk } = await supabaseAdmin
        .from('clarity_tests')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_profile_base', true)
        .eq('has_physical_risk', true)

      const percentage = totalWithTest && totalWithTest > 0
        ? Math.round((highRisk || 0) / totalWithTest * 100)
        : 0

      metrics.push({
        metric_key: 'percent_users_physical_risk_high',
        metric_category: 'safety',
        value_numeric: percentage,
        label_pt: 'Usuários em Risco Físico',
        label_en: 'Users at Physical Risk',
        description_pt: 'Percentual de usuários com indicadores de risco físico',
        display_format: 'percentage',
        display_suffix: '%',
        icon: 'Shield',
        color: 'red',
        visibility: 'admin_only', // Sensível, só admin vê
        is_featured: false,
        sort_order: 11
      })
    } catch (e) {
      errors.push('Erro ao calcular percent_users_physical_risk_high')
    }

    // ========================================
    // MÉTRICA 6: safety_plans_created
    // ========================================
    try {
      const { count: safetyPlans } = await supabaseAdmin
        .from('safety_plans')
        .select('*', { count: 'exact', head: true })

      metrics.push({
        metric_key: 'safety_plans_created',
        metric_category: 'safety',
        value_numeric: safetyPlans || 0,
        label_pt: 'Planos de Segurança',
        label_en: 'Safety Plans',
        description_pt: 'Planos de proteção criados',
        display_format: 'number',
        icon: 'Shield',
        color: 'emerald',
        visibility: 'public',
        is_featured: true,
        sort_order: 5
      })
    } catch (e) {
      errors.push('Erro ao calcular safety_plans_created')
    }

    // ========================================
    // MÉTRICA 7: chat_sessions_30d
    // ========================================
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: chatSessions } = await supabaseAdmin
        .from('ai_chat_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      metrics.push({
        metric_key: 'chat_sessions_30d',
        metric_category: 'engagement',
        value_numeric: chatSessions || 0,
        label_pt: 'Sessões de Chat (30 dias)',
        label_en: 'Chat Sessions (30 days)',
        description_pt: 'Conversas com o Coach IA nos últimos 30 dias',
        display_format: 'number',
        icon: 'MessageCircle',
        color: 'orange',
        visibility: 'public',
        is_featured: true,
        sort_order: 4
      })
    } catch (e) {
      errors.push('Erro ao calcular chat_sessions_30d')
    }

    // ========================================
    // UPSERT: Salvar todas as métricas
    // ========================================
    for (const metric of metrics) {
      try {
        await supabaseAdmin
          .from('content_insights')
          .upsert({
            metric_key: metric.metric_key,
            metric_category: metric.metric_category,
            value_numeric: metric.value_numeric,
            label_pt: metric.label_pt,
            label_en: metric.label_en,
            description_pt: metric.description_pt,
            display_format: metric.display_format,
            display_suffix: metric.display_suffix,
            icon: metric.icon,
            color: metric.color,
            visibility: metric.visibility,
            is_featured: metric.is_featured,
            sort_order: metric.sort_order,
            last_computed_at: now,
            updated_at: now
          }, {
            onConflict: 'metric_key'
          })
      } catch (e) {
        errors.push(`Erro ao salvar métrica ${metric.metric_key}`)
      }
    }

    console.log(`[CONTENT INSIGHTS] Recalculadas ${metrics.length} métricas, ${errors.length} erros`)

    return {
      success: errors.length === 0,
      metrics,
      errors
    }
  } catch (error) {
    console.error('[CONTENT INSIGHTS] Erro geral:', error)
    return {
      success: false,
      metrics,
      errors: [...errors, 'Erro geral ao recalcular métricas']
    }
  }
}

/**
 * Busca métricas públicas para exibição na frontpage
 */
export async function getPublicInsights(): Promise<InsightMetric[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_insights')
      .select('*')
      .eq('visibility', 'public')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[CONTENT INSIGHTS] Erro ao buscar públicas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[CONTENT INSIGHTS] Erro:', error)
    return []
  }
}
