'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Tag,
  Clock,
  Flame,
  Shield,
  Eye,
  ExternalLink,
  Info,
  Sparkles,
  MessageCircle
} from 'lucide-react'
import { mapAbuseTagsToProblemTags, getAbuseTagById } from '@/lib/abuse-tags-config'
import { PROBLEMS, type ProblemTag } from '@/lib/tools-config'

// Helper para buscar problema por tag
const getProblemByTag = (tag: string) => PROBLEMS.find(p => p.id === tag)

// Cores por categoria de tag
const tagColors: Record<string, { bg: string; text: string; border: string }> = {
  // Manipulação
  'gaslighting': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'love bombing': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'hoovering': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'triangulação': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'projeção': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'inversão de culpa': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  'vitimização': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  // Controle
  'controle financeiro': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'controle social': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'isolamento': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'monitoramento': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'ciúmes excessivos': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'possessividade': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  // Agressão
  'agressão verbal': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'humilhação': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'crítica destrutiva': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'desprezo': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'sarcasmo': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'ameaça velada': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  // Ciclo
  'tensão crescente': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'explosão': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'lua de mel': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'silêncio punitivo': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'tratamento de gelo': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  // Invalidação
  'minimização': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'negação': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'desqualificação': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'duplo padrão': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  'desrespeito a limites': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
}

const defaultTagColor = { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }

interface JournalEntry {
  id: string
  title: string
  description: string
  context: string
  impact_score: number
  mood_intensity?: number
  tags: string[]
  created_at: string
  // ETAPA 3 - Campos de integração Clareza ⇄ Diário, ETAPA 7 - Plano de Segurança
  entry_type?: 'normal' | 'clarity_baseline' | 'chat_summary' | 'voice_note' | 'photo_note' | 'video_note' | 'safety_plan'
  clarity_test_id?: string
}

