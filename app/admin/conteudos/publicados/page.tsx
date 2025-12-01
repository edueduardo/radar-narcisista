'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  Plus,
  Edit,
  Archive,
  Eye,
  Star,
  Clock,
  RefreshCw,
  ArrowLeft,
  Filter,
  ExternalLink,
  Save,
  X
} from 'lucide-react'
import { SemaforoCard } from '@/components/admin/EditSemaforoBadge'

// ============================================================================
// ADMIN: CONTEÚDOS PUBLICADOS
// Gerencia content_items (artigos, FAQs, notícias, lições)
// ============================================================================

interface ContentItem {
  id: string
  slug: string
  content_type: string
  source_type: string
  title_pt: string
  summary_pt: string | null
  body_pt: string | null
  topics: string[]
  visibility: string
  is_featured: boolean
  is_pinned: boolean
  view_count: number
  created_at: string
  updated_at: string
}

const VISIBILITY_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  private: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  public: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const VISIBILITY_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  private: 'Privado',
  public: 'Público',
  archived: 'Arquivado'
}

const TYPE_LABELS: Record<string, string> = {
  article: 'Artigo',
  faq: 'FAQ',
  news: 'Notícia',
  lesson: 'Lição',
  tip: 'Dica',
  story: 'História',
  resource: 'Recurso'
}

export default function PublicadosPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Edit form
  const [editForm, setEditForm] = useState({
    title_pt: '',
    summary_pt: '',
    body_pt: '',
    content_type: 'article',
    topics: [] as string[],
    visibility: 'draft',
    is_featured: false
  })
  const [newTopic, setNewTopic] = useState('')

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (visibilityFilter) params.set('visibility', visibilityFilter)
      if (typeFilter) params.set('content_type', typeFilter)
      if (searchQuery) params.set('search', searchQuery)
      params.set('pageSize', '50')

      const response = await fetch(`/api/admin/content/items?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    }
    setLoading(false)
  }, [visibilityFilter, typeFilter, searchQuery])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const openEditModal = (item: ContentItem) => {
    setSelectedItem(item)
    setEditForm({
      title_pt: item.title_pt,
      summary_pt: item.summary_pt || '',
      body_pt: item.body_pt || '',
      content_type: item.content_type,
      topics: item.topics || [],
      visibility: item.visibility,
      is_featured: item.is_featured
    })
    setShowEditModal(true)
  }

  const handleSave = async () => {
    if (!selectedItem) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/content/items/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (response.ok) {
        setShowEditModal(false)
        setSelectedItem(null)
        loadItems()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
    setProcessing(false)
  }

  const handleArchive = async (item: ContentItem) => {
    if (!confirm('Arquivar este conteúdo?')) return
    try {
      await fetch(`/api/admin/content/items/${item.id}`, {
        method: 'DELETE'
      })
      loadItems()
    } catch (error) {
      console.error('Erro ao arquivar:', error)
    }
  }

  const handleCreate = async () => {
    setProcessing(true)
    try {
      const slug = editForm.title_pt
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50) + '-' + Date.now().toString(36)

      const response = await fetch('/api/admin/content/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          ...editForm
        })
      })
      if (response.ok) {
        setShowNewModal(false)
        setEditForm({
          title_pt: '',
          summary_pt: '',
          body_pt: '',
          content_type: 'article',
          topics: [],
          visibility: 'draft',
          is_featured: false
        })
        loadItems()
      }
    } catch (error) {
      console.error('Erro ao criar:', error)
    }
    setProcessing(false)
  }

  const addTopic = () => {
    if (newTopic.trim() && !editForm.topics.includes(newTopic.trim())) {
      setEditForm({ ...editForm, topics: [...editForm.topics, newTopic.trim()] })
      setNewTopic('')
    }
  }

  const removeTopic = (topic: string) => {
    setEditForm({ ...editForm, topics: editForm.topics.filter(t => t !== topic) })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
                  <FileText className="w-6 h-6 text-blue-500" />
                  Conteúdos Publicados
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie artigos, FAQs, notícias e lições
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditForm({
                  title_pt: '',
                  summary_pt: '',
                  body_pt: '',
                  content_type: 'article',
                  topics: [],
                  visibility: 'draft',
                  is_featured: false
                })
                setShowNewModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Novo Conteúdo
            </button>
          </div>
        </div>
      </div>

      {/* Semáforo de Edição */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SemaforoCard
          level="green"
          description="Zona Verde – Conteúdo publicado da FanPage Viva. Você pode editar textos, títulos, resumos e estrutura de forma segura, sem mexer na lógica crítica do sistema."
        />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Visibility Filter */}
          <div className="flex gap-2">
            {['', 'draft', 'public', 'private', 'archived'].map(vis => (
              <button
                key={vis}
                onClick={() => setVisibilityFilter(vis)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  visibilityFilter === vis
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {vis === '' ? 'Todos' : VISIBILITY_LABELS[vis]}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          <button
            onClick={loadItems}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum conteúdo encontrado</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Atualizado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                        <span className="font-medium text-gray-900 dark:text-white">{item.title_pt}</span>
                      </div>
                      {item.topics?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.topics.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                              {tag}
                            </span>
                          ))}
                          {item.topics.length > 3 && (
                            <span className="text-xs text-gray-400">+{item.topics.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {TYPE_LABELS[item.content_type] || item.content_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${VISIBILITY_COLORS[item.visibility]}`}>
                        {VISIBILITY_LABELS[item.visibility]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.view_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(item)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/New Modal */}
      {(showEditModal || showNewModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showNewModal ? 'Novo Conteúdo' : 'Editar Conteúdo'}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setShowNewModal(false)
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={editForm.title_pt}
                  onChange={(e) => setEditForm({ ...editForm, title_pt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={editForm.content_type}
                    onChange={(e) => setEditForm({ ...editForm, content_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Visibilidade
                  </label>
                  <select
                    value={editForm.visibility}
                    onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    {Object.entries(VISIBILITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resumo
                </label>
                <textarea
                  value={editForm.summary_pt}
                  onChange={(e) => setEditForm({ ...editForm, summary_pt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conteúdo (Markdown)
                </label>
                <textarea
                  value={editForm.body_pt}
                  onChange={(e) => setEditForm({ ...editForm, body_pt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Adicionar tag..."
                  />
                  <button
                    onClick={addTopic}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.topics.map(topic => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded flex items-center gap-1 text-sm"
                    >
                      {topic}
                      <button onClick={() => removeTopic(topic)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={editForm.is_featured}
                  onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">
                  Destacar na frontpage
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setShowNewModal(false)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={showNewModal ? handleCreate : handleSave}
                disabled={processing || !editForm.title_pt.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
