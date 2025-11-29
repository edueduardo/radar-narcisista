'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { X, ChevronRight, ChevronLeft, Shield, Brain, BookOpen, MessageCircle, Heart, Sparkles } from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: string // Seletor CSS do elemento a destacar
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

interface OnboardingContextType {
  isActive: boolean
  currentStep: number
  totalSteps: number
  startOnboarding: () => void
  endOnboarding: () => void
  nextStep: () => void
  prevStep: () => void
  skipOnboarding: () => void
  hasCompletedOnboarding: boolean
}

// ============================================
// STEPS DO ONBOARDING
// ============================================

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vinda ao Radar Narcisista 💜',
    description: 'Este é um espaço seguro para você. Aqui você pode identificar padrões, registrar episódios e buscar clareza sobre seus relacionamentos. Tudo com total privacidade.',
    icon: <Heart className="h-12 w-12 text-purple-500" />,
    position: 'center'
  },
  {
    id: 'safety',
    title: 'Sua Segurança em Primeiro Lugar 🛡️',
    description: 'Pressione ESC a qualquer momento para ativar o modo de emergência. O site se transforma em um portal de notícias instantaneamente. Ninguém saberá o que você estava fazendo.',
    icon: <Shield className="h-12 w-12 text-red-500" />,
    position: 'center'
  },
  {
    id: 'test',
    title: 'Teste de Clareza 🧠',
    description: 'Faça o teste para entender melhor sua situação. São 16 perguntas rápidas que ajudam a identificar padrões de comportamento abusivo. Seus resultados são 100% privados.',
    icon: <Brain className="h-12 w-12 text-blue-500" />,
    position: 'center'
  },
  {
    id: 'diary',
    title: 'Diário de Episódios 📖',
    description: 'Registre os momentos importantes. Você pode escrever ou gravar áudio. A IA analisa padrões automaticamente e ajuda você a ver a situação com mais clareza.',
    icon: <BookOpen className="h-12 w-12 text-green-500" />,
    position: 'center'
  },
  {
    id: 'chat',
    title: 'Coach de Clareza 💬',
    description: 'Converse com nossa IA especializada. Ela foi treinada para ajudar pessoas em situações como a sua, sem julgamentos. Disponível 24h, sempre que precisar.',
    icon: <MessageCircle className="h-12 w-12 text-purple-500" />,
    position: 'center'
  },
  {
    id: 'ready',
    title: 'Você está pronta! ✨',
    description: 'Lembre-se: você não está sozinha. Milhares de pessoas passam pelo mesmo. Dê o primeiro passo hoje. Estamos aqui para ajudar.',
    icon: <Sparkles className="h-12 w-12 text-yellow-500" />,
    position: 'center'
  }
]

// ============================================
// CONTEXTO
// ============================================

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

// ============================================
// PROVIDER
// ============================================

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)

  // Verificar se já completou onboarding
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed')
    if (!completed) {
      setHasCompletedOnboarding(false)
      // Auto-iniciar após 1 segundo na primeira visita
      const timer = setTimeout(() => {
        setIsActive(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const startOnboarding = () => {
    setCurrentStep(0)
    setIsActive(true)
  }

  const endOnboarding = () => {
    setIsActive(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.setItem('onboarding_completed_at', new Date().toISOString())
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      endOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipOnboarding = () => {
    endOnboarding()
  }

  return (
    <OnboardingContext.Provider value={{
      isActive,
      currentStep,
      totalSteps: ONBOARDING_STEPS.length,
      startOnboarding,
      endOnboarding,
      nextStep,
      prevStep,
      skipOnboarding,
      hasCompletedOnboarding
    }}>
      {children}
      {isActive && (
        <OnboardingModal
          step={ONBOARDING_STEPS[currentStep]}
          currentStep={currentStep}
          totalSteps={ONBOARDING_STEPS.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipOnboarding}
          onClose={endOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  )
}

// ============================================
// MODAL DO ONBOARDING
// ============================================

function OnboardingModal({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose
}: {
  step: OnboardingStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onClose: () => void
}) {
  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext()
      } else if (e.key === 'ArrowLeft') {
        onPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onSkip}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-bounce-in">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep 
                      ? 'w-6 bg-white' 
                      : i < currentStep 
                        ? 'w-2 bg-white/70' 
                        : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Ícone */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              {step.icon}
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center">
            {step.title}
          </h2>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <p className="text-gray-600 text-center leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer com botões */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Botão Voltar */}
          <button
            onClick={onPrev}
            disabled={isFirstStep}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isFirstStep 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>

          {/* Botão Pular (só mostra se não for último) */}
          {!isLastStep && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Pular tutorial
            </button>
          )}

          {/* Botão Próximo/Começar */}
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            {isLastStep ? 'Começar!' : 'Próximo'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Dica de teclado */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-400">
            Use ← → ou Enter para navegar • ESC para fechar
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// BOTÃO PARA REINICIAR ONBOARDING
// ============================================

export function OnboardingTrigger() {
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding()

  if (!hasCompletedOnboarding) return null

  return (
    <button
      onClick={startOnboarding}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
    >
      <Sparkles className="h-4 w-4" />
      Ver tutorial
    </button>
  )
}

export default OnboardingProvider
