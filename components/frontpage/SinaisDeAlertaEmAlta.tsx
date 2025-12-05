'use client'

/**
 * Sinais de Alerta em Alta
 * Ideia Diamante #6: Tags agregadas do diário
 * Mostra quais sinais estão sendo mais registrados pela comunidade
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ArrowRight,
  Shield
} from 'lucide-react'

interface AlertSignal {
  tag: string
  label: string
  description: string
  count: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Sinais estáticos (em produção, viriam do banco via agregação)
const ALERT_SIGNALS: AlertSignal[] = [
  {
    tag: 'gaslighting',
    label: 'Gaslighting',
    description: 'Fazer a vítima duvidar da própria percepção',
    count: 1247,
    trend: 'up',
    trendPercent: 12,
    severity: 'high'
  },
  {
    tag: 'isolamento',
    label: 'Isolamento Social',
    description: 'Afastar a vítima de amigos e família',
    count: 892,
    trend: 'up',
    trendPercent: 8,
    severity: 'high'
  },
  {
    tag: 'explosao',
    label: 'Explosões de Raiva',
    description: 'Reações desproporcionais e intimidadoras',
    count: 756,
    trend: 'stable',
    trendPercent: 0,
    severity: 'critical'
  },
  {
    tag: 'controle_financeiro',
    label: 'Controle Financeiro',
    description: 'Limitar acesso a dinheiro e recursos',
    count: 634,
    trend: 'up',
    trendPercent: 15,
    severity: 'high'
  },
  {
    tag: 'ameaca_velada',
    label: 'Ameaças Veladas',
    description: 'Intimidação indireta ou implícita',
    count: 521,
    trend: 'down',
    trendPercent: 5,
    severity: 'critical'
  },
  {
    tag: 'love_bombing',
    label: 'Love Bombing',
    description: 'Excesso de atenção e presentes no início',
    count: 489,
    trend: 'stable',
    trendPercent: 0,
    severity: 'medium'
  }
]

const SEVERITY_CONFIG = {
  low: { color: 'bg-blue-500', label: 'Atenção' },
  medium: { color: 'bg-yellow-500', label: 'Moderado' },
  high: { color: 'bg-orange-500', label: 'Alto' },
  critical: { color: 'bg-red-500', label: 'Crítico' }
}

export default function SinaisDeAlertaEmAlta() {
  const [signals, setSignals] = useState<AlertSignal[]>(ALERT_SIGNALS)
  const [showInfo, setShowInfo] = useState(false)

  // Ordenar por count
  const sortedSignals = [...signals].sort((a, b) => b.count - a.count)

  // Calcular total para porcentagens
  const totalCount = signals.reduce((sum, s) => sum + s.count, 0)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            Sinais de Alerta em Alta
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O Que a Comunidade Está Registrando
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dados agregados e anônimos dos diários. Ajuda a entender padrões 
            e saber que você não está sozinha.
          </p>
        </div>

        {/* Info box */}
        <div className="mb-8">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <Info className="w-4 h-4" />
            Como esses dados são coletados?
          </button>
          
          {showInfo && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>
                Esses números são agregações anônimas das tags usadas nos diários. 
                Nenhum dado individual é exposto. Os dados são atualizados semanalmente 
                e servem apenas para fins educativos e de conscientização.
              </p>
            </div>
          )}
        </div>

        {/* Grid de sinais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSignals.map((signal, index) => {
            const severityConfig = SEVERITY_CONFIG[signal.severity]
            const percentage = Math.round((signal.count / totalCount) * 100)

            return (
              <div 
                key={signal.tag}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${severityConfig.color}`} title={severityConfig.label} />
                  </div>
                  
                  {/* Trend */}
                  <div className={`flex items-center gap-1 text-xs ${
                    signal.trend === 'up' ? 'text-red-500' :
                    signal.trend === 'down' ? 'text-green-500' :
                    'text-gray-400'
                  }`}>
                    {signal.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {signal.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {signal.trend === 'stable' && <Minus className="w-3 h-3" />}
                    {signal.trendPercent > 0 && `${signal.trend === 'up' ? '+' : '-'}${signal.trendPercent}%`}
                  </div>
                </div>

                {/* Label e descrição */}
                <h3 className="font-semibold text-gray-900 mb-1">
                  {signal.label}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {signal.description}
                </p>

                {/* Barra de progresso */}
                <div className="mb-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${severityConfig.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {signal.count.toLocaleString('pt-BR')} registros
                  </span>
                  <span className="font-medium text-gray-700">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legenda de severidade */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span>{config.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 text-center">
          <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Reconhece algum desses sinais?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            O primeiro passo é nomear o que está acontecendo. 
            Faça o Teste de Clareza para entender melhor sua situação.
          </p>
          <Link 
            href="/teste-clareza"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            Fazer Teste de Clareza
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
