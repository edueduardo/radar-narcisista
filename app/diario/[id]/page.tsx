'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Trash2, 
  Tag,
  AlertTriangle,
  Clock,
  MessageSquare,
  FileText,
  Shield,
  Sparkles,
  ExternalLink,
  History,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react'
import { PROBLEMS, getToolsByProblem, type ProblemTag } from '@/lib/tools-config'
import { getAbuseTagById } from '@/lib/abuse-tags-config'

// Helper para buscar problema por tag
const getProblemByTag = (tag: string) => PROBLEMS.find(p => p.id === tag)

interface JournalEntry {
  id: string
  title: string
  description: string
  context: string
  impact_score: number
  tags: string[]
  created_at: string
  updated_at: string
}

interface DiaryAnalysis {
  id: string
  entry_id: string
  version: number
  created_at: string
  impact_level: string
  main_problems: string[]
  tags: string[]
  summary: string | null
  recommendations: string | null
  ai_models_used: string[]
  consensus_level: number
}

// Cores por categoria de tag
const tagColors: Record<string, { bg: string; text: string }> = {
  // Manipulação
  'gaslighting': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'love bombing': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'hoovering': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'triangulação': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'projeção': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'vitimização': { bg: 'bg-rose-100', text: 'text-rose-700' },
  // Controle
  'isolamento social': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'controle financeiro': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'monitoramento excessivo': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'ciúmes possessivo': { bg: 'bg-orange-100', text: 'text-orange-700' },
  // Agressão
  'agressão verbal': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'humilhação': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'crítica destrutiva': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'desprezo': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'sarcasmo': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'ameaça velada': { bg: 'bg-purple-100', text: 'text-purple-700' },
  // Ciclo
  'tensão crescente': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'explosão': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'lua de mel': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'silêncio punitivo': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'tratamento de gelo': { bg: 'bg-blue-100', text: 'text-blue-700' },
  // Invalidação
  'minimização': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'negação': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'desqualificação': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'duplo padrão': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'desrespeito a limites': { bg: 'bg-gray-100', text: 'text-gray-700' },
}

const defaultTagColor = { bg: 'bg-gray-100', text: 'text-gray-600' }

