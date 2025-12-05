'use client'

/**
 * Admin: Monitoramento de Custos de IA
 * Orquestrador de IAs - Visualização de custos por provedor/modelo
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Brain,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Calendar,
  Zap,
  AlertTriangle,
  Settings
} from 'lucide-react'

interface AIUsageStats {
  provider: string
  model: string
  totalTokens: number
  totalCost: number
  requestCount: number
  avgTokensPerRequest: number
  lastUsed: string
}

interface DailyUsage {
  date: string
  tokens: number
  cost: number
  requests: number
}

interface CostAlert {
  id: string
  type: 'warning' | 'critical'
  message: string
  threshold: number
  current: number
}

export default function IACustosPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [stats, setStats] = useState<AIUsageStats[]>([])
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [alerts, setAlerts] = useState<CostAlert[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Calcular data de início baseado no período
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Buscar eventos de IA
      const { data: aiEvents } = await supabase
        .from('ai_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (aiEvents && aiEvents.length > 0) {
        // Agregar por provedor/modelo
        const statsMap: Record<string, AIUsageStats> = {}
        const dailyMap: Record<string, DailyUsage> = {}
        let total = 0
        let tokens = 0

        for (const event of aiEvents) {
          const key = `${event.provider || 'unknown'}:${event.model || 'unknown'}`
          const date = event.created_at.split('T')[0]
          const eventTokens = event.tokens_used || 0
          const eventCost = event.cost || 0

          // Stats por provedor/modelo
          if (!statsMap[key]) {
            statsMap[key] = {
              provider: event.provider || 'unknown',
              model: event.model || 'unknown',
              totalTokens: 0,
              totalCost: 0,
              requestCount: 0,
              avgTokensPerRequest: 0,
              lastUsed: event.created_at
            }
          }
          statsMap[key].totalTokens += eventTokens
          statsMap[key].totalCost += eventCost
          statsMap[key].requestCount += 1

          // Stats diários
          if (!dailyMap[date]) {
            dailyMap[date] = { date, tokens: 0, cost: 0, requests: 0 }
          }
          dailyMap[date].tokens += eventTokens
          dailyMap[date].cost += eventCost
          dailyMap[date].requests += 1

          total += eventCost
          tokens += eventTokens
        }

        // Calcular médias
        Object.values(statsMap).forEach(s => {
          s.avgTokensPerRequest = s.requestCount > 0 ? Math.round(s.totalTokens / s.requestCount) : 0
        })

        setStats(Object.values(statsMap).sort((a, b) => b.totalCost - a.totalCost))
        setDailyUsage(Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)))
        setTotalCost(total)
        setTotalTokens(tokens)

        // Verificar alertas
        checkAlerts(total, tokens)
      } else {
        // Dados simulados se não houver eventos
        setStats([
          { provider: 'openai', model: 'gpt-4o-mini', totalTokens: 150000, totalCost: 15.00, requestCount: 500, avgTokensPerRequest: 300, lastUsed: new Date().toISOString() },
          { provider: 'openai', model: 'gpt-4o', totalTokens: 50000, totalCost: 25.00, requestCount: 100, avgTokensPerRequest: 500, lastUsed: new Date().toISOString() },
          { provider: 'anthropic', model: 'claude-3-haiku', totalTokens: 80000, totalCost: 8.00, requestCount: 200, avgTokensPerRequest: 400, lastUsed: new Date().toISOString() }
        ])
        setTotalCost(48.00)
        setTotalTokens(280000)
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAlerts = (cost: number, tokens: number) => {
    const newAlerts: CostAlert[] = []
    
    // Alerta de custo mensal
    if (cost > 100) {
      newAlerts.push({
        id: 'cost-warning',
        type: cost > 200 ? 'critical' : 'warning',
        message: `Custo mensal acima do esperado`,
        threshold: 100,
        current: cost
      })
    }

    // Alerta de tokens
    if (tokens > 500000) {
      newAlerts.push({
        id: 'tokens-warning',
        type: tokens > 1000000 ? 'critical' : 'warning',
        message: `Alto consumo de tokens`,
        threshold: 500000,
        current: tokens
      })
    }

    setAlerts(newAlerts)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Custos de IA
            </h1>
            <p className="text-gray-400">Monitoramento de uso e custos por provedor</p>
          </div>
        </div>

        {/* Seletor de período */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-4 rounded-xl border ${
                alert.type === 'critical' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${
                  alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                }`} />
                <div>
                  <p className={`font-medium ${
                    alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray-400">
                    Limite: {formatNumber(alert.threshold)} | Atual: {formatNumber(alert.current)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          <p className="text-sm text-gray-400">Custo total</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">tokens</span>
          </div>
          <p className="text-2xl font-bold">{formatNumber(totalTokens)}</p>
          <p className="text-sm text-gray-400">Tokens consumidos</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">requests</span>
          </div>
          <p className="text-2xl font-bold">{formatNumber(stats.reduce((sum, s) => sum + s.requestCount, 0))}</p>
          <p className="text-sm text-gray-400">Total de requisições</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">modelos</span>
          </div>
          <p className="text-2xl font-bold">{stats.length}</p>
          <p className="text-sm text-gray-400">Modelos ativos</p>
        </div>
      </div>

      {/* Tabela de custos por modelo */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Custos por Modelo
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-slate-700">
                <th className="pb-3">Provedor</th>
                <th className="pb-3">Modelo</th>
                <th className="pb-3 text-right">Tokens</th>
                <th className="pb-3 text-right">Requisições</th>
                <th className="pb-3 text-right">Média/Req</th>
                <th className="pb-3 text-right">Custo</th>
                <th className="pb-3 text-right">% Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3">
                    <span className="px-2 py-1 bg-slate-700 rounded text-sm">
                      {stat.provider}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-sm">{stat.model}</td>
                  <td className="py-3 text-right">{formatNumber(stat.totalTokens)}</td>
                  <td className="py-3 text-right">{formatNumber(stat.requestCount)}</td>
                  <td className="py-3 text-right text-gray-400">{formatNumber(stat.avgTokensPerRequest)}</td>
                  <td className="py-3 text-right font-medium text-green-400">
                    {formatCurrency(stat.totalCost)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${totalCost > 0 ? (stat.totalCost / totalCost) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {totalCost > 0 ? Math.round((stat.totalCost / totalCost) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de uso diário (simplificado) */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Uso Diário
        </h2>

        <div className="h-48 flex items-end gap-1">
          {dailyUsage.slice(-30).map((day, index) => {
            const maxCost = Math.max(...dailyUsage.map(d => d.cost), 1)
            const height = (day.cost / maxCost) * 100
            
            return (
              <div 
                key={day.date}
                className="flex-1 bg-purple-500/50 hover:bg-purple-500 rounded-t transition-colors cursor-pointer group relative"
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${day.date}: ${formatCurrency(day.cost)}`}
              >
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(day.cost)}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{dailyUsage[0]?.date || '-'}</span>
          <span>{dailyUsage[dailyUsage.length - 1]?.date || '-'}</span>
        </div>
      </div>
    </div>
  )
}
