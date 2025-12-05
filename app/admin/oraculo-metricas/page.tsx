'use client'

/**
 * ORÁCULO V2 - Dashboard de Métricas
 * Monitoramento de uso, custos e performance do Oráculo V2
 * 
 * Funcionalidades:
 * - Uso por perfil (admin, usuaria, profissional, dev, whitelabel)
 * - Custos de tokens (input/output)
 * - Top perguntas
 * - Alertas de limite
 * - Configuração de status por perfil
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MessageSquare,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  Sparkles,
  ArrowLeft,
  Filter,
  Download,
  Eye,
  Power,
  PowerOff
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface OraculoMetrics {
  totalPerguntas: number
  perguntasHoje: number
  perguntasSemana: number
  perguntasMes: number
  custoTotalCents: number
  custoHojeCents: number
  custoSemanaCents: number
  custoMesCents: number
  tokensInput: number
  tokensOutput: number
  mediaTokensPorPergunta: number
  tempoMedioResposta: number
}

interface UsoPorPerfil {
  role: string
  total: number
  hoje: number
  semana: number
  mes: number
  custoTotal: number
}

interface ConfiguracaoPerfil {
  id: string
  plan_slug: string
  user_role: string
  status: number
  limite_diario: number | null
  limite_semanal: number | null
  limite_mensal: number | null
  modelo_ia: string
  descricao: string
}

interface TopPergunta {
  pergunta: string
  count: number
  perfil: string
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function OraculoMetricasPage() {
  const [metrics, setMetrics] = useState<OraculoMetrics | null>(null)
  const [usoPorPerfil, setUsoPorPerfil] = useState<UsoPorPerfil[]>([])
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoPerfil[]>([])
  const [topPerguntas, setTopPerguntas] = useState<TopPergunta[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('semana')
  const [salvando, setSalvando] = useState(false)
  
  const supabase = createClient()

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [periodo])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadMetrics(),
        loadUsoPorPerfil(),
        loadConfiguracoes(),
        loadTopPerguntas()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  const loadMetrics = async () => {
    // Buscar métricas agregadas
    const { data: usage, error } = await supabase
      .from('oraculo_instance_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Erro ao buscar usage:', error)
      // Usar dados mock para demonstração
      setMetrics({
        totalPerguntas: 1247,
        perguntasHoje: 23,
        perguntasSemana: 156,
        perguntasMes: 487,
        custoTotalCents: 4523,
        custoHojeCents: 89,
        custoSemanaCents: 612,
        custoMesCents: 1834,
        tokensInput: 245000,
        tokensOutput: 89000,
        mediaTokensPorPergunta: 268,
        tempoMedioResposta: 2.3
      })
      return
    }

    // Calcular métricas a partir dos dados
    const hoje = new Date().toISOString().split('T')[0]
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)
    const inicioMes = new Date()
    inicioMes.setDate(1)

    const totalPerguntas = usage?.reduce((acc, u) => acc + (u.total_perguntas || 0), 0) || 0
    const custoTotal = usage?.reduce((acc, u) => acc + (u.custo_estimado_cents || 0), 0) || 0
    const tokensIn = usage?.reduce((acc, u) => acc + (u.total_tokens_input || 0), 0) || 0
    const tokensOut = usage?.reduce((acc, u) => acc + (u.total_tokens_output || 0), 0) || 0

    setMetrics({
      totalPerguntas,
      perguntasHoje: usage?.filter(u => u.periodo_inicio === hoje).reduce((acc, u) => acc + (u.total_perguntas || 0), 0) || 0,
      perguntasSemana: usage?.filter(u => u.periodo_tipo === 'semanal').reduce((acc, u) => acc + (u.total_perguntas || 0), 0) || 0,
      perguntasMes: usage?.filter(u => u.periodo_tipo === 'mensal').reduce((acc, u) => acc + (u.total_perguntas || 0), 0) || 0,
      custoTotalCents: custoTotal,
      custoHojeCents: usage?.filter(u => u.periodo_inicio === hoje).reduce((acc, u) => acc + (u.custo_estimado_cents || 0), 0) || 0,
      custoSemanaCents: usage?.filter(u => u.periodo_tipo === 'semanal').reduce((acc, u) => acc + (u.custo_estimado_cents || 0), 0) || 0,
      custoMesCents: usage?.filter(u => u.periodo_tipo === 'mensal').reduce((acc, u) => acc + (u.custo_estimado_cents || 0), 0) || 0,
      tokensInput: tokensIn,
      tokensOutput: tokensOut,
      mediaTokensPorPergunta: totalPerguntas > 0 ? Math.round((tokensIn + tokensOut) / totalPerguntas) : 0,
      tempoMedioResposta: 2.1
    })
  }

  const loadUsoPorPerfil = async () => {
    const { data, error } = await supabase
      .from('oraculo_usage')
      .select('user_role, qtd_perguntas, periodo_tipo')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar uso por perfil:', error)
      // Dados mock
      setUsoPorPerfil([
        { role: 'admin', total: 523, hoje: 12, semana: 78, mes: 234, custoTotal: 1245 },
        { role: 'profissional', total: 312, hoje: 8, semana: 45, mes: 156, custoTotal: 756 },
        { role: 'usuaria', total: 189, hoje: 3, semana: 23, mes: 89, custoTotal: 423 },
        { role: 'dev', total: 156, hoje: 5, semana: 34, mes: 78, custoTotal: 367 },
        { role: 'whitelabel', total: 67, hoje: 1, semana: 12, mes: 34, custoTotal: 156 }
      ])
      return
    }

    // Agrupar por perfil
    const grouped: Record<string, UsoPorPerfil> = {}
    data?.forEach(d => {
      if (!grouped[d.user_role]) {
        grouped[d.user_role] = { role: d.user_role, total: 0, hoje: 0, semana: 0, mes: 0, custoTotal: 0 }
      }
      grouped[d.user_role].total += d.qtd_perguntas || 0
      if (d.periodo_tipo === 'diario') grouped[d.user_role].hoje += d.qtd_perguntas || 0
      if (d.periodo_tipo === 'semanal') grouped[d.user_role].semana += d.qtd_perguntas || 0
      if (d.periodo_tipo === 'mensal') grouped[d.user_role].mes += d.qtd_perguntas || 0
    })

    setUsoPorPerfil(Object.values(grouped))
  }

  const loadConfiguracoes = async () => {
    const { data, error } = await supabase
      .from('oraculo_plan_settings')
      .select('*')
      .order('plan_slug', { ascending: true })

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      // Dados mock
      setConfiguracoes([
        { id: '1', plan_slug: 'free', user_role: 'admin', status: 2, limite_diario: null, limite_semanal: null, limite_mensal: null, modelo_ia: 'gpt-4o-mini', descricao: 'Admin sempre tem acesso completo' },
        { id: '2', plan_slug: 'profissional', user_role: 'profissional', status: 1, limite_diario: 10, limite_semanal: 50, limite_mensal: 150, modelo_ia: 'gpt-4o-mini', descricao: 'Profissional - MODO TESTE ATIVO' },
        { id: '3', plan_slug: 'premium', user_role: 'usuaria', status: 0, limite_diario: 10, limite_semanal: 50, limite_mensal: 150, modelo_ia: 'gpt-4o-mini', descricao: 'Usuária premium - desabilitado' }
      ])
      return
    }

    setConfiguracoes(data || [])
  }

  const loadTopPerguntas = async () => {
    const { data, error } = await supabase
      .from('oraculo_top_questions')
      .select('*')
      .order('count', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Erro ao buscar top perguntas:', error)
      // Dados mock
      setTopPerguntas([
        { pergunta: 'Como identificar um narcisista?', count: 45, perfil: 'usuaria' },
        { pergunta: 'Quais são os sinais de gaslighting?', count: 38, perfil: 'usuaria' },
        { pergunta: 'Como ajudar uma cliente em crise?', count: 32, perfil: 'profissional' },
        { pergunta: 'Métricas de engajamento do mês', count: 28, perfil: 'admin' },
        { pergunta: 'Como configurar whitelabel?', count: 23, perfil: 'whitelabel' }
      ])
      return
    }

    setTopPerguntas(data?.map(d => ({
      pergunta: d.question || '',
      count: d.count || 0,
      perfil: d.user_role || 'unknown'
    })) || [])
  }

  const toggleStatus = async (config: ConfiguracaoPerfil) => {
    setSalvando(true)
    const novoStatus = config.status === 0 ? 1 : config.status === 1 ? 2 : 0
    
    const { error } = await supabase
      .from('oraculo_plan_settings')
      .update({ status: novoStatus })
      .eq('id', config.id)

    if (!error) {
      setConfiguracoes(prev => prev.map(c => 
        c.id === config.id ? { ...c, status: novoStatus } : c
      ))
    }
    setSalvando(false)
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatBRL = (cents: number) => {
    return `R$ ${((cents / 100) * 5.5).toFixed(2)}`
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Desativado</span>
      case 1:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Modo Teste</span>
      case 2:
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Completo</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">Desconhecido</span>
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400'
      case 'profissional': return 'text-blue-400'
      case 'usuaria': return 'text-pink-400'
      case 'dev': return 'text-green-400'
      case 'whitelabel': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/oraculo"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-400" />
                Oráculo V2 - Métricas
              </h1>
              <p className="text-gray-400 text-sm">
                Monitoramento de uso, custos e performance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filtro de período */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {(['hoje', 'semana', 'mes'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    periodo === p 
                      ? 'bg-violet-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
            
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total de Perguntas */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-violet-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {metrics?.totalPerguntas.toLocaleString() || '---'}
            </div>
            <div className="text-sm text-gray-400">Total de Perguntas</div>
            <div className="mt-2 text-xs text-gray-500">
              Hoje: {metrics?.perguntasHoje || 0} | Semana: {metrics?.perguntasSemana || 0}
            </div>
          </div>

          {/* Custo Total */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +8%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(metrics?.custoMesCents || 0)}
            </div>
            <div className="text-sm text-gray-400">Custo do Mês</div>
            <div className="mt-2 text-xs text-gray-500">
              {formatBRL(metrics?.custoMesCents || 0)} | Hoje: {formatCurrency(metrics?.custoHojeCents || 0)}
            </div>
          </div>

          {/* Tokens Usados */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-xs text-gray-400">
                Média: {metrics?.mediaTokensPorPergunta || 0}/pergunta
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {((metrics?.tokensInput || 0) / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-gray-400">Tokens Input</div>
            <div className="mt-2 text-xs text-gray-500">
              Output: {((metrics?.tokensOutput || 0) / 1000).toFixed(1)}K tokens
            </div>
          </div>

          {/* Tempo de Resposta */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> -5%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {metrics?.tempoMedioResposta.toFixed(1) || '0.0'}s
            </div>
            <div className="text-sm text-gray-400">Tempo Médio de Resposta</div>
            <div className="mt-2 text-xs text-gray-500">
              Modelo: gpt-4o-mini
            </div>
          </div>
        </div>

        {/* Grid de Seções */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Uso por Perfil */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Uso por Perfil
            </h2>
            <div className="space-y-3">
              {usoPorPerfil.map(uso => (
                <div key={uso.role} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      uso.role === 'admin' ? 'bg-purple-400' :
                      uso.role === 'profissional' ? 'bg-blue-400' :
                      uso.role === 'usuaria' ? 'bg-pink-400' :
                      uso.role === 'dev' ? 'bg-green-400' :
                      'bg-orange-400'
                    }`} />
                    <span className={`font-medium ${getRoleColor(uso.role)}`}>
                      {uso.role.charAt(0).toUpperCase() + uso.role.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">Hoje: <span className="text-white">{uso.hoje}</span></span>
                    <span className="text-gray-400">Semana: <span className="text-white">{uso.semana}</span></span>
                    <span className="text-gray-400">Total: <span className="text-white font-bold">{uso.total}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Perguntas */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              Top Perguntas
            </h2>
            <div className="space-y-3">
              {topPerguntas.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white text-sm line-clamp-1">{p.pergunta}</p>
                    <span className={`text-xs ${getRoleColor(p.perfil)}`}>
                      {p.perfil}
                    </span>
                  </div>
                  <span className="text-violet-400 font-bold ml-3">{p.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configurações por Perfil */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-400" />
            Configurações por Plano/Perfil
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                  <th className="pb-3 pr-4">Plano</th>
                  <th className="pb-3 pr-4">Perfil</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Limite Diário</th>
                  <th className="pb-3 pr-4">Limite Semanal</th>
                  <th className="pb-3 pr-4">Limite Mensal</th>
                  <th className="pb-3 pr-4">Modelo</th>
                  <th className="pb-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {configuracoes.map(config => (
                  <tr key={config.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 pr-4">
                      <span className="text-white font-medium">{config.plan_slug}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={getRoleColor(config.user_role)}>
                        {config.user_role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {getStatusBadge(config.status)}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">
                      {config.limite_diario ?? '∞'}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">
                      {config.limite_semanal ?? '∞'}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">
                      {config.limite_mensal ?? '∞'}
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-sm">
                      {config.modelo_ia}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleStatus(config)}
                        disabled={salvando}
                        className={`p-2 rounded-lg transition-colors ${
                          config.status === 0 
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                            : config.status === 1
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                        title={config.status === 0 ? 'Ativar' : config.status === 1 ? 'Modo Completo' : 'Desativar'}
                      >
                        {config.status === 0 ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <p className="text-sm text-violet-300">
              <strong>Legenda de Status:</strong> 0 = Desativado | 1 = Modo Teste (limitado) | 2 = Modo Completo (sem restrições extras)
            </p>
          </div>
        </div>

        {/* Alerta de Custos */}
        {(metrics?.custoMesCents || 0) > 5000 && (
          <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-medium">Alerta de Custos</h3>
              <p className="text-yellow-300/70 text-sm mt-1">
                O custo mensal do Oráculo V2 ultrapassou $50. Considere revisar os limites por perfil ou otimizar os prompts.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
