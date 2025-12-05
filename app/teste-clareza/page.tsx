'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Target, 
  ArrowLeft,
  AlertTriangle,
  Moon,
  Sun,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  PenLine,
  Mic,
  Crown,
  Sparkles,
  Clock,
  Info,
  Check,
  FileText,
  Pause,
  Play,
  Heart,
  Coffee,
  X
} from 'lucide-react'

// Importar configuração unificada
import {
  UNIFIED_QUESTIONS,
  ANSWER_OPTIONS,
  CATEGORIES_CONFIG,
  calculateUnifiedResult,
  getOrderedQuestions,
  getCategoryConfig,
  type UnifiedQuestion,
} from '@/lib/clarity-unified-config'

// Importar sistema de 3 vozes para perguntas
import {
  QuestionVoice,
  QUESTION_VOICE_CONFIG,
  getQuestionText,
  getAnswerText,
  hasThreeVoices,
} from '@/lib/clarity-questions-voices'

// Importar componentes de termos
import ClarityTermsModal from '@/components/ClarityTermsModal'
import TermsConsentBadge from '@/components/TermsConsentBadge'

// =============================================================================
// TESTE DE CLAREZA V2 - VERSÃO DE TESTE UX/UI
// Refatoração visual focada em público ansioso/fragilizado
// =============================================================================

// Tooltips para categorias (linguagem leiga)
const CATEGORY_TOOLTIPS: Record<string, string> = {
  invalidacao: 'Quando aquilo que você sente é tratado como exagero ou frescura.',
  gaslighting: 'Quando fazem você duvidar da própria memória ou percepção.',
  controle: 'Quando tentam controlar suas decisões, tempo ou dinheiro.',
  isolamento: 'Quando te afastam de amigos, família ou atividades.',
  emocional: 'Quando usam emoções para manipular ou punir você.',
  fisico: 'Quando há ameaças, intimidação ou violência física.',
}

