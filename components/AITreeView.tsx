'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Bot, Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

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
  calls_today?: number
  cost_today?: number
}

interface TreeNode {
  id: string
  label: string
  type: 'layer' | 'feature' | 'agent'
  children?: TreeNode[]
  agent?: Agent
  expanded?: boolean
}

interface AITreeViewProps {
  agents: Agent[]
  selectedAgent: Agent | null
  onAgentSelect: (agent: Agent) => void
}

export default function AITreeView({ agents, selectedAgent, onAgentSelect }: AITreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['layer_produto', 'layer_meta', 'layer_infra']))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'DEGRADED': return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case 'PARTIAL': return <Clock className="h-3 w-3 text-orange-500" />
      case 'DOWN': return <XCircle className="h-3 w-3 text-red-500" />
      default: return <Activity className="h-3 w-3 text-gray-500" />
    }
  }

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'produto': return '🔵'
      case 'meta': return '🟣'
      case 'infra': return '🟡'
      default: return '⚪'
    }
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  // Agrupar IAs por camada e função
  const buildTree = (): TreeNode[] => {
    const tree: TreeNode[] = []

    // Camada Produto
    const produtoAgents = agents.filter(a => a.layer === 'produto')
    if (produtoAgents.length > 0) {
      const produtoNode: TreeNode = {
        id: 'layer_produto',
        label: '🔵 Camada Produto (o que o usuário vê)',
        type: 'layer',
        expanded: expandedNodes.has('layer_produto'),
        children: []
      }

      // Agrupar por função
      const chatAgents = produtoAgents.filter(a => a.role.includes('CHAT'))
      if (chatAgents.length > 0) {
        const chatNode: TreeNode = {
          id: 'feature_chat',
          label: '💬 Chat – Coach de Clareza',
          type: 'feature',
          expanded: expandedNodes.has('feature_chat'),
          children: chatAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        produtoNode.children!.push(chatNode)
      }

      const diarioAgents = produtoAgents.filter(a => a.role.includes('DIARIO') || a.features.includes('resumo_diario'))
      if (diarioAgents.length > 0) {
        const diarioNode: TreeNode = {
          id: 'feature_diario',
          label: '📖 Diário de Episódios',
          type: 'feature',
          expanded: expandedNodes.has('feature_diario'),
          children: diarioAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        produtoNode.children!.push(diarioNode)
      }

      const dashboardAgents = produtoAgents.filter(a => a.role.includes('DASHBOARD'))
      if (dashboardAgents.length > 0) {
        const dashboardNode: TreeNode = {
          id: 'feature_dashboard',
          label: '📊 Dashboard do Usuário',
          type: 'feature',
          expanded: expandedNodes.has('feature_dashboard'),
          children: dashboardAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        produtoNode.children!.push(dashboardNode)
      }

      tree.push(produtoNode)
    }

    // Camada Meta
    const metaAgents = agents.filter(a => a.layer === 'meta')
    if (metaAgents.length > 0) {
      const metaNode: TreeNode = {
        id: 'layer_meta',
        label: '🟣 Camada Meta / Inteligência do Sistema',
        type: 'layer',
        expanded: expandedNodes.has('layer_meta'),
        children: []
      }

      const uxAgents = metaAgents.filter(a => a.role.includes('UX'))
      if (uxAgents.length > 0) {
        const uxNode: TreeNode = {
          id: 'feature_ux',
          label: '🎯 IA Guardiã de UX & Conversão',
          type: 'feature',
          expanded: expandedNodes.has('feature_ux'),
          children: uxAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        metaNode.children!.push(uxNode)
      }

      const costAgents = metaAgents.filter(a => a.role.includes('COST'))
      if (costAgents.length > 0) {
        const costNode: TreeNode = {
          id: 'feature_cost',
          label: '💰 IA Guardiã de Custos',
          type: 'feature',
          expanded: expandedNodes.has('feature_cost'),
          children: costAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        metaNode.children!.push(costNode)
      }

      const riskAgents = metaAgents.filter(a => a.role.includes('RISK'))
      if (riskAgents.length > 0) {
        const riskNode: TreeNode = {
          id: 'feature_risk',
          label: '🛡️ IA Guardiã de Risco',
          type: 'feature',
          expanded: expandedNodes.has('feature_risk'),
          children: riskAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        metaNode.children!.push(riskNode)
      }

      const seoAgents = metaAgents.filter(a => a.role.includes('SEO') || a.role.includes('CONTENT'))
      if (seoAgents.length > 0) {
        const seoNode: TreeNode = {
          id: 'feature_seo',
          label: '🌐 IA Guardiã de Conteúdo/SEO',
          type: 'feature',
          expanded: expandedNodes.has('feature_seo'),
          children: seoAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        metaNode.children!.push(seoNode)
      }

      tree.push(metaNode)
    }

    // Camada Infra
    const infraAgents = agents.filter(a => a.layer === 'infra')
    if (infraAgents.length > 0) {
      const infraNode: TreeNode = {
        id: 'layer_infra',
        label: '🟡 Camada Infra / Operação',
        type: 'layer',
        expanded: expandedNodes.has('layer_infra'),
        children: []
      }

      const transcribeAgents = infraAgents.filter(a => a.role.includes('TRANSCRIBE'))
      if (transcribeAgents.length > 0) {
        const transcribeNode: TreeNode = {
          id: 'feature_transcribe',
          label: '🎤 Transcrição de voz (Whisper)',
          type: 'feature',
          expanded: expandedNodes.has('feature_transcribe'),
          children: transcribeAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        infraNode.children!.push(transcribeNode)
      }

      const reportAgents = infraAgents.filter(a => a.role.includes('REPORT'))
      if (reportAgents.length > 0) {
        const reportNode: TreeNode = {
          id: 'feature_report',
          label: '📄 Gerador de relatórios / PDF',
          type: 'feature',
          expanded: expandedNodes.has('feature_report'),
          children: reportAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        infraNode.children!.push(reportNode)
      }

      const orchestratorAgents = infraAgents.filter(a => a.role.includes('ORCHESTRATOR'))
      if (orchestratorAgents.length > 0) {
        const orchestratorNode: TreeNode = {
          id: 'feature_orchestrator',
          label: '🎯 Orquestrador Multi-IA',
          type: 'feature',
          expanded: expandedNodes.has('feature_orchestrator'),
          children: orchestratorAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        infraNode.children!.push(orchestratorNode)
      }

      // Outros agentes infra não categorizados
      const otherInfraAgents = infraAgents.filter(a => 
        !a.role.includes('TRANSCRIBE') && 
        !a.role.includes('REPORT') && 
        !a.role.includes('ORCHESTRATOR')
      )
      if (otherInfraAgents.length > 0) {
        const otherNode: TreeNode = {
          id: 'feature_other_infra',
          label: '⚙️ Outras Infraestruturas',
          type: 'feature',
          expanded: expandedNodes.has('feature_other_infra'),
          children: otherInfraAgents.map(agent => ({
            id: agent.id,
            label: `${agent.display_name} (${agent.provider} ${agent.model})`,
            type: 'agent' as const,
            agent
          }))
        }
        infraNode.children!.push(otherNode)
      }

      tree.push(infraNode)
    }

    return tree
  }

  const renderNode = (node: TreeNode, level: number = 0): React.ReactElement => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedAgent?.id === node.agent?.id

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-purple-600/20' : 'hover:bg-slate-800'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'agent' && node.agent) {
              onAgentSelect(node.agent)
            } else if (hasChildren) {
              toggleNode(node.id)
            }
          }}
        >
          {hasChildren && (
            <span className="text-slate-400">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </span>
          )}
          
          {node.type === 'layer' && <span className="text-lg">{getLayerIcon(node.agent?.layer || '')}</span>}
          {node.type === 'feature' && <span className="text-sm">🧩</span>}
          {node.type === 'agent' && (
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3 text-blue-400" />
              {node.agent && getStatusIcon(node.agent.last_status)}
            </div>
          )}
          
          <span className={`text-sm ${
            node.type === 'layer' ? 'font-semibold text-slate-200' :
            node.type === 'feature' ? 'text-slate-300' :
            'text-slate-400'
          }`}>
            {node.label}
          </span>
          
          {node.agent && node.agent.calls_today !== undefined && (
            <span className="ml-auto text-xs text-slate-500">
              {node.agent.calls_today} calls
            </span>
          )}
          
          {node.agent && node.agent.cost_today !== undefined && (
            <span className="text-xs text-yellow-400">
              ${node.agent.cost_today}
            </span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const tree = buildTree()

  return (
    <div className="overflow-y-auto">
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Árvore de IAs</h3>
        <div className="space-y-1">
          {tree.map(node => renderNode(node))}
        </div>
      </div>
    </div>
  )
}
