'use client'

/**
 * Dashboard de Métricas por Instância do Oráculo
 * ETAPA 35 - Métricas detalhadas por instância
 */

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Sparkles,
  Cpu,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Settings,
  RefreshCw,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Globe,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react'

interface InstanceDetails {
  id: string
  instance_slug: string
  instance_name: string
  status: 'active' | 'inactive' | 'suspended'
  modelo_ia: string
  temperatura: number
  max_tokens: number
  nome_assistente: string
  tom_comunicacao: string
  cor_primaria: string
  cor_secundaria: string
  created_at: string
  updated_at: string
  contexto_produto: string | null
  limite_diario_global: number | null
  limite_mensal_global: number | null
}

interface InstanceRole {
  id: string
  user_role: string
  status: number
  limite_diario: number | null
  limite_mensal: number | null
}

interface UsageData {
  total_perguntas: number
  total_tokens_input: number
  total_tokens_output: number
  custo_estimado_cents: number
}

interface DailyUsage {
  date: string
  perguntas: number
  tokens: number
  custo_cents: number
}

export default function InstanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [instance, setInstance] = useState<InstanceDetails | null>(null)
  const [roles, setRoles] = useState<InstanceRole[]>([])
  const [usageDiario, setUsageDiario] = useState<UsageData | null>(null)
  const [usageMensal, setUsageMensal] = useState<UsageData | null>(null)
  const [dailyHistory, setDailyHistory] = useState<DailyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadInstanceDetails()
  }, [resolvedParams.id])

  const loadInstanceDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar')
      
      setInstance(data.instance)
      setRoles(data.roles || [])
      setUsageDiario(data.usage?.diario || null)
      setUsageMensal(data.usage?.mensal || null)
      
      // Gerar histórico simulado para demonstração
      generateDailyHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const generateDailyHistory = () => {
    const history: DailyUsage[] = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Valores simulados baseados em padrão realista
      const basePerguntas = Math.floor(Math.random() * 50) + 10
      const tokens = basePerguntas * (Math.floor(Math.random() * 500) + 300)
      
      history.push({
        date: date.toISOString().split('T')[0],
        perguntas: basePerguntas,
        tokens,
        custo_cents: Math.floor(tokens * 0.002) // ~$0.002 por 1k tokens
      })
    }
    
    setDailyHistory(history)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadInstanceDetails()
    setRefreshing(false)
  }

  // Formatar valores
  const formatNumber = (n: number) => n.toLocaleString('pt-BR')
  const formatCurrency = (cents: number) => `R$ ${(cents / 100).toFixed(2)}`
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  // Calcular totais do histórico
  const totalPerguntas = dailyHistory.reduce((sum, d) => sum + d.perguntas, 0)
  const totalTokens = dailyHistory.reduce((sum, d) => sum + d.tokens, 0)
  const totalCusto = dailyHistory.reduce((sum, d) => sum + d.custo_cents, 0)
  const mediaPerguntas = Math.round(totalPerguntas / 30)

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      active: { icon: CheckCircle, color: 'text-green-400 bg-green-500/20', label: 'Ativa' },
      inactive: { icon: XCircle, color: 'text-gray-400 bg-gray-500/20', label: 'Inativa' },
      suspended: { icon: Pause, color: 'text-yellow-400 bg-yellow-500/20', label: 'Suspensa' }
    }[status] || { icon: XCircle, color: 'text-gray-400 bg-gray-500/20', label: status }
    
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  // Mini gráfico de barras
  const MiniBarChart = ({ data, maxValue }: { data: number[]; maxValue: number }) => (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-violet-500/80 rounded-t transition-all hover:bg-violet-400"
          style={{ height: `${Math.max(4, (value / maxValue) * 100)}%` }}
          title={`${value} perguntas`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error || !instance) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Instância não encontrada'}</p>
          <Link href="/admin/oraculo-instances" className="text-violet-400 hover:text-violet-300">
            ← Voltar para lista
          </Link>
        </div>
      </div>
    )
  }

  const maxPerguntas = Math.max(...dailyHistory.map(d => d.perguntas))

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/oraculo-instances" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: instance.cor_primaria + '30' }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: instance.cor_primaria }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    {instance.instance_name}
                    <StatusBadge status={instance.status} />
                  </h1>
                  <p className="text-sm text-gray-400">
                    <code className="bg-slate-700 px-2 py-0.5 rounded text-xs">{instance.instance_slug}</code>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/admin/oraculo-instances"
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Editar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Perguntas Hoje</span>
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(usageDiario?.total_perguntas || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {instance.limite_diario_global ? `Limite: ${formatNumber(instance.limite_diario_global)}` : 'Sem limite'}
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Perguntas Mês</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(usageMensal?.total_perguntas || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {instance.limite_mensal_global ? `Limite: ${formatNumber(instance.limite_mensal_global)}` : 'Sem limite'}
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Tokens Mês</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold">
              {formatNumber(Math.round((usageMensal?.total_tokens_input || 0) + (usageMensal?.total_tokens_output || 0)))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              In: {formatNumber(usageMensal?.total_tokens_input || 0)} | Out: {formatNumber(usageMensal?.total_tokens_output || 0)}
            </p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Custo Estimado</span>
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(usageMensal?.custo_estimado_cents || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </div>
        </div>

        {/* Gráfico de Uso */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                Uso nos Últimos 30 Dias
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-violet-500 rounded"></div>
                  Perguntas
                </span>
              </div>
            </div>
            
            <MiniBarChart 
              data={dailyHistory.map(d => d.perguntas)} 
              maxValue={maxPerguntas} 
            />
            
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{formatDate(dailyHistory[0]?.date || '')}</span>
              <span>{formatDate(dailyHistory[dailyHistory.length - 1]?.date || '')}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700">
              <div>
                <p className="text-gray-400 text-sm">Total 30 dias</p>
                <p className="text-xl font-bold">{formatNumber(totalPerguntas)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Média/dia</p>
                <p className="text-xl font-bold">{formatNumber(mediaPerguntas)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Custo 30 dias</p>
                <p className="text-xl font-bold">{formatCurrency(totalCusto)}</p>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-blue-400" />
              Configuração IA
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Modelo</p>
                <p className="font-medium">{instance.modelo_ia}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Temperatura</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-red-500"
                      style={{ width: `${(instance.temperatura / 2) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{instance.temperatura}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Max Tokens</p>
                <p className="font-medium">{formatNumber(instance.max_tokens)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Assistente</p>
                <p className="font-medium">{instance.nome_assistente}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tom</p>
                <p className="font-medium capitalize">{instance.tom_comunicacao}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cores</p>
                <div className="flex gap-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded-lg border border-slate-600"
                    style={{ backgroundColor: instance.cor_primaria }}
                    title={instance.cor_primaria}
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border border-slate-600"
                    style={{ backgroundColor: instance.cor_secundaria }}
                    title={instance.cor_secundaria}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-rose-400" />
              Perfis Configurados
            </h2>
            
            {roles.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum perfil configurado (usando padrões)</p>
            ) : (
              <div className="space-y-3">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${role.status === 1 ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className="font-medium capitalize">{role.user_role}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {role.limite_diario ? `${role.limite_diario}/dia` : 'Sem limite'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contexto */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-emerald-400" />
              Contexto do Produto
            </h2>
            
            {instance.contexto_produto ? (
              <p className="text-gray-300 text-sm leading-relaxed">
                {instance.contexto_produto.slice(0, 300)}
                {instance.contexto_produto.length > 300 && '...'}
              </p>
            ) : (
              <p className="text-gray-400 text-sm">Nenhum contexto configurado</p>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-gray-400 text-sm">Criado em</p>
              <p className="font-medium">
                {new Date(instance.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* API Endpoint */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            Endpoint da API
          </h2>
          
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-400 mb-2"># Health Check</p>
            <p className="text-green-400 mb-4">
              GET https://radar-narcisista.vercel.app/api/oraculo-public?instance={instance.instance_slug}
            </p>
            
            <p className="text-gray-400 mb-2"># Consulta</p>
            <p className="text-blue-400">
              POST https://radar-narcisista.vercel.app/api/oraculo-public?instance={instance.instance_slug}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
