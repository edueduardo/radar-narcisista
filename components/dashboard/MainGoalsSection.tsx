'use client'

import Link from 'next/link'
import { 
  Target, BookOpen, Clock, PenLine, Shield, Lightbulb, ArrowRight, Eye, FileText, Lock,
  MessageCircle, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, RefreshCcw, Trophy, Sparkles
} from 'lucide-react'
import { getToolsByGoalAndPlacement, MainGoal, ToolConfig } from '@/lib/tools-config'

// =============================================================================
// MAIN GOALS SECTION - 3 cards das promessas centrais do produto
// REFATORADO: Agora lê ferramentas do TOOLS config
// Clareza | Registro | Proteção
// =============================================================================

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, BookOpen, Clock, PenLine, Shield, Lightbulb, Eye, FileText, Lock,
  MessageCircle, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, RefreshCcw, Trophy, Sparkles
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Target
}

// Configuração dos 3 cards principais
interface GoalCardConfig {
  goal: MainGoal
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  colors: {
    bg: string
    hoverBg: string
    hoverBorder: string
    iconBg: string
    iconBgHover: string
    iconText: string
    subtitleText: string
    primaryBg: string
    primaryHoverBg: string
    arrowText: string
  }
}

// TEMA ESCURO
const GOAL_CARDS: GoalCardConfig[] = [
  {
    goal: 'clareza',
    title: 'Clareza',
    subtitle: 'Entender o que está acontecendo',
    description: 'Se você está confusa, sente invalidação, gaslighting ou duvida da própria memória.',
    icon: Eye,
    colors: {
      bg: 'bg-slate-800/50',
      hoverBg: 'hover:bg-slate-800',
      hoverBorder: 'hover:border-violet-500/50',
      iconBg: 'bg-violet-500/20',
      iconBgHover: 'group-hover:bg-violet-500/30',
      iconText: 'text-violet-400',
      subtitleText: 'text-violet-400',
      primaryBg: 'bg-violet-950/50',
      primaryHoverBg: 'hover:bg-violet-950/70',
      arrowText: 'text-violet-400',
    }
  },
  {
    goal: 'registro',
    title: 'Registro',
    subtitle: 'Organizar episódios e provas',
    description: 'Se você vive discussões, reviravoltas e depois fica em dúvida sobre o que aconteceu.',
    icon: FileText,
    colors: {
      bg: 'bg-slate-800/50',
      hoverBg: 'hover:bg-slate-800',
      hoverBorder: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/20',
      iconBgHover: 'group-hover:bg-blue-500/30',
      iconText: 'text-blue-400',
      subtitleText: 'text-blue-400',
      primaryBg: 'bg-blue-950/50',
      primaryHoverBg: 'hover:bg-blue-950/70',
      arrowText: 'text-blue-400',
    }
  },
  {
    goal: 'protecao',
    title: 'Proteção',
    subtitle: 'Planejar segurança e próximos passos',
    description: 'Se você sente medo, ameaça, criminalização, isolamento ou risco real.',
    icon: Shield,
    colors: {
      bg: 'bg-slate-800/50',
      hoverBg: 'hover:bg-slate-800',
      hoverBorder: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/20',
      iconBgHover: 'group-hover:bg-emerald-500/30',
      iconText: 'text-emerald-400',
      subtitleText: 'text-emerald-400',
      primaryBg: 'bg-emerald-950/50',
      primaryHoverBg: 'hover:bg-emerald-950/70',
      arrowText: 'text-emerald-400',
    }
  },
]

export default function MainGoalsSection() {
  return (
    <section className="mb-8">
      {/* Título da seção - TEMA ESCURO */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          O que você veio buscar aqui hoje?
        </h2>
        <p className="text-gray-500 text-sm">
          Escolha o que mais faz sentido para você agora
        </p>
      </div>

      {/* Grid de 3 cards - TEMA ESCURO */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {GOAL_CARDS.map((card) => {
          // Busca ferramentas do TOOLS config para este goal
          const tools = getToolsByGoalAndPlacement(card.goal, 'goals_section').slice(0, 3)
          const CardIcon = card.icon

          return (
            <div 
              key={card.goal}
              className={`${card.colors.bg} rounded-2xl border border-slate-700/50 ${card.colors.hoverBg} ${card.colors.hoverBorder} transition-all p-6 group`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 ${card.colors.iconBg} rounded-xl ${card.colors.iconBgHover} transition-colors`}>
                  <CardIcon className={`w-6 h-6 ${card.colors.iconText}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{card.title}</h3>
                  <p className={`text-xs ${card.colors.subtitleText} font-medium`}>{card.subtitle}</p>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                {card.description}
              </p>

              {/* Lista de ferramentas - TEMA ESCURO */}
              <div className="space-y-2">
                {tools.map((tool, index) => {
                  const ToolIcon = getIcon(tool.icon)
                  const isPrimary = index === 0
                  
                  return (
                    <Link 
                      key={tool.id}
                      href={tool.href}
                      className={`flex items-center justify-between p-3 ${isPrimary ? card.colors.primaryBg : 'bg-slate-800/30'} rounded-xl ${isPrimary ? card.colors.primaryHoverBg : 'hover:bg-slate-800/50'} transition-colors group/link border border-slate-700/30`}
                    >
                      <div className="flex items-center gap-2">
                        <ToolIcon className={`w-4 h-4 ${card.colors.iconText}`} />
                        <span className="text-sm font-medium text-gray-300">{tool.shortLabel || tool.name}</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${isPrimary ? card.colors.arrowText : 'text-gray-500'} group-hover/link:translate-x-1 transition-transform`} />
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
