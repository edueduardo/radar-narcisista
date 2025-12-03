/**
 * PINO LOGGER - Logs Estruturados em JSON
 * DÍVIDA TÉCNICA T003 - RESOLVIDA
 * 
 * Logger estruturado para produção com formato JSON.
 * Compatível com serviços de log como Datadog, Logtail, etc.
 * 
 * USO:
 * import logger from '@/lib/pino-logger'
 * logger.info({ userId: '123' }, 'Usuário logou')
 * logger.error({ error }, 'Erro ao processar')
 */

// ============================================================================
// TIPOS
// ============================================================================

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  time: string
  msg: string
  context?: LogContext
  // Campos padrão
  env?: string
  version?: string
  service?: string
  // Request context
  requestId?: string
  userId?: string
  path?: string
  method?: string
  statusCode?: number
  duration?: number
  // Error context
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
}

const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const SERVICE_NAME = process.env.SERVICE_NAME || 'radar-narcisista'
const VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local'
const ENV = process.env.NODE_ENV || 'development'

// ============================================================================
// CLASSE LOGGER
// ============================================================================

class PinoLogger {
  private minLevel: number
  private defaultContext: LogContext

  constructor() {
    this.minLevel = LOG_LEVELS[MIN_LEVEL]
    this.defaultContext = {
      service: SERVICE_NAME,
      version: VERSION,
      env: ENV
    }
  }

  /**
   * Verifica se o nível deve ser logado
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel
  }

  /**
   * Formata e envia o log
   */
  private log(level: LogLevel, context: LogContext | string, message?: string): void {
    if (!this.shouldLog(level)) return

    // Normalizar argumentos
    let ctx: LogContext = {}
    let msg: string = ''

    if (typeof context === 'string') {
      msg = context
    } else {
      ctx = context
      msg = message || ''
    }

    // Construir entry
    const entry: LogEntry = {
      level,
      time: new Date().toISOString(),
      msg,
      ...this.defaultContext,
      ...ctx
    }

    // Formatar erro se presente
    if (ctx.error instanceof Error) {
      entry.error = {
        name: ctx.error.name,
        message: ctx.error.message,
        stack: ctx.error.stack
      }
      delete entry.context?.error
    }

    // Output
    const output = JSON.stringify(entry)
    
    if (level === 'error' || level === 'fatal') {
      console.error(output)
    } else if (level === 'warn') {
      console.warn(output)
    } else {
      console.log(output)
    }
  }

  // ============================================================================
  // MÉTODOS DE LOG
  // ============================================================================

  trace(context: LogContext | string, message?: string): void {
    this.log('trace', context, message)
  }

  debug(context: LogContext | string, message?: string): void {
    this.log('debug', context, message)
  }

  info(context: LogContext | string, message?: string): void {
    this.log('info', context, message)
  }

  warn(context: LogContext | string, message?: string): void {
    this.log('warn', context, message)
  }

  error(context: LogContext | string, message?: string): void {
    this.log('error', context, message)
  }

  fatal(context: LogContext | string, message?: string): void {
    this.log('fatal', context, message)
  }

  // ============================================================================
  // MÉTODOS ESPECIALIZADOS
  // ============================================================================

  /**
   * Log de requisição HTTP
   */
  request(req: {
    method: string
    path: string
    requestId?: string
    userId?: string
    ip?: string
    userAgent?: string
  }): void {
    this.info({
      type: 'request',
      method: req.method,
      path: req.path,
      requestId: req.requestId,
      userId: req.userId,
      ip: req.ip,
      userAgent: req.userAgent
    }, `${req.method} ${req.path}`)
  }

  /**
   * Log de resposta HTTP
   */
  response(res: {
    method: string
    path: string
    statusCode: number
    duration: number
    requestId?: string
  }): void {
    const level: LogLevel = res.statusCode >= 500 ? 'error' : 
                           res.statusCode >= 400 ? 'warn' : 'info'
    
    this.log(level, {
      type: 'response',
      method: res.method,
      path: res.path,
      statusCode: res.statusCode,
      duration: res.duration,
      requestId: res.requestId
    }, `${res.method} ${res.path} ${res.statusCode} ${res.duration}ms`)
  }

  /**
   * Log de erro de API
   */
  apiError(error: Error, context: {
    path: string
    method: string
    userId?: string
    requestId?: string
    statusCode?: number
  }): void {
    this.error({
      type: 'api_error',
      error,
      ...context
    }, `API Error: ${error.message}`)
  }

  /**
   * Log de ação do usuário
   */
  userAction(action: string, context: {
    userId: string
    details?: LogContext
  }): void {
    this.info({
      type: 'user_action',
      action,
      userId: context.userId,
      ...context.details
    }, `User action: ${action}`)
  }

  /**
   * Log de segurança
   */
  security(event: string, context: {
    userId?: string
    ip?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details?: LogContext
  }): void {
    const level: LogLevel = context.severity === 'critical' ? 'fatal' :
                           context.severity === 'high' ? 'error' :
                           context.severity === 'medium' ? 'warn' : 'info'
    
    this.log(level, {
      type: 'security',
      event,
      severity: context.severity,
      userId: context.userId,
      ip: context.ip,
      ...context.details
    }, `Security: ${event}`)
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    const level: LogLevel = duration > 5000 ? 'warn' : 
                           duration > 1000 ? 'info' : 'debug'
    
    this.log(level, {
      type: 'performance',
      operation,
      duration,
      ...context
    }, `${operation}: ${duration}ms`)
  }

  /**
   * Log de IA/Oráculo
   */
  oraculo(event: string, context: {
    userId?: string
    role?: string
    tokens?: number
    duration?: number
    model?: string
    success: boolean
    error?: Error
  }): void {
    const level: LogLevel = context.error ? 'error' : 'info'
    
    this.log(level, {
      type: 'oraculo',
      event,
      ...context,
      error: context.error
    }, `Oráculo: ${event}`)
  }

  /**
   * Cria um child logger com contexto adicional
   */
  child(context: LogContext): PinoLogger {
    const child = new PinoLogger()
    child.defaultContext = { ...this.defaultContext, ...context }
    return child
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

const logger = new PinoLogger()

export default logger

// ============================================================================
// EXPORTAÇÕES NOMEADAS
// ============================================================================

export { PinoLogger }
export const trace = logger.trace.bind(logger)
export const debug = logger.debug.bind(logger)
export const info = logger.info.bind(logger)
export const warn = logger.warn.bind(logger)
export const error = logger.error.bind(logger)
export const fatal = logger.fatal.bind(logger)
