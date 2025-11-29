"use client"

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, Brain, Heart, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface ClarityFeedbackProps {
  currentScore: number
  previousScore?: number
  currentExplanation?: string
  detectedProblems?: string[]
  messageCount: number
  messageContent?: string // Conteúdo da mensagem para contexto
  useAI?: boolean // Se deve usar IA para gerar texto
}

// Gera feedback textual baseado na evolução
function generateEvolutionFeedback(
  currentScore: number, 
  previousScore?: number,
  messageCount: number = 1
): { title: string; message: string; type: 'success' | 'warning' | 'info' | 'neutral' } {
  
  // Primeira mensagem
  if (messageCount === 1 || previousScore === undefined) {
    if (currentScore >= 70) {
      return {
        title: '🌟 Ótimo começo!',
        message: 'Sua primeira mensagem foi bem detalhada. Isso me ajuda muito a entender sua situação. Continue assim!',
        type: 'success'
      }
    } else if (currentScore >= 40) {
      return {
        title: '👋 Bem-vinda!',
        message: 'Entendi o básico da sua situação. Se quiser, pode me contar mais detalhes - como aconteceu, quando, como você se sentiu. Isso me ajuda a te apoiar melhor.',
        type: 'info'
      }
    } else {
      return {
        title: '💬 Vamos conversar',
        message: 'Percebi que sua mensagem foi breve. Tudo bem, estou aqui para ouvir. Quando se sentir confortável, pode me contar mais sobre o que está acontecendo.',
        type: 'neutral'
      }
    }
  }

  // Mensagens subsequentes - comparar evolução
  const difference = currentScore - previousScore
  
  // Melhorou significativamente (>10 pontos)
  if (difference >= 10) {
    return {
      title: '🎉 Você está se abrindo mais!',
      message: `Sua clareza subiu de ${previousScore} para ${currentScore}! Isso é ótimo - quanto mais detalhes você compartilha, melhor consigo te ajudar. Sua confiança em se expressar está crescendo.`,
      type: 'success'
    }
  }
  
  // Melhorou um pouco (5-10 pontos)
  if (difference >= 5) {
    return {
      title: '👍 Progresso!',
      message: `Sua clareza aumentou de ${previousScore} para ${currentScore}. Você está conseguindo expressar melhor o que sente. Continue assim!`,
      type: 'success'
    }
  }
  
  // Manteve estável (-5 a +5)
  if (difference >= -5 && difference < 5) {
    if (currentScore >= 70) {
      return {
        title: '✨ Mantendo a qualidade',
        message: 'Você continua se expressando bem! Suas mensagens estão claras e detalhadas.',
        type: 'info'
      }
    } else if (currentScore >= 40) {
      return {
        title: '💭 Continuando a conversa',
        message: 'Estou acompanhando. Se quiser aprofundar algum ponto, pode me contar mais detalhes sobre o que aconteceu ou como você se sentiu.',
        type: 'neutral'
      }
    } else {
      return {
        title: '🤝 Estou aqui',
        message: 'Entendo que pode ser difícil falar sobre isso. Vá no seu ritmo. Quando se sentir pronta, pode me contar mais.',
        type: 'neutral'
      }
    }
  }
  
  // Diminuiu um pouco (-10 a -5)
  if (difference >= -10) {
    return {
      title: '💙 Tudo bem',
      message: 'Percebi que essa mensagem foi mais breve. Está tudo bem, cada momento é diferente. Se quiser, pode elaborar mais sobre o que está sentindo agora.',
      type: 'info'
    }
  }
  
  // Diminuiu significativamente (< -10)
  return {
    title: '🫂 Estou aqui para você',
    message: 'Parece que está mais difícil se expressar agora. Isso é normal - às vezes as emoções são intensas demais. Respire fundo. Estou aqui, sem pressa.',
    type: 'warning'
  }
}

