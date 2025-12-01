'use client'

/**
 * Painel Admin - Gerenciamento de Instâncias do Oráculo
 * ETAPA 33 - UI para Multi-instâncias Whitelabel
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  Copy, 
  CheckCircle,
  XCircle,
  Pause,
  Globe,
  Cpu,
  Users,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Palette
} from 'lucide-react'

interface OraculoInstance {
  id: string
  instance_slug: string
  instance_name: string
  owner_id: string | null
  status: 'active' | 'inactive' | 'suspended'
  modelo_ia: string
  temperatura: number
  max_tokens: number
  nome_assistente: string
  tom_comunicacao: string
  cor_primaria: string
  cor_secundaria: string
  created_at: string
  updated_at: string
}

interface InstanceFormData {
  instance_slug: string
  instance_name: string
  modelo_ia: string
  temperatura: number
  max_tokens: number
  nome_assistente: string
  tom_comunicacao: string
  cor_primaria: string
  cor_secundaria: string
  contexto_produto: string
  contexto_empresa: string
  prompt_adicional: string
}

const defaultFormData: InstanceFormData = {
  instance_slug: '',
  instance_name: '',
  modelo_ia: 'gpt-4o-mini',
  temperatura: 0.7,
  max_tokens: 1000,
  nome_assistente: 'Oráculo',
  tom_comunicacao: 'acolhedor',
  cor_primaria: '#8B5CF6',
  cor_secundaria: '#6366F1',
  contexto_produto: '',
  contexto_empresa: '',
  prompt_adicional: ''
}

export default function OraculoInstancesPage() {
  const router = useRouter()
  const [instances, setInstances] = useState<OraculoInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingInstance, setEditingInstance] = useState<OraculoInstance | null>(null)
  const [formData, setFormData] = useState<InstanceFormData>(defaultFormData)
  const [saving, setSaving] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Carregar instâncias
  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/oraculo-instances')
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar')
      
      setInstances(data.instances || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingInstance(null)
    setFormData(defaultFormData)
    setShowModal(true)
  }

  // Abrir modal para editar
  const handleEdit = async (instance: OraculoInstance) => {
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${instance.id}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setEditingInstance(data.instance)
      setFormData({
        instance_slug: data.instance.instance_slug,
        instance_name: data.instance.instance_name,
        modelo_ia: data.instance.modelo_ia || 'gpt-4o-mini',
        temperatura: data.instance.temperatura || 0.7,
        max_tokens: data.instance.max_tokens || 1000,
        nome_assistente: data.instance.nome_assistente || 'Oráculo',
        tom_comunicacao: data.instance.tom_comunicacao || 'acolhedor',
        cor_primaria: data.instance.cor_primaria || '#8B5CF6',
        cor_secundaria: data.instance.cor_secundaria || '#6366F1',
        contexto_produto: data.instance.contexto_produto || '',
        contexto_empresa: data.instance.contexto_empresa || '',
        prompt_adicional: data.instance.prompt_adicional || ''
      })
      setShowModal(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao carregar instância')
    }
  }

  // Salvar instância
  const handleSave = async () => {
    try {
      setSaving(true)
      
      const url = editingInstance 
        ? `/api/admin/oraculo-instances/${editingInstance.id}`
        : '/api/admin/oraculo-instances'
      
      const method = editingInstance ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setShowModal(false)
      loadInstances()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // Deletar instância
  const handleDelete = async (instance: OraculoInstance) => {
    if (instance.instance_slug === 'radar-narcisista') {
      alert('Não é possível deletar a instância padrão')
      return
    }
    
    if (!confirm(`Deletar instância "${instance.instance_name}"?`)) return
    
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${instance.id}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      loadInstances()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar')
    }
  }

  // Copiar slug
  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      active: { icon: CheckCircle, color: 'text-green-400 bg-green-500/20', label: 'Ativa' },
      inactive: { icon: XCircle, color: 'text-gray-400 bg-gray-500/20', label: 'Inativa' },
      suspended: { icon: Pause, color: 'text-yellow-400 bg-yellow-500/20', label: 'Suspensa' }
    }[status] || { icon: XCircle, color: 'text-gray-400 bg-gray-500/20', label: status }
    
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                  Instâncias do Oráculo
                </h1>
                <p className="text-sm text-gray-400">Gerencie instâncias whitelabel do Oráculo V2</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Instância
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.length}</p>
                <p className="text-sm text-gray-400">Total de Instâncias</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.filter(i => i.status === 'active').length}</p>
                <p className="text-sm text-gray-400">Ativas</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(instances.map(i => i.modelo_ia)).size}</p>
                <p className="text-sm text-gray-400">Modelos IA</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <Users className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instances.filter(i => i.owner_id).length}</p>
                <p className="text-sm text-gray-400">Whitelabel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instances List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold">Todas as Instâncias</h2>
          </div>
          
          {instances.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma instância encontrada</p>
              <button
                onClick={handleCreate}
                className="mt-4 text-violet-400 hover:text-violet-300"
              >
                Criar primeira instância
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {instances.map(instance => (
                <div key={instance.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Color indicator */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: instance.cor_primaria + '30' }}
                      >
                        <Sparkles className="w-5 h-5" style={{ color: instance.cor_primaria }} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{instance.instance_name}</h3>
                          <StatusBadge status={instance.status} />
                          {instance.instance_slug === 'radar-narcisista' && (
                            <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs rounded-full">
                              Padrão
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                          <button
                            onClick={() => handleCopySlug(instance.instance_slug)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <code className="bg-slate-700 px-2 py-0.5 rounded text-xs">
                              {instance.instance_slug}
                            </code>
                            {copiedSlug === instance.instance_slug ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            {instance.modelo_ia}
                          </span>
                          <span>
                            Assistente: {instance.nome_assistente}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/oraculo-instances/${instance.id}`}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Ver métricas"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(instance)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {instance.instance_slug !== 'radar-narcisista' && (
                        <button
                          onClick={() => handleDelete(instance)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold">
                {editingInstance ? 'Editar Instância' : 'Nova Instância'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Identificação */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Identificação
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={formData.instance_slug}
                      onChange={e => setFormData({ ...formData, instance_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="minha-clinica"
                      disabled={!!editingInstance}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={formData.instance_name}
                      onChange={e => setFormData({ ...formData, instance_name: e.target.value })}
                      placeholder="Minha Clínica"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Configurações de IA */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Configurações de IA
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Modelo</label>
                    <select
                      value={formData.modelo_ia}
                      onChange={e => setFormData({ ...formData, modelo_ia: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Temperatura ({formData.temperatura})</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperatura}
                      onChange={e => setFormData({ ...formData, temperatura: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Tokens</label>
                    <input
                      type="number"
                      value={formData.max_tokens}
                      onChange={e => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                      min={100}
                      max={4000}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personalização */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Personalização
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome do Assistente</label>
                    <input
                      type="text"
                      value={formData.nome_assistente}
                      onChange={e => setFormData({ ...formData, nome_assistente: e.target.value })}
                      placeholder="Oráculo"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tom de Comunicação</label>
                    <select
                      value={formData.tom_comunicacao}
                      onChange={e => setFormData({ ...formData, tom_comunicacao: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                    >
                      <option value="acolhedor">Acolhedor</option>
                      <option value="profissional">Profissional</option>
                      <option value="tecnico">Técnico</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Branding
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cor Primária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.cor_primaria}
                        onChange={e => setFormData({ ...formData, cor_primaria: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.cor_primaria}
                        onChange={e => setFormData({ ...formData, cor_primaria: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.cor_secundaria}
                        onChange={e => setFormData({ ...formData, cor_secundaria: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.cor_secundaria}
                        onChange={e => setFormData({ ...formData, cor_secundaria: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contexto */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-300">Contexto</h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contexto do Produto</label>
                  <textarea
                    value={formData.contexto_produto}
                    onChange={e => setFormData({ ...formData, contexto_produto: e.target.value })}
                    placeholder="Descreva o produto/serviço que esta instância representa..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Instruções Adicionais</label>
                  <textarea
                    value={formData.prompt_adicional}
                    onChange={e => setFormData({ ...formData, prompt_adicional: e.target.value })}
                    placeholder="Instruções específicas para o assistente desta instância..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.instance_slug || !formData.instance_name}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {saving ? 'Salvando...' : (editingInstance ? 'Salvar' : 'Criar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
