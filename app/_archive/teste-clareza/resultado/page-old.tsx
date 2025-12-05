'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Target, ArrowRight, BookOpen, MessageCircle, Shield, PenLine,
  AlertTriangle, ChevronDown, ChevronUp, HelpCircle, Home, 
  LayoutDashboard, AlertCircle, Brain, Scale, Heart, ShieldAlert, 
  Users, Sparkles, Eye, Clock, Lock, Moon, Sun
} from 'lucide-react'
import { 
  calculateClarityResult, 
  getZoneDescription, 
  getAxisLevelDescription,
  ClarityResultSummary,
  ProblemScore 
} from '@/lib/clarity-test-utils'
import { PROBLEMS, getToolsByProblem, ProblemTag, ToolConfig } from '@/lib/tools-config'

// =============================================================================
// RESULTADO DO TESTE DE CLAREZA - UNIFICADO
// Combina o melhor do teste-claridade/resultado com design adaptável
// Integração completa com diário, TOOLS config e estatísticas reais
// =============================================================================

// Mapeamento de ícones para problemas
const PROBLEM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  invalidacao: AlertCircle,
  gaslighting: Brain,
  criminalizacao: Scale,
  manipulacao: Heart,
  ameacas: ShieldAlert,
  isolamento: Users,
  autoestima_baixa: Sparkles,
}

// Mapeamento de ícones para ferramentas
const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, BookOpen, PenLine, MessageCircle, Shield, Eye, Clock, Lock, Sparkles,
  Brain, Heart, AlertCircle, ShieldAlert, Users, Scale,
}

function getToolIcon(iconName: string) {
  return TOOL_ICONS[iconName] || Target
}

// Interface para dados do diário
interface DiaryStats {
  totalEntries: number
  recentEntries: number
  topTags: { tag: string; count: number }[]
  avgImpact: number
  lastEntryDate: string | null
}

