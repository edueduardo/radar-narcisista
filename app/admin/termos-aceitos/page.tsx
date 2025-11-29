'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Skull, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Shield,
  AlertTriangle,
  FileText,
  Clock,
  User,
  Globe,
  Hash
} from 'lucide-react'

// ============================================================================
// PÁGINA ADMIN: TERMOS ACEITOS
// Lista todos os aceites de termos com cadeia de custódia
// Fundo vermelho + ícone caveira (área sensível/legal)
// ============================================================================

interface TermsAcceptance {
  id: string
  user_id: string
  user_email?: string
  accepted_at: string
  event_hash: string
  ip_address?: string
  ip_hash?: string
  user_agent?: string
  locale?: string
  platform?: string
  context?: string
  terms_version?: string
  acceptance_context?: any
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TermosAceitosPage() {
  const [acceptances, setAcceptances] = useState<TermsAcceptance[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isFallback, setIsFallback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadAcceptances()
  }, [pagination.page])

  const loadAcceptances = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/terms-acceptances?page=${pagination.page}&limit=${pagination.limit}&search=${search}`)
      const json = await res.json()
      
      if (json.error) {
        console.error('Erro:', json.error)
        return
      }

      setAcceptances(json.data || [])
      setPagination(json.pagination || pagination)
      setIsFallback(json.fallback || false)
    } catch (error) {
      console.error('Erro ao carregar aceites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    loadAcceptances()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const truncateHash = (hash: string) => {
    if (!hash || hash === 'N/A') return 'N/A'
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black">
      {/* Header */}
      <div className="bg-red-950/80 border-b border-red-800/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar ao Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-800/50 rounded-lg flex items-center justify-center">
                <Skull className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-100">TERMOS ACEITOS</h1>
                <p className="text-xs text-red-400">Cadeia de custódia para auditoria</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso Legal */}
      <div className="bg-red-900/40 border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200">
                <strong>Área Restrita:</strong> Este painel contém registros de aceite de termos com cadeia de custódia.
                Cada registro possui hash SHA-256 para verificação pericial. Use apenas para fins legais e de auditoria.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Barra de busca */}
        <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por email, ID ou hash..."
                className="w-full pl-10 pr-4 py-2 bg-red-900/40 border border-red-800/50 rounded-lg text-red-100 placeholder-red-400/60 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-red-700 hover:bg-red-600 text-red-100 rounded-lg font-medium transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-800/40 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-100">{pagination.total}</p>
                <p className="text-xs text-red-400">Total de aceites</p>
              </div>
            </div>
          </div>
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-800/40 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-100">{acceptances.filter(a => a.event_hash && a.event_hash !== 'N/A').length}</p>
                <p className="text-xs text-red-400">Com hash válido</p>
              </div>
            </div>
          </div>
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-800/40 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-100">
                  {acceptances.length > 0 ? formatDate(acceptances[0]?.accepted_at).split(' ')[0] : '-'}
                </p>
                <p className="text-xs text-red-400">Último aceite</p>
              </div>
            </div>
          </div>
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-800/40 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-100">{isFallback ? 'Legado' : 'Completo'}</p>
                <p className="text-xs text-red-400">Modo de dados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-red-950/60 rounded-xl border border-red-800/40 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-red-300">Carregando registros...</p>
            </div>
          ) : acceptances.length === 0 ? (
            <div className="p-8 text-center">
              <Skull className="w-12 h-12 text-red-700 mx-auto mb-4" />
              <p className="text-red-300">Nenhum aceite de termos encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-900/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-300 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-300 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-300 uppercase tracking-wider">
                      IP (Hash)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-300 uppercase tracking-wider">
                      Plataforma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-red-300 uppercase tracking-wider">
                      Hash do Evento
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-red-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-800/30">
                  {acceptances.map((acceptance) => (
                    <tr key={acceptance.id} className="hover:bg-red-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-100">{formatDate(acceptance.accepted_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="text-sm text-red-100">{acceptance.user_email || 'N/A'}</p>
                            <p className="text-xs text-red-400 font-mono">{acceptance.user_id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-300 font-mono">
                            {truncateHash(acceptance.ip_hash || acceptance.ip_address || 'N/A')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-red-200">
                          {acceptance.platform || acceptance.context || 'web'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-red-300 font-mono bg-red-900/40 px-2 py-1 rounded">
                          {truncateHash(acceptance.event_hash)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/admin/termos-aceitos/${acceptance.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-700 hover:bg-red-600 text-red-100 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="bg-red-900/40 px-4 py-3 flex items-center justify-between border-t border-red-800/30">
              <p className="text-sm text-red-300">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-red-100 rounded-lg text-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-red-200 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-red-100 rounded-lg text-sm transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
