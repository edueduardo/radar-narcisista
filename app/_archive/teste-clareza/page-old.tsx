'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Target, 
  ArrowLeft,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarTag,
  RadarAlertBanner,
} from '@/components/ui/design-system'

// ============================================================================
// TESTE DE CLAREZA - RADAR NARCISISTA BR
// Questionário para mapear a situação do usuário (18 perguntas)
// ============================================================================

interface Question {
  id: string
  text: string
  category: 'invalidation' | 'gaslighting' | 'control' | 'isolation' | 'emotional' | 'physical'
  weight: number
}

const QUESTIONS: Question[] = [
  // Invalidação
  { id: 'inv1', text: 'Você sente que suas emoções são frequentemente minimizadas ou ignoradas?', category: 'invalidation', weight: 1 },
  { id: 'inv2', text: 'Quando você expressa desconforto, a outra pessoa diz que você está exagerando?', category: 'invalidation', weight: 1 },
  { id: 'inv3', text: 'Você se sente "louca(o)" ou "sensível demais" com frequência?', category: 'invalidation', weight: 1.5 },
  
  // Gaslighting
  { id: 'gas1', text: 'Você já duvidou da sua própria memória sobre eventos que aconteceram?', category: 'gaslighting', weight: 1.5 },
  { id: 'gas2', text: 'A pessoa nega ter dito ou feito coisas que você claramente lembra?', category: 'gaslighting', weight: 2 },
  { id: 'gas3', text: 'Você se pega pedindo desculpas por coisas que não fez?', category: 'gaslighting', weight: 1.5 },
  
  // Controle
  { id: 'con1', text: 'A pessoa quer saber onde você está e com quem o tempo todo?', category: 'control', weight: 1 },
  { id: 'con2', text: 'Você precisa pedir permissão para fazer coisas básicas?', category: 'control', weight: 1.5 },
  { id: 'con3', text: 'A pessoa controla o dinheiro ou suas decisões financeiras?', category: 'control', weight: 1.5 },
  
  // Isolamento
  { id: 'iso1', text: 'Você se afastou de amigos ou família por causa dessa pessoa?', category: 'isolation', weight: 1.5 },
  { id: 'iso2', text: 'A pessoa fala mal das pessoas próximas a você?', category: 'isolation', weight: 1 },
  { id: 'iso3', text: 'Você sente que não tem mais ninguém além dessa pessoa?', category: 'isolation', weight: 2 },
  
  // Abuso emocional
  { id: 'emo1', text: 'A pessoa usa o silêncio como punição?', category: 'emotional', weight: 1 },
  { id: 'emo2', text: 'Você tem medo de como a pessoa vai reagir às coisas?', category: 'emotional', weight: 1.5 },
  { id: 'emo3', text: 'A pessoa te humilha em público ou em particular?', category: 'emotional', weight: 1.5 },
  
  // Risco físico
  { id: 'phy1', text: 'A pessoa já quebrou objetos ou socou paredes durante discussões?', category: 'physical', weight: 2 },
  { id: 'phy2', text: 'Você já teve medo de ser agredida(o) fisicamente?', category: 'physical', weight: 2.5 },
  { id: 'phy3', text: 'A pessoa já te empurrou, segurou com força ou te agrediu?', category: 'physical', weight: 3 },
]

const CATEGORY_LABELS: Record<string, string> = {
  invalidation: 'Invalidação',
  gaslighting: 'Gaslighting',
  control: 'Controle',
  isolation: 'Isolamento',
  emotional: 'Abuso Emocional',
  physical: 'Risco Físico',
}

