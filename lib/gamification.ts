/**
 * Sistema de Gamificação
 * Conquistas e badges para engajamento positivo
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'journey' | 'learning' | 'community' | 'self_care' | 'milestone'
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  criteria: AchievementCriteria
  secret?: boolean
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'first' | 'special'
  metric: string
  target: number
}

export interface UserAchievement {
  achievement_id: string
  user_id: string
  unlocked_at: string
  progress?: number
}

// Definição de todas as conquistas
export const ACHIEVEMENTS: Achievement[] = [
  // === JORNADA ===
  {
    id: 'first_step',
    name: 'Primeiro Passo',
    description: 'Completou o teste de clareza pela primeira vez',
    icon: '👣',
    category: 'journey',
    points: 10,
    rarity: 'common',
    criteria: { type: 'first', metric: 'clarity_test', target: 1 }
  },
  {
    id: 'journal_starter',
    name: 'Diário Iniciado',
    description: 'Escreveu sua primeira entrada no diário',
    icon: '📝',
    category: 'journey',
    points: 10,
    rarity: 'common',
    criteria: { type: 'first', metric: 'journal_entry', target: 1 }
  },
  {
    id: 'week_warrior',
    name: 'Guerreira da Semana',
    description: 'Registrou no diário por 7 dias seguidos',
    icon: '🗓️',
    category: 'journey',
    points: 50,
    rarity: 'uncommon',
    criteria: { type: 'streak', metric: 'journal_streak', target: 7 }
  },
  {
    id: 'month_champion',
    name: 'Campeã do Mês',
    description: 'Registrou no diário por 30 dias seguidos',
    icon: '🏆',
    category: 'journey',
    points: 200,
    rarity: 'rare',
    criteria: { type: 'streak', metric: 'journal_streak', target: 30 }
  },
  {
    id: 'clarity_seeker',
    name: 'Buscadora de Clareza',
    description: 'Refez o teste de clareza 3 vezes',
    icon: '🔍',
    category: 'journey',
    points: 30,
    rarity: 'uncommon',
    criteria: { type: 'count', metric: 'clarity_test', target: 3 }
  },
  {
    id: 'evolution',
    name: 'Evolução',
    description: 'Seu score de clareza melhorou em relação ao primeiro teste',
    icon: '📈',
    category: 'journey',
    points: 100,
    rarity: 'rare',
    criteria: { type: 'special', metric: 'clarity_improvement', target: 1 }
  },

  // === APRENDIZADO ===
  {
    id: 'curious_mind',
    name: 'Mente Curiosa',
    description: 'Leu 5 artigos na biblioteca',
    icon: '📚',
    category: 'learning',
    points: 20,
    rarity: 'common',
    criteria: { type: 'count', metric: 'articles_read', target: 5 }
  },
  {
    id: 'knowledge_seeker',
    name: 'Buscadora de Conhecimento',
    description: 'Completou uma trilha na Academy',
    icon: '🎓',
    category: 'learning',
    points: 75,
    rarity: 'uncommon',
    criteria: { type: 'first', metric: 'academy_track', target: 1 }
  },
  {
    id: 'pattern_recognizer',
    name: 'Reconhecedora de Padrões',
    description: 'Identificou 10 padrões diferentes no diário',
    icon: '🧩',
    category: 'learning',
    points: 50,
    rarity: 'uncommon',
    criteria: { type: 'count', metric: 'patterns_identified', target: 10 }
  },

  // === AUTOCUIDADO ===
  {
    id: 'safety_first',
    name: 'Segurança em Primeiro Lugar',
    description: 'Criou seu plano de segurança',
    icon: '🛡️',
    category: 'self_care',
    points: 50,
    rarity: 'uncommon',
    criteria: { type: 'first', metric: 'safety_plan', target: 1 }
  },
  {
    id: 'self_compassion',
    name: 'Autocompaixão',
    description: 'Usou o chat para processar emoções 10 vezes',
    icon: '💜',
    category: 'self_care',
    points: 40,
    rarity: 'uncommon',
    criteria: { type: 'count', metric: 'chat_sessions', target: 10 }
  },
  {
    id: 'boundary_setter',
    name: 'Definidora de Limites',
    description: 'Registrou 5 momentos em que estabeleceu limites',
    icon: '🚧',
    category: 'self_care',
    points: 60,
    rarity: 'rare',
    criteria: { type: 'count', metric: 'boundaries_set', target: 5 }
  },

  // === MARCOS ===
  {
    id: 'one_month',
    name: '1 Mês de Jornada',
    description: 'Está conosco há 1 mês',
    icon: '🌱',
    category: 'milestone',
    points: 30,
    rarity: 'common',
    criteria: { type: 'count', metric: 'days_active', target: 30 }
  },
  {
    id: 'three_months',
    name: '3 Meses de Força',
    description: 'Está conosco há 3 meses',
    icon: '🌿',
    category: 'milestone',
    points: 75,
    rarity: 'uncommon',
    criteria: { type: 'count', metric: 'days_active', target: 90 }
  },
  {
    id: 'six_months',
    name: '6 Meses de Resiliência',
    description: 'Está conosco há 6 meses',
    icon: '🌳',
    category: 'milestone',
    points: 150,
    rarity: 'rare',
    criteria: { type: 'count', metric: 'days_active', target: 180 }
  },
  {
    id: 'one_year',
    name: '1 Ano de Transformação',
    description: 'Está conosco há 1 ano',
    icon: '🌟',
    category: 'milestone',
    points: 500,
    rarity: 'epic',
    criteria: { type: 'count', metric: 'days_active', target: 365 }
  },

  // === SECRETAS ===
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Escreveu no diário depois da meia-noite',
    icon: '🦉',
    category: 'journey',
    points: 15,
    rarity: 'common',
    criteria: { type: 'special', metric: 'late_night_entry', target: 1 },
    secret: true
  },
  {
    id: 'phoenix',
    name: 'Fênix',
    description: 'Voltou após 30 dias de inatividade',
    icon: '🔥',
    category: 'journey',
    points: 50,
    rarity: 'rare',
    criteria: { type: 'special', metric: 'comeback', target: 1 },
    secret: true
  },
  {
    id: 'voice_of_courage',
    name: 'Voz da Coragem',
    description: 'Usou o recurso de voz pela primeira vez',
    icon: '🎤',
    category: 'journey',
    points: 25,
    rarity: 'uncommon',
    criteria: { type: 'first', metric: 'voice_entry', target: 1 },
    secret: true
  }
]

// Cores por raridade
export const RARITY_COLORS = {
  common: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  uncommon: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  rare: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  epic: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  legendary: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' }
}

// Labels por categoria
export const CATEGORY_LABELS = {
  journey: 'Jornada',
  learning: 'Aprendizado',
  community: 'Comunidade',
  self_care: 'Autocuidado',
  milestone: 'Marcos'
}

/**
 * Verifica se uma conquista foi desbloqueada
 */
