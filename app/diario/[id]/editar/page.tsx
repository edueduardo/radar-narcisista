'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Microphone from '../../../../components/Microphone'
import { ArrowLeft, FileText, Sparkles, Loader2, ExternalLink } from 'lucide-react'
import { PROBLEMS } from '@/lib/tools-config'
import { ResponsibilityTermsModal, useTermsAcceptance } from '@/components/ResponsibilityTermsModal'

interface JournalEntry {
  id: string
  title: string
  description: string
  context: string | null
  impact_score: number
  tags: string[]
  created_at: string
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
}

// Helper para buscar problema por tag
const getProblemByTag = (tag: string) => PROBLEMS.find(p => p.id === tag)

export default function EditarDiarioPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context: '',
    impact_score: 2,
    tags: [] as string[]
  })
  const [originalEntry, setOriginalEntry] = useState<JournalEntry | null>(null)
  const [lastAnalysis, setLastAnalysis] = useState<DiaryAnalysis | null>(null)
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  // Hook para verificar aceite dos termos
  const { hasAccepted: hasAcceptedTerms, isLoading: isLoadingTerms, markAsAccepted } = useTermsAcceptance()

  const predefinedTags = [
    'gaslighting', 'controle', 'isolamento', 'crítica', 'manipulação',
    'ciúmes', 'vitimização', 'agressão verbal', 'desrespeito', 'duplo padrão'
  ]

  useEffect(() => {
    if (params.id) {
      loadEntry()
    }
  }, [params.id])

  const loadEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Carrega entrada
      const { data: entry, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error || !entry) {
        setNotFound(true)
        return
      }

      setOriginalEntry(entry)
      setFormData({
        title: entry.title,
        description: entry.description,
        context: entry.context || '',
        impact_score: entry.impact_score,
        tags: entry.tags || []
      })

      // Carrega última análise (tabela pode não existir ainda)
      try {
        const { data: analysisData, error: analysisError } = await supabase
          .from('diary_analyses')
          .select('*')
          .eq('entry_id', params.id)
          .order('version', { ascending: false })
          .limit(1)
          .single()

        if (!analysisError && analysisData) {
          setLastAnalysis(analysisData)
        }
      } catch {
        // Tabela diary_analyses pode não existir ainda
        console.log('Tabela diary_analyses não disponível')
      }
    } catch (error) {
      console.error('Erro ao carregar entrada:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para analisar com IA
  const handleAnalyzeWithAI = async () => {
    if (!formData.description.trim()) {
      alert('Adicione uma descrição antes de analisar.')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/diario/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: formData.description,
          entry_id: params.id  // Passa o ID para salvar no histórico
        })
      })

      const data = await response.json()

      if (data.success) {
        setAnalysisResult(data)
        // Recarrega última análise
        const { data: newAnalysis } = await supabase
          .from('diary_analyses')
          .select('*')
          .eq('entry_id', params.id)
          .order('version', { ascending: false })
          .limit(1)
          .single()
        
        if (newAnalysis) {
          setLastAnalysis(newAnalysis)
        }
      } else {
        alert(data.error || 'Erro ao analisar')
      }
    } catch (error) {
      console.error('Erro na análise:', error)
      alert('Erro ao conectar com a IA')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTranscription = (text: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + (prev.description ? ' ' : '') + text
    }))
  }

  const handleTranscriptionError = (error: string) => {
    console.error('Erro na transcrição:', error)
    alert(`Erro na transcrição: ${error}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Preencha título e descrição.')
      return
    }

    setIsSubmitting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: formData.title,
          description: formData.description,
          context: formData.context || null,
          impact_score: formData.impact_score,
          tags: formData.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (error) throw error

      router.push('/diario')
    } catch (error) {
      console.error('Erro ao atualizar entrada:', error)
      alert('Ocorreu um erro ao atualizar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando entrada...</p>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Entrada não encontrada</h1>
            <p className="text-gray-600 mb-6">Esta entrada não existe ou você não tem permissão para editá-la.</p>
            <button
              onClick={() => router.push('/diario')}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Voltar para o Diário
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Botão Voltar */}
          <Link 
            href="/diario" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Diário</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Editar Entrada do Diário
            </h1>
            <p className="text-gray-600">
              Atualize os detalhes do episódio registrado
            </p>
          </div>

          {/* Card de Última Análise */}
          {lastAnalysis && (
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Última Análise Registrada</h3>
                    <p className="text-sm text-gray-500">
                      Análise #{lastAnalysis.version} • {new Date(lastAnalysis.created_at).toLocaleDateString('pt-BR')}
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                        lastAnalysis.impact_level === 'alto' ? 'bg-red-100 text-red-700' :
                        lastAnalysis.impact_level === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {lastAnalysis.impact_level === 'alto' ? 'Alto' : lastAnalysis.impact_level === 'medio' ? 'Médio' : 'Baixo'}
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/diario/${params.id}`}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Ver laudo completo
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              {lastAnalysis.main_problems?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {lastAnalysis.main_problems.map((p) => {
                    const problem = getProblemByTag(p)
                    return problem ? (
                      <span key={p} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100">
                        {problem.icon} {problem.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Episódio *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Discussão sobre finanças"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que aconteceu? *
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva o episódio com detalhes. O que foi dito? Como você se sentiu?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={6}
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Microphone
                      onTranscription={handleTranscription}
                      onError={handleTranscriptionError}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use o microfone para gravar por voz ou digite diretamente
                </p>
                
                {/* Microaviso de responsabilidade */}
                <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
                  ⚠️ Lembre-se: você está registrando <strong>sua perspectiva</strong>. A IA analisa apenas o que você relata. 
                  Seja honesto(a) consigo mesmo(a) para obter clareza real.
                </p>
              </div>

              {/* Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexto (opcional)
                </label>
                <input
                  type="text"
                  value={formData.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  placeholder="Ex: Em casa, durante o jantar, com as crianças presentes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Impact Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de impacto emocional
                </label>
                <div className="flex space-x-4">
                  {[1, 2, 3].map((score) => (
                    <label key={score} className="flex items-center">
                      <input
                        type="radio"
                        name="impact"
                        value={score}
                        checked={formData.impact_score === score}
                        onChange={(e) => handleInputChange('impact_score', parseInt(e.target.value))}
                        className="mr-2"
                        disabled={isSubmitting}
                      />
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        score === 1 ? 'bg-green-100 text-green-800' :
                        score === 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {score === 1 ? 'Baixo' : score === 2 ? 'Médio' : 'Alto'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                
                {/* Predefined tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      disabled={isSubmitting}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Custom tag input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(newTag)
                      }
                    }}
                    placeholder="Adicionar tag personalizada"
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(newTag)}
                    className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                    disabled={isSubmitting}
                  >
                    Adicionar
                  </button>
                </div>

                {/* Selected tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm flex items-center"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-500 hover:text-purple-700"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Analisar com IA */}
              <div className="border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing || isSubmitting || !formData.description.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analisando com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analisar com IA (cria nova análise)
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  A análise será salva no histórico sem apagar as anteriores
                </p>
              </div>

              {/* Resultado da nova análise */}
              {analysisResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Nova análise criada!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Análise #{lastAnalysis?.version || 1} foi registrada com sucesso.
                  </p>
                  <Link
                    href={`/diario/${params.id}`}
                    className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium mt-2"
                  >
                    Ver laudo completo
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/diario')}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Atualizando...' : 'Atualizar Entrada'}
                </button>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dicas:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seja específico sobre o que aconteceu</li>
              <li>• Inclua citações diretas se lembrar</li>
              <li>• Descreva como você se sentiu durante e depois</li>
              <li>• Use tags para encontrar padrões depois</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Termos Obrigatório */}
      {!isLoadingTerms && hasAcceptedTerms === false && (
        <ResponsibilityTermsModal 
          onAccept={markAsAccepted} 
          context="diario" 
        />
      )}
    </>
  )
}
