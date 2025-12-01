/**
 * Hook para Tracking de Eventos Beta
 * ETAPA 15 - Beta com 5 Usuárias
 * 
 * Uso:
 * const { trackEvent } = useBetaTracking()
 * trackEvent('test_completed', { score: 85 })
 */

import { useCallback, useEffect, useRef } from 'react'

interface TrackEventOptions {
  page_path?: string
  session_id?: string
}

// Gerar ID de sessão único
const getSessionId = () => {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('beta_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('beta_session_id', sessionId)
  }
  return sessionId
}

export function useBetaTracking() {
  const sessionId = useRef<string>('')

  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  const trackEvent = useCallback(async (
    event_type: string,
    event_data?: Record<string, any>,
    options?: TrackEventOptions
  ) => {
    try {
      // Não bloquear a UI - fire and forget
      fetch('/api/beta/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type,
          event_data,
          page_path: options?.page_path || (typeof window !== 'undefined' ? window.location.pathname : ''),
          session_id: options?.session_id || sessionId.current,
        }),
      }).catch(() => {
        // Silenciar erros de tracking
      })
    } catch {
      // Silenciar erros de tracking
    }
  }, [])

  // Tracking automático de page view
  const trackPageView = useCallback((pageName?: string) => {
    trackEvent('page_view', { page_name: pageName })
  }, [trackEvent])

  // Tracking de erro
  const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
    trackEvent('error_occurred', {
      error_message: typeof error === 'string' ? error : error.message,
      error_stack: typeof error === 'object' ? error.stack : undefined,
      ...context,
    })
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackError,
    sessionId: sessionId.current,
  }
}

// Eventos pré-definidos para facilitar uso
export const BETA_EVENTS = {
  // Teste de Clareza
  TEST_STARTED: 'test_started',
  TEST_COMPLETED: 'test_completed',
  TEST_ABANDONED: 'test_abandoned',
  
  // Diário
  DIARY_CREATED: 'diary_created',
  DIARY_EDITED: 'diary_edited',
  DIARY_DELETED: 'diary_deleted',
  
  // Chat
  CHAT_STARTED: 'chat_started',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  
  // Segurança
  SAFETY_PLAN_VIEWED: 'safety_plan_viewed',
  EMERGENCY_CONTACT_CLICKED: 'emergency_contact_clicked',
  
  // Exportação
  EXPORT_PDF: 'export_pdf',
  EXPORT_CSV: 'export_csv',
  
  // Comercial
  PLAN_VIEWED: 'plan_viewed',
  ADDON_CLICKED: 'addon_clicked',
  CHECKOUT_STARTED: 'checkout_started',
  
  // Geral
  PAGE_VIEW: 'page_view',
  ERROR_OCCURRED: 'error_occurred',
  FEEDBACK_SENT: 'feedback_sent',
} as const
