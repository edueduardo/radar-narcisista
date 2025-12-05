'use client'

/**
 * Wizard de Onboarding
 * Guia o usuário do cadastro até o primeiro teste de clareza
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  Heart,
  BookOpen,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface Props {
  onComplete?: () => void
  initialStep?: number
}

export default function OnboardingWizard({ onComplete, initialStep = 0 }: Props) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [completed, setCompleted] = useState<string[]>([])
  const [userName, setUserName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vinda ao Radar',
      description: 'Um espaço seguro para você',
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Você não está sozinha
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            O Radar Narcisista foi criado para ajudar pessoas que vivem ou viveram 
            relacionamentos difíceis a entender, documentar e se proteger.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-purple-50 rounded-xl">
              <Lightbulb className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Entenda</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Registre</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Processe</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Sua Privacidade',
      description: 'Como protegemos seus dados',
      icon: <Lock className="w-8 h-8 text-green-500" />,
      content: (
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Seus dados são seus
          </h2>
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Criptografia total</p>
                <p className="text-sm text-gray-500">Seus registros são protegidos com criptografia de ponta a ponta</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Nunca vendemos dados</p>
                <p className="text-sm text-gray-500">Seus dados nunca são compartilhados ou vendidos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Você no controle</p>
                <p className="text-sm text-gray-500">Exporte ou apague seus dados quando quiser</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tools',
      title: 'Suas Ferramentas',
      description: 'O que você pode fazer aqui',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Três pilares para sua proteção
          </h2>
          <div className="space-y-4 max-w-md mx-auto">
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Teste de Clareza</h3>
              </div>
              <p className="text-sm text-gray-600">
                Questionário que ajuda a identificar padrões e nomear o que você está vivendo.
              </p>
            </div>
            <div className="p-5 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-green-500" />
                <h3 className="font-semibold text-gray-900">Diário & Timeline</h3>
              </div>
              <p className="text-sm text-gray-600">
                Registre episódios com data e hora. Pode ter valor probatório.
              </p>
            </div>
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-6 h-6 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Chat com IA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Converse 24h com uma IA que ouve sem julgar e ajuda a organizar pensamentos.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'start',
      title: 'Começar',
      description: 'Seu primeiro passo',
      icon: <ArrowRight className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pronta para começar?
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Recomendamos começar pelo <strong>Teste de Clareza</strong>. 
            Leva cerca de 10 minutos e vai te ajudar a entender melhor sua situação.
          </p>
          <div className="bg-purple-50 p-4 rounded-xl max-w-md mx-auto mb-6">
            <p className="text-sm text-purple-700">
              💡 <strong>Dica:</strong> Você pode fazer o teste quantas vezes quiser. 
              Muitas pessoas refazem após alguns meses para ver sua evolução.
            </p>
          </div>
          <label className="flex items-center gap-3 justify-center text-sm text-gray-600 mb-4">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Li e aceito os{' '}
            <a href="/termos" target="_blank" className="text-purple-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/privacidade" target="_blank" className="text-purple-600 hover:underline">
              Política de Privacidade
            </a>
          </label>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompleted([...completed, steps[currentStep].id])
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // Marcar onboarding como completo
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', user.id)
      }
    } catch (error) {
      console.error('Erro ao marcar onboarding:', error)
    }

    if (onComplete) {
      onComplete()
    } else {
      router.push('/teste-clareza')
    }
  }

  const canProceed = currentStep < steps.length - 1 || acceptedTerms

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div 
          className="bg-purple-600 h-1 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps indicator */}
      <div className="flex justify-center gap-2 py-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentStep 
                ? 'bg-purple-600' 
                : index < currentStep 
                  ? 'bg-purple-300' 
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {steps[currentStep].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <span className="text-sm text-gray-500">
            {currentStep + 1} de {steps.length}
          </span>

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Fazer Teste de Clareza
                <Lightbulb className="w-4 h-4" />
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
