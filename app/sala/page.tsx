'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

// ============================================================================
// SALA - Ferramenta de Visualização e Meditação
// ============================================================================

const EXERCICIOS = [
  {
    id: 'respiracao',
    title: 'Respiração 4-7-8',
    description: 'Técnica de respiração para acalmar a ansiedade',
    duration: '5 min',
    steps: [
      'Inspire pelo nariz contando até 4',
      'Segure a respiração contando até 7',
      'Expire pela boca contando até 8',
      'Repita 4 vezes'
    ]
  },
  {
    id: 'grounding',
    title: 'Técnica 5-4-3-2-1',
    description: 'Ancoragem para momentos de pânico',
    duration: '3 min',
    steps: [
      '5 coisas que você pode VER',
      '4 coisas que você pode TOCAR',
      '3 coisas que você pode OUVIR',
      '2 coisas que você pode CHEIRAR',
      '1 coisa que você pode SABOREAR'
    ]
  },
  {
    id: 'afirmacoes',
    title: 'Afirmações de Clareza',
    description: 'Reforce sua percepção da realidade',
    duration: '2 min',
    steps: [
      'Meus sentimentos são válidos',
      'Eu confio na minha memória',
      'Eu mereço ser tratado(a) com respeito',
      'Não sou responsável pelas reações dos outros',
      'Eu tenho o direito de estabelecer limites'
    ]
  }
]

export default function SalaPage() {
  const [selectedExercicio, setSelectedExercicio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const exercicio = EXERCICIOS.find(e => e.id === selectedExercicio)

  const handleStart = () => {
    setIsPlaying(true)
    setCurrentStep(0)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleNextStep = () => {
    if (exercicio && currentStep < exercicio.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsPlaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Sala de Clareza</h1>
                  <p className="text-xs text-gray-400">Exercícios de ancoragem</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!selectedExercicio ? (
          /* Lista de exercícios */
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-6">
              Escolha um exercício para ajudar a acalmar sua mente e reconectar com a realidade.
            </p>
            {EXERCICIOS.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelectedExercicio(ex.id)}
                className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{ex.title}</h3>
                    <p className="text-sm text-gray-400">{ex.description}</p>
                  </div>
                  <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded-full">
                    {ex.duration}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Exercício selecionado */
          <div className="space-y-6">
            <button
              onClick={() => { setSelectedExercicio(null); handleReset(); }}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar aos exercícios
            </button>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">{exercicio?.title}</h2>
              <p className="text-gray-400 text-sm mb-6">{exercicio?.description}</p>

              {/* Área do exercício */}
              <div className="bg-slate-900/50 rounded-xl p-8 text-center mb-6">
                {isPlaying ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Passo {currentStep + 1} de {exercicio?.steps.length}</p>
                    <p className="text-2xl font-medium text-white animate-pulse">
                      {exercicio?.steps[currentStep]}
                    </p>
                    <button
                      onClick={handleNextStep}
                      className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      {currentStep < (exercicio?.steps.length || 0) - 1 ? 'Próximo' : 'Finalizar'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Eye className="w-16 h-16 text-indigo-400 mx-auto opacity-50" />
                    <p className="text-gray-400">Clique em iniciar quando estiver pronto(a)</p>
                  </div>
                )}
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-4">
                {!isPlaying ? (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    <Play className="w-5 h-5" /> Iniciar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <Pause className="w-4 h-4" /> Pausar
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Reiniciar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
