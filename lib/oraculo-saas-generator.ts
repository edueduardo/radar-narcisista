/**
 * ORACULO SAAS GENERATOR - Gerador de Instâncias para Novos SaaS
 * ETAPA 34 - Integração com Gerador de SaaS
 * 
 * Este módulo permite:
 * - Criar instâncias do Oráculo para novos SaaS
 * - Configurar prompts e contextos específicos
 * - Gerar templates de integração
 * - Validar configurações
 */

import { createClient } from '@supabase/supabase-js'
import { OraculoUserRole } from './oraculo-core'

// ============================================================================
// TIPOS
// ============================================================================

export interface SaaSConfig {
  // Identificação
  slug: string
  name: string
  description: string
  
  // Contexto do produto
  product_context: string
  company_context?: string
  target_audience: string
  
  // Configurações de IA
  ai_model?: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  temperature?: number
  max_tokens?: number
  
  // Personalização
  assistant_name: string
  communication_tone: 'acolhedor' | 'profissional' | 'tecnico' | 'casual'
  
  // Branding
  primary_color: string
  secondary_color: string
  logo_url?: string
  
  // Domínios
  allowed_domains?: string[]
  
  // Limites
  daily_limit?: number
  monthly_limit?: number
  
  // Perfis habilitados
  enabled_roles?: OraculoUserRole[]
  
  // Prompts customizados
  custom_prompts?: {
    base_override?: string
    additional?: string
    per_role?: Partial<Record<OraculoUserRole, string>>
  }
  
  // Features
  features?: {
    analise?: boolean
    sugestao?: boolean
    alerta?: boolean
    explicacao?: boolean
  }
}

export interface GeneratedInstance {
  instance_id: string
  instance_slug: string
  api_endpoint: string
  integration_code: string
  setup_instructions: string[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ============================================================================
// TEMPLATES DE SAAS
// ============================================================================

export const SAAS_TEMPLATES: Record<string, Partial<SaaSConfig>> = {
  // Template para clínicas de saúde mental
  'clinica-saude-mental': {
    ai_model: 'gpt-4o-mini',
    temperature: 0.7,
    communication_tone: 'acolhedor',
    assistant_name: 'Assistente',
    features: { analise: true, sugestao: true, alerta: true, explicacao: true },
    custom_prompts: {
      additional: `
CONTEXTO CLÍNICO:
- Este é um assistente para uma clínica de saúde mental
- Sempre reforce que o assistente NÃO substitui atendimento profissional
- Priorize segurança e bem-estar do usuário
- Em casos de risco, oriente buscar ajuda profissional imediatamente
      `
    }
  },
  
  // Template para escritórios de advocacia
  'escritorio-advocacia': {
    ai_model: 'gpt-4o-mini',
    temperature: 0.5,
    communication_tone: 'profissional',
    assistant_name: 'Assistente Jurídico',
    features: { analise: true, sugestao: true, alerta: false, explicacao: true },
    custom_prompts: {
      additional: `
CONTEXTO JURÍDICO:
- Este é um assistente para um escritório de advocacia
- Sempre reforce que o assistente NÃO substitui consultoria jurídica profissional
- Não forneça pareceres jurídicos definitivos
- Oriente sempre a consultar um advogado para casos específicos
      `
    }
  },
  
  // Template para coaches
  'coaching': {
    ai_model: 'gpt-4o-mini',
    temperature: 0.8,
    communication_tone: 'casual',
    assistant_name: 'Coach IA',
    features: { analise: true, sugestao: true, alerta: false, explicacao: true },
    custom_prompts: {
      additional: `
CONTEXTO DE COACHING:
- Este é um assistente de coaching
- Foque em desenvolvimento pessoal e profissional
- Use perguntas poderosas para estimular reflexão
- Celebre conquistas e progressos do usuário
      `
    }
  },
  
  // Template para educação
  'educacao': {
    ai_model: 'gpt-4o-mini',
    temperature: 0.6,
    communication_tone: 'profissional',
    assistant_name: 'Tutor IA',
    features: { analise: true, sugestao: true, alerta: false, explicacao: true },
    custom_prompts: {
      additional: `
CONTEXTO EDUCACIONAL:
- Este é um assistente educacional
- Adapte explicações ao nível do aluno
- Use exemplos práticos e analogias
- Incentive a curiosidade e o aprendizado contínuo
      `
    }
  },
  
  // Template genérico
  'generico': {
    ai_model: 'gpt-4o-mini',
    temperature: 0.7,
    communication_tone: 'profissional',
    assistant_name: 'Assistente',
    features: { analise: true, sugestao: true, alerta: true, explicacao: true }
  }
}

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

/**
 * Valida configuração de SaaS
 */
export function validateSaaSConfig(config: SaaSConfig): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validações obrigatórias
  if (!config.slug) errors.push('slug é obrigatório')
  if (!config.name) errors.push('name é obrigatório')
  if (!config.product_context) errors.push('product_context é obrigatório')
  if (!config.assistant_name) errors.push('assistant_name é obrigatório')
  if (!config.primary_color) errors.push('primary_color é obrigatório')
  
  // Validar slug
  if (config.slug && !/^[a-z0-9-]+$/.test(config.slug)) {
    errors.push('slug deve conter apenas letras minúsculas, números e hífens')
  }
  
  // Validar cores
  if (config.primary_color && !/^#[0-9A-Fa-f]{6}$/.test(config.primary_color)) {
    errors.push('primary_color deve ser um hex válido (#RRGGBB)')
  }
  if (config.secondary_color && !/^#[0-9A-Fa-f]{6}$/.test(config.secondary_color)) {
    errors.push('secondary_color deve ser um hex válido (#RRGGBB)')
  }
  
  // Validar temperatura
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('temperature deve estar entre 0 e 2')
  }
  