// Gera insight sobre o que foi detectado
function generateInsightText(detectedProblems?: string[]): string | null {
  if (!detectedProblems || detectedProblems.length === 0) return null
  
  const problemLabels: Record<string, string> = {
    gaslighting: 'sinais de gaslighting (manipulação da sua percepção)',
    invalidacao: 'invalidação emocional (seus sentimentos sendo minimizados)',
    manipulacao: 'padrões de manipulação emocional',
    isolamento: 'tentativas de isolamento social',
    ameacas: 'situações de ameaça ou medo',
    criminalizacao: 'uso de ameaças legais como controle',
    autoestima_baixa: 'impacto na sua autoestima'
  }
  
  const labels = detectedProblems
    .map(p => problemLabels[p])
    .filter(Boolean)
  
  if (labels.length === 0) return null
  
  if (labels.length === 1) {
    return `Percebi ${labels[0]} no que você descreveu. Isso é importante reconhecer.`
  }
  
  return `Percebi alguns padrões no que você descreveu: ${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}. Reconhecer isso é um passo importante.`
}

export function ClarityFeedback({
  currentScore,
  previousScore,
  currentExplanation,
  detectedProblems,
  messageCount,
  messageContent,
  useAI = true
}: ClarityFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [aiEvolutionText, setAiEvolutionText] = useState<string | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [lastProcessedScore, setLastProcessedScore] = useState<number | null>(null)
  
  // Buscar texto de evolução da IA
  const fetchAIEvolution = useCallback(async () => {
    if (!useAI || currentScore === lastProcessedScore) return
    
    setIsLoadingAI(true)
    try {
      const response = await fetch('/api/generate-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore,
          currentProblems: detectedProblems || [],
          currentSummary: currentExplanation,
          origin: 'coach',
          messageContent: messageContent?.substring(0, 300)
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.evolutionText) {
          setAiEvolutionText(data.evolutionText)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar evolução da IA:', error)
    } finally {
      setIsLoadingAI(false)
      setLastProcessedScore(currentScore)
    }
  }, [currentScore, detectedProblems, currentExplanation, messageContent, useAI, lastProcessedScore])
  
  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [currentScore])
  
  // Buscar texto da IA quando score mudar
  useEffect(() => {
    if (useAI && messageCount > 0) {
      fetchAIEvolution()
    }
  }, [fetchAIEvolution, useAI, messageCount])
  
  const feedback = generateEvolutionFeedback(currentScore, previousScore, messageCount)
  const insight = generateInsightText(detectedProblems)
  
  // Ícone baseado no tipo
  const getIcon = () => {
    switch (feedback.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <Heart className="w-5 h-5 text-amber-500" />
      case 'info': return <Sparkles className="w-5 h-5 text-blue-500" />
      default: return <Brain className="w-5 h-5 text-purple-500" />
    }
  }
  
  // Cores baseadas no tipo
  const getColors = () => {
    switch (feedback.type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-purple-50 border-purple-200 text-purple-800'
    }
  }
  
  // Indicador de tendência
  const getTrendIndicator = () => {
    if (previousScore === undefined) return null
    
    const diff = currentScore - previousScore
    if (diff >= 5) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <TrendingUp className="w-3 h-3" />
          <span>+{diff} pontos</span>
        </div>
      )
    }
    if (diff <= -5) {
      return (
        <div className="flex items-center gap-1 text-amber-600 text-xs">
          <TrendingDown className="w-3 h-3" />
          <span>{diff} pontos</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <Minus className="w-3 h-3" />
        <span>Estável</span>
      </div>
    )
  }

  return (
    <div 
      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className={`rounded-xl border p-4 ${getColors()}`}>
        {/* Header com título e tendência */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold text-sm">{feedback.title}</span>
          </div>
          {getTrendIndicator()}
        </div>
        
        {/* Mensagem principal - IA ou fallback */}
        {isLoadingAI ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analisando sua evolução...</span>
          </div>
        ) : aiEvolutionText ? (
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {aiEvolutionText}
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed mb-2">
              {feedback.message}
            </p>
            
            {/* Insight sobre padrões detectados (só mostra se não tiver texto da IA) */}
            {insight && (
              <div className="mt-3 pt-3 border-t border-current/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                  <p className="text-xs leading-relaxed opacity-90">
                    {insight}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Score atual */}
        <div className="mt-3 flex items-center justify-between text-xs opacity-70">
          <span>Clareza desta mensagem: {currentScore}/100</span>
          {currentExplanation && (
            <span className="text-[10px] max-w-[200px] truncate" title={currentExplanation}>
              {currentExplanation}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
