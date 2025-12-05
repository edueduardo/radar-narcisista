'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, Sparkles, Video, TrendingUp, Instagram, Youtube, 
  Lightbulb, DollarSign, Users, Settings, Power, PowerOff, 
  RefreshCw, Copy, Check, Brain, BarChart3, Hash, Mic, Mail, 
  Newspaper, Building, AlertTriangle
} from 'lucide-react'

interface ModuloIA {
  id: string
  nome: string
  descricao: string
  icone: any
  ativo: boolean
}

interface Sugestao {
  id: string
  tipo: string
  titulo: string
  conteudo: string
  hashtags?: string[]
  usado: boolean
}

export default function IAAssistentePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config'>('dashboard')
  const [modulos, setModulos] = useState<ModuloIA[]>([
    { id: 'reels', nome: 'Gerador de Reels', descricao: 'Ideias para Instagram e TikTok', icone: Video, ativo: true },
    { id: 'youtube', nome: 'Ideias YouTube', descricao: 'Roteiros e títulos', icone: Youtube, ativo: true },
    { id: 'posts', nome: 'Posts Redes Sociais', descricao: 'Legendas e conteúdo', icone: Instagram, ativo: true },
    { id: 'tendencias', nome: 'Tendências Virais', descricao: 'O que está bombando', icone: TrendingUp, ativo: true },
    { id: 'hashtags', nome: 'Gerador Hashtags', descricao: 'Hashtags otimizadas', icone: Hash, ativo: true },
    { id: 'email', nome: 'Email Marketing', descricao: 'Campanhas de email', icone: Mail, ativo: false },
    { id: 'podcast', nome: 'Roteiros Podcast', descricao: 'Temas para episódios', icone: Mic, ativo: false },
    { id: 'financeiro', nome: 'Análise Financeira', descricao: 'Projeções e alertas', icone: DollarSign, ativo: true },
    { id: 'parcerias', nome: 'Oportunidades', descricao: 'Sugestões de parcerias', icone: Building, ativo: true },
    { id: 'midia', nome: 'Assessoria Imprensa', descricao: 'Press releases', icone: Newspaper, ativo: false },
  ])
  
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [gerando, setGerando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

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

  const gerarSugestoes = async (tipo: string) => {
    setGerando(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const novas: Sugestao[] = [
      {
        id: `reel-${Date.now()}`,
        tipo: 'reel',
        titulo: '🔥 Reel Viral: 5 Frases de Narcisistas',
        conteudo: `GANCHO: "Se você ouve ISSO, corra..."
        
1. "Você está exagerando"
2. "Isso nunca aconteceu"  
3. "Você é muito sensível"
4. "Ninguém vai acreditar em você"
5. "Sem mim você não é nada"

CTA: "Salva e manda pra quem precisa"
ÁUDIO: Som dramático trending`,
        hashtags: ['narcisismo', 'gaslighting', 'saudemental'],
        usado: false
      },
      {
        id: `trend-${Date.now()}`,
        tipo: 'tendencia',
        titulo: '📈 Trend: "Delulu is the Solulu"',
        conteudo: `COMO ADAPTAR:
"Delulu is NOT the solulu em relacionamento tóxico"

IDEIA: Mostrar diferença entre
- Delulu saudável: "Vou conseguir o emprego"
- Delulu perigoso: "Ele vai mudar"

URGÊNCIA: Usar em 3-5 dias`,
        usado: false
      },
      {
        id: `fin-${Date.now()}`,
        tipo: 'financeiro',
        titulo: '💰 Alerta: Projeção de Custos',
        conteudo: `CUSTOS ATUAIS:
- Supabase: R$ 125/mês
- Vercel: R$ 100/mês
- OpenAI: R$ 500/mês
- Total: R$ 725/mês

BREAK-EVEN: 15 assinantes Premium`,
        usado: false
      },
      {
        id: `parc-${Date.now()}`,
        tipo: 'parceria',
        titulo: '🤝 Parceria com Clínicas',
        conteudo: `PROPOSTA:
- Plano corporativo 30% desconto
- Comissão 20% por indicação
- White-label para grandes

POTENCIAL: R$ 2.000-5.000/mês por clínica`,
        usado: false
      }
    ]
    
    setSugestoes(prev => [...novas, ...prev])
    setGerando(false)
  }

  const toggleModulo = (id: string) => {
    setModulos(prev => prev.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m))
  }

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52">
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">IA Assistente</h1>
                    <p className="text-sm text-gray-500">Marketing e Estratégia</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Créditos: <strong className="text-purple-600">847</strong></span>
                <button
                  onClick={() => gerarSugestoes('todos')}
                  disabled={gerando}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg disabled:opacity-50"
                >
                  {gerando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {gerando ? 'Gerando...' : 'Gerar Ideias'}
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
          </header>

          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex gap-2 mb-6">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-purple-100 text-purple-700' : 'bg-white'}`}>
                <BarChart3 className="w-4 h-4 inline mr-2" />Dashboard
              </button>
              <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg ${activeTab === 'config' ? 'bg-purple-100 text-purple-700' : 'bg-white'}`}>
                <Settings className="w-4 h-4 inline mr-2" />Configurar
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Reels', icon: Video, cor: 'from-pink-500 to-orange-500', tipo: 'reels' },
                    { label: 'Tendências', icon: TrendingUp, cor: 'from-purple-500 to-blue-500', tipo: 'tendencias' },
                    { label: 'YouTube', icon: Youtube, cor: 'from-red-500 to-pink-500', tipo: 'youtube' },
                    { label: 'Financeiro', icon: DollarSign, cor: 'from-green-500 to-teal-500', tipo: 'financeiro' },
                  ].map(item => (
                    <button key={item.tipo} onClick={() => gerarSugestoes(item.tipo)} className={`bg-gradient-to-br ${item.cor} text-white rounded-2xl p-6 text-left hover:opacity-90`}>
                      <item.icon className="w-8 h-8 mb-3" />
                      <h3 className="font-bold">{item.label}</h3>
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Sugestões ({sugestoes.length})</h2>
                  {sugestoes.length === 0 ? (
                    <div className="text-center py-12">
                      <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Clique em "Gerar Ideias"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sugestoes.map(s => (
                        <div key={s.id} className="border rounded-xl p-4">
                          <div className="flex justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              s.tipo === 'reel' ? 'bg-pink-100 text-pink-700' :
                              s.tipo === 'tendencia' ? 'bg-purple-100 text-purple-700' :
                              s.tipo === 'financeiro' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{s.tipo.toUpperCase()}</span>
                          </div>
                          <h3 className="font-semibold mb-2">{s.titulo}</h3>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mb-3">{s.conteudo}</pre>
                          {s.hashtags && <div className="flex gap-1 mb-3">{s.hashtags.map(t => <span key={t} className="text-xs text-purple-600">#{t}</span>)}</div>}
                          <button onClick={() => copiar(s.id, s.conteudo)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                            {copiado === s.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiado === s.id ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-2">Configurar Módulos</h2>
                <p className="text-gray-500 mb-6">Ative/desative para economizar créditos</p>
                
                <div className="space-y-3">
                  {modulos.map(m => (
                    <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border ${m.ativo ? 'bg-purple-50 border-purple-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.ativo ? 'bg-purple-100' : 'bg-gray-200'}`}>
                          <m.icone className={`w-5 h-5 ${m.ativo ? 'text-purple-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{m.nome}</h3>
                          <p className="text-sm text-gray-500">{m.descricao}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleModulo(m.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${m.ativo ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {m.ativo ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        {m.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  ))}
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
