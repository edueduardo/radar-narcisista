'use client'

/**
 * ETAPA 12.2: Relatório Básico por Cliente
 * 
 * Página onde o profissional vê uma visão consolidada de um cliente específico.
 * 
 * FUNCIONALIDADES:
 * - Resumo do cliente (nome, data de conexão, última atividade)
 * - Módulos baseados em share_* (só mostra o que foi autorizado)
 * - Métricas básicas por módulo
 * - Botão de imprimir/salvar PDF (via print do navegador)
 * 
 * ÉTICA:
 * - Aviso claro: "Não substitui parecer técnico, diagnóstico, laudo ou perícia"
 * - Só mostra dados autorizados pelo cliente
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Printer,
  Activity,
  FileText,
  MessageSquare,
  Shield,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Calendar,
  User,
  Info,
  Eye,
  EyeOff,
  Download
} from 'lucide-react'

// =============================================================================
// TIPOS
// =============================================================================

interface ClientReport {
  client: {
    id: string
    name: string
    connectedSince: string
    lastActivity: string | null
  }
  permissions: {
    share_clarity_tests: boolean
    share_journal_entries: boolean
    share_chat_summaries: boolean
    share_safety_plan: boolean
    share_risk_alerts: boolean
  }
  professionalNotes: string | null
  modules: {
    clarity?: {
      totalTests: number
      latestTest: {
        date: string
        zone: string
        score: number
      } | null
      recentTests: Array<{
        date: string
        zone: string
        score: number
      }>
      evolution: {
        direction: 'improving' | 'declining' | 'stable'
        change: number
      } | null
    }
    journal?: {
      totalEntries: number
      entriesPerWeek: number
      averageIntensity: number | null
      entryTypes: Record<string, number>
      recentEntries: Array<{
        date: string
        title: string
        type: string
        intensity: number | null
      }>
    }
    chat?: {
      totalSessions: number
      recentSessions: Array<{
        date: string
        name: string
        lastActivity: string
      }>
    }
    safetyPlan?: {
      exists: boolean
      status: string | null
      lastUpdated: string | null
    }
    riskAlerts?: {
      totalAlerts: number
      unresolvedCount: number
      recentAlerts: Array<{
        date: string
        type: string
        severity: string
        resolved: boolean
      }>
    }
  }
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function ClienteRelatorioPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const supabase = createClient()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ClientReport | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  
  // ==========================================================================
  // CARREGAR RELATÓRIO
  // ==========================================================================
  
  useEffect(() => {
    loadReport()
  }, [clientId])
  
  const loadReport = async () => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard-profissional')
        return
      }
      
      const response = await fetch(`/api/professional/reports/${clientId}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar relatório')
      }
      
      const data = await response.json()
      setReport(data.report)
      setGeneratedAt(data.generatedAt)
      
    } catch (err) {
      console.error('Erro ao carregar relatório:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handlePrint = () => {
    window.print()
  }
  
  /**
   * ETAPA 12.3: Exportar dados do cliente em CSV
   * Gera um arquivo CSV com os dados autorizados pelo cliente
   */
  const handleExportCSV = () => {
    if (!report) return
    
    const lines: string[] = []
    const now = new Date().toISOString()
    
    // Header do CSV
    lines.push('RADAR NARCISISTA - EXPORTAÇÃO DE DADOS DO CLIENTE')
    lines.push(`Cliente: ${report.client.name}`)
    lines.push(`Exportado em: ${now}`)
    lines.push('')
    lines.push('AVISO: Este material é um apoio para o profissional. Não substitui parecer técnico, diagnóstico, laudo ou perícia.')
    lines.push('')
    
    // Resumo do cliente
    lines.push('=== RESUMO DO CLIENTE ===')
    lines.push(`Nome,${report.client.name}`)
    lines.push(`Conectado desde,${formatDate(report.client.connectedSince)}`)
    lines.push(`Última atividade,${formatDate(report.client.lastActivity)}`)
    lines.push('')
    
    // Permissões
    lines.push('=== PERMISSÕES AUTORIZADAS ===')
    lines.push(`Clareza,${report.permissions.share_clarity_tests ? 'Sim' : 'Não'}`)
    lines.push(`Diário,${report.permissions.share_journal_entries ? 'Sim' : 'Não'}`)
    lines.push(`Chat,${report.permissions.share_chat_summaries ? 'Sim' : 'Não'}`)
    lines.push(`Segurança,${report.permissions.share_safety_plan ? 'Sim' : 'Não'}`)
    lines.push(`Alertas,${report.permissions.share_risk_alerts ? 'Sim' : 'Não'}`)
    lines.push('')
    
    // Módulo Clareza
    if (report.modules.clarity) {
      lines.push('=== TESTE DE CLAREZA ===')
      lines.push(`Total de testes,${report.modules.clarity.totalTests}`)
      if (report.modules.clarity.latestTest) {
        lines.push(`Última zona,${report.modules.clarity.latestTest.zone}`)
        lines.push(`Última pontuação,${report.modules.clarity.latestTest.score}`)
        lines.push(`Data último teste,${formatDate(report.modules.clarity.latestTest.date)}`)
      }
      if (report.modules.clarity.evolution) {
        lines.push(`Evolução,${report.modules.clarity.evolution.direction}`)
        lines.push(`Variação,${report.modules.clarity.evolution.change}`)
      }
      if (report.modules.clarity.recentTests.length > 0) {
        lines.push('')
        lines.push('Histórico de testes:')
        lines.push('Data,Zona,Pontuação')
        report.modules.clarity.recentTests.forEach(t => {
          lines.push(`${formatDate(t.date)},${t.zone},${t.score}`)
        })
      }
      lines.push('')
    }
    
    // Módulo Diário
    if (report.modules.journal) {
      lines.push('=== DIÁRIO ===')
      lines.push(`Total de entradas,${report.modules.journal.totalEntries}`)
      lines.push(`Entradas por semana,${report.modules.journal.entriesPerWeek.toFixed(1)}`)
      if (report.modules.journal.averageIntensity !== null) {
        lines.push(`Intensidade média,${report.modules.journal.averageIntensity.toFixed(1)}`)
      }
      if (report.modules.journal.recentEntries.length > 0) {
        lines.push('')
        lines.push('Entradas recentes:')
        lines.push('Data,Título,Tipo,Intensidade')
        report.modules.journal.recentEntries.forEach(e => {
          const title = e.title.replace(/,/g, ';').replace(/\n/g, ' ')
          lines.push(`${formatDate(e.date)},"${title}",${e.type},${e.intensity || 'N/A'}`)
        })
      }
      lines.push('')
    }
    
    // Módulo Chat
    if (report.modules.chat) {
      lines.push('=== CHAT ===')
      lines.push(`Total de sessões,${report.modules.chat.totalSessions}`)
      if (report.modules.chat.recentSessions.length > 0) {
        lines.push('')
        lines.push('Sessões recentes:')
        lines.push('Data,Nome,Última atividade')
        report.modules.chat.recentSessions.forEach(s => {
          lines.push(`${formatDate(s.date)},${s.name},${formatDateTime(s.lastActivity)}`)
        })
      }
      lines.push('')
    }
    
    // Módulo Segurança
    if (report.modules.safetyPlan) {
      lines.push('=== PLANO DE SEGURANÇA ===')
      lines.push(`Possui plano,${report.modules.safetyPlan.exists ? 'Sim' : 'Não'}`)
      if (report.modules.safetyPlan.status) {
        lines.push(`Status,${report.modules.safetyPlan.status}`)
      }
      if (report.modules.safetyPlan.lastUpdated) {
        lines.push(`Última atualização,${formatDate(report.modules.safetyPlan.lastUpdated)}`)
      }
      lines.push('')
    }
    
    // Módulo Alertas
    if (report.modules.riskAlerts) {
      lines.push('=== ALERTAS DE RISCO ===')
      lines.push(`Total de alertas,${report.modules.riskAlerts.totalAlerts}`)
      lines.push(`Não resolvidos,${report.modules.riskAlerts.unresolvedCount}`)
      if (report.modules.riskAlerts.recentAlerts.length > 0) {
        lines.push('')
        lines.push('Alertas recentes:')
        lines.push('Data,Tipo,Severidade,Resolvido')
        report.modules.riskAlerts.recentAlerts.forEach(a => {
          lines.push(`${formatDate(a.date)},${a.type},${a.severity},${a.resolved ? 'Sim' : 'Não'}`)
        })
      }
      lines.push('')
    }
    
    // Gerar e baixar arquivo
    const csvContent = lines.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `radar-cliente-${report.client.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  // ==========================================================================
  // HELPERS
  // ==========================================================================
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getZoneColor = (zone: string) => {
    switch (zone?.toLowerCase()) {
      case 'verde':
      case 'green':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'amarelo':
      case 'yellow':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'vermelho':
      case 'red':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getEvolutionIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }
  
  // ==========================================================================
  // LOADING / ERROR
  // ==========================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando relatório...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao carregar relatório
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/dashboard-profissional"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  if (!report) return null
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 print:py-4">
        {/* Header - esconde no print */}
        <div className="mb-6 print:hidden">
          <Link 
            href="/dashboard-profissional" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Relatório: {report.client.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerado em {formatDateTime(generatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                title="Exportar dados em CSV"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
        
        {/* Header para impressão */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Radar Narcisista - Relatório de Acompanhamento
          </h1>
          <p className="text-sm text-gray-600">
            Cliente: {report.client.name} | Gerado em: {formatDateTime(generatedAt)}
          </p>
        </div>
        
        {/* Aviso ético */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl print:border print:border-amber-300">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Aviso Importante</p>
              <p className="text-xs">
                Este relatório é uma <strong>visão de apoio</strong> baseada em dados auto-relatados.
                <strong> Não substitui</strong> parecer técnico, diagnóstico, laudo ou perícia profissional.
                O profissional continua responsável pela interpretação e decisões clínicas.
              </p>
            </div>
          </div>
        </div>
        
        {/* Resumo do Cliente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 print:shadow-none print:border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Resumo do Cliente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nome</p>
              <p className="font-medium text-gray-900 dark:text-white">{report.client.name}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Conectado desde</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(report.client.connectedSince)}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Última atividade</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(report.client.lastActivity)}</p>
            </div>
          </div>
          
          {/* Permissões */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Dados autorizados pelo cliente:</p>
            <div className="flex flex-wrap gap-2">
              {report.permissions.share_clarity_tests && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Eye className="w-3 h-3" /> Clareza
                </span>
              )}
              {report.permissions.share_journal_entries && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Eye className="w-3 h-3" /> Diário
                </span>
              )}
              {report.permissions.share_chat_summaries && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Eye className="w-3 h-3" /> Chat
                </span>
              )}
              {report.permissions.share_safety_plan && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Eye className="w-3 h-3" /> Segurança
                </span>
              )}
              {report.permissions.share_risk_alerts && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Eye className="w-3 h-3" /> Alertas
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Módulos */}
        <div className="space-y-6">
          {/* Módulo: Teste de Clareza */}
          {report.modules.clarity && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 print:shadow-none print:border print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Teste de Clareza
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{report.modules.clarity.totalTests}</p>
                  <p className="text-xs text-gray-500">Testes realizados</p>
                </div>
                
                {report.modules.clarity.latestTest && (
                  <>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                      <p className={`text-lg font-bold px-2 py-1 rounded ${getZoneColor(report.modules.clarity.latestTest.zone)}`}>
                        {report.modules.clarity.latestTest.zone}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Última zona</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {report.modules.clarity.latestTest.score}
                      </p>
                      <p className="text-xs text-gray-500">Última pontuação</p>
                    </div>
                  </>
                )}
                
                {report.modules.clarity.evolution && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getEvolutionIcon(report.modules.clarity.evolution.direction)}
                      <span className={`text-lg font-bold ${
                        report.modules.clarity.evolution.direction === 'improving' ? 'text-green-600' :
                        report.modules.clarity.evolution.direction === 'declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {report.modules.clarity.evolution.change > 0 ? '+' : ''}{report.modules.clarity.evolution.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Evolução</p>
                  </div>
                )}
              </div>
              
              {report.modules.clarity.recentTests.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Histórico recente:</p>
                  <div className="flex flex-wrap gap-2">
                    {report.modules.clarity.recentTests.map((test, i) => (
                      <div key={i} className={`px-3 py-1 rounded-lg text-xs ${getZoneColor(test.zone)}`}>
                        {formatDate(test.date)}: {test.zone} ({test.score})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Módulo: Diário */}
          {report.modules.journal && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 print:shadow-none print:border print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Diário
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{report.modules.journal.totalEntries}</p>
                  <p className="text-xs text-gray-500">Total de entradas</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.modules.journal.entriesPerWeek}
                  </p>
                  <p className="text-xs text-gray-500">Entradas/semana</p>
                </div>
                {report.modules.journal.averageIntensity !== null && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.modules.journal.averageIntensity}/10
                    </p>
                    <p className="text-xs text-gray-500">Intensidade média</p>
                  </div>
                )}
              </div>
              
              {report.modules.journal.recentEntries.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entradas recentes:</p>
                  <div className="space-y-2">
                    {report.modules.journal.recentEntries.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{formatDate(entry.date)}</span>
                          <span className="text-gray-900 dark:text-white">{entry.title}</span>
                        </div>
                        {entry.intensity && (
                          <span className="text-xs text-gray-500">Intensidade: {entry.intensity}/10</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Módulo: Chat */}
          {report.modules.chat && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 print:shadow-none print:border print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Conversas com IA
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{report.modules.chat.totalSessions}</p>
                  <p className="text-xs text-gray-500">Total de sessões</p>
                </div>
              </div>
              
              {report.modules.chat.recentSessions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sessões recentes:</p>
                  <div className="space-y-2">
                    {report.modules.chat.recentSessions.map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                        <span className="text-gray-900 dark:text-white">{session.name}</span>
                        <span className="text-xs text-gray-500">{formatDate(session.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Módulo: Plano de Segurança */}
          {report.modules.safetyPlan && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 print:shadow-none print:border print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Plano de Segurança
              </h2>
              
              <div className="flex items-center gap-4">
                {report.modules.safetyPlan.exists ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Plano criado</span>
                    </div>
                    {report.modules.safetyPlan.lastUpdated && (
                      <span className="text-sm text-gray-500">
                        Última atualização: {formatDate(report.modules.safetyPlan.lastUpdated)}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <XCircle className="w-5 h-5" />
                    <span>Nenhum plano de segurança criado</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Módulo: Alertas de Risco */}
          {report.modules.riskAlerts && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 print:shadow-none print:border print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                Alertas de Risco
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{report.modules.riskAlerts.totalAlerts}</p>
                  <p className="text-xs text-gray-500">Total de alertas</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.modules.riskAlerts.unresolvedCount}
                  </p>
                  <p className="text-xs text-gray-500">Não resolvidos</p>
                </div>
              </div>
              
              {report.modules.riskAlerts.recentAlerts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alertas recentes:</p>
                  <div className="space-y-2">
                    {report.modules.riskAlerts.recentAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${alert.resolved ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-gray-900 dark:text-white">{alert.type}</span>
                          <span className="text-xs text-gray-500">({alert.severity})</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(alert.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Notas do profissional */}
        {report.professionalNotes && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 print:shadow-none print:border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Suas Notas
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {report.professionalNotes}
            </p>
          </div>
        )}
        
        {/* Rodapé para impressão */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p>Radar Narcisista - Relatório de Acompanhamento</p>
          <p>Este documento é confidencial e destinado exclusivamente ao profissional responsável.</p>
        </div>
      </div>
    </div>
  )
}
