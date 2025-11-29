'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PaywallProps {
  feature: string
  message?: string
  onClose?: () => void
}

export default function Paywall({ feature, message, onClose }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()

  const handleUpgrade = () => {
    // TODO: Implement Stripe checkout
    router.push('/upgrade')
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Desbloquear {feature}
          </h2>
          <p className="text-gray-600">
            {message || `Esta funcionalidade está disponível apenas para assinantes premium.`}
          </p>
        </div>

        {/* Plans */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedPlan === 'yearly'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Anual (20% OFF)
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-bold text-purple-900">
                R$ {selectedPlan === 'monthly' ? '29' : '23'}
              </span>
              <span className="text-gray-600">
                /{selectedPlan === 'monthly' ? 'mês' : 'mês (pago anualmente)'}
              </span>
            </div>
            <div className="text-sm text-purple-700">
              {selectedPlan === 'yearly' && (
                <span className="font-semibold">Economia R$ 72 no ano!</span>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">O que você desbloqueia:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{feature} ilimitado</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Transcrição de voz ilimitada</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Análises avançadas de padrões</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Exportação de relatórios em PDF</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Suporte prioritário</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
          >
            Assinar Agora
          </button>
          
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Agora Não
          </button>
        </div>

        {/* Trust */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            <span className="font-semibold">7 dias grátis</span> • Cancelar a qualquer momento • Pagamento seguro via Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
