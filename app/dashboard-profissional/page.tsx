'use client'

/**
 * ETAPA 12: Dashboard Profissional V1
 * 
 * Painel inicial para profissionais (psicólogos, advogados, assistentes sociais).
 * Esta é a V1 - estrutura básica com UI mockada.
 * 
 * FUNCIONALIDADES V1:
 * - Gating por plano (só profissional acessa)
 * - Header com boas-vindas
 * - Visão geral (cards de métricas)
 * - Painel de clientes (estrutura, sem dados reais)
 * - Próximos passos (roadmap do produto)
 * 
 * TODO V2:
 * - Ligar painel de clientes ao banco (tabela professional_clients)
 * - Relatórios agregados
 * - Exportação em massa
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Users,
  FileText,
  Download,
  BarChart3,
  Shield,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Building2,
  UserPlus,
  Eye,
  FileDown,
  Loader2,
  Lock,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { PLANS, type PlanLevel } from '@/lib/plans-config'

// =============================================================================
// TIPOS
// =============================================================================

interface ProfessionalClient {
  id: string
  name: string
  status: 'active' | 'pending' | 'paused'
  lastActivity: string | null
  riskLevel: 'low' | 'medium' | 'high' | null
}

// =============================================================================
// DADOS MOCK (V1 - TODO: ligar ao banco em V2)
// =============================================================================

const MOCK_CLIENTS: ProfessionalClient[] = [
  // Array vazio por padrão - profissional começa sem clientes
  // Quando a infra de clientes for criada (V2), isso será substituído por dados reais
]

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function DashboardProfissionalPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<PlanLevel>('guardar')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  // Clientes (mock V1)
  const [clients] = useState<ProfessionalClient[]>(MOCK_CLIENTS)
  
  // Métricas (mock V1)
  const clientLimit = PLANS.profissional.limits.clientes || 20
  const connectedClients = clients.length
  const availableSlots = clientLimit - connectedClients
  
  // ==========================================================================
  // VERIFICAÇÃO DE ACESSO
  // ==========================================================================
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 1. Verificar se está logado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login?redirect=/dashboard-profissional')
          return
        }
        
        setUserEmail(user.email || null)
        
        // 2. Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, subscription_status, plan_id')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserName(profile.full_name || user.email?.split('@')[0] || 'Profissional')
          
          // 3. Verificar se tem plano profissional
          // TODO: Quando o plano profissional estiver ativo no Stripe, verificar aqui
          // Por enquanto, vamos permitir acesso para demonstração se for admin ou tiver plan_id = 'profissional'
          const isProfessional = profile.plan_id === 'profissional' || 
                                 profile.subscription_status === 'professional' ||
                                 // Temporário: admins podem ver para teste
                                 ['edu@radarnarc.com', 'admin@radarnarc.com'].includes(user.email?.toLowerCase() || '')
          
          if (isProfessional) {
            setUserPlan('profissional')
            setAuthorized(true)
          } else {
            // Não autorizado - redirecionar para landing do profissional
            setAuthorized(false)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar acesso:', error)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAccess()
  }, [supabase, router])
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
  
  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // NÃO AUTORIZADO
  // ==========================================================================
  
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Área Exclusiva
          </h1>
          <p className="text-gray-600 mb-6">
            O Dashboard Profissional é exclusivo para assinantes do plano 
            <strong className="text-blue-600"> Radar Profissional</strong>.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/profissional"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Conhecer o Plano Profissional
            </Link>
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            Já é assinante? Entre em contato com o suporte se estiver tendo problemas de acesso.
          </p>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // TEMA
  // ==========================================================================
  
  const t = theme === 'light' ? {
    bg: 'bg-gray-50',
    bgCard: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textAccent: 'text-blue-600',
    border: 'border-gray-200',
    cardShadow: 'shadow-sm',
  } : {
    bg: 'bg-slate-900',
    bgCard: 'bg-slate-800',
    text: 'text-white',
    textMuted: 'text-slate-400',
    textAccent: 'text-blue-400',
    border: 'border-slate-700',
    cardShadow: 'shadow-lg shadow-slate-900/50',
  }
  
  // ==========================================================================
  // RENDER PRINCIPAL
  // ==========================================================================
  
  return (
    <div className={`min-h-screen ${t.bg}`}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className={`${t.bgCard} border-b ${t.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e título */}
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${t.textMuted}`}
                title="Voltar ao Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className={`text-xl font-bold ${t.text} flex items-center gap-2`}>
                  <Building2 className="w-6 h-6 text-blue-600" />
                  Radar Profissional
                </h1>
                <p className={`text-sm ${t.textMuted}`}>Painel de gestão de clientes</p>
              </div>
            </div>
            
            {/* Ações do header */}
            <div className="flex items-center gap-3">
              {/* Badge do plano */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Profissional
              </span>
              
              {/* Toggle tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${t.textMuted}`}
                title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              {/* Menu do usuário */}
              <div className="relative group">
                <button className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${t.text}`}>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {userName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{userName}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* ================================================================== */}
      {/* CONTEÚDO PRINCIPAL */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ================================================================ */}
        {/* SEÇÃO A: BOAS-VINDAS */}
        {/* ================================================================ */}
        <section className="mb-8">
          <div className={`${t.bgCard} border ${t.border} rounded-2xl p-6 ${t.cardShadow}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${t.text} mb-1`}>
                  Olá, {userName}! 👋
                </h2>
                <p className={`${t.textMuted}`}>
                  Aqui você acompanha, de forma ética e organizada, as informações dos clientes 
                  que escolherem usar o Radar junto com você.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  disabled
                  title="Em breve"
                >
                  <UserPlus className="w-4 h-4" />
                  Convidar Cliente
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* ================================================================ */}
        {/* SEÇÃO B: VISÃO GERAL (CARDS DE MÉTRICAS) */}
        {/* ================================================================ */}
        <section className="mb-8">
          <h3 className={`text-lg font-semibold ${t.text} mb-4 flex items-center gap-2`}>
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Visão Geral
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card: Clientes conectados */}
            <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`text-sm font-medium ${t.textMuted}`}>Clientes</span>
              </div>
              <p className={`text-3xl font-bold ${t.text}`}>{connectedClients}</p>
              <p className={`text-xs ${t.textMuted} mt-1`}>conectados</p>
            </div>
            
            {/* Card: Vagas disponíveis */}
            <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className={`text-sm font-medium ${t.textMuted}`}>Vagas</span>
              </div>
              <p className={`text-3xl font-bold ${t.text}`}>{availableSlots}</p>
              <p className={`text-xs ${t.textMuted} mt-1`}>de {clientLimit} disponíveis</p>
            </div>
            
            {/* Card: Relatórios (em breve) */}
            <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow} opacity-60`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span className={`text-sm font-medium ${t.textMuted}`}>Relatórios</span>
              </div>
              <p className={`text-3xl font-bold ${t.text}`}>0</p>
              <p className={`text-xs ${t.textMuted} mt-1 flex items-center gap-1`}>
                <Clock className="w-3 h-3" /> em breve
              </p>
            </div>
            
            {/* Card: Exportações (em breve) */}
            <div className={`${t.bgCard} border ${t.border} rounded-xl p-5 ${t.cardShadow} opacity-60`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-amber-600" />
                </div>
                <span className={`text-sm font-medium ${t.textMuted}`}>Exportações</span>
              </div>
              <p className={`text-3xl font-bold ${t.text}`}>0</p>
              <p className={`text-xs ${t.textMuted} mt-1 flex items-center gap-1`}>
                <Clock className="w-3 h-3" /> em breve
              </p>
            </div>
          </div>
        </section>
        
        {/* ================================================================ */}
        {/* SEÇÃO C: PAINEL DE CLIENTES */}
        {/* ================================================================ */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${t.text} flex items-center gap-2`}>
              <Users className="w-5 h-5 text-blue-600" />
              Seus Clientes
            </h3>
            <button
              className={`text-sm ${t.textAccent} hover:underline flex items-center gap-1`}
              disabled
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className={`${t.bgCard} border ${t.border} rounded-xl overflow-hidden ${t.cardShadow}`}>
            {clients.length === 0 ? (
              /* Estado vazio */
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className={`text-lg font-semibold ${t.text} mb-2`}>
                  Nenhum cliente conectado ainda
                </h4>
                <p className={`${t.textMuted} mb-6 max-w-md mx-auto`}>
                  Quando você convidar clientes e eles aceitarem compartilhar informações, 
                  eles aparecerão aqui.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  disabled
                  title="Em breve"
                >
                  <UserPlus className="w-4 h-4" />
                  Convidar Primeiro Cliente
                </button>
                <p className={`text-xs ${t.textMuted} mt-4`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  Funcionalidade em desenvolvimento
                </p>
              </div>
            ) : (
              /* Tabela de clientes (quando houver) */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${theme === 'light' ? 'bg-gray-50' : 'bg-slate-700'}`}>
                    <tr>
                      <th className={`text-left py-3 px-4 text-sm font-medium ${t.textMuted}`}>Cliente</th>
                      <th className={`text-left py-3 px-4 text-sm font-medium ${t.textMuted}`}>Status</th>
                      <th className={`text-left py-3 px-4 text-sm font-medium ${t.textMuted}`}>Última Atividade</th>
                      <th className={`text-left py-3 px-4 text-sm font-medium ${t.textMuted}`}>Risco</th>
                      <th className={`text-right py-3 px-4 text-sm font-medium ${t.textMuted}`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className={`py-3 px-4 ${t.text} font-medium`}>{client.name}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : client.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {client.status === 'active' ? 'Ativo' : client.status === 'pending' ? 'Pendente' : 'Pausado'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 ${t.textMuted} text-sm`}>
                          {client.lastActivity || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {client.riskLevel ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              client.riskLevel === 'high'
                                ? 'bg-red-100 text-red-700'
                                : client.riskLevel === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                            }`}>
                              {client.riskLevel === 'high' ? 'Alto' : client.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                            </span>
                          ) : (
                            <span className={`text-sm ${t.textMuted}`}>—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 ${t.textMuted}`} title="Ver detalhes">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 ${t.textMuted}`} title="Gerar resumo">
                            <FileDown className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
        
        {/* ================================================================ */}
        {/* SEÇÃO D: PRÓXIMOS PASSOS */}
        {/* ================================================================ */}
        <section className="mb-8">
          <h3 className={`text-lg font-semibold ${t.text} mb-4 flex items-center gap-2`}>
            <Sparkles className="w-5 h-5 text-blue-600" />
            Próximos Passos
          </h3>
          
          <div className={`${t.bgCard} border ${t.border} rounded-xl p-6 ${t.cardShadow}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className={`font-semibold ${t.text} mb-2`}>
                  Este é o painel inicial do Radar Profissional (V1)
                </h4>
                <p className={`${t.textMuted} mb-4`}>
                  Estamos trabalhando para trazer funcionalidades completas para você. 
                  Nas próximas versões, você terá:
                </p>
                <ul className={`space-y-2 ${t.textMuted}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Conexão real com clientes que usam o Radar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Relatórios agregados para documentação profissional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Exportação em massa de dados (PDF/CSV)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Templates de documentos para laudos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Análise de padrões com gráficos</span>
                  </li>
                </ul>
                
                <div className={`mt-6 p-4 rounded-xl ${theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-700/50'}`}>
                  <p className={`text-sm ${theme === 'light' ? 'text-amber-800' : 'text-amber-300'} flex items-start gap-2`}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Importante:</strong> O Radar Profissional é uma ferramenta de apoio à organização de informações. 
                      Não substitui parecer técnico, laudo oficial, perícia ou terapia.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ================================================================ */}
        {/* LINKS RÁPIDOS */}
        {/* ================================================================ */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard"
              className={`${t.bgCard} border ${t.border} rounded-xl p-4 ${t.cardShadow} hover:border-blue-300 transition-colors flex items-center gap-3`}
            >
              <Home className="w-5 h-5 text-blue-600" />
              <span className={`font-medium ${t.text}`}>Dashboard Pessoal</span>
            </Link>
            <Link
              href="/profissional"
              className={`${t.bgCard} border ${t.border} rounded-xl p-4 ${t.cardShadow} hover:border-blue-300 transition-colors flex items-center gap-3`}
            >
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span className={`font-medium ${t.text}`}>Sobre o Plano</span>
            </Link>
            <Link
              href="/configuracoes"
              className={`${t.bgCard} border ${t.border} rounded-xl p-4 ${t.cardShadow} hover:border-blue-300 transition-colors flex items-center gap-3`}
            >
              <Settings className="w-5 h-5 text-blue-600" />
              <span className={`font-medium ${t.text}`}>Configurações</span>
            </Link>
          </div>
        </section>
      </main>
      
      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className={`${t.bgCard} border-t ${t.border} mt-12`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${t.textMuted}`}>
              © 2024 Radar Narcisista. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/termos" className={`text-sm ${t.textMuted} hover:${t.text}`}>
                Termos
              </Link>
              <Link href="/privacidade" className={`text-sm ${t.textMuted} hover:${t.text}`}>
                Privacidade
              </Link>
              <button
                onClick={handleLogout}
                className={`text-sm ${t.textMuted} hover:text-red-500 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
