'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, X, LogOut, XCircle, Trash2, Smartphone } from 'lucide-react'

function performEmergencyActions() {
  if (typeof window === 'undefined') return

  try { window.localStorage.clear() } catch {}
  try { window.sessionStorage.clear() } catch {}
  
  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
      document.cookie = name.trim() + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    }
  } catch {}

  window.location.href = 'https://www.google.com.br'
}

// Detectar tipo de dispositivo
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) return 'tablet'
  if (/iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile'
  return 'desktop'
}

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')
  const tapCountRef = useRef(0)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setDeviceType(getDeviceType())
    
    // ESC para desktop - funciona em qualquer lugar
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        performEmergencyActions()
      }
    }
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    }
  }, [])

  const handleCloseTab = () => {
    window.close()
    setTimeout(() => { window.location.href = 'about:blank' }, 100)
  }

  const handleClearHistory = () => {
    if (window.history.length > 1) window.history.back()
    try {
      if ('clearSiteData' in navigator) {
        (navigator as any).clearSiteData('*')
      }
    } catch {}
  }

  // 1 toque abre o menu em qualquer dispositivo
  const handleButtonTap = () => {
    setIsOpen(true)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen ? (
        <div className="relative">
          
          <button
            onClick={handleButtonTap}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 group"
            title={deviceType === 'desktop' ? 'Segurança Rápida (ESC)' : 'Toque para abrir menu de segurança'}
            aria-label="Botão de segurança"
          >
            <X className="w-5 h-5" />
            <span className="font-semibold text-sm">Saída Rápida</span>
            
            {/* Indicador pulsante */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
            
            {/* Tooltip para desktop */}
            {deviceType === 'desktop' && (
              <span className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Segurança Rápida (tecla ESC)
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Segurança</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-smooth"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={performEmergencyActions}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium flex items-center gap-3 shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair Rápido (vai para Google)</span>
            </button>

            <button
              onClick={handleCloseTab}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all text-sm font-medium flex items-center gap-3"
            >
              <XCircle className="w-5 h-5" />
              <span>Fechar Esta Página</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all text-sm font-medium flex items-center gap-3"
            >
              <Trash2 className="w-5 h-5" />
              <span>Limpar Rastros do Site</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800">
              ⚠️ Use se alguém está se aproximando ou seu dispositivo pode ser vasculhado.
            </p>
          </div>

          {/* Instruções claras por dispositivo */}
          <div className="mt-3 p-3 bg-gray-100 rounded-xl">
            {deviceType === 'desktop' ? (
              <div className="text-xs text-gray-600 text-center">
                <p className="font-semibold mb-1">💻 Atalho rápido:</p>
                <p>Pressione <kbd className="px-2 py-1 bg-white border rounded font-mono font-bold">ESC</kbd> para sair instantaneamente</p>
              </div>
            ) : (
              <div className="text-xs text-gray-600 text-center">
                <p className="font-semibold mb-1">📱 Dica:</p>
                <p>Clique em <strong>"Sair Rápido"</strong> acima para ir direto ao Google</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
