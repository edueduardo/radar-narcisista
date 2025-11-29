/**
 * REGISTRO DE IAs DISPONÍVEIS
 * 
 * Para adicionar uma nova IA:
 * 1. Adicione na lista IAS_DISPONIVEIS abaixo
 * 2. A IA aparecerá automaticamente no Admin
 * 
 * Campos obrigatórios:
 * - id: identificador único (lowercase, sem espaços)
 * - nome: nome para exibição
 * - icon: emoji representativo
 * - categoria: 'free' | 'freemium' | 'paid'
 * - placeholder: exemplo de como a chave começa
 * - linkChave: URL para pegar a API key
 * - linkSaldo: URL para ver saldo/uso
 * - adicionadoEm: data que foi adicionada (para mostrar "NOVO!")
 */

export interface IAConfig {
  id: string
  nome: string
  icon: string
  categoria: 'free' | 'freemium' | 'paid'
  placeholder: string
  linkChave: string
  linkSaldo: string
  descricao: string
  adicionadoEm: string // formato: YYYY-MM-DD
  depreciadoEm?: string // se a IA foi descontinuada
  avisoDepreciacao?: string
}

// ============================================
// LISTA DE IAs DISPONÍVEIS
// Adicione novas IAs aqui!
// ============================================

export const IAS_DISPONIVEIS: IAConfig[] = [
  // ===== GRATUITAS =====
  {
    id: 'groq',
    nome: 'Groq (GRÁTIS)',
    icon: '⚡',
    categoria: 'free',
    placeholder: 'gsk_...',
    linkChave: 'https://console.groq.com/keys',
    linkSaldo: 'https://console.groq.com/settings/limits',
    descricao: 'Muito rápido! LLaMA 3.1 70B. 14.400 req/dia grátis.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'huggingface',
    nome: 'HuggingFace (GRÁTIS)',
    icon: '🤗',
    categoria: 'free',
    placeholder: 'hf_...',
    linkChave: 'https://huggingface.co/settings/tokens',
    linkSaldo: 'https://huggingface.co/settings/billing',
    descricao: 'Milhares de modelos gratuitos.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'cerebras',
    nome: 'Cerebras (GRÁTIS)',
    icon: '🧬',
    categoria: 'free',
    placeholder: 'csk-...',
    linkChave: 'https://cloud.cerebras.ai/',
    linkSaldo: 'https://cloud.cerebras.ai/usage',
    descricao: 'Extremamente rápido! 30 req/min grátis (beta).',
    adicionadoEm: '2024-06-01',
  },
  
  // ===== FREEMIUM =====
  {
    id: 'gemini',
    nome: 'Google Gemini',
    icon: '✨',
    categoria: 'freemium',
    placeholder: 'AIzaSy...',
    linkChave: 'https://makersuite.google.com/app/apikey',
    linkSaldo: 'https://console.cloud.google.com/billing',
    descricao: 'IA do Google. 60 req/min grátis.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'openai',
    nome: 'OpenAI GPT-4',
    icon: '🤖',
    categoria: 'freemium',
    placeholder: 'sk-proj-...',
    linkChave: 'https://platform.openai.com/api-keys',
    linkSaldo: 'https://platform.openai.com/usage',
    descricao: 'Melhor qualidade. $5 créditos iniciais.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'claude',
    nome: 'Anthropic Claude',
    icon: '🧠',
    categoria: 'freemium',
    placeholder: 'sk-ant-...',
    linkChave: 'https://console.anthropic.com/',
    linkSaldo: 'https://console.anthropic.com/settings/billing',
    descricao: 'Excelente para análises. $5 créditos iniciais.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'mistral',
    nome: 'Mistral AI',
    icon: '🌬️',
    categoria: 'freemium',
    placeholder: 'mist-...',
    linkChave: 'https://console.mistral.ai/api-keys/',
    linkSaldo: 'https://console.mistral.ai/billing/',
    descricao: 'IA europeia. €5 créditos iniciais.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'together',
    nome: 'Together AI',
    icon: '🤝',
    categoria: 'freemium',
    placeholder: 'tog-...',
    linkChave: 'https://api.together.xyz/settings/api-keys',
    linkSaldo: 'https://api.together.xyz/settings/billing',
    descricao: 'Vários modelos open-source. $5 créditos.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'cohere',
    nome: 'Cohere',
    icon: '🔮',
    categoria: 'freemium',
    placeholder: 'co-...',
    linkChave: 'https://dashboard.cohere.com/api-keys',
    linkSaldo: 'https://dashboard.cohere.com/billing',
    descricao: 'Especializada em texto. $5 créditos grátis.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'deepseek',
    nome: 'DeepSeek',
    icon: '🔬',
    categoria: 'freemium',
    placeholder: 'sk-...',
    linkChave: 'https://platform.deepseek.com/api_keys',
    linkSaldo: 'https://platform.deepseek.com/usage',
    descricao: 'Muito barato! 500K tokens grátis.',
    adicionadoEm: '2024-03-01',
  },
  {
    id: 'openrouter',
    nome: 'OpenRouter',
    icon: '🔀',
    categoria: 'freemium',
    placeholder: 'sk-or-...',
    linkChave: 'https://openrouter.ai/keys',
    linkSaldo: 'https://openrouter.ai/activity',
    descricao: 'Acesso a TODAS as IAs em um lugar!',
    adicionadoEm: '2024-01-01',
  },
  
  // ===== PAGAS =====
  {
    id: 'perplexity',
    nome: 'Perplexity',
    icon: '🔍',
    categoria: 'paid',
    placeholder: 'pplx-...',
    linkChave: 'https://www.perplexity.ai/settings/api',
    linkSaldo: 'https://www.perplexity.ai/settings/api',
    descricao: 'Acesso à internet em tempo real.',
    adicionadoEm: '2024-01-01',
  },
  {
    id: 'replicate',
    nome: 'Replicate',
    icon: '🔄',
    categoria: 'paid',
    placeholder: 'r8_...',
    linkChave: 'https://replicate.com/account/api-tokens',
    linkSaldo: 'https://replicate.com/account/billing',
    descricao: 'Milhares de modelos. Pague por uso.',
    adicionadoEm: '2024-01-01',
  },

  // ============================================
  // NOVAS IAs - Adicione aqui!
  // ============================================
  
  // Exemplo de como adicionar uma nova IA:
  // {
  //   id: 'nova-ia',
  //   nome: 'Nova IA Incrível',
  //   icon: '🚀',
  //   categoria: 'free',
  //   placeholder: 'nova-...',
  //   linkChave: 'https://nova-ia.com/api-keys',
  //   linkSaldo: 'https://nova-ia.com/billing',
  //   descricao: 'Descrição da nova IA.',
  //   adicionadoEm: '2025-11-25', // Data de hoje
  // },
]

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna IAs adicionadas nos últimos N dias
 */
