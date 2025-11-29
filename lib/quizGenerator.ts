/**
 * 🧠 GERADOR DE QUIZ COM IA
 * 
 * Sistema para gerar perguntas de quiz sobre narcisismo usando IA.
 * As perguntas são categorizadas, aprovadas pelo admin e randomizadas para usuários.
 */

import OpenAI from 'openai'

// ============================================
// TIPOS E INTERFACES
// ============================================

// Categorias principais do ciclo narcisista
export type QuizCategory = 
  | 'INVALIDACAO'
  | 'GASLIGHTING'
  | 'CULPABILIZACAO'
  | 'MANIPULACAO'
  | 'AMEACAS'
  | 'ISOLAMENTO'
  | 'IDEALIZACAO_LOVE_BOMBING'
  | 'DEPENDENCIA'
  | 'DESVALORIZACAO'
  | 'DESCARTE_ABANDONO'
  | 'HOOVERING'
  | 'IDENTIFICACAO_VITIMA'
  | 'IDENTIFICACAO_AGRESSOR'

// Fases do ciclo de abuso
export type AbusePhase = 
  | 'FASE_1_IDEALIZACAO'
  | 'FASE_2_DEPENDENCIA'
  | 'FASE_3_DESVALORIZACAO'
  | 'FASE_4_DESCARTE'
  | 'FASE_5_HOOVERING'

// Tipo de pergunta
export type QuestionType = 'ESCALA' | 'SIM_NAO' | 'MULTIPLA_ESCOLHA' | 'FREQUENCIA'

// Opção de resposta
export interface QuizOption {
  id: string
  text: string
  value: number  // Pontuação (0-4 geralmente)
  isRed: boolean // Flag de alerta (indica comportamento grave)
}

// Pergunta do quiz
export interface QuizQuestion {
  id: string
  category: QuizCategory
  phase?: AbusePhase
  type: QuestionType
  text: string
  description?: string  // Contexto adicional
  options: QuizOption[]
  weight: number        // Peso na pontuação final (1-3)
  targetPerspective: 'VITIMA' | 'AGRESSOR' | 'AMBOS'
  tags: string[]
  source?: string       // Fonte de referência (se houver)
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  aiGenerated: boolean
  aiModel?: string
}

// Configuração do gerador
export interface QuizGeneratorConfig {
  enabled: boolean
  autoGenerate: boolean
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  questionsPerBatch: number
  categories: QuizCategory[]
}

// Resultado da geração
export interface GenerationResult {
  success: boolean
  questionsGenerated: number
  questions: QuizQuestion[]
  error?: string
}

// ============================================
// BANCO DE PERGUNTAS (localStorage para MVP)
// ============================================

const QUESTIONS_KEY = 'quiz_questions_bank'
const CONFIG_KEY = 'quiz_generator_config'

