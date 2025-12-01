/**
 * ORACULO_V2_CORE - Núcleo Reutilizável do Oráculo V2
 * ETAPA 27 - BLOCO 26-30
 * ETAPA 32 - Suporte a Multi-instâncias
 * 
 * Este módulo centraliza toda a lógica do Oráculo V2:
 * - Construção de prompts
 * - Chamada à IA
 * - Formatação de respostas
 * - Suporte a múltiplas instâncias (whitelabel)
 * 
 * Preparado para:
 * - Múltiplos perfis (admin, usuaria, profissional, dev, whitelabel)
 * - Integração com Gerador de SaaS
 * - Reutilização em outros produtos
 * - Instâncias whitelabel com configurações personalizadas
 */

import OpenAI from 'openai'

// ============================================================================
// TIPOS
// ============================================================================

export type OraculoUserRole = 'admin' | 'usuaria' | 'profissional' | 'dev' | 'whitelabel'
export type OraculoModo = 'analise' | 'sugestao' | 'alerta' | 'explicacao'
export type OraculoRisco = 'baixo' | 'medio' | 'alto' | 'critico'

export interface OraculoRequest {
  user_role: OraculoUserRole
  question: string
  plan?: string
  url_atual?: string
  manual_context?: string
  language?: string
  // ETAPA 32: Suporte a instâncias
  instance_slug?: string
}

// ETAPA 32: Configuração de instância para o Oráculo
export interface OraculoInstanceConfig {
  instance_slug: string
  instance_name: string
  modelo_ia: string
  temperatura: number
  max_tokens: number
  nome_assistente: string
  tom_comunicacao: 'acolhedor' | 'profissional' | 'tecnico' | 'casual'
  prompt_base_override?: string | null
  prompt_adicional?: string | null
  prompt_perfil?: string | null
  contexto_produto?: string | null
  contexto_empresa?: string | null
  cor_primaria?: string
  cor_secundaria?: string
}

export interface OraculoResponse {
  modo: OraculoModo
  risco: OraculoRisco
  titulo_curto: string
  resposta_principal: string
  passos: string[]
  links_sugeridos: { label: string; url: string }[]
  mensagem_final_seguranca?: string
}

export interface OraculoResult {
  success: boolean
  response?: OraculoResponse
  error?: string
  meta?: {
    latency_ms: number
    tokens_input: number
    tokens_output: number
    model: string
  }
}

// ============================================================================
// PROMPTS POR PERFIL
// ============================================================================

const PROMPT_BASE = `Você é o ORÁCULO V2, a IA de suporte do Radar Narcisista.

CONTEXTO DO PRODUTO:
- Radar Narcisista é um SaaS brasileiro de apoio a vítimas de relacionamentos abusivos
- Funcionalidades: Teste de Clareza, Diário de Episódios, Chat/Coach IA, Plano de Segurança
- Stack: Next.js 16, Supabase, Stripe, TailwindCSS
- Planos: Gratuito, Essencial, Premium, Profissional

REGRAS GERAIS:
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

const PROMPT_POR_PERFIL: Record<OraculoUserRole, string> = {
  admin: `
SEU PAPEL COMO ORÁCULO PARA ADMIN:
Você ajuda o ADMINISTRADOR/DONO do produto a:
- Entender métricas e dados do sistema
- Identificar problemas técnicos e de negócio
- Tomar decisões estratégicas
- Configurar e otimizar o produto
- Analisar comportamento de usuários

TOM: Técnico, direto, estratégico. Pode usar termos técnicos.
FOCO: Métricas, performance, decisões de produto, configurações.`,

  usuaria: `
SEU PAPEL COMO ORÁCULO PARA USUÁRIA:
Você ajuda a USUÁRIA (pessoa em relacionamento potencialmente abusivo) a:
- Entender como usar as funcionalidades do Radar
- Interpretar resultados do Teste de Clareza
- Usar o Diário de forma efetiva
- Entender conceitos sobre relacionamentos abusivos
- Encontrar recursos de ajuda

