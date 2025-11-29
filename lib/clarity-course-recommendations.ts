/**
 * TEMA 5: Integração Teste de Clareza com Curso/Trilhas
 * 
 * Este módulo gera recomendações de trilhas/módulos baseadas no perfil de clareza.
 * Conecta o resultado do teste com conteúdo educacional relevante.
 */

import { ClarityProfile } from '@/hooks/useClarityProfile'
import { ProblemTag } from './tools-config'

// =============================================================================
// TIPOS
// =============================================================================

export interface CourseModule {
  id: string
  title: string
  description: string
  duration: string // ex: "15 min", "1h"
  type: 'video' | 'texto' | 'exercicio' | 'quiz'
  href: string
  icon: string
  priority: 'alta' | 'media' | 'baixa'
  forCategories: string[] // categorias do teste que se beneficiam
  forZones: ('atencao' | 'alerta' | 'vermelha')[] // zonas recomendadas
}

export interface CoursePath {
  id: string
  title: string
  subtitle: string
  description: string
  modules: CourseModule[]
  color: string
  bgColor: string
  icon: string
  forCategories: string[]
  forAxes: string[]
  priority: number // 1 = mais urgente
}

export interface CourseRecommendation {
  path: CoursePath
  reason: string
  matchScore: number // 0-100
  suggestedModules: CourseModule[]
}

// =============================================================================
// TRILHAS DISPONÍVEIS
// =============================================================================

