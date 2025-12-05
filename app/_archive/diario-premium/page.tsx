'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  BookOpen, 
  Plus,
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarTag,
  RadarAlertBanner,
  RadarInput,
  RadarTextarea,
  RadarSlider,
  RadarEmotionChips,
} from '@/components/ui/design-system'

// ============================================================================
// DIÁRIO PREMIUM - RADAR NARCISISTA BR
// Layout: 2 colunas (desktop) / Stack (mobile)
// ============================================================================

interface DiaryEntry {
  id: string
  title: string
  content: string
  intensity: number
  emotions: string[]
  is_recurring: boolean | null
  created_at: string
  updated_at: string
}

export default function DiarioPremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIntensity, setFilterIntensity] = useState<'all' | 'leve' | 'moderado' | 'grave'>('all')
  
  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formIntensity, setFormIntensity] = useState(5)
  const [formEmotions, setFormEmotions] = useState<string[]>([])
  const [formRecurring, setFormRecurring] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadEntries(user.id)
      setLoading(false)
    }
    init()
  }, [router, supabase])

  const loadEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setEntries(data)
    }
  }

  const handleSave = async () => {
    if (!user || !formContent.trim()) return
    
    setSaving(true)
    try {
      const entryData = {
        user_id: user.id,
        title: formTitle || 'Sem título',
        content: formContent,
        intensity: formIntensity,
        emotions: formEmotions,
        is_recurring: formRecurring,
      }

      if (selectedEntry) {
        // Update
        await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', selectedEntry.id)
      } else {
        // Insert
        await supabase
          .from('diary_entries')
          .insert(entryData)
      }

      await loadEntries(user.id)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return
    
    await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id)
    
    await loadEntries(user.id)
    if (selectedEntry?.id === id) {
      resetForm()
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormContent('')
    setFormIntensity(5)
    setFormEmotions([])
    setFormRecurring(null)
    setSelectedEntry(null)
    setIsCreating(false)
  }

  const selectEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry)
    setFormTitle(entry.title)
    setFormContent(entry.content)
    setFormIntensity(entry.intensity || 5)
    setFormEmotions(entry.emotions || [])
    setFormRecurring(entry.is_recurring)
    setIsCreating(false)
  }

  const startNewEntry = () => {
    resetForm()
    setIsCreating(true)
  }

  const getIntensityTone = (intensity: number): 'leve' | 'moderado' | 'grave' => {
    if (intensity <= 3) return 'leve'
    if (intensity <= 6) return 'moderado'
    return 'grave'
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterIntensity === 'all') return matchesSearch
    
    const tone = getIntensityTone(entry.intensity || 5)
    return matchesSearch && tone === filterIntensity
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando diário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard-premium">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Meu Diário</h1>
                  <p className="text-xs text-gray-500">{entries.length} registros</p>
                </div>
              </div>
            </div>
            
            <RadarButton onClick={startNewEntry} size="sm">
              <Plus className="w-4 h-4" />
              Novo Registro
            </RadarButton>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <RadarAlertBanner type="info">
          Aqui você registra a <strong>SUA perspectiva</strong>. O Radar não sabe toda a história. 
          Seja honesto(a) para obter clareza real.
        </RadarAlertBanner>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ============================================================ */}
          {/* COLUNA ESQUERDA: Lista de Registros */}
          {/* ============================================================ */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search & Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar registros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                {(['all', 'leve', 'moderado', 'grave'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterIntensity(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterIntensity === filter
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    }`}
                  >
                    {filter === 'all' ? 'Todos' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {filteredEntries.length === 0 ? (
                <RadarCard variant="soft" padding="md">
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Nenhum registro encontrado</p>
                    <RadarButton onClick={startNewEntry} variant="ghost" size="sm" className="mt-4">
                      Criar primeiro registro
                    </RadarButton>
                  </div>
                </RadarCard>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => selectEntry(entry)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedEntry?.id === entry.id
                        ? 'bg-violet-600/20 border-violet-500/50'
                        : 'bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <RadarTag tone={getIntensityTone(entry.intensity || 5)} size="sm" dot>
                            {entry.intensity || 5}/10
                          </RadarTag>
                        </div>
                        <h3 className="font-medium text-white truncate text-sm">
                          {entry.title || 'Sem título'}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {entry.content}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                        <p className="text-xs text-gray-600">{formatTime(entry.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUNA DIREITA: Formulário / Detalhes */}
          {/* ============================================================ */}
          <div className="lg:col-span-2">
            <RadarCard variant="default" padding="lg">
              {!isCreating && !selectedEntry ? (
                // Estado vazio
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Selecione ou crie um registro
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                    Clique em um registro à esquerda para ver os detalhes, ou crie um novo para registrar o que aconteceu.
                  </p>
                  <RadarButton onClick={startNewEntry}>
                    <Plus className="w-4 h-4" />
                    Novo Registro
                  </RadarButton>
                </div>
              ) : (
                // Formulário
                <div className="space-y-6">
                  {/* Header do formulário */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      {selectedEntry ? 'Editar Registro' : 'Novo Registro'}
                    </h2>
                    <div className="flex items-center gap-2">
                      {selectedEntry && (
                        <button
                          onClick={() => handleDelete(selectedEntry.id)}
                          className="p-2 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={resetForm}
                        className="p-2 text-gray-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Título */}
                  <RadarInput
                    label="Título (opcional)"
                    placeholder="Ex: Discussão sobre dinheiro"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />

                  {/* Conteúdo */}
                  <RadarTextarea
                    label="O que aconteceu?"
                    placeholder="Descreva o que aconteceu, como você se sentiu, o que foi dito..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={8}
                  />

                  {/* Intensidade */}
                  <RadarSlider
                    label="Intensidade do episódio"
                    value={formIntensity}
                    onChange={setFormIntensity}
                    min={0}
                    max={10}
                    showValue
                  />

                  {/* Emoções */}
                  <RadarEmotionChips
                    label="Como você se sentiu?"
                    selected={formEmotions}
                    onChange={setFormEmotions}
                  />

                  {/* Recorrência */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Isso já aconteceu outras vezes?
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: true, label: 'Sim' },
                        { value: false, label: 'Não' },
                        { value: null, label: 'Não sei' },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type="button"
                          onClick={() => setFormRecurring(option.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formRecurring === option.value
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <RadarButton
                      onClick={handleSave}
                      isLoading={saving}
                      disabled={!formContent.trim()}
                      className="flex-1"
                    >
                      {selectedEntry ? 'Salvar alterações' : 'Salvar registro'}
                    </RadarButton>
                    <Link href="/diario/timeline">
                      <RadarButton variant="secondary">
                        Ver Timeline
                        <ChevronRight className="w-4 h-4" />
                      </RadarButton>
                    </Link>
                  </div>
                </div>
              )}
            </RadarCard>
          </div>
        </div>
      </main>
    </div>
  )
}
