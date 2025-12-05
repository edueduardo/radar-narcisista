'use client'

/**
 * ETAPA 12.1.2: Gestão de Profissionais Conectados
 * 
 * Página onde o cliente pode:
 * - Ver quais profissionais têm acesso aos seus dados
 * - Revogar acesso totalmente
 * - Pausar/retomar acesso temporariamente
 * - Ajustar permissões de compartilhamento (share_*)
 * 
 * LGPD/Ética:
 * - Cliente tem controle total sobre seus dados
 * - Pode revogar a qualquer momento
 * - Avisos claros sobre o que significa cada ação
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Shield,
  UserX,
  Pause,
  Play,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  Activity,
  Bell,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// =============================================================================
// TIPOS
// =============================================================================

interface ProfessionalConnection {
  id: string
  professional_id: string
  professional_name: string
  professional_email: string | null
  status: 'active' | 'paused' | 'revoked'
  share_clarity_tests: boolean
  share_journal_entries: boolean
  share_chat_summaries: boolean
  share_safety_plan: boolean
  share_risk_alerts: boolean
  invite_accepted_at: string | null
  created_at: string
}

interface PermissionOption {
  key: keyof Pick<ProfessionalConnection, 'share_clarity_tests' | 'share_journal_entries' | 'share_chat_summaries' | 'share_safety_plan' | 'share_risk_alerts'>
  label: string
  description: string
  icon: React.ReactNode
  sensitive: boolean
}

// =============================================================================
// CONSTANTES
// =============================================================================

const PERMISSION_OPTIONS: PermissionOption[] = [
  {
    key: 'share_clarity_tests',
    label: 'Teste de Clareza',
    description: 'Resultados dos testes de clareza emocional',
    icon: <Activity className="w-4 h-4" />,
    sensitive: false
  },
  {
    key: 'share_journal_entries',
    label: 'Diário',
    description: 'Resumos das entradas no diário',
    icon: <FileText className="w-4 h-4" />,
    sensitive: false
  },
  {
    key: 'share_chat_summaries',
    label: 'Resumos do Chat',
    description: 'Resumos das conversas com a IA',
    icon: <MessageSquare className="w-4 h-4" />,
    sensitive: false
  },
  {
    key: 'share_safety_plan',
    label: 'Plano de Segurança',
    description: 'Informações do plano de segurança',
    icon: <Shield className="w-4 h-4" />,
    sensitive: true
  },
  {
    key: 'share_risk_alerts',
    label: 'Alertas de Risco',
    description: 'Notificações sobre padrões de risco',
    icon: <Bell className="w-4 h-4" />,
    sensitive: true
  }
]

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function GerenciarProfissionaisPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<ProfessionalConnection[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null)
  
  // ==========================================================================
  // CARREGAR CONEXÕES
  // ==========================================================================
  
  useEffect(() => {
    loadConnections()
  }, [])
  
  const loadConnections = async () => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/configuracoes/profissionais')
        return
      }
      
      const response = await fetch('/api/client/connections')
      if (!response.ok) {
        throw new Error('Erro ao carregar conexões')
      }
      
      const data = await response.json()
      setConnections(data.connections || [])
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handleAction = async (connectionId: string, action: string) => {
    setActionLoading(connectionId)
    setConfirmAction(null)
    
    try {
      const response = await fetch(`/api/client/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Erro ao executar ação')
        return
      }
      
      // Recarregar conexões
      await loadConnections()
      
    } catch (error) {
      console.error('Erro ao executar ação:', error)
      alert('Erro ao executar ação. Tente novamente.')
    } finally {
      setActionLoading(null)
    }
  }
  
  const handlePermissionChange = async (connectionId: string, permission: string, value: boolean) => {
    setActionLoading(connectionId)
    
    try {
      const response = await fetch(`/api/client/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_permissions',
          [permission]: value
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar permissão')
        return
      }
      
      // Atualizar localmente
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, [permission]: value }
          : conn
      ))
      
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error)
    } finally {
      setActionLoading(null)
    }
  }
  
  // ==========================================================================
  // HELPERS
  // ==========================================================================
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Ativo
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <Pause className="w-3 h-3" />
            Pausado
          </span>
        )
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Revogado
          </span>
        )
      default:
        return null
    }
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // ==========================================================================
  // LOADING
  // ==========================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/configuracoes" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar às Configurações</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profissionais Conectados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie quais profissionais têm acesso aos seus dados no Radar.
          </p>
        </div>
        
        {/* Aviso ético */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Você está no controle</p>
              <ul className="space-y-1 text-xs">
                <li>• Você decide quem pode ver seus dados</li>
                <li>• Pode revogar ou pausar o acesso a qualquer momento</li>
                <li>• Revogar acesso <strong>não apaga</strong> dados já compartilhados anteriormente</li>
                <li>• O Radar <strong>não substitui</strong> terapia, diagnóstico ou parecer profissional</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Lista de conexões */}
        {connections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum profissional conectado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Quando você aceitar um convite de um profissional, ele aparecerá aqui.
            </p>
            <Link
              href="/aceitar-convite"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Aceitar um convite
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((conn) => (
              <div 
                key={conn.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Cabeçalho da conexão */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {conn.professional_name}
                      </h3>
                      {conn.professional_email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {conn.professional_email}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Conectado em {formatDate(conn.invite_accepted_at || conn.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(conn.status)}
                  </div>
                </div>
                
                {/* Ações principais */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-wrap gap-2">
                    {conn.status === 'active' && (
                      <>
                        <button
                          onClick={() => setConfirmAction({ id: conn.id, action: 'pause' })}
                          disabled={actionLoading === conn.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Pause className="w-4 h-4" />
                          Pausar
                        </button>
                        <button
                          onClick={() => setConfirmAction({ id: conn.id, action: 'revoke' })}
                          disabled={actionLoading === conn.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                          Revogar
                        </button>
                      </>
                    )}
                    
                    {conn.status === 'paused' && (
                      <>
                        <button
                          onClick={() => handleAction(conn.id, 'resume')}
                          disabled={actionLoading === conn.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === conn.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Retomar
                        </button>
                        <button
                          onClick={() => setConfirmAction({ id: conn.id, action: 'revoke' })}
                          disabled={actionLoading === conn.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                          Revogar
                        </button>
                      </>
                    )}
                    
                    {conn.status === 'revoked' && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Acesso revogado. Este profissional não pode mais ver seus dados.
                      </span>
                    )}
                    
                    {conn.status !== 'revoked' && (
                      <button
                        onClick={() => setExpandedId(expandedId === conn.id ? null : conn.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors ml-auto"
                      >
                        <Settings className="w-4 h-4" />
                        Permissões
                        {expandedId === conn.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Painel de permissões expandido */}
                {expandedId === conn.id && conn.status !== 'revoked' && (
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      O que este profissional pode ver:
                    </h4>
                    <div className="space-y-2">
                      {PERMISSION_OPTIONS.map((option) => (
                        <label
                          key={option.key}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                            conn[option.key]
                              ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
                              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              conn[option.key]
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                            }`}>
                              {option.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${
                                  conn[option.key] 
                                    ? 'text-purple-900 dark:text-purple-100' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {option.label}
                                </span>
                                {option.sensitive && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                    Sensível
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={conn[option.key]}
                              onChange={(e) => handlePermissionChange(conn.id, option.key, e.target.checked)}
                              disabled={actionLoading === conn.id}
                              className="sr-only"
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${
                              conn[option.key] 
                                ? 'bg-purple-600' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-1 ${
                                conn[option.key] ? 'translate-x-5' : 'translate-x-1'
                              }`} />
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Modal de confirmação */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmAction.action === 'revoke' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {confirmAction.action === 'revoke' ? (
                    <UserX className="w-5 h-5" />
                  ) : (
                    <Pause className="w-5 h-5" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {confirmAction.action === 'revoke' ? 'Revogar acesso?' : 'Pausar acesso?'}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {confirmAction.action === 'revoke' ? (
                  <>
                    O profissional <strong>não poderá mais</strong> ver seus dados.
                    Esta ação pode ser desfeita aceitando um novo convite.
                  </>
                ) : (
                  <>
                    O profissional <strong>não poderá ver</strong> seus dados enquanto pausado.
                    Você pode retomar o acesso a qualquer momento.
                  </>
                )}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAction(confirmAction.id, confirmAction.action)}
                  disabled={actionLoading === confirmAction.id}
                  className={`flex-1 py-2 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    confirmAction.action === 'revoke'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {actionLoading === confirmAction.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {confirmAction.action === 'revoke' ? 'Revogar' : 'Pausar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Link para aceitar convite */}
        <div className="mt-8 text-center">
          <Link
            href="/aceitar-convite"
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            Tem um código de convite? Aceitar convite →
          </Link>
        </div>
      </div>
    </div>
  )
}
