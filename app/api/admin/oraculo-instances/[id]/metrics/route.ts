/**
 * API de Métricas de Instância do Oráculo
 * ETAPA 35 - Dashboard de métricas por instância
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Cliente Supabase admin
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verificar se usuário é admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return false
  
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  return data?.role === 'ADMIN' || data?.role === 'SUPER_ADMIN'
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Busca métricas agregadas da instância
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Erro de configuração' }, { status: 500 })
    }

    // Parâmetros de período
    const searchParams = request.nextUrl.searchParams
    const periodo = searchParams.get('periodo') || '30d'
    
    // Calcular datas
    const hoje = new Date()
    let dataInicio: Date
    
    switch (periodo) {
      case '7d':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Buscar uso diário
    const { data: usoDiario, error: erroDiario } = await supabaseAdmin
      .from('oraculo_instance_usage')
      .select('*')
      .eq('instance_id', id)
      .eq('periodo_tipo', 'diario')
      .gte('periodo_inicio', dataInicio.toISOString().split('T')[0])
      .order('periodo_inicio', { ascending: true })

    if (erroDiario) {
      console.error('Erro ao buscar uso diário:', erroDiario)
    }

    // Buscar uso mensal
    const { data: usoMensal, error: erroMensal } = await supabaseAdmin
      .from('oraculo_instance_usage')
      .select('*')
      .eq('instance_id', id)
      .eq('periodo_tipo', 'mensal')
      .order('periodo_inicio', { ascending: false })
      .limit(12)

    if (erroMensal) {
      console.error('Erro ao buscar uso mensal:', erroMensal)
    }

    // Calcular totais
    const totalPerguntas = (usoDiario || []).reduce((sum, d) => sum + (d.total_perguntas || 0), 0)
    const totalTokensInput = (usoDiario || []).reduce((sum, d) => sum + (d.total_tokens_input || 0), 0)
    const totalTokensOutput = (usoDiario || []).reduce((sum, d) => sum + (d.total_tokens_output || 0), 0)
    const totalCusto = (usoDiario || []).reduce((sum, d) => sum + (d.custo_estimado_cents || 0), 0)

    // Calcular médias
    const diasComDados = (usoDiario || []).filter(d => d.total_perguntas > 0).length
    const mediaPerguntasDia = diasComDados > 0 ? Math.round(totalPerguntas / diasComDados) : 0
    const mediaTokensDia = diasComDados > 0 ? Math.round((totalTokensInput + totalTokensOutput) / diasComDados) : 0

    // Calcular tendência (comparar última semana com anterior)
    const ultimaSemana = (usoDiario || []).slice(-7)
    const semanaAnterior = (usoDiario || []).slice(-14, -7)
    
    const perguntasUltimaSemana = ultimaSemana.reduce((sum, d) => sum + (d.total_perguntas || 0), 0)
    const perguntasSemanaAnterior = semanaAnterior.reduce((sum, d) => sum + (d.total_perguntas || 0), 0)
    
    let tendencia = 0
    if (perguntasSemanaAnterior > 0) {
      tendencia = Math.round(((perguntasUltimaSemana - perguntasSemanaAnterior) / perguntasSemanaAnterior) * 100)
    }

    // Formatar histórico diário
    const historioDiario = (usoDiario || []).map(d => ({
      data: d.periodo_inicio,
      perguntas: d.total_perguntas || 0,
      tokens_input: d.total_tokens_input || 0,
      tokens_output: d.total_tokens_output || 0,
      custo_cents: d.custo_estimado_cents || 0
    }))

    // Formatar histórico mensal
    const historicoMensal = (usoMensal || []).map(d => ({
      mes: d.periodo_inicio,
      perguntas: d.total_perguntas || 0,
      tokens_input: d.total_tokens_input || 0,
      tokens_output: d.total_tokens_output || 0,
      custo_cents: d.custo_estimado_cents || 0
    })).reverse()

    return NextResponse.json({
      success: true,
      periodo,
      resumo: {
        total_perguntas: totalPerguntas,
        total_tokens_input: totalTokensInput,
        total_tokens_output: totalTokensOutput,
        total_tokens: totalTokensInput + totalTokensOutput,
        custo_estimado_cents: totalCusto,
        media_perguntas_dia: mediaPerguntasDia,
        media_tokens_dia: mediaTokensDia,
        dias_com_uso: diasComDados,
        tendencia_percentual: tendencia
      },
      historico: {
        diario: historioDiario,
        mensal: historicoMensal
      }
    })

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    )
  }
}
