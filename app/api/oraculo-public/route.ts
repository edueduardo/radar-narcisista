/**
 * API Pública do Oráculo para Whitelabel
 * ETAPA 34 - Integração com Gerador de SaaS
 * ETAPA 36 - Sistema de API Keys
 * ETAPA 39 - Logs Detalhados de Uso
 * 
 * Esta API permite que instâncias whitelabel consumam o Oráculo
 * sem precisar de autenticação Supabase, usando API keys
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callOraculo, OraculoUserRole, OraculoInstanceConfig } from '@/lib/oraculo-core'
import { getInstanceConfig, registerInstanceUsage } from '@/lib/oraculo-instances'
import { validateApiKey as validateKey, logApiKeyUsage, ApiKeyValidation } from '@/lib/oraculo-api-keys'
import { createUsageLog } from '@/lib/oraculo-usage-logs'

// Rate limiting simples em memória
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// Cliente Supabase admin
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ETAPA 36: Validar API key usando o novo sistema
async function validateApiKeyFull(apiKey: string): Promise<ApiKeyValidation> {
  return validateKey(apiKey)
}

// Validar domínio
function validateDomain(origin: string | null, allowedDomains: string[] | null): boolean {
  // Se não há restrição de domínios, aceitar qualquer origem
  if (!allowedDomains || allowedDomains.length === 0) {
    return true
  }
  
  if (!origin) {
    return false
  }
  
  try {
    const url = new URL(origin)
    return allowedDomains.some(domain => {
      // Suportar wildcards simples
      if (domain.startsWith('*.')) {
        const baseDomain = domain.slice(2)
        return url.hostname.endsWith(baseDomain)
      }
      return url.hostname === domain
    })
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let apiKeyValidation: ApiKeyValidation | null = null
  
  try {
    // Extrair headers
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
    const origin = request.headers.get('origin')
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    let instanceSlug = request.nextUrl.searchParams.get('instance') || 'radar-narcisista'
    
    // ETAPA 36: Validar API key se fornecida
    let rateLimit = 30 // padrão
    if (apiKey) {
      apiKeyValidation = await validateApiKeyFull(apiKey)
      
      if (!apiKeyValidation.is_valid) {
        return NextResponse.json(
          { error: apiKeyValidation.error_message || 'API key inválida' },
          { status: 401 }
        )
      }
      
      // Usar instância da API key
      if (apiKeyValidation.instance_slug) {
        instanceSlug = apiKeyValidation.instance_slug
      }
      
      // Usar rate limit da API key
      if (apiKeyValidation.rate_limit_per_minute) {
        rateLimit = apiKeyValidation.rate_limit_per_minute
      }
    }
    
    // Rate limiting por IP/API key
    const clientId = apiKey || clientIp
    if (!checkRateLimit(clientId, rateLimit, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit excedido. Tente novamente em 1 minuto.' },
        { status: 429 }
      )
    }
    
    // Buscar configuração da instância
    const body = await request.json()
    let userRole = (body.user_role as OraculoUserRole) || 'usuaria'
    
    // ETAPA 36: Verificar se o role é permitido pela API key
    if (apiKeyValidation?.allowed_roles && !apiKeyValidation.allowed_roles.includes(userRole)) {
      return NextResponse.json(
        { error: `Role '${userRole}' não permitido para esta API key` },
        { status: 403 }
      )
    }
    
    const instanceConfig = await getInstanceConfig(instanceSlug, userRole)
    
    if (!instanceConfig) {
      return NextResponse.json(
        { error: 'Instância não encontrada ou inativa' },
        { status: 404 }
      )
    }
    
    // Validar domínio (se configurado e não usando API key)
    const supabase = getSupabaseAdmin()
    if (supabase && !apiKey) {
      const { data: instance } = await supabase
        .from('oraculo_instances')
        .select('dominios_permitidos')
        .eq('instance_slug', instanceSlug)
        .single()
      
      if (instance?.dominios_permitidos && !validateDomain(origin, instance.dominios_permitidos)) {
        return NextResponse.json(
          { error: 'Domínio não autorizado' },
          { status: 403 }
        )
      }
    }
    
    // Validar pergunta
    if (!body.question || body.question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pergunta é obrigatória' },
        { status: 400 }
      )
    }
    
    if (body.question.length > 2000) {
      return NextResponse.json(
        { error: 'Pergunta muito longa (máximo 2000 caracteres)' },
        { status: 400 }
      )
    }
    
    // Verificar API key da OpenAI
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível' },
        { status: 503 }
      )
    }
    
    // Preparar configuração para o core
    const coreInstanceConfig: OraculoInstanceConfig = {
      instance_slug: instanceConfig.instance_slug,
      instance_name: instanceConfig.instance_name,
      modelo_ia: instanceConfig.modelo_ia,
      temperatura: instanceConfig.temperatura,
      max_tokens: instanceConfig.max_tokens,
      nome_assistente: instanceConfig.nome_assistente,
      tom_comunicacao: instanceConfig.tom_comunicacao as 'acolhedor' | 'profissional' | 'tecnico' | 'casual',
      prompt_base_override: instanceConfig.prompt_base_override,
      prompt_adicional: instanceConfig.prompt_adicional,
      prompt_perfil: instanceConfig.prompt_perfil,
      contexto_produto: instanceConfig.contexto_produto,
      contexto_empresa: instanceConfig.contexto_empresa,
      cor_primaria: instanceConfig.cor_primaria,
      cor_secundaria: instanceConfig.cor_secundaria
    }
    
    // Chamar Oráculo
    const result = await callOraculo(
      {
        user_role: userRole,
        question: body.question,
        url_atual: body.context?.url_atual,
        manual_context: body.context?.manual_context,
        instance_slug: instanceSlug
      },
      openaiKey,
      {
        instanceConfig: coreInstanceConfig
      }
    )
    
    // Calcular latência
    const latencyMs = Date.now() - startTime
    
    // Registrar uso
    if (result.success && result.meta) {
      await registerInstanceUsage(
        instanceConfig.instance_id,
        result.meta.tokens_input,
        result.meta.tokens_output
      )
    }
    
    // ETAPA 39: Registrar log detalhado
    await createUsageLog({
      instance_id: instanceConfig.instance_id,
      user_role: userRole,
      question: body.question,
      response_text: result.success ? result.response?.resposta_principal : undefined,
      tokens_input: result.meta?.tokens_input || 0,
      tokens_output: result.meta?.tokens_output || 0,
      response_time_ms: latencyMs,
      model_used: result.meta?.model || instanceConfig.modelo_ia,
      temperature: instanceConfig.temperatura,
      status: result.success ? 'success' : 'error',
      error_message: result.success ? undefined : result.error,
      origin_domain: origin || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        instance_slug: instanceSlug,
        has_api_key: !!apiKeyValidation
      }
    })
    
    // Log para debug
    console.log(`[ORACULO-PUBLIC] ${instanceSlug} | ${userRole} | ${latencyMs}ms | ${result.success ? 'OK' : 'ERROR'}`)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao processar pergunta' },
        { status: 500 }
      )
    }
    
    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      instance: {
        slug: instanceSlug,
        name: instanceConfig.instance_name,
        assistant: instanceConfig.nome_assistente
      },
      response: result.response,
      meta: {
        latency_ms: latencyMs,
        model: result.meta?.model
      }
    })
    
  } catch (error) {
    console.error('[ORACULO-PUBLIC] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para health check
export async function GET(request: NextRequest) {
  const instanceSlug = request.nextUrl.searchParams.get('instance') || 'radar-narcisista'
  
  try {
    const instanceConfig = await getInstanceConfig(instanceSlug, 'usuaria')
    
    if (!instanceConfig) {
      return NextResponse.json({
        status: 'error',
        message: 'Instância não encontrada'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      status: 'ok',
      instance: {
        slug: instanceSlug,
        name: instanceConfig.instance_name,
        assistant: instanceConfig.nome_assistente
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar instância'
    }, { status: 500 })
  }
}