TOM: Acolhedor, empático, cuidadoso. Linguagem simples e acessível.
FOCO: Suporte emocional, orientação de uso, segurança.
CUIDADO: Nunca diagnosticar, sempre sugerir buscar ajuda profissional.`,

  profissional: `
SEU PAPEL COMO ORÁCULO PARA PROFISSIONAL:
Você ajuda o PROFISSIONAL (psicólogo, advogado, assistente social) a:
- Entender como usar o Radar com seus clientes/pacientes
- Interpretar relatórios e dados dos clientes
- Configurar sua área profissional
- Entender boas práticas de uso da ferramenta

TOM: Profissional, técnico quando necessário, respeitoso.
FOCO: Uso clínico/jurídico, relatórios, gestão de clientes.`,

  dev: `
SEU PAPEL COMO ORÁCULO PARA DESENVOLVEDOR:
Você ajuda o DESENVOLVEDOR a:
- Entender a arquitetura do sistema
- Debugar problemas técnicos
- Implementar novas funcionalidades
- Entender APIs e integrações
- Seguir padrões do projeto

TOM: Técnico, preciso, com exemplos de código quando útil.
FOCO: Código, APIs, banco de dados, deploy, debugging.`,

  whitelabel: `
SEU PAPEL COMO ORÁCULO PARA PARCEIRO WHITELABEL:
Você ajuda o PARCEIRO WHITELABEL a:
- Configurar sua instância personalizada
- Entender opções de customização
- Gerenciar seus usuários
- Entender métricas da sua base
- Configurar integrações

TOM: Profissional, orientado a negócios, prático.
FOCO: Customização, gestão, métricas da instância, suporte.`
}

// ============================================================================
// FUNÇÕES DO CORE
// ============================================================================

/**
 * Constrói o system prompt completo baseado no perfil
 */
export function buildSystemPrompt(userRole: OraculoUserRole): string {
  return PROMPT_BASE + '\n' + PROMPT_POR_PERFIL[userRole]
}

/**
 * Constrói o contexto da pergunta do usuário
 */
export function buildUserContext(request: OraculoRequest): string {
  return `
CONTEXTO DA PERGUNTA:
- Perfil: ${request.user_role}
- Plano: ${request.plan || 'não informado'}
- Página atual: ${request.url_atual || 'não informada'}
- Idioma: ${request.language || 'pt-BR'}
${request.manual_context ? `- Contexto adicional: ${request.manual_context}` : ''}

