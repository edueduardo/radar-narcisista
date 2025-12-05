import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Trilhas do Academy - FANPAGE VIVA
 * 
 * GET /api/academy/tracks - Lista trilhas
 * POST /api/academy/tracks - Cria trilha (admin)
 */

// GET - Lista trilhas
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const level = searchParams.get('level')
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    
    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    let userId: string | null = null
    
    if (user) {
      userId = user.id
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      isAdmin = profile?.role === 'admin'
    }
    
    // Query base
    let query = supabase
      .from('academy_tracks')
      .select(`
        *,
        lessons:academy_lessons(
          id,
          slug,
          title,
          type,
          duration_minutes,
          order_index,
          is_free,
          is_published
        )
      `)
    
    // Filtros
    if (!isAdmin) {
      query = query.eq('is_published', true)
    } else if (published === 'true') {
      query = query.eq('is_published', true)
    } else if (published === 'false') {
      query = query.eq('is_published', false)
    }
    
    if (level) {
      query = query.eq('level', level)
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    
    query = query.order('display_order', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar trilhas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar trilhas', details: error.message },
        { status: 500 }
      )
    }
    
    // Se usuário logado, buscar progresso
    let tracksWithProgress = data || []
    
    if (userId && data) {
      const { data: progress } = await supabase
        .from('academy_progress')
        .select('track_id, lesson_id, status, progress_percent')
        .eq('user_id', userId)
      
      if (progress) {
        tracksWithProgress = data.map(track => {
          const trackProgress = progress.filter(p => p.track_id === track.id)
          const completedLessons = trackProgress.filter(p => p.status === 'completed').length
          const totalLessons = (track.lessons as any[])?.filter((l: any) => l.is_published).length || 0
          
          return {
            ...track,
            userProgress: {
              completedLessons,
              totalLessons,
              percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
              isEnrolled: trackProgress.length > 0
            }
          }
        })
      }
    }
    
    // Filtrar lessons não publicadas para não-admins
    if (!isAdmin) {
      tracksWithProgress = tracksWithProgress.map(track => ({
        ...track,
        lessons: (track.lessons as any[])?.filter((l: any) => l.is_published) || []
      }))
    }
    
    return NextResponse.json(tracksWithProgress)
    
  } catch (error) {
    console.error('Erro na API de trilhas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Cria trilha (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const body = await request.json()
    
    if (!body.title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }
    
    const slug = body.slug || generateSlug(body.title)
    
    const trackData = {
      slug,
      title: body.title,
      description: body.description || null,
      icon: body.icon || '📚',
      color: body.color || 'purple',
      featured_image: body.featured_image || null,
      level: body.level || 'iniciante',
      category: body.category || 'geral',
      tags: body.tags || [],
      is_published: body.is_published || false,
      is_premium: body.is_premium || false,
      is_featured: body.is_featured || false,
      display_order: body.display_order || 0,
      created_by: user.id
    }
    
    const { data, error } = await supabase
      .from('academy_tracks')
      .insert(trackData)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar trilha:', error)
      return NextResponse.json(
        { error: 'Erro ao criar trilha', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de trilhas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}
