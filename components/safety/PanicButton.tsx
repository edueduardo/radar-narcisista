'use client'

/**
 * Botão de Pânico / Modo Emergência
 * Permite sair rapidamente do site e acessar recursos de emergência
 */

import { useState, useEffect, useCallback } from 'react'
import { X, Phone, ExternalLink, Shield, AlertTriangle } from 'lucide-react'

interface EmergencyContact {
  name: string
  number: string
  description: string
  available: string
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Central de Atendimento à Mulher',
    number: '180',
    description: 'Ligue 180 - Gratuito e confidencial',
    available: '24 horas'
  },
  {
    name: 'Polícia Militar',
    number: '190',
    description: 'Em caso de perigo imediato',
    available: '24 horas'
  },
  {
    name: 'SAMU',
    number: '192',
    description: 'Emergências médicas',
    available: '24 horas'
  },
  {
    name: 'CVV - Centro de Valorização da Vida',
    number: '188',
    description: 'Apoio emocional e prevenção do suicídio',
    available: '24 horas'
  }
]

// Site seguro para redirecionamento
const SAFE_SITE = 'https://www.google.com/search?q=receitas+de+bolo'

interface Props {
  variant?: 'floating' | 'inline' | 'header'
  showLabel?: boolean
}

export default function PanicButton({ variant = 'floating', showLabel = false }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Atalho de teclado: ESC ESC (duplo) para sair rápido
  useEffect(() => {
    let escCount = 0
    let escTimer: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escCount++
        
        if (escCount === 2) {
          quickExit()
        }
        
        clearTimeout(escTimer)
        escTimer = setTimeout(() => {
          escCount = 0
        }, 500)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(escTimer)
    }
  }, [])

  // Saída rápida
  const quickExit = useCallback(() => {
    // Limpar histórico se possível
    try {
      window.history.replaceState(null, '', SAFE_SITE)
    } catch {}
    
    // Redirecionar
    window.location.replace(SAFE_SITE)
  }, [])

  // Countdown para saída
  useEffect(() => {
    if (countdown === null) return
    
    if (countdown === 0) {
      quickExit()
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, quickExit])

  const startCountdown = () => {
    setCountdown(3)
  }

  const cancelCountdown = () => {
    setCountdown(null)
  }

  // Estilos por variante
  const buttonStyles = {
    floating: 'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center',
    inline: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2',
    header: 'px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-1'
  }

  return (
    <>
      {/* Botão principal */}
      <button
        onClick={() => setShowModal(true)}
        className={buttonStyles[variant]}
        title="Sair Rápido (ESC ESC)"
        aria-label="Botão de emergência - Sair rápido"
      >
        <X className={variant === 'floating' ? 'w-6 h-6' : 'w-4 h-4'} />
        {(showLabel || variant !== 'floating') && (
          <span className={variant === 'floating' ? 'sr-only' : ''}>
            Sair Rápido
          </span>
        )}
      </button>

      {/* Modal de emergência */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-lg font-bold">Modo Emergência</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-red-500 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-red-100 text-sm mt-1">
                Pressione ESC duas vezes para sair rapidamente
              </p>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              {/* Botão de saída rápida */}
              {countdown !== null ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-red-600">{countdown}</span>
                  </div>
                  <p className="text-gray-600 mb-4">Saindo em {countdown} segundos...</p>
                  <button
                    onClick={cancelCountdown}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={startCountdown}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg mb-4 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    SAIR AGORA
                  </button>

                  <p className="text-xs text-gray-500 text-center mb-6">
                    Você será redirecionada para um site seguro (Google)
                  </p>

                  {/* Contatos de emergência */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-500" />
                      Contatos de Emergência
                    </h3>
                    <div className="space-y-3">
                      {EMERGENCY_CONTACTS.map((contact) => (
                        <a
                          key={contact.number}
                          href={`tel:${contact.number}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-500">{contact.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">{contact.number}</p>
                            <p className="text-xs text-gray-400">{contact.available}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Dica de segurança */}
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium">Dica de segurança:</p>
                        <p>Limpe o histórico do navegador após usar este site. 
                        Use o modo anônimo/privado quando possível.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
