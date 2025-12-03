'use client'

/**
 * Painel de Auditoria de Suporte
 * ETAPA 36-37 - BLOCO 36-40
 * 
 * Lista sessões de impersonação e permite acompanhar ações de suporte.
 */

import { useState, useEffect } from 'react'
import { 
  Eye, RefreshCw, Search, Filter, Download,
  User, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Activity, Shield
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface ImpersonationSession {
  id: string
  admin_id: string
  admin_email: string
  target_user_id: string
  target_user_email: string
  target_user_role: string
  motivo: string
  status: 'ativa' | 'encerrada' | 'expirada'
  inicio: string
  fim: string | null
  duracao_segundos: number | null
  total_acoes: number
}

interface Stats {
  total_sessoes: number
  sessoes_ativas: number
  sessoes_hoje: number
  total_acoes: number
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: number
  icon: React.ElementType
  color: string 
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('border-l-4', 'bg')}`}>
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    ativa: { label: 'Ativa', color: 'bg-green-100 text-green-800', icon: Activity },
    encerrada: { label: 'Encerrada', color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
    expirada: { label: 'Expirada', color: 'bg-yellow-100 text-yellow-800', icon: XCircle }
  }
  
  const { label, color, icon: Icon } = config[status] || config.encerrada
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string }> = {
    USUARIO: { label: 'Usuária', color: 'bg-pink-100 text-pink-800' },
    PROFISSIONAL: { label: 'Profissional', color: 'bg-blue-100 text-blue-800' },
    ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
    DEV: { label: 'Dev', color: 'bg-orange-100 text-orange-800' },
    WHITELABEL: { label: 'White Label', color: 'bg-green-100 text-green-800' }
  }
  
  const { label, color } = config[role] || { label: role, color: 'bg-gray-100 text-gray-800' }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AuditoriaSuportePage() {
  const [sessions, setSessions] = useState<ImpersonationSession[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeSession, setActiveSession] = useState<ImpersonationSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      
      const res = await fetch(`/api/admin/impersonation?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar dados')
      }
      
      setSessions(data.sessions || [])
      setStats(data.stats || null)
      setActiveSession(data.active_session || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterStatus])

  // Filtrar por busca
  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      session.admin_email.toLowerCase().includes(term) ||
      session.target_user_email.toLowerCase().includes(term) ||
      session.motivo.toLowerCase().includes(term)
    )
  })

  // Formatar data
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatar duração
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  // Exportar CSV
  const exportCSV = () => {
    const headers = ['Data', 'Admin', 'Usuário Alvo', 'Role', 'Motivo', 'Status', 'Duração', 'Ações']
    const rows = filteredSessions.map(s => [
      formatDate(s.inicio),
      s.admin_email,
      s.target_user_email,
      s.target_user_role,
      s.motivo,
      s.status,
      formatDuration(s.duracao_segundos),
      s.total_acoes
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-suporte-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-500" />
            Auditoria de Suporte
          </h1>
          <p className="text-gray-500 mt-1">
            Sessões de impersonação e ações de suporte
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            disabled={filteredSessions.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Alerta de sessão ativa */}
      {activeSession && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span className="text-orange-700">
            Você tem uma sessão de impersonação ativa. O banner está visível no topo da página.
          </span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total de Sessões"
            value={stats.total_sessoes}
            icon={Eye}
            color="border-l-4 border-purple-500"
          />
          <StatCard
            title="Sessões Ativas"
            value={stats.sessoes_ativas}
            icon={Activity}
            color="border-l-4 border-green-500"
          />
          <StatCard
            title="Sessões Hoje"
            value={stats.sessoes_hoje}
            icon={Clock}
            color="border-l-4 border-blue-500"
          />
          <StatCard
            title="Total de Ações"
            value={stats.total_acoes}
            icon={CheckCircle2}
            color="border-l-4 border-orange-500"
          />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Busca */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por admin, usuário ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          {/* Filtro Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos os status</option>
              <option value="ativa">Ativas</option>
              <option value="encerrada">Encerradas</option>
              <option value="expirada">Expiradas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Sessões */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Sessões de Impersonação ({filteredSessions.length})
          </h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Carregando sessões...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center">
            <Eye className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Nenhuma sessão de impersonação encontrada</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredSessions.map((session) => (
              <div 
                key={session.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={session.status} />
                      <RoleBadge role={session.target_user_role} />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">
                        {session.admin_email}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="flex items-center gap-1 text-orange-600">
                        <User className="w-4 h-4" />
                        {session.target_user_email}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Motivo:</span> {session.motivo}
                    </p>
                  </div>
                  
                  {/* Info secundária */}
                  <div className="text-right text-sm">
                    <div className="text-gray-500">
                      {formatDate(session.inicio)}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDuration(session.duracao_segundos)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {session.total_acoes} ações registradas
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
