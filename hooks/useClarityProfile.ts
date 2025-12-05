'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase/compat'
import { GlobalZone } from '@/lib/clarity-unified-config'

/**
 * Perfil de Clareza do usuário
 * Representa o teste de clareza marcado como "base" do sistema
 */
// Estrutura de score por categoria (TEMA 3)
export interface CategoryScore {
  score: number
  percentage: number
  level: 'baixo' | 'moderado' | 'alto'
}

// Estrutura de score por eixo (TEMA 3)
export interface AxisScore {
  score: number
  percentage: number
  level: 'baixo' | 'moderado' | 'alto'
}

export interface ClarityProfile {
  id: string
  createdAt: string
  completedAt?: string    // TEMA 3: data/hora exata de conclusão
  globalZone: GlobalZone
  overallPercentage: number
  fogScore: number        // Névoa mental
  fearScore: number       // Medo e tensão
  limitsScore: number     // Desrespeito a limites
  hasPhysicalRisk: boolean
  userNarrative?: string
  rawAnswers?: Record<string, number>
  
  // NOVOS CAMPOS - TEMA 3
  categoryScores?: Record<string, CategoryScore>  // Scores das 6 categorias
  axisScores?: Record<string, AxisScore>          // Scores detalhados dos 3 eixos
  summary?: string                                 // Resumo gerado pela IA
  
  // Campos derivados (calculados)
  topAxes: Array<{ axis: string; score: number }>
  topCategories: string[]
  daysAgo: number
}

interface UseClarityProfileReturn {
  profile: ClarityProfile | null
  hasProfile: boolean
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  activateProfile: (testId?: string, data?: {
    answers: Record<string, number>
    userNarrative?: string
    result: any
  }) => Promise<{ success: boolean; testId?: string; error?: string }>
}

/**
 * Hook para acessar e gerenciar o perfil de clareza do usuário
 * 
 * Uso:
 * const { profile, hasProfile, activateProfile } = useClarityProfile()
 * 
 * if (hasProfile) {
 *   console.log('Zona:', profile.globalZone)
 *   console.log('Risco físico:', profile.hasPhysicalRisk)
 * }
 */
export function useClarityProfile(): UseClarityProfileReturn {
  const [profile, setProfile] = useState<ClarityProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  
  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setProfile(null)
        setIsLoading(false)
        return
      }
      
      // Buscar teste marcado como base
      const { data, error: fetchError } = await supabase
        .from('clarity_tests')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_profile_base', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError)
        setError('Erro ao carregar perfil de clareza')
        setProfile(null)
        setIsLoading(false)
        return
      }
      
      if (!data) {
        setProfile(null)
        setIsLoading(false)
        return
      }
      
      // Calcular campos derivados
      const axes = [
        { axis: 'nevoa', score: data.fog_score || 0 },
        { axis: 'medo', score: data.fear_score || 0 },
        { axis: 'limites', score: data.limits_score || 0 },
      ].sort((a, b) => b.score - a.score)
      
      // Calcular dias desde o teste
      const testDate = new Date(data.created_at)
      const now = new Date()
      const daysAgo = Math.floor((now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Determinar top categorias baseado nas respostas
      const topCategories: string[] = []
      if (data.raw_answers) {
        const categoryScores: Record<string, number> = {}
        const categoryPrefixes = ['inv', 'gas', 'con', 'iso', 'emo', 'fis']
        const categoryNames = ['invalidacao', 'gaslighting', 'controle', 'isolamento', 'emocional', 'fisico']
        
        categoryPrefixes.forEach((prefix, index) => {
          let total = 0
          let count = 0
          Object.entries(data.raw_answers).forEach(([key, value]) => {
            if (key.startsWith(prefix)) {
              total += value as number
              count++
            }
          })
          if (count > 0) {
            categoryScores[categoryNames[index]] = total / count
          }
        })
        
        // Pegar top 3 categorias
        Object.entries(categoryScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .forEach(([cat]) => topCategories.push(cat))
      }
      
      setProfile({
        id: data.id,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        globalZone: (data.global_zone?.toLowerCase() || 'atencao') as GlobalZone,
        overallPercentage: data.overall_percentage || 0,
        fogScore: data.fog_score || 0,
        fearScore: data.fear_score || 0,
        limitsScore: data.limits_score || 0,
        hasPhysicalRisk: data.has_physical_risk || false,
        userNarrative: data.user_narrative,
        rawAnswers: data.raw_answers,
        // NOVOS CAMPOS - TEMA 3
        categoryScores: data.category_scores,
        axisScores: data.axis_scores,
        summary: data.summary,
        // Campos derivados
        topAxes: axes,
        topCategories,
        daysAgo,
      })
      
    } catch (err) {
      console.error('Erro no hook useClarityProfile:', err)
      setError('Erro inesperado ao carregar perfil')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])
  
  const activateProfile = useCallback(async (
    testId?: string,
    data?: {
      answers: Record<string, number>
      userNarrative?: string
      result: any
    }
  ): Promise<{ success: boolean; testId?: string; error?: string }> => {
    try {
      const response = await fetch('/api/clarity/activate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testId ? { testId } : data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Erro ao ativar perfil' }
      }
      
      // Recarregar perfil após ativação
      await fetchProfile()
      
      return { success: true, testId: result.testId }
      
    } catch (err) {
      console.error('Erro ao ativar perfil:', err)
      return { success: false, error: 'Erro de conexão' }
    }
  }, [fetchProfile])
  
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])
  
  return {
    profile,
    hasProfile: !!profile,
    isLoading,
    error,
    refetch: fetchProfile,
    activateProfile,
  }
}

