'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Target, ArrowRight, BookOpen, MessageCircle, Shield, PenLine,
  AlertTriangle, ChevronDown, ChevronUp, HelpCircle, Home, 
  LayoutDashboard, AlertCircle, Brain, Lock, Heart, ShieldAlert, 
  Users, Moon, Sun, RefreshCw, Phone
} from 'lucide-react'

import {
  calculateUnifiedResult,
  getZoneConfig,
  getAxisConfig,
  getCategoryConfig,
  getAxisLevelDescription,
  CATEGORIES_CONFIG,
  type UnifiedResult,
  type GlobalZone,
} from '@/lib/clarity-unified-config'
import { PROBLEMS, getToolsByProblem } from '@/lib/tools-config'

// Componentes de cadeia de custódia
import TermsConsentBadge from '@/components/TermsConsentBadge'
import ClarityResultPDF from '@/components/ClarityResultPDF'
import ResultExplanation from '@/components/ResultExplanation'

// =============================================================================
// RESULTADO DO TESTE DE CLAREZA - UNIFICADO
// PLANO D: Combina o melhor de todos os sistemas anteriores
// + Cadeia de Custódia: Badge de termo + Exportação PDF
// =============================================================================

// Mapeamento de ícones para categorias
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  invalidacao: AlertCircle,
  gaslighting: Brain,
  controle: Lock,
  isolamento: Users,
  emocional: Heart,
  fisico: ShieldAlert,
}

