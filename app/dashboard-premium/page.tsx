'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  User
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarTag,
  RadarAlertBanner,
  RadarProgressWidget,
} from '@/components/ui/design-system'

// ============================================================================
// DASHBOARD PREMIUM - RADAR NARCISISTA BR
// Design: Dark mode, minimalista, premium
// UX: Três estados emocionais suportados
// ============================================================================

export default function DashboardPremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    diaryEntries: 0,
    daysThisMonth: 0,
    totalDays: 30,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Carregar estatísticas básicas
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
      
      setStats(prev => ({
        ...prev,
        diaryEntries: count || 0,
        daysThisMonth: count || 0,
      }))
      
      setLoading(false)
    }
    
    checkUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* ================================================================ */}
      {/* SIDEBAR - Desktop */}
      {/* ================================================================ */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#0F172A] border-r border-slate-800/50">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Radar Narcisista</h1>
              <p className="text-xs text-gray-500">BR</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard-premium" icon={Home} label="Início" active />
          <NavItem href="/diario-premium" icon={BookOpen} label="Diário" />
          <NavItem href="/timeline-premium" icon={Clock} label="Linha do Tempo" />
          <NavItem href="/chat-premium" icon={MessageCircle} label="Coach de Clareza" />
          <NavItem href="/documentos-premium" icon={FileText} label="Documentos" />
          <NavItem href="/teste-clareza" icon={BarChart3} label="Teste de Clareza" />
          
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <NavItem href="/seguranca-premium" icon={Shield} label="Plano de Segurança" variant="danger" />
            <NavItem href="/manifesto" icon={Heart} label="Manifesto" />
            <NavItem href="/configuracoes-premium" icon={Settings} label="Configurações" />
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MOBILE HEADER */}
      {/* ================================================================ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Radar</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-1 bg-[#0F172A] border-b border-slate-800/50">
            <MobileNavItem href="/dashboard-premium" icon={Home} label="Início" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem href="/diario-premium" icon={BookOpen} label="Diário" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem href="/chat-premium" icon={MessageCircle} label="Coach" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem href="/documentos-premium" icon={FileText} label="Documentos" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavItem href="/seguranca-premium" icon={Shield} label="Segurança" variant="danger" onClick={() => setMobileMenuOpen(false)} />
          </nav>
        )}
      </header>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}
      <main className="lg:ml-64 min-h-screen">
        <div className="px-4 lg:px-8 py-6 lg:py-8 pt-20 lg:pt-8 max-w-5xl mx-auto">
          
          {/* ============================================================ */}
          {/* EMERGENCY BAR */}
          {/* ============================================================ */}
          <div className="mb-6">
            <Link href="/seguranca-premium">
              <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3 flex items-center justify-between hover:bg-red-950/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-300">Em perigo agora?</p>
                    <p className="text-xs text-red-400/70">Acesse seu plano de segurança</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-xs hidden sm:inline">ESC para sair rápido</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* HERO SECTION */}
          {/* ============================================================ */}
          <section className="mb-8">
            <RadarCard variant="accent" padding="lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <span className="text-sm font-medium text-violet-400">Bem-vindo(a) de volta</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                    Você está em um espaço para organizar a sua história,{' '}
                    <span className="text-violet-400">não para julgar ninguém.</span>
                  </h2>
                  <p className="text-gray-400 text-sm lg:text-base">
                    O Radar te ajuda a enxergar padrões, registrar o que acontece e buscar clareza.
                    Lembre-se: isso é a SUA perspectiva.
                  </p>
                </div>
              </div>
            </RadarCard>
          </section>

          {/* ============================================================ */}
          {/* MAIN ACTIONS - 3 CARDS */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">O que você quer fazer agora?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Entender minha situação */}
              <Link href="/teste-clareza">
                <RadarCard variant="default" padding="md" hover>
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-violet-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Entender minha situação</h4>
                    <p className="text-sm text-gray-400 mb-4 flex-1">
                      Em 5–10 minutos você responde perguntas e ganha um mapa da situação.
                    </p>
                    <div className="flex items-center text-violet-400 text-sm font-medium">
                      Fazer Teste de Clareza
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </RadarCard>
              </Link>

              {/* Card 2: Registrar um episódio */}
              <Link href="/diario-premium">
                <RadarCard variant="default" padding="md" hover>
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Registrar um episódio</h4>
                    <p className="text-sm text-gray-400 mb-4 flex-1">
                      Escreva o que aconteceu, do seu jeito. Depois a gente organiza.
                    </p>
                    <div className="flex items-center text-green-400 text-sm font-medium">
                      Registrar agora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </RadarCard>
              </Link>

              {/* Card 3: Falar com o Coach */}
              <Link href="/chat-premium">
                <RadarCard variant="default" padding="md" hover>
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Falar com o Coach de Clareza</h4>
                    <p className="text-sm text-gray-400 mb-4 flex-1">
                      Converse com uma IA treinada para ser um amigo responsável, não um juiz.
                    </p>
                    <div className="flex items-center text-blue-400 text-sm font-medium">
                      Abrir chat
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </RadarCard>
              </Link>
            </div>
          </section>

          {/* ============================================================ */}
          {/* PROGRESS WIDGET */}
          {/* ============================================================ */}
          <section className="mb-8">
            <RadarCard variant="soft" padding="md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Este mês</p>
                    <p className="text-xl font-bold text-white">
                      {stats.daysThisMonth} {stats.daysThisMonth === 1 ? 'registro' : 'registros'}
                    </p>
                  </div>
                </div>
                <div className="flex-1 max-w-xs">
                  <RadarProgressWidget
                    title="Dias com clareza"
                    value={stats.daysThisMonth}
                    total={30}
                    label="Registrar ajuda a enxergar padrões"
                    color="violet"
                  />
                </div>
                <Link href="/timeline-premium">
                  <RadarButton variant="secondary" size="sm">
                    Ver linha do tempo
                    <ChevronRight className="w-4 h-4" />
                  </RadarButton>
                </Link>
              </div>
            </RadarCard>
          </section>

          {/* ============================================================ */}
          {/* QUICK LINKS */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Atalhos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickLink href="/diario-premium" icon={BookOpen} label="Meu Diário" />
              <QuickLink href="/timeline-premium" icon={TrendingUp} label="Linha do Tempo" />
              <QuickLink href="/documentos-premium" icon={FileText} label="Gerar PDF" />
              <QuickLink href="/configuracoes-premium" icon={Settings} label="Configurações" />
            </div>
          </section>

          {/* ============================================================ */}
          {/* RESPONSIBILITY REMINDER */}
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
          {/* EMERGENCY CONTACTS */}
          {/* ============================================================ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Precisa de ajuda agora?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EmergencyContact
                number="188"
                label="CVV - Valorização da Vida"
                description="24h, ligação gratuita"
              />
              <EmergencyContact
                number="190"
                label="Polícia"
                description="Risco físico imediato"
              />
              <EmergencyContact
                number="180"
                label="Central da Mulher"
                description="Violência doméstica"
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* FOOTER */}
          {/* ============================================================ */}
          <footer className="text-center py-8 border-t border-slate-800/50">
            <p className="text-xs text-gray-500 mb-2">
              Radar Narcisista BR © 2025 — Ferramenta de apoio, não substitui profissionais.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-sm border-t border-slate-800/50 z-40">
        <div className="flex items-center justify-around py-2">
          <BottomNavItem href="/dashboard-premium" icon={Home} label="Início" active />
          <BottomNavItem href="/diario-premium" icon={BookOpen} label="Diário" />
          <BottomNavItem href="/chat-premium" icon={MessageCircle} label="Coach" />
          <BottomNavItem href="/seguranca-premium" icon={Shield} label="Segurança" />
        </div>
      </nav>
    </div>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  active = false,
  variant = 'default'
}: { 
  href: string
  icon: any
  label: string
  active?: boolean
  variant?: 'default' | 'danger'
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
        ${active 
          ? 'bg-violet-600/20 text-violet-400' 
          : variant === 'danger'
            ? 'text-red-400 hover:bg-red-950/30'
            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function MobileNavItem({ 
  href, 
  icon: Icon, 
  label,
  variant = 'default',
  onClick
}: { 
  href: string
  icon: any
  label: string
  variant?: 'default' | 'danger'
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
        ${variant === 'danger'
          ? 'text-red-400 hover:bg-red-950/30'
          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function BottomNavItem({ 
  href, 
  icon: Icon, 
  label, 
  active = false 
}: { 
  href: string
  icon: any
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center gap-1 px-4 py-1 transition-colors
        ${active ? 'text-violet-400' : 'text-gray-500'}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Link>
  )
}

function QuickLink({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string
  icon: any
  label: string
}) {
  return (
    <Link href={href}>
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
      </div>
    </Link>
  )
}

function EmergencyContact({ 
  number, 
  label, 
  description 
}: { 
  number: string
  label: string
  description: string
}) {
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
