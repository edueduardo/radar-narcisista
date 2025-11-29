'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  TrendingUp, TrendingDown, Users, FileText, 
  DollarSign, Eye, CheckCircle, UserPlus,
  BarChart3, PieChart, Brain, Sparkles, RefreshCw,
  Settings, Power, Check, X, Target, AlertTriangle,
  Shield, Activity, Clock, AlertCircle, MessageSquare,
  ThumbsUp, Star, Bug, Zap
} from 'lucide-react'

// Dados mockados com métricas críticas
const mockMetrics = {
  // Funil
  sessoes: 12450, cliques_cta: 3200, testes_iniciados: 2100,
  testes_concluidos: 1680, contas_criadas: 890,
  primeiro_diario: 445, primeiro_chat: 312,
  retencao_7d: 63, mrr: 2940, custo_ia_mes: 127.50,
  usuarios_pagantes: 84, usuarios_gratuitos: 1150,
  
  // SEGURANÇA - CRÍTICO
  emergencias_hoje: 47,
  emergencias_tipo: { 'esc_exit': 28, 'call_190': 8, 'call_188': 6, 'call_180': 5 },
  emergencias_paginas: { '/teste-clareza': 15, '/gaslighting': 12, '/': 8, '/diario': 7 },
  pico_horario: 22, // 22h
  
  // TÉCNICO
  total_erros: 23,
  erros_por_rota: { '/api/voice/transcribe': 12, '/api/ai/chat': 7, '/api/diary/save': 4 },
  tempo_medio_resposta: 1250, // ms
  drop_offs: 89, // abandonos técnicos
  
  // FEEDBACK
  rating_medio_teste: 4.2,
  thumbs_up_chat: 234,
  thumbs_down_chat: 45,
  facilidade_diario: 3.8, // 1-5
  
  changes: { sessoes: 12.5, testes: 8.3, contas: -2.1, retencao: 5.2 }
}

const mockFunnel = [
  { label: 'Sessões', value: 12450, percent: 100 },
  { label: 'Clique CTA', value: 3200, percent: 25.7 },
  { label: 'Início Teste', value: 2100, percent: 16.9 },
  { label: 'Teste Concluído', value: 1680, percent: 13.5 },
  { label: 'Conta Criada', value: 890, percent: 7.1 },
]

const mockInsights = [
  { id: '1', category: 'FUNIL', suggestion: 'Taxa de conversão CTA→Teste em 65%. Adicione vídeo explicativo.', priority: 'alta', status: 'nova' },
  { id: '2', category: 'SEO', suggestion: '/love-bombing tem alto tráfego mas baixa conversão. Adicione CTA no meio.', priority: 'alta', status: 'nova' },
  { id: '3', category: 'CONTEUDO', suggestion: 'Criar artigos: "manipulação emocional", "trauma bond superar".', priority: 'media', status: 'nova' },
  { id: '4', category: 'RETENCAO', suggestion: 'Usuários com diário nos 3 primeiros dias têm 2.5x mais retenção.', priority: 'alta', status: 'nova' },
  { id: '5', category: 'CUSTO', suggestion: 'Custo IA R$1.52/usuário. Implemente cache para reduzir 30%.', priority: 'media', status: 'nova' },
]

