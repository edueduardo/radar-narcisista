import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Progresso do Academy - FANPAGE VIVA
 * 
 * GET /api/academy/progress - Busca progresso do usuário
 * POST /api/academy/progress - Registra/atualiza progresso
 */

// GET - Busca progresso do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const trackId = searchParams.get('track_id')
    
    let query = supabase
      .from('academy_progress')
      .select(`
        *,
        track:academy_tracks(id, slug, title, icon),
        lesson:academy_lessons(id, slug, title, type)
      `)
      .eq('user_id', user.id)
    
    if (trackId) {
      query = query.eq('track_id', trackId)
    }
    
    query = query.order('last_accessed_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar progresso:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar progresso', details: error.message },
        { status: 500 }
      )
    }
    
    // Agregar por trilha
    const byTrack: Record<string, any> = {}
    
    for (const item of data || []) {
      const tid = item.track_id
      if (!byTrack[tid]) {
        byTrack[tid] = {
          track: item.track,
          lessons: [],
          totalTimeSpent: 0,
          completedCount: 0,
          inProgressCount: 0
        }
      }
      
      byTrack[tid].lessons.push({
        lesson: item.lesson,
        status: item.status,
        progress: item.progress_percent,
        timeSpent: item.time_spent_seconds,
        quizScore: item.quiz_score,
        completedAt: item.completed_at,
        lastAccessed: item.last_accessed_at
      })
      
      byTrack[tid].totalTimeSpent += item.time_spent_seconds || 0
      
      if (item.status === 'completed') {
        byTrack[tid].completedCount++
      } else if (item.status === 'in_progress') {
        byTrack[tid].inProgressCount++
      }
    }
    
    return NextResponse.json({
      tracks: Object.values(byTrack),
      totalTracks: Object.keys(byTrack).length
    })
    
  } catch (error) {
    console.error('Erro na API de progresso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Registra/atualiza progresso
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const body = await request.json()
    const { track_id, lesson_id, action, quiz_score, time_spent } = body
    
    if (!track_id || !lesson_id) {
      return NextResponse.json(
        { error: 'track_id e lesson_id são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar se trilha e aula existem e estão publicadas
    const { data: lesson } = await supabase
      .from('academy_lessons')
      .select('id, track_id')
      .eq('id', lesson_id)
      .eq('track_id', track_id)
      .single()
    
    if (!lesson) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }
    
    // Buscar progresso existente
    const { data: existing } = await supabase
      .from('academy_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('track_id', track_id)
      .eq('lesson_id', lesson_id)
      .single()
    
    const now = new Date().toISOString()
    
    if (existing) {
      // Atualizar progresso existente
      const updateData: Record<string, any> = {
        last_accessed_at: now
      }
      
      if (action === 'start' && existing.status === 'not_started') {
        updateData.status = 'in_progress'
        updateData.started_at = now
      }
      
      if (action === 'complete') {
        updateData.status = 'completed'
        updateData.completed_at = now
        updateData.progress_percent = 100
      }
      
      if (action === 'progress' && body.progress !== undefined) {
        updateData.progress_percent = Math.min(100, Math.max(0, body.progress))
        if (updateData.progress_percent > 0 && existing.status === 'not_started') {
          updateData.status = 'in_progress'
          updateData.started_at = now
        }
      }
      
      if (quiz_score !== undefined) {
        updateData.quiz_score = quiz_score
        updateData.quiz_attempts = (existing.quiz_attempts || 0) + 1
        updateData.quiz_passed = quiz_score >= 70 // 70% para passar
      }
      
      if (time_spent !== undefined) {
        updateData.time_spent_seconds = (existing.time_spent_seconds || 0) + time_spent
      }
      
      const { data, error } = await supabase
        .from('academy_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao atualizar progresso:', error)
        return NextResponse.json(
          { error: 'Erro ao atualizar progresso', details: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json(data)
      
    } else {
      // Criar novo progresso
      const progressData = {
        user_id: user.id,
        track_id,
        lesson_id,
        status: action === 'complete' ? 'completed' : action === 'start' ? 'in_progress' : 'not_started',
        progress_percent: action === 'complete' ? 100 : (body.progress || 0),
        time_spent_seconds: time_spent || 0,
        started_at: action !== 'not_started' ? now : null,
        completed_at: action === 'complete' ? now : null,
        last_accessed_at: now,
        quiz_score: quiz_score || null,
        quiz_attempts: quiz_score !== undefined ? 1 : 0,
        quiz_passed: quiz_score !== undefined ? quiz_score >= 70 : false
      }
      
      const { data, error } = await supabase
        .from('academy_progress')
        .insert(progressData)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao criar progresso:', error)
        return NextResponse.json(
          { error: 'Erro ao criar progresso', details: error.message },
          { status: 500 }
        )
      }
      
      // Incrementar enrolled_count na trilha
      await supabase.rpc('increment_enrolled_count', { p_track_id: track_id })
      
      return NextResponse.json(data, { status: 201 })
    }
    
  } catch (error) {
    console.error('Erro na API de progresso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