function ResultadoContent() {
  const [result, setResult] = useState<ClarityResultSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)
  const [testDate, setTestDate] = useState<string>('')
  const [diaryStats, setDiaryStats] = useState<DiaryStats | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadTestResult()
    // Carregar preferência de tema do localStorage
    const savedTheme = localStorage.getItem('test-theme')
    if (savedTheme === 'dark') setIsDarkMode(true)
  }, [])

  // Toggle de tema
  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('test-theme', newMode ? 'dark' : 'light')
  }

  const loadTestResult = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Buscar o teste mais recente do usuário (clareza ou claridade)
      const { data: tests, error } = await supabase
        .from('clarity_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error
      if (!tests || tests.length === 0) {
        router.push('/teste-clareza')
        return
      }

      const test = tests[0]
      setTestDate(new Date(test.created_at).toLocaleDateString('pt-BR'))

      // Calcular resultado usando as respostas salvas
      if (test.raw_answers) {
        const calculatedResult = calculateClarityResult(test.raw_answers)
        setResult(calculatedResult)
      } else {
        // Fallback: criar resultado a partir dos scores salvos
        setResult({
          overallScore: (test.fog_score || 0) + (test.fear_score || 0) + (test.limits_score || 0),
          maxOverallScore: 48,
          overallPercentage: ((test.fog_score || 0) + (test.fear_score || 0) + (test.limits_score || 0)) / 48,
          globalZone: (test.global_zone?.toLowerCase() || 'atencao') as 'atencao' | 'alerta' | 'vermelha',
          problemScores: [],
          axisScores: [
            { axis: 'nevoa', label: 'Névoa Mental', totalScore: test.fog_score || 0, maxScore: 16, percentage: (test.fog_score || 0) / 16, level: getLevel(test.fog_score || 0) },
            { axis: 'medo', label: 'Medo e Tensão', totalScore: test.fear_score || 0, maxScore: 16, percentage: (test.fear_score || 0) / 16, level: getLevel(test.fear_score || 0) },
            { axis: 'limites', label: 'Desrespeito a Limites', totalScore: test.limits_score || 0, maxScore: 16, percentage: (test.limits_score || 0) / 16, level: getLevel(test.limits_score || 0) },
          ],
          highlightedProblems: [],
        })
      }
      // Carregar estatísticas do diário
      await loadDiaryStats(user.id)
      
    } catch (error) {
      console.error('Erro ao carregar resultado:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas do diário
  const loadDiaryStats = async (userId: string) => {
    try {
      // Buscar entradas do diário dos últimos 30 dias
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('id, tags, impact_score, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!entries || entries.length === 0) {
        setDiaryStats(null)
        return
      }

      // Calcular estatísticas
      const recentEntries = entries.filter(e => new Date(e.created_at) > thirtyDaysAgo)
      
      // Contar tags
      const tagCounts: Record<string, number> = {}
      entries.forEach(entry => {
        (entry.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }))

      // Calcular impacto médio
      const avgImpact = entries.length > 0
        ? entries.reduce((sum, e) => sum + (e.impact_score || 0), 0) / entries.length
        : 0

      setDiaryStats({
        totalEntries: entries.length,
        recentEntries: recentEntries.length,
        topTags,
        avgImpact: Math.round(avgImpact * 10) / 10,
        lastEntryDate: entries[0]?.created_at || null
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas do diário:', error)
    }
  }

  const getLevel = (score: number): 'baixo' | 'moderado' | 'alto' => {
    if (score <= 5) return 'baixo'
    if (score <= 10) return 'moderado'
    return 'alto'
  }

  const getLevelColor = (level: string) => {
    if (isDarkMode) {
      switch (level) {
        case 'baixo': return 'bg-green-900/50 text-green-400'
        case 'moderado': return 'bg-yellow-900/50 text-yellow-400'
        case 'alto': return 'bg-red-900/50 text-red-400'
        default: return 'bg-gray-800 text-gray-400'
      }
    }
    switch (level) {
      case 'baixo': return 'bg-green-100 text-green-800'
      case 'moderado': return 'bg-yellow-100 text-yellow-800'
      case 'alto': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAxisColor = (axis: string) => {
    switch (axis) {
      case 'nevoa': return 'from-purple-500 to-purple-600'
      case 'medo': return 'from-blue-500 to-blue-600'
      case 'limites': return 'from-rose-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Classes dinâmicas baseadas no tema
  const bgMain = isDarkMode ? 'bg-[#020617]' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'
  const bgHeader = isDarkMode ? 'bg-[#0F172A]/95' : 'bg-white/80'
  const borderHeader = isDarkMode ? 'border-slate-800' : 'border-gray-100'
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600'
  const cardBg = isDarkMode ? 'bg-slate-900' : 'bg-white'
  const cardBorder = isDarkMode ? 'border-slate-800' : 'border-gray-100'

  // Loading
  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 ${isDarkMode ? 'bg-violet-900/50' : 'bg-purple-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Target className={`w-8 h-8 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'} animate-pulse`} />
          </div>
          <p className={textSecondary}>Carregando seu resultado...</p>
        </div>
      </div>
    )
  }

  // Sem resultado
  if (!result) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <div className={`w-16 h-16 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Resultado não encontrado</h2>
          <p className={`${textSecondary} mb-6`}>Parece que você ainda não fez o teste.</p>
          <Link
            href="/teste-clareza"
            className={`inline-flex items-center gap-2 px-6 py-3 ${isDarkMode ? 'bg-violet-600 hover:bg-violet-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-xl font-semibold transition-colors`}
          >
            <Target className="w-5 h-5" />
            Fazer Teste de Clareza
          </Link>
        </div>
      </div>
    )
  }

  const zoneInfo = getZoneDescription(result.globalZone)

  return (
    <div className={`min-h-screen ${bgMain}`}>
      {/* Header */}
      <header className={`${bgHeader} backdrop-blur-md border-b ${borderHeader}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-2 ${textSecondary} hover:${isDarkMode ? 'text-white' : 'text-purple-600'} transition-colors`}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Target className={isDarkMode ? 'w-5 h-5 text-violet-400' : 'w-5 h-5 text-purple-600'} />
            <span className={`font-semibold ${textPrimary}`}>Resultado do Teste</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${textSecondary}`}>{testDate}</span>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-2`}>
            Seu Mapa de Clareza
          </h1>
          <p className={textSecondary}>
            Resultado do Teste de Clareza realizado em {testDate}
          </p>
        </div>

        {/* Card de Resultado Global */}
        <div className={`mb-8 p-6 sm:p-8 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-900/50' : ''} ${zoneInfo.bgColor} ${zoneInfo.borderColor}`}>
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${zoneInfo.bgColor} ${zoneInfo.color} font-semibold mb-4`}>
              {result.globalZone === 'atencao' && <AlertCircle className="w-5 h-5" />}
              {result.globalZone === 'alerta' && <AlertTriangle className="w-5 h-5" />}
              {result.globalZone === 'vermelha' && <ShieldAlert className="w-5 h-5" />}
              {zoneInfo.title}
            </div>
            <p className={`text-lg leading-relaxed ${zoneInfo.color}`}>
              {zoneInfo.description}
            </p>
            <div className={`mt-4 text-sm ${textSecondary}`}>
              Pontuação: {result.overallScore}/{result.maxOverallScore} ({Math.round(result.overallPercentage * 100)}%)
            </div>
          </div>
        </div>

        {/* Cards por Eixo */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {result.axisScores.map((axis) => (
            <div key={axis.axis} className={`${cardBg} rounded-2xl shadow-lg border ${cardBorder} overflow-hidden`}>
              <div className={`h-2 bg-gradient-to-r ${getAxisColor(axis.axis)}`} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${textPrimary}`}>{axis.label}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(axis.level)}`}>
                    {axis.level.toUpperCase()}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-2xl font-bold ${textPrimary}`}>{axis.totalScore}</span>
                    <span className={textSecondary}>/{axis.maxScore}</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full h-2`}>
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getAxisColor(axis.axis)}`}
                      style={{ width: `${axis.percentage * 100}%` }}
                    />
                  </div>
                </div>
                <p className={`text-sm ${textSecondary} leading-relaxed`}>
                  {getAxisLevelDescription(axis.axis, axis.level)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Problemas em Destaque - Conectado ao TOOLS */}
        {result.highlightedProblems.length > 0 && (
          <div className={`${cardBg} rounded-3xl shadow-lg border ${cardBorder} p-6 sm:p-8 mb-8`}>
            <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>
              Onde isso pega mais forte
            </h2>
            <p className={`${textSecondary} mb-6`}>
              Baseado nas suas respostas, estes são os padrões mais presentes:
            </p>
            
            <div className="space-y-4">
              {result.highlightedProblems.slice(0, 3).map((problemTag) => {
                const problemConfig = PROBLEMS.find(p => p.id === problemTag)
                const problemScore = result.problemScores.find(ps => ps.problem === problemTag)
                const tools = getToolsByProblem(problemTag).slice(0, 3)
                const IconComponent = PROBLEM_ICONS[problemTag] || AlertCircle
                
                if (!problemConfig) return null
                
                return (
                  <div 
                    key={problemTag}
                    className={`p-5 rounded-2xl border ${problemConfig.bgColor} ${problemConfig.borderColor}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white/80'} ${problemConfig.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${problemConfig.color}`}>
                            {problemConfig.label}
                          </h3>
                          {problemScore && (
                            <span className={`text-sm font-medium ${problemConfig.color}`}>
                              {Math.round(problemScore.percentage * 100)}%
                            </span>
                          )}
                        </div>
                        
                        {/* Barra de progresso */}
                        {problemScore && (
                          <div className={`w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white/50'} rounded-full h-2 mb-4`}>
                            <div 
                              className={`h-2 rounded-full ${problemConfig.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`}
                              style={{ width: `${problemScore.percentage * 100}%` }}
                            />
                          </div>
                        )}
                        
                        {/* Ferramentas recomendadas */}
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/hub/${problemTag}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${problemConfig.bgColor} ${problemConfig.color} hover:opacity-80 transition-opacity`}
                          >
                            Ver Hub
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          {tools.slice(0, 2).map((tool) => {
                            const ToolIcon = getToolIcon(tool.icon)
                            return (
                              <Link
                                key={tool.id}
                                href={tool.href}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
                              >
                                <ToolIcon className="w-4 h-4" />
                                {tool.shortLabel || tool.name}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dados do Diário - Integração */}
        {diaryStats && diaryStats.totalEntries > 0 && (
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-indigo-950 to-purple-950' : 'bg-gradient-to-r from-indigo-50 to-purple-50'} rounded-3xl shadow-lg border ${isDarkMode ? 'border-indigo-900' : 'border-indigo-100'} p-6 sm:p-8 mb-8`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} rounded-xl`}>
                <PenLine className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>
                  Seus Registros do Diário
                </h2>
                <p className={`text-sm ${textSecondary}`}>
                  Dados que complementam seu teste de clareza
                </p>
              </div>
            </div>

            {/* Stats do diário */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{diaryStats.totalEntries}</p>
                <p className={`text-xs ${textSecondary}`}>Episódios registrados</p>
              </div>
              <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{diaryStats.recentEntries}</p>
                <p className={`text-xs ${textSecondary}`}>Últimos 30 dias</p>
              </div>
              <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>{diaryStats.avgImpact}/5</p>
                <p className={`text-xs ${textSecondary}`}>Impacto médio</p>
              </div>
              <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{diaryStats.topTags.length}</p>
                <p className={`text-xs ${textSecondary}`}>Padrões detectados</p>
              </div>
            </div>

            {/* Tags mais frequentes */}
            {diaryStats.topTags.length > 0 && (
              <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                <h3 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <Eye className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  Padrões mais frequentes no seu diário
                </h3>
                <div className="flex flex-wrap gap-2">
                  {diaryStats.topTags.map(({ tag, count }) => (
                    <span 
                      key={tag}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'} rounded-full text-sm font-medium`}
                    >
                      {tag}
                      <span className={`${isDarkMode ? 'bg-purple-800' : 'bg-purple-200'} px-1.5 py-0.5 rounded-full text-xs`}>{count}x</span>
                    </span>
                  ))}
                </div>
                <Link 
                  href="/diario/timeline"
                  className={`inline-flex items-center gap-2 mt-4 text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} font-medium`}
                >
                  Ver timeline completa
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Insight baseado nos dados */}
            {diaryStats.avgImpact >= 3 && (
              <div className={`mt-4 p-4 ${isDarkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-xl`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-800'} font-medium`}>
                      Seus registros mostram episódios de alto impacto
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} mt-1`}>
                      A média de impacto dos seus episódios é {diaryStats.avgImpact}/5. 
                      Isso pode indicar uma situação que merece atenção especial.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA para criar diário se não tiver */}
        {(!diaryStats || diaryStats.totalEntries === 0) && (
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-950 to-indigo-950 border-blue-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'} rounded-3xl shadow-lg border p-6 sm:p-8 mb-8`}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className={`p-4 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-2xl`}>
                <PenLine className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className={`font-bold ${textPrimary} text-lg`}>
                  Comece a registrar seus episódios
                </h3>
                <p className={`${textSecondary} text-sm mt-1`}>
                  O diário ajuda a identificar padrões e complementa seu teste de clareza
                </p>
              </div>
              <Link
                href="/diario/novo"
                className={`inline-flex items-center gap-2 px-6 py-3 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-semibold transition-colors`}
              >
                <PenLine className="w-5 h-5" />
                Criar primeiro registro
              </Link>
            </div>
          </div>
        )}

        {/* Próximos Passos */}
        <div className={`${cardBg} rounded-3xl shadow-lg border ${cardBorder} p-6 sm:p-8 mb-8`}>
          <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>
            Próximos Passos Recomendados
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/diario/novo"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isDarkMode ? 'border-blue-900 bg-blue-950/50 hover:border-blue-700' : 'border-blue-100 bg-blue-50 hover:border-blue-300'} transition-colors group`}
            >
              <div className={`p-3 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl shadow-sm`}>
                <PenLine className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${textPrimary} group-hover:${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  Registrar um Episódio
                </h3>
                <p className={`text-sm ${textSecondary}`}>
                  Documente situações para identificar padrões
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-400'} ml-auto`} />
            </Link>
            
            <Link
              href="/chat"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isDarkMode ? 'border-emerald-900 bg-emerald-950/50 hover:border-emerald-700' : 'border-emerald-100 bg-emerald-50 hover:border-emerald-300'} transition-colors group`}
            >
              <div className={`p-3 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl shadow-sm`}>
                <MessageCircle className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${textPrimary} group-hover:${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Conversar com Coach IA
                </h3>
                <p className={`text-sm ${textSecondary}`}>
                  Apoio 24/7 para organizar pensamentos
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-400'} ml-auto`} />
            </Link>
            
            {result.globalZone === 'vermelha' && (
              <Link
                href="/plano-seguranca"
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isDarkMode ? 'border-red-900 bg-red-950/50 hover:border-red-700' : 'border-red-100 bg-red-50 hover:border-red-300'} transition-colors group sm:col-span-2`}
              >
                <div className={`p-3 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl shadow-sm`}>
                  <Shield className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${textPrimary} group-hover:${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                    Criar Plano de Segurança
                  </h3>
                  <p className={`text-sm ${textSecondary}`}>
                    Importante: organize sua proteção e próximos passos
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-red-500' : 'text-red-400'} ml-auto`} />
              </Link>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`flex items-start gap-3 p-4 ${isDarkMode ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-2xl mb-8`}>
          <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-800'} leading-relaxed`}>
            <strong>Lembrete:</strong> Este teste é uma ferramenta de autoconhecimento, 
            NÃO um diagnóstico clínico. Ele ajuda a identificar padrões, mas não substitui 
            avaliação de profissional de saúde mental.
          </p>
        </div>

        {/* O que é este teste? */}
        <div className={`${cardBg} rounded-2xl shadow-lg border ${cardBorder} overflow-hidden mb-8`}>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`w-full px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-violet-900/30 hover:bg-violet-900/50' : 'bg-purple-50 hover:bg-purple-100'} transition-colors`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
              <span className={`font-semibold ${textPrimary}`}>O que é este teste?</span>
            </div>
            {showExplanation ? (
              <ChevronUp className={`w-5 h-5 ${textSecondary}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${textSecondary}`} />
            )}
          </button>
          
          {showExplanation && (
            <div className={`px-6 py-5 space-y-4 ${textSecondary}`}>
              <p>
                O <strong className={textPrimary}>Teste de Clareza</strong> é uma ferramenta de autoconhecimento que ajuda você a 
                identificar padrões em suas relações. Ele mede três eixos principais:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className={textPrimary}>Névoa Mental (Gaslighting/Confusão)</strong>
                    <p className={`text-sm ${textSecondary}`}>Avalia o quanto você sente confusão sobre sua própria percepção da realidade.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className={textPrimary}>Medo e Tensão Constante</strong>
                    <p className={`text-sm ${textSecondary}`}>Mede o nível de medo ou ansiedade que você sente em relação à outra pessoa.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className={textPrimary}>Desrespeito a Limites</strong>
                    <p className={`text-sm ${textSecondary}`}>Avalia o quanto seus limites pessoais são respeitados na relação.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-2 p-4 ${cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${cardBorder}`}
          >
            <LayoutDashboard className={`w-7 h-7 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
            <span className={`text-sm font-medium ${textSecondary}`}>Dashboard</span>
          </Link>
          
          <Link
            href="/diario"
            className={`flex flex-col items-center gap-2 p-4 ${cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${cardBorder}`}
          >
            <BookOpen className={`w-7 h-7 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium ${textSecondary}`}>Diário</span>
          </Link>
          
          <Link
            href="/chat"
            className={`flex flex-col items-center gap-2 p-4 ${cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${cardBorder}`}
          >
            <MessageCircle className={`w-7 h-7 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-sm font-medium ${textSecondary}`}>Coach IA</span>
          </Link>
          
          <Link
            href="/teste-clareza"
            className={`flex flex-col items-center gap-2 p-4 ${cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${cardBorder}`}
          >
            <Target className={`w-7 h-7 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
            <span className={`text-sm font-medium ${textSecondary}`}>Refazer Teste</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ResultadoContent />
    </Suspense>
  )
}
