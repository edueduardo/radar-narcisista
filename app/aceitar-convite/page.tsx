'use client'

/**
 * ETAPA 12.1.1: Página de Aceite de Convite
 * 
 * Fluxo:
 * 1. Cliente recebe código do profissional
 * 2. Acessa /aceitar-convite ou /aceitar-convite?codigo=XXXXXXXX
 * 3. Se não logado: mostra opções de login/cadastro
 * 4. Se logado: valida código e mostra formulário de permissões
 * 5. Cliente escolhe o que compartilhar e confirma
 * 6. Vínculo fica ACTIVE
 * 
 * LGPD/Ética:
 * - Texto claro sobre o que será compartilhado
 * - Aviso de que Radar NÃO é terapia/laudo
 * - Cliente pode revogar no futuro
 */

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  Activity,
  Bell,
  Lock,
  Info,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

// =============================================================================
// TIPOS
// =============================================================================

interface InviteData {
  id: string
  professionalName: string
  suggestedPermissions: {
    share_clarity_tests: boolean
    share_journal_entries: boolean
    share_chat_summaries: boolean
    share_safety_plan: boolean
    share_risk_alerts: boolean
  }
}

interface PermissionOption {
  key: keyof InviteData['suggestedPermissions']
  label: string
  description: string
  icon: React.ReactNode
  sensitive: boolean
}

// =============================================================================
// CONSTANTES
// =============================================================================

const PERMISSION_OPTIONS: PermissionOption[] = [
  {
    key: 'share_clarity_tests',
    label: 'Teste de Clareza',
    description: 'Resultados dos seus testes de clareza emocional',
    icon: <Activity className="w-5 h-5" />,
    sensitive: false
  },
  {
    key: 'share_journal_entries',
    label: 'Diário',
    description: 'Resumos das suas entradas no diário',
    icon: <FileText className="w-5 h-5" />,
    sensitive: false
  },
  {
    key: 'share_chat_summaries',
    label: 'Resumos do Chat',
    description: 'Resumos das conversas com a IA do Radar',
    icon: <MessageSquare className="w-5 h-5" />,
    sensitive: false
  },
  {
    key: 'share_safety_plan',
    label: 'Plano de Segurança',
    description: 'Informações do seu plano de segurança pessoal',
    icon: <Shield className="w-5 h-5" />,
    sensitive: true
  },
  {
    key: 'share_risk_alerts',
    label: 'Alertas de Risco',
    description: 'Notificações sobre padrões de risco identificados',
    icon: <Bell className="w-5 h-5" />,
    sensitive: true
  }
]

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

function AceitarConviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Código do convite
  const [code, setCode] = useState('')
  const [codeFromUrl, setCodeFromUrl] = useState(false)
  
  // Validação
  const [validating, setValidating] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Permissões
  const [permissions, setPermissions] = useState({
    share_clarity_tests: true,
    share_journal_entries: true,
    share_chat_summaries: true,
    share_safety_plan: false,
    share_risk_alerts: false
  })
  
  // Aceite
  const [accepting, setAccepting] = useState(false)
  const [acceptSuccess, setAcceptSuccess] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  
  // ==========================================================================
  // VERIFICAR AUTENTICAÇÃO
  // ==========================================================================
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)
        setUserId(user?.id || null)
        
        // Verificar se há código na URL
        const urlCode = searchParams.get('codigo') || searchParams.get('code')
        if (urlCode) {
          setCode(urlCode.toUpperCase())
          setCodeFromUrl(true)
        }
      } catch (error) {
        console.error('Erro ao verificar auth:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [supabase, searchParams])
  
  // Auto-validar se código veio da URL e usuário está logado
  useEffect(() => {
    if (isLoggedIn && codeFromUrl && code && !inviteData && !validationError) {
      handleValidateCode()
    }
  }, [isLoggedIn, codeFromUrl, code])
  
  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  
  const handleValidateCode = async () => {
    if (!code.trim()) {
      setValidationError('Digite o código de convite')
      return
    }
    
    setValidating(true)
    setValidationError(null)
    
    try {
      const response = await fetch('/api/professional/invite/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.valid) {
        setValidationError(data.error || 'Código inválido')
        setInviteData(null)
        return
      }
      
      setInviteData(data.invite)
      // Usar permissões sugeridas pelo profissional
      setPermissions(data.invite.suggestedPermissions)
      
    } catch (error) {
      console.error('Erro ao validar código:', error)
      setValidationError('Erro ao validar código. Tente novamente.')
    } finally {
      setValidating(false)
    }
  }
  
  const handleAcceptInvite = async () => {
    if (!inviteData) return
    
    setAccepting(true)
    setAcceptError(null)
    
    try {
      const response = await fetch('/api/professional/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          ...permissions
        })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        setAcceptError(data.error || 'Erro ao aceitar convite')
        return
      }
      
      setAcceptSuccess(true)
      
    } catch (error) {
      console.error('Erro ao aceitar convite:', error)
      setAcceptError('Erro ao aceitar convite. Tente novamente.')
    } finally {
      setAccepting(false)
    }
  }
  
  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  
  // ==========================================================================
  // LOADING
  // ==========================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // SUCESSO
  // ==========================================================================
  
  if (acceptSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Conexão Estabelecida!
          </h1>
          <p className="text-gray-600 mb-6">
            Você agora está conectado com <strong>{inviteData?.professionalName}</strong>.
            As informações que você autorizou serão compartilhadas.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Você autorizou:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {permissions.share_clarity_tests && <li>✓ Teste de Clareza</li>}
              {permissions.share_journal_entries && <li>✓ Diário</li>}
              {permissions.share_chat_summaries && <li>✓ Resumos do Chat</li>}
              {permissions.share_safety_plan && <li>✓ Plano de Segurança</li>}
              {permissions.share_risk_alerts && <li>✓ Alertas de Risco</li>}
            </ul>
          </div>
          
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
          >
            Ir para meu Dashboard
          </Link>
          
          <p className="text-xs text-gray-500 mt-4">
            Você pode gerenciar suas conexões nas configurações.
          </p>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // NÃO LOGADO
  // ==========================================================================
  
  if (!isLoggedIn) {
    const redirectUrl = code 
      ? `/aceitar-convite?codigo=${encodeURIComponent(code)}`
      : '/aceitar-convite'
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-lg mx-auto pt-8">
          {/* Header */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao início</span>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Ícone */}
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-8 h-8 text-purple-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Aceitar Convite Profissional
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Um profissional quer acompanhar sua jornada no Radar Narcisista.
              Para aceitar, você precisa ter uma conta.
            </p>
            
            {/* Campo de código */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código do Convite
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: A1B2C3D4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                O código foi enviado pelo seu profissional
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="space-y-3">
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Já tenho conta - Entrar
              </Link>
              
              <Link
                href={`/cadastro?redirect=${encodeURIComponent(redirectUrl)}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-xl transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Criar minha conta
              </Link>
            </div>
            
            {/* Aviso ético */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <p>
                    O Radar Narcisista é uma ferramenta de apoio e autoconhecimento.
                    <strong> Não substitui</strong> terapia, diagnóstico, laudo ou parecer técnico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // LOGADO - FORMULÁRIO DE ACEITE
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-lg mx-auto pt-8">
        {/* Header */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar ao Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Ícone */}
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-8 h-8 text-purple-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Aceitar Convite Profissional
          </h1>
          
          {/* ETAPA 1: Digitar código */}
          {!inviteData && (
            <>
              <p className="text-gray-600 text-center mb-6">
                Digite o código que você recebeu do seu profissional.
              </p>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setValidationError(null)
                  }}
                  placeholder="Ex: A1B2C3D4"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-xl font-mono tracking-wider focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={8}
                  disabled={validating}
                />
              </div>
              
              {validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{validationError}</p>
                </div>
              )}
              
              <button
                onClick={handleValidateCode}
                disabled={validating || !code.trim()}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    Validar Código
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          )}
          
          {/* ETAPA 2: Escolher permissões */}
          {inviteData && !acceptSuccess && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                  <CheckCircle className="w-4 h-4" />
                  Código válido!
                </div>
                <p className="text-gray-600">
                  <strong>{inviteData.professionalName}</strong> quer acompanhar sua jornada.
                  Escolha o que deseja compartilhar:
                </p>
              </div>
              
              {/* Lista de permissões */}
              <div className="space-y-3 mb-6">
                {PERMISSION_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => togglePermission(option.key)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${
                      permissions[option.key]
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      permissions[option.key]
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          permissions[option.key] ? 'text-purple-900' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </span>
                        {option.sensitive && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            Sensível
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      permissions[option.key]
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {permissions[option.key] && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Aviso ético */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Lembre-se:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• O Radar Narcisista <strong>não substitui</strong> terapia, diagnóstico ou laudo profissional.</li>
                      <li>• O profissional continua responsável por suas próprias avaliações.</li>
                      <li>• Você pode <strong>revogar este acesso</strong> a qualquer momento nas configurações.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {acceptError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{acceptError}</p>
                </div>
              )}
              
              {/* Botões */}
              <div className="space-y-3">
                <button
                  onClick={handleAcceptInvite}
                  disabled={accepting}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Aceitando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Aceitar e Conectar
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setInviteData(null)
                    setCode('')
                    setValidationError(null)
                  }}
                  className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Rodapé informativo */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Ao aceitar, você concorda em compartilhar as informações selecionadas
            com o profissional indicado, conforme nossa{' '}
            <Link href="/privacidade" className="text-purple-600 hover:underline">
              Política de Privacidade
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// EXPORT COM SUSPENSE
// =============================================================================

export default function AceitarConvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <AceitarConviteContent />
    </Suspense>
  )
}