PERGUNTA:
${request.question}
`
}

/**
 * Parseia a resposta da IA para o formato OraculoResponse
 */
export function parseOraculoResponse(responseText: string): OraculoResponse {
  try {
    const parsed = JSON.parse(responseText)
    
    // Validar campos obrigatórios
    return {
      modo: parsed.modo || 'explicacao',
      risco: parsed.risco || 'baixo',
      titulo_curto: parsed.titulo_curto || 'Resposta do Oráculo',
      resposta_principal: parsed.resposta_principal || responseText,
      passos: Array.isArray(parsed.passos) ? parsed.passos : [],
      links_sugeridos: Array.isArray(parsed.links_sugeridos) ? parsed.links_sugeridos : [],
      mensagem_final_seguranca: parsed.mensagem_final_seguranca
    }
  } catch {
    // Se não conseguir parsear, retorna resposta básica
    return {
      modo: 'explicacao',
      risco: 'baixo',
      titulo_curto: 'Resposta do Oráculo',
      resposta_principal: responseText,
      passos: [],
      links_sugeridos: []
    }
  }
}

/**
 * ETAPA 32: Constrói prompt customizado para uma instância
 */
export function buildInstancePrompt(
  userRole: OraculoUserRole,
  instanceConfig?: OraculoInstanceConfig
): string {
  // Se não há config de instância, usa o padrão
  if (!instanceConfig) {
    return buildSystemPrompt(userRole)
  }

  // Usar prompt base override se existir, senão usa o padrão
  let basePrompt = instanceConfig.prompt_base_override || PROMPT_BASE

  // Substituir nome do assistente
  if (instanceConfig.nome_assistente) {
    basePrompt = basePrompt.replace(/ORÁCULO V2/g, instanceConfig.nome_assistente)
  }

  // Adicionar contexto do produto
  if (instanceConfig.contexto_produto) {
    basePrompt = basePrompt.replace(
      'CONTEXTO DO PRODUTO:',
      `CONTEXTO DO PRODUTO:\n${instanceConfig.contexto_produto}\n\nDETALHES TÉCNICOS:`
    )
  }

  // Adicionar contexto da empresa
  if (instanceConfig.contexto_empresa) {
    basePrompt += `\n\nCONTEXTO DA EMPRESA:\n${instanceConfig.contexto_empresa}`
  }

  // Adicionar prompt do perfil
  let perfilPrompt = PROMPT_POR_PERFIL[userRole]
  if (instanceConfig.prompt_perfil) {
    perfilPrompt += `\n\nINSTRUÇÕES ADICIONAIS DO PERFIL:\n${instanceConfig.prompt_perfil}`
  }

  // Adicionar prompt adicional da instância
  if (instanceConfig.prompt_adicional) {
    perfilPrompt += `\n\nINSTRUÇÕES DA INSTÂNCIA:\n${instanceConfig.prompt_adicional}`
  }

  // Ajustar tom de comunicação
  const tomDescricao: Record<string, string> = {
    acolhedor: 'Use um tom acolhedor, empático e cuidadoso.',
    profissional: 'Use um tom profissional, objetivo e respeitoso.',
    tecnico: 'Use um tom técnico, preciso e detalhado.',
    casual: 'Use um tom casual, amigável e descontraído.'
  }
  if (instanceConfig.tom_comunicacao && tomDescricao[instanceConfig.tom_comunicacao]) {
    perfilPrompt += `\n\nTOM DE COMUNICAÇÃO: ${tomDescricao[instanceConfig.tom_comunicacao]}`
  }

  return basePrompt + '\n' + perfilPrompt
}

/**
 * Função principal: chama a IA e retorna resposta formatada
 * ETAPA 32: Agora suporta configuração de instância
 */
export async function callOraculo(
  request: OraculoRequest,
  openaiApiKey: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    instanceConfig?: OraculoInstanceConfig
  }
): Promise<OraculoResult> {
  const startTime = Date.now()
  
  try {
    // Validar pergunta
    if (!request.question || request.question.trim().length === 0) {
      return {
        success: false,
        error: 'Pergunta é obrigatória'
      }
    }

    // Criar cliente OpenAI
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // ETAPA 32: Usar configurações da instância se disponível
    const instanceConfig = options?.instanceConfig
    const model = instanceConfig?.modelo_ia || options?.model || 'gpt-4o-mini'
    const temperature = instanceConfig?.temperatura ?? options?.temperature ?? 0.7
    const maxTokens = instanceConfig?.max_tokens || options?.maxTokens || 1000

    // Construir prompts (ETAPA 32: suporte a instâncias)
    const systemPrompt = instanceConfig 
      ? buildInstancePrompt(request.user_role, instanceConfig)
      : buildSystemPrompt(request.user_role)
    const userContext = buildUserContext(request)

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content || ''
    const oraculoResponse = parseOraculoResponse(responseText)

    // Calcular métricas
    const latencyMs = Date.now() - startTime
    const tokensInput = completion.usage?.prompt_tokens || 0
    const tokensOutput = completion.usage?.completion_tokens || 0

    return {
      success: true,
      response: oraculoResponse,
      meta: {
        latency_ms: latencyMs,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        model
      }
    }

  } catch (error) {
    const latencyMs = Date.now() - startTime
    console.error('Erro no ORACULO_V2_CORE:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      meta: {
        latency_ms: latencyMs,
        tokens_input: 0,
        tokens_output: 0,
        model: options?.model || 'gpt-4o-mini'
      }
    }
  }
}

// ============================================================================
// EXPORTS PARA USO EXTERNO
// ============================================================================

export const ORACULO_V2_CORE = {
  callOraculo,
  buildSystemPrompt,
  buildUserContext,
  parseOraculoResponse,
  buildInstancePrompt
}

export default ORACULO_V2_CORE
