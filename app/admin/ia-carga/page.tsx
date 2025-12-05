'use client'

/**
 * IA Carga - Dashboard de Uso e Custos de IA
 * BLOCO 31-35 - PATCH: Controle de IA por Menu e por Usuário
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Activity,
  DollarSign,
  Zap,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Brain
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipos
interface UsageByProvider {
  provider_slug: string
  provider_name: string
  total_calls: number
  total_tokens: number
  total_custo: number
  unique_users: number
}

interface UsageByFeature {
  feature_slug: string
  feature_name: string
  categoria: string
  total_calls: number
  total_tokens: number
  total_custo: number
  unique_users: number
}

interface UsageByPlan {
  plan_key: string
  total_calls: number
  total_tokens: number
  total_custo: number
  unique_users: number
}

interface DailyUsage {
  date: string
  calls: number
  tokens: number
  custo: number
}

export default function IACargaPage() {
  const supabase = createClient()
  
  const [usageByProvider, setUsageByProvider] = useState<UsageByProvider[]>([])
  const [usageByFeature, setUsageByFeature] = useState<UsageByFeature[]>([])
  const [usageByPlan, setUsageByPlan] = useState<UsageByPlan[]>([])
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Uso por provider
      const { data: providerData, error: providerError } = await supabase
        .from('ai_usage_by_provider')
        .select('*')

      if (!providerError) setUsageByProvider(providerData || [])

      // Uso por feature
      const { data: featureData, error: featureError } = await supabase
        .from('ai_usage_by_feature')
        .select('*')

      if (!featureError) setUsageByFeature(featureData || [])

      // Uso por plano
      const { data: planData, error: planError } = await supabase
        .from('ai_usage_by_plan')
        .select('*')

      if (!planError) setUsageByPlan(planData || [])

      // Uso diário
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const { data: dailyData, error: dailyError } = await supabase
        .from('ai_usage_stats_daily')
        .select('date, calls, tokens_input, tokens_output, custo_estimado')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (!dailyError && dailyData) {
        // Agrupar por data
        const grouped = dailyData.reduce((acc, row) => {
          const date = row.date
          if (!acc[date]) {
            acc[date] = { date, calls: 0, tokens: 0, custo: 0 }
          }
          acc[date].calls += row.calls || 0
          acc[date].tokens += (row.tokens_input || 0) + (row.tokens_output || 0)
          acc[date].custo += row.custo_estimado || 0
          return acc
        }, {} as Record<string, DailyUsage>)

        setDailyUsage(Object.values(grouped))
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar estatísticas. As views podem não existir ainda.')
    } finally {
      setLoading(false)
    }
  }

  // Calcular totais
  const totals = {
    calls: usageByProvider.reduce((sum, p) => sum + (p.total_calls || 0), 0),
    tokens: usageByProvider.reduce((sum, p) => sum + (p.total_tokens || 0), 0),
    custo: usageByProvider.reduce((sum, p) => sum + (p.total_custo || 0), 0),
    users: usageByProvider.reduce((sum, p) => sum + (p.unique_users || 0), 0)
  }

  // Formatar número
  const formatNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  // Formatar moeda
  const formatCurrency = (n: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(n)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p>Carregando estatísticas de IA...</p>
        </div>
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
              <Activity className="w-6 h-6 text-purple-400" />
              Carga de IA - Dashboard de Uso
            </h1>
            <p className="text-gray-400">Monitore o uso e custos das IAs em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-700 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  period === p ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Cards de Totais */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold">{formatNumber(totals.calls)}</div>
          <div className="text-sm text-gray-400">Chamadas de IA</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold">{formatNumber(totals.tokens)}</div>
          <div className="text-sm text-gray-400">Tokens Processados</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <TrendingDown className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totals.custo)}</div>
          <div className="text-sm text-gray-400">Custo Estimado</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold">{formatNumber(totals.users)}</div>
          <div className="text-sm text-gray-400">Usuários Únicos</div>
        </div>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Uso por Provider */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Uso por Provedor de IA
          </h2>

          {usageByProvider.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhum dado de uso ainda</p>
          ) : (
            <div className="space-y-3">
              {usageByProvider.map(provider => {
                const percentage = totals.calls > 0 
                  ? (provider.total_calls / totals.calls) * 100 
                  : 0

                return (
                  <div key={provider.provider_slug}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{provider.provider_name}</span>
                      <span className="text-sm text-gray-400">
                        {formatNumber(provider.total_calls)} chamadas
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatNumber(provider.total_tokens)} tokens</span>
                      <span>{formatCurrency(provider.total_custo)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Uso por Feature */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Uso por Feature
          </h2>

          {usageByFeature.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhum dado de uso ainda</p>
          ) : (
            <div className="space-y-3">
              {usageByFeature.map(feature => {
                const percentage = totals.calls > 0 
                  ? (feature.total_calls / totals.calls) * 100 
                  : 0

                return (
                  <div key={feature.feature_slug}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.feature_name}</span>
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                          {feature.categoria}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatNumber(feature.total_calls)} chamadas
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Uso por Plano */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-400" />
          Uso por Plano
        </h2>

        {usageByPlan.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum dado de uso ainda</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {usageByPlan.map(plan => (
              <div
                key={plan.plan_key}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
              >
                <div className="text-lg font-semibold capitalize mb-2">
                  {plan.plan_key}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chamadas:</span>
                    <span>{formatNumber(plan.total_calls)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tokens:</span>
                    <span>{formatNumber(plan.total_tokens)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo:</span>
                    <span>{formatCurrency(plan.total_custo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usuários:</span>
                    <span>{plan.unique_users}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráfico de Uso Diário */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" />
          Uso Diário
        </h2>

        {dailyUsage.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum dado de uso diário ainda</p>
        ) : (
          <div className="h-48 flex items-end gap-1">
            {dailyUsage.map((day, i) => {
              const maxCalls = Math.max(...dailyUsage.map(d => d.calls))
              const height = maxCalls > 0 ? (day.calls / maxCalls) * 100 : 0

              return (
                <div
                  key={day.date}
                  className="flex-1 group relative"
                >
                  <div
                    className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-700 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    <div>{new Date(day.date).toLocaleDateString('pt-BR')}</div>
                    <div>{day.calls} chamadas</div>
                    <div>{formatNumber(day.tokens)} tokens</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400">Sobre a Carga de IA</h3>
            <p className="text-sm text-gray-300 mt-1">
              Este dashboard mostra o uso agregado de todas as IAs do sistema.
              Os dados são consolidados diariamente a partir dos logs de uso.
              Use estas informações para otimizar custos e identificar gargalos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
