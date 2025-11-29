'use client'

import Link from 'next/link'
import { 
  Lightbulb, ArrowRight, Target, PenLine, MessageCircle, BookOpen, Eye, Clock,
  Shield, Lock, Trophy, Sparkles, BarChart3, Mail, RefreshCw, CheckSquare,
  DoorOpen, FileText, RefreshCcw
} from 'lucide-react'
import { getToolsByPlacement, ToolConfig } from '@/lib/tools-config'

// =============================================================================
// TIPS SECTION - Dicas Rápidas / Recomendações
// REFATORADO: Agora lê do TOOLS config (placement: 'tips_section')
// Mostra ferramentas recomendadas como dicas rápidas
// =============================================================================

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock, Shield, Lock, Trophy,
  Sparkles, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, FileText, RefreshCcw, Lightbulb
}

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Lightbulb
}

// Dicas estáticas que sempre aparecem
const STATIC_TIPS = [
  'Use o diário para registrar episódios assim que acontecerem',
  'O Coach IA está disponível 24/7 para apoio imediato',
  'Refaça o Teste de Clareza periodicamente para acompanhar evolução',
  'Suas configurações de privacidade podem ser ajustadas a qualquer momento',
]

export default function TipsSection() {
  // Busca ferramentas com placement 'tips_section' do config
  const tipTools = getToolsByPlacement('tips_section').slice(0, 3)

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        Dicas Rápidas
      </h3>
      
      {/* Dicas estáticas - TEMA ESCURO */}
      <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-400 mb-6">
        {STATIC_TIPS.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-violet-400">•</span>
            <p>{tip}</p>
          </div>
        ))}
      </div>

      {/* Ferramentas recomendadas - TEMA ESCURO */}
      {tipTools.length > 0 && (
        <div className="border-t border-slate-700/50 pt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Recomendado para você</p>
          <div className="grid sm:grid-cols-3 gap-2">
            {tipTools.map((tool) => {
              const IconComponent = getIcon(tool.icon)
              
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800 transition-colors group border border-slate-700/30 hover:border-violet-500/30"
                >
                  <div className="p-1.5 bg-violet-500/20 rounded-lg">
                    {tool.emoji ? (
                      <span className="text-lg">{tool.emoji}</span>
                    ) : (
                      <IconComponent className="w-4 h-4 text-violet-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-300 truncate">
                      {tool.shortLabel || tool.name}
                    </p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
