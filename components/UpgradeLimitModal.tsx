'use client'

/**
 * TEMA 11: Modal de Upgrade quando limite é atingido
 * 
 * Uso:
 * <UpgradeLimitModal 
 *   isOpen={showModal} 
 *   onClose={() => setShowModal(false)}
 *   limitType="chat"
 *   currentPlan="guardar"
 * />
 */

import { useState } from 'react'
import Link from 'next/link'
import { 
  X, 
  Zap, 
  MessageCircle, 
  PenLine, 
  Target, 
  FileDown,
  Clock,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { PLANS, PlanLevel, formatPrice } from '@/lib/plans-config'
import { UPGRADE_MESSAGES } from '@/lib/plan-limits'

type LimitType = 'chat' | 'diary' | 'tests' | 'pdf' | 'history' | 'collaborativeAI'

interface UpgradeLimitModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: LimitType
  currentPlan: PlanLevel
  currentUsage?: number
  limit?: number
}

export default function UpgradeLimitModal({
  isOpen,
  onClose,
  limitType,
  currentPlan,
  currentUsage,
  limit,
}: UpgradeLimitModalProps) {
  if (!isOpen) return null
  
  const message = UPGRADE_MESSAGES[limitType]
  
  // Determinar plano recomendado
  const recommendedPlan = limitType === 'collaborativeAI' ? 'defesa' : 'jornada'
  const plan = PLANS[recommendedPlan]
  
  // Ícone por tipo de limite
  const getIcon = () => {
    switch (limitType) {
      case 'chat': return <MessageCircle className="w-8 h-8 text-violet-500" />
      case 'diary': return <PenLine className="w-8 h-8 text-blue-500" />
      case 'tests': return <Target className="w-8 h-8 text-emerald-500" />
      case 'pdf': return <FileDown className="w-8 h-8 text-orange-500" />
      case 'history': return <Clock className="w-8 h-8 text-purple-500" />
      case 'collaborativeAI': return <Users className="w-8 h-8 text-amber-500" />
      default: return <Zap className="w-8 h-8 text-violet-500" />
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{message.title}</h2>
              <p className="text-white/80 text-sm mt-1">{message.description}</p>
            </div>
          </div>
          
          {/* Barra de uso */}
          {currentUsage !== undefined && limit !== undefined && limit > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/80 mb-1">
                <span>Uso atual</span>
                <span>{currentUsage} / {limit}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min(100, (currentUsage / limit) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Conteúdo */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Faça upgrade para {plan.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {plan.description}
            </p>
          </div>
          
          {/* Features do plano */}
          <div className="space-y-2 mb-6">
            {plan.features.filter(f => f.included && f.highlight).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* Preço */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(plan.price)}
              </span>
              <span className="text-gray-500">/mês</span>
            </div>
            {plan.priceAnnual && (
              <p className="text-sm text-green-600 mt-1">
                ou {formatPrice(plan.priceAnnual)}/ano (economize {formatPrice(plan.price * 12 - plan.priceAnnual)})
              </p>
            )}
          </div>
          
          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Agora não
            </button>
            <Link
              href="/planos"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              Ver planos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Rodapé */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            7 dias de garantia • Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTE DE BARRA DE USO (para mostrar em UIs)
// =============================================================================

interface UsageBarProps {
  current: number
  limit: number
  label: string
  showUpgradeButton?: boolean
  onUpgradeClick?: () => void
}

export function UsageBar({ 
  current, 
  limit, 
  label,
  showUpgradeButton = true,
  onUpgradeClick 
}: UsageBarProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min(100, (current / limit) * 100)
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`font-medium ${
          isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {current} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      
      {!isUnlimited && (
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {isAtLimit && showUpgradeButton && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          Fazer upgrade →
        </button>
      )}
    </div>
  )
}
