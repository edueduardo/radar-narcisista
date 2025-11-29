/**
 * ANALYTICS TRACKER - Radar Narcisista
 * 
 * Rastreia métricas agregadas SEM dados pessoais
 * Foco em: Segurança, Performance, Feedback
 */

// Tipos de eventos
export type EventCategory = 
  | 'seguranca'      // Emergência, ESC, páginas de risco
  | 'funil'          // Teste, cadastro, conversão
  | 'uso'            // Diário, Chat, ferramentas
  | 'tecnico'        // Erros, performance
  | 'feedback'       // Ratings, thumbs

export interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number
  page?: string
  timestamp: string
  hour: number  // Para análise de horário
}

// Armazenamento local (em produção seria Supabase/API)
const STORAGE_KEY = 'rn_analytics_events'

// Obter eventos do storage
const getStoredEvents = (): AnalyticsEvent[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Salvar evento
const saveEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return
  try {
    const events = getStoredEvents()
    events.push(event)
    // Manter apenas últimos 7 dias
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const filtered = events.filter(e => new Date(e.timestamp).getTime() > weekAgo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error('Erro ao salvar analytics:', e)
  }
}

// ============================================
// FUNÇÕES DE TRACKING
// ============================================

/**
 * SEGURANÇA - Rastreia uso de recursos de emergência
 */
export const trackEmergency = (type: 'esc_exit' | 'call_190' | 'call_188' | 'call_180' | 'safety_page', page?: string) => {
  saveEvent({
    category: 'seguranca',
    action: type,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    timestamp: new Date().toISOString(),
    hour: new Date().getHours()
  })
  console.log(`🚨 Segurança: ${type} em ${page}`)
}

/**
 * FUNIL - Rastreia conversões
 */
export const trackFunnel = (step: 'view_home' | 'click_cta' | 'start_test' | 'complete_test' | 'signup' | 'first_diary' | 'first_chat') => {
  saveEvent({
    category: 'funil',
    action: step,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    timestamp: new Date().toISOString(),
    hour: new Date().getHours()
  })
}

/**
 * USO - Rastreia uso de ferramentas
 */
export const trackUsage = (tool: 'diary_entry' | 'chat_message' | 'voice_record' | 'test_question', value?: number) => {
  saveEvent({
    category: 'uso',
    action: tool,
    value,
    timestamp: new Date().toISOString(),
    hour: new Date().getHours()
  })
}

/**
 * TÉCNICO - Rastreia erros e performance
 */
export const trackTechnical = (
  type: 'error' | 'slow_response' | 'drop_off',
  details: { route?: string; duration?: number; errorCode?: number }
) => {
  saveEvent({
    category: 'tecnico',
    action: type,
    label: details.route,
    value: details.duration || details.errorCode,
    timestamp: new Date().toISOString(),
    hour: new Date().getHours()
  })
}

/**
 * FEEDBACK - Rastreia avaliações (SEM texto sensível)
 */
export const trackFeedback = (
  type: 'test_rating' | 'chat_thumbs' | 'diary_ease',
  rating: number, // 1-5 ou 0/1 para thumbs
  feature: string
) => {
  saveEvent({
    category: 'feedback',
    action: type,
    label: feature,
    value: rating,
    timestamp: new Date().toISOString(),
    hour: new Date().getHours()
  })
}

// ============================================
// FUNÇÕES DE AGREGAÇÃO (para dashboard)
// ============================================

export interface AggregatedMetrics {
  // Segurança
  seguranca: {
    total_emergencias: number
    por_tipo: Record<string, number>
    por_pagina: Record<string, number>
    por_hora: Record<number, number>
    pico_horario: number
  }
  // Funil
  funil: {
    sessoes: number
    cliques_cta: number
    testes_iniciados: number
    testes_concluidos: number
    contas_criadas: number
    primeiro_diario: number
    primeiro_chat: number
  }
  // Técnico
  tecnico: {
    total_erros: number
    erros_por_rota: Record<string, number>
    tempo_medio_resposta: number
    drop_offs: number
  }
  // Feedback
  feedback: {
    rating_medio_teste: number
    thumbs_up_chat: number
    thumbs_down_chat: number
    facilidade_diario: number
  }
  // Meta
  periodo: { inicio: string; fim: string }
  total_eventos: number
}

export const getAggregatedMetrics = (): AggregatedMetrics => {
  const events = getStoredEvents()
  
  // Segurança
  const segurancaEvents = events.filter(e => e.category === 'seguranca')
  const porTipo: Record<string, number> = {}
  const porPagina: Record<string, number> = {}
  const porHora: Record<number, number> = {}
  
  segurancaEvents.forEach(e => {
    porTipo[e.action] = (porTipo[e.action] || 0) + 1
    if (e.page) porPagina[e.page] = (porPagina[e.page] || 0) + 1
    porHora[e.hour] = (porHora[e.hour] || 0) + 1
  })
  
  const picoHorario = Number(Object.entries(porHora).sort((a, b) => b[1] - a[1])[0]?.[0] || 0)

  // Funil
  const funilEvents = events.filter(e => e.category === 'funil')
  const contarFunil = (action: string) => funilEvents.filter(e => e.action === action).length

  // Técnico
  const tecnicoEvents = events.filter(e => e.category === 'tecnico')
  const errosPorRota: Record<string, number> = {}
  let somaTempos = 0, contTempos = 0
  
  tecnicoEvents.forEach(e => {
    if (e.action === 'error' && e.label) {
      errosPorRota[e.label] = (errosPorRota[e.label] || 0) + 1
    }
    if (e.action === 'slow_response' && e.value) {
      somaTempos += e.value
      contTempos++
    }
  })

  // Feedback
  const feedbackEvents = events.filter(e => e.category === 'feedback')
  const testRatings = feedbackEvents.filter(e => e.action === 'test_rating').map(e => e.value || 0)
  const chatThumbsUp = feedbackEvents.filter(e => e.action === 'chat_thumbs' && e.value === 1).length
  const chatThumbsDown = feedbackEvents.filter(e => e.action === 'chat_thumbs' && e.value === 0).length
  const diaryEase = feedbackEvents.filter(e => e.action === 'diary_ease').map(e => e.value || 0)

  const agora = new Date()
  const semanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    seguranca: {
      total_emergencias: segurancaEvents.length,
      por_tipo: porTipo,
      por_pagina: porPagina,
      por_hora: porHora,
      pico_horario: picoHorario
    },
    funil: {
      sessoes: contarFunil('view_home'),
      cliques_cta: contarFunil('click_cta'),
      testes_iniciados: contarFunil('start_test'),
      testes_concluidos: contarFunil('complete_test'),
      contas_criadas: contarFunil('signup'),
      primeiro_diario: contarFunil('first_diary'),
      primeiro_chat: contarFunil('first_chat')
    },
    tecnico: {
      total_erros: tecnicoEvents.filter(e => e.action === 'error').length,
      erros_por_rota: errosPorRota,
      tempo_medio_resposta: contTempos > 0 ? Math.round(somaTempos / contTempos) : 0,
      drop_offs: tecnicoEvents.filter(e => e.action === 'drop_off').length
    },
    feedback: {
      rating_medio_teste: testRatings.length > 0 ? Math.round((testRatings.reduce((a, b) => a + b, 0) / testRatings.length) * 10) / 10 : 0,
      thumbs_up_chat: chatThumbsUp,
      thumbs_down_chat: chatThumbsDown,
      facilidade_diario: diaryEase.length > 0 ? Math.round((diaryEase.reduce((a, b) => a + b, 0) / diaryEase.length) * 10) / 10 : 0
    },
    periodo: {
      inicio: semanaAtras.toISOString(),
      fim: agora.toISOString()
    },
    total_eventos: events.length
  }
}

