'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

// ============================================
// TIPOS
// ============================================

type Theme = 'light' | 'dark' | 'high-contrast' | 'system'
type ResolvedTheme = 'light' | 'dark' | 'high-contrast'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// ============================================
// CONTEXTO
// ============================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// ============================================
// PROVIDER
// ============================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light') // Padrão: tema claro
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Carregar tema salvo ou usar 'light' como padrão
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Se não há tema salvo, definir 'light' como padrão
      localStorage.setItem('theme', 'light')
      setThemeState('light')
    }
    setMounted(true)
  }, [])

  // Resolver tema baseado na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      } else if (theme === 'high-contrast') {
        setResolvedTheme('high-contrast')
      } else {
        setResolvedTheme(theme as ResolvedTheme)
      }
    }

    updateResolvedTheme()
    mediaQuery.addEventListener('change', updateResolvedTheme)
    
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
  }, [theme])

  // Aplicar classe no documento
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove('light', 'dark', 'high-contrast')
    root.classList.add(resolvedTheme)
    
    // Atualizar meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const colors: Record<ResolvedTheme, string> = {
        dark: '#1e1b4b',
        light: '#9333ea',
        'high-contrast': '#000000'
      }
      metaThemeColor.setAttribute('content', colors[resolvedTheme])
    }
  }, [resolvedTheme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'high-contrast', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // Evitar flash de tema errado
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================
// BOTÃO DE TOGGLE
// ============================================

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const icons: Record<Theme, React.ReactNode> = {
    light: <Sun className="h-5 w-5" />,
    dark: <Moon className="h-5 w-5" />,
    'high-contrast': <span className="h-5 w-5 font-bold text-sm">HC</span>,
    system: <Monitor className="h-5 w-5" />
  }

  const labels: Record<Theme, string> = {
    light: 'Tema Claro',
    dark: 'Tema Escuro',
    'high-contrast': 'Alto Contraste',
    system: 'Automatico'
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          const themes: Theme[] = ['light', 'dark', 'high-contrast', 'system']
          const currentIndex = themes.indexOf(theme)
          const nextIndex = (currentIndex + 1) % themes.length
          setTheme(themes[nextIndex])
        }}
        className={`
          p-2 rounded-lg transition-colors
          ${resolvedTheme === 'high-contrast'
            ? 'bg-black text-yellow-400 border-2 border-yellow-400'
            : resolvedTheme === 'dark' 
              ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
        title={labels[theme]}
      >
        {icons[theme]}
      </button>
    </div>
  )
}

// ============================================
// SELETOR DE TEMA (mais completo)
// ============================================

export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Claro', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Escuro', icon: <Moon className="h-4 w-4" /> },
    { value: 'high-contrast', label: 'Alto Contraste', icon: <span className="h-4 w-4 font-bold text-xs">HC</span> },
    { value: 'system', label: 'Sistema', icon: <Monitor className="h-4 w-4" /> }
  ]

  return (
    <div className={`flex flex-wrap gap-1 p-1 rounded-lg ${
      resolvedTheme === 'high-contrast' 
        ? 'bg-black border-2 border-white' 
        : 'bg-gray-100 dark:bg-slate-800'
    }`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${theme === option.value
              ? resolvedTheme === 'high-contrast'
                ? 'bg-yellow-400 text-black'
                : 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : resolvedTheme === 'high-contrast'
                ? 'text-white hover:text-yellow-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeProvider
