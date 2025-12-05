'use client'

/**
 * TEMA 12: Página da Loja de Add-ons
 * Rota: /loja
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ShoppingBag, Sparkles, Gift } from 'lucide-react'
import AddonsStore from '@/components/AddonsStore'
import { usePlanLimits } from '@/hooks/usePlanLimits'

export default function LojaPage() {
  const { planLevel, planName, isLoading } = usePlanLimits()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-violet-100 dark:bg-violet-900 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Loja de Recursos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Recursos extras para potencializar sua jornada
              </p>
            </div>
          </div>
          
          {/* Info do plano atual */}
          {!isLoading && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Seu plano: <span className="font-medium text-gray-900 dark:text-white">{planName}</span>
              </span>
              <Link 
                href="/planos" 
                className="text-sm text-violet-600 dark:text-violet-400 hover:underline ml-2"
              >
                Fazer upgrade
              </Link>
            </div>
          )}
        </div>
        
        {/* Banner promocional */}
        <div className="mb-8 p-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Gift className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Primeira compra?</h2>
              <p className="text-white/80">
                Use o cupom <span className="font-mono bg-white/20 px-2 py-0.5 rounded">BEMVINDA</span> e ganhe 10% de desconto!
              </p>
            </div>
          </div>
        </div>
        
        {/* Loja de Add-ons */}
        <AddonsStore 
          userPlan={planLevel}
          showCategories={true}
        />
        
        {/* FAQ */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100 dark:border-slate-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  Os créditos expiram?
                </span>
                <span className="text-violet-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 dark:text-gray-400 text-sm">
                Sim, os pacotes de créditos têm validade indicada na descrição (geralmente 30 ou 60 dias). 
                Features e pacotes temáticos podem ter validade diferente ou ser permanentes.
              </p>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100 dark:border-slate-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  Posso pedir reembolso?
                </span>
                <span className="text-violet-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 dark:text-gray-400 text-sm">
                Sim, oferecemos 7 dias de garantia para todos os add-ons. 
                Se não ficar satisfeita, devolvemos 100% do valor.
              </p>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100 dark:border-slate-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  Qual a diferença entre add-on e upgrade de plano?
                </span>
                <span className="text-violet-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 dark:text-gray-400 text-sm">
                Add-ons são compras pontuais para necessidades específicas. 
                O upgrade de plano é uma assinatura mensal que desbloqueia recursos de forma permanente 
                e geralmente tem melhor custo-benefício para uso frequente.
              </p>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-100 dark:border-slate-700">
                <span className="font-medium text-gray-900 dark:text-white">
                  Os créditos acumulam com o plano?
                </span>
                <span className="text-violet-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="py-3 text-gray-600 dark:text-gray-400 text-sm">
                Sim! Se você tem o plano Radar Guardar com 5 mensagens/dia e compra +50 mensagens, 
                você terá 5 do plano + 50 do pacote = 55 mensagens disponíveis.
              </p>
            </details>
          </div>
        </div>
        
        {/* CTA para planos */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Precisa de mais recursos de forma recorrente?
          </p>
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Ver planos de assinatura
          </Link>
        </div>
      </div>
    </div>
  )
}
