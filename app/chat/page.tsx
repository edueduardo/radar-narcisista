'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { chatWithCoach } from '../../lib/openai'
import { chatEmergencyMode, statusEmergencyMode } from '../../lib/chat-emergency'
import { chatColaborativo, getConfigChatColaborativo } from '../../lib/chat-colaborativo'
import Microphone from '../../components/Microphone'
import { Mic, MicOff, Send, Bot, User, Sparkles, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClarityScoreIndicator } from "@/components/chat/ClarityScoreIndicator"
import { ClarityEvolutionChart } from "@/components/chat/ClarityEvolutionChart"
import { ClarityFeedback } from "@/components/chat/ClarityFeedback"
import { AITransparencyPanel } from "@/components/chat/AITransparencyPanel"
import { EmotionalEvolutionPanel } from "@/components/chat/EmotionalEvolutionPanel"
import { ClarityEvolutionReport } from "@/components/chat/ClarityEvolutionReport"
import { analisarEstadoEmocional, compararEvolucao, type EstadoEmocional, type EvolucaoEmocional } from "@/lib/analise-emocional"
import type { ClarityEvolutionData } from "@/lib/types/evolution-clarity"
import { MessageCircle, AlertTriangle, RotateCcw, MapPin, ArrowLeft, Home, Navigation, BookOpen, PenLine, Clock, Lightbulb, ExternalLink, Shield, Download, Save, FileText, Loader2, CheckCircle, BookMarked } from "lucide-react"
import { PROBLEMS, TOOLS, getToolsByProblem, type ProblemTag, type ProblemConfig } from '@/lib/tools-config'
import Link from 'next/link'
import { ResponsibilityTermsModal, LegalWarningBanner, useTermsAcceptance } from '@/components/ResponsibilityTermsModal'
import { usePlanLimits } from '@/hooks/usePlanLimits'

import { AiChatSession, AiMessage } from '../../types/database'

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  clarity_score?: number
  clarity_explanation?: string
  from_voice?: boolean
}

type ChatSession = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  user_location?: string
  accumulated_clarity_score?: number
  message_count?: number
}

// =============================================================================
// MENSAGENS INICIAIS POR CONTEXTO
// Quando vem de /hub/[problema] com ?contexto=, inicia conversa contextualizada
// =============================================================================
const CONTEXT_INITIAL_MESSAGES: Record<string, string> = {
  invalidacao: 'Olá! Vi que você está lidando com invalidação. Isso é muito difícil - quando seus sentimentos são minimizados ou ridicularizados, é natural se sentir confusa e duvidar de si mesma. Quer me contar o que aconteceu?',
  gaslighting: 'Olá! Vi que você está enfrentando gaslighting. Isso é uma forma séria de manipulação que faz você duvidar da própria memória e percepção. Sua realidade é válida. O que está acontecendo?',
  criminalizacao: 'Olá! Vi que você está lidando com ameaças legais ou criminalização. Isso é uma tática de controle muito assustadora. Você tem direitos e não está sozinha. Como posso te ajudar?',
  manipulacao: 'Olá! Vi que você está enfrentando manipulação emocional. Reconhecer isso já é um grande passo. Quer me contar o que está acontecendo?',
  ameacas: 'Olá! Vi que você está sentindo medo ou enfrentando ameaças. Sua segurança é prioridade. Estou aqui para te ouvir e ajudar a pensar nos próximos passos. O que está acontecendo?',
  isolamento: 'Olá! Vi que você está lidando com isolamento. Ser afastada de pessoas que te apoiam é uma tática de controle. Você não está sozinha - estou aqui. O que está sentindo?',
}

