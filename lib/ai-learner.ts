/**
 * IA Aprendiz de Editor
 * Ideia Diamante #4: Treino implícito via feedback do admin
 * 
 * A IA aprende com as correções do admin para melhorar sugestões futuras
 */

import { createClient } from '@supabase/supabase-js'

// Tipos de feedback
export type FeedbackType = 
  | 'approved'      // Admin aprovou sem alterações
  | 'edited'        // Admin editou antes de aprovar
  | 'rejected'      // Admin rejeitou
  | 'improved'      // Admin melhorou significativamente

export interface AIFeedback {
  id?: string
  content_type: 'chat_response' | 'content_suggestion' | 'risk_analysis' | 'summary'
  original_content: string
  final_content?: string
  feedback_type: FeedbackType
  admin_notes?: string
  context?: Record<string, any>
  model_used?: string
  prompt_used?: string
  created_at?: string
}

export interface LearningPattern {
  pattern_type: string
  description: string
  examples: {
    bad: string
    good: string
  }[]
  weight: number
  active: boolean
}

/**
 * Registra feedback do admin sobre conteúdo gerado pela IA
 */
export async function recordAIFeedback(
  supabase: any,
  feedback: AIFeedback
): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
  try {
    const insertData = {
      content_type: feedback.content_type,
      original_content: feedback.original_content,
      final_content: feedback.final_content || null,
      feedback_type: feedback.feedback_type,
      admin_notes: feedback.admin_notes || null,
      context: feedback.context || {},
      model_used: feedback.model_used || null,
      prompt_used: feedback.prompt_used || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('ai_feedback')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao registrar feedback:', error)
      return { success: false, error: error.message }
    }

    // Se foi editado, extrair padrões de aprendizado
    if (feedback.feedback_type === 'edited' && feedback.final_content) {
      await extractLearningPatterns(supabase, feedback)
    }

    return { success: true, feedbackId: data?.id }
  } catch (error) {
    console.error('Erro ao registrar feedback:', error)
    return { success: false, error: 'Erro interno' }
  }
}

/**
 * Extrai padrões de aprendizado das edições do admin
 */
async function extractLearningPatterns(
  supabase: any,
  feedback: AIFeedback
): Promise<void> {
  if (!feedback.original_content || !feedback.final_content) return

  const original = feedback.original_content
  const final = feedback.final_content

  // Análise simples de diferenças
  const patterns: Partial<LearningPattern>[] = []

  // Padrão 1: Remoção de linguagem técnica
  if (original.includes('narcisista') && !final.includes('narcisista')) {
    patterns.push({
      pattern_type: 'avoid_technical_terms',
      description: 'Evitar termos técnicos como "narcisista" em respostas ao usuário',
      weight: 0.8
    })
  }

  // Padrão 2: Adição de empatia
  const empathyWords = ['entendo', 'compreendo', 'difícil', 'válido', 'sentir']
  const originalEmpathy = empathyWords.filter(w => original.toLowerCase().includes(w)).length
  const finalEmpathy = empathyWords.filter(w => final.toLowerCase().includes(w)).length
  
  if (finalEmpathy > originalEmpathy) {
    patterns.push({
      pattern_type: 'increase_empathy',
      description: 'Adicionar mais expressões de empatia e validação',
      weight: 0.9
    })
  }

  // Padrão 3: Encurtamento de respostas
  if (final.length < original.length * 0.7) {
    patterns.push({
      pattern_type: 'shorter_responses',
      description: 'Preferir respostas mais concisas',
      weight: 0.6
    })
  }

  // Padrão 4: Remoção de conselhos diretos
  const adviceWords = ['você deve', 'você precisa', 'faça', 'não faça']
  const originalAdvice = adviceWords.filter(w => original.toLowerCase().includes(w)).length
  const finalAdvice = adviceWords.filter(w => final.toLowerCase().includes(w)).length
  
  if (finalAdvice < originalAdvice) {
    patterns.push({
      pattern_type: 'avoid_direct_advice',
      description: 'Evitar conselhos diretos, preferir perguntas reflexivas',
      weight: 0.85
    })
  }

  // Salvar padrões identificados
  for (const pattern of patterns) {
    await supabase.from('ai_learning_patterns').upsert({
      ...pattern,
      examples: [{
        bad: original.substring(0, 200),
        good: final.substring(0, 200)
      }],
      active: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'pattern_type'
    })
  }
}

/**
 * Obtém padrões de aprendizado ativos para melhorar prompts
 */
export async function getActiveLearningPatterns(
  supabase: any
): Promise<LearningPattern[]> {
  const { data, error } = await supabase
    .from('ai_learning_patterns')
    .select('*')
    .eq('active', true)
    .order('weight', { ascending: false })

  if (error) {
    console.error('Erro ao buscar padrões:', error)
    return []
  }

  return data || []
}

/**
 * Gera instruções adicionais para o prompt baseado nos padrões aprendidos
 */
export async function generateLearningInstructions(
  supabase: any
): Promise<string> {
  const patterns = await getActiveLearningPatterns(supabase)
  
  if (patterns.length === 0) {
    return ''
  }

  const instructions = patterns
    .filter(p => p.weight >= 0.7)
    .map(p => `- ${p.description}`)
    .join('\n')

  return `
## Instruções Aprendidas (baseadas em feedback do admin):
${instructions}
`
}

/**
 * Calcula métricas de aprendizado
 */
export async function getLearningMetrics(
  supabase: any
): Promise<{
  totalFeedbacks: number
  approvalRate: number
  editRate: number
  rejectionRate: number
  topPatterns: LearningPattern[]
}> {
  // Total de feedbacks
  const { count: totalFeedbacks } = await supabase
    .from('ai_feedback')
    .select('*', { count: 'exact', head: true })

  // Feedbacks por tipo
  const { data: feedbacksByType } = await supabase
    .from('ai_feedback')
    .select('feedback_type')

  const counts = {
    approved: 0,
    edited: 0,
    rejected: 0,
    improved: 0
  }

  feedbacksByType?.forEach((f: { feedback_type: string }) => {
    if (f.feedback_type in counts) {
      counts[f.feedback_type as keyof typeof counts]++
    }
  })

  const total = totalFeedbacks || 1

  // Top padrões
  const topPatterns = await getActiveLearningPatterns(supabase)

  return {
    totalFeedbacks: totalFeedbacks || 0,
    approvalRate: (counts.approved / total) * 100,
    editRate: (counts.edited / total) * 100,
    rejectionRate: (counts.rejected / total) * 100,
    topPatterns: topPatterns.slice(0, 5)
  }
}

/**
 * SQL para criar tabelas necessárias
 */
export const AI_LEARNER_SCHEMA = `
-- Tabela de feedback da IA
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  original_content TEXT NOT NULL,
  final_content TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('approved', 'edited', 'rejected', 'improved')),
  admin_notes TEXT,
  context JSONB DEFAULT '{}',
  model_used TEXT,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de padrões aprendidos
CREATE TABLE IF NOT EXISTS ai_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  examples JSONB DEFAULT '[]',
  weight DECIMAL(3,2) DEFAULT 0.5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_feedback_type ON ai_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_content_type ON ai_feedback(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_active ON ai_learning_patterns(active);
`
