import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Trilha Individual - FANPAGE VIVA
 * 
 * GET /api/academy/tracks/[slug] - Busca trilha por slug
 * PUT /api/academy/tracks/[slug] - Atualiza trilha (admin)
 * DELETE /api/academy/tracks/[slug] - Remove trilha (admin)
 */

interface RouteContext {
  params: Promise<{ slug: string }>
}

// GET - Busca trilha por slug
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createRouteHandlerClient()
    const { slug } = await params
    
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
    
    // Buscar trilha
    let query = supabase
      .from('academy_tracks')
      .select(`
        *,
        lessons:academy_lessons(
          id,
          slug,
          title,
          description,
          type,
          duration_minutes,
          order_index,
          is_free,
          is_published,
          video_url,
          resources
        )
      `)
      .eq('slug', slug)
    
    if (!isAdmin) {
      query = query.eq('is_published', true)
    }
    
    const { data, error } = await query.single()
    
    if (error || !data) {
      return NextResponse.json({ error: 'Trilha não encontrada' }, { status: 404 })
    }
    
    // Ordenar lessons
    if (data.lessons) {
      data.lessons = (data.lessons as any[]).sort((a, b) => a.order_index - b.order_index)
      
      // Filtrar lessons não publicadas para não-admins
      if (!isAdmin) {
        data.lessons = (data.lessons as any[]).filter((l: any) => l.is_published)
      }
    }
    
    // Buscar progresso do usuário
    let userProgress = null
    if (userId) {
      const { data: progress } = await supabase
        .from('academy_progress')
        .select('lesson_id, status, progress_percent, completed_at')
        .eq('user_id', userId)
        .eq('track_id', data.id)
      
      if (progress) {
        const completedLessons = progress.filter(p => p.status === 'completed').length
        const totalLessons = (data.lessons as any[])?.length || 0
        
        userProgress = {
          completedLessons,
          totalLessons,
          percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          isEnrolled: progress.length > 0,
          lessonProgress: progress.reduce((acc, p) => {
            acc[p.lesson_id] = {
              status: p.status,
              progress: p.progress_percent,
              completedAt: p.completed_at
            }
            return acc
          }, {} as Record<string, any>)
        }
      }
    }
    
    return NextResponse.json({
      ...data,
      userProgress
    })
    
  } catch (error) {
    console.error('Erro ao buscar trilha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualiza trilha (admin only)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createRouteHandlerClient()
    const { slug } = await params
    
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
    
    // Buscar trilha atual
    const { data: current } = await supabase
      .from('academy_tracks')
      .select('id, is_published')
      .eq('slug', slug)
      .single()
    
    if (!current) {
      return NextResponse.json({ error: 'Trilha não encontrada' }, { status: 404 })
    }
    
    const updateData: Record<string, any> = {}
    
    const allowedFields = [
      'title', 'description', 'icon', 'color', 'featured_image',
      'level', 'category', 'tags', 'is_published', 'is_premium',
      'is_featured', 'display_order'
    ]
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Se publicando pela primeira vez
    if (body.is_published === true && !current.is_published) {
      updateData.published_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('academy_tracks')
      .update(updateData)
      .eq('id', current.id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar trilha:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar trilha', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erro na API de trilha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remove trilha (admin only)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createRouteHandlerClient()
    const { slug } = await params
    
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
    
    const { error } = await supabase
      .from('academy_tracks')
      .delete()
      .eq('slug', slug)
    
    if (error) {
      console.error('Erro ao deletar trilha:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar trilha', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro na API de trilha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
