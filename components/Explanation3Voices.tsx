'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, Stethoscope, Scale, Lightbulb, ChevronDown, ChevronUp, Volume2, VolumeX, Loader2 } from 'lucide-react'
import {
  VoiceType,
  VOICE_CONFIG,
  getVoiceContent,
  interpolateText,
  axisToTopicId,
  categoryToTopicId
} from '@/lib/clarity-three-voices'

// =============================================================================
// COMPONENTE DE 3 VOZES
// Mostra o mesmo conteúdo em 3 perspectivas diferentes:
// - Colinho: Acolhedor, empático
// - Profissional: Técnico, clínico
// - Defesa: Objetivo, jurídico
// =============================================================================

interface Explanation3VoicesProps {
  topicId: string // 'geral', 'nevoa_mental', 'gaslighting', etc.
  context?: {
    score?: number
    zona?: string
    episodios30d?: number
    impactoMedio?: number
    padroesPrincipais?: string[]
    percentage?: number
  }
  defaultVoice?: VoiceType
  showMicroAction?: boolean
  compact?: boolean
}

export default function Explanation3Voices({
  topicId,
  context = {},
  defaultVoice,
  showMicroAction = true,
  compact = false
}: Explanation3VoicesProps) {
  const [activeVoice, setActiveVoice] = useState<VoiceType>('colinho')
  const [showAction, setShowAction] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoadingTTS, setIsLoadingTTS] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Definir voz padrão
  useEffect(() => {
    if (defaultVoice) {
      setActiveVoice(defaultVoice)
    }
  }, [defaultVoice])

  // Cleanup TTS ao desmontar
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const content = getVoiceContent(topicId)
  
  if (!content) {
    return null
  }

  const voiceText = interpolateText(content.voices[activeVoice], context)
  const microAction = interpolateText(content.voices.micro_acao, context)

  // Trocar voz com animação
  const handleVoiceChange = (voice: VoiceType) => {
    if (voice === activeVoice) return
    
    // Parar TTS se estiver falando
    if (isSpeaking) {
      stopSpeaking()
    }
    
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveVoice(voice)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 150)
  }

  // Função TTS - Text to Speech
  const speakText = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Seu navegador não suporta leitura em voz alta.')
      return
    }

    // Se já está falando, parar
    if (isSpeaking) {
      stopSpeaking()
      return
    }

    setIsLoadingTTS(true)
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(voiceText)
    utterance.lang = 'pt-BR'
    utterance.rate = activeVoice === 'profissional' ? 0.95 : activeVoice === 'defesa' ? 0.9 : 0.85
    utterance.pitch = activeVoice === 'colinho' ? 1.1 : activeVoice === 'defesa' ? 0.9 : 1.0
    
    // Tentar encontrar voz em português
    const voices = window.speechSynthesis.getVoices()
    const ptVoice = voices.find(v => v.lang.startsWith('pt')) || voices[0]
    if (ptVoice) utterance.voice = ptVoice

    utterance.onstart = () => {
      setIsLoadingTTS(false)
      setIsSpeaking(true)
    }
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsLoadingTTS(false)
      setIsSpeaking(false)
    }

    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsLoadingTTS(false)
  }

  const voiceIcons: Record<VoiceType, React.ReactNode> = {
    colinho: <Heart className="w-4 h-4" />,
    profissional: <Stethoscope className="w-4 h-4" />,
    defesa: <Scale className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Toggle de Vozes + Botão TTS */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(VOICE_CONFIG) as VoiceType[]).map((voice) => {
          const config = VOICE_CONFIG[voice]
          const isActive = activeVoice === voice
          
          return (
            <button
              key={voice}
              onClick={() => handleVoiceChange(voice)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl
                font-medium text-sm transition-all duration-200
                ${isActive 
                  ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-offset-slate-900 ring-${voice === 'colinho' ? 'violet' : voice === 'profissional' ? 'blue' : 'amber'}-500/50` 
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                }
              `}
              title={config.description}
            >
              {voiceIcons[voice]}
              <span>{config.emoji} {config.label}</span>
            </button>
          )
        })}

        {/* Botão TTS */}
        <button
          onClick={speakText}
          disabled={isLoadingTTS}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl
            font-medium text-sm transition-all duration-200
            ${isSpeaking 
              ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50' 
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-300'
            }
            disabled:opacity-50
          `}
          title={isSpeaking ? 'Parar leitura' : 'Ouvir texto'}
        >
          {isLoadingTTS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSpeaking ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
        </button>
      </div>

      {/* Descrição da Voz Ativa */}
      <p className={`text-xs ${VOICE_CONFIG[activeVoice].color} opacity-70 transition-opacity duration-300`}>
        {VOICE_CONFIG[activeVoice].description}
      </p>

      {/* Conteúdo da Voz com Animação */}
      <div 
        className={`
          p-5 rounded-2xl border transition-all duration-300
          ${activeVoice === 'colinho' ? 'bg-violet-950/30 border-violet-800/50' : ''}
          ${activeVoice === 'profissional' ? 'bg-blue-950/30 border-blue-800/50' : ''}
          ${activeVoice === 'defesa' ? 'bg-amber-950/30 border-amber-800/50' : ''}
        `}
      >
        <div 
          className={`
            text-base leading-relaxed whitespace-pre-line 
            ${compact ? 'text-sm' : ''} text-gray-200
            transition-opacity duration-300
            ${isTransitioning ? 'opacity-0' : 'opacity-100'}
          `}
        >
          {voiceText}
        </div>
      </div>

      {/* Micro-Ação */}
      {showMicroAction && (
        <div className="mt-4">
          <button
            onClick={() => setShowAction(!showAction)}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Próximo passo de 5 minutos</span>
            {showAction ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showAction && (
            <div className="mt-3 p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
              <p className="text-sm text-emerald-300 leading-relaxed">
                {microAction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// VERSÃO COMPACTA PARA USO EM CARDS
// =============================================================================

interface Compact3VoicesProps {
  topicId: string
  context?: {
    score?: number
    zona?: string
    percentage?: number
  }
}

export function Compact3Voices({ topicId, context = {} }: Compact3VoicesProps) {
  const [activeVoice, setActiveVoice] = useState<VoiceType>('colinho')
  
  const content = getVoiceContent(topicId)
  if (!content) return null

  const voiceText = interpolateText(content.voices[activeVoice], context)
  
  // Pegar apenas o primeiro parágrafo para versão compacta
  const shortText = voiceText.split('\n\n')[0]

  return (
    <div className="space-y-3">
      {/* Mini Toggle */}
      <div className="flex gap-1">
        {(Object.keys(VOICE_CONFIG) as VoiceType[]).map((voice) => {
          const config = VOICE_CONFIG[voice]
          const isActive = activeVoice === voice
          
          return (
            <button
              key={voice}
              onClick={() => setActiveVoice(voice)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${isActive 
                  ? `${config.bgColor} ${config.color}` 
                  : 'bg-slate-800/50 text-gray-500 hover:text-gray-400'
                }
              `}
              title={config.description}
            >
              {config.emoji}
            </button>
          )
        })}
      </div>

      {/* Texto Curto */}
      <p className="text-sm text-gray-300 leading-relaxed">
        {shortText}
      </p>
    </div>
  )
}

