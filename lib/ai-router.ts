/**
 * AI ROUTER - Roteador Central de IAs
 * 
 * REGRA CRÍTICA:
 * NADA MAIS CHAMA "OpenAI diretamente no código de feature".
 * Todas as features passam a chamar:
 *   routeAIRequest({ featureKey, menuKey, userRole, planKey, tenantKey, payload })
 * 
 * Este módulo centraliza:
 * - Seleção de provider baseada em contexto
 * - Fallback automático entre providers
 * - Rate limiting e logging
 * - Suporte a chamadas colaborativas (múltiplas IAs)
 * 
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 6
 * @see lib/ai-config-core.ts - Configuração de providers
 * @see lib/ai-personas.ts - Personas/Avatares
 */

import { createClient } from '@/lib/supabase/client'
import { AIConfigCore, AIProviderConfig, AIConfigContext } from './ai-config-core'
import { getActivePersonasForContext, PersonaForContext } from './ai-personas'

// =============================================================================
// TIPOS
// =============================================================================

export interface AIRouterRequest {
  /** Feature sendo usada (chat, diario, clareza, oraculo) */
  featureKey: string
  /** Menu/contexto específico (opcional) */
  menuKey?: string
  /** Role do usuário (usuaria, profissional, admin) */
  userRole: 'usuaria' | 'profissional' | 'admin' | 'whitelabel' | 'gerador'
  /** Plano do usuário (free, basic, premium, professional) */
  planKey: string
  /** ID do tenant para multi-tenant (opcional) */
  tenantKey?: string
  /** ID do usuário */
  userId?: string
  /** Payload da requisição */
  payload: AIRequestPayload
}

export interface AIRequestPayload {
  /** Mensagens do chat (para LLMs) */
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  /** Prompt único (alternativa a messages) */
  prompt?: string
  /** System prompt customizado */
  systemPrompt?: string
  /** Temperatura (0-2) */
  temperature?: number
  /** Max tokens de resposta */
  maxTokens?: number
  /** Persona específica a usar (opcional) */
  personaSlug?: string
  /** Modo colaborativo (múltiplas IAs) */
  collaborative?: boolean
  /** Metadados extras */
  metadata?: Record<string, unknown>
}

export interface AIRouterResponse {
  /** Sucesso da operação */
  success: boolean
  /** Conteúdo da resposta */
  content?: string
  /** Provider usado */
  providerUsed: string
  /** Persona usada (se aplicável) */
  personaUsed?: string
  /** Tokens consumidos */
  tokensUsed?: {
    input: number
    output: number
    total: number
  }
  /** Tempo de resposta em ms */
  responseTimeMs?: number
  /** Erro (se houver) */
  error?: string
  /** Respostas colaborativas (se modo colaborativo) */
  collaborativeResponses?: Array<{
    providerKey: string
    personaSlug?: string
    content: string
    tokensUsed: number
  }>
}

export interface MenuProviderMapping {
  menuKey: string
  menuLabel: string
  providers: Array<{
    providerKey: string
    providerName: string
    papel: 'principal' | 'fallback' | 'colaborativo'
    peso: number
  }>
}

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

class AIRouter {
  private supabase = createClient()
  private aiConfig = new AIConfigCore()

  // Cache de providers por menu (TTL: 5 minutos)
  private menuProvidersCache: Map<string, { data: MenuProviderMapping; timestamp: number }> = new Map()
  private CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  /**
   * FUNÇÃO PRINCIPAL: Roteia uma requisição de IA
   * 
   * Esta é a função que TODAS as features devem usar.
   * Ela seleciona o provider correto, aplica rate limiting,
   * faz a chamada e registra o uso.
   */
  async routeAIRequest(request: AIRouterRequest): Promise<AIRouterResponse> {
    const startTime = Date.now()

    try {
      // 1. Obter providers disponíveis para o contexto
      const context: AIConfigContext = {
        planKey: request.planKey,
        featureSlug: request.featureKey,
        perfil: request.userRole,
        userId: request.userId
      }

      const providers = await this.aiConfig.getProvidersForContext(context)

      if (providers.length === 0) {
        return {
          success: false,
          providerUsed: 'none',
          error: 'Nenhum provider disponível para este contexto'
        }
      }

      // 2. Verificar rate limiting
      if (request.userId) {
        const primaryProvider = providers[0]
        const limitsCheck = await this.aiConfig.checkLimits(
          request.userId,
          request.featureKey,
          primaryProvider.providerSlug,
          primaryProvider.limiteDiario,
          primaryProvider.limiteMensal
        )

        if (!limitsCheck.allowed) {
          return {
            success: false,
            providerUsed: primaryProvider.providerSlug,
            error: limitsCheck.reason || 'Limite de uso atingido'
          }
        }
      }

      // 3. Modo colaborativo ou normal
      if (request.payload.collaborative && providers.length > 1) {
        return await this.callCollaborativeAI(request, providers, startTime)
      }

      // 4. Chamada normal com fallback
      return await this.callWithFallback(request, providers, startTime)

    } catch (error) {
      console.error('[AIRouter] Erro ao rotear requisição:', error)
      return {
        success: false,
        providerUsed: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        responseTimeMs: Date.now() - startTime
      }
    }
  }

