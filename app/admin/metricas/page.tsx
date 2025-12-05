'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: any
  color: string
}

interface ChartData {
  label: string
  value: number
}

export default function MetricasPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [topPages, setTopPages] = useState<{ page: string; views: number }[]>([])
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadMetrics()
  }, [period])

  // Função para logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout no admin:', error)
    }
  }

  // Função para limpar cache
  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_api_keys')
        localStorage.removeItem('ai_api_balances')
        localStorage.removeItem('ia_balances_admin')
        localStorage.removeItem('ia_status_admin')
        localStorage.removeItem('ias_customizadas')
      }
    } catch (e) {
      console.error('Erro ao limpar cache de IA:', e)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  const loadMetrics = async () => {
    setIsLoading(true)
    
    // Em produção, isso buscaria dados reais do banco
    // Por enquanto, simulamos os dados
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Métricas principais
    setMetrics([
      {
        title: 'Usuários Totais',
        value: 127,
        change: 12,
        changeLabel: 'vs. período anterior',
        icon: Users,
        color: 'bg-blue-500'
      },
      {
        title: 'Testes Realizados',
        value: 342,
        change: 23,
        changeLabel: 'vs. período anterior',
        icon: FileText,
        color: 'bg-purple-500'
      },
      {
        title: 'Entradas no Diário',
        value: 891,
        change: 18,
        changeLabel: 'vs. período anterior',
        icon: BarChart3,
        color: 'bg-green-500'
      },
      {
        title: 'Conversas com IA',
        value: 1247,
        change: 31,
        changeLabel: 'vs. período anterior',
        icon: MessageSquare,
        color: 'bg-orange-500'
      },
      {
        title: 'Usuários Ativos',
        value: 89,
        change: 8,
        changeLabel: 'últimos 7 dias',
        icon: Activity,
        color: 'bg-cyan-500'
      },
      {
        title: 'Taxa de Retenção',
        value: '67%',
        change: 5,
        changeLabel: 'vs. período anterior',
        icon: TrendingUp,
        color: 'bg-pink-500'
      },
    ])

    // Dados do gráfico (últimos 7 dias)
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const data: ChartData[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: Math.floor(Math.random() * 50) + 10
      })
    }
    setChartData(data)

    // Páginas mais acessadas
    setTopPages([
      { page: '/teste-claridade', views: 1234 },
      { page: '/dashboard', views: 987 },
      { page: '/diario', views: 756 },
      { page: '/chat', views: 543 },
      { page: '/blog', views: 321 },
    ])

    setIsLoading(false)
  }

  const maxChartValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Admin
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Dashboard de Métricas
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Acompanhe o crescimento e uso da plataforma
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Seletor de período */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-1">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      period === p 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <button
                onClick={loadMetrics}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>

              <button
                onClick={handleClearCache}
                className="text-xs text-slate-300 hover:text-slate-100 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Limpar cache</span>
              </button>

              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {metrics.map((metric, i) => {
            const Icon = metric.icon
            return (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${metric.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {metric.change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(metric.change)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{metric.title}</p>
              </div>
            )
          })}
        </div>

        {/* Gráfico de Atividade */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Atividade Diária
            </h2>
            
            {/* Gráfico de barras simples */}
            <div className="h-64 flex items-end gap-1">
              {chartData.slice(-30).map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                    style={{ height: `${(data.value / maxChartValue) * 100}%` }}
                    title={`${data.label}: ${data.value} ações`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{chartData[0]?.label}</span>
              <span>{chartData[chartData.length - 1]?.label}</span>
            </div>
          </div>

          {/* Páginas mais acessadas */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              Páginas Mais Acessadas
            </h2>
            
            <div className="space-y-3">
              {topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{page.page}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas de Engajamento */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Tempo Médio</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">8:32</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">minutos por sessão</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Frequência</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">3.2x</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">visitas por semana</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Testes/Usuário</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">2.7</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">média por usuário</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">MRR</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">receita recorrente</p>
          </div>
        </div>

        {/* Nota */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          📊 Dados simulados para demonstração. Em produção, conectar com analytics real.
        </div>
      </div>
      </div>
    </div>
  )
}
