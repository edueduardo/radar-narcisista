'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Clock, 
  Users, Settings, Zap, AlertTriangle, RefreshCw, BarChart3,
  PieChart, Activity, Sliders, Power, PowerOff, Database
} from 'lucide-react'
import {
  calculateUsageSummary,
  estimateMonthlyCost,
  getIAControlConfig,
  saveIAControlConfig,
  generateSampleData,
  IA_FEATURES,
  IA_PRICES,
  type IAControlConfig,
  type IAUsageSummary,
} from '@/lib/ia-usage-tracker'
import { IAS_DISPONIVEIS } from '@/lib/ia-registry'

export default function CustosIAPage() {
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day')
  const [summary, setSummary] = useState<IAUsageSummary | null>(null)
  const [estimate, setEstimate] = useState<ReturnType<typeof estimateMonthlyCost> | null>(null)
  const [controlConfig, setControlConfig] = useState<Record<string, IAControlConfig>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'features' | 'control'>('overview')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [period])

  const loadData = () => {
    setSummary(calculateUsageSummary(period))
    setEstimate(estimateMonthlyCost())
    setControlConfig(getIAControlConfig())
  }

  // Gerar dados de exemplo
  const handleGenerateSample = () => {
    generateSampleData()
    loadData()
  }

  // Salvar configuração de controle
  const handleSaveControl = () => {
    setSaving(true)
    saveIAControlConfig(controlConfig)
    setTimeout(() => setSaving(false), 500)
  }

  // Atualizar controle de uma IA
  const updateControl = (provider: string, updates: Partial<IAControlConfig>) => {
    setControlConfig(prev => ({
      ...prev,
      [provider]: {
        provider,
        enabled: true,
        usagePercent: 100,
        maxTokensPerDay: 0,
        maxCostPerDay: 0,
        ...updates,
      }
    }))
  }

  // Formatar moeda
  const formatCurrency = (value: number) => {
    if (value < 0.01) return `$${value.toFixed(4)}`
    if (value < 1) return `$${value.toFixed(3)}`
    return `$${value.toFixed(2)}`
  }

  // Formatar tokens
  const formatTokens = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  // Converter para BRL
  const toBRL = (usd: number) => (usd * 5.5).toFixed(2)

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-slate-800 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  Custos de IA
                </h1>
                <p className="text-sm text-slate-400">Monitore e controle seus gastos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Seletor de período */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
              >
                <option value="hour">Última hora</option>
                <option value="day">Últimas 24h</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
              </select>
              
              <button
                onClick={handleGenerateSample}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Gerar Dados Exemplo
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
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: PieChart },
              { id: 'providers', label: 'Por Provedor', icon: Zap },
              { id: 'features', label: 'Por Funcionalidade', icon: Activity },
              { id: 'control', label: 'Controle de Uso', icon: Sliders },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ===== VISÃO GERAL ===== */}
        {activeTab === 'overview' && summary && estimate && (
          <div className="space-y-6">
            {/* CUSTOS TOTAIS DO SISTEMA */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                Custos Totais do Sistema (Estimativa Mensal)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Supabase</p>
                  <p className="text-lg font-bold text-blue-400">R$ 125</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Vercel</p>
                  <p className="text-lg font-bold text-blue-400">R$ 100</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Domínio</p>
                  <p className="text-lg font-bold text-blue-400">R$ 7</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Email</p>
                  <p className="text-lg font-bold text-blue-400">R$ 50</p>
                </div>
                <div className="text-center border-l border-slate-700 pl-4">
                  <p className="text-xs text-slate-400 mb-1">FIXO TOTAL</p>
                  <p className="text-lg font-bold text-green-400">R$ 282</p>
                </div>
              </div>
            </div>

            {/* Cards de resumo IA */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Gasto IA ({period === 'hour' ? '1h' : period === 'day' ? '24h' : period === 'week' ? '7d' : '30d'})</span>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(summary.totalCost)}</p>
                <p className="text-sm text-slate-500">≈ R$ {toBRL(summary.totalCost)}</p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Projeção IA/Mês</span>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-yellow-400">{formatCurrency(estimate.projected)}</p>
                <p className="text-sm text-slate-500">≈ R$ {toBRL(estimate.projected)}</p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Tokens Usados</span>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-blue-400">{formatTokens(summary.totalTokens)}</p>
                <p className="text-sm text-slate-500">tokens</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">CUSTO TOTAL/MÊS</span>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-3xl font-bold text-red-400">
                  R$ {(282 + parseFloat(toBRL(estimate.projected))).toFixed(0)}
                </p>
                <p className="text-sm text-slate-500">Fixo + IA</p>
              </div>
            </div>

            {/* Gasto por Origem */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="font-semibold">Clientes</h3>
                    <p className="text-xs text-slate-400">Chat, análises, testes</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {formatCurrency(summary.bySource['client']?.cost || 0)}
                </p>
                <p className="text-sm text-slate-500">
                  {summary.bySource['client']?.requests || 0} requisições
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">Admin</h3>
                    <p className="text-xs text-slate-400">IA Assistente, moderação</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(summary.bySource['admin']?.cost || 0)}
                </p>
                <p className="text-sm text-slate-500">
                  {summary.bySource['admin']?.requests || 0} requisições
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-orange-400" />
                  <div>
                    <h3 className="font-semibold">Sistema</h3>
                    <p className="text-xs text-slate-400">Automações, consenso</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(summary.bySource['system']?.cost || 0)}
                </p>
                <p className="text-sm text-slate-500">
                  {summary.bySource['system']?.requests || 0} requisições
                </p>
              </div>
            </div>

            {/* Tabela de custos por período */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                Projeção de Custos IA
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 text-slate-400">Período</th>
                      <th className="text-right py-2 text-slate-400">USD</th>
                      <th className="text-right py-2 text-slate-400">BRL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <td className="py-2">Por Hora</td>
                      <td className="text-right text-green-400">{formatCurrency(estimate.projected / 720)}</td>
                      <td className="text-right text-slate-300">R$ {(parseFloat(toBRL(estimate.projected)) / 720).toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2">Por Dia</td>
                      <td className="text-right text-green-400">{formatCurrency(estimate.projected / 30)}</td>
                      <td className="text-right text-slate-300">R$ {(parseFloat(toBRL(estimate.projected)) / 30).toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2">Por Semana</td>
                      <td className="text-right text-yellow-400">{formatCurrency(estimate.projected / 4)}</td>
                      <td className="text-right text-slate-300">R$ {(parseFloat(toBRL(estimate.projected)) / 4).toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2">Por Quinzena</td>
                      <td className="text-right text-yellow-400">{formatCurrency(estimate.projected / 2)}</td>
                      <td className="text-right text-slate-300">R$ {(parseFloat(toBRL(estimate.projected)) / 2).toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-slate-800 font-bold">
                      <td className="py-2">Por Mês</td>
                      <td className="text-right text-red-400">{formatCurrency(estimate.projected)}</td>
                      <td className="text-right text-red-300">R$ {toBRL(estimate.projected)}</td>
                    </tr>
                    <tr className="font-bold bg-slate-800/50">
                      <td className="py-3">TOTAL MENSAL (Fixo + IA)</td>
                      <td className="text-right text-red-400">{formatCurrency(estimate.projected + 51)}</td>
                      <td className="text-right text-red-300">R$ {(282 + parseFloat(toBRL(estimate.projected))).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráfico por hora */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Gasto por Hora (últimas 24h)
              </h3>
              <div className="flex items-end gap-1 h-32">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0') + ':00'
                  const cost = summary.byHour[hour] || 0
                  const maxCost = Math.max(...Object.values(summary.byHour), 0.001)
                  const height = (cost / maxCost) * 100
                  
                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-400"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${hour}: ${formatCurrency(cost)}`}
                      />
                      {i % 4 === 0 && (
                        <span className="text-xs text-slate-500">{i}h</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== POR PROVEDOR ===== */}
        {activeTab === 'providers' && summary && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Gasto por Provedor de IA</h2>
            
            <div className="grid gap-3">
              {Object.entries(summary.byProvider)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([provider, data]) => {
                  const iaInfo = IAS_DISPONIVEIS.find(ia => ia.id === provider)
                  const prices = IA_PRICES[provider]
                  const isFree = prices?.input === 0 && prices?.output === 0
                  
                  return (
                    <div key={provider} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{iaInfo?.icon || '🤖'}</span>
                          <div>
                            <h3 className="font-medium">{iaInfo?.nome || provider}</h3>
                            <p className="text-xs text-slate-500">
                              {data.requests} requisições • {formatTokens(data.tokens)} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${isFree ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isFree ? 'GRÁTIS' : formatCurrency(data.cost)}
                          </p>
                          {!isFree && (
                            <p className="text-xs text-slate-500">≈ R$ {toBRL(data.cost)}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isFree ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ 
                            width: `${(data.cost / Math.max(summary.totalCost, 0.001)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
            
            {Object.keys(summary.byProvider).length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhum dado de uso ainda. Clique em "Gerar Dados Exemplo" para testar.
              </div>
            )}
          </div>
        )}

        {/* ===== POR FUNCIONALIDADE ===== */}
        {activeTab === 'features' && summary && (
          <div className="space-y-6">
            {/* Features de Cliente */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Funcionalidades para Clientes
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {IA_FEATURES.client.map(feature => {
                  const data = summary.byFeature[feature.id]
                  return (
                    <div key={feature.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{feature.name}</h3>
                        <span className="text-lg font-bold text-blue-400">
                          {data ? formatCurrency(data.cost) : '$0.00'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{feature.description}</p>
                      <p className="text-xs text-slate-400">
                        {data?.requests || 0} usos • ~{feature.avgTokens} tokens/uso
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Features de Admin */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Funcionalidades de Admin (seu uso)
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {IA_FEATURES.admin.map(feature => {
                  const data = summary.byFeature[feature.id]
                  return (
                    <div key={feature.id} className="bg-slate-900 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{feature.name}</h3>
                        <span className="text-lg font-bold text-purple-400">
                          {data ? formatCurrency(data.cost) : '$0.00'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{feature.description}</p>
                      <p className="text-xs text-slate-400">
                        {data?.requests || 0} usos • ~{feature.avgTokens} tokens/uso
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Features de Sistema */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Automações do Sistema
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {IA_FEATURES.system.map(feature => {
                  const data = summary.byFeature[feature.id]
                  return (
                    <div key={feature.id} className="bg-slate-900 rounded-xl p-4 border border-orange-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{feature.name}</h3>
                        <span className="text-lg font-bold text-orange-400">
                          {data ? formatCurrency(data.cost) : '$0.00'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{feature.description}</p>
                      <p className="text-xs text-slate-400">
                        {data?.requests || 0} usos • ~{feature.avgTokens} tokens/uso
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTROLE DE USO ===== */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Controle de Uso por IA</h2>
                <p className="text-sm text-slate-400">
                  Defina limites e porcentagem de uso para cada IA
                </p>
              </div>
              <button
                onClick={handleSaveControl}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Salvar Configurações
              </button>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-semibold mb-1">Como funciona o controle:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-300/80">
                    <li><strong>ON/OFF:</strong> Ativa ou desativa completamente a IA</li>
                    <li><strong>% de Uso:</strong> Probabilidade de usar essa IA (100% = sempre, 50% = metade das vezes)</li>
                    <li><strong>Limite de Tokens:</strong> Máximo de tokens por dia (0 = sem limite)</li>
                    <li><strong>Limite de Custo:</strong> Máximo em USD por dia (0 = sem limite)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {IAS_DISPONIVEIS.map(ia => {
                const config = controlConfig[ia.id] || {
                  provider: ia.id,
                  enabled: true,
                  usagePercent: 100,
                  maxTokensPerDay: 0,
                  maxCostPerDay: 0,
                }
                const prices = IA_PRICES[ia.id]
                const isFree = prices?.input === 0 && prices?.output === 0
                
                return (
                  <div 
                    key={ia.id} 
                    className={`bg-slate-900 rounded-xl p-6 border ${
                      config.enabled ? 'border-slate-700' : 'border-red-500/50 bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ia.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{ia.nome}</h3>
                          <p className="text-xs text-slate-500">
                            {isFree ? '🆓 Grátis' : `💰 $${prices?.input}/1K input, $${prices?.output}/1K output`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Toggle ON/OFF */}
                      <button
                        onClick={() => updateControl(ia.id, { enabled: !config.enabled })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                          config.enabled 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {config.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        {config.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {config.enabled && (
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Slider de % de uso */}
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">
                            Porcentagem de Uso: <span className="text-white font-bold">{config.usagePercent}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={config.usagePercent}
                            onChange={(e) => updateControl(ia.id, { usagePercent: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        {/* Limite de tokens */}
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">
                            Limite Tokens/Dia
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="10000"
                            value={config.maxTokensPerDay}
                            onChange={(e) => updateControl(ia.id, { maxTokensPerDay: Number(e.target.value) })}
                            placeholder="0 = sem limite"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                          />
                        </div>

                        {/* Limite de custo */}
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">
                            Limite Custo/Dia (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={config.maxCostPerDay}
                            onChange={(e) => updateControl(ia.id, { maxCostPerDay: Number(e.target.value) })}
                            placeholder="0 = sem limite"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  )
}
