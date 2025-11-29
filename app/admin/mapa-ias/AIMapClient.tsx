"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Bot, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Zap,
  Globe,
  Database,
  BarChart3,
  Eye,
  Settings,
  Power,
  PowerOff,
  TrendingUp,
  TrendingDown,
  Filter,
  Layers,
  TreePine,
  Grid
} from 'lucide-react'
import AITreeView from '@/components/AITreeView'
import AIMetricsCharts from '@/components/AIMetricsCharts'
import AIBackupManager from '@/components/AIBackupManager'
import AIGuardian from '@/components/AIGuardian'
import AILayerView from '@/components/AILayerView'
import AIAdminFeaturesMap, { AIAdminFeaturesCompact } from '@/components/AIAdminFeaturesMap'

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

interface MapData {
  agents: Agent[]
  metrics: any[]
  incidents: any[]
  suggestions: any[]
  summary: any
}

export default function AIMapClient({ initialData }: { initialData: MapData }) {
  const [data, setData] = useState<MapData>(initialData)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'layers' | 'grid'>('tree')
  const [filterLayer, setFilterLayer] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [useMockMode, setUseMockMode] = useState(false)
  const [currentMode, setCurrentMode] = useState<'real' | 'mock' | 'real_empty'>('real')
  const [selectedLayer, setSelectedLayer] = useState<string>('frontend')
  const [rightPanelTab, setRightPanelTab] = useState<'control' | 'guardian' | 'backup' | 'admin-features'>('control')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-500 bg-green-500/10'
      case 'DEGRADED': return 'text-yellow-500 bg-yellow-500/10'
      case 'PARTIAL': return 'text-orange-500 bg-orange-500/10'
      case 'DOWN': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4" />
      case 'DEGRADED': return <AlertTriangle className="h-4 w-4" />
      case 'PARTIAL': return <Clock className="h-4 w-4" />
      case 'DOWN': return <XCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'produto': return <Bot className="h-4 w-4" />
      case 'meta': return <Eye className="h-4 w-4" />
      case 'infra': return <Database className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const filteredAgents = data.agents.filter(agent => {
    const layerMatch = filterLayer === 'all' || agent.layer === filterLayer
    const statusMatch = filterStatus === 'all' || agent.last_status === filterStatus
    return layerMatch && statusMatch
  })

  const toggleMockMode = async () => {
    setLoading(true)
    try {
      const newMode = !useMockMode
      const url = `/api/admin/ai-map${newMode ? '?mock=true' : ''}`

      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(url, { headers })
      const result = await response.json()

      if (result.success && result.data) {
        const newData: MapData = {
          agents: result.data.agents || [],
          metrics: result.data.metrics || [],
          incidents: result.data.incidents || [],
          suggestions: result.data.suggestions || [],
          summary: result.summary || data.summary
        }

        setData(newData)
        setCurrentMode(result.mode || (newMode ? 'mock' : 'real'))
        setUseMockMode(newMode)
      }
    } catch (error) {
      console.error('Erro ao alternar modo:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAgent = async (agentId: string, active: boolean) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/admin/ai-map', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'toggle_agent',
          agent_id: agentId,
          data: { active }
        })
      })
      
      if (response.ok) {
        setData(prev => ({
          ...prev,
          agents: prev.agents.map(a => 
            a.id === agentId ? { ...a, active } : a
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao alternar IA:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchPrimary = async (roleId: string, newPrimaryId: string) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/admin/ai-map', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'switch_primary',
          role: roleId,
          agent_id: newPrimaryId
        })
      })
      
      if (response.ok) {
        // Atualizar prioridades no estado local
        setData(prev => ({
          ...prev,
          agents: prev.agents.map(a => {
            if (a.role === roleId) {
              if (a.id === newPrimaryId) return { ...a, priority: 1 }
              if (a.priority === 1) return { ...a, priority: 2 }
            }
            return a
          })
        }))
      }
    } catch (error) {
      console.error('Erro ao trocar primária:', error)
    } finally {
      setLoading(false)
    }
  }

  const applySuggestion = async (suggestionId: string) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/admin/ai-map', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'apply_suggestion',
          suggestion_id: suggestionId
        })
      })
      
      if (response.ok) {
        // Remover sugestão aplicada
        setData(prev => ({
          ...prev,
          suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
        }))
      }
    } catch (error) {
      console.error('Erro ao aplicar sugestão:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissSuggestion = async (suggestionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      await fetch('/api/admin/ai-map', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'dismiss_suggestion',
          suggestion_id: suggestionId
        })
      })
      
      setData(prev => ({
        ...prev,
        suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
      }))
    } catch (error) {
      console.error('Erro ao ignorar sugestão:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-purple-400" />
              <h1 className="text-2xl font-bold">Mapa das IAs</h1>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                currentMode === 'mock' ? 'bg-orange-500/20 text-orange-400' :
                currentMode === 'real_empty' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {currentMode === 'mock' ? '🔧 MODO MOCK' :
                 currentMode === 'real_empty' ? '⚠️ SEM DADOS' :
                 '📊 MODO REAL'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMockMode}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  useMockMode 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {useMockMode ? (
                  <><Zap className="h-4 w-4 inline mr-1" /> Modo Mock</>
                ) : (
                  <><Database className="h-4 w-4 inline mr-1" /> Modo Real</>
                )}
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'tree' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <TreePine className="h-4 w-4 inline mr-1" />
                Árvore
              </button>
              <button
                onClick={() => setViewMode('layers')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'layers' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Layers className="h-4 w-4 inline mr-1" />
                Camadas
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Grid className="h-4 w-4 inline mr-1" />
                Grid
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-purple-400">{data.summary.total_agents}</div>
              <div className="text-xs text-slate-400">Total IAs</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-green-400">{data.summary.active_agents}</div>
              <div className="text-xs text-slate-400">Ativas</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-green-400">{data.summary.healthy_agents}</div>
              <div className="text-xs text-slate-400">Saudáveis</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-yellow-400">{data.summary.degraded_agents}</div>
              <div className="text-xs text-slate-400">Degradadas</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-red-400">{data.summary.down_agents}</div>
              <div className="text-xs text-slate-400">Fora</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">${data.summary.total_cost_today.toFixed(2)}</div>
              <div className="text-xs text-slate-400">Custo Hoje</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-orange-400">{data.summary.scope_violations}</div>
              <div className="text-xs text-slate-400">Viol. Escopo</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-2xl font-bold text-red-400">{data.summary.open_incidents}</div>
              <div className="text-xs text-slate-400">Incidentes</div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterLayer}
            onChange={(e) => setFilterLayer(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
          >
            <option value="all">Todas Camadas</option>
            <option value="produto">Produto</option>
            <option value="meta">Meta</option>
            <option value="infra">Infra</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
          >
            <option value="all">Todos Status</option>
            <option value="HEALTHY">🟢 Saudável</option>
            <option value="DEGRADED">🟡 Degradado</option>
            <option value="PARTIAL">🟠 Parcial</option>
            <option value="DOWN">🔴 Fora</option>
          </select>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Column - Dynamic Content */}
        <div className="w-80 border-r border-slate-800 overflow-y-auto">
          {viewMode === 'tree' ? (
            <AITreeView 
              agents={filteredAgents}
              selectedAgent={selectedAgent}
              onAgentSelect={setSelectedAgent}
            />
          ) : viewMode === 'layers' ? (
            <AILayerView 
              agents={filteredAgents}
              selectedLayer={selectedLayer}
              onLayerSelect={setSelectedLayer}
              selectedAgent={selectedAgent}
              onAgentSelect={setSelectedAgent}
            />
          ) : (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">IAs ({filteredAgents.length})</h3>
              <div className="space-y-2">
                {filteredAgents.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAgent?.id === agent.id
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getLayerIcon(agent.layer)}
                        <span className="font-medium text-sm">{agent.display_name}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(agent.last_status)}`}>
                        {getStatusIcon(agent.last_status)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>{agent.provider} • {agent.model}</div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          agent.layer === 'produto' ? 'bg-blue-500/20 text-blue-400' :
                          agent.layer === 'meta' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {agent.layer}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                          P{agent.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Agent Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedAgent ? (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedAgent.display_name}</h2>
                  <button
                    onClick={() => toggleAgent(selectedAgent.id, !selectedAgent.active)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedAgent.active
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {selectedAgent.active ? (
                      <><Power className="h-4 w-4 inline mr-1" /> Ativa</>
                    ) : (
                      <><PowerOff className="h-4 w-4 inline mr-1" /> Inativa</>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Função</div>
                    <div className="font-medium">{selectedAgent.role}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Endpoint</div>
                    <div className="font-mono text-xs">{selectedAgent.endpoint}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Status e Saúde</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(selectedAgent.last_status)}`}>
                    {getStatusIcon(selectedAgent.last_status)}
                    <span className="font-medium">{selectedAgent.last_status}</span>
                  </div>
                  {selectedAgent.last_status_reason && (
                    <div className="mt-2 text-sm text-slate-400">
                      {selectedAgent.last_status_reason}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Features</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Declaradas:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent.scope_declared.map(feature => (
                          <span key={feature} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Em uso:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent.features.map(feature => (
                          <span key={feature} className={`px-2 py-1 rounded text-xs ${
                            selectedAgent.scope_declared.includes(feature)
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {feature}
                            {!selectedAgent.scope_declared.includes(feature) && ' ⚠️'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Métricas (Hoje)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="text-lg font-bold text-blue-400">
                        {data.metrics.find(m => m.agent_id === selectedAgent.id)?.calls_total || 0}
                      </div>
                      <div className="text-xs text-slate-400">Chamadas</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="text-lg font-bold text-green-400">
                        {(data.metrics.find(m => m.agent_id === selectedAgent.id)?.avg_latency_ms || 0) / 1000}s
                      </div>
                      <div className="text-xs text-slate-400">Latência</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="text-lg font-bold text-yellow-400">
                        ${data.metrics.find(m => m.agent_id === selectedAgent.id)?.cost_estimated_usd || 0}
                      </div>
                      <div className="text-xs text-slate-400">Custo</div>
                    </div>
                  </div>
                </div>

                {/* Gráficos Temporais */}
                <div className="mt-6">
                  <AIMetricsCharts 
                    agentId={selectedAgent.id}
                    metrics={data.metrics.filter(m => m.agent_id === selectedAgent.id)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <div>Selecione uma IA para ver detalhes</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Dynamic Tabs */}
        <div className="w-80 border-l border-slate-800 overflow-y-auto">
          <div className="p-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b border-slate-700">
              <button
                onClick={() => setRightPanelTab('control')}
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  rightPanelTab === 'control'
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-500 border-transparent hover:text-slate-400'
                }`}
              >
                Controle
              </button>
              <button
                onClick={() => setRightPanelTab('guardian')}
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  rightPanelTab === 'guardian'
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-500 border-transparent hover:text-slate-400'
                }`}
              >
                IA Guardiã
              </button>
              <button
                onClick={() => setRightPanelTab('backup')}
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  rightPanelTab === 'backup'
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-500 border-transparent hover:text-slate-400'
                }`}
              >
                Backup
              </button>
              <button
                onClick={() => setRightPanelTab('admin-features')}
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  rightPanelTab === 'admin-features'
                    ? 'text-purple-400 border-purple-500'
                    : 'text-slate-500 border-transparent hover:text-slate-400'
                }`}
              >
                Admin Features
              </button>
            </div>

            {/* Tab Content */}
            {rightPanelTab === 'control' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Sugestões da IA Guardiã</h3>
                  <div className="space-y-3">
                    {data.suggestions.map(suggestion => (
                      <div key={suggestion.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`px-2 py-0.5 rounded text-xs ${
                            suggestion.type === 'SCOPE_VIOLATION' ? 'bg-orange-500/20 text-orange-400' :
                            suggestion.type === 'COST_OPTIMIZATION' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {suggestion.type.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-sm text-slate-300 mb-3">{suggestion.suggestion}</div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => applySuggestion(suggestion.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                          >
                            Aplicar
                          </button>
                          <button 
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs"
                          >
                            Ignorar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Incidentes Recentes</h3>
                  <div className="space-y-3">
                    {data.incidents.map(incident => (
                      <div key={incident.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{incident.agent_id}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(incident.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {incident.old_status} → {incident.new_status}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{incident.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightPanelTab === 'guardian' && (
              <AIGuardian 
                agents={data.agents}
                metrics={data.metrics}
                incidents={data.incidents}
                onApplySuggestion={applySuggestion}
                onDismissSuggestion={dismissSuggestion}
              />
            )}

            {rightPanelTab === 'backup' && (
              <AIBackupManager 
                agents={data.agents}
                onSwitchPrimary={switchPrimary}
                onToggleAutoFailover={(roleId, enabled) => {
                  // Implementar toggle auto failover
                  console.log(`Toggle auto failover for ${roleId}: ${enabled}`)
                }}
                onToggleAgent={toggleAgent}
              />
            )}

            {rightPanelTab === 'admin-features' && (
              <AIAdminFeaturesMap 
                aiId={selectedAgent?.id}
                aiName={selectedAgent?.display_name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
