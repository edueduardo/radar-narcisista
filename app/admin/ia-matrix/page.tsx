'use client'

/**
 * IA Matrix - Visualização e Configuração de IAs
 * BLOCO 31-35 - ETAPA 32
 * 
 * Permite configurar quais IAs trabalham em cada feature por plano e perfil
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Brain,
  Settings,
  Save,
  RefreshCw,
  Check,
  X,
  Zap,
  Users,
  Crown,
  Shield,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipos
interface AIProvider {
  id: string
  slug: string
  display_name: string
  status: 'ativo' | 'desativado' | 'em_teste'
  custo_relativo: number
  modelo_padrao: string
}

interface AIFeature {
  id: string
  slug: string
  display_name: string
  descricao_curta: string
  categoria: string
}

interface MatrixEntry {
  id: string
  plan_key: string
  feature_id: string
  provider_id: string
  perfil: string
  papel: string
  limite_diario: number | null
  limite_mensal: number | null
  ativo: boolean
  origem: string
  feature?: AIFeature
  provider?: AIProvider
}

// Planos disponíveis
const PLANOS = [
  { key: 'free', label: 'Gratuito', icon: Users, color: 'text-gray-400' },
  { key: 'profissional', label: 'Profissional', icon: Zap, color: 'text-blue-400' },
  { key: 'premium', label: 'Premium', icon: Crown, color: 'text-yellow-400' },
  { key: 'admin', label: 'Admin', icon: Shield, color: 'text-purple-400' }
]

// Perfis disponíveis
const PERFIS = [
  { key: 'usuaria', label: 'Usuária' },
  { key: 'profissional', label: 'Profissional' },
  { key: 'admin', label: 'Admin' },
  { key: 'whitelabel', label: 'Whitelabel' }
]

export default function IAMatrixPage() {
  const supabase = createClient()
  
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [features, setFeatures] = useState<AIFeature[]>([])
  const [matrix, setMatrix] = useState<MatrixEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedPlan, setSelectedPlan] = useState('profissional')
  const [selectedPerfil, setSelectedPerfil] = useState('usuaria')
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([])

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Carregar providers
      const { data: providersData, error: providersError } = await supabase
        .from('ai_providers_core')
        .select('*')
        .order('display_name')

      if (providersError) throw providersError
      setProviders(providersData || [])

      // Carregar features
      const { data: featuresData, error: featuresError } = await supabase
        .from('ai_features_core')
        .select('*')
        .order('display_name')

      if (featuresError) throw featuresError
      setFeatures(featuresData || [])

      // Carregar matrix
      const { data: matrixData, error: matrixError } = await supabase
        .from('ai_plan_matrix')
        .select(`
          *,
          feature:ai_features_core(*),
          provider:ai_providers_core(*)
        `)

      if (matrixError) throw matrixError
      setMatrix(matrixData || [])

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar configurações. Verifique se as tabelas existem no Supabase.')
    } finally {
      setLoading(false)
    }
  }

  // Obter configuração para um plano/feature/perfil
  const getMatrixEntry = (featureId: string, providerId: string): MatrixEntry | undefined => {
    return matrix.find(m => 
      m.plan_key === selectedPlan &&
      m.feature_id === featureId &&
      m.provider_id === providerId &&
      m.perfil === selectedPerfil
    )
  }

  // Toggle ativo/inativo
  const toggleProviderForFeature = async (featureId: string, providerId: string) => {
    const existing = getMatrixEntry(featureId, providerId)
    
    setSaving(true)
    try {
      if (existing) {
        // Atualizar existente
        const { error } = await supabase
          .from('ai_plan_matrix')
          .update({ ativo: !existing.ativo })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Criar novo
        const { error } = await supabase
          .from('ai_plan_matrix')
          .insert({
            plan_key: selectedPlan,
            feature_id: featureId,
            provider_id: providerId,
            perfil: selectedPerfil,
            papel: 'geracao',
            ativo: true,
            origem: 'padrao'
          })

        if (error) throw error
      }

      await loadData()
    } catch (err) {
      console.error('Erro ao atualizar:', err)
      setError('Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  // Atualizar limites
  const updateLimits = async (
    featureId: string, 
    providerId: string, 
    limiteDiario: number | null, 
    limiteMensal: number | null
  ) => {
    const existing = getMatrixEntry(featureId, providerId)
    if (!existing) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('ai_plan_matrix')
        .update({ 
          limite_diario: limiteDiario,
          limite_mensal: limiteMensal
        })
        .eq('id', existing.id)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao atualizar limites:', err)
      setError('Erro ao salvar limites')
    } finally {
      setSaving(false)
    }
  }

  // Toggle expandir feature
  const toggleFeature = (featureId: string) => {
    setExpandedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }

  // Estatísticas
  const stats = {
    totalProviders: providers.length,
    providersAtivos: providers.filter(p => p.status === 'ativo').length,
    totalFeatures: features.length,
    configuracoesAtivas: matrix.filter(m => m.ativo && m.plan_key === selectedPlan).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p>Carregando configurações de IA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              IA Matrix - Configuração Dinâmica
            </h1>
            <p className="text-gray-400">Configure quais IAs trabalham em cada feature por plano</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.totalProviders}</div>
          <div className="text-sm text-gray-400">Provedores de IA</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">{stats.providersAtivos}</div>
          <div className="text-sm text-gray-400">Provedores Ativos</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.totalFeatures}</div>
          <div className="text-sm text-gray-400">Features de IA</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.configuracoesAtivas}</div>
          <div className="text-sm text-gray-400">Configs Ativas ({selectedPlan})</div>
        </div>
      </div>

      {/* Seletores */}
      <div className="flex gap-4 mb-6">
        {/* Seletor de Plano */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex-1">
          <label className="block text-sm font-medium mb-2">Plano</label>
          <div className="flex gap-2">
            {PLANOS.map(plano => {
              const Icon = plano.icon
              return (
                <button
                  key={plano.key}
                  onClick={() => setSelectedPlan(plano.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedPlan === plano.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${selectedPlan === plano.key ? 'text-white' : plano.color}`} />
                  {plano.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Seletor de Perfil */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex-1">
          <label className="block text-sm font-medium mb-2">Perfil</label>
          <div className="flex gap-2">
            {PERFIS.map(perfil => (
              <button
                key={perfil.key}
                onClick={() => setSelectedPerfil(perfil.key)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPerfil === perfil.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {perfil.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Configuração: {PLANOS.find(p => p.key === selectedPlan)?.label} / {PERFIS.find(p => p.key === selectedPerfil)?.label}
        </h2>

        {features.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma feature encontrada</p>
            <p className="text-sm">Execute o SQL migrate-ai-config-core.sql no Supabase</p>
          </div>
        ) : (
          <div className="space-y-4">
            {features.map(feature => {
              const isExpanded = expandedFeatures.includes(feature.id)
              const activeProviders = providers.filter(p => {
                const entry = getMatrixEntry(feature.id, p.id)
                return entry?.ativo
              })

              return (
                <div key={feature.id} className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                  {/* Header da Feature */}
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-medium">{feature.display_name}</h3>
                        <p className="text-sm text-gray-400">{feature.descricao_curta}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeProviders.length > 0 ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                          {activeProviders.length} IA{activeProviders.length > 1 ? 's' : ''} ativa{activeProviders.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
                          Nenhuma IA
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Providers da Feature */}
                  {isExpanded && (
                    <div className="border-t border-slate-600 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {providers.map(provider => {
                          const entry = getMatrixEntry(feature.id, provider.id)
                          const isActive = entry?.ativo ?? false

                          return (
                            <div
                              key={provider.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isActive
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-slate-600/30 border-slate-500/30'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
                                  <span className="font-medium">{provider.display_name}</span>
                                </div>
                                <button
                                  onClick={() => toggleProviderForFeature(feature.id, provider.id)}
                                  disabled={saving}
                                  className={`p-1 rounded transition-colors ${
                                    isActive
                                      ? 'bg-green-500 text-white hover:bg-green-600'
                                      : 'bg-slate-500 text-gray-300 hover:bg-slate-400'
                                  }`}
                                >
                                  {isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </button>
                              </div>

                              {isActive && entry && (
                                <div className="mt-2 pt-2 border-t border-slate-500/30">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <label className="text-gray-400 text-xs">Limite/dia</label>
                                      <input
                                        type="number"
                                        value={entry.limite_diario ?? ''}
                                        onChange={(e) => updateLimits(
                                          feature.id,
                                          provider.id,
                                          e.target.value ? parseInt(e.target.value) : null,
                                          entry.limite_mensal
                                        )}
                                        placeholder="∞"
                                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-gray-400 text-xs">Limite/mês</label>
                                      <input
                                        type="number"
                                        value={entry.limite_mensal ?? ''}
                                        onChange={(e) => updateLimits(
                                          feature.id,
                                          provider.id,
                                          entry.limite_diario,
                                          e.target.value ? parseInt(e.target.value) : null
                                        )}
                                        placeholder="∞"
                                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                <span className={`px-1.5 py-0.5 rounded ${
                                  provider.status === 'ativo' ? 'bg-green-500/20 text-green-400' :
                                  provider.status === 'em_teste' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {provider.status}
                                </span>
                                <span>Custo: {provider.custo_relativo}x</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400">Como funciona o AI_CONFIG_CORE</h3>
            <p className="text-sm text-gray-300 mt-1">
              As configurações são salvas no banco de dados e aplicadas em tempo real.
              <strong> Não é necessário deploy</strong> para alterar quais IAs trabalham em cada feature.
              O orquestrador de IA lê estas configurações a cada requisição.
            </p>
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Salvando...
        </div>
      )}
    </div>
  )
}
