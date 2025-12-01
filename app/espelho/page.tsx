'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Check, ChevronRight, Heart, AlertTriangle } from 'lucide-react'

// ============================================================================
// ESPELHO - Ferramenta de Auto-reflexão
// ============================================================================

const PERGUNTAS = [
  {
    id: 1,
    pergunta: 'Você se sente frequentemente confuso(a) sobre o que realmente aconteceu em uma discussão?',
    categoria: 'gaslighting'
  },
  {
    id: 2,
    pergunta: 'Você costuma pedir desculpas mesmo quando não fez nada de errado?',
    categoria: 'invalidacao'
  },
  {
    id: 3,
    pergunta: 'Você sente que precisa "pisar em ovos" ao redor dessa pessoa?',
    categoria: 'manipulacao'
  },
  {
    id: 4,
    pergunta: 'Você se sente isolado(a) de amigos e família?',
    categoria: 'controle'
  },
  {
    id: 5,
    pergunta: 'Você duvida de suas próprias memórias ou percepções?',
    categoria: 'gaslighting'
  },
  {
    id: 6,
    pergunta: 'Você sente que nunca é "bom(a) o suficiente" para essa pessoa?',
    categoria: 'invalidacao'
  },
  {
    id: 7,
    pergunta: 'Você tem medo de expressar suas opiniões ou sentimentos?',
    categoria: 'medo'
  },
  {
    id: 8,
    pergunta: 'Você se sente responsável pelas emoções e reações dessa pessoa?',
    categoria: 'manipulacao'
  }
]

export default function EspelhoPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, boolean>>({})
  const [showResult, setShowResult] = useState(false)

  const handleResposta = (resposta: boolean) => {
    setRespostas({ ...respostas, [PERGUNTAS[currentQuestion].id]: resposta })
    
    if (currentQuestion < PERGUNTAS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResult(true)
    }
  }

  const simCount = Object.values(respostas).filter(r => r === true).length
  const percentage = Math.round((simCount / PERGUNTAS.length) * 100)

  const getResultMessage = () => {
    if (percentage >= 75) {
      return {
        title: 'Sinais significativos identificados',
        message: 'Suas respostas indicam vários padrões que podem ser preocupantes. Considere buscar apoio profissional.',
        color: 'red'
      }
    } else if (percentage >= 50) {
      return {
        title: 'Alguns sinais identificados',
        message: 'Algumas de suas respostas indicam padrões que merecem atenção. Continue observando e documentando.',
        color: 'yellow'
      }
    } else if (percentage >= 25) {
      return {
        title: 'Poucos sinais identificados',
        message: 'Algumas situações podem precisar de atenção, mas não há um padrão claro.',
        color: 'blue'
      }
    } else {
      return {
        title: 'Poucos sinais identificados',
        message: 'Suas respostas não indicam um padrão preocupante no momento.',
        color: 'green'
      }
    }
  }

  const result = getResultMessage()

  const handleReset = () => {
    setCurrentQuestion(0)
    setRespostas({})
    setShowResult(false)
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-600/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h1 className="font-bold text-white">Espelho de Clareza</h1>
                <p className="text-xs text-gray-400">Auto-reflexão guiada</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {!showResult ? (
          <>
            {/* Progresso */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Pergunta {currentQuestion + 1} de {PERGUNTAS.length}</span>
                <span>{Math.round(((currentQuestion) / PERGUNTAS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-600 transition-all duration-300"
                  style={{ width: `${((currentQuestion) / PERGUNTAS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Pergunta */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <p className="text-lg text-white mb-8">
                {PERGUNTAS[currentQuestion].pergunta}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleResposta(true)}
                  className="flex-1 py-4 bg-violet-600/20 border border-violet-500/50 text-violet-300 rounded-xl hover:bg-violet-600/30 transition-colors font-medium"
                >
                  Sim
                </button>
                <button
                  onClick={() => handleResposta(false)}
                  className="flex-1 py-4 bg-slate-700/50 border border-slate-600/50 text-gray-300 rounded-xl hover:bg-slate-700 transition-colors font-medium"
                >
                  Não
                </button>
              </div>
            </div>

            {/* Dica */}
            <div className="text-center text-sm text-gray-500">
              <Heart className="w-4 h-4 inline mr-1" />
              Responda com honestidade. Não há respostas certas ou erradas.
            </div>
          </>
        ) : (
          /* Resultado */
          <div className="space-y-6">
            <div className={`bg-slate-800/50 border rounded-2xl p-6 ${
              result.color === 'red' ? 'border-red-500/50' :
              result.color === 'yellow' ? 'border-yellow-500/50' :
              result.color === 'blue' ? 'border-blue-500/50' :
              'border-green-500/50'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  result.color === 'red' ? 'bg-red-500/20' :
                  result.color === 'yellow' ? 'bg-yellow-500/20' :
                  result.color === 'blue' ? 'bg-blue-500/20' :
                  'bg-green-500/20'
                }`}>
                  <span className="text-3xl font-bold text-white">{percentage}%</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{result.title}</h2>
                <p className="text-gray-400">{result.message}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Você respondeu "Sim" para {simCount} de {PERGUNTAS.length} perguntas</p>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                Este teste é apenas uma ferramenta de reflexão e não substitui avaliação profissional.
              </p>
            </div>

            {/* Ações */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                Refazer teste
              </button>
              <Link href="/chat-premium" className="flex-1">
                <button className="w-full py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
                  Conversar com Coach <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
