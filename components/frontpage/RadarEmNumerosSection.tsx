'use client'

import { Users, FileText, MessageCircle, Shield, TrendingUp, BookOpen, BarChart3 } from 'lucide-react'
import type { PublicInsight } from '@/lib/frontpage-content'

// ============================================================================
// RADAR EM NÚMEROS - Métricas públicas agregadas
// ETAPA 8.4: FanPage Viva
// ============================================================================

interface Props {
  insights: PublicInsight[]
  theme?: 'light' | 'dark' | 'high-contrast'
}

const ICON_MAP: Record<string, any> = {
  Users: Users,
  ClipboardCheck: FileText,
  BookOpen: BookOpen,
  MessageCircle: MessageCircle,
  Shield: Shield,
  AlertTriangle: Shield,
  BarChart: BarChart3,
  TrendingUp: TrendingUp
}

const COLOR_MAP: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600'
}

function formatValue(value: number, format: string, suffix?: string | null): string {
  if (format === 'percentage') {
    return `${value}${suffix || '%'}`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString('pt-BR')
}

export default function RadarEmNumerosSection({ insights, theme = 'dark' }: Props) {
  if (!insights || insights.length === 0) {
    return null // Não renderiza se não houver dados
  }

  return (
    <section className={`py-16 md:py-20 ${theme === 'dark' ? 'bg-gradient-to-br from-violet-950/30 to-indigo-950/30' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`}>
      <div className="container-app">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Radar em Números
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Impacto Real na Vida das Pessoas
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Números que mostram como o Radar está ajudando pessoas a encontrar clareza
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {insights.map((insight) => {
            const IconComponent = ICON_MAP[insight.icon] || BarChart3
            const gradientClass = COLOR_MAP[insight.color] || COLOR_MAP.purple

            return (
              <div
                key={insight.metric_key}
                className={`rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white shadow-lg'}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatValue(insight.value_numeric, insight.display_format, insight.display_suffix)}
                </div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {insight.label_pt}
                </div>
                {insight.description_pt && (
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {insight.description_pt}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className={`text-center text-sm mt-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          📊 Dados atualizados automaticamente com base no uso real da plataforma
        </p>
      </div>
    </section>
  )
}
