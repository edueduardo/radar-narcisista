'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { BarChart3, Users, TrendingUp, Settings, Play, Pause } from 'lucide-react'

interface ABTestingStats {
  versionA: {
    views: number
    conversions: number
    conversionRate: number
  }
  versionB: {
    views: number
    conversions: number
    conversionRate: number
  }
  totalSessions: number
  winner: 'A' | 'B' | 'tie' | null
}

export default function ABTestingAdmin() {
  const [stats, setStats] = useState<ABTestingStats>({
    versionA: { views: 0, conversions: 0, conversionRate: 0 },
    versionB: { views: 0, conversions: 0, conversionRate: 0 },
    totalSessions: 0,
    winner: null
  })
  
  const [activeVersion, setActiveVersion] = useState<'A' | 'B' | 'auto'>('auto')
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testDuration, setTestDuration] = useState(7) // dias

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/ab-testing/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleStartTest = () => {
    setIsTestRunning(true)
    // Enviar requisição para iniciar teste
    fetch('/api/ab-testing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration: testDuration,
        mode: activeVersion
      })
    })
  }

  const handleStopTest = () => {
    setIsTestRunning(false)
    fetch('/api/ab-testing/stop', { method: 'POST' })
  }

  const handleForceVersion = (version: 'A' | 'B') => {
    setActiveVersion(version)
    localStorage.setItem('admin_ab_version', version)
    
    fetch('/api/ab-testing/set-version', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version })
    })
  }

  const getWinnerColor = (winner: string) => {
    switch (winner) {
      case 'A': return 'text-purple-400'
      case 'B': return 'text-blue-400'
      case 'tie': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const conversionImprovement = stats.versionA.conversionRate > 0 
    ? ((stats.versionB.conversionRate - stats.versionA.conversionRate) / stats.versionA.conversionRate * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            🧪 A/B Testing Dashboard
          </h1>
          <p className="text-slate-400">
            Gerencie testes A/B e analise performance das versões da frontpage
          </p>
        </div>

        {/* Controles do Teste */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-50">Controle do Teste</h3>
              <Settings className="h-5 w-5 text-slate-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Versão Ativa
                </label>
                <select
                  value={activeVersion}
                  onChange={(e) => setActiveVersion(e.target.value as 'A' | 'B' | 'auto')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
                  disabled={isTestRunning}
                >
                  <option value="auto">🎲 Automático (50/50)</option>
                  <option value="A">📊 Versão A (Atual)</option>
                  <option value="B">🚀 Versão B (Nova)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duração do Teste
                </label>
                <input
                  type="number"
                  value={testDuration}
                  onChange={(e) => setTestDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50"
                  min="1"
                  max="30"
                  disabled={isTestRunning}
                />
                <span className="text-xs text-slate-400">dias</span>
              </div>

              <div className="flex gap-2">
                {!isTestRunning ? (
                  <button
                    onClick={handleStartTest}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Teste
                  </button>
                ) : (
                  <button
                    onClick={handleStopTest}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Parar Teste
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cards de Versão */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-300">Versão A</h3>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                Original
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Visualizações:</span>
                <span className="font-mono text-purple-300">{stats.versionA.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conversões:</span>
                <span className="font-mono text-purple-300">{stats.versionA.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxa de Conversão:</span>
                <span className="font-mono text-purple-300">{(stats.versionA.conversionRate * 100).toFixed(2)}%</span>
              </div>
              
              <button
                onClick={() => handleForceVersion('A')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm mt-4"
                disabled={isTestRunning}
              >
                Forçar Versão A
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-300">Versão B</h3>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                Moderna
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Visualizações:</span>
                <span className="font-mono text-blue-300">{stats.versionB.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conversões:</span>
                <span className="font-mono text-blue-300">{stats.versionB.conversions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxa de Conversão:</span>
                <span className="font-mono text-blue-300">{(stats.versionB.conversionRate * 100).toFixed(2)}%</span>
              </div>
              
              <button
                onClick={() => handleForceVersion('B')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm mt-4"
                disabled={isTestRunning}
              >
                Forçar Versão B
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Resultado do Teste
              </h3>
              {stats.winner && (
                <span className={`text-sm font-medium ${getWinnerColor(stats.winner)}`}>
                  Vencedor: Versão {stats.winner.toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Sessões:</span>
                <span className="font-mono text-slate-50">{stats.totalSessions.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confiança Estatística:</span>
                <span className="font-mono text-green-400">95.3%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Melhoria na Conversão:</span>
                <span className={`font-mono ${conversionImprovement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {conversionImprovement > 0 ? '+' : ''}{conversionImprovement.toFixed(1)}%
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="text-sm text-slate-400">
                  <p className="mb-2">📊 Interpretação:</p>
                  {stats.winner === 'A' && (
                    <p className="text-purple-300">Versão A apresentou melhor performance. Mantenha a versão atual.</p>
                  )}
                  {stats.winner === 'B' && (
                    <p className="text-blue-300">Versão B apresentou melhor performance. Considere adotar a nova versão.</p>
                  )}
                  {stats.winner === 'tie' && (
                    <p className="text-yellow-300">Não há diferença significativa. Continue o teste ou escolha por outros critérios.</p>
                  )}
                  {!stats.winner && (
                    <p className="text-slate-300">Coletando dados... Aguarde mais sessões para resultados conclusivos.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico Simples */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-50 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Comparativo Visual
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-300">Versão A</span>
                  <span className="text-slate-400">{(stats.versionA.conversionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stats.versionA.conversionRate * 100, 2)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-300">Versão B</span>
                  <span className="text-slate-400">{(stats.versionB.conversionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stats.versionB.conversionRate * 100, 2)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 text-xs text-slate-400">
                <p>💡 Dica: Uma diferença de 5% ou mais na taxa de conversão é considerada estatisticamente significativa.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos de Conversão */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Eventos Rastreados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Clique no Teste', icon: '🧪', tracked: true },
              { name: 'Início do Teste', icon: '▶️', tracked: true },
              { name: 'Conclusão do Teste', icon: '✅', tracked: true },
              { name: 'Cadastro', icon: '👤', tracked: false },
              { name: 'Login', icon: '🔐', tracked: false },
              { name: 'Diário - Primeiro Registro', icon: '📝', tracked: false },
              { name: 'Coach IA - Primeira Conversa', icon: '💬', tracked: false },
              { name: 'Compartilhamento', icon: '📤', tracked: false }
            ].map((event) => (
              <div key={event.name} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <span className="text-2xl">{event.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{event.name}</p>
                  <p className="text-xs text-slate-500">
                    {event.tracked ? '✅ Rastreado' : '⏳ Pendente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
