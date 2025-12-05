'use client'

/**
 * SIMULAÇÃO - Painel de Impersonação/Ver Como
 * TAREFA 8 - Telas Admin Faltantes
 * 
 * Permite que ADMIN veja o sistema como outro usuário
 * para fins de suporte, mantendo auditoria completa.
 * 
 * @see lib/impersonation.ts
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 8
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  Users,
  Search,
  Play,
  Square,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  User,
  Mail,
  Calendar,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipos
interface UserForSimulation {
  id: string
  email: string
  name: string | null
  role: string
  plan_key: string
  created_at: string
}

interface ImpersonationSession {
  id: string
  admin_email: string
  target_user_email: string
  target_user_role: string
  motivo: string
  status: 'ativa' | 'encerrada' | 'expirada'
  inicio: string
  fim: string | null
  duracao_segundos: number | null
  total_acoes: number
}

interface SessionStats {
  total_sessoes: number
  sessoes_ativas: number
  sessoes_hoje: number
  total_acoes: number
}

export default function SimulacaoPage() {
  const supabase = createClient()
  
  const [users, setUsers] = useState<UserForSimulation[]>([])
  const [sessions, setSessions] = useState<ImpersonationSession[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserForSimulation | null>(null)
  const [motivo, setMotivo] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [activeSession, setActiveSession] = useState<ImpersonationSession | null>(null)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Carregar usuários para simulação
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('user_id, name, role')
        .neq('role', 'SUPER_ADMIN')
        .limit(100)

      // Buscar emails dos usuários
      if (usersData) {
        const usersWithEmail = await Promise.all(
          usersData.map(async (u) => {
            const { data: authData } = await supabase.auth.admin.getUserById(u.user_id)
            return {
              id: u.user_id,
              email: authData?.user?.email || 'email@desconhecido.com',
              name: u.name,
              role: u.role,
              plan_key: 'free', // TODO: buscar plano real
              created_at: authData?.user?.created_at || new Date().toISOString()
            }
          })
        )
        setUsers(usersWithEmail)
      }

      // Carregar sessões recentes
      const { data: sessionsData } = await supabase
        .from('support_impersonation_sessions')
        .select('*')
        .order('inicio', { ascending: false })
        .limit(20)

      if (sessionsData) {
        setSessions(sessionsData)
        // Verificar se há sessão ativa
        const active = sessionsData.find(s => s.status === 'ativa')
        if (active) {
          setActiveSession(active)
        }
      }

      // Carregar estatísticas
      const { count: totalSessoes } = await supabase
        .from('support_impersonation_sessions')
        .select('*', { count: 'exact', head: true })

      const { count: sessoesAtivas } = await supabase
        .from('support_impersonation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativa')

      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const { count: sessoesHoje } = await supabase
        .from('support_impersonation_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('inicio', hoje.toISOString())

      const { count: totalAcoes } = await supabase
        .from('support_impersonation_logs')
        .select('*', { count: 'exact', head: true })

      setStats({
        total_sessoes: totalSessoes || 0,
        sessoes_ativas: sessoesAtivas || 0,
        sessoes_hoje: sessoesHoje || 0,
        total_acoes: totalAcoes || 0
      })

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const startSimulation = async () => {
    if (!selectedUser || !motivo.trim()) {
      setError('Selecione um usuário e informe o motivo')
      return
    }

    try {
      const response = await fetch('/api/admin/impersonation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          targetUserEmail: selectedUser.email,
          targetUserRole: selectedUser.role,
          motivo: motivo.trim(),
          ticketId: ticketId.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao iniciar simulação')
      }

      const data = await response.json()
      setSuccess(`Simulação iniciada! Você agora está vendo como ${selectedUser.email}`)
      setActiveSession(data.session)
      setSelectedUser(null)
      setMotivo('')
      setTicketId('')
      loadData()

      // Redirecionar para o dashboard do usuário
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar simulação')
    }
  }

  const endSimulation = async () => {
    if (!activeSession) return

    try {
      const response = await fetch('/api/admin/impersonation/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao encerrar simulação')
      }

      setSuccess('Simulação encerrada com sucesso!')
      setActiveSession(null)
      loadData()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao encerrar simulação')
    }
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin" 
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            Simulação de Usuário
          </h1>
          <p className="text-gray-400 text-sm">
            Ver o sistema como outro usuário para suporte
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sessão Ativa */}
      {activeSession && (
        <div className="mb-6 p-6 bg-purple-500/20 border border-purple-500/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/30 rounded-full">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Simulação Ativa</h3>
                <p className="text-gray-300">
                  Você está vendo como: <strong>{activeSession.target_user_email}</strong>
                </p>
                <p className="text-sm text-gray-400">
                  Motivo: {activeSession.motivo}
                </p>
              </div>
            </div>
            <button
              onClick={endSimulation}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Square className="w-4 h-4" />
              Encerrar Simulação
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{stats.total_sessoes}</p>
                <p className="text-sm text-gray-400">Total de Sessões</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{stats.sessoes_ativas}</p>
                <p className="text-sm text-gray-400">Sessões Ativas</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{stats.sessoes_hoje}</p>
                <p className="text-sm text-gray-400">Sessões Hoje</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">{stats.total_acoes}</p>
                <p className="text-sm text-gray-400">Ações Registradas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Iniciar Nova Simulação */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Iniciar Nova Simulação
          </h2>

          {/* Busca de usuário */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Buscar Usuário</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email ou nome..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Lista de usuários */}
          <div className="mb-4 max-h-48 overflow-y-auto border border-gray-700 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Carregando...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">Nenhum usuário encontrado</div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-0 ${
                    selectedUser?.id === user.id ? 'bg-purple-500/20' : ''
                  }`}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {user.name || 'Sem nome'} • {user.role} • {user.plan_key}
                    </p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Usuário selecionado */}
          {selectedUser && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-gray-400">Usuário selecionado:</p>
              <p className="font-medium">{selectedUser.email}</p>
            </div>
          )}

          {/* Motivo */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Motivo da Simulação <span className="text-red-400">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Investigar bug reportado no ticket #123"
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Ticket ID */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              ID do Ticket (opcional)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Ex: TICKET-123"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Aviso */}
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <p className="text-sm text-yellow-200">
              Todas as ações durante a simulação serão registradas para auditoria.
              Ações perigosas (deletar conta, alterar senha, etc.) são bloqueadas.
            </p>
          </div>

          {/* Botão Iniciar */}
          <button
            onClick={startSimulation}
            disabled={!selectedUser || !motivo.trim() || !!activeSession}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            Iniciar Simulação
          </button>
        </div>

        {/* Histórico de Sessões */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Histórico de Sessões
            </h2>
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Nenhuma sessão registrada
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className="border border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSession(
                      expandedSession === session.id ? null : session.id
                    )}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'ativa' ? 'bg-green-400' :
                        session.status === 'encerrada' ? 'bg-gray-400' :
                        'bg-yellow-400'
                      }`} />
                      <div className="text-left">
                        <p className="font-medium">{session.target_user_email}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(session.inicio)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.status === 'ativa' ? 'bg-green-500/20 text-green-400' :
                        session.status === 'encerrada' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {session.status}
                      </span>
                      {expandedSession === session.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {expandedSession === session.id && (
                    <div className="p-3 bg-gray-800/50 border-t border-gray-700 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-400">Admin:</span>
                          <span className="ml-2">{session.admin_email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Role:</span>
                          <span className="ml-2">{session.target_user_role}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Duração:</span>
                          <span className="ml-2">{formatDuration(session.duracao_segundos)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Ações:</span>
                          <span className="ml-2">{session.total_acoes || 0}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Motivo:</span>
                          <span className="ml-2">{session.motivo}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
