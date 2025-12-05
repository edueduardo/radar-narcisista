import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { ACHIEVEMENTS, checkAchievement, calculateLevel } from '@/lib/gamification'

/**
 * API de Gamificação
 * 
 * GET /api/gamification - Retorna progresso do usuário
 * POST /api/gamification - Atualiza métricas e verifica conquistas
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar progresso do usuário
    let { data: progress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Se não existe, criar
    if (!progress) {
      const { data: newProgress, error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          total_points: 0,
          unlocked_achievements: [],
          current_streak: 0,
          metrics: {},
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao criar progresso:', insertError)
        // Retornar dados padrão se tabela não existe
        progress = {
          total_points: 0,
          unlocked_achievements: [],
          current_streak: 0,
          metrics: {}
        }
      } else {
        progress = newProgress
      }
    }

    // Calcular nível
    const levelInfo = calculateLevel(progress.total_points || 0)

    // Mapear conquistas
    const achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: (progress.unlocked_achievements || []).includes(a.id),
      hidden: a.secret && !(progress.unlocked_achievements || []).includes(a.id)
    }))

    return NextResponse.json({
      progress: {
        totalPoints: progress.total_points || 0,
        currentStreak: progress.current_streak || 0,
        metrics: progress.metrics || {}
      },
      level: levelInfo,
      achievements,
      stats: {
        total: ACHIEVEMENTS.filter(a => !a.secret).length,
        unlocked: (progress.unlocked_achievements || []).length,
        secretsUnlocked: ACHIEVEMENTS.filter(a => 
          a.secret && (progress.unlocked_achievements || []).includes(a.id)
        ).length
      }
    })

  } catch (error) {
    console.error('Erro na API de gamificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, metric, value } = body

    // Buscar progresso atual
    let { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!progress) {
      // Criar se não existe
      const { data: newProgress } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          total_points: 0,
          unlocked_achievements: [],
          current_streak: 0,
          metrics: {},
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      progress = newProgress || {
        total_points: 0,
        unlocked_achievements: [],
        current_streak: 0,
        metrics: {}
      }
    }

    const currentMetrics = progress.metrics || {}
    const unlockedAchievements = progress.unlocked_achievements || []
    let totalPoints = progress.total_points || 0
    const newlyUnlocked: typeof ACHIEVEMENTS = []

    // Atualizar métrica
    if (action === 'increment' && metric) {
      currentMetrics[metric] = (currentMetrics[metric] || 0) + (value || 1)
    } else if (action === 'set' && metric) {
      currentMetrics[metric] = value
    }

    // Verificar conquistas
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedAchievements.includes(achievement.id)) continue

      if (checkAchievement(achievement, currentMetrics)) {
        unlockedAchievements.push(achievement.id)
        totalPoints += achievement.points
        newlyUnlocked.push(achievement)
      }
    }

    // Atualizar streak se necessário
    let currentStreak = progress.current_streak || 0
    if (metric === 'daily_login' || metric === 'journal_entry') {
      const lastActivity = progress.last_activity_date
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (lastActivity === yesterday) {
        currentStreak++
      } else if (lastActivity !== today) {
        currentStreak = 1
      }
    }

    // Salvar progresso
    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        total_points: totalPoints,
        unlocked_achievements: unlockedAchievements,
        current_streak: currentStreak,
        metrics: currentMetrics,
        last_activity_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      newlyUnlocked,
      progress: {
        totalPoints,
        currentStreak,
        metrics: currentMetrics
      },
      level: calculateLevel(totalPoints)
    })

  } catch (error) {
    console.error('Erro na API de gamificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
