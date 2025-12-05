'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Mail, Lock, AlertCircle, Phone, Heart, ArrowLeft } from 'lucide-react'

// Lista de emails admin - redireciona direto para /admin
const ADMIN_EMAILS = ['etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com']

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha email e senha')
      setLoading(false)
      return
    }

    try {
      console.log('Tentando login com:', email)
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Erro de login:', error)
        throw error
      }

      const userEmail = data.user?.email?.toLowerCase()
      const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)
      console.log('Login OK! Email:', userEmail)
      console.log('É admin?', isAdmin)

      if (isAdmin) {
        console.log('Usuário admin, redirecionando para /admin...')
        window.location.href = '/admin'
      } else {
        console.log('Usuário não admin, redirecionando para', redirect)
        window.location.href = redirect
      }
    } catch (error: any) {
      console.error('Erro completo:', error)
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Digite seu email para redefinir a senha')
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      })
      if (error) throw error
      alert('Email de redefinição enviado! Verifique sua caixa de entrada.')
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar email de redefinição')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-8 transition-smooth">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao início</span>
          </Link>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vinda(o) de volta</h1>
            <p className="text-gray-600">Continue seu caminho para a clareza</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-styled pl-12"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            <div className="text-right">
              <button type="button" onClick={handlePasswordReset} className="text-sm text-purple-600 hover:text-purple-700 transition-smooth">
                Esqueceu a senha?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="text-purple-600 hover:text-purple-700 font-medium transition-smooth">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Emergency Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-purple-800 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-2xl font-bold mb-6">Precisa de ajuda urgente?</h2>
          <p className="text-purple-100 mb-8">Se você está em risco imediato, procure ajuda agora mesmo.</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <Phone className="w-6 h-6" />
              <div>
                <p className="font-bold text-xl">190</p>
                <p className="text-sm text-purple-200">Polícia - Emergência</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <Heart className="w-6 h-6" />
              <div>
                <p className="font-bold text-xl">188</p>
                <p className="text-sm text-purple-200">CVV - Apoio Emocional 24h</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold text-xl">100</p>
                <p className="text-sm text-purple-200">Direitos Humanos - Denúncias</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-purple-200 text-center">
            <strong>Para TODOS:</strong> Homens, mulheres, jovens, idosos — você merece ajuda.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
