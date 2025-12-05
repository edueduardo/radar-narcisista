'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ArrowRight, BookOpen, PenLine, Shield, MessageCircle, Clock, Heart, FileText } from 'lucide-react'

// =============================================================================
// PROBLEM HUB MODAL - Mostra ferramentas recomendadas para cada problema
// Criado para: Etapa 3 - Reorganização UX orientada a problemas reais
// =============================================================================

export type ProblemType = 
  | 'invalidacao' 
  | 'gaslighting' 
  | 'criminalizacao' 
  | 'manipulacao' 
  | 'ameacas' 
  | 'isolamento'

interface Tool {
  name: string
  description: string
  href: string
  icon: React.ReactNode
  primary?: boolean
}

interface ProblemData {
  title: string
  subtitle: string
  description: string
  tools: Tool[]
}

const PROBLEM_DATA: Record<ProblemType, ProblemData> = {
  invalidacao: {
    title: 'Invalidação',
    subtitle: 'Quando tudo o que você sente é minimizado ou ridicularizado',
    description: 'Você não está exagerando. O que você sente é real e válido.',
    tools: [
      { name: 'Modo Espelho', description: 'Reflita sobre o que aconteceu sem se culpar', href: '/modo-espelho', icon: <Heart className="w-5 h-5" /> },
      { name: 'Registrar Episódio', description: 'Documente frases de invalidação', href: '/diario/novo?tipo=invalidacao', icon: <PenLine className="w-5 h-5" />, primary: true },
      { name: 'Biblioteca', description: 'Entenda o padrão de invalidação', href: '/biblioteca-respostas?tema=invalidacao', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Carta para o Futuro', description: 'Escreva para ler quando duvidar de si', href: '/carta-futuro', icon: <FileText className="w-5 h-5" /> },
      { name: 'Coach IA', description: 'Converse sobre o que está sentindo', href: '/chat?contexto=invalidacao', icon: <MessageCircle className="w-5 h-5" /> },
    ]
  },
  gaslighting: {
    title: 'Gaslighting / Distorção',
    subtitle: 'Quando fazem você duvidar da própria memória e percepção',
    description: 'Você não está ficando louca. Sua memória está certa.',
    tools: [
      { name: 'Linha do Tempo', description: 'Compare o que foi dito antes e agora', href: '/linha-tempo', icon: <Clock className="w-5 h-5" />, primary: true },
      { name: 'Registrar Episódio', description: 'Documente antes que esqueça', href: '/diario/novo?tipo=gaslighting', icon: <PenLine className="w-5 h-5" /> },
      { name: 'Biblioteca', description: 'Artigos sobre gaslighting', href: '/biblioteca-respostas?tema=gaslighting', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Exportar Dados', description: 'Backup para terapeuta/advogada', href: '/configuracoes#exportar', icon: <FileText className="w-5 h-5" /> },
      { name: 'Coach IA', description: 'Validação e apoio imediato', href: '/chat?contexto=gaslighting', icon: <MessageCircle className="w-5 h-5" /> },
    ]
  },
  criminalizacao: {
    title: 'Criminalização / Ameaças Legais',
    subtitle: 'Quando usam a lei ou ameaças para te controlar',
    description: 'Você tem direitos. Documente tudo com segurança.',
    tools: [
      { name: 'Plano de Segurança', description: 'Organize sua proteção', href: '/plano-seguranca', icon: <Shield className="w-5 h-5" />, primary: true },
      { name: 'Segurança Digital', description: 'Proteja seus dados e acessos', href: '/seguranca-digital', icon: <Shield className="w-5 h-5" /> },
      { name: 'Seus Direitos (LGPD)', description: 'Conheça suas garantias legais', href: '/configuracoes#lgpd', icon: <FileText className="w-5 h-5" /> },
      { name: 'Registrar Episódio', description: 'Documente ameaças recebidas', href: '/diario/novo?tipo=ameaca', icon: <PenLine className="w-5 h-5" /> },
      { name: 'Coach IA', description: 'Orientação sobre próximos passos', href: '/chat?contexto=criminalizacao', icon: <MessageCircle className="w-5 h-5" /> },
    ]
  },
  manipulacao: {
    title: 'Manipulação Emocional',
    subtitle: 'Quando usam culpa, chantagem ou vitimismo para te controlar',
    description: 'Reconhecer a manipulação é o primeiro passo para se libertar.',
    tools: [
      { name: 'Teste de Clareza', description: 'Avalie a situação com clareza', href: '/teste-clareza', icon: <Heart className="w-5 h-5" />, primary: true },
      { name: 'Modo Espelho', description: 'Reflita sem culpa', href: '/modo-espelho', icon: <Heart className="w-5 h-5" /> },
      { name: 'Biblioteca', description: 'Padrões de manipulação', href: '/biblioteca-respostas?tema=manipulacao', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Registrar Episódio', description: 'Documente situações', href: '/diario/novo?tipo=manipulacao', icon: <PenLine className="w-5 h-5" /> },
      { name: 'Coach IA', description: 'Apoio para entender o ciclo', href: '/chat?contexto=manipulacao', icon: <MessageCircle className="w-5 h-5" /> },
    ]
  },
  ameacas: {
    title: 'Ameaças e Medo',
    subtitle: 'Quando você sente medo real pela sua segurança',
    description: 'Sua segurança é prioridade. Você não está sozinha.',
    tools: [
      { name: 'Plano de Segurança', description: 'Crie seu plano de proteção', href: '/plano-seguranca', icon: <Shield className="w-5 h-5" />, primary: true },
      { name: 'Modo Recaída', description: 'Apoio para momentos difíceis', href: '/modo-recaida', icon: <Heart className="w-5 h-5" /> },
      { name: 'Segurança Digital', description: 'Proteja suas comunicações', href: '/seguranca-digital', icon: <Shield className="w-5 h-5" /> },
      { name: 'Registrar Episódio', description: 'Documente ameaças', href: '/diario/novo?tipo=ameaca', icon: <PenLine className="w-5 h-5" /> },
      { name: 'Coach IA', description: 'Apoio imediato 24/7', href: '/chat?contexto=ameacas', icon: <MessageCircle className="w-5 h-5" /> },
    ]
  },
  isolamento: {
    title: 'Isolamento',
    subtitle: 'Quando te afastam de amigos, família e apoio',
    description: 'Você merece conexões saudáveis. Não está sozinha.',
    tools: [
      { name: 'Biblioteca', description: 'Entenda o isolamento como tática', href: '/biblioteca-respostas?tema=isolamento', icon: <BookOpen className="w-5 h-5" />, primary: true },
      { name: 'Registrar Episódio', description: 'Documente controle de contatos', href: '/diario/novo?tipo=isolamento', icon: <PenLine className="w-5 h-5" /> },
      { name: 'Carta para o Futuro', description: 'Lembre-se de quem você é', href: '/carta-futuro', icon: <FileText className="w-5 h-5" /> },
      { name: 'Coach IA', description: 'Converse sobre o que sente', href: '/chat?contexto=isolamento', icon: <MessageCircle className="w-5 h-5" /> },
      { name: 'Linha do Tempo', description: 'Veja o padrão de isolamento', href: '/linha-tempo', icon: <Clock className="w-5 h-5" /> },
    ]
  },
}

interface ProblemHubModalProps {
  problem: ProblemType | null
  onClose: () => void
}

export default function ProblemHubModal({ problem, onClose }: ProblemHubModalProps) {
  if (!problem) return null

  const data = PROBLEM_DATA[problem]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
          <p className="text-purple-100 text-sm">{data.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Mensagem de validação */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
            <p className="text-purple-800 font-medium text-center">
              💜 {data.description}
            </p>
          </div>

          {/* Ferramentas recomendadas */}
          <h3 className="font-semibold text-gray-900 mb-4">Ferramentas recomendadas para você:</h3>
          <div className="space-y-3">
            {data.tools.map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                onClick={onClose}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${
                  tool.primary 
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25' 
                    : 'bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${tool.primary ? 'bg-white/20' : 'bg-purple-100'}`}>
                  <span className={tool.primary ? 'text-white' : 'text-purple-600'}>{tool.icon}</span>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${tool.primary ? 'text-white' : 'text-gray-900'}`}>
                    {tool.name}
                  </p>
                  <p className={`text-sm ${tool.primary ? 'text-purple-100' : 'text-gray-500'}`}>
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                  tool.primary ? 'text-white' : 'text-purple-400'
                }`} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
