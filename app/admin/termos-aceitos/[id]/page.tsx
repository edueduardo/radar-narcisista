'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Skull, 
  ChevronLeft, 
  Download, 
  Printer, 
  FileText,
  Shield,
  Clock,
  User,
  Globe,
  Hash,
  Monitor,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  FileDown
} from 'lucide-react'

// ============================================================================
// PÁGINA ADMIN: DETALHE DO ACEITE DE TERMOS
// Exibe todos os dados para cadeia de custódia e prova pericial
// Com opções de exportar PDF, TXT e imprimir
// ============================================================================

interface AcceptanceDetail {
  id: string
  user_id: string
  user_email?: string
  accepted_at: string
  ip_address?: string
  ip_hash?: string
  user_agent?: string
  locale?: string
  platform?: string
  referrer?: string
  timezone?: string
  screen_resolution?: string
  event_hash: string
  acceptance_context?: any
  canonical_payload?: any
  terms_versions?: {
    id: string
    slug: string
    title: string
    version_number: string
    content_md: string
    content_hash: string
    published_at: string
  }
  fallback?: boolean
}

export default function TermosAceitosDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<AcceptanceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    loadDetail()
  }, [params.id])

  const loadDetail = async () => {
    try {
      const res = await fetch(`/api/admin/terms-acceptances/${params.id}`)
      const json = await res.json()
      
      if (json.error) {
        console.error('Erro:', json.error)
        return
      }

      setData(json.data)
    } catch (error) {
      console.error('Erro ao carregar detalhe:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  const formatDateISO = (dateStr: string) => {
    return new Date(dateStr).toISOString()
  }

  const copyHash = async () => {
    if (data?.event_hash) {
      await navigator.clipboard.writeText(data.event_hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const buildPlainTextReport = (): string => {
    if (!data) return ''

    return [
      '================================================================================',
      'RADAR NARCISISTA BR - RELATÓRIO DE ACEITE DE TERMOS',
      'CADEIA DE CUSTÓDIA PARA PROVA PERICIAL',
      '================================================================================',
      '',
      'DADOS DO REGISTRO',
      '-----------------',
      `ID do registro: ${data.id}`,
      `Data/Hora (UTC): ${formatDateISO(data.accepted_at)}`,
      `Data/Hora (Local): ${formatDate(data.accepted_at)}`,
      '',
      'DADOS DO USUÁRIO',
      '-----------------',
      `ID do usuário: ${data.user_id}`,
      `Email: ${data.user_email || 'N/A'}`,
      '',
      'DADOS TÉCNICOS (CADEIA DE CUSTÓDIA)',
      '------------------------------------',
      `IP (Hash SHA-256): ${data.ip_hash || 'N/A'}`,
      `User-Agent: ${data.user_agent || 'N/A'}`,
      `Locale: ${data.locale || 'N/A'}`,
      `Plataforma: ${data.platform || 'N/A'}`,
      `Fuso horário: ${data.timezone || 'N/A'}`,
      `Referrer: ${data.referrer || 'N/A'}`,
      '',
      'VERSÃO DOS TERMOS',
      '-----------------',
      `Título: ${data.terms_versions?.title || 'N/A'}`,
      `Versão: ${data.terms_versions?.version_number || 'N/A'}`,
      `Slug: ${data.terms_versions?.slug || 'N/A'}`,
      `Hash do conteúdo: ${data.terms_versions?.content_hash || 'N/A'}`,
      '',
      'HASH DO EVENTO (PROVA DE INTEGRIDADE)',
      '--------------------------------------',
      `SHA-256: ${data.event_hash}`,
      '',
      'INSTRUÇÕES PARA VERIFICAÇÃO PERICIAL:',
      '1. Obtenha o payload canônico (JSON) deste registro',
      '2. Compute o SHA-256 do payload',
      '3. Compare com o hash acima',
      '4. Se os hashes coincidirem, o registro não foi alterado',
      '',
      'CONTEXTO DO ACEITE (CHECKBOXES)',
      '--------------------------------',
      JSON.stringify(data.acceptance_context, null, 2),
      '',
      data.canonical_payload ? [
        'PAYLOAD CANÔNICO (PARA VERIFICAÇÃO)',
        '------------------------------------',
        JSON.stringify(data.canonical_payload, null, 2),
      ].join('\n') : '',
      '',
      '================================================================================',
      'Este documento foi gerado automaticamente pelo Radar Narcisista BR.',
      'Ele não substitui análise jurídica ou pericial independente.',
      `Gerado em: ${new Date().toISOString()}`,
      '================================================================================',
    ].join('\n')
  }

  const handleDownloadTxt = () => {
    const report = buildPlainTextReport()
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `radar-termos-${data?.id || 'unknown'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  // Gerar PDF automático usando canvas
  const handleGeneratePdf = async () => {
    if (!data) return
    
    setGeneratingPdf(true)
    
    try {
      // Importar jsPDF dinamicamente
      const { default: jsPDF } = await import('jspdf')
      
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      let y = 20
      
      // Função auxiliar para adicionar texto com quebra de linha
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
        
        // Verificar se precisa de nova página
        if (y + (lines.length * fontSize * 0.4) > 280) {
          doc.addPage()
          y = 20
        }
        
        doc.text(lines, margin, y)
        y += lines.length * fontSize * 0.4 + 2
      }
      
      const addLine = () => {
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, y, pageWidth - margin, y)
        y += 5
      }
      
      // Cabeçalho
      doc.setFillColor(127, 29, 29) // red-900
      doc.rect(0, 0, pageWidth, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RADAR NARCISISTA BR', margin, 15)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('RELATÓRIO DE ACEITE DE TERMOS - CADEIA DE CUSTÓDIA', margin, 25)
      
      y = 45
      doc.setTextColor(0, 0, 0)
      
      // Dados do registro
      addText('DADOS DO REGISTRO', 14, true)
      addLine()
      addText(`ID do registro: ${data.id}`)
      addText(`Data/Hora (UTC): ${formatDateISO(data.accepted_at)}`)
      addText(`Data/Hora (Local): ${formatDate(data.accepted_at)}`)
      y += 5
      
      // Dados do usuário
      addText('DADOS DO USUÁRIO', 14, true)
      addLine()
      addText(`ID do usuário: ${data.user_id}`)
      addText(`Email: ${data.user_email || 'N/A'}`)
      y += 5
      
      // Dados técnicos
      addText('DADOS TÉCNICOS (CADEIA DE CUSTÓDIA)', 14, true)
      addLine()
      addText(`IP (Hash SHA-256): ${data.ip_hash || 'N/A'}`)
      addText(`User-Agent: ${data.user_agent || 'N/A'}`)
      addText(`Locale: ${data.locale || 'N/A'}`)
      addText(`Plataforma: ${data.platform || 'N/A'}`)
      addText(`Fuso horário: ${data.timezone || 'N/A'}`)
      addText(`Referrer: ${data.referrer || 'N/A'}`)
      y += 5
      
      // Versão dos termos
      addText('VERSÃO DOS TERMOS', 14, true)
      addLine()
      addText(`Título: ${data.terms_versions?.title || 'N/A'}`)
      addText(`Versão: ${data.terms_versions?.version_number || 'N/A'}`)
      addText(`Hash do conteúdo: ${data.terms_versions?.content_hash || 'N/A'}`)
      y += 5
      
      // Hash do evento (destaque)
      doc.setFillColor(254, 243, 199) // amber-100
      doc.rect(margin - 2, y - 2, pageWidth - margin * 2 + 4, 25, 'F')
      addText('HASH DO EVENTO (PROVA DE INTEGRIDADE)', 14, true)
      addText(`SHA-256: ${data.event_hash}`)
      y += 10
      
      // Instruções para verificação
      addText('INSTRUÇÕES PARA VERIFICAÇÃO PERICIAL:', 12, true)
      addText('1. Obtenha o payload canônico (JSON) deste registro')
      addText('2. Compute o SHA-256 do payload')
      addText('3. Compare com o hash acima')
      addText('4. Se os hashes coincidirem, o registro não foi alterado')
      y += 5
      
      // Contexto do aceite
      if (data.acceptance_context) {
        addText('CONTEXTO DO ACEITE (CHECKBOXES)', 14, true)
        addLine()
        const contextStr = JSON.stringify(data.acceptance_context, null, 2)
        doc.setFontSize(8)
        const contextLines = doc.splitTextToSize(contextStr, pageWidth - margin * 2)
        
        if (y + (contextLines.length * 3) > 280) {
          doc.addPage()
          y = 20
        }
        
        doc.text(contextLines, margin, y)
        y += contextLines.length * 3 + 5
      }
      
      // Rodapé
      const totalPages = doc.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Página ${i} de ${totalPages} | Gerado em: ${new Date().toISOString()} | Radar Narcisista BR`,
          margin,
          290
        )
      }
      
      // Salvar
      doc.save(`radar-termos-${data.id}.pdf`)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      // Fallback para impressão
      alert('Erro ao gerar PDF automaticamente. Usando impressão do navegador...')
      window.print()
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-red-300">Carregando registro...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Skull className="w-16 h-16 text-red-700 mx-auto mb-4" />
          <p className="text-red-300 text-lg">Registro não encontrado.</p>
          <Link href="/admin/termos-aceitos" className="text-red-400 hover:text-red-300 mt-4 inline-block">
            ← Voltar à lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black print:bg-white print:text-black">
      {/* Header */}
      <div className="bg-red-950/80 border-b border-red-800/50 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/admin/termos-aceitos"
              className="flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar à lista</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-2 px-3 py-2 bg-red-800/60 hover:bg-red-700 text-red-100 rounded-lg text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                TXT
              </button>
              <button
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="flex items-center gap-2 px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {generatingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    PDF
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-4 py-6 print:py-2">
        {/* Cabeçalho do documento */}
        <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-6 mb-6 print:bg-white print:border-black print:border-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-800/50 rounded-lg flex items-center justify-center print:bg-gray-200">
              <Skull className="w-7 h-7 text-red-400 print:text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-100 print:text-black">
                REGISTRO DE ACEITE DE TERMOS
              </h1>
              <p className="text-sm text-red-400 print:text-gray-600">
                Cadeia de custódia para prova pericial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-red-300 print:text-gray-700">
            <Shield className="w-4 h-4" />
            <span>ID: <span className="font-mono">{data.id}</span></span>
          </div>
        </div>

        {/* Dados principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Data/Hora */}
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-5 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-red-400 print:text-black" />
              <h2 className="font-semibold text-red-100 print:text-black">Data e Hora do Aceite</h2>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-red-400 print:text-gray-500">Local (Brasil)</p>
                <p className="text-red-100 print:text-black font-medium">{formatDate(data.accepted_at)}</p>
              </div>
              <div>
                <p className="text-xs text-red-400 print:text-gray-500">UTC (ISO 8601)</p>
                <p className="text-red-200 print:text-gray-700 font-mono text-sm">{formatDateISO(data.accepted_at)}</p>
              </div>
            </div>
          </div>

          {/* Usuário */}
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-5 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-red-400 print:text-black" />
              <h2 className="font-semibold text-red-100 print:text-black">Usuário</h2>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-red-400 print:text-gray-500">Email</p>
                <p className="text-red-100 print:text-black font-medium">{data.user_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-red-400 print:text-gray-500">ID do usuário</p>
                <p className="text-red-200 print:text-gray-700 font-mono text-sm break-all">{data.user_id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hash do Evento (destaque) */}
        <div className="bg-red-900/60 rounded-xl border-2 border-red-600/50 p-5 mb-6 print:bg-gray-100 print:border-black">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-red-400 print:text-black" />
              <h2 className="font-semibold text-red-100 print:text-black">Hash SHA-256 (Prova de Integridade)</h2>
            </div>
            <button
              onClick={copyHash}
              className="flex items-center gap-1 px-2 py-1 bg-red-800/60 hover:bg-red-700 text-red-200 rounded text-xs print:hidden"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p className="text-red-100 print:text-black font-mono text-sm break-all bg-red-950/50 p-3 rounded-lg print:bg-white print:border print:border-gray-300">
            {data.event_hash}
          </p>
          <p className="text-xs text-red-400 print:text-gray-600 mt-2">
            Este hash foi gerado no momento do aceite e pode ser verificado por peritos para comprovar que o registro não foi alterado.
          </p>
        </div>

        {/* Dados técnicos */}
        <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-5 mb-6 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-red-400 print:text-black" />
            <h2 className="font-semibold text-red-100 print:text-black">Dados Técnicos (Cadeia de Custódia)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-red-400 print:text-gray-500">IP (Hash SHA-256 para LGPD)</p>
              <p className="text-red-200 print:text-gray-700 font-mono text-xs break-all">{data.ip_hash || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-red-400 print:text-gray-500">Plataforma</p>
              <p className="text-red-200 print:text-gray-700">{data.platform || 'web'}</p>
            </div>
            <div>
              <p className="text-xs text-red-400 print:text-gray-500">Locale</p>
              <p className="text-red-200 print:text-gray-700">{data.locale || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-red-400 print:text-gray-500">Fuso horário</p>
              <p className="text-red-200 print:text-gray-700">{data.timezone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-red-400 print:text-gray-500">User-Agent</p>
              <p className="text-red-200 print:text-gray-700 font-mono text-xs break-all">{data.user_agent || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-red-400 print:text-gray-500">Referrer (origem)</p>
              <p className="text-red-200 print:text-gray-700 text-sm">{data.referrer || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Versão dos termos */}
        {data.terms_versions && (
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-5 mb-6 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-red-400 print:text-black" />
              <h2 className="font-semibold text-red-100 print:text-black">Versão dos Termos Aceitos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-red-400 print:text-gray-500">Título</p>
                <p className="text-red-100 print:text-black font-medium">{data.terms_versions.title}</p>
              </div>
              <div>
                <p className="text-xs text-red-400 print:text-gray-500">Versão</p>
                <p className="text-red-200 print:text-gray-700">{data.terms_versions.version_number}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-red-400 print:text-gray-500">Hash do conteúdo dos termos</p>
                <p className="text-red-200 print:text-gray-700 font-mono text-xs break-all">{data.terms_versions.content_hash}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contexto do aceite */}
        <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-5 mb-6 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-red-400 print:text-black" />
            <h2 className="font-semibold text-red-100 print:text-black">Contexto do Aceite (Checkboxes)</h2>
          </div>
          <pre className="text-red-200 print:text-gray-700 font-mono text-xs bg-red-950/50 p-4 rounded-lg overflow-auto max-h-60 print:bg-gray-100 print:max-h-none">
            {JSON.stringify(data.acceptance_context, null, 2)}
          </pre>
        </div>

        {/* Payload canônico */}
        {data.canonical_payload && (
          <div className="bg-red-950/60 rounded-xl border border-red-800/40 p-5 mb-6 print:bg-white print:border-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-400 print:text-black" />
              <h2 className="font-semibold text-red-100 print:text-black">Payload Canônico (Para Verificação Pericial)</h2>
            </div>
            <p className="text-xs text-red-400 print:text-gray-600 mb-3">
              Este é o JSON exato usado para gerar o hash SHA-256. Peritos podem recomputar o hash para verificar integridade.
            </p>
            <pre className="text-red-200 print:text-gray-700 font-mono text-xs bg-red-950/50 p-4 rounded-lg overflow-auto max-h-80 print:bg-gray-100 print:max-h-none">
              {JSON.stringify(data.canonical_payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Aviso legal */}
        <div className="bg-red-900/40 rounded-xl border border-red-700/40 p-5 print:bg-gray-100 print:border-gray-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 print:text-black flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-100 print:text-black mb-2">Aviso Legal</h3>
              <p className="text-sm text-red-300 print:text-gray-700">
                Este documento é um registro técnico do aceite de termos realizado no Radar Narcisista BR.
                Ele contém informações para cadeia de custódia e pode ser usado como evidência em processos judiciais.
                No entanto, ele não substitui análise jurídica ou pericial independente.
                A validade jurídica final depende de lei, advogado e juiz.
              </p>
              <p className="text-xs text-red-400 print:text-gray-500 mt-3">
                Documento gerado em: {new Date().toISOString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
