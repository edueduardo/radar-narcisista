'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  AnalyticsSnapshot, 
  AIInsight, 
  generateAIInsights, 
  generateMockSnapshot, 
  saveInsights, 
  loadInsights,
  getAnalyticsSettings,
  saveAnalyticsSettings,
  AnalyticsSettings
} from '@/lib/analytics-coach'
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  BookOpen,
  DollarSign,
  Target,
  Search,
  Settings,
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AnalyticsPage() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [settings, setSettings] = useState<AnalyticsSettings>(getAnalyticsSettings())
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'usage' | 'seo' | 'business' | 'insights' | 'settings'>('overview')

  useEffect(() => {
    loadAnalyticsData()
    loadInsightsData()
  }, [])

  const loadAnalyticsData = () => {
    // Em produção, buscar do backend
    const mockData = generateMockSnapshot()
    setSnapshot(mockData)
  }

  const loadInsightsData = () => {
    const savedInsights = loadInsights()
    setInsights(savedInsights)
  }

  const generateNewInsights = async () => {
    if (!snapshot || !settings.enableAIInsights) return
    
    setLoading(true)
    try {
      const newInsights = await generateAIInsights(
        snapshot,
        settings.categories,
        settings.aiProvider
      )
      saveInsights(newInsights)
      loadInsightsData()
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateInsightStatus = (id: string, status: 'aplicada' | 'descartada') => {
    const insights = loadInsights()
    const index = insights.findIndex(i => i.id === id)
    
    if (index !== -1) {
      insights[index].status = status
      localStorage.setItem('ai_insights', JSON.stringify(insights))
      loadInsightsData()
    }
  }

  const updateSettings = (newSettings: AnalyticsSettings) => {
    setSettings(newSettings)
    saveAnalyticsSettings(newSettings)
  }

  const calculateFunnelRate = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (!snapshot) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Carregando analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Coach IA</h1>
              <p className="text-slate-600 mt-2">Métricas e insights inteligentes para o Radar Narcisista</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={generateNewInsights}
                disabled={loading || !settings.enableAIInsights}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
              >
                <Bot className="w-4 h-4" />
                {loading ? 'Gerando...' : 'Gerar Insights IA'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-lg w-fit">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'funnel', label: 'Funil', icon: Target },
              { id: 'usage', label: 'Uso', icon: Activity },
              { id: 'seo', label: 'SEO', icon: Search },
              { id: 'business', label: 'Negócio', icon: DollarSign },
              { id: 'insights', label: 'Insights IA', icon: Bot },
              { id: 'settings', label: 'Config', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* KPIs Principais */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{snapshot.funnel.sessions}</h3>
                <p className="text-slate-600 text-sm">Sessões (semana)</p>
                <p className="text-green-600 text-xs mt-2">
                  +{calculateFunnelRate(snapshot.funnel.sessions, snapshot.trends.previousPeriod.funnel.sessions).toFixed(1)}% vs semana anterior
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{snapshot.funnel.testCompletions}</h3>
                <p className="text-slate-600 text-sm">Testes Concluídos</p>
                <p className="text-green-600 text-xs mt-2">
                  Taxa de conversão: {formatPercent(snapshot.funnel.testCompletions / snapshot.funnel.sessions)}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{snapshot.usage.diaryEntries}</h3>
                <p className="text-slate-600 text-sm">Entradas no Diário</p>
                <p className="text-green-600 text-xs mt-2">
                  Retenção 7 dias: {formatPercent(snapshot.usage.retention7Days)}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(snapshot.business.mrr)}</h3>
                <p className="text-slate-600 text-sm">MRR Mensal</p>
                <p className="text-green-600 text-xs mt-2">
                  Margem: {formatPercent(snapshot.business.grossMargin)}
                </p>
              </div>
            </div>
          )}

          {/* Funil Tab */}
          {activeTab === 'funnel' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Funil de Conversão</h2>
                
                {/* Gráfico de Funil */}
                <div className="space-y-4">
                  {[
                    { label: 'Sessões no Site', value: snapshot.funnel.sessions, color: 'bg-blue-500' },
                    { label: 'Cliques em "Fazer Teste"', value: snapshot.funnel.testClicks, color: 'bg-blue-400' },
                    { label: 'Inícios de Teste', value: snapshot.funnel.testStarts, color: 'bg-blue-300' },
                    { label: 'Testes Concluídos', value: snapshot.funnel.testCompletions, color: 'bg-green-500' },
                    { label: 'Contas Criadas', value: snapshot.funnel.accountsCreated, color: 'bg-green-400' },
                    { label: 'Primeiro Diário', value: snapshot.funnel.firstDiaries, color: 'bg-purple-500' },
                    { label: 'Primeiro Chat IA', value: snapshot.funnel.firstChats, color: 'bg-purple-400' }
                  ].map((step, index) => {
                    const previousValue = index === 0 ? step.value : 
                      index === 1 ? snapshot.funnel.sessions :
                      index === 2 ? snapshot.funnel.testClicks :
                      index === 3 ? snapshot.funnel.testStarts :
                      index === 4 ? snapshot.funnel.testCompletions :
                      index === 5 ? snapshot.funnel.accountsCreated :
                      snapshot.funnel.firstDiaries
                    
                    const rate = ((step.value / previousValue) * 100).toFixed(1)
                    const width = (step.value / snapshot.funnel.sessions) * 100
                    
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-48 text-sm text-slate-700">{step.label}</div>
                        <div className="flex-1 relative">
                          <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${step.color} transition-all duration-500`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs text-white">
                            <span className="font-semibold">{step.value.toLocaleString()}</span>
                            <span>{rate}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Métricas de Retenção */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Retenção</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">7 dias</span>
                      <span className="font-semibold">{formatPercent(snapshot.usage.retention7Days)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">30 dias</span>
                      <span className="font-semibold">{formatPercent(snapshot.usage.retention30Days)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Retorno semanal</span>
                      <span className="font-semibold">{formatPercent(snapshot.usage.weeklyReturnRate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Fontes de Tráfego */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Fontes de Tráfego</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Orgânico Google', value: snapshot.seo.trafficSources.organic, color: 'bg-green-500' },
                    { label: 'Redes Sociais', value: snapshot.seo.trafficSources.social, color: 'bg-blue-500' },
                    { label: 'Tráfego Direto', value: snapshot.seo.trafficSources.direct, color: 'bg-purple-500' },
                    { label: 'Parcerias', value: snapshot.seo.trafficSources.referrals, color: 'bg-orange-500' }
                  ].map(source => (
                    <div key={source.label} className="text-center">
                      <div className={`w-16 h-16 ${source.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <span className="text-white font-bold text-lg">{source.value}</span>
                      </div>
                      <p className="text-sm text-slate-600">{source.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Páginas */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Top Páginas de Entrada</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 text-sm font-semibold text-slate-900">Página</th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-900">Sessões</th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-900">CTR Orgânico</th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-900">Conv. CTA</th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-900">Conv. Teste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.seo.topPages.map((page, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-3 text-sm text-slate-900">{page.url}</td>
                          <td className="text-center py-3 text-sm text-slate-900">{page.sessions}</td>
                          <td className="text-center py-3 text-sm text-slate-900">{formatPercent(page.organicCTR)}</td>
                          <td className="text-center py-3 text-sm text-slate-900">{formatPercent(page.testCTAConversion)}</td>
                          <td className="text-center py-3 text-sm text-slate-900">{formatPercent(page.testCompletionRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              {/* Métricas de Negócio */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{snapshot.business.freeUsers}</h3>
                  <p className="text-slate-600 text-sm">Usuários Gratuitos</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{snapshot.business.paidUsers}</h3>
                  <p className="text-slate-600 text-sm">Usuários Pagantes</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-purple-500" />
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(snapshot.business.aiCost)}</h3>
                  <p className="text-slate-600 text-sm">Custo IA/Mês</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-yellow-500" />
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{formatPercent(snapshot.business.grossMargin)}</h3>
                  <p className="text-slate-600 text-sm">Margem Bruta</p>
                </div>
              </div>

              {/* Custos Detalhados */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Análise de Custos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(snapshot.business.aiCostPerUser)}</div>
                    <p className="text-slate-600 text-sm">Custo IA por Usuário Ativo</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(snapshot.business.aiCostPerTest)}</div>
                    <p className="text-slate-600 text-sm">Custo por Teste</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(snapshot.business.aiCostPerChat)}</div>
                    <p className="text-slate-600 text-sm">Custo por Conversa</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Insights Gerados pela IA</h2>
                  <span className="text-sm text-slate-600">{insights.length} insights</span>
                </div>

                {insights.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Nenhum insight gerado ainda</p>
                    <button
                      onClick={generateNewInsights}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Gerar Primeiros Insights
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.map(insight => (
                      <div key={insight.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                insight.category === 'SEO' ? 'bg-green-100 text-green-700' :
                                insight.category === 'FUNIL' ? 'bg-blue-100 text-blue-700' :
                                insight.category === 'CUSTO' ? 'bg-red-100 text-red-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {insight.category}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                insight.priority === 'alta' ? 'bg-red-100 text-red-700' :
                                insight.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {insight.priority}
                              </span>
                              {insight.status === 'nova' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                  Novo
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{insight.title}</h3>
                            <p className="text-slate-600 text-sm mb-3">{insight.description}</p>
                            
                            {insight.actions.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Ações recomendadas:</p>
                                <ul className="text-sm text-slate-600 space-y-1">
                                  {insight.actions.map((action, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Impacto: {insight.impact}</span>
                            <span>Esforço: {insight.effort}</span>
                          </div>
                          
                          {insight.status === 'nova' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateInsightStatus(insight.id, 'aplicada')}
                                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                              >
                                Aplicar
                              </button>
                              <button
                                onClick={() => updateInsightStatus(insight.id, 'descartada')}
                                className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-700 text-white rounded"
                              >
                                Descartar
                              </button>
                            </div>
                          )}
                          
                          {insight.status === 'aplicada' && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Aplicado
                            </span>
                          )}
                          
                          {insight.status === 'descartada' && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Descartado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Configurações do Analytics Coach</h2>
                
                <div className="space-y-6">
                  {/* Ativação das Funcionalidades */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Funcionalidades</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-900">Insights IA</span>
                          <p className="text-xs text-slate-500">Gerar sugestões automáticas com IA</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.enableAIInsights}
                          onChange={(e) => updateSettings({...settings, enableAIInsights: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-900">Sugestões SEO</span>
                          <p className="text-xs text-slate-500">Análise de SEO e conteúdo</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.enableSEOSuggestions}
                          onChange={(e) => updateSettings({...settings, enableSEOSuggestions: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-900">Otimizador de Custos</span>
                          <p className="text-xs text-slate-500">Análise de custos de IA</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.enableCostOptimizer}
                          onChange={(e) => updateSettings({...settings, enableCostOptimizer: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Provedor de IA */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Provedor de IA</h3>
                    <select
                      value={settings.aiProvider}
                      onChange={(e) => updateSettings({...settings, aiProvider: e.target.value as 'openai' | 'anthropic'})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="openai">OpenAI (GPT-4)</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                    </select>
                  </div>

                  {/* Frequência de Geração */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Frequência de Geração</h3>
                    <select
                      value={settings.autoGenerateFrequency}
                      onChange={(e) => updateSettings({...settings, autoGenerateFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>

                  {/* Categorias */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Categorias de Análise</h3>
                    <div className="space-y-2">
                      {['SEO', 'FUNIL', 'CUSTO', 'CONTEUDO'].map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateSettings({...settings, categories: [...settings.categories, category]})
                              } else {
                                updateSettings({...settings, categories: settings.categories.filter(c => c !== category)})
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded mr-2"
                          />
                          <span className="text-sm text-slate-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
