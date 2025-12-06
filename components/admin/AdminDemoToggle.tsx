'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Database, FlaskConical, RefreshCw, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * AdminDemoToggle - Controle de modo Demo/Real para o Admin
 * Mostra badge "Demo" quando não há dados reais
 * Permite alternar entre visualização de dados demo e reais
 */

interface AdminDemoToggleProps {
  className?: string
}

export default function AdminDemoToggle({ className = '' }: AdminDemoToggleProps) {
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [hasRealData, setHasRealData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Verificar se há dados reais no banco
  useEffect(() => {
    checkRealData()
    
    // Carregar preferência salva
    const savedMode = localStorage.getItem('admin_demo_mode')
    if (savedMode !== null) {
      setIsDemoMode(savedMode === 'true')
    }
  }, [])

  const checkRealData = async () => {
    setIsLoading(true)
    try {
      // Verificar se há usuários reais (além do admin)
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Verificar se há entradas no diário
      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })

      // Verificar se há sessões de chat
      const { count: chatCount } = await supabase
        .from('ai_sessions')
        .select('*', { count: 'exact', head: true })

      const hasData = (userCount || 0) > 1 || (journalCount || 0) > 0 || (chatCount || 0) > 0
      setHasRealData(hasData)
      
      // Se não há dados reais, forçar modo demo
      if (!hasData) {
        setIsDemoMode(true)
      }
    } catch (error) {
      console.error('Erro ao verificar dados:', error)
      setHasRealData(false)
    }
    setIsLoading(false)
  }

  const toggleMode = () => {
    if (!hasRealData && !isDemoMode) {
      // Não pode sair do modo demo se não há dados reais
      return
    }
    const newMode = !isDemoMode
    setIsDemoMode(newMode)
    localStorage.setItem('admin_demo_mode', String(newMode))
    
    // Disparar evento para outros componentes
    window.dispatchEvent(new CustomEvent('admin-mode-change', { detail: { isDemoMode: newMode } }))
  }

  const clearCache = async () => {
    setClearing(true)
    try {
      // Limpar cache do localStorage
      const keysToKeep = ['admin_demo_mode', 'theme', 'locale']
      const allKeys = Object.keys(localStorage)
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })

      // Limpar cache do sessionStorage
      sessionStorage.clear()

      // Recarregar página
      window.location.reload()
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
    }
    setClearing(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Badge de Modo */}
      <div className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        ${isDemoMode 
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }
      `}>
        {isDemoMode ? (
          <>
            <FlaskConical className="w-3.5 h-3.5" />
            <span>DEMO</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5" />
            <span>REAL</span>
          </>
        )}
      </div>

      {/* Toggle Demo/Real */}
      <button
        onClick={toggleMode}
        disabled={!hasRealData && !isDemoMode}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          transition-all duration-200
          ${hasRealData || isDemoMode
            ? 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }
        `}
        title={!hasRealData ? 'Sem dados reais disponíveis' : isDemoMode ? 'Mudar para dados reais' : 'Mudar para demonstração'}
      >
        {isDemoMode ? (
          <>
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Real</span>
          </>
        ) : (
          <>
            <EyeOff className="w-3.5 h-3.5" />
            <span>Ver Demo</span>
          </>
        )}
      </button>

      {/* Botão Limpar Cache */}
      <button
        onClick={clearCache}
        disabled={clearing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200"
        title="Limpar cache local"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
        <span>Limpar cache</span>
      </button>

      {/* Botão Sair */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30
          transition-all duration-200"
        title="Sair do sistema"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sair</span>
      </button>

      {/* Indicador de carregamento */}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  )
}

/**
 * Hook para usar o modo demo em outros componentes
 */
export function useAdminDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(true)

  useEffect(() => {
    // Carregar preferência salva
    const savedMode = localStorage.getItem('admin_demo_mode')
    if (savedMode !== null) {
      setIsDemoMode(savedMode === 'true')
    }

    // Escutar mudanças
    const handleModeChange = (event: CustomEvent) => {
      setIsDemoMode(event.detail.isDemoMode)
    }

    window.addEventListener('admin-mode-change', handleModeChange as EventListener)
    return () => window.removeEventListener('admin-mode-change', handleModeChange as EventListener)
  }, [])

  return isDemoMode
}
