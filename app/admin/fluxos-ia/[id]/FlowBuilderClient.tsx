"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/compat"
import {
  Bot,
  Play,
  Save,
  Settings,
  Zap,
  Plus,
  Trash2,
  ArrowRight,
  Circle,
  History,
  Activity,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"

interface FlowData {
  flow: {
    id: string
    name: string
    description: string | null
    is_active: boolean
    mode_default: string
    review_status?: 'draft' | 'in_validation' | 'approved' | 'rejected'
    validation_window_days?: number | null
    validation_started_at?: string | null
    validation_ends_at?: string | null
    simulation_only?: boolean
  } | null
  nodes: any[]
  edges: any[]
  versions: any[]
}

interface FlowSuggestion {
  id: string
  flow_id: string
  type: 'IMPROVEMENT' | 'RISK' | 'NEW_FLOW_IDEA'
  title: string
  description: string
  status: 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'DONE'
  created_at: string
  updated_at: string
}

interface FlowBuilderClientProps {
  flowId: string
  initialData: FlowData
}

type NodeType = "TRIGGER" | "IA" | "ACTION"

interface SimpleNode {
  id: string
  type: NodeType
  subtype: string
  description: string
  x: number
  y: number
}

interface FlowVersion {
  id: string
  version: number
  label: string | null
  is_current: boolean
  stability_status: string | null
  created_at: string
  created_by: string | null
}

interface FlowRunSummary {
  id: string
  mode: "simulation" | "real"
  status: "PENDING" | "RUNNING" | "SUCCESS" | "ERROR"
  started_at: string
  finished_at: string | null
  error_message?: string | null
}

interface FlowRunStats {
  total: number
  success: number
  error: number
  running: number
  last_run_at: string | null
  // Aliases usados no código
  total_runs: number
  success_runs: number
  error_runs: number
  avg_duration_ms?: number
}

interface NodeAnalytics {
  node_id: string
  type: string
  subtype: string
  total_logs: number
  error_logs: number
  warn_logs: number
  info_logs: number
  runs_impacted: number
  last_timestamp: string | null
  error_rate: number
}

export default function FlowBuilderClient({ flowId, initialData }: FlowBuilderClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [flowName, setFlowName] = useState(initialData.flow?.name || "")
  const [flowDescription, setFlowDescription] = useState(initialData.flow?.description || "")
  const [isActive, setIsActive] = useState(initialData.flow?.is_active ?? true)
  const [mode, setMode] = useState<"simulation" | "real">(
    (initialData.flow?.mode_default as "simulation" | "real") || "simulation"
  )

  const [nodes, setNodes] = useState<SimpleNode[]>([])
  const [selectedNode, setSelectedNode] = useState<SimpleNode | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [versions, setVersions] = useState<FlowVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [revertingVersion, setRevertingVersion] = useState<number | null>(null)

  const [runStats, setRunStats] = useState<FlowRunStats | null>(null)
  const [recentRuns, setRecentRuns] = useState<FlowRunSummary[]>([])
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [nodeAnalytics, setNodeAnalytics] = useState<NodeAnalytics[]>([])
  const [loadingNodeAnalytics, setLoadingNodeAnalytics] = useState(false)
  const [suggestions, setSuggestions] = useState<FlowSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Converter dados iniciais em nós simples
  useEffect(() => {
    if (initialData.nodes && initialData.nodes.length > 0) {
      const converted: SimpleNode[] = initialData.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        subtype: node.subtype,
        description: getNodeDescription(node.type, node.subtype),
        x: node.position_x ?? 100,
        y: node.position_y ?? 100
      }))
      setNodes(converted)
    }
  }, [initialData.nodes])

  // Carregar versões
  useEffect(() => {
    const loadVersions = async () => {
      setLoadingVersions(true)
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        }
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`
        }

        const res = await fetch(`/api/admin/ai-flows/${flowId}/versions`, { headers })
        const json = await res.json()

        if (res.ok && json.success) {
          setVersions(json.versions as FlowVersion[])
        } else {
          console.error("Erro ao carregar versões:", json.error || res.statusText)
        }
      } catch (err) {
        console.error("Erro ao carregar versões de fluxo:", err)
      } finally {
        setLoadingVersions(false)
      }
    }

    loadVersions()
  }, [flowId])

  // Carregar métricas de execuções
  useEffect(() => {
    const loadRuns = async () => {
      setLoadingRuns(true)
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        }
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`
        }

        const res = await fetch(`/api/admin/ai-flows/${flowId}/runs?limit=20`, { headers })
        const json = await res.json()

        if (res.ok && json.success) {
          setRunStats(json.stats as FlowRunStats)
          setRecentRuns(json.runs as FlowRunSummary[])
        } else {
          console.error("Erro ao carregar execuções:", json.error || res.statusText)
        }
      } catch (err) {
        console.error("Erro ao carregar execuções do fluxo:", err)
      } finally {
        setLoadingRuns(false)
      }
    }

    loadRuns()
  }, [flowId])

  // Carregar analytics por nó
  useEffect(() => {
    const loadNodeAnalytics = async () => {
      setLoadingNodeAnalytics(true)
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        }
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`
        }

        const res = await fetch(`/api/admin/ai-flows/${flowId}/nodes-analytics`, { headers })
        const json = await res.json()

        if (res.ok && json.success) {
          setNodeAnalytics(json.nodes_analytics as NodeAnalytics[])
        } else {
          console.error("Erro ao carregar analytics por nó:", json.error || res.statusText)
        }
      } catch (err) {
        console.error("Erro ao carregar analytics por nó de fluxo:", err)
      } finally {
        setLoadingNodeAnalytics(false)
      }
    }

    loadNodeAnalytics()
  }, [flowId])

  // Carregar sugestões do fluxo
  useEffect(() => {
    const loadSuggestions = async () => {
      setLoadingSuggestions(true)
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        }
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`
        }

        const res = await fetch(`/api/admin/ai-flows/${flowId}/suggestions`, { headers })
        const json = await res.json()

        if (res.ok && json.success) {
          setSuggestions(json.suggestions as FlowSuggestion[])
        } else {
          console.error("Erro ao carregar sugestões:", json.error || res.statusText)
        }
      } catch (err) {
        console.error("Erro ao carregar sugestões do fluxo:", err)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    loadSuggestions()
  }, [flowId])

  // Criar sugestão mock
  const seedSuggestions = async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const res = await fetch(`/api/admin/ai-flows/${flowId}/suggestions/seed`, {
        method: 'POST',
        headers
      })
      const json = await res.json()

      if (res.ok && json.success) {
        alert('Sugestões mock criadas com sucesso!')
        // Recarregar sugestões
        const suggestionsRes = await fetch(`/api/admin/ai-flows/${flowId}/suggestions`, { headers })
        const suggestionsJson = await suggestionsRes.json()
        if (suggestionsRes.ok && suggestionsJson.success) {
          setSuggestions(suggestionsJson.suggestions as FlowSuggestion[])
        }
      } else {
        alert(json.error || 'Erro ao criar sugestões mock')
      }
    } catch (err) {
      console.error("Erro ao criar sugestões mock:", err)
      alert('Erro ao criar sugestões mock')
    }
  }

  // Atualizar status da sugestão
  const updateSuggestionStatus = async (suggestionId: string, newStatus: string) => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const res = await fetch(`/api/admin/ai-flows/${flowId}/suggestions`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          suggestionId,
          status: newStatus
        })
      })
      const json = await res.json()

      if (res.ok && json.success) {
        // Atualizar localmente
        setSuggestions(prev => prev.map(s => 
          s.id === suggestionId ? { ...s, status: newStatus as any } : s
        ))
      } else {
        alert(json.error || 'Erro ao atualizar sugestão')
      }
    } catch (err) {
      console.error("Erro ao atualizar sugestão:", err)
      alert('Erro ao atualizar sugestão')
    }
  }

  const getNodeDescription = (type: string, subtype: string): string => {
    const descriptions: Record<string, string> = {
      // Triggers
      diario_novo: "Disparado quando usuário cria novo episódio no diário",
      teste_clareza_concluido: "Disparado quando usuário finaliza teste de clareza",
      chat_mensagem_nova: "Disparado quando usuário envia mensagem no chat",
      botao_emergencia: "Disparado quando usuário aciona botão de emergência",
      // IAs
      coach_clareza_v1: "IA principal de chat e orientação",
      guardian_risco_v1: "IA que analisa padrões de risco",
      analise_contexto_diario_v1: "IA que analisa contexto dos episódios",
      gerador_carta_selo_v1: "IA que gera cartas-selo personalizadas",
      // Ações
      atualizar_flags_risco: "Atualiza flags de risco do usuário",
      criar_incidente: "Cria registro de incidente no sistema",
      gerar_carta_selo_pdf: "Gera PDF da carta-selo",
      enviar_notificacao: "Envia notificação para o usuário"
    }
    return descriptions[subtype] || `${type}: ${subtype}`
  }

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "-"
    try {
      return new Date(value).toLocaleString("pt-BR")
    } catch {
      return value
    }
  }

  const saveFlow = async () => {
    setIsSaving(true)
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      // Atualizar dados básicos do fluxo
      await fetch(`/api/admin/ai-flows/${flowId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: flowName,
          description: flowDescription,
          is_active: isActive,
          mode_default: mode
        })
      })

      // Preparar grafo sequencial simples
      const backendNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        subtype: node.subtype,
        ai_agent_id: null,
        position_x: node.x,
        position_y: node.y,
        config: {}
      }))

      const backendEdges = nodes.slice(0, -1).map((node, index) => ({
        source_node_id: node.id,
        target_node_id: nodes[index + 1].id,
        source_handle: "output",
        target_handle: "input"
      }))

      const res = await fetch(`/api/admin/ai-flows/${flowId}/graph`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ nodes: backendNodes, edges: backendEdges })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        alert(json.error || "Erro ao salvar grafo do fluxo")
        return
      }

      alert("Fluxo salvo com sucesso!")

      // Recarregar versões após salvar
      router.refresh()
    } catch (err) {
      console.error("Erro ao salvar fluxo:", err)
      alert("Erro ao salvar fluxo")
    } finally {
      setIsSaving(false)
    }
  }

  const runFlow = async (runMode: "simulation" | "real") => {
    setIsRunning(true)
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const res = await fetch(`/api/admin/ai-flows/${flowId}/run`, {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: runMode, payload: {} })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        alert(json.error || "Erro ao executar fluxo")
        return
      }

      alert(`Fluxo executado com sucesso em modo ${runMode}!`)

      // Atualizar métricas de execução após rodar
      router.refresh()
    } catch (err) {
      console.error("Erro ao executar fluxo:", err)
      alert("Erro ao executar fluxo")
    } finally {
      setIsRunning(false)
    }
  }

  const handleRevertVersion = async (version: number) => {
    if (!confirm(`Tem certeza que deseja reverter o fluxo para a versão v${version}?`)) {
      return
    }

    setRevertingVersion(version)
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const res = await fetch(`/api/admin/ai-flows/${flowId}/versions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "revert", version })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        alert(json.error || "Erro ao reverter versão do fluxo")
        return
      }

      alert(`Fluxo revertido para a versão v${version} com sucesso!`)
      router.refresh()
    } catch (err) {
      console.error("Erro ao reverter versão do fluxo:", err)
      alert("Erro ao reverter versão do fluxo")
    } finally {
      setRevertingVersion(null)
    }
  }

  const addNode = (type: NodeType, subtype: string) => {
    const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `node-${Date.now()}`

    const newNode: SimpleNode = {
      id: newId,
      type,
      subtype,
      description: getNodeDescription(type, subtype),
      x: 100 + nodes.length * 150,
      y: 100
    }
    setNodes([...nodes, newNode])
  }

  const removeSelectedNode = () => {
    if (!selectedNode) return
    setNodes(nodes.filter((n) => n.id !== selectedNode.id))
    setSelectedNode(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              />
              {isActive ? (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  Ativo
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  Inativo
                </span>
              )}
            </div>
            <textarea
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Descrição rápida do objetivo deste fluxo"
              className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>ID: {flowId}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Ativo
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "simulation" | "real")}
              className="px-2 py-1 border rounded text-xs"
            >
              <option value="simulation">Simulação</option>
              <option value="real">Real</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={saveFlow}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Salvando..." : "Salvar Fluxo"}
            </button>
            <button
              onClick={() => runFlow("simulation")}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Testar (Simulação)
            </button>
            <button
              onClick={() => runFlow("real")}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Executar (Real)
            </button>
          </div>
        </div>
      </div>

      {/* Banner de contexto: status de revisão e janela de validação */}
      {initialData.flow && (
        <div className="mb-6 bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Status de Revisão</span>
                <div className="mt-1">
                  {initialData.flow.review_status === 'draft' && <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Rascunho</span>}
                  {initialData.flow.review_status === 'in_validation' && <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Em Validação</span>}
                  {initialData.flow.review_status === 'approved' && <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Aprovado</span>}
                  {initialData.flow.review_status === 'rejected' && <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Rejeitado</span>}
                </div>
              </div>
              {initialData.flow.validation_window_days && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Janela de Validação</span>
                  <div className="mt-1 text-sm text-gray-900">{initialData.flow.validation_window_days} dias</div>
                </div>
              )}
              {initialData.flow.validation_ends_at && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Validação termina</span>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(initialData.flow.validation_ends_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {initialData.flow.simulation_only ? 'Modo: Simulação apenas' : 'Modo: Simulação/Real'}
            </div>
          </div>
          {/* Texto de Laboratório Seguro */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded p-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">LABORATÓRIO EM MODO SIMULAÇÃO</span>
              <span>• Nenhuma execução aqui altera dados de produção.</span>
            </div>
          </div>
        </div>
      )}

      {/* Painel de métricas do fluxo */}
      {runStats && (
        <div className="mb-6 bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Métricas de Execução</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500">Total de execuções</span>
              <div className="mt-1 text-lg font-medium text-gray-900">{runStats.total_runs}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Taxa de sucesso</span>
              <div className="mt-1 text-lg font-medium text-green-600">
                {runStats.total_runs > 0 ? Math.round((runStats.success_runs / runStats.total_runs) * 100) : 0}%
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Taxa de erro</span>
              <div className="mt-1 text-lg font-medium text-red-600">
                {runStats.total_runs > 0 ? Math.round((runStats.error_runs / runStats.total_runs) * 100) : 0}%
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Latência média</span>
              <div className="mt-1 text-lg font-medium text-blue-600">
                {runStats.avg_duration_ms ? (runStats.avg_duration_ms / 1000).toFixed(1) + 's' : '-'}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Última execução</span>
              <div className="mt-1 text-lg font-medium text-gray-900">
                {runStats.last_run_at ? new Date(runStats.last_run_at).toLocaleString('pt-BR') : '-'}
              </div>
            </div>
          </div>
          {initialData.flow?.review_status === 'in_validation' && (
            <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 rounded p-2">
              ⚠️ Período de validação: {runStats.total_runs < 3 && 'Execução inconclusiva (menos de 3 execuções). '}
              {runStats.total_runs > 0 && Math.round((runStats.error_runs / runStats.total_runs) * 100) > 10 && 'Taxa de erro elevada (>10%). '}
              {runStats.total_runs >= 3 && Math.round((runStats.error_runs / runStats.total_runs) * 100) <= 10 && 'Validação dentro dos critérios esperados.'}
            </div>
          )}
        </div>
      )}

      {/* Painel de Sugestões & Riscos */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Sugestões & Riscos
          </h3>
          <button
            onClick={seedSuggestions}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + Criar sugestões mock
          </button>
        </div>

        {loadingSuggestions ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-500 mt-1">Carregando sugestões...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-4">
            <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Nenhuma sugestão cadastrada ainda</p>
            <p className="text-xs text-gray-500 mt-1">Use o botão acima para criar sugestões de demonstração</p>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {suggestion.type === 'RISK' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {suggestion.type === 'IMPROVEMENT' && <Lightbulb className="w-4 h-4 text-amber-500" />}
                      {suggestion.type === 'NEW_FLOW_IDEA' && <Plus className="w-4 h-4 text-blue-500" />}
                      <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        suggestion.status === 'OPEN' ? 'bg-gray-100 text-gray-700' :
                        suggestion.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        suggestion.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.status === 'OPEN' ? 'Aberto' :
                         suggestion.status === 'ACCEPTED' ? 'Aceito' :
                         suggestion.status === 'REJECTED' ? 'Rejeitado' : 'Concluído'}
                      </span>
                    </div>
                    {suggestion.description && (
                      <p className="text-xs text-gray-600">{suggestion.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Criado em {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {suggestion.status === 'OPEN' && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'ACCEPTED')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Aceitar"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'REJECTED')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Rejeitar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 items-start">
        {/* Coluna esquerda: builder simples */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Fluxo Sequencial
            </h3>
            <span className="text-xs text-gray-500">
              Nós executados em ordem da esquerda para a direita
            </span>
          </div>

          {/* Lista de nós */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {nodes.length === 0 && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                Nenhum nó adicionado ainda. Use os botões abaixo para montar o fluxo.
              </div>
            )}

            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`min-w-[160px] p-3 rounded-lg border text-left text-xs cursor-pointer transition-colors ${
                    selectedNode?.id === node.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wide text-gray-500">
                      {node.type}
                    </span>
                    <Circle
                      className={`w-2 h-2 ${
                        node.type === "TRIGGER"
                          ? "text-purple-500"
                          : node.type === "IA"
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                      fill="currentColor"
                    />
                  </div>
                  <div className="font-medium text-gray-900 mb-1 text-xs truncate">
                    {node.subtype}
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-3">
                    {node.description}
                  </p>
                </button>

                {index < nodes.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Paleta de nós */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="border rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-2">Triggers</p>
              <div className="space-y-2">
                <button
                  onClick={() => addNode("TRIGGER", "diario_novo")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Novo episódio no diário
                </button>
                <button
                  onClick={() => addNode("TRIGGER", "teste_clareza_concluido")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Teste de clareza concluído
                </button>
                <button
                  onClick={() => addNode("TRIGGER", "chat_mensagem_nova")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Nova mensagem no chat
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-2">IAs</p>
              <div className="space-y-2">
                <button
                  onClick={() => addNode("IA", "coach_clareza_v1")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Coach Clareza v1
                </button>
                <button
                  onClick={() => addNode("IA", "guardian_risco_v1")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Guardião de Risco
                </button>
                <button
                  onClick={() => addNode("IA", "analise_contexto_diario_v1")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Análise de contexto do diário
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-2">Ações</p>
              <div className="space-y-2">
                <button
                  onClick={() => addNode("ACTION", "atualizar_flags_risco")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Atualizar flags de risco
                </button>
                <button
                  onClick={() => addNode("ACTION", "criar_incidente")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Criar incidente
                </button>
                <button
                  onClick={() => addNode("ACTION", "gerar_carta_selo_pdf")}
                  className="w-full px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                >
                  Gerar carta-selo (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita: configuração + versões + execuções */}
        <div className="space-y-4">
          {/* Config do nó selecionado (MVP: só mostra info e permite remover) */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-700" />
              Configuração do nó
            </h3>
            {selectedNode ? (
              <div className="space-y-2 text-sm">
                <p className="text-xs text-gray-500 uppercase">Tipo</p>
                <p className="font-medium text-gray-900">{selectedNode.type}</p>
                <p className="text-xs text-gray-500 uppercase mt-2">Subtipo</p>
                <p className="font-medium text-gray-900">{selectedNode.subtype}</p>
                <p className="text-xs text-gray-500 uppercase mt-2">Descrição</p>
                <p className="text-gray-700">{selectedNode.description}</p>

                <button
                  onClick={removeSelectedNode}
                  className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" /> Remover nó
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 flex flex-col items-center py-6">
                <Settings className="w-6 h-6 text-gray-300 mb-2" />
                <p>Selecione um nó no fluxo para ver detalhes</p>
              </div>
            )}
          </div>

          {/* Versões do fluxo */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                <History className="w-4 h-4 text-gray-700" />
                Versões do fluxo
              </h3>
              {loadingVersions && (
                <span className="text-[10px] text-gray-500">Carregando...</span>
              )}
            </div>

            {versions.length === 0 && !loadingVersions && (
              <p className="text-xs text-gray-500">
                Nenhuma versão registrada ainda. Ao salvar o fluxo, versões serão criadas
                automaticamente.
              </p>
            )}

            {versions.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900">
                          {v.label || `v${v.version}`}
                        </span>
                        {v.is_current && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">
                            ATUAL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {formatDateTime(v.created_at)}
                        {v.created_by && ` · ${v.created_by}`}
                      </div>
                    </div>
                    {!v.is_current && (
                      <button
                        onClick={() => handleRevertVersion(v.version)}
                        disabled={revertingVersion === v.version || isRunning}
                        className="text-[11px] px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {revertingVersion === v.version ? "Revertendo..." : "Reverter"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Métricas de execuções */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-gray-700" />
                Execuções recentes
              </h3>
              {loadingRuns && (
                <span className="text-[10px] text-gray-500">Carregando...</span>
              )}
            </div>

            {runStats ? (
              <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  Total: {runStats.total}
                </span>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Sucesso: {runStats.success}
                </span>
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Erros: {runStats.error}
                </span>
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  Em execução: {runStats.running}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-2">
                Nenhuma execução registrada ainda.
              </p>
            )}

            {recentRuns.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto text-[11px]">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between px-2 py-1 rounded border border-gray-100 bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            run.mode === "simulation"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {run.mode === "simulation" ? "Simulação" : "Real"}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            run.status === "SUCCESS"
                              ? "text-green-700"
                              : run.status === "ERROR"
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {formatDateTime(run.started_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nós com mais erros */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Nós com mais erros
              </h3>
              {loadingNodeAnalytics && (
                <span className="text-[10px] text-gray-500">Carregando...</span>
              )}
            </div>

            {nodeAnalytics.filter((n) => n.error_logs > 0).length === 0 && !loadingNodeAnalytics && (
              <p className="text-xs text-gray-500">
                Nenhum nó com erro registrado ainda. Execute o fluxo algumas vezes para coletar dados.
              </p>
            )}

            {nodeAnalytics.filter((n) => n.error_logs > 0).length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto text-[11px]">
                {nodeAnalytics
                  .filter((n) => n.error_logs > 0)
                  .sort((a, b) => b.error_logs - a.error_logs)
                  .slice(0, 5)
                  .map((n) => (
                    <div
                      key={n.node_id}
                      className="px-2 py-2 rounded border border-red-100 bg-red-50 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-red-700">
                          {n.subtype}
                        </span>
                        <span className="text-[10px] text-red-600">
                          {n.error_logs} erros
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-red-700">
                        <span>
                          Execuções: {n.runs_impacted}
                        </span>
                        <span>
                          Logs: {n.total_logs}
                        </span>
                        <span>
                          Taxa de erro: {Math.round((n.error_rate || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

