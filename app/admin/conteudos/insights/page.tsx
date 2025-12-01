'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Users,
  FileText,
  MessageCircle,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { SemaforoCard } from '@/components/admin/EditSemaforoBadge'

// ============================================================================
// ADMIN: RADAR EM NÚMEROS (INSIGHTS)
// Visualiza e recalcula métricas de content_insights
// ============================================================================

interface InsightMetric {
  metric_key: string
  metric_category: string
  value_numeric: number
  label_pt: string
  description_pt: string | null
  display_format: string
  display_suffix: string | null
  icon: string
  color: string
  visibility: string
  is_featured: boolean
  last_computed_at: string | null
}

const ICON_MAP: Record<string, any> = {
  Users: Users,
  ClipboardCheck: FileText,
  BookOpen: FileText,
  MessageCircle: MessageCircle,
  Shield: Shield,
  AlertTriangle: AlertTriangle,
  BarChart: BarChart3,
  TrendingUp: TrendingUp
}

const COLOR_MAP: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
}

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<InsightMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [recomputing, setRecomputing] = useState(false)
  const [lastRecompute, setLastRecompute] = useState<string | null>(null)
  const [recomputeResult, setRecomputeResult] = useState<any>(null)

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/content/insights/recompute')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics || [])
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    }
    setLoading(false)
  }

  const handleRecompute = async () => {
    setRecomputing(true)
    setRecomputeResult(null)
    try {
      const response = await fetch('/api/admin/content/insights/recompute', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setRecomputeResult(data)
        setLastRecompute(new Date().toISOString())
        loadMetrics()
      }
    } catch (error) {
      console.error('Erro ao recalcular:', error)
    }
    setRecomputing(false)
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  const formatValue = (metric: InsightMetric) => {
    const value = metric.value_numeric
    if (metric.display_format === 'percentage') {
      return `${value}${metric.display_suffix || '%'}`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString('pt-BR')
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca'
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const publicMetrics = metrics.filter(m => m.visibility === 'public')
  const adminMetrics = metrics.filter(m => m.visibility === 'admin_only')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  Radar em Números
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Métricas agregadas do sistema
                </p>
              </div>
            </div>
            <button
              onClick={handleRecompute}
              disabled={recomputing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
              {recomputing ? 'Recalculando...' : 'Recalcular Métricas'}
            </button>
          </div>
        </div>
      </div>

      {/* Recompute Result */}
      {recomputeResult && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`p-4 rounded-lg ${recomputeResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <p className={`font-medium ${recomputeResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
              {recomputeResult.message}
            </p>
            {recomputeResult.duration_ms && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tempo: {recomputeResult.duration_ms}ms
              </p>
            )}
          </div>
        </div>
      )}

      {/* Semáforo de Edição */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SemaforoCard
          level="yellow"
          description="Zona Amarela – Métricas derivadas de dados reais. Recalcule com responsabilidade e respeite privacidade."
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando métricas...</div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma métrica encontrada</p>
            <button
              onClick={handleRecompute}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calcular Métricas
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Public Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Métricas Públicas</h2>
                <span className="text-sm text-gray-500">({publicMetrics.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {publicMetrics.map(metric => {
                  const IconComponent = ICON_MAP[metric.icon] || BarChart3
                  const colorClass = COLOR_MAP[metric.color] || COLOR_MAP.blue
                  return (
                    <div
                      key={metric.metric_key}
                      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border ${metric.is_featured ? 'border-yellow-400 ring-2 ring-yellow-100 dark:ring-yellow-900/30' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {metric.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">
                            Destaque
                          </span>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {formatValue(metric)}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {metric.label_pt}
                      </div>
                      {metric.description_pt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metric.description_pt}
                        </div>
                      )}
                      {metric.last_computed_at && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                          <Clock className="w-3 h-3" />
                          {formatDate(metric.last_computed_at)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Admin Only Metrics */}
            {adminMetrics.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <EyeOff className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Métricas Internas (Admin)</h2>
                  <span className="text-sm text-gray-500">({adminMetrics.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminMetrics.map(metric => {
                    const IconComponent = ICON_MAP[metric.icon] || BarChart3
                    const colorClass = COLOR_MAP[metric.color] || COLOR_MAP.red
                    return (
                      <div
                        key={metric.metric_key}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-red-200 dark:border-red-900/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
                            Admin Only
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {formatValue(metric)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {metric.label_pt}
                        </div>
                        {metric.description_pt && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {metric.description_pt}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">ℹ️ Sobre as Métricas</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Métricas Públicas</strong> aparecem na frontpage (Radar em Números)</li>
                <li>• <strong>Métricas Admin</strong> são visíveis apenas aqui</li>
                <li>• Clique em "Recalcular Métricas" para atualizar os valores</li>
                <li>• As métricas são calculadas a partir de: clarity_tests, journal_entries, ai_chat_sessions, safety_plans, risk_alerts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
