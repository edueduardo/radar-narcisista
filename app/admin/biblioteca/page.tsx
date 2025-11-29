'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { Library, Plus, Search, Edit, Trash2, Eye, BookOpen, FileText, Video, Headphones } from 'lucide-react'

interface BibliotecaItem {
  id: string
  title: string
  type: 'artigo' | 'video' | 'audio' | 'pdf'
  category: string
  status: 'publicado' | 'rascunho' | 'revisao'
  views: number
  createdAt: string
}

const MOCK_ITEMS: BibliotecaItem[] = [
  { id: '1', title: 'O que é Gaslighting?', type: 'artigo', category: 'Educação', status: 'publicado', views: 1234, createdAt: '2025-11-20' },
  { id: '2', title: 'Sinais de Love Bombing', type: 'artigo', category: 'Educação', status: 'publicado', views: 987, createdAt: '2025-11-18' },
  { id: '3', title: 'Como sair de um relacionamento abusivo', type: 'video', category: 'Guias', status: 'rascunho', views: 0, createdAt: '2025-11-22' },
  { id: '4', title: 'Meditação para ansiedade', type: 'audio', category: 'Bem-estar', status: 'publicado', views: 456, createdAt: '2025-11-15' },
  { id: '5', title: 'Guia de Segurança Digital', type: 'pdf', category: 'Segurança', status: 'revisao', views: 234, createdAt: '2025-11-21' },
]

export default function BibliotecaPage() {
  const [items, setItems] = useState<BibliotecaItem[]>(MOCK_ITEMS)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredItems = items.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || item.type === filterType
    return matchSearch && matchType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'artigo': return <FileText className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Headphones className="w-4 h-4" />
      case 'pdf': return <BookOpen className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado': return 'bg-green-500/20 text-green-400'
      case 'rascunho': return 'bg-yellow-500/20 text-yellow-400'
      case 'revisao': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-52">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Library className="w-8 h-8 text-purple-500" />
                Biblioteca de Conteúdo
              </h1>
              <p className="text-gray-400 mt-1">
                Gerencie artigos, vídeos, áudios e PDFs educativos
              </p>
            </div>
            
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
              <Plus className="w-4 h-4" />
              Novo Conteúdo
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="artigo">Artigos</option>
              <option value="video">Vídeos</option>
              <option value="audio">Áudios</option>
              <option value="pdf">PDFs</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{items.length}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-400">{items.filter(i => i.status === 'publicado').length}</p>
              <p className="text-sm text-gray-400">Publicados</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-400">{items.filter(i => i.status === 'rascunho').length}</p>
              <p className="text-sm text-gray-400">Rascunhos</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-400">{items.reduce((acc, i) => acc + i.views, 0)}</p>
              <p className="text-sm text-gray-400">Visualizações</p>
            </div>
          </div>

          {/* Lista */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Título</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Views</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-white">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-gray-300">
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{item.views}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-600/20 rounded-lg text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
