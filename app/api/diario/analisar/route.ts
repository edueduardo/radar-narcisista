import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { analiseColaborativaAdmin } from '../../../../lib/ia-admin'
import type { ImpactLevel } from '../../../../lib/diary-types'

// Extrai ProblemTags do resultado da análise
function extractProblemsFromAnalysis(resultado: any): string[] {
  const problems: Set<string> = new Set()
  
  // Mapeia tags comuns para ProblemTags
  const tagToProblem: Record<string, string> = {
    'gaslighting': 'gaslighting',
    'love bombing': 'manipulacao',
    'hoovering': 'manipulacao',
    'triangulação': 'manipulacao',
    'projeção': 'manipulacao',
    'vitimização': 'manipulacao',
    'isolamento': 'isolamento',
    'controle financeiro': 'isolamento',
    'monitoramento': 'isolamento',
    'ciúmes': 'isolamento',
    'agressão verbal': 'ameacas',
    'humilhação': 'ameacas',
    'ameaça': 'ameacas',
    'explosão': 'ameacas',
    'minimização': 'invalidacao',
    'negação': 'invalidacao',
    'desqualificação': 'invalidacao',
    'desrespeito': 'invalidacao',
    'autoestima': 'autoestima_baixa',
    'crítica destrutiva': 'autoestima_baixa',
  }
  
  try {
    // Tenta extrair tags das análises
    if (resultado?.etapa_1_analises) {
      resultado.etapa_1_analises.forEach((analise: any) => {
        const resposta = analise?.resposta
        if (resposta?.tags && Array.isArray(resposta.tags)) {
          resposta.tags.forEach((tag: string) => {
            const tagLower = tag.toLowerCase()
            for (const [key, problem] of Object.entries(tagToProblem)) {
              if (tagLower.includes(key)) {
                problems.add(problem)
              }
            }
          })
        }
      })
    }
  } catch (e) {
    console.error('Erro ao extrair problems:', e)
  }
  
  // Se não encontrou nada, retorna manipulacao como default
  if (problems.size === 0) {
    problems.add('manipulacao')
  }
  
  return Array.from(problems)
}

// Extrai nível de impacto do resultado
function extractImpactLevel(resultado: any): ImpactLevel {
  try {
    if (resultado?.etapa_3_consenso?.impacto) {
      const impacto = resultado.etapa_3_consenso.impacto.toLowerCase()
      if (impacto.includes('alto') || impacto.includes('high')) return 'alto'
      if (impacto.includes('baixo') || impacto.includes('low')) return 'baixo'
    }
    // Tenta das análises individuais
    if (resultado?.etapa_1_analises?.[0]?.resposta?.impacto) {
      const impacto = resultado.etapa_1_analises[0].resposta.impacto.toLowerCase()
      if (impacto.includes('alto') || impacto.includes('high')) return 'alto'
      if (impacto.includes('baixo') || impacto.includes('low')) return 'baixo'
    }
  } catch (e) {
    console.error('Erro ao extrair impacto:', e)
  }
  return 'medio'
}

// Extrai resumo do resultado
function extractSummary(resultado: any): string | null {
  try {
    if (resultado?.etapa_3_consenso?.resumo) {
      return resultado.etapa_3_consenso.resumo
    }
    if (resultado?.etapa_1_analises?.[0]?.resposta?.resumo) {
      return resultado.etapa_1_analises[0].resposta.resumo
    }
  } catch (e) {
    console.error('Erro ao extrair resumo:', e)
  }
  return null
}

// Extrai tags do resultado
function extractTags(resultado: any): string[] {
  const tags: Set<string> = new Set()
  try {
    if (resultado?.etapa_1_analises) {
      resultado.etapa_1_analises.forEach((analise: any) => {
        if (analise?.resposta?.tags && Array.isArray(analise.resposta.tags)) {
          analise.resposta.tags.forEach((tag: string) => tags.add(tag.toLowerCase()))
        }
      })
    }
  } catch (e) {
    console.error('Erro ao extrair tags:', e)
  }
  return Array.from(tags)
}

