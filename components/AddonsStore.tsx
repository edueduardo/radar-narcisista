'use client'

/**
 * TEMA 12: Componente de Loja de Add-ons
 * 
 * Exibe add-ons disponíveis para compra.
 * Pode ser usado como página completa ou seção em outra página.
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  PenLine,
  FileDown,
  BarChart3,
  Shield,
  FileText,
  Video,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  Zap,
  X
} from 'lucide-react'
import {
  ADDONS,
  getAddonsForPlan,
  getAddonsByCategory,
  formatAddonPrice,
  type Addon,
  type AddonCategory
} from '@/lib/addons-config'

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  PenLine,
  FileDown,
  BarChart3,
  Shield,
  FileText,
  Video,
}

interface AddonsStoreProps {
  userPlan?: string
  onPurchase?: (addon: Addon) => void
  showCategories?: boolean
  maxItems?: number
  compact?: boolean
}

export default function AddonsStore({
  userPlan = 'guardar',
  onPurchase,
  showCategories = true,
  maxItems,
  compact = false,
}: AddonsStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<AddonCategory | 'all'>('all')
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  
  // Filtrar add-ons
  let addons = getAddonsForPlan(userPlan)
  if (selectedCategory !== 'all') {
    addons = addons.filter(a => a.category === selectedCategory)
  }
  if (maxItems) {
    addons = addons.slice(0, maxItems)
  }
  
  const categories: { id: AddonCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'chat', label: 'Coach IA' },
    { id: 'diario', label: 'Diário' },
    { id: 'exportacao', label: 'Exportação' },
    { id: 'seguranca', label: 'Segurança' },
  ]
  
  const handlePurchase = async (addon: Addon) => {
    setPurchasingId(addon.id)
    
    try {
      if (onPurchase) {
        onPurchase(addon)
        return
      }
      
      // Chamar API de checkout para add-ons
      const response = await fetch('/api/stripe/addon-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addonId: addon.id }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Se não autenticado, redirecionar para login
        if (response.status === 401) {
          window.location.href = `/login?redirect=/loja&addon=${addon.id}`
          return
        }
        throw new Error(data.error || 'Erro ao processar pagamento')
      }
      
      // Redirecionar para checkout do Stripe
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Erro na compra:', error)
      alert(error.message || 'Erro ao processar compra. Tente novamente.')
    } finally {
      setPurchasingId(null)
    }
  }
  
  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Zap
    return Icon
  }
  
  if (compact) {
    return (
      <div className="space-y-3">
        {addons.map((addon) => {
          const Icon = getIcon(addon.icon)
          return (
            <div
              key={addon.id}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700"
            >
              <div className={`p-2 rounded-lg ${addon.bgColor}`}>
                <Icon className={`w-4 h-4 ${addon.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {addon.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {addon.shortDescription}
                </p>
              </div>
              <button
                onClick={() => handlePurchase(addon)}
                disabled={purchasingId === addon.id}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {formatAddonPrice(addon.price)}
              </button>
            </div>
          )
        })}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Filtros por categoria */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Grid de add-ons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((addon) => {
          const Icon = getIcon(addon.icon)
          const hasDiscount = addon.originalPrice && addon.originalPrice > addon.price
          
          return (
            <div
              key={addon.id}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                addon.popular
                  ? 'border-violet-300 dark:border-violet-700'
                  : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              {/* Badge Popular */}
              {addon.popular && (
                <div className="absolute top-3 right-3">
                  <span className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}
              
              {/* Badge Em Breve */}
              {addon.comingSoon && (
                <div className="absolute top-3 right-3">
                  <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
                    Em breve
                  </span>
                </div>
              )}
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${addon.bgColor}`}>
                    <Icon className={`w-6 h-6 ${addon.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {addon.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {addon.shortDescription}
                    </p>
                  </div>
                </div>
                
                {/* Features (se houver) */}
                {addon.features && addon.features.length > 0 && (
                  <ul className="space-y-1.5 mb-4">
                    {addon.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Créditos (se houver) */}
                {addon.credits && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{addon.credits} créditos</span>
                    {addon.validityDays && (
                      <>
                        <span className="text-gray-400">•</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Válido por {addon.validityDays} dias</span>
                      </>
                    )}
                  </div>
                )}
                
                {/* Preço e botão */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through mr-2">
                        {formatAddonPrice(addon.originalPrice!)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatAddonPrice(addon.price)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(addon)}
                    disabled={purchasingId === addon.id || addon.comingSoon}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                      addon.comingSoon
                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    {purchasingId === addon.id ? (
                      'Processando...'
                    ) : addon.comingSoon ? (
                      'Em breve'
                    ) : (
                      <>
                        Comprar
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {addons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum add-on disponível para esta categoria.
          </p>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// COMPONENTE DE UPSELL CONTEXTUAL
// =============================================================================

interface UpsellBannerProps {
  trigger: string
  onDismiss?: () => void
  onPurchase?: (addon: Addon) => void
}

export function UpsellBanner({ trigger, onDismiss, onPurchase }: UpsellBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  
  // Importar função aqui para evitar dependência circular
  const { getUpsellForTrigger, getAddonById } = require('@/lib/addons-config')
  
  const upsell = getUpsellForTrigger(trigger)
  if (!upsell || dismissed) return null
  
  const addon = getAddonById(upsell.addonId)
  if (!addon) return null
  
  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }
  
  const handlePurchase = () => {
    onPurchase?.(addon)
  }
  
  const Icon = ICON_MAP[addon.icon] || Zap
  
  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${addon.bgColor}`}>
          <Icon className={`w-5 h-5 ${addon.color}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-violet-900 dark:text-violet-300">
            {upsell.title}
          </h4>
          <p className="text-sm text-violet-700 dark:text-violet-400 mt-1">
            {upsell.message}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handlePurchase}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {formatAddonPrice(addon.price)} - Comprar
            </button>
            <Link
              href="/planos"
              className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
            >
              Ver planos
            </Link>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-violet-400 hover:text-violet-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