export const COURSE_PATHS: CoursePath[] = [
  {
    id: 'voce-nao-esta-louca',
    title: 'Você Não Está Louca',
    subtitle: 'Entendendo gaslighting e recuperando sua percepção',
    description: 'Trilha para quem está confusa sobre a própria realidade, memória e percepção. Aprenda a identificar gaslighting e reconectar com sua verdade.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'Brain',
    forCategories: ['gaslighting', 'invalidacao'],
    forAxes: ['nevoa'],
    priority: 1,
    modules: [
      {
        id: 'vnl-1',
        title: 'O que é Gaslighting?',
        description: 'Entenda essa forma de manipulação psicológica',
        duration: '10 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=gaslighting',
        icon: 'BookOpen',
        priority: 'alta',
        forCategories: ['gaslighting'],
        forZones: ['atencao', 'alerta', 'vermelha']
      },
      {
        id: 'vnl-2',
        title: 'Sinais de que você está sofrendo gaslighting',
        description: 'Checklist para identificar padrões',
        duration: '8 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=sinais-gaslighting',
        icon: 'CheckSquare',
        priority: 'alta',
        forCategories: ['gaslighting'],
        forZones: ['alerta', 'vermelha']
      },
      {
        id: 'vnl-3',
        title: 'Diário: Registre para não esquecer',
        description: 'Use o diário para documentar sua realidade',
        duration: '5 min',
        type: 'exercicio',
        href: '/diario/novo?tipo=gaslighting',
        icon: 'PenLine',
        priority: 'media',
        forCategories: ['gaslighting', 'invalidacao'],
        forZones: ['atencao', 'alerta', 'vermelha']
      }
    ]
  },
  {
    id: 'prisao-emocional',
    title: 'Saindo da Prisão Emocional',
    subtitle: 'Reconhecendo e escapando do controle',
    description: 'Trilha para quem sente que perdeu autonomia, precisa pedir permissão para tudo, ou vive sob vigilância constante.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'Lock',
    forCategories: ['controle', 'isolamento'],
    forAxes: ['medo', 'limites'],
    priority: 2,
    modules: [
      {
        id: 'pe-1',
        title: 'Controle vs Cuidado: Qual a diferença?',
        description: 'Aprenda a distinguir proteção de possessividade',
        duration: '12 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=controle-vs-cuidado',
        icon: 'Scale',
        priority: 'alta',
        forCategories: ['controle'],
        forZones: ['atencao', 'alerta', 'vermelha']
      },
      {
        id: 'pe-2',
        title: 'Reconectando com sua rede de apoio',
        description: 'Estratégias para quebrar o isolamento',
        duration: '15 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=quebrar-isolamento',
        icon: 'Users',
        priority: 'media',
        forCategories: ['isolamento'],
        forZones: ['alerta', 'vermelha']
      },
      {
        id: 'pe-3',
        title: 'Coach IA: Planejando pequenas liberdades',
        description: 'Converse sobre passos seguros para recuperar autonomia',
        duration: '10 min',
        type: 'exercicio',
        href: '/chat',
        icon: 'MessageCircle',
        priority: 'media',
        forCategories: ['controle', 'isolamento'],
        forZones: ['atencao', 'alerta']
      }
    ]
  },
  {
    id: 'plano-seguranca',
    title: 'Plano de Segurança',
    subtitle: 'Proteção prioritária para situações de risco',
    description: 'Trilha URGENTE para quem identificou sinais de risco físico. Organize sua proteção com passos concretos.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'ShieldAlert',
    forCategories: ['fisico', 'emocional'],
    forAxes: ['limites'],
    priority: 0, // Máxima prioridade
    modules: [
      {
        id: 'ps-1',
        title: 'Criar Plano de Segurança',
        description: 'Configure contatos, documentos e rotas de fuga',
        duration: '20 min',
        type: 'exercicio',
        href: '/plano-seguranca',
        icon: 'Shield',
        priority: 'alta',
        forCategories: ['fisico'],
        forZones: ['vermelha']
      },
      {
        id: 'ps-2',
        title: 'Contatos de Emergência',
        description: '190, 180, CVV - Quando e como usar',
        duration: '5 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=recursos-emergencia',
        icon: 'Phone',
        priority: 'alta',
        forCategories: ['fisico', 'emocional'],
        forZones: ['alerta', 'vermelha']
      },
      {
        id: 'ps-3',
        title: 'Documentação para proteção legal',
        description: 'O que guardar e como guardar com segurança',
        duration: '15 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=documentacao-legal',
        icon: 'FileText',
        priority: 'media',
        forCategories: ['fisico'],
        forZones: ['alerta', 'vermelha']
      }
    ]
  },
  {
    id: 'reconstruindo-autoestima',
    title: 'Reconstruindo sua Autoestima',
    subtitle: 'Reconectando com seu valor',
    description: 'Trilha para quem foi sistematicamente desvalorizada e precisa reconectar com seu próprio valor.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    icon: 'Heart',
    forCategories: ['invalidacao', 'emocional'],
    forAxes: ['nevoa'],
    priority: 3,
    modules: [
      {
        id: 'ra-1',
        title: 'Invalidação: O que fizeram com você',
        description: 'Entenda como a invalidação afeta a autoestima',
        duration: '12 min',
        type: 'texto',
        href: '/biblioteca-respostas?tema=invalidacao',
        icon: 'BookOpen',
        priority: 'alta',
        forCategories: ['invalidacao'],
        forZones: ['atencao', 'alerta', 'vermelha']
      },
      {
        id: 'ra-2',
        title: 'Exercício: Carta para si mesma',
        description: 'Reconecte com a pessoa que você era antes',
        duration: '15 min',
        type: 'exercicio',
        href: '/diario/novo',
        icon: 'PenLine',
        priority: 'media',
        forCategories: ['invalidacao', 'emocional'],
        forZones: ['atencao', 'alerta']
      }
    ]
  }
]

// =============================================================================
// FUNÇÕES DE RECOMENDAÇÃO
// =============================================================================

/**
 * Gera recomendações de trilhas baseadas no perfil de clareza
 */