  /**
   * Obtém providers configurados para um menu específico
   */
  async getProvidersForMenu(menuKey: string): Promise<MenuProviderMapping | null> {
    // Verificar cache
    const cached = this.menuProvidersCache.get(menuKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const { data, error } = await this.supabase
        .from('ai_feature_menu_map')
        .select(`
          menu_key,
          menu_label,
          ai_feature_providers_core (
            provider_slug,
            papel,
            peso,
            ai_providers_core (
              display_name
            )
          )
        `)
        .eq('menu_key', menuKey)
        .single()

      if (error || !data) {
        console.warn(`[AIRouter] Menu ${menuKey} não encontrado`)
        return null
      }

      const mapping: MenuProviderMapping = {
        menuKey: data.menu_key,
        menuLabel: data.menu_label,
        providers: (data.ai_feature_providers_core || []).map((p: any) => ({
          providerKey: p.provider_slug,
          providerName: p.ai_providers_core?.display_name || p.provider_slug,
          papel: p.papel as 'principal' | 'fallback' | 'colaborativo',
          peso: p.peso
        }))
      }

      // Atualizar cache
      this.menuProvidersCache.set(menuKey, { data: mapping, timestamp: Date.now() })

      return mapping
    } catch (error) {
      console.error('[AIRouter] Erro ao buscar providers para menu:', error)
      return null
    }
  }

  /**
   * Chama IA para um menu específico
   * Wrapper conveniente para routeAIRequest
   */
  async callAIForMenu(
    menuKey: string,
    payload: AIRequestPayload,
    options: {
      userId?: string
      userRole?: 'usuaria' | 'profissional' | 'admin'
      planKey?: string
    } = {}
  ): Promise<AIRouterResponse> {
    return this.routeAIRequest({
      featureKey: menuKey,
      menuKey,
      userRole: options.userRole || 'usuaria',
      planKey: options.planKey || 'free',
      userId: options.userId,
      payload
    })
  }

  /**
   * Chamada colaborativa: múltiplas IAs respondem
   */
  async callCollaborativeAI(
    request: AIRouterRequest,
    providers: AIProviderConfig[],
    startTime: number
  ): Promise<AIRouterResponse> {
    const collaborativeResponses: AIRouterResponse['collaborativeResponses'] = []

    // Chamar cada provider em paralelo
    const promises = providers.slice(0, 3).map(async (provider) => {
      try {
        const response = await this.callProvider(provider, request.payload)
        return {
          providerKey: provider.providerSlug,
          personaSlug: undefined,
          content: response.content || '',
          tokensUsed: response.tokensUsed?.total || 0
        }
      } catch (error) {
        console.error(`[AIRouter] Erro no provider ${provider.providerSlug}:`, error)
        return null
      }
    })

    const results = await Promise.all(promises)
    results.forEach(r => {
      if (r) collaborativeResponses.push(r)
    })

    if (collaborativeResponses.length === 0) {
      return {
        success: false,
        providerUsed: 'collaborative',
        error: 'Nenhum provider respondeu',
        responseTimeMs: Date.now() - startTime
      }
    }

    // Combinar respostas (primeira como principal)
    const primaryResponse = collaborativeResponses[0]

    return {
      success: true,
      content: primaryResponse.content,
      providerUsed: 'collaborative',
      collaborativeResponses,
      responseTimeMs: Date.now() - startTime
    }
  }