export default function InsightsPage() {
  const [insights, setInsights] = useState(mockInsights)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'config'>('dashboard')
  const [aiConfig, setAiConfig] = useState({
    enable_ai_insights: true, enable_ai_seo: true,
    ai_provider: 'openai', auto_generate: true
  })

  const handleAction = (id: string, action: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status: action } : i))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Analytics & IA Coach
            </h1>
            <p className="text-slate-400">Métricas e sugestões inteligentes</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['dashboard', 'insights', 'config'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  activeTab === tab ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}>
                {tab === 'dashboard' && <BarChart3 className="w-4 h-4" />}
                {tab === 'insights' && <Sparkles className="w-4 h-4" />}
                {tab === 'config' && <Settings className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'insights' && insights.filter(i => i.status === 'nova').length > 0 && (
                  <span className="bg-red-500 text-xs px-2 rounded-full">{insights.filter(i => i.status === 'nova').length}</span>
                )}
              </button>
            ))}
          </div>

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <MetricCard label="Sessões" value={mockMetrics.sessoes} change={mockMetrics.changes.sessoes} icon={Eye} />
                <MetricCard label="Testes" value={mockMetrics.testes_concluidos} change={mockMetrics.changes.testes} icon={CheckCircle} />
                <MetricCard label="Contas" value={mockMetrics.contas_criadas} change={mockMetrics.changes.contas} icon={UserPlus} />
                <MetricCard label="Retenção 7d" value={`${mockMetrics.retencao_7d}%`} change={mockMetrics.changes.retencao} icon={Users} />
              </div>

              {/* MÉTRICAS CRÍTICAS - Segurança e Feedback */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <MetricCard label="🚨 Emergências Hoje" value={mockMetrics.emergencias_hoje} change={0} icon={Shield} color="red" />
                <MetricCard label="⭐ Rating Teste" value={mockMetrics.rating_medio_teste} change={0} icon={Star} color="yellow" />
                <MetricCard label="🐛 Erros Técnicos" value={mockMetrics.total_erros} change={0} icon={Bug} color="orange" />
                <MetricCard label="👍 Chat Positivos" value={mockMetrics.thumbs_up_chat} change={0} icon={ThumbsUp} color="green" />
              </div>

              <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />Funil de Conversão
                </h2>
                {mockFunnel.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4 mb-2">
                    <div className="w-28 text-sm text-slate-400">{step.label}</div>
                    <div className="flex-1 bg-slate-800 rounded-full h-6 overflow-hidden">
                      <div className="h-full bg-purple-600 flex items-center justify-end pr-2"
                        style={{ width: `${step.percent}%` }}>
                        <span className="text-xs font-bold">{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-14 text-right text-sm text-slate-400">{step.percent}%</div>
                  </div>
                ))}
              </div>

              {/* GRID: Segurança, Técnico, Feedback */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* SEGURANÇA - CRÍTICO */}
                <div className="bg-slate-900 rounded-xl p-6 border border-red-500/30">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" /> Segurança
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <p className="text-xs text-red-400">Emergências hoje</p>
                      <p className="text-2xl font-bold text-red-400">{mockMetrics.emergencias_hoje}</p>
                      <p className="text-xs text-slate-400">Pico: {mockMetrics.pico_horario}h</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">Por tipo:</p>
                      {Object.entries(mockMetrics.emergencias_tipo).map(([tipo, qtd]) => (
                        <div key={tipo} className="flex justify-between text-sm">
                          <span className="text-slate-400">{tipo}</span>
                          <span className="text-red-400">{qtd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TÉCNICO */}
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bug className="w-5 h-5 text-orange-400" /> Técnico
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-orange-500/10 rounded-lg p-3">
                      <p className="text-xs text-orange-400">Erros totais</p>
                      <p className="text-2xl font-bold text-orange-400">{mockMetrics.total_erros}</p>
                      <p className="text-xs text-slate-400">Response: {mockMetrics.tempo_medio_resposta}ms</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">Rotas com erro:</p>
                      {Object.entries(mockMetrics.erros_por_rota).map(([rota, qtd]) => (
                        <div key={rota} className="flex justify-between text-sm">
                          <span className="text-slate-400 truncate">{rota}</span>
                          <span className="text-orange-400">{qtd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FEEDBACK */}
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" /> Feedback
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-yellow-500/10 rounded-lg p-3">
                      <p className="text-xs text-yellow-400">Rating Teste</p>
                      <p className="text-2xl font-bold text-yellow-400">{mockMetrics.rating_medio_teste}/5.0</p>
                      <p className="text-xs text-slate-400">Facilidade Diário: {mockMetrics.facilidade_diario}/5</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">Chat IA:</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">👍 {mockMetrics.thumbs_up_chat}</span>
                        <span className="text-red-400">👎 {mockMetrics.thumbs_down_chat}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {Math.round((mockMetrics.thumbs_up_chat / (mockMetrics.thumbs_up_chat + mockMetrics.thumbs_down_chat)) * 100)}% positivo
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4"><DollarSign className="w-5 h-5 inline text-green-400" /> Financeiro</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-slate-400">MRR</p>
                    <p className="text-2xl font-bold text-green-400">R$ {mockMetrics.mrr}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-slate-400">Custo IA</p>
                    <p className="text-2xl font-bold text-orange-400">R$ {mockMetrics.custo_ia_mes}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-slate-400">Gratuitos</p>
                    <p className="text-2xl font-bold">{mockMetrics.usuarios_gratuitos}</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-slate-400">Pagantes</p>
                    <p className="text-2xl font-bold text-purple-400">{mockMetrics.usuarios_pagantes}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* INSIGHTS */}
          {activeTab === 'insights' && (
            <>
              <div className="flex justify-end mb-4">
                <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}
                  className="px-4 py-2 bg-purple-600 rounded-lg flex items-center gap-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Gerar Insights
                </button>
              </div>
              <div className="space-y-4">
                {insights.map(i => (
                  <div key={i.id} className={`bg-slate-900 rounded-xl p-5 border ${i.status === 'nova' ? 'border-purple-500/50' : 'border-slate-800 opacity-50'}`}>
                    <div className="flex justify-between">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          i.category === 'SEO' ? 'bg-blue-500/20 text-blue-400' :
                          i.category === 'FUNIL' ? 'bg-purple-500/20 text-purple-400' :
                          i.category === 'CUSTO' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>{i.category}</span>
                        <span className={`ml-2 text-xs ${i.priority === 'alta' ? 'text-red-400' : 'text-yellow-400'}`}>● {i.priority}</span>
                        <p className="mt-2 text-slate-200">{i.suggestion}</p>
                      </div>
                      {i.status === 'nova' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(i.id, 'aplicada')} className="p-2 bg-green-600 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleAction(i.id, 'descartada')} className="p-2 bg-slate-700 rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4"><Power className="w-5 h-5 inline text-green-400" /> Ativação</h2>
                {[
                  { key: 'enable_ai_insights', label: 'Insights de IA' },
                  { key: 'enable_ai_seo', label: 'Sugestões SEO' },
                  { key: 'auto_generate', label: 'Geração Semanal' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mb-2 cursor-pointer">
                    <span>{item.label}</span>
                    <input type="checkbox" checked={(aiConfig as any)[item.key]}
                      onChange={() => setAiConfig({...aiConfig, [item.key]: !(aiConfig as any)[item.key]})}
                      className="w-5 h-5" />
                  </label>
                ))}
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4"><Brain className="w-5 h-5 inline text-purple-400" /> Provedor IA</h2>
                <div className="grid grid-cols-3 gap-4">
                  {['openai', 'anthropic', 'groq'].map(p => (
                    <button key={p} onClick={() => setAiConfig({...aiConfig, ai_provider: p})}
                      className={`p-4 rounded-lg border-2 ${aiConfig.ai_provider === p ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700'}`}>
                      <p className="font-medium capitalize">{p}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200"><AlertTriangle className="w-4 h-4 inline mr-2" />
                  IA só recebe métricas agregadas. Nunca textos de diário ou dados pessoais.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, change, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
  }
  
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${color ? colorClasses[color] : 'text-purple-400'}`} />
        {change !== 0 && (
          <span className={`flex items-center text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
