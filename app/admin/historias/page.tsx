'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { BookHeart, Plus, Search, Edit, Trash2, Eye, Check, X, Clock, AlertTriangle } from 'lucide-react'

interface Historia {
  id: string
  title: string
  excerpt: string
  author: string
  status: 'pendente' | 'aprovada' | 'rejeitada'
  isAnonymous: boolean
  createdAt: string
  likes: number
}

const MOCK_HISTORIAS: Historia[] = [
  { id: '1', title: 'Minha jornada de libertação', excerpt: 'Depois de 5 anos em um relacionamento abusivo...', author: 'Maria S.', status: 'aprovada', isAnonymous: false, createdAt: '2025-11-20', likes: 45 },
  { id: '2', title: 'O dia que percebi a verdade', excerpt: 'Foi quando minha terapeuta me perguntou...', author: 'Anônimo', status: 'pendente', isAnonymous: true, createdAt: '2025-11-22', likes: 0 },
  { id: '3', title: 'Reconstruindo minha identidade', excerpt: 'Perdi quem eu era durante o relacionamento...', author: 'João P.', status: 'aprovada', isAnonymous: false, createdAt: '2025-11-18', likes: 32 },
  { id: '4', title: 'Para quem ainda está lá', excerpt: 'Se você está lendo isso e ainda está preso...', author: 'Anônimo', status: 'pendente', isAnonymous: true, createdAt: '2025-11-23', likes: 0 },
]

export default function HistoriasPage() {
  const [historias, setHistorias] = useState<Historia[]>(MOCK_HISTORIAS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredHistorias = historias.filter(h => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) || h.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || h.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleApprove = (id: string) => {
    setHistorias(prev => prev.map(h => h.id === id ? { ...h, status: 'aprovada' as const } : h))
  }

  const handleReject = (id: string) => {
    setHistorias(prev => prev.map(h => h.id === id ? { ...h, status: 'rejeitada' as const } : h))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada': return <Check className="w-4 h-4 text-green-400" />
      case 'rejeitada': return <X className="w-4 h-4 text-red-400" />
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-400" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'bg-green-500/20 text-green-400'
      case 'rejeitada': return 'bg-red-500/20 text-red-400'
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const pendingCount = historias.filter(h => h.status === 'pendente').length

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-52">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BookHeart className="w-8 h-8 text-pink-500" />
                Histórias de Superação
              </h1>
              <p className="text-gray-400 mt-1">
                Gerencie e aprove histórias compartilhadas pela comunidade
              </p>
            </div>
            
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''} para revisão
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar histórias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovada">Aprovadas</option>
              <option value="rejeitada">Rejeitadas</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{historias.length}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-400">{historias.filter(h => h.status === 'pendente').length}</p>
              <p className="text-sm text-gray-400">Pendentes</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-400">{historias.filter(h => h.status === 'aprovada').length}</p>
              <p className="text-sm text-gray-400">Aprovadas</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-pink-400">{historias.reduce((acc, h) => acc + h.likes, 0)}</p>
              <p className="text-sm text-gray-400">Curtidas</p>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {filteredHistorias.map((historia) => (
              <div key={historia.id} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{historia.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(historia.status)}`}>
                        {getStatusIcon(historia.status)}
                        {historia.status}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{historia.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Por: {historia.author}</span>
                      <span>•</span>
                      <span>{historia.createdAt}</span>
                      {historia.likes > 0 && (
                        <>
                          <span>•</span>
                          <span>❤️ {historia.likes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {historia.status === 'pendente' && (
                      <>
                        <button
                          onClick={() => handleApprove(historia.id)}
                          className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400"
                          title="Aprovar"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(historia.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400"
                          title="Rejeitar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-red-600/20 rounded-lg text-gray-400 hover:text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
