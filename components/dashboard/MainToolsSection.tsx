'use client'

import Link from 'next/link'
import { 
  Target, PenLine, MessageCircle, ArrowRight, BookOpen, Eye, Clock,
  Shield, Lock, Trophy, Sparkles, BarChart3, Mail, RefreshCw, CheckSquare,
  DoorOpen, FileText, RefreshCcw
} from 'lucide-react'
import { getToolsByPlacement, ToolConfig } from '@/lib/tools-config'

// =============================================================================
// MAIN TOOLS SECTION - Ferramentas Principais do Produto
// REFATORADO: Agora lê do TOOLS config em vez de lista hard-coded
// UX: Destaca as ferramentas core logo no topo, SEM o usuário ter que procurar
// =============================================================================

// Mapeamento de nomes de ícones para componentes Lucide
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  PenLine,
  MessageCircle,
  BookOpen,
  Eye,
  Clock,
  Shield,
  Lock,
  Trophy,
  Sparkles,
  BarChart3,
  Mail,
  RefreshCw,
  CheckSquare,
  DoorOpen,
  FileText,
  RefreshCcw,
}

// Mapeamento de cores para classes Tailwind - TEMA ESCURO
const COLOR_CLASSES: Record<string, { text: string; bg: string; iconBg: string; hoverBg: string; border: string }> = {
  purple: { text: 'text-violet-400', bg: 'bg-slate-800/50', iconBg: 'bg-violet-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-violet-500/50' },
  blue: { text: 'text-blue-400', bg: 'bg-slate-800/50', iconBg: 'bg-blue-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-blue-500/50' },
  emerald: { text: 'text-emerald-400', bg: 'bg-slate-800/50', iconBg: 'bg-emerald-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-emerald-500/50' },
  indigo: { text: 'text-indigo-400', bg: 'bg-slate-800/50', iconBg: 'bg-indigo-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-indigo-500/50' },
  pink: { text: 'text-pink-400', bg: 'bg-slate-800/50', iconBg: 'bg-pink-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-pink-500/50' },
  amber: { text: 'text-amber-400', bg: 'bg-slate-800/50', iconBg: 'bg-amber-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-amber-500/50' },
  green: { text: 'text-green-400', bg: 'bg-slate-800/50', iconBg: 'bg-green-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-green-500/50' },
  cyan: { text: 'text-cyan-400', bg: 'bg-slate-800/50', iconBg: 'bg-cyan-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-cyan-500/50' },
  yellow: { text: 'text-yellow-400', bg: 'bg-slate-800/50', iconBg: 'bg-yellow-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-yellow-500/50' },
  orange: { text: 'text-orange-400', bg: 'bg-slate-800/50', iconBg: 'bg-orange-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-orange-500/50' },
  red: { text: 'text-red-400', bg: 'bg-slate-800/50', iconBg: 'bg-red-500/20', hoverBg: 'hover:bg-slate-800', border: 'border-slate-700/50 hover:border-red-500/50' },
}

function getColorClasses(color?: string) {
  return COLOR_CLASSES[color || 'purple'] || COLOR_CLASSES.purple
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Target
}

export default function MainToolsSection() {
  // Busca ferramentas com placement 'main_tools' do config
  const mainTools = getToolsByPlacement('main_tools')

  return (
    <section className="mb-6">
      {/* Título da seção */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">
          Suas Ferramentas Principais
        </h2>
        <p className="text-sm text-gray-500">
          Acesso rápido às ferramentas mais importantes
        </p>
      </div>

      {/* Grid de ferramentas - TEMA ESCURO */}
      <div className="grid sm:grid-cols-3 gap-4">
        {mainTools.map((tool) => {
          const IconComponent = getIcon(tool.icon)
          const colors = getColorClasses(tool.color)
          
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`
                group flex items-center gap-4 p-5 rounded-2xl border 
                ${colors.border} ${colors.bg} ${colors.hoverBg}
                transition-all hover:scale-[1.02]
              `}
            >
              <div className={`p-3 rounded-xl ${colors.iconBg} ${colors.text}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {tool.description}
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 ${colors.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
