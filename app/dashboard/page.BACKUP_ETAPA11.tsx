'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  BookOpen, 
  MessageCircle, 
  Target,
  ChevronRight, 
  ArrowRight,
  Shield, 
  Sparkles, 
  Settings,
  LogOut, 
  Heart, 
  TrendingUp,
  Calendar,
  FileText,
  Phone,
  AlertTriangle,
  Menu,
  X,
  Home,
  Clock,
  BarChart3,
  User,
  CheckCircle,
  Circle,
  Zap,
  Scale,
  Library,
  Eye,
  RefreshCw,
  CheckSquare,
  MapPin,
  Bell,
  HardDrive,
  Users,
  Lightbulb,
  ExternalLink,
  Sun,
  Moon,
  // TEMA 5: Ícones para trilhas
  Brain,
  Lock,
  ShieldAlert,
  PenLine
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarTag,
  RadarAlertBanner,
  RadarProgressWidget,
} from '@/components/ui/design-system'
import { useClarityProfile } from '@/hooks/useClarityProfile'
import { getClarityRecommendations, type ClarityRecommendation } from '@/lib/clarity-recommendations'
import { getCourseRecommendations, getOnboardingText, type CourseRecommendation } from '@/lib/clarity-course-recommendations'

// ============================================================================
// DASHBOARD V2 - RADAR NARCISISTA BR
// COMPLETO conforme as imagens de referência
// ============================================================================

interface DiaryEntry {
  id: string
  title: string
  content: string
  created_at: string
  intensity: number
}

interface UserStats {
  totalTests: number
  totalWeeks: number
  totalMessages: number
  daysActive: number
  diaryEntries: number
  currentLevel: number
  currentPoints: number
  pointsToNextLevel: number
}

interface JourneyTask {
  id: string
  label: string
  completed: boolean
  link: string
}

// Lista de emails admin - IGUAL DASHBOARD ORIGINAL
const ADMIN_EMAILS = ['etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com']

// ============================================================================
// SISTEMA DE TEMAS - CLARO (principal) e ESCURO
// ============================================================================
type ThemeMode = 'light' | 'dark'

const themes = {
  light: {
    // Backgrounds
    bg: 'bg-slate-50',
    bgSecondary: 'bg-white',
    bgTertiary: 'bg-gray-50',
    bgAccent: 'bg-purple-50',
    bgCard: 'bg-white',
    bgSidebar: 'bg-white',
    bgHeader: 'bg-white/80',
    bgInput: 'bg-gray-50',
    bgHover: 'hover:bg-gray-100',
    bgActive: 'bg-purple-100',
    // Borders
    border: 'border-gray-200',
    borderLight: 'border-gray-100',
    borderAccent: 'border-purple-200',
    // Text
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    textAccent: 'text-purple-600',
    // Emergency
    bgEmergency: 'bg-red-50',
    borderEmergency: 'border-red-200',
    textEmergency: 'text-red-700',
    // Cards
    cardShadow: 'shadow-sm',
    // Gamification
    bgLevel: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    // Stats
    statBg: 'bg-white',
    // Journey
    journeyDone: 'bg-green-50 border-green-200',
    journeyNext: 'bg-purple-50 border-purple-300 ring-2 ring-purple-200',
    journeyPending: 'bg-gray-50 border-gray-200',
  },
  dark: {
    // Backgrounds
    bg: 'bg-[#020617]',
    bgSecondary: 'bg-[#0F172A]',
    bgTertiary: 'bg-slate-800/50',
    bgAccent: 'bg-violet-950/30',
    bgCard: 'bg-slate-800/50',
    bgSidebar: 'bg-[#0F172A]',
    bgHeader: 'bg-[#0F172A]/95',
    bgInput: 'bg-slate-800',
    bgHover: 'hover:bg-slate-800',
    bgActive: 'bg-violet-600/20',
    // Borders
    border: 'border-slate-700/50',
    borderLight: 'border-slate-800/50',
    borderAccent: 'border-violet-500/30',
    // Text
    text: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-500',
    textAccent: 'text-violet-400',
    // Emergency
    bgEmergency: 'bg-red-950/50',
    borderEmergency: 'border-red-900/50',
    textEmergency: 'text-red-300',
    // Cards
    cardShadow: 'shadow-none',
    // Gamification
    bgLevel: 'bg-gradient-to-br from-violet-600 to-indigo-700',
    // Stats
    statBg: 'bg-slate-800/50',
    // Journey
    journeyDone: 'bg-green-950/30 border-green-900/30',
    journeyNext: 'bg-violet-950/50 border-violet-500/30 ring-2 ring-violet-500/30',
    journeyPending: 'bg-slate-800/50 border-slate-700/50',
  }
}

// Detectar tipo de dispositivo - IGUAL DASHBOARD ORIGINAL
type DeviceType = 'desktop' | 'mobile' | 'tablet'
function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPad|Android(?!.*Mobile)/i.test(ua)) return 'tablet'
  if (/iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile'
  return 'desktop'
}

