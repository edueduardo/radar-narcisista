/**
 * SKIP LINKS - Acessibilidade (A11y)
 * 
 * Links invisíveis que aparecem ao focar (Tab)
 * Permitem navegação rápida por teclado
 */

'use client'

import { useEffect, useState } from 'react'
import { Home, Search, MessageCircle, Shield, Menu, User } from 'lucide-react'

export default function SkipLinks() {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocused(true)
        document.removeEventListener('keydown', handleFirstTab)
      }
    }

    document.addEventListener('keydown', handleFirstTab)
    return () => document.removeEventListener('keydown', handleFirstTab)
  }, [])

  if (!isFocused) return null

  return (
    <div className="fixed top-0 left-0 z-[9999] bg-slate-900 border-b border-slate-700 p-2">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
        <a
          href="#main-content"
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => setIsFocused(false)}
        >
          <Home className="w-4 h-4" />
          Ir para conteúdo principal
        </a>
        
        <a
          href="#navigation"
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          onClick={() => setIsFocused(false)}
        >
          <Menu className="w-4 h-4" />
          Ir para navegação
        </a>
        
        <a
          href="#search"
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          onClick={() => setIsFocused(false)}
        >
          <Search className="w-4 h-4" />
          Ir para busca
        </a>
        
        <a
          href="#test-claridade"
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => setIsFocused(false)}
        >
          <Shield className="w-4 h-4" />
          Fazer Teste de Clareza
        </a>
        
        <a
          href="#chat-ia"
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => setIsFocused(false)}
        >
          <MessageCircle className="w-4 h-4" />
            Falar com Coach IA
        </a>
        
        <a
          href="#emergency"
          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() => setIsFocused(false)}
        >
          <Shield className="w-4 h-4" />
          Emergência (ESC)
        </a>
        
        <button
          onClick={() => setIsFocused(false)}
          className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Fechar menu de atalhos"
        >
          ✕ Fechar
        </button>
      </div>
    </div>
  )
}

// Componente para marcar seções com IDs corretos
export function SectionMarker({ 
  id, 
  children, 
  ariaLabel 
}: { 
  id: string
  children: React.ReactNode
  ariaLabel?: string 
}) {
  return (
    <section 
      id={id}
      aria-label={ariaLabel}
      tabIndex={-1}
      className="focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-4 focus:ring-offset-slate-900 rounded-lg"
    >
      {children}
    </section>
  )
}

// Anúncios para leitores de tela
export function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite' 
}: { 
  message: string
  priority?: 'polite' | 'assertive' 
}) {
  return (
    <div 
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Botão com ARIA aprimorado
export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  ariaLabel?: string
  ariaDescribedBy?: string
  disabled?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 
        focus:ring-offset-slate-900 rounded-md transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

// Link com ARIA aprimorado
export function AccessibleLink({
  children,
  href,
  ariaLabel,
  external = false,
  className = '',
  ...props
}: {
  children: React.ReactNode
  href: string
  ariaLabel?: string
  external?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 
        focus:ring-offset-slate-900 rounded-md transition-all
        ${className}
      `}
      {...props}
    >
      {children}
      {external && (
        <span className="sr-only"> (abre em nova aba)</span>
      )}
    </a>
  )
}