/**
 * Helper para obter contexto de clareza para IAs
 * Retorna um texto formatado para injetar no prompt do Coach/outras IAs
 */
export function getClarityContextForAI(profile: ClarityProfile | null): string {
  if (!profile) {
    return 'A usuária ainda não fez o Teste de Clareza ou não salvou como base.'
  }
  
  const zoneLabels: Record<GlobalZone, string> = {
    atencao: 'Zona de Atenção (sinais leves)',
    alerta: 'Zona de Alerta (sinais moderados)',
    vermelha: 'Zona de Alto Risco (sinais graves)',
  }
  
  const axisLabels: Record<string, string> = {
    nevoa: 'Névoa Mental (confusão, gaslighting)',
    medo: 'Medo e Tensão (andar em ovos)',
    limites: 'Desrespeito a Limites (isolamento, controle)',
  }
  
  const categoryLabels: Record<string, string> = {
    invalidacao: 'Invalidação',
    gaslighting: 'Gaslighting',
    controle: 'Controle',
    isolamento: 'Isolamento',
    emocional: 'Abuso Emocional',
    fisico: 'Risco Físico',
  }
  
  let context = `CONTEXTO DE CLAREZA DA USUÁRIA:\n`
  context += `- Teste realizado há ${profile.daysAgo} dias\n`
  context += `- Zona atual: ${zoneLabels[profile.globalZone]}\n`
  context += `- Percentual geral: ${Math.round(profile.overallPercentage * 100)}%\n`
  
  if (profile.hasPhysicalRisk) {
    context += `- ⚠️ ALERTA: Sinais de possível risco físico detectados\n`
  }
  
  context += `\nEIXOS MAIS IMPACTADOS:\n`
  profile.topAxes.forEach((axis, i) => {
    context += `${i + 1}. ${axisLabels[axis.axis] || axis.axis}: ${axis.score} pontos\n`
  })
  
  if (profile.topCategories.length > 0) {
    context += `\nCATEGORIAS PRINCIPAIS:\n`
    profile.topCategories.forEach((cat, i) => {
      context += `${i + 1}. ${categoryLabels[cat] || cat}\n`
    })
  }
  
  if (profile.userNarrative) {
    context += `\nNARRATIVA DA USUÁRIA (pergunta aberta):\n"${profile.userNarrative.slice(0, 500)}${profile.userNarrative.length > 500 ? '...' : ''}"\n`
  }
  
  context += `\nUse essas informações para adaptar sua linguagem e sugestões. Não repita diagnósticos, apenas use como contexto.`
  
  return context
}
