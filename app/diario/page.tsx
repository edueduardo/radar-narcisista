'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { JournalEntry } from '../../types/database'
import { ArrowLeft, FileText, BookOpen, Sparkles } from 'lucide-react'

// Tipo para entradas com contagem de análises
interface JournalEntryWithAnalysis extends JournalEntry {
  analysis_count?: number
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<JournalEntryWithAnalysis[]>([])
  const [entriesWithAnalysis, setEntriesWithAnalysis] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadEntries()
  }, [filter])

  const loadEntries = async () => {
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

      // Apply filter if needed
      if (filter !== 'all') {
        const impactMap = { high: 3, medium: 2, low: 1 }
        query = query.gte('impact_score', impactMap[filter as keyof typeof impactMap])
      }

      const { data, error } = await query

      if (error) throw error
      setEntries(data || [])

      // Carrega quais entradas têm análises (tabela pode não existir ainda)
      if (data && data.length > 0) {
        try {
          const entryIds = data.map(e => e.id)
          const { data: analysesData, error: analysesError } = await supabase
            .from('diary_analyses')
            .select('entry_id')
            .in('entry_id', entryIds)
          
          if (!analysesError && analysesData) {
            const idsWithAnalysis = new Set(analysesData.map(a => a.entry_id))
            setEntriesWithAnalysis(idsWithAnalysis)
          }
        } catch {
          // Tabela diary_analyses pode não existir ainda - ignora silenciosamente
          console.log('Tabela diary_analyses não disponível')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar diário:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Tem certeza que deseja apagar esta entrada?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      
      setEntries(prev => prev.filter(entry => entry.id !== entryId))
    } catch (error) {
      console.error('Erro ao apagar entrada:', error)
      alert('Erro ao apagar entrada. Tente novamente.')
    }
  }

  const getImpactColor = (score: number) => {
    if (score >= 3) return 'bg-red-900/50 text-red-300 border-red-800'
    if (score >= 2) return 'bg-yellow-900/50 text-yellow-300 border-yellow-800'
    return 'bg-green-900/50 text-green-300 border-green-800'
  }

  const getImpactLabel = (score: number) => {
    if (score >= 3) return 'Alto impacto'
    if (score >= 2) return 'Médio impacto'
    return 'Baixo impacto'
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Diário de Episódios</h1>
                  <p className="text-xs text-gray-500">{entries.length} registros</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/diario/timeline')}
                className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 flex items-center space-x-2"
                title="Ver Timeline de Padrões"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Timeline</span>
              </button>
              <button
                onClick={() => router.push('/diario/novo')}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Entrada</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-blue-900/30 border border-blue-800/50 rounded-xl p-4">
          <p className="text-blue-300 text-sm">
            Aqui você registra a <strong>SUA perspectiva</strong>. O Radar não sabe toda a história. 
            Seja honesto(a) para obter clareza real.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">

          {/* Filters */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Filtrar por impacto:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'high' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Alto
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'medium' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Médio
              </button>
              <button
                onClick={() => setFilter('low')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'low' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Baixo
              </button>
            </div>
          </div>

          {/* Entries List */}
          {entries.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Seu diário está vazio
              </h2>
              <p className="text-gray-400 mb-6">
                Comece a registrar os episódios para identificar padrões e encontrar clareza.
              </p>
              <button
                onClick={() => router.push('/diario/novo')}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Criar Primeira Entrada
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-900/70 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {entry.title || 'Episódio sem título'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(entry.impact_score || 1)}`}>
                          {getImpactLabel(entry.impact_score || 1)}
                        </span>
                        {/* ETAPA 3 - Badge para entradas clarity_baseline */}
                        {entry.entry_type === 'clarity_baseline' && (
                          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium border border-purple-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Perfil de Clareza
                          </span>
                        )}
                        {entry.from_voice && (
                          <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs font-medium border border-blue-800">
                            🎤 Por voz
                          </span>
                        )}
                        {entriesWithAnalysis.has(entry.id) && (
                          <span className="px-2 py-1 bg-violet-900/50 text-violet-300 rounded-full text-xs font-medium border border-violet-800 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Laudo disponível
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-violet-900/30 text-violet-300 rounded-md text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description preview */}
                      {entry.description && (
                        <p className="text-gray-300 line-clamp-3 mb-3">
                          {entry.description}
                        </p>
                      )}

                      {/* Context */}
                      {entry.context && (
                        <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-400">
                            <span className="font-medium text-gray-300">Contexto:</span> {entry.context}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/diario/${entry.id}`}
                        className="p-2 text-gray-400 hover:text-violet-400 hover:bg-violet-950/30 rounded-lg"
                        title="Ver laudo"
                      >
                        <FileText className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => router.push(`/diario/${entry.id}/editar`)}
                        className="p-2 text-gray-400 hover:text-violet-400 hover:bg-violet-950/30 rounded-lg"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg"
                        title="Apagar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {entries.length > 0 && (
            <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-violet-400">{entries.length}</div>
                  <div className="text-sm text-gray-400">Total de entradas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {entries.filter(e => (e.impact_score || 0) >= 3).length}
                  </div>
                  <div className="text-sm text-gray-400">Alto impacto</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {entries.filter(e => e.from_voice).length}
                  </div>
                  <div className="text-sm text-gray-400">Por voz</div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso de Responsabilidade - Lema do Radar */}
          <div className="mt-6 bg-amber-900/30 border border-amber-800/50 rounded-xl p-4">
            <p className="text-xs text-amber-300 text-center leading-relaxed">
              ⚠️ <strong>Lema do Radar:</strong> "Às vezes acreditamos em um mentiroso e culpamos um inocente." 
              Você está registrando <strong>sua perspectiva</strong>. O Radar organiza relatos, não decide quem está certo. 
              Mentir para prejudicar alguém é crime (Art. 299 CP). Seja honesto(a) para obter clareza real.
            </p>
          </div>
        </div>
      </div>
  )
}
