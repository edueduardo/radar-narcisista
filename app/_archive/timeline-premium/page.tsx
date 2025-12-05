'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Clock, 
  ArrowLeft,
  Calendar,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarTag,
  RadarAlertBanner,
  RadarSlider,
} from '@/components/ui/design-system'

// ============================================================================
// TIMELINE PREMIUM - RADAR NARCISISTA BR
// Visualização cronológica dos eventos
// ============================================================================

interface TimelineEntry {
  id: string
  title: string
  content: string
  intensity: number
  emotions: string[]
  is_recurring: boolean | null
  created_at: string
}

type FilterPeriod = '7d' | '30d' | '90d' | '1y' | 'all'

export default function TimelinePremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('30d')
  const [filterIntensityMin, setFilterIntensityMin] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

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
      .limit(200)

    if (!error && data) {
      setEntries(data)
    }
  }

  const getFilteredEntries = () => {
    let filtered = [...entries]

    // Filtro por período
    const now = new Date()
    let startDate: Date | null = null

    switch (filterPeriod) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    if (startDate) {
      filtered = filtered.filter(e => new Date(e.created_at) >= startDate!)
    }

    // Filtro por intensidade mínima
    if (filterIntensityMin > 0) {
      filtered = filtered.filter(e => (e.intensity || 0) >= filterIntensityMin)
    }

    return filtered
  }

  const getIntensityTone = (intensity: number): 'leve' | 'moderado' | 'grave' => {
    if (intensity <= 3) return 'leve'
    if (intensity <= 6) return 'moderado'
    return 'grave'
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-500'
    if (intensity <= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long',
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

  // Agrupar por data
  const groupedEntries = getFilteredEntries().reduce((groups, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString('pt-BR')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, TimelineEntry[]>)

  const filteredEntries = getFilteredEntries()

  // Estatísticas
  const stats = {
    total: filteredEntries.length,
    avgIntensity: filteredEntries.length > 0 
      ? (filteredEntries.reduce((sum, e) => sum + (e.intensity || 0), 0) / filteredEntries.length).toFixed(1)
      : '0',
    highIntensity: filteredEntries.filter(e => (e.intensity || 0) >= 7).length,
    recurring: filteredEntries.filter(e => e.is_recurring === true).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando linha do tempo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard-premium">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Linha do Tempo</h1>
                  <p className="text-xs text-gray-500">{filteredEntries.length} registros</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFilters 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <Link href="/gerar-pdf">
                <RadarButton variant="secondary" size="sm">
                  <FileText className="w-4 h-4" />
                  Gerar PDF
                </RadarButton>
              </Link>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-4">
              <div className="flex flex-wrap gap-4">
                {/* Período */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Período</label>
                  <div className="flex gap-2">
                    {([
                      { value: '7d', label: '7 dias' },
                      { value: '30d', label: '30 dias' },
                      { value: '90d', label: '90 dias' },
                      { value: '1y', label: '1 ano' },
                      { value: 'all', label: 'Tudo' },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterPeriod(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filterPeriod === option.value
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensidade mínima */}
                <div className="flex-1 min-w-[200px]">
                  <RadarSlider
                    label="Intensidade mínima"
                    value={filterIntensityMin}
                    onChange={setFilterIntensityMin}
                    min={0}
                    max={10}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Alert Banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RadarAlertBanner type="info">
          Esta linha do tempo é um <strong>espelho do que você registrou</strong>. 
          Ela não é um laudo e não substitui peritos, juízes ou profissionais de saúde.
        </RadarAlertBanner>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total de registros" value={stats.total} />
          <StatCard label="Intensidade média" value={stats.avgIntensity} suffix="/10" />
          <StatCard label="Alta intensidade" value={stats.highIntensity} variant="danger" />
          <StatCard label="Recorrentes" value={stats.recurring} />
        </div>
      </div>

      {/* Timeline */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {filteredEntries.length === 0 ? (
          <RadarCard variant="soft" padding="lg">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Ajuste os filtros ou crie um novo registro no diário.
              </p>
              <Link href="/diario-premium">
                <RadarButton>
                  Ir para o Diário
                </RadarButton>
              </Link>
            </div>
          </RadarCard>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-800" />

            {/* Entries */}
            <div className="space-y-6">
              {Object.entries(groupedEntries).map(([date, dayEntries]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center z-10 border-2 border-slate-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-400">
                      {formatDate(dayEntries[0].created_at)}
                    </span>
                  </div>

                  {/* Day entries */}
                  <div className="space-y-3 ml-5 pl-9 border-l-2 border-slate-800">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="relative"
                      >
                        {/* Intensity dot */}
                        <div className={`absolute -left-[25px] top-4 w-3 h-3 rounded-full ${getIntensityColor(entry.intensity || 0)} ring-4 ring-[#020617]`} />

                        {/* Entry card */}
                        <RadarCard 
                          variant="default" 
                          padding="md"
                          hover
                          onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <RadarTag tone={getIntensityTone(entry.intensity || 0)} size="sm" dot>
                                  {entry.intensity || 0}/10
                                </RadarTag>
                                {entry.is_recurring && (
                                  <RadarTag tone="accent" size="sm">
                                    Recorrente
                                  </RadarTag>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatTime(entry.created_at)}
                                </span>
                              </div>
                              <h3 className="font-medium text-white mb-1">
                                {entry.title || 'Sem título'}
                              </h3>
                              <p className={`text-sm text-gray-400 ${expandedEntry === entry.id ? '' : 'line-clamp-2'}`}>
                                {entry.content}
                              </p>

                              {/* Emotions */}
                              {entry.emotions && entry.emotions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {entry.emotions.map((emotion) => (
                                    <span 
                                      key={emotion}
                                      className="px-2 py-0.5 bg-slate-700/50 text-gray-400 text-xs rounded-full"
                                    >
                                      {emotion}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${expandedEntry === entry.id ? 'rotate-90' : ''}`} />
                          </div>

                          {/* Expanded content */}
                          {expandedEntry === entry.id && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                              <Link href={`/diario/${entry.id}`}>
                                <RadarButton variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                  Ver detalhes completos
                                </RadarButton>
                              </Link>
                            </div>
                          )}
                        </RadarCard>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Componente auxiliar
function StatCard({ 
  label, 
  value, 
  suffix = '',
  variant = 'default' 
}: { 
  label: string
  value: number | string
  suffix?: string
  variant?: 'default' | 'danger'
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      variant === 'danger' 
        ? 'bg-red-950/20 border-red-900/30' 
        : 'bg-slate-900/50 border-slate-800/50'
    }`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}>
        {value}<span className="text-sm font-normal text-gray-500">{suffix}</span>
      </p>
    </div>
  )
}
