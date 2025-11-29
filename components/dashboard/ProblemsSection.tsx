'use client'

import Link from 'next/link'
import { AlertCircle, Brain, Scale, Heart, ShieldAlert, Users, Sparkles } from 'lucide-react'
import { PROBLEMS, ProblemConfig, ProblemTag } from '@/lib/tools-config'

// =============================================================================
// PROBLEMS SECTION - "Estou lidando com..." chips de problemas
// REFATORADO: Agora lê do TOOLS config (PROBLEMS array)
// Clique vai para página /hub/[problema] (sem modal)
// =============================================================================

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  Brain,
  Scale,
  Heart,
  ShieldAlert,
  Users,
  Sparkles,
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || AlertCircle
}

interface ProblemsSectionProps {
  /** Se true, mostra todos os problemas incluindo autoestima_baixa */
  showAll?: boolean
}

// Cores para os botões de problemas (Layout V2)
const PROBLEM_COLORS: Record<string, { bg: string; hover: string; text: string; border: string }> = {
  invalidacao: { bg: 'bg-pink-500/20', hover: 'hover:bg-pink-500/30', text: 'text-pink-400', border: 'border-pink-500/30' },
  gaslighting: { bg: 'bg-purple-500/20', hover: 'hover:bg-purple-500/30', text: 'text-purple-400', border: 'border-purple-500/30' },
  criminalizacao: { bg: 'bg-orange-500/20', hover: 'hover:bg-orange-500/30', text: 'text-orange-400', border: 'border-orange-500/30' },
  manipulacao: { bg: 'bg-blue-500/20', hover: 'hover:bg-blue-500/30', text: 'text-blue-400', border: 'border-blue-500/30' },
  ameacas: { bg: 'bg-red-500/20', hover: 'hover:bg-red-500/30', text: 'text-red-400', border: 'border-red-500/30' },
  isolamento: { bg: 'bg-amber-500/20', hover: 'hover:bg-amber-500/30', text: 'text-amber-400', border: 'border-amber-500/30' },
}

export default function ProblemsSection({ showAll = false }: ProblemsSectionProps) {
  // Filtra problemas - por padrão esconde autoestima_baixa (é mais interno)
  const problemsToShow = showAll 
    ? PROBLEMS 
    : PROBLEMS.filter(p => p.id !== 'autoestima_baixa')

  return (
    <section className="mb-8">
      {/* Título */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-1">
          Estou lidando com...
        </h2>
        <p className="text-sm text-gray-400">
          Clique no que você está enfrentando para ver ferramentas específicas
        </p>
      </div>

      {/* Grid de botões coloridos (Layout V2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {problemsToShow.slice(0, 4).map((problem) => {
          const IconComponent = getIcon(problem.icon)
          const colors = PROBLEM_COLORS[problem.id] || { bg: 'bg-gray-500/20', hover: 'hover:bg-gray-500/30', text: 'text-gray-400', border: 'border-gray-500/30' }
          
          return (
            <Link
              key={problem.id}
              href={`/hub/${problem.id}`}
              className={`
                flex items-center justify-center gap-2 p-4 rounded-xl
                ${colors.bg} ${colors.hover} border ${colors.border}
                transition-all cursor-pointer
              `}
            >
              <IconComponent className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-sm font-medium ${colors.text}`}>
                {problem.label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
