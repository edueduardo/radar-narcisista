'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Bot, 
  Users, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit2, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Server,
  Activity,
  BarChart3,
  Shield,
  HelpCircle
} from 'lucide-react'
import { MenuHelpButton } from '@/components/MenuHelpModal'

// ============================================================================
// TIPOS
// ============================================================================

interface AIProvider {
  id: string
  key: string
  display_name: string
  status: 'active' | 'disabled' | 'testing'
  type: string
  default_model?: string
}

interface AIPersona {
  id: string
  slug: string
  display_name: string
  avatar_emoji: string
  avatar_url?: string
  short_bio: string
  default_provider_key: string
  roles_visible: string[]
  is_collaborative_member: boolean
  is_user_visible: boolean
  is_internal_debug: boolean
  ordem_exibicao: number
  cor_tema?: string
}

interface AIPersonaBinding {
  id: string
  persona_id: string
  context_type: string
  context_key: string
  allowed_profiles: string[]
  allowed_plans: string[]
  is_default: boolean
  is_active: boolean
  weight: number
}

interface PersonaStats {
  persona_slug: string
  total_calls: number
  total_tokens_input: number
  total_tokens_output: number
  avg_response_time_ms: number
  unique_users: number
  success_rate: number
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function IAPersonasPage() {
  const [activeTab, setActiveTab] = useState<'personas' | 'providers' | 'bindings' | 'stats'>('personas')
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [bindings, setBindings] = useState<AIPersonaBinding[]>([])
  const [stats, setStats] = useState<PersonaStats[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Carregar personas
      const { data: personasData } = await supabase
        .from('ai_personas')
        .select('*')
        .order('ordem_exibicao')
      
      if (personasData) setPersonas(personasData)

      // Carregar providers
      const { data: providersData } = await supabase
        .from('ai_providers')
        .select('*')
        .order('key')
      
      if (providersData) setProviders(providersData)

      // Carregar bindings
      const { data: bindingsData } = await supabase
        .from('ai_persona_bindings')
        .select('*')
        .order('context_type')
      
      if (bindingsData) setBindings(bindingsData)

      // Carregar stats
      const { data: statsData } = await supabase
        .from('ai_persona_usage_stats')
        .select('*')
      
      if (statsData) setStats(statsData)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  async function togglePersonaVisibility(persona: AIPersona) {
    const { error } = await supabase
      .from('ai_personas')
      .update({ is_user_visible: !persona.is_user_visible })
      .eq('id', persona.id)

    if (!error) {
      setPersonas(personas.map(p => 
        p.id === persona.id ? { ...p, is_user_visible: !p.is_user_visible } : p
      ))
    }
  }

  async function toggleBindingActive(binding: AIPersonaBinding) {
    const { error } = await supabase
      .from('ai_persona_bindings')
      .update({ is_active: !binding.is_active })
      .eq('id', binding.id)

    if (!error) {
      setBindings(bindings.map(b => 
        b.id === binding.id ? { ...b, is_active: !b.is_active } : b
      ))
    }
  }

  function getProviderName(key: string): string {
    const provider = providers.find(p => p.key === key)
    return provider?.display_name || key
  }

  function getPersonaName(id: string): string {
    const persona = personas.find(p => p.id === id)
    return persona?.display_name || id
  }

  function getPersonaEmoji(id: string): string {
    const persona = personas.find(p => p.id === id)
    return persona?.avatar_emoji || '🤖'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-400" />
            Cockpit de IA e Personas
          </h1>
          <MenuHelpButton route="/admin/ia-personas" audience="admin" variant="icon" />
        </div>
        <p className="text-gray-400 mt-2">
          Gerencie avatares de IA, provedores e configurações por contexto
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
        <button
          onClick={() => setActiveTab('personas')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'personas' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Personas ({personas.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'providers' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Server className="w-4 h-4" />
          Providers ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('bindings')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'bindings' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Bindings ({bindings.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'stats' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Estatísticas
        </button>
      </div>

      {/* Tab: Personas */}
      {activeTab === 'personas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Personas / Avatares de IA</h2>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Persona
            </button>
          </div>

          <div className="grid gap-4">
            {personas.map(persona => (
              <div 
                key={persona.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750"
                  onClick={() => setExpandedPersona(expandedPersona === persona.id ? null : persona.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{persona.avatar_emoji}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{persona.display_name}</h3>
                      <p className="text-gray-400 text-sm">{persona.short_bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span 
                      className={`px-2 py-1 rounded text-xs ${
                        persona.is_user_visible 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {persona.is_user_visible ? 'Visível' : 'Oculta'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      Provider: {getProviderName(persona.default_provider_key)}
                    </span>
                    {expandedPersona === persona.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedPersona === persona.id && (
                  <div className="border-t border-gray-700 p-4 bg-gray-850">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-gray-400 text-sm">Slug</label>
                        <p className="font-mono text-sm">{persona.slug}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Cor Tema</label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded" 
                            style={{ backgroundColor: persona.cor_tema || '#6366F1' }}
                          />
                          <span className="font-mono text-sm">{persona.cor_tema || '#6366F1'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Perfis Visíveis</label>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {persona.roles_visible.map(role => (
                            <span key={role} className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Modo Colaborativo</label>
                        <p>{persona.is_collaborative_member ? '✅ Sim' : '❌ Não'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => togglePersonaVisibility(persona)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2 text-sm"
                      >
                        {persona.is_user_visible ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Mostrar
                          </>
                        )}
                      </button>
                      <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-2 text-sm">
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Providers */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Provedores de IA (Visão Admin)</h2>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Provider</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Key</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Modelo Padrão</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {providers.map(provider => (
                  <tr key={provider.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 font-medium">{provider.display_name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-400">{provider.key}</td>
                    <td className="px-4 py-3 text-sm">{provider.type}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-400">{provider.default_model || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        provider.status === 'active' 
                          ? 'bg-green-900 text-green-300'
                          : provider.status === 'testing'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300">Visão Admin</h4>
                <p className="text-sm text-blue-200/70 mt-1">
                  Esta tabela mostra os provedores reais de IA. Usuários finais nunca veem esses nomes - 
                  eles veem apenas as Personas/Avatares configurados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Bindings */}
      {activeTab === 'bindings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bindings: Persona → Contexto</h2>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Binding
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Persona</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Contexto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Perfis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Planos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Peso</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {bindings.map(binding => (
                  <tr key={binding.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getPersonaEmoji(binding.persona_id)}</span>
                        <span>{getPersonaName(binding.persona_id)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">{binding.context_type}/{binding.context_key}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {binding.allowed_profiles.slice(0, 2).map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">{p}</span>
                        ))}
                        {binding.allowed_profiles.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                            +{binding.allowed_profiles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {binding.allowed_plans.slice(0, 2).map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">{p}</span>
                        ))}
                        {binding.allowed_plans.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                            +{binding.allowed_plans.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${binding.weight}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{binding.weight}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {binding.is_default && (
                          <span className="px-1.5 py-0.5 bg-blue-900 text-blue-300 rounded text-xs">
                            Padrão
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          binding.is_active 
                            ? 'bg-green-900 text-green-300'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {binding.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => toggleBindingActive(binding)}
                        className="p-1.5 hover:bg-gray-700 rounded"
                        title={binding.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {binding.is_active ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Estatísticas de Uso (Últimos 30 dias)</h2>

          {stats.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum dado de uso registrado ainda.</p>
              <p className="text-gray-500 text-sm mt-2">
                As estatísticas aparecerão aqui quando as personas forem utilizadas.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.map(stat => {
                const persona = personas.find(p => p.slug === stat.persona_slug)
                return (
                  <div 
                    key={stat.persona_slug}
                    className="bg-gray-800 rounded-lg border border-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{persona?.avatar_emoji || '🤖'}</span>
                        <div>
                          <h3 className="font-semibold">{persona?.display_name || stat.persona_slug}</h3>
                          <p className="text-gray-400 text-sm">{stat.unique_users} usuários únicos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">{stat.total_calls}</p>
                        <p className="text-gray-400 text-sm">chamadas</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-750 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Tokens In</p>
                        <p className="font-semibold">{(stat.total_tokens_input || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-750 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Tokens Out</p>
                        <p className="font-semibold">{(stat.total_tokens_output || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-750 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Tempo Médio</p>
                        <p className="font-semibold">{stat.avg_response_time_ms || 0}ms</p>
                      </div>
                      <div className="bg-gray-750 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Taxa Sucesso</p>
                        <p className={`font-semibold ${
                          (stat.success_rate || 0) >= 95 ? 'text-green-400' :
                          (stat.success_rate || 0) >= 80 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {(stat.success_rate || 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