export default function DiarioDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [analyses, setAnalyses] = useState<DiaryAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState(false)
  const supabase = createClient()

  const entryId = params.id as string
  const currentAnalysis = analyses[0] || null
  const previousAnalyses = analyses.slice(1)

  useEffect(() => {
    loadData()
  }, [entryId])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Carrega entrada
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Erro ao carregar entrada:', error)
        router.push('/diario')
        return
      }

      setEntry(data)

      // Carrega análises (histórico) - tabela pode não existir ainda
      try {
        const { data: analysesData, error: analysesError } = await supabase
          .from('diary_analyses')
          .select('*')
          .eq('entry_id', entryId)
          .order('version', { ascending: false })

        if (!analysesError && analysesData) {
          setAnalyses(analysesData)
        }
      } catch {
        // Tabela diary_analyses pode não existir ainda
        console.log('Tabela diary_analyses não disponível')
      }
    } catch (error) {
      console.error('Erro:', error)
      router.push('/diario')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id)

      if (error) throw error

      router.push('/diario')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir entrada. Tente novamente.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTagColor = (tag: string) => tagColors[tag.toLowerCase()] || defaultTagColor

  const getImpactInfo = (score: number) => {
    if (score >= 3) return { label: 'Alto Impacto', color: 'bg-red-100 text-red-700 border-red-200' }
    if (score >= 2) return { label: 'Médio Impacto', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    return { label: 'Baixo Impacto', color: 'bg-green-100 text-green-700 border-green-200' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando entrada...</p>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Entrada não encontrada</h2>
          <Link href="/diario" className="text-purple-600 hover:underline">
            Voltar ao Diário
          </Link>
        </div>
      </div>
    )
  }

  const impactInfo = getImpactInfo(entry.impact_score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/diario" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Diário</span>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header do Card */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{entry.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.created_at)}
                  </span>
                  {entry.context && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {entry.context}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Badge de Impacto */}
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${impactInfo.color}`}>
                {impactInfo.label}
              </span>
            </div>
          </div>

          {/* Descrição */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Descrição do Episódio
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {entry.description || 'Nenhuma descrição adicionada.'}
              </p>
            </div>
          </div>

          {/* Tags com Tooltips */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags de Tipo de Abuso
              </h2>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => {
                  const colors = getTagColor(tag)
                  const tagInfo = getAbuseTagById(tag)
                  return (
                    <div key={tag} className="relative group">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-help ${colors.bg} ${colors.text}`}
                      >
                        #{tag}
                      </span>
                      {/* Tooltip */}
                      {tagInfo && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                          <p className="font-semibold mb-1">{tagInfo.label}</p>
                          <p className="text-gray-300">{tagInfo.description}</p>
                          {tagInfo.example && (
                            <p className="text-gray-400 mt-1 italic text-[11px]">Ex: "{tagInfo.example}"</p>
                          )}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SEÇÃO DE LAUDO - Análise de IA */}
          {/* ============================================================= */}
          {currentAnalysis ? (
            <div className="border-b border-gray-100">
              {/* Header do Laudo */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Laudo de Análise Colaborativa</h2>
                      <p className="text-purple-200 text-sm">
                        Análise #{currentAnalysis.version} • {new Date(currentAnalysis.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {currentAnalysis.ai_models_used?.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span className="text-purple-200 text-sm">
                        {currentAnalysis.ai_models_used.length} IA{currentAnalysis.ai_models_used.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Padrões Identificados */}
                {currentAnalysis.main_problems?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Padrões Identificados
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {currentAnalysis.main_problems.map((problemTag) => {
                        const problem = getProblemByTag(problemTag)
                        if (!problem) return null
                        return (
                          <div key={problemTag} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{problem.icon}</span>
                              <div>
                                <span className="font-semibold text-gray-900">{problem.label}</span>
                                <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                  Detectado
                                </span>
                              </div>
                            </div>
                            <Link
                              href={`/hub/${problemTag}`}
                              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Ver Hub de {problem.label}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Resumo */}
                {currentAnalysis.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Resumo da Análise
                    </h3>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-gray-700">{currentAnalysis.summary}</p>
                    </div>
                  </div>
                )}

                {/* Ferramentas Sugeridas */}
                {currentAnalysis.main_problems?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Ferramentas Sugeridas
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(() => {
                        const tools = new Set<string>()
                        currentAnalysis.main_problems.forEach((p) => {
                          const problemTools = getToolsByProblem(p as ProblemTag)
                          problemTools.forEach((t) => tools.add(JSON.stringify(t)))
                        })
                        return Array.from(tools).slice(0, 6).map((toolStr) => {
                          const tool = JSON.parse(toolStr)
                          return (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{tool.icon}</span>
                                <span className="font-medium text-gray-900 group-hover:text-purple-600 text-sm">
                                  {tool.title}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{tool.description}</p>
                            </Link>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-700">
                    <strong>Aviso:</strong> Este laudo foi gerado por sistema de IAs colaborativas e tem caráter informativo. 
                    Não substitui avaliação psicológica ou jurídica profissional.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Sem análise */
            <div className="p-8 text-center border-b border-gray-100">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma análise disponível</h3>
              <p className="text-gray-500 mb-4">Este episódio ainda não foi analisado pela IA.</p>
              <Link
                href={`/diario/${entry.id}/editar`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Analisar com IA
              </Link>
            </div>
          )}

          {/* Histórico de Análises */}
          {previousAnalyses.length > 0 && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => setExpandedHistory(!expandedHistory)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-gray-900">Histórico de Análises</span>
                  <span className="text-sm text-gray-500">({previousAnalyses.length} anterior{previousAnalyses.length > 1 ? 'es' : ''})</span>
                </div>
                {expandedHistory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedHistory && (
                <div className="px-6 pb-6 space-y-3">
                  {previousAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">Análise #{analysis.version}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            analysis.impact_level === 'alto' ? 'bg-red-100 text-red-700' :
                            analysis.impact_level === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {analysis.impact_level === 'alto' ? 'Alto' : analysis.impact_level === 'medio' ? 'Médio' : 'Baixo'}
                          </span>
                        </div>
                      </div>
                      {analysis.main_problems?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.main_problems.map((p) => {
                            const problem = getProblemByTag(p)
                            return problem ? (
                              <span key={p} className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200">
                                {problem.icon} {problem.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="p-6 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              {entry.updated_at !== entry.created_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Atualizado em {formatDate(entry.updated_at)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href={`/diario/${entry.id}/editar`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Links úteis */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link
            href="/diario/novo"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            + Nova Entrada
          </Link>
          <Link
            href="/diario/timeline"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Ver Timeline
          </Link>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir entrada?</h3>
              <p className="text-gray-600 text-sm">
                Esta ação não pode ser desfeita. A entrada "{entry.title}" será permanentemente removida.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