interface PatternAnalysis {
  tag: string
  count: number
  category: string
  trend: 'increasing' | 'stable' | 'decreasing'
  lastOccurrence: string
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  // ETAPA 6 - Filtro por tipo de entrada do triângulo
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | 'clarity_baseline' | 'chat_summary' | 'normal'>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadEntries()
  }, [timeRange])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Filtro de tempo
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Erro ao carregar entradas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Análise de padrões
  const patternAnalysis = useMemo(() => {
    const tagCounts: Record<string, { count: number; dates: string[] }> = {}
    
    entries.forEach(entry => {
      (entry.tags || []).forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = { count: 0, dates: [] }
        }
        tagCounts[tag].count++
        tagCounts[tag].dates.push(entry.created_at)
      })
    })

    const patterns: PatternAnalysis[] = Object.entries(tagCounts)
      .map(([tag, data]) => {
        // Determinar categoria
        let category = 'outros'
        if (['gaslighting', 'love bombing', 'hoovering', 'triangulação', 'projeção', 'inversão de culpa', 'vitimização'].includes(tag)) {
          category = 'manipulação'
        } else if (['controle financeiro', 'controle social', 'isolamento', 'monitoramento', 'ciúmes excessivos', 'possessividade'].includes(tag)) {
          category = 'controle'
        } else if (['agressão verbal', 'humilhação', 'crítica destrutiva', 'desprezo', 'sarcasmo', 'ameaça velada'].includes(tag)) {
          category = 'agressão'
        } else if (['tensão crescente', 'explosão', 'lua de mel', 'silêncio punitivo', 'tratamento de gelo'].includes(tag)) {
          category = 'ciclo'
        } else if (['minimização', 'negação', 'desqualificação', 'duplo padrão', 'desrespeito a limites'].includes(tag)) {
          category = 'invalidação'
        }

        // Determinar tendência (simplificado)
        const sortedDates = data.dates.sort()
        const recentCount = sortedDates.filter(d => {
          const date = new Date(d)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return date > weekAgo
        }).length

        const olderCount = sortedDates.filter(d => {
          const date = new Date(d)
          const weekAgo = new Date()
          const twoWeeksAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
          return date <= weekAgo && date > twoWeeksAgo
        }).length

        let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
        if (recentCount > olderCount) trend = 'increasing'
        else if (recentCount < olderCount) trend = 'decreasing'

        return {
          tag,
          count: data.count,
          category,
          trend,
          lastOccurrence: sortedDates[sortedDates.length - 1]
        }
      })
      .sort((a, b) => b.count - a.count)

    return patterns
  }, [entries])

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalEntries = entries.length
    const highImpact = entries.filter(e => e.impact_score >= 3).length
    const avgImpact = totalEntries > 0 
      ? entries.reduce((sum, e) => sum + e.impact_score, 0) / totalEntries 
      : 0
    
    // Categoria mais frequente
    const categoryCounts: Record<string, number> = {}
    patternAnalysis.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.count
    })
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

    return {
      totalEntries,
      highImpact,
      avgImpact: avgImpact.toFixed(1),
      topCategory: topCategory ? topCategory[0] : 'N/A',
      topCategoryCount: topCategory ? topCategory[1] : 0
    }
  }, [entries, patternAnalysis])

  // Padrões agrupados por ProblemTag usando mapAbuseTagsToProblemTags
  const problemPatterns = useMemo(() => {
    const allTags: string[] = []
    entries.forEach(entry => {
      (entry.tags || []).forEach(tag => allTags.push(tag))
    })
    
    const problemCounts = mapAbuseTagsToProblemTags(allTags)
    
    // Converte para array e ordena por contagem
    return Object.entries(problemCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([problemTag, count]) => ({
        problemTag: problemTag as ProblemTag,
        count,
        problem: getProblemByTag(problemTag)
      }))
      .filter(p => p.problem) // Remove problemas não encontrados
  }, [entries])

  // Entradas filtradas (por tag E por entry_type)
  const filteredEntries = useMemo(() => {
    let filtered = entries
    
    // Filtro por tag
    if (selectedTag) {
      filtered = filtered.filter(e => (e.tags || []).includes(selectedTag))
    }
    
    // ETAPA 6 - Filtro por entry_type
    if (entryTypeFilter !== 'all') {
      filtered = filtered.filter(entry => {
        if (entryTypeFilter === 'normal') {
          return !entry.entry_type || entry.entry_type === 'normal'
        }
        return entry.entry_type === entryTypeFilter
      })
    }
    
    return filtered
  }, [entries, selectedTag, entryTypeFilter])

  // Agrupar por mês
  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {}
    filteredEntries.forEach(entry => {
      const date = new Date(entry.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!groups[key]) groups[key] = []
      groups[key].push(entry)
    })
    return groups
  }, [filteredEntries])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMonthYear = (key: string) => {
    const [year, month] = key.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const getTagColor = (tag: string) => tagColors[tag.toLowerCase()] || defaultTagColor

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'manipulação': return '🎭'
      case 'controle': return '🔒'
      case 'agressão': return '💢'
      case 'ciclo': return '🔄'
      case 'invalidação': return '🚫'
      default: return '📌'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/diario" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Diário
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                Timeline de Padrões
              </h1>
              <p className="text-gray-600 mt-1">
                Visualize seus episódios e identifique padrões ao longo do tempo
              </p>
            </div>

            {/* Filtro de tempo */}
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : 'Tudo'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ETAPA 6 - Filtros do Triângulo + Legenda */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filtro por tipo de entrada */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Filter className="w-4 h-4 text-purple-600" />
                Tipo:
              </span>
              <button
                onClick={() => setEntryTypeFilter('all')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  entryTypeFilter === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setEntryTypeFilter('clarity_baseline')}
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  entryTypeFilter === 'clarity_baseline' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Perfil de Clareza
              </button>
              <button
                onClick={() => setEntryTypeFilter('chat_summary')}
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  entryTypeFilter === 'chat_summary' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-3 h-3" />
                Resumo do Chat
              </button>
              <button
                onClick={() => setEntryTypeFilter('normal')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  entryTypeFilter === 'normal' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Episódios Normais
              </button>
            </div>

            {/* Legenda do Triângulo */}
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-medium text-gray-700">Legenda:</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Perfil de Clareza
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-indigo-600" />
                Resumo do Chat
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-600" />
                Intenso (≥7)
              </span>
            </div>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum episódio registrado</h2>
            <p className="text-gray-500 mb-6">Comece a registrar seus episódios para visualizar padrões</p>
            <Link
              href="/diario/novo"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Registrar Primeiro Episódio
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar - Estatísticas e Padrões */}
            <div className="lg:col-span-1 space-y-6">
              {/* Estatísticas */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Estatísticas
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats.totalEntries}</p>
                    <p className="text-xs text-gray-600">Episódios</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{stats.highImpact}</p>
                    <p className="text-xs text-gray-600">Alto Impacto</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-orange-600">{stats.avgImpact}</p>
                    <p className="text-xs text-gray-600">Impacto Médio</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-blue-600 capitalize">{stats.topCategory}</p>
                    <p className="text-xs text-gray-600">Padrão Principal</p>
                  </div>
                </div>
              </div>

              {/* Problemas Detectados (usando mapAbuseTagsToProblemTags) */}
              {problemPatterns.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Problemas Detectados
                  </h2>
                  <div className="space-y-2">
                    {problemPatterns.map(({ problemTag, count, problem }) => (
                      <Link
                        key={problemTag}
                        href={`/hub/${problemTag}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{problem?.icon}</span>
                          <span className="font-medium text-gray-900 group-hover:text-purple-700">
                            {problem?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-600">{count} ocorrências</span>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Padrões Identificados (tags individuais) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Tags Identificadas
                </h2>

                {patternAnalysis.length === 0 ? (
                  <p className="text-gray-500 text-sm">Adicione tags aos episódios para ver padrões</p>
                ) : (
                  <div className="space-y-3">
                    {patternAnalysis.slice(0, 10).map(pattern => {
                      const colors = getTagColor(pattern.tag)
                      const tagInfo = getAbuseTagById(pattern.tag)
                      return (
                        <div key={pattern.tag} className="relative group">
                          <button
                            onClick={() => setSelectedTag(selectedTag === pattern.tag ? null : pattern.tag)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                              selectedTag === pattern.tag 
                                ? 'ring-2 ring-purple-500 ' + colors.bg
                                : 'hover:bg-gray-50 ' + colors.bg
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{getCategoryIcon(pattern.category)}</span>
                              <span className={`text-sm font-medium ${colors.text}`}>{pattern.tag}</span>
                              {tagInfo && (
                                <Info className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-700">{pattern.count}x</span>
                              {pattern.trend === 'increasing' && (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                              )}
                              {pattern.trend === 'decreasing' && (
                                <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                              )}
                            </div>
                          </button>
                          {/* Tooltip com descrição da tag */}
                          {tagInfo && (
                            <div className="absolute left-0 right-0 top-full mt-1 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <p className="font-semibold mb-1">{tagInfo.label}</p>
                              <p className="text-gray-300">{tagInfo.description}</p>
                              {tagInfo.example && (
                                <p className="text-gray-400 mt-1 italic">"{tagInfo.example}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="mt-4 w-full py-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>

              {/* Alerta de Padrões */}
              {patternAnalysis.some(p => p.trend === 'increasing' && p.count >= 3) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-700 text-sm">Padrão em Alta</h3>
                      <p className="text-red-600 text-xs mt-1">
                        Alguns padrões estão aumentando. Considere conversar com um profissional.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Timeline de Episódios
                    {selectedTag && (
                      <span className="text-sm font-normal text-purple-600">
                        (filtrado: {selectedTag})
                      </span>
                    )}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredEntries.length} episódio{filteredEntries.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Linha vertical */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {Object.entries(groupedEntries).map(([monthKey, monthEntries]) => (
                    <div key={monthKey} className="mb-8">
                      {/* Mês */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center z-10">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {formatMonthYear(monthKey)}
                        </h3>
                      </div>

                      {/* Entradas do mês */}
                      <div className="ml-4 pl-8 border-l-2 border-gray-100 space-y-4">
                        {monthEntries.map(entry => (
                          <div
                            key={entry.id}
                            className={`relative bg-gray-50 rounded-xl p-4 transition-all cursor-pointer hover:bg-gray-100 ${
                              expandedEntry === entry.id ? 'ring-2 ring-purple-300' : ''
                            }`}
                            onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                          >
                            {/* Ponto na timeline */}
                            <div className={`absolute -left-[2.35rem] top-4 w-3 h-3 rounded-full border-2 border-white ${
                              entry.impact_score >= 3 ? 'bg-red-500' : entry.impact_score >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>

                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    entry.impact_score >= 3 
                                      ? 'bg-red-100 text-red-700' 
                                      : entry.impact_score >= 2 
                                        ? 'bg-yellow-100 text-yellow-700' 
                                        : 'bg-green-100 text-green-700'
                                  }`}>
                                    {entry.impact_score >= 3 ? 'Alto' : entry.impact_score >= 2 ? 'Médio' : 'Baixo'}
                                  </span>
                                  {/* ETAPA 3 - Badge para entradas clarity_baseline */}
                                  {entry.entry_type === 'clarity_baseline' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      Perfil de Clareza
                                    </span>
                                  )}
                                  {/* ETAPA 4 - Badge para entradas chat_summary */}
                                  {entry.entry_type === 'chat_summary' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />
                                      Resumo do Chat
                                    </span>
                                  )}
                                  {/* ETAPA 7 - Badge para entradas safety_plan */}
                                  {entry.entry_type === 'safety_plan' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      Plano de Segurança
                                    </span>
                                  )}
                                  {/* ETAPA 3 - Destaque para mood_intensity alto */}
                                  {entry.mood_intensity && entry.mood_intensity >= 7 && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                                      <Flame className="w-3 h-3" />
                                      Intenso
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{formatDate(entry.created_at)}</p>
                                
                                {/* Tags */}
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {entry.tags.slice(0, expandedEntry === entry.id ? undefined : 3).map(tag => {
                                      const colors = getTagColor(tag)
                                      return (
                                        <span
                                          key={tag}
                                          className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}
                                        >
                                          {tag}
                                        </span>
                                      )
                                    })}
                                    {!expandedEntry && entry.tags.length > 3 && (
                                      <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">
                                        +{entry.tags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Descrição expandida */}
                                {expandedEntry === entry.id && entry.description && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {entry.description}
                                    </p>
                                    {entry.context && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        <strong>Contexto:</strong> {entry.context}
                                      </p>
                                    )}
                                    <Link
                                      href={`/diario/${entry.id}`}
                                      className="inline-flex items-center gap-1 text-purple-600 text-sm mt-3 hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Ver detalhes completos →
                                    </Link>
                                  </div>
                                )}
                              </div>

                              <button className="text-gray-400 hover:text-gray-600">
                                {expandedEntry === entry.id ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer de Responsabilidade */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Aviso de Responsabilidade
              </p>
              <p className="text-xs text-amber-700">
                Esta análise é baseada <strong>apenas nos seus registros</strong> e na sua perspectiva. 
                A IA não conhece o outro lado da história. Não substitui avaliação de psicólogo, advogado ou médico. 
                Mentir para prejudicar alguém é crime (Art. 299 CP). Você é responsável pelo que registra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
