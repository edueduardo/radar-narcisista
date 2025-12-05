'use client'

/**
 * Admin: Configuração do Stripe
 * Permite configurar os price_ids reais do Stripe para cada plano
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Key,
  DollarSign,
  Calendar
} from 'lucide-react'

interface PlanConfig {
  id: string
  slug: string
  name: string
  price_monthly: number
  price_yearly: number
  stripe_price_id_mensal: string | null
  stripe_price_id_anual: string | null
  is_active: boolean
}

export default function StripeConfigPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const supabase = createClient()

  // Carregar planos
  useEffect(() => {
    loadPlans()
    checkStripeConnection()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      // Tentar buscar de plan_catalog primeiro
      const { data: catalogPlans, error: catalogError } = await supabase
        .from('plan_catalog')
        .select('id, slug, name, price_monthly, price_yearly, stripe_price_id_mensal, stripe_price_id_anual, is_active')
        .order('display_order', { ascending: true })

      if (!catalogError && catalogPlans && catalogPlans.length > 0) {
        setPlans(catalogPlans)
      } else {
        // Fallback para billing_plans
        const { data: billingPlans, error: billingError } = await supabase
          .from('billing_plans')
          .select('id, code, name_pt, price_monthly_cents, price_yearly_cents, stripe_price_id_monthly, stripe_price_id_yearly, is_public')
          .order('sort_order', { ascending: true })

        if (!billingError && billingPlans) {
          setPlans(billingPlans.map(p => ({
            id: p.id,
            slug: p.code,
            name: p.name_pt,
            price_monthly: p.price_monthly_cents / 100,
            price_yearly: p.price_yearly_cents / 100,
            stripe_price_id_mensal: p.stripe_price_id_monthly,
            stripe_price_id_anual: p.stripe_price_id_yearly,
            is_active: p.is_public
          })))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkStripeConnection = async () => {
    try {
      const response = await fetch('/api/stripe/status')
      const data = await response.json()
      setStripeConnected(data.connected || false)
    } catch {
      setStripeConnected(false)
    }
  }

  const handlePriceIdChange = (planId: string, field: 'mensal' | 'anual', value: string) => {
    setPlans(prev => prev.map(p => 
      p.id === planId 
        ? { ...p, [field === 'mensal' ? 'stripe_price_id_mensal' : 'stripe_price_id_anual']: value }
        : p
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const plan of plans) {
        // Tentar atualizar em plan_catalog
        const { error: catalogError } = await supabase
          .from('plan_catalog')
          .update({
            stripe_price_id_mensal: plan.stripe_price_id_mensal,
            stripe_price_id_anual: plan.stripe_price_id_anual
          })
          .eq('id', plan.id)

        if (catalogError) {
          // Fallback para billing_plans
          await supabase
            .from('billing_plans')
            .update({
              stripe_price_id_monthly: plan.stripe_price_id_mensal,
              stripe_price_id_yearly: plan.stripe_price_id_anual
            })
            .eq('id', plan.id)
        }
      }

      alert('✅ Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-400" />
              Configuração do Stripe
            </h1>
            <p className="text-gray-400">Configure os Price IDs reais para cada plano</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Configurações
        </button>
      </div>

      {/* Status do Stripe */}
      <div className={`mb-6 p-4 rounded-xl border ${
        stripeConnected 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {stripeConnected ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <div>
            <p className={`font-medium ${stripeConnected ? 'text-green-400' : 'text-red-400'}`}>
              {stripeConnected ? 'Stripe Conectado' : 'Stripe Não Configurado'}
            </p>
            <p className="text-sm text-gray-400">
              {stripeConnected 
                ? 'A chave do Stripe está configurada no ambiente.'
                : 'Configure STRIPE_SECRET_KEY no .env.local'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-400">Como obter os Price IDs</p>
            <ol className="text-sm text-gray-300 mt-2 space-y-1 list-decimal list-inside">
              <li>Acesse o <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Dashboard do Stripe</a></li>
              <li>Crie um produto para cada plano</li>
              <li>Adicione preços (mensal e anual) para cada produto</li>
              <li>Copie o Price ID (começa com <code className="bg-slate-700 px-1 rounded">price_</code>)</li>
              <li>Cole nos campos abaixo</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Lista de Planos */}
      <div className="space-y-4">
        {plans.map(plan => (
          <div 
            key={plan.id}
            className={`bg-slate-800/50 border rounded-xl p-6 ${
              plan.is_active ? 'border-slate-700' : 'border-slate-700/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {plan.name}
                  {!plan.is_active && (
                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">Inativo</span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">Slug: {plan.slug}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Preços configurados:</p>
                <p className="text-green-400">{formatPrice(plan.price_monthly)}/mês</p>
                <p className="text-green-400">{formatPrice(plan.price_yearly)}/ano</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Price ID Mensal */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Price ID Mensal
                </label>
                <input
                  type="text"
                  value={plan.stripe_price_id_mensal || ''}
                  onChange={e => handlePriceIdChange(plan.id, 'mensal', e.target.value)}
                  placeholder="price_xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                />
                {plan.stripe_price_id_mensal && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Configurado
                  </p>
                )}
              </div>

              {/* Price ID Anual */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Price ID Anual
                </label>
                <input
                  type="text"
                  value={plan.stripe_price_id_anual || ''}
                  onChange={e => handlePriceIdChange(plan.id, 'anual', e.target.value)}
                  placeholder="price_xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                />
                {plan.stripe_price_id_anual && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Configurado
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link para Stripe Dashboard */}
      <div className="mt-8 text-center">
        <a
          href="https://dashboard.stripe.com/products"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Dashboard do Stripe
        </a>
      </div>
    </div>
  )
}
