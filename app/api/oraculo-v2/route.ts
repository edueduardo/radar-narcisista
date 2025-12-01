/**
 * API do Oráculo V2 - IA de Suporte Interno
 * ETAPA 22 - Oráculo V2 Integrado
 * 
 * BLOCO 21-25: Apenas para ADMIN
 * BLOCO 26-30: Será expandido para outros perfis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { withRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Tipos
interface OraculoRequest {
  user_role?: string
  manual_context?: string
  language?: string
  url_atual?: string
  question: string
  plan?: string
}

interface OraculoResponse {
  modo: 'analise' | 'sugestao' | 'alerta' | 'explicacao'
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  titulo_curto: string
  resposta_principal: string
  passos: string[]
  links_sugeridos: { label: string; url: string }[]
  mensagem_final_seguranca?: string
}

// System prompt do Oráculo V2
const ORACULO_SYSTEM_PROMPT = `Você é o ORÁCULO V2, a IA de suporte interno do Radar Narcisista.

CONTEXTO DO PRODUTO:
- Radar Narcisista é um SaaS brasileiro de apoio a vítimas de relacionamentos abusivos
- Funcionalidades: Teste de Clareza, Diário de Episódios, Chat/Coach IA, Plano de Segurança
- Stack: Next.js 16, Supabase, Stripe, TailwindCSS
- Planos: Gratuito, Essencial, Premium, Profissional

SEU PAPEL:
Você ajuda o ADMIN a entender o produto, métricas, erros e tomar decisões.

REGRAS:
1. Responda SEMPRE em português brasileiro
2. Seja direto e objetivo
3. Use dados quando disponíveis
4. Sugira ações concretas
5. Identifique riscos e prioridades
6. NUNCA invente dados - se não souber, diga

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "modo": "analise" | "sugestao" | "alerta" | "explicacao",
  "risco": "baixo" | "medio" | "alto" | "critico",
  "titulo_curto": "string (max 50 chars)",
  "resposta_principal": "string (resposta detalhada)",
  "passos": ["passo 1", "passo 2", ...],
  "links_sugeridos": [{"label": "string", "url": "string"}],
  "mensagem_final_seguranca": "string (apenas se risco alto/critico)"
}

IMPORTANTE: Responda APENAS com o JSON, sem texto adicional.`

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
  const startTime = Date.now()
  
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
    const body: OraculoRequest = await request.json()
    
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

    const openai = new OpenAI({ apiKey: openaiKey })

    // Montar contexto
    const userContext = `
CONTEXTO DA PERGUNTA:
- Perfil: ${body.user_role || 'admin'}
- Plano: ${body.plan || 'não informado'}
- Página atual: ${body.url_atual || 'não informada'}
- Idioma: ${body.language || 'pt-BR'}
${body.manual_context ? `- Contexto adicional: ${body.manual_context}` : ''}

PERGUNTA:
${body.question}
`

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ORACULO_SYSTEM_PROMPT },
        { role: 'user', content: userContext }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content || ''
    let oraculoResponse: OraculoResponse

    try {
      oraculoResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Erro ao parsear resposta do Oráculo:', parseError)
      oraculoResponse = {
        modo: 'explicacao',
        risco: 'baixo',
        titulo_curto: 'Resposta do Oráculo',
        resposta_principal: responseText,
        passos: [],
        links_sugeridos: []
      }
    }

    // Calcular métricas
    const latencyMs = Date.now() - startTime
    const tokensInput = completion.usage?.prompt_tokens || 0
    const tokensOutput = completion.usage?.completion_tokens || 0

    // Registrar log no banco
    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      await supabaseAdmin.rpc('log_oraculo_call', {
        p_user_id: user.id,
        p_user_role: body.user_role || 'admin',
        p_plan: body.plan || null,
        p_url_atual: body.url_atual || null,
        p_question: body.question,
        p_resposta_json: oraculoResponse,
        p_tokens_input: tokensInput,
        p_tokens_output: tokensOutput,
        p_latency_ms: latencyMs,
        p_model_used: 'gpt-4o-mini',
        p_manual_context: body.manual_context || null
      })
    }

    return NextResponse.json({
      success: true,
      response: oraculoResponse,
      meta: {
        latency_ms: latencyMs,
        tokens_used: tokensInput + tokensOutput,
        model: 'gpt-4o-mini'
      }
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
