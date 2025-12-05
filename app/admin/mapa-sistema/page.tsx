'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Map, 
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Bot,
  FileText,
  Shield,
  Users,
  CreditCard,
  MessageSquare,
  BookOpen,
  TestTube,
  Mic,
  Image,
  Bell,
  Globe,
  Zap,
  Server,
  HardDrive,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  UserCog,
  Layers,
  Layout,
  Code,
  Cpu,
  Settings
} from 'lucide-react'
import {
  getAllAdminFeatures,
  getAdminFeaturesByGroup,
  getRegistryStats,
  type AdminFeature,
  type AdminFeatureGroup
} from '@/app/admin/admin-features-registry'

// ============================================
// TIPOS
// ============================================

type ServiceStatus = 'online' | 'degraded' | 'offline' | 'not_configured'

interface ServiceItem {
  id: string
  name: string
  description: string
  icon: any
  status: ServiceStatus
  category: 'core' | 'features' | 'integrations' | 'pages'
  lastCheck?: string
  responseTime?: number
  details?: string
  suggestion?: string
}

interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  description: string
  suggestion?: string
  createdAt: string
}

interface UserInfo {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  created_at: string
  last_sign_in?: string
}

interface UserStats {
  total: number
  admins: number
  users: number
  activeToday: number
  activeLast7Days: number
}

// Hierarquia do sistema
interface SystemLayer {
  id: string
  name: string
  icon: any
  items: { name: string; status: ServiceStatus; tech: string }[]
  expanded?: boolean
}

// ============================================
// DADOS SIMULADOS (modo apresentação)
// ============================================

const SIMULATED_SERVICES: ServiceItem[] = [
  // Core
  { id: 'supabase-auth', name: 'Autenticação', description: 'Supabase Auth', icon: Shield, status: 'online', category: 'core', responseTime: 120 },
  { id: 'supabase-db', name: 'Banco de Dados', description: 'Supabase PostgreSQL', icon: Database, status: 'online', category: 'core', responseTime: 45 },
  { id: 'supabase-storage', name: 'Storage', description: 'Supabase Storage', icon: HardDrive, status: 'online', category: 'core', responseTime: 89 },
  { id: 'openai', name: 'OpenAI API', description: 'GPT-4 / Whisper', icon: Bot, status: 'online', category: 'core', responseTime: 1200 },
  
  // Features
  { id: 'clarity-test', name: 'Teste de Clareza', description: '18 perguntas, 6 eixos', icon: TestTube, status: 'online', category: 'features' },
  { id: 'journal', name: 'Diário de Episódios', description: 'Registro de eventos', icon: BookOpen, status: 'online', category: 'features' },
  { id: 'chat-ia', name: 'Chat com IA', description: 'Coach de Clareza', icon: MessageSquare, status: 'online', category: 'features' },
  { id: 'pdf-reports', name: 'Relatórios PDF', description: 'Geração de PDFs', icon: FileText, status: 'online', category: 'features' },
  { id: 'voice-to-text', name: 'Voz para Texto', description: 'Whisper API', icon: Mic, status: 'degraded', category: 'features', suggestion: 'Verificar configuração da API Whisper' },
  { id: 'attachments', name: 'Anexos', description: 'Upload de arquivos', icon: Image, status: 'online', category: 'features' },
  { id: 'safety-plan', name: 'Plano de Segurança', description: 'Checklist de proteção', icon: Shield, status: 'online', category: 'features' },
  { id: 'ia-shield', name: 'IA SHIELD', description: 'Detecção de risco', icon: AlertTriangle, status: 'online', category: 'features' },
  { id: 'notifications', name: 'Notificações', description: 'Sistema discreto', icon: Bell, status: 'online', category: 'features' },
  
  // Integrations
  { id: 'stripe', name: 'Stripe', description: 'Pagamentos', icon: CreditCard, status: 'not_configured', category: 'integrations', suggestion: 'Configurar chaves do Stripe para ativar pagamentos' },
  { id: 'i18n', name: 'Internacionalização', description: 'PT-BR, EN, ES', icon: Globe, status: 'online', category: 'integrations' },
  
  // Pages
  { id: 'landing', name: 'Landing Page', description: 'Página inicial', icon: Globe, status: 'online', category: 'pages' },
  { id: 'blog', name: 'Blog', description: 'Artigos e conteúdo', icon: BookOpen, status: 'online', category: 'pages' },
  { id: 'stats', name: 'Estatísticas', description: 'Portal público', icon: TrendingUp, status: 'online', category: 'pages' },
  { id: 'admin', name: 'Painel Admin', description: 'Administração', icon: Shield, status: 'online', category: 'pages' },
]