export function getCourseRecommendations(profile: ClarityProfile | null): CourseRecommendation[] {
  if (!profile) return []
  
  const recommendations: CourseRecommendation[] = []
  
  COURSE_PATHS.forEach(path => {
    let matchScore = 0
    const reasons: string[] = []
    
    // Verificar match com categorias
    const matchingCategories = path.forCategories.filter(cat => 
      profile.topCategories.includes(cat)
    )
    if (matchingCategories.length > 0) {
      matchScore += matchingCategories.length * 30
      reasons.push(`Baseado em: ${matchingCategories.join(', ')}`)
    }
    
    // Verificar match com eixos
    const topAxisNames = profile.topAxes.slice(0, 2).map(a => a.axis)
    const matchingAxes = path.forAxes.filter(axis => topAxisNames.includes(axis))
    if (matchingAxes.length > 0) {
      matchScore += matchingAxes.length * 20
    }
    
    // Prioridade extra para risco físico
    if (profile.hasPhysicalRisk && path.id === 'plano-seguranca') {
      matchScore += 50
      reasons.push('⚠️ Risco físico detectado')
    }
    
    // Prioridade por zona
    if (profile.globalZone === 'vermelha') {
      matchScore += 10
    } else if (profile.globalZone === 'alerta') {
      matchScore += 5
    }
    
    // Só incluir se tiver algum match
    if (matchScore > 0) {
      // Filtrar módulos relevantes
      const suggestedModules = path.modules.filter(mod => {
        const categoryMatch = mod.forCategories.some(cat => 
          profile.topCategories.includes(cat)
        )
        const zoneMatch = mod.forZones.includes(profile.globalZone)
        return categoryMatch || zoneMatch
      }).slice(0, 3) // Máximo 3 módulos por trilha
      
      recommendations.push({
        path,
        reason: reasons.join(' | ') || 'Recomendado para seu perfil',
        matchScore,
        suggestedModules
      })
    }
  })
  
  // Ordenar por score (maior primeiro) e prioridade da trilha
  return recommendations
    .sort((a, b) => {
      // Primeiro por prioridade da trilha (menor = mais urgente)
      if (a.path.priority !== b.path.priority) {
        return a.path.priority - b.path.priority
      }
      // Depois por matchScore
      return b.matchScore - a.matchScore
    })
    .slice(0, 3) // Máximo 3 trilhas recomendadas
}

/**
 * Retorna a trilha mais urgente baseada no perfil
 */
export function getUrgentPath(profile: ClarityProfile | null): CoursePath | null {
  if (!profile) return null
  
  // Se tem risco físico, priorizar plano de segurança
  if (profile.hasPhysicalRisk) {
    return COURSE_PATHS.find(p => p.id === 'plano-seguranca') || null
  }
  
  // Se gaslighting é top categoria, priorizar "Você não está louca"
  if (profile.topCategories.includes('gaslighting')) {
    return COURSE_PATHS.find(p => p.id === 'voce-nao-esta-louca') || null
  }
  
  // Se controle/isolamento, priorizar "Prisão emocional"
  if (profile.topCategories.includes('controle') || profile.topCategories.includes('isolamento')) {
    return COURSE_PATHS.find(p => p.id === 'prisao-emocional') || null
  }
  
  return null
}

/**
 * Mapeia categoria do teste para hub de problema
 */
export function getCategoryToHubMapping(category: string): string {
  const mapping: Record<string, string> = {
    invalidacao: '/hub/invalidacao',
    gaslighting: '/hub/gaslighting',
    controle: '/hub/manipulacao',
    isolamento: '/hub/isolamento',
    emocional: '/hub/manipulacao',
    fisico: '/hub/ameacas'
  }
  return mapping[category] || '/hub/invalidacao'
}

/**
 * Gera texto de onboarding baseado no perfil
 */
export function getOnboardingText(profile: ClarityProfile | null): string {
  if (!profile) {
    return 'Faça o Teste de Clareza para receber recomendações personalizadas.'
  }
  
  const urgentPath = getUrgentPath(profile)
  
  if (profile.hasPhysicalRisk) {
    return '⚠️ Seu teste indicou sinais de risco. Recomendamos começar pelo Plano de Segurança.'
  }
  
  if (urgentPath) {
    return `Baseado no seu teste, sugerimos começar pela trilha "${urgentPath.title}".`
  }
  
  return 'Explore as trilhas abaixo baseadas no seu perfil de clareza.'
}