  /**
   * Chamada com fallback automático
   */
  private async callWithFallback(
    request: AIRouterRequest,
    providers: AIProviderConfig[],
    startTime: number
  ): Promise<AIRouterResponse> {
    let lastError: string | undefined

    for (const provider of providers) {
      try {
        const response = await this.callProvider(provider, request.payload)

        // Registrar uso
        if (request.userId && response.success) {
          await this.logUsage({
            userId: request.userId,
            featureKey: request.featureKey,
            providerKey: provider.providerSlug,
            tokensUsed: response.tokensUsed?.total || 0,
            success: true
          })
        }

        return {
          ...response,
          providerUsed: provider.providerSlug,
          responseTimeMs: Date.now() - startTime
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Erro desconhecido'
        console.warn(`[AIRouter] Fallback: ${provider.providerSlug} falhou, tentando próximo...`)
        continue
      }
    }

    return {
      success: false,
      providerUsed: 'fallback-failed',
      error: lastError || 'Todos os providers falharam',
      responseTimeMs: Date.now() - startTime
    }
  }

  /**
   * Chama um provider específico
   */
  private async callProvider(
    provider: AIProviderConfig,
    payload: AIRequestPayload
  ): Promise<AIRouterResponse> {
    // Por enquanto, todos os providers usam a mesma API interna
    // No futuro, cada provider terá sua própria implementação
    
    const response = await fetch('/api/core/ai-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: provider.providerSlug,
        model: provider.modelo || 'gpt-4o-mini',
        messages: payload.messages,
        prompt: payload.prompt,
        systemPrompt: payload.systemPrompt,
        temperature: payload.temperature || 0.7,
        maxTokens: payload.maxTokens || 1000
      })
    })

    if (!response.ok) {
      throw new Error(`Provider ${provider.providerSlug} retornou ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      content: data.content,
      providerUsed: provider.providerSlug,
      tokensUsed: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      }
    }
  }

  /**
   * Registra uso de IA
   */
  private async logUsage(log: {
    userId: string
    featureKey: string
    providerKey: string
    tokensUsed: number
    success: boolean
  }): Promise<void> {
    try {
      await this.supabase.from('ai_usage_logs').insert({
        user_id: log.userId,
        feature_slug: log.featureKey,
        provider_slug: log.providerKey,
        tokens_usados: log.tokensUsed,
        sucesso: log.success,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('[AIRouter] Erro ao registrar uso:', error)
    }
  }

  /**
   * Limpa o cache de providers
   */
  clearCache(): void {
    this.menuProvidersCache.clear()
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

let aiRouterInstance: AIRouter | null = null

export function getAIRouter(): AIRouter {
  if (!aiRouterInstance) {
    aiRouterInstance = new AIRouter()
  }
  return aiRouterInstance
}

// =============================================================================
// FUNÇÕES EXPORTADAS (ATALHOS)
// =============================================================================

/**
 * Roteia uma requisição de IA
 * Esta é a função principal que todas as features devem usar
 */
export async function routeAIRequest(request: AIRouterRequest): Promise<AIRouterResponse> {
  return getAIRouter().routeAIRequest(request)
}

/**
 * Obtém providers configurados para um menu
 */
export async function getProvidersForMenu(menuKey: string): Promise<MenuProviderMapping | null> {
  return getAIRouter().getProvidersForMenu(menuKey)
}

/**
 * Chama IA para um menu específico
 */
export async function callAIForMenu(
  menuKey: string,
  payload: AIRequestPayload,
  options?: {
    userId?: string
    userRole?: 'usuaria' | 'profissional' | 'admin'
    planKey?: string
  }
): Promise<AIRouterResponse> {
  return getAIRouter().callAIForMenu(menuKey, payload, options)
}

/**
 * Chamada colaborativa com múltiplas IAs
 */
export async function callCollaborativeAI(
  request: AIRouterRequest
): Promise<AIRouterResponse> {
  return getAIRouter().routeAIRequest({
    ...request,
    payload: {
      ...request.payload,
      collaborative: true
    }
  })
}

// Tipos já exportados nas definições acima
