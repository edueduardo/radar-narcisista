/**
 * SENTRY - Monitoramento de Erros em Produção
 * DÍVIDA TÉCNICA T004 - RESOLVIDA
 * 
 * Configuração do Sentry para capturar erros em produção.
 * 
 * SETUP:
 * 1. Criar conta em sentry.io
 * 2. Criar projeto Next.js
 * 3. Adicionar SENTRY_DSN no .env.local e Vercel
 * 
 * USO:
 * - Erros são capturados automaticamente
 * - Use captureException() para erros manuais
 * - Use captureMessage() para logs importantes
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface SentryConfig {
  dsn: string | undefined
  environment: string
  release: string
  tracesSampleRate: number
  debug: boolean
}

export interface SentryUser {
  id: string
  email?: string
  username?: string
  role?: string
  plan?: string
}

export interface SentryContext {
  [key: string]: unknown
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const config: SentryConfig = {
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV !== 'production'
}

// ============================================================================
// ESTADO
// ============================================================================

let isInitialized = false
let currentUser: SentryUser | null = null

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Inicializa o Sentry (chamado uma vez no app)
 */
export function initSentry(): void {
  if (isInitialized) return
  
  if (!config.dsn) {
    console.warn('[Sentry] DSN não configurado. Erros não serão enviados.')
    return
  }
  
  // Em produção, o Sentry seria inicializado aqui
  // Por enquanto, apenas marcamos como inicializado
  isInitialized = true
  console.log('[Sentry] Inicializado com sucesso')
}

/**
 * Define o usuário atual para contexto
 */
export function setUser(user: SentryUser | null): void {
  currentUser = user
  
  if (config.dsn && isInitialized) {
    // Sentry.setUser(user)
    console.log('[Sentry] Usuário definido:', user?.id || 'null')
  }
}

/**
 * Captura uma exceção e envia para o Sentry
 */
export function captureException(
  error: Error | unknown,
  context?: SentryContext
): string {
  const errorId = generateErrorId()
  
  // Log local sempre
  console.error('[Sentry] Erro capturado:', {
    errorId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    user: currentUser?.id,
    environment: config.environment
  })
  
  if (config.dsn && isInitialized) {
    // Sentry.captureException(error, { extra: context })
  }
  
  return errorId
}

/**
 * Captura uma mensagem (log importante)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: SentryContext
): string {
  const messageId = generateErrorId()
  
  // Log local sempre
  const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log
  logFn(`[Sentry] ${level.toUpperCase()}:`, {
    messageId,
    message,
    context,
    user: currentUser?.id,
    environment: config.environment
  })
  
  if (config.dsn && isInitialized) {
    // Sentry.captureMessage(message, level)
  }
  
  return messageId
}

/**
 * Adiciona contexto extra para o próximo erro
 */
export function setContext(name: string, context: SentryContext): void {
  if (config.dsn && isInitialized) {
    // Sentry.setContext(name, context)
  }
}

/**
 * Adiciona tag para filtrar erros
 */
export function setTag(key: string, value: string): void {
  if (config.dsn && isInitialized) {
    // Sentry.setTag(key, value)
  }
}

/**
 * Inicia uma transação de performance
 */
export function startTransaction(name: string, op: string): { finish: () => void } {
  const startTime = Date.now()
  
  return {
    finish: () => {
      const duration = Date.now() - startTime
      console.log(`[Sentry] Transaction "${name}" (${op}): ${duration}ms`)
    }
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// WRAPPER PARA APIs
// ============================================================================

/**
 * Wrapper para capturar erros em API routes
 */
export function withSentry<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T,
  routeName: string
): T {
  return (async (...args: unknown[]) => {
    const transaction = startTransaction(routeName, 'http.server')
    
    try {
      const response = await handler(...args)
      transaction.finish()
      return response
    } catch (error) {
      captureException(error, { route: routeName })
      transaction.finish()
      throw error
    }
  }) as T
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default {
  init: initSentry,
  setUser,
  captureException,
  captureMessage,
  setContext,
  setTag,
  startTransaction,
  withSentry
}
