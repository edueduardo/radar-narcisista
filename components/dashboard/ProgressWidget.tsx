'use client'

/**
 * Widget de Progresso no Dashboard
 * Mostra nível, conquistas recentes e próximos objetivos
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Trophy,
  Star,
  Target,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Flame
} from 'lucide-react'
import { 
  ACHIEVEMENTS, 
  calculateLevel, 
  getAchievementProgress,
  CATEGORY_LABELS,
  type Achievement 
} from '@/lib/gamification'

interface UserStats {
  totalPoints: number
  unlockedAchievements: string[]
  currentStreak: number
  metrics: Record<string, number>
}

export default function ProgressWidget() {
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    unlockedAchievements: [],
    currentStreak: 0,
    metrics: {}
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar progresso do usuário
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (progress) {
        setStats({
          totalPoints: progress.total_points || 0,
          unlockedAchievements: progress.unlocked_achievements || [],
          currentStreak: progress.current_streak || 0,
          metrics: progress.metrics || {}
        })
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const levelInfo = calculateLevel(stats.totalPoints)
  
  // Conquistas próximas de desbloquear (>50% progresso)
  const nearAchievements = ACHIEVEMENTS
    .filter(a => !stats.unlockedAchievements.includes(a.id) && !a.secret)
    .map(a => ({
      ...a,
      progress: getAchievementProgress(a, stats.metrics)
    }))
    .filter(a => a.progress >= 50)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3)

  // Conquistas recentes
  const recentAchievements = ACHIEVEMENTS
    .filter(a => stats.unlockedAchievements.includes(a.id))
    .slice(0, 3)

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header com nível */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold">
              {levelInfo.level}
            </div>
            <div>
              <p className="text-purple-100 text-sm">Seu nível</p>
              <p className="text-xl font-bold">{levelInfo.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{stats.totalPoints}</p>
            <p className="text-purple-100 text-sm">pontos</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          <p className="text-xs text-purple-100 mt-1">
            {Math.round(levelInfo.progress)}% para o próximo nível
          </p>
        </div>
      </div>

      {/* Streak */}
      {stats.currentStreak > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
          <Flame className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-amber-700">
            <strong>{stats.currentStreak} dias</strong> de sequência! Continue assim!
          </span>
        </div>
      )}

      {/* Conquistas próximas */}
      {nearAchievements.length > 0 && (
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Quase lá!</h3>
          </div>
          <div className="space-y-3">
            {nearAchievements.map(achievement => (
              <div key={achievement.id} className="flex items-center gap-3">
                <span className="text-xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {achievement.name}
                  </p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(achievement.progress)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas recentes */}
      {recentAchievements.length > 0 && (
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Conquistas Recentes</h3>
          </div>
          <div className="flex gap-2">
            {recentAchievements.map(achievement => (
              <div 
                key={achievement.id}
                className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link para página de conquistas */}
      <Link 
        href="/conquistas"
        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-500" />
          <span className="font-medium text-gray-900">Ver todas as conquistas</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="text-sm">
            {stats.unlockedAchievements.length}/{ACHIEVEMENTS.filter(a => !a.secret).length}
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  )
}
