'use client'

/**
 * Dashboard de Métricas por Instância do Oráculo
 * ETAPA 35 - Métricas detalhadas por instância
 * ETAPA 36 - Gerenciamento de API Keys
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
  Pause,
  Key,
  Plus,
  Copy,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Webhook,
  Send,
  Link2,
  CreditCard,
  Crown,
  FileText,
  List,
  AlertCircle,
  Timer
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

// ETAPA 36: Interface para API Keys
interface ApiKeyData {
  id: string
  key_name: string
  api_key: string
  key_prefix: string
  status: 'active' | 'revoked' | 'expired'
  rate_limit_per_minute: number
  total_requests: number
  last_used_at: string | null
  created_at: string
}

// ETAPA 37: Interface para Webhooks
interface WebhookData {
  id: string
  webhook_name: string
  webhook_url: string
  secret_key: string | null
  events: string[]
  status: 'active' | 'inactive' | 'failed'
  total_deliveries: number
  successful_deliveries: number
  failed_deliveries: number
  last_delivery_at: string | null
  last_error: string | null
  created_at: string
}

// ETAPA 38: Interfaces para Billing
interface PlanData {
  id: string
  plan_slug: string
  plan_name: string
  description: string | null
  max_queries_per_month: number
  max_tokens_per_month: number
  max_api_keys: number
  max_webhooks: number
  price_cents: number
  features: string[]
}

interface SubscriptionData {
  id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'
  queries_used: number
  tokens_used: number
  current_period_end: string | null
  plan?: PlanData
}

interface BillingUsageData {
  total_queries: number
  total_tokens: number
  total_api_calls: number
}

// ETAPA 39: Interfaces para Logs
interface LogData {
  id: string
  request_id: string
  user_role: string | null
  question: string | null
  tokens_total: number
  response_time_ms: number | null
  status: 'success' | 'error' | 'rate_limited' | 'quota_exceeded'
  error_message: string | null
  created_at: string
}

interface LogsSummary {
  total_requests: number
  successful_requests: number
  failed_requests: number
  total_tokens: number
  avg_response_time_ms: number
  requests_per_day: number
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
  
  // ETAPA 36: Estados para API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newFullKey, setNewFullKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  
  // ETAPA 37: Estados para Webhooks
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [creatingWebhook, setCreatingWebhook] = useState(false)
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null)
  
  // ETAPA 38: Estados para Billing
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [billingUsage, setBillingUsage] = useState<BillingUsageData | null>(null)
  
  // ETAPA 39: Estados para Logs
  const [recentLogs, setRecentLogs] = useState<LogData[]>([])
  const [logsSummary, setLogsSummary] = useState<LogsSummary | null>(null)

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
      
      // ETAPA 36: Carregar API keys
      loadApiKeys()
      
      // ETAPA 37: Carregar webhooks
      loadWebhooks()
      
      // ETAPA 38: Carregar billing
      loadBilling()
      
      // ETAPA 39: Carregar logs
      loadLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // ETAPA 36: Carregar API keys
  const loadApiKeys = async () => {
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/keys`)
      const data = await res.json()
      if (res.ok) {
        setApiKeys(data.keys || [])
      }
    } catch (err) {
      console.error('Erro ao carregar API keys:', err)
    }
  }

  // ETAPA 36: Criar nova API key
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return
    
    setCreatingKey(true)
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_name: newKeyName })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setNewFullKey(data.full_key)
      loadApiKeys()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar key')
    } finally {
      setCreatingKey(false)
    }
  }

  // ETAPA 36: Revogar API key
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Revogar esta API key? Ela não poderá mais ser usada.')) return
    
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/keys`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId })
      })
      
      if (!res.ok) throw new Error('Erro ao revogar')
      
      loadApiKeys()
    } catch (err) {
      alert('Erro ao revogar API key')
    }
  }

  // ETAPA 36: Copiar key
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  // ETAPA 37: Carregar webhooks
  const loadWebhooks = async () => {
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/webhooks`)
      const data = await res.json()
      if (res.ok) {
        setWebhooks(data.webhooks || [])
      }
    } catch (err) {
      console.error('Erro ao carregar webhooks:', err)
    }
  }

  // ETAPA 37: Criar webhook
  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) return
    
    setCreatingWebhook(true)
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          webhook_name: newWebhookName,
          webhook_url: newWebhookUrl
        })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setNewWebhookSecret(data.webhook.secret_key)
      loadWebhooks()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar webhook')
    } finally {
      setCreatingWebhook(false)
    }
  }

  // ETAPA 37: Deletar webhook
  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Deletar este webhook?')) return
    
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/webhooks?webhook_id=${webhookId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Erro ao deletar')
      
      loadWebhooks()
    } catch (err) {
      alert('Erro ao deletar webhook')
    }
  }

  // ETAPA 38: Carregar billing
  const loadBilling = async () => {
    try {
      const res = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/billing`)
      const data = await res.json()
      if (res.ok) {
        setSubscription(data.subscription || null)
        setPlans(data.plans || [])
        setBillingUsage(data.usage || null)
      }
    } catch (err) {
      console.error('Erro ao carregar billing:', err)
    }
  }

  // ETAPA 39: Carregar logs
  const loadLogs = async () => {
    try {
      // Carregar logs recentes
      const logsRes = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/logs?limit=10`)
      const logsData = await logsRes.json()
      if (logsRes.ok) {
        setRecentLogs(logsData.logs || [])
      }
      
      // Carregar resumo
      const summaryRes = await fetch(`/api/admin/oraculo-instances/${resolvedParams.id}/logs?view=summary&days=30`)
      const summaryData = await summaryRes.json()
      if (summaryRes.ok) {
        setLogsSummary(summaryData.summary || null)
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err)
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

        {/* ETAPA 36: API Keys */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              API Keys
            </h2>
            <button
              onClick={() => {
                setNewKeyName('')
                setNewFullKey(null)
                setShowKeyModal(true)
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Key
            </button>
          </div>
          
          {apiKeys.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma API key criada</p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map(key => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      key.status === 'active' ? 'bg-green-400' : 
                      key.status === 'revoked' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="font-medium">{key.key_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{key.api_key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-400">{key.total_requests} requests</p>
                      <p className="text-xs text-gray-500">
                        {key.last_used_at 
                          ? `Último uso: ${new Date(key.last_used_at).toLocaleDateString('pt-BR')}`
                          : 'Nunca usada'
                        }
                      </p>
                    </div>
                    {key.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Revogar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ETAPA 37: Webhooks */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Webhook className="w-5 h-5 text-purple-400" />
              Webhooks
            </h2>
            <button
              onClick={() => {
                setNewWebhookName('')
                setNewWebhookUrl('')
                setNewWebhookSecret(null)
                setShowWebhookModal(true)
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Webhook
            </button>
          </div>
          
          {webhooks.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum webhook configurado</p>
          ) : (
            <div className="space-y-3">
              {webhooks.map(webhook => (
                <div key={webhook.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      webhook.status === 'active' ? 'bg-green-400' : 
                      webhook.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">{webhook.webhook_name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {webhook.webhook_url.slice(0, 40)}{webhook.webhook_url.length > 40 && '...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-400">
                        <span className="text-green-400">{webhook.successful_deliveries}</span>
                        {' / '}
                        <span className="text-red-400">{webhook.failed_deliveries}</span>
                        {' entregas'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {webhook.events.length} eventos
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ETAPA 38: Billing */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Plano & Billing
            </h2>
          </div>
          
          {subscription ? (
            <div className="space-y-4">
              {/* Plano atual */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-lg">{subscription.plan?.plan_name || 'Free'}</p>
                    <p className="text-sm text-gray-400">{subscription.plan?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    {subscription.plan?.price_cents === 0 ? 'Grátis' : `R$ ${(subscription.plan?.price_cents || 0) / 100}/mês`}
                  </p>
                  <p className={`text-xs ${subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {subscription.status === 'active' ? 'Ativo' : subscription.status}
                  </p>
                </div>
              </div>
              
              {/* Uso atual */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Zap className="w-4 h-4" />
                    Queries
                  </div>
                  <p className="text-xl font-bold">
                    {subscription.queries_used}
                    <span className="text-sm text-gray-400 font-normal">
                      {' / '}{subscription.plan?.max_queries_per_month === -1 ? '∞' : subscription.plan?.max_queries_per_month}
                    </span>
                  </p>
                  {subscription.plan?.max_queries_per_month !== -1 && (
                    <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (subscription.queries_used / (subscription.plan?.max_queries_per_month || 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <FileText className="w-4 h-4" />
                    Tokens
                  </div>
                  <p className="text-xl font-bold">
                    {(subscription.tokens_used / 1000).toFixed(1)}k
                    <span className="text-sm text-gray-400 font-normal">
                      {' / '}{subscription.plan?.max_tokens_per_month === -1 ? '∞' : `${(subscription.plan?.max_tokens_per_month || 0) / 1000}k`}
                    </span>
                  </p>
                  {subscription.plan?.max_tokens_per_month !== -1 && (
                    <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(100, (subscription.tokens_used / (subscription.plan?.max_tokens_per_month || 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Outros planos */}
              {plans.length > 1 && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-gray-400 mb-3">Fazer upgrade:</p>
                  <div className="flex flex-wrap gap-2">
                    {plans.filter(p => p.price_cents > (subscription.plan?.price_cents || 0)).map(plan => (
                      <button
                        key={plan.id}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                      >
                        {plan.plan_name} - R$ {plan.price_cents / 100}/mês
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Carregando informações de billing...</p>
          )}
        </div>

        {/* ETAPA 39: Logs de Uso */}
        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <List className="w-5 h-5 text-blue-400" />
              Logs de Uso (30 dias)
            </h2>
          </div>
          
          {/* Resumo */}
          {logsSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-400">{logsSummary.total_requests}</p>
                <p className="text-xs text-gray-400">Total Requests</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">{logsSummary.successful_requests}</p>
                <p className="text-xs text-gray-400">Sucesso</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-400">{logsSummary.failed_requests}</p>
                <p className="text-xs text-gray-400">Erros</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-400">{logsSummary.avg_response_time_ms}ms</p>
                <p className="text-xs text-gray-400">Tempo Médio</p>
              </div>
            </div>
          )}
          
          {/* Lista de logs recentes */}
          {recentLogs.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum log registrado</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Últimas requisições:</p>
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-400' : 
                      log.status === 'error' ? 'bg-red-400' : 
                      log.status === 'rate_limited' ? 'bg-yellow-400' : 'bg-orange-400'
                    }`} />
                    <span className="text-gray-300 truncate max-w-[200px]">
                      {log.question?.slice(0, 40) || 'Sem pergunta'}{log.question && log.question.length > 40 ? '...' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {log.response_time_ms || 0}ms
                    </span>
                    <span>{log.tokens_total} tokens</span>
                    <span>{new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Nova API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                {newFullKey ? 'API Key Criada' : 'Nova API Key'}
              </h2>
            </div>
            
            <div className="p-6">
              {newFullKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-200">
                        Guarde esta chave em local seguro. Ela não será exibida novamente!
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sua API Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFullKey}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => handleCopyKey(newFullKey)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          copiedKey 
                            ? 'bg-green-600 text-white' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {copiedKey ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nome da Key</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="Ex: Produção, Desenvolvimento, App Mobile..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {newFullKey ? 'Fechar' : 'Cancelar'}
              </button>
              {!newFullKey && (
                <button
                  onClick={handleCreateKey}
                  disabled={creatingKey || !newKeyName.trim()}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {creatingKey ? 'Criando...' : 'Criar Key'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Webhook */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-400" />
                {newWebhookSecret ? 'Webhook Criado' : 'Novo Webhook'}
              </h2>
            </div>
            
            <div className="p-6">
              {newWebhookSecret ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-purple-200">
                        Guarde o secret em local seguro. Ele não será exibido novamente!
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Secret Key (para validar assinatura)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newWebhookSecret}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg font-mono text-xs"
                      />
                      <button
                        onClick={() => handleCopyKey(newWebhookSecret)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          copiedKey 
                            ? 'bg-green-600 text-white' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {copiedKey ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nome do Webhook</label>
                    <input
                      type="text"
                      value={newWebhookName}
                      onChange={e => setNewWebhookName(e.target.value)}
                      placeholder="Ex: Notificações, Analytics..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">URL do Webhook</label>
                    <input
                      type="url"
                      value={newWebhookUrl}
                      onChange={e => setNewWebhookUrl(e.target.value)}
                      placeholder="https://seu-servidor.com/webhook"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {newWebhookSecret ? 'Fechar' : 'Cancelar'}
              </button>
              {!newWebhookSecret && (
                <button
                  onClick={handleCreateWebhook}
                  disabled={creatingWebhook || !newWebhookName.trim() || !newWebhookUrl.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {creatingWebhook ? 'Criando...' : 'Criar Webhook'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
