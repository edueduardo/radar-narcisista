'use client'

/**
 * IA ANALYTICS - Dashboard de Uso de IAs
 * TAREFA 8 - Telas Admin Faltantes
 * 
 * Visualização de métricas de uso de IA:
 * - Tokens consumidos por provider
 * - Custos estimados
 * - Uso por feature/menu
 * - Tendências e alertas
 * 
 * @see lib/ai-router.ts
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 8
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  Users,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Activity,
  PieChart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipos
interface UsageStats {
  total_requests: number
  total_tokens: number
  total_cost: number
  avg_response_time: number
  success_rate: number
}

interface ProviderUsage {
  provider_slug: string
  provider_name: string
  requests: number
  tokens: number
  cost: number
  avg_time: number
  success_rate: number
}

interface FeatureUsage {
  feature_slug: string
  feature_name: string
  requests: number
  tokens: number
  cost: number
}

interface DailyUsage {
  date: string
  requests: number
  tokens: number
  cost: number
}

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  provider?: string
  timestamp: string
}

// Período de filtro
type Period = '24h' | '7d' | '30d' | '90d'

export default function IAAnalyticsPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('7d')
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [providerUsage, setProviderUsage] = useState<ProviderUsage[]>([])
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([])
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      // Calcular data inicial baseada no período
      const now = new Date()
      let startDate = new Date()
      switch (period) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
      }

      // Buscar logs de uso
      const { data: logs, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar logs:', error)
        // Usar dados mock se tabela não existir
        setMockData()
        return
      }

      if (!logs || logs.length === 0) {
        setMockData()
        return
      }

      // Calcular estatísticas gerais
      const totalRequests = logs.length
      const totalTokens = logs.reduce((sum, l) => sum + (l.tokens_usados || 0), 0)
      const totalCost = logs.reduce((sum, l) => sum + (l.custo_estimado || 0), 0)
      const avgTime = logs.reduce((sum, l) => sum + (l.tempo_resposta_ms || 0), 0) / totalRequests
      const successCount = logs.filter(l => l.sucesso).length
      const successRate = (successCount / totalRequests) * 100

      setStats({
        total_requests: totalRequests,
        total_tokens: totalTokens,
        total_cost: totalCost,
        avg_response_time: avgTime,
        success_rate: successRate
      })

      // Agrupar por provider
      const providerMap = new Map<string, ProviderUsage>()
      logs.forEach(log => {
        const key = log.provider_slug || 'unknown'
        const existing = providerMap.get(key) || {
          provider_slug: key,
          provider_name: key,
          requests: 0,
          tokens: 0,
          cost: 0,
          avg_time: 0,
          success_rate: 0
        }
        existing.requests++
        existing.tokens += log.tokens_usados || 0
        existing.cost += log.custo_estimado || 0
        providerMap.set(key, existing)
      })
      setProviderUsage(Array.from(providerMap.values()))

      // Agrupar por feature
      const featureMap = new Map<string, FeatureUsage>()
      logs.forEach(log => {
        const key = log.feature_slug || 'unknown'
        const existing = featureMap.get(key) || {
          feature_slug: key,
          feature_name: key,
          requests: 0,
          tokens: 0,
          cost: 0
        }
        existing.requests++
        existing.tokens += log.tokens_usados || 0
        existing.cost += log.custo_estimado || 0
        featureMap.set(key, existing)
      })
      setFeatureUsage(Array.from(featureMap.values()))

      // Agrupar por dia
      const dailyMap = new Map<string, DailyUsage>()
      logs.forEach(log => {
        const date = new Date(log.created_at).toISOString().split('T')[0]
        const existing = dailyMap.get(date) || {
          date,
          requests: 0,
          tokens: 0,
          cost: 0
        }
        existing.requests++
        existing.tokens += log.tokens_usados || 0
        existing.cost += log.custo_estimado || 0
        dailyMap.set(date, existing)
      })
      setDailyUsage(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)))

      // Gerar alertas
      const newAlerts: Alert[] = []
      if (successRate < 95) {
        newAlerts.push({
          id: '1',
          type: 'warning',
          message: `Taxa de sucesso abaixo de 95% (${successRate.toFixed(1)}%)`,
          timestamp: new Date().toISOString()
        })
      }
      if (totalCost > 100) {
        newAlerts.push({
          id: '2',
          type: 'warning',
          message: `Custo acumulado alto: $${totalCost.toFixed(2)}`,
          timestamp: new Date().toISOString()
        })
      }
      setAlerts(newAlerts)

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    // Dados mock para demonstração
    setStats({
      total_requests: 1247,
      total_tokens: 523400,
      total_cost: 12.47,
      avg_response_time: 1250,
      success_rate: 98.5
    })

    setProviderUsage([
      { provider_slug: 'openai', provider_name: 'OpenAI GPT', requests: 850, tokens: 380000, cost: 8.50, avg_time: 1100, success_rate: 99.2 },
      { provider_slug: 'anthropic', provider_name: 'Claude', requests: 320, tokens: 120000, cost: 3.20, avg_time: 1400, success_rate: 97.5 },
      { provider_slug: 'together', provider_name: 'Together AI', requests: 77, tokens: 23400, cost: 0.77, avg_time: 1500, success_rate: 96.1 }
    ])

    setFeatureUsage([
      { feature_slug: 'chat', feature_name: 'Chat com IA', requests: 520, tokens: 210000, cost: 5.20 },
      { feature_slug: 'diario', feature_name: 'Análise de Diário', requests: 380, tokens: 152000, cost: 3.80 },
      { feature_slug: 'oraculo', feature_name: 'Oráculo', requests: 210, tokens: 105000, cost: 2.10 },
      { feature_slug: 'clareza', feature_name: 'Teste de Clareza', requests: 137, tokens: 56400, cost: 1.37 }
    ])

    setDailyUsage([
      { date: '2025-11-28', requests: 145, tokens: 62000, cost: 1.45 },
      { date: '2025-11-29', requests: 178, tokens: 74000, cost: 1.78 },
      { date: '2025-11-30', requests: 156, tokens: 68000, cost: 1.56 },
      { date: '2025-12-01', requests: 189, tokens: 82000, cost: 1.89 },
      { date: '2025-12-02', requests: 201, tokens: 89000, cost: 2.01 },
      { date: '2025-12-03', requests: 198, tokens: 84000, cost: 1.98 },
      { date: '2025-12-04', requests: 180, tokens: 64400, cost: 1.80 }
    ])

    setAlerts([
      { id: '1', type: 'info', message: 'Dados de demonstração - conecte a tabela ai_usage_logs', timestamp: new Date().toISOString() }
    ])
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`
  }

  const formatTime = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms.toFixed(0)}ms`
  }

  // Calcular altura das barras do gráfico
  const maxRequests = Math.max(...dailyUsage.map(d => d.requests), 1)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              IA Analytics
            </h1>
            <p className="text-gray-400 text-sm">
              Métricas de uso e custos de IA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro de período */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {(['24h', '7d', '30d', '90d'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  period === p 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg flex items-center gap-2 ${
                alert.type === 'error' ? 'bg-red-500/20 border border-red-500/50' :
                alert.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                'bg-blue-500/20 border border-blue-500/50'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${
                alert.type === 'error' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-yellow-400' :
                'text-blue-400'
              }`} />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.total_requests)}</p>
            <p className="text-sm text-gray-400">Requisições</p>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +8%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(stats.total_tokens)}</p>
            <p className="text-sm text-gray-400">Tokens</p>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xs text-red-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.total_cost)}</p>
            <p className="text-sm text-gray-400">Custo Total</p>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> -3%
              </span>
            </div>
            <p className="text-2xl font-bold">{formatTime(stats.avg_response_time)}</p>
            <p className="text-sm text-gray-400">Tempo Médio</p>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</p>
            <p className="text-sm text-gray-400">Taxa de Sucesso</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Gráfico de uso diário */}
        <div className="col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Uso Diário
          </h2>
          
          <div className="h-48 flex items-end gap-2">
            {dailyUsage.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-blue-500/30 hover:bg-blue-500/50 rounded-t transition-colors"
                  style={{ height: `${(day.requests / maxRequests) * 100}%` }}
                  title={`${day.requests} requisições`}
                />
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Uso por Provider */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            Por Provider
          </h2>
          
          <div className="space-y-3">
            {providerUsage.map((provider, i) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500']
              const totalReqs = providerUsage.reduce((sum, p) => sum + p.requests, 0)
              const percentage = (provider.requests / totalReqs) * 100
              
              return (
                <div key={provider.provider_slug}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{provider.provider_name}</span>
                    <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[i % colors.length]} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tabela de Providers */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Detalhes por Provider
          </h2>
          
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3">Provider</th>
                <th className="pb-3 text-right">Requisições</th>
                <th className="pb-3 text-right">Tokens</th>
                <th className="pb-3 text-right">Custo</th>
                <th className="pb-3 text-right">Sucesso</th>
              </tr>
            </thead>
            <tbody>
              {providerUsage.map(provider => (
                <tr key={provider.provider_slug} className="border-b border-gray-800">
                  <td className="py-3 font-medium">{provider.provider_name}</td>
                  <td className="py-3 text-right">{formatNumber(provider.requests)}</td>
                  <td className="py-3 text-right">{formatNumber(provider.tokens)}</td>
                  <td className="py-3 text-right">{formatCurrency(provider.cost)}</td>
                  <td className="py-3 text-right">
                    <span className={provider.success_rate >= 98 ? 'text-green-400' : 'text-yellow-400'}>
                      {provider.success_rate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela de Features */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Uso por Feature
          </h2>
          
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3">Feature</th>
                <th className="pb-3 text-right">Requisições</th>
                <th className="pb-3 text-right">Tokens</th>
                <th className="pb-3 text-right">Custo</th>
              </tr>
            </thead>
            <tbody>
              {featureUsage.map(feature => (
                <tr key={feature.feature_slug} className="border-b border-gray-800">
                  <td className="py-3 font-medium">{feature.feature_name}</td>
                  <td className="py-3 text-right">{formatNumber(feature.requests)}</td>
                  <td className="py-3 text-right">{formatNumber(feature.tokens)}</td>
                  <td className="py-3 text-right">{formatCurrency(feature.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
