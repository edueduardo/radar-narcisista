/**
 * Logger Estruturado - Observabilidade
 * ETAPA 23 - Segurança Técnica & Observabilidade
 * 
 * Logger simples e estruturado para Next.js
 * Formato JSON para fácil parsing em ferramentas de log
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  route?: string
  method?: string
  ip?: string
  userAgent?: string
  duration?: number
  statusCode?: number
  error?: Error | string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  environment: string
}

/**
 * Determina se deve logar baseado no nível
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
  const minLevel = process.env.LOG_LEVEL as LogLevel || 'info'
  
  return levels.indexOf(level) >= levels.indexOf(minLevel)
}

/**
 * Formata entrada de log
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? sanitizeContext(context) : undefined,
    environment: process.env.NODE_ENV || 'development'
  }
}

/**
 * Sanitiza contexto removendo dados sensíveis
 */
function sanitizeContext(context: LogContext): LogContext {
  const sanitized = { ...context }
  
  // Remover campos sensíveis
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization']
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  // Sanitizar erro
  if (sanitized.error instanceof Error) {
    sanitized.error = {
      name: sanitized.error.name,
      message: sanitized.error.message,
      stack: sanitized.error.stack?.split('\n').slice(0, 5).join('\n')
    } as any
  }
  
  return sanitized
}

/**
 * Escreve log no console
 */
function writeLog(entry: LogEntry): void {
  const output = JSON.stringify(entry)
  
  switch (entry.level) {
    case 'error':
      console.error(output)
      break
    case 'warn':
      console.warn(output)
      break
    case 'debug':
      console.debug(output)
      break
    default:
      console.log(output)
  }
}

/**
 * Logger principal
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      writeLog(formatLog('debug', message, context))
    }
  },
  
  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      writeLog(formatLog('info', message, context))
    }
  },
  
  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      writeLog(formatLog('warn', message, context))
    }
  },
  
  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
      writeLog(formatLog('error', message, context))
    }
  },
  
  /**
   * Log de requisição HTTP
   */
  request(request: Request, context?: Partial<LogContext>): void {
    const url = new URL(request.url)
    
    this.info('HTTP Request', {
      route: url.pathname,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      ...context
    })
  },
  
  /**
   * Log de resposta HTTP
   */
  response(
    request: Request, 
    statusCode: number, 
    duration: number,
    context?: Partial<LogContext>
  ): void {
    const url = new URL(request.url)
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    
    this[level]('HTTP Response', {
      route: url.pathname,
      method: request.method,
      statusCode,
      duration,
      ...context
    })
  },
  
  /**
   * Log de erro de API
   */
  apiError(route: string, error: Error | string, context?: Partial<LogContext>): void {
    this.error('API Error', {
      route,
      error,
      ...context
    })
  },
  
  /**
   * Log de ação de usuário
   */
  userAction(action: string, userId: string, context?: Partial<LogContext>): void {
    this.info('User Action', {
      userId,
      action,
      ...context
    })
  },
  
  /**
   * Log de segurança
   */
  security(event: string, context?: LogContext): void {
    this.warn('Security Event', {
      event,
      ...context
    })
  }
}

/**
 * Helper para medir duração
 */
export function measureDuration(): () => number {
  const start = Date.now()
  return () => Date.now() - start
}

/**
 * Wrapper para logar erros de funções async
 */
export async function withLogging<T>(
  name: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const getDuration = measureDuration()
  
  try {
    const result = await fn()
    logger.info(`${name} completed`, { ...context, duration: getDuration() })
    return result
  } catch (error) {
    logger.error(`${name} failed`, { 
      ...context, 
      error: error as Error,
      duration: getDuration() 
    })
    throw error
  }
}
