'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, XCircle, ChevronRight, X } from 'lucide-react'

// ============================================================================
// RADAR NARCISISTA BR - DESIGN SYSTEM PREMIUM
// Paleta: Dark mode com tons azulados, roxo como destaque
// ============================================================================

// ============================================================================
// CORES DO SISTEMA (para referência)
// ============================================================================
export const RADAR_COLORS = {
  // Backgrounds
  bg: {
    base: '#020617',      // slate-950 - fundo principal
    surface: '#0F172A',   // slate-900 - cards e superfícies
    elevated: '#1E293B',  // slate-800 - elementos elevados
    hover: '#334155',     // slate-700 - hover states
  },
  // Texto
  text: {
    primary: '#F9FAFB',   // gray-50 - texto principal
    secondary: '#9CA3AF', // gray-400 - texto secundário
    muted: '#6B7280',     // gray-500 - texto discreto
  },
  // Destaque
  accent: {
    primary: '#7C3AED',   // violet-600 - CTA principal
    primaryHover: '#6D28D9', // violet-700
    secondary: '#2563EB', // blue-600 - alternativo
  },
  // Estados
  state: {
    success: '#22C55E',   // green-500
    warning: '#FACC15',   // yellow-400
    danger: '#EF4444',    // red-500
    info: '#3B82F6',      // blue-500
  },
  // Intensidade (para tags)
  intensity: {
    leve: '#22C55E',      // verde
    moderado: '#FACC15',  // amarelo
    grave: '#EF4444',     // vermelho
  }
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 shadow-lg shadow-violet-500/20',
        secondary: 'bg-slate-800 text-gray-100 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700',
        ghost: 'bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outline: 'bg-transparent border-2 border-violet-600 text-violet-400 hover:bg-violet-600/10',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const RadarButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
RadarButton.displayName = 'RadarButton'

// ============================================================================
// CARD COMPONENT
// ============================================================================
const cardVariants = cva(
  'rounded-2xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-slate-900/80 border border-slate-800/50',
        soft: 'bg-slate-900/50 border border-slate-800/30',
        elevated: 'bg-slate-800/80 border border-slate-700/50 shadow-xl shadow-black/20',
        outline: 'bg-transparent border-2 border-slate-700',
        danger: 'bg-red-950/30 border border-red-900/50',
        success: 'bg-green-950/30 border border-green-900/50',
        warning: 'bg-yellow-950/30 border border-yellow-900/50',
        accent: 'bg-violet-950/30 border border-violet-900/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'hover:border-slate-700 hover:shadow-lg cursor-pointer',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const RadarCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover, className }))}
        {...props}
      />
    )
  }
)
RadarCard.displayName = 'RadarCard'

// ============================================================================
// TAG / BADGE COMPONENT
// ============================================================================
const tagVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      tone: {
        leve: 'bg-green-500/20 text-green-400 border border-green-500/30',
        moderado: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        grave: 'bg-red-500/20 text-red-400 border border-red-500/30',
        neutral: 'bg-slate-700/50 text-gray-300 border border-slate-600/50',
        accent: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  dot?: boolean
}

export const RadarTag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, tone, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(tagVariants({ tone, size, className }))}
        {...props}
      >
        {dot && (
          <span className={cn(
            'w-2 h-2 rounded-full',
            tone === 'leve' && 'bg-green-400',
            tone === 'moderado' && 'bg-yellow-400',
            tone === 'grave' && 'bg-red-400',
            tone === 'neutral' && 'bg-gray-400',
            tone === 'accent' && 'bg-violet-400',
            tone === 'info' && 'bg-blue-400',
          )} />
        )}
        {children}
      </span>
    )
  }
)
RadarTag.displayName = 'RadarTag'

// ============================================================================
// ALERT BANNER COMPONENT
// ============================================================================
const alertVariants = cva(
  'rounded-xl p-4 flex items-start gap-3',
  {
    variants: {
      type: {
        info: 'bg-blue-950/50 border border-blue-900/50 text-blue-200',
        warning: 'bg-yellow-950/50 border border-yellow-900/50 text-yellow-200',
        danger: 'bg-red-950/50 border border-red-900/50 text-red-200',
        success: 'bg-green-950/50 border border-green-900/50 text-green-200',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
)

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export const RadarAlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, type, title, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = {
      info: Info,
      warning: AlertTriangle,
      danger: XCircle,
      success: CheckCircle,
    }[type || 'info']

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ type, className }))}
        {...props}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-sm mb-1">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)
