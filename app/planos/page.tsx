'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  Shield, 
  Zap, 
  Crown,
  CreditCard,
  Lock,
  RefreshCw
} from 'lucide-react'
import { PLANOS, formatarPreco } from '../../lib/stripe'

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  const [carregando, setCarregando] = useState<string | null>(null)

  const handleAssinar = async (planoId: 'essencial' | 'premium') => {
    setCarregando(planoId)
    
    try {
      // Chamar API para criar checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoId, periodo }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirecionar para Stripe Checkout
        window.location.href = data.url
      } else {
        alert('Erro ao iniciar pagamento. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setCarregando(null)
    }
  }

  const economiaAnual = (mensal: number, anual: number) => {
    const totalMensal = mensal * 12
    const economia = totalMensal - anual
    const percentual = Math.round((economia / totalMensal) * 100)
    return { economia, percentual }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Invista na sua clareza mental. Todos os planos incluem 7 dias de garantia.
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`font-medium ${periodo === 'mensal' ? 'text-gray-900' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setPeriodo(periodo === 'mensal' ? 'anual' : 'mensal')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                periodo === 'anual' ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                periodo === 'anual' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={`font-medium ${periodo === 'anual' ? 'text-gray-900' : 'text-gray-400'}`}>
              Anual
            </span>
            {periodo === 'anual' && (
              <span className="bg-green-100 text-green-700 text-sm font-medium px-2 py-1 rounded-full">
                Economize até 17%
              </span>
            )}
          </div>
        </div>

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Plano Gratuito */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{PLANOS.GRATUITO.nome}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 0</span>
                <span className="text-gray-500">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {PLANOS.GRATUITO.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 opacity-50">
                <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Exportar PDF</span>
              </li>
              <li className="flex items-start gap-2 opacity-50">
                <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Histórico completo</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-not-allowed"
            >
              Plano Atual
            </button>
          </div>

          {/* Plano Essencial */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{PLANOS.ESSENCIAL.nome}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatarPreco(periodo === 'mensal' ? PLANOS.ESSENCIAL.preco : PLANOS.ESSENCIAL.precoAnual / 12)}
                </span>
                <span className="text-gray-500">/mês</span>
              </div>
              {periodo === 'anual' && (
                <p className="text-sm text-green-600 mt-1">
                  {formatarPreco(PLANOS.ESSENCIAL.precoAnual)}/ano 
                  (economia de {formatarPreco(economiaAnual(PLANOS.ESSENCIAL.preco, PLANOS.ESSENCIAL.precoAnual).economia)})
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {PLANOS.ESSENCIAL.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleAssinar('essencial')}
              disabled={carregando !== null}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {carregando === 'essencial' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Assinar Essencial
                </>
              )}
            </button>
          </div>

          {/* Plano Premium */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            {/* Badge Popular */}
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                <Crown className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold">{PLANOS.PREMIUM.nome}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatarPreco(periodo === 'mensal' ? PLANOS.PREMIUM.preco : PLANOS.PREMIUM.precoAnual / 12)}
                </span>
                <span className="text-white/70">/mês</span>
              </div>
              {periodo === 'anual' && (
                <p className="text-sm text-green-300 mt-1">
                  {formatarPreco(PLANOS.PREMIUM.precoAnual)}/ano 
                  (economia de {formatarPreco(economiaAnual(PLANOS.PREMIUM.preco, PLANOS.PREMIUM.precoAnual).economia)})
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {PLANOS.PREMIUM.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleAssinar('premium')}
              disabled={carregando !== null}
              className="w-full py-3 px-4 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {carregando === 'premium' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  Assinar Premium
                </>
              )}
            </button>
          </div>
        </div>

        {/* Garantias */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            Sua segurança é nossa prioridade
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">7 dias de garantia</h4>
              <p className="text-sm text-gray-600">Não gostou? Devolvemos 100% do valor.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Pagamento seguro</h4>
              <p className="text-sm text-gray-600">Processado pelo Stripe, líder mundial.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Cancele quando quiser</h4>
              <p className="text-sm text-gray-600">Sem multa, sem burocracia.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            Perguntas Frequentes
          </h3>
          <div className="space-y-4 max-w-2xl mx-auto">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100">
                <span className="font-medium text-gray-900">Posso cancelar a qualquer momento?</span>
                <span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 text-sm">
                Sim! Você pode cancelar sua assinatura a qualquer momento, sem multa. 
                Seu acesso continua até o fim do período pago.
              </p>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100">
                <span className="font-medium text-gray-900">Meus dados ficam seguros?</span>
                <span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 text-sm">
                Absolutamente. Usamos criptografia de ponta a ponta e seguimos a LGPD. 
                Seus dados nunca são compartilhados com terceiros.
              </p>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100">
                <span className="font-medium text-gray-900">Quais formas de pagamento?</span>
                <span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 text-sm">
                Aceitamos cartão de crédito (Visa, Mastercard, Elo, American Express) 
                e PIX. O pagamento é processado pelo Stripe.
              </p>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100">
                <span className="font-medium text-gray-900">E se eu não gostar?</span>
                <span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 text-sm">
                Oferecemos 7 dias de garantia incondicional. Se não gostar, 
                devolvemos 100% do valor, sem perguntas.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
