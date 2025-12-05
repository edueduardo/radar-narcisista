'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, Activity, TrendingUp } from 'lucide-react'

interface Insight {
  insight_key: string
  display_name: string
  description: string
  category: string
  value_json: {
    value: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
}

interface RadarEmNumerosProps {
  insights?: Insight[]
}

const ICON_MAP: Record<string, React.ReactNode> = {
  total_users: <Users className="w-6 h-6" />,
  total_tests: <FileText className="w-6 h-6" />,
  active_today: <Activity className="w-6 h-6" />,
  avg_clarity_score: <TrendingUp className="w-6 h-6" />,
}

const TREND_COLORS = {
  up: 'text-green-500',
  down: 'text-red-500',
  stable: 'text-gray-500',
}

export default function RadarEmNumeros({ insights = [] }: RadarEmNumerosProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})

  // Animar os números ao carregar
  useEffect(() => {
    insights.forEach(insight => {
      const targetValue = insight.value_json?.value || 0
      let current = 0
      const step = Math.ceil(targetValue / 30)
      
      const interval = setInterval(() => {
        current += step
        if (current >= targetValue) {
          current = targetValue
          clearInterval(interval)
        }
        setAnimatedValues(prev => ({ ...prev, [insight.insight_key]: current }))
      }, 30)
    })
  }, [insights])

  if (insights.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📊 Radar em Números
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estatísticas agregadas e anônimas da nossa comunidade
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {insights.slice(0, 4).map(insight => (
            <div 
              key={insight.insight_key}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                  {ICON_MAP[insight.insight_key] || <Activity className="w-6 h-6" />}
                </div>
                {insight.value_json?.trend && (
                  <span className={`text-sm font-medium ${TREND_COLORS[insight.value_json.trend]}`}>
                    {insight.value_json.trend === 'up' ? '↑' : insight.value_json.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {animatedValues[insight.insight_key]?.toLocaleString('pt-BR') || '0'}
                {insight.insight_key === 'avg_clarity_score' && '%'}
              </div>
              <div className="text-sm text-gray-600">
                {insight.display_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
