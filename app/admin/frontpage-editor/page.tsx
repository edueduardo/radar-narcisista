'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Type,
  MessageSquare,
  Star,
  HelpCircle,
  Megaphone,
  BarChart3,
  RefreshCw,
  Check,
  X,
  ExternalLink
} from 'lucide-react'

// Tipos
interface ConfigValue {
  id: string
  value: any
  description: string
  is_active: boolean
  updated_at: string
}

interface Configs {
  [key: string]: ConfigValue
}

// Componente de Editor de Seção
function SectionEditor({ 
  title, 
  configKey, 
  config, 
  onSave,
  children 
}: { 
  title: string
  configKey: string
  config: ConfigValue | undefined
  onSave: (key: string, value: any) => Promise<void>
  children: React.ReactNode
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const handleToggleActive = async () => {
    if (!config) return
    setIsSaving(true)
    await onSave(configKey, { ...config.value, _is_active: !config.is_active })
    setIsSaving(false)
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {config?.is_active ? (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Ativo</span>
          ) : (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inativo</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleActive() }}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={config?.is_active ? 'Desativar seção' : 'Ativar seção'}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : config?.is_active ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}

// Editor de Hero
function HeroEditor({ config, onSave }: { config: ConfigValue | undefined, onSave: (value: any) => void }) {
  const [values, setValues] = useState(config?.value || {})
  
  useEffect(() => {
    if (config?.value) setValues(config.value)
  }, [config])
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
        <input
          type="text"
          value={values.title || ''}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
        <textarea
          value={values.subtitle || ''}
          onChange={(e) => setValues({ ...values, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Botão Primário (Texto)</label>
          <input
            type="text"
            value={values.cta_primary || ''}
            onChange={(e) => setValues({ ...values, cta_primary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Botão Primário (Link)</label>
          <input
            type="text"
            value={values.cta_primary_link || ''}
            onChange={(e) => setValues({ ...values, cta_primary_link: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Botão Secundário (Texto)</label>
          <input
            type="text"
            value={values.cta_secondary || ''}
            onChange={(e) => setValues({ ...values, cta_secondary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Botão Secundário (Link)</label>
          <input
            type="text"
            value={values.cta_secondary_link || ''}
            onChange={(e) => setValues({ ...values, cta_secondary_link: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      <button
        onClick={() => onSave(values)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Salvar Hero
      </button>
    </div>
  )
}

// Editor de FAQ
function FAQEditor({ config, onSave }: { config: ConfigValue | undefined, onSave: (value: any) => void }) {
  const [values, setValues] = useState(config?.value || { items: [] })
  
  useEffect(() => {
    if (config?.value) setValues(config.value)
  }, [config])
  
  const addItem = () => {
    setValues({
      ...values,
      items: [...(values.items || []), { question: '', answer: '' }]
    })
  }
  
  const removeItem = (index: number) => {
    setValues({
      ...values,
      items: values.items.filter((_: any, i: number) => i !== index)
    })
  }
  
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...values.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setValues({ ...values, items: newItems })
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
        <input
          type="text"
          value={values.title || ''}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Perguntas e Respostas</label>
        {values.items?.map((item: any, index: number) => (
          <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.question || ''}
                  onChange={(e) => updateItem(index, 'question', e.target.value)}
                  placeholder="Pergunta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={() => removeItem(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={item.answer || ''}
              onChange={(e) => updateItem(index, 'answer', e.target.value)}
              placeholder="Resposta"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-500 flex items-center gap-2 w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pergunta
        </button>
      </div>
      
      <button
        onClick={() => onSave(values)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Salvar FAQ
      </button>
    </div>
  )
}

// Editor de Depoimentos
function TestimonialsEditor({ config, onSave }: { config: ConfigValue | undefined, onSave: (value: any) => void }) {
  const [values, setValues] = useState(config?.value || { items: [] })
  
  useEffect(() => {
    if (config?.value) setValues(config.value)
  }, [config])
  
  const addItem = () => {
    setValues({
      ...values,
      items: [...(values.items || []), { name: '', location: '', text: '', rating: 5 }]
    })
  }
  
  const removeItem = (index: number) => {
    setValues({
      ...values,
      items: values.items.filter((_: any, i: number) => i !== index)
    })
  }
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...values.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setValues({ ...values, items: newItems })
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
        <input
          type="text"
          value={values.title || ''}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Depoimentos</label>
        {values.items?.map((item: any, index: number) => (
          <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="Nome"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={item.location || ''}
                  onChange={(e) => updateItem(index, 'location', e.target.value)}
                  placeholder="Cidade, Estado"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={() => removeItem(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={item.text || ''}
              onChange={(e) => updateItem(index, 'text', e.target.value)}
              placeholder="Depoimento"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Avaliação:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => updateItem(index, 'rating', star)}
                  className={`p-1 ${item.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-500 flex items-center gap-2 w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Adicionar Depoimento
        </button>
      </div>
      
      <button
        onClick={() => onSave(values)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Salvar Depoimentos
      </button>
    </div>
  )
}

// Editor de Configurações Gerais
function GeneralEditor({ config, onSave }: { config: ConfigValue | undefined, onSave: (value: any) => void }) {
  const [values, setValues] = useState(config?.value || {})
  
  useEffect(() => {
    if (config?.value) setValues(config.value)
  }, [config])
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Site</label>
          <input
            type="text"
            value={values.site_name || ''}
            onChange={(e) => setValues({ ...values, site_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
          <input
            type="text"
            value={values.tagline || ''}
            onChange={(e) => setValues({ ...values, tagline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="show_promo"
          checked={values.show_promo_banner || false}
          onChange={(e) => setValues({ ...values, show_promo_banner: e.target.checked })}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <label htmlFor="show_promo" className="text-sm text-gray-700">Mostrar banner de promoção</label>
      </div>
      
      {values.show_promo_banner && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Banner</label>
          <input
            type="text"
            value={values.promo_banner_text || ''}
            onChange={(e) => setValues({ ...values, promo_banner_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}
      
      <button
        onClick={() => onSave(values)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Salvar Configurações
      </button>
    </div>
  )
}

// Página Principal
export default function FrontpageEditorPage() {
  const [configs, setConfigs] = useState<Configs>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // Carregar configurações
  const loadConfigs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/frontpage-editor')
      const data = await response.json()
      
      if (data.success) {
        setConfigs(data.configs)
      } else {
        setError(data.error || 'Erro ao carregar configurações')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadConfigs()
  }, [])
  
  // Salvar configuração
  const handleSave = async (configKey: string, value: any) => {
    setSaving(configKey)
    setError(null)
    setSuccess(null)
    
    try {
      // Separar _is_active do valor se existir
      const { _is_active, ...configValue } = value
      
      const response = await fetch('/api/admin/frontpage-editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_key: configKey,
          config_value: Object.keys(configValue).length > 0 ? configValue : configs[configKey]?.value,
          is_active: _is_active !== undefined ? _is_active : undefined
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`"${configKey}" salvo com sucesso!`)
        await loadConfigs() // Recarregar
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Erro ao salvar')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setSaving(null)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando editor...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editor da Frontpage</h1>
                <p className="text-sm text-gray-500">Edite textos e seções sem código</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadConfigs}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </button>
              <Link
                href="/"
                target="_blank"
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Site
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alertas */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <X className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Info sobre Builder.io */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">Editor Visual Avançado (Builder.io)</h2>
              <p className="text-indigo-100 text-sm mb-3">
                Para edição visual drag-and-drop completa, acesse o Builder.io. 
                Lá você pode criar seções customizadas, reorganizar elementos e ver preview em tempo real.
              </p>
              <a
                href="https://builder.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Builder.io
              </a>
            </div>
          </div>
        </div>
        
        {/* Seções Editáveis */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Type className="w-5 h-5 text-purple-600" />
            Seções da Frontpage
          </h2>
          
          {/* Configurações Gerais */}
          <SectionEditor
            title="⚙️ Configurações Gerais"
            configKey="general"
            config={configs.general}
            onSave={handleSave}
          >
            <GeneralEditor 
              config={configs.general} 
              onSave={(value) => handleSave('general', value)} 
            />
          </SectionEditor>
          
          {/* Hero */}
          <SectionEditor
            title="🎯 Hero (Seção Principal)"
            configKey="hero"
            config={configs.hero}
            onSave={handleSave}
          >
            <HeroEditor 
              config={configs.hero} 
              onSave={(value) => handleSave('hero', value)} 
            />
          </SectionEditor>
          
          {/* Estatísticas */}
          <SectionEditor
            title="📊 Estatísticas"
            configKey="stats"
            config={configs.stats}
            onSave={handleSave}
          >
            <div className="text-sm text-gray-500">
              <p>Editor de estatísticas em desenvolvimento.</p>
              <p className="mt-2">Dados atuais:</p>
              <pre className="mt-2 p-3 bg-white rounded-lg text-xs overflow-auto">
                {JSON.stringify(configs.stats?.value, null, 2)}
              </pre>
            </div>
          </SectionEditor>
          
          {/* FAQ */}
          <SectionEditor
            title="❓ FAQ (Perguntas Frequentes)"
            configKey="faq"
            config={configs.faq}
            onSave={handleSave}
          >
            <FAQEditor 
              config={configs.faq} 
              onSave={(value) => handleSave('faq', value)} 
            />
          </SectionEditor>
          
          {/* Depoimentos */}
          <SectionEditor
            title="⭐ Depoimentos"
            configKey="testimonials"
            config={configs.testimonials}
            onSave={handleSave}
          >
            <TestimonialsEditor 
              config={configs.testimonials} 
              onSave={(value) => handleSave('testimonials', value)} 
            />
          </SectionEditor>
          
          {/* CTA Final */}
          <SectionEditor
            title="📢 CTA Final"
            configKey="cta_final"
            config={configs.cta_final}
            onSave={handleSave}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  defaultValue={configs.cta_final?.value?.title || ''}
                  onChange={(e) => {
                    const newValue = { ...configs.cta_final?.value, title: e.target.value }
                    setConfigs({ ...configs, cta_final: { ...configs.cta_final, value: newValue } as ConfigValue })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <textarea
                  defaultValue={configs.cta_final?.value?.subtitle || ''}
                  onChange={(e) => {
                    const newValue = { ...configs.cta_final?.value, subtitle: e.target.value }
                    setConfigs({ ...configs, cta_final: { ...configs.cta_final, value: newValue } as ConfigValue })
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={() => handleSave('cta_final', configs.cta_final?.value)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar CTA
              </button>
            </div>
          </SectionEditor>
        </div>
        
        {/* Dica */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Dica</h3>
          <p className="text-sm text-amber-700">
            As alterações são salvas no banco de dados e refletem imediatamente na frontpage. 
            Para edição visual avançada (arrastar e soltar, criar novas seções), use o Builder.io.
          </p>
        </div>
      </div>
    </div>
  )
}
