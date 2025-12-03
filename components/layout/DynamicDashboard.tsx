'use client'

import Link from 'next/link'
import { 
  getMenuForAudience, 
  getScreensByGroup,
  getRegistryStats,
  type Audience, 
  type InterfaceGroup, 
  type InterfaceScreen 
} from '@/lib/ui-core-registry'
import { ArrowRight, Sparkles } from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface DynamicDashboardProps {
  audience: Audience
  title?: string
  subtitle?: string
  showStats?: boolean
  maxCardsPerGroup?: number
  className?: string
}

interface DashboardCardProps {
  screen: InterfaceScreen
  variant?: 'default' | 'compact' | 'featured'
}

interface DashboardGroupProps {
  group: InterfaceGroup
  screens: InterfaceScreen[]
  maxCards?: number
  variant?: 'grid' | 'list'
}

// ============================================================================
// COMPONENTE: Card Individual
// ============================================================================

export function DashboardCard({ screen, variant = 'default' }: DashboardCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={screen.route}
        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all group"
      >
        <span className="text-2xl">{screen.icon || '📄'}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{screen.label}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={screen.route}
        className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white hover:shadow-xl transition-all group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <span className="text-4xl mb-4 block">{screen.icon || '📄'}</span>
        <h3 className="text-xl font-bold mb-2">{screen.label}</h3>
        {screen.description && (
          <p className="text-white/80 text-sm mb-4">{screen.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>Acessar</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
        {screen.isNew && (
          <span className="absolute top-4 right-4 px-2 py-1 bg-white/20 rounded-full text-xs">
            Novo
          </span>
        )}
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={screen.route}
      className={`block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all group ${
        screen.isPlaceholder ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{screen.icon || '📄'}</span>
        {screen.isNew && (
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
            Novo
          </span>
        )}
        {screen.isPlaceholder && (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
            Em breve
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{screen.label}</h3>
      {screen.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{screen.description}</p>
      )}
      <div className="mt-3 flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Acessar</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

// ============================================================================
// COMPONENTE: Grupo de Cards
// ============================================================================

export function DashboardGroup({ group, screens, maxCards = 6, variant = 'grid' }: DashboardGroupProps) {
  const displayScreens = screens.slice(0, maxCards)
  const hasMore = screens.length > maxCards

  return (
    <div className="mb-8">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{group.icon}</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.label}</h2>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
            {screens.length}
          </span>
        </div>
        {hasMore && (
          <span className="text-sm text-gray-500">
            +{screens.length - maxCards} mais
          </span>
        )}
      </div>

      {/* Group Description */}
      {group.description && (
        <p className="text-gray-500 dark:text-gray-400 mb-4">{group.description}</p>
      )}

      {/* Cards Grid/List */}
      {variant === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayScreens.map(screen => (
            <DashboardCard key={screen.id} screen={screen} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {displayScreens.map(screen => (
            <DashboardCard key={screen.id} screen={screen} variant="compact" />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE: Dashboard Completo
// ============================================================================

export function DynamicDashboard({ 
  audience, 
  title,
  subtitle,
  showStats = false,
  maxCardsPerGroup = 6,
  className = '' 
}: DynamicDashboardProps) {
  const menu = getMenuForAudience(audience)
  const stats = getRegistryStats()

  const defaultTitles: Record<Audience, string> = {
    admin: 'Painel Administrativo',
    user: 'Meu Painel',
    professional: 'Painel Profissional',
    whitelabel: 'Painel White Label',
    generator: 'Gerador de SaaS'
  }

  const defaultSubtitles: Record<Audience, string> = {
    admin: 'Gerencie todo o sistema em um só lugar',
    user: 'Sua jornada de clareza começa aqui',
    professional: 'Ferramentas para seu trabalho',
    whitelabel: 'Gerencie sua instância',
    generator: 'Crie novos projetos SaaS'
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title || defaultTitles[audience]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {subtitle || defaultSubtitles[audience]}
            </p>
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="mt-4 flex gap-4">
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.byAudience[audience]}
              </p>
              <p className="text-xs text-gray-500">Telas disponíveis</p>
            </div>
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {menu.length}
              </p>
              <p className="text-xs text-gray-500">Grupos</p>
            </div>
          </div>
        )}
      </div>

      {/* Featured Section (first group) */}
      {menu.length > 0 && menu[0].screens.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu[0].screens.slice(0, 3).map(screen => (
              <DashboardCard key={screen.id} screen={screen} variant="featured" />
            ))}
          </div>
        </div>
      )}

      {/* All Groups */}
      {menu.slice(1).map(({ group, screens }) => (
        <DashboardGroup 
          key={group.id} 
          group={group} 
          screens={screens}
          maxCards={maxCardsPerGroup}
        />
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTE: Quick Access (Atalhos Rápidos)
// ============================================================================

interface QuickAccessProps {
  audience: Audience
  screenIds: string[]
  title?: string
}

export function QuickAccess({ audience, screenIds, title = 'Acesso Rápido' }: QuickAccessProps) {
  const menu = getMenuForAudience(audience)
  const allScreens = menu.flatMap(m => m.screens)
  const selectedScreens = screenIds
    .map(id => allScreens.find(s => s.id === id))
    .filter(Boolean) as InterfaceScreen[]

  if (selectedScreens.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {selectedScreens.map(screen => (
          <Link
            key={screen.id}
            href={screen.route}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md transition-all text-sm"
          >
            <span>{screen.icon}</span>
            <span>{screen.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default DynamicDashboard
