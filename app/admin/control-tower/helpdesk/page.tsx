'use client'

/**
 * Help Desk Global - Control Tower
 * ETAPA 34 - BLOCO 32-35
 * 
 * Página para gerenciar tickets de suporte de todos os projetos.
 */

import { useState, useEffect } from 'react'
import { 
  Ticket, RefreshCw, Filter, Search, 
  AlertCircle, CheckCircle2, Clock, MessageSquare,
  ChevronRight, Building2, User, Mail
} from 'lucide-react'
import Link from 'next/link'

// ============================================================================
// TIPOS
// ============================================================================

interface SupportTicket {
  id: string
  project_id: string
  project_nome: string
  origem: string
  email_contato: string
  nome_contato: string | null
  titulo: string
  categoria: string
  status: string
  prioridade: string
  criado_em: string
  atualizado_em: string
  total_mensagens: number
}

interface TicketStats {
  total: number
  abertos: number
  em_andamento: number
  aguardando_usuario: number
  resolvidos: number
  fechados: number
  criticos: number
  altos: number
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
  const config: Record<string, { label: string; color: string }> = {
    aberto: { label: 'Aberto', color: 'bg-blue-100 text-blue-800' },
    em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    aguardando_usuario: { label: 'Aguardando', color: 'bg-purple-100 text-purple-800' },
    resolvido: { label: 'Resolvido', color: 'bg-green-100 text-green-800' },
    fechado: { label: 'Fechado', color: 'bg-gray-100 text-gray-800' }
  }
  
  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const config: Record<string, { label: string; color: string }> = {
    baixa: { label: 'Baixa', color: 'text-gray-500' },
    media: { label: 'Média', color: 'text-blue-600' },
    alta: { label: 'Alta', color: 'text-orange-600 font-semibold' },
    critica: { label: '🔥 Crítica', color: 'text-red-600 font-bold' }
  }
  
  const { label, color } = config[prioridade] || { label: prioridade, color: 'text-gray-500' }
  
  return <span className={`text-xs ${color}`}>{label}</span>
}

function CategoriaBadge({ categoria }: { categoria: string }) {
  const config: Record<string, { label: string; emoji: string }> = {
    bug: { label: 'Bug', emoji: '🐛' },
    duvida: { label: 'Dúvida', emoji: '❓' },
    sugestao: { label: 'Sugestão', emoji: '💡' },
    reclamacao: { label: 'Reclamação', emoji: '😤' },
    geral: { label: 'Geral', emoji: '📋' }
  }
  
  const { label, emoji } = config[categoria] || { label: categoria, emoji: '📋' }
  
  return (
    <span className="text-xs text-gray-500">
      {emoji} {label}
    </span>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HelpDeskPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPrioridade, setFilterPrioridade] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      if (filterPrioridade) params.set('prioridade', filterPrioridade)
      
      const res = await fetch(`/api/core/support-ticket?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar dados')
      }
      
      setTickets(data.tickets || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterStatus, filterPrioridade])

  // Filtrar por busca
  const filteredTickets = tickets.filter(ticket => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      ticket.titulo.toLowerCase().includes(term) ||
      ticket.email_contato.toLowerCase().includes(term) ||
      ticket.project_nome.toLowerCase().includes(term) ||
      (ticket.nome_contato?.toLowerCase().includes(term) || false)
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/control-tower" className="hover:text-purple-600">
              Control Tower
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Help Desk</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-orange-500" />
            Help Desk Global
          </h1>
          <p className="text-gray-500 mt-1">
            Tickets de suporte de todos os projetos do ecossistema
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

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
            title="Abertos"
            value={stats.abertos}
            icon={AlertCircle}
            color="border-l-4 border-blue-500"
          />
          <StatCard
            title="Em Andamento"
            value={stats.em_andamento}
            icon={Clock}
            color="border-l-4 border-yellow-500"
          />
          <StatCard
            title="Críticos"
            value={stats.criticos}
            icon={AlertCircle}
            color="border-l-4 border-red-500"
          />
          <StatCard
            title="Resolvidos"
            value={stats.resolvidos}
            icon={CheckCircle2}
            color="border-l-4 border-green-500"
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
                placeholder="Buscar por título, email, projeto..."
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
              <option value="aberto">Abertos</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="aguardando_usuario">Aguardando</option>
              <option value="resolvido">Resolvidos</option>
              <option value="fechado">Fechados</option>
            </select>
          </div>
          
          {/* Filtro Prioridade */}
          <select
            value={filterPrioridade}
            onChange={(e) => setFilterPrioridade(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas as prioridades</option>
            <option value="critica">🔥 Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Tickets ({filteredTickets.length})
          </h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Carregando tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Nenhum ticket encontrado</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PrioridadeBadge prioridade={ticket.prioridade} />
                      <StatusBadge status={ticket.status} />
                      <CategoriaBadge categoria={ticket.categoria} />
                    </div>
                    
                    <h3 className="font-medium text-gray-900 truncate">
                      {ticket.titulo}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {ticket.project_nome}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {ticket.email_contato}
                      </span>
                      {ticket.nome_contato && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.nome_contato}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Info secundária */}
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.total_mensagens} msg
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(ticket.criado_em)}
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
