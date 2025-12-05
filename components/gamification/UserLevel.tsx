'use client'

/**
 * Componente de Nível do Usuário
 * Exibe o nível atual e progresso para o próximo
 */

import { calculateLevel } from '@/lib/gamification'
import { Star, TrendingUp } from 'lucide-react'

interface Props {
  totalPoints: number
  variant?: 'full' | 'compact' | 'badge'
}

export default function UserLevel({ totalPoints, variant = 'full' }: Props) {
  const { level, title, nextLevelPoints, progress } = calculateLevel(totalPoints)

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
        <Star className="w-4 h-4" />
        <span>Nível {level}</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
          {level}
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{totalPoints} pts</p>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {level}
          </div>
          <div>
            <p className="text-sm text-gray-500">Seu nível</p>
            <p className="text-xl font-bold text-gray-900">{title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">{totalPoints}</p>
          <p className="text-xs text-gray-500">pontos totais</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-2">
        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {Math.round(progress)}% para o próximo nível
        </span>
        <span className="text-purple-600 font-medium flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {nextLevelPoints - totalPoints} pts restantes
        </span>
      </div>
    </div>
  )
}
