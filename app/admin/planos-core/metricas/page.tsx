'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, BarChart3, Users, Zap, TrendingUp, TrendingDown,
  RefreshCw, Calendar, Filter, Download, Crown, Shield
} from 'lucide-react'

interface FeatureMetric {
  feature_key: string
  nome: string
  categoria: string
  total_users: number
  usage_today: number
  usage_week: number
  usage_month: number
  trend: 'up' | 'down' | 'stable'
}

interface PlanMetric {
  plan_slug: string
  nome: string
  total_users: number
  mrr: number
  churn_rate: number
}

interface OverviewMetrics {
  total_users: number
  active_subscriptions: number
  total_overrides: number
  features_count: number
  profiles_count: number
  plans_count: number
}

export default function AdminPlanosCoreMetricasPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewMetrics | null>(null)
  const [featureMetrics, setFeatureMetrics] = useState<FeatureMetric[]>([])
  const [planMetrics, setPlanMetrics] = useState<PlanMetric[]>([])
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')

  useEffect(() => {
    loadMetrics()
  }, [period])

  async function loadMetrics() {
    setLoading(true)
    try {
      // Overview
      const [usersRes, subsRes, overridesRes, featuresRes, profilesRes, plansRes] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions_core').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_feature_overrides').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('features').select('*', { count: 'exact', head: true }),
        supabase.from('feature_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('plan_catalog').select('*', { count: 'exact', head: true })
      ])

      setOverview({
        total_users: usersRes.count || 0,
        active_subscriptions: subsRes.count || 0,
        total_overrides: overridesRes.count || 0,
        features_count: featuresRes.count || 0,
        profiles_count: profilesRes.count || 0,
        plans_count: plansRes.count || 0
      })

      // Feature metrics
      const { data: features } = await supabase
        .from('features')
        .select('feature_key, nome, categoria')
        .order('ordem_exibicao')

      if (features) {
        const metrics: FeatureMetric[] = []
        for (const f of features) {
          // Contar uso (simulado - precisa da tabela feature_usage_logs)
          const { count: usageCount } = await supabase
            .from('feature_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('feature_key', f.feature_key)
            .gte('used_at', getStartDate(period))

          // Contar usuários com acesso
          const { count: usersWithAccess } = await supabase
            .from('feature_profile_features')
            .select('*', { count: 'exact', head: true })
            .eq('feature_key', f.feature_key)

          metrics.push({
            feature_key: f.feature_key,
            nome: f.nome,
            categoria: f.categoria,
            total_users: usersWithAccess || 0,
            usage_today: 0,
            usage_week: usageCount || 0,
            usage_month: 0,
            trend: 'stable'
          })
        }
        setFeatureMetrics(metrics)
      }

      // Plan metrics
      const { data: plans } = await supabase
        .from('plan_catalog')
        .select('slug, nome_exibicao, preco_mensal_centavos')
        .order('ordem_exibicao')

      if (plans) {
        const planStats: PlanMetric[] = []
        for (const p of plans) {
          const { count } = await supabase
            .from('user_subscriptions_core')
            .select('*', { count: 'exact', head: true })
            .eq('plan_slug', p.slug)
            .eq('status', 'active')

          planStats.push({
            plan_slug: p.slug,
            nome: p.nome_exibicao,
            total_users: count || 0,
            mrr: (count || 0) * (p.preco_mensal_centavos / 100),
            churn_rate: 0
          })
        }
        setPlanMetrics(planStats)
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err)
    } finally {
      setLoading(false)
    }
  }

  function getStartDate(p: string): string {
    const now = new Date()
    switch (p) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      case 'week':
        const week = new Date(now)
        week.setDate(week.getDate() - 7)
        return week.toISOString()
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/planos-core" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Métricas PLANOS_CORE
              </h1>
              <p className="text-sm text-gray-500">Dashboard de uso de features e planos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="today">Hoje</option>
              <option value="week">Última semana</option>
              <option value="month">Este mês</option>
            </select>
            <button
              onClick={loadMetrics}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Usuários</span>
              </div>
              <div className="text-2xl font-bold">{overview.total_users}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Assinaturas</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{overview.active_subscriptions}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Overrides</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{overview.total_overrides}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Features</span>
              </div>
              <div className="text-2xl font-bold">{overview.features_count}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Profiles</span>
              </div>
              <div className="text-2xl font-bold">{overview.profiles_count}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Planos</span>
              </div>
              <div className="text-2xl font-bold">{overview.plans_count}</div>
            </div>
          </div>
        )}

        {/* Plan Metrics */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Distribuição por Plano
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {planMetrics.map(plan => (
              <div key={plan.plan_slug} className="p-4 bg-gray-50 rounded-lg border">
                <div className="font-semibold text-lg">{plan.nome}</div>
                <div className="text-sm text-gray-500 mb-2">{plan.plan_slug}</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{plan.total_users}</div>
                    <div className="text-xs text-gray-500">usuários</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">{formatCurrency(plan.mrr)}</div>
                    <div className="text-xs text-gray-500">MRR</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Metrics */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Uso de Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-right py-3 px-4">Profiles</th>
                  <th className="text-right py-3 px-4">Uso ({period})</th>
                  <th className="text-center py-3 px-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {featureMetrics.map(f => (
                  <tr key={f.feature_key} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{f.nome}</div>
                      <div className="text-sm text-gray-500">{f.feature_key}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">{f.categoria}</span>
                    </td>
                    <td className="py-3 px-4 text-right">{f.total_users}</td>
                    <td className="py-3 px-4 text-right font-medium">{f.usage_week}</td>
                    <td className="py-3 px-4 text-center">
                      {f.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 inline" />}
                      {f.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 inline" />}
                      {f.trend === 'stable' && <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MRR Total */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">MRR Total (Monthly Recurring Revenue)</div>
              <div className="text-4xl font-bold mt-2">
                {formatCurrency(planMetrics.reduce((acc, p) => acc + p.mrr, 0))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">ARR Projetado</div>
              <div className="text-2xl font-bold mt-2">
                {formatCurrency(planMetrics.reduce((acc, p) => acc + p.mrr, 0) * 12)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