export function getNovasIAs(dias: number = 30): IAConfig[] {
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - dias)
  
  return IAS_DISPONIVEIS.filter(ia => {
    const dataAdicionada = new Date(ia.adicionadoEm)
    return dataAdicionada >= dataLimite
  })
}

/**
 * Retorna IAs depreciadas
 */
export function getIAsDepreciadas(): IAConfig[] {
  return IAS_DISPONIVEIS.filter(ia => ia.depreciadoEm)
}

/**
 * Retorna IAs por categoria
 */
export function getIAsPorCategoria(categoria: 'free' | 'freemium' | 'paid'): IAConfig[] {
  return IAS_DISPONIVEIS.filter(ia => ia.categoria === categoria && !ia.depreciadoEm)
}

/**
 * Verifica se uma IA é nova (adicionada nos últimos 30 dias)
 */
export function isIANova(ia: IAConfig): boolean {
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 30)
  const dataAdicionada = new Date(ia.adicionadoEm)
  return dataAdicionada >= dataLimite
}

/**
 * Formata a lista de IAs para uso no Admin
 */
export function getIAsParaAdmin() {
  return IAS_DISPONIVEIS
    .filter(ia => !ia.depreciadoEm)
    .map(ia => ({
      id: ia.id,
      nome: ia.nome,
      icon: ia.icon,
      ativa: false,
      chaveConfigurada: false,
      categoria: ia.categoria,
      isNova: isIANova(ia),
    }))
}
