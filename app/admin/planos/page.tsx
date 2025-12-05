'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CreditCard,
  Users,
  Sparkles,
  Calendar,
  Tag,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Percent,
  Clock
} from 'lucide-react'
import { BillingPlan, BillingPlanPromotion, centsToReais, reaisToCents, formatPriceBRL } from '@/lib/types/billing'
import { SemaforoCard } from '@/components/admin/EditSemaforoBadge'

export default function AdminPlanosPage() {
  const supabase = createClient()
  
  // Estados
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [promotions, setPromotions] = useState<BillingPlanPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Estados de edição
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editingPromo, setEditingPromo] = useState<string | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  
  // Filtros
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'consumer' | 'professional'>('all')

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [plansRes, promosRes] = await Promise.all([
        supabase.from('billing_plans').select('*').order('sort_order'),
        supabase.from('billing_plan_promotions').select('*').order('created_at', { ascending: false })
      ])
      
      if (plansRes.data) setPlans(plansRes.data)
      if (promosRes.data) setPromotions(promosRes.data)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setMessage({ type: 'error', text: 'Erro ao carregar dados' })
    } finally {
      setLoading(false)
    }
  }

  // Salvar plano
  async function savePlan(plan: BillingPlan) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('billing_plans')
        .update(plan)
        .eq('id', plan.id)
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Plano salvo com sucesso!' })
      setEditingPlan(null)
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar' })
    } finally {
      setSaving(false)
    }
  }

  // Criar promoção
  async function createPromotion(planId: string) {
    setSaving(true)
    try {
      const newPromo = {
        plan_id: planId,
        label_pt: 'Nova Promoção',
        is_active: false,
        show_original_price: true,
        badge_color: 'bg-red-500'
      }
      
      const { error } = await supabase
        .from('billing_plan_promotions')
        .insert(newPromo)
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Promoção criada!' })
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao criar promoção' })
    } finally {
      setSaving(false)
    }
  }

  // Salvar promoção
  async function savePromotion(promo: BillingPlanPromotion) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('billing_plan_promotions')
        .update(promo)
        .eq('id', promo.id)
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Promoção salva!' })
      setEditingPromo(null)
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar promoção' })
    } finally {
      setSaving(false)
    }
  }

  // Deletar promoção
  async function deletePromotion(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta promoção?')) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('billing_plan_promotions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Promoção excluída!' })
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir' })
    } finally {
      setSaving(false)
    }
  }

  // Filtrar planos
  const filteredPlans = plans.filter(p => {
    if (audienceFilter === 'all') return true
    return p.audience === audienceFilter
  })

  // Obter promoções de um plano
  const getPromotionsForPlan = (planId: string) => {
    return promotions.filter(p => p.plan_id === planId)
  }

  // Verificar se promoção está ativa agora
  const isPromoActiveNow = (promo: BillingPlanPromotion) => {
    if (!promo.is_active) return false
    const now = new Date()
    if (promo.starts_at && new Date(promo.starts_at) > now) return false
    if (promo.ends_at && new Date(promo.ends_at) < now) return false
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-violet-600" />
                  Planos & Promoções
                </h1>
                <p className="text-sm text-gray-500">Gerencie planos de assinatura e campanhas promocionais</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 mt-4`}>
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Semáforo de Edição */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <SemaforoCard
          level="yellow"
          description="Zona Amarela – Alterações aqui impactam limites, preços e o que o usuário enxerga no app. Evite mexer sem revisar o ATLAS e o ROADMAP."
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-gray-600">Filtrar por:</span>
          <div className="flex gap-2">
            {(['all', 'consumer', 'professional'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setAudienceFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  audienceFilter === filter
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                {filter === 'all' ? 'Todos' : filter === 'consumer' ? 'B2C (Usuários)' : 'B2B (Profissionais)'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="space-y-4">
          {filteredPlans.map(plan => {
            const planPromos = getPromotionsForPlan(plan.id)
            const activePromo = planPromos.find(p => isPromoActiveNow(p))
            const isExpanded = expandedPlan === plan.id
            const isEditing = editingPlan === plan.id
            
            return (
              <div key={plan.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Header do Plano */}
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                    plan.is_popular ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                  }`}
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${plan.bg_color}`}>
                      <span className={plan.color}>
                        {plan.audience === 'professional' ? <Users className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{plan.name_pt}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          plan.audience === 'consumer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {plan.audience === 'consumer' ? 'B2C' : 'B2B'}
                        </span>
                        {plan.is_popular && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Popular
                          </span>
                        )}
                        {plan.is_coming_soon && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Em breve
                          </span>
                        )}
                        {!plan.is_public && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Oculto
                          </span>
                        )}
                        {plan.is_mid_bridge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Intermediário
                          </span>
                        )}
                        {activePromo && (
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${activePromo.badge_color}`}>
                            {activePromo.label_pt}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{plan.tagline_pt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {plan.is_free ? 'Grátis' : formatPriceBRL(centsToReais(plan.price_monthly_cents))}
                      </div>
                      {!plan.is_free && (
                        <div className="text-xs text-gray-500">/mês</div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50">
                    {isEditing ? (
                      <PlanEditForm 
                        plan={plan} 
                        onSave={savePlan} 
                        onCancel={() => setEditingPlan(null)}
                        saving={saving}
                      />
                    ) : (
                      <div className="space-y-6">
                        {/* Informações do Plano */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-gray-500 mb-1">Preço Mensal</div>
                            <div className="font-bold text-lg">{formatPriceBRL(centsToReais(plan.price_monthly_cents))}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-gray-500 mb-1">Preço Anual</div>
                            <div className="font-bold text-lg">{formatPriceBRL(centsToReais(plan.price_yearly_cents))}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-gray-500 mb-1">Chat/dia</div>
                            <div className="font-bold text-lg">{plan.max_chat_messages_per_day === -1 ? '∞' : plan.max_chat_messages_per_day}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-gray-500 mb-1">Diário/mês</div>
                            <div className="font-bold text-lg">{plan.max_diary_entries_per_month === -1 ? '∞' : plan.max_diary_entries_per_month}</div>
                          </div>
                        </div>

                        {/* Botão Editar */}
                        <button
                          onClick={() => setEditingPlan(plan.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                        >
                          <Edit className="w-4 h-4" />
                          Editar Plano
                        </button>

                        {/* Promoções */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              Promoções ({planPromos.length})
                            </h4>
                            <button
                              onClick={() => createPromotion(plan.id)}
                              disabled={saving}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4" />
                              Nova Promoção
                            </button>
                          </div>

                          {planPromos.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Nenhuma promoção cadastrada</p>
                          ) : (
                            <div className="space-y-3">
                              {planPromos.map(promo => (
                                <PromoCard
                                  key={promo.id}
                                  promo={promo}
                                  isActive={isPromoActiveNow(promo)}
                                  isEditing={editingPromo === promo.id}
                                  onEdit={() => setEditingPromo(promo.id)}
                                  onSave={savePromotion}
                                  onDelete={() => deletePromotion(promo.id)}
                                  onCancel={() => setEditingPromo(null)}
                                  saving={saving}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum plano encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

interface PlanEditFormProps {
  plan: BillingPlan
  onSave: (plan: BillingPlan) => void
  onCancel: () => void
  saving: boolean
}

function PlanEditForm({ plan, onSave, onCancel, saving }: PlanEditFormProps) {
  const [formData, setFormData] = useState(plan)

  const handleChange = (field: keyof BillingPlan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Nome PT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome (PT)</label>
          <input
            type="text"
            value={formData.name_pt}
            onChange={e => handleChange('name_pt', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
        {/* Tagline PT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline (PT)</label>
          <input
            type="text"
            value={formData.tagline_pt || ''}
            onChange={e => handleChange('tagline_pt', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Preço Mensal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (R$)</label>
          <input
            type="number"
            step="0.01"
            value={centsToReais(formData.price_monthly_cents)}
            onChange={e => handleChange('price_monthly_cents', reaisToCents(parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
        {/* Preço Anual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço Anual (R$)</label>
          <input
            type="number"
            step="0.01"
            value={centsToReais(formData.price_yearly_cents)}
            onChange={e => handleChange('price_yearly_cents', reaisToCents(parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Chat/dia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chat/dia (-1 = ilimitado)</label>
          <input
            type="number"
            value={formData.max_chat_messages_per_day}
            onChange={e => handleChange('max_chat_messages_per_day', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
        {/* Diário/mês */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diário/mês (-1 = ilimitado)</label>
          <input
            type="number"
            value={formData.max_diary_entries_per_month}
            onChange={e => handleChange('max_diary_entries_per_month', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
        {/* Testes/mês */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Testes/mês (-1 = ilimitado)</label>
          <input
            type="number"
            value={formData.max_tests_per_month}
            onChange={e => handleChange('max_tests_per_month', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={e => handleChange('is_public', e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-sm">Público</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_popular}
            onChange={e => handleChange('is_popular', e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-sm">Popular</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_coming_soon}
            onChange={e => handleChange('is_coming_soon', e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-sm">Em breve</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.can_export_pdf}
            onChange={e => handleChange('can_export_pdf', e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-sm">Exportar PDF</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.can_use_collaborative_ai}
            onChange={e => handleChange('can_use_collaborative_ai', e.target.checked)}
            className="w-4 h-4 text-violet-600 rounded"
          />
          <span className="text-sm">IAs Colaborativas</span>
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

interface PromoCardProps {
  promo: BillingPlanPromotion
  isActive: boolean
  isEditing: boolean
  onEdit: () => void
  onSave: (promo: BillingPlanPromotion) => void
  onDelete: () => void
  onCancel: () => void
  saving: boolean
}

function PromoCard({ promo, isActive, isEditing, onEdit, onSave, onDelete, onCancel, saving }: PromoCardProps) {
  const [formData, setFormData] = useState(promo)

  const handleChange = (field: keyof BillingPlanPromotion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label (PT)</label>
            <input
              type="text"
              value={formData.label_pt || ''}
              onChange={e => handleChange('label_pt', e.target.value)}
              placeholder="Ex: Black Friday 50% OFF"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Badge</label>
            <select
              value={formData.badge_color}
              onChange={e => handleChange('badge_color', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            >
              <option value="bg-red-500">Vermelho</option>
              <option value="bg-green-500">Verde</option>
              <option value="bg-blue-500">Azul</option>
              <option value="bg-yellow-500">Amarelo</option>
              <option value="bg-purple-500">Roxo</option>
              <option value="bg-pink-500">Rosa</option>
              <option value="bg-orange-500">Laranja</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
            <input
              type="datetime-local"
              value={formData.starts_at ? formData.starts_at.slice(0, 16) : ''}
              onChange={e => handleChange('starts_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
            <input
              type="datetime-local"
              value={formData.ends_at ? formData.ends_at.slice(0, 16) : ''}
              onChange={e => handleChange('ends_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promo Mensal (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.promo_price_monthly_cents ? centsToReais(formData.promo_price_monthly_cents) : ''}
              onChange={e => handleChange('promo_price_monthly_cents', e.target.value ? reaisToCents(parseFloat(e.target.value)) : null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promo Anual (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.promo_price_yearly_cents ? centsToReais(formData.promo_price_yearly_cents) : ''}
              onChange={e => handleChange('promo_price_yearly_cents', e.target.value ? reaisToCents(parseFloat(e.target.value)) : null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ou Desconto (%)</label>
            <input
              type="number"
              value={formData.discount_percent || ''}
              onChange={e => handleChange('discount_percent', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded"
            />
            <span className="text-sm">Ativa</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_original_price}
              onChange={e => handleChange('show_original_price', e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded"
            />
            <span className="text-sm">Mostrar preço original riscado</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => onSave(formData)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white p-4 rounded-lg border flex items-center justify-between ${isActive ? 'border-green-300 bg-green-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-xs text-white ${promo.badge_color}`}>
          {promo.label_pt || 'Sem label'}
        </span>
        <div className="text-sm text-gray-600">
          {promo.starts_at && promo.ends_at ? (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(promo.starts_at).toLocaleDateString('pt-BR')} - {new Date(promo.ends_at).toLocaleDateString('pt-BR')}
            </span>
          ) : (
            <span className="text-gray-400">Sem período definido</span>
          )}
        </div>
        {promo.discount_percent && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Percent className="w-3 h-3" />
            {promo.discount_percent}% OFF
          </span>
        )}
        {isActive && (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            Ativa agora
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
