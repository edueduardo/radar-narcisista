'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeSelector } from '../../components/ThemeProvider'
import { Moon, BarChart3, FileText, MessageCircle, ClipboardCheck, ArrowLeft, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState({
    save_history: true,
    save_voice_audio: false,
    allow_ai_learning_product: false,
    allow_ai_dataset_research: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctionRequest, setCorrectionRequest] = useState({ name: '', email: '', description: '' })
  const [isSendingCorrection, setIsSendingCorrection] = useState(false)
  const [exportData, setExportData] = useState<Record<string, unknown> | null>(null)
  const [progress, setProgress] = useState({
    testsCount: 0,
    diaryCount: 0,
    chatSessionsCount: 0
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
    loadProgress()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings
        await createDefaultSettings(user.id)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultSettings = async (userId: string) => {
    const { error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        save_history: true,
        save_voice_audio: false,
        allow_ai_learning_product: false,
        allow_ai_dataset_research: false
      })

    if (error) throw error
  }

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar contagens de progresso
      const [testsResult, diaryResult, sessionsResult] = await Promise.all([
        supabase.from('clarity_tests').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('journal_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('ai_chat_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ])

      setProgress({
        testsCount: testsResult.count || 0,
        diaryCount: diaryResult.count || 0,
        chatSessionsCount: sessionsResult.count || 0
      })
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const exportUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all user data
      const [tests, entries, sessions, messages] = await Promise.all([
        supabase.from('clarity_tests').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('ai_chat_sessions').select('*').eq('user_id', user.id),
        supabase.from('ai_messages').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        settings: settings,
        clarity_tests: tests.data || [],
        journal_entries: entries.data || [],
        ai_chat_sessions: sessions.data || [],
        ai_messages: messages.data || [],
        exported_at: new Date().toISOString()
      }

      setExportData(exportData)

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `radar-narcisista-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    }
  }

  const deleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete all user data from tables
      await Promise.all([
        supabase.from('ai_messages').delete().eq('user_id', user.id),
        supabase.from('ai_chat_sessions').delete().eq('user_id', user.id),
        supabase.from('journal_entries').delete().eq('user_id', user.id),
        supabase.from('clarity_tests').delete().eq('user_id', user.id),
        supabase.from('user_settings').delete().eq('user_id', user.id),
        supabase.from('user_profiles').delete().eq('user_id', user.id)
      ])

      // Fazer logout do usuário
      await supabase.auth.signOut()

      alert('Seus dados foram apagados e você foi deslogado. A conta será completamente removida em até 24h.')
      router.push('/')
    } catch (error) {
      console.error('Erro ao apagar conta:', error)
      alert('Erro ao apagar conta. Tente novamente.')
    }
  }

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!correctionRequest.description.trim()) {
      alert('Descreva quais dados estão incorretos e como devem ser corrigidos.')
      return
    }

    setIsSendingCorrection(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userEmail = correctionRequest.email || user?.email || ''
      const userName = correctionRequest.name || ''

      const subject = encodeURIComponent('Solicitação de correção de dados')
      const bodyLines = [
        'Pedido de correção de dados no Radar Narcisista:',
        '',
        'Descrição da correção:',
        correctionRequest.description,
      ]

      if (userName) {
        bodyLines.push('', `Nome informado: ${userName}`)
      }
      if (userEmail) {
        bodyLines.push(`E-mail de contato: ${userEmail}`)
      }

      const body = encodeURIComponent(bodyLines.join('\n'))
      const mailtoLink = `mailto:privacidade@radarnarcisista.br?subject=${subject}&body=${body}`
      
      // Usar window.open para garantir que o cliente de e-mail abra
      const mailWindow = window.open(mailtoLink, '_blank')
      if (!mailWindow) {
        // Fallback se popup for bloqueado
        window.location.href = mailtoLink
      }

      setShowCorrectionForm(false)
      setCorrectionRequest({ name: '', email: '', description: '' })
    } catch (error) {
      console.error('Erro ao preparar solicitação de correção:', error)
      alert('Não foi possível preparar seu pedido de correção. Tente novamente.')
    } finally {
      setIsSendingCorrection(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 pt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-start mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Configurações de Privacidade
          </h1>
          <p className="text-gray-600">
            Controle seus dados e sua experiência no Radar Narcisista
          </p>
        </div>

        {/* Profissionais Conectados */}
        <Link 
          href="/configuracoes/profissionais"
          className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  Profissionais Conectados
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerencie quais profissionais têm acesso aos seus dados
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Aparência
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Tema</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Escolha entre tema claro, escuro ou automático (segue o sistema).
              </p>
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🔒 Controle de Dados
          </h2>
          
          <div className="space-y-6">
            {/* Save History */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Salvar histórico</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Mantém suas conversas, testes e entradas de diário para acessar depois.
                  Se desativado, funciona como modo "sessão" (não salva nada).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.save_history}
                  onChange={(e) => setSettings(prev => ({ ...prev, save_history: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Save Voice Audio */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Salvar áudios</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Guarda os arquivos de áudio das suas gravações de voz.
                  Recomendamos manter desativado para economizar espaço.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.save_voice_audio}
                  onChange={(e) => setSettings(prev => ({ ...prev, save_voice_audio: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* AI Learning Product */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Aprender com meus dados (produto)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Permite usar padrões derivados (sem texto cru) para melhorar o produto.
                  Nunca compartilhamos seus dados brutos.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_ai_learning_product}
                  onChange={(e) => setSettings(prev => ({ ...prev, allow_ai_learning_product: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* AI Learning Research */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Uso em pesquisas futuras</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Dados anonimizados para pesquisas acadêmicas sobre relações abusivas.
                  Totalmente opcional e com anonimização forte.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_ai_dataset_research}
                  onChange={(e) => setSettings(prev => ({ ...prev, allow_ai_dataset_research: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            📊 Gerenciamento de Dados
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={exportUserData}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar Meus Dados</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Apagar Minha Conta</span>
            </button>
          </div>
        </div>

        {/* Seu Progresso */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Seu Progresso
          </h2>
          
          {settings.save_history ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <ClipboardCheck className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600">{progress.testsCount}</div>
                <div className="text-sm text-gray-600">Testes de Clareza</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{progress.diaryCount}</div>
                <div className="text-sm text-gray-600">Entradas no Diário</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">{progress.chatSessionsCount}</div>
                <div className="text-sm text-gray-600">Sessões de Chat</div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Você optou por não registrar seu progresso. Se mudar de ideia, 
                pode ajustar isso em "Controle de Dados" acima.
              </p>
            </div>
          )}
        </div>

        {/* Termo de Responsabilidade */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            ⚠️ Termo de Responsabilidade
          </h2>
          
          <div className="space-y-4 text-sm text-amber-800">
            <p>
              Ao usar o <strong>Radar Narcisista</strong>, você declara estar ciente e de acordo com o seguinte:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <p><strong>Perspectiva unilateral:</strong> A IA analisa apenas o que você relata. Ela não conhece o outro lado da história, não tem acesso a provas, e não pode verificar a veracidade dos fatos.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <p><strong>Não é diagnóstico:</strong> Nenhuma análise ou relatório gerado por esta plataforma constitui diagnóstico clínico, parecer psicológico, laudo técnico ou prova judicial.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <p><strong>Não substitui profissionais:</strong> Este serviço não substitui acompanhamento de psicólogo, psiquiatra, advogado, assistente social ou qualquer outro profissional qualificado.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="font-medium">4.</span>
                <p><strong>Responsabilidade pelo uso:</strong> Você é integralmente responsável pelo uso que fizer das informações, relatórios e documentos gerados pela plataforma.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="font-medium">5.</span>
                <p><strong>Proibição de uso malicioso:</strong> É expressamente proibido usar esta plataforma para fabricar narrativas falsas, destruir reputações, manipular processos judiciais ou prejudicar terceiros de qualquer forma.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="font-medium">6.</span>
                <p><strong>Proteção de inocentes:</strong> A pessoa do outro lado da história não está aqui para se defender. A plataforma não pode ser usada como arma de acusação injusta.</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-amber-300">
              <p className="text-xs text-amber-700">
                <strong>Ao continuar usando a plataforma, você confirma que leu, entendeu e concorda com estes termos.</strong>
                Em caso de dúvidas, entre em contato: suporte@radarnarcisista.br
              </p>
            </div>
          </div>
        </div>

        {/* LGPD Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Seus Direitos (LGPD)
          </h2>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="font-medium">•</span>
                <p><strong>Acesso:</strong> Você pode baixar todos os seus dados a qualquer momento.</p>
              </div>
              <button
                onClick={exportUserData}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Baixar
              </button>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="font-medium">•</span>
                <p><strong>Correção:</strong> Solicite correção de dados incorretos.</p>
              </div>
              <button
                onClick={() => setShowCorrectionForm(true)}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Solicitar
              </button>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="font-medium">•</span>
                <p><strong>Exclusão:</strong> Apague sua conta e todos os dados permanentemente.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Apagar
              </button>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">•</span>
              <p><strong>Consentimento:</strong> Revogue permissões de uso de dados quando quiser (acima em "Controle de Dados").</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>DPO (Encarregado):</strong> privacidade@radarnarcisista.br<br />
              <strong>Transferência Internacional:</strong> Dados podem ser processados por provedores como OpenAI e Supabase, sempre com segurança compatível com a LGPD.
            </p>
          </div>
        </div>
      </div>

      {/* Correction Request Modal */}
      {showCorrectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <form onSubmit={handleCorrectionSubmit}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Solicitar Correção de Dados</h3>
              <p className="text-sm text-gray-600 mb-4">
                Descreva quais dados estão incorretos e como devem ser corrigidos.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
                  <input
                    type="text"
                    value={correctionRequest.name}
                    onChange={(e) => setCorrectionRequest(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail para contato</label>
                  <input
                    type="email"
                    value={correctionRequest.email}
                    onChange={(e) => setCorrectionRequest(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da correção</label>
                  <textarea
                    value={correctionRequest.description}
                    onChange={(e) => setCorrectionRequest(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Descreva quais dados estão incorretos e como devem ser corrigidos..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCorrectionForm(false)
                    setCorrectionRequest({ name: '', email: '', description: '' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingCorrection}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSendingCorrection ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">&#x26A0; Apagar Conta</h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja apagar sua conta e TODOS os seus dados? 
              Esta ação é IRREVERSÍVEL e apagará permanentemente:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>&#x2022; Seus testes de clareza</li>
              <li>&#x2022; Todas as entradas do diário</li>
              <li>&#x2022; Histórico de conversas com a IA</li>
              <li>&#x2022; Configurações e preferências</li>
              <li>&#x2022; Seu perfil de usuário</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
