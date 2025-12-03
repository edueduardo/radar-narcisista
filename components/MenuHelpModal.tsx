'use client'

import { useState } from 'react'
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  Target, 
  Clock, 
  Cog, 
  ListOrdered, 
  Lightbulb, 
  AlertTriangle, 
  Link2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { getMenuHelp, type MenuHelpAudience, type MenuHelpBlock } from '@/lib/menu-help-registry'

// ============================================================================
// TIPOS
// ============================================================================

interface MenuHelpModalProps {
  route: string
  audience: MenuHelpAudience
  trigger?: 'icon' | 'button' | 'text'
  className?: string
}

interface MenuHelpButtonProps {
  route: string
  audience: MenuHelpAudience
  variant?: 'icon' | 'button' | 'minimal'
  className?: string
}

// ============================================================================
// COMPONENTE: Modal de Help
// ============================================================================

export function MenuHelpModal({ route, audience, trigger = 'icon', className = '' }: MenuHelpModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['o_que_e', 'passo_a_passo'])
  
  const help = getMenuHelp(audience, route)
  
  if (!help) return null
  
  function toggleSection(section: string) {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  function isExpanded(section: string) {
    return expandedSections.includes(section)
  }

  return (
    <>
      {/* Trigger */}
      {trigger === 'icon' && (
        <button
          onClick={() => setIsOpen(true)}
          className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
          title="Ajuda"
        >
          <HelpCircle className="w-5 h-5 text-gray-400 hover:text-purple-500" />
        </button>
      )}
      
      {trigger === 'button' && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors ${className}`}
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda
        </button>
      )}
      
      {trigger === 'text' && (
        <button
          onClick={() => setIsOpen(true)}
          className={`text-purple-600 dark:text-purple-400 hover:underline text-sm ${className}`}
        >
          Como funciona?
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-indigo-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{help.titulo}</h2>
                  <p className="text-sm text-white/80">{help.menuLabel}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* O que é */}
              <Section
                icon={<BookOpen className="w-4 h-4" />}
                title="O que é?"
                isExpanded={isExpanded('o_que_e')}
                onToggle={() => toggleSection('o_que_e')}
              >
                <p className="text-gray-600 dark:text-gray-300">{help.o_que_e}</p>
              </Section>

              {/* Para que serve */}
              <Section
                icon={<Target className="w-4 h-4" />}
                title="Para que serve?"
                isExpanded={isExpanded('para_que_serve')}
                onToggle={() => toggleSection('para_que_serve')}
              >
                <p className="text-gray-600 dark:text-gray-300">{help.para_que_serve}</p>
              </Section>

              {/* Quando usar */}
              <Section
                icon={<Clock className="w-4 h-4" />}
                title="Quando usar?"
                isExpanded={isExpanded('quando_usar')}
                onToggle={() => toggleSection('quando_usar')}
              >
                <p className="text-gray-600 dark:text-gray-300">{help.quando_usar}</p>
              </Section>

              {/* Como funciona */}
              <Section
                icon={<Cog className="w-4 h-4" />}
                title="Como funciona?"
                isExpanded={isExpanded('como_funciona')}
                onToggle={() => toggleSection('como_funciona')}
              >
                <p className="text-gray-600 dark:text-gray-300">{help.como_funciona}</p>
              </Section>

              {/* Passo a passo */}
              <Section
                icon={<ListOrdered className="w-4 h-4" />}
                title="Passo a passo"
                isExpanded={isExpanded('passo_a_passo')}
                onToggle={() => toggleSection('passo_a_passo')}
              >
                <ol className="list-decimal list-inside space-y-2">
                  {help.passo_a_passo.map((passo, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-300">{passo}</li>
                  ))}
                </ol>
              </Section>

              {/* Exemplos */}
              {help.exemplos.length > 0 && (
                <Section
                  icon={<Lightbulb className="w-4 h-4" />}
                  title="Exemplos"
                  isExpanded={isExpanded('exemplos')}
                  onToggle={() => toggleSection('exemplos')}
                >
                  <ul className="space-y-2">
                    {help.exemplos.map((exemplo, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                        <span className="text-purple-500">•</span>
                        {exemplo}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Avisos */}
              {help.avisos.length > 0 && (
                <Section
                  icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                  title="Avisos importantes"
                  isExpanded={isExpanded('avisos')}
                  onToggle={() => toggleSection('avisos')}
                  variant="warning"
                >
                  <ul className="space-y-2">
                    {help.avisos.map((aviso, i) => (
                      <li key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                        <span>⚠️</span>
                        {aviso}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Ligações */}
              {help.ligacoes_com_outros_menus.length > 0 && (
                <Section
                  icon={<Link2 className="w-4 h-4" />}
                  title="Relacionado com"
                  isExpanded={isExpanded('ligacoes')}
                  onToggle={() => toggleSection('ligacoes')}
                >
                  <div className="flex flex-wrap gap-2">
                    {help.ligacoes_com_outros_menus.map((link, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300"
                      >
                        {link}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Footer */}
              {help.ultima_atualizacao && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Última atualização: {help.ultima_atualizacao}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================================
// COMPONENTE: Seção colapsável
// ============================================================================

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  variant?: 'default' | 'warning'
}

function Section({ icon, title, children, isExpanded, onToggle, variant = 'default' }: SectionProps) {
  const bgClass = variant === 'warning' 
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
  
  return (
    <div className={`mb-3 rounded-lg border ${bgClass} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-700 dark:text-gray-200">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE: Botão de Help (versão simplificada)
// ============================================================================

export function MenuHelpButton({ route, audience, variant = 'icon', className = '' }: MenuHelpButtonProps) {
  const help = getMenuHelp(audience, route)
  
  if (!help) return null
  
  return (
    <MenuHelpModal 
      route={route} 
      audience={audience} 
      trigger={variant === 'button' ? 'button' : variant === 'minimal' ? 'text' : 'icon'}
      className={className}
    />
  )
}

// ============================================================================
// COMPONENTE: Tooltip de Help (inline)
// ============================================================================

interface MenuHelpTooltipProps {
  route: string
  audience: MenuHelpAudience
  children: React.ReactNode
}

export function MenuHelpTooltip({ route, audience, children }: MenuHelpTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const help = getMenuHelp(audience, route)
  
  if (!help) return <>{children}</>
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          <p className="font-medium mb-1">{help.titulo}</p>
          <p className="text-gray-300 text-xs">{help.o_que_e}</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default MenuHelpModal
