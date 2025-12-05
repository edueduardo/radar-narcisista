'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  ArrowLeft, Users, Search, Filter, MoreVertical,
  Crown, Ban, Mail, Calendar, Activity, ChevronLeft,
  ChevronRight, Download, RefreshCw, Check, X
} from 'lucide-react'

interface Usuario {
  id: string
  email: string
  name: string
  created_at: string
  last_sign_in: string
  is_premium: boolean
  is_banned: boolean
  testes: number
  entradas: number
  mensagens: number
}

export default function GerenciadorUsuariosPage() {
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filtro, setFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'premium' | 'gratuito' | 'banidos'>('todos')
  const [pagina, setPagina] = useState(1)
  const [menuAberto, setMenuAberto] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()
  const porPagina = 10

  useEffect(() => {
    loadUsuarios()
  }, [tipoFiltro, pagina])

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

  const loadUsuarios = async () => {
    setLoading(true)
    try {
      // Buscar usuários do Supabase
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Mapear para o formato esperado (com dados mockados para demo)
      const usuariosMapeados: Usuario[] = (profiles || []).map((p, i) => ({
        id: p.user_id,
        email: `usuario${i + 1}@email.com`,
        name: p.name || `Usuário ${i + 1}`,
        created_at: p.created_at,
        last_sign_in: new Date().toISOString(),
        is_premium: Math.random() > 0.8,
        is_banned: false,
        testes: Math.floor(Math.random() * 10),
        entradas: Math.floor(Math.random() * 20),
        mensagens: Math.floor(Math.random() * 50)
      }))

      // Se não houver dados, usar mock
      if (usuariosMapeados.length === 0) {
        const mockUsuarios: Usuario[] = Array.from({ length: 25 }, (_, i) => ({
          id: `user-${i + 1}`,
          email: `usuario${i + 1}@email.com`,
          name: `Usuário ${i + 1}`,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_sign_in: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_premium: i < 5,
          is_banned: i === 20,
          testes: Math.floor(Math.random() * 10),
          entradas: Math.floor(Math.random() * 20),
          mensagens: Math.floor(Math.random() * 50)
        }))
        setUsuarios(mockUsuarios)
      } else {
        setUsuarios(usuariosMapeados)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarUsuarios = () => {
    let resultado = usuarios

    // Filtro por tipo
    if (tipoFiltro === 'premium') resultado = resultado.filter(u => u.is_premium)
    if (tipoFiltro === 'gratuito') resultado = resultado.filter(u => !u.is_premium && !u.is_banned)
    if (tipoFiltro === 'banidos') resultado = resultado.filter(u => u.is_banned)

    // Filtro por busca
    if (filtro) {
      resultado = resultado.filter(u => 
        u.name.toLowerCase().includes(filtro.toLowerCase()) ||
        u.email.toLowerCase().includes(filtro.toLowerCase())
      )
    }

    return resultado
  }

  const usuariosFiltrados = filtrarUsuarios()
  const totalPaginas = Math.ceil(usuariosFiltrados.length / porPagina)
  const usuariosPagina = usuariosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina)

  const togglePremium = (userId: string) => {
    setUsuarios(prev => prev.map(u => 
      u.id === userId ? { ...u, is_premium: !u.is_premium } : u
    ))
    setMenuAberto(null)
  }

  const toggleBan = (userId: string) => {
    setUsuarios(prev => prev.map(u => 
      u.id === userId ? { ...u, is_banned: !u.is_banned } : u
    ))
    setMenuAberto(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-52 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Gerenciador de Usuários
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{usuarios.length} usuários cadastrados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadUsuarios}
              className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              <Download className="h-4 w-4" />
              Exportar
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

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              {(['todos', 'premium', 'gratuito', 'banidos'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => { setTipoFiltro(tipo); setPagina(1) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tipoFiltro === tipo
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cadastro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Atividade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {usuariosPagina.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {usuario.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{usuario.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {usuario.is_banned ? (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                            <Ban className="h-3 w-3" /> Banido
                          </span>
                        ) : usuario.is_premium ? (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs rounded-full flex items-center gap-1">
                            <Crown className="h-3 w-3" /> Premium
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            Gratuito
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Último acesso: {new Date(usuario.last_sign_in).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span title="Testes">{usuario.testes} 🎯</span>
                        <span title="Entradas">{usuario.entradas} 📝</span>
                        <span title="Mensagens">{usuario.mensagens} 💬</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setMenuAberto(menuAberto === usuario.id ? null : usuario.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                        
                        {menuAberto === usuario.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-50 overflow-hidden">
                              <button
                                onClick={() => togglePremium(usuario.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2"
                              >
                                <Crown className="h-4 w-4 text-yellow-500" />
                                {usuario.is_premium ? 'Remover Premium' : 'Dar Premium'}
                              </button>
                              <button
                                onClick={() => toggleBan(usuario.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2 text-red-500"
                              >
                                <Ban className="h-4 w-4" />
                                {usuario.is_banned ? 'Desbanir' : 'Banir Usuário'}
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-500" />
                                Enviar Email
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {(pagina - 1) * porPagina + 1} a {Math.min(pagina * porPagina, usuariosFiltrados.length)} de {usuariosFiltrados.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {pagina} / {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
