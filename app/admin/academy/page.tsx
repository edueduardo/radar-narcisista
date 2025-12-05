'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Clock,
  Users,
  Star,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Play,
  CheckCircle,
  Lock
} from 'lucide-react'

// ============================================================================
// ADMIN: RADAR ACADEMY
// Gerencia trilhas de aprendizado e conteúdo educativo
// ============================================================================

interface Lesson {
  id: string
  title: string
  type: 'video' | 'article' | 'quiz' | 'exercise'
  duration: number // em minutos
  content: string
  order: number
  isFree: boolean
}

interface Track {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  color: string
  level: 'iniciante' | 'intermediario' | 'avancado'
  lessons: Lesson[]
  isPublished: boolean
  isPremium: boolean
  estimatedHours: number
  enrolledCount: number
  completionRate: number
  createdAt: string
  updatedAt: string
}

const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Entendendo o Narcisismo',
    slug: 'entendendo-narcisismo',
    description: 'Aprenda os fundamentos do transtorno narcisista e como identificar padrões de comportamento.',
    icon: '🎯',
    color: 'purple',
    level: 'iniciante',
    lessons: [
      { id: '1-1', title: 'O que é narcisismo?', type: 'video', duration: 15, content: '', order: 1, isFree: true },
      { id: '1-2', title: 'Tipos de narcisistas', type: 'article', duration: 10, content: '', order: 2, isFree: true },
      { id: '1-3', title: 'Sinais de alerta', type: 'video', duration: 20, content: '', order: 3, isFree: false },
      { id: '1-4', title: 'Quiz: Identificando padrões', type: 'quiz', duration: 10, content: '', order: 4, isFree: false },
    ],
    isPublished: true,
    isPremium: false,
    estimatedHours: 1,
    enrolledCount: 234,
    completionRate: 67,
    createdAt: '2024-01-15',
    updatedAt: '2024-11-20'
  },
  {
    id: '2',
    title: 'Recuperando sua Autoestima',
    slug: 'recuperando-autoestima',
    description: 'Exercícios práticos para reconstruir sua autoestima após um relacionamento abusivo.',
    icon: '💪',
    color: 'green',
    level: 'intermediario',
    lessons: [
      { id: '2-1', title: 'O impacto na autoestima', type: 'video', duration: 12, content: '', order: 1, isFree: true },
      { id: '2-2', title: 'Exercício: Diário de conquistas', type: 'exercise', duration: 15, content: '', order: 2, isFree: false },
      { id: '2-3', title: 'Afirmações positivas', type: 'article', duration: 8, content: '', order: 3, isFree: false },
    ],
    isPublished: true,
    isPremium: true,
    estimatedHours: 0.5,
    enrolledCount: 156,
    completionRate: 45,
    createdAt: '2024-02-10',
    updatedAt: '2024-11-18'
  },
  {
    id: '3',
    title: 'Estabelecendo Limites Saudáveis',
    slug: 'limites-saudaveis',
    description: 'Aprenda a definir e manter limites em relacionamentos.',
    icon: '🛡️',
    color: 'blue',
    level: 'avancado',
    lessons: [
      { id: '3-1', title: 'Por que limites são importantes', type: 'video', duration: 18, content: '', order: 1, isFree: true },
      { id: '3-2', title: 'Como comunicar limites', type: 'article', duration: 12, content: '', order: 2, isFree: false },
      { id: '3-3', title: 'Lidando com resistência', type: 'video', duration: 20, content: '', order: 3, isFree: false },
      { id: '3-4', title: 'Exercício prático', type: 'exercise', duration: 25, content: '', order: 4, isFree: false },
      { id: '3-5', title: 'Quiz final', type: 'quiz', duration: 15, content: '', order: 5, isFree: false },
    ],
    isPublished: false,
    isPremium: true,
    estimatedHours: 1.5,
    enrolledCount: 0,
    completionRate: 0,
    createdAt: '2024-11-01',
    updatedAt: '2024-11-25'
  }
]

const LEVEL_COLORS = {
  iniciante: 'bg-green-500/20 text-green-400',
  intermediario: 'bg-yellow-500/20 text-yellow-400',
  avancado: 'bg-red-500/20 text-red-400'
}

const LEVEL_LABELS = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado'
}

const TYPE_ICONS = {
  video: Video,
  article: FileText,
  quiz: CheckCircle,
  exercise: Play
}

