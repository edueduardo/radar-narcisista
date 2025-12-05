'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Sparkles, ArrowRight, Crown } from 'lucide-react'
import confetti from 'canvas-confetti'

function SucessoContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Disparar confetti
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9333ea', '#3b82f6', '#10b981']
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9333ea', '#3b82f6', '#10b981']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Ícone de sucesso */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Crown className="h-4 w-4 text-yellow-900" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Parabéns! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos premium.
          </p>

          {/* Benefícios */}
          <div className="bg-purple-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Agora você pode:
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Fazer testes ilimitados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Registrar no diário sem limites
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Conversar com o Coach IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Exportar relatórios em PDF
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Acessar histórico completo
              </li>
            </ul>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              Ir para o Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/teste-clareza"
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Fazer Teste de Clareza
            </Link>
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-400 mt-6">
            Um recibo foi enviado para seu email. 
            Você pode gerenciar sua assinatura nas configurações.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  )
}