// Extrai modelos de IA usados
function extractAiModels(resultado: any): string[] {
  const models: string[] = []
  try {
    if (resultado?.etapa_1_analises) {
      resultado.etapa_1_analises.forEach((analise: any) => {
        if (analise?.ia) {
          models.push(analise.ia)
        }
      })
    }
  } catch (e) {
    console.error('Erro ao extrair modelos:', e)
  }
  return models
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const rawText = typeof body?.text === 'string' ? body.text : ''
    const text = rawText.trim()
    const entryId = body?.entry_id || null  // ID do episódio (opcional, para salvar histórico)

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Texto vazio para análise' },
        { status: 400 }
      )
    }

    // Logs SEGUROS para verificar se o servidor enxerga as chaves de IA
    console.log('[API /diario/analisar] ENV CHECK:', {
      OPENAI: process.env.OPENAI_API_KEY ? String(process.env.OPENAI_API_KEY).length : 0,
      ANTHROPIC: process.env.ANTHROPIC_API_KEY ? String(process.env.ANTHROPIC_API_KEY).length : 0,
      TOGETHER: process.env.TOGETHER_API_KEY ? String(process.env.TOGETHER_API_KEY).length : 0,
      GROQ: process.env.GROQ_API_KEY ? String(process.env.GROQ_API_KEY).length : 0,
      GEMINI: process.env.GEMINI_API_KEY ? String(process.env.GEMINI_API_KEY).length : 0,
    })

    const resultado = await analiseColaborativaAdmin(text)

    if (!resultado || !Array.isArray(resultado.etapa_1_analises) || resultado.etapa_1_analises.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma IA conseguiu analisar.' },
        { status: 502 }
      )
    }

    // Se tiver entry_id, salva no histórico de análises
    let savedAnalysis = null
    if (entryId) {
      try {
        const cookieStore = cookies()
        const supabase = await createRouteHandlerClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Busca próxima versão
          const { data: maxVersionData } = await supabase
            .from('diary_analyses')
            .select('version')
            .eq('entry_id', entryId)
            .order('version', { ascending: false })
            .limit(1)
            .single()
          
          const nextVersion = (maxVersionData?.version || 0) + 1
          
          // Extrai dados do resultado
          const impactLevel = extractImpactLevel(resultado)
          const mainProblems = extractProblemsFromAnalysis(resultado)
          const tags = extractTags(resultado)
          const summary = extractSummary(resultado)
          const aiModels = extractAiModels(resultado)
          
          // Insere nova análise
          const { data: insertedAnalysis, error: insertError } = await supabase
            .from('diary_analyses')
            .insert({
              entry_id: entryId,
              user_id: user.id,
              version: nextVersion,
              impact_level: impactLevel,
              main_problems: mainProblems,
              tags: tags,
              summary: summary,
              ai_raw: resultado,
              ai_models_used: aiModels,
              consensus_level: resultado?.etapa_2_votacoes?.[0]?.consenso || 0,
            })
            .select()
            .single()
          
          if (insertError) {
            console.error('[API /diario/analisar] Erro ao salvar análise:', insertError)
          } else {
            savedAnalysis = insertedAnalysis
            console.log('[API /diario/analisar] Análise salva com sucesso, versão:', nextVersion)
          }
        }
      } catch (saveError) {
        console.error('[API /diario/analisar] Erro ao salvar histórico:', saveError)
        // Não falha a requisição, apenas loga o erro
      }
    }

    return NextResponse.json({ 
      success: true, 
      resultado,
      savedAnalysis  // Retorna a análise salva (se houver)
    })
  } catch (error) {
    console.error('Erro na API /api/diario/analisar:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno na análise' },
      { status: 500 }
    )
  }
}
