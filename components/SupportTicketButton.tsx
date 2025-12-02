'use client'

/**
 * SupportTicketButton - Botão "Reportar Problema"
 * ETAPA 34 - BLOCO 32-35
 * 
 * Componente reutilizável para reportar problemas.
 * Pode ser usado no Radar Mãe e em qualquer SaaS gerado.
 */

import { useState, useEffect } from 'react'
import { MessageCircleWarning, X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface SupportTicketButtonProps {
  projectId: string                               // UUID do projeto
  userEmail?: string                              // Email do usuário (se logado)
  userName?: string                               // Nome do usuário (se logado)
  userId?: string                                 // ID do usuário no projeto local
  origem?: 'usuario_final' | 'profissional' | 'admin_cliente' | 'interno'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  buttonText?: string
  buttonClassName?: string
  modalTitle?: string
  apiEndpoint?: string                            // Endpoint customizado (default: /api/core/support-ticket)
}

type TicketCategoria = 'bug' | 'duvida' | 'sugestao' | 'reclamacao' | 'geral'

// ============================================================================
// COMPONENTE
// ============================================================================

export default function SupportTicketButton({
  projectId,
  userEmail,
  userName,
  userId,
  origem = 'usuario_final',
  position = 'bottom-right',
  buttonText = 'Reportar Problema',
  buttonClassName,
  modalTitle = 'Reportar um Problema',
  apiEndpoint = '/api/core/support-ticket'
}: SupportTicketButtonProps) {
  // Estados
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Campos do formulário
  const [email, setEmail] = useState(userEmail || '')
  const [nome, setNome] = useState(userName || '')
  const [categoria, setCategoria] = useState<TicketCategoria>('geral')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  
  // Atualizar email/nome se props mudarem
  useEffect(() => {
    if (userEmail) setEmail(userEmail)
    if (userName) setNome(userName)
  }, [userEmail, userName])
  
  // Coletar contexto técnico
  const getContextoTecnico = () => {
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }
  
  // Enviar ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !titulo || !descricao) {
      setErrorMessage('Preencha todos os campos obrigatórios')
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          origem,
          email_contato: email,
          nome_contato: nome || undefined,
          user_id_local: userId || undefined,
          titulo,
          descricao,
          categoria,
          url_origem: typeof window !== 'undefined' ? window.location.href : undefined,
          contexto_tecnico: getContextoTecnico()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar ticket')
      }
      
      setSubmitStatus('success')
      
      // Limpar formulário após 3 segundos e fechar
      setTimeout(() => {
        setIsOpen(false)
        setSubmitStatus('idle')
        setTitulo('')
        setDescricao('')
        setCategoria('geral')
      }, 3000)
      
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar ticket')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Posição do botão flutuante
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }
  
  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClassName || `fixed ${positionClasses[position]} z-40 flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all hover:scale-105`}
        title={buttonText}
      >
        <MessageCircleWarning className="w-5 h-5" />
        <span className="hidden sm:inline">{buttonText}</span>
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="flex items-center gap-2">
                <MessageCircleWarning className="w-6 h-6" />
                <h2 className="text-lg font-semibold">{modalTitle}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Conteúdo */}
            <div className="p-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ticket Enviado!
                  </h3>
                  <p className="text-gray-600">
                    Recebemos seu problema e entraremos em contato em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de contato *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      disabled={!!userEmail}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Como podemos te chamar?"
                      disabled={!!userName}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo do problema
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as TicketCategoria)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="geral">Geral</option>
                      <option value="bug">Bug / Erro</option>
                      <option value="duvida">Dúvida</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                    </select>
                  </div>
                  
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resumo do problema *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Descreva brevemente o problema"
                      required
                      maxLength={200}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detalhes *
                    </label>
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva o problema com mais detalhes. O que você estava fazendo? O que aconteceu?"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                  </div>
                  
                  {/* Erro */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errorMessage}
                    </div>
                  )}
                  
                  {/* Botões */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
              Informações técnicas serão coletadas automaticamente para ajudar na resolução.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