export default function TesteClarezaV2() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [questions, setQuestions] = useState<UnifiedQuestion[]>([])
  
  // Estados para controle de termos
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsBlocked, setTermsBlocked] = useState(false)
  const [showTermsExpanded, setShowTermsExpanded] = useState(false) // Termo colapsado
  
  // Estados para pergunta 19 (texto livre)
  const [showQuestion19, setShowQuestion19] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [showAudioOption, setShowAudioOption] = useState(false) // Módulo premium colapsado
  
  // Estado para tooltip
  const [showCategoryTooltip, setShowCategoryTooltip] = useState(false)
  
  // Estado para animação de transição
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next')
  
  // Estado para modo pausa
  const [isPaused, setIsPaused] = useState(false)
  
  // Estado para voz selecionada nas perguntas
  const [questionVoice, setQuestionVoice] = useState<QuestionVoice>('colinho')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setQuestions(getOrderedQuestions())
      
      const savedTheme = localStorage.getItem('radar-theme')
      if (savedTheme === 'light') setIsDarkMode(false)
      
      // Limpar qualquer progresso anterior - sempre começar do zero
      localStorage.removeItem('radar-test-answers-v2')
      setAnswers({})
      setCurrentQuestion(0)
      
      await checkTermsAcceptance(user)
      setLoading(false)
    }
    init()
  }, [supabase])

  const checkTermsAcceptance = async (currentUser: any) => {
    const cachedAcceptance = localStorage.getItem('clarity-terms-accepted')
    if (cachedAcceptance) {
      try {
        const parsed = JSON.parse(cachedAcceptance)
        const expiresAt = new Date(parsed.expiresAt)
        if (expiresAt > new Date()) {
          setTermsAccepted(true)
          return
        }
      } catch (e) {
        console.error('Erro ao verificar cache de termos:', e)
      }
    }

    if (currentUser) {
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data, error } = await supabase
          .from('terms_acceptances')
          .select('id, accepted_at')
          .eq('user_id', currentUser.id)
          .gte('accepted_at', thirtyDaysAgo.toISOString())
          .order('accepted_at', { ascending: false })
          .limit(1)

        if (!error && data && data.length > 0) {
          const acceptance = data[0]
          const expiresAt = new Date(acceptance.accepted_at)
          expiresAt.setDate(expiresAt.getDate() + 30)
          
          localStorage.setItem('clarity-terms-accepted', JSON.stringify({
            acceptedAt: acceptance.accepted_at,
            expiresAt: expiresAt.toISOString()
          }))
          
          setTermsAccepted(true)
          return
        }
      } catch (e) {
        console.error('Erro ao verificar termos no Supabase:', e)
      }
    }

    setTermsAccepted(false)
    setShowTermsModal(true)
  }

  const handleTermsAccepted = () => {
    setTermsAccepted(true)
    setShowTermsModal(false)
    setTermsBlocked(false)
  }

  const handleTermsClose = () => {
    setShowTermsModal(false)
    setTermsBlocked(true)
  }

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('radar-theme', newMode ? 'dark' : 'light')
  }

  const saveProgress = (newAnswers: Record<string, number>, questionIndex: number) => {
    localStorage.setItem('radar-test-answers-v2', JSON.stringify({
      answers: newAnswers,
      currentQuestion: questionIndex,
      timestamp: new Date().toISOString(),
    }))
  }

  const handleAnswer = async (value: number) => {
    const question = questions[currentQuestion]
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      // Animação de transição
      setTransitionDirection('next')
      setIsTransitioning(true)
      
      setTimeout(() => {
        const nextQuestion = currentQuestion + 1
        setCurrentQuestion(nextQuestion)
        saveProgress(newAnswers, nextQuestion)
        
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 150)
    } else {
      setShowQuestion19(true)
    }
  }
  
  const handleFinishTest = async () => {
    await saveAndRedirect(answers, freeText)
  }
  
  const handleSkipQuestion19 = async () => {
    await saveAndRedirect(answers, '')
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Animação de transição
      setTransitionDirection('prev')
      setIsTransitioning(true)
      
      setTimeout(() => {
        const prevQuestion = currentQuestion - 1
        setCurrentQuestion(prevQuestion)
        saveProgress(answers, prevQuestion)
        
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 150)
    }
  }

  const saveAndRedirect = async (finalAnswers: Record<string, number>, userNarrative: string = '') => {
    setIsSaving(true)
    try {
      const result = calculateUnifiedResult(finalAnswers)
      
      // Salva resultado no localStorage (para recuperar após criar conta)
      localStorage.setItem('radar-test-result', JSON.stringify({
        answers: finalAnswers,
        result,
        userNarrative,
        completedAt: new Date().toISOString(),
      }))
      
      if (user) {
        // Usuário logado: salva no banco e vai direto pro resultado
        const nevoaScore = result.axisScores.find(a => a.axis === 'nevoa')
        const medoScore = result.axisScores.find(a => a.axis === 'medo')
        const limitesScore = result.axisScores.find(a => a.axis === 'limites')
        
        await supabase
          .from('clarity_tests')
          .insert({
            user_id: user.id,
            test_type: 'unificado_v3',
            raw_answers: finalAnswers,
            user_narrative: userNarrative,
            fog_score: nevoaScore?.totalScore || 0,
            fear_score: medoScore?.totalScore || 0,
            limits_score: limitesScore?.totalScore || 0,
            global_zone: result.globalZone,
            overall_percentage: result.overallPercentage,
            has_physical_risk: result.hasPhysicalRisk,
            created_at: new Date().toISOString(),
          })
        
        localStorage.removeItem('radar-test-answers-v2')
        router.push('/teste-clareza/resultado')
      } else {
        // VISITANTE: redireciona para criar conta ANTES de ver o resultado
        localStorage.removeItem('radar-test-answers-v2')
        router.push('/cadastro?from=teste&redirect=/teste-clareza/resultado')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      // Em caso de erro, tenta ir pro resultado mesmo assim
      router.push('/teste-clareza/resultado')
    }
  }

  // Classes dinâmicas baseadas no tema - MELHOR CONTRASTE NO MODO ESCURO
  const theme = {
    bgMain: isDarkMode ? 'bg-[#020617]' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
    bgHeader: isDarkMode ? 'bg-[#0F172A]/95' : 'bg-white/80',
    borderHeader: isDarkMode ? 'border-slate-800/50' : 'border-gray-100',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600', // Melhorado: era gray-400
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-500', // Melhorado: era gray-500
    cardBg: isDarkMode ? 'bg-slate-800/70' : 'bg-white', // Melhorado: mais opaco
    cardBorder: isDarkMode ? 'border-slate-600' : 'border-gray-200', // Melhorado: mais visível
    accent: isDarkMode ? 'violet' : 'purple',
    accentBg: isDarkMode ? 'bg-violet-600' : 'bg-purple-600',
    accentHover: isDarkMode ? 'hover:bg-violet-700' : 'hover:bg-purple-700',
    accentText: isDarkMode ? 'text-violet-400' : 'text-purple-600',
    accentBgLight: isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100',
  }
  
  // Calcular tempo estimado restante
  const getEstimatedTimeRemaining = () => {
    const remainingQuestions = questions.length - currentQuestion
    const secondsPerQuestion = 20 // Média de 20 segundos por pergunta
    const totalSeconds = remainingQuestions * secondsPerQuestion
    const minutes = Math.ceil(totalSeconds / 60)
    return minutes <= 1 ? 'menos de 1 min' : `~${minutes} min restantes`
  }

  // Loading - usar classes fixas para evitar erro de hidratação
  if (loading || isSaving) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {isSaving ? 'Calculando seu resultado...' : 'Carregando teste...'}
          </p>
        </div>
      </div>
    )
  }

  // Tela de bloqueio - se fechou o modal sem aceitar
  if (termsBlocked) {
    return (
      <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} p-8 text-center`}>
          <div className={`w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className={`text-xl font-bold ${theme.textPrimary} mb-3`}>
            Teste Bloqueado
          </h1>
          <p className={`${theme.textSecondary} mb-8 text-sm leading-relaxed`}>
            O Teste de Clareza só é habilitado após você ter ciência das regras e leis aplicáveis. 
            Isso é necessário para sua proteção e para garantir o uso ético da plataforma.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                setTermsBlocked(false)
                setShowTermsModal(true)
              }}
              className={`w-full py-3.5 px-6 ${theme.accentBg} ${theme.accentHover} text-white rounded-xl font-semibold transition-colors`}
            >
              Ler Termo de Responsabilidade
            </button>
            <Link href="/" className="block">
              <span className={`text-sm ${theme.textMuted} hover:${theme.textSecondary} transition-colors cursor-pointer`}>
                ← Voltar ao início
              </span>
            </Link>
          </div>
        </div>
        
        <ClarityTermsModal 
          isOpen={showTermsModal}
          onAccept={handleTermsAccepted}
          onClose={handleTermsClose}
        />
      </div>
    )
  }

  // Modal de termos (se ainda não aceitou)
  if (!termsAccepted && showTermsModal) {
    return (
      <div className={`min-h-screen ${theme.bgMain}`}>
        <ClarityTermsModal 
          isOpen={showTermsModal}
          onAccept={handleTermsAccepted}
          onClose={handleTermsClose}
        />
      </div>
    )
  }

  // ==========================================================================
  // TELA DE INTRODUÇÃO (DISCLAIMER) - REFATORADA
  // ==========================================================================
  if (showDisclaimer) {
    return (
      <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center p-3 sm:p-4`}>
        <div className={`max-w-lg w-full`}>
          {/* Toggle de tema - discreto no canto */}
          <div className="flex justify-end mb-4 sm:mb-6">
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-gray-600 shadow-sm'} hover:opacity-80 transition-all`}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          
          {/* Header - Hierarquia clara */}
          <div className="text-center mb-5 sm:mb-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 ${theme.accentBgLight} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5`}>
              <Target className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.accentText}`} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${theme.textPrimary} mb-1.5 sm:mb-2`}>Teste de Clareza</h1>
            <p className={`${theme.textSecondary} text-base sm:text-lg mb-2 sm:mb-3`}>Um mapa para entender sua situação</p>
            
            {/* Tempo estimado - visível e tranquilizador */}
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textMuted}`} />
              <span className={`text-xs sm:text-sm ${theme.textSecondary}`}>Leva cerca de 5-10 minutos</span>
            </div>
          </div>

          {/* Card ALERTA (único laranja) */}
          <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${isDarkMode ? 'bg-amber-900/30 border-amber-700/50' : 'bg-amber-50 border-amber-200'} border mb-3 sm:mb-4`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-amber-800/50' : 'bg-amber-100'} flex-shrink-0`}>
                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'} mb-1.5 sm:mb-2 text-sm sm:text-base`}>Antes de começar</h3>
                <ul className={`text-xs sm:text-sm space-y-1 sm:space-y-1.5 ${isDarkMode ? 'text-amber-400/90' : 'text-amber-700'}`}>
                  <li>• Este teste <strong>não é diagnóstico</strong> médico ou psicológico</li>
                  <li>• Ele mapeia <strong>sua percepção</strong> da situação</li>
                  <li>• Os resultados são um ponto de partida, não uma conclusão</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cards INFORMATIVOS (mesmo estilo, cor unificada) */}
          <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-8">
            {/* O que você vai responder */}
            <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} flex-shrink-0`}>
                  <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.textSecondary}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${theme.textPrimary} mb-1.5 sm:mb-2 text-sm sm:text-base`}>O que você vai responder</h3>
                  <ul className={`text-xs sm:text-sm space-y-1 sm:space-y-1.5 ${theme.textSecondary}`}>
                    <li>• <strong>18 perguntas</strong> + 1 especial</li>
                    <li>• <strong>6 categorias</strong>, 3 eixos de análise</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* A última pergunta é especial */}
            <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'} border`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} flex-shrink-0`}>
                  <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accentText}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${theme.textPrimary} mb-1.5 sm:mb-2 text-sm sm:text-base`}>A última pergunta é especial</h3>
                  <ul className={`text-xs sm:text-sm space-y-1 sm:space-y-1.5 ${theme.textSecondary}`}>
                    <li>• Você poderá contar sua história com suas palavras</li>
                    <li>• É opcional, mas faz toda a diferença</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Principal - com respiro */}
          <div className="space-y-3 sm:space-y-4">
            <button 
              onClick={() => setShowDisclaimer(false)} 
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 ${theme.accentBg} ${theme.accentHover} text-white rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 text-sm sm:text-base`}
            >
              Entendi, começar teste
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Link secundário - discreto */}
            <div className="text-center">
              <Link href="/" className={`text-xs sm:text-sm ${theme.textMuted} hover:${theme.textSecondary} transition-colors`}>
                ← Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // PERGUNTA 19 - TEXTO LIVRE (REFATORADA)
  // ==========================================================================
  if (showQuestion19) {
    return (
      <div className={`min-h-screen ${theme.bgMain}`}>
        <header className={`sticky top-0 z-40 ${theme.bgHeader} backdrop-blur-sm border-b ${theme.borderHeader}`}>
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowQuestion19(false)}
                className={`p-1.5 sm:p-2 ${theme.textSecondary} hover:${theme.textPrimary} ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className={`text-xs sm:text-sm ${theme.textSecondary}`}>19 de 19</span>
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
            <div className={`mt-2 sm:mt-3 h-1 sm:h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div className={`h-full ${theme.accentBg} rounded-full`} style={{ width: '100%' }} />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Banner simplificado - 2 linhas */}
          <div className={`mb-4 sm:mb-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl ${isDarkMode ? 'bg-violet-900/30 border-violet-700/50' : 'bg-purple-50 border-purple-200'} border`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-violet-800/50' : 'bg-purple-100'} flex-shrink-0`}>
                <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-violet-300' : 'text-purple-800'} text-base sm:text-lg`}>
                  Esta é a pergunta mais importante.
                </h3>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-violet-400/80' : 'text-purple-700'}`}>
                  Ela ajuda a juntar todas as peças do que você está vivendo.
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.cardBg} rounded-xl sm:rounded-2xl shadow-xl border ${theme.cardBorder} p-4 sm:p-6 md:p-8`}>
            {/* Pergunta */}
            <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold ${theme.textPrimary} mb-4 sm:mb-6 leading-relaxed`}>
              Com suas próprias palavras, conte o que você está vivendo ou sentindo nessa relação.
            </h2>

            {/* Campo de texto com placeholder guiado */}
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={`Se quiser, você pode contar:
• um episódio que ficou marcado
• um padrão que se repete
• ou simplesmente como você se sente hoje`}
              className={`w-full h-36 sm:h-44 md:h-52 p-3 sm:p-4 rounded-lg sm:rounded-xl border resize-none text-sm sm:text-base ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-violet-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors`}
            />

            {/* Contador de caracteres */}
            <div className={`mt-1.5 sm:mt-2 text-[10px] sm:text-xs ${theme.textMuted} text-right`}>
              {freeText.length} caracteres
            </div>

            {/* Opção de áudio (Premium) - Colapsável e discreto */}
            <div className={`mt-4 sm:mt-6 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'} border overflow-hidden`}>
              <button
                onClick={() => setShowAudioOption(!showAudioOption)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'} transition-colors`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mic className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textMuted}`} />
                  <span className={`text-xs sm:text-sm ${theme.textSecondary}`}>Prefere falar?</span>
                </div>
                {showAudioOption ? (
                  <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textMuted}`} />
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.textMuted}`} />
                )}
              </button>
              
              {showAudioOption && (
                <div className={`px-3 sm:px-4 pb-3 sm:pb-4 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
                  <p className={`text-[10px] sm:text-xs ${theme.textMuted} mt-2 sm:mt-3 mb-2 sm:mb-3`}>
                    Você pode gravar um áudio, e nós transcrevemos para você. Recurso do plano Premium.
                  </p>
                  <Link href="/planos">
                    <button className={`w-full py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium ${
                      isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors flex items-center justify-center gap-1.5 sm:gap-2`}>
                      <Crown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                      Gravar áudio (Premium)
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação - hierarquia clara */}
          <div className="mt-5 sm:mt-8 space-y-2 sm:space-y-3">
            <button
              onClick={handleFinishTest}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 ${theme.accentBg} hover:opacity-90 text-white rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 text-sm sm:text-base`}
            >
              {freeText.trim() ? 'Finalizar e ver meu resultado' : 'Finalizar teste'}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={handleSkipQuestion19}
              className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium transition-colors border text-sm sm:text-base ${
                isDarkMode 
                  ? 'border-slate-700 text-slate-400 hover:bg-slate-800/50' 
                  : 'border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Pular esta pergunta
            </button>
          </div>

          {/* Texto de apoio */}
          <p className={`mt-4 sm:mt-6 text-[10px] sm:text-xs ${theme.textMuted} text-center leading-relaxed`}>
            Você pode pular se não se sentir pronta agora.<br />
            Mas, se conseguir, contar um pouco da sua história ajuda <strong>muito</strong> na análise.
          </p>
        </main>
      </div>
    )
  }

  // ==========================================================================
  // QUESTIONÁRIO NORMAL (18 PERGUNTAS) - REFATORADO
  // ==========================================================================
  const question = questions[currentQuestion]
  const categoryConfig = getCategoryConfig(question.category)
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className={`min-h-screen ${theme.bgMain}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${theme.bgHeader} backdrop-blur-sm border-b ${theme.borderHeader}`}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* Termo de Consentimento - COLAPSADO por padrão */}
          {termsAccepted && currentQuestion < 3 && (
            <div className={`mb-2 sm:mb-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'} border overflow-hidden`}>
              <button
                onClick={() => setShowTermsExpanded(!showTermsExpanded)}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between text-left`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`} />
                  <span className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Termo de Consentimento aceito
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} transition-transform ${showTermsExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              {showTermsExpanded && (
                <div className={`px-2 sm:px-3 pb-2 sm:pb-3 border-t ${isDarkMode ? 'border-emerald-800/30' : 'border-emerald-200'}`}>
                  <div className="pt-1.5 sm:pt-2">
                    <TermsConsentBadge />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Header reorganizado */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            {/* Esquerda: Voltar + Progresso */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className={`p-1.5 sm:p-2 ${theme.textSecondary} ${currentQuestion === 0 ? 'opacity-30 cursor-not-allowed' : `hover:${theme.textPrimary}`} ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex flex-col">
                <span className={`text-xs sm:text-sm font-medium ${theme.textPrimary}`}>
                  {currentQuestion + 1} de {questions.length}
                </span>
                <span className={`text-[10px] sm:text-xs ${theme.textMuted} flex items-center gap-0.5 sm:gap-1`}>
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {getEstimatedTimeRemaining()}
                </span>
              </div>
            </div>
            
            {/* Direita: Categoria com tooltip + Tema */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowCategoryTooltip(!showCategoryTooltip)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
                >
                  <span className="hidden xs:inline">{categoryConfig.label}</span>
                  <span className="xs:hidden">{categoryConfig.label.slice(0, 8)}...</span>
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                
                {/* Tooltip */}
                {showCategoryTooltip && (
                  <div className={`absolute right-0 top-full mt-2 w-56 sm:w-64 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-xl z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border`}>
                    <p className={`text-[10px] sm:text-xs ${theme.textSecondary} leading-relaxed`}>
                      <strong className={theme.textPrimary}>{categoryConfig.label}:</strong><br />
                      {CATEGORY_TOOLTIPS[question.category] || categoryConfig.description}
                    </p>
                    <button 
                      onClick={() => setShowCategoryTooltip(false)}
                      className={`mt-1.5 sm:mt-2 text-[10px] sm:text-xs ${theme.accentText} hover:underline`}
                    >
                      Entendi
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsPaused(true)}
                className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'} hover:opacity-80 transition-all`}
                title="Fazer uma pausa"
              >
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className={`h-1 sm:h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${theme.accentBg} rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question - COM ANIMAÇÃO */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div 
          className={`transition-all duration-200 ease-out ${
            isTransitioning 
              ? `opacity-0 ${transitionDirection === 'next' ? 'translate-x-8' : '-translate-x-8'}` 
              : 'opacity-100 translate-x-0'
          }`}
        >
        {/* Alerta de risco físico */}
        {question.category === 'fisico' && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  <strong>Importante:</strong> Se você está em perigo imediato, ligue <strong>190</strong> (Polícia) ou <strong>180</strong> (Central da Mulher).
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`${theme.cardBg} rounded-xl sm:rounded-2xl shadow-xl border ${theme.cardBorder} p-4 sm:p-6 md:p-8`}>
          
          {/* ============================================================ */}
          {/* SELETOR DE VOZ - 3 opções */}
          {/* ============================================================ */}
          {hasThreeVoices(question.id) && (
            <div className="mb-4 sm:mb-6">
              <p className={`text-[10px] sm:text-xs ${theme.textMuted} mb-1.5 sm:mb-2`}>Escolha como quer ler a pergunta:</p>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {(['colinho', 'profissional', 'defesa'] as QuestionVoice[]).map((voice) => {
                  const config = QUESTION_VOICE_CONFIG[voice]
                  const isActive = questionVoice === voice
                  return (
                    <button
                      key={voice}
                      onClick={() => setQuestionVoice(voice)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                        isActive
                          ? `${config.bgColor} ${config.color} ${config.borderColor} border-2`
                          : `${isDarkMode ? 'bg-slate-700/50 text-slate-400 border-slate-600' : 'bg-gray-100 text-gray-500 border-gray-200'} border hover:opacity-80`
                      }`}
                    >
                      <span>{config.emoji}</span>
                      <span className="hidden xs:inline">{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Pergunta - usando voz selecionada */}
          <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold ${theme.textPrimary} mb-2 sm:mb-3 leading-relaxed`}>
            {hasThreeVoices(question.id) 
              ? getQuestionText(question.id, questionVoice)
              : question.text
            }
          </h2>
          
          {/* Subtítulo guiado */}
          <p className={`text-xs sm:text-sm ${theme.textMuted} mb-5 sm:mb-8`}>
            Marque a opção que mais se aproxima da sua realidade nos últimos meses.
          </p>

          {/* Opções de resposta - com feedback visual melhorado e 3 vozes */}
          <div className="space-y-2 sm:space-y-3">
            {ANSWER_OPTIONS.map((option) => {
              const isSelected = answers[question.id] === option.value
              const answerVoice = hasThreeVoices(question.id) 
                ? getAnswerText(option.value, questionVoice)
                : { label: option.label, description: option.description }
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border text-left transition-all group ${
                    isDarkMode 
                      ? `${isSelected 
                          ? 'bg-violet-600/30 border-violet-500 ring-2 ring-violet-500/30' 
                          : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}`
                      : `${isSelected 
                          ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-400/30' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium ${theme.textPrimary} text-sm sm:text-base`}>{answerVoice.label}</span>
                      {answerVoice.description && (
                        <span className={`text-xs sm:text-sm ${theme.textSecondary} ml-1 sm:ml-2 block sm:inline mt-0.5 sm:mt-0`}>— {answerVoice.description}</span>
                      )}
                    </div>
                    {/* Check icon - sempre visível quando selecionado */}
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3 transition-all ${
                      isSelected 
                        ? `${theme.accentBg}` 
                        : `${isDarkMode ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-gray-200 group-hover:bg-gray-300'}`
                    }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Info de progresso */}
          <div className={`mt-4 sm:mt-6 pt-4 sm:pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
            <span className={`text-xs sm:text-sm ${theme.textMuted}`}>
              {answeredCount} de {questions.length} respondidas
            </span>
            {currentQuestion === questions.length - 1 && answeredCount === questions.length - 1 && (
              <span className={`text-xs sm:text-sm font-medium ${theme.accentText}`}>
                Última pergunta!
              </span>
            )}
          </div>
        </div>

        {/* Aviso de responsabilidade - mais discreto */}
        <div className={`mt-4 sm:mt-6 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <p className={`text-[10px] sm:text-xs ${theme.textMuted} text-center`}>
            Lembre-se: você está relatando sua perspectiva. Este teste não é diagnóstico clínico.
          </p>
        </div>
        </div> {/* Fecha div da animação */}
      </main>
      
      {/* ================================================================ */}
      {/* MODAL DE PAUSA - Modo respiro */}
      {/* ================================================================ */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className={`max-w-md w-full ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl sm:rounded-3xl border shadow-2xl p-5 sm:p-8 text-center relative`}>
            {/* Botão fechar */}
            <button
              onClick={() => setIsPaused(false)}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Ícone */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full ${isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100'} flex items-center justify-center`}>
              <Coffee className={`w-8 h-8 sm:w-10 sm:h-10 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
            </div>
            
            {/* Título */}
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3`}>
              Tudo bem fazer uma pausa
            </h2>
            
            {/* Mensagem */}
            <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base`}>
              Respire fundo. Seu progresso está salvo.<br />
              Você pode continuar quando se sentir pronta.
            </p>
            
            {/* Dicas de respiro */}
            <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'} mb-4 sm:mb-6`}>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-2 sm:mb-3`}>
                💡 <strong>Dica de respiração:</strong>
              </p>
              <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} space-y-0.5 sm:space-y-1`}>
                <p>• Inspire por 4 segundos</p>
                <p>• Segure por 4 segundos</p>
                <p>• Expire por 4 segundos</p>
                <p>• Repita 3 vezes</p>
              </div>
            </div>
            
            {/* Progresso salvo */}
            <div className={`flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                {answeredCount} de {questions.length} perguntas salvas
              </span>
            </div>
            
            {/* Botões */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setIsPaused(false)}
                className={`w-full py-3 sm:py-3.5 px-4 sm:px-6 ${theme.accentBg} hover:opacity-90 text-white rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base`}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                Continuar teste
              </button>
              
              <button
                onClick={() => {
                  setIsPaused(false)
                  router.push('/dashboard')
                }}
                className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Sair e continuar depois
              </button>
            </div>
            
            {/* Contatos de emergência */}
            <div className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <p className={`text-[10px] sm:text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} mb-1.5 sm:mb-2`}>
                Precisa de ajuda agora?
              </p>
              <div className="flex justify-center gap-3 sm:gap-4">
                <a href="tel:188" className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-purple-600 hover:text-purple-700'}`}>
                  188 - CVV
                </a>
                <a href="tel:180" className={`text-[10px] sm:text-xs font-medium ${isDarkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}>
                  180 - Mulher
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
