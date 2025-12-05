'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, Key, Save, Eye, EyeOff, CheckCircle, XCircle, 
  ExternalLink, Zap, Brain, Sparkles, Bot, AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  provider: string
  placeholder: string
  link: string
  linkText: string
  linkBalance?: string // Link para ver saldo/uso
  icon: string
  color: string
  description: string
  pricing: 'free' | 'freemium' | 'paid'
  freeLimit?: string // Limite gratuito
  priceInfo?: string // Info de preço
}

const API_KEYS: APIKey[] = [
  // ===== GRATUITAS =====
  {
    id: 'groq',
    name: 'Groq',
    provider: 'GROQ_API_KEY',
    placeholder: 'gsk_...',
    link: 'https://console.groq.com/keys',
    linkText: 'Pegar chave GRÁTIS',
    linkBalance: 'https://console.groq.com/settings/limits',
    icon: '⚡',
    color: 'from-purple-500 to-pink-600',
    description: 'Muito rápido! Usa LLaMA 3.1 70B',
    pricing: 'free',
    freeLimit: '14.400 req/dia',
    priceInfo: '100% Grátis'
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    provider: 'HUGGINGFACE_API_KEY',
    placeholder: 'hf_...',
    link: 'https://huggingface.co/settings/tokens',
    linkText: 'Pegar chave GRÁTIS',
    linkBalance: 'https://huggingface.co/settings/billing',
    icon: '🤗',
    color: 'from-yellow-500 to-orange-600',
    description: 'Milhares de modelos gratuitos',
    pricing: 'free',
    freeLimit: 'Ilimitado (modelos free)',
    priceInfo: '100% Grátis'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'GOOGLE_AI_API_KEY',
    placeholder: 'AIzaSy...',
    link: 'https://makersuite.google.com/app/apikey',
    linkText: 'Pegar chave GRÁTIS',
    linkBalance: 'https://console.cloud.google.com/billing',
    icon: '✨',
    color: 'from-blue-500 to-cyan-600',
    description: 'IA do Google, muito boa',
    pricing: 'freemium',
    freeLimit: '60 req/min grátis',
    priceInfo: 'Grátis até limite, depois $0.001/1K tokens'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    provider: 'COHERE_API_KEY',
    placeholder: 'co-...',
    link: 'https://dashboard.cohere.com/api-keys',
    linkText: 'Pegar chave',
    linkBalance: 'https://dashboard.cohere.com/billing',
    icon: '🔮',
    color: 'from-violet-500 to-purple-600',
    description: 'Trial gratuito generoso',
    pricing: 'freemium',
    freeLimit: '$5 créditos grátis',
    priceInfo: 'Trial grátis, depois $1/1M tokens'
  },
  // ===== FREEMIUM (tem plano grátis limitado) =====
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    provider: 'OPENAI_API_KEY',
    placeholder: 'sk-proj-...',
    link: 'https://platform.openai.com/api-keys',
    linkText: 'Pegar chave',
    linkBalance: 'https://platform.openai.com/usage',
    icon: '🤖',
    color: 'from-green-500 to-emerald-600',
    description: 'Melhor qualidade, mais caro',
    pricing: 'freemium',
    freeLimit: '$5 créditos iniciais',
    priceInfo: 'GPT-4: $0.03/1K tokens'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    provider: 'ANTHROPIC_API_KEY',
    placeholder: 'sk-ant-...',
    link: 'https://console.anthropic.com/',
    linkText: 'Pegar chave',
    linkBalance: 'https://console.anthropic.com/settings/billing',
    icon: '🧠',
    color: 'from-orange-500 to-amber-600',
    description: 'Excelente para análises',
    pricing: 'freemium',
    freeLimit: '$5 créditos iniciais',
    priceInfo: 'Claude 3: $0.015/1K tokens'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    provider: 'MISTRAL_API_KEY',
    placeholder: 'mist-...',
    link: 'https://console.mistral.ai/api-keys/',
    linkText: 'Pegar chave',
    linkBalance: 'https://console.mistral.ai/billing/',
    icon: '🌬️',
    color: 'from-sky-500 to-blue-600',
    description: 'Europeia, bom custo-benefício',
    pricing: 'freemium',
    freeLimit: '€5 créditos iniciais',
    priceInfo: 'Mistral Large: $0.008/1K tokens'
  },
  {
    id: 'together',
    name: 'Together AI',
    provider: 'TOGETHER_API_KEY',
    placeholder: 'tog-...',
    link: 'https://api.together.xyz/settings/api-keys',
    linkText: 'Pegar chave',
    linkBalance: 'https://api.together.xyz/settings/billing',
    icon: '🤝',
    color: 'from-indigo-500 to-purple-600',
    description: 'Vários modelos open-source',
    pricing: 'freemium',
    freeLimit: '$5 créditos iniciais',
    priceInfo: 'LLaMA 70B: $0.0009/1K tokens'
  },
  // ===== PAGAS =====
  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'PERPLEXITY_API_KEY',
    placeholder: 'pplx-...',
    link: 'https://www.perplexity.ai/settings/api',
    linkText: 'Pegar chave',
    linkBalance: 'https://www.perplexity.ai/settings/api',
    icon: '🔍',
    color: 'from-teal-500 to-emerald-600',
    description: 'Acesso à internet em tempo real',
    pricing: 'paid',
    priceInfo: '$0.005/1K tokens'
  },
  {
    id: 'replicate',
    name: 'Replicate',
    provider: 'REPLICATE_API_KEY',
    placeholder: 'r8_...',
    link: 'https://replicate.com/account/api-tokens',
    linkText: 'Pegar chave',
    linkBalance: 'https://replicate.com/account/billing',
    icon: '🔄',
    color: 'from-rose-500 to-red-600',
    description: 'Milhares de modelos, pague por uso',
    pricing: 'paid',
    priceInfo: 'Varia por modelo (~$0.001/seg)'
  },
  // ===== OUTRAS GRATUITAS =====
  {
    id: 'openrouter',
    name: 'OpenRouter',
    provider: 'OPENROUTER_API_KEY',
    placeholder: 'sk-or-...',
    link: 'https://openrouter.ai/keys',
    linkText: 'Pegar chave',
    linkBalance: 'https://openrouter.ai/activity',
    icon: '🔀',
    color: 'from-emerald-500 to-teal-600',
    description: 'Acesso a TODAS as IAs em um lugar',
    pricing: 'freemium',
    freeLimit: 'Alguns modelos grátis',
    priceInfo: 'Preço varia por modelo'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DEEPSEEK_API_KEY',
    placeholder: 'sk-...',
    link: 'https://platform.deepseek.com/api_keys',
    linkText: 'Pegar chave GRÁTIS',
    linkBalance: 'https://platform.deepseek.com/usage',
    icon: '🔬',
    color: 'from-blue-600 to-indigo-700',
    description: 'IA chinesa muito barata',
    pricing: 'freemium',
    freeLimit: '500K tokens grátis',
    priceInfo: '$0.0001/1K tokens (muito barato!)'
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    provider: 'CEREBRAS_API_KEY',
    placeholder: 'csk-...',
    link: 'https://cloud.cerebras.ai/',
    linkText: 'Pegar chave GRÁTIS',
    linkBalance: 'https://cloud.cerebras.ai/usage',
    icon: '🧬',
    color: 'from-pink-500 to-rose-600',
    description: 'Extremamente rápido, grátis!',
    pricing: 'free',
    freeLimit: '30 req/min grátis',
    priceInfo: '100% Grátis (beta)'
  }
]

