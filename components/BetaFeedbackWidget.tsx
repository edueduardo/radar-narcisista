'use client'

/**
 * Widget de Feedback para Beta Testers
 * ETAPA 15 - Beta com 5 Usuárias
 * 
 * Botão flutuante que permite enviar feedback rápido
 */

import { useState, useEffect } from 'react'
import { 
  MessageSquarePlus, 
  X, 
  Bug, 
  Lightbulb, 
  Heart, 
  HelpCircle, 
  AlertTriangle,
  Send,
  Check
} from 'lucide-react'

interface FeedbackType {
  id: string
  label: string
  icon: React.ReactNode
  color: string
}

const FEEDBACK_TYPES: FeedbackType[] = [
  { id: 'bug', label: 'Bug/Erro', icon: <Bug className="w-4 h-4" />, color: 'text-red-500' },
  { id: 'sugestao', label: 'Sugestão', icon: <Lightbulb className="w-4 h-4" />, color: 'text-yellow-500' },
  { id: 'elogio', label: 'Elogio', icon: <Heart className="w-4 h-4" />, color: 'text-pink-500' },
  { id: 'confusao', label: 'Confusão', icon: <HelpCircle className="w-4 h-4" />, color: 'text-blue-500' },
  { id: 'medo', label: 'Medo/Insegurança', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-500' },
]

interface BetaFeedbackWidgetProps {
  isBetaTester?: boolean
}

export default function BetaFeedbackWidget({ isBetaTester = false }: BetaFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  // Só mostra para beta testers
  if (!isBetaTester) return null

  const handleSubmit = async () => {
    if (!selectedType || !message.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/beta/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: selectedType,
          message: message.trim(),
          page_path: currentPath,
          rating,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setIsSuccess(false)
          setSelectedType(null)
          setMessage('')
          setRating(null)
        }, 2000)
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
        title="Enviar feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>

      {/* Modal de feedback */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">
                  BETA
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Enviar Feedback
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Obrigado! 💜
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Seu feedback foi enviado e vai nos ajudar muito!
                  </p>
                </div>
              ) : (
                <>
                  {/* Tipo de feedback */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de feedback
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FEEDBACK_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedType === type.id
                              ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span className={type.color}>{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      O que você quer nos contar?
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Descreva o que aconteceu, o que você esperava, ou sua sugestão..."
                      className="w-full h-24 px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  {/* Rating opcional */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Como está sua experiência? (opcional)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(rating === star ? null : star)}
                          className={`w-10 h-10 rounded-lg text-lg transition-colors ${
                            rating && rating >= star
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info da página */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    📍 Página atual: {currentPath}
                  </p>

                  {/* Botão enviar */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedType || !message.trim() || isSubmitting}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Feedback
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
