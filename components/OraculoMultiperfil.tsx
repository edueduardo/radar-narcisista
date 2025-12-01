'use client'

/**
 * Oráculo V2 Multiperfil - Componente de UI
 * ETAPA 29 - Expor Oráculo V2 para outros perfis
 * 
 * Suporta todos os perfis: admin, usuaria, profissional, dev, whitelabel
 * Adapta UI e sugestões baseado no perfil
 */

import { useState, useEffect } from 'react'
import { 
  Sparkles, X, Send, Loader2, AlertTriangle, Lightbulb, 
  BarChart3, HelpCircle, MessageCircle, Info
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

type UserRole = 'admin' | 'usuaria' | 'profissional' | 'dev' | 'whitelabel'

interface OraculoResponse {
  modo: 'analise' | 'sugestao' | 'alerta' | 'explicacao'
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  titulo_curto: string
  resposta_principal: string
  passos: string[]
  links_sugeridos: { label: string; url: string }[]
  mensagem_final_seguranca?: string
}

interface OraculoMultiperfilProps {
  userRole: UserRole
  userPlan?: string
  className?: string
  context?: string
  // Customização visual
  buttonLabel?: string
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  colorScheme?: 'violet' | 'blue' | 'green' | 'rose'
}

// ============================================================================
// CONFIGURAÇÕES POR PERFIL
// ============================================================================

const PERFIL_CONFIG: Record<UserRole, {
  label: string
  description: string
  sugestoes: string[]
  colorScheme: string
}> = {
  admin: {
    label: 'Admin',
    description: 'Pergunte sobre métricas, configurações e decisões',
    sugestoes: [
      'Quantos usuários temos ativos?',
      'Como funciona o sistema de planos?',
      'Qual a prioridade dos bugs?',
      'Mostre métricas de hoje'
    ],
    colorScheme: 'violet'
  },
  usuaria: {
    label: 'Assistente',
    description: 'Tire dúvidas sobre o Radar e seu processo',
    sugestoes: [
      'O que é o Teste de Clareza?',
      'Como usar o Diário?',
      'O que significa minha zona?',
      'Como funciona o Plano de Segurança?'
    ],
    colorScheme: 'rose'
  },
  profissional: {
    label: 'Suporte Pro',
    description: 'Ajuda para profissionais de saúde',
    sugestoes: [
      'Como adicionar um cliente?',
      'Como gerar relatório?',
      'Como interpretar os resultados?',
      'Como configurar minha marca?'
    ],
    colorScheme: 'blue'
  },
  dev: {
    label: 'Dev Helper',
    description: 'Suporte técnico para desenvolvedores',
    sugestoes: [
      'Como funciona a arquitetura?',
      'Onde fica a API de planos?',
      'Como debugar o webhook?',
      'Explique o rate limiting'
    ],
    colorScheme: 'green'
  },
  whitelabel: {
    label: 'Parceiro',
    description: 'Suporte para parceiros whitelabel',
    sugestoes: [
      'Como customizar minha instância?',
      'Como ver métricas dos meus usuários?',
      'Como configurar domínio próprio?',
      'Quais recursos posso habilitar?'
    ],
    colorScheme: 'violet'
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function OraculoMultiperfil({
  userRole,
  userPlan = 'free',
  className = '',
  context,
  buttonLabel,
  buttonPosition = 'bottom-right',
  colorScheme
}: OraculoMultiperfilProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<OraculoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usageInfo, setUsageInfo] = useState<{
    usado?: number
    limite?: number
    reset?: string
  } | null>(null)

  const config = PERFIL_CONFIG[userRole]
  const finalColorScheme = colorScheme || config.colorScheme
  const finalLabel = buttonLabel || config.label

  // Cores baseadas no scheme
  const colorSchemes: Record<string, { button: string; header: string; accent: string }> = {
    violet: {
      button: 'from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
      header: 'from-violet-600 to-purple-600',
      accent: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
    },
    blue: {
      button: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
      header: 'from-blue-600 to-cyan-600',
      accent: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    },
    green: {
      button: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      header: 'from-green-600 to-emerald-600',
      accent: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    },
    rose: {
      button: 'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
      header: 'from-rose-500 to-pink-500',
      accent: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500'
    }
  }
  const colorClasses = colorSchemes[finalColorScheme] || colorSchemes.violet

  // Posição do botão
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }[buttonPosition]

  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResponse(null)
    setUsageInfo(null)

    try {
      const res = await fetch('/api/oraculo-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          user_role: userRole,
          plan: userPlan,
          url_atual: typeof window !== 'undefined' ? window.location.pathname : '',
          manual_context: context
        })
      })

      const data = await res.json()

      if (!res.ok) {
        // Se for erro de limite, mostrar info
        if (res.status === 403 && data.limite) {
          setUsageInfo({
            usado: data.usado,
            limite: data.limite,
            reset: data.reset
          })
        }
        throw new Error(data.error || 'Erro ao consultar Oráculo')
      }

      setResponse(data.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const getModoIcon = (modo: string) => {
    switch (modo) {
      case 'analise': return <BarChart3 className="w-5 h-5" />
      case 'sugestao': return <Lightbulb className="w-5 h-5" />
      case 'alerta': return <AlertTriangle className="w-5 h-5" />
      case 'explicacao': return <HelpCircle className="w-5 h-5" />
      default: return <MessageCircle className="w-5 h-5" />
    }
  }

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return 'bg-green-50 text-green-800 border-green-200'
      case 'medio': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'alto': return 'bg-orange-50 text-orange-800 border-orange-200'
      case 'critico': return 'bg-red-50 text-red-800 border-red-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getRiscoBadge = (risco: string) => {
    const labels: Record<string, string> = {
      baixo: '🟢 Baixo',
      medio: '🟡 Médio',
      alto: '🟠 Alto',
      critico: '🔴 Crítico'
    }
    return labels[risco] || risco
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses} z-50 flex items-center gap-2 px-4 py-3 
          bg-gradient-to-r ${colorClasses.button} text-white rounded-full 
          shadow-lg hover:shadow-xl transition-all hover:scale-105 ${className}`}
        title={`Perguntar ao ${finalLabel}`}
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">{finalLabel}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r ${colorClasses.header} text-white`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-lg font-semibold">Oráculo V2</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{finalLabel}</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setResponse(null)
                  setError(null)
                  setQuestion('')
                  setUsageInfo(null)
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Descrição do perfil */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{config.description}</span>
              </div>

              {/* Campo de pergunta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Faça sua pergunta
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Digite sua pergunta..."
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-0 
                      focus:border-transparent ${colorClasses.accent.replace('bg-', 'focus:ring-')}`}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !question.trim()}
                    className={`px-4 py-2 ${colorClasses.accent} text-white rounded-lg 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info de uso/limite */}
              {usageInfo && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>
                      Você usou {usageInfo.usado}/{usageInfo.limite} perguntas. 
                      {usageInfo.reset && ` Reseta ${usageInfo.reset}.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Resposta */}
              {response && (
                <div className={`p-4 rounded-lg border-2 ${getRiscoColor(response.risco)}`}>
                  {/* Header da resposta */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getModoIcon(response.modo)}
                      <span className="font-semibold">{response.titulo_curto}</span>
                    </div>
                    {userRole === 'admin' && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                        {getRiscoBadge(response.risco)}
                      </span>
                    )}
                  </div>

                  {/* Resposta principal */}
                  <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                    {response.resposta_principal}
                  </p>

                  {/* Passos */}
                  {response.passos && response.passos.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">
                        {userRole === 'usuaria' ? 'Próximos passos:' : 'Passos sugeridos:'}
                      </h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {response.passos.map((passo, i) => (
                          <li key={i} className="text-gray-700">{passo}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Links */}
                  {response.links_sugeridos && response.links_sugeridos.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Saiba mais:</h4>
                      <div className="flex flex-wrap gap-2">
                        {response.links_sugeridos.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            className="text-sm px-3 py-1 bg-white/50 rounded-full hover:bg-white transition-colors"
                          >
                            {link.label} →
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensagem de segurança */}
                  {response.mensagem_final_seguranca && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm font-medium">
                          {response.mensagem_final_seguranca}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sugestões de perguntas */}
              {!response && !isLoading && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {config.sugestoes.map((sugestao, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(sugestao)}
                        className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full 
                          hover:bg-gray-200 transition-colors"
                      >
                        {sugestao}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50 text-center text-xs text-gray-500">
              Oráculo V2 • {config.label} • Plano {userPlan}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