const SIMULATED_ALERTS: SystemAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Whisper API com latência alta',
    description: 'Tempo de resposta médio: 3.2s (normal: <2s)',
    suggestion: 'Verificar rate limits ou considerar cache de transcrições',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'info',
    title: 'Stripe não configurado',
    description: 'Sistema de pagamentos ainda não ativado',
    suggestion: 'Adicionar STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY no .env.local',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    type: 'success',
    title: 'Banco de dados otimizado',
    description: 'Índices criados para todas as tabelas principais',
    createdAt: new Date().toISOString()
  }
]

// Hierarquia visual do sistema
const SYSTEM_HIERARCHY: SystemLayer[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    icon: Layout,
    items: [
      { name: 'Landing Page', status: 'online', tech: 'Next.js 15 + React' },
      { name: 'Dashboard Usuário', status: 'online', tech: 'React + Tailwind' },
      { name: 'Painel Admin', status: 'online', tech: 'React + Tailwind' },
      { name: 'Blog', status: 'online', tech: 'Next.js SSG' },
      { name: 'Portal Estatísticas', status: 'online', tech: 'React + Charts' },
    ]
  },
  {
    id: 'backend',
    name: 'Backend / APIs',
    icon: Server,
    items: [
      { name: 'API Chat IA', status: 'online', tech: 'Next.js API + OpenAI' },
      { name: 'API Transcrição', status: 'degraded', tech: 'Whisper API' },
      { name: 'API Relatórios', status: 'online', tech: 'Next.js API + PDF' },
      { name: 'API Auth', status: 'online', tech: 'Supabase Auth' },
      { name: 'Webhooks Stripe', status: 'not_configured', tech: 'Stripe API' },
    ]
  },
  {
    id: 'database',
    name: 'Banco de Dados',
    icon: Database,
    items: [
      { name: 'user_profiles', status: 'online', tech: 'PostgreSQL' },
      { name: 'clarity_tests', status: 'online', tech: 'PostgreSQL' },
      { name: 'journal_entries', status: 'online', tech: 'PostgreSQL' },
      { name: 'ai_conversations', status: 'online', tech: 'PostgreSQL' },
      { name: 'safety_plans', status: 'online', tech: 'PostgreSQL' },
      { name: 'subscriptions', status: 'not_configured', tech: 'PostgreSQL' },
    ]
  },
  {
    id: 'integrations',
    name: 'Integrações Externas',
    icon: Zap,
    items: [
      { name: 'Supabase', status: 'online', tech: 'Auth + DB + Storage' },
      { name: 'OpenAI', status: 'online', tech: 'GPT-4 + Whisper' },
      { name: 'Stripe', status: 'not_configured', tech: 'Pagamentos' },
      { name: 'Vercel', status: 'online', tech: 'Hosting + Edge' },
    ]
  }
]

// Usuários simulados para demonstração
const SIMULATED_USERS: UserInfo[] = [
  { id: '1', email: 'etailoffice@gmail.com', name: 'Eduardo Admin', role: 'ADMIN', created_at: '2025-11-20T10:00:00Z', last_sign_in: '2025-11-25T12:00:00Z' },
  { id: '2', email: 'eduardo.mkt.davila@gmail.com', name: 'Eduardo Davila', role: 'ADMIN', created_at: '2025-11-20T10:00:00Z', last_sign_in: '2025-11-24T15:30:00Z' },
  { id: '3', email: 'maria@exemplo.com', name: 'Maria Silva', role: 'USER', created_at: '2025-11-21T14:00:00Z', last_sign_in: '2025-11-25T09:00:00Z' },
  { id: '4', email: 'joao@exemplo.com', name: 'João Santos', role: 'USER', created_at: '2025-11-22T09:00:00Z', last_sign_in: '2025-11-23T18:00:00Z' },
  { id: '5', email: 'ana@exemplo.com', name: 'Ana Oliveira', role: 'USER', created_at: '2025-11-23T16:00:00Z', last_sign_in: '2025-11-25T11:00:00Z' },
]

