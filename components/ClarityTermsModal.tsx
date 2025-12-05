'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  FileText,
  X,
  Loader2
} from 'lucide-react'

// =============================================================================
// MODAL DE TERMOS DO TESTE DE CLAREZA - CADEIA DE CUSTÓDIA
// Bloqueio obrigatório + Validade 30 dias + Design responsivo extremo
// =============================================================================

interface ClarityTermsModalProps {
  isOpen: boolean
  onAccept: () => void
  onClose: () => void
}

interface TermsVersion {
  id: string
  slug: string
  title: string
  version_number: string
  content_md: string
  content_hash: string
}

// Função para gerar hash SHA-256 no browser
async function generateBrowserHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Função para obter IP público (via API)
async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

export default function ClarityTermsModal({ isOpen, onAccept, onClose }: ClarityTermsModalProps) {
  const [termsVersion, setTermsVersion] = useState<TermsVersion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [checkboxes, setCheckboxes] = useState({
    readTerms: false,
    understandUnilateral: false,
    acceptResponsibility: false
  })
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Carregar versão ativa dos termos
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const { data, error } = await supabase
          .from('terms_versions')
          .select('*')
          .eq('is_active', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .single()

        if (error) throw error
        setTermsVersion(data)
      } catch (err) {
        console.error('Erro ao carregar termos:', err)
        // Fallback para termos locais se não conseguir carregar do banco
        setTermsVersion({
          id: 'local-fallback',
          slug: 'responsabilidade-v1-local',
          title: 'Termo de Responsabilidade - v1.0',
          version_number: '1.0',
          content_md: FALLBACK_TERMS_CONTENT,
          content_hash: 'local-hash'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadTerms()
    }
  }, [isOpen, supabase])

  // Detectar scroll até o final
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50
    if (isAtBottom) {
      setHasScrolledToBottom(true)
    }
  }

  // Verificar se pode aceitar
  const canAccept = hasScrolledToBottom && 
    checkboxes.readTerms && 
    checkboxes.understandUnilateral && 
    checkboxes.acceptResponsibility

  // Handler de aceite com cadeia de custódia
  const handleAccept = async () => {
    if (!canAccept || !termsVersion) return

    setIsSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Coletar metadados do dispositivo
      const ip = await getPublicIP()
      const userAgent = navigator.userAgent
      const locale = navigator.language
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const screenResolution = `${window.screen.width}x${window.screen.height}`
      const platform = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'web'
      const referrer = window.location.pathname
      const acceptedAt = new Date().toISOString()

      // Criar payload canônico para hash
      const canonicalPayload = {
        user_id: user?.id || 'visitor',
        user_email: user?.email || 'visitor',
        terms_version_id: termsVersion.id,
        terms_slug: termsVersion.slug,
        terms_hash: termsVersion.content_hash,
        accepted_at: acceptedAt,
        ip_address: ip,
        user_agent: userAgent,
        locale: locale,
        timezone: timezone,
        screen_resolution: screenResolution,
        platform: platform,
        checkboxes: checkboxes
      }

      // Gerar hash do evento
      const eventHash = await generateBrowserHash(JSON.stringify(canonicalPayload))

      // Gerar hash do IP para LGPD
      const ipHash = await generateBrowserHash(ip)

      // Só salva no Supabase se tiver usuário logado
      if (user) {
        const { error: insertError } = await supabase
          .from('terms_acceptances')
          .insert({
            user_id: user.id,
            terms_version_id: termsVersion.id,
            accepted_at: acceptedAt,
            ip_address: ip,
            ip_hash: ipHash,
            user_agent: userAgent,
            locale: locale,
            platform: platform,
            referrer: referrer,
            screen_resolution: screenResolution,
            timezone: timezone,
            acceptance_context: {
              checkboxes: checkboxes,
              scrolled_to_bottom: hasScrolledToBottom,
              test_type: 'clarity_test'
            },
            event_hash: eventHash,
            canonical_payload: canonicalPayload
          })

        if (insertError) {
          console.error('Erro ao salvar aceite:', insertError)
          // Continua mesmo com erro - visitante pode prosseguir
        }
      }

      // Salvar no localStorage para cache de 30 dias
      localStorage.setItem('clarity-terms-accepted', JSON.stringify({
        acceptedAt: acceptedAt,
        termsVersionId: termsVersion.id,
        termsSlug: termsVersion.slug,
        eventHash: eventHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }))

      onAccept()
    } catch (err: any) {
      console.error('Erro ao salvar aceite:', err)
      setError(err.message || 'Erro ao registrar aceite. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handler de fechar sem aceitar
  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
    >
      {/* Container responsivo extremo */}
      <div 
        className="
          relative w-full max-w-2xl 
          bg-gradient-to-b from-slate-900 to-slate-950 
          rounded-xl sm:rounded-2xl 
          shadow-2xl border border-amber-500/30
          flex flex-col
          max-h-[98vh] sm:max-h-[95vh]
          overflow-hidden
        "
      >
        {/* Header fixo */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-amber-500/20 bg-slate-900/80 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="p-2 sm:p-3 bg-amber-500/20 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                Termo de Responsabilidade
              </h2>
              <p className="text-xs sm:text-sm text-amber-400/80 mt-1">
                Leitura obrigatória antes do Teste de Clareza
              </p>
            </div>
            {/* Botão X - fecha mas bloqueia teste */}
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title="Fechar (não poderá fazer o teste)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div 
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Alerta importante */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4">
                <div className="flex gap-2 sm:gap-3">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-400 text-sm sm:text-base">
                      Atenção: Este teste NÃO é diagnóstico
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      O Teste de Clareza é uma ferramenta de autoconhecimento. 
                      Não substitui avaliação profissional de psicólogo, psiquiatra ou advogado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo dos termos */}
              <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 md:p-5">
                <div className="prose prose-invert prose-sm max-w-none">
                  {termsVersion && renderMarkdown(termsVersion.content_md)}
                </div>
              </div>

              {/* Indicador de scroll */}
              {!hasScrolledToBottom && (
                <div className="text-center py-2">
                  <p className="text-xs sm:text-sm text-amber-400 animate-pulse">
                    ↓ Role até o final para continuar ↓
                  </p>
                </div>
              )}

              {/* Checkboxes obrigatórios */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checkboxes.readTerms}
                    onChange={(e) => setCheckboxes(prev => ({ ...prev, readTerms: e.target.checked }))}
                    disabled={!hasScrolledToBottom}
                    className="
                      w-5 h-5 sm:w-6 sm:h-6 mt-0.5
                      rounded border-2 border-amber-500/50 
                      bg-slate-800 
                      checked:bg-amber-500 checked:border-amber-500
                      focus:ring-2 focus:ring-amber-500/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all cursor-pointer
                    "
                  />
                  <span className={`text-xs sm:text-sm ${hasScrolledToBottom ? 'text-slate-200' : 'text-slate-500'}`}>
                    <strong>Li integralmente</strong> o Termo de Responsabilidade acima
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checkboxes.understandUnilateral}
                    onChange={(e) => setCheckboxes(prev => ({ ...prev, understandUnilateral: e.target.checked }))}
                    disabled={!hasScrolledToBottom}
                    className="
                      w-5 h-5 sm:w-6 sm:h-6 mt-0.5
                      rounded border-2 border-amber-500/50 
                      bg-slate-800 
                      checked:bg-amber-500 checked:border-amber-500
                      focus:ring-2 focus:ring-amber-500/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all cursor-pointer
                    "
                  />
                  <span className={`text-xs sm:text-sm ${hasScrolledToBottom ? 'text-slate-200' : 'text-slate-500'}`}>
                    <strong>Entendo</strong> que estou relatando apenas minha perspectiva e que a IA não conhece o outro lado
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checkboxes.acceptResponsibility}
                    onChange={(e) => setCheckboxes(prev => ({ ...prev, acceptResponsibility: e.target.checked }))}
                    disabled={!hasScrolledToBottom}
                    className="
                      w-5 h-5 sm:w-6 sm:h-6 mt-0.5
                      rounded border-2 border-amber-500/50 
                      bg-slate-800 
                      checked:bg-amber-500 checked:border-amber-500
                      focus:ring-2 focus:ring-amber-500/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all cursor-pointer
                    "
                  />
                  <span className={`text-xs sm:text-sm ${hasScrolledToBottom ? 'text-slate-200' : 'text-slate-500'}`}>
                    <strong>Aceito</strong> a responsabilidade pelo uso das informações e me comprometo a não usar para fins maliciosos
                  </span>
                </label>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer fixo com botões */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-t border-amber-500/20 bg-slate-900/80 backdrop-blur">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              className="
                flex-1 py-3 sm:py-4 px-4
                bg-slate-700 hover:bg-slate-600 
                text-slate-200 
                rounded-xl font-medium
                transition-all
                text-sm sm:text-base
                order-2 sm:order-1
              "
            >
              Não aceito
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept || isSaving}
              className={`
                flex-1 py-3 sm:py-4 px-4
                rounded-xl font-semibold
                transition-all
                text-sm sm:text-base
                flex items-center justify-center gap-2
                order-1 sm:order-2
                ${canAccept && !isSaving
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Aceito e Concordo
                </>
              )}
            </button>
          </div>

          {/* Info de cadeia de custódia */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500">
            <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Aceite registrado com hash SHA-256 para cadeia de custódia</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função para renderizar markdown simples
function renderMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactElement[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-lg sm:text-xl font-bold text-amber-400 mt-4 mb-2">
          {line.replace('# ', '')}
        </h1>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-base sm:text-lg font-semibold text-amber-300 mt-4 mb-2">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*(.*)/)
      if (match) {
        elements.push(
          <li key={key++} className="ml-4 text-xs sm:text-sm text-slate-300 mb-1">
            <strong className="text-amber-400">{match[1]}</strong>{match[2]}
          </li>
        )
      }
    } else if (line.trim()) {
      // Processar negrito inline
      const processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-400">$1</strong>')
      elements.push(
        <p 
          key={key++} 
          className="text-xs sm:text-sm text-slate-300 mb-2"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      )
    }
  }

  return elements
}

// Fallback dos termos caso não consiga carregar do banco
const FALLBACK_TERMS_CONTENT = `# TERMO DE RESPONSABILIDADE - RADAR NARCISISTA BR

## 1. PERSPECTIVA UNILATERAL
Entendo que estou relatando **apenas minha perspectiva** dos fatos. A IA não conhece o outro lado da história, não tem acesso a provas, e não pode verificar a veracidade dos fatos.

## 2. NÃO É DIAGNÓSTICO
Nenhuma análise ou relatório gerado por esta plataforma constitui diagnóstico clínico, parecer psicológico, laudo técnico ou prova judicial.

## 3. NÃO SUBSTITUI PROFISSIONAIS
Este serviço não substitui acompanhamento de psicólogo, psiquiatra, advogado, assistente social ou qualquer outro profissional qualificado.

## 4. RESPONSABILIDADE PELO USO
Sou integralmente responsável pelo uso que fizer das informações, relatórios e documentos gerados pela plataforma.

## 5. PROIBIÇÃO DE USO MALICIOSO
É expressamente proibido usar esta plataforma para fabricar narrativas falsas, destruir reputações, manipular processos judiciais ou prejudicar terceiros de qualquer forma.

## 6. PROTEÇÃO DE INOCENTES
A pessoa do outro lado da história não está aqui para se defender. A plataforma não pode ser usada como arma de acusação injusta.

## 7. CRIMES APLICÁVEIS
- **Art. 299 CP** - Falsidade Ideológica: pena de 1 a 5 anos de reclusão
- **Art. 347 CP** - Fraude Processual: pena de 3 meses a 2 anos de detenção
- **Arts. 138-140 CP** - Calúnia, Difamação e Injúria: penas de detenção e multa

## 8. ACEITE
Ao continuar usando a plataforma, confirmo que li, entendi e concordo com todos os termos acima. Este aceite será registrado com data, hora, IP e hash criptográfico para fins de auditoria e prova judicial.`