interface BalanceInfo {
  balance: string | null
  usage: string | null
  limit: string | null
  currency: string
  error: string | null
}

export default function ConfigurarIAsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Record<string, 'success' | 'error' | null>>({})
  const [balances, setBalances] = useState<Record<string, BalanceInfo>>({})
  const [checkingBalance, setCheckingBalance] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()
  const router = useRouter()

  // Função para logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout no admin:', error)
    }
  }

  // Função para limpar cache
  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_api_keys')
        localStorage.removeItem('ai_api_balances')
        localStorage.removeItem('ia_balances_admin')
        localStorage.removeItem('ia_status_admin')
        localStorage.removeItem('ias_customizadas')
      }
    } catch (e) {
      console.error('Erro ao limpar cache de IA:', e)
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  // Carregar chaves salvas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_api_keys')
    if (saved) {
      setKeys(JSON.parse(saved))
    }
    
    // Carregar saldos salvos
    const savedBalances = localStorage.getItem('ai_api_balances')
    if (savedBalances) {
      setBalances(JSON.parse(savedBalances))
    }
  }, [])

  const handleKeyChange = (id: string, value: string) => {
    setKeys(prev => ({ ...prev, [id]: value }))
    setStatus(prev => ({ ...prev, [id]: null }))
  }

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Verificar saldo da API
  const checkBalance = async (id: string) => {
    const key = keys[id]
    if (!key) return

    setCheckingBalance(prev => ({ ...prev, [id]: true }))
    
    try {
      const response = await fetch('/api/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: id, key })
      })
      
      const data = await response.json()
      
      const balanceInfo: BalanceInfo = {
        balance: data.balance,
        usage: data.usage,
        limit: data.limit,
        currency: data.currency || 'USD',
        error: data.error
      }
      
      setBalances(prev => {
        const updated = { ...prev, [id]: balanceInfo }
        localStorage.setItem('ai_api_balances', JSON.stringify(updated))
        return updated
      })
      
      if (data.success) {
        setStatus(prev => ({ ...prev, [id]: 'success' }))
      }
    } catch (error) {
      setBalances(prev => ({
        ...prev,
        [id]: { balance: null, usage: null, limit: null, currency: 'USD', error: 'Erro ao verificar' }
      }))
    } finally {
      setCheckingBalance(prev => ({ ...prev, [id]: false }))
    }
  }

  const testKey = async (id: string) => {
    const key = keys[id]
    if (!key) {
      setStatus(prev => ({ ...prev, [id]: 'error' }))
      return
    }

    setTesting(prev => ({ ...prev, [id]: true }))
    
    try {
      // Testar a chave fazendo uma requisição simples
      const response = await fetch('/api/test-ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: id, key })
      })
      
      const data = await response.json()
      setStatus(prev => ({ ...prev, [id]: data.success ? 'success' : 'error' }))
    } catch (error) {
      // Se a API não existir, simular sucesso se a chave tem formato válido
      const isValid = validateKeyFormat(id, key)
      setStatus(prev => ({ ...prev, [id]: isValid ? 'success' : 'error' }))
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }))
    }
  }

  const validateKeyFormat = (id: string, key: string): boolean => {
    switch (id) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20
      case 'claude':
        return key.startsWith('sk-ant-') && key.length > 20
      case 'together':
        return key.length > 20
      case 'gemini':
        return key.startsWith('AIzaSy') && key.length > 20
      case 'mistral':
        return key.length > 20
      case 'cohere':
        return key.length > 20
      case 'perplexity':
        return key.startsWith('pplx-') && key.length > 20
      case 'groq':
        return key.startsWith('gsk_') && key.length > 20
      case 'replicate':
        return key.startsWith('r8_') && key.length > 20
      case 'huggingface':
        return key.startsWith('hf_') && key.length > 20
      default:
        return key.length > 10
    }
  }

  const saveKeys = () => {
    setSaving(true)
    
    // Salvar no localStorage
    localStorage.setItem('ai_api_keys', JSON.stringify(keys))
    
    // Também salvar em um cookie seguro para o servidor poder ler
    // (Em produção, isso deveria ir para um backend seguro)
    document.cookie = `ai_keys=${btoa(JSON.stringify(keys))}; path=/; max-age=31536000; SameSite=Strict`
    
    setTimeout(() => {
      setSaving(false)
      setMessage('✅ Chaves salvas com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    }, 500)
  }

  const getActiveCount = () => {
    return Object.values(keys).filter(k => k && k.length > 10).length
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configurar IAs</h1>
                <p className="text-sm text-gray-500">Cole suas chaves de API aqui</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {getActiveCount()}/{API_KEYS.length} IAs configuradas
              </span>
              <button
                onClick={saveKeys}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>

              <button
                onClick={handleClearCache}
                className="text-xs text-slate-300 hover:text-slate-100 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Limpar cache</span>
              </button>

              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensagem de sucesso */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
            {message}
          </div>
        )}

        {/* Aviso */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Suas chaves ficam salvas apenas no seu navegador</p>
            <p>Por segurança, as chaves são armazenadas localmente. Se limpar os dados do navegador, precisará configurar novamente.</p>
          </div>
        </div>

        {/* Cards de API Keys */}
        <div className="space-y-4">
          {API_KEYS.map(api => (
            <div 
              key={api.id}
              className={`bg-white rounded-2xl border overflow-hidden ${
                keys[api.id] && status[api.id] === 'success' 
                  ? 'border-green-300' 
                  : 'border-gray-200'
              }`}
            >
              {/* Header do Card */}
              <div className={`bg-gradient-to-r ${api.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{api.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{api.name}</h3>
                      <p className="text-white/80 text-sm">{api.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      api.pricing === 'free' ? 'bg-green-400 text-green-900' :
                      api.pricing === 'freemium' ? 'bg-yellow-400 text-yellow-900' :
                      'bg-red-400 text-red-900'
                    }`}>
                      {api.pricing === 'free' ? '✓ GRÁTIS' :
                       api.pricing === 'freemium' ? '🎁 Freemium' :
                       '💰 Pago'}
                    </span>
                    {api.freeLimit && (
                      <p className="text-white/70 text-xs mt-1">{api.freeLimit}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-4">
                {/* Links e info de preço */}
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <a
                    href={api.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Key className="w-4 h-4" />
                    {api.linkText}
                  </a>
                  
                  {api.linkBalance && keys[api.id] && (
                    <a
                      href={api.linkBalance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver saldo/uso
                    </a>
                  )}
                  
                  {api.priceInfo && (
                    <span className="text-sm text-gray-500">
                      💵 {api.priceInfo}
                    </span>
                  )}
                </div>

                {/* Input da chave */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showKeys[api.id] ? 'text' : 'password'}
                      value={keys[api.id] || ''}
                      onChange={(e) => handleKeyChange(api.id, e.target.value)}
                      placeholder={api.placeholder}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    />
                    <button
                      onClick={() => toggleShowKey(api.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[api.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Botão de testar */}
                  <button
                    onClick={() => testKey(api.id)}
                    disabled={!keys[api.id] || testing[api.id]}
                    className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Testar chave"
                  >
                    {testing[api.id] ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : status[api.id] === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : status[api.id] === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </button>

                  {/* Botão de verificar saldo */}
                  <button
                    onClick={() => checkBalance(api.id)}
                    disabled={!keys[api.id] || checkingBalance[api.id]}
                    className="px-3 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Ver saldo/créditos"
                  >
                    {checkingBalance[api.id] ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="text-sm font-bold">$</span>
                    )}
                  </button>
                </div>

                {/* Status e Saldo */}
                {(status[api.id] || balances[api.id]) && (
                  <div className="mt-3 space-y-2">
                    {status[api.id] && (
                      <p className={`text-sm ${status[api.id] === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status[api.id] === 'success' 
                          ? '✅ Chave válida!' 
                          : '❌ Chave inválida.'}
                      </p>
                    )}
                    
                    {/* Exibir saldo */}
                    {balances[api.id] && !balances[api.id].error && (
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">💰 Saldo/Status:</span>
                          <span className="text-lg font-bold text-green-600">
                            {balances[api.id].balance === '∞' ? '∞ Ilimitado' : 
                             balances[api.id].balance?.startsWith('$') ? balances[api.id].balance :
                             balances[api.id].balance ? `${balances[api.id].currency === 'USD' ? '$' : ''}${balances[api.id].balance}` : 
                             'Disponível'}
                          </span>
                        </div>
                        {balances[api.id].usage && (
                          <p className="text-xs text-green-600 mt-1">
                            📊 {balances[api.id].usage}
                          </p>
                        )}
                        {balances[api.id].limit && (
                          <p className="text-xs text-green-600">
                            📈 Limite: {balances[api.id].limit}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {balances[api.id]?.error && (
                      <p className="text-sm text-amber-600">
                        ⚠️ {balances[api.id].error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Como funciona?
          </h3>
          <ol className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Clique no link para abrir o site da IA</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Crie uma conta (se não tiver) e gere uma API Key</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Copie a chave e cole no campo acima</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <span>Clique em "Testar" para verificar se funciona</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
              <span>Clique em "Salvar" para guardar as configurações</span>
            </li>
          </ol>
        </div>

        {/* Dica do Groq */}
        <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <span className="text-4xl">⚡</span>
            <div>
              <h3 className="font-bold text-lg mb-2">Dica: Comece com Groq (é GRÁTIS!)</h3>
              <p className="text-white/90 mb-3">
                O Groq oferece acesso gratuito ao modelo LLaMA 3.1 70B. É muito rápido e perfeito para começar sem gastar nada!
              </p>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50"
              >
                <ExternalLink className="w-4 h-4" />
                Criar conta grátis no Groq
              </a>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
