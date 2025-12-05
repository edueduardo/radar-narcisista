'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Target, ArrowRight, BookOpen, MessageCircle, Shield, PenLine,
  AlertTriangle, ChevronDown, ChevronUp, HelpCircle, Home, 
  LayoutDashboard, AlertCircle, Brain, Lock, Heart, ShieldAlert, 
  Users, RefreshCw, Phone, Download, Printer, Copy, FileCheck,
  MousePointerClick, FileDown, Save, Eye, CheckCircle2, Loader2,
  Sparkles, UserPlus, Mail, KeyRound, LogIn
} from 'lucide-react'

import {
  calculateUnifiedResult,
  getZoneConfig,
  getAxisConfig,
  getCategoryConfig,
  getAxisLevelDescription,
  type UnifiedResult,
} from '@/lib/clarity-unified-config'
import { PROBLEMS, getToolsByProblem } from '@/lib/tools-config'

// Componentes
import TermsConsentBadge from '@/components/TermsConsentBadge'
import ClarityResultPDF, { type ClarityResultPDFHandle } from '@/components/ClarityResultPDF'
import Explanation3Voices, { AxisExplanation, CategoryExplanation } from '@/components/Explanation3Voices'

// =============================================================================
// RESULTADO DO TESTE DE CLAREZA - VERSÃO 2
// Nova UX com Sistema de 3 Vozes (Colinho / Profissional / Defesa)
// =============================================================================

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  invalidacao: AlertCircle,
  gaslighting: Brain,
  controle: Lock,
  isolamento: Users,
  emocional: Heart,
  fisico: ShieldAlert,
}

