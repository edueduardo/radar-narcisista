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
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Users,
  Eye
} from 'lucide-react'
import { PLANS, getDisplayPlans, formatPrice, getAnnualSavings, type PlanConfig } from '@/lib/plans-config'
import { useConsumerPlans, type PlanWithPromotion } from '@/hooks/usePlans'

// TEMA 10: Página de planos com novos nomes
// Radar Guardar, Radar Jornada, Radar Defesa

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  const [carregando, setCarregando] = useState<string | null>(null)

  // Buscar planos do banco (com fallback para hardcoded)
  const { plans: dbPlans, source: plansSource } = useConsumerPlans()
  
  // Usar planos do banco se disponíveis, senão fallback
  const displayPlans = dbPlans.length > 0 
    ? dbPlans.filter(p => !p.comingSoon)
    : getDisplayPlans(false, true).filter(p => !p.comingSoon) // Inclui profissional

  const handleAssinar = async (plan: PlanConfig) => {
    // Mapear para IDs legados do Stripe
    const planoId = plan.legacyId === 'essencial' ? 'essencial' : 
                    plan.legacyId === 'premium' ? 'premium' : null
    
    if (!planoId) {
      alert('Este plano ainda não está disponível para assinatura.')
      return
    }
    
    setCarregando(plan.id)
    
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

  // Ícone por plano
  const getPlanIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye className="h-6 w-6" />
      case 'Shield': return <Shield className="h-6 w-6" />
      case 'TrendingUp': return <TrendingUp className="h-6 w-6" />
      case 'ShieldAlert': return <ShieldAlert className="h-6 w-6" />
      case 'Users': return <Users className="h-6 w-6" />
      default: return <Shield className="h-6 w-6" />
    }
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

        {/* Cards de Planos - 3 cards verticais (sem Profissional) */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {displayPlans.filter(p => !p.comingSoon).map((plan) => {
            const planWithPromo = plan as PlanWithPromotion
            const isPopular = plan.popular
            const isFree = plan.price === 0
            
            // Usar preço efetivo se disponível (com promoção)
            const effectiveMonthly = planWithPromo.effectivePrice ?? plan.price
            const effectiveYearly = planWithPromo.effectivePriceAnnual ?? plan.priceAnnual
            const priceToShow = periodo === 'anual' && effectiveYearly 
              ? effectiveYearly / 12 
              : effectiveMonthly
            
            // Preço original (para mostrar riscado)
            const originalPrice = periodo === 'anual' && plan.priceAnnual
              ? plan.priceAnnual / 12
              : plan.price
            
            const hasPromo = planWithPromo.hasPromotion && planWithPromo.showOriginalPrice && originalPrice !== priceToShow
            const savings = getAnnualSavings(plan)
            
            return (
              <div 
                key={plan.id}
                className={`rounded-2xl shadow-lg p-6 relative overflow-hidden ${
                  isPopular 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                {/* Badge de promoção */}
                {planWithPromo.hasPromotion && planWithPromo.promotionLabel && (
                  <div className="absolute top-4 left-4">
                    <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${planWithPromo.promotionBadgeColor || 'bg-red-500'}`}>
                      {planWithPromo.promotionLabel}
                    </span>
                  </div>
                )}
                
                {/* Badge Popular */}
                {isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-white text-amber-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      POPULAR
                    </span>
                  </div>
                )}
                

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    isPopular ? 'bg-white/20' : plan.bgColor
                  }`}>
                    <span className={isPopular ? 'text-white' : plan.color}>
                      {getPlanIcon(plan.icon)}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${isPopular ? 'text-white/80' : 'text-gray-500'}`}>
                    {plan.tagline}
                  </p>
                  <div className="mt-4">
                    {/* Preço original riscado (se houver promoção) */}
                    {hasPromo && !isFree && (
                      <div className={`text-sm line-through ${isPopular ? 'text-white/50' : 'text-gray-400'}`}>
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                    <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(priceToShow)}
                    </span>
                    {!isFree && (
                      <span className={isPopular ? 'text-white/70' : 'text-gray-500'}>/mês</span>
                    )}
                  </div>
                  {periodo === 'anual' && savings > 0 && !hasPromo && (
                    <p className={`text-sm mt-1 ${isPopular ? 'text-green-200' : 'text-green-600'}`}>
                      Economia de {formatPrice(savings)}/ano
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-green-200' : 'text-green-500'
                        }`} />
                      ) : (
                        <X className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-white/40' : 'text-gray-300'
                        }`} />
                      )}
                      <span className={`text-sm ${
                        !feature.included 
                          ? (isPopular ? 'text-white/40' : 'text-gray-400')
                          : feature.highlight
                          ? (isPopular ? 'text-white font-medium' : 'text-gray-900 font-medium')
                          : (isPopular ? 'text-white/90' : 'text-gray-600')
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAssinar(plan)}
                  disabled={carregando !== null || isFree}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-white text-amber-600 hover:bg-gray-100'
                      : isFree
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {carregando === plan.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : isFree ? (
                    'Plano Atual'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Assinar {plan.name.replace('Radar ', '')}
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Banner Horizontal - Radar Profissional */}
        <Link 
          href="/profissional"
          className="block mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">Radar Profissional</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    EM BREVE
                  </span>
                </div>
                <p className="text-blue-100">
                  Para profissionais de saúde e direito. Gerencie clientes, gere relatórios para laudos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-2xl font-bold">R$ 99,90</div>
                <div className="text-blue-200 text-sm">/mês</div>
              </div>
              <div className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
                Entrar na lista →
              </div>
            </div>
          </div>
        </Link>

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