export function getQuestionBank(): QuizQuestion[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(QUESTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveQuestionBank(questions: QuizQuestion[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions))
}

export function getGeneratorConfig(): QuizGeneratorConfig {
  if (typeof window === 'undefined') {
    return defaultConfig
  }
  const data = localStorage.getItem(CONFIG_KEY)
  return data ? { ...defaultConfig, ...JSON.parse(data) } : defaultConfig
}

export function saveGeneratorConfig(config: QuizGeneratorConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

const defaultConfig: QuizGeneratorConfig = {
  enabled: true,
  autoGenerate: false,
  model: 'gpt-4',
  questionsPerBatch: 5,
  categories: [
    'GASLIGHTING',
    'MANIPULACAO',
    'ISOLAMENTO',
    'IDEALIZACAO_LOVE_BOMBING',
    'DESVALORIZACAO'
  ]
}

// ============================================
// CATEGORIAS E DESCRIÇÕES
// ============================================

export const CATEGORY_INFO: Record<QuizCategory, { name: string; description: string; phase?: AbusePhase }> = {
  INVALIDACAO: {
    name: 'Invalidação',
    description: 'Quando seus sentimentos, percepções ou experiências são negados ou minimizados.'
  },
  GASLIGHTING: {
    name: 'Gaslighting',
    description: 'Manipulação psicológica que faz você duvidar da própria sanidade ou memória.'
  },
  CULPABILIZACAO: {
    name: 'Culpabilização',
    description: 'Transferência de responsabilidade, fazendo você se sentir culpado por tudo.'
  },
  MANIPULACAO: {
    name: 'Manipulação',
    description: 'Táticas para controlar seu comportamento, decisões ou emoções.'
  },
  AMEACAS: {
    name: 'Ameaças',
    description: 'Uso de medo, intimidação ou chantagem emocional para controle.'
  },
  ISOLAMENTO: {
    name: 'Isolamento',
    description: 'Afastamento de amigos, família ou rede de apoio.',
    phase: 'FASE_2_DEPENDENCIA'
  },
  IDEALIZACAO_LOVE_BOMBING: {
    name: 'Idealização / Love Bombing',
    description: 'Fase inicial de atenção excessiva, presentes e declarações intensas.',
    phase: 'FASE_1_IDEALIZACAO'
  },
  DEPENDENCIA: {
    name: 'Dependência',
    description: 'Criação de vínculo emocional ou financeiro que dificulta a saída.',
    phase: 'FASE_2_DEPENDENCIA'
  },
  DESVALORIZACAO: {
    name: 'Desvalorização',
    description: 'Críticas constantes, humilhação e diminuição da autoestima.',
    phase: 'FASE_3_DESVALORIZACAO'
  },
  DESCARTE_ABANDONO: {
    name: 'Descarte / Abandono',
    description: 'Afastamento repentino, tratamento silencioso ou término abrupto.',
    phase: 'FASE_4_DESCARTE'
  },
  HOOVERING: {
    name: 'Hoovering (A Volta)',
    description: 'Tentativas de reconquistar após o descarte, reiniciando o ciclo.',
    phase: 'FASE_5_HOOVERING'
  },
  IDENTIFICACAO_VITIMA: {
    name: 'Identificação como Vítima',
    description: 'Perguntas para ajudar a pessoa a reconhecer se está em situação de abuso.'
  },
  IDENTIFICACAO_AGRESSOR: {
    name: 'Identificação de Padrões do Agressor',
    description: 'Perguntas sobre comportamentos típicos de pessoas com traços narcisistas.'
  }
}

// ============================================
// PROMPT PARA GERAÇÃO DE PERGUNTAS
// ============================================

const QUIZ_GENERATION_PROMPT = `Você é um especialista em psicologia de relacionamentos abusivos e narcisismo.

CONTEXTO:
- Você está criando perguntas para um quiz de autoconhecimento do "Radar Narcisista BR"
- O objetivo é ajudar pessoas a identificar padrões de relacionamentos abusivos
- NÃO é diagnóstico clínico, é uma ferramenta de clareza e organização

REGRAS IMPORTANTES:
1. Use linguagem acessível, sem termos técnicos complexos
2. Seja empático e não-julgador
3. Foque em comportamentos observáveis, não em rótulos
4. Evite palavras como "narcisista", "abusador", "vítima" nas perguntas
5. Use "a pessoa" ou "ele/ela" em vez de termos carregados
6. Cada pergunta deve ter 4-5 opções de resposta
7. As opções devem ir de "nunca/não" até "sempre/muito frequente"

CATEGORIA ATUAL: {{CATEGORY}}
DESCRIÇÃO: {{DESCRIPTION}}

FORMATO DE SAÍDA (JSON):
{
  "questions": [
    {
      "text": "Texto da pergunta",
      "description": "Contexto opcional",
      "type": "FREQUENCIA",
      "options": [
        { "text": "Nunca", "value": 0, "isRed": false },
        { "text": "Raramente", "value": 1, "isRed": false },
        { "text": "Às vezes", "value": 2, "isRed": false },
        { "text": "Frequentemente", "value": 3, "isRed": true },
        { "text": "Sempre", "value": 4, "isRed": true }
      ],
      "weight": 2,
      "targetPerspective": "VITIMA",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Gere {{COUNT}} perguntas únicas e relevantes para a categoria.`

// ============================================
// FUNÇÃO DE GERAÇÃO COM IA
// ============================================

// Lazy initialization para evitar erro no build
let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    })
  }
  return openaiInstance
}

