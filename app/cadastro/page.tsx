'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Mail, Lock, AlertCircle, ArrowLeft, Shield, Check, Target, Sparkles, LogIn, Loader2 } from 'lucide-react'

// Componente interno que usa useSearchParams
function CadastroContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mode, setMode] = useState<'unified' | 'login' | 'signup'>('unified') // Modo unificado
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Detecta se veio do teste de clareza
  const fromTeste = searchParams.get('from') === 'teste'
  const redirectUrl = searchParams.get('redirect') || '/dashboard'

  // Função unificada: tenta login, se falhar cria conta
  const handleUnifiedAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      // Primeiro tenta fazer login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!loginError && loginData.user) {
        // Login bem sucedido!
        // Se veio do teste, salva o resultado
        if (fromTeste) {
          await saveTestResult(loginData.user.id)
        }
        router.push(redirectUrl)
        return
      }
      
      // Se o erro for "Invalid login credentials", a conta não existe ou senha errada
      // Vamos tentar criar a conta
      if (loginError?.message?.includes('Invalid login credentials')) {
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${redirectUrl}` }
        })
        
        if (signupError) {
          // Se já existe conta, a senha está errada
          if (signupError.message?.includes('already registered')) {
            setError('Senha incorreta. Tente novamente ou recupere sua senha.')
          } else {
            throw signupError
          }
          return
        }
        
        // Conta criada com sucesso
        if (signupData.user) {
          if (fromTeste) {
            await saveTestResult(signupData.user.id)
          }
          setSuccess(true)
        }
        return
      }
      
      // Outro tipo de erro
      throw loginError
      
    } catch (error: any) {
      setError(error.message || 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  // Função de cadastro normal (sem vir do teste)
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer cadastro')
    } finally {
      setLoading(false)
    }
  }

  // Salva resultado do teste no banco
  const saveTestResult = async (userId: string) => {
    const savedResult = localStorage.getItem('radar-test-result')
    if (savedResult) {
      try {
        const { answers, result, userNarrative } = JSON.parse(savedResult)
        await supabase.from('clarity_tests').insert({
          user_id: userId,
          test_type: 'unificado_v3',
          raw_answers: answers,
          user_narrative: userNarrative || '',
          fog_score: result.axisScores?.find((a: any) => a.axis === 'nevoa')?.totalScore || 0,
          fear_score: result.axisScores?.find((a: any) => a.axis === 'medo')?.totalScore || 0,
          limits_score: result.axisScores?.find((a: any) => a.axis === 'limites')?.totalScore || 0,
          global_zone: result.globalZone,
          overall_percentage: result.overallPercentage,
          has_physical_risk: result.hasPhysicalRisk,
          created_at: new Date().toISOString(),
        })
      } catch (saveError) {
        console.error('Erro ao salvar teste:', saveError)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Conta criada com sucesso!</h1>
          <p className="text-gray-600 mb-6">
            Enviamos um email de confirmação para <strong>{email}</strong>. 
            Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          {fromTeste ? (
            <div className="space-y-3">
              <p className="text-sm text-purple-600 font-medium">
                ✨ Seu resultado do teste foi salvo!
              </p>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                Fazer Login para Ver Resultado
              </Link>
            </div>
          ) : (
            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
              Ir para Login
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-purple-800 items-center justify-center p-12">
        <div className="max-w-md text-white">
          {fromTeste ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Seu teste está pronto! 🎉</h2>
              <p className="text-purple-100 mb-6">Crie sua conta gratuita para ver seu resultado e salvá-lo com segurança.</p>
              <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                <p className="text-sm text-purple-200">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Seu resultado ficará salvo e você poderá acessar quando quiser.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-6">Comece sua jornada para a clareza</h2>
              <p className="text-purple-100 mb-8">Ao criar sua conta, você terá acesso a:</p>
            </>
          )}
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Teste de Clareza completo</p>
                <p className="text-sm text-purple-200">Identifique padrões em sua relação</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Diário de Episódios</p>
                <p className="text-sm text-purple-200">Registre e organize suas experiências</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Coach de Clareza (IA)</p>
                <p className="text-sm text-purple-200">Apoio empático disponível 24/7</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">100% Seguro e Privado</p>
                <p className="text-sm text-purple-200">Seus dados protegidos pela LGPD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-8 transition-smooth">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao início</span>
          </Link>

          <div className="mb-8">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg ${fromTeste ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gradient-to-br from-purple-600 to-purple-700 shadow-purple-500/30'}`}>
              {fromTeste ? <Target className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
            </div>
            {fromTeste ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quase lá! 🎯</h1>
                <p className="text-gray-600">Entre ou crie sua conta para ver seu resultado</p>
                <p className="text-xs text-gray-500 mt-2">
                  Já tem conta? Use seu email e senha. Não tem? Crie agora mesmo!
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta gratuita</h1>
                <p className="text-gray-600">Comece seu caminho para a clareza hoje</p>
              </>
            )}
          </div>

          <form onSubmit={fromTeste ? handleUnifiedAuth : handleCadastro} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-styled pl-12"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete={fromTeste ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-styled pl-12"
                  placeholder={fromTeste ? 'Sua senha' : 'Mínimo 6 caracteres'}
                />
              </div>
            </div>

            {/* Só mostra confirmar senha se NÃO veio do teste */}
            {!fromTeste && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-styled pl-12"
                    placeholder="Digite a senha novamente"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-2 disabled:opacity-50 py-3 px-6 rounded-xl font-semibold transition-all ${fromTeste ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30' : 'btn-primary'}`}>
              {loading ? (fromTeste ? 'Entrando...' : 'Criando conta...') : fromTeste ? '🎯 Entrar e Ver Resultado' : 'Criar Conta Gratuita'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {fromTeste ? 'Não tem conta? Será criada automaticamente!' : 'Já tem uma conta?'}{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-smooth">
              Entrar
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-500">
            Ao criar sua conta, você concorda com nossa{' '}
            <Link href="/configuracoes" className="text-purple-600 hover:text-purple-700">política de privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente de loading
function CadastroLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

// Componente exportado com Suspense
export default function CadastroPage() {
  return (
    <Suspense fallback={<CadastroLoading />}>
      <CadastroContent />
    </Suspense>
  )
}
