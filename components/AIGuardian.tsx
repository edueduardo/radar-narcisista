'use client'

import { useState } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Zap,
  Target,
  BarChart3,
  Activity
} from 'lucide-react'

interface GuardianInsight {
  id: string
  type: 'COST_OPTIMIZATION' | 'PERFORMANCE' | 'SCOPE_VIOLATION' | 'RISK_ALERT' | 'EFFICIENCY'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  impact: string
  recommendation: string
  metrics: {
    current: number
    projected: number
    unit: string
  }
  autoApplicable: boolean
  agentId?: string
  createdAt: string
}

interface AIGuardianProps {
  agents: any[]
  metrics: any[]
  incidents: any[]
  onApplySuggestion: (suggestionId: string) => void
  onDismissSuggestion: (suggestionId: string) => void
}

export default function AIGuardian({ 
  agents, 
  metrics, 
  incidents, 
  onApplySuggestion, 
  onDismissSuggestion 
}: AIGuardianProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'analysis' | 'predictions'>('insights')

  // Gerar insights baseados nos dados
  const generateInsights = (): GuardianInsight[] => {
    const insights: GuardianInsight[] = []

    // Análise de custos
    const totalCostToday = metrics.reduce((sum, m) => sum + (m.cost_estimated_usd || 0), 0)
    if (totalCostToday > 10) {
      insights.push({
        id: 'cost_high_1',
        type: 'COST_OPTIMIZATION',
        priority: 'HIGH',
        title: 'Custo de IA acima do esperado',
        description: `O custo total de IAs hoje é $${totalCostToday.toFixed(2)}, 32% acima da média semanal.`,
        impact: 'Redução potencial de $50-200/mês',
        recommendation: 'Migrar 30% das chamadas do coach_clareza_v1 para gpt-4o-mini e limitar mensagens no plano gratuito.',
        metrics: {
          current: totalCostToday,
          projected: totalCostToday * 0.7,
          unit: 'USD/dia'
        },
        autoApplicable: true,
        createdAt: new Date().toISOString()
      })
    }

    // Análise de performance
    const degradedAgents = agents.filter(a => a.last_status === 'DEGRADED')
    if (degradedAgents.length > 0) {
      insights.push({
        id: 'perf_degraded_1',
        type: 'PERFORMANCE',
        priority: 'MEDIUM',
        title: 'IAs com性能 degradada',
        description: `${degradedAgents.length} IAs estão com performance degradada, afetando a experiência do usuário.`,
        impact: 'Melhora em 15-25% no tempo de resposta',
        recommendation: 'Ativar backup automático para voice_transcribe_whisper_v1 e investigar causa da latência.',
        metrics: {
          current: degradedAgents.length,
          projected: 0,
          unit: 'IAs degradadas'
        },
        autoApplicable: true,
        createdAt: new Date().toISOString()
      })
    }

    // Violações de escopo
    const agentWithScopeViolation = agents.find(a => 
      a.features && a.scope_declared && 
      a.features.length > a.scope_declared.length
    )
    if (agentWithScopeViolation) {
      insights.push({
        id: 'scope_violation_1',
        type: 'SCOPE_VIOLATION',
        priority: 'MEDIUM',
        title: 'Uso de IA fora do escopo declarado',
        description: `${agentWithScopeViolation.display_name} está sendo usada em funções não autorizadas.`,
        impact: 'Redução de risco e melhor controle de custos',
        recommendation: 'Revisar e atualizar escopo declarado ou restringir acesso não autorizado.',
        metrics: {
          current: agentWithScopeViolation.features.length,
          projected: agentWithScopeViolation.scope_declared.length,
          unit: 'features ativas'
        },
        autoApplicable: false,
        agentId: agentWithScopeViolation.id,
        createdAt: new Date().toISOString()
      })
    }

    // Eficiência
    const activeAgents = agents.filter(a => a.active)
    const totalAgents = agents.length
    if (activeAgents.length < totalAgents * 0.7) {
      insights.push({
        id: 'efficiency_low_1',
        type: 'EFFICIENCY',
        priority: 'LOW',
        title: 'Baixa utilização de IAs cadastradas',
        description: `Apenas ${activeAgents.length} de ${totalAgents} IAs estão ativas.`,
        impact: 'Otimização de recursos e redução de complexidade',
        recommendation: 'Considere desativar IAs não utilizadas ou realocar recursos.',
        metrics: {
          current: activeAgents.length,
          projected: Math.floor(totalAgents * 0.8),
          unit: 'IAs ativas'
        },
        autoApplicable: false,
        createdAt: new Date().toISOString()
      })
    }

    return insights.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'COST_OPTIMIZATION': return <DollarSign className="h-4 w-4" />
      case 'PERFORMANCE': return <Activity className="h-4 w-4" />
      case 'SCOPE_VIOLATION': return <AlertTriangle className="h-4 w-4" />
      case 'RISK_ALERT': return <Target className="h-4 w-4" />
      case 'EFFICIENCY': return <BarChart3 className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const insights = generateInsights()

  // Análise geral
  const getSystemAnalysis = () => {
    const healthyAgents = agents.filter(a => a.last_status === 'HEALTHY').length
    const totalCost = metrics.reduce((sum, m) => sum + (m.cost_estimated_usd || 0), 0)
    const totalCalls = metrics.reduce((sum, m) => sum + (m.calls_total || 0), 0)
    const avgLatency = metrics.reduce((sum, m) => sum + (m.avg_latency_ms || 0), 0) / metrics.length || 0

    return {
      healthScore: (healthyAgents / agents.length) * 100,
      costEfficiency: totalCost > 0 ? Math.min(100, (50 / totalCost) * 100) : 100,
      performanceScore: avgLatency > 0 ? Math.max(0, 100 - (avgLatency / 20)) : 100,
      utilizationRate: (totalCalls / 1000) * 100 // Simplificado
    }
  }

  const analysis = getSystemAnalysis()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-400">IA Guardiã de Operações</h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
          <Activity className="h-3 w-3" />
          <span>Analizando em tempo real</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-3 py-2 text-sm transition-colors border-b-2 ${
            activeTab === 'insights'
              ? 'text-purple-400 border-purple-500'
              : 'text-slate-500 border-transparent hover:text-slate-400'
          }`}
        >
          Insights ({insights.length})
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3 py-2 text-sm transition-colors border-b-2 ${
            activeTab === 'analysis'
              ? 'text-purple-400 border-purple-500'
              : 'text-slate-500 border-transparent hover:text-slate-400'
          }`}
        >
          Análise
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-3 py-2 text-sm transition-colors border-b-2 ${
            activeTab === 'predictions'
              ? 'text-purple-400 border-purple-500'
              : 'text-slate-500 border-transparent hover:text-slate-400'
          }`}
        >
          Previsões
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'insights' && (
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map(insight => (
              <div key={insight.id} className={`rounded-lg p-4 border ${getPriorityColor(insight.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-medium text-sm">{insight.title}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">{insight.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Impacto</div>
                    <div className="text-sm text-slate-200">{insight.impact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Métricas</div>
                    <div className="text-sm">
                      <span className="text-slate-200">{insight.metrics.current}</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-green-400">{insight.metrics.projected}</span>
                      <span className="text-slate-500 text-xs"> {insight.metrics.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded p-2 mb-3">
                  <div className="text-xs text-slate-500 mb-1">Recomendação</div>
                  <div className="text-sm text-slate-300">{insight.recommendation}</div>
                </div>

                <div className="flex gap-2">
                  {insight.autoApplicable && (
                    <button
                      onClick={() => onApplySuggestion(insight.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                    >
                      <Zap className="h-3 w-3 inline mr-1" />
                      Aplicar Automaticamente
                    </button>
                  )}
                  <button
                    onClick={() => onDismissSuggestion(insight.id)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Nenhum insight no momento</div>
              <div className="text-xs mt-1">Sistema operando normalmente</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Saúde do Sistema</span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">{analysis.healthScore.toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${analysis.healthScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Eficiência de Custos</span>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">{analysis.costEfficiency.toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${analysis.costEfficiency}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Performance</span>
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{analysis.performanceScore.toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${analysis.performanceScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Taxa de Utilização</span>
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{analysis.utilizationRate.toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${analysis.utilizationRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Análise Detalhada</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div>• {agents.filter(a => a.last_status === 'HEALTHY').length} IAs saudáveis de {agents.length} totais</div>
              <div>• Custo médio por IA: ${(metrics.reduce((sum, m) => sum + (m.cost_estimated_usd || 0), 0) / agents.length).toFixed(2)}/dia</div>
              <div>• Latência média: {(metrics.reduce((sum, m) => sum + (m.avg_latency_ms || 0), 0) / metrics.length || 0).toFixed(0)}ms</div>
              <div>• Taxa de erro geral: {((metrics.reduce((sum, m) => sum + (m.calls_error || 0), 0) / metrics.reduce((sum, m) => sum + (m.calls_total || 0), 1)) * 100).toFixed(2)}%</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Previsões para Próximos 7 Dias</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Custo Projetado</span>
                <span className="text-sm font-medium text-yellow-400">$65.40 ±$12.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Volume de Chamadas</span>
                <span className="text-sm font-medium text-blue-400">12,450 ±2,100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Risco de Incidentes</span>
                <span className="text-sm font-medium text-orange-400">Médio (23%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Necessidade de Scale</span>
                <span className="text-sm font-medium text-green-400">Baixa</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Recomendações Proativas</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div>• Considere upgrade do plano OpenAI na quinta-feira (pico previsto)</div>
              <div>• Programe manutenção do voice_transcribe para domingo</div>
              <div>• Monitore coach_clareza_v1 - proximidade do limite de taxa</div>
              <div>• Oportunidade: testar novo modelo Claude 3.5 na próxima semana</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