export default function AcademyPage() {
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'premium'>('all')
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // Filtrar trilhas
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(search.toLowerCase()) ||
                         track.description.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'published') return matchesSearch && track.isPublished
    if (filter === 'draft') return matchesSearch && !track.isPublished
    if (filter === 'premium') return matchesSearch && track.isPremium
    return matchesSearch
  })

  // Estatísticas
  const totalTracks = tracks.length
  const publishedTracks = tracks.filter(t => t.isPublished).length
  const totalLessons = tracks.reduce((acc, t) => acc + t.lessons.length, 0)
  const totalEnrolled = tracks.reduce((acc, t) => acc + t.enrolledCount, 0)

  const togglePublish = (id: string) => {
    setTracks(prev => prev.map(t => 
      t.id === id ? { ...t, isPublished: !t.isPublished } : t
    ))
    setMessage('✅ Status atualizado!')
    setTimeout(() => setMessage(''), 2000)
  }

  const deleteTrack = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta trilha?')) return
    setTracks(prev => prev.filter(t => t.id !== id))
    setMessage('🗑️ Trilha excluída')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-400" />
                  Radar Academy
                </h1>
                <p className="text-sm text-slate-400">
                  Gerencie trilhas de aprendizado
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditingTrack({
                id: Date.now().toString(),
                title: '',
                slug: '',
                description: '',
                icon: '📚',
                color: 'purple',
                level: 'iniciante',
                lessons: [],
                isPublished: false,
                isPremium: false,
                estimatedHours: 0,
                enrolledCount: 0,
                completionRate: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Trilha
            </button>
          </div>
        </div>
      </header>

      {/* Mensagem */}
      {message && (
        <div className="mx-6 mt-4 p-4 rounded-lg bg-slate-800 border border-slate-700 text-center">
          {message}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTracks}</p>
                <p className="text-sm text-slate-400">Trilhas</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Eye className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedTracks}</p>
                <p className="text-sm text-slate-400">Publicadas</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Video className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-sm text-slate-400">Aulas</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Users className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEnrolled}</p>
                <p className="text-sm text-slate-400">Inscritos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar trilhas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'premium'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'published' ? 'Publicadas' : f === 'draft' ? 'Rascunhos' : 'Premium'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Trilhas */}
        <div className="grid gap-4">
          {filteredTracks.map(track => (
            <div
              key={track.id}
              className={`bg-slate-900 border rounded-xl p-6 transition-all ${
                track.isPublished ? 'border-slate-800' : 'border-yellow-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-4xl">{track.icon}</div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{track.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[track.level]}`}>
                      {LEVEL_LABELS[track.level]}
                    </span>
                    {track.isPremium && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Premium
                      </span>
                    )}
                    {!track.isPublished && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                        Rascunho
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{track.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {track.lessons.length} aulas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {track.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {track.enrolledCount} inscritos
                    </span>
                    {track.completionRate > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {track.completionRate}% conclusão
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTrack(track)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    title="Ver aulas"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingTrack(track)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    title="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => togglePublish(track.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      track.isPublished
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                    title={track.isPublished ? 'Despublicar' : 'Publicar'}
                  >
                    {track.isPublished ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => deleteTrack(track.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lessons Preview */}
              {track.lessons.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    {track.lessons.slice(0, 5).map(lesson => {
                      const Icon = TYPE_ICONS[lesson.type]
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400"
                        >
                          <Icon className="h-3 w-3" />
                          {lesson.title}
                          {!lesson.isFree && <Lock className="h-3 w-3 text-yellow-500" />}
                        </div>
                      )
                    })}
                    {track.lessons.length > 5 && (
                      <span className="text-xs text-slate-500">
                        +{track.lessons.length - 5} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredTracks.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma trilha encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes da Trilha */}
      {selectedTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>{selectedTrack.icon}</span>
                {selectedTrack.title}
              </h3>
              <button
                onClick={() => setSelectedTrack(null)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {selectedTrack.lessons.map((lesson, index) => {
                  const Icon = TYPE_ICONS[lesson.type]
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg"
                    >
                      <span className="text-slate-500 w-6">{index + 1}</span>
                      <Icon className="h-5 w-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-slate-400">{lesson.duration} min</p>
                      </div>
                      {lesson.isFree ? (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                          Grátis
                        </span>
                      ) : (
                        <Lock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingTrack(selectedTrack)
                  setSelectedTrack(null)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
              >
                Editar Trilha
              </button>
              <button
                onClick={() => setSelectedTrack(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingTrack.title ? 'Editar Trilha' : 'Nova Trilha'}
              </h3>
              <button
                onClick={() => setEditingTrack(null)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={editingTrack.title}
                  onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  placeholder="Ex: Entendendo o Narcisismo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={editingTrack.description}
                  onChange={(e) => setEditingTrack({ ...editingTrack, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  placeholder="Descreva a trilha..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ícone</label>
                  <input
                    type="text"
                    value={editingTrack.icon}
                    onChange={(e) => setEditingTrack({ ...editingTrack, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nível</label>
                  <select
                    value={editingTrack.level}
                    onChange={(e) => setEditingTrack({ ...editingTrack, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTrack.isPremium}
                    onChange={(e) => setEditingTrack({ ...editingTrack, isPremium: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Premium</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTrack.isPublished}
                    onChange={(e) => setEditingTrack({ ...editingTrack, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Publicar</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingTrack(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (tracks.find(t => t.id === editingTrack.id)) {
                    setTracks(prev => prev.map(t => t.id === editingTrack.id ? editingTrack : t))
                  } else {
                    setTracks(prev => [...prev, editingTrack])
                  }
                  setEditingTrack(null)
                  setMessage('✅ Trilha salva!')
                  setTimeout(() => setMessage(''), 2000)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
