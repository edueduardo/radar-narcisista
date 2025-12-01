'use client'

/**
 * Dashboard Analytics Avançado
 * ETAPA 42 - Métricas e gráficos interativos
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  DollarSign
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Tipos
interface MetricCard {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  color: string
}

interface DailyData {
  date: string
  queries: number
  tokens: number
  errors: number
  users: number
}

interface InstanceData {
  name: string
  queries: number
  tokens: number
  revenue: number
}

interface StatusData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

// Cores para gráficos
const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  
  // Dados simulados (em produção, viriam da API)
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [instanceData, setInstanceData] = useState<InstanceData[]>([])
  const [statusData, setStatusData] = useState<StatusData[]>([])

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Métricas principais
    setMetrics([
      {
        title: 'Total de Queries',
        value: '12,847',
        change: 23.5,
        changeLabel: 'vs período anterior',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'purple'
      },
      {
        title: 'Usuários Ativos',
        value: '1,234',
        change: 12.3,
        changeLabel: 'vs período anterior',
        icon: <Users className="w-5 h-5" />,
        color: 'cyan'
      },
      {
        title: 'Tokens Consumidos',
        value: '5.2M',
        change: -5.2,
        changeLabel: 'vs período anterior',
        icon: <Zap className="w-5 h-5" />,
        color: 'amber'
      },
      {
        title: 'Tempo Médio',
        value: '1.2s',
        change: -15.0,
        changeLabel: 'mais rápido',
        icon: <Clock className="w-5 h-5" />,
        color: 'green'
      },
      {
        title: 'Taxa de Sucesso',
        value: '98.5%',
        change: 0.5,
        changeLabel: 'vs período anterior',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'emerald'
      },
      {
        title: 'Receita Estimada',
        value: 'R$ 4.850',
        change: 18.7,
        changeLabel: 'vs período anterior',
        icon: <DollarSign className="w-5 h-5" />,
        color: 'green'
      }
    ])

    // Dados diários
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const daily: DailyData[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      daily.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        queries: Math.floor(Math.random() * 500) + 200,
        tokens: Math.floor(Math.random() * 200000) + 50000,
        errors: Math.floor(Math.random() * 20),
        users: Math.floor(Math.random() * 100) + 30
      })
    }
    setDailyData(daily)

    // Dados por instância
    setInstanceData([
      { name: 'Radar Narcisista', queries: 8500, tokens: 3200000, revenue: 0 },
      { name: 'Clínica Saúde Mental', queries: 2100, tokens: 980000, revenue: 1490 },
      { name: 'Coach Emocional', queries: 1500, tokens: 720000, revenue: 490 },
      { name: 'Escritório Advocacia', queries: 747, tokens: 300000, revenue: 490 }
    ])

    // Status das queries
    setStatusData([
      { name: 'Sucesso', value: 12650, color: '#10b981' },
      { name: 'Erro', value: 150, color: '#ef4444' },
      { name: 'Rate Limited', value: 35, color: '#f59e0b' },
      { name: 'Quota Exceeded', value: 12, color: '#8b5cf6' }
    ])

    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400',
    emerald: 'bg-emerald-500/20 text-emerald-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando analytics...</span>
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
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">Métricas e insights do Oráculo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro de período */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === p ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          <Link
            href="/admin/analytics-dashboard/export"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Link>
        </div>
      </div>

      {/* Métricas Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${colorClasses[metric.color]}`}>
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs ${
                metric.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-gray-400">{metric.title}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Queries por Dia */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Queries por Dia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="queries" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorQueries)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tokens Consumidos */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Tokens Consumidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [`${(value/1000).toFixed(1)}k tokens`, 'Tokens']}
              />
              <Bar dataKey="tokens" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status das Queries */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            Status das Queries
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Por Instância */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            Queries por Instância
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={instanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="queries" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Instâncias */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
          Detalhes por Instância
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-gray-400 font-medium">Instância</th>
                <th className="text-right p-3 text-gray-400 font-medium">Queries</th>
                <th className="text-right p-3 text-gray-400 font-medium">Tokens</th>
                <th className="text-right p-3 text-gray-400 font-medium">Receita</th>
                <th className="text-right p-3 text-gray-400 font-medium">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {instanceData.map((inst, idx) => {
                const totalQueries = instanceData.reduce((sum, i) => sum + i.queries, 0)
                const percentage = ((inst.queries / totalQueries) * 100).toFixed(1)
                return (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-medium">{inst.name}</td>
                    <td className="p-3 text-right">{inst.queries.toLocaleString()}</td>
                    <td className="p-3 text-right">{(inst.tokens / 1000000).toFixed(2)}M</td>
                    <td className="p-3 text-right text-green-400">
                      {inst.revenue > 0 ? `R$ ${inst.revenue.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
