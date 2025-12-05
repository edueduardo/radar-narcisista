'use client'

/**
 * IA Mapa de Menus - Visualização de IAs por Menu/Tela
 * BLOCO 31-35 - PATCH: Controle de IA por Menu e por Usuário
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Map,
  Brain,
  Settings,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Users,
  Zap,
  Crown,
  Shield,
  Sparkles,
  LayoutGrid
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Tipos
interface MenuMapping {
  id: string
  menu_key: string
  menu_path: string
  menu_name: string
  feature_id: string | null
  perfil_default: string
  descricao: string
  ativo: boolean
  feature?: {
    slug: string
    display_name: string
    categoria: string
  }
}

interface Provider {
  id: string
  slug: string
  display_name: string
  status: string
}

interface MatrixEntry {
  plan_key: string
  perfil: string
  provider_id: string
  ativo: boolean
  limite_diario: number | null
  limite_mensal: number | null
}

// Perfis
const PERFIS = [
  { key: 'usuaria', label: 'Usuária', icon: Users },
  { key: 'profissional', label: 'Profissional', icon: Zap },
  { key: 'admin', label: 'Admin', icon: Shield },
  { key: 'whitelabel', label: 'Whitelabel', icon: Crown }
]

export default function IAMapaMenusPage() {
  const supabase = createClient()
  
  const [menus, setMenus] = useState<MenuMapping[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [matrix, setMatrix] = useState<MatrixEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [selectedPlan, setSelectedPlan] = useState('profissional')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Carregar mapeamento de menus
      const { data: menusData, error: menusError } = await supabase
        .from('ai_feature_menu_map')
        .select(`
          *,
          feature:ai_features_core(slug, display_name, categoria)
        `)
        .order('menu_path')

      if (menusError) throw menusError
      setMenus(menusData || [])

      // Carregar providers
      const { data: providersData, error: providersError } = await supabase
        .from('ai_providers_core')
        .select('*')
        .order('display_name')

      if (providersError) throw providersError
      setProviders(providersData || [])

      // Carregar matrix
      const { data: matrixData, error: matrixError } = await supabase
        .from('ai_plan_matrix')
        .select('*')

      if (matrixError) throw matrixError
      setMatrix(matrixData || [])

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar mapeamento. Execute o SQL migrate-ai-config-core.sql no Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuKey)
        ? prev.filter(m => m !== menuKey)
        : [...prev, menuKey]
    )
  }

  // Obter IAs ativas para um menu/feature
  const getActiveProvidersForMenu = (featureId: string | null, perfil: string): Provider[] => {
    if (!featureId) return []
    
    const activeProviderIds = matrix
      .filter(m => 
        m.plan_key === selectedPlan &&
        m.perfil === perfil &&
        m.ativo
      )
      .map(m => m.provider_id)

    return providers.filter(p => activeProviderIds.includes(p.id) && p.status === 'ativo')
  }

  // Agrupar menus por categoria
  const menusByCategory = menus.reduce((acc, menu) => {
    const category = menu.menu_path.startsWith('/admin') ? 'Admin' : 
                    menu.menu_path.startsWith('/dashboard') ? 'Dashboard' : 'App'
    if (!acc[category]) acc[category] = []
    acc[category].push(menu)
    return acc
  }, {} as Record<string, MenuMapping[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p>Carregando mapa de IAs...</p>
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
              <Map className="w-6 h-6 text-purple-400" />
              Mapa de IA por Menu
            </h1>
            <p className="text-gray-400">Visualize quais IAs trabalham em cada tela do sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
          >
            <option value="free">Plano Gratuito</option>
            <option value="profissional">Plano Profissional</option>
            <option value="premium">Plano Premium</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
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
          <div className="text-2xl font-bold text-purple-400">{menus.length}</div>
          <div className="text-sm text-gray-400">Menus Mapeados</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {menus.filter(m => m.feature_id && m.ativo).length}
          </div>
          <div className="text-sm text-gray-400">Com IA Ativa</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">
            {providers.filter(p => p.status === 'ativo').length}
          </div>
          <div className="text-sm text-gray-400">Provedores Ativos</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {new Set(menus.map(m => m.feature?.categoria).filter(Boolean)).size}
          </div>
          <div className="text-sm text-gray-400">Categorias</div>
        </div>
      </div>

      {/* Mapa por Categoria */}
      {Object.entries(menusByCategory).map(([category, categoryMenus]) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
            {category}
            <span className="text-sm text-gray-400">({categoryMenus.length} menus)</span>
          </h2>

          <div className="space-y-3">
            {categoryMenus.map(menu => {
              const isExpanded = expandedMenus.includes(menu.menu_key)
              const hasFeature = !!menu.feature_id

              return (
                <div
                  key={menu.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                >
                  {/* Header do Menu */}
                  <button
                    onClick={() => toggleMenu(menu.menu_key)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{menu.menu_name}</span>
                          <code className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                            {menu.menu_path}
                          </code>
                        </div>
                        <p className="text-sm text-gray-400">{menu.descricao}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasFeature ? (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {menu.feature?.display_name}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
                          Sem IA
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-sm ${
                        menu.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {menu.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </button>

                  {/* Detalhes do Menu */}
                  {isExpanded && hasFeature && (
                    <div className="border-t border-slate-700 p-4 bg-slate-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PERFIS.map(perfil => {
                          const Icon = perfil.icon
                          const activeProviders = getActiveProvidersForMenu(menu.feature_id, perfil.key)

                          return (
                            <div
                              key={perfil.key}
                              className="bg-slate-800/50 border border-slate-600 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-purple-400" />
                                <span className="font-medium text-sm">{perfil.label}</span>
                              </div>

                              {activeProviders.length > 0 ? (
                                <div className="space-y-1">
                                  {activeProviders.map(provider => (
                                    <div
                                      key={provider.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <Sparkles className="w-3 h-3 text-green-400" />
                                      <span>{provider.display_name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Nenhuma IA configurada</p>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Link para configurar */}
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <Link
                          href={`/admin/ia-matrix?feature=${menu.feature?.slug}`}
                          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <Settings className="w-4 h-4" />
                          Configurar IAs para esta feature
                        </Link>
                      </div>
                    </div>
                  )}

                  {isExpanded && !hasFeature && (
                    <div className="border-t border-slate-700 p-4 bg-slate-900/30">
                      <p className="text-gray-400 text-sm">
                        Este menu não possui feature de IA associada.
                        É uma tela de configuração ou visualização.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400">Sobre o Mapa de IA por Menu</h3>
            <p className="text-sm text-gray-300 mt-1">
              Este mapa mostra quais IAs trabalham em cada tela do sistema.
              Cada menu pode ter uma feature de IA associada, e cada feature pode ter
              diferentes provedores configurados por plano e perfil.
              Use a página <strong>IA Matrix</strong> para configurar as IAs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
