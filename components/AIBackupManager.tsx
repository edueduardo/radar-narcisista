'use client'

import { useState } from 'react'
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Settings,
  Power,
  PowerOff,
  Clock
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

interface BackupGroup {
  role: string
  displayName: string
  primary: Agent | null
  backups: Agent[]
  autoFailover: boolean
}

interface AIBackupManagerProps {
  agents: Agent[]
  onSwitchPrimary: (roleId: string, newPrimaryId: string) => void
  onToggleAutoFailover: (roleId: string, enabled: boolean) => void
  onToggleAgent: (agentId: string, active: boolean) => void
}

export default function AIBackupManager({ 
  agents, 
  onSwitchPrimary, 
  onToggleAutoFailover, 
  onToggleAgent 
}: AIBackupManagerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Agrupar agentes por função/role
  const groupAgentsByRole = (): BackupGroup[] => {
    const groups: { [key: string]: BackupGroup } = {}

    agents.forEach(agent => {
      const role = agent.role
      if (!groups[role]) {
        groups[role] = {
          role,
          displayName: getRoleDisplayName(role),
          primary: null,
          backups: [],
          autoFailover: true
        }
      }

      if (agent.priority === 1) {
        groups[role].primary = agent
      } else {
        groups[role].backups.push(agent)
      }
    })

    return Object.values(groups)
  }

  const getRoleDisplayName = (role: string): string => {
    const roleNames: { [key: string]: string } = {
      'PRODUCT_CHAT': 'Chat – Coach de Clareza',
      'INFRA_TRANSCRIBE': 'Transcrição de Voz',
      'META_UX': 'IA Guardiã de UX & Conversão',
      'META_COST': 'IA Guardiã de Custos',
      'META_RISK': 'IA Guardiã de Risco',
      'META_SEO': 'IA Guardiã de Conteúdo/SEO',
      'PRODUCT_ANALYTICS': 'Analytics do Produto',
      'INFRA_REPORT': 'Gerador de Relatórios'
    }
    return roleNames[role] || role
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4" />
      case 'DEGRADED': return <AlertTriangle className="h-4 w-4" />
      case 'PARTIAL': return <Clock className="h-4 w-4" />
      case 'DOWN': return <AlertTriangle className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const toggleGroup = (roleId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roleId)) {
        newSet.delete(roleId)
      } else {
        newSet.add(roleId)
      }
      return newSet
    })
  }

  const handleSwitchPrimary = (group: BackupGroup, backupAgent: Agent) => {
    if (group.primary) {
      onSwitchPrimary(group.role, backupAgent.id)
    }
  }

  const backupGroups = groupAgentsByRole()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400">Gerenciamento de Backup</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-3 w-3" />
          <span>Failover automático disponível</span>
        </div>
      </div>

      {backupGroups.map(group => (
        <div key={group.role} className="bg-slate-800/50 rounded-lg border border-slate-700">
          {/* Header do Grupo */}
          <div 
            className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
            onClick={() => toggleGroup(group.role)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="font-medium text-slate-200">{group.displayName}</div>
                  <div className="text-xs text-slate-500">
                    {group.primary ? '1 primária' : 'Sem primária'} • {group.backups.length} backup(s)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {group.autoFailover && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    <Shield className="h-3 w-3" />
                    Auto
                  </div>
                )}
                
                {group.primary && getStatusIcon(group.primary.last_status)}
              </div>
            </div>
          </div>

          {/* Conteúdo Expandido */}
          {expandedGroups.has(group.role) && (
            <div className="border-t border-slate-700 p-4 space-y-4">
              {/* Primária */}
              {group.primary ? (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Primária</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleAgent(group.primary!.id, !group.primary!.active)
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        group.primary.active
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {group.primary.active ? (
                        <><Power className="h-3 w-3 inline mr-1" /> Ativa</>
                      ) : (
                        <><PowerOff className="h-3 w-3 inline mr-1" /> Inativa</>
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-slate-300">{group.primary.display_name}</div>
                  <div className="text-xs text-slate-500">
                    {group.primary.provider} • {group.primary.model}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mt-2 ${getStatusColor(group.primary.last_status)}`}>
                    {getStatusIcon(group.primary.last_status)}
                    <span>{group.primary.last_status}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Nenhuma IA primária configurada</span>
                  </div>
                </div>
              )}

              {/* Backups */}
              {group.backups.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-400">Backups Disponíveis</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleAutoFailover(group.role, !group.autoFailover)
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        group.autoFailover
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-slate-600 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {group.autoFailover ? 'Auto: ON' : 'Auto: OFF'}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {group.backups.map(backup => (
                      <div key={backup.id} className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs ${getStatusColor(backup.last_status)}`}>
                              P{backup.priority}
                            </div>
                            <div>
                              <div className="text-sm text-slate-300">{backup.display_name}</div>
                              <div className="text-xs text-slate-500">
                                {backup.provider} • {backup.model}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleAgent(backup.id, !backup.active)
                              }}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                backup.active
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            >
                              {backup.active ? 'Ativa' : 'Inativa'}
                            </button>
                            
                            {group.primary && backup.active && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSwitchPrimary(group, backup)
                                }}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                              >
                                <ArrowRight className="h-3 w-3 inline mr-1" />
                                Tornar Primária
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alertas de Failover */}
              {group.primary && group.primary.last_status !== 'HEALTHY' && (
                <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">
                      {group.autoFailover 
                        ? 'Failover automático será ativado se a primária continuar com problemas'
                        : 'Considere ativar manualmente um backup ou o failover automático'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {backupGroups.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">Nenhum sistema de backup configurado</div>
        </div>
      )}
    </div>
  )
}