export function checkAchievement(
  achievement: Achievement,
  userMetrics: Record<string, number>
): boolean {
  const { criteria } = achievement
  const currentValue = userMetrics[criteria.metric] || 0

  switch (criteria.type) {
    case 'count':
    case 'streak':
    case 'first':
      return currentValue >= criteria.target
    case 'special':
      // Conquistas especiais precisam de lógica customizada
      return currentValue >= criteria.target
    default:
      return false
  }
}

/**
 * Calcula progresso de uma conquista
 */
export function getAchievementProgress(
  achievement: Achievement,
  userMetrics: Record<string, number>
): number {
  const { criteria } = achievement
  const currentValue = userMetrics[criteria.metric] || 0
  return Math.min(100, (currentValue / criteria.target) * 100)
}

/**
 * Calcula nível do usuário baseado em pontos
 */
export function calculateLevel(totalPoints: number): {
  level: number
  title: string
  nextLevelPoints: number
  progress: number
} {
  const levels = [
    { level: 1, title: 'Iniciante', minPoints: 0 },
    { level: 2, title: 'Aprendiz', minPoints: 50 },
    { level: 3, title: 'Exploradora', minPoints: 150 },
    { level: 4, title: 'Consciente', minPoints: 300 },
    { level: 5, title: 'Resiliente', minPoints: 500 },
    { level: 6, title: 'Fortalecida', minPoints: 750 },
    { level: 7, title: 'Empoderada', minPoints: 1000 },
    { level: 8, title: 'Guerreira', minPoints: 1500 },
    { level: 9, title: 'Mentora', minPoints: 2000 },
    { level: 10, title: 'Lendária', minPoints: 3000 }
  ]

  let currentLevel = levels[0]
  let nextLevel = levels[1]

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].minPoints) {
      currentLevel = levels[i]
      nextLevel = levels[i + 1] || levels[i]
      break
    }
  }

  const pointsInLevel = totalPoints - currentLevel.minPoints
  const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints
  const progress = pointsNeeded > 0 ? (pointsInLevel / pointsNeeded) * 100 : 100

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints: nextLevel.minPoints,
    progress
  }
}
