'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Shield, Phone } from 'lucide-react'

export default function LegalDisclaimer() {
  const [accepted, setAccepted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Verificar se usuario ja aceitou (apenas no cliente)
  useEffect(() => {
    setMounted(true)
    const hasAccepted = localStorage.getItem('legal-disclaimer-accepted')
    if (hasAccepted) {
      setAccepted(true)
      setDismissed(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('legal-disclaimer-accepted', 'true')
    setAccepted(true)
    setTimeout(() => setDismissed(true), 500)
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  // Nao renderizar no servidor ou se ja aceitou
  if (!mounted || accepted || dismissed) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Aviso Importante
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Restrição: 18 anos ou mais
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Este site não substitui ajuda profissional.</strong> Não é diagnóstico médico, psicológico ou aconselhamento legal.
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Em caso de emergência imediata:</strong><br />
              🚔 <strong>190</strong> - Polícia Militar<br />
              🆘 <strong>180</strong> - Central de Atendimento à Mulher<br />
              🏥 <strong>188</strong> - Disque Saúde (saúde mental)
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Ao continuar, você confirma ter 18+ anos ou mais e compreende que esta ferramenta é um apoio complementar, não substituindo tratamento profissional.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Entendi e Aceito
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
