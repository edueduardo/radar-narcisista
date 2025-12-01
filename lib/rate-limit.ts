/**
 * Rate Limiting - Proteção contra abuso
 * ETAPA 23 - Segurança Técnica & Observabilidade
 * 
 * Implementação simples em memória para Next.js
 * Em produção, considerar usar Redis para persistência entre instâncias
 */

// Armazenamento em memória (por instância)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Limpar entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Limpar a cada minuto

export interface RateLimitConfig {
  maxRequests: number      // Máximo de requisições
  windowMs: number         // Janela de tempo em ms
  identifier?: string      // Identificador adicional (ex: userId)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number      // Segundos até poder tentar novamente
}

/**
 * Verifica rate limit para uma chave
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const fullKey = config.identifier ? `${key}:${config.identifier}` : key
  
  const entry = rateLimitStore.get(fullKey)
  
  // Se não existe ou expirou, criar nova entrada
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(fullKey, {
      count: 1,
      resetTime: now + config.windowMs
    })
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }
  
  // Verificar se excedeu o limite
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter
    }
  }
  
  // Incrementar contador
  entry.count++
  rateLimitStore.set(fullKey, entry)
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Configurações pré-definidas para diferentes rotas
 */
export const RATE_LIMITS = {
  // Rotas de IA - mais restritivas
  AI: {
    maxRequests: 10,
    windowMs: 60 * 1000 // 10 req/min
  },
  
  // Oráculo V2
  ORACULO: {
    maxRequests: 10,
    windowMs: 60 * 1000 // 10 req/min
  },
  
  // Login/Signup - proteção contra brute force
  AUTH: {
    maxRequests: 5,
    windowMs: 60 * 1000 // 5 tentativas/min
  },
  
  // APIs gerais
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000 // 100 req/min
  },
  
  // Webhooks - mais permissivo
  WEBHOOK: {
    maxRequests: 200,
    windowMs: 60 * 1000 // 200 req/min
  }
}

/**
 * Helper para extrair IP do request
 */
export function getClientIP(request: Request): string {
  // Tentar headers comuns de proxy
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback
  return 'unknown'
}

/**
 * Middleware helper para aplicar rate limit
 */
export function withRateLimit(
  request: Request,
  config: RateLimitConfig,
  userId?: string
): RateLimitResult {
  const ip = getClientIP(request)
  const key = userId ? `user:${userId}` : `ip:${ip}`
  
  return checkRateLimit(key, {
    ...config,
    identifier: userId
  })
}

/**
 * Gera headers de rate limit para resposta
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString()
  }
  
  if (!result.success && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }
  
  return headers
}
