'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Settings,
  Type,
  Star,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Layout,
  Image as ImageIcon,
  Move,
  ChevronUp,
  ChevronDown
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

// Componente de Preview da Frontpage
function FrontpagePreview({ configs, viewMode }: { configs: Configs, viewMode: 'desktop' | 'tablet' | 'mobile' }) {
  const widthClass = viewMode === 'desktop' ? 'w-full' : viewMode === 'tablet' ? 'max-w-[768px]' : 'max-w-[375px]'
  
  const hero = configs.hero?.value || {}
  const stats = configs.stats?.value || {}
  const faq = configs.faq?.value || {}
  const testimonials = configs.testimonials?.value || {}
  const ctaFinal = configs.cta_final?.value || {}
  const general = configs.general?.value || {}
  
  return (
    <div className={`${widthClass} mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300`}>
      {/* Banner de Promoção */}
      {general.show_promo_banner && general.promo_banner_text && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm">
          {general.promo_banner_text}
        </div>
      )}
      
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${hero.background_gradient || 'from-purple-900 via-violet-900 to-indigo-900'} text-white py-16 px-6`}>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {hero.title || 'Título Principal'}
          </h1>
          <p className="text-lg text-purple-200 mb-8">
            {hero.subtitle || 'Subtítulo descritivo'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-100 transition-colors">
              {hero.cta_primary || 'Botão Primário'}
            </button>
            <button className="px-6 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              {hero.cta_secondary || 'Botão Secundário'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      {stats.enabled !== false && stats.items?.length > 0 && (
        <div className="bg-gray-50 py-8 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.items.map((item: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-purple-600">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* FAQ Section */}
      {faq.enabled !== false && faq.items?.length > 0 && (
        <div className="py-12 px-6">
          <h2 className="text-2xl font-bold text-center mb-8">{faq.title || 'FAQ'}</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faq.items.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-sm text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Testimonials Section */}
      {testimonials.enabled !== false && testimonials.items?.length > 0 && (
        <div className="bg-purple-50 py-12 px-6">
          <h2 className="text-2xl font-bold text-center mb-8">{testimonials.title || 'Depoimentos'}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.items.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-3">"{item.text}"</p>
                <div className="text-sm">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-gray-500"> • {item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* CTA Final */}
      {ctaFinal.enabled !== false && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">{ctaFinal.title || 'CTA Final'}</h2>
          <p className="text-purple-200 mb-6">{ctaFinal.subtitle || 'Subtítulo'}</p>
          <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
            {ctaFinal.button_text || 'Botão'}
          </button>
        </div>
      )}
    </div>
  )
}

// Painel de Edição Rápida
function QuickEditPanel({ 
  configs, 
  onUpdate,
  selectedSection,
  setSelectedSection
}: { 
  configs: Configs
  onUpdate: (key: string, value: any) => void
  selectedSection: string | null
  setSelectedSection: (s: string | null) => void
}) {
  const sections = [
    { id: 'general', label: '⚙️ Geral', icon: Settings },
    { id: 'hero', label: '🎯 Hero', icon: Layout },
    { id: 'stats', label: '📊 Estatísticas', icon: Type },
    { id: 'faq', label: '❓ FAQ', icon: Type },
    { id: 'testimonials', label: '⭐ Depoimentos', icon: Star },
    { id: 'cta_final', label: '📢 CTA Final', icon: Type },
  ]
  
  return (
    <div className="h-full flex flex-col">
      {/* Lista de Seções */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Seções</h3>
        <div className="space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                selectedSection === section.id 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Editor da Seção Selecionada */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedSection === 'hero' && (
          <HeroQuickEdit 
            value={configs.hero?.value || {}} 
            onChange={(v) => onUpdate('hero', v)} 
          />
        )}
        {selectedSection === 'general' && (
          <GeneralQuickEdit 
            value={configs.general?.value || {}} 
            onChange={(v) => onUpdate('general', v)} 
          />
        )}
        {selectedSection === 'faq' && (
          <FAQQuickEdit 
            value={configs.faq?.value || {}} 
            onChange={(v) => onUpdate('faq', v)} 
          />
        )}
        {selectedSection === 'testimonials' && (
          <TestimonialsQuickEdit 
            value={configs.testimonials?.value || {}} 
            onChange={(v) => onUpdate('testimonials', v)} 
          />
        )}
        {selectedSection === 'cta_final' && (
          <CTAQuickEdit 
            value={configs.cta_final?.value || {}} 
            onChange={(v) => onUpdate('cta_final', v)} 
          />
        )}
        {!selectedSection && (
          <div className="text-center text-gray-500 py-8">
            <Layout className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Selecione uma seção para editar</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Editores Rápidos
function HeroQuickEdit({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Hero Section</h4>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
        <textarea
          value={value.subtitle || ''}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Botão 1</label>
          <input
            type="text"
            value={value.cta_primary || ''}
            onChange={(e) => onChange({ ...value, cta_primary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Botão 2</label>
          <input
            type="text"
            value={value.cta_secondary || ''}
            onChange={(e) => onChange({ ...value, cta_secondary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}

function GeneralQuickEdit({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Configurações Gerais</h4>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Site</label>
        <input
          type="text"
          value={value.site_name || ''}
          onChange={(e) => onChange({ ...value, site_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="promo"
          checked={value.show_promo_banner || false}
          onChange={(e) => onChange({ ...value, show_promo_banner: e.target.checked })}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <label htmlFor="promo" className="text-sm text-gray-700">Mostrar banner de promoção</label>
      </div>
      {value.show_promo_banner && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Banner</label>
          <input
            type="text"
            value={value.promo_banner_text || ''}
            onChange={(e) => onChange({ ...value, promo_banner_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  )
}

function FAQQuickEdit({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  const items = value.items || []
  
  const addItem = () => {
    onChange({ ...value, items: [...items, { question: '', answer: '' }] })
  }
  
  const updateItem = (index: number, field: string, val: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: val }
    onChange({ ...value, items: newItems })
  }
  
  const removeItem = (index: number) => {
    onChange({ ...value, items: items.filter((_: any, i: number) => i !== index) })
  }
  
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">FAQ</h4>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título da Seção</label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="space-y-3">
        {items.map((item: any, index: number) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Pergunta {index + 1}</span>
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.question || ''}
              onChange={(e) => updateItem(index, 'question', e.target.value)}
              placeholder="Pergunta"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <textarea
              value={item.answer || ''}
              onChange={(e) => updateItem(index, 'answer', e.target.value)}
              placeholder="Resposta"
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-500 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pergunta
        </button>
      </div>
    </div>
  )
}

function TestimonialsQuickEdit({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  const items = value.items || []
  
  const addItem = () => {
    onChange({ ...value, items: [...items, { name: '', location: '', text: '', rating: 5 }] })
  }
  
  const updateItem = (index: number, field: string, val: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: val }
    onChange({ ...value, items: newItems })
  }
  
  const removeItem = (index: number) => {
    onChange({ ...value, items: items.filter((_: any, i: number) => i !== index) })
  }
  
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Depoimentos</h4>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título da Seção</label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="space-y-3">
        {items.map((item: any, index: number) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Depoimento {index + 1}</span>
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="Nome"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={item.location || ''}
                onChange={(e) => updateItem(index, 'location', e.target.value)}
                placeholder="Cidade"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <textarea
              value={item.text || ''}
              onChange={(e) => updateItem(index, 'text', e.target.value)}
              placeholder="Depoimento"
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => updateItem(index, 'rating', star)}
                  className={`p-0.5 ${item.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-500 text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Depoimento
        </button>
      </div>
    </div>
  )
}

