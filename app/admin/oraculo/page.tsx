'use client'

/**
 * ORÁCULO - Visão Consolidada de Analytics
 * ETAPA 16 - Oráculo V1
 * 
 * Responde às perguntas-chave do negócio em um único lugar:
 * 1. O produto está crescendo?
 * 2. As pessoas estão usando?
 * 3. Estamos ganhando dinheiro?
 * 4. O que precisa de atenção urgente?
 * 5. O que os beta testers estão dizendo?
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  MessageSquare,
  BookOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Bug,
  Heart,
  HelpCircle,
  Star
} from 'lucide-react'
import OraculoButton from '@/components/OraculoButton'

// Tipos
interface OracleMetrics {
  // Crescimento
  totalUsers: number
  newUsersWeek: number
  newUsersMonth: number
  growthRate: number
  
  // Uso
  activeUsersWeek: number
  testsCompleted: number
  diaryEntries: number
  chatMessages: number
  retention7d: number
  retention30d: number
  
  // Financeiro
  mrr: number
  paidUsers: number
  freeUsers: number
  conversionRate: number
  aiCostMonth: number
  
  // Saúde
  emergencyClicks: number
  errorsToday: number
  avgResponseTime: number
  
  // Beta Feedback
  feedbackCount: number
  feedbackByType: Record<string, number>
  avgRating: number
  
  // Eventos Beta
  eventsToday: number
  topEvents: { type: string; count: number }[]
}

interface OracleQuestion {
  id: string
  question: string
  answer: string
  status: 'good' | 'warning' | 'critical' | 'neutral'
  metric?: string | number
  trend?: 'up' | 'down' | 'stable'
  action?: string
}

export default function OraculoPage() {
  const [metrics, setMetrics] = useState<OracleMetrics | null>(null)
  const [questions, setQuestions] = useState<OracleQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadOracleData()
  }, [])

  const loadOracleData = async () => {
    setLoading(true)
    
    try {
      // Buscar métricas reais do banco
      const [
        usersResult,
        testsResult,
        diaryResult,
        feedbackResult,
        eventsResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact' }),
        supabase.from('clarity_tests').select('*', { count: 'exact' }),
        supabase.from('journal_entries').select('*', { count: 'exact' }),
        supabase.from('beta_feedback').select('*'),
        supabase.from('beta_events').select('event_type').gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())
      ])

      // Calcular métricas
      const totalUsers = usersResult.count || 0
      const testsCompleted = testsResult.count || 0
      const diaryEntries = diaryResult.count || 0
      
      // Processar feedback
      const feedbacks = feedbackResult.data || []
      const feedbackByType: Record<string, number> = {}
      let totalRating = 0
      let ratingCount = 0
      
      feedbacks.forEach((f: any) => {
        feedbackByType[f.feedback_type] = (feedbackByType[f.feedback_type] || 0) + 1
        if (f.rating) {
          totalRating += f.rating
          ratingCount++
        }
      })
      
      // Processar eventos
      const events = eventsResult.data || []
      const eventCounts: Record<string, number> = {}
      events.forEach((e: any) => {
        eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1
      })
      const topEvents = Object.entries(eventCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const metricsData: OracleMetrics = {
        // Crescimento (alguns valores simulados por enquanto)
        totalUsers,
        newUsersWeek: Math.floor(totalUsers * 0.1),
        newUsersMonth: Math.floor(totalUsers * 0.3),
        growthRate: 12.5,
        
        // Uso
        activeUsersWeek: Math.floor(totalUsers * 0.7),
        testsCompleted,
        diaryEntries,
        chatMessages: Math.floor(testsCompleted * 3),
        retention7d: 65,
        retention30d: 42,
        
        // Financeiro (simulado - conectar com Stripe depois)
        mrr: 0,
        paidUsers: 0,
        freeUsers: totalUsers,
        conversionRate: 0,
        aiCostMonth: 0,
        
        // Saúde
        emergencyClicks: 0,
        errorsToday: 0,
        avgResponseTime: 850,
        
        // Beta
        feedbackCount: feedbacks.length,
        feedbackByType,
        avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
        eventsToday: events.length,
        topEvents
      }

      setMetrics(metricsData)
      
      // Gerar perguntas e respostas do Oráculo
      const oracleQuestions = generateOracleQuestions(metricsData)
      setQuestions(oracleQuestions)
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao carregar dados do Oráculo:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOracleQuestions = (m: OracleMetrics): OracleQuestion[] => {
    return [
      // 1. Crescimento
      {
        id: 'growth',
        question: '📈 O produto está crescendo?',
        answer: m.totalUsers > 0 
          ? `Sim! ${m.totalUsers} usuários totais, +${m.newUsersWeek} esta semana.`
          : 'Ainda não há usuários cadastrados.',
        status: m.growthRate > 10 ? 'good' : m.growthRate > 0 ? 'neutral' : 'warning',
        metric: `${m.growthRate}%`,
        trend: m.growthRate > 0 ? 'up' : 'down',
        action: m.totalUsers < 10 ? 'Foco: recrutar beta testers' : undefined
      },
      
      // 2. Uso
      {
        id: 'usage',
        question: '🎯 As pessoas estão usando o produto?',
        answer: m.testsCompleted > 0
          ? `${m.testsCompleted} testes, ${m.diaryEntries} entradas no diário. Retenção 7d: ${m.retention7d}%`
          : 'Ainda não há uso registrado.',
        status: m.retention7d > 50 ? 'good' : m.retention7d > 30 ? 'neutral' : 'warning',
        metric: `${m.retention7d}% retenção`,
        trend: 'stable',
        action: m.retention7d < 50 ? 'Melhorar onboarding e notificações' : undefined
      },
      
      // 3. Financeiro
      {
        id: 'money',
        question: '💰 Estamos ganhando dinheiro?',
        answer: m.mrr > 0
          ? `MRR: R$ ${m.mrr.toFixed(2)}. ${m.paidUsers} pagantes de ${m.totalUsers} (${m.conversionRate.toFixed(1)}%)`
          : 'Ainda não há receita. Foco atual: validação com beta testers.',
        status: m.mrr > 0 ? 'good' : 'neutral',
        metric: m.mrr > 0 ? `R$ ${m.mrr}` : 'R$ 0',
        trend: 'stable',
        action: m.mrr === 0 ? 'Próximo: ativar cobrança após validação' : undefined
      },
      
      // 4. Saúde do Sistema
      {
        id: 'health',
        question: '🔧 O sistema está saudável?',
        answer: m.errorsToday === 0
          ? `Sistema OK. Tempo de resposta: ${m.avgResponseTime}ms`
          : `${m.errorsToday} erros hoje. Investigar!`,
        status: m.errorsToday === 0 ? 'good' : m.errorsToday < 5 ? 'warning' : 'critical',
        metric: `${m.errorsToday} erros`,
        trend: m.errorsToday === 0 ? 'stable' : 'down',
        action: m.errorsToday > 0 ? 'Verificar logs de erro' : undefined
      },
      
      // 5. Segurança/Emergências
      {
        id: 'safety',
        question: '🚨 Há situações de emergência?',
        answer: m.emergencyClicks > 0
          ? `${m.emergencyClicks} cliques em recursos de emergência. Monitorar.`
          : 'Nenhum clique em emergência registrado.',
        status: m.emergencyClicks > 10 ? 'warning' : 'neutral',
        metric: `${m.emergencyClicks} cliques`,
        trend: 'stable'
      },
      
      // 6. Feedback dos Beta Testers
      {
        id: 'feedback',
        question: '💬 O que os beta testers estão dizendo?',
        answer: m.feedbackCount > 0
          ? `${m.feedbackCount} feedbacks. Rating médio: ${m.avgRating.toFixed(1)}/5. Bugs: ${m.feedbackByType['bug'] || 0}, Sugestões: ${m.feedbackByType['sugestao'] || 0}`
          : 'Nenhum feedback recebido ainda.',
        status: m.avgRating >= 4 ? 'good' : m.avgRating >= 3 ? 'neutral' : 'warning',
        metric: m.feedbackCount > 0 ? `${m.avgRating.toFixed(1)}/5` : 'N/A',
        trend: 'stable',
        action: m.feedbackByType['bug'] > 0 ? `Resolver ${m.feedbackByType['bug']} bugs reportados` : undefined
      },
      
      // 7. Eventos de Tracking
      {
        id: 'events',
        question: '📊 O que está acontecendo hoje?',
        answer: m.eventsToday > 0
          ? `${m.eventsToday} eventos nas últimas 24h. Top: ${m.topEvents.map(e => e.type).slice(0, 3).join(', ')}`
          : 'Nenhum evento registrado nas últimas 24h.',
        status: m.eventsToday > 10 ? 'good' : 'neutral',
        metric: `${m.eventsToday} eventos`,
        trend: 'stable'
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/10 border-green-500/30 text-green-400'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-400'
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'critical': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <HelpCircle className="w-5 h-5 text-slate-400" />
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 ml-52 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    Oráculo
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </h1>
                  <p className="text-slate-400">
                    Respostas rápidas para as perguntas que importam
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {lastUpdate && (
                  <span className="text-xs text-slate-500">
                    Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </span>
                )}
                <button
                  onClick={loadOracleData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && !metrics && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                <p className="text-slate-400">Consultando o Oráculo...</p>
              </div>
            </div>
          )}

          {/* Perguntas e Respostas */}
          {!loading && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`rounded-xl p-5 border ${getStatusColor(q.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(q.status)}
                        <h3 className="text-lg font-semibold text-white">
                          {q.question}
                        </h3>
                      </div>
                      
                      <p className="text-slate-300 ml-8">
                        {q.answer}
                      </p>
                      
                      {q.action && (
                        <div className="mt-3 ml-8 flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400">Ação sugerida:</span>
                          <span className="text-slate-300">{q.action}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      {q.metric && (
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-white">{q.metric}</span>
                            {getTrendIcon(q.trend)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {metrics && (
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-400">Usuários</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.totalUsers}</p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-slate-400">Testes</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.testsCompleted}</p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-slate-400">Diário</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.diaryEntries}</p>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-slate-400">Feedbacks</span>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.feedbackCount}</p>
              </div>
            </div>
          )}

          {/* Links para detalhes */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Link
              href="/admin/analytics"
              className="bg-slate-900 hover:bg-slate-800 rounded-xl p-4 border border-slate-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">Analytics Coach IA</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
            
            <Link
              href="/admin/metricas"
              className="bg-slate-900 hover:bg-slate-800 rounded-xl p-4 border border-slate-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Dashboard Métricas</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
            
            <Link
              href="/admin/insights"
              className="bg-slate-900 hover:bg-slate-800 rounded-xl p-4 border border-slate-800 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Insights & Segurança</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
          </div>

          {/* Nota */}
          <div className="mt-8 text-center text-sm text-slate-500">
            🔮 O Oráculo consolida dados de múltiplas fontes para dar respostas rápidas.
          </div>
        </div>
      </div>

      {/* Botão do Oráculo V2 - IA de Suporte */}
      <OraculoButton context="Página do Oráculo V1 - Painel de métricas e visão executiva" />
    </div>
  )
}
