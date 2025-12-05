'use client'

/**
 * Componente de Agregações Emocionais Avançadas
 * Mostra padrões, frequência e evolução ao longo do tempo
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  Heart,
  Clock
} from 'lucide-react'

interface EmotionalData {
  // Frequência de registros
  totalEntries30d: number
  avgEntriesPerWeek: number
  streakDays: number
  lastEntryDate: string | null
  
  // Impacto emocional
  avgImpact: number
  impactTrend: 'up' | 'down' | 'stable'
  highImpactCount: number
  
  // Tags mais frequentes
  topTags: { tag: string; count: number; percentage: number }[]
  
  // Padrões temporais
  peakDayOfWeek: string
  peakHourOfDay: number
  
  // Evolução
  weeklyComparison: {
    thisWeek: number
    lastWeek: number
    change: number
  }
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface Props {
  theme?: 'light' | 'dark'
}

export default function EmotionalAggregations({ theme = 'light' }: Props) {
  const [data, setData] = useState<EmotionalData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAggregations()
  }, [])

  const loadAggregations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

      // Buscar entradas dos últimos 30 dias
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('created_at, impact_score, tags')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (!entries || entries.length === 0) {
        setData(null)
        setLoading(false)
        return
      }

      // Calcular métricas
      const totalEntries30d = entries.length
      const avgEntriesPerWeek = Math.round((totalEntries30d / 30) * 7 * 10) / 10

      // Calcular streak
      let streakDays = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const entryDates = new Set(entries.map(e => e.created_at.split('T')[0]))
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]
        if (entryDates.has(dateStr)) {
          streakDays++
        } else if (i > 0) {
          break
        }
      }

      // Impacto médio
      const impactScores = entries.filter(e => e.impact_score).map(e => e.impact_score)
      const avgImpact = impactScores.length > 0 
        ? Math.round((impactScores.reduce((a, b) => a + b, 0) / impactScores.length) * 10) / 10
        : 0
      const highImpactCount = entries.filter(e => e.impact_score === 3).length

      // Comparar com semana anterior para trend
      const thisWeekEntries = entries.filter(e => new Date(e.created_at) >= sevenDaysAgo)
      const lastWeekEntries = entries.filter(e => {
        const date = new Date(e.created_at)
        return date >= fourteenDaysAgo && date < sevenDaysAgo
      })

      const thisWeekAvgImpact = thisWeekEntries.length > 0
        ? thisWeekEntries.filter(e => e.impact_score).reduce((a, e) => a + e.impact_score, 0) / thisWeekEntries.length
        : 0
      const lastWeekAvgImpact = lastWeekEntries.length > 0
        ? lastWeekEntries.filter(e => e.impact_score).reduce((a, e) => a + e.impact_score, 0) / lastWeekEntries.length
        : 0

      let impactTrend: 'up' | 'down' | 'stable' = 'stable'
      if (thisWeekAvgImpact > lastWeekAvgImpact + 0.3) impactTrend = 'up'
      else if (thisWeekAvgImpact < lastWeekAvgImpact - 0.3) impactTrend = 'down'

      // Top tags
      const tagCounts: Record<string, number> = {}
      entries.forEach(e => {
        if (e.tags && Array.isArray(e.tags)) {
          e.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      const totalTags = Object.values(tagCounts).reduce((a, b) => a + b, 0)
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0
        }))

      // Padrões temporais
      const dayOfWeekCounts: Record<number, number> = {}
      const hourCounts: Record<number, number> = {}
      
      entries.forEach(e => {
        const date = new Date(e.created_at)
        const day = date.getDay()
        const hour = date.getHours()
        dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })

      const peakDay = Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1])[0]
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]

      // Comparação semanal
      const weeklyComparison = {
        thisWeek: thisWeekEntries.length,
        lastWeek: lastWeekEntries.length,
        change: thisWeekEntries.length - lastWeekEntries.length
      }

      setData({
        totalEntries30d,
        avgEntriesPerWeek,
        streakDays,
        lastEntryDate: entries[0]?.created_at || null,
        avgImpact,
        impactTrend,
        highImpactCount,
        topTags,
        peakDayOfWeek: peakDay ? DAY_NAMES[parseInt(peakDay[0])] : '-',
        peakHourOfDay: peakHour ? parseInt(peakHour[0]) : 0,
        weeklyComparison
      })

    } catch (error) {
      console.error('Erro ao carregar agregações:', error)
    } finally {
      setLoading(false)
    }
  }

  const t = theme === 'light' ? {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    cardBg: 'bg-gray-50'
  } : {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-white',
    textMuted: 'text-gray-400',
    cardBg: 'bg-gray-700/50'
  }

  if (loading) {
    return (
      <div className={`${t.bg} border ${t.border} rounded-xl p-6 animate-pulse`}>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`${t.bg} border ${t.border} rounded-xl p-6 text-center`}>
        <Activity className={`w-8 h-8 mx-auto mb-2 ${t.textMuted}`} />
        <p className={t.textMuted}>Registre episódios no diário para ver suas agregações</p>
      </div>
    )
  }

  return (
    <div className={`${t.bg} border ${t.border} rounded-xl p-6`}>
      <h3 className={`font-semibold ${t.text} mb-4 flex items-center gap-2`}>
        <BarChart3 className="w-5 h-5 text-purple-500" />
        Seus Padrões Emocionais
      </h3>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Frequência */}
        <div className={`${t.cardBg} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className={`text-xs ${t.textMuted}`}>Frequência</span>
          </div>
          <p className={`text-2xl font-bold ${t.text}`}>{data.avgEntriesPerWeek}</p>
          <p className={`text-xs ${t.textMuted}`}>registros/semana</p>
        </div>

        {/* Streak */}
        <div className={`${t.cardBg} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-500" />
            <span className={`text-xs ${t.textMuted}`}>Sequência</span>
          </div>
          <p className={`text-2xl font-bold ${t.text}`}>{data.streakDays}</p>
          <p className={`text-xs ${t.textMuted}`}>dias seguidos</p>
        </div>

        {/* Impacto médio */}
        <div className={`${t.cardBg} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className={`text-xs ${t.textMuted}`}>Impacto médio</span>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${t.text}`}>{data.avgImpact}</p>
            {data.impactTrend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
            {data.impactTrend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
            {data.impactTrend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
          <p className={`text-xs ${t.textMuted}`}>de 3</p>
        </div>

        {/* Episódios graves */}
        <div className={`${t.cardBg} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className={`text-xs ${t.textMuted}`}>Alto impacto</span>
          </div>
          <p className={`text-2xl font-bold ${data.highImpactCount > 5 ? 'text-red-500' : t.text}`}>
            {data.highImpactCount}
          </p>
          <p className={`text-xs ${t.textMuted}`}>em 30 dias</p>
        </div>
      </div>

      {/* Tags frequentes */}
      {data.topTags.length > 0 && (
        <div className="mb-6">
          <p className={`text-sm font-medium ${t.text} mb-3`}>Tags mais frequentes</p>
          <div className="space-y-2">
            {data.topTags.map(tag => (
              <div key={tag.tag} className="flex items-center gap-3">
                <span className={`text-sm ${t.text} w-24 truncate`}>{tag.tag}</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${tag.percentage}%` }}
                  />
                </div>
                <span className={`text-xs ${t.textMuted} w-12 text-right`}>{tag.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Padrões temporais */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${t.cardBg} rounded-lg p-3`}>
          <p className={`text-xs ${t.textMuted} mb-1`}>Dia mais ativo</p>
          <p className={`font-medium ${t.text}`}>{data.peakDayOfWeek}</p>
        </div>
        <div className={`${t.cardBg} rounded-lg p-3`}>
          <p className={`text-xs ${t.textMuted} mb-1`}>Horário mais ativo</p>
          <p className={`font-medium ${t.text}`}>{data.peakHourOfDay}h - {data.peakHourOfDay + 1}h</p>
        </div>
      </div>

      {/* Comparação semanal */}
      <div className={`mt-4 pt-4 border-t ${t.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${t.textMuted}`}>Esta semana vs anterior</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${t.text}`}>
              {data.weeklyComparison.thisWeek} vs {data.weeklyComparison.lastWeek}
            </span>
            {data.weeklyComparison.change > 0 && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{data.weeklyComparison.change}
              </span>
            )}
            {data.weeklyComparison.change < 0 && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {data.weeklyComparison.change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
