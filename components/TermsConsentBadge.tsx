'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  FileCheck, 
  Shield, 
  Calendar, 
  Clock, 
  Monitor, 
  Globe,
  Hash,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react'

// =============================================================================
// BADGE/BOTÃO DE TERMO DE CONSENTIMENTO
// Mostra no topo da página que o usuário já aceitou os termos
// Permite abrir e visualizar o termo aceito para mostrar a terceiros
// =============================================================================

interface TermsAcceptance {
  id: string
  accepted_at: string
  ip_address: string
  user_agent: string
  locale: string
  timezone: string
  screen_resolution: string
  platform: string
  event_hash: string
  terms_version: {
    title: string
    version_number: string
    content_md: string
    slug: string
  }
}

export default function TermsConsentBadge() {
  const [acceptance, setAcceptance] = useState<TermsAcceptance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadAcceptance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Buscar aceite mais recente com dados do termo
        const { data, error } = await supabase
          .from('terms_acceptances')
          .select(`
            id,
            accepted_at,
            ip_address,
            user_agent,
            locale,
            timezone,
            screen_resolution,
            platform,
            event_hash,
            terms_version:terms_version_id (
              title,
              version_number,
              content_md,
              slug
            )
          `)
          .eq('user_id', user.id)
          .order('accepted_at', { ascending: false })
          .limit(1)
          .single()

        if (!error && data) {
          setAcceptance(data as any)
        }
      } catch (err) {
        console.error('Erro ao carregar aceite:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAcceptance()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        <span className="text-xs text-slate-400">Carregando...</span>
      </div>
    )
  }

  if (!acceptance) {
    return null
  }

  return (
    <>
      {/* Badge/Botão no topo */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="
          flex items-center gap-2 
          px-3 py-1.5 sm:px-4 sm:py-2
          bg-emerald-500/10 hover:bg-emerald-500/20
          border border-emerald-500/30 hover:border-emerald-500/50
          rounded-lg sm:rounded-xl
          transition-all duration-200
          group
        "
        title="Clique para ver seu Termo de Consentimento"
      >
        <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        <span className="text-xs sm:text-sm text-emerald-400 font-medium">
          Termo de Consentimento
        </span>
        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal com detalhes do termo aceito */}
      {isModalOpen && (
        <TermsDetailModal 
          acceptance={acceptance} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}

// =============================================================================
// MODAL DE DETALHES DO TERMO ACEITO
// =============================================================================

interface TermsDetailModalProps {
  acceptance: TermsAcceptance
  onClose: () => void
}

function TermsDetailModal({ acceptance, onClose }: TermsDetailModalProps) {
  const acceptedDate = new Date(acceptance.accepted_at)
  
  // Formatar data/hora
  const formattedDate = acceptedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const formattedTime = acceptedDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const formattedDateUTC = acceptedDate.toISOString()

  // Extrair info do dispositivo do user agent
  const deviceInfo = parseUserAgent(acceptance.user_agent)

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="
          relative w-full max-w-2xl 
          bg-gradient-to-b from-slate-900 to-slate-950 
          rounded-xl sm:rounded-2xl 
          shadow-2xl border border-emerald-500/30
          flex flex-col
          max-h-[98vh] sm:max-h-[95vh]
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-emerald-500/20 bg-slate-900/80 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                Termo de Consentimento Aceito
              </h2>
              <p className="text-xs sm:text-sm text-emerald-400/80 mt-1">
                Registro com cadeia de custódia
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4">
          {/* Status de aceite */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-400 text-sm sm:text-base">
                  Termos Aceitos com Sucesso
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {acceptance.terms_version.title}
                </p>
              </div>
            </div>
          </div>

          {/* Dados da cadeia de custódia */}
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 space-y-3">
            <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400" />
              Dados da Cadeia de Custódia
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Data/Hora Local */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Calendar className="w-3 h-3" />
                  Data/Hora Local
                </div>
                <p className="text-white text-sm font-mono">
                  {formattedDate} às {formattedTime}
                </p>
              </div>

              {/* Data/Hora UTC */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  Data/Hora UTC
                </div>
                <p className="text-white text-sm font-mono break-all">
                  {formattedDateUTC}
                </p>
              </div>

              {/* Dispositivo */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Monitor className="w-3 h-3" />
                  Dispositivo
                </div>
                <p className="text-white text-sm">
                  {deviceInfo.device} ({acceptance.platform})
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {deviceInfo.browser} • {acceptance.screen_resolution}
                </p>
              </div>

              {/* Localização */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Globe className="w-3 h-3" />
                  Localização
                </div>
                <p className="text-white text-sm">
                  {acceptance.timezone}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Idioma: {acceptance.locale}
                </p>
              </div>
            </div>

            {/* Hash do evento */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Hash className="w-3 h-3" />
                Hash SHA-256 (Prova de Integridade)
              </div>
              <p className="text-amber-400 text-xs font-mono break-all">
                {acceptance.event_hash}
              </p>
            </div>
          </div>

          {/* Conteúdo do termo */}
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4">
            <h4 className="font-semibold text-white text-sm sm:text-base mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Conteúdo do Termo Aceito
            </h4>
            <div className="prose prose-invert prose-sm max-w-none bg-slate-700/30 rounded-lg p-3 max-h-60 overflow-y-auto">
              {renderMarkdown(acceptance.terms_version.content_md)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-t border-emerald-500/20 bg-slate-900/80 backdrop-blur">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                // Copiar informações para clipboard
                const text = `
TERMO DE CONSENTIMENTO - RADAR NARCISISTA BR
=============================================
Status: ACEITO
Termo: ${acceptance.terms_version.title}
Data/Hora: ${formattedDate} às ${formattedTime}
Data/Hora UTC: ${formattedDateUTC}
Dispositivo: ${deviceInfo.device} (${acceptance.platform})
Navegador: ${deviceInfo.browser}
Resolução: ${acceptance.screen_resolution}
Fuso Horário: ${acceptance.timezone}
Idioma: ${acceptance.locale}
Hash SHA-256: ${acceptance.event_hash}
=============================================
                `.trim()
                navigator.clipboard.writeText(text)
                alert('Informações copiadas para a área de transferência!')
              }}
              className="
                flex-1 py-3 px-4
                bg-slate-700 hover:bg-slate-600 
                text-slate-200 
                rounded-xl font-medium
                transition-all
                text-sm
                flex items-center justify-center gap-2
              "
            >
              📋 Copiar Informações
            </button>
            <button
              onClick={onClose}
              className="
                flex-1 py-3 px-4
                bg-gradient-to-r from-emerald-500 to-emerald-600 
                hover:from-emerald-400 hover:to-emerald-500 
                text-white 
                rounded-xl font-semibold
                transition-all
                text-sm
                shadow-lg shadow-emerald-500/25
              "
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função para extrair info do user agent
function parseUserAgent(ua: string): { device: string; browser: string } {
  let device = 'Desktop'
  let browser = 'Navegador'

  // Detectar dispositivo
  if (/iPhone/.test(ua)) device = 'iPhone'
  else if (/iPad/.test(ua)) device = 'iPad'
  else if (/Android/.test(ua)) device = 'Android'
  else if (/Windows/.test(ua)) device = 'Windows'
  else if (/Mac/.test(ua)) device = 'Mac'
  else if (/Linux/.test(ua)) device = 'Linux'

  // Detectar navegador
  if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = 'Chrome'
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/Firefox/.test(ua)) browser = 'Firefox'
  else if (/Edge/.test(ua)) browser = 'Edge'
  else if (/Opera/.test(ua)) browser = 'Opera'

  return { device, browser }
}

// Função para renderizar markdown simples
function renderMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-base font-bold text-amber-400 mt-3 mb-1">
          {line.replace('# ', '')}
        </h1>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-sm font-semibold text-amber-300 mt-3 mb-1">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*(.*)/)
      if (match) {
        elements.push(
          <li key={key++} className="ml-4 text-xs text-slate-300 mb-1">
            <strong className="text-amber-400">{match[1]}</strong>{match[2]}
          </li>
        )
      }
    } else if (line.trim()) {
      const processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-400">$1</strong>')
      elements.push(
        <p 
          key={key++} 
          className="text-xs text-slate-300 mb-1"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      )
    }
  }

  return elements
}
