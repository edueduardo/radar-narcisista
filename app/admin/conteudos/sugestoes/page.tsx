'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Lightbulb,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Clock,
  Bot,
  User,
  ChevronRight,
  RefreshCw,
  Plus,
  Sparkles,
  AlertTriangle,
  FileText,
  ArrowLeft
} from 'lucide-react'
import { SemaforoCard } from '@/components/admin/EditSemaforoBadge'

// ============================================================================
// ADMIN: SUGESTÕES DE CONTEÚDO
// Gerencia sugestões da IA Curadora e manuais
// ============================================================================

interface ContentSuggestion {
  id: string
  suggestion_source: string
  original_url: string | null
  original_title: string | null
  suggested_title_pt: string | null
  suggested_summary_pt: string | null
  suggested_type: string
  suggested_topics: string[]
  ai_relevance_score: number | null
  ai_reasoning: string | null
  status: string
  priority: string
  admin_notes: string | null
  rejection_reason: string | null
  created_at: string
  reviewed_at: string | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  edited: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  published: 'Publicada',
  edited: 'Editada'
}

const SOURCE_ICONS: Record<string, any> = {
  ai_curator: Bot,
  manual: User,
  ai_internal: Sparkles,
  user_submitted: User
}

const SOURCE_LABELS: Record<string, string> = {
  ai_curator: 'IA Curadora',
  manual: 'Manual',
  ai_internal: 'IA Interna',
  user_submitted: 'Usuário'
}

export default function SugestoesPage() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showIACuradoraModal, setShowIACuradoraModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // Form states
  const [rejectReason, setRejectReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  
  // IA Curadora form
  const [iaRawText, setIaRawText] = useState('')
  const [iaUrl, setIaUrl] = useState('')
  const [iaSourceType, setIaSourceType] = useState('blog')

  const router = useRouter()
  const supabase = createClient()

  const loadSuggestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (sourceFilter) params.set('suggestion_source', sourceFilter)
      if (searchQuery) params.set('search', searchQuery)
      params.set('pageSize', '50')

      const response = await fetch(`/api/admin/content/suggestions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
    setLoading(false)
  }, [statusFilter, sourceFilter, searchQuery])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const handleApprove = async (publish: boolean = false) => {
    if (!selectedSuggestion) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/content/suggestions/${selectedSuggestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: publish ? 'published' : 'approved',
          admin_notes: adminNotes,
          publish_now: publish
        })
      })
      if (response.ok) {
        setSelectedSuggestion(null)
        setAdminNotes('')
        loadSuggestions()
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
    }
    setProcessing(false)
  }

  const handleReject = async () => {
    if (!selectedSuggestion || !rejectReason.trim()) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/content/suggestions/${selectedSuggestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectReason,
          admin_notes: adminNotes
        })
      })
      if (response.ok) {
        setSelectedSuggestion(null)
        setRejectReason('')
        setAdminNotes('')
        loadSuggestions()
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
    }
    setProcessing(false)
  }

  const handleIACuradoria = async () => {
    if (!iaRawText.trim() && !iaUrl.trim()) return
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/content/curadoria/ia-sugerir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: iaRawText,
          original_url: iaUrl,
          source_type: iaSourceType
        })
      })
      if (response.ok) {
        setShowIACuradoraModal(false)
        setIaRawText('')
        setIaUrl('')
        loadSuggestions()
      }
    } catch (error) {
      console.error('Erro na IA Curadora:', error)
    }
    setProcessing(false)
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  Sugestões de Conteúdo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie sugestões da IA Curadora e manuais
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowIACuradoraModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Bot className="w-4 h-4" />
                IA Curadora
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Nova Manual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Semáforo de Edição */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SemaforoCard
          level="yellow"
          description="Zona Amarela – Você está lidando com sugestões da IA. Pode editar/aceitar/rejeitar, mas mantenha os limites éticos do projeto."
        />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex gap-2">
            {['', 'pending', 'approved', 'rejected', 'published'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status === '' ? 'Todas' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">Todas as fontes</option>
            <option value="ai_curator">IA Curadora</option>
            <option value="manual">Manual</option>
            <option value="ai_internal">IA Interna</option>
          </select>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título ou URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          <button
            onClick={loadSuggestions}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <Lightbulb className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma sugestão encontrada</p>
              </div>
            ) : (
              suggestions.map(suggestion => {
                const SourceIcon = SOURCE_ICONS[suggestion.suggestion_source] || FileText
                return (
                  <div
                    key={suggestion.id}
                    onClick={() => setSelectedSuggestion(suggestion)}
                    className={`p-4 bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-all ${
                      selectedSuggestion?.id === suggestion.id
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <SourceIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {SOURCE_LABELS[suggestion.suggestion_source]}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[suggestion.status]}`}>
                            {STATUS_LABELS[suggestion.status]}
                          </span>
                          {suggestion.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Alta prioridade
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {suggestion.suggested_title_pt || suggestion.original_title || 'Sem título'}
                        </h3>
                        {suggestion.suggested_summary_pt && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {suggestion.suggested_summary_pt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(suggestion.created_at)}
                          </span>
                          {suggestion.ai_relevance_score && (
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {Math.round(suggestion.ai_relevance_score * 100)}% relevância
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedSuggestion ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                  {selectedSuggestion.suggested_title_pt || 'Sem título'}
                </h3>

                {selectedSuggestion.original_url && (
                  <a
                    href={selectedSuggestion.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver original
                  </a>
                )}

                {selectedSuggestion.suggested_summary_pt && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resumo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedSuggestion.suggested_summary_pt}
                    </p>
                  </div>
                )}

                {selectedSuggestion.suggested_topics?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedSuggestion.suggested_topics.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSuggestion.ai_reasoning && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Análise da IA</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                      {(() => {
                        try {
                          const parsed = JSON.parse(selectedSuggestion.ai_reasoning)
                          return parsed.justificativa || selectedSuggestion.ai_reasoning
                        } catch {
                          return selectedSuggestion.ai_reasoning
                        }
                      })()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedSuggestion.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notas do Admin
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
                        rows={2}
                        placeholder="Notas opcionais..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(true)}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Publicar
                      </button>
                      <button
                        onClick={() => handleApprove(false)}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Motivo da rejeição
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
                        rows={2}
                        placeholder="Por que está rejeitando?"
                      />
                    </div>
                    <button
                      onClick={handleReject}
                      disabled={processing || !rejectReason.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Lightbulb className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Selecione uma sugestão para ver detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IA Curadora Modal */}
      {showIACuradoraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-500" />
              IA Curadora
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Cole um texto ou URL para a IA analisar e sugerir conteúdo.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL do conteúdo (opcional)
                </label>
                <input
                  type="url"
                  value={iaUrl}
                  onChange={(e) => setIaUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texto para análise
                </label>
                <textarea
                  value={iaRawText}
                  onChange={(e) => setIaRawText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={6}
                  placeholder="Cole aqui o texto do artigo, notícia ou conteúdo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de fonte
                </label>
                <select
                  value={iaSourceType}
                  onChange={(e) => setIaSourceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="blog">Blog</option>
                  <option value="news">Notícia</option>
                  <option value="podcast">Podcast</option>
                  <option value="youtube">YouTube</option>
                  <option value="academic">Acadêmico</option>
                  <option value="book">Livro</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIACuradoraModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleIACuradoria}
                disabled={processing || (!iaRawText.trim() && !iaUrl.trim())}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Analisar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
