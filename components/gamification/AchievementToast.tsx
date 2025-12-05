'use client'

/**
 * Toast de Conquista Desbloqueada
 * Exibe notificação animada quando usuário desbloqueia conquista
 */

import { useState, useEffect } from 'react'
import { Achievement, RARITY_COLORS } from '@/lib/gamification'
import { X, Sparkles } from 'lucide-react'

interface Props {
  achievement: Achievement
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function AchievementToast({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const colors = RARITY_COLORS[achievement.rarity]

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 50)

    // Auto-fechar
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <div
      className={`
        fixed bottom-24 right-6 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        relative overflow-hidden rounded-2xl shadow-2xl
        ${colors.bg} border-2 ${colors.border}
      `}>
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        
        {/* Partículas decorativas */}
        <div className="absolute top-2 left-4 text-2xl animate-bounce">✨</div>
        <div className="absolute top-4 right-12 text-xl animate-pulse">🎉</div>
        <div className="absolute bottom-3 left-8 text-lg animate-bounce delay-100">⭐</div>

        {/* Conteúdo */}
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${colors.text}`} />
              <span className={`text-sm font-bold uppercase tracking-wide ${colors.text}`}>
                Conquista Desbloqueada!
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Conquista */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg text-4xl">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {achievement.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold ${colors.text}`}>
                  +{achievement.points} pontos
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {achievement.rarity === 'common' && 'Comum'}
                  {achievement.rarity === 'uncommon' && 'Incomum'}
                  {achievement.rarity === 'rare' && 'Raro'}
                  {achievement.rarity === 'epic' && 'Épico'}
                  {achievement.rarity === 'legendary' && 'Lendário'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso do auto-close */}
        {autoClose && (
          <div className="h-1 bg-black/10">
            <div 
              className={`h-full ${colors.text.replace('text-', 'bg-')} transition-all ease-linear`}
              style={{ 
                width: '100%',
                animation: `shrink ${autoCloseDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