RadarAlertBanner.displayName = 'RadarAlertBanner'

// ============================================================================
// INPUT COMPONENT
// ============================================================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const RadarInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl',
            'text-gray-100 placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
RadarInput.displayName = 'RadarInput'

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const RadarTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl',
            'text-gray-100 placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
            'transition-all duration-200 resize-none',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
RadarTextarea.displayName = 'RadarTextarea'

// ============================================================================
// MODAL COMPONENT
// ============================================================================
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const RadarModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        sizeClasses[size]
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STEPPER COMPONENT
// ============================================================================
export interface StepperProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export const RadarStepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => onStepClick?.(index)}
            disabled={!onStepClick}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
              index === currentStep
                ? 'bg-violet-600 text-white'
                : index < currentStep
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-slate-800 text-gray-500',
              onStepClick && 'cursor-pointer hover:opacity-80'
            )}
          >
            <span className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
              index === currentStep
                ? 'bg-white/20'
                : index < currentStep
                  ? 'bg-green-500/30'
                  : 'bg-slate-700'
            )}>
              {index < currentStep ? '✓' : index + 1}
            </span>
            <span className="text-sm font-medium hidden sm:inline">{step}</span>
          </button>
          
          {index < steps.length - 1 && (
            <ChevronRight className={cn(
              'w-4 h-4',
              index < currentStep ? 'text-green-400' : 'text-gray-600'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ============================================================================
// SLIDER COMPONENT (para intensidade)
// ============================================================================
export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  showValue?: boolean
}

export const RadarSlider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  showValue = true,
}) => {
  const percentage = ((value - min) / (max - min)) * 100
  
  const getColor = () => {
    if (percentage <= 33) return 'bg-green-500'
    if (percentage <= 66) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          {showValue && (
            <span className={cn(
              'text-sm font-bold',
              percentage <= 33 ? 'text-green-400' : percentage <= 66 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {value}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div
          className={cn('absolute top-0 left-0 h-2 rounded-full pointer-events-none', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// EMOTION CHIPS COMPONENT
// ============================================================================
const EMOTIONS = [
  { id: 'raiva', label: 'Raiva', emoji: '😤' },
  { id: 'medo', label: 'Medo', emoji: '😨' },
  { id: 'tristeza', label: 'Tristeza', emoji: '😢' },
  { id: 'confusao', label: 'Confusão', emoji: '😵' },
  { id: 'ansiedade', label: 'Ansiedade', emoji: '😰' },
  { id: 'vergonha', label: 'Vergonha', emoji: '😳' },
  { id: 'culpa', label: 'Culpa', emoji: '😔' },
  { id: 'alivio', label: 'Alívio', emoji: '😌' },
]

export interface EmotionChipsProps {
  selected: string[]
  onChange: (selected: string[]) => void
  label?: string
}

export const RadarEmotionChips: React.FC<EmotionChipsProps> = ({
  selected,
  onChange,
  label,
}) => {
  const toggleEmotion = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(e => e !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.id}
            type="button"
            onClick={() => toggleEmotion(emotion.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'border flex items-center gap-1.5',
              selected.includes(emotion.id)
                ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
            )}
          >
            <span>{emotion.emoji}</span>
            <span>{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PROGRESS WIDGET (para dashboard)
// ============================================================================
export interface ProgressWidgetProps {
  title: string
  value: number
  total: number
  label?: string
  color?: 'violet' | 'green' | 'blue'
}

export const RadarProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  value,
  total,
  label,
  color = 'violet',
}) => {
  const percentage = Math.min((value / total) * 100, 100)
  
  const colorClasses = {
    violet: 'bg-violet-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{title}</span>
        <span className="text-sm text-gray-500">{value}/{total}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && (
        <p className="text-xs text-gray-500">{label}</p>
      )}
    </div>
  )
}

// ============================================================================
// EXPORT ALL
// ============================================================================
export {
  buttonVariants,
  cardVariants,
  tagVariants,
  alertVariants,
}
