'use client'

/**
 * Card de Conquista
 * Exibe uma conquista individual com seu status
 */

import { Achievement, RARITY_COLORS, getAchievementProgress } from '@/lib/gamification'
import { Lock, CheckCircle } from 'lucide-react'

interface Props {
  achievement: Achievement
  unlocked?: boolean
  unlockedAt?: string
  userMetrics?: Record<string, number>
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function AchievementCard({
  achievement,
  unlocked = false,
  unlockedAt,
  userMetrics = {},
  showProgress = true,
  size = 'md'
}: Props) {
  const colors = RARITY_COLORS[achievement.rarity]
  const progress = showProgress ? getAchievementProgress(achievement, userMetrics) : 0
  const isSecret = achievement.secret && !unlocked

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all
        ${sizeClasses[size]}
        ${unlocked 
          ? `${colors.bg} ${colors.border}` 
          : 'bg-gray-50 border-gray-200 opacity-60'
        }
        ${unlocked ? 'hover:shadow-md' : ''}
      `}
    >
      {/* Badge de raridade */}
      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
        {achievement.rarity === 'common' && 'Comum'}
        {achievement.rarity === 'uncommon' && 'Incomum'}
        {achievement.rarity === 'rare' && 'Raro'}
        {achievement.rarity === 'epic' && 'Épico'}
        {achievement.rarity === 'legendary' && 'Lendário'}
      </div>

      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
          ${unlocked ? colors.bg : 'bg-gray-200'}
        `}>
          {isSecret ? (
            <Lock className="w-5 h-5 text-gray-400" />
          ) : (
            <span className={iconSizes[size]}>{achievement.icon}</span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
              {isSecret ? '???' : achievement.name}
            </h3>
            {unlocked && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <p className={`text-sm mt-0.5 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {isSecret ? 'Conquista secreta - continue explorando!' : achievement.description}
          </p>

          {/* Pontos */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-medium ${colors.text}`}>
              +{achievement.points} pts
            </span>
            {unlockedAt && (
              <span className="text-xs text-gray-400">
                • Desbloqueado em {new Date(unlockedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>

          {/* Barra de progresso */}
          {showProgress && !unlocked && !isSecret && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round(progress)}% completo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