export default function DashboardV2Page() {
  const [user, setUser] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  
  // TEMA: Claro como padrão
  const [theme, setTheme] = useState<ThemeMode>('light')
  const t = themes[theme] // Atalho para o tema atual
  
  // Carregar tema salvo do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') as ThemeMode
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    }
  }, [])
  
  // Alternar tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('dashboard-theme', newTheme)
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([])
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [hasSecurityPlan, setHasSecurityPlan] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    totalTests: 0,
    totalWeeks: 0,
    totalMessages: 0,
    daysActive: 0,
    diaryEntries: 0,
    currentLevel: 1,
    currentPoints: 0,
    pointsToNextLevel: 100,
  })
  const [journeyTasks, setJourneyTasks] = useState<JourneyTask[]>([
    { id: '1', label: 'Fazer Teste de Clareza', completed: false, link: '/teste-clareza' },
    { id: '2', label: 'Registrar 1º episódio', completed: false, link: '/diario' },
    { id: '3', label: 'Configurar Plano de Segurança', completed: false, link: '/seguranca-premium' },
  ])
  
  // ETAPA 6 - Estado do Triângulo
  const [triangleState, setTriangleState] = useState({
    hasClarity: false,
    lastClarityDate: null as string | null,
    diaryCount30d: 0,
    diaryIntense30d: 0,
    chatSummaryCount30d: 0,
    lastChatSummaryDate: null as string | null,
  })
  
  // ETAPA 7 - Estado do Plano de Segurança
  const [safetyPlanStatus, setSafetyPlanStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'READY'>('NOT_STARTED')
  const [showPhysicalRiskBanner, setShowPhysicalRiskBanner] = useState(true)
  
  // Hook para perfil de clareza e recomendações
  const { profile: clarityProfile, hasProfile: hasClarityProfile, isLoading: isLoadingProfile } = useClarityProfile()
  const [clarityRecommendations, setClarityRecommendations] = useState<ClarityRecommendation[]>([])
  
  // TEMA 5: Estado para trilhas recomendadas
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([])
  const [onboardingText, setOnboardingText] = useState<string>('')
  
  // Gerar recomendações quando perfil carregar
  useEffect(() => {
    if (clarityProfile && hasClarityProfile) {
      // Recomendações de ações
      const recommendations = getClarityRecommendations({
        globalZone: clarityProfile.globalZone,
        overallPercentage: clarityProfile.overallPercentage,
        topCategories: clarityProfile.topCategories as any,
        topAxes: clarityProfile.topAxes as any,
        hasPhysicalRisk: clarityProfile.hasPhysicalRisk,
      })
      setClarityRecommendations(recommendations.slice(0, 3)) // Top 3
      
      // TEMA 5: Recomendações de trilhas/cursos
      const courses = getCourseRecommendations(clarityProfile)
      setCourseRecommendations(courses)
      setOnboardingText(getOnboardingText(clarityProfile))
    }
  }, [clarityProfile, hasClarityProfile])

  const router = useRouter()
  const supabase = createClient()
  
  // Verificar se é admin - IGUAL DASHBOARD ORIGINAL
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail.toLowerCase()) : false
  
  // Saudação dinâmica - IGUAL DASHBOARD ORIGINAL
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // ============================================================
  // ESC PARA SAIR RÁPIDO (Desktop)
  // ============================================================
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      window.location.href = 'https://www.google.com'
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handleEscapeKey])

  // ============================================================
  // TRIPLE TAP PARA SAIR RÁPIDO (Mobile)
  // ============================================================
  const [tapCount, setTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)

  const handleTripleTap = useCallback(() => {
    const now = Date.now()
    const TAP_DELAY = 500 // 500ms entre taps
    
    if (now - lastTapTime < TAP_DELAY) {
      const newCount = tapCount + 1
      setTapCount(newCount)
      
      if (newCount >= 3) {
        // Triple tap detectado - sair rapidamente
        window.location.href = 'https://www.google.com'
      }
    } else {
      setTapCount(1)
    }
    setLastTapTime(now)
  }, [tapCount, lastTapTime])

  useEffect(() => {
    if (deviceType !== 'desktop') {
      document.addEventListener('touchstart', handleTripleTap)
      return () => {
        document.removeEventListener('touchstart', handleTripleTap)
      }
    }
  }, [deviceType, handleTripleTap])

  // ============================================================
  // CALCULAR DIAS CONSECUTIVOS - IGUAL DASHBOARD ORIGINAL
  // ============================================================
  const calcularDiasConsecutivos = async (userId: string): Promise<number> => {
    try {
      const [testesRes, entradasRes, mensagensRes] = await Promise.all([
        supabase.from('clarity_tests').select('created_at').eq('user_id', userId),
        supabase.from('journal_entries').select('created_at').eq('user_id', userId),
        supabase.from('ai_messages').select('created_at').eq('user_id', userId).eq('role', 'user')
      ])

      const todasDatas = new Set<string>()
      testesRes.data?.forEach(t => todasDatas.add(new Date(t.created_at).toISOString().split('T')[0]))
      entradasRes.data?.forEach(e => todasDatas.add(new Date(e.created_at).toISOString().split('T')[0]))
      mensagensRes.data?.forEach(m => todasDatas.add(new Date(m.created_at).toISOString().split('T')[0]))

      if (todasDatas.size === 0) return 0

      const datasOrdenadas = Array.from(todasDatas).sort().reverse()
      const hoje = new Date().toISOString().split('T')[0]
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      if (!datasOrdenadas.includes(hoje) && !datasOrdenadas.includes(ontem)) return 0

      let streak = 0
      let dataAtual = new Date(datasOrdenadas[0])
      
      for (const dataStr of datasOrdenadas) {
        const data = new Date(dataStr)
        const diffDias = Math.floor((dataAtual.getTime() - data.getTime()) / 86400000)
        if (diffDias <= 1) {
          streak++
          dataAtual = data
        } else {
          break
        }
      }
      return streak
    } catch (error) {
      console.error('Erro ao calcular dias consecutivos:', error)
      return 1
    }
  }

  // ============================================================
  // CARREGAR DADOS - COMPLETO IGUAL DASHBOARD ORIGINAL
  // ============================================================
  useEffect(() => {
    setDeviceType(getDeviceType())
    
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setUserEmail(user.email || null)
      
      // Carregar nome do perfil - IGUAL DASHBOARD ORIGINAL
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('user_id', user.id)
        .single()
      
      if (profile?.name) setUserName(profile.name)
      
      // Carregar todas as estatísticas - IGUAL DASHBOARD ORIGINAL
      const [testesRes, entradasRes, mensagensRes, planoRes] = await Promise.all([
        supabase.from('clarity_tests').select('*', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('ai_messages').select('id', { count: 'exact' }).eq('user_id', user.id).eq('role', 'user'),
        supabase.from('safety_plans').select('id').eq('user_id', user.id).limit(1)
      ])
      
      // Verificar plano de segurança
      const temPlano = (planoRes.data?.length || 0) > 0
      setHasSecurityPlan(temPlano)
      
      // ETAPA 7 - Buscar status detalhado do plano de segurança
      if (temPlano) {
        try {
          const safetyPlanRes = await fetch('/api/safety-plan')
          if (safetyPlanRes.ok) {
            const safetyData = await safetyPlanRes.json()
            setSafetyPlanStatus(safetyData.status || 'IN_PROGRESS')
          }
        } catch (err) {
          console.error('Erro ao buscar status do plano:', err)
        }
      }
      
      if (entradasRes.data) {
        setRecentEntries(entradasRes.data)
      }

      // Calcular dias consecutivos reais
      const diasConsecutivos = await calcularDiasConsecutivos(user.id)

      // Calcular XP igual dashboard original: testes*50 + entradas*20 + mensagens*5
      const xp = (testesRes.count || 0) * 50 + (entradasRes.count || 0) * 20 + (mensagensRes.count || 0) * 5
      const level = Math.floor(xp / 100) + 1

      setStats({
        totalTests: testesRes.count || 0,
        totalWeeks: Math.ceil((Date.now() - new Date(user.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        totalMessages: mensagensRes.count || 0,
        daysActive: diasConsecutivos,
        diaryEntries: entradasRes.count || 0,
        currentLevel: level,
        currentPoints: xp,
        pointsToNextLevel: 100 - (xp % 100),
      })

      // Atualizar tarefas da jornada com verificação real
      setJourneyTasks(prev => prev.map(task => {
        if (task.id === '1' && (testesRes.count || 0) > 0) return { ...task, completed: true }
        if (task.id === '2' && (entradasRes.count || 0) > 0) return { ...task, completed: true }
        if (task.id === '3' && temPlano) return { ...task, completed: true }
        return task
      }))
      
      // ETAPA 6 - Carregar estado do Triângulo
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const [clarityEntriesRes, diaryEntriesRes, chatSummaryRes] = await Promise.all([
        // Entradas clarity_baseline
        supabase
          .from('journal_entries')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('entry_type', 'clarity_baseline')
          .order('created_at', { ascending: false })
          .limit(1),
        // Entradas do diário nos últimos 30 dias
        supabase
          .from('journal_entries')
          .select('mood_intensity, created_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        // Resumos de chat nos últimos 30 dias
        supabase
          .from('journal_entries')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('entry_type', 'chat_summary')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
      ])
      
      const diaryEntries30d = diaryEntriesRes.data || []
      const chatSummaries30d = chatSummaryRes.data || []
      
      setTriangleState({
        hasClarity: (clarityEntriesRes.data?.length || 0) > 0,
        lastClarityDate: clarityEntriesRes.data?.[0]?.created_at || null,
        diaryCount30d: diaryEntries30d.length,
        diaryIntense30d: diaryEntries30d.filter(e => (e.mood_intensity || 0) >= 7).length,
        chatSummaryCount30d: chatSummaries30d.length,
        lastChatSummaryDate: chatSummaries30d[0]?.created_at || null,
      })
      
      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  // Loading acolhedor
  if (loading) {
    return (
      <div className={`min-h-screen ${t.bg} flex items-center justify-center`}>
        <div className="text-center max-w-xs">
          <div className="relative mx-auto mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 animate-pulse">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className={`text-lg font-semibold ${t.text} mb-2`}>Preparando seu espaço seguro</h2>
          <p className={`${t.textMuted} text-sm`}>Estamos organizando tudo para você...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${t.bg}`}>
      {/* ================================================================ */}
      {/* SIDEBAR - Desktop */}
      {/* ================================================================ */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 ${t.bgSidebar} border-r ${t.borderLight}`}>
        {/* Logo */}
        <div className={`p-6 border-b ${t.borderLight}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center relative">
              <Target className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className={`font-bold ${t.text}`}>Radar</h1>
              <h1 className={`font-bold ${t.text}`}>Narcisista</h1>
              <p className={`text-xs ${t.textMuted}`}>BR</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard" icon={Home} label="Início" active theme={theme} />
          <NavItem href="/diario" icon={BookOpen} label="Diário" theme={theme} />
          <NavItem href="/diario/timeline" icon={Clock} label="Linha do Tempo" theme={theme} />
          <NavItem href="/chat-premium" icon={MessageCircle} label="Coach de Clareza" theme={theme} />
          <NavItem href="/documentos-premium" icon={FileText} label="Documentos" theme={theme} />
          <NavItem href="/teste-clareza" icon={BarChart3} label="Teste de Clareza" theme={theme} />
          
          <div className={`pt-4 mt-4 border-t ${t.borderLight}`}>
            <NavItem href="/seguranca-premium" icon={Shield} label="Plano de Segurança" variant="danger" theme={theme} />
            <NavItem href="/manifesto" icon={Heart} label="Manifesto" theme={theme} />
            <NavItem href="/configuracoes-premium" icon={Settings} label="Configurações" theme={theme} />
            {isAdmin && (
              <NavItem href="/admin" icon={Settings} label="Admin" variant="admin" theme={theme} />
            )}
          </div>
        </nav>

        {/* Theme Toggle + User */}
        <div className={`p-4 border-t ${t.borderLight}`}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 text-sm ${t.textSecondary} ${t.bgHover} rounded-lg transition-colors border ${t.border}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-800'} rounded-full flex items-center justify-center`}>
              <User className={`w-5 h-5 ${t.textMuted}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t.textSecondary} truncate`}>
                {user?.email?.split('@')[0]}
              </p>
              <p className={`text-xs ${t.textMuted} truncate`}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${t.textMuted} hover:text-red-500 ${t.bgHover} rounded-lg transition-colors`}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MOBILE HEADER */}
      {/* ================================================================ */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${t.bgHeader} backdrop-blur-sm border-b ${t.borderLight}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold ${t.text}`}>Radar</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 ${t.textMuted} ${t.bgHover} rounded-lg transition-colors`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 ${t.textMuted} ${t.bgHover} rounded-lg`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className={`px-4 pb-4 space-y-1 ${t.bgSecondary} border-b ${t.borderLight}`}>
            <MobileNavItem href="/dashboard" icon={Home} label="Início" onClick={() => setMobileMenuOpen(false)} theme={theme} />
            <MobileNavItem href="/diario" icon={BookOpen} label="Diário" onClick={() => setMobileMenuOpen(false)} theme={theme} />
            <MobileNavItem href="/chat-premium" icon={MessageCircle} label="Coach" onClick={() => setMobileMenuOpen(false)} theme={theme} />
            <MobileNavItem href="/documentos-premium" icon={FileText} label="Documentos" onClick={() => setMobileMenuOpen(false)} theme={theme} />
            <MobileNavItem href="/seguranca-premium" icon={Shield} label="Segurança" variant="danger" onClick={() => setMobileMenuOpen(false)} theme={theme} />
          </nav>
        )}
      </header>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-8">
        <div className="px-4 lg:px-8 py-6 lg:py-8 pt-20 lg:pt-8 max-w-6xl mx-auto">
          
          {/* ============================================================ */}
          {/* 1. BARRA DE EMERGÊNCIA */}
          {/* ============================================================ */}
          <div className="mb-6">
            <Link href="/seguranca-premium">
              <div className={`${t.bgEmergency} border ${t.borderEmergency} rounded-xl p-3 flex items-center justify-between hover:opacity-90 transition-colors cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${t.textEmergency}`}>Em perigo agora?</p>
                    <p className={`text-xs ${theme === 'light' ? 'text-red-600/70' : 'text-red-400/70'}`}>
                      {deviceType === 'desktop' 
                        ? 'Pressione ESC para sair rapidamente'
                        : 'Toque 3x na tela para sair rapidamente'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-500">
                  {deviceType === 'desktop' ? (
                    <kbd className={`px-2 py-1 ${theme === 'light' ? 'bg-red-100' : 'bg-red-900/50'} rounded text-xs font-mono`}>ESC</kbd>
                  ) : (
                    <span className="text-xs">3x tap</span>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* 2. HERO - Saudação */}
          {/* ============================================================ */}
          <section className="mb-8">
            <div className={`${theme === 'light' ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100' : 'bg-gradient-to-br from-violet-950/50 to-indigo-950/50 border border-violet-800/30'} rounded-2xl p-6 lg:p-8`}>
              <div className="flex flex-col gap-4">
                <p className={`text-sm ${t.textAccent} font-medium`}>{getGreeting()}</p>
                <h2 className={`text-3xl lg:text-4xl font-bold ${t.text} flex items-center gap-2`}>
                  {userName || 'Você'}! <span className="text-4xl">👋</span>
                </h2>
                <p className={`${t.textSecondary} text-sm lg:text-base`}>
                  Este é seu espaço seguro. Aqui você encontra <span className={`${t.textAccent} font-medium`}>clareza</span> sem medo e confusão.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Link href="/chat-premium">
                    <button className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/25">
                      <MessageCircle className="w-4 h-4" />
                      Conversar com Coach IA
                    </button>
                  </Link>
                  <Link href="/diario">
                    <button className={`inline-flex items-center gap-2 px-5 py-3 ${t.bgSecondary} ${t.text} rounded-xl font-medium border ${t.border} hover:border-purple-300 transition-colors`}>
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      Registrar Episódio
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. SUAS FERRAMENTAS PRINCIPAIS */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className={`text-lg font-semibold ${t.text} mb-4`}>Suas Ferramentas Principais</h3>
            <p className={`text-sm ${t.textMuted} mb-4`}>Acesse rápido as ferramentas mais importantes</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ToolCard 
                icon={Target} 
                title="Teste de Clareza" 
                description="Entenda sua situação em 5-10 minutos"
                href="/teste-clareza"
                color="violet"
                theme={theme}
              />
              <ToolCard 
                icon={BookOpen} 
                title="Diário de Episódios" 
                description="Registre o que acontece com você"
                href="/diario"
                color="green"
                theme={theme}
              />
              <ToolCard 
                icon={MessageCircle} 
                title="Coach de Clareza" 
                description="Apoio 24/7 para suas dúvidas"
                href="/chat-premium"
                color="blue"
                theme={theme}
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3.5. ESTADO DO TRIÂNGULO - ETAPA 6 */}
          {/* ============================================================ */}
          <section className="mb-8">
            <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${theme === 'light' ? 'bg-gradient-to-br from-purple-100 to-indigo-100' : 'bg-gradient-to-br from-violet-600/20 to-indigo-600/20'} rounded-xl flex items-center justify-center`}>
                    <Scale className={`w-5 h-5 ${theme === 'light' ? 'text-purple-600' : 'text-violet-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>Estado do Triângulo</h3>
                    <p className={`text-xs ${t.textMuted}`}>Clareza ⇄ Diário ⇄ Chat</p>
                  </div>
                </div>
                {/* Status geral */}
                {triangleState.hasClarity && triangleState.diaryCount30d > 0 && triangleState.chatSummaryCount30d > 0 ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400'}`}>
                    ✅ Triângulo Ativo
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400'}`}>
                    ⚠️ Incompleto
                  </span>
                )}
              </div>
              
              {/* Grid 3 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Clareza */}
                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-purple-50 border border-purple-100' : 'bg-violet-950/30 border border-violet-800/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className={`w-4 h-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                    <span className={`text-sm font-medium ${t.text}`}>Clareza</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${t.textMuted}`}>Perfil base:</span>
                      <span className={`text-xs font-medium ${triangleState.hasClarity ? (theme === 'light' ? 'text-green-600' : 'text-green-400') : (theme === 'light' ? 'text-red-600' : 'text-red-400')}`}>
                        {triangleState.hasClarity ? '✓ Salvo' : '✗ Pendente'}
                      </span>
                    </div>
                    {triangleState.lastClarityDate && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${t.textMuted}`}>Último:</span>
                        <span className={`text-xs ${t.textSecondary}`}>
                          {new Date(triangleState.lastClarityDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Diário */}
                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-green-50 border border-green-100' : 'bg-green-950/30 border border-green-800/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className={`w-4 h-4 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={`text-sm font-medium ${t.text}`}>Diário</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${t.textMuted}`}>Últimos 30 dias:</span>
                      <span className={`text-xs font-medium ${triangleState.diaryCount30d > 0 ? (theme === 'light' ? 'text-green-600' : 'text-green-400') : (theme === 'light' ? 'text-red-600' : 'text-red-400')}`}>
                        {triangleState.diaryCount30d} episódios
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${t.textMuted}`}>Intensos (≥7):</span>
                      <span className={`text-xs font-medium ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                        {triangleState.diaryIntense30d}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Chat */}
                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-indigo-50 border border-indigo-100' : 'bg-indigo-950/30 border border-indigo-800/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className={`w-4 h-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                    <span className={`text-sm font-medium ${t.text}`}>Chat</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${t.textMuted}`}>Resumos (30d):</span>
                      <span className={`text-xs font-medium ${triangleState.chatSummaryCount30d > 0 ? (theme === 'light' ? 'text-green-600' : 'text-green-400') : (theme === 'light' ? 'text-red-600' : 'text-red-400')}`}>
                        {triangleState.chatSummaryCount30d}
                      </span>
                    </div>
                    {triangleState.lastChatSummaryDate && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${t.textMuted}`}>Último:</span>
                        <span className={`text-xs ${t.textSecondary}`}>
                          {new Date(triangleState.lastChatSummaryDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mensagem de status */}
              <div className={`p-3 rounded-lg ${
                triangleState.hasClarity && triangleState.diaryCount30d > 0 && triangleState.chatSummaryCount30d > 0
                  ? (theme === 'light' ? 'bg-green-50 border border-green-200' : 'bg-green-950/30 border border-green-800/30')
                  : (theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-950/30 border border-amber-800/30')
              }`}>
                <p className={`text-xs ${
                  triangleState.hasClarity && triangleState.diaryCount30d > 0 && triangleState.chatSummaryCount30d > 0
                    ? (theme === 'light' ? 'text-green-700' : 'text-green-300')
                    : (theme === 'light' ? 'text-amber-700' : 'text-amber-300')
                }`}>
                  {triangleState.hasClarity && triangleState.diaryCount30d > 0 && triangleState.chatSummaryCount30d > 0
                    ? '✅ Triângulo ativo – o Radar tem visão completa da sua jornada. Continue registrando para manter a clareza!'
                    : `⚠️ Triângulo incompleto – falta ${!triangleState.hasClarity ? 'salvar Perfil de Clareza' : ''} ${!triangleState.hasClarity && (triangleState.diaryCount30d === 0 || triangleState.chatSummaryCount30d === 0) ? ', ' : ''} ${triangleState.diaryCount30d === 0 ? 'registrar no Diário' : ''} ${triangleState.diaryCount30d === 0 && triangleState.chatSummaryCount30d === 0 ? ' e ' : ''} ${triangleState.chatSummaryCount30d === 0 ? 'salvar resumo do Chat' : ''}.`
                  }
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3.6. PLANO DE SEGURANÇA - ETAPA 7 */}
          {/* ============================================================ */}
          
          {/* Banner de alerta de risco físico */}
          {hasClarityProfile && clarityProfile?.hasPhysicalRisk && showPhysicalRiskBanner && (
            <section className="mb-4">
              <div className={`p-4 rounded-xl border-2 ${
                safetyPlanStatus === 'READY' 
                  ? (theme === 'light' ? 'bg-green-50 border-green-300' : 'bg-green-950/30 border-green-700')
                  : safetyPlanStatus === 'IN_PROGRESS'
                    ? (theme === 'light' ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/30 border-amber-700')
                    : (theme === 'light' ? 'bg-red-50 border-red-300' : 'bg-red-950/30 border-red-700')
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      safetyPlanStatus === 'READY'
                        ? (theme === 'light' ? 'bg-green-100' : 'bg-green-900/50')
                        : safetyPlanStatus === 'IN_PROGRESS'
                          ? (theme === 'light' ? 'bg-amber-100' : 'bg-amber-900/50')
                          : (theme === 'light' ? 'bg-red-100' : 'bg-red-900/50')
                    }`}>
                      <Shield className={`w-5 h-5 ${
                        safetyPlanStatus === 'READY'
                          ? (theme === 'light' ? 'text-green-600' : 'text-green-400')
                          : safetyPlanStatus === 'IN_PROGRESS'
                            ? (theme === 'light' ? 'text-amber-600' : 'text-amber-400')
                            : (theme === 'light' ? 'text-red-600' : 'text-red-400')
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        safetyPlanStatus === 'READY'
                          ? (theme === 'light' ? 'text-green-800' : 'text-green-300')
                          : safetyPlanStatus === 'IN_PROGRESS'
                            ? (theme === 'light' ? 'text-amber-800' : 'text-amber-300')
                            : (theme === 'light' ? 'text-red-800' : 'text-red-300')
                      }`}>
                        {safetyPlanStatus === 'READY' 
                          ? '✅ Seu Plano de Segurança está pronto'
                          : safetyPlanStatus === 'IN_PROGRESS'
                            ? '⚠️ Risco físico detectado – revise seu Plano'
                            : '🚨 Risco físico detectado – crie seu Plano de Segurança'
                        }
                      </h4>
                      <p className={`text-sm mt-1 ${
                        safetyPlanStatus === 'READY'
                          ? (theme === 'light' ? 'text-green-700' : 'text-green-400')
                          : safetyPlanStatus === 'IN_PROGRESS'
                            ? (theme === 'light' ? 'text-amber-700' : 'text-amber-400')
                            : (theme === 'light' ? 'text-red-700' : 'text-red-400')
                      }`}>
                        {safetyPlanStatus === 'READY' 
                          ? 'Mantenha-o atualizado e revise periodicamente.'
                          : safetyPlanStatus === 'IN_PROGRESS'
                            ? 'Seu plano está incompleto. Complete os campos essenciais.'
                            : 'Seu Teste de Clareza indicou sinais de risco. Prepare-se para situações de emergência.'
                        }
                      </p>
                      <Link 
                        href="/plano-seguranca"
                        className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${
                          safetyPlanStatus === 'READY'
                            ? (theme === 'light' ? 'text-green-700 hover:text-green-800' : 'text-green-400 hover:text-green-300')
                            : safetyPlanStatus === 'IN_PROGRESS'
                              ? (theme === 'light' ? 'text-amber-700 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300')
                              : (theme === 'light' ? 'text-red-700 hover:text-red-800' : 'text-red-400 hover:text-red-300')
                        }`}
                      >
                        {safetyPlanStatus === 'READY' ? 'Revisar plano' : safetyPlanStatus === 'IN_PROGRESS' ? 'Completar plano' : 'Criar plano agora'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPhysicalRiskBanner(false)}
                    className={`p-1 rounded ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
                  >
                    <X className={`w-4 h-4 ${t.textMuted}`} />
                  </button>
                </div>
              </div>
            </section>
          )}
          
          {/* Card Plano de Segurança */}
          <section className="mb-8">
            <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    safetyPlanStatus === 'READY'
                      ? (theme === 'light' ? 'bg-green-100' : 'bg-green-900/30')
                      : safetyPlanStatus === 'IN_PROGRESS'
                        ? (theme === 'light' ? 'bg-amber-100' : 'bg-amber-900/30')
                        : (theme === 'light' ? 'bg-red-100' : 'bg-red-900/30')
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      safetyPlanStatus === 'READY'
                        ? (theme === 'light' ? 'text-green-600' : 'text-green-400')
                        : safetyPlanStatus === 'IN_PROGRESS'
                          ? (theme === 'light' ? 'text-amber-600' : 'text-amber-400')
                          : (theme === 'light' ? 'text-red-600' : 'text-red-400')
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>Plano de Segurança</h3>
                    <p className={`text-sm ${t.textMuted}`}>
                      {safetyPlanStatus === 'READY' 
                        ? 'Pronto para emergências'
                        : safetyPlanStatus === 'IN_PROGRESS'
                          ? 'Em progresso – complete os campos'
                          : 'Não iniciado – configure agora'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    safetyPlanStatus === 'READY'
                      ? (theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400')
                      : safetyPlanStatus === 'IN_PROGRESS'
                        ? (theme === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400')
                        : (theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-900/30 text-red-400')
                  }`}>
                    {safetyPlanStatus === 'READY' ? '✅ Pronto' : safetyPlanStatus === 'IN_PROGRESS' ? '🔄 Em progresso' : '⚠️ Não iniciado'}
                  </span>
                  <Link 
                    href="/plano-seguranca"
                    className={`p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-700 hover:bg-slate-600'} transition-colors`}
                  >
                    <ArrowRight className={`w-5 h-5 ${t.textSecondary}`} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 4. O QUE VOCÊ VEIO BUSCAR AQUI HOJE? */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className={`text-lg font-semibold ${t.text} mb-2`}>O que você veio buscar aqui hoje?</h3>
            <p className={`text-sm ${t.textMuted} mb-4`}>Escolha o caminho que faz mais sentido agora</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card Clareza */}
              <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 ${theme === 'light' ? 'bg-purple-100' : 'bg-violet-600/20'} rounded-xl flex items-center justify-center`}>
                    <Target className={`w-5 h-5 ${theme === 'light' ? 'text-purple-600' : 'text-violet-400'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${t.text}`}>Clareza</h4>
                    <p className={`text-xs ${t.textMuted}`}>Entender o que está acontecendo</p>
                  </div>
                </div>
                <p className={`text-sm ${t.textSecondary} mb-4`}>
                  Se você está confusa, com invalidação, gaslighting ou manipulação, comece por aqui.
                </p>
                <div className="space-y-2">
                  <CheckItemThemed label="Teste" href="/teste-clareza" theme={theme} />
                  <CheckItemThemed label="Escala 0-10" href="/diario" theme={theme} />
                  <CheckItemThemed label="Biblioteca" href="/biblioteca" theme={theme} />
                </div>
              </div>

              {/* Card Registro */}
              <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 ${theme === 'light' ? 'bg-green-100' : 'bg-green-600/20'} rounded-xl flex items-center justify-center`}>
                    <BookOpen className={`w-5 h-5 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${t.text}`}>Registro</h4>
                    <p className={`text-xs ${t.textMuted}`}>Organizar episódios e padrões</p>
                  </div>
                </div>
                <p className={`text-sm ${t.textSecondary} mb-4`}>
                  Se você quer documentar o que acontece, criar uma linha do tempo ou ver padrões.
                </p>
                <div className="space-y-2">
                  <CheckItemThemed label="Diário" href="/diario" theme={theme} />
                  <CheckItemThemed label="Timeline" href="/diario/timeline" theme={theme} />
                </div>
              </div>

              {/* Card Proteção */}
              <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 ${theme === 'light' ? 'bg-red-100' : 'bg-red-600/20'} rounded-xl flex items-center justify-center`}>
                    <Shield className={`w-5 h-5 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${t.text}`}>Proteção</h4>
                    <p className={`text-xs ${t.textMuted}`}>Planejar segurança e saída</p>
                  </div>
                </div>
                <p className={`text-sm ${t.textSecondary} mb-4`}>
                  Se você está em risco, precisa de um plano de fuga ou quer se preparar.
                </p>
                <div className="space-y-2">
                  <CheckItemThemed label="Plano de Fuga" href="/seguranca-premium" theme={theme} />
                  <CheckItemThemed label="Alertas" href="/seguranca-premium" theme={theme} />
                  <CheckItemThemed label="Plano de Hoje" href="/seguranca-premium" theme={theme} />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 5. SUA JORNADA + GAMIFICAÇÃO */}
          {/* ============================================================ */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tarefas da Jornada */}
              <RadarCard variant="soft" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      Sua Jornada
                    </h3>
                    <p className="text-xs text-gray-500">Complete sua jornada de clareza</p>
                  </div>
                  <RadarTag tone="accent" size="sm">
                    {journeyTasks.filter(t => t.completed).length}/{journeyTasks.length}
                  </RadarTag>
                </div>
                <div className="space-y-3">
                  {journeyTasks.map((task) => (
                    <Link key={task.id} href={task.link}>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        task.completed 
                          ? 'bg-green-950/30 border border-green-900/30' 
                          : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                        <span className={`text-sm ${task.completed ? 'text-green-300 line-through' : 'text-gray-300'}`}>
                          {task.label}
                        </span>
                        {!task.completed && <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />}
                      </div>
                    </Link>
                  ))}
                </div>
              </RadarCard>

              {/* Gamificação - Nível e Pontos */}
              <RadarCard variant="accent" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Seu Progresso
                  </h3>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    {/* Círculo de progresso */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#1E293B"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#7C3AED"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(stats.currentPoints % 100) * 3.52} 352`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-400">Nível</span>
                      <span className="text-3xl font-bold text-white">{stats.currentLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-400">{stats.currentPoints}</p>
                  <p className="text-xs text-gray-500">pontos totais</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Faltam <span className="text-violet-400 font-medium">{stats.pointsToNextLevel}</span> pontos para o próximo nível
                  </p>
                </div>
              </RadarCard>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 5.5. RECOMENDAÇÕES BASEADAS NO TESTE DE CLAREZA */}
          {/* ============================================================ */}
          {hasClarityProfile && clarityRecommendations.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Recomendado para você
                  </h3>
                  <p className="text-sm text-gray-400">
                    Com base no seu Teste de Clareza de {clarityProfile?.daysAgo === 0 ? 'hoje' : `há ${clarityProfile?.daysAgo} dias`}
                  </p>
                </div>
                <Link href="/teste-clareza/resultado" className="text-xs text-violet-400 hover:text-violet-300">
                  Ver resultado completo →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clarityRecommendations.map((rec) => (
                  <Link key={rec.id} href={rec.link || '#'}>
                    <div className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                      rec.priority === 'alta' 
                        ? 'bg-gradient-to-br from-red-950/50 to-orange-950/50 border-red-800/50 hover:border-red-700' 
                        : rec.priority === 'media'
                        ? 'bg-gradient-to-br from-violet-950/50 to-purple-950/50 border-violet-800/50 hover:border-violet-700'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'alta' ? 'bg-red-900/50' : 
                          rec.priority === 'media' ? 'bg-violet-900/50' : 'bg-slate-700/50'
                        }`}>
                          {rec.type === 'alerta' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                          {rec.type === 'acao' && <Target className="w-4 h-4 text-violet-400" />}
                          {rec.type === 'modulo' && <BookOpen className="w-4 h-4 text-blue-400" />}
                          {rec.type === 'recurso' && <Phone className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm truncate">{rec.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1">{rec.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 5.6. TRILHAS RECOMENDADAS - TEMA 5 */}
          {/* ============================================================ */}
          {hasClarityProfile && courseRecommendations.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Trilhas para você
                  </h3>
                  <p className="text-sm text-gray-400">
                    {onboardingText}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {courseRecommendations.map((rec) => (
                  <div 
                    key={rec.path.id}
                    className={`p-4 rounded-xl border ${rec.path.bgColor.replace('bg-', 'bg-').replace('100', '950/30')} border-slate-700/50`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${rec.path.bgColor.replace('100', '900/50')}`}>
                        {rec.path.icon === 'Brain' && <Brain className={`w-6 h-6 ${rec.path.color}`} />}
                        {rec.path.icon === 'Lock' && <Lock className={`w-6 h-6 ${rec.path.color}`} />}
                        {rec.path.icon === 'ShieldAlert' && <ShieldAlert className={`w-6 h-6 ${rec.path.color}`} />}
                        {rec.path.icon === 'Heart' && <Heart className={`w-6 h-6 ${rec.path.color}`} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{rec.path.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{rec.path.subtitle}</p>
                        
                        {/* Módulos sugeridos */}
                        <div className="flex flex-wrap gap-2">
                          {rec.suggestedModules.slice(0, 3).map((mod) => (
                            <Link 
                              key={mod.id} 
                              href={mod.href}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                mod.priority === 'alta' 
                                  ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70' 
                                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70'
                              }`}
                            >
                              {mod.icon === 'BookOpen' && <BookOpen className="w-3 h-3" />}
                              {mod.icon === 'PenLine' && <PenLine className="w-3 h-3" />}
                              {mod.icon === 'MessageCircle' && <MessageCircle className="w-3 h-3" />}
                              {mod.icon === 'Shield' && <Shield className="w-3 h-3" />}
                              {mod.icon === 'Phone' && <Phone className="w-3 h-3" />}
                              {mod.icon === 'CheckSquare' && <CheckSquare className="w-3 h-3" />}
                              {mod.icon === 'Scale' && <Scale className="w-3 h-3" />}
                              {mod.icon === 'Users' && <Users className="w-3 h-3" />}
                              {mod.icon === 'FileText' && <FileText className="w-3 h-3" />}
                              {mod.title}
                              <span className="text-gray-500">• {mod.duration}</span>
                            </Link>
                          ))}
                        </div>
                        
                        {/* Razão da recomendação */}
                        <p className="text-xs text-gray-500 mt-2">
                          {rec.reason}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* 6. ESTATÍSTICAS */}
          {/* ============================================================ */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Target} value={stats.totalTests} label="Testes" />
              <StatCard icon={Calendar} value={stats.totalWeeks} label="Semanas" />
              <StatCard icon={MessageCircle} value={stats.totalMessages} label="Mensagens" />
              <StatCard icon={Clock} value={stats.daysActive} label="Dias ativos" />
            </div>
          </section>

          {/* ============================================================ */}
          {/* 7. ESTOU LIDANDO COM... */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Estou lidando com...</h3>
            <p className="text-sm text-gray-400 mb-4">Clique no que você está enfrentando para ver ferramentas específicas</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ProblemButton label="Invalidação" color="pink" href="/biblioteca?tema=invalidacao" />
              <ProblemButton label="Gaslighting" color="purple" href="/biblioteca?tema=gaslighting" />
              <ProblemButton label="Manipulação" color="blue" href="/biblioteca?tema=manipulacao" />
              <ProblemButton label="Agressão Aberta" color="red" href="/biblioteca?tema=agressao" />
            </div>
          </section>

          {/* ============================================================ */}
          {/* 8. ATALHOS + FERRAMENTAS DE CLAREZA */}
          {/* ============================================================ */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Atalhos Rápidos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Atalhos Rápidos
                </h3>
                <div className="space-y-2">
                  <QuickLink href="/teste-clareza" icon={Target} label="Testes" />
                  <QuickLink href="/diario" icon={BookOpen} label="Diário" />
                  <QuickLink href="/diario" icon={FileText} label="Novo Registro" />
                  <QuickLink href="/diario" icon={Scale} label="Escala 0-10" />
                </div>
              </div>

              {/* Ferramentas de Clareza */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-400" />
                  Ferramentas de Clareza
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <ToolIcon icon={Eye} label="Sala" href="/sala" />
                  <ToolIcon icon={Scale} label="Escala" href="/diario" />
                  <ToolIcon icon={RefreshCw} label="Espelho" href="/espelho" />
                  <ToolIcon icon={Library} label="Biblioteca" href="/biblioteca" />
                  <ToolIcon icon={RefreshCw} label="Ciclo" href="/ciclo" />
                  <ToolIcon icon={CheckSquare} label="Checklist" href="/checklist" />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 9. ÚLTIMAS ENTRADAS + SEGURANÇA */}
          {/* ============================================================ */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Últimas Entradas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Últimas Entradas
                  </h3>
                  <Link href="/diario/timeline" className="text-xs text-violet-400 hover:underline">
                    Ver mais
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentEntries.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      Nenhum registro ainda. <Link href="/diario" className="text-violet-400 hover:underline">Criar primeiro</Link>
                    </p>
                  ) : (
                    recentEntries.slice(0, 3).map((entry) => (
                      <Link key={entry.id} href={`/diario/${entry.id}`}>
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors border-l-4 border-violet-500">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {(entry.title || 'Sem título').substring(0, 2).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}, {new Date(entry.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Segurança */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  Segurança
                </h3>
                <div className="space-y-2">
                  <SecurityLink icon={Shield} label="Plano" href="/seguranca-premium" />
                  <SecurityLink icon={MapPin} label="Plano de Fuga" href="/seguranca-premium" />
                  <SecurityLink icon={HardDrive} label="Reg. Digital" href="/documentos-premium" />
                  <SecurityLink icon={Eye} label="Evidência" href="/documentos-premium" />
                  <SecurityLink icon={Phone} label="Recursos" href="/seguranca-premium" />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 10. BANNER INCLUSIVO */}
          {/* ============================================================ */}
          <section className="mb-8">
            {/* Banner amarelo/dourado - IGUAL IMAGEM BRANCA */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-200 mb-1">Este é um espaço para TODOS</h3>
                  <p className="text-sm text-yellow-100/70">
                    Aqui não há julgamento por gênero, profissão, situação financeira, religião ou qualquer outra condição. 
                    Se você está sofrendo abuso ou confusão, você merece ajuda.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 11. DICAS RÁPIDAS */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Dicas Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <p className="text-sm text-gray-300 mb-2">• Use o diário para registrar episódios assim que acontecem</p>
                <p className="text-sm text-gray-300">• Releia o Teste de Clareza periodicamente para acompanhar sua evolução</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <p className="text-sm text-gray-300 mb-2">• O Coach IA está disponível 24/7 para suas dúvidas</p>
                <p className="text-sm text-gray-300">• Suas configurações de privacidade podem ser ajustadas a qualquer momento</p>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 12. LEMBRETE IMPORTANTE */}
          {/* ============================================================ */}
          <section className="mb-8">
            <RadarAlertBanner type="warning" title="Lembrete importante">
              <p>
                "Às vezes acreditamos em um mentiroso e culpamos um inocente."
                O Radar organiza a SUA perspectiva. Não é diagnóstico, não é prova judicial, não é juiz.
              </p>
            </RadarAlertBanner>
          </section>

          {/* ============================================================ */}
          {/* 13. CONTATOS DE EMERGÊNCIA */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Precisa de ajuda agora?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EmergencyContact number="188" label="CVV - Valorização da Vida" description="24h, ligação gratuita" />
              <EmergencyContact number="190" label="Polícia" description="Risco físico imediato" />
              <EmergencyContact number="180" label="Central da Mulher" description="Violência doméstica" />
            </div>
          </section>

          {/* ============================================================ */}
          {/* 14. FOOTER */}
          {/* ============================================================ */}
          <footer className="text-center py-8 border-t border-slate-800/50">
            <p className="text-xs text-gray-500 mb-4">
              Radar Narcisista BR © 2025 — Ferramenta de apoio, não substitui profissionais.
            </p>
            
            {/* Botões de ajuda */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-xs text-gray-500">Como posso ajudar você?</span>
            </div>
            {/* 4 botões - IGUAL IMAGEM BRANCA */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link href="/diario">
                <button className="px-4 py-2 bg-slate-800 text-gray-300 text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Diário
                </button>
              </Link>
              <Link href="/diario/timeline">
                <button className="px-4 py-2 bg-slate-800 text-gray-300 text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" /> Dados/Rel.us
                </button>
              </Link>
              <Link href="/documentos-premium">
                <button className="px-4 py-2 bg-slate-800 text-gray-300 text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Relatório
                </button>
              </Link>
              <Link href="/chat-premium">
                <button className="px-4 py-2 bg-slate-800 text-gray-300 text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" /> Dúvidas
                </button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-xs mt-4">
              <Link href="/manifesto" className="text-gray-400 hover:text-violet-400 transition-colors">
                Manifesto
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/termos" className="text-gray-400 hover:text-violet-400 transition-colors">
                Termos
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/privacidade" className="text-gray-400 hover:text-violet-400 transition-colors">
                Privacidade
              </Link>
            </div>
          </footer>
        </div>
      </main>

      {/* ================================================================ */}
      {/* MOBILE BOTTOM NAV */}
      {/* ================================================================ */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 ${t.bgHeader} backdrop-blur-sm border-t ${t.borderLight} z-40`}>
        <div className="flex items-center justify-around py-2">
          <BottomNavItem href="/dashboard" icon={Home} label="Início" active theme={theme} />
          <BottomNavItem href="/diario" icon={BookOpen} label="Diário" theme={theme} />
          <BottomNavItem href="/chat-premium" icon={MessageCircle} label="Coach" theme={theme} />
          <BottomNavItem href="/seguranca-premium" icon={Shield} label="Segurança" theme={theme} />
        </div>
      </nav>
    </div>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES COM SUPORTE A TEMA
// ============================================================================

function NavItem({ href, icon: Icon, label, active = false, variant = 'default', theme = 'light' }: { 
  href: string; icon: any; label: string; active?: boolean; variant?: 'default' | 'danger' | 'admin'; theme?: ThemeMode
}) {
  const isLight = theme === 'light'
  const getStyles = () => {
    if (active) return isLight ? 'bg-purple-100 text-purple-700' : 'bg-violet-600/20 text-violet-400'
    if (variant === 'danger') return 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
    if (variant === 'admin') return isLight ? 'text-purple-600 hover:bg-purple-50 bg-purple-50' : 'text-purple-400 hover:bg-purple-950/30 bg-purple-900/20'
    return isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
  }
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getStyles()}`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function MobileNavItem({ href, icon: Icon, label, variant = 'default', onClick, theme = 'light' }: { 
  href: string; icon: any; label: string; variant?: 'default' | 'danger'; onClick?: () => void; theme?: ThemeMode
}) {
  const isLight = theme === 'light'
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      variant === 'danger' 
        ? 'text-red-500 hover:bg-red-50' 
        : isLight 
          ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
    }`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function BottomNavItem({ href, icon: Icon, label, active = false, theme = 'light' }: { 
  href: string; icon: any; label: string; active?: boolean; theme?: ThemeMode
}) {
  const isLight = theme === 'light'
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
      active 
        ? 'text-purple-600' 
        : isLight ? 'text-gray-500' : 'text-gray-500'
    }`}>
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Link>
  )
}

function ToolCard({ icon: Icon, title, description, href, color, theme = 'light' }: {
  icon: any; title: string; description: string; href: string; color: 'violet' | 'green' | 'blue'; theme?: ThemeMode
}) {
  const isLight = theme === 'light'
  const colors = {
    violet: isLight ? 'bg-purple-100 text-purple-600' : 'bg-violet-600/20 text-violet-400',
    green: isLight ? 'bg-green-100 text-green-600' : 'bg-green-600/20 text-green-400',
    blue: isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-600/20 text-blue-400',
  }
  return (
    <Link href={href}>
      <div className={`p-4 ${isLight ? 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'} border rounded-xl transition-all cursor-pointer h-full`}>
        <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
        <h4 className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'} text-sm mb-1`}>{title}</h4>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{description}</p>
      </div>
    </Link>
  )
}

function CheckItem({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <CheckSquare className="w-4 h-4 text-violet-400" />
        {label}
      </div>
    </Link>
  )
}

function CheckItemThemed({ label, href, theme = 'light' }: { label: string; href: string; theme?: ThemeMode }) {
  const isLight = theme === 'light'
  return (
    <Link href={href}>
      <div className={`flex items-center gap-2 text-sm ${isLight ? 'text-gray-600 hover:text-purple-600' : 'text-gray-400 hover:text-white'} transition-colors`}>
        <CheckSquare className={`w-4 h-4 ${isLight ? 'text-purple-500' : 'text-violet-400'}`} />
        {label}
      </div>
    </Link>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
      <Icon className="w-5 h-5 text-gray-500 mx-auto mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function ProblemButton({ label, color, href }: { label: string; color: 'pink' | 'purple' | 'blue' | 'red'; href: string }) {
  const colors = {
    pink: 'bg-pink-600/20 text-pink-400 border-pink-900/50 hover:bg-pink-600/30',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-900/50 hover:bg-purple-600/30',
    blue: 'bg-blue-600/20 text-blue-400 border-blue-900/50 hover:bg-blue-600/30',
    red: 'bg-red-600/20 text-red-400 border-red-900/50 hover:bg-red-600/30',
  }
  return (
    <Link href={href}>
      <div className={`p-4 rounded-xl border text-center transition-colors cursor-pointer ${colors[color]}`}>
        <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  )
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-800 transition-colors">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
    </Link>
  )
}

function ToolIcon({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link href={href}>
      <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center hover:bg-slate-800 transition-colors cursor-pointer">
        <Icon className="w-5 h-5 text-violet-400 mx-auto mb-1" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    </Link>
  )
}

function SecurityLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg hover:bg-red-950/30 transition-colors">
        <Icon className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-300">{label}</span>
      </div>
    </Link>
  )
}

function EmergencyContact({ number, label, description }: { number: string; label: string; description: string }) {
  return (
    <a href={`tel:${number}`}>
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 hover:bg-slate-800/50 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{number}</p>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </a>
  )
}