export async function generateQuestions(
  category: QuizCategory,
  count: number = 5
): Promise<GenerationResult> {
  const config = getGeneratorConfig()
  
  if (!config.enabled) {
    return {
      success: false,
      questionsGenerated: 0,
      questions: [],
      error: 'Gerador de perguntas está desativado'
    }
  }

  const categoryInfo = CATEGORY_INFO[category]
  const prompt = QUIZ_GENERATION_PROMPT
    .replace('{{CATEGORY}}', categoryInfo.name)
    .replace('{{DESCRIPTION}}', categoryInfo.description)
    .replace('{{COUNT}}', count.toString())

  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em psicologia de relacionamentos. Responda apenas com JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    // Limpar o conteúdo (remover markdown se houver)
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanContent)
    
    const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => ({
      id: `q_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
      category,
      phase: categoryInfo.phase,
      type: q.type || 'FREQUENCIA',
      text: q.text,
      description: q.description,
      options: q.options.map((opt: any, optIndex: number) => ({
        id: `opt_${optIndex}`,
        text: opt.text,
        value: opt.value,
        isRed: opt.isRed || false
      })),
      weight: q.weight || 2,
      targetPerspective: q.targetPerspective || 'VITIMA',
      tags: q.tags || [],
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      aiGenerated: true,
      aiModel: config.model
    }))

    // Salvar no banco
    const bank = getQuestionBank()
    bank.push(...questions)
    saveQuestionBank(bank)

    return {
      success: true,
      questionsGenerated: questions.length,
      questions
    }

  } catch (error) {
    console.error('Erro ao gerar perguntas:', error)
    return {
      success: false,
      questionsGenerated: 0,
      questions: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// ============================================
// FUNÇÕES DE GERENCIAMENTO
// ============================================

// Aprovar pergunta
export function approveQuestion(questionId: string, approvedBy: string = 'admin'): boolean {
  const bank = getQuestionBank()
  const index = bank.findIndex(q => q.id === questionId)
  
  if (index === -1) return false
  
  bank[index].status = 'APPROVED'
  bank[index].approvedAt = new Date().toISOString()
  bank[index].approvedBy = approvedBy
  
  saveQuestionBank(bank)
  return true
}

// Rejeitar pergunta
export function rejectQuestion(questionId: string): boolean {
  const bank = getQuestionBank()
  const index = bank.findIndex(q => q.id === questionId)
  
  if (index === -1) return false
  
  bank[index].status = 'REJECTED'
  saveQuestionBank(bank)
  return true
}

// Deletar pergunta
export function deleteQuestion(questionId: string): boolean {
  const bank = getQuestionBank()
  const filtered = bank.filter(q => q.id !== questionId)
  
  if (filtered.length === bank.length) return false
  
  saveQuestionBank(filtered)
  return true
}

// Editar pergunta
export function updateQuestion(questionId: string, updates: Partial<QuizQuestion>): boolean {
  const bank = getQuestionBank()
  const index = bank.findIndex(q => q.id === questionId)
  
  if (index === -1) return false
  
  bank[index] = { ...bank[index], ...updates }
  saveQuestionBank(bank)
  return true
}

// ============================================
// FUNÇÕES PARA O QUIZ DO USUÁRIO
// ============================================

// Obter perguntas aprovadas para o quiz
export function getApprovedQuestions(): QuizQuestion[] {
  return getQuestionBank().filter(q => q.status === 'APPROVED')
}

// Obter perguntas por categoria
export function getQuestionsByCategory(category: QuizCategory): QuizQuestion[] {
  return getApprovedQuestions().filter(q => q.category === category)
}

// Obter quiz randomizado (10-15 perguntas)
export function getRandomizedQuiz(
  count: number = 12,
  categories?: QuizCategory[]
): QuizQuestion[] {
  let questions = getApprovedQuestions()
  
  // Filtrar por categorias se especificado
  if (categories && categories.length > 0) {
    questions = questions.filter(q => categories.includes(q.category))
  }
  
  // Embaralhar
  const shuffled = questions.sort(() => Math.random() - 0.5)
  
  // Garantir diversidade de categorias
  const selected: QuizQuestion[] = []
  const usedCategories = new Set<QuizCategory>()
  
  // Primeiro, pegar uma de cada categoria
  for (const q of shuffled) {
    if (!usedCategories.has(q.category) && selected.length < count) {
      selected.push(q)
      usedCategories.add(q.category)
    }
  }
  
  // Completar com as restantes
  for (const q of shuffled) {
    if (!selected.includes(q) && selected.length < count) {
      selected.push(q)
    }
  }
  
  // Embaralhar novamente a seleção final
  return selected.sort(() => Math.random() - 0.5)
}

// ============================================
// ESTATÍSTICAS
// ============================================

export function getQuizStats() {
  const bank = getQuestionBank()
  
  const byCategory: Record<string, number> = {}
  const byStatus: Record<string, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  }
  
  bank.forEach(q => {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1
    byStatus[q.status]++
  })
  
  return {
    total: bank.length,
    byCategory,
    byStatus,
    aiGenerated: bank.filter(q => q.aiGenerated).length,
    manual: bank.filter(q => !q.aiGenerated).length
  }
}

// ============================================
// PERGUNTAS INICIAIS (SEED)
// ============================================

export const SEED_QUESTIONS: Omit<QuizQuestion, 'id' | 'createdAt'>[] = [
  // GASLIGHTING
  {
    category: 'GASLIGHTING',
    type: 'FREQUENCIA',
    text: 'Você já ouviu frases como "isso nunca aconteceu" ou "você está inventando coisas"?',
    description: 'Quando você tenta falar sobre algo que aconteceu',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 3,
    targetPerspective: 'VITIMA',
    tags: ['memoria', 'negacao', 'confusao'],
    status: 'APPROVED',
    aiGenerated: false
  },
  {
    category: 'GASLIGHTING',
    type: 'FREQUENCIA',
    text: 'Você sente que sua memória está piorando ou que não pode confiar nas suas lembranças?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 3,
    targetPerspective: 'VITIMA',
    tags: ['memoria', 'autoconfianca'],
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // LOVE BOMBING
  {
    category: 'IDEALIZACAO_LOVE_BOMBING',
    type: 'FREQUENCIA',
    text: 'No início do relacionamento, a pessoa te encheu de atenção, presentes e declarações intensas muito rapidamente?',
    options: [
      { id: 'opt_0', text: 'Não', value: 0, isRed: false },
      { id: 'opt_1', text: 'Um pouco', value: 1, isRed: false },
      { id: 'opt_2', text: 'Moderadamente', value: 2, isRed: false },
      { id: 'opt_3', text: 'Bastante', value: 3, isRed: true },
      { id: 'opt_4', text: 'Extremamente', value: 4, isRed: true }
    ],
    weight: 2,
    targetPerspective: 'VITIMA',
    tags: ['inicio', 'intensidade', 'presentes'],
    phase: 'FASE_1_IDEALIZACAO',
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // ISOLAMENTO
  {
    category: 'ISOLAMENTO',
    type: 'FREQUENCIA',
    text: 'A pessoa critica ou fala mal dos seus amigos e familiares?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 2,
    targetPerspective: 'VITIMA',
    tags: ['familia', 'amigos', 'critica'],
    phase: 'FASE_2_DEPENDENCIA',
    status: 'APPROVED',
    aiGenerated: false
  },
  {
    category: 'ISOLAMENTO',
    type: 'FREQUENCIA',
    text: 'Você deixou de ver pessoas importantes para você por causa do relacionamento?',
    options: [
      { id: 'opt_0', text: 'Não', value: 0, isRed: false },
      { id: 'opt_1', text: 'Uma ou duas pessoas', value: 1, isRed: false },
      { id: 'opt_2', text: 'Algumas pessoas', value: 2, isRed: false },
      { id: 'opt_3', text: 'Muitas pessoas', value: 3, isRed: true },
      { id: 'opt_4', text: 'Quase todos', value: 4, isRed: true }
    ],
    weight: 3,
    targetPerspective: 'VITIMA',
    tags: ['afastamento', 'rede_apoio'],
    phase: 'FASE_2_DEPENDENCIA',
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // DESVALORIZAÇÃO
  {
    category: 'DESVALORIZACAO',
    type: 'FREQUENCIA',
    text: 'A pessoa faz comentários que diminuem suas conquistas ou capacidades?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 2,
    targetPerspective: 'VITIMA',
    tags: ['critica', 'autoestima', 'conquistas'],
    phase: 'FASE_3_DESVALORIZACAO',
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // MANIPULAÇÃO
  {
    category: 'MANIPULACAO',
    type: 'FREQUENCIA',
    text: 'Você sente que precisa "pisar em ovos" para não irritar a pessoa?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 3,
    targetPerspective: 'VITIMA',
    tags: ['medo', 'cuidado', 'tensao'],
    status: 'APPROVED',
    aiGenerated: false
  },
  {
    category: 'MANIPULACAO',
    type: 'FREQUENCIA',
    text: 'A pessoa usa chantagem emocional (chorar, ameaçar se machucar) para conseguir o que quer?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 3,
    targetPerspective: 'VITIMA',
    tags: ['chantagem', 'emocional', 'controle'],
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // CULPABILIZAÇÃO
  {
    category: 'CULPABILIZACAO',
    type: 'FREQUENCIA',
    text: 'Quando algo dá errado, a culpa sempre acaba sendo sua de alguma forma?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 2,
    targetPerspective: 'VITIMA',
    tags: ['culpa', 'responsabilidade'],
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // HOOVERING
  {
    category: 'HOOVERING',
    type: 'SIM_NAO',
    text: 'Após um término ou afastamento, a pessoa voltou prometendo mudanças e sendo muito carinhosa?',
    options: [
      { id: 'opt_0', text: 'Não', value: 0, isRed: false },
      { id: 'opt_1', text: 'Uma vez', value: 1, isRed: false },
      { id: 'opt_2', text: 'Algumas vezes', value: 2, isRed: true },
      { id: 'opt_3', text: 'Várias vezes', value: 3, isRed: true },
      { id: 'opt_4', text: 'É um padrão constante', value: 4, isRed: true }
    ],
    weight: 2,
    targetPerspective: 'VITIMA',
    tags: ['volta', 'promessas', 'ciclo'],
    phase: 'FASE_5_HOOVERING',
    status: 'APPROVED',
    aiGenerated: false
  },
  
  // IDENTIFICAÇÃO VÍTIMA
  {
    category: 'IDENTIFICACAO_VITIMA',
    type: 'FREQUENCIA',
    text: 'Você sente que perdeu sua identidade ou não sabe mais quem você é?',
    options: [
      { id: 'opt_0', text: 'Não', value: 0, isRed: false },
      { id: 'opt_1', text: 'Um pouco', value: 1, isRed: false },
      { id: 'opt_2', text: 'Moderadamente', value: 2, isRed: false },
      { id: 'opt_3', text: 'Bastante', value: 3, isRed: true },
      { id: 'opt_4', text: 'Completamente', value: 4, isRed: true }
    ],
    weight: 3,
    targetPerspective: 'VITIMA',
    tags: ['identidade', 'autoconhecimento'],
    status: 'APPROVED',
    aiGenerated: false
  },
  {
    category: 'IDENTIFICACAO_VITIMA',
    type: 'FREQUENCIA',
    text: 'Você se pega justificando ou defendendo comportamentos da pessoa para outras pessoas?',
    options: [
      { id: 'opt_0', text: 'Nunca', value: 0, isRed: false },
      { id: 'opt_1', text: 'Raramente', value: 1, isRed: false },
      { id: 'opt_2', text: 'Às vezes', value: 2, isRed: false },
      { id: 'opt_3', text: 'Frequentemente', value: 3, isRed: true },
      { id: 'opt_4', text: 'Sempre', value: 4, isRed: true }
    ],
    weight: 2,
    targetPerspective: 'VITIMA',
    tags: ['defesa', 'justificativa', 'negacao'],
    status: 'APPROVED',
    aiGenerated: false
  }
]

// Função para inicializar o banco com perguntas seed
export function initializeQuestionBank(): void {
  const bank = getQuestionBank()
  
  if (bank.length === 0) {
    const questions: QuizQuestion[] = SEED_QUESTIONS.map((q, index) => ({
      ...q,
      id: `seed_${index}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString()
    }))
    
    saveQuestionBank(questions)
    console.log(`✅ Banco de perguntas inicializado com ${questions.length} perguntas`)
  }
}

console.log('🧠 Quiz Generator initialized')
