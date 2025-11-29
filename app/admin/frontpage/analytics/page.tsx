'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { BarChart3, TrendingUp, Users, ExternalLink, Calendar, Download } from 'lucide-react'

interface RedirectStats {
  frontpageId: string
  platform: string
  version: string
  timestamp: string
  userAgent: string
  referrer: string
}

export default function FrontpageAnalyticsPage() {
  const [stats, setStats] = useState<RedirectStats[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    loadStats()
  }, [dateRange])

  const loadStats = () => {
    try {
      const allStats = JSON.parse(localStorage.getItem('frontpage_redirects') || '[]')
      
      // Filtrar por data
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateRange) {
        case '1d':
          filterDate.setDate(now.getDate() - 1)
          break
        case '7d':
          filterDate.setDate(now.getDate() - 7)
          break
        case '30d':
          filterDate.setDate(now.getDate() - 30)
          break
        case '90d':
          filterDate.setDate(now.getDate() - 90)
          break
      }

      const filteredStats = allStats.filter((stat: RedirectStats) => 
        new Date(stat.timestamp) >= filterDate
      )

      setStats(filteredStats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformStats = () => {
    const platformCounts: Record<string, number> = {}
    
    stats.forEach(stat => {
      const platform = stat.platform || 'unknown'
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
    })

    return Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
      percentage: ((count / stats.length) * 100).toFixed(1)
    }))
  }

  const getVersionStats = () => {
    const versionCounts: Record<string, number> = {}
    
    stats.forEach(stat => {
      const version = stat.version || 'unknown'
      versionCounts[version] = (versionCounts[version] || 0) + 1
    })

    return Object.entries(versionCounts).map(([version, count]) => ({
      version,
      count,
      percentage: ((count / stats.length) * 100).toFixed(1)
    }))
  }

  const getDailyStats = () => {
    const dailyCounts: Record<string, number> = {}
    
    stats.forEach(stat => {
      const date = new Date(stat.timestamp).toLocaleDateString('pt-BR')
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    return Object.entries(dailyCounts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7) // Últimos 7 dias
      .map(([date, count]) => ({ date, count }))
  }

  const exportData = () => {
    const dataStr = JSON.stringify(stats, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `frontpage-stats-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-52 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Carregando analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  const platformStats = getPlatformStats()
  const versionStats = getVersionStats()
  const dailyStats = getDailyStats()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            Analytics de Frontpage
          </h1>
          <p className="text-slate-400">
            Visualize o desempenho das suas frontpages e redirecionamentos
          </p>
        </div>

        {/* Controles */}
        <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-purple-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1d">Últimas 24 horas</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>

            <button
              onClick={exportData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Dados
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold">{stats.length}</span>
            </div>
            <p className="text-slate-400">Total de Redirecionamentos</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold">{dailyStats.reduce((sum, day) => sum + day.count, 0)}</span>
            </div>
            <p className="text-slate-400">Últimos 7 dias</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <ExternalLink className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">{platformStats.length}</span>
            </div>
            <p className="text-slate-400">Plataformas Ativas</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold">{versionStats.length}</span>
            </div>
            <p className="text-slate-400">Versões em Teste</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estatísticas por Plataforma */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-lg font-semibold mb-4">Redirecionamentos por Plataforma</h2>
            <div className="space-y-3">
              {platformStats.map(({ platform, count, percentage }) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="capitalize">{platform}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-400">{count} ({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas por Versão */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-lg font-semibold mb-4">Performance por Versão</h2>
            <div className="space-y-3">
              {versionStats.map(({ version, count, percentage }) => (
                <div key={version} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Versão {version}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-400">{count} ({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tráfego Diário */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Tráfego dos Últimos 7 Dias</h2>
            <div className="space-y-3">
              {dailyStats.map(({ date, count }) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 w-24">{date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${dailyStats.length > 0 ? (count / Math.max(...dailyStats.map(d => d.count))) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela Detalhada */}
        {stats.length > 0 && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mt-6">
            <h2 className="text-lg font-semibold mb-4">Redirecionamentos Recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4">Data/Hora</th>
                    <th className="text-left py-3 px-4">Plataforma</th>
                    <th className="text-left py-3 px-4">Versão</th>
                    <th className="text-left py-3 px-4">Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.slice(-10).reverse().map((stat, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      <td className="py-3 px-4">
                        {new Date(stat.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 capitalize">{stat.platform}</td>
                      <td className="py-3 px-4">{stat.version}</td>
                      <td className="py-3 px-4">
                        {stat.referrer ? (
                          <span className="text-purple-400 truncate max-w-xs block">
                            {stat.referrer}
                          </span>
                        ) : (
                          <span className="text-slate-500">Direto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
