'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Plus,
  Edit,
  Archive,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Save,
  X,
  Star,
  Lock,
  Layers,
  Trash2
} from 'lucide-react'
import { SemaforoCard } from '@/components/admin/EditSemaforoBadge'

// ============================================================================
// ADMIN: COLEÇÕES / TRILHAS (RADAR ACADEMY)
// ============================================================================

interface ContentCollection {
  id: string
  slug: string
  collection_type: string
  name_pt: string
  description_pt: string | null
  icon: string
  color: string
  visibility: string
  is_featured: boolean
  is_premium: boolean
  item_count: number
  created_at: string
}

interface CollectionItem {
  id: string
  position: number
  is_required: boolean
  content_item_id: string
  content_items: {
    id: string
    slug: string
    title_pt: string
    content_type: string
    visibility: string
  }
}

const TYPE_LABELS: Record<string, string> = {
  trail: 'Trilha',
  series: 'Série',
  topic: 'Tópico',
  featured: 'Destaque'
}

const VISIBILITY_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  public: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export default function ColecoesPage() {
  const [collections, setCollections] = useState<ContentCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState<ContentCollection | null>(null)
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [availableItems, setAvailableItems] = useState<any[]>([])

  const [form, setForm] = useState({
    name_pt: '',
    description_pt: '',
    collection_type: 'trail',
    visibility: 'draft',
    is_featured: false,
    is_premium: false
  })

  const loadCollections = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/content/collections?pageSize=50')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    }
    setLoading(false)
  }, [])

  const loadCollectionItems = async (collectionId: string) => {
    setLoadingItems(true)
    try {
      const response = await fetch(`/api/admin/content/collections/${collectionId}/items`)
      if (response.ok) {
        const data = await response.json()
        setCollectionItems(data.items || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    }
    setLoadingItems(false)
  }

  const loadAvailableItems = async () => {
    try {
      const response = await fetch('/api/admin/content/items?visibility=public&pageSize=100')
      if (response.ok) {
        const data = await response.json()
        setAvailableItems(data.data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  useEffect(() => {
    if (selectedCollection) {
      loadCollectionItems(selectedCollection.id)
    }
  }, [selectedCollection])

  const handleCreate = async () => {
    if (!form.name_pt.trim()) return
    setProcessing(true)
    try {
      const slug = form.name_pt.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50) + '-' + Date.now().toString(36)
      const response = await fetch('/api/admin/content/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form })
      })
      if (response.ok) {
        setShowNewModal(false)
        setForm({ name_pt: '', description_pt: '', collection_type: 'trail', visibility: 'draft', is_featured: false, is_premium: false })
        loadCollections()
      }
    } catch (error) {
      console.error('Erro:', error)
    }
    setProcessing(false)
  }

  const handleUpdate = async () => {
    if (!selectedCollection) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/content/collections/${selectedCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (response.ok) {
        setShowEditModal(false)
        loadCollections()
      }
    } catch (error) {
      console.error('Erro:', error)
    }
    setProcessing(false)
  }

  const handleAddItem = async (contentItemId: string) => {
    if (!selectedCollection) return
    try {
      await fetch(`/api/admin/content/collections/${selectedCollection.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_item_id: contentItemId })
      })
      loadCollectionItems(selectedCollection.id)
      loadCollections()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedCollection || !confirm('Remover item?')) return
    try {
      await fetch(`/api/admin/content/collections/${selectedCollection.id}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId })
      })
      loadCollectionItems(selectedCollection.id)
      loadCollections()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-purple-500" />
                  Coleções / Trilhas
                </h1>
                <p className="text-sm text-gray-500">Radar Academy - Monte trilhas de aprendizado</p>
              </div>
            </div>
            <button
              onClick={() => {
                setForm({ name_pt: '', description_pt: '', collection_type: 'trail', visibility: 'draft', is_featured: false, is_premium: false })
                setShowNewModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Nova Coleção
            </button>
          </div>
        </div>
      </div>

      {/* Semáforo de Edição */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SemaforoCard
          level="green"
          description="Zona Verde – Organização da Radar Academy. Você está apenas montando trilhas de conteúdo."
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collections List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-gray-700 dark:text-gray-300">Coleções</h2>
              <button onClick={loadCollections} className="p-1 text-gray-400 hover:text-gray-600">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
                <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Nenhuma coleção</p>
              </div>
            ) : (
              collections.map(collection => (
                <div
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-all ${
                    selectedCollection?.id === collection.id
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {collection.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                        {collection.is_premium && <Lock className="w-4 h-4 text-purple-500" />}
                        <span className={`px-2 py-0.5 rounded text-xs ${VISIBILITY_COLORS[collection.visibility]}`}>
                          {collection.visibility}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{collection.name_pt}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {TYPE_LABELS[collection.collection_type]} • {collection.item_count} itens
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Collection Detail */}
          <div className="lg:col-span-2">
            {selectedCollection ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCollection.name_pt}</h2>
                    {selectedCollection.description_pt && (
                      <p className="text-sm text-gray-500 mt-1">{selectedCollection.description_pt}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setForm({
                          name_pt: selectedCollection.name_pt,
                          description_pt: selectedCollection.description_pt || '',
                          collection_type: selectedCollection.collection_type,
                          visibility: selectedCollection.visibility,
                          is_featured: selectedCollection.is_featured,
                          is_premium: selectedCollection.is_premium
                        })
                        setShowEditModal(true)
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Itens da Coleção</h3>
                    <button
                      onClick={() => {
                        loadAvailableItems()
                        setShowAddItemModal(true)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>

                  {loadingItems ? (
                    <div className="text-center py-8 text-gray-500">Carregando...</div>
                  ) : collectionItems.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <BookOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">Nenhum item nesta coleção</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {collectionItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {item.content_items?.title_pt || 'Item sem título'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.content_items?.content_type} • {item.is_required ? 'Obrigatório' : 'Opcional'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Selecione uma coleção para ver detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New/Edit Modal */}
      {(showNewModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {showNewModal ? 'Nova Coleção' : 'Editar Coleção'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name_pt}
                  onChange={(e) => setForm({ ...form, name_pt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={form.description_pt}
                  onChange={(e) => setForm({ ...form, description_pt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={form.collection_type}
                    onChange={(e) => setForm({ ...form, collection_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibilidade</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="public">Público</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Destaque</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_premium}
                    onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowNewModal(false); setShowEditModal(false) }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={showNewModal ? handleCreate : handleUpdate}
                disabled={processing || !form.name_pt.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {processing ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Item</h2>
              <button onClick={() => setShowAddItemModal(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-96 space-y-2">
              {availableItems.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhum conteúdo disponível</p>
              ) : (
                availableItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleAddItem(item.id)
                      setShowAddItemModal(false)
                    }}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{item.title_pt}</p>
                    <p className="text-xs text-gray-500">{item.content_type}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
