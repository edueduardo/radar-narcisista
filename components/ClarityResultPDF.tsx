'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FileDown, 
  Printer, 
  Copy, 
  Loader2,
  CheckCircle2,
  Shield,
  Hash,
  Calendar,
  Clock,
  Monitor,
  User
} from 'lucide-react'
import type { UnifiedResult } from '@/lib/clarity-unified-config'

// =============================================================================
// COMPONENTE DE EXPORTAÇÃO PDF/IMPRESSÃO DO RESULTADO
// Inclui cadeia de custódia completa
// =============================================================================

interface ClarityResultPDFProps {
  result: UnifiedResult
  testDate: string
  isDarkMode: boolean
}

interface TermsAcceptance {
  accepted_at: string
  event_hash: string
  ip_address: string
  user_agent: string
  timezone: string
  locale: string
  screen_resolution: string
  platform: string
  terms_version: {
    title: string
    version_number: string
    content_md: string
  }
}

interface UserProfile {
  email: string
  full_name?: string
}

export default function ClarityResultPDF({ result, testDate, isDarkMode }: ClarityResultPDFProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [termsAcceptance, setTermsAcceptance] = useState<TermsAcceptance | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [copied, setCopied] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadTermsAndUser()
  }, [])

  const loadTermsAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserProfile({
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
      })

      // Buscar aceite de termos mais recente
      const { data, error } = await supabase
        .from('terms_acceptances')
        .select(`
          accepted_at,
          event_hash,
          ip_address,
          user_agent,
          timezone,
          locale,
          screen_resolution,
          platform,
          terms_version:terms_version_id (
            title,
            version_number,
            content_md
          )
        `)
        .eq('user_id', user.id)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setTermsAcceptance(data as any)
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  // Gerar conteúdo do PDF/Impressão
  const generatePDFContent = () => {
    const now = new Date()
    const zoneConfig = getZoneLabel(result.globalZone)
    
    let content = `
═══════════════════════════════════════════════════════════════════════════════
                    RADAR NARCISISTA BR - RESULTADO DO TESTE DE CLAREZA
═══════════════════════════════════════════════════════════════════════════════

📅 Data do Teste: ${testDate}
📅 Data de Geração: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}

───────────────────────────────────────────────────────────────────────────────
                              RESULTADO GERAL
───────────────────────────────────────────────────────────────────────────────

🎯 ZONA GLOBAL: ${zoneConfig.label.toUpperCase()}
📊 Pontuação: ${Math.round(result.overallPercentage * 100)}%
${result.hasPhysicalRisk ? '⚠️ ALERTA: Indicadores de risco físico detectados' : ''}

───────────────────────────────────────────────────────────────────────────────
                            ANÁLISE POR EIXO
───────────────────────────────────────────────────────────────────────────────
`

    for (const axis of result.axisScores) {
      const axisLabel = axis.axis === 'nevoa' ? 'Névoa Mental' : 
                        axis.axis === 'medo' ? 'Medo/Tensão' : 'Desrespeito a Limites'
      content += `
${axisLabel}: ${Math.round(axis.percentage * 100)}%
  └─ Nível: ${axis.level.toUpperCase()}
`
    }

    content += `
───────────────────────────────────────────────────────────────────────────────
                          ANÁLISE POR CATEGORIA
───────────────────────────────────────────────────────────────────────────────
`

    for (const cat of result.categoryScores) {
      const catLabel = getCategoryLabel(cat.category)
      content += `
${catLabel}: ${Math.round(cat.percentage * 100)}%
`
    }

    if (result.highlightedProblems.length > 0) {
      content += `
───────────────────────────────────────────────────────────────────────────────
                          PROBLEMAS EM DESTAQUE
───────────────────────────────────────────────────────────────────────────────
`
      for (const problem of result.highlightedProblems) {
        content += `• ${problem}\n`
      }
    }

    // Adicionar cadeia de custódia
    content += `

═══════════════════════════════════════════════════════════════════════════════
                          CADEIA DE CUSTÓDIA
═══════════════════════════════════════════════════════════════════════════════
`

    if (userProfile) {
      content += `
👤 USUÁRIO
   Nome: ${userProfile.full_name || 'Não informado'}
   Email: ${userProfile.email}
`
    }

    if (termsAcceptance) {
      const acceptedDate = new Date(termsAcceptance.accepted_at)
      content += `
📜 TERMO DE RESPONSABILIDADE ACEITO
   Título: ${termsAcceptance.terms_version.title}
   Data do Aceite: ${acceptedDate.toLocaleDateString('pt-BR')} às ${acceptedDate.toLocaleTimeString('pt-BR')}
   Data UTC: ${termsAcceptance.accepted_at}
   
🔐 DADOS TÉCNICOS DO ACEITE
   Dispositivo: ${parseDevice(termsAcceptance.user_agent)} (${termsAcceptance.platform})
   Resolução: ${termsAcceptance.screen_resolution}
   Fuso Horário: ${termsAcceptance.timezone}
   Idioma: ${termsAcceptance.locale}
   
🔒 HASH SHA-256 (Prova de Integridade)
   ${termsAcceptance.event_hash}
`
    }

    content += `
───────────────────────────────────────────────────────────────────────────────
                        TERMO DE RESPONSABILIDADE
───────────────────────────────────────────────────────────────────────────────
`

    if (termsAcceptance?.terms_version?.content_md) {
      // Converter markdown para texto simples
      content += termsAcceptance.terms_version.content_md
        .replace(/^# /gm, '\n')
        .replace(/^## /gm, '\n')
        .replace(/\*\*/g, '')
        .replace(/- \*\*/g, '• ')
    }

    content += `

═══════════════════════════════════════════════════════════════════════════════
                              AVISOS LEGAIS
═══════════════════════════════════════════════════════════════════════════════

⚠️ IMPORTANTE:
• Este documento NÃO constitui diagnóstico clínico, parecer psicológico ou prova judicial.
• O teste reflete apenas a perspectiva unilateral do usuário.
• Não substitui acompanhamento profissional de psicólogo, psiquiatra ou advogado.
• O hash SHA-256 garante a integridade deste documento para fins de auditoria.

📞 CONTATOS DE EMERGÊNCIA:
• 190 - Polícia Militar
• 180 - Central de Atendimento à Mulher
• 188 - CVV (Centro de Valorização da Vida)

═══════════════════════════════════════════════════════════════════════════════
Documento gerado automaticamente pelo Radar Narcisista BR
https://radarnarcisista.com.br
═══════════════════════════════════════════════════════════════════════════════
`

    return content
  }

  // Baixar como PDF (usando print to PDF)
  const handleDownloadPDF = () => {
    setIsLoading(true)
    
    // Criar janela de impressão com conteúdo formatado
    const content = generatePDFContent()
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resultado Teste de Clareza - Radar Narcisista BR</title>
          <style>
            @media print {
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 10pt;
                line-height: 1.4;
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 20mm;
              }
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px;
              line-height: 1.4;
              white-space: pre-wrap;
              word-wrap: break-word;
              padding: 20px;
              background: #fff;
              color: #000;
            }
          </style>
        </head>
        <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `)
      printWindow.document.close()
      
      // Aguardar carregamento e imprimir
      setTimeout(() => {
        printWindow.print()
        setIsLoading(false)
      }, 500)
    } else {
      setIsLoading(false)
      alert('Não foi possível abrir a janela de impressão. Verifique se pop-ups estão permitidos.')
    }
  }

  // Imprimir diretamente
  const handlePrint = () => {
    handleDownloadPDF()
  }

  // Copiar para clipboard
  const handleCopy = async () => {
    const content = generatePDFContent()
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      alert('Não foi possível copiar. Tente novamente.')
    }
  }

  const buttonClass = isDarkMode 
    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'

  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <FileDown className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Exportar Resultado
        </h3>
      </div>

      <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
        Baixe ou imprima seu resultado com a cadeia de custódia completa para mostrar a profissionais.
      </p>

      {/* Info de cadeia de custódia */}
      {termsAcceptance && (
        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Cadeia de Custódia Incluída
            </span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Termo aceito em {new Date(termsAcceptance.accepted_at).toLocaleDateString('pt-BR')} • 
            Hash: {termsAcceptance.event_hash.substring(0, 16)}...
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownloadPDF}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${buttonClass}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Baixar PDF</span>
        </button>

        <button
          onClick={handlePrint}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${buttonClass}`}
        >
          <Printer className="w-4 h-4" />
          <span className="text-sm font-medium">Imprimir</span>
        </button>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${buttonClass}`}
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  )
}

// Helpers
function getZoneLabel(zone: string): { label: string; color: string } {
  switch (zone) {
    case 'atencao': return { label: 'Zona de Atenção', color: 'yellow' }
    case 'alerta': return { label: 'Zona de Alerta', color: 'orange' }
    case 'vermelha': return { label: 'Zona Vermelha', color: 'red' }
    default: return { label: 'Indefinido', color: 'gray' }
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    invalidacao: 'Invalidação',
    gaslighting: 'Gaslighting',
    controle: 'Controle',
    isolamento: 'Isolamento',
    emocional: 'Abuso Emocional',
    fisico: 'Risco Físico'
  }
  return labels[category] || category
}

function parseDevice(ua: string): string {
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac/.test(ua)) return 'Mac'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Desktop'
}
