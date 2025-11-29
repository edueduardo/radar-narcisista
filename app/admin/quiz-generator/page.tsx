'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  Brain, 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  RefreshCw,
  Settings,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Database,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  QuizQuestion,
  QuizCategory,
  CATEGORY_INFO,
  getQuestionBank,
  getGeneratorConfig,
  saveGeneratorConfig,
  generateQuestions,
  approveQuestion,
  rejectQuestion,
  deleteQuestion,
  getQuizStats,
  initializeQuestionBank,
  QuizGeneratorConfig
} from '@/lib/quizGenerator'

export default function QuizGeneratorPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [config, setConfig] = useState<QuizGeneratorConfig | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [generationCategory, setGenerationCategory] = useState<QuizCategory>('GASLIGHTING')
  const [generationCount, setGenerationCount] = useState(5)

  // Carregar dados
  useEffect(() => {
    initializeQuestionBank()
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    const bank = getQuestionBank()
    const cfg = getGeneratorConfig()
    const st = getQuizStats()
    
    setQuestions(bank)
    setConfig(cfg)
    setStats(st)
    setLoading(false)
  }

  // Filtrar perguntas
  const filteredQuestions = questions.filter(q => {
    if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false
    if (selectedStatus !== 'ALL' && q.status !== selectedStatus) return false
    return true
  })

  // Gerar novas perguntas
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateQuestions(generationCategory, generationCount)
      if (result.success) {
        alert(`✅ ${result.questionsGenerated} perguntas geradas com sucesso!`)
        loadData()
      } else {
        alert(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Erro ao gerar perguntas')
    }
    setGenerating(false)
  }

  // Aprovar pergunta
  const handleApprove = (id: string) => {
    if (approveQuestion(id)) {
      loadData()
    }
  }

  // Rejeitar pergunta
  const handleReject = (id: string) => {
    if (rejectQuestion(id)) {
      loadData()
    }
  }

  // Deletar pergunta
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta pergunta?')) {
      if (deleteQuestion(id)) {
        loadData()
      }
    }
  }

  // Salvar configurações
  const handleSaveConfig = () => {
    if (config) {
      saveGeneratorConfig(config)
      alert('✅ Configurações salvas!')
    }
  }

  // Aprovar todas pendentes
  const handleApproveAll = () => {
    if (confirm('Aprovar todas as perguntas pendentes?')) {
      const pending = questions.filter(q => q.status === 'PENDING')
      pending.forEach(q => approveQuestion(q.id))
      loadData()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-500" />
                Gerador de Quiz com IA
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gere, aprove e gerencie perguntas do Teste de Clareza
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byStatus.PENDING}</p>
                    <p className="text-sm text-gray-500">Pendentes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Check className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byStatus.APPROVED}</p>
                    <p className="text-sm text-gray-500">Aprovadas</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <X className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byStatus.REJECTED}</p>
                    <p className="text-sm text-gray-500">Rejeitadas</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiGenerated}</p>
                    <p className="text-sm text-gray-500">Geradas por IA</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && config && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Gerador
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gerador Ativo
                  </label>
                  <button
                    onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      config.enabled 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {config.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {config.enabled ? 'Ativado' : 'Desativado'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modelo de IA
                  </label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="gpt-4">GPT-4 (Melhor qualidade)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (Rápido)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 (Econômico)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Perguntas por Lote
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={config.questionsPerBatch}
                    onChange={(e) => setConfig({ ...config, questionsPerBatch: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {/* Generation Panel */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Gerar Novas Perguntas com IA
            </h2>
            
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Categoria
                </label>
                <select
                  value={generationCategory}
                  onChange={(e) => setGenerationCategory(e.target.value as QuizCategory)}
                  className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                >
                  {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                    <option key={key} value={key} className="text-gray-900">
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={generationCount}
                  onChange={(e) => setGenerationCount(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={generating || !config?.enabled}
                className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Perguntas
                  </>
                )}
              </button>
            </div>
            
            {!config?.enabled && (
              <p className="text-purple-200 text-sm mt-3">
                ⚠️ O gerador está desativado. Ative nas configurações para gerar novas perguntas.
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="ALL">Todas as Categorias</option>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <option key={key} value={key}>{info.name}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">⏳ Pendentes</option>
                <option value="APPROVED">✅ Aprovadas</option>
                <option value="REJECTED">❌ Rejeitadas</option>
              </select>
              
              {stats?.byStatus.PENDING > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="ml-auto px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Aprovar Todas Pendentes ({stats.byStatus.PENDING})
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                <p className="mt-2 text-gray-500">Carregando...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Brain className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Nenhuma pergunta encontrada</p>
                <p className="text-sm text-gray-400">Use o gerador acima para criar novas perguntas</p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-l-4 ${
                    question.status === 'APPROVED' ? 'border-green-500' :
                    question.status === 'REJECTED' ? 'border-red-500' :
                    'border-yellow-500'
                  }`}
                >
                  {/* Question Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            question.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            question.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {question.status === 'APPROVED' ? '✅ Aprovada' :
                             question.status === 'REJECTED' ? '❌ Rejeitada' :
                             '⏳ Pendente'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            {CATEGORY_INFO[question.category]?.name || question.category}
                          </span>
                          {question.aiGenerated && (
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              IA
                            </span>
                          )}
                          {question.phase && (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {question.phase.replace('FASE_', 'Fase ').replace('_', ' - ')}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-900 dark:text-white font-medium">
                          {question.text}
                        </p>
                        
                        {question.description && (
                          <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {question.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(question.id); }}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                              title="Aprovar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(question.id); }}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                              title="Rejeitar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(question.id); }}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedQuestion === question.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedQuestion === question.id && (
                    <div className="px-4 pb-4 border-t dark:border-gray-700">
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opções de Resposta:</p>
                        <div className="space-y-2">
                          {question.options.map((opt, idx) => (
                            <div 
                              key={opt.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                opt.isRed 
                                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                                  : 'bg-gray-50 dark:bg-gray-700/50'
                              }`}
                            >
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {idx + 1}. {opt.text}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Valor: {opt.value}</span>
                                {opt.isRed && (
                                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Alerta
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {question.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
                        <span>Peso: {question.weight}</span>
                        <span>Perspectiva: {question.targetPerspective}</span>
                        <span>Criada: {new Date(question.createdAt).toLocaleDateString('pt-BR')}</span>
                        {question.aiModel && <span>Modelo: {question.aiModel}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Pagination Info */}
          {filteredQuestions.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Mostrando {filteredQuestions.length} de {questions.length} perguntas
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
