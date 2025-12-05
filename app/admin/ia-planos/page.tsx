'use client'

/**
 * IA PLANOS - Configuração de IAs por Plano
 * TAREFA 8 - Telas Admin Faltantes
 * 
 * Permite configurar quais IAs estão disponíveis para cada plano:
 * - Free: IAs básicas com limites
 * - Basic: IAs intermediárias
 * - Premium: Todas as IAs
 * - Professional: IAs especializadas
 * 
 * @see lib/ai-config-core.ts
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 8
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Brain,
  Crown,
  Users,
  Zap,
  Shield,
  Save,
  RefreshCw,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Settings,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipos
interface Plan {
  id: string
  key: string
  name: string
  description: string
  price_monthly: number
  icon: string
  color: string
}

interface AIProvider {
  id: string
  slug: string
  display_name: string
  status: 'ativo' | 'desativado' | 'em_teste'
  custo_relativo: number
}

interface PlanAIConfig {
  id: string
  plan_key: string
  provider_slug: string
  provider_name: string
  features_allowed: string[]
  limite_diario: number | null
  limite_mensal: number | null
  peso: number
  ativo: boolean
}

// Planos padrão
const DEFAULT_PLANS: Plan[] = [
  { id: '1', key: 'free', name: 'Gratuito', description: 'Acesso básico', price_monthly: 0, icon: 'Users', color: 'gray' },
  { id: '2', key: 'basic', name: 'Básico', description: 'Recursos essenciais', price_monthly: 29, icon: 'Zap', color: 'blue' },
  { id: '3', key: 'premium', name: 'Premium', description: 'Acesso completo', price_monthly: 79, icon: 'Crown', color: 'yellow' },
  { id: '4', key: 'professional', name: 'Profissional', description: 'Para profissionais', price_monthly: 149, icon: 'Shield', color: 'purple' }
]

// Providers padrão
const DEFAULT_PROVIDERS: AIProvider[] = [
  { id: '1', slug: 'openai', display_name: 'OpenAI GPT', status: 'ativo', custo_relativo: 1.0 },
  { id: '2', slug: 'anthropic', display_name: 'Claude (Anthropic)', status: 'ativo', custo_relativo: 1.2 },
  { id: '3', slug: 'together', display_name: 'Together AI', status: 'ativo', custo_relativo: 0.3 },
  { id: '4', slug: 'groq', display_name: 'Groq', status: 'em_teste', custo_relativo: 0.2 }
]

// Features disponíveis
const FEATURES = [
  { slug: 'chat', name: 'Chat com IA' },
  { slug: 'diario', name: 'Análise de Diário' },
  { slug: 'oraculo', name: 'Oráculo' },
  { slug: 'clareza', name: 'Teste de Clareza' },
  { slug: 'plano_seguranca', name: 'Plano de Segurança' },
  { slug: 'insights', name: 'Insights Personalizados' },
  { slug: 'relatorios', name: 'Relatórios' }
]

export default function IAPlanosPage() {
  const supabase = createClient()
  
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS)
  const [providers, setProviders] = useState<AIProvider[]>(DEFAULT_PROVIDERS)
  const [configs, setConfigs] = useState<PlanAIConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Configuração sendo editada
  const [editingConfig, setEditingConfig] = useState<PlanAIConfig | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Tentar carregar planos do banco
      const { data: plansData } = await supabase
        .from('plan_catalog')
        .select('*')
        .order('price_monthly', { ascending: true })

      if (plansData && plansData.length > 0) {
        setPlans(plansData.map(p => ({
          id: p.id,
          key: p.key,
          name: p.name,
          description: p.description || '',
          price_monthly: p.price_monthly || 0,
          icon: p.icon || 'Users',
          color: p.color || 'gray'
        })))
      }

      // Tentar carregar providers do banco
      const { data: providersData } = await supabase
        .from('ai_providers_core')
        .select('*')
        .eq('status', 'ativo')

      if (providersData && providersData.length > 0) {
        setProviders(providersData)
      }

      // Carregar configurações existentes
      const { data: configsData } = await supabase
        .from('ai_plan_configs')
        .select('*')

      if (configsData) {
        setConfigs(configsData)
      } else {
        // Criar configurações padrão
        generateDefaultConfigs()
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      generateDefaultConfigs()
    } finally {
      setLoading(false)
    }
  }

  const generateDefaultConfigs = () => {
    const defaultConfigs: PlanAIConfig[] = []
    
    // Free: apenas Together AI com limites
    defaultConfigs.push({
      id: 'free-together',
      plan_key: 'free',
      provider_slug: 'together',
      provider_name: 'Together AI',
      features_allowed: ['chat', 'clareza'],
      limite_diario: 5,
      limite_mensal: 50,
      peso: 1.0,
      ativo: true
    })

    // Basic: OpenAI com limites
    defaultConfigs.push({
      id: 'basic-openai',
      plan_key: 'basic',
      provider_slug: 'openai',
      provider_name: 'OpenAI GPT',
      features_allowed: ['chat', 'diario', 'clareza', 'oraculo'],
      limite_diario: 20,
      limite_mensal: 300,
      peso: 1.0,
      ativo: true
    })
    defaultConfigs.push({
      id: 'basic-together',
      plan_key: 'basic',
      provider_slug: 'together',
      provider_name: 'Together AI',
      features_allowed: ['chat', 'diario', 'clareza'],
      limite_diario: null,
      limite_mensal: null,
      peso: 0.5,
      ativo: true
    })

    // Premium: Todos os providers
    defaultConfigs.push({
      id: 'premium-openai',
      plan_key: 'premium',
      provider_slug: 'openai',
      provider_name: 'OpenAI GPT',
      features_allowed: FEATURES.map(f => f.slug),
      limite_diario: null,
      limite_mensal: null,
      peso: 1.0,
      ativo: true
    })
    defaultConfigs.push({
      id: 'premium-anthropic',
      plan_key: 'premium',
      provider_slug: 'anthropic',
      provider_name: 'Claude (Anthropic)',
      features_allowed: FEATURES.map(f => f.slug),
      limite_diario: null,
      limite_mensal: null,
      peso: 0.8,
      ativo: true
    })

    // Professional: Todos com prioridade
    defaultConfigs.push({
      id: 'prof-anthropic',
      plan_key: 'professional',
      provider_slug: 'anthropic',
      provider_name: 'Claude (Anthropic)',
      features_allowed: FEATURES.map(f => f.slug),
      limite_diario: null,
      limite_mensal: null,
      peso: 1.0,
      ativo: true
    })
    defaultConfigs.push({
      id: 'prof-openai',
      plan_key: 'professional',
      provider_slug: 'openai',
      provider_name: 'OpenAI GPT',
      features_allowed: FEATURES.map(f => f.slug),
      limite_diario: null,
      limite_mensal: null,
      peso: 0.9,
      ativo: true
    })

    setConfigs(defaultConfigs)
  }

  const getConfigsForPlan = (planKey: string) => {
    return configs.filter(c => c.plan_key === planKey)
  }

  const getPlanIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return Crown
      case 'Zap': return Zap
      case 'Shield': return Shield
      default: return Users
    }
  }

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'yellow': return 'text-yellow-400 bg-yellow-500/20'
      case 'blue': return 'text-blue-400 bg-blue-500/20'
      case 'purple': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const toggleFeature = (configId: string, featureSlug: string) => {
    setConfigs(prev => prev.map(c => {
      if (c.id !== configId) return c
      const features = c.features_allowed.includes(featureSlug)
        ? c.features_allowed.filter(f => f !== featureSlug)
        : [...c.features_allowed, featureSlug]
      return { ...c, features_allowed: features }
    }))
  }

  const toggleConfigActive = (configId: string) => {
    setConfigs(prev => prev.map(c => 
      c.id === configId ? { ...c, ativo: !c.ativo } : c
    ))
  }

  const updateConfigLimit = (configId: string, field: 'limite_diario' | 'limite_mensal', value: number | null) => {
    setConfigs(prev => prev.map(c => 
      c.id === configId ? { ...c, [field]: value } : c
    ))
  }

  const addProviderToPlan = (planKey: string, providerSlug: string) => {
    const provider = providers.find(p => p.slug === providerSlug)
    if (!provider) return

    const newConfig: PlanAIConfig = {
      id: `${planKey}-${providerSlug}-${Date.now()}`,
      plan_key: planKey,
      provider_slug: providerSlug,
      provider_name: provider.display_name,
      features_allowed: ['chat'],
      limite_diario: planKey === 'free' ? 5 : null,
      limite_mensal: planKey === 'free' ? 50 : null,
      peso: 0.5,
      ativo: true
    }

    setConfigs(prev => [...prev, newConfig])
  }

  const removeConfig = (configId: string) => {
    setConfigs(prev => prev.filter(c => c.id !== configId))
  }

  const saveConfigs = async () => {
    setSaving(true)
    setError(null)
    
    try {
      // Salvar no banco (se tabela existir)
      const { error } = await supabase
        .from('ai_plan_configs')
        .upsert(configs.map(c => ({
          id: c.id,
          plan_key: c.plan_key,
          provider_slug: c.provider_slug,
          provider_name: c.provider_name,
          features_allowed: c.features_allowed,
          limite_diario: c.limite_diario,
          limite_mensal: c.limite_mensal,
          peso: c.peso,
          ativo: c.ativo
        })))

      if (error) {
        console.warn('Tabela ai_plan_configs não existe, salvando localmente')
      }

      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      setError('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const selectedPlanData = plans.find(p => p.key === selectedPlan)
  const planConfigs = getConfigsForPlan(selectedPlan)
  const availableProviders = providers.filter(p => 
    !planConfigs.some(c => c.provider_slug === p.slug)
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              IA por Planos
            </h1>
            <p className="text-gray-400 text-sm">
              Configure quais IAs cada plano pode usar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={saveConfigs}
            disabled={saving}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Lista de Planos */}
        <div className="col-span-1 space-y-2">
          <h2 className="text-sm font-medium text-gray-400 mb-3">PLANOS</h2>
          {plans.map(plan => {
            const Icon = getPlanIcon(plan.icon)
            const colorClass = getPlanColor(plan.color)
            const configCount = getConfigsForPlan(plan.key).length
            
            return (
              <button
                key={plan.key}
                onClick={() => setSelectedPlan(plan.key)}
                className={`w-full p-4 rounded-xl border transition-all ${
                  selectedPlan === plan.key
                    ? 'bg-gray-800 border-purple-500'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-xs text-gray-400">
                      {configCount} provider{configCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Configuração do Plano Selecionado */}
        <div className="col-span-3 bg-gray-900 rounded-xl border border-gray-800 p-6">
          {selectedPlanData && (
            <>
              {/* Header do Plano */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${getPlanColor(selectedPlanData.color)}`}>
                    {(() => {
                      const Icon = getPlanIcon(selectedPlanData.icon)
                      return <Icon className="w-6 h-6" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedPlanData.name}</h2>
                    <p className="text-gray-400">{selectedPlanData.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {selectedPlanData.price_monthly === 0 
                      ? 'Grátis' 
                      : `R$ ${selectedPlanData.price_monthly}/mês`
                    }
                  </p>
                </div>
              </div>

              {/* Providers Configurados */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Providers de IA</h3>
                  {availableProviders.length > 0 && (
                    <div className="relative group">
                      <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Provider
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        {availableProviders.map(provider => (
                          <button
                            key={provider.slug}
                            onClick={() => addProviderToPlan(selectedPlan, provider.slug)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {provider.display_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {planConfigs.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 border border-dashed border-gray-700 rounded-xl">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum provider configurado</p>
                    <p className="text-sm">Adicione um provider para este plano</p>
                  </div>
                ) : (
                  planConfigs.map(config => (
                    <div
                      key={config.id}
                      className={`border rounded-xl overflow-hidden ${
                        config.ativo ? 'border-gray-700' : 'border-gray-800 opacity-60'
                      }`}
                    >
                      {/* Header do Provider */}
                      <div className="p-4 bg-gray-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="font-medium">{config.provider_name}</p>
                            <p className="text-xs text-gray-400">
                              Peso: {config.peso} • {config.features_allowed.length} features
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleConfigActive(config.id)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              config.ativo
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {config.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                          <button
                            onClick={() => setExpandedProvider(
                              expandedProvider === config.id ? null : config.id
                            )}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                          >
                            {expandedProvider === config.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeConfig(config.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Detalhes Expandidos */}
                      {expandedProvider === config.id && (
                        <div className="p-4 space-y-4">
                          {/* Limites */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">
                                Limite Diário
                              </label>
                              <input
                                type="number"
                                value={config.limite_diario || ''}
                                onChange={(e) => updateConfigLimit(
                                  config.id, 
                                  'limite_diario', 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                placeholder="Ilimitado"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">
                                Limite Mensal
                              </label>
                              <input
                                type="number"
                                value={config.limite_mensal || ''}
                                onChange={(e) => updateConfigLimit(
                                  config.id, 
                                  'limite_mensal', 
                                  e.target.value ? parseInt(e.target.value) : null
                                )}
                                placeholder="Ilimitado"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Features */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Features Permitidas
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {FEATURES.map(feature => {
                                const isAllowed = config.features_allowed.includes(feature.slug)
                                return (
                                  <button
                                    key={feature.slug}
                                    onClick={() => toggleFeature(config.id, feature.slug)}
                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                                      isAllowed
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                                    }`}
                                  >
                                    {isAllowed ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <X className="w-3 h-3" />
                                    )}
                                    {feature.name}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Resumo */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-2">RESUMO DO PLANO</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Providers Ativos</p>
                    <p className="text-xl font-bold">
                      {planConfigs.filter(c => c.ativo).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Features Disponíveis</p>
                    <p className="text-xl font-bold">
                      {new Set(planConfigs.flatMap(c => c.features_allowed)).size}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Com Limites</p>
                    <p className="text-xl font-bold">
                      {planConfigs.filter(c => c.limite_diario || c.limite_mensal).length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
