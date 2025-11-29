'use client'

import { useState } from 'react'
import { 
  Monitor, 
  Layout, 
  Server, 
  Clock, 
  Database, 
  BarChart3, 
  Globe,
  Code,
  Cpu,
  HardDrive,
  Eye,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react'

interface Agent {
  id: string
  display_name: string
  role: string
  layer: string
  provider: string
  model: string
  endpoint: string
  active: boolean
  priority: number
  features: string[]
  scope_declared: string[]
  last_status: 'HEALTHY' | 'DEGRADED' | 'PARTIAL' | 'DOWN'
  last_status_reason: string | null
  last_heartbeat_at: string
}

interface SystemLayer {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  agents: Agent[]
  components: {
    name: string
    description: string
    pages: string[]
    files: string[]
  }[]
}

interface AILayerViewProps {
  agents: Agent[]
  selectedLayer: string
  onLayerSelect: (layerId: string) => void
  selectedAgent: Agent | null
  onAgentSelect: (agent: Agent) => void
}

export default function AILayerView({ 
  agents, 
  selectedLayer, 
  onLayerSelect, 
  selectedAgent, 
  onAgentSelect 
}: AILayerViewProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())

  // Definir camadas do sistema
  const systemLayers: SystemLayer[] = [
    {
      id: 'frontend',
      name: 'Front-end (UI + Componentes)',
      description: 'IAs que atuam diretamente na interface do usuário',
      icon: Monitor,
      color: 'blue',
      agents: agents.filter(a => a.features.some(f => 
        f.includes('chat') || f.includes('ui') || f.includes('front')
      )),
      components: [
        {
          name: 'Chat Interface',
          description: 'Gera respostas e sugestões em tempo real',
          pages: ['/app/chat'],
          files: ['ChatPanel.tsx', 'MessageList.tsx', 'MessageComposer.tsx']
        },
        {
          name: 'Dashboard Principal',
          description: 'Personaliza conteúdo baseado no usuário',
          pages: ['/app'],
          files: ['Dashboard.tsx', 'UserStats.tsx', 'ResumoSemanal.tsx']
        },
        {
          name: 'Diário de Episódios',
          description: 'Sugere títulos e insights',
          pages: ['/app/diario'],
          files: ['DiarioForm.tsx', 'EpisodioCard.tsx']
        }
      ]
    },
    {
      id: 'dashboard',
      name: 'Dashboard (Visão do Usuário)',
      description: 'IAs que moldam a experiência contínua do usuário',
      icon: Layout,
      color: 'purple',
      agents: agents.filter(a => a.features.some(f => 
        f.includes('dashboard') || f.includes('resumo') || f.includes('analytics')
      )),
      components: [
        {
          name: 'Resumo Semanal',
          description: 'Análise de padrões emocionais',
          pages: ['/app'],
          files: ['WeeklySummary.tsx', 'EmotionChart.tsx']
        },
        {
          name: 'Alertas de Risco',
          description: 'Detecção de linguagem de crise',
          pages: ['/app', '/app/chat', '/app/diario'],
          files: ['RiskAlert.tsx', 'CrisisDetection.tsx']
        },
        {
          name: 'Métricas Pessoais',
          description: 'Evolução e insights do usuário',
          pages: ['/app/metrics'],
          files: ['PersonalMetrics.tsx', 'ProgressChart.tsx']
        }
      ]
    },
    {
      id: 'backend',
      name: 'Backend / APIs',
      description: 'IAs que processam dados no servidor',
      icon: Server,
      color: 'green',
      agents: agents.filter(a => a.endpoint && a.endpoint.includes('/api')),
      components: [
        {
          name: 'API de Chat',
          description: 'Processamento principal de conversas',
          pages: [],
          files: ['/api/ai/chat/route.ts', '/api/ai/chat/meta/route.ts']
        },
        {
          name: 'Transcrição de Áudio',
          description: 'Conversão de voz para texto',
          pages: [],
          files: ['/api/voice/transcribe/route.ts']
        },
        {
          name: 'Análise de Conteúdo',
          description: 'Processamento de texto e insights',
          pages: [],
          files: ['/api/ai/analyze/route.ts', '/api/ai/insights/route.ts']
        }
      ]
    },
    {
      id: 'background',
      name: 'Background Jobs',
      description: 'IAs que executam tarefas agendadas',
      icon: Clock,
      color: 'orange',
      agents: agents.filter(a => a.role.includes('CRON') || a.role.includes('JOB')),
      components: [
        {
          name: 'Agregação Diária',
          description: 'Consolida métricas do dia',
          pages: [],
          files: ['jobs/daily-aggregation.ts', 'jobs/emotion-summary.ts']
        },
        {
          name: 'Análise SEO',
          description: 'Gera sugestões de conteúdo',
          pages: [],
          files: ['jobs/seo-analysis.ts', 'jobs/content-suggestions.ts']
        },
        {
          name: 'Limpeza de Dados',
          description: 'Manutenção e otimização',
          pages: [],
          files: ['jobs/data-cleanup.ts', 'jobs/optimize-storage.ts']
        }
      ]
    },
    {
      id: 'database',
      name: 'Banco de Dados',
      description: 'IAs que interagem diretamente com o banco',
      icon: Database,
      color: 'red',
      agents: agents.filter(a => a.features.some(f => 
        f.includes('database') || f.includes('storage') || f.includes('persist')
      )),
      components: [
        {
          name: 'Leitura de Dados',
          description: 'Consulta informações do usuário',
          pages: [],
          files: ['journal_entries', 'user_profiles', 'clarity_tests']
        },
        {
          name: 'Escrita de Métricas',
          description: 'Grava análises e insights',
          pages: [],
          files: ['ai_events', 'daily_metrics', 'ai_suggestions']
        },
        {
          name: 'Cache e Otimização',
          description: 'Gerencia performance de queries',
          pages: [],
          files: ['redis_cache', 'query_optimization', 'index_suggestions']
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics / SEO / Conteúdo',
      description: 'IAs que analisam padrões e otimizam conteúdo',
      icon: BarChart3,
      color: 'indigo',
      agents: agents.filter(a => a.role.includes('ANALYTICS') || a.role.includes('SEO')),
      components: [
        {
          name: 'Análise de UX',
          description: 'Monitora comportamento do usuário',
          pages: ['/'],
          files: ['click_events', 'scroll_depth', 'form_abandonment']
        },
        {
          name: 'SEO e Conteúdo',
          description: 'Otimiza para buscadores',
          pages: ['/blog', '/articles'],
          files: ['page_analytics', 'search_terms', 'traffic_sources']
        },
        {
          name: 'Métricas de Negócio',
          description: 'KPIs e conversões',
          pages: ['/admin/analytics'],
          files: ['conversion_rates', 'user_retention', 'revenue_metrics']
        }
      ]
    }
  ]

  const toggleLayer = (layerId: string) => {
    setExpandedLayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(layerId)) {
        newSet.delete(layerId)
      } else {
        newSet.add(layerId)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-500 bg-green-500/10'
      case 'DEGRADED': return 'text-yellow-500 bg-yellow-500/10'
      case 'PARTIAL': return 'text-orange-500 bg-orange-500/10'
      case 'DOWN': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getLayerColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    }
    return colors[color] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getComponentIcon = (componentName: string) => {
    if (componentName.includes('Chat')) return MessageSquare
    if (componentName.includes('Dashboard') || componentName.includes('Resumo')) return Eye
    if (componentName.includes('API')) return Code
    if (componentName.includes('Job')) return Clock
    if (componentName.includes('Database') || componentName.includes('Dados')) return HardDrive
    if (componentName.includes('Analytics') || componentName.includes('SEO')) return BarChart3
    return FileText
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-400">Mapa por Camadas do Sistema</h3>
        </div>
        <div className="text-xs text-slate-500">
          {agents.filter(a => a.active).length} IAs ativas em {systemLayers.length} camadas
        </div>
      </div>

      {/* Lista de Camadas */}
      <div className="space-y-3">
        {systemLayers.map(layer => {
          const isExpanded = expandedLayers.has(layer.id)
          const isActive = selectedLayer === layer.id
          const Icon = layer.icon

          return (
            <div key={layer.id} className="border border-slate-700 rounded-lg overflow-hidden">
              {/* Header da Camada */}
              <div
                className={`p-4 cursor-pointer transition-colors ${
                  isActive ? 'bg-purple-600/10' : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
                onClick={() => onLayerSelect(layer.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 text-${layer.color}-400`} />
                    <div>
                      <div className="font-medium text-slate-200">{layer.name}</div>
                      <div className="text-xs text-slate-500">{layer.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs ${getLayerColor(layer.color)}`}>
                      {layer.agents.length} IAs
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLayer(layer.id)
                      }}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="border-t border-slate-700 p-4 space-y-4">
                  {/* IAs nesta camada */}
                  {layer.agents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3">IAs Atuando nesta Camada</h4>
                      <div className="space-y-2">
                        {layer.agents.map(agent => (
                          <div
                            key={agent.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedAgent?.id === agent.id
                                ? 'bg-purple-600/20 border-purple-500'
                                : 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
                            }`}
                            onClick={() => onAgentSelect(agent)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-slate-400" />
                                <div>
                                  <div className="text-sm font-medium text-slate-200">{agent.display_name}</div>
                                  <div className="text-xs text-slate-500">{agent.provider} • {agent.model}</div>
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(agent.last_status)}`}>
                                {agent.last_status}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-xs text-slate-400">
                              <div>Endpoint: {agent.endpoint}</div>
                              <div>Features: {agent.features.join(', ')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Componentes da camada */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Componentes e Locais de Atuação</h4>
                    <div className="space-y-3">
                      {layer.components.map((component, index) => {
                        const ComponentIcon = getComponentIcon(component.name)
                        return (
                          <div key={index} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <div className="flex items-start gap-3">
                              <ComponentIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-200 mb-1">{component.name}</div>
                                <div className="text-xs text-slate-400 mb-2">{component.description}</div>
                                
                                {component.pages.length > 0 && (
                                  <div className="mb-2">
                                    <div className="text-xs text-slate-500 mb-1">Páginas:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {component.pages.map(page => (
                                        <span key={page} className="px-1.5 py-0.5 bg-slate-800 rounded text-xs text-slate-300">
                                          {page}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {component.files.length > 0 && (
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Arquivos:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {component.files.map(file => (
                                        <span key={file} className="px-1.5 py-0.5 bg-slate-800 rounded text-xs text-slate-300 font-mono">
                                          {file}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Alertas da camada */}
                  {layer.agents.some(a => a.last_status !== 'HEALTHY') && (
                    <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">
                          {layer.agents.filter(a => a.last_status !== 'HEALTHY').length} IAs nesta camada precisam de atenção
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
