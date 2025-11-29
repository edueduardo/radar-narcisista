'use client'

import Link from 'next/link'
import { 
  Target, PenLine, MessageCircle, ChevronRight, BookOpen, Eye, Clock,
  Shield, Lock, Trophy, Sparkles, BarChart3, Mail, RefreshCw, CheckSquare,
  DoorOpen, FileText, RefreshCcw
} from 'lucide-react'
import { getToolsByPlacement } from '@/lib/tools-config'

// =============================================================================
// SECURITY SECTION - Seção de Segurança
// REFATORADO: Agora lê do TOOLS config (placement: 'security_section')
// =============================================================================

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock, Shield, Lock, Trophy,
  Sparkles, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, FileText, RefreshCcw
}

// Mapeamento de cores para cada ferramenta de segurança - TEMA ESCURO
const SECURITY_COLORS: Record<string, { bg: string; hover: string; border: string; chevron: string; text: string }> = {
  plano_seguranca: { bg: 'bg-red-950/30', hover: 'hover:bg-red-950/50', border: 'border-red-900/30 hover:border-red-500/30', chevron: 'text-red-400', text: 'text-red-400' },
  plano_fuga: { bg: 'bg-red-950/30', hover: 'hover:bg-red-950/50', border: 'border-red-900/30 hover:border-red-500/30', chevron: 'text-red-400', text: 'text-red-400' },
  seguranca_digital: { bg: 'bg-red-950/30', hover: 'hover:bg-red-950/50', border: 'border-red-900/30 hover:border-red-500/30', chevron: 'text-red-400', text: 'text-red-400' },
  seus_direitos_lgpd: { bg: 'bg-red-950/30', hover: 'hover:bg-red-950/50', border: 'border-red-900/30 hover:border-red-500/30', chevron: 'text-red-400', text: 'text-red-400' },
  modo_recaida: { bg: 'bg-red-950/30', hover: 'hover:bg-red-950/50', border: 'border-red-900/30 hover:border-red-500/30', chevron: 'text-red-400', text: 'text-red-400' },
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Shield
}

function getColors(toolId: string) {
  return SECURITY_COLORS[toolId] || { bg: 'bg-red-950/30', hover: 'hover:bg-red-950/50', border: 'border-red-900/30', chevron: 'text-red-400', text: 'text-red-400' }
}

export default function SecuritySection() {
  // Busca ferramentas com placement 'security_section' do config
  const securityTools = getToolsByPlacement('security_section')

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-red-400" />
        Segurança
      </h3>
      <div className="space-y-2">
        {securityTools.map((tool) => {
          const colors = getColors(tool.id)
          
          return (
            <Link 
              key={tool.id}
              href={tool.href}
              className={`flex items-center gap-3 p-3 ${colors.bg} rounded-lg ${colors.hover} transition-colors ${colors.border}`}
            >
              <span className="text-lg">{tool.emoji || '🛡️'}</span>
              <span className={`text-sm font-medium ${colors.text}`}>
                {tool.shortLabel || tool.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
