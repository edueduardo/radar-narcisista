'use client'

/**
 * Botão do Oráculo V2 - Componente de UI
 * ETAPA 22 - Oráculo V2 Integrado
 * 
 * BLOCO 21-25: Apenas para telas admin
 */

import { useState } from 'react'
import { Sparkles, X, Send, Loader2, AlertTriangle, Lightbulb, BarChart3, HelpCircle } from 'lucide-react'

interface OraculoResponse {
  modo: 'analise' | 'sugestao' | 'alerta' | 'explicacao'
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  titulo_curto: string
  resposta_principal: string
  passos: string[]
  links_sugeridos: { label: string; url: string }[]
  mensagem_final_seguranca?: string
}

interface OraculoButtonProps {
  className?: string
  context?: string // Contexto adicional da página atual
}

export default function OraculoButton({ className = '', context }: OraculoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<OraculoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/oraculo-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          user_role: 'admin',
          url_atual: typeof window !== 'undefined' ? window.location.pathname : '',
          manual_context: context
        })
      })

      const data = await res.json()

      if (!res.ok) {
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
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return 'bg-green-100 text-green-800 border-green-200'
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'alto': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critico': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 
          bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full 
          shadow-lg hover:shadow-xl transition-all hover:scale-105 ${className}`}
        title="Perguntar ao Oráculo"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Oráculo</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-lg font-semibold">Oráculo V2</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setResponse(null)
                  setError(null)
                  setQuestion('')
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Campo de pergunta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Faça sua pergunta ao Oráculo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Ex: Quantos usuários temos ativos? Como funciona o sistema de planos?"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !question.trim()}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

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
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {getRiscoBadge(response.risco)}
                    </span>
                  </div>

                  {/* Resposta principal */}
                  <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                    {response.resposta_principal}
                  </p>

                  {/* Passos */}
                  {response.passos && response.passos.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Passos sugeridos:</h4>
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
                      <h4 className="font-medium mb-2">Links úteis:</h4>
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
                  <p className="text-sm text-gray-500">Sugestões de perguntas:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Quantos usuários temos ativos?',
                      'Como funciona o sistema de planos?',
                      'Qual a prioridade dos bugs?',
                      'O que é o Teste de Clareza?'
                    ].map((sugestao, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(sugestao)}
                        className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full 
                          hover:bg-violet-100 hover:text-violet-700 transition-colors"
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
              Oráculo V2 • Apenas para administradores • BLOCO 21-25
            </div>
          </div>
        </div>
      )}
    </>
  )
}
