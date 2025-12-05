/**
 * API de Feedback para Beta Testers
 * ETAPA 15 - Beta com 5 Usuárias
 * 
 * POST: Enviar feedback
 * GET: Listar feedbacks (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

const VALID_FEEDBACK_TYPES = ['bug', 'sugestao', 'elogio', 'confusao', 'medo', 'outro']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { feedback_type, message, page_path, feature_used, rating } = body

    // Validações
    if (!feedback_type || !VALID_FEEDBACK_TYPES.includes(feedback_type)) {
      return NextResponse.json(
        { error: 'Tipo de feedback inválido' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Mensagem muito curta (mínimo 5 caracteres)' },
        { status: 400 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    // Inserir feedback
    const { data, error } = await supabase
      .from('beta_feedback')
      .insert({
        user_id: user.id,
        feedback_type,
        message: message.trim(),
        page_path,
        feature_used,
        rating,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar feedback:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback enviado com sucesso! Obrigado por ajudar a melhorar o Radar.',
      feedback: data,
    })
  } catch (error) {
    console.error('Erro na API de feedback:', error)
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
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar todos os feedbacks
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const resolved = searchParams.get('resolved')

    let query = supabase
      .from('beta_feedback')
      .select('*, user_profiles(name, beta_group)')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('feedback_type', type)
    }

    if (resolved !== null) {
      query = query.eq('is_resolved', resolved === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar feedbacks:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar feedbacks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ feedbacks: data })
  } catch (error) {
    console.error('Erro na API de feedback:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