export default function ResultadoUnificado() {
  const [result, setResult] = useState<UnifiedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)
  const [testDate, setTestDate] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [diaryStats, setDiaryStats] = useState<any>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadResult()
    // Carregar preferência de tema
    const savedTheme = localStorage.getItem('radar-theme')
    if (savedTheme === 'light') setIsDarkMode(false)
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('radar-theme', newMode ? 'dark' : 'light')
  }

  const loadResult = async () => {
    try {
      // Primeiro, tentar carregar do localStorage (resultado recém-calculado)
      const savedResult = localStorage.getItem('radar-test-result')
      if (savedResult) {
        const parsed = JSON.parse(savedResult)
        setResult(parsed.result)
        setTestDate(new Date(parsed.completedAt).toLocaleDateString('pt-BR'))
        
        // Carregar estatísticas do diário se usuário logado
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await loadDiaryStats(user.id)
        }
        
        setLoading(false)
        return
      }

      // Se não tiver no localStorage, buscar do banco
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/teste-clareza')
        return
      }

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

      // Recalcular resultado se tiver raw_answers
      if (test.raw_answers) {
        const calculatedResult = calculateUnifiedResult(test.raw_answers)
        setResult(calculatedResult)
      }

      await loadDiaryStats(user.id)
    } catch (error) {
      console.error('Erro ao carregar resultado:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDiaryStats = async (userId: string) => {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('id, tags, impact_score, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error || !entries || entries.length === 0) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
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

      const avgImpact = entries.reduce((sum, e) => sum + (e.impact_score || 0), 0) / entries.length

      setDiaryStats({
        totalEntries: entries.length,
        recentEntries: recentEntries.length,
        topTags,
        avgImpact: Math.round(avgImpact * 10) / 10,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // Classes de tema - SEMPRE ESCURO para melhor legibilidade
  // Fundo escuro com letras claras que sobressaem
  const theme = {
    bgMain: 'bg-[#020617]', // Fundo principal escuro
    bgHeader: 'bg-[#0F172A]/95',
    borderHeader: 'border-slate-800',
    textPrimary: 'text-white', // Letras brancas
    textSecondary: 'text-gray-300', // Letras cinza claro
    cardBg: 'bg-slate-900/80', // Cards com fundo escuro
    cardBorder: 'border-slate-700',
    accentText: 'text-violet-400',
    accentBg: 'bg-violet-600',
  }

  const getLevelColor = (level: string) => {
    // Sempre cores escuras com texto claro
    switch (level) {
      case 'baixo': return 'bg-green-900/50 text-green-400'
      case 'moderado': return 'bg-yellow-900/50 text-yellow-400'
      case 'alto': return 'bg-red-900/50 text-red-400'
      default: return 'bg-gray-800 text-gray-400'
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

  // Loading
  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 bg-violet-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Target className={`w-8 h-8 ${theme.accentText} animate-pulse`} />
          </div>
          <p className={theme.textSecondary}>Carregando seu resultado...</p>
        </div>
      </div>
    )
  }

  // Sem resultado
  if (!result) {
    return (
      <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <div className={`w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-8 h-8 text-gray-400`} />
          </div>
          <h2 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Resultado não encontrado</h2>
          <p className={`${theme.textSecondary} mb-6`}>Parece que você ainda não fez o teste.</p>
          <Link
            href="/teste-clareza"
            className={`inline-flex items-center gap-2 px-6 py-3 ${theme.accentBg} text-white rounded-xl font-semibold transition-colors hover:opacity-90`}
          >
            <Target className="w-5 h-5" />
            Fazer Teste de Clareza
          </Link>
        </div>
      </div>
    )
  }

  const zoneConfig = getZoneConfig(result.globalZone)

  return (
    <div className={`min-h-screen ${theme.bgMain}`}>
      {/* Header */}
      <header className={`${theme.bgHeader} backdrop-blur-md border-b ${theme.borderHeader}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-2 ${theme.textSecondary} hover:opacity-80 transition-colors`}
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Target className={`w-5 h-5 ${theme.accentText}`} />
            <span className={`font-semibold ${theme.textPrimary}`}>Resultado</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme.textSecondary}`}>{testDate}</span>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg bg-slate-800 text-yellow-400 hover:opacity-80 transition-all`}
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold ${theme.textPrimary} mb-2`}>
            Seu Mapa de Clareza
          </h1>
          <p className={theme.textSecondary}>
            Resultado do Teste de Clareza • {testDate}
          </p>
        </div>

        {/* Alerta de Risco Físico */}
        {result.hasPhysicalRisk && (
          <div className={`mb-6 p-5 rounded-2xl bg-red-900/40 border-red-700 border-2`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-red-800`}>
                <ShieldAlert className={`w-6 h-6 text-red-400`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-red-300 mb-2`}>
                  ⚠️ Alerta de Segurança
                </h3>
                <p className={`text-sm text-red-400 mb-3`}>
                  Suas respostas indicam possível risco físico. Sua segurança é prioridade.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="tel:190" className={`inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-red-200 rounded-lg font-medium text-sm`}>
                    <Phone className="w-4 h-4" /> 190 - Polícia
                  </a>
                  <a href="tel:180" className={`inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-red-200 rounded-lg font-medium text-sm`}>
                    <Phone className="w-4 h-4" /> 180 - Mulher
                  </a>
                  <Link href="/plano-seguranca" className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium text-sm`}>
                    <Shield className="w-4 h-4" /> Plano de Segurança
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card de Resultado Global */}
        <div className={`mb-8 p-6 sm:p-8 rounded-3xl border-2 bg-slate-900/50 ${zoneConfig.bgColor} ${zoneConfig.borderColor}`}>
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${zoneConfig.bgColor} ${zoneConfig.color} font-semibold mb-4`}>
              {result.globalZone === 'atencao' && <AlertCircle className="w-5 h-5" />}
              {result.globalZone === 'alerta' && <AlertTriangle className="w-5 h-5" />}
              {result.globalZone === 'vermelha' && <ShieldAlert className="w-5 h-5" />}
              {zoneConfig.title}
            </div>
            <p className={`text-lg leading-relaxed ${zoneConfig.color} max-w-2xl mx-auto`}>
              {zoneConfig.description}
            </p>
            <div className={`mt-4 text-sm ${theme.textSecondary}`}>
              Pontuação: {result.overallScore}/{result.maxOverallScore} ({Math.round(result.overallPercentage * 100)}%)
            </div>
          </div>
        </div>

        {/* Explicação Didática do Resultado */}
        <ResultExplanation result={result} isDarkMode={isDarkMode} />

        {/* Cards por Eixo */}
        <h2 className={`text-xl font-bold ${theme.textPrimary} mb-4`}>Análise por Eixo</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {result.axisScores.map((axis) => {
            const axisConfig = getAxisConfig(axis.axis)
            return (
              <div key={axis.axis} className={`${theme.cardBg} rounded-2xl shadow-lg border ${theme.cardBorder} overflow-hidden`}>
                <div className={`h-2 bg-gradient-to-r ${getAxisColor(axis.axis)}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${theme.textPrimary}`}>{axis.label}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(axis.level)}`}>
                      {axis.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className={`text-2xl font-bold ${theme.textPrimary}`}>{Math.round(axis.percentage * 100)}</span>
                      <span className={theme.textSecondary}>%</span>
                    </div>
                    <div className={`w-full bg-slate-800 rounded-full h-2`}>
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getAxisColor(axis.axis)}`}
                        style={{ width: `${axis.percentage * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                    {getAxisLevelDescription(axis.axis, axis.level)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detalhamento por Categoria */}
        <h2 className={`text-xl font-bold ${theme.textPrimary} mb-4`}>Detalhamento por Categoria</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {result.categoryScores.map((cat) => {
            const catConfig = getCategoryConfig(cat.category)
            const IconComponent = CATEGORY_ICONS[cat.category] || AlertCircle
            const isHighlighted = cat.percentage >= 0.4
            
            return (
              <div 
                key={cat.category} 
                className={`${theme.cardBg} rounded-xl border ${isHighlighted ? 'border-amber-700' : theme.cardBorder} p-4`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-slate-800`}>
                    <IconComponent className={`w-5 h-5 ${catConfig.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme.textPrimary} text-sm`}>{cat.label}</h3>
                    <span className={`text-xs ${theme.textSecondary}`}>{cat.questionCount} perguntas</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 bg-slate-800 rounded-full h-2`}>
                    <div 
                      className={`h-2 rounded-full ${
                        cat.percentage >= 0.66 ? 'bg-red-500' : 
                        cat.percentage >= 0.33 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${cat.percentage * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${theme.textPrimary}`}>
                    {Math.round(cat.percentage * 100)}%
                  </span>
                </div>
                {isHighlighted && (
                  <p className={`mt-2 text-xs text-amber-400`}>
                    ⚠️ Merece atenção
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Problemas em Destaque */}
        {result.highlightedProblems.length > 0 && (
          <div className={`${theme.cardBg} rounded-3xl shadow-lg border ${theme.cardBorder} p-6 sm:p-8 mb-8`}>
            <h2 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>
              Onde isso pega mais forte
            </h2>
            <p className={`${theme.textSecondary} mb-6`}>
              Baseado nas suas respostas, estes são os padrões mais presentes:
            </p>
            
            <div className="space-y-4">
              {result.highlightedProblems.slice(0, 4).map((problemTag) => {
                const problemConfig = PROBLEMS.find(p => p.id === problemTag)
                const problemScore = result.problemScores.find(ps => ps.problem === problemTag)
                const tools = getToolsByProblem(problemTag).slice(0, 2)
                
                if (!problemConfig) return null
                
                return (
                  <div 
                    key={problemTag}
                    className={`p-4 rounded-xl border ${problemConfig.bgColor} ${problemConfig.borderColor}`}
                  >
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
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/hub/${problemTag}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${problemConfig.bgColor} ${problemConfig.color} hover:opacity-80 transition-opacity`}
                      >
                        Ver Hub
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      {tools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-gray-300 hover:bg-slate-700 transition-colors`}
                        >
                          {tool.shortLabel || tool.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dados do Diário */}
        {diaryStats && diaryStats.totalEntries > 0 && (
          <div className={`bg-gradient-to-r from-indigo-950 to-purple-950 border-indigo-900 rounded-3xl shadow-lg border p-6 sm:p-8 mb-8`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 bg-indigo-900 rounded-xl`}>
                <PenLine className={`w-6 h-6 text-indigo-400`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme.textPrimary}`}>
                  Seus Registros do Diário
                </h2>
                <p className={`text-sm ${theme.textSecondary}`}>
                  Dados que complementam seu teste
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className={`bg-slate-900 rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold text-indigo-400`}>{diaryStats.totalEntries}</p>
                <p className={`text-xs ${theme.textSecondary}`}>Episódios</p>
              </div>
              <div className={`bg-slate-900 rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold text-purple-400`}>{diaryStats.recentEntries}</p>
                <p className={`text-xs ${theme.textSecondary}`}>Últimos 30 dias</p>
              </div>
              <div className={`bg-slate-900 rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold text-rose-400`}>{diaryStats.avgImpact}/5</p>
                <p className={`text-xs ${theme.textSecondary}`}>Impacto médio</p>
              </div>
              <div className={`bg-slate-900 rounded-xl p-4 text-center shadow-sm`}>
                <p className={`text-2xl font-bold text-blue-400`}>{diaryStats.topTags.length}</p>
                <p className={`text-xs ${theme.textSecondary}`}>Padrões</p>
              </div>
            </div>

            {diaryStats.topTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {diaryStats.topTags.map(({ tag, count }: { tag: string; count: number }) => (
                  <span 
                    key={tag}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 bg-purple-900/50 text-purple-300 rounded-full text-sm font-medium`}
                  >
                    {tag}
                    <span className={`bg-purple-800 px-1.5 py-0.5 rounded-full text-xs`}>{count}x</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA para criar diário */}
        {(!diaryStats || diaryStats.totalEntries === 0) && (
          <div className={`bg-gradient-to-r from-blue-950 to-indigo-950 border-blue-900 rounded-3xl shadow-lg border p-6 sm:p-8 mb-8`}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className={`p-4 bg-blue-900 rounded-2xl`}>
                <PenLine className={`w-8 h-8 text-blue-400`} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className={`font-bold ${theme.textPrimary} text-lg`}>
                  Comece a registrar seus episódios
                </h3>
                <p className={`${theme.textSecondary} text-sm mt-1`}>
                  O diário ajuda a identificar padrões e complementa seu teste
                </p>
              </div>
              <Link
                href="/diario/novo"
                className={`inline-flex items-center gap-2 px-6 py-3 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-semibold transition-colors`}
              >
                <PenLine className="w-5 h-5" />
                Criar registro
              </Link>
            </div>
          </div>
        )}

        {/* Próximos Passos */}
        <div className={`${theme.cardBg} rounded-3xl shadow-lg border ${theme.cardBorder} p-6 sm:p-8 mb-8`}>
          <h2 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>
            Próximos Passos Recomendados
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/diario/novo"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-900 bg-blue-950/50 hover:border-blue-700 transition-colors group`}
            >
              <div className={`p-3 bg-slate-900 rounded-xl shadow-sm`}>
                <PenLine className={`w-6 h-6 text-blue-400`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${theme.textPrimary}`}>Registrar Episódio</h3>
                <p className={`text-sm ${theme.textSecondary}`}>Documente situações</p>
              </div>
              <ArrowRight className={`w-5 h-5 text-blue-400`} />
            </Link>
            
            <Link
              href="/chat"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-900 bg-emerald-950/50 hover:border-emerald-700 transition-colors group`}
            >
              <div className={`p-3 bg-slate-900 rounded-xl shadow-sm`}>
                <MessageCircle className={`w-6 h-6 text-emerald-400`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${theme.textPrimary}`}>Coach IA</h3>
                <p className={`text-sm ${theme.textSecondary}`}>Apoio 24/7</p>
              </div>
              <ArrowRight className={`w-5 h-5 text-emerald-400`} />
            </Link>
            
            {result.globalZone === 'vermelha' && (
              <Link
                href="/plano-seguranca"
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-red-900 bg-red-950/50 hover:border-red-700 transition-colors group sm:col-span-2`}
              >
                <div className={`p-3 bg-slate-900 rounded-xl shadow-sm`}>
                  <Shield className={`w-6 h-6 text-red-400`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${theme.textPrimary}`}>Criar Plano de Segurança</h3>
                  <p className={`text-sm ${theme.textSecondary}`}>Importante: organize sua proteção</p>
                </div>
                <ArrowRight className={`w-5 h-5 text-red-400`} />
              </Link>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`flex items-start gap-3 p-4 bg-amber-900/30 border-amber-800 border rounded-2xl mb-8`}>
          <AlertTriangle className={`w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5`} />
          <p className={`text-sm text-amber-300 leading-relaxed`}>
            <strong>Lembrete:</strong> Este teste é uma ferramenta de autoconhecimento, 
            NÃO um diagnóstico clínico. Ele ajuda a identificar padrões, mas não substitui 
            avaliação de profissional de saúde mental.
          </p>
        </div>

        {/* O que é este teste? */}
        <div className={`${theme.cardBg} rounded-2xl shadow-lg border ${theme.cardBorder} overflow-hidden mb-8`}>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`w-full px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-violet-900/30 hover:bg-violet-900/50' : 'bg-purple-50 hover:bg-purple-100'} transition-colors`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className={`w-5 h-5 ${theme.accentText}`} />
              <span className={`font-semibold ${theme.textPrimary}`}>O que é este teste?</span>
            </div>
            {showExplanation ? (
              <ChevronUp className={`w-5 h-5 ${theme.textSecondary}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${theme.textSecondary}`} />
            )}
          </button>
          
          {showExplanation && (
            <div className={`px-6 py-5 space-y-4 ${theme.textSecondary}`}>
              <p>
                O <strong className={theme.textPrimary}>Teste de Clareza</strong> é uma ferramenta de autoconhecimento com 18 perguntas que ajuda você a identificar padrões em suas relações.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className={theme.textPrimary}>Névoa Mental</strong>
                    <p className={`text-sm ${theme.textSecondary}`}>Confusão sobre sua própria percepção da realidade (gaslighting).</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className={theme.textPrimary}>Medo e Tensão</strong>
                    <p className={`text-sm ${theme.textSecondary}`}>Nível de medo ou ansiedade em relação à outra pessoa.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className={theme.textPrimary}>Desrespeito a Limites</strong>
                    <p className={`text-sm ${theme.textSecondary}`}>O quanto seus limites pessoais são respeitados.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exportar PDF com Cadeia de Custódia */}
        {result && (
          <div className="mb-8">
            <ClarityResultPDF 
              result={result} 
              testDate={testDate} 
              isDarkMode={isDarkMode} 
            />
          </div>
        )}

        {/* Navegação */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-2 p-4 ${theme.cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${theme.cardBorder}`}
          >
            <LayoutDashboard className={`w-7 h-7 ${theme.accentText}`} />
            <span className={`text-sm font-medium ${theme.textSecondary}`}>Dashboard</span>
          </Link>
          
          <Link
            href="/teste-clareza"
            className={`flex flex-col items-center gap-2 p-4 ${theme.cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${theme.cardBorder}`}
          >
            <RefreshCw className={`w-7 h-7 ${theme.accentText}`} />
            <span className={`text-sm font-medium ${theme.textSecondary}`}>Refazer Teste</span>
          </Link>
          
          <Link
            href="/biblioteca"
            className={`flex flex-col items-center gap-2 p-4 ${theme.cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${theme.cardBorder}`}
          >
            <BookOpen className={`w-7 h-7 ${theme.accentText}`} />
            <span className={`text-sm font-medium ${theme.textSecondary}`}>Biblioteca</span>
          </Link>
          
          <Link
            href="/diario/timeline"
            className={`flex flex-col items-center gap-2 p-4 ${theme.cardBg} rounded-xl shadow-md hover:shadow-lg transition-shadow border ${theme.cardBorder}`}
          >
            <Target className={`w-7 h-7 ${theme.accentText}`} />
            <span className={`text-sm font-medium ${theme.textSecondary}`}>Timeline</span>
          </Link>
        </div>

        {/* Contatos de Emergência */}
        <div className={`p-4 rounded-xl bg-slate-800/50 mb-6`}>
          <p className={`text-sm ${theme.textSecondary} text-center mb-3`}>
            Se você está em perigo, ligue:
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="tel:190" className={`text-sm font-medium text-red-400`}>
              190 - Polícia
            </a>
            <a href="tel:180" className={`text-sm font-medium text-pink-400`}>
              180 - Mulher
            </a>
            <a href="tel:188" className={`text-sm font-medium text-yellow-400`}>
              188 - CVV
            </a>
          </div>
        </div>

        {/* Termo de Consentimento - Rodapé */}
        <div className="flex justify-center">
          <TermsConsentBadge />
        </div>
      </main>
    </div>
  )
}
