// =============================================================================
// TIPOS DO DIÁRIO - Entradas e Análises de IA
// =============================================================================

import type { ProblemTag } from './tools-config'

// -----------------------------------------------------------------------------
// ENTRADA DO DIÁRIO
// -----------------------------------------------------------------------------

// Tipos de entrada do diário (ETAPA 2 - TRIÂNGULO)
export type JournalEntryType = 
  | 'normal'           // Episódio comum registrado pelo usuário
  | 'clarity_baseline' // Entrada automática do Teste de Clareza
  | 'chat_summary'     // Resumo de sessão do Chat (futuro)
  | 'voice_note'       // Nota de voz transcrita (futuro)
  | 'photo_note'       // Foto com descrição IA (futuro)
  | 'video_note'       // Vídeo com descrição IA (futuro)

export interface JournalEntry {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  
  title: string | null
  context: string | null  // 'RELACIONAMENTO' | 'FAMILIA' | 'TRABALHO' | 'OUTRO'
  description: string | null
  impact_score: number | null  // 1-3
  mood_intensity?: number | null  // 0-10
  highlight?: string | null
  tags: string[]
  from_voice?: boolean
  
  // ETAPA 2 - TRIÂNGULO: Campos de integração Clareza ⇄ Diário
  entry_type?: JournalEntryType  // Tipo da entrada (default: 'normal')
  clarity_test_id?: string | null  // Referência ao teste de clareza (se aplicável)
}

// -----------------------------------------------------------------------------
// ANÁLISE DE IA (HISTÓRICO)
// -----------------------------------------------------------------------------

export type ImpactLevel = 'baixo' | 'medio' | 'alto'

export interface DiaryAnalysis {
  id: string
  entry_id: string
  user_id: string
  
  version: number  // Incrementa a cada nova análise
  created_at: string
  
  // Resultado da análise
  impact_level: ImpactLevel
  main_problems: ProblemTag[]  // ProblemTags detectados
  tags: string[]  // Tags de abuso detectadas
  
  // Textos gerados
  summary: string | null
  recommendations: string | null
  
  // Dados brutos da IA
  ai_raw: any | null  // JSON completo retornado pela análise
  
  // Metadados
  ai_models_used: string[]
  consensus_level: number  // 0-100
}

// -----------------------------------------------------------------------------
// ENTRADA COM ANÁLISES (para página de laudo)
// -----------------------------------------------------------------------------

export interface JournalEntryWithAnalyses extends JournalEntry {
  analyses: DiaryAnalysis[]
  currentAnalysis: DiaryAnalysis | null
  previousAnalyses: DiaryAnalysis[]
}

// -----------------------------------------------------------------------------
// PAYLOAD PARA CRIAR ANÁLISE
// -----------------------------------------------------------------------------

export interface CreateAnalysisPayload {
  entry_id: string
  impact_level: ImpactLevel
  main_problems: ProblemTag[]
  tags: string[]
  summary?: string
  recommendations?: string
  ai_raw?: any
  ai_models_used?: string[]
  consensus_level?: number
}

// -----------------------------------------------------------------------------
// RESPOSTA DA API DE ANÁLISE
// -----------------------------------------------------------------------------

export interface AnalysisApiResponse {
  success: boolean
  resultado?: {
    etapa_1_analises: Array<{
      ia: string
      resposta: any
    }>
    etapa_2_votacao?: any
    etapa_3_consenso?: any
    etapa_4_transparencia?: any
  }
  error?: string
}

// -----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------------------------------------

/** Converte impact_score (1-3) para ImpactLevel */
export function impactScoreToLevel(score: number | null): ImpactLevel {
  if (!score || score <= 1) return 'baixo'
  if (score === 2) return 'medio'
  return 'alto'
}

/** Converte ImpactLevel para impact_score (1-3) */
export function impactLevelToScore(level: ImpactLevel): number {
  switch (level) {
    case 'baixo': return 1
    case 'medio': return 2
    case 'alto': return 3
    default: return 2
  }
}

/** Retorna cor e label para ImpactLevel */
export function getImpactDisplay(level: ImpactLevel): { label: string; color: string; bgColor: string } {
  switch (level) {
    case 'baixo':
      return { label: 'Baixo Impacto', color: 'text-green-700', bgColor: 'bg-green-100' }
    case 'medio':
      return { label: 'Médio Impacto', color: 'text-yellow-700', bgColor: 'bg-yellow-100' }
    case 'alto':
      return { label: 'Alto Impacto', color: 'text-red-700', bgColor: 'bg-red-100' }
    default:
      return { label: 'Impacto', color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }
}
