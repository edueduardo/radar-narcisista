'use client'

import Link from 'next/link'
import { 
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock, Shield, Lock, Trophy,
  Sparkles, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, FileText, RefreshCcw, Brain
} from 'lucide-react'
import { getToolsByPlacement } from '@/lib/tools-config'

// =============================================================================
// CLARITY TOOLS SECTION - Ferramentas de Clareza (grid)
// REFATORADO: Agora lê do TOOLS config (placement: 'clarity_section')
// =============================================================================

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock, Shield, Lock, Trophy,
  Sparkles, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, FileText, RefreshCcw, Brain
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Target
}

export default function ClarityToolsSection() {
  // Busca ferramentas com placement 'clarity_section' do config
  const clarityTools = getToolsByPlacement('clarity_section').slice(0, 6)

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-violet-400" />
        Ferramentas de Clareza
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {clarityTools.map((tool) => {
          const IconComponent = getIcon(tool.icon)
          return (
            <Link 
              key={tool.id}
              href={tool.href} 
              className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all border border-slate-700/50"
            >
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-xs font-medium text-gray-400 text-center">{tool.shortLabel || tool.name}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
