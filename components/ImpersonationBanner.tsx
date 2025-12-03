'use client'

/**
 * ImpersonationBanner - Banner de Sessão de Impersonação
 * ETAPA 36 - BLOCO 36-40
 * 
 * Exibe banner fixo quando admin está vendo como outro usuário.
 * Permite encerrar a sessão rapidamente.
 */

import { useState, useEffect } from 'react'
import { Eye, X, AlertTriangle, User, Clock } from 'lucide-react'

interface ImpersonationSession {
  id: string
  target_user_id: string
  target_user_email: string
  target_user_role: string
  motivo: string
  inicio: string
}

export default function ImpersonationBanner() {
  const [session, setSession] = useState<ImpersonationSession | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const [elapsedTime, setElapsedTime] = useState('')

  // Verificar se há sessão ativa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/impersonation')
        if (res.ok) {
          const data = await res.json()
          if (data.active_session) {
            setSession(data.active_session)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão de impersonação:', error)
      }
    }
    
    checkSession()
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkSession, 30000)
    return () => clearInterval(interval)
  }, [])

  // Atualizar tempo decorrido
  useEffect(() => {
    if (!session) return
    
    const updateElapsed = () => {
      const start = new Date(session.inicio).getTime()
      const now = Date.now()
      const diff = Math.floor((now - start) / 1000)
      
      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60
      
      if (hours > 0) {
        setElapsedTime(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setElapsedTime(`${minutes}m ${seconds}s`)
      } else {
        setElapsedTime(`${seconds}s`)
      }
    }
    
    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [session])

  // Encerrar sessão
  const handleEndSession = async () => {
    if (isEnding) return
    
    setIsEnding(true)
    try {
      const res = await fetch('/api/admin/impersonation', { method: 'DELETE' })
      if (res.ok) {
        setSession(null)
        // Recarregar página para voltar ao contexto normal
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error)
    } finally {
      setIsEnding(false)
    }
  }

  // Não renderizar se não há sessão
  if (!session) return null

  // Mapear role para texto amigável
  const roleLabels: Record<string, string> = {
    USUARIO: 'Usuária',
    PROFISSIONAL: 'Profissional',
    ADMIN: 'Admin',
    DEV: 'Desenvolvedor',
    WHITELABEL: 'White Label'
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Info da sessão */}
          <div className="flex items-center gap-4">
            {/* Ícone pulsante */}
            <div className="flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
              <Eye className="w-5 h-5" />
            </div>
            
            {/* Texto principal */}
            <div className="flex items-center gap-2">
              <span className="font-bold">MODO SUPORTE:</span>
              <span>Você está vendo como</span>
              <span className="bg-white/20 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                <User className="w-4 h-4" />
                {session.target_user_email}
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                {roleLabels[session.target_user_role] || session.target_user_role}
              </span>
            </div>
          </div>
          
          {/* Tempo e botão */}
          <div className="flex items-center gap-4">
            {/* Tempo decorrido */}
            <div className="flex items-center gap-1 text-sm opacity-90">
              <Clock className="w-4 h-4" />
              <span>{elapsedTime}</span>
            </div>
            
            {/* Botão encerrar */}
            <button
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex items-center gap-2 px-3 py-1 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              {isEnding ? 'Encerrando...' : 'Encerrar Sessão'}
            </button>
          </div>
        </div>
        
        {/* Motivo (segunda linha) */}
        <div className="text-xs opacity-80 mt-1">
          <span className="font-medium">Motivo:</span> {session.motivo}
        </div>
      </div>
    </div>
  )
}
