'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Save, 
  GripVertical,
  Check,
  ArrowLeft,
  Sparkles,
  Info,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { 
  AdminMenuItem, 
  loadMenuOrder, 
  saveMenuOrder, 
  moveItemUp, 
  moveItemDown, 
  toggleItemEnabled,
  resetMenuOrder,
  syncMenuWithRegistry,
  getNewFeaturesSinceLastSave,
  getMenuStats
} from '@/lib/admin-menu-config'
import { 
  getAllAdminFeatures,
  getAdminFeature,
  AdminFeatureGroup,
  type AdminFeatureId 
} from '@/app/admin/admin-features-registry'

export default function MenuConfigPage() {
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([])
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [newFeatures, setNewFeatures] = useState<AdminMenuItem[]>([])
  const [syncing, setSyncing] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    loadMenuData()
  }, [])

  const loadMenuData = () => {
    setMenuItems(loadMenuOrder())
    setNewFeatures(getNewFeaturesSinceLastSave())
  }

  const handleMoveUp = (itemId: string) => {
    const newItems = moveItemUp(menuItems, itemId)
    setMenuItems(newItems)
    setHasChanges(true)
    setSaved(false)
  }

  const handleMoveDown = (itemId: string) => {
    const newItems = moveItemDown(menuItems, itemId)
    setMenuItems(newItems)
    setHasChanges(true)
    setSaved(false)
  }

  const handleToggleEnabled = (itemId: string) => {
    const newItems = toggleItemEnabled(menuItems, itemId)
    setMenuItems(newItems)
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = () => {
    saveMenuOrder(menuItems)
    setSaved(true)
    setHasChanges(false)
    
    // Mostrar mensagem por 2 segundos
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar o menu para a ordem padrão do registry?')) {
      const defaultItems = resetMenuOrder()
      setMenuItems(defaultItems)
      setNewFeatures([])
      setHasChanges(false)
      setSaved(false)
    }
  }

  const handleSyncWithRegistry = async () => {
    setSyncing(true)
    try {
      const syncedItems = syncMenuWithRegistry()
      setMenuItems(syncedItems)
      setNewFeatures([])
      setHasChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erro ao sincronizar com registry:', error)
    } finally {
      setSyncing(false)
    }
  }

  const getFeatureInfo = (itemId: string) => {
    return getAdminFeature(itemId as AdminFeatureId)
  }

  const getGroupColor = (group: AdminFeatureGroup) => {
    const colors: Record<AdminFeatureGroup, string> = {
      'IAs': 'text-purple-400 bg-purple-400/10',
      'Dados': 'text-blue-400 bg-blue-400/10',
      'Billing': 'text-emerald-400 bg-emerald-400/10',
      'Usuários': 'text-green-400 bg-green-400/10',
      'Sistema': 'text-orange-400 bg-orange-400/10',
      'Outros': 'text-slate-400 bg-slate-400/10'
    }
    return colors[group] || colors['Outros']
  }

  const stats = getMenuStats()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                ⚙️ Configurar Menu
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                  Registry v2.0
                </span>
              </h1>
              <p className="text-slate-400 text-sm">Gerencie funcionalidades do painel admin via registry centralizado</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <Info className="w-4 h-4" />
              Info
            </button>
            <button
              onClick={handleSyncWithRegistry}
              disabled={syncing || newFeatures.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                newFeatures.length > 0 && !syncing
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {syncing ? 'Sincronizando...' : `Sincronizar (${newFeatures.length})`}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasChanges 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Alerta de novas features */}
        {newFeatures.length > 0 && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-400 mb-1">
                  🎉 Novas funcionalidades disponíveis!
                </h3>
                <p className="text-green-300 text-sm mb-2">
                  Foram encontradas {newFeatures.length} novas features no registry. 
                  Clique em "Sincronizar" para adicioná-las ao menu.
                </p>
                <div className="flex flex-wrap gap-1">
                  {newFeatures.map(feature => (
                    <span key={feature.id} className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                      {feature.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Panel */}
        {showInfo && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">🏗️ Como funciona o Registry:</h3>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• <strong>Fonte Única:</strong> Todas as features são registradas em <code>admin-features-registry.ts</code></li>
                  <li>• <strong>Auto-Sincronização:</strong> Novas features aparecem automaticamente aqui</li>
                  <li>• <strong>Metadados:</strong> Cada feature tem grupo, descrição, IAs relacionadas, etc.</li>
                  <li>• <strong>Futuro:</strong> Para adicionar nova funcionalidade, só edite o registry!</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-500/30">
                  <p className="text-blue-300 text-xs">
                    <strong>Estatísticas:</strong> {stats.totalFeatures} features totais, 
                    {stats.experimentalFeatures} experimentais, 
                    {stats.productionFeatures} em produção
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-purple-400 mb-2">📋 Como usar:</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Use as setas <strong>↑ ↓</strong> para mover itens para cima ou para baixo</li>
            <li>• Clique no <strong>👁️ olho</strong> para mostrar/ocultar um item do menu</li>
            <li>• <strong>Sincronizar</strong> adiciona automaticamente novas features do registry</li>
            <li>• Clique em <strong>Salvar</strong> para aplicar as mudanças</li>
            <li>• As mudanças são salvas localmente e persistem entre sessões</li>
          </ul>
        </div>

        {/* Lista de Itens */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-4">
                <span>Item do Menu</span>
                <span className="text-xs px-2 py-1 bg-slate-700 rounded">
                  {menuItems.length} itens
                </span>
              </div>
              <span>Ações</span>
            </div>
          </div>
          
          <div className="divide-y divide-slate-800">
            {menuItems.map((item, index) => {
              const featureInfo = getFeatureInfo(item.id)
              const isNewFeature = newFeatures.some(f => f.id === item.id)
              
              return (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    item.enabled ? 'bg-slate-900' : 'bg-slate-900/50'
                  } ${isNewFeature ? 'border-l-4 border-green-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-500 text-sm w-6">{index + 1}.</span>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.enabled ? 'text-white' : 'text-slate-500 line-through'}`}>
                          {item.label}
                        </span>
                        {isNewFeature && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                            NOVO
                          </span>
                        )}
                        {featureInfo?.isExperimental && (
                          <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                            🧪 Experimental
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {featureInfo && (
                          <span className={`text-xs px-2 py-0.5 rounded ${getGroupColor(featureInfo.group)}`}>
                            {featureInfo.group}
                          </span>
                        )}
                        {item.href && (
                          <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                            {item.href}
                          </span>
                        )}
                        {featureInfo?.description && (
                          <span className="text-xs text-slate-500 italic">
                            {featureInfo.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Mover para cima */}
                    <button
                      onClick={() => handleMoveUp(item.id)}
                      disabled={index === 0}
                      className={`p-2 rounded-lg transition-colors ${
                        index === 0 
                          ? 'text-slate-700 cursor-not-allowed' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    
                    {/* Mover para baixo */}
                    <button
                      onClick={() => handleMoveDown(item.id)}
                      disabled={index === menuItems.length - 1}
                      className={`p-2 rounded-lg transition-colors ${
                        index === menuItems.length - 1 
                          ? 'text-slate-700 cursor-not-allowed' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    
                    {/* Toggle visibilidade */}
                    <button
                      onClick={() => handleToggleEnabled(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.enabled 
                          ? 'text-green-400 hover:bg-slate-800' 
                          : 'text-slate-600 hover:bg-slate-800 hover:text-slate-400'
                      }`}
                      title={item.enabled ? 'Ocultar do menu' : 'Mostrar no menu'}
                    >
                      {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Aviso de alterações */}
        {hasChanges && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm">
              ⚠️ Você tem alterações não salvas. Clique em <strong>Salvar</strong> para aplicar.
            </p>
          </div>
        )}

        {/* Info final */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Após salvar, recarregue a página do admin (Ctrl+Shift+R) para ver as mudanças.</p>
          <p className="mt-1">
            <strong>Dica:</strong> Para adicionar novas funcionalidades, edite <code>admin-features-registry.ts</code>
          </p>
        </div>
      </div>
    </div>
  )
}
