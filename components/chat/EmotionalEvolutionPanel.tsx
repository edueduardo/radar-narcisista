"use client"

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Heart,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { EstadoEmocional, EvolucaoEmocional } from '@/lib/analise-emocional'

interface EmotionalEvolutionPanelProps {
  evolucao: EvolucaoEmocional
  historicoEstados: EstadoEmocional[]
  onContinueConversation?: () => void
}

// Cores por sentimento
const CORES_SENTIMENTO: Record<string, { bg: string; text: string; border: string }> = {
  muito_negativo: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  negativo: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  neutro: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  positivo: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  muito_positivo: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' }
}

const EMOJIS_SENTIMENTO: Record<string, string> = {
  muito_negativo: '😢',
  negativo: '😔',
  neutro: '😐',
  positivo: '🙂',
  muito_positivo: '😄'
}

const LABELS_SENTIMENTO: Record<string, string> = {
  muito_negativo: 'Muito difícil',
  negativo: 'Difícil',
  neutro: 'Neutro',
  positivo: 'Bem',
  muito_positivo: 'Muito bem'
}

export function EmotionalEvolutionPanel({
  evolucao,
  historicoEstados,
  onContinueConversation
}: EmotionalEvolutionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const { estadoAnterior, estadoAtual, mudanca, diferencaIntensidade, analise, sugestao } = evolucao

  // Ícone e cor baseado na mudança
  const getMudancaInfo = () => {
    switch (mudanca) {
      case 'melhora_significativa':
        return { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Melhora significativa!' }
      case 'melhora':
        return { icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50', label: 'Melhorando' }
      case 'estavel':
        return { icon: Minus, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Estável' }
      case 'piora':
        return { icon: TrendingDown, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'Atenção' }
      case 'piora_significativa':
        return { icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Precisa de apoio' }
    }
  }

  const mudancaInfo = getMudancaInfo()
  const MudancaIcon = mudancaInfo.icon

  const coresAtual = CORES_SENTIMENTO[estadoAtual.sentimento]
  const coresAnterior = estadoAnterior ? CORES_SENTIMENTO[estadoAnterior.sentimento] : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${mudancaInfo.bgColor} rounded-xl flex items-center justify-center`}>
            <Heart className={`w-5 h-5 ${mudancaInfo.color}`} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">Sua Evolução Emocional</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MudancaIcon className={`w-3 h-3 ${mudancaInfo.color}`} />
              {mudancaInfo.label}
              {diferencaIntensidade !== 0 && (
                <span className={mudancaInfo.color}>
                  ({diferencaIntensidade > 0 ? '+' : ''}{diferencaIntensidade})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{EMOJIS_SENTIMENTO[estadoAtual.sentimento]}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          
          {/* Comparação visual: Antes → Agora */}
          <div className={`${mudancaInfo.bgColor} rounded-xl p-4`}>
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4" />
              Comparação Emocional
            </h4>
            
            <div className="flex items-center justify-between gap-4">
              {/* Estado Anterior */}
              {estadoAnterior ? (
                <div className={`flex-1 p-3 rounded-xl ${coresAnterior?.bg} ${coresAnterior?.border} border`}>
                  <p className="text-xs text-gray-500 mb-1">Antes</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{EMOJIS_SENTIMENTO[estadoAnterior.sentimento]}</span>
                    <div>
                      <p className={`font-semibold text-sm ${coresAnterior?.text}`}>
                        {LABELS_SENTIMENTO[estadoAnterior.sentimento]}
                      </p>
                      <p className="text-xs text-gray-500">{estadoAnterior.intensidade}/100</p>
                    </div>
                  </div>
                  {estadoAnterior.emocoes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {estadoAnterior.emocoes.slice(0, 3).map((emocao, i) => (
                        <span key={i} className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                          {emocao}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 p-3 rounded-xl bg-gray-100 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Antes</p>
                  <p className="text-sm text-gray-400">Primeira mensagem</p>
                </div>
              )}

              {/* Seta */}
              <div className={`flex-shrink-0 ${mudancaInfo.color}`}>
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Estado Atual */}
              <div className={`flex-1 p-3 rounded-xl ${coresAtual.bg} ${coresAtual.border} border-2`}>
                <p className="text-xs text-gray-500 mb-1">Agora</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{EMOJIS_SENTIMENTO[estadoAtual.sentimento]}</span>
                  <div>
                    <p className={`font-semibold text-sm ${coresAtual.text}`}>
                      {LABELS_SENTIMENTO[estadoAtual.sentimento]}
                    </p>
                    <p className="text-xs text-gray-500">{estadoAtual.intensidade}/100</p>
                  </div>
                </div>
                {estadoAtual.emocoes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {estadoAtual.emocoes.slice(0, 3).map((emocao, i) => (
                      <span key={i} className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                        {emocao}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Análise da IA */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              O que eu percebi
            </h4>
            <p className="text-sm text-purple-700 leading-relaxed whitespace-pre-line">
              {analise}
            </p>
          </div>

          {/* Sugestão */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              Sugestão
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              {sugestao}
            </p>
          </div>

          {/* Histórico de estados */}
          {historicoEstados.length > 1 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
              >
                {showHistory ? '▼ Ocultar' : '▶ Ver'} histórico completo ({historicoEstados.length} mensagens)
              </button>
              
              {showHistory && (
                <div className="mt-3 space-y-2">
                  {historicoEstados.map((estado, index) => {
                    const cores = CORES_SENTIMENTO[estado.sentimento]
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-2 rounded-lg ${cores.bg} ${cores.border} border`}
                      >
                        <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                        <span className="text-xl">{EMOJIS_SENTIMENTO[estado.sentimento]}</span>
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${cores.text}`}>
                            {LABELS_SENTIMENTO[estado.sentimento]}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({estado.intensidade}/100)
                          </span>
                        </div>
                        {estado.emocoes.length > 0 && (
                          <div className="flex gap-1">
                            {estado.emocoes.slice(0, 2).map((e, i) => (
                              <span key={i} className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                                {e}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Botão continuar */}
          <button
            onClick={onContinueConversation}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Continuar conversando
          </button>

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 text-center">
            Esta análise é baseada em palavras-chave e não substitui avaliação profissional.
          </p>
        </div>
      )}
    </div>
  )
}
