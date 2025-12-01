'use client'

/**
 * Exportação de Relatórios
 * ETAPA 44 - Exportar dados em CSV, JSON e PDF
 */

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Calendar,
  Filter,
  Loader2,
  CheckCircle,
  Globe,
  BarChart3,
  Zap,
  Users
} from 'lucide-react'

type ExportFormat = 'csv' | 'json' | 'pdf'
type ExportType = 'queries' | 'tokens' | 'instances' | 'billing' | 'full'

interface ExportOption {
  id: ExportType
  title: string
  description: string
  icon: React.ReactNode
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'queries',
    title: 'Logs de Queries',
    description: 'Todas as perguntas e respostas do período',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'tokens',
    title: 'Consumo de Tokens',
    description: 'Uso de tokens por dia e por instância',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'instances',
    title: 'Dados de Instâncias',
    description: 'Configurações e métricas de cada instância',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'billing',
    title: 'Relatório Financeiro',
    description: 'Receitas, planos e faturas',
    icon: <FileSpreadsheet className="w-5 h-5" />
  },
  {
    id: 'full',
    title: 'Relatório Completo',
    description: 'Todos os dados consolidados',
    icon: <FileText className="w-5 h-5" />
  }
]

export default function ExportPage() {
  const [selectedType, setSelectedType] = useState<ExportType>('full')
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [instanceFilter, setInstanceFilter] = useState<string>('all')
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  // Definir datas padrão (últimos 30 dias)
  useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    })
  })

  const handleExport = async () => {
    setExporting(true)
    setExported(false)

    // Simular exportação
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Gerar dados de exemplo
    const data = generateExportData(selectedType, dateRange)
    
    // Download baseado no formato
    if (selectedFormat === 'csv') {
      downloadCSV(data, `oraculo-${selectedType}-${dateRange.start}-${dateRange.end}.csv`)
    } else if (selectedFormat === 'json') {
      downloadJSON(data, `oraculo-${selectedType}-${dateRange.start}-${dateRange.end}.json`)
    } else {
      // PDF - abrir em nova aba para impressão
      openPDFPreview(data, selectedType)
    }

    setExporting(false)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const generateExportData = (type: ExportType, range: { start: string; end: string }): Record<string, unknown> => {
    // Dados de exemplo
    const baseData = {
      exportedAt: new Date().toISOString(),
      period: range,
      type
    }

    switch (type) {
      case 'queries':
        return {
          ...baseData,
          totalQueries: 12847,
          successRate: 98.5,
          avgResponseTime: 1234,
          queries: Array.from({ length: 100 }, (_, i) => ({
            id: `req_${Date.now()}_${i}`,
            date: new Date(Date.now() - i * 3600000).toISOString(),
            instance: 'radar-narcisista',
            question: `Pergunta de exemplo ${i + 1}`,
            tokens: Math.floor(Math.random() * 500) + 100,
            responseTime: Math.floor(Math.random() * 2000) + 500,
            status: Math.random() > 0.02 ? 'success' : 'error'
          }))
        }

      case 'tokens':
        return {
          ...baseData,
          totalTokens: 5200000,
          totalCost: 156.00,
          dailyUsage: Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return {
              date: date.toISOString().split('T')[0],
              tokensInput: Math.floor(Math.random() * 100000) + 50000,
              tokensOutput: Math.floor(Math.random() * 50000) + 25000,
              cost: (Math.random() * 10 + 2).toFixed(2)
            }
          })
        }

      case 'instances':
        return {
          ...baseData,
          totalInstances: 4,
          activeInstances: 4,
          instances: [
            { slug: 'radar-narcisista', name: 'Radar Narcisista', status: 'active', queries: 8500, tokens: 3200000 },
            { slug: 'clinica-saude', name: 'Clínica Saúde Mental', status: 'active', queries: 2100, tokens: 980000 },
            { slug: 'coach-emocional', name: 'Coach Emocional', status: 'active', queries: 1500, tokens: 720000 },
            { slug: 'escritorio-adv', name: 'Escritório Advocacia', status: 'active', queries: 747, tokens: 300000 }
          ]
        }

      case 'billing':
        return {
          ...baseData,
          totalRevenue: 4850,
          currency: 'BRL',
          subscriptions: [
            { instance: 'Clínica Saúde Mental', plan: 'Pro', amount: 1490, status: 'active' },
            { instance: 'Coach Emocional', plan: 'Starter', amount: 490, status: 'active' },
            { instance: 'Escritório Advocacia', plan: 'Starter', amount: 490, status: 'active' }
          ],
          invoices: Array.from({ length: 10 }, (_, i) => ({
            id: `inv_${i + 1}`,
            date: new Date(Date.now() - i * 2592000000).toISOString().split('T')[0],
            instance: ['Clínica Saúde Mental', 'Coach Emocional', 'Escritório Advocacia'][i % 3],
            amount: [1490, 490, 490][i % 3],
            status: 'paid'
          }))
        }

      default: // full
        return {
          ...baseData,
          summary: {
            totalQueries: 12847,
            totalTokens: 5200000,
            totalRevenue: 4850,
            activeInstances: 4,
            successRate: 98.5
          },
          queries: generateExportData('queries', range),
          tokens: generateExportData('tokens', range),
          instances: generateExportData('instances', range),
          billing: generateExportData('billing', range)
        }
    }
  }

  const downloadCSV = (data: Record<string, unknown>, filename: string) => {
    let csv = ''
    
    // Converter dados para CSV
    if (selectedType === 'queries' && Array.isArray((data as { queries?: unknown[] }).queries)) {
      const queries = (data as { queries: Record<string, unknown>[] }).queries
      const headers = Object.keys(queries[0] || {})
      csv = headers.join(',') + '\n'
      csv += queries.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(',')).join('\n')
    } else {
      // Formato genérico
      csv = JSON.stringify(data, null, 2)
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const downloadJSON = (data: Record<string, unknown>, filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const openPDFPreview = (data: Record<string, unknown>, type: ExportType) => {
    // Criar HTML para impressão
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Oráculo - ${type}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #8b5cf6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .summary-card { background: #f9fafb; padding: 20px; border-radius: 8px; flex: 1; }
          .summary-value { font-size: 24px; font-weight: bold; color: #8b5cf6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📊 Relatório Oráculo</h1>
        <p>Tipo: ${type} | Período: ${dateRange.start} a ${dateRange.end}</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        
        <div class="summary">
          <div class="summary-card">
            <div class="summary-value">12,847</div>
            <div>Total de Queries</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">5.2M</div>
            <div>Tokens Consumidos</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">R$ 4.850</div>
            <div>Receita Total</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">98.5%</div>
            <div>Taxa de Sucesso</div>
          </div>
        </div>
        
        <h2>Dados Detalhados</h2>
        <pre style="background: #f5f5f5; padding: 20px; overflow: auto; max-height: 400px;">
${JSON.stringify(data, null, 2)}
        </pre>
        
        <script>window.print();</script>
      </body>
      </html>
    `
    
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/analytics-dashboard" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Download className="w-6 h-6 text-purple-400" />
            Exportar Relatórios
          </h1>
          <p className="text-gray-400">Baixe dados em CSV, JSON ou PDF</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tipo de Relatório */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-400" />
            Tipo de Relatório
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXPORT_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedType === option.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    selectedType === option.id ? 'bg-purple-500/30 text-purple-400' : 'bg-slate-600 text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                  <span className="font-medium">{option.title}</span>
                </div>
                <p className="text-sm text-gray-400">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Período */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Período
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data Final</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            {/* Atalhos */}
            <div className="flex items-end gap-2">
              {[
                { label: '7 dias', days: 7 },
                { label: '30 dias', days: 30 },
                { label: '90 dias', days: 90 }
              ].map(preset => (
                <button
                  key={preset.days}
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - preset.days)
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    })
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formato */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Formato de Exportação</h2>
          
          <div className="flex gap-4">
            {[
              { id: 'csv' as const, label: 'CSV', icon: <FileSpreadsheet className="w-5 h-5" />, desc: 'Excel, Google Sheets' },
              { id: 'json' as const, label: 'JSON', icon: <FileJson className="w-5 h-5" />, desc: 'Desenvolvedores, APIs' },
              { id: 'pdf' as const, label: 'PDF', icon: <FileText className="w-5 h-5" />, desc: 'Impressão, relatórios' }
            ].map(format => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                  selectedFormat === format.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-2 ${
                  selectedFormat === format.id ? 'bg-purple-500/30 text-purple-400' : 'bg-slate-600 text-gray-400'
                }`}>
                  {format.icon}
                </div>
                <p className="font-medium">{format.label}</p>
                <p className="text-xs text-gray-400">{format.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Exportar */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            exported
              ? 'bg-green-600'
              : 'bg-purple-600 hover:bg-purple-700'
          } disabled:opacity-50`}
        >
          {exporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exportando...
            </>
          ) : exported ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Exportado com sucesso!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Exportar {selectedFormat.toUpperCase()}
            </>
          )}
        </button>

        {/* Info */}
        <p className="text-center text-sm text-gray-400">
          Os dados serão exportados de acordo com os filtros selecionados.
          Relatórios grandes podem levar alguns segundos.
        </p>
      </div>
    </div>
  )
}
