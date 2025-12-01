'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

// ============================================================================
// EDIT SEMAFORO BADGE - Indicador visual de zona de edição
// ETAPA 9: Painel de Curadoria + Semáforo de Edição
// ============================================================================

export type SemaforoLevel = 'green' | 'yellow' | 'red'

interface Props {
  level: SemaforoLevel
  label?: string
  description?: string
  showInfo?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const LEVEL_CONFIG: Record<SemaforoLevel, {
  bg: string
  text: string
  dot: string
  defaultLabel: string
  defaultDescription: string
}> = {
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    defaultLabel: 'Zona Verde',
    defaultDescription: 'Pode editar livremente. Conteúdo, textos, títulos, FAQs, etc.'
  },
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    defaultLabel: 'Zona Amarela',
    defaultDescription: 'Edite com cautela. Textos sensíveis, avisos, mensagens de planos.'
  },
  red: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
    defaultLabel: 'Zona Vermelha',
    defaultDescription: 'Não mexer. Fluxos críticos, prompts de IA, lógica de risco, segurança.'
  }
}

const SIZE_CONFIG: Record<'sm' | 'md' | 'lg', {
  container: string
  dot: string
  text: string
}> = {
  sm: {
    container: 'px-2 py-1 gap-1.5',
    dot: 'w-2 h-2',
    text: 'text-xs'
  },
  md: {
    container: 'px-3 py-1.5 gap-2',
    dot: 'w-2.5 h-2.5',
    text: 'text-sm'
  },
  lg: {
    container: 'px-4 py-2 gap-2.5',
    dot: 'w-3 h-3',
    text: 'text-base'
  }
}

export default function EditSemaforoBadge({
  level,
  label,
  description,
  showInfo = true,
  size = 'md'
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  const config = LEVEL_CONFIG[level]
  const sizeConfig = SIZE_CONFIG[size]
  const displayLabel = label || config.defaultLabel
  const displayDescription = description || config.defaultDescription

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeConfig.container}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Bolinha colorida */}
        <span className={`rounded-full ${config.dot} ${sizeConfig.dot}`} />
        
        {/* Label */}
        <span className={sizeConfig.text}>{displayLabel}</span>
        
        {/* Ícone de info */}
        {showInfo && (
          <Info className={`w-3.5 h-3.5 opacity-60 cursor-help`} />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && showInfo && (
        <div className="absolute left-0 top-full mt-2 z-50 w-64 p-3 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <p className={`font-medium mb-1 ${config.text}`}>{displayLabel}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{displayDescription}</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE DE CARD COM SEMÁFORO
// Para usar no topo das páginas admin
// ============================================================================

interface SemaforoCardProps {
  level: SemaforoLevel
  title?: string
  description: string
}

export function SemaforoCard({ level, title, description }: SemaforoCardProps) {
  const config = LEVEL_CONFIG[level]
  
  return (
    <div className={`rounded-xl p-4 mb-6 border ${config.bg} border-opacity-50`}>
      <div className="flex items-start gap-3">
        <EditSemaforoBadge level={level} showInfo={false} />
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium mb-1 ${config.text}`}>{title}</h3>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXPLICAÇÃO DO SEMÁFORO (para usar no painel de curadoria)
// ============================================================================

export function SemaforoExplanation() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
        Sistema de Semáforo de Edição
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        O semáforo indica o nível de cuidado necessário ao editar cada área do sistema.
      </p>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <EditSemaforoBadge level="green" size="sm" showInfo={false} />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">
              Pode mexer à vontade
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Conteúdos publicados, FAQs, Radar no Mundo, Radar Academy, textos descritivos.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <EditSemaforoBadge level="yellow" size="sm" showInfo={false} />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400 text-sm">
              Pode mexer, mas com cautela
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Sugestões da IA, textos de planos, métricas, avisos sensíveis.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
          <EditSemaforoBadge level="red" size="sm" showInfo={false} />
          <div>
            <p className="font-medium text-rose-700 dark:text-rose-400 text-sm">
              Não mexer
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Fluxos do Triângulo, Plano de Segurança, prompts de IA, lógica de risco, botão de emergência.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
