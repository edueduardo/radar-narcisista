'use client'

import Link from 'next/link'
import { 
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock,
  Shield, Lock, Trophy, Sparkles, BarChart3, Mail, RefreshCw, CheckSquare,
  DoorOpen, FileText, RefreshCcw
} from 'lucide-react'
import { getToolsByPlacement } from '@/lib/tools-config'

// =============================================================================
// QUICK ACTIONS SECTION - Atalhos Rápidos
// REFATORADO: Agora lê do TOOLS config (placement: 'quick_actions')
// =============================================================================

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock, Shield, Lock, Trophy,
  Sparkles, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, FileText, RefreshCcw
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Target
}

export default function QuickActionsSection() {
  // Busca ferramentas com placement 'quick_actions' do config
  const quickActions = getToolsByPlacement('quick_actions').slice(0, 4)

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-400" />
        Atalhos Rápidos
      </h3>
      <div className="space-y-2">
        {quickActions.map((tool) => {
          const IconComponent = getIcon(tool.icon)

          return (
            <Link 
              key={tool.id}
              href={tool.href}
              className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700/50"
            >
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">
                {tool.shortLabel || tool.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