export default function ResultadoV2() {
  const [result, setResult] = useState<UnifiedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [testDate, setTestDate] = useState<string>('')
  const [diaryStats, setDiaryStats] = useState<any>(null)
  
  // Estados para accordions
  const [expandedAxis, setExpandedAxis] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showExportSection, setShowExportSection] = useState(false)
  const [showAboutTest, setShowAboutTest] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  
  // Estados para "Guardar ou Não"
  const [isSavedAsBase, setIsSavedAsBase] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [rawAnswers, setRawAnswers] = useState<Record<string, number> | null>(null)
  const [userNarrative, setUserNarrative] = useState<string>('')
  
  // Estados para GATE DE LOGIN (bloqueia resultado até criar conta)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Ref para acessar função de download do componente PDF
  const pdfRef = useRef<ClarityResultPDFHandle>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadResult()
  }, [])

  const loadResult = async () => {
    try {
      // Primeiro: verificar se usuário está logado
      const { data: { user } } = await supabase.auth.getUser()
      
      const savedResult = localStorage.getItem('radar-test-result')
      if (savedResult) {
        const parsed = JSON.parse(savedResult)
        setResult(parsed.result)
        setRawAnswers(parsed.answers || null)
        setUserNarrative(parsed.userNarrative || '')
        setTestDate(new Date(parsed.completedAt).toLocaleDateString('pt-BR'))
        
        // SE NÃO ESTÁ LOGADO → MOSTRAR GATE DE LOGIN
        if (!user) {
          setShowAuthGate(true)
          setLoading(false)
          return
        }
        
        // Está logado → carregar dados extras
        await loadDiaryStats(user.id)
        await checkIfSavedAsBase(user.id)
        
        setLoading(false)
        return
      }

      // Sem resultado no localStorage - verificar no banco
      if (!user) {
        router.push('/teste-clareza')
        return
      }

      const { data: tests, error } = await supabase
        .from('clarity_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error
      if (!tests || tests.length === 0) {
        router.push('/teste-clareza')
        return
      }

      const test = tests[0]
      setTestDate(new Date(test.created_at).toLocaleDateString('pt-BR'))
      setRawAnswers(test.raw_answers || null)
      setUserNarrative(test.user_narrative || '')
      setIsSavedAsBase(test.is_profile_base || false)

      if (test.raw_answers) {
        const calculatedResult = calculateUnifiedResult(test.raw_answers)
        setResult(calculatedResult)
      }

      await loadDiaryStats(user.id)
    } catch (error) {
      console.error('Erro ao carregar resultado:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const checkIfSavedAsBase = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clarity_tests')
        .select('id, is_profile_base')
        .eq('user_id', userId)
        .eq('is_profile_base', true)
        .limit(1)
      
      if (!error && data && data.length > 0) {
        setIsSavedAsBase(true)
      }
    } catch (e) {
      console.error('Erro ao verificar perfil base:', e)
    }
  }
  
  const handleSaveAsBase = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirecionar para login com retorno
        localStorage.setItem('radar-redirect-after-login', '/teste-clareza/resultado')
        router.push('/login?redirect=/teste-clareza/resultado')
        return
      }
      
      // Chamar API para salvar como base
      const response = await fetch('/api/clarity/activate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: rawAnswers,
          userNarrative,
          result,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar')
      }
      
      setIsSavedAsBase(true)
      // Limpar localStorage após salvar no banco
      localStorage.removeItem('radar-test-result')
      
    } catch (error: any) {
      console.error('Erro ao salvar como base:', error)
      setSaveError(error.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const loadDiaryStats = async (userId: string) => {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('id, tags, impact_score, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error || !entries || entries.length === 0) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentEntries = entries.filter(e => new Date(e.created_at) > thirtyDaysAgo)

      const tagCounts: Record<string, number> = {}
      entries.forEach(entry => {
        (entry.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }))

      const avgImpact = entries.reduce((sum, e) => sum + (e.impact_score || 0), 0) / entries.length

      setDiaryStats({
        totalEntries: entries.length,
        recentEntries: recentEntries.length,
        topTags,
        avgImpact: Math.round(avgImpact * 10) / 10,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const getAxisColor = (axis: string) => {
    switch (axis) {
      case 'nevoa': return 'from-purple-500 to-purple-600'
      case 'medo': return 'from-blue-500 to-blue-600'
      case 'limites': return 'from-rose-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'baixo': return 'bg-green-900/50 text-green-400 border-green-700'
      case 'moderado': return 'bg-yellow-900/50 text-yellow-400 border-yellow-700'
      case 'alto': return 'bg-red-900/50 text-red-400 border-red-700'
      default: return 'bg-gray-800 text-gray-400 border-gray-700'
    }
  }

  // =========================================================================
  // FUNÇÃO DE AUTENTICAÇÃO (GATE DE LOGIN)
  // =========================================================================
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    
    try {
      if (authMode === 'signup') {
        // Criar conta
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/teste-clareza/resultado`
          }
        })
        
        if (error) throw error
        
        if (data.user) {
          // Conta criada com sucesso - fechar gate e mostrar resultado
          setShowAuthGate(false)
          // Recarregar para pegar dados do usuário
          loadResult()
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        
        if (error) throw error
        
        if (data.user) {
          setShowAuthGate(false)
          loadResult()
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error)
      if (error.message?.includes('Invalid login')) {
        setAuthError('E-mail ou senha incorretos')
      } else if (error.message?.includes('already registered')) {
        setAuthError('Este e-mail já está cadastrado. Faça login.')
        setAuthMode('login')
      } else if (error.message?.includes('Password should be')) {
        setAuthError('A senha deve ter pelo menos 6 caracteres')
      } else {
        setAuthError(error.message || 'Erro ao autenticar. Tente novamente.')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-violet-400 animate-pulse" />
          </div>
          <p className="text-gray-400">Carregando seu resultado...</p>
        </div>
      </div>
    )
  }

  // Sem resultado
  if (!result) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Resultado não encontrado</h2>
          <p className="text-gray-400 mb-6">Parece que você ainda não fez o teste.</p>
          <Link
            href="/teste-clareza"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors"
          >
            <Target className="w-5 h-5" />
            Fazer Teste de Clareza
          </Link>
        </div>
      </div>
    )
  }

  // =========================================================================
  // GATE DE LOGIN - Bloqueia resultado até criar conta
  // =========================================================================
  if (showAuthGate) {
    const zoneConfig = getZoneConfig(result.globalZone)
    
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Preview borrado do resultado */}
          <div className="relative mb-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-md bg-slate-900/60 z-10" />
            <div className="relative z-0 opacity-30">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${zoneConfig.bgColor} ${zoneConfig.borderColor} border`}>
                  <Target className={`w-5 h-5 ${zoneConfig.color}`} />
                  <span className={`font-bold ${zoneConfig.color}`}>{zoneConfig.title}</span>
                </div>
                <p className="mt-3 text-gray-400">Seu resultado está pronto!</p>
              </div>
            </div>
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-violet-400" />
            </div>
          </div>
          
          {/* Card de autenticação */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-violet-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {authMode === 'signup' ? 'Crie sua conta gratuita' : 'Entre na sua conta'}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                {authMode === 'signup' 
                  ? 'Para ver seu resultado e salvar seu progresso'
                  : 'Acesse sua conta para ver o resultado'
                }
              </p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={authMode === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {authError && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl">
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {authMode === 'signup' ? 'Criando conta...' : 'Entrando...'}
                  </>
                ) : (
                  <>
                    {authMode === 'signup' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                    {authMode === 'signup' ? 'Criar Conta e Ver Resultado' : 'Entrar e Ver Resultado'}
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'login' : 'signup')
                  setAuthError(null)
                }}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                {authMode === 'signup' 
                  ? 'Já tem conta? Faça login'
                  : 'Não tem conta? Crie agora'
                }
              </button>
            </div>
            
            {/* Benefícios */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-gray-500 text-center mb-3">Ao criar sua conta você terá:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Resultado salvo</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Diário de episódios</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>Coach IA</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>100% gratuito</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Aviso de segurança */}
          <p className="mt-4 text-center text-xs text-gray-500">
            🔒 Seus dados são criptografados e protegidos
          </p>
        </div>
      </div>
    )
  }

  const zoneConfig = getZoneConfig(result.globalZone)
  const overallPct = Math.round(result.overallPercentage * 100)

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header Simples - Responsivo */}
      <header className="bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
            <span className="font-semibold text-white text-sm sm:text-base">Resultado</span>
          </div>
          
          <span className="text-xs sm:text-sm text-gray-400">{testDate}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        
        {/* ============================================================= */}
        {/* SECTION 1 – CABEÇALHO CALMO */}
        {/* ============================================================= */}
        <section className="mb-5 sm:mb-6 md:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              Seu Mapa de Clareza
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
              <span className="block sm:inline">Resultado do Teste • {testDate}</span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">{result.overallScore}/{result.maxOverallScore} ({overallPct}%)</span>
            </p>
          </div>

          {/* Badge de Zona */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${zoneConfig.bgColor} ${zoneConfig.borderColor} border-2`}>
              {result.globalZone === 'atencao' && <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${zoneConfig.color}`} />}
              {result.globalZone === 'alerta' && <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${zoneConfig.color}`} />}
              {result.globalZone === 'vermelha' && <ShieldAlert className={`w-5 h-5 sm:w-6 sm:h-6 ${zoneConfig.color}`} />}
              <span className={`text-base sm:text-lg font-bold ${zoneConfig.color}`}>{zoneConfig.title}</span>
            </div>
          </div>

          {/* Alerta de Risco Físico */}
          {result.hasPhysicalRisk && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-red-900/40 border-red-700 border-2">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-red-800 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 sm:w-7 sm:h-7 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-300 text-base sm:text-lg mb-1.5 sm:mb-2">
                    ⚠️ Possível risco à sua segurança física
                  </h3>
                  <p className="text-red-400 text-sm sm:text-base mb-3 sm:mb-4">
                    Sua segurança vem antes de qualquer teste. Esta tela é só um mapa para você buscar apoio com mais clareza.
                  </p>
                  <Link 
                    href="/plano-seguranca" 
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    Criar Plano de Segurança
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* CTA Principal */}
          {!result.hasPhysicalRisk && (
            <div className="flex justify-center">
              <a 
                href="#proximos-passos"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                Ver próximos passos sugeridos
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          )}
        </section>

        {/* ============================================================= */}
        {/* SECTION 2 – SUA SITUAÇÃO GERAL (NARRATIVA + 3 VOZES) */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">1.</span>
                Sua situação geral
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Entenda o que seu resultado significa, explicado de 3 formas diferentes.
              </p>
            </div>
            
            {/* Botão Baixar PDF no topo - ATIVO */}
            <button
              onClick={async () => {
                if (pdfRef.current) {
                  setIsDownloadingPDF(true)
                  try {
                    await pdfRef.current.downloadPDF()
                  } finally {
                    setIsDownloadingPDF(false)
                  }
                }
              }}
              disabled={isDownloadingPDF}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 disabled:cursor-wait text-white rounded-lg sm:rounded-xl font-medium transition-colors whitespace-nowrap shadow-lg shadow-emerald-500/20 text-sm sm:text-base w-full sm:w-auto"
            >
              {isDownloadingPDF ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {isDownloadingPDF ? 'Gerando...' : 'Baixar PDF Completo'}
            </button>
          </div>

          <div className="bg-slate-900/80 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6">
            <Explanation3Voices
              topicId="geral"
              context={{
                score: result.overallScore,
                zona: result.globalZone,
                episodios30d: diaryStats?.recentEntries || 0,
                impactoMedio: diaryStats?.avgImpact || 0,
                padroesPrincipais: result.highlightedProblems
              }}
              showMicroAction={true}
            />
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 3 – EIXOS PRINCIPAIS (VISUAL + ACCORDION) */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">2.</span>
            Como isso aparece no seu dia a dia
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
            Três dimensões que mostram onde a relação está te afetando mais.
          </p>

          {/* Barras Visuais */}
          <div className="grid gap-3 sm:gap-4 mb-4 sm:mb-6">
            {result.axisScores.map((axis) => (
              <div 
                key={axis.axis}
                className="bg-slate-900/80 rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4"
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="font-semibold text-white text-sm sm:text-base">{axis.label}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg font-bold text-white">{Math.round(axis.percentage * 100)}%</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium border ${getLevelBadge(axis.level)}`}>
                      {axis.level.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 sm:h-3">
                  <div 
                    className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${getAxisColor(axis.axis)} transition-all duration-500`}
                    style={{ width: `${axis.percentage * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Accordions com 3 Vozes */}
          <div className="space-y-2 sm:space-y-3">
            {result.axisScores.map((axis) => {
              const isExpanded = expandedAxis === axis.axis
              const axisLabels: Record<string, { title: string; desc: string }> = {
                nevoa: { title: '🧠 Névoa mental', desc: 'Confusão e dúvida sobre sua própria percepção' },
                medo: { title: '😰 Medo e tensão', desc: 'Estar sempre em alerta, pisando em ovos' },
                limites: { title: '🛡️ Limites', desc: 'O quanto seus limites são respeitados' }
              }
              const config = axisLabels[axis.axis] || { title: axis.label, desc: '' }

              return (
                <div key={axis.axis} className="bg-slate-900/60 rounded-lg sm:rounded-xl border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedAxis(isExpanded ? null : axis.axis)}
                    className="w-full px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{config.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{config.desc}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-3 sm:px-5 pb-3 sm:pb-5 border-t border-slate-700/50">
                      <div className="pt-3 sm:pt-4">
                        <AxisExplanation
                          axis={axis.axis as 'nevoa' | 'medo' | 'limites'}
                          percentage={axis.percentage}
                          level={axis.level}
                          context={{
                            episodios30d: diaryStats?.recentEntries || 0,
                            impactoMedio: diaryStats?.avgImpact || 0
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 4 – CATEGORIAS DE RISCO (GRID DE CARDS) */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">3.</span>
            Onde isso pega mais forte
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
            <MousePointerClick className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400 flex-shrink-0" />
            <span>Clique em cada categoria para entender melhor.</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {result.categoryScores.map((cat) => {
              const catConfig = getCategoryConfig(cat.category)
              const IconComponent = CATEGORY_ICONS[cat.category] || AlertCircle
              const isHighlighted = cat.percentage >= 0.4
              const isExpanded = expandedCategory === cat.category
              const pct = Math.round(cat.percentage * 100)

              return (
                <div 
                  key={cat.category}
                  className={`bg-slate-900/80 rounded-lg sm:rounded-xl border overflow-hidden transition-all ${
                    isHighlighted ? 'border-amber-700' : 'border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                    className="w-full p-3 sm:p-4 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-slate-800 flex-shrink-0">
                        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${catConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-xs sm:text-sm truncate">{cat.label}</h3>
                      </div>
                      <span className={`text-base sm:text-lg font-bold flex-shrink-0 ${
                        pct >= 66 ? 'text-red-400' : pct >= 33 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {pct}%
                      </span>
                      {/* Ícone indicando que é clicável */}
                      <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 mb-1.5 sm:mb-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full ${
                          pct >= 66 ? 'bg-red-500' : pct >= 33 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {isHighlighted && (
                      <p className="text-[10px] sm:text-xs text-amber-400">⚠️ Merece atenção</p>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-slate-700/50">
                      <div className="pt-3 sm:pt-4">
                        <CategoryExplanation
                          category={cat.category}
                          percentage={cat.percentage}
                          context={{
                            episodios30d: diaryStats?.recentEntries || 0,
                            impactoMedio: diaryStats?.avgImpact || 0
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 5 – SEUS REGISTROS (DIÁRIO) */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">4.</span>
            Seus registros até agora
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
            Dados do seu diário que complementam o teste.
          </p>

          {diaryStats && diaryStats.totalEntries > 0 ? (
            <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border-indigo-900 rounded-xl sm:rounded-2xl border p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-slate-900/80 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-400">{diaryStats.totalEntries}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">Episódios</p>
                </div>
                <div className="bg-slate-900/80 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">{diaryStats.recentEntries}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">Últimos 30 dias</p>
                </div>
                <div className="bg-slate-900/80 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-rose-400">{diaryStats.avgImpact}/5</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">Impacto médio</p>
                </div>
                <div className="bg-slate-900/80 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">{diaryStats.topTags.length}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">Padrões</p>
                </div>
              </div>

              {diaryStats.topTags.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Padrões que mais se repetem:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {diaryStats.topTags.map(({ tag, count }: { tag: string; count: number }) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-900/50 text-purple-300 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {tag}
                        <span className="bg-purple-800 px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs">{count}x</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                O diário ajuda a identificar padrões ao longo do tempo. Quanto mais você registra, mais clareza você ganha.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  href="/diario/novo"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  <PenLine className="w-4 h-4" />
                  Registrar novo episódio
                </Link>
                <Link
                  href="/diario/timeline"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  Ver linha do tempo
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border-blue-900 rounded-xl sm:rounded-2xl border p-4 sm:p-6">
              <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
                <div className="p-3 sm:p-4 bg-blue-900 rounded-xl sm:rounded-2xl">
                  <PenLine className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Comece a registrar seus episódios</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    O diário ajuda a identificar padrões e complementa seu teste
                  </p>
                </div>
                <Link
                  href="/diario/novo"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <PenLine className="w-4 h-4 sm:w-5 sm:h-5" />
                  Criar registro
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================= */}
        {/* SECTION 6 – EXPORTAÇÃO E CUIDADOS */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">5.</span>
            Guardar ou compartilhar
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
            Exporte seu resultado para mostrar a um profissional ou guardar para você.
          </p>

          <div id="export-section" className="bg-slate-900/80 rounded-xl sm:rounded-2xl border border-slate-700 overflow-hidden scroll-mt-20">
            <button
              onClick={() => setShowExportSection(!showExportSection)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="font-semibold text-white text-sm sm:text-base">Opções de exportação</span>
              </div>
              {showExportSection ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </button>

            {showExportSection && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-slate-700/50">
                <div className="pt-3 sm:pt-4">
                  <ClarityResultPDF 
                    ref={pdfRef}
                    result={result} 
                    testDate={testDate} 
                    isDarkMode={true} 
                  />
                  
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-900/20 border border-amber-800/50 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-amber-300">
                      <strong>Sobre a verificação:</strong> O documento gerado inclui um código de verificação (hash) e horário de geração. Isso ajuda a mostrar que o documento não foi alterado depois, mas <strong>NÃO é laudo nem decisão judicial</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              ⚠️ Este teste é uma ferramenta de autoconhecimento. Não substitui psicoterapia, avaliação clínica ou decisão judicial.
            </p>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 6.5 – GUARDAR OU NÃO (DECISÃO DO USUÁRIO) */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">6.</span>
            O que fazer com este resultado?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
            Você decide se quer guardar ou apenas visualizar agora.
          </p>

          {isSavedAsBase ? (
            /* Estado: JÁ SALVO */
            <div className="bg-gradient-to-r from-emerald-950 to-green-950 border-emerald-800 rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-emerald-900 rounded-lg sm:rounded-xl flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-300 text-base sm:text-lg mb-1">
                    ✅ Resultado salvo como base do seu Radar
                  </h3>
                  <p className="text-emerald-400/80 text-sm sm:text-base mb-3">
                    Este teste agora alimenta seu diário, Coach IA e recomendações personalizadas.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full text-xs sm:text-sm">
                      <Sparkles className="w-3 h-3" /> Diário conectado
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full text-xs sm:text-sm">
                      <MessageCircle className="w-3 h-3" /> Coach IA com contexto
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Estado: NÃO SALVO - Mostrar opções */
            <div className="bg-slate-900/80 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Opção 1: Guardar */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/50 to-purple-950/50 border-2 border-violet-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-violet-900 rounded-lg">
                      <Save className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Guardar como base</h3>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4">
                    Este resultado vai alimentar seu diário, Coach IA e recomendações. Você não precisa recontar tudo.
                  </p>
                  
                  {saveError && (
                    <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded-lg">
                      <p className="text-red-400 text-xs">{saveError}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSaveAsBase}
                    disabled={isSaving}
                    className="w-full py-2.5 sm:py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-wait text-white rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar e usar como base
                      </>
                    )}
                  </button>
                </div>

                {/* Opção 2: Só visualizar */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">Só visualizar agora</h3>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4">
                    O resultado fica só nesta página. Se você fechar, precisará refazer o teste.
                  </p>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Você já está visualizando. Pode baixar o PDF acima se quiser guardar offline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nota sobre login */}
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-xs sm:text-sm text-gray-400 text-center flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Para guardar, você precisa estar logada. Se não tiver conta, criaremos uma para você.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================= */}
        {/* PRÓXIMOS PASSOS (ANCHOR) */}
        {/* ============================================================= */}
        <section id="proximos-passos" className="mb-6 sm:mb-8 md:mb-10 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            🚀 Próximos Passos Recomendados
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/diario/novo"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-blue-900 bg-blue-950/50 hover:border-blue-700 transition-colors"
            >
              <div className="p-2 sm:p-3 bg-slate-900 rounded-lg sm:rounded-xl flex-shrink-0">
                <PenLine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base">Registrar Episódio</h3>
                <p className="text-xs sm:text-sm text-gray-400">Documente situações</p>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
            </Link>
            
            <Link
              href="/chat"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-emerald-900 bg-emerald-950/50 hover:border-emerald-700 transition-colors"
            >
              <div className="p-2 sm:p-3 bg-slate-900 rounded-lg sm:rounded-xl flex-shrink-0">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base">Coach IA</h3>
                <p className="text-xs sm:text-sm text-gray-400">Apoio 24/7</p>
              </div>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
            </Link>
            
            {result.globalZone === 'vermelha' && (
              <Link
                href="/plano-seguranca"
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-red-900 bg-red-950/50 hover:border-red-700 transition-colors sm:col-span-2"
              >
                <div className="p-2 sm:p-3 bg-slate-900 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm sm:text-base">Criar Plano de Segurança</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Importante: organize sua proteção</p>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
              </Link>
            )}
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 7 – RODAPÉ FUNCIONAL */}
        {/* ============================================================= */}
        <section className="mb-6 sm:mb-8">
          {/* Navegação */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-900/80 rounded-lg sm:rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              <span className="text-xs sm:text-sm text-gray-400">Dashboard</span>
            </Link>
            
            <Link
              href="/teste-clareza"
              className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-900/80 rounded-lg sm:rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              <span className="text-xs sm:text-sm text-gray-400">Refazer Teste</span>
            </Link>
            
            <Link
              href="/biblioteca"
              className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-900/80 rounded-lg sm:rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              <span className="text-xs sm:text-sm text-gray-400">Biblioteca</span>
            </Link>
            
            <Link
              href="/diario/timeline"
              className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-900/80 rounded-lg sm:rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
              <span className="text-xs sm:text-sm text-gray-400">Timeline</span>
            </Link>
          </div>

          {/* Contatos de Emergência */}
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-400 text-center mb-2 sm:mb-3">
              Em situação de perigo imediato, procure ajuda:
            </p>
            <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
              <a href="tel:190" className="text-xs sm:text-sm font-medium text-red-400 hover:text-red-300">
                190 - Polícia
              </a>
              <a href="tel:180" className="text-xs sm:text-sm font-medium text-pink-400 hover:text-pink-300">
                180 - Mulher
              </a>
              <a href="tel:188" className="text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300">
                188 - CVV
              </a>
            </div>
          </div>

          {/* Disclaimer Final */}
          <div className="p-3 sm:p-4 bg-amber-900/20 border border-amber-800/50 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-amber-300 text-center leading-relaxed">
              <strong>Ferramenta de autoconhecimento.</strong> Este teste ajuda a identificar padrões, mas não substitui avaliação de profissional de saúde mental nem constitui diagnóstico.
            </p>
          </div>

          {/* Termo de Consentimento */}
          <div className="flex justify-center">
            <TermsConsentBadge />
          </div>
        </section>

        {/* Link para voltar à versão original */}
        <div className="text-center pb-6 sm:pb-8">
          <Link 
            href="/teste-clareza/resultado" 
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-400 underline"
          >
            ← Voltar para versão original
          </Link>
        </div>
      </main>
    </div>
  )
}