// =============================================================================
// WRAPPER PARA EIXOS (nevoa, medo, limites)
// =============================================================================

interface AxisExplanationProps {
  axis: 'nevoa' | 'medo' | 'limites'
  percentage: number
  level: string
  context?: {
    episodios30d?: number
    impactoMedio?: number
  }
}

export function AxisExplanation({ axis, percentage, level, context = {} }: AxisExplanationProps) {
  const topicId = axisToTopicId(axis)
  
  return (
    <Explanation3Voices
      topicId={topicId}
      context={{
        ...context,
        percentage: Math.round(percentage * 100),
        zona: level
      }}
      showMicroAction={true}
    />
  )
}

// =============================================================================
// WRAPPER PARA CATEGORIAS (invalidacao, gaslighting, etc.)
// =============================================================================

interface CategoryExplanationProps {
  category: string
  percentage: number
  context?: {
    episodios30d?: number
    impactoMedio?: number
  }
}

export function CategoryExplanation({ category, percentage, context = {} }: CategoryExplanationProps) {
  const topicId = categoryToTopicId(category)
  
  return (
    <Explanation3Voices
      topicId={topicId}
      context={{
        ...context,
        percentage: Math.round(percentage * 100)
      }}
      showMicroAction={true}
      compact={true}
    />
  )
}
