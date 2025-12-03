'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Trash2
} from 'lucide-react'
import { 
  getMenuForAudience, 
  type InterfaceGroup, 
  type InterfaceScreen 
} from '@/lib/ui-core-registry'

/**
 * AdminSidebarV2 - Sidebar do Admin usando UI Core Registry
 * 
 * Esta versão consome o registry central para montar o menu automaticamente.
 * Substitui a versão anterior que usava admin-menu-config.ts
 */

export default function AdminSidebarV2() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['admin_overview', 'admin_ai_core'])
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Carregar menu do registry
  const menu = getMenuForAudience('admin')

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

  function isActive(href: string) {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  function isGroupActive(screens: InterfaceScreen[]) {
    return screens.some(s => isActive(s.route))
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_api_keys')
        localStorage.removeItem('ai_api_balances')
        localStorage.removeItem('ia_balances_admin')
        localStorage.removeItem('ia_status_admin')
        localStorage.removeItem('ias_customizadas')
      }
    } catch (e) {
      console.error('Erro ao limpar cache:', e)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-purple-400">Admin</span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Menu Groups */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {menu.map(({ group, screens }) => (
          <div key={group.id} className="mb-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                isGroupActive(screens)
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={!sidebarOpen ? group.label : undefined}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{group.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium truncate">{group.label}</span>
                )}
              </div>
              {sidebarOpen && (
                isGroupExpanded(group.id) 
                  ? <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
            </button>

            {/* Group Screens */}
            {sidebarOpen && isGroupExpanded(group.id) && (
              <div className="ml-2 border-l border-slate-700">
                {screens.map(screen => {
                  const active = isActive(screen.route)
                  
                  return (
                    <Link
                      key={screen.id}
                      href={screen.isPlaceholder ? '#' : screen.route}
                      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        screen.isPlaceholder
                          ? 'text-slate-600 cursor-not-allowed'
                          : screen.isNew
                            ? 'bg-green-600/10 text-green-400 hover:bg-green-600/20'
                            : active
                              ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-500'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                      onClick={e => screen.isPlaceholder && e.preventDefault()}
                    >
                      {screen.icon && <span>{screen.icon}</span>}
                      <span className="truncate flex-1">{screen.label}</span>
                      
                      {screen.isNew && (
                        <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                      
                      {screen.isPlaceholder && (
                        <span className="text-[10px] text-slate-600">
                          Em breve
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && <span>Sair</span>}
        </button>
        <button
          onClick={handleClearCache}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Trash2 className="h-3 w-3" />
          {sidebarOpen && <span>Limpar cache de IA</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 border-r border-slate-800 flex-col h-screen fixed z-40 transition-all duration-300 hidden lg:flex`}
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
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 shadow-xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Spacer for content */}
      <div className={`hidden lg:block ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300`} />
    </>
  )
}