function CTAQuickEdit({ value, onChange }: { value: any, onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">CTA Final</h4>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
        <input
          type="text"
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
        <textarea
          value={value.subtitle || ''}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Botão</label>
        <input
          type="text"
          value={value.button_text || ''}
          onChange={(e) => onChange({ ...value, button_text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  )
}

// Página Principal
export default function FrontpageVisualEditorPage() {
  const [configs, setConfigs] = useState<Configs>({})
  const [localConfigs, setLocalConfigs] = useState<Configs>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [selectedSection, setSelectedSection] = useState<string | null>('hero')
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
        setLocalConfigs(data.configs)
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
  
  // Atualizar config local (preview em tempo real)
  const handleLocalUpdate = useCallback((key: string, value: any) => {
    setLocalConfigs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }))
    setHasChanges(true)
  }, [])
  
  // Salvar todas as alterações
  const handleSaveAll = async () => {
    setSaving(true)
    setError(null)
    
    try {
      // Salvar cada config que foi alterada
      for (const key of Object.keys(localConfigs)) {
        if (JSON.stringify(localConfigs[key]?.value) !== JSON.stringify(configs[key]?.value)) {
          await fetch('/api/admin/frontpage-editor', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config_key: key,
              config_value: localConfigs[key]?.value
            })
          })
        }
      }
      
      setSuccess('Alterações salvas com sucesso!')
      setConfigs(localConfigs)
      setHasChanges(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }
  
  // Descartar alterações
  const handleDiscard = () => {
    setLocalConfigs(configs)
    setHasChanges(false)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando editor visual...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Editor Visual da Frontpage</h1>
            <p className="text-xs text-gray-500">Edite e veja as alterações em tempo real</p>
          </div>
        </div>
        
        {/* Controles de Visualização */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
        
        {/* Ações */}
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleDiscard}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Descartar
            </button>
          )}
          <button
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              hasChanges 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Site
          </Link>
        </div>
      </div>
      
      {/* Alertas */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
          <X className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel de Edição */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-hidden">
          <QuickEditPanel 
            configs={localConfigs}
            onUpdate={handleLocalUpdate}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        </div>
        
        {/* Preview */}
        <div className="flex-1 overflow-auto p-6 bg-gray-200">
          <div className="min-h-full flex items-start justify-center">
            <FrontpagePreview configs={localConfigs} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  )
}
