/**
 * API do Oráculo V2 - IA de Suporte Interno
 * ETAPA 22 - Oráculo V2 Integrado
 * ETAPA 27 - Refatorado para usar ORACULO_V2_CORE
 * 
 * BLOCO 21-25: Apenas para ADMIN
 * BLOCO 26-30: Será expandido para outros perfis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { withRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { 
  callOraculo, 
  OraculoRequest as CoreRequest,
  OraculoUserRole 
} from '@/lib/oraculo-core'

// Tipos para a API (compatibilidade com requests externos)
interface ApiOraculoRequest {
  user_role?: string
  manual_context?: string
  language?: string
  url_atual?: string
  question: string
  plan?: string
}

// Cliente Supabase admin
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verificar se usuário é admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return false
  
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  return data?.role === 'ADMIN' || data?.role === 'SUPER_ADMIN'
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.security('Tentativa de acesso ao Oráculo sem autenticação', {
        route: '/api/oraculo-v2',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimit = withRateLimit(request, RATE_LIMITS.ORACULO, user.id)
    if (!rateLimit.success) {
      logger.warn('Rate limit excedido no Oráculo', {
        userId: user.id,
        route: '/api/oraculo-v2',
        retryAfter: rateLimit.retryAfter
      })
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimit)
        }
      )
    }

    // BLOCO 21-25: Apenas admin pode usar
    // BLOCO 26-30: Será expandido para outros perfis via oraculo-settings
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      logger.security('Tentativa de acesso ao Oráculo por não-admin', {
        userId: user.id,
        route: '/api/oraculo-v2'
      })
      return NextResponse.json(
        { error: 'Acesso restrito a administradores nesta versão' },
        { status: 403 }
      )
    }

    // Parsear request
    const body: ApiOraculoRequest = await request.json()
    
    if (!body.question || body.question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pergunta é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar se OpenAI está configurada
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI não configurada' },
        { status: 500 }
      )
    }

    // Preparar request para o ORACULO_V2_CORE
    const coreRequest: CoreRequest = {
      user_role: (body.user_role as OraculoUserRole) || 'admin',
      question: body.question,
      plan: body.plan,
      url_atual: body.url_atual,
      manual_context: body.manual_context,
      language: body.language || 'pt-BR'
    }

    // Chamar ORACULO_V2_CORE
    const result = await callOraculo(coreRequest, openaiKey)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao processar pergunta' },
        { status: 500 }
      )
    }

    // Registrar log no banco
    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin && result.response && result.meta) {
      try {
        await supabaseAdmin.rpc('log_oraculo_call', {
          p_user_id: user.id,
          p_user_role: coreRequest.user_role,
          p_plan: coreRequest.plan || null,
          p_url_atual: coreRequest.url_atual || null,
          p_question: coreRequest.question,
          p_resposta_json: result.response,
          p_tokens_input: result.meta.tokens_input,
          p_tokens_output: result.meta.tokens_output,
          p_latency_ms: result.meta.latency_ms,
          p_model_used: result.meta.model,
          p_manual_context: coreRequest.manual_context || null
        })
      } catch (logError) {
        // Log error but don't fail the request
        console.error('Erro ao registrar log do Oráculo:', logError)
      }
    }

    return NextResponse.json({
      success: true,
      response: result.response,
      meta: result.meta ? {
        latency_ms: result.meta.latency_ms,
        tokens_used: result.meta.tokens_input + result.meta.tokens_output,
        model: result.meta.model
      } : undefined
    })

  } catch (error) {
    console.error('Erro no Oráculo V2:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar pergunta',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
