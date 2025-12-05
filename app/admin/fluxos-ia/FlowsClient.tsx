'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Activity,
  Settings,
  Zap,
  Eye,
  EyeOff,
  Copy,
  FileText,
  Layers
} from 'lucide-react'

interface Flow {
  id: string
  name: string
  description: string | null
  is_active: boolean
  mode_default: string
  created_by: string | null
  created_at: string
  updated_at: string
  review_status?: 'draft' | 'in_validation' | 'approved' | 'rejected'
  validation_window_days?: number | null
  validation_started_at?: string | null
  validation_ends_at?: string | null
  simulation_only?: boolean
}

interface FlowTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  is_official: boolean
  definition: any
  created_at: string
}

interface FlowAnalytics {
  flow_id: string
  total_runs: number
  success_runs: number
  error_runs: number
  running_runs: number
  last_run_at: string | null
  avg_duration_ms: number | null
}

interface FlowSuggestion {
  flow_id: string
  flow_name: string
  type: 'NO_RUNS' | 'HIGH_ERROR_RATE' | 'SLOW_FLOW'
  message: string
}

interface FlowsClientProps {
  initialFlows: Flow[]
}

export default function FlowsClient({ initialFlows }: FlowsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [flows, setFlows] = useState<Flow[]>(initialFlows)
  const [loading, setLoading] = useState(false)
  const [showMock, setShowMock] = useState(false)
  const [analytics, setAnalytics] = useState<FlowAnalytics[]>([])
  const [suggestions, setSuggestions] = useState<FlowSuggestion[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [activeTab, setActiveTab] = useState<'flows' | 'templates'>('flows')
  const [templates, setTemplates] = useState<FlowTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const loadFlows = async (useMock = false) => {
    setLoading(true)
    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/admin/ai-flows${useMock ? '?mock=true' : ''}`, {
        headers
      })
      const data = await response.json()
      
      if (data.success) {
        setFlows(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFlow = async () => {
    const name = prompt('Nome do novo fluxo:')
    if (!name) return

    try {
      // Obter token de autenticação
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Sessão obtida:', session ? 'SIM' : 'NÃO', sessionError)
      
      if (!session?.access_token) {
        alert('Você precisa estar logado para criar fluxos. Faça login novamente.')
        window.location.href = '/login'
        return
      }
      
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/admin/ai-flows', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          name,
          description: '',
          mode_default: 'simulation'
        })
      })

      const data = await response.json()
      console.log('Resposta da API:', response.status, data)
      
      if (response.ok && data.success) {
        router.push(`/admin/fluxos-ia/${data.data.id}`)
      } else {
        console.error('Erro da API ao criar fluxo:', data)
        alert(`Erro ao criar fluxo: ${data.error || 'Verifique se você está logado como admin e se as tabelas existem no banco.'}`)
      }
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
      alert('Erro inesperado ao criar fluxo. Veja o console (F12) para mais detalhes.')
    }
  }

  const toggleFlow = async (flowId: string, isActive: boolean) => {
    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/admin/ai-flows/${flowId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_active: !isActive })
      })

      if (response.ok) {
        loadFlows(showMock)
      }
    } catch (error) {
      console.error('Erro ao atualizar fluxo:', error)
    }
  }

  const deleteFlow = async (flowId: string) => {
    if (!confirm('Tem certeza que deseja remover este fluxo?')) return

    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {}
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/admin/ai-flows/${flowId}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        loadFlows(showMock)
      }
    } catch (error) {
      console.error('Erro ao remover fluxo:', error)
    }
  }

  const duplicateFlow = async (flowId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/admin/ai-flows/${flowId}/duplicate`, {
        method: 'POST',
        headers
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        alert(data.error || 'Erro ao duplicar fluxo')
        return
      }

      // Ir direto para o builder do fluxo duplicado
      router.push(`/admin/fluxos-ia/${data.data.id}`)
    } catch (error) {
      console.error('Erro ao duplicar fluxo:', error)
      alert('Erro ao duplicar fluxo')
    }
  }

  const updateFlowReview = async (flowId: string, review_status: string, validation_window_days?: number | null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const body: any = { review_status }
      if (validation_window_days !== undefined) body.validation_window_days = validation_window_days

      const response = await fetch(`/api/admin/ai-flows/${flowId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      })

      if (response.ok) {
        loadFlows(showMock)
      }
    } catch (error) {
      console.error('Erro ao atualizar status de revisão:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusBadge = (isActive: boolean, mode: string) => {
    if (!isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inativo</span>
    }
    
    const modeColors = {
      simulation: 'bg-blue-100 text-blue-700',
      real: 'bg-green-100 text-green-700'
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${modeColors[mode as keyof typeof modeColors]}`}>
        {mode === 'simulation' ? 'Simulação' : 'Real'}
      </span>
    )
  }

  const getReviewBadge = (review_status?: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      in_validation: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    const labels = {
      draft: 'Rascunho',
      in_validation: 'Em Validação',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    }
    if (!review_status) return null
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[review_status as keyof typeof colors]}`}>
        {labels[review_status as keyof typeof labels]}
      </span>
    )
  }

  const getFlowAnalytics = (flowId: string) => {
    return analytics.find(a => a.flow_id === flowId) || null
  }

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoadingAnalytics(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const headers: { [key: string]: string } = {}

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch('/api/admin/ai-flows/analytics', {
          headers
        })

        const data = await response.json()
        if (response.ok && data.success) {
          setAnalytics(data.analytics || [])
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Erro ao carregar analytics de fluxos:', error)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    loadAnalytics()
  }, [flows])

  // Carregar templates
  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const headers: { [key: string]: string } = {}

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch('/api/admin/ai-flows/templates', {
          headers
        })

        const data = await response.json()
        if (response.ok && data.success) {
          setTemplates(data.templates || [])
        }
      } catch (error) {
        console.error('Erro ao carregar templates:', error)
      } finally {
        setLoadingTemplates(false)
      }
    }

    if (activeTab === 'templates') {
      loadTemplates()
    }
  }, [activeTab])

  // Criar fluxo a partir de template
  const createFlowFromTemplate = async (templateId: string, templateName: string) => {
    const flowName = prompt(`Nome do novo fluxo baseado em "${templateName}":`)
    if (!flowName) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/admin/ai-flows/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          templateId,
          flowName
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert(`Fluxo "${flowName}" criado com sucesso!`)
        router.push(`/admin/fluxos-ia/${data.data.flow.id}`)
      } else {
        alert(data.error || 'Erro ao criar fluxo a partir do template')
      }
    } catch (error) {
      console.error('Erro ao criar fluxo a partir de template:', error)
      alert('Erro ao criar fluxo a partir de template')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orquestrador de Fluxos de IA</h1>
              <p className="text-gray-600">Crie e gerencie fluxos automatizados com as IAs do Radar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle Mock/Real */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
              {showMock ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
              <button
                onClick={() => {
                  setShowMock(!showMock)
                  loadFlows(!showMock)
                }}
                className={`text-sm font-medium ${showMock ? 'text-blue-600' : 'text-gray-600'}`}
              >
                {showMock ? 'Modo Simulação' : 'Modo Real'}
              </button>
            </div>

            {/* Botão Criar */}
            <button
              onClick={createFlow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Fluxo
            </button>
          </div>
        </div>

        {/* Abas: Fluxos e Templates */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('flows')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'flows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Meus Fluxos ({flows.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Templates ({templates.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Cards de Resumo - apenas na aba de fluxos */}
        {activeTab === 'flows' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Fluxos</p>
                  <p className="text-2xl font-bold text-gray-900">{flows.length}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{flows.filter(f => f.is_active).length}</p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Modo Simulação</p>
                <p className="text-2xl font-bold text-blue-600">{flows.filter(f => f.mode_default === 'simulation').length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Modo Real</p>
                <p className="text-2xl font-bold text-orange-600">{flows.filter(f => f.mode_default === 'real').length}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
        )}

      {/* Conteúdo das abas */}
      {activeTab === 'flows' ? (
        /* Lista de Fluxos */
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Fluxos Disponíveis</h2>
          {loadingAnalytics && (
            <p className="mt-1 text-xs text-gray-500">Carregando métricas de execuções...</p>
          )}
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando fluxos...</p>
          </div>
        ) : flows.length === 0 ? (
          <div className="p-8 text-center">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fluxo encontrado</h3>
            <p className="text-gray-600 mb-4">Crie seu primeiro fluxo para começar a orquestrar as IAs do sistema.</p>
            <button
              onClick={createFlow}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Fluxo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Nome</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Revisão</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Janela de Validação</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Em Validação Até</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Métricas</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flows.map((flow) => {
                  const a = getFlowAnalytics(flow.id)
                  const errorRate = a && a.total_runs > 0 ? Math.round((a.error_runs / a.total_runs) * 100) : 0
                  return (
                    <tr key={flow.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{flow.name}</div>
                          <div className="text-xs text-gray-500">
                            Criado em {formatDate(flow.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(flow.is_active, flow.mode_default)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={flow.review_status || 'draft'}
                          onChange={(e) => {
                            const newStatus = e.target.value
                            if (newStatus === 'in_validation' && !flow.validation_window_days) {
                              const days = prompt('Janela de validação em dias (ex: 7):', '7')
                              if (days) {
                                updateFlowReview(flow.id, newStatus, parseInt(days, 10))
                              }
                            } else {
                              updateFlowReview(flow.id, newStatus)
                            }
                          }}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="draft">Rascunho</option>
                          <option value="in_validation">Em Validação</option>
                          <option value="approved">Aprovado</option>
                          <option value="rejected">Rejeitado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {flow.validation_window_days ? `${flow.validation_window_days} dias` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {flow.validation_ends_at ? formatDate(flow.validation_ends_at) : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {a ? (
                          <div className="space-y-1">
                            <div>Execuções: {a.total_runs}</div>
                            <div>Erros: {a.error_runs} ({errorRate}%)</div>
                            {a.avg_duration_ms !== null && (
                              <div>Duração média: {(a.avg_duration_ms / 1000).toFixed(1)}s</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/admin/fluxos-ia/${flow.id}`)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateFlow(flow.id)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Duplicar para teste"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleFlow(flow.id, flow.is_active)}
                            className={`p-1 rounded ${
                              flow.is_active
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={flow.is_active ? 'Desativar' : 'Ativar'}
                          >
                            {flow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteFlow(flow.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        /* Lista de Templates */
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Templates de Fluxos</h2>
            <p className="text-sm text-gray-600 mt-1">Use templates oficiais como ponto de partida para novos fluxos</p>
          </div>
          
          {loadingTemplates ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum template encontrado</p>
              <p className="text-sm text-gray-500 mt-1">Execute a migração SQL para criar templates oficiais</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {templates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        {template.is_official && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            Oficial
                          </span>
                        )}
                        {template.category && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            {template.category}
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Nós: {template.definition?.nodes?.length || 0}</span>
                        <span>Criado: {new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => createFlowFromTemplate(template.id, template.name)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Criar Fluxo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Informações de Ajuda - apenas na aba de fluxos */}
      {activeTab === 'flows' && (
        <>
          {suggestions.length > 0 && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Sugestões sobre fluxos</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                {suggestions.map((s, index) => (
                  <li key={`${s.flow_id}-${s.type}-${index}`}>
                    <span className="font-semibold">{s.flow_name}:</span> {s.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Sobre o Orquestrador de Fluxos</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Modo Simulação:</strong> Teste fluxos sem afetar dados reais. Ideal para desenvolvimento e demonstrações.</li>
                  <li>• <strong>Modo Real:</strong> Executa ações verdadeiras no sistema. Use com cuidado.</li>
                  <li>• <strong>Triggers:</strong> Eventos que iniciam o fluxo (novo diário, mensagem, etc.)</li>
                  <li>• <strong>IAs:</strong> Processamento com as inteligências artificiais do sistema</li>
                  <li>• <strong>Ações:</strong> Resultados finais (atualizar flags, gerar PDFs, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
