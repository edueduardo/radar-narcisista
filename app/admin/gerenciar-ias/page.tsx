'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, Plus, Trash2, Save, ExternalLink, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Sparkles, Clock
} from 'lucide-react'
import { IAS_DISPONIVEIS, type IAConfig, isIANova } from '@/lib/ia-registry'

export default function GerenciarIAsPage() {
  const [ias, setIas] = useState<IAConfig[]>([])
  const [iasCustom, setIasCustom] = useState<IAConfig[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
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
  
  // Form para nova IA
  const [novaIA, setNovaIA] = useState<Partial<IAConfig>>({
    id: '',
    nome: '',
    icon: '🤖',
    categoria: 'freemium',
    placeholder: '',
    linkChave: '',
    linkSaldo: '',
    descricao: '',
    adicionadoEm: new Date().toISOString().split('T')[0],
  })

  // Carregar IAs
  useEffect(() => {
    // IAs do registro
    setIas(IAS_DISPONIVEIS)
    
    // IAs customizadas salvas no localStorage
    const saved = localStorage.getItem('ias_customizadas')
    if (saved) {
      try {
        setIasCustom(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  // Adicionar nova IA
  const adicionarIA = () => {
    if (!novaIA.id || !novaIA.nome || !novaIA.linkChave) {
      setMessage('❌ Preencha ID, Nome e Link da Chave')
      return
    }

    // Verificar se já existe
    if (ias.find(ia => ia.id === novaIA.id) || iasCustom.find(ia => ia.id === novaIA.id)) {
      setMessage('❌ Já existe uma IA com esse ID')
      return
    }

    const nova: IAConfig = {
      id: novaIA.id!.toLowerCase().replace(/\s/g, '-'),
      nome: novaIA.nome!,
      icon: novaIA.icon || '🤖',
      categoria: novaIA.categoria as 'free' | 'freemium' | 'paid',
      placeholder: novaIA.placeholder || '',
      linkChave: novaIA.linkChave!,
      linkSaldo: novaIA.linkSaldo || novaIA.linkChave!,
      descricao: novaIA.descricao || '',
      adicionadoEm: novaIA.adicionadoEm || new Date().toISOString().split('T')[0],
    }

    const novasCustom = [...iasCustom, nova]
    setIasCustom(novasCustom)
    localStorage.setItem('ias_customizadas', JSON.stringify(novasCustom))
    
    // Limpar form
    setNovaIA({
      id: '',
      nome: '',
      icon: '🤖',
      categoria: 'freemium',
      placeholder: '',
      linkChave: '',
      linkSaldo: '',
      descricao: '',
      adicionadoEm: new Date().toISOString().split('T')[0],
    })
    setShowAddForm(false)
    setMessage('✅ IA adicionada com sucesso!')
    setTimeout(() => setMessage(''), 3000)
  }

  // Remover IA customizada
  const removerIA = (id: string) => {
    const novasCustom = iasCustom.filter(ia => ia.id !== id)
    setIasCustom(novasCustom)
    localStorage.setItem('ias_customizadas', JSON.stringify(novasCustom))
    setMessage('✅ IA removida')
    setTimeout(() => setMessage(''), 3000)
  }

  // Contar novas IAs
  const novasIAs = ias.filter(ia => isIANova(ia))

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
                <h1 className="text-xl font-bold text-gray-900">Gerenciar IAs</h1>
                <p className="text-sm text-gray-500">Adicione ou remova IAs do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Adicionar Nova IA
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
        {/* Mensagem */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center ${
            message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Aviso de novas IAs */}
        {novasIAs.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <div>
                <h3 className="font-semibold text-purple-900">
                  {novasIAs.length} nova(s) IA(s) disponível(is)!
                </h3>
                <p className="text-sm text-purple-700">
                  {novasIAs.map(ia => ia.nome).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form para adicionar nova IA */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              Adicionar Nova IA
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID (único, sem espaços) *
                </label>
                <input
                  type="text"
                  value={novaIA.id}
                  onChange={(e) => setNovaIA({...novaIA, id: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                  placeholder="ex: nova-ia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={novaIA.nome}
                  onChange={(e) => setNovaIA({...novaIA, nome: e.target.value})}
                  placeholder="ex: Nova IA Incrível"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ícone (emoji)
                </label>
                <input
                  type="text"
                  value={novaIA.icon}
                  onChange={(e) => setNovaIA({...novaIA, icon: e.target.value})}
                  placeholder="🤖"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={novaIA.categoria}
                  onChange={(e) => setNovaIA({...novaIA, categoria: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="free">🆓 Grátis</option>
                  <option value="freemium">🎁 Freemium</option>
                  <option value="paid">💰 Pago</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link para pegar chave *
                </label>
                <input
                  type="url"
                  value={novaIA.linkChave}
                  onChange={(e) => setNovaIA({...novaIA, linkChave: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link para ver saldo
                </label>
                <input
                  type="url"
                  value={novaIA.linkSaldo}
                  onChange={(e) => setNovaIA({...novaIA, linkSaldo: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder da chave
                </label>
                <input
                  type="text"
                  value={novaIA.placeholder}
                  onChange={(e) => setNovaIA({...novaIA, placeholder: e.target.value})}
                  placeholder="ex: sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={novaIA.descricao}
                  onChange={(e) => setNovaIA({...novaIA, descricao: e.target.value})}
                  placeholder="Breve descrição..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={adicionarIA}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Adicionar IA
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Onde descobrir novas IAs */}
        <div className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">🔍 Onde descobrir novas IAs?</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="https://theresanaiforthat.com" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium">There's an AI for That</p>
                <p className="text-xs text-gray-500">Catálogo de IAs por categoria</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
            
            <a href="https://www.futuretools.io" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-2xl">🛠️</span>
              <div>
                <p className="font-medium">Future Tools</p>
                <p className="text-xs text-gray-500">Novas ferramentas de IA</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
            
            <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-2xl">🔀</span>
              <div>
                <p className="font-medium">OpenRouter</p>
                <p className="text-xs text-gray-500">Todas as IAs em um lugar</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
            
            <a href="https://artificialanalysis.ai" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium">Artificial Analysis</p>
                <p className="text-xs text-gray-500">Comparar preço e qualidade</p>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </a>
          </div>
        </div>

        {/* IAs Customizadas */}
        {iasCustom.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Suas IAs Adicionadas ({iasCustom.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {iasCustom.map(ia => (
                <div key={ia.id} className="bg-white rounded-xl border-2 border-green-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ia.icon}</span>
                      <div>
                        <p className="font-medium">{ia.nome}</p>
                        <p className="text-xs text-gray-500">{ia.descricao}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removerIA(ia.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <a href={ia.linkChave} target="_blank" rel="noopener noreferrer"
                       className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      Pegar chave
                    </a>
                    <span className={`text-xs px-2 py-1 rounded ${
                      ia.categoria === 'free' ? 'bg-green-100 text-green-700' :
                      ia.categoria === 'freemium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {ia.categoria === 'free' ? '🆓 Grátis' :
                       ia.categoria === 'freemium' ? '🎁 Freemium' : '💰 Pago'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IAs do Sistema */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📦 IAs do Sistema ({ias.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {ias.map(ia => (
              <div key={ia.id} className={`bg-white rounded-xl border p-4 ${
                isIANova(ia) ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{ia.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{ia.nome}</p>
                      {isIANova(ia) && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
                          NOVO!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{ia.descricao}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={ia.linkChave} target="_blank" rel="noopener noreferrer"
                     className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                    Pegar chave
                  </a>
                  <span className={`text-xs px-2 py-1 rounded ${
                    ia.categoria === 'free' ? 'bg-green-100 text-green-700' :
                    ia.categoria === 'freemium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {ia.categoria === 'free' ? '🆓 Grátis' :
                     ia.categoria === 'freemium' ? '🎁 Freemium' : '💰 Pago'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Como adicionar uma nova IA permanentemente?
          </h3>
          <ol className="space-y-2 text-sm text-amber-800">
            <li>1. Abra o arquivo <code className="bg-amber-100 px-1 rounded">lib/ia-registry.ts</code></li>
            <li>2. Adicione a nova IA na lista <code className="bg-amber-100 px-1 rounded">IAS_DISPONIVEIS</code></li>
            <li>3. Preencha todos os campos (id, nome, icon, categoria, links)</li>
            <li>4. Salve o arquivo - a IA aparecerá automaticamente no Admin!</li>
          </ol>
        </div>
      </main>
      </div>
    </div>
  )
}
