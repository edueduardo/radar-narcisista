'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FileCheck, 
  Shield, 
  Calendar, 
  Clock, 
  Monitor, 
  Globe,
  Hash,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2
} from 'lucide-react'

// =============================================================================
// BADGE/BOTÃO DE TERMO DE CONSENTIMENTO
// Expande INLINE (abaixo) para mostrar os detalhes - NÃO usa modal
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
  const [isExpanded, setIsExpanded] = useState(false)

  const supabase = createClient()

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
    <div className="w-full">
      {/* Badge/Botão - clica para expandir ABAIXO */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full flex items-center justify-between gap-2 
          px-4 py-3
          bg-emerald-500/10 hover:bg-emerald-500/20
          border border-emerald-500/30 hover:border-emerald-500/50
          rounded-xl
          transition-all duration-200
        "
      >
        <div className="flex items-center gap-3">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-sm text-emerald-400 font-medium block">
              Termo de Consentimento
            </span>
            <span className="text-xs text-gray-400">
              Clique para ver detalhes da cadeia de custódia
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido ABAIXO (não modal) */}
      {isExpanded && (
        <TermsDetailInline acceptance={acceptance} />
      )}
    </div>
  )
}

// =============================================================================
// DETALHES DO TERMO - INLINE (expande abaixo, não modal)
// =============================================================================

function TermsDetailInline({ acceptance }: { acceptance: TermsAcceptance }) {
  const acceptedDate = new Date(acceptance.accepted_at)
  
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
  const deviceInfo = parseUserAgent(acceptance.user_agent)

  return (
    <div className="mt-3 p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-4">
      {/* Status de aceite */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-400 text-sm">
              Termos Aceitos com Sucesso
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {acceptance.terms_version.title}
            </p>
          </div>
        </div>
      </div>

      {/* Dados da cadeia de custódia */}
      <div className="space-y-3">
        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
          <Hash className="w-4 h-4 text-amber-400" />
          Dados da Cadeia de Custódia
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Data/Hora Local */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Data/Hora Local
            </div>
            <p className="text-white text-sm font-mono">
              {formattedDate} às {formattedTime}
            </p>
          </div>

          {/* Data/Hora UTC */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              Data/Hora UTC
            </div>
            <p className="text-white text-sm font-mono break-all">
              {formattedDateUTC}
            </p>
          </div>

          {/* Dispositivo */}
          <div className="bg-slate-800/50 rounded-lg p-3">
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
          <div className="bg-slate-800/50 rounded-lg p-3">
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
        <div className="bg-slate-800/50 rounded-lg p-3">
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
      <div className="space-y-2">
        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          Conteúdo do Termo Aceito
        </h4>
        <div className="bg-slate-800/50 rounded-lg p-4 max-h-60 overflow-y-auto">
          <div className="prose prose-sm prose-invert max-w-none">
            {renderMarkdown(acceptance.terms_version.content_md)}
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
  const elements: React.ReactElement[] = []
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
