'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  MessageCircle, 
  Send,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Info,
  RotateCcw,
  Loader2,
  User,
  Bot,
  ExternalLink,
  X
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarAlertBanner,
  RadarModal,
} from '@/components/ui/design-system'

// ============================================================================
// CHAT PREMIUM - RADAR NARCISISTA BR
// Coach de Clareza com estrutura visual de respostas
// ============================================================================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ChatPremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResponsibilityModal, setShowResponsibilityModal] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Mensagem de boas-vindas
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Eu sou o **Coach de Clareza** do Radar Narcisista.

Estou aqui para te ajudar a **organizar seus pensamentos** sobre o que você está vivendo. Não sou terapeuta, não sou juiz — sou um amigo responsável que vai te ouvir e te ajudar a enxergar padrões.

**Como funciona:**
- Você me conta o que está acontecendo
- Eu te ajudo a organizar os fatos e emoções
- Sugiro possíveis próximos passos
- Faço perguntas para te ajudar a pensar

**Lembre-se:** Eu só conheço o seu lado da história. Vou te ajudar a ter clareza, não a julgar ninguém.

O que você gostaria de conversar hoje?`,
        timestamp: new Date().toISOString()
      }])
      
      setLoading(false)
    }
    init()
  }, [router, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history,
          usarColaborativo: true
        })
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro no chat:', error)
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    if (messages.length > 1 && !confirm('Iniciar nova conversa? O histórico atual será perdido.')) return
    
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Nova conversa iniciada. O que você gostaria de conversar?`,
      timestamp: new Date().toISOString()
    }])
  }

  const formatMessageContent = (content: string) => {
    // Converter markdown básico para HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Coach de Clareza</h1>
                  <p className="text-xs text-gray-500">Conversa segura • Não é terapia</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResponsibilityModal(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Ver lembrete de responsabilidade"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
                title="Ajuda de emergência"
              >
                <Shield className="w-5 h-5" />
              </button>
              <button
                onClick={handleNewConversation}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Nova conversa"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* CHAT AREA */}
      {/* ================================================================ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-violet-600/20' 
                  : 'bg-blue-600/20'
              }`}>
                {message.role === 'user' 
                  ? <User className="w-5 h-5 text-violet-400" />
                  : <Bot className="w-5 h-5 text-blue-400" />
                }
              </div>

              {/* Message */}
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800/80 text-gray-100 border border-slate-700/50'
                }`}>
                  <div 
                    className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1.5 px-2">
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ================================================================ */}
      {/* INPUT AREA */}
      {/* ================================================================ */}
      <div className="sticky bottom-0 bg-[#0F172A]/95 backdrop-blur-sm border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Reminder */}
          <p className="text-[10px] text-gray-500 text-center mb-3">
            ⚠️ Você está relatando <strong>sua perspectiva</strong>. O Radar organiza relatos, não decide quem está certo.
          </p>

          {/* Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Conte o que está acontecendo, do seu jeito..."
                rows={1}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <RadarButton
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </RadarButton>
          </div>

          {/* Shortcuts hint */}
          <p className="text-[10px] text-gray-600 text-center mt-2">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-gray-500">Enter</kbd> para enviar • 
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-gray-500 ml-1">Shift+Enter</kbd> para nova linha
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODAL: Responsabilidade */}
      {/* ================================================================ */}
      <RadarModal
        isOpen={showResponsibilityModal}
        onClose={() => setShowResponsibilityModal(false)}
        title="Lembrete de Responsabilidade"
        size="md"
      >
        <div className="space-y-4">
          <RadarAlertBanner type="warning">
            <p className="font-medium mb-2">"Às vezes acreditamos em um mentiroso e culpamos um inocente."</p>
            <p className="text-sm opacity-80">— Lema do Radar Narcisista BR</p>
          </RadarAlertBanner>

          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong>O que o Coach faz:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Ajuda a organizar seus pensamentos</li>
              <li>Identifica padrões no que você relata</li>
              <li>Sugere próximos passos possíveis</li>
              <li>Faz perguntas para te ajudar a pensar</li>
            </ul>

            <p className="pt-2">
              <strong>O que o Coach NÃO faz:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Não é terapia nem substitui psicólogo</li>
              <li>Não dá diagnósticos clínicos</li>
              <li>Não é prova judicial</li>
              <li>Não decide quem está certo ou errado</li>
            </ul>
          </div>

          <div className="pt-4">
            <RadarButton onClick={() => setShowResponsibilityModal(false)} className="w-full">
              Entendi
            </RadarButton>
          </div>
        </div>
      </RadarModal>

      {/* ================================================================ */}
      {/* MODAL: Emergência */}
      {/* ================================================================ */}
      <RadarModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="Precisa de ajuda agora?"
        size="md"
      >
        <div className="space-y-4">
          <RadarAlertBanner type="danger" title="Se você está em perigo imediato">
            Ligue agora para os serviços de emergência. Sua segurança é prioridade.
          </RadarAlertBanner>

          <div className="space-y-3">
            <EmergencyLink number="190" label="Polícia" description="Risco físico imediato" />
            <EmergencyLink number="188" label="CVV - Valorização da Vida" description="24h, ligação gratuita" />
            <EmergencyLink number="180" label="Central da Mulher" description="Violência doméstica" />
            <EmergencyLink number="192" label="SAMU" description="Emergência médica" />
          </div>

          <div className="pt-4">
            <Link href="/plano-seguranca">
              <RadarButton variant="danger" className="w-full">
                <Shield className="w-4 h-4" />
                Ver meu Plano de Segurança
              </RadarButton>
            </Link>
          </div>
        </div>
      </RadarModal>
    </div>
  )
}

// Componente auxiliar
function EmergencyLink({ number, label, description }: { number: string; label: string; description: string }) {
  return (
    <a href={`tel:${number}`} className="block">
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors">
        <div>
          <p className="font-bold text-white text-lg">{number}</p>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <ExternalLink className="w-5 h-5 text-gray-500" />
      </div>
    </a>
  )
}
