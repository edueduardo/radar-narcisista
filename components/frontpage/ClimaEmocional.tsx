'use client'

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Heart, BookOpen, MessageSquare } from 'lucide-react'

interface RadarPulseData {
  temperature: number
  temperatureLabel: string
  temperatureTrend: 'up' | 'down' | 'stable'
  activeUsersToday: number
  journalEntriesToday: number
  chatSessionsToday: number
  topEmotions: { emotion: string; count: number; percentage: number }[]
  topTags: { tag: string; count: number }[]
  alertSignals: { signal: string; count: number; trend: string }[]
  lastUpdated: string
}

const TEMPERATURE_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  'Positivo': { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-400 to-emerald-500' },
  'Neutro': { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-400 to-cyan-500' },
  'Estável': { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-400 to-indigo-500' },
  'Tenso': { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-400 to-amber-500' },
  'Crítico': { bg: 'bg-red-100', text: 'text-red-700', gradient: 'from-red-400 to-rose-500' }
}

const EMOTION_EMOJIS: Record<string, string> = {
  'ansiedade': '😰',
  'tristeza': '😢',
  'raiva': '😠',
  'medo': '😨',
  'confusão': '😵',
  'alívio': '😌',
  'esperança': '🌟'
}

export default function ClimaEmocional() {
  const [data, setData] = useState<RadarPulseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPulse() {
      try {
        const response = await fetch('/api/public/radar-pulse')
        if (response.ok) {
          const pulseData = await response.json()
          setData(pulseData)
        }
      } catch (error) {
        console.error('Erro ao carregar clima emocional:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPulse()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!data) return null

  const colors = TEMPERATURE_COLORS[data.temperatureLabel] || TEMPERATURE_COLORS['Estável']

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🌡️ Clima Emocional do Radar
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temperatura agregada e anônima da nossa comunidade
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Termômetro Principal */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
              <div className="text-center">
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-5xl font-bold text-white">{data.temperature}</span>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg} ${colors.text} font-medium mb-4`}>
                  {data.temperatureTrend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {data.temperatureTrend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {data.temperatureTrend === 'stable' && <Minus className="w-4 h-4" />}
                  {data.temperatureLabel}
                </div>

                <p className="text-sm text-gray-500">
                  Baseado em {data.journalEntriesToday + data.chatSessionsToday} interações hoje
                </p>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-lg font-bold">{data.journalEntriesToday}</span>
                  </div>
                  <p className="text-xs text-gray-500">Diários hoje</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-indigo-600 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-lg font-bold">{data.chatSessionsToday}</span>
                  </div>
                  <p className="text-xs text-gray-500">Chats hoje</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emoções em Alta */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Emoções em Alta
              </h3>

              {data.topEmotions.length > 0 ? (
                <div className="space-y-3">
                  {data.topEmotions.map((emotion, index) => (
                    <div key={emotion.emotion} className="flex items-center gap-3">
                      <span className="text-2xl">
                        {EMOTION_EMOJIS[emotion.emotion] || '💭'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {emotion.emotion}
                          </span>
                          <span className="text-xs text-gray-500">
                            {emotion.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                            style={{ width: `${emotion.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  Dados sendo coletados...
                </p>
              )}
            </div>
          </div>

          {/* Tags e Alertas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 h-full">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Temas Frequentes
              </h3>

              {data.topTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {data.topTags.slice(0, 8).map(tag => (
                    <span 
                      key={tag.tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-6">Nenhum tema ainda</p>
              )}

              {/* Sinais de Alerta */}
              {data.alertSignals.length > 0 && (
                <>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Sinais de Atenção
                  </h4>
                  <div className="space-y-2">
                    {data.alertSignals.slice(0, 3).map(signal => (
                      <div 
                        key={signal.signal}
                        className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-lg"
                      >
                        <span className="text-sm text-amber-700 capitalize">{signal.signal}</span>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                          {signal.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Dados agregados e anônimos. Atualizado em {new Date(data.lastUpdated).toLocaleTimeString('pt-BR')}.
        </p>
      </div>
    </section>
  )
}