export default function TesteClarezaPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true) // Default dark
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      // Carregar preferência de tema
      const savedTheme = localStorage.getItem('test-theme')
      if (savedTheme === 'light') setIsDarkMode(false)
    }
    init()
  }, [supabase])

  // Salvar preferência de tema
  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('test-theme', newMode ? 'dark' : 'light')
  }

  const handleAnswer = async (value: number) => {
    const question = QUESTIONS[currentQuestion]
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Última pergunta - salvar e redirecionar
      await saveAndRedirect(newAnswers)
    }
  }

  // Salvar resultado e redirecionar para página de resultado
  const saveAndRedirect = async (finalAnswers: Record<string, number>) => {
    setIsSaving(true)
    try {
      const results = calculateResultsFromAnswers(finalAnswers)
      
      // Salvar no Supabase se usuário logado
      if (user) {
        await supabase
          .from('clarity_tests')
          .insert({
            user_id: user.id,
            test_type: 'clareza',
            raw_answers: finalAnswers,
            fog_score: results.axisScores.nevoa,
            fear_score: results.axisScores.medo,
            limits_score: results.axisScores.limites,
            global_zone: results.globalZone,
            created_at: new Date().toISOString(),
          })
      }
      
      // Salvar tema no localStorage
      localStorage.setItem('test-theme', isDarkMode ? 'dark' : 'light')
      
      // Redirecionar para página de resultado
      router.push('/teste-clareza/resultado')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      // Redirecionar mesmo com erro
      router.push('/teste-clareza/resultado')
    }
  }

  // Calcular resultados com mapeamento para 3 eixos
  const calculateResultsFromAnswers = (ans: Record<string, number>) => {
    // Mapear categorias para eixos
    const axisMapping: Record<string, string> = {
      invalidation: 'nevoa',
      gaslighting: 'nevoa',
      control: 'medo',
      emotional: 'medo',
      isolation: 'limites',
      physical: 'limites'
    }
    
    const axisScores: Record<string, number> = { nevoa: 0, medo: 0, limites: 0 }
    const axisCounts: Record<string, number> = { nevoa: 0, medo: 0, limites: 0 }
    
    QUESTIONS.forEach(q => {
      const axis = axisMapping[q.category]
      if (ans[q.id] !== undefined) {
        axisScores[axis] += ans[q.id] * q.weight
        axisCounts[axis] += 1
      }
    })
    
    // Normalizar para escala 0-16 (compatível com clarity-test-utils)
    Object.keys(axisScores).forEach(axis => {
      if (axisCounts[axis] > 0) {
        axisScores[axis] = Math.round((axisScores[axis] / (axisCounts[axis] * 10)) * 16)
      }
    })
    
    const totalScore = axisScores.nevoa + axisScores.medo + axisScores.limites
    const percentage = totalScore / 48
    
    let globalZone: 'atencao' | 'alerta' | 'vermelha' = 'atencao'
    if (percentage > 0.6) globalZone = 'vermelha'
    else if (percentage > 0.3) globalZone = 'alerta'
    
    return { axisScores, totalScore, percentage, globalZone }
  }

  const calculateResults = () => {
    const categoryScores: Record<string, { score: number; max: number; count: number }> = {}
    
    QUESTIONS.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { score: 0, max: 0, count: 0 }
      }
      categoryScores[q.category].max += 10 * q.weight
      categoryScores[q.category].count += 1
      
      if (answers[q.id] !== undefined) {
        categoryScores[q.category].score += answers[q.id] * q.weight
      }
    })
    
    const totalScore = Object.values(categoryScores).reduce((sum, c) => sum + c.score, 0)
    const maxScore = Object.values(categoryScores).reduce((sum, c) => sum + c.max, 0)
    const percentage = Math.round((totalScore / maxScore) * 100)
    
    return { categoryScores, totalScore, maxScore, percentage }
  }

  const getResultLevel = (percentage: number): { level: string; color: string; description: string } => {
    if (percentage < 20) {
      return {
        level: 'Baixo',
        color: 'green',
        description: 'Os indicadores são baixos, mas confie nos seus sentimentos. Se algo não parece certo, vale a pena investigar.'
      }
    }
    if (percentage < 40) {
      return {
        level: 'Moderado',
        color: 'yellow',
        description: 'Existem alguns sinais de alerta. Pode ser útil conversar com um profissional ou pessoa de confiança.'
      }
    }
    if (percentage < 60) {
      return {
        level: 'Significativo',
        color: 'orange',
        description: 'Os indicadores são significativos. Recomendamos fortemente buscar apoio profissional.'
      }
    }
    return {
      level: 'Alto',
      color: 'red',
      description: 'Os indicadores são altos. Por favor, considere buscar ajuda profissional e criar um plano de segurança.'
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setAnswers({})
  }

  // Classes dinâmicas baseadas no tema
  const bgMain = isDarkMode ? 'bg-[#020617]' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'
  const bgHeader = isDarkMode ? 'bg-[#0F172A]/95' : 'bg-white/80'
  const borderHeader = isDarkMode ? 'border-slate-800/50' : 'border-gray-100'
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600'
  const cardBg = isDarkMode ? 'bg-slate-800/50' : 'bg-white'
  const cardBorder = isDarkMode ? 'border-slate-700' : 'border-gray-200'

  if (loading || isSaving) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-2 ${isDarkMode ? 'border-violet-500' : 'border-purple-600'} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`${textSecondary} text-sm`}>
            {isSaving ? 'Salvando seu resultado...' : 'Carregando teste...'}
          </p>
        </div>
      </div>
    )
  }

  // Disclaimer inicial
  if (showDisclaimer) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4`}>
        <div className={`max-w-xl w-full ${cardBg} rounded-2xl shadow-xl border ${cardBorder} p-6 sm:p-8`}>
          {/* Toggle de tema */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${isDarkMode ? 'bg-violet-600/20' : 'bg-purple-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Target className={`w-8 h-8 ${isDarkMode ? 'text-violet-400' : 'text-purple-600'}`} />
            </div>
            <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Teste de Clareza</h1>
            <p className={textSecondary}>Um mapa para entender sua situação</p>
          </div>

          <RadarAlertBanner type="warning" title="Antes de começar">
            <ul className="text-sm space-y-2 mt-2">
              <li>• Este teste <strong>não é diagnóstico</strong> médico ou psicológico</li>
              <li>• Ele mapeia <strong>sua percepção</strong> da situação</li>
              <li>• Os resultados são um ponto de partida, não uma conclusão</li>
              <li>• Leva cerca de <strong>5-10 minutos</strong></li>
            </ul>
          </RadarAlertBanner>

          <div className="mt-6 space-y-3">
            <RadarButton onClick={() => setShowDisclaimer(false)} className="w-full">
              Entendi, começar teste
            </RadarButton>
            <Link href="/">
              <RadarButton variant="ghost" className="w-full">
                Voltar ao início
              </RadarButton>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Questionário
  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <div className={`min-h-screen ${bgMain}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${bgHeader} backdrop-blur-sm border-b ${borderHeader}`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/">
              <button className={`p-2 ${textSecondary} hover:${textPrimary} ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <span className={`text-sm ${textSecondary}`}>
              Pergunta {currentQuestion + 1} de {QUESTIONS.length}
            </span>
            <div className="flex items-center gap-2">
              <RadarTag tone="info" size="sm">
                {CATEGORY_LABELS[question.category]}
              </RadarTag>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className={`h-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${isDarkMode ? 'bg-violet-500' : 'bg-purple-600'} rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className={`${cardBg} rounded-2xl shadow-xl border ${cardBorder} p-6 sm:p-8`}>
          <h2 className={`text-xl font-semibold ${textPrimary} mb-8 text-center`}>
            {question.text}
          </h2>

          <div className="space-y-3">
            {[
              { value: 0, label: 'Nunca', desc: 'Isso não acontece' },
              { value: 3, label: 'Raramente', desc: 'Aconteceu uma ou duas vezes' },
              { value: 5, label: 'Às vezes', desc: 'Acontece de vez em quando' },
              { value: 7, label: 'Frequentemente', desc: 'Acontece com regularidade' },
              { value: 10, label: 'Sempre', desc: 'É constante' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isDarkMode 
                    ? `hover:bg-violet-600/20 hover:border-violet-500 ${answers[question.id] === option.value ? 'bg-violet-600/20 border-violet-500' : 'bg-slate-800/50 border-slate-700'}`
                    : `hover:bg-purple-50 hover:border-purple-400 ${answers[question.id] === option.value ? 'bg-purple-50 border-purple-400' : 'bg-white border-gray-200'}`
                }`}
              >
                <span className={`font-medium ${textPrimary}`}>{option.label}</span>
                <span className={`text-sm ${textSecondary} ml-2`}>— {option.desc}</span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          {currentQuestion > 0 && (
            <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <RadarButton 
                variant="ghost" 
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                <ArrowLeft className="w-4 h-4" />
                Pergunta anterior
              </RadarButton>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
