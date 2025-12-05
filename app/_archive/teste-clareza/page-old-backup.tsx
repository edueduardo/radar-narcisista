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
  Lock,
  PenLine,
  Mic,
  Crown,
  Sparkles
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

// Importar componentes de termos
import ClarityTermsModal from '@/components/ClarityTermsModal'
import TermsConsentBadge from '@/components/TermsConsentBadge'

// =============================================================================
// TESTE DE CLAREZA UNIFICADO - RADAR NARCISISTA BR
// PLANO D: 18 perguntas, 3 eixos, 6 categorias, design adaptável
// + Cadeia de Custódia: Modal de termos obrigatório com validade de 30 dias
// =============================================================================

export default function TesteClarezaUnificado() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [questions, setQuestions] = useState<UnifiedQuestion[]>([])
  
  // Estados para controle de termos
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null) // null = verificando
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsBlocked, setTermsBlocked] = useState(false) // Se fechou sem aceitar
  
  // Estados para pergunta 19 (texto livre)
  const [showQuestion19, setShowQuestion19] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [isPremium, setIsPremium] = useState(false) // TODO: verificar plano do usuário

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      // Carregar usuário
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Carregar perguntas ordenadas
      setQuestions(getOrderedQuestions())
      
      // Carregar preferência de tema
      const savedTheme = localStorage.getItem('radar-theme')
      if (savedTheme === 'light') setIsDarkMode(false)
      
      // Carregar respostas salvas (se houver)
      const savedAnswers = localStorage.getItem('radar-test-answers')
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers)
          setAnswers(parsed.answers || {})
          setCurrentQuestion(parsed.currentQuestion || 0)
        } catch (e) {
          console.error('Erro ao carregar respostas salvas:', e)
        }
      }
      
      // Verificar se termos foram aceitos nos últimos 30 dias
      await checkTermsAcceptance(user)
      
      setLoading(false)
    }
    init()
  }, [supabase])

  // Verificar aceite de termos (localStorage + Supabase)
  const checkTermsAcceptance = async (currentUser: any) => {
    // Primeiro verificar localStorage (cache)
    const cachedAcceptance = localStorage.getItem('clarity-terms-accepted')
    if (cachedAcceptance) {
      try {
        const parsed = JSON.parse(cachedAcceptance)
        const expiresAt = new Date(parsed.expiresAt)
        
        // Se ainda não expirou (30 dias), aceitar
        if (expiresAt > new Date()) {
          setTermsAccepted(true)
          return
        }
      } catch (e) {
        console.error('Erro ao verificar cache de termos:', e)
      }
    }

    // Se não tem cache válido, verificar no Supabase
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
          // Tem aceite válido no banco, atualizar cache
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

    // Não tem aceite válido - precisa mostrar modal
    setTermsAccepted(false)
    setShowTermsModal(true)
  }

  // Handler quando aceita os termos
  const handleTermsAccepted = () => {
    setTermsAccepted(true)
    setShowTermsModal(false)
    setTermsBlocked(false)
  }

  // Handler quando fecha o modal sem aceitar
  const handleTermsClose = () => {
    setShowTermsModal(false)
    setTermsBlocked(true)
  }

  // Salvar preferência de tema
  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('radar-theme', newMode ? 'dark' : 'light')
  }

  // Salvar progresso no localStorage
  const saveProgress = (newAnswers: Record<string, number>, questionIndex: number) => {
    localStorage.setItem('radar-test-answers', JSON.stringify({
      answers: newAnswers,
      currentQuestion: questionIndex,
      timestamp: new Date().toISOString(),
    }))
  }

  // Handler de resposta
  const handleAnswer = async (value: number) => {
    const question = questions[currentQuestion]
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      // Próxima pergunta
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      saveProgress(newAnswers, nextQuestion)
    } else {
      // Última pergunta das 18 - mostrar pergunta 19 (texto livre)
      setShowQuestion19(true)
    }
  }
  
  // Finalizar teste (após pergunta 19)
  const handleFinishTest = async () => {
    await saveAndRedirect(answers, freeText)
  }
  
  // Pular pergunta 19
  const handleSkipQuestion19 = async () => {
    await saveAndRedirect(answers, '')
  }

  // Voltar pergunta
  const handleBack = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1
      setCurrentQuestion(prevQuestion)
      saveProgress(answers, prevQuestion)
    }
  }

  // Salvar resultado e redirecionar
  const saveAndRedirect = async (finalAnswers: Record<string, number>, userNarrative: string = '') => {
    setIsSaving(true)
    try {
      // Calcular resultado usando a função unificada
      const result = calculateUnifiedResult(finalAnswers)
      
      // Salvar no localStorage para a página de resultado
      localStorage.setItem('radar-test-result', JSON.stringify({
        answers: finalAnswers,
        result,
        userNarrative, // Texto livre da pergunta 19
        completedAt: new Date().toISOString(),
      }))
      
      // Salvar no Supabase se usuário logado
      if (user) {
        // Extrair scores por eixo
        const nevoaScore = result.axisScores.find(a => a.axis === 'nevoa')
        const medoScore = result.axisScores.find(a => a.axis === 'medo')
        const limitesScore = result.axisScores.find(a => a.axis === 'limites')
        
        await supabase
          .from('clarity_tests')
          .insert({
            user_id: user.id,
            test_type: 'unificado_v3', // v3 = com pergunta 19
            raw_answers: finalAnswers,
            user_narrative: userNarrative, // Texto livre
            fog_score: nevoaScore?.totalScore || 0,
            fear_score: medoScore?.totalScore || 0,
            limits_score: limitesScore?.totalScore || 0,
            global_zone: result.globalZone,
            overall_percentage: result.overallPercentage,
            has_physical_risk: result.hasPhysicalRisk,
            created_at: new Date().toISOString(),
          })
      }
      
      // Limpar progresso salvo
      localStorage.removeItem('radar-test-answers')
      
      // Redirecionar para página de resultado
      router.push('/teste-clareza/resultado')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      // Redirecionar mesmo com erro
      router.push('/teste-clareza/resultado')
    }
  }

  // Classes dinâmicas baseadas no tema
  const theme = {
    bgMain: isDarkMode ? 'bg-[#020617]' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
    bgHeader: isDarkMode ? 'bg-[#0F172A]/95' : 'bg-white/80',
    borderHeader: isDarkMode ? 'border-slate-800/50' : 'border-gray-100',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDarkMode ? 'bg-slate-800/50' : 'bg-white',
    cardBorder: isDarkMode ? 'border-slate-700' : 'border-gray-200',
    accent: isDarkMode ? 'violet' : 'purple',
    accentBg: isDarkMode ? 'bg-violet-600' : 'bg-purple-600',
    accentHover: isDarkMode ? 'hover:bg-violet-700' : 'hover:bg-purple-700',
    accentText: isDarkMode ? 'text-violet-400' : 'text-purple-600',
    accentBgLight: isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100',
  }

  // Loading
  if (loading || isSaving) {
    return (
      <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-2 ${isDarkMode ? 'border-violet-500' : 'border-purple-600'} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`${theme.textSecondary} text-sm`}>
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
        <div className={`max-w-md w-full ${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} p-6 sm:p-8 text-center`}>
          <div className={`w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className={`text-xl font-bold ${theme.textPrimary} mb-3`}>
            Teste Bloqueado
          </h1>
          <p className={`${theme.textSecondary} mb-6 text-sm`}>
            O Teste de Clareza só é habilitado após você ter ciência das regras e leis aplicáveis. 
            Isso é necessário para sua proteção e para garantir o uso ético da plataforma.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                setTermsBlocked(false)
                setShowTermsModal(true)
              }}
              className={`w-full py-3 px-6 ${theme.accentBg} ${theme.accentHover} text-white rounded-xl font-semibold transition-colors`}
            >
              Ler Termo de Responsabilidade
            </button>
            <Link href="/">
              <button className={`w-full py-3 px-6 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} ${theme.textPrimary} rounded-xl font-medium transition-colors`}>
                Voltar ao início
              </button>
            </Link>
          </div>
        </div>
        
        {/* Modal de termos */}
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

  // Disclaimer inicial
  if (showDisclaimer) {
    return (
      <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center p-4`}>
        <div className={`max-w-xl w-full ${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} p-6 sm:p-8`}>
          {/* Toggle de tema */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${theme.accentBgLight} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Target className={`w-8 h-8 ${theme.accentText}`} />
            </div>
            <h1 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Teste de Clareza</h1>
            <p className={theme.textSecondary}>Um mapa para entender sua situação</p>
          </div>

          {/* Aviso */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} border mb-6`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'} mb-2`}>Antes de começar</h3>
                <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  <li>• Este teste <strong>não é diagnóstico</strong> médico ou psicológico</li>
                  <li>• Ele mapeia <strong>sua percepção</strong> da situação</li>
                  <li>• Os resultados são um ponto de partida, não uma conclusão</li>
                  <li>• Leva cerca de <strong>5-10 minutos</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info sobre o teste */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'} mb-6`}>
            <h3 className={`font-semibold ${theme.textPrimary} mb-3`}>O que você vai responder:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className={`text-sm ${theme.textSecondary}`}>
                <span className={`font-medium ${theme.textPrimary}`}>18</span> perguntas + 1 especial
              </div>
              <div className={`text-sm ${theme.textSecondary}`}>
                <span className={`font-medium ${theme.textPrimary}`}>6</span> categorias
              </div>
              <div className={`text-sm ${theme.textSecondary}`}>
                <span className={`font-medium ${theme.textPrimary}`}>3</span> eixos de análise
              </div>
              <div className={`text-sm ${theme.textSecondary}`}>
                <span className={`font-medium ${theme.textPrimary}`}>5-10</span> minutos
              </div>
            </div>
          </div>
          
          {/* Destaque pergunta 19 */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-violet-900/20 border-violet-800' : 'bg-purple-50 border-purple-200'} border mb-6`}>
            <div className="flex items-start gap-3">
              <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'} flex-shrink-0 mt-0.5`} />
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-violet-300' : 'text-purple-800'} mb-1`}>A última pergunta é especial</h3>
                <p className={`text-sm ${isDarkMode ? 'text-violet-400' : 'text-purple-700'}`}>
                  No final, você poderá contar sua história com suas próprias palavras. 
                  Isso ajuda a montar o quebra-cabeça completo da sua situação.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setShowDisclaimer(false)} 
              className={`w-full py-3 px-6 ${theme.accentBg} ${theme.accentHover} text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2`}
            >
              Entendi, começar teste
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link href="/">
              <button className={`w-full py-3 px-6 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} ${theme.textPrimary} rounded-xl font-medium transition-colors`}>
                Voltar ao início
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // PERGUNTA 19 - TEXTO LIVRE (OPCIONAL)
  // ============================================================
  if (showQuestion19) {
    return (
      <div className={`min-h-screen ${theme.bgMain}`}>
        <header className={`sticky top-0 z-40 ${theme.bgHeader} backdrop-blur-sm border-b ${theme.borderHeader}`}>
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowQuestion19(false)}
                className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className={`text-sm ${theme.textSecondary}`}>19 de 19</span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            <div className={`mt-3 h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div className={`h-full ${theme.accentBg} rounded-full`} style={{ width: '100%' }} />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Alerta de importância */}
          <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-violet-900/30 border-violet-700' : 'bg-purple-50 border-purple-300'} border-2`}>
            <div className="flex items-start gap-3">
              <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'} flex-shrink-0`} />
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-violet-300' : 'text-purple-800'} mb-1`}>
                  Esta é a pergunta mais importante!
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-violet-400' : 'text-purple-700'}`}>
                  Sua resposta aqui vai ajudar a completar o quebra-cabeça e dar mais clareza sobre sua situação.
                  É opcional, mas faz toda a diferença.
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} p-6 sm:p-8`}>
            {/* Ícone e título */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100'}`}>
                <PenLine className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider ${theme.textSecondary}`}>
                Sua história
              </span>
            </div>

            {/* Pergunta */}
            <h2 className={`text-xl sm:text-2xl font-semibold ${theme.textPrimary} mb-4 leading-relaxed`}>
              Com suas próprias palavras, conte o que você está vivendo ou sentindo nessa relação.
            </h2>
            
            <p className={`text-sm ${theme.textSecondary} mb-6`}>
              Pode ser um episódio recente, um padrão que você percebeu, ou simplesmente como você se sente. 
              Não existe resposta certa ou errada. Escreva o que vier ao coração.
            </p>

            {/* Campo de texto */}
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Escreva aqui... (opcional)"
              className={`w-full h-40 sm:h-48 p-4 rounded-xl border resize-none ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-violet-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-colors`}
            />

            {/* Contador de caracteres */}
            <div className={`mt-2 text-xs ${theme.textSecondary} text-right`}>
              {freeText.length} caracteres
            </div>

            {/* Opção de áudio (Premium) */}
            <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'} border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${theme.textPrimary}`}>Prefere falar?</p>
                    <p className={`text-xs ${theme.textSecondary}`}>Grave um áudio e transcrevemos para você</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    Premium
                  </span>
                </div>
              </div>
              {!isPremium && (
                <Link href="/planos">
                  <button className={`mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium ${
                    isDarkMode ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  } transition-colors`}>
                    Desbloquear com plano Premium
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleFinishTest}
              className={`w-full py-4 px-6 ${theme.accentBg} hover:opacity-90 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2`}
            >
              {freeText.trim() ? 'Finalizar e ver meu resultado' : 'Finalizar teste'}
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSkipQuestion19}
              className={`w-full py-3 px-6 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} rounded-xl font-medium transition-colors`}
            >
              Pular esta pergunta
            </button>
          </div>

          {/* Dica */}
          <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/30' : 'bg-gray-50'}`}>
            <p className={`text-xs ${theme.textSecondary} text-center`}>
              💡 Quanto mais você compartilhar, mais personalizada será a análise do seu resultado.
            </p>
          </div>
        </main>
      </div>
    )
  }

  // ============================================================
  // QUESTIONÁRIO NORMAL (18 PERGUNTAS)
  // ============================================================
  const question = questions[currentQuestion]
  const categoryConfig = getCategoryConfig(question.category)
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className={`min-h-screen ${theme.bgMain}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${theme.bgHeader} backdrop-blur-sm border-b ${theme.borderHeader}`}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Badge de Termo de Consentimento no topo */}
          {termsAccepted && (
            <div className="flex justify-center mb-3">
              <TermsConsentBadge />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`p-2 ${theme.textSecondary} ${currentQuestion === 0 ? 'opacity-30 cursor-not-allowed' : `hover:${theme.textPrimary}`} ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <span className={`text-sm ${theme.textSecondary}`}>
              {currentQuestion + 1} de {questions.length}
            </span>
            
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {categoryConfig.label}
              </span>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className={`h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${theme.accentBg} rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Alerta de risco físico */}
        {question.category === 'fisico' && (
          <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-start gap-3">
              <ShieldAlert className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  <strong>Importante:</strong> Se você está em perigo imediato, ligue <strong>190</strong> (Polícia) ou <strong>180</strong> (Central da Mulher).
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} p-6 sm:p-8`}>
          {/* Categoria */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-medium uppercase tracking-wider ${theme.textSecondary}`}>
              {categoryConfig.description}
            </span>
          </div>

          {/* Pergunta */}
          <h2 className={`text-xl sm:text-2xl font-semibold ${theme.textPrimary} mb-8 leading-relaxed`}>
            {question.text}
          </h2>

          {/* Opções de resposta */}
          <div className="space-y-3">
            {ANSWER_OPTIONS.map((option) => {
              const isSelected = answers[question.id] === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isDarkMode 
                      ? `${isSelected ? 'bg-violet-600/30 border-violet-500' : 'bg-slate-800/50 border-slate-700'} hover:bg-violet-600/20 hover:border-violet-500`
                      : `${isSelected ? 'bg-purple-100 border-purple-400' : 'bg-white border-gray-200'} hover:bg-purple-50 hover:border-purple-400`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-medium ${theme.textPrimary}`}>{option.label}</span>
                      <span className={`text-sm ${theme.textSecondary} ml-2`}>— {option.description}</span>
                    </div>
                    {isSelected && (
                      <div className={`w-5 h-5 rounded-full ${theme.accentBg} flex items-center justify-center`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Info de progresso */}
          <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
            <span className={`text-sm ${theme.textSecondary}`}>
              {answeredCount} de {questions.length} respondidas
            </span>
            {currentQuestion === questions.length - 1 && answeredCount === questions.length - 1 && (
              <span className={`text-sm font-medium ${theme.accentText}`}>
                Última pergunta!
              </span>
            )}
          </div>
        </div>

        {/* Aviso de responsabilidade */}
        <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/30' : 'bg-gray-50'}`}>
          <p className={`text-xs ${theme.textSecondary} text-center`}>
            ⚠️ Lembre-se: você está relatando sua perspectiva. Este teste não é diagnóstico clínico.
          </p>
        </div>
      </main>
    </div>
  )
}
