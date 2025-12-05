'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Bot, 
  Settings, 
  Zap, 
  Scale, 
  Brain, 
  BookOpen,
  MessageSquare, 
  Users, 
  MapPin,
  TestTube, 
  Eye, 
  Layout, 
  Globe,
  LogOut,
  Search,
  Activity,
  FileCode,
  Ghost,
  Library,
  BookHeart,
  Heart,
  BarChart3,
  Map,
  Sparkles,
  FileQuestion,
  Rocket,
  CheckSquare,
  GitBranch,
  CreditCard,
  Lightbulb,
  FileText,
  Layers,
  UserPlus,
  Skull,
  Network,
  TrendingUp,
  MessageCircle,
} from 'lucide-react'
import { loadMenuOrder, type AdminMenuItem } from '@/lib/admin-menu-config'

type SidebarItem = {
  id: string
  label: string
  href: string
  Icon: any
  isNew?: boolean
  badge?: number
}

const iconMap: Record<string, any> = {
  Bot,
  Settings,
  Zap,
  Scale,
  Brain,
  BookOpen,
  MessageSquare,
  Users,
  MapPin,
  TestTube,
  Eye,
  Layout,
  Globe,
  LogOut,
  Search,
  Activity,
  FileCode,
  Ghost,
  Library,
  BookHeart,
  Heart,
  BarChart3,
  Map,
  Sparkles,
  FileQuestion,
  Rocket,
  CheckSquare,
  GitBranch,
  CreditCard,
  Lightbulb,
  FileText,
  Layers,
  UserPlus,
  Skull,
  Network,
  TrendingUp,
  MessageCircle,
}

function buildSidebarItemsFromMenu(menu: AdminMenuItem[]): SidebarItem[] {
  return menu
    .filter((item) => item.enabled && item.href)
    .map((item) => {
      const Icon = iconMap[item.icon] || Bot
      const isNew = item.id === 'fluxos_ia'

      // Badges estáticos simples (mesmo comportamento anterior)
      let badge: number | undefined
      if (item.id === 'biblioteca') badge = 2
      if (item.id === 'historias') badge = 1
      if (item.id === 'comunidade') badge = 2

      return {
        id: item.id,
        label: item.label,
        href: item.href!,
        Icon,
        isNew,
        badge,
      }
    })
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [menuItems, setMenuItems] = useState<SidebarItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Carrega o menu centralizado (que já vem do registry) e converte para itens da sidebar
    const items = loadMenuOrder()
    setMenuItems(buildSidebarItemsFromMenu(items))
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout no admin:', error)
    }
  }

  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        // Chaves e status usados no admin
        localStorage.removeItem('ai_api_keys')
        localStorage.removeItem('ai_api_balances')
        localStorage.removeItem('ia_balances_admin')
        localStorage.removeItem('ia_status_admin')
        localStorage.removeItem('ias_customizadas')
      }
    } catch (e) {
      console.error('Erro ao limpar cache de IA:', e)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`${sidebarOpen ? 'w-52' : 'w-14'} bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed z-40 transition-all duration-300`}
    >
      {/* Topo com título e toggle */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {sidebarOpen && <h1 className="text-lg font-bold text-purple-400">Admin</h1>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Itens de menu */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const { Icon, href, label, badge, isNew } = item
          const active = isActive(href)

          return (
            <Link
              key={item.id}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                isNew
                  ? 'bg-red-600/20 text-red-400 border-r-2 border-red-500 hover:bg-red-600/30'
                  : active
                    ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isNew ? 'text-red-400' : ''}`} />
              {sidebarOpen && (
                <span className={`truncate flex-1 ${isNew ? 'font-bold text-red-400' : ''}`}>{label}</span>
              )}
              {isNew && sidebarOpen && (
                <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
              {badge && sidebarOpen && !isNew && (
                <span className="ml-auto bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
              {badge && !sidebarOpen && (
                <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Ações: Sair + Limpar cache */}
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
          <span>🗑️</span>
          {sidebarOpen && <span>Limpar cache de IA</span>}
        </button>
      </div>
    </aside>
  )
}
