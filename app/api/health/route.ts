/**
 * Health Check Endpoint
 * ETAPA 23 - Segurança Técnica & Observabilidade
 * 
 * Retorna status do sistema para monitoramento
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  uptime: number
  checks: {
    database: 'ok' | 'error'
    stripe: 'ok' | 'error' | 'not_configured'
    openai: 'ok' | 'error' | 'not_configured'
  }
  environment: string
}

// Tempo de início do servidor
const startTime = Date.now()

export async function GET() {
  const checks = {
    database: 'error' as 'ok' | 'error',
    stripe: 'not_configured' as 'ok' | 'error' | 'not_configured',
    openai: 'not_configured' as 'ok' | 'error' | 'not_configured'
  }

  // Verificar Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { error } = await supabase.from('user_profiles').select('count').limit(1)
      checks.database = error ? 'error' : 'ok'
    }
  } catch {
    checks.database = 'error'
  }

  // Verificar Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    checks.stripe = 'ok' // Apenas verifica se a chave existe
  }

  // Verificar OpenAI
  if (process.env.OPENAI_API_KEY) {
    checks.openai = 'ok' // Apenas verifica se a chave existe
  }

  // Determinar status geral
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  
  if (checks.database === 'error') {
    status = 'unhealthy'
  } else if (checks.stripe === 'error' || checks.openai === 'error') {
    status = 'degraded'
  }

  const health: HealthStatus = {
    status,
    version: process.env.npm_package_version || '1.0.22',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    environment: process.env.NODE_ENV || 'development'
  }

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
