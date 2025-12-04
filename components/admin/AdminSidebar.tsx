'use client'

/**
 * ADMIN SIDEBAR - Sidebar Integrada com adminCoreMenu
 * TAREFA 9 - Integrar Sidebar admin com adminCoreMenu + ícone "?" de help
 * 
 * Este componente:
 * - Consome adminCoreMenu para estrutura do menu
 * - Exibe ícone "?" em cada item que abre help
 * - Suporta colapso/expansão
 * - Agrupa itens por categoria
 * 
 * @see lib/admin-core-menu.ts
 * @see lib/menu-help-registry.ts
 * @see FUTURO-TERMINAR-IMPLEMENTACAO.txt - TAREFA 9
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Home,
  Users,
  Brain,
  Settings,
  BarChart3,
  Shield,
  FileText,
  Zap,
  Eye,
  Sparkles,
  Layout,
  Database,
  Globe,
  Package,
  X
} from 'lucide-react'
import { adminCoreMenu, AdminMenuGroup, AdminMenuItem } from '@/lib/admin-core-menu'
import { getHelpForRoute, MenuHelpBlock } from '@/lib/menu-help-registry'

// Mapeamento de emojis para ícones Lucide
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '🎯': Home,
  '🏠': Home,
  '🔮': Eye,
  '📊': BarChart3,
  '🗼': Layout,
  '📈': BarChart3,
  '📉': BarChart3,
  '💡': Sparkles,
  '🗺️': Globe,
  '👥': Users,
  '👤': Users,
  '🤝': Users,
  '🏢': Package,
  '👨‍⚕️': Users,
  '🧪': Zap,
  '🤖': Brain,
  '🎭': Brain,
  '⚙️': Settings,
  '💰': BarChart3,
  '🧠': Brain,
  '📋': FileText,
  '🔐': Shield,
  '📜': FileText,
  '🛡️': Shield,
  '🚀': Zap,
  '✅': FileText,
  '🔧': Settings,
  '🏗️': Package,
  '🌐': Globe,
  '💾': Database,
  '🎨': Layout,
  '📝': FileText,
  '🎁': Package,
  '🔑': Shield
}

// Obter ícone do mapa ou retornar padrão
function getIcon(emoji: string): React.ComponentType<{ className?: string }> {
  return iconMap[emoji] || Settings
}

interface AdminSidebarProps {
  defaultCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

export default function AdminSidebar({ 
  defaultCollapsed = false,
  onCollapseChange 
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [helpModal, setHelpModal] = useState<MenuHelpBlock | null>(null)

  // Expandir grupo do item ativo automaticamente
  useEffect(() => {
    const activeGroup = adminCoreMenu.find(group => 
      group.items.some(item => item.route === pathname)
    )
    if (activeGroup && !expandedGroups.includes(activeGroup.id)) {
      setExpandedGroups(prev => [...prev, activeGroup.id])
    }
  }, [pathname])

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    onCollapseChange?.(newState)
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const openHelp = (route: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const help = getHelpForRoute(route)
    if (help) {
      setHelpModal(help)
    }
  }

  const isItemActive = (route?: string) => {
    if (!route) return false
    return pathname === route || pathname.startsWith(route + '/')
  }

  return (
    <>
      <aside 
        className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-40`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Admin</span>
            </Link>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Groups */}
        <nav className="flex-1 overflow-y-auto py-2">
          {adminCoreMenu.map(group => {
            const isExpanded = expandedGroups.includes(group.id)
            const GroupIcon = getIcon(group.icon)
            const hasActiveItem = group.items.some(item => isItemActive(item.route))

            return (
              <div key={group.id} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => !collapsed && toggleGroup(group.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    hasActiveItem 
                      ? 'text-purple-400 bg-purple-500/10' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title={collapsed ? group.label : undefined}
                >
                  <GroupIcon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium truncate">
                        {group.label}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </>
                  )}
                </button>

                {/* Group Items */}
                {!collapsed && isExpanded && (
                  <div className="ml-4 border-l border-gray-800">
                    {group.items.map(item => {
                      const ItemIcon = getIcon(item.icon)
                      const isActive = isItemActive(item.route)
                      const hasHelp = item.route && getHelpForRoute(item.route)

                      return (
                        <div key={item.id} className="relative group">
                          {item.route ? (
                            <Link
                              href={item.route}
                              className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'text-purple-400 bg-purple-500/20 border-l-2 border-purple-500 -ml-px'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                              }`}
                            >
                              <ItemIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.isNew && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded">
                                  NEW
                                </span>
                              )}
                              {item.isPlaceholder && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-600 text-gray-300 rounded">
                                  SOON
                                </span>
                              )}
                            </Link>
                          ) : (
                            <span className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 cursor-not-allowed">
                              <ItemIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.label}</span>
                            </span>
                          )}

                          {/* Help Button */}
                          {hasHelp && (
                            <button
                              onClick={(e) => openHelp(item.route!, e)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-all"
                              title="Ajuda"
                            >
                              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-purple-400" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <p>{adminCoreMenu.length} grupos</p>
              <p>{adminCoreMenu.reduce((acc, g) => acc + g.items.length, 0)} itens</p>
            </div>
          </div>
        )}
      </aside>

      {/* Help Modal */}
      {helpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{helpModal.titulo}</h2>
                <p className="text-sm text-gray-400">{helpModal.menuLabel}</p>
              </div>
              <button
                onClick={() => setHelpModal(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {/* O que é */}
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-1">O que é?</h3>
                <p className="text-gray-300 text-sm">{helpModal.o_que_e}</p>
              </div>

              {/* Para que serve */}
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-1">Para que serve?</h3>
                <p className="text-gray-300 text-sm">{helpModal.para_que_serve}</p>
              </div>

              {/* Quando usar */}
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-1">Quando usar?</h3>
                <p className="text-gray-300 text-sm">{helpModal.quando_usar}</p>
              </div>

              {/* Como funciona */}
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-1">Como funciona?</h3>
                <p className="text-gray-300 text-sm">{helpModal.como_funciona}</p>
              </div>

              {/* Passo a passo */}
              {helpModal.passo_a_passo.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 mb-1">Passo a passo</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {helpModal.passo_a_passo.map((passo, i) => (
                      <li key={i} className="text-gray-300 text-sm">{passo}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Exemplos */}
              {helpModal.exemplos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 mb-1">Exemplos</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {helpModal.exemplos.map((exemplo, i) => (
                      <li key={i} className="text-gray-300 text-sm">{exemplo}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avisos */}
              {helpModal.avisos.length > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-yellow-400 mb-1">⚠️ Avisos</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {helpModal.avisos.map((aviso, i) => (
                      <li key={i} className="text-yellow-200 text-sm">{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ligações */}
              {helpModal.ligacoes_com_outros_menus.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 mb-1">Menus relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {helpModal.ligacoes_com_outros_menus.map((rota, i) => (
                      <Link
                        key={i}
                        href={rota}
                        onClick={() => setHelpModal(null)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
                      >
                        {rota}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setHelpModal(null)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
