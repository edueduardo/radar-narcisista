'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { Heart, Users, MessageSquare, Flag, Check, X, Search, AlertTriangle, Shield, Ban } from 'lucide-react'

interface CommunityPost {
  id: string
  author: string
  content: string
  type: 'post' | 'comment' | 'reply'
  status: 'ativo' | 'reportado' | 'removido'
  reports: number
  likes: number
  createdAt: string
}

const MOCK_POSTS: CommunityPost[] = [
  { id: '1', author: 'Maria S.', content: 'Hoje faz 1 ano que saí do relacionamento abusivo. Obrigada a todos pelo apoio!', type: 'post', status: 'ativo', reports: 0, likes: 23, createdAt: '2025-11-22' },
  { id: '2', author: 'Anônimo', content: 'Alguém mais sente que está perdendo a sanidade?', type: 'post', status: 'ativo', reports: 0, likes: 15, createdAt: '2025-11-21' },
  { id: '3', author: 'João P.', content: 'Conteúdo reportado por linguagem inadequada...', type: 'comment', status: 'reportado', reports: 3, likes: 0, createdAt: '2025-11-20' },
  { id: '4', author: 'Ana L.', content: 'Força! Você não está sozinha. Estamos aqui por você.', type: 'reply', status: 'ativo', reports: 0, likes: 8, createdAt: '2025-11-22' },
  { id: '5', author: 'Spam User', content: 'Conteúdo removido por violação das regras...', type: 'post', status: 'removido', reports: 5, likes: 0, createdAt: '2025-11-19' },
]

export default function ComunidadePage() {
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredPosts = posts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleApprove = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'ativo' as const, reports: 0 } : p))
  }

  const handleRemove = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'removido' as const } : p))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500/20 text-green-400'
      case 'reportado': return 'bg-yellow-500/20 text-yellow-400'
      case 'removido': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const reportedCount = posts.filter(p => p.status === 'reportado').length

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-52">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                Moderação da Comunidade
              </h1>
              <p className="text-gray-400 mt-1">
                Gerencie posts, comentários e denúncias da comunidade
              </p>
            </div>
            
            {reportedCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                <Flag className="w-4 h-4" />
                {reportedCount} denúncia{reportedCount > 1 ? 's' : ''} para revisar
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
                  placeholder="Buscar posts..."
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
              <option value="ativo">Ativos</option>
              <option value="reportado">Reportados</option>
              <option value="removido">Removidos</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{posts.length}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-400">{posts.filter(p => p.status === 'ativo').length}</p>
              <p className="text-sm text-gray-400">Ativos</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-400">{posts.filter(p => p.status === 'reportado').length}</p>
              <p className="text-sm text-gray-400">Reportados</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-400">{posts.filter(p => p.status === 'removido').length}</p>
              <p className="text-sm text-gray-400">Removidos</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-pink-400">{posts.reduce((acc, p) => acc + p.likes, 0)}</p>
              <p className="text-sm text-gray-400">Curtidas</p>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className={`bg-gray-800 rounded-xl p-6 ${post.status === 'reportado' ? 'border-l-4 border-yellow-500' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-white">{post.author}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-700 rounded">
                        {post.type}
                      </span>
                      {post.reports > 0 && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <Flag className="w-3 h-3" />
                          {post.reports} denúncia{post.reports > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.createdAt}</span>
                      {post.likes > 0 && (
                        <>
                          <span>•</span>
                          <span>❤️ {post.likes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.status === 'reportado' && (
                      <>
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400"
                          title="Aprovar (manter)"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRemove(post.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400"
                          title="Remover"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {post.status === 'ativo' && (
                      <button
                        onClick={() => handleRemove(post.id)}
                        className="p-2 hover:bg-red-600/20 rounded-lg text-gray-400 hover:text-red-400"
                        title="Remover"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
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
