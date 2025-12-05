import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

/**
 * API do Diário com Detecção Automática de Risco
 * 
 * POST /api/diario - Criar nova entrada
 * GET /api/diario - Listar entradas do usuário
 */

// Tags que indicam risco e devem gerar alerta
const HIGH_RISK_TAGS = [
  'ameaca_velada',
  'ameaca_explicita',
  'ameacas',
  'agressao_verbal',
  'agressao_fisica',
  'explosao',
  'violencia',
  'medo_intenso',
  'perigo_iminente',
  'estrangulamento',
  'arma'
]

// Tags de risco moderado
const MODERATE_RISK_TAGS = [
  'gaslighting',
  'isolamento',
  'controle_financeiro',
  'humilhacao',
  'intimidacao',
  'ciumes_excessivo',
  'monitoramento'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      content, 
      title,
      tags = [], 
      impact_score,
      entry_type = 'episode',
      emotions = [],
      metadata = {}
    } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    // Criar entrada no diário
    const { data: entry, error: insertError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        content,
        title: title || null,
        tags,
        impact_score: impact_score || null,
        entry_type,
        emotions,
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar entrada:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar entrada' },
        { status: 500 }
      )
    }

    // Verificar se há tags de risco
    const highRiskTagsFound = tags.filter((t: string) => 
      HIGH_RISK_TAGS.includes(t.toLowerCase())
    )
    const moderateRiskTagsFound = tags.filter((t: string) => 
      MODERATE_RISK_TAGS.includes(t.toLowerCase())
    )

    let riskAlert = null

    // Criar alerta de risco se necessário
    if (highRiskTagsFound.length > 0 || (moderateRiskTagsFound.length >= 3)) {
      const riskLevel = highRiskTagsFound.length > 0 ? 'high' : 'moderate'
      const allRiskTags = [...highRiskTagsFound, ...moderateRiskTagsFound]

      const { data: alert, error: alertError } = await supabase
        .from('risk_alerts')
        .insert({
          user_id: user.id,
          source: 'journal',
          source_id: entry.id,
          risk_level: riskLevel,
          risk_type: highRiskTagsFound[0] || moderateRiskTagsFound[0] || 'pattern',
          details: {
            tags_detected: allRiskTags,
            entry_title: title,
            entry_preview: content.substring(0, 100),
            impact_score
          },
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!alertError && alert) {
        riskAlert = alert
        console.log(`[Diário] Alerta de risco criado: ${riskLevel} - Tags: ${allRiskTags.join(', ')}`)
      }
    }

    // Verificar padrão de risco nos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('tags, impact_score')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (recentEntries && recentEntries.length >= 3) {
      // Contar tags de risco nos últimos 30 dias
      let highRiskCount = 0
      let moderateRiskCount = 0

      recentEntries.forEach(e => {
        if (e.tags && Array.isArray(e.tags)) {
          e.tags.forEach((tag: string) => {
            if (HIGH_RISK_TAGS.includes(tag.toLowerCase())) highRiskCount++
            if (MODERATE_RISK_TAGS.includes(tag.toLowerCase())) moderateRiskCount++
          })
        }
      })

      // Se houver padrão de risco, sugerir revisão do plano de segurança
      const shouldSuggestSafetyPlan = highRiskCount >= 3 || moderateRiskCount >= 5

      return NextResponse.json({
        success: true,
        entry,
        riskAlert,
        riskAnalysis: {
          highRiskTagsFound,
          moderateRiskTagsFound,
          pattern: {
            highRiskCount,
            moderateRiskCount,
            shouldSuggestSafetyPlan
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      entry,
      riskAlert,
      riskAnalysis: {
        highRiskTagsFound,
        moderateRiskTagsFound
      }
    })

  } catch (error) {
    console.error('Erro na API do diário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const entryType = searchParams.get('entry_type')
    const tag = searchParams.get('tag')

    let query = supabase
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (entryType) {
      query = query.eq('entry_type', entryType)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data: entries, error, count } = await query

    if (error) {
      console.error('Erro ao buscar entradas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar entradas' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      entries,
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('Erro na API do diário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
