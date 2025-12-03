'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react'
import { 
  getMenuForAudience, 
  type Audience, 
  type InterfaceGroup, 
  type InterfaceScreen 
} from '@/lib/ui-core-registry'
import { MenuHelpButton } from '@/components/MenuHelpModal'

// ============================================================================
// TIPOS
// ============================================================================

interface DynamicSidebarProps {
  audience: Audience
  collapsed?: boolean
  onToggle?: () => void
  className?: string
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function DynamicSidebar({ 
  audience, 
  collapsed = false, 
  onToggle,
  className = '' 
}: DynamicSidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const menu = getMenuForAudience(audience)

  function toggleGroup(groupId: string) {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  function isGroupExpanded(groupId: string) {
    return expandedGroups.includes(groupId)
  }

  function isScreenActive(route: string) {
    return pathname === route
  }

  function isGroupActive(screens: InterfaceScreen[]) {
    return screens.some(s => pathname === s.route)
  }

  // Auto-expandir grupo ativo
  useState(() => {
    menu.forEach(({ group, screens }) => {
      if (isGroupActive(screens) && !expandedGroups.includes(group.id)) {
        setExpandedGroups(prev => [...prev, group.id])
      }
    })
  })

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-gray-900 dark:text-white">
                {audience === 'admin' ? 'Admin' : 
                 audience === 'user' ? 'Radar' :
                 audience === 'professional' ? 'Profissional' :
                 audience === 'whitelabel' ? 'White Label' :
                 'Gerador'}
              </span>
            )}
          </div>
          {onToggle && (
            <button 
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Groups */}
      <nav className="flex-1 overflow-y-auto p-2">
        {menu.map(({ group, screens }) => (
          <div key={group.id} className="mb-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isGroupActive(screens)
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{group.icon}</span>
                {!collapsed && (
                  <span className="text-sm font-medium">{group.label}</span>
                )}
              </div>
              {!collapsed && (
                isGroupExpanded(group.id) 
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Group Screens */}
            {!collapsed && isGroupExpanded(group.id) && (
              <div className="ml-4 mt-1 space-y-0.5">
                {screens.map(screen => (
                  <Link
                    key={screen.id}
                    href={screen.route}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isScreenActive(screen.route)
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {screen.icon && <span>{screen.icon}</span>}
                      <span>{screen.label}</span>
                      {screen.isNew && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Novo
                        </span>
                      )}
                      {screen.isPlaceholder && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          Em breve
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Radar Narcisista v2.0
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        } ${className}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 p-3 bg-purple-600 text-white rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

// ============================================================================
// COMPONENTE: Sidebar Item Individual
// ============================================================================

interface SidebarItemProps {
  screen: InterfaceScreen
  isActive: boolean
}

export function SidebarItem({ screen, isActive }: SidebarItemProps) {
  return (
    <Link
      href={screen.route}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}
    >
      {screen.icon && <span>{screen.icon}</span>}
      <span>{screen.label}</span>
      {screen.isNew && (
        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
          Novo
        </span>
      )}
    </Link>
  )
}

export default DynamicSidebar
