"use client"

import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain, CheckCircle, Users, Eye, HelpCircle } from 'lucide-react'

interface AIStepsExplanationProps {
  totalIAs?: number
  taxaConsenso?: number
  validacoes?: number
  consensos?: number
  showTechnicalDetails?: boolean
}

export function AIStepsExplanation({
  totalIAs = 3,
  taxaConsenso = 1,
  validacoes = 3,
  consensos = 3,
  showTechnicalDetails = false
}: AIStepsExplanationProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
      {/* Título com explicação simples */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Como funciona esta análise?</h3>
          <p className="text-sm text-gray-600 mt-1">
            Usamos várias IAs trabalhando juntas para te dar uma visão mais equilibrada e confiável.
          </p>
        </div>
      </div>

      {/* Explicação em linguagem simples */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Leitura e compreensão</p>
              <p className="text-sm text-gray-600">
                {totalIAs} IAs diferentes leem o que você escreveu e tentam entender o contexto.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Verificação cruzada</p>
              <p className="text-sm text-gray-600">
                Cada IA verifica se as outras entenderam corretamente, como amigos conferindo uma história.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-purple-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Resultado equilibrado</p>
              <p className="text-sm text-gray-600">
                Só mostramos o que a maioria das IAs concordou, evitando opiniões isoladas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de confiabilidade */}
      <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Confiabilidade:</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.round(taxaConsenso * 100)}%` }}
            />
          </div>
          <span className="text-sm font-bold text-green-600">
            {Math.round(taxaConsenso * 100)}%
          </span>
        </div>
      </div>

      {/* Aviso importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            <strong>Lembre-se:</strong> Esta análise é uma ferramenta de clareza emocional, 
            não um diagnóstico profissional. Use como apoio para organizar seus pensamentos.
          </p>
        </div>
      </div>

      {/* Detalhes técnicos (opcional) */}
      {showTechnicalDetails && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            <span>Ver detalhes técnicos</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="bg-gray-900 text-white rounded-lg p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span>🔍 Etapa 1 - Análise:</span>
                <span>{totalIAs} IAs</span>
              </div>
              <div className="flex justify-between">
                <span>🗳️ Etapa 2 - Votação:</span>
                <span>{validacoes} validações</span>
              </div>
              <div className="flex justify-between">
                <span>🤝 Etapa 3 - Consenso:</span>
                <span>{consensos} consensos</span>
              </div>
              <div className="flex justify-between">
                <span>📊 Taxa de consenso:</span>
                <span>{Math.round(taxaConsenso * 100)}%</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