// ============================================
// FUNÇÕES DE EXPORTAÇÃO (para IA)
// ============================================

export const exportMetricsForAI = (): string => {
  const metrics = getAggregatedMetrics()
  
  return JSON.stringify({
    resumo: {
      periodo: metrics.periodo,
      total_eventos: metrics.total_eventos,
      emergencias_hoje: metrics.seguranca.total_emergencias,
      conversao_funil: metrics.funil.testes_concluidos > 0 
        ? Math.round((metrics.funil.testes_concluidos / metrics.funil.sessoes) * 100 * 100) / 100
        : 0,
      rating_medio: metrics.feedback.rating_medio_teste,
      erros_tecnicos: metrics.tecnico.total_erros
    },
    seguranca: {
      total: metrics.seguranca.total_emergencias,
      tipos: metrics.seguranca.por_tipo,
      paginas_criticas: metrics.seguranca.por_pagina,
      pico_horario: metrics.seguranca.pico_horario
    },
    funil: metrics.funil,
    tecnico: {
      erros: metrics.tecnico.total_erros,
      rotas_com_erro: metrics.tecnico.erros_por_rota,
      performance_ms: metrics.tecnico.tempo_medio_resposta,
      abandonos: metrics.tecnico.drop_offs
    },
    feedback: metrics.feedback
  }, null, 2)
}

// ============================================
// LOG DA IA (AUDITORIA)
// ============================================

export interface IAExecutionLog {
  id: string
  timestamp: string
  model: 'openai' | 'anthropic' | 'groq'
  metrics_analyzed: string
  suggestions_generated: number
  suggestions_text: string[]
  status: 'success' | 'error' | 'partial'
  error_message?: string
}

const LOG_KEY = 'rn_ai_execution_logs'

export const saveIALog = (log: IAExecutionLog) => {
  if (typeof window === 'undefined') return
  try {
    const logs = getIALogs()
    logs.unshift(log)
    // Manter apenas últimos 30 logs
    const trimmed = logs.slice(0, 30)
    localStorage.setItem(LOG_KEY, JSON.stringify(trimmed))
  } catch (e) {
    console.error('Erro ao salvar log IA:', e)
  }
}

export const getIALogs = (): IAExecutionLog[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LOG_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}
