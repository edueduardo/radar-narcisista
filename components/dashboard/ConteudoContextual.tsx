'use client'

/**
 * Conteúdo Contextual no Dashboard
 * Ideia Diamante #8: Sugestões baseadas no perfil de risco do usuário
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Lightbulb,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  Shield,
  Heart,
  AlertTriangle,
  Sparkles
} from 'lucide-react'

interface ContentSuggestion {
  id: string
  type: 'article' | 'video' | 'guide' | 'exercise'
  title: string
  description: string
  url?: string
  internalPath?: string
  relevanceScore: number
  tags: string[]
}

interface UserContext {
  hasPhysicalRisk: boolean
  recentTags: string[]
  clarityScore: number
  journalFrequency: 'low' | 'medium' | 'high'
  daysInPlatform: number
}

// Conteúdos base (em produção, viriam do banco)
const CONTENT_LIBRARY: ContentSuggestion[] = [
  // Para risco físico
  {
    id: 'safety-1',
    type: 'guide',
    title: 'Como criar um Plano de Segurança',
    description: 'Guia passo a passo para preparar sua saída de forma segura.',
    internalPath: '/plano-seguranca',
    relevanceScore: 100,
    tags: ['risco_fisico', 'seguranca', 'plano']
  },
  {
    id: 'safety-2',
    type: 'article',
    title: 'Sinais de que você precisa sair agora',
    description: 'Identificando situações de perigo iminente.',
    internalPath: '/academy/sinais-perigo',
    relevanceScore: 95,
    tags: ['risco_fisico', 'urgencia']
  },
  // Para gaslighting
  {
    id: 'gaslight-1',
    type: 'article',
    title: 'O que é Gaslighting e como identificar',
    description: 'Entenda essa forma sutil de manipulação psicológica.',
    internalPath: '/academy/gaslighting',
    relevanceScore: 85,
    tags: ['gaslighting', 'manipulacao', 'clareza']
  },
  {
    id: 'gaslight-2',
    type: 'exercise',
    title: 'Exercício: Validando sua realidade',
    description: 'Técnicas para confiar na sua percepção.',
    internalPath: '/academy/exercicios/validacao',
    relevanceScore: 80,
    tags: ['gaslighting', 'autoestima']
  },
  // Para isolamento
  {
    id: 'isolation-1',
    type: 'guide',
    title: 'Reconstruindo sua rede de apoio',
    description: 'Como reconectar com pessoas de confiança.',
    internalPath: '/academy/rede-apoio',
    relevanceScore: 75,
    tags: ['isolamento', 'apoio', 'relacionamentos']
  },
  // Para iniciantes
  {
    id: 'beginner-1',
    type: 'video',
    title: 'Bem-vinda ao Radar Narcisista',
    description: 'Conheça as ferramentas disponíveis para você.',
    internalPath: '/academy/boas-vindas',
    relevanceScore: 90,
    tags: ['iniciante', 'onboarding']
  },
  {
    id: 'beginner-2',
    type: 'guide',
    title: 'Seu primeiro registro no diário',
    description: 'Dicas para começar a documentar sua jornada.',
    internalPath: '/diario/novo',
    relevanceScore: 85,
    tags: ['iniciante', 'diario']
  },
  // Para ansiedade
  {
    id: 'anxiety-1',
    type: 'exercise',
    title: 'Técnicas de respiração para ansiedade',
    description: 'Exercícios práticos para momentos difíceis.',
    internalPath: '/academy/exercicios/respiracao',
    relevanceScore: 70,
    tags: ['ansiedade', 'autocuidado']
  },
  // Para raiva
  {
    id: 'anger-1',
    type: 'article',
    title: 'Sua raiva é válida',
    description: 'Entendendo e canalizando a raiva de forma saudável.',
    internalPath: '/academy/raiva-valida',
    relevanceScore: 70,
    tags: ['raiva', 'emocoes']
  },
  // Geral
  {
    id: 'general-1',
    type: 'article',
    title: 'Entendendo o ciclo do abuso narcisista',
    description: 'Love bombing, desvalorização e descarte.',
    internalPath: '/academy/ciclo-abuso',
    relevanceScore: 80,
    tags: ['narcisismo', 'educacao']
  }
]

const TYPE_CONFIG = {
  article: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Artigo' },
  video: { icon: Video, color: 'text-red-500', bg: 'bg-red-100', label: 'Vídeo' },
  guide: { icon: BookOpen, color: 'text-green-500', bg: 'bg-green-100', label: 'Guia' },
  exercise: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100', label: 'Exercício' }
}

interface Props {
  theme?: 'light' | 'dark'
  maxItems?: number
}

export default function ConteudoContextual({ theme = 'light', maxItems = 3 }: Props) {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadContextAndSuggestions()
  }, [])

  const loadContextAndSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Usuário não logado - mostrar conteúdo para iniciantes
        setSuggestions(CONTENT_LIBRARY.filter(c => c.tags.includes('iniciante')).slice(0, maxItems))
        setLoading(false)
        return
      }

      // Buscar contexto do usuário
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Buscar perfil de clareza
      const { data: clarityProfile } = await supabase
        .from('clarity_profiles')
        .select('has_physical_risk, overall_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Buscar entradas recentes do diário
      const { data: recentEntries } = await supabase
        .from('journal_entries')
        .select('tags, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Construir contexto
      const context: UserContext = {
        hasPhysicalRisk: clarityProfile?.has_physical_risk || false,
        recentTags: extractRecentTags(recentEntries || []),
        clarityScore: clarityProfile?.overall_score || 0,
        journalFrequency: calculateFrequency(recentEntries?.length || 0),
        daysInPlatform: clarityProfile?.created_at 
          ? Math.floor((Date.now() - new Date(clarityProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }

      setUserContext(context)

      // Selecionar conteúdos relevantes
      const relevantContent = selectRelevantContent(context)
      setSuggestions(relevantContent.slice(0, maxItems))

    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
      // Fallback para conteúdo geral
      setSuggestions(CONTENT_LIBRARY.slice(0, maxItems))
    } finally {
      setLoading(false)
    }
  }

  const extractRecentTags = (entries: any[]): string[] => {
    const tagCounts: Record<string, number> = {}
    entries.forEach(e => {
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
  }

  const calculateFrequency = (count: number): 'low' | 'medium' | 'high' => {
    if (count >= 15) return 'high'
    if (count >= 5) return 'medium'
    return 'low'
  }

  const selectRelevantContent = (context: UserContext): ContentSuggestion[] => {
    let scored = CONTENT_LIBRARY.map(content => {
      let score = content.relevanceScore

      // Boost para risco físico
      if (context.hasPhysicalRisk && content.tags.some(t => ['risco_fisico', 'seguranca', 'urgencia'].includes(t))) {
        score += 50
      }

      // Boost para tags recentes do usuário
      const matchingTags = content.tags.filter(t => context.recentTags.includes(t))
      score += matchingTags.length * 15

      // Boost para iniciantes
      if (context.daysInPlatform < 7 && content.tags.includes('iniciante')) {
        score += 30
      }

      // Boost para baixa frequência de diário
      if (context.journalFrequency === 'low' && content.tags.includes('diario')) {
        score += 20
      }

      return { ...content, relevanceScore: score }
    })

    // Ordenar por score e remover duplicatas de tipo
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Diversificar tipos
    const selected: ContentSuggestion[] = []
    const usedTypes = new Set<string>()

    for (const content of scored) {
      if (selected.length >= maxItems * 2) break
      if (!usedTypes.has(content.type) || selected.length < maxItems) {
        selected.push(content)
        usedTypes.add(content.type)
      }
    }

    return selected
  }

  const t = theme === 'light' ? {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    cardBg: 'bg-gray-50',
    cardHover: 'hover:bg-gray-100'
  } : {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-white',
    textMuted: 'text-gray-400',
    cardBg: 'bg-gray-700/50',
    cardHover: 'hover:bg-gray-700'
  }

  if (loading) {
    return (
      <div className={`${t.bg} border ${t.border} rounded-xl p-6 animate-pulse`}>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${t.bg} border ${t.border} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${t.text} flex items-center gap-2`}>
          <Sparkles className="w-5 h-5 text-amber-500" />
          Sugerido para Você
        </h3>
        <Link 
          href="/academy"
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          Ver tudo
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Alerta de risco */}
      {userContext?.hasPhysicalRisk && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Prioridade: Sua segurança</span>
          </div>
        </div>
      )}

      {/* Lista de sugestões */}
      <div className="space-y-3">
        {suggestions.map(suggestion => {
          const config = TYPE_CONFIG[suggestion.type]
          const Icon = config.icon

          return (
            <Link
              key={suggestion.id}
              href={suggestion.internalPath || suggestion.url || '#'}
              target={suggestion.url ? '_blank' : undefined}
              className={`block p-4 ${t.cardBg} rounded-lg ${t.cardHover} transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    {suggestion.url && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <h4 className={`font-medium ${t.text} text-sm mb-1 truncate`}>
                    {suggestion.title}
                  </h4>
                  <p className={`text-xs ${t.textMuted} line-clamp-2`}>
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 ${t.textMuted} flex-shrink-0`} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Dica */}
      <div className={`mt-4 pt-4 border-t ${t.border}`}>
        <p className={`text-xs ${t.textMuted} flex items-center gap-1`}>
          <Lightbulb className="w-3 h-3" />
          Sugestões baseadas no seu perfil e atividade recente
        </p>
      </div>
    </div>
  )
}
