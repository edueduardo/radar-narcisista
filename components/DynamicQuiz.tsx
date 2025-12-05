'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QuizQuestion, 
  getRandomizedQuiz, 
  initializeQuestionBank,
  CATEGORY_INFO
} from '@/lib/quizGenerator'
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Shield,
  Brain,
  Heart,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface QuizResult {
  totalScore: number
  maxScore: number
  percentage: number
  zone: 'verde' | 'amarela' | 'laranja' | 'vermelha'
  zoneLabel: string
  redFlagsCount: number
  scoresByCategory: Record<string, { score: number; max: number; percentage: number }>
}

interface DynamicQuizProps {
  questionCount?: number
  onComplete?: (result: QuizResult) => void
}

export default function DynamicQuiz({ 
  questionCount = 12,
  onComplete 
}: DynamicQuizProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, { optionId: string; value: number; isRed: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  // Carregar perguntas
  useEffect(() => {
    initializeQuestionBank()
    const quiz = getRandomizedQuiz(questionCount)
    setQuestions(quiz)
    setLoading(false)
  }, [questionCount])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const hasResponse = currentQuestion && responses[currentQuestion.id]

  // Selecionar resposta
  const handleSelectOption = (optionId: string, value: number, isRed: boolean) => {
    if (!currentQuestion) return
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: { optionId, value, isRed }
    }))
  }

  // Próxima pergunta
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  // Pergunta anterior
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // Calcular resultado
  const calculateResult = (): QuizResult => {
    let totalScore = 0
    let maxScore = 0
    let redFlagsCount = 0
    const scoresByCategory: Record<string, { score: number; max: number; percentage: number }> = {}

    questions.forEach(q => {
      const response = responses[q.id]
      const maxQuestionScore = Math.max(...q.options.map(o => o.value)) * q.weight
      maxScore += maxQuestionScore

      if (response) {
        const score = response.value * q.weight
        totalScore += score
        
        if (response.isRed) {
          redFlagsCount++
        }

        // Por categoria
        if (!scoresByCategory[q.category]) {
          scoresByCategory[q.category] = { score: 0, max: 0, percentage: 0 }
        }
        scoresByCategory[q.category].score += score
        scoresByCategory[q.category].max += maxQuestionScore
      }
    })

    // Calcular percentuais por categoria
    Object.keys(scoresByCategory).forEach(cat => {
      const { score, max } = scoresByCategory[cat]
      scoresByCategory[cat].percentage = max > 0 ? Math.round((score / max) * 100) : 0
    })

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

    // Determinar zona
    let zone: 'verde' | 'amarela' | 'laranja' | 'vermelha'
    let zoneLabel: string

    if (percentage <= 25) {
      zone = 'verde'
      zoneLabel = 'Zona Verde - Relacionamento Saudável'
    } else if (percentage <= 50) {
      zone = 'amarela'
      zoneLabel = 'Zona Amarela - Sinais de Atenção'
    } else if (percentage <= 75) {
      zone = 'laranja'
      zoneLabel = 'Zona Laranja - Padrões Preocupantes'
    } else {
      zone = 'vermelha'
      zoneLabel = 'Zona Vermelha - Situação de Risco'
    }

    return {
      totalScore,
      maxScore,
      percentage,
      zone,
      zoneLabel,
      redFlagsCount,
      scoresByCategory
    }
  }

  // Submeter quiz
  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      const result = calculateResult()
      
      // Salvar no localStorage para a página de resultado
      localStorage.setItem('quiz_result', JSON.stringify(result))
      localStorage.setItem('quiz_responses', JSON.stringify(responses))
      localStorage.setItem('quiz_questions', JSON.stringify(questions))
      
      if (onComplete) {
        onComplete(result)
      } else {
        // Redirecionar para resultado
        router.push(`/teste-clareza/resultado?zone=${result.zone}`)
      }
    } catch (error) {
      console.error('Erro ao processar resultado:', error)
      alert('Ocorreu um erro. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Tela de introdução
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Teste de Clareza
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Este teste ajuda você a identificar padrões em seus relacionamentos.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-300">Privacidade Garantida</p>
                  <p className="text-sm text-purple-700 dark:text-purple-400">Suas respostas são confidenciais e protegidas.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300">Sem Julgamentos</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Responda com honestidade, não há respostas certas ou erradas.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-300">Não é Diagnóstico</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Este teste é uma ferramenta de autoconhecimento, não substitui ajuda profissional.</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                O teste contém <strong>{questions.length || questionCount}</strong> perguntas e leva cerca de <strong>5-10 minutos</strong>.
              </p>
              
              <button
                onClick={() => setShowIntro(false)}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  'Começar o Teste'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Quiz principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pergunta {currentIndex + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
              {CATEGORY_INFO[currentQuestion.category]?.name || currentQuestion.category}
            </span>
            {currentQuestion.phase && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                {currentQuestion.phase.replace('FASE_', 'Fase ').replace('_', ' - ')}
              </span>
            )}
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {currentQuestion.text}
          </h2>
          
          {currentQuestion.description && (
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {currentQuestion.description}
            </p>
          )}

          {/* Options */}
          <div className="space-y-3 mt-6">
            {currentQuestion.options.map((option) => {
              const isSelected = responses[currentQuestion.id]?.optionId === option.id
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id, option.value, option.isRed)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`font-medium ${
                      isSelected 
                        ? 'text-purple-900 dark:text-purple-100' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.text}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-purple-500'
                    : responses[questions[idx]?.id]
                    ? 'bg-purple-300 dark:bg-purple-700'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!hasResponse || submitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition ${
              hasResponse
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                Ver Resultado
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Próxima
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Emergency Exit */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Precisa sair rapidamente? Pressione <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">ESC</kbd>
          </p>
        </div>
      </div>
    </div>
  )
}
