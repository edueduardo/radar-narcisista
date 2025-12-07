'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  Trash2, 
  Menu, 
  X, 
  HelpCircle 
} from 'lucide-react'
import { 
  getMenuForAudience, 
  type InterfaceScreen 
} from '@/lib/ui-core-registry'
import { getHelpForRoute, MenuHelpBlock } from '@/lib/menu-help-registry'
import { Locale, getAdminTranslation } from '@/lib/i18n'

/**
 * AdminSidebarV2 - Sidebar do Admin usando UI Core Registry
 * 
 * Esta versão consome o registry central para montar o menu automaticamente.
 * Substitui a versão anterior que usava admin-menu-config.ts
 */

export default function AdminSidebarV2() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['admin_overview', 'admin_ai_core'])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [helpModal, setHelpModal] = useState<MenuHelpBlock | null>(null)
  const [locale, setLocale] = useState<Locale>('pt-BR')
  
  // Carregar menu do registry
  const menu = getMenuForAudience('admin')

  useEffect(() => {
    // Detectar idioma do localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['pt-BR', 'en', 'es'].includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [])

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

  const t = (key: string) => getAdminTranslation(key, locale)

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="font-bold text-purple-400 text-lg">Admin</span>
              <p className="text-xs text-slate-500">Control Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 hover:bg-slate-700/50 rounded-lg text-slate-400 transition-all hover:text-white"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Menu Groups */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {menu.map(({ group, screens }) => (
          <div key={group.id} className="mb-2">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all rounded-lg mx-2 ${
                isGroupActive(screens)
                  ? 'bg-purple-600/20 text-purple-300 bg-purple-500/10 border border-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
              title={!sidebarOpen ? group.label : undefined}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{group.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium truncate">{t(group.label)}</span>
                )}
              </div>
              {sidebarOpen && (
                isGroupExpanded(group.id) 
                  ? <ChevronDown className="w-4 h-4 flex-shrink-0 text-purple-400" />
                  : <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
            </button>

            {/* Group Screens */}
            {sidebarOpen && isGroupExpanded(group.id) && (
              <div className="ml-2 border-l border-slate-600/50 pl-2">
                {screens.map(screen => {
                  const active = isActive(screen.route)
                  const help = getHelpForRoute(screen.route)
                  
                  return (
                    <div key={screen.id} className="flex items-center group">
                      <Link
                        href={screen.isPlaceholder ? '#' : screen.route}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all rounded-lg mx-1 flex-1 ${
                          screen.isPlaceholder
                            ? 'text-slate-600 cursor-not-allowed opacity-60'
                            : screen.isNew
                              ? 'bg-green-600/10 text-green-400 hover:bg-green-600/20 border border-green-500/20'
                              : active
                                ? 'bg-purple-600/20 text-purple-300 bg-purple-500/10 border border-purple-500/30 font-medium'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                        }`}
                        onClick={e => screen.isPlaceholder && e.preventDefault()}
                      >
                        {screen.icon && <span className="text-base">{screen.icon}</span>}
                        <span className="truncate flex-1">{screen.label}</span>
                        
                        {screen.isNew && (
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            NEW
                          </span>
                        )}
                        
                        {screen.isPlaceholder && (
                          <span className="text-[10px] text-slate-500 bg-slate-700/30 px-2 py-0.5 rounded">
                            Em breve
                          </span>
                        )}
                      </Link>
                      
                      {/* Help Icon */}
                      {help && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setHelpModal(help)
                          }}
                          className="p-1.5 mr-2 opacity-0 group-hover:opacity-100 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-purple-400 transition-all"
                          title="Ajuda"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700/50 space-y-2 bg-slate-900/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all border border-red-500/20 hover:border-red-500/30"
        >
          <LogOut className="h-4 w-4" />
          {sidebarOpen && <span>{t('admin.nav.logout')}</span>}
        </button>
        <button
          onClick={handleClearCache}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all border border-slate-600/30"
        >
          <Trash2 className="h-3 w-3" />
          {sidebarOpen && <span>{t('admin.actions.clear')} Cache IA</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 flex-col h-screen fixed z-40 transition-all duration-300 hidden lg:flex shadow-xl`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-md shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2.5 hover:bg-slate-700/50 rounded-lg text-slate-400 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-16">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}

      {/* Help Modal */}
      {helpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setHelpModal(null)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <button
              onClick={() => setHelpModal(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{helpModal.titulo}</h3>
                <p className="text-sm text-slate-400">Ajuda rápida</p>
              </div>
            </div>
            <div className="space-y-3 text-slate-300">
              {/* O que é */}
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-1">O que é:</h4>
                <p className="text-slate-300 text-sm">{helpModal.o_que_e}</p>
              </div>
              
              {/* Para que serve */}
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-1">Para que serve:</h4>
                <p className="text-slate-300 text-sm">{helpModal.para_que_serve}</p>
              </div>
              
              {/* Quando usar */}
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-1">Quando usar:</h4>
                <p className="text-slate-300 text-sm">{helpModal.quando_usar}</p>
              </div>
              
              {/* Passo a passo */}
              {helpModal.passo_a_passo && helpModal.passo_a_passo.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Passo a passo:</h4>
                  <ol className="space-y-1">
                    {helpModal.passo_a_passo.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-purple-400 font-bold">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Exemplos */}
              {helpModal.exemplos && helpModal.exemplos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Exemplos:</h4>
                  <ul className="space-y-1">
                    {helpModal.exemplos.map((ex: string, i: number) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Avisos */}
              {helpModal.avisos && helpModal.avisos.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Avisos:</h4>
                  <ul className="space-y-1">
                    {helpModal.avisos.map((aviso: string, i: number) => (
                      <li key={i} className="text-sm text-yellow-200/80">• {aviso}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Ligações com outros menus */}
              {helpModal.ligacoes_com_outros_menus && helpModal.ligacoes_com_outros_menus.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Relacionados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {helpModal.ligacoes_com_outros_menus.map((route: string, i: number) => (
                      <Link
                        key={i}
                        href={route}
                        onClick={() => setHelpModal(null)}
                        className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-purple-400"
                      >
                        {route}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setHelpModal(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium"
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