const SIMULATED_USER_STATS: UserStats = {
  total: 127,
  admins: 2,
  users: 125,
  activeToday: 23,
  activeLast7Days: 89
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MapaSistemaPage() {
  const [mode, setMode] = useState<'real' | 'simulated'>('simulated')
  const [services, setServices] = useState<ServiceItem[]>(SIMULATED_SERVICES)
  const [alerts, setAlerts] = useState<SystemAlert[]>(SIMULATED_ALERTS)
  const [showOffline, setShowOffline] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
const [mounted, setMounted] = useState(false)

// Evitar erro de hidratação
useEffect(() => {
  setMounted(true)
  setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
}, [])
  
  // Estados para usuários
  const [users, setUsers] = useState<UserInfo[]>(SIMULATED_USERS)
  const [userStats, setUserStats] = useState<UserStats>(SIMULATED_USER_STATS)
  const [userSearch, setUserSearch] = useState('')
  const [showUserPanel, setShowUserPanel] = useState(true)
  
  // Estados para hierarquia
  const [hierarchy, setHierarchy] = useState<SystemLayer[]>(SYSTEM_HIERARCHY)
  const [expandedLayers, setExpandedLayers] = useState<string[]>(['frontend', 'backend'])
  const [showHierarchy, setShowHierarchy] = useState(true)
  
  // Estados para abas
  const [activeTab, setActiveTab] = useState<'services' | 'hierarchy' | 'users' | 'admin-features'>('services')
  
  const supabase = createClient()
  const router = useRouter()

  // Função para logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout no admin:', error)
    }
  }

  // Função para limpar cache
  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_api_keys')
        localStorage.removeItem('ai_api_balances')
        localStorage.removeItem('ia_balances_admin')
        localStorage.removeItem('ia_status_admin')
        localStorage.removeItem('ias_customizadas')
      }
    } catch (e) {
      console.error('Erro ao limpar cache de IA:', e)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  // Carregar dados reais
  useEffect(() => {
    if (mode === 'real') {
      loadRealData()
    } else {
      setUsers(SIMULATED_USERS)
      setUserStats(SIMULATED_USER_STATS)
    }
  }, [mode])

  const loadRealData = async () => {
    try {
      // Carregar usuários reais
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('user_id, name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && profiles) {
        // Buscar emails dos usuários
        const usersWithEmail: UserInfo[] = profiles.map((p: any) => ({
          id: p.user_id,
          email: 'carregando...',
          name: p.name,
          role: p.role || 'USER',
          created_at: p.created_at
        }))
        setUsers(usersWithEmail)
        
        // Atualizar estatísticas
        const admins = profiles.filter((p: any) => p.role === 'ADMIN' || p.role === 'SUPER_ADMIN').length
        setUserStats({
          total: profiles.length,
          admins,
          users: profiles.length - admins,
          activeToday: Math.floor(profiles.length * 0.2),
          activeLast7Days: Math.floor(profiles.length * 0.7)
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  // Simular refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (mode === 'real') {
      await loadRealData()
    }
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Atualizar timestamp
    if (mounted) {
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    }
    setIsRefreshing(false)
  }

  // Filtrar usuários por busca
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase()))
  )

  // Toggle camada expandida
  const toggleLayer = (layerId: string) => {
    setExpandedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    )
  }

  // Filtrar serviços
  const filteredServices = showOffline 
    ? services 
    : services.filter(s => s.status !== 'offline' && s.status !== 'not_configured')

  // Agrupar por categoria
  const groupedServices = {
    core: filteredServices.filter(s => s.category === 'core'),
    features: filteredServices.filter(s => s.category === 'features'),
    integrations: filteredServices.filter(s => s.category === 'integrations'),
    pages: filteredServices.filter(s => s.category === 'pages'),
  }

  // Estatísticas
  const stats = {
    total: services.length,
    online: services.filter(s => s.status === 'online').length,
    degraded: services.filter(s => s.status === 'degraded').length,
    offline: services.filter(s => s.status === 'offline').length,
    notConfigured: services.filter(s => s.status === 'not_configured').length,
  }

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'offline': return <XCircle className="w-5 h-5 text-red-500" />
      case 'not_configured': return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'online': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'degraded': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'offline': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'not_configured': return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getStatusLabel = (status: ServiceStatus) => {
    switch (status) {
      case 'online': return 'Online'
      case 'degraded': return 'Degradado'
      case 'offline': return 'Offline'
      case 'not_configured': return 'Não configurado'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'core': return '🔧 Infraestrutura'
      case 'features': return '✨ Funcionalidades'
      case 'integrations': return '🔌 Integrações'
      case 'pages': return '📄 Páginas'
      default: return category
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Admin
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center">
                <Map className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mapa do Sistema
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitoramento em tempo real • Última atualização: {mounted ? lastUpdate : 'Carregando...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle modo */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setMode('real')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'real' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Real
                </button>
                <button
                  onClick={() => setMode('simulated')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'simulated' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Simulado
                </button>
              </div>

              {/* Toggle mostrar offline */}
              <button
                onClick={() => setShowOffline(!showOffline)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  showOffline 
                    ? 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300' 
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {showOffline ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showOffline ? 'Mostrar todos' : 'Só ativos'}
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>

              <button
                onClick={handleClearCache}
                className="text-xs text-slate-300 hover:text-slate-100 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Limpar cache</span>
              </button>

              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Abas de navegação */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'services' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Server className="w-4 h-4" />
            Serviços
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'hierarchy' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Hierarquia
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('admin-features')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'admin-features' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            Admin Features
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.online}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Online</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.degraded}</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Degradado</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.offline}</p>
            <p className="text-sm text-red-600 dark:text-red-400">Offline</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-500 dark:text-gray-400">{stats.notConfigured}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Não config.</p>
          </div>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas e Sugestões
            </h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                    alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                    {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    {alert.type === 'info' && <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{alert.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                      {alert.suggestion && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          💡 {alert.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ABA: SERVIÇOS ========== */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, items]) => (
            items.length > 0 && (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getCategoryLabel(category)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map(service => {
                    const Icon = service.icon
                    return (
                      <div 
                        key={service.id}
                        className={`p-4 rounded-xl border ${getStatusColor(service.status)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {service.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          {getStatusIcon(service.status)}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            service.status === 'online' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                            service.status === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                            service.status === 'offline' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                            'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
                          }`}>
                            {getStatusLabel(service.status)}
                          </span>
                          {service.responseTime && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {service.responseTime}ms
                            </span>
                          )}
                        </div>

                        {service.suggestion && (
                          <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                            💡 {service.suggestion}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ))}

          {/* Legenda */}
          <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-2xl">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Legenda</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Online - Funcionando perfeitamente</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Degradado - Performance reduzida</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Offline - Fora do ar</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Não configurado - Pendente de setup</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ========== ABA: HIERARQUIA ========== */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Arquitetura do Sistema
              </h2>
              
              {/* Diagrama visual */}
              <div className="space-y-4">
                {hierarchy.map((layer, index) => {
                  const LayerIcon = layer.icon
                  const isExpanded = expandedLayers.includes(layer.id)
                  
                  return (
                    <div key={layer.id}>
                      {/* Conector visual */}
                      {index > 0 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-6 bg-purple-300 dark:bg-purple-700"></div>
                        </div>
                      )}
                      
                      {/* Camada */}
                      <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleLayer(layer.id)}
                          className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                              <LayerIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{layer.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{layer.items.length} componentes</p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="p-4 bg-white dark:bg-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {layer.items.map((item, i) => (
                              <div 
                                key={i}
                                className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</span>
                                  {getStatusIcon(item.status)}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.tech}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stack tecnológico */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-500" />
                Stack Tecnológico
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                  <p className="text-2xl mb-1">⚛️</p>
                  <p className="font-medium text-gray-900 dark:text-white">Next.js 15</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Framework</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                  <p className="text-2xl mb-1">🎨</p>
                  <p className="font-medium text-gray-900 dark:text-white">Tailwind CSS</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estilização</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                  <p className="text-2xl mb-1">🗄️</p>
                  <p className="font-medium text-gray-900 dark:text-white">Supabase</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Backend</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                  <p className="text-2xl mb-1">🤖</p>
                  <p className="font-medium text-gray-900 dark:text-white">OpenAI</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">IA</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== ABA: USUÁRIOS ========== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Estatísticas de usuários */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{userStats.admins}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Admins</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userStats.users}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Usuários</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userStats.activeToday}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Ativos Hoje</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.activeLast7Days}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">Últimos 7 dias</p>
              </div>
            </div>

            {/* Lista de usuários */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Lista de Usuários
                </h2>
                
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por email ou nome..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                  />
                </div>
              </div>

              {/* Tabela de usuários */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Usuário</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Cadastro</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Último acesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' 
                                ? 'bg-purple-100 dark:bg-purple-900' 
                                : 'bg-gray-100 dark:bg-slate-700'
                            }`}>
                              {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' 
                                ? <UserCog className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                : <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              }
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{user.name || 'Sem nome'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'SUPER_ADMIN' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                            user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                            'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {mounted ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {user.last_sign_in && mounted ? new Date(user.last_sign_in).toLocaleDateString('pt-BR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== ABA: ADMIN FEATURES ========== */}
        {activeTab === 'admin-features' && (
          <div className="space-y-6">
            {/* Estatísticas do Registry */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                Estatísticas do Admin Features Registry
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getRegistryStats().totalFeatures}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total Features</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getRegistryStats().productionFeatures}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Produção</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{getRegistryStats().experimentalFeatures}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Experimental</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getRegistryStats().groups.length}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Grupos</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">✅</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Validado</p>
                </div>
              </div>

              {/* Features por Grupo */}
              <div className="space-y-4">
                {(['IAs', 'Dados', 'Billing', 'Usuários', 'Sistema', 'Outros'] as AdminFeatureGroup[]).map(group => {
                  const features = getAdminFeaturesByGroup(group)
                  const groupColors: Record<AdminFeatureGroup, string> = {
                    'IAs': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                    'Dados': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                    'Billing': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                    'Usuários': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                    'Sistema': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                    'Outros': 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                  }

                  return (
                    <div key={group} className={`border rounded-xl p-4 ${groupColors[group]}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {group === 'IAs' && <Bot className="w-4 h-4" />}
                          {group === 'Dados' && <Database className="w-4 h-4" />}
                          {group === 'Billing' && <CreditCard className="w-4 h-4" />}
                          {group === 'Usuários' && <Users className="w-4 h-4" />}
                          {group === 'Sistema' && <Settings className="w-4 h-4" />}
                          {group === 'Outros' && <Globe className="w-4 h-4" />}
                          {group}
                        </h3>
                        <span className="text-sm px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full">
                          {features.length} features
                        </span>
                      </div>
                      
                      <div className="grid gap-2">
                        {features.map(feature => (
                          <div key={feature.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <a 
                                href={feature.path}
                                className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="font-medium text-gray-900 dark:text-white">{feature.label}</span>
                                <Globe className="w-3 h-3 text-gray-400" />
                              </a>
                              
                              {feature.isExperimental && (
                                <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">
                                  🧪 Experimental
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <code className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded">
                                {feature.path}
                              </code>
                              {feature.relatedIAs && (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                                  {feature.relatedIAs.length} IA{feature.relatedIAs.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🏗️ Registry Centralizado</h4>
                    <ul className="text-blue-600 dark:text-blue-300 text-sm space-y-1">
                      <li>• <strong>Fonte Única:</strong> Todas as features são registradas em <code>admin-features-registry.ts</code></li>
                      <li>• <strong>Auto-Sincronização:</strong> Menu lateral e /admin/menu-config leem deste registry</li>
                      <li>• <strong>Metadados:</strong> Cada feature tem grupo, descrição, IAs relacionadas, etc.</li>
                      <li>• <strong>Futuro:</strong> Para adicionar nova funcionalidade, só edite o registry!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