function ChatPageContent() {
  const searchParams = useSearchParams()
  const contextoProblema = searchParams.get('contexto')
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<AiChatSession | null>(null)
  const [userSettings, setUserSettings] = useState<any>(null)
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)
  const [usarColaborativo, setUsarColaborativo] = useState(true)
  const [mostrarTransparencia, setMostrarTransparencia] = useState(false)
  const [ultimaTransparencia, setUltimaTransparencia] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [userLocation, setUserLocation] = useState<string>("")
  const [locationInput, setLocationInput] = useState<string>("") // Input temporário para localização
  const [isEvaluatingClarity, setIsEvaluatingClarity] = useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [contextApplied, setContextApplied] = useState(false)
  const [apiDetectedProblems, setApiDetectedProblems] = useState<ProblemTag[]>([])
  const [lastTransparenciaData, setLastTransparenciaData] = useState<any>(null)
  // Estados para análise emocional
  const [historicoEmocional, setHistoricoEmocional] = useState<EstadoEmocional[]>([])
  const [evolucaoAtual, setEvolucaoAtual] = useState<EvolucaoEmocional | null>(null)
  // Estado para análise de evolução de clareza (JSON completo)
  const [clarityEvolution, setClarityEvolution] = useState<ClarityEvolutionData | null>(null)
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(false)
  // Estados para salvar e exportar conversa
  const [isSavingConversation, setIsSavingConversation] = useState(false)
  const [saveConversationStatus, setSaveConversationStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  // Estado para modal de confirmação de responsabilidade antes do PDF
  const [showPDFConfirmModal, setShowPDFConfirmModal] = useState(false)
  const [pdfConfirmChecks, setPdfConfirmChecks] = useState({
    perspectiva: false,
    naoProva: false,
    responsabilidade: false
  })
  // Estado para modal de termos obrigatório e aviso periódico
  const { hasAccepted: hasAcceptedTerms, isLoading: isLoadingTerms, markAsAccepted } = useTermsAcceptance()
  const [showPeriodicWarning, setShowPeriodicWarning] = useState(false)
  const [lastWarningMessageCount, setLastWarningMessageCount] = useState(0)
  const MESSAGES_BETWEEN_WARNINGS = 8 // Mostrar aviso a cada 8 mensagens do usuário
  // Estado para modal de encerramento de conversa
  const [showEndConversationModal, setShowEndConversationModal] = useState(false)
  // Estados para salvar resumo no diário (ETAPA 4 - Chat → Diário)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [summaryText, setSummaryText] = useState('')
  const [summaryMood, setSummaryMood] = useState(5)
  const [summaryTags, setSummaryTags] = useState<string[]>(['coach', 'reflexão', 'sessão'])
  const [isSavingSummary, setIsSavingSummary] = useState(false)
  const [wantsSaveSummaryOnEnd, setWantsSaveSummaryOnEnd] = useState(false)
  // Estado para alertas de fraude/inconsistência detectados
  const [detectedFraudFlags, setDetectedFraudFlags] = useState<Array<{type: string, severity: number, description: string}>>([])
  const [showFraudAlert, setShowFraudAlert] = useState(false)
  // Estado para limite de mensagens atingido
  const [showLimitReached, setShowLimitReached] = useState(false)
  const { planLevel, planName, usage, chatLimit, canSendMessage, isLoading: isLoadingPlan } = usePlanLimits()
  // Estado para perfil de clareza (ETAPA 2 - Integração Coach IA ↔ Perfil)
  const [clarityProfile, setClarityProfile] = useState<{
    globalZone: string
    overallPercentage: number
    fogScore: number
    fearScore: number
    limitsScore: number
    hasPhysicalRisk: boolean
    userNarrative?: string
    summary?: string
    createdAt: string
  } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  // Mostrar mensagem de boas-vindas e prompt de localização automaticamente
  useEffect(() => {
    if (!contextApplied && messages.length === 0) {
      // Se veio com contexto de problema, usar mensagem específica
      if (contextoProblema && CONTEXT_INITIAL_MESSAGES[contextoProblema]) {
        const initialMessage: Message = {
          id: `context-${Date.now()}`,
          role: 'assistant',
          content: CONTEXT_INITIAL_MESSAGES[contextoProblema],
          timestamp: new Date().toISOString()
        }
        setMessages([initialMessage])
      } else {
        // Mensagem padrão de boas-vindas
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Olá! 💜 Tudo bem? Estou aqui para te ouvir e ajudar a ganhar clareza sobre o que você está vivendo.',
          timestamp: new Date().toISOString()
        }
        setMessages([welcomeMessage])
      }
      // Mostrar prompt de localização automaticamente
      setShowLocationPrompt(true)
      setContextApplied(true)
    }
  }, [contextoProblema, contextApplied, messages.length])

  useEffect(() => {
    loadChatSession()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Aviso periódico a cada X mensagens do usuário
  useEffect(() => {
    const userMessageCount = messages.filter(m => m.role === 'user').length
    if (userMessageCount > 0 && 
        userMessageCount >= lastWarningMessageCount + MESSAGES_BETWEEN_WARNINGS) {
      setShowPeriodicWarning(true)
      setLastWarningMessageCount(userMessageCount)
      // Auto-fechar após 8 segundos
      setTimeout(() => setShowPeriodicWarning(false), 8000)
    }
  }, [messages, lastWarningMessageCount])

  const loadChatSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setUserSettings(settings)

      // ETAPA 2 - Buscar perfil de clareza do usuário (is_profile_base = true)
      // Isso permite que o Coach IA tenha contexto sobre os eixos e categorias do teste
      const { data: profileData } = await supabase
        .from('clarity_tests')
        .select('global_zone, overall_percentage, fog_score, fear_score, limits_score, has_physical_risk, user_narrative, summary, created_at')
        .eq('user_id', user.id)
        .eq('is_profile_base', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (profileData) {
        setClarityProfile({
          globalZone: profileData.global_zone || 'ATENCAO',
          overallPercentage: profileData.overall_percentage || 0,
          fogScore: profileData.fog_score || 0,
          fearScore: profileData.fear_score || 0,
          limitsScore: profileData.limits_score || 0,
          hasPhysicalRisk: profileData.has_physical_risk || false,
          userNarrative: profileData.user_narrative,
          summary: profileData.summary,
          createdAt: profileData.created_at
        })
        console.log('✅ Perfil de clareza carregado para contexto do Coach IA')
      }

      // SEMPRE criar nova sessão - cada entrada no chat é uma conversa nova
      // Mensagens antigas não são carregadas
      const { data: newSession } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id
        })
        .select()
        .single()
      
      setCurrentSession(newSession)
      setMessages([]) // Garantir que começa sem mensagens

    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Função para auto-resize do textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 60), 200)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }

  // Função para obter localização por GPS
  const requestGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta geolocalização')
      return
    }

    setIsRequestingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Usar API de geocodificação reversa gratuita
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'RadarNarcisista/1.0'
              }
            }
          )
          const data = await response.json()
          
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality || ''
            const state = data.address.state || ''
            const locationStr = `${city}${city && state ? ', ' : ''}${state}`
            
            if (locationStr.trim()) {
              setUserLocation(locationStr)
              setShowLocationPrompt(false)
              
              // Adicionar mensagem de confirmação
              const locationMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Obrigado! Detectei que você está em ${locationStr}. Agora vou adaptar meu atendimento para a realidade da sua região. Isso me ajuda a entender melhor o contexto local e oferecer orientações mais relevantes. Pode começar a me contar o que está acontecendo.`,
                timestamp: new Date().toISOString()
              }
              setMessages(prev => prev.length === 0 ? [locationMessage] : [...prev, locationMessage])
            } else {
              alert('Não consegui identificar sua cidade. Por favor, digite manualmente.')
            }
          } else {
            alert('Não consegui identificar sua localização. Por favor, digite manualmente.')
          }
        } catch (error) {
          console.error('Erro ao obter localização:', error)
          alert('Erro ao buscar localização. Por favor, digite manualmente.')
        } finally {
          setIsRequestingLocation(false)
        }
      },
      (error) => {
        console.error('Erro de geolocalização:', error)
        setIsRequestingLocation(false)
        if (error.code === error.PERMISSION_DENIED) {
          alert('Você negou a permissão de localização. Por favor, digite manualmente.')
        } else if (error.code === error.TIMEOUT) {
          alert('Tempo esgotado ao buscar localização. Por favor, digite manualmente.')
        } else {
          alert('Não foi possível obter sua localização. Por favor, digite manualmente.')
        }
      },
      { timeout: 15000, enableHighAccuracy: false }
    )
  }

  // Preparar dados para o gráfico de evolução
  const clarityChartData = messages
    .filter(m => m.role === 'user' && m.clarity_score !== undefined)
    .map((m, index) => ({
      messageNumber: index + 1,
      score: m.clarity_score || 0,
      label: m.clarity_score && m.clarity_score >= 71
          ? 'Bem detalhada'
          : m.clarity_score && m.clarity_score >= 31
          ? 'Ok, dá para trabalhar'
          : 'Muito vaga'
    }))

  // Função para avaliar clareza da mensagem do usuário
  const evaluateMessageClarity = async (message: string): Promise<{score: number, explanation: string}> => {
    try {
      setIsEvaluatingClarity(true)
      const response = await fetch('/api/evaluate-clarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      
      if (!response.ok) throw new Error('Falha na avaliação')
      return await response.json()
    } catch (error) {
      console.error('Erro ao avaliar clareza:', error)
      // Retorna valor padrão em caso de erro
      return { score: 50, explanation: 'Avaliação indisponível' }
    } finally {
      setIsEvaluatingClarity(false)
    }
  }

  // Modificar função sendMessage para incluir avaliação de clareza
  const sendMessage = async (messageContent: string, fromVoice = false) => {
    if (!messageContent.trim() || isLoading || !currentSession) return

    // VERIFICAR LIMITE DE MENSAGENS DO PLANO
    if (!canSendMessage && chatLimit) {
      setShowLimitReached(true)
      return
    }

    setIsLoading(true)
    
    // Get user ID at the beginning of the function
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Avaliar clareza da mensagem do usuário
    const clarityEvaluation = await evaluateMessageClarity(messageContent)
    
    // ANÁLISE EMOCIONAL: Analisar estado emocional da mensagem
    const estadoEmocionalAtual = analisarEstadoEmocional(messageContent)
    const estadoAnterior = historicoEmocional.length > 0 
      ? historicoEmocional[historicoEmocional.length - 1] 
      : null
    const evolucao = compararEvolucao(estadoEmocionalAtual, estadoAnterior)
    
    // Atualizar histórico e evolução
    setHistoricoEmocional(prev => [...prev, estadoEmocionalAtual])
    setEvolucaoAtual(evolucao)
    
    console.log('[Análise Emocional]', {
      estadoAtual: estadoEmocionalAtual.sentimento,
      intensidade: estadoEmocionalAtual.intensidade,
      emocoes: estadoEmocionalAtual.emocoes,
      mudanca: evolucao.mudanca
    })
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      clarity_score: clarityEvaluation.score,
      clarity_explanation: clarityEvaluation.explanation
    }

    try {
      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage])

      // Save user message if history is enabled
      if (userSettings?.save_history) {
        await supabase
          .from('ai_messages')
          .insert({
            session_id: currentSession.id,
            user_id: user.id,
            role: 'user',
            content: messageContent,
            from_voice: fromVoice
          })
      }

      // Get conversation history for context (last 10 messages)
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Get AI response via API server-side - COLABORATIVO ou NORMAL
      let aiResponse: string
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageContent,
            history: recentMessages,
            usarColaborativo,
            userLocation,
            // ETAPA 2 - Passar perfil de clareza para contexto do Coach IA
            clarityProfile: clarityProfile ? {
              globalZone: clarityProfile.globalZone,
              overallPercentage: clarityProfile.overallPercentage,
              fogScore: clarityProfile.fogScore,
              fearScore: clarityProfile.fearScore,
              limitsScore: clarityProfile.limitsScore,
              hasPhysicalRisk: clarityProfile.hasPhysicalRisk,
              summary: clarityProfile.summary,
            } : null,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.error('Erro na API /api/chat:', errorData || response.statusText)
          throw new Error(errorData?.error || 'Falha na API de chat')
        }

        const data = await response.json()
        aiResponse = data.reply || 'Desculpe, não consegui processar sua mensagem.'

        if (data.transparencia) {
          setUltimaTransparencia(data.transparencia)
          setLastTransparenciaData(data.transparencia)
        }

        // Capturar problemTags detectados pela API
        if (data.problemTags && Array.isArray(data.problemTags)) {
          setApiDetectedProblems(prev => {
            const combined = [...new Set([...prev, ...data.problemTags])]
            return combined.slice(0, 5) // Máximo 5 problemas acumulados
          })
        }

        // Capturar fraudFlags (red flags de fraude/má-fé)
        if (data.fraudFlags && Array.isArray(data.fraudFlags) && data.fraudFlags.length > 0) {
          setDetectedFraudFlags(data.fraudFlags)
          // Mostrar alerta se severidade >= 2
          const hasSignificantFlag = data.fraudFlags.some((f: any) => f.severity >= 2)
          if (hasSignificantFlag) {
            setShowFraudAlert(true)
          }
        }

        // CHAMAR API DE EVOLUÇÃO DE CLAREZA
        // Gera análise completa com JSON estruturado
        setIsLoadingEvolution(true)
        try {
          const evolutionResponse = await fetch('/api/coach/evolution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: messageContent,
              history: recentMessages,
              previousScore: clarityEvolution?.input_signals.clarity_score_current || null,
              problemTagsHistory: apiDetectedProblems.map(tag => ({ tag, count: 1 })),
              userId: user.id,
              sessionId: currentSession.id
            })
          })
          
          if (evolutionResponse.ok) {
            const evolutionData = await evolutionResponse.json()
            if (evolutionData.success && evolutionData.evolution) {
              setClarityEvolution(evolutionData.evolution)
              console.log('[Evolução de Clareza]', evolutionData.evolution)
            }
          }
        } catch (evolutionError) {
          console.error('[Evolução de Clareza] Erro:', evolutionError)
        } finally {
          setIsLoadingEvolution(false)
        }

        setIsEmergencyMode(false)
      } catch (error) {
        console.error('🚨 Chat falhou, ativando modo emergência:', error)
        
        // Ativar modo emergência automaticamente
        setIsEmergencyMode(true)
        const emergencyResponse = chatEmergencyMode(messageContent)
        aiResponse = emergencyResponse.resposta
        
        // Se for emergência real, adicionar alerta especial
        if (emergencyResponse.isEmergency) {
          aiResponse = '\n🚨 ' + aiResponse + ' 🚨\n\nPor favor, procure ajuda imediatamente!'
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      // Add AI response to UI
      setMessages(prev => [...prev, assistantMessage])

      // Save AI response if history is enabled
      if (userSettings?.save_history) {
        await supabase
          .from('ai_messages')
          .insert({
            session_id: currentSession.id,
            user_id: user.id,
            role: 'assistant',
            content: aiResponse,
            from_voice: false
          })
      }

      // Update session timestamp (opcional - created_at já existe)
      // await supabase
      //   .from('ai_chat_sessions')
      //   .update({ updated_at: new Date().toISOString() })
      //   .eq('id', currentSession.id)

      setInputMessage('')

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Remove user message if failed
      setMessages(prev => prev.slice(0, -1))
      
      // Show error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranscription = (text: string) => {
    setInputMessage(text)
    // Auto-send voice messages
    sendMessage(text, true)
  }

  const handleTranscriptionError = async (error: string) => {
    console.error('Erro na transcrição:', error)
    
    // Get user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !currentSession) return
    
    // Show error in chat
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Erro na transcrição: ${error}`,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, errorMessage])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando chat...</p>
        </div>
      </div>
    )
  }

  // Helper para obter zona de clareza
  const getClarityZone = (score: number) => {
    if (score >= 71) return { zone: 'clara', label: 'Clara', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (score >= 31) return { zone: 'atencao', label: 'Atenção', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { zone: 'muito_vaga', label: 'Muito vaga', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  // Calcular média de clareza
  const userMessagesWithClarity = messages.filter(m => m.role === 'user' && m.clarity_score !== undefined)
  const avgClarity = userMessagesWithClarity.length > 0
    ? Math.round(userMessagesWithClarity.reduce((acc, m) => acc + (m.clarity_score || 0), 0) / userMessagesWithClarity.length)
    : 0
  const clarityZone = getClarityZone(avgClarity)

  // Detectar problemas prováveis baseado no conteúdo das mensagens
  // NOTA: Esta é uma detecção simplificada por palavras-chave. 
  // Idealmente, a API de chat retornaria problemTags detectados pela IA.
  const detectProblemsFromMessages = (): ProblemTag[] => {
    const allUserText = messages
      .filter(m => m.role === 'user')
      .map(m => m.content.toLowerCase())
      .join(' ')
    
    const detected: ProblemTag[] = []
    
    // Palavras-chave por problema
    const keywords: Record<ProblemTag, string[]> = {
      gaslighting: ['gaslighting', 'louco', 'louca', 'imaginando', 'inventando', 'exagerando', 'memória', 'não aconteceu', 'você que'],
      invalidacao: ['invalida', 'minimiza', 'exagero', 'drama', 'sensível demais', 'frescura', 'besteira', 'não é nada'],
      manipulacao: ['manipula', 'culpa', 'chantagem', 'ameaça', 'pressão', 'obriga', 'força'],
      isolamento: ['isola', 'afasta', 'amigos', 'família', 'sozinha', 'proíbe', 'não deixa'],
      ameacas: ['ameaça', 'medo', 'bater', 'matar', 'suicídio', 'filhos', 'tirar'],
      criminalizacao: ['processo', 'polícia', 'advogado', 'guarda', 'alienação', 'denúncia'],
      autoestima_baixa: ['autoestima', 'não valho', 'feia', 'burra', 'incapaz', 'não consigo', 'fracasso']
    }
    
    for (const [problem, words] of Object.entries(keywords)) {
      if (words.some(word => allUserText.includes(word))) {
        detected.push(problem as ProblemTag)
      }
    }
    
    return detected.slice(0, 3) // Máximo 3 problemas
  }

  // Usar problemas da API (prioridade) ou fallback para detecção local
  const detectedProblems = apiDetectedProblems.length > 0 
    ? apiDetectedProblems 
    : (messages.length >= 2 ? detectProblemsFromMessages() : [])
  
  // Obter ferramentas sugeridas baseadas nos problemas detectados
  const getSuggestedTools = () => {
    if (detectedProblems.length === 0) return []
    
    const toolsSet = new Set<string>()
    const tools: typeof TOOLS = []
    
    for (const problem of detectedProblems) {
      const problemTools = getToolsByProblem(problem)
      for (const tool of problemTools.slice(0, 2)) {
        if (!toolsSet.has(tool.id)) {
          toolsSet.add(tool.id)
          tools.push(tool)
        }
      }
    }
    
    return tools.slice(0, 4) // Máximo 4 ferramentas
  }
  
  const suggestedTools = getSuggestedTools()

  // ============================================
  // FUNÇÃO: SALVAR CONVERSA NO SUPABASE
  // ============================================
  const saveConversation = async () => {
    if (messages.length === 0 || !currentSession) return
    
    setIsSavingConversation(true)
    setSaveConversationStatus('saving')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Atualizar sessão com dados acumulados
      const { error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .update({
          updated_at: new Date().toISOString(),
          user_location: userLocation || null,
          accumulated_clarity_score: avgClarity || null,
          message_count: messages.length
        })
        .eq('id', currentSession.id)

      if (sessionError) throw sessionError

      // Salvar todas as mensagens que ainda não foram salvas
      const userMessages = messages.filter(m => m.role === 'user')
      const assistantMessages = messages.filter(m => m.role === 'assistant')
      
      // Verificar quais mensagens já existem
      const { data: existingMessages } = await supabase
        .from('ai_messages')
        .select('id')
        .eq('session_id', currentSession.id)

      const existingIds = new Set(existingMessages?.map(m => m.id) || [])
      
      // Filtrar mensagens novas
      const newMessages = messages.filter(m => !existingIds.has(m.id))
      
      if (newMessages.length > 0) {
        const messagesToInsert = newMessages.map(m => ({
          id: m.id,
          session_id: currentSession.id,
          user_id: user.id,
          role: m.role,
          content: m.content,
          clarity_score: m.clarity_score || null,
          from_voice: m.from_voice || false,
          created_at: m.timestamp
        }))

        const { error: messagesError } = await supabase
          .from('ai_messages')
          .upsert(messagesToInsert, { onConflict: 'id' })

        if (messagesError) throw messagesError
      }

      setSaveConversationStatus('saved')
      setTimeout(() => setSaveConversationStatus('idle'), 3000)
    } catch (error) {
      console.error('Erro ao salvar conversa:', error)
      setSaveConversationStatus('error')
    } finally {
      setIsSavingConversation(false)
    }
  }

  // ============================================
  // FUNÇÃO: ABRIR MODAL DE CONFIRMAÇÃO ANTES DO PDF
  // ============================================
  const handleExportPDFClick = () => {
    if (messages.length === 0) return
    // Resetar checkboxes e abrir modal
    setPdfConfirmChecks({ perspectiva: false, naoProva: false, responsabilidade: false })
    setShowPDFConfirmModal(true)
  }

  // ============================================
  // FUNÇÃO: EXPORTAR CONVERSA COMO PDF (após confirmação)
  // ============================================
  const exportConversationPDF = async () => {
    if (messages.length === 0) return
    
    // Fechar modal
    setShowPDFConfirmModal(false)
    setIsExportingPDF(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Preparar dados para o PDF
      const conversationData = {
        sessionId: currentSession?.id || 'unknown',
        userEmail: user?.email || 'Anônimo',
        location: userLocation || 'Não informada',
        date: new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        avgClarity: avgClarity,
        clarityZone: clarityZone.label,
        messageCount: messages.length,
        detectedProblems: detectedProblems.map(p => {
          const problem = PROBLEMS.find(pr => pr.id === p)
          return problem?.label || p
        }),
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          clarity_score: m.clarity_score
        }))
      }

      // Chamar API para gerar PDF
      const response = await fetch('/api/user/analysis-report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat_conversation',
          data: conversationData
        })
      })

      if (!response.ok) {
        // Fallback: gerar texto simples para download
        const textContent = generateTextExport(conversationData)
        downloadTextFile(textContent, `conversa-coach-${new Date().toISOString().split('T')[0]}.txt`)
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversa-coach-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      // Fallback para texto
      const textContent = generateTextExport({
        date: new Date().toLocaleDateString('pt-BR'),
        avgClarity,
        clarityZone: clarityZone.label,
        messageCount: messages.length,
        detectedProblems: detectedProblems,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString('pt-BR'),
          clarity_score: m.clarity_score
        }))
      })
      downloadTextFile(textContent, `conversa-coach-${new Date().toISOString().split('T')[0]}.txt`)
    } finally {
      setIsExportingPDF(false)
    }
  }

  // Gerar exportação em texto simples (fallback)
  const generateTextExport = (data: any) => {
    let text = `RADAR NARCISISTA - CONVERSA COM COACH DE CLAREZA\n`
    text += `${'='.repeat(50)}\n\n`
    text += `Data: ${data.date}\n`
    text += `Clareza média: ${data.avgClarity}/100 (${data.clarityZone})\n`
    text += `Total de mensagens: ${data.messageCount}\n`
    if (data.detectedProblems?.length > 0) {
      text += `Temas detectados: ${data.detectedProblems.join(', ')}\n`
    }
    text += `\n${'='.repeat(50)}\n`
    text += `CONVERSA\n`
    text += `${'='.repeat(50)}\n\n`
    
    for (const msg of data.messages) {
      const role = msg.role === 'user' ? '👤 VOCÊ' : '🤖 COACH'
      text += `[${msg.timestamp}] ${role}\n`
      text += `${msg.content}\n`
      if (msg.clarity_score) {
        text += `(Clareza: ${msg.clarity_score}/100)\n`
      }
      text += `\n${'-'.repeat(30)}\n\n`
    }
    
    text += `\n${'='.repeat(50)}\n`
    text += `AVISO: Esta conversa é para apoio emocional e organização de fatos.\n`
    text += `Não substitui acompanhamento profissional de psicólogo, advogado ou médico.\n`
    text += `Em situações de risco, ligue: CVV 188 | Polícia 190 | Mulher 180\n`
    
    return text
  }

  // Função auxiliar para download de arquivo texto
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // ============================================
  // FUNÇÃO: SALVAR RESUMO NO DIÁRIO (ETAPA 4 - Chat → Diário)
  // ============================================
  const handleSaveSummaryToDiary = async () => {
    if (summaryText.trim().length < 10) {
      alert('O resumo deve ter pelo menos 10 caracteres.')
      return
    }
    
    setIsSavingSummary(true)
    
    try {
      const response = await fetch('/api/chat/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryText: summaryText.trim(),
          moodIntensity: summaryMood,
          tags: summaryTags
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Sucesso - fechar modal e limpar estados
        setShowSummaryModal(false)
        setSummaryText('')
        setSummaryMood(5)
        setSummaryTags(['coach', 'reflexão', 'sessão'])
        
        // Toast de sucesso (usando alert simples por enquanto)
        alert('✅ Resumo salvo no seu Diário!')
      } else {
        alert(`❌ Erro: ${data.error || 'Falha ao salvar resumo'}`)
      }
    } catch (error) {
      console.error('Erro ao salvar resumo:', error)
      alert('❌ Erro ao salvar resumo. Tente novamente.')
    } finally {
      setIsSavingSummary(false)
    }
  }

  // Verificar se pode salvar resumo (mínimo 2 mensagens do usuário)
  const canSaveSummary = messages.filter(m => m.role === 'user').length >= 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-5xl mx-auto py-6 px-4">
          {/* ============================================================= */}
          {/* HEADER PREMIUM DO COACH */}
          {/* ============================================================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Título e subtítulo */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coach de Clareza</h1>
                    <p className="text-gray-500 text-sm">Converse com nossa IA sobre sua situação</p>
                  </div>
                </div>
                {userLocation && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 ml-15">
                    <MapPin className="w-3 h-3" />
                    <span>{userLocation}</span>
                  </div>
                )}
              </div>

              {/* Indicador de clareza + Botões */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Score de clareza média */}
                {userMessagesWithClarity.length > 0 && (
                  <div className={`px-4 py-2 rounded-xl ${clarityZone.bgColor} flex items-center gap-2`}>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Clareza média</div>
                      <div className={`text-xl font-bold ${clarityZone.color}`}>
                        {avgClarity}/100
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${clarityZone.bgColor} ${clarityZone.color} border border-current/20`}>
                      {clarityZone.label}
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Voltar</span>
                  </Button>
                  
                  {/* Botão Salvar Conversa */}
                  {messages.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveConversation}
                      disabled={isSavingConversation}
                      className={`flex items-center gap-2 ${
                        saveConversationStatus === 'saved' 
                          ? 'bg-green-50 text-green-600 border-green-200' 
                          : saveConversationStatus === 'error'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      {isSavingConversation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saveConversationStatus === 'saved' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {saveConversationStatus === 'saved' ? 'Salvo!' : 'Salvar'}
                      </span>
                    </Button>
                  )}
                  
                  {/* Botão Salvar no Diário (ETAPA 4 - Chat → Diário) */}
                  {canSaveSummary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSummaryModal(true)}
                      disabled={isSavingSummary}
                      className="flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                    >
                      {isSavingSummary ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <BookMarked className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Salvar no Diário</span>
                    </Button>
                  )}
                  
                  {/* Botão Exportar PDF/TXT */}
                  {messages.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDFClick}
                      disabled={isExportingPDF}
                      className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                    >
                      {isExportingPDF ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Exportar</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setMessages([])
                      setUserLocation('')
                      setShowLocationPrompt(false)
                      setContextApplied(false)
                      setApiDetectedProblems([]) // Limpar problemas detectados
                      setSaveConversationStatus('idle')
                      
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user) {
                        const { data: newSession } = await supabase
                          .from('ai_chat_sessions')
                          .insert({ user_id: user.id })
                          .select()
                          .single()
                        
                        if (newSession) {
                          setCurrentSession(newSession)
                        }
                      }
                    }}
                    className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Conversa</span>
                  </Button>
                  
                  {/* Botão Encerrar Conversa (com aviso final) */}
                  {messages.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEndConversationModal(true)}
                      className="flex items-center gap-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="hidden sm:inline">Encerrar</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* CONTAINER PRINCIPAL DO CHAT */}
          {/* ============================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Coluna principal - Chat */}
            <div className="lg:col-span-2">
              {/* ============================================================= */}
              {/* CARD DE RESUMO DA SESSÃO (quando há conversa ativa) */}
              {/* ============================================================= */}
              {messages.filter(m => m.role === 'user').length > 0 && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-4 mb-4 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-200 mb-1">Resumo da conversa</p>
                      <h3 className="font-semibold text-white truncate">
                        {messages.find(m => m.role === 'user')?.content.substring(0, 60)}
                        {(messages.find(m => m.role === 'user')?.content.length || 0) > 60 ? '...' : ''}
                      </h3>
                    </div>
                    {userMessagesWithClarity.length > 0 && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`px-3 py-1.5 rounded-lg ${
                          avgClarity >= 71 ? 'bg-green-500/20 text-green-100' :
                          avgClarity >= 31 ? 'bg-yellow-500/20 text-yellow-100' :
                          'bg-red-500/20 text-red-100'
                        }`}>
                          <span className="text-xs font-medium">{clarityZone.label}</span>
                          <div className="w-16 h-1.5 bg-white/20 rounded-full mt-1">
                            <div 
                              className={`h-full rounded-full ${
                                avgClarity >= 71 ? 'bg-green-400' :
                                avgClarity >= 31 ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${avgClarity}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-lg font-bold">{avgClarity}/100</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Área de mensagens */}
                <div className="h-[520px] overflow-y-auto p-5 space-y-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      {/* Card de boas-vindas premium */}
                      <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-100">
                          <Bot className="w-10 h-10 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Olá! Como posso ajudar?</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Estou aqui para conversar sobre sua situação. Você pode me contar o que está acontecendo 
                          e eu vou ajudar da melhor forma possível.
                        </p>
                        
                        {/* Dicas de como começar */}
                        <div className="bg-purple-50 rounded-xl p-4 text-left mb-4">
                          <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Dicas para uma boa conversa:
                          </h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Descreva o que aconteceu com detalhes</li>
                            <li>• Conte como você se sentiu</li>
                            <li>• Inclua o contexto da situação</li>
                          </ul>
                        </div>
                      </div>
                  
                  {/* Prompt de localização - aparece automaticamente */}
                  {showLocationPrompt && !userLocation && (
                    <div className="max-w-md mx-auto p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-800 text-lg">De onde você é?</h4>
                      </div>
                      
                      <p className="text-sm text-purple-700 mb-4 leading-relaxed">
                        Isso me ajuda a entender melhor seu contexto e adaptar minha linguagem para sua região.
                      </p>
                      
                      <p className="text-xs text-purple-600 mb-4 flex items-center gap-1">
                        🔒 Sua localização não é salva - só vale para esta conversa.
                      </p>

                      {/* Campo livre */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-purple-700 mb-2 block">
                          Digite como preferir (bairro, cidade, estado ou país):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ex: Bangu, Rio de Janeiro, Brasil"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && locationInput.trim()) {
                                e.preventDefault()
                                setUserLocation(locationInput.trim())
                                setShowLocationPrompt(false)
                                const locationMessage: Message = {
                                  id: crypto.randomUUID(),
                                  role: 'assistant',
                                  content: `Obrigado por me contar! Agora sei que você é de ${locationInput.trim()}. Vou adaptar meu jeito de conversar para ficar mais próximo da sua realidade. Pode me contar o que está acontecendo?`,
                                  timestamp: new Date().toISOString()
                                }
                                setMessages(prev => prev.length === 0 ? [locationMessage] : [...prev, locationMessage])
                                setLocationInput('')
                              }
                            }}
                            className="flex-1 px-3 py-2.5 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          />
                          <Button
                            size="sm"
                            disabled={!locationInput.trim()}
                            onClick={() => {
                              if (locationInput.trim()) {
                                setUserLocation(locationInput.trim())
                                setShowLocationPrompt(false)
                                const locationMessage: Message = {
                                  id: crypto.randomUUID(),
                                  role: 'assistant',
                                  content: `Obrigado por me contar! Agora sei que você é de ${locationInput.trim()}. Vou adaptar meu jeito de conversar para ficar mais próximo da sua realidade. Pode me contar o que está acontecendo?`,
                                  timestamp: new Date().toISOString()
                                }
                                setMessages(prev => prev.length === 0 ? [locationMessage] : [...prev, locationMessage])
                                setLocationInput('')
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Confirmar
                          </Button>
                        </div>
                      </div>

                      {/* Exemplos de como preencher */}
                      <div className="mb-4 p-3 bg-white/50 rounded-lg">
                        <p className="text-xs text-purple-600 mb-2 font-medium">💡 Exemplos de como preencher:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Brasil', 'Rio de Janeiro', 'São Paulo, SP', 'Zona Norte, RJ', 'Interior de Minas'].map((exemplo) => (
                            <button
                              key={exemplo}
                              onClick={() => setLocationInput(exemplo)}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              {exemplo}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Divisor */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-purple-200"></div>
                        <span className="text-xs text-purple-400">ou</span>
                        <div className="flex-1 h-px bg-purple-200"></div>
                      </div>

                      {/* Opção 2: GPS automático */}
                      <button
                        onClick={requestGPSLocation}
                        disabled={isRequestingLocation}
                        className="w-full py-2.5 px-4 bg-white border border-purple-300 rounded-lg text-sm text-purple-700 hover:bg-purple-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        {isRequestingLocation ? 'Detectando sua localização...' : 'Detectar automaticamente pelo GPS'}
                      </button>

                      {/* Pular - botão mais visível */}
                      <button
                        onClick={() => {
                          setShowLocationPrompt(false)
                          const skipMessage: Message = {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: 'Tudo bem! 💜 Pode começar a me contar o que está acontecendo quando se sentir confortável.',
                            timestamp: new Date().toISOString()
                          }
                          setMessages(prev => [...prev, skipMessage])
                        }}
                        className="w-full mt-3 py-2.5 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Pular e continuar a conversa
                      </button>
                    </div>
                  )}
                  
                  {isEmergencyMode && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-red-700">
                        <strong>Modo Emergência:</strong> Estou operando com respostas locais 
                        enquanto nossos servidores estão instáveis.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%] space-y-2">
                    {/* Bubble da mensagem */}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md shadow-lg shadow-purple-200/50'
                          : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          message.role === 'user' ? 'bg-white/20' : 'bg-purple-100'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                            <span className={`text-xs ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {message.from_voice && (
                              <span className="text-xs opacity-70">🎤 Voz</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de clareza para mensagens do usuário */}
                    {message.role === 'user' && message.clarity_score !== undefined && (
                      <div className="px-1">
                        <ClarityScoreIndicator 
                          score={message.clarity_score} 
                          explanation={message.clarity_explanation}
                          showDetails={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

                {/* ============================================================= */}
                {/* CAIXA DE ENTRADA PREMIUM */}
                {/* ============================================================= */}
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <form onSubmit={handleSubmit} className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={handleTextareaChange}
                        placeholder="Digite sua mensagem... Quanto mais detalhes, melhor a IA consegue te ajudar."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all bg-white"
                        style={{ minHeight: '60px', maxHeight: '200px' }}
                        disabled={isLoading}
                        aria-label="Campo de mensagem"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(e)
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Microphone
                        onTranscription={handleTranscription}
                        onError={handleTranscriptionError}
                        disabled={isLoading}
                      />
                      
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200/50 transition-all"
                        aria-label="Enviar mensagem"
                      >
                        {isLoading ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">Enter</kbd> para enviar • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">Shift+Enter</kbd> para nova linha
                  </div>
                  
                  {/* Microaviso de responsabilidade - Lema do Radar */}
                  <p className="mt-2 text-[10px] text-gray-400 text-center leading-relaxed">
                    ⚠️ Você está relatando <strong>sua perspectiva</strong>. O Radar organiza relatos, não decide quem está certo. 
                    Em conflitos, há risco de acreditar em mentiroso e culpar inocente – seja honesto(a) para obter clareza real.
                  </p>
                </div>

                {/* ============================================================= */}
                {/* FEEDBACK DE EVOLUÇÃO DA IA */}
                {/* Mostra análise textual da evolução a cada mensagem */}
                {/* ============================================================= */}
                {userMessagesWithClarity.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <ClarityFeedback
                      currentScore={userMessagesWithClarity[userMessagesWithClarity.length - 1]?.clarity_score || 0}
                      previousScore={userMessagesWithClarity.length > 1 
                        ? userMessagesWithClarity[userMessagesWithClarity.length - 2]?.clarity_score 
                        : undefined
                      }
                      currentExplanation={userMessagesWithClarity[userMessagesWithClarity.length - 1]?.clarity_explanation}
                      detectedProblems={detectedProblems}
                      messageCount={userMessagesWithClarity.length}
                      messageContent={userMessagesWithClarity[userMessagesWithClarity.length - 1]?.content}
                      useAI={true}
                    />
                  </div>
                )}

                {/* ============================================================= */}
                {/* RELATÓRIO DE EVOLUÇÃO DE CLAREZA - ANÁLISE COMPLETA */}
                {/* JSON estruturado com temas, risco, sugestões */}
                {/* ============================================================= */}
                {clarityEvolution && (
                  <div className="p-4 border-t border-gray-100">
                    <ClarityEvolutionReport
                      evolution={clarityEvolution}
                      onContinueConversation={() => {
                        textareaRef.current?.focus()
                      }}
                    />
                  </div>
                )}
                
                {isLoadingEvolution && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 py-4 text-purple-600">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Analisando sua evolução...</span>
                    </div>
                  </div>
                )}

                {/* ============================================================= */}
                {/* PAINEL DE EVOLUÇÃO EMOCIONAL - COMPARA MENSAGENS */}
                {/* Mostra como o estado emocional mudou entre mensagens */}
                {/* ============================================================= */}
                {evolucaoAtual && historicoEmocional.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <EmotionalEvolutionPanel
                      evolucao={evolucaoAtual}
                      historicoEstados={historicoEmocional}
                      onContinueConversation={() => {
                        textareaRef.current?.focus()
                      }}
                    />
                  </div>
                )}

                {/* ============================================================= */}
                {/* PAINEL DE TRANSPARÊNCIA DAS IAs - ABAIXO DO CHAT */}
                {/* Mostra TODAS as etapas de análise até o consenso */}
                {/* ============================================================= */}
                {lastTransparenciaData && userMessagesWithClarity.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <AITransparencyPanel
                      analises={lastTransparenciaData.analises || []}
                      consenso={lastTransparenciaData.consenso || { alcancado: true, nivel: 1, divergencias: [] }}
                      transparencia={lastTransparenciaData.transparencia || { iasUsadas: [], tempoTotal: 0, metodo: 'unknown' }}
                      currentScore={userMessagesWithClarity[userMessagesWithClarity.length - 1]?.clarity_score || 0}
                      previousScore={userMessagesWithClarity.length > 1 
                        ? userMessagesWithClarity[userMessagesWithClarity.length - 2]?.clarity_score 
                        : undefined
                      }
                      detectedProblems={detectedProblems}
                      onContinueConversation={() => {
                        textareaRef.current?.focus()
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================= */}
            {/* COLUNA LATERAL - Evolução + Insights + Ações */}
            {/* ============================================================= */}
            <div className="space-y-5">
              {/* Painel de Evolução da Clareza */}
              <ClarityEvolutionChart data={clarityChartData} showTrend={true} />

              {/* ============================================================= */}
              {/* PAINEL DE INSIGHTS - Problemas detectados + Ferramentas */}
              {/* ============================================================= */}
              {detectedProblems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Insights desta Conversa
                  </h4>
                  
                  {/* Problemas detectados */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Possíveis padrões identificados:</p>
                    <div className="space-y-1.5">
                      {detectedProblems.map(problemTag => {
                        const problem = PROBLEMS.find(p => p.id === problemTag)
                        if (!problem) return null
                        return (
                          <Link
                            key={problemTag}
                            href={`/hub/${problemTag}`}
                            className={`flex items-center gap-2 p-2 rounded-lg ${problem.bgColor} ${problem.hoverBg} transition-colors group`}
                          >
                            <span className="text-lg">{problem.icon === 'AlertCircle' ? '⚠️' : problem.icon === 'Brain' ? '🧠' : problem.icon === 'Heart' ? '💔' : problem.icon === 'ShieldAlert' ? '🛡️' : problem.icon === 'Users' ? '👥' : problem.icon === 'Scale' ? '⚖️' : '✨'}</span>
                            <span className={`text-sm font-medium ${problem.color}`}>{problem.label}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100" />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Ferramentas sugeridas */}
                  {suggestedTools.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Ferramentas que podem ajudar:</p>
                      <div className="space-y-1.5">
                        {suggestedTools.map(tool => (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors group"
                          >
                            <span className="text-base">{tool.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{tool.name}</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-purple-400" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                    Estes insights são baseados em palavras-chave e não são diagnóstico. Clique para saber mais sobre cada tema.
                  </p>
                </div>
              )}

              {/* Estado sem insights ainda */}
              {messages.length >= 1 && detectedProblems.length === 0 && (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    Insights
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Continue conversando para que possamos identificar padrões e sugerir ferramentas relevantes.
                  </p>
                </div>
              )}

              {/* Painel de Ações Rápidas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  Ações Rápidas
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/diario/novo"
                    className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                      <PenLine className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-purple-900">Registrar no Diário</span>
                      <p className="text-xs text-purple-600">Transforme esta conversa em registro</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                  </Link>
                  
                  <Link
                    href="/diario/timeline"
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-blue-900">Ver Timeline</span>
                      <p className="text-xs text-blue-600">Padrões no seu diário</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </Link>
                  
                  <Link
                    href="/teste-claridade"
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-green-900">Teste de Clareza</span>
                      <p className="text-xs text-green-600">Avalie sua situação</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-green-400" />
                  </Link>
                </div>
              </div>

              {/* Disclaimer de segurança */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Este atendimento por IA não substitui apoio profissional (psicológico, psiquiátrico, jurídico). 
                    Se você está em perigo, ligue <strong>180</strong> (Central da Mulher) ou <strong>190</strong> (Polícia).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      
      {/* Botão de Emergência Flutuante */}

      {/* ============================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE RESPONSABILIDADE ANTES DO PDF */}
      {/* ============================================================= */}
      {showPDFConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmação de Responsabilidade</h3>
              <p className="text-sm text-gray-600 mt-2">
                Antes de exportar, confirme que você entende o seguinte:
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={pdfConfirmChecks.perspectiva}
                  onChange={(e) => setPdfConfirmChecks(prev => ({ ...prev, perspectiva: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Este documento contém <strong>apenas minha perspectiva</strong> dos fatos. A IA não conhece o outro lado da história.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={pdfConfirmChecks.naoProva}
                  onChange={(e) => setPdfConfirmChecks(prev => ({ ...prev, naoProva: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Este documento <strong>não é prova judicial</strong>, laudo técnico ou diagnóstico clínico.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={pdfConfirmChecks.responsabilidade}
                  onChange={(e) => setPdfConfirmChecks(prev => ({ ...prev, responsabilidade: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Assumo total responsabilidade</strong> pelo uso que fizer deste documento.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPDFConfirmModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={exportConversationPDF}
                disabled={!pdfConfirmChecks.perspectiva || !pdfConfirmChecks.naoProva || !pdfConfirmChecks.responsabilidade}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                Confirmar e Exportar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL DE TERMOS OBRIGATÓRIO - PRIMEIRO USO */}
      {/* ============================================================= */}
      {!isLoadingTerms && hasAcceptedTerms === false && (
        <ResponsibilityTermsModal 
          onAccept={markAsAccepted} 
          context="chat" 
        />
      )}

      {/* ============================================================= */}
      {/* AVISO PERIÓDICO DURANTE O USO */}
      {/* ============================================================= */}
      {showPeriodicWarning && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Lembrete de Responsabilidade</p>
                <p className="text-xs text-amber-100 mt-1">
                  Você está relatando sua perspectiva. A IA não conhece o outro lado. 
                  Mentir para prejudicar alguém é crime. Seja honesto(a).
                </p>
              </div>
              <button 
                onClick={() => setShowPeriodicWarning(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ALERTA DE FRAUDE / INCONSISTÊNCIA DETECTADA */}
      {/* ============================================================= */}
      {showFraudAlert && detectedFraudFlags.length > 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl shadow-2xl max-w-lg border-2 border-red-400">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">⚠️ Atenção: Padrão detectado</p>
                <p className="text-xs text-red-100 leading-relaxed">
                  {detectedFraudFlags[0]?.type === 'revenge' && (
                    <>Detectamos linguagem focada em vingança ou destruição. O Radar existe para te ajudar a ter <strong>clareza e proteção</strong>, não para prejudicar outras pessoas.</>
                  )}
                  {detectedFraudFlags[0]?.type === 'fabrication' && (
                    <>Detectamos possível intenção de fabricar narrativa. Lembre-se: <strong>mentir ou forjar provas é crime</strong> (Art. 299 e 347 do CP).</>
                  )}
                  {detectedFraudFlags[0]?.type === 'manipulation' && (
                    <>Você mencionou processos judiciais. Lembre-se: o Radar <strong>não é prova judicial</strong>. Consulte um advogado para orientação legal.</>
                  )}
                  {detectedFraudFlags[0]?.type === 'excessive_accusation' && (
                    <>Detectamos linguagem muito acusatória. Lembre-se do lema: "Às vezes acreditamos em um mentiroso e culpamos um inocente." Tente dar <strong>exemplos concretos</strong>.</>
                  )}
                  {detectedFraudFlags[0]?.type === 'zero_self_criticism' && (
                    <>Notamos que você não mencionou nenhum ponto de autocrítica. Em conflitos, geralmente <strong>ambos os lados têm alguma responsabilidade</strong>. Isso não diminui o que você viveu.</>
                  )}
                  {!['revenge', 'fabrication', 'manipulation', 'excessive_accusation', 'zero_self_criticism'].includes(detectedFraudFlags[0]?.type) && (
                    <>Detectamos um padrão que merece atenção. Lembre-se: o Radar organiza relatos, não decide quem está certo.</>
                  )}
                </p>
              </div>
              <button 
                onClick={() => setShowFraudAlert(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL DE LIMITE DE MENSAGENS ATINGIDO */}
      {/* ============================================================= */}
      {showLimitReached && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Limite de mensagens atingido</h2>
                  <p className="text-violet-200 text-sm">Plano: {planName}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Você atingiu o limite de <strong>{chatLimit?.limit}</strong> mensagens por dia do seu plano atual.
              </p>
              <p className="text-gray-600 text-sm">
                Para continuar conversando com o Coach IA, você pode:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  Aguardar até amanhã (o limite reseta à meia-noite)
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  Fazer upgrade para um plano com mais mensagens
                </li>
              </ul>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLimitReached(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Entendi
                </button>
                <Link
                  href="/planos"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-center"
                >
                  Ver Planos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL DE ENCERRAMENTO DE CONVERSA - AVISO FINAL */}
      {/* ============================================================= */}
      {showEndConversationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Antes de encerrar...</h2>
                  <p className="text-amber-100 text-sm">Leia este lembrete importante</p>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-4">
              {/* Lema do Radar */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <blockquote className="text-amber-900 font-medium text-center italic">
                  "Às vezes acreditamos em um mentiroso<br/>e culpamos um inocente."
                </blockquote>
                <p className="text-xs text-amber-700 text-center mt-2">
                  — Lema do Radar Narcisista BR
                </p>
              </div>

              {/* Lembretes */}
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-xs">1</span>
                  </div>
                  <p>
                    <strong>Você relatou sua perspectiva.</strong> A IA organizou seus pensamentos, 
                    mas não conhece o outro lado da história.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-xs">2</span>
                  </div>
                  <p>
                    <strong>Isso não é diagnóstico.</strong> Se você identificou padrões preocupantes, 
                    procure um profissional (psicólogo, advogado, assistente social).
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-xs">3</span>
                  </div>
                  <p>
                    <strong>Você é responsável.</strong> Se usar estas informações para prejudicar 
                    alguém injustamente, a responsabilidade é sua.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  <p>
                    <strong>Cuide de você.</strong> Se estiver em risco, procure ajuda: 
                    CVV 188, Polícia 190, Central da Mulher 180.
                  </p>
                </div>
              </div>
            </div>

            {/* Opção de salvar resumo no diário (ETAPA 4 - Chat → Diário) */}
            {canSaveSummary && (
              <div className="px-6 pb-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsSaveSummaryOnEnd}
                      onChange={(e) => setWantsSaveSummaryOnEnd(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-indigo-900 flex items-center gap-2">
                        <BookMarked className="w-4 h-4" />
                        Salvar um resumo desta conversa no meu Diário
                      </span>
                      <p className="text-sm text-indigo-700 mt-1">
                        Você poderá escrever suas reflexões antes de salvar.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEndConversationModal(false)}
                className="flex-1"
              >
                Continuar conversa
              </Button>
              <Button
                onClick={async () => {
                  setShowEndConversationModal(false)
                  
                  // Se marcou para salvar resumo, abrir modal de resumo primeiro
                  if (wantsSaveSummaryOnEnd) {
                    setWantsSaveSummaryOnEnd(false)
                    setShowSummaryModal(true)
                    return // Não encerra ainda - usuário decide após salvar
                  }
                  
                  // Salvar conversa antes de encerrar
                  await saveConversation()
                  // Limpar e criar nova sessão
                  setMessages([])
                  setUserLocation('')
                  setShowLocationPrompt(false)
                  setContextApplied(false)
                  setApiDetectedProblems([])
                  setSaveConversationStatus('idle')
                  
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    const { data: newSession } = await supabase
                      .from('ai_chat_sessions')
                      .insert({ user_id: user.id })
                      .select()
                      .single()
                    
                    if (newSession) {
                      setCurrentSession(newSession)
                    }
                  }
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {wantsSaveSummaryOnEnd ? 'Continuar para salvar resumo' : 'Entendi, encerrar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL DE SALVAR RESUMO NO DIÁRIO (ETAPA 4 - Chat → Diário) */}
      {/* ============================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Salvar resumo no Diário</h2>
                  <p className="text-indigo-100 text-sm">Registre suas reflexões desta conversa</p>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Este resumo ficará registrado no seu <strong>Diário de Episódios</strong>. 
                Você pode editar o texto antes de salvar.
              </p>

              {/* Textarea para o resumo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que você quer guardar desta conversa?
                </label>
                <textarea
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Escreva aqui suas reflexões, aprendizados ou pontos importantes desta conversa com o Coach..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 10 caracteres ({summaryText.length}/10)
                </p>
              </div>

              {/* Slider de intensidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quão intenso você se sente depois desta conversa? ({summaryMood}/10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={summaryMood}
                  onChange={(e) => setSummaryMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tranquilo</span>
                  <span>Muito intenso</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (clique para remover)
                </label>
                <div className="flex flex-wrap gap-2">
                  {summaryTags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => setSummaryTags(summaryTags.filter((_, i) => i !== index))}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                    >
                      {tag} ×
                    </button>
                  ))}
                  {summaryTags.length < 5 && (
                    <button
                      onClick={() => {
                        const newTag = prompt('Digite uma nova tag:')
                        if (newTag && newTag.trim() && !summaryTags.includes(newTag.trim())) {
                          setSummaryTags([...summaryTags, newTag.trim()])
                        }
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSummaryModal(false)
                  setSummaryText('')
                  setSummaryMood(5)
                  setSummaryTags(['coach', 'reflexão', 'sessão'])
                }}
                className="flex-1"
                disabled={isSavingSummary}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSummaryToDiary}
                disabled={isSavingSummary || summaryText.trim().length < 10}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isSavingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <BookMarked className="w-4 h-4 mr-2" />
                    Salvar no Diário
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapper com Suspense para useSearchParams
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
