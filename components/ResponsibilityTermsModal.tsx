'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Scale, Shield, FileWarning, CheckCircle2 } from 'lucide-react'

interface ResponsibilityTermsModalProps {
  onAccept: () => void
  context?: 'chat' | 'diario' | 'geral'
  forceShow?: boolean // Forçar mostrar mesmo se já aceitou
  autoCheck?: boolean // Verificar automaticamente se já aceitou
}

export function ResponsibilityTermsModal({ 
  onAccept, 
  context = 'geral',
  forceShow = false,
  autoCheck = true 
}: ResponsibilityTermsModalProps) {
  const [checks, setChecks] = useState({
    perspectiva: false,
    mentirCrime: false,
    forjarCrime: false,
    caluniaInjuria: false,
    responsabilidade: false,
    ferramenta: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldShow, setShouldShow] = useState(forceShow)
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null)
  const supabase = createClient()

  const allChecked = Object.values(checks).every(v => v)

  // Verificar se usuário já aceitou os termos (via CUC)
  useEffect(() => {
    if (autoCheck && !forceShow) {
      checkExistingAcceptance()
    }
  }, [autoCheck, forceShow])

  const checkExistingAcceptance = async () => {
    try {
      const response = await fetch('/api/terms/accept', {
        method: 'GET'
      })
      
      const result = await response.json()
      
      if (result.hasAccepted) {
        // Já aceitou via CUC, não mostrar modal
        setHasAccepted(true)
        setShouldShow(false)
        // Chamar onAccept automaticamente para continuar fluxo
        onAccept()
      } else {
        // Não aceitou ainda, mostrar modal
        setHasAccepted(false)
        setShouldShow(true)
      }
    } catch (error) {
      console.error('Erro ao verificar aceite existente:', error)
      // Em caso de erro, mostrar modal para segurança
      setShouldShow(true)
    }
  }

  const handleAccept = async () => {
    if (!allChecked) return
    
    setIsSubmitting(true)
    try {
      // Usar nova API com cadeia de custódia e hash SHA-256
      const response = await fetch('/api/terms/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        body: JSON.stringify({
          termsSlug: 'responsabilidade-v1-2025-11-28',
          acceptanceContext: {
            checkboxes: checks,
            flow: context,
            extra: {
              screenWidth: window.innerWidth,
              screenHeight: window.innerHeight,
              language: navigator.language
            }
          }
        })
      })

      const result = await response.json()
      
      if (result.ok) {
        console.log('Aceite registrado com hash:', result.eventHash)
      } else {
        console.warn('Erro ao registrar aceite via API:', result.error)
        // Fallback: tentar salvar direto no Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('user_terms_acceptance').upsert({
            user_id: user.id,
            terms_version: '1.0',
            accepted_at: new Date().toISOString(),
            context: context,
            ip_hash: 'fallback'
          }, {
            onConflict: 'user_id,terms_version'
          })
        }
      }
      
      onAccept()
    } catch (error) {
      console.error('Erro ao registrar aceite:', error)
      // Mesmo com erro, permitir continuar (mas logar)
      onAccept()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se não deve mostrar, retornar null
  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Termo de Responsabilidade</h2>
              <p className="text-amber-100 text-sm">Leia com atenção antes de continuar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Aviso Principal */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 mb-2">⚠️ AVISO LEGAL IMPORTANTE</h3>
                <p className="text-sm text-red-700 leading-relaxed">
                  Esta plataforma é uma <strong>ferramenta de apoio e organização de pensamentos</strong>. 
                  Não somos juízes, advogados, psicólogos ou detectores de mentiras. 
                  <strong> Você é integralmente responsável por tudo que relata aqui.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-amber-600" />
              Confirme que você entende:
            </h4>

            {/* Check 1 - Perspectiva */}
            <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
              <input
                type="checkbox"
                checked={checks.perspectiva}
                onChange={(e) => setChecks(prev => ({ ...prev, perspectiva: e.target.checked }))}
                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                Entendo que estou relatando <strong>apenas minha perspectiva</strong>. A IA não conhece o outro lado da história e não pode verificar a veracidade dos fatos.
              </span>
            </label>

            {/* Check 2 - Mentir é crime */}
            <label className="flex items-start gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200">
              <input
                type="checkbox"
                checked={checks.mentirCrime}
                onChange={(e) => setChecks(prev => ({ ...prev, mentirCrime: e.target.checked }))}
                className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                Entendo que <strong>mentir para prejudicar alguém é crime</strong> (Art. 299 do Código Penal - Falsidade Ideológica), punível com reclusão de 1 a 5 anos.
              </span>
            </label>

            {/* Check 3 - Forjar provas é crime */}
            <label className="flex items-start gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200">
              <input
                type="checkbox"
                checked={checks.forjarCrime}
                onChange={(e) => setChecks(prev => ({ ...prev, forjarCrime: e.target.checked }))}
                className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                Entendo que <strong>forjar provas falsas é crime</strong> (Art. 347 do Código Penal - Fraude Processual), punível com reclusão de 3 meses a 2 anos.
              </span>
            </label>

            {/* Check 4 - Calúnia, difamação, injúria */}
            <label className="flex items-start gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200">
              <input
                type="checkbox"
                checked={checks.caluniaInjuria}
                onChange={(e) => setChecks(prev => ({ ...prev, caluniaInjuria: e.target.checked }))}
                className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                Entendo que <strong>calúnia, difamação e injúria são crimes</strong> (Arts. 138-140 do Código Penal), puníveis com detenção e multa.
              </span>
            </label>

            {/* Check 5 - Responsabilidade */}
            <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors border border-amber-200">
              <input
                type="checkbox"
                checked={checks.responsabilidade}
                onChange={(e) => setChecks(prev => ({ ...prev, responsabilidade: e.target.checked }))}
                className="mt-1 w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">
                <strong>Assumo total responsabilidade</strong> por tudo que relato, escrevo ou gravo nesta plataforma. Entendo que a plataforma pode detectar possíveis inconsistências e que isso ficará registrado.
              </span>
            </label>

            {/* Check 6 - Ferramenta */}
            <label className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200">
              <input
                type="checkbox"
                checked={checks.ferramenta}
                onChange={(e) => setChecks(prev => ({ ...prev, ferramenta: e.target.checked }))}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Entendo que esta plataforma é <strong>apenas uma ferramenta de apoio</strong>, não substitui profissionais (psicólogos, advogados, médicos) e não emite diagnósticos, laudos ou pareceres jurídicos.
              </span>
            </label>
          </div>

          {/* Aviso sobre detecção de fraude */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-800 text-sm mb-1">Sistema de Proteção</h4>
                <p className="text-xs text-purple-700 leading-relaxed">
                  Nossa IA pode identificar <strong>possíveis inconsistências, exageros ou padrões suspeitos</strong> nos relatos. 
                  Isso não significa acusação, mas serve para proteger todas as partes envolvidas. 
                  Se detectado, você poderá ser questionado sobre detalhes ou contexto adicional.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleAccept}
            disabled={!allChecked || isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              allChecked 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </>
            ) : allChecked ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Li, entendi e aceito os termos
              </>
            ) : (
              'Marque todas as opções para continuar'
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Ao clicar, você confirma que leu e concorda com todos os termos acima.
            Este aceite será registrado com data e hora.
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente de aviso legal compacto para usar em várias páginas
export function LegalWarningBanner({ variant = 'default' }: { variant?: 'default' | 'compact' | 'footer' }) {
  if (variant === 'compact') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <strong>⚠️ Aviso:</strong> Você relata sua perspectiva. Mentir é crime (Art. 299 CP). 
        Você é responsável pelo que escreve. Esta ferramenta não substitui profissionais.
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className="text-[10px] text-gray-400 text-center leading-relaxed mt-2">
        ⚠️ Você está relatando sua perspectiva. A IA não conhece o outro lado. 
        Mentir/forjar provas é crime. Você é responsável pelo que relata.
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-amber-800 font-medium">
            ⚠️ Lembre-se: você está relatando <strong>sua perspectiva</strong>.
          </p>
          <p className="text-xs text-amber-700">
            A IA não conhece o outro lado da história. Mentir para prejudicar alguém é crime (Art. 299 CP). 
            Forjar provas é crime (Art. 347 CP). Você é integralmente responsável pelo que relata.
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook para verificar se o usuário já aceitou os termos
export function useTermsAcceptance() {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [acceptanceId, setAcceptanceId] = useState<string | null>(null)

  useEffect(() => {
    checkAcceptance()
  }, [])

  const checkAcceptance = async () => {
    try {
      // Usar nova API para verificar aceite
      const response = await fetch('/api/terms/accept', {
        method: 'GET'
      })
      
      const result = await response.json()
      
      setHasAccepted(result.hasAccepted || false)
      setAcceptanceId(result.acceptanceId || null)
    } catch (error) {
      console.error('Erro ao verificar aceite:', error)
      setHasAccepted(false)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsAccepted = () => {
    setHasAccepted(true)
  }

  return { hasAccepted, isLoading, markAsAccepted, acceptanceId }
}