  // Validar max_tokens
  if (config.max_tokens !== undefined && (config.max_tokens < 100 || config.max_tokens > 4000)) {
    errors.push('max_tokens deve estar entre 100 e 4000')
  }
  
  // Warnings
  if (!config.description) warnings.push('description não informado')
  if (!config.target_audience) warnings.push('target_audience não informado')
  if (!config.secondary_color) warnings.push('secondary_color não informado, será usado primary_color')
  if (!config.allowed_domains || config.allowed_domains.length === 0) {
    warnings.push('allowed_domains não informado, instância aceitará qualquer domínio')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================================

/**
 * Gera código de integração para o SaaS
 */
export function generateIntegrationCode(config: SaaSConfig): string {
  return `
// ============================================================================
// INTEGRAÇÃO ORÁCULO - ${config.name}
// Gerado automaticamente em ${new Date().toISOString()}
// ============================================================================

import { OraculoClient } from '@radar-narcisista/oraculo-sdk'

// Configuração da instância
const oraculo = new OraculoClient({
  instanceSlug: '${config.slug}',
  apiEndpoint: 'https://radar-narcisista.vercel.app/api/oraculo-public',
  // Adicione sua API key aqui (obtenha no painel admin)
  apiKey: process.env.ORACULO_API_KEY
})

// Exemplo de uso
async function askOraculo(question: string, userRole: string = 'usuaria') {
  try {
    const response = await oraculo.ask({
      question,
      user_role: userRole,
      // Contexto adicional opcional
      context: {
        url_atual: window.location.href,
        // Adicione mais contexto conforme necessário
      }
    })
    
    return response
  } catch (error) {
    console.error('Erro ao consultar Oráculo:', error)
    throw error
  }
}

// Componente React (opcional)
export function OraculoWidget() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleAsk = async () => {
    setLoading(true)
    try {
      const result = await askOraculo(question)
      setResponse(result)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={{ 
      '--primary': '${config.primary_color}',
      '--secondary': '${config.secondary_color || config.primary_color}'
    }}>
      <h3>${config.assistant_name}</h3>
      <input 
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Faça sua pergunta..."
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Pensando...' : 'Perguntar'}
      </button>
      {response && (
        <div className="response">
          <h4>{response.titulo_curto}</h4>
          <p>{response.resposta_principal}</p>
        </div>
      )}
    </div>
  )
}

export { oraculo, askOraculo }
`.trim()
}

/**
 * Gera instruções de setup
 */
export function generateSetupInstructions(config: SaaSConfig): string[] {
  return [
    `1. Acesse o painel admin: /admin/oraculo-instances`,
    `2. Clique em "Nova Instância"`,
    `3. Preencha os dados:`,
    `   - Slug: ${config.slug}`,
    `   - Nome: ${config.name}`,
    `   - Assistente: ${config.assistant_name}`,
    `   - Tom: ${config.communication_tone}`,
    `   - Cor primária: ${config.primary_color}`,
    `4. Configure os prompts na aba "Contexto"`,
    `5. Salve a instância`,
    `6. Copie o código de integração gerado`,
    `7. Adicione a API key no seu .env`,
    `8. Teste a integração com uma pergunta simples`,
    `9. Configure os domínios permitidos (opcional)`,
    `10. Monitore o uso no painel admin`
  ]
}

/**
 * Aplica template a uma configuração
 */
export function applyTemplate(
  templateName: keyof typeof SAAS_TEMPLATES,
  config: Partial<SaaSConfig>
): SaaSConfig {
  const template = SAAS_TEMPLATES[templateName] || SAAS_TEMPLATES.generico
  
  return {
    slug: '',
    name: '',
    description: '',
    product_context: '',
    target_audience: '',
    assistant_name: 'Assistente',
    communication_tone: 'profissional',
    primary_color: '#8B5CF6',
    secondary_color: '#6366F1',
    ...template,
    ...config
  } as SaaSConfig
}

// ============================================================================
// FUNÇÕES DE CRIAÇÃO
// ============================================================================

/**
 * Cria instância no banco de dados
 */
export async function createSaaSInstance(config: SaaSConfig): Promise<GeneratedInstance | null> {
  // Validar configuração
  const validation = validateSaaSConfig(config)
  if (!validation.valid) {
    console.error('Configuração inválida:', validation.errors)
    return null
  }
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase não configurado')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Criar instância
    const { data: instance, error } = await supabase
      .from('oraculo_instances')
      .insert({
        instance_slug: config.slug,
        instance_name: config.name,
        status: 'active',
        modelo_ia: config.ai_model || 'gpt-4o-mini',
        temperatura: config.temperature || 0.7,
        max_tokens: config.max_tokens || 1000,
        nome_assistente: config.assistant_name,
        tom_comunicacao: config.communication_tone,
        cor_primaria: config.primary_color,
        cor_secundaria: config.secondary_color || config.primary_color,
        logo_url: config.logo_url || null,
        limite_diario_global: config.daily_limit || null,
        limite_mensal_global: config.monthly_limit || null,
        features_enabled: config.features || { analise: true, sugestao: true, alerta: true, explicacao: true },
        contexto_produto: config.product_context,
        contexto_empresa: config.company_context || null,
        prompt_adicional: config.custom_prompts?.additional || null,
        prompt_base_override: config.custom_prompts?.base_override || null,
        dominios_permitidos: config.allowed_domains || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar instância:', error)
      return null
    }
    
    // Criar roles se especificados
    if (config.enabled_roles && config.enabled_roles.length > 0) {
      for (const role of config.enabled_roles) {
        await supabase
          .from('oraculo_instance_roles')
          .insert({
            instance_id: instance.id,
            user_role: role,
            status: 1,
            prompt_perfil: config.custom_prompts?.per_role?.[role] || null
          })
      }
    }
    
    // Gerar resultado
    return {
      instance_id: instance.id,
      instance_slug: config.slug,
      api_endpoint: `https://radar-narcisista.vercel.app/api/oraculo-public?instance=${config.slug}`,
      integration_code: generateIntegrationCode(config),
      setup_instructions: generateSetupInstructions(config)
    }
    
  } catch (error) {
    console.error('Erro ao criar instância SaaS:', error)
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_SAAS_GENERATOR = {
  validateSaaSConfig,
  generateIntegrationCode,
  generateSetupInstructions,
  applyTemplate,
  createSaaSInstance,
  SAAS_TEMPLATES
}

export default ORACULO_SAAS_GENERATOR
