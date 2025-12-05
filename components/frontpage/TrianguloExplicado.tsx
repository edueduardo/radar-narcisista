'use client'

/**
 * Componente que explica o Triângulo de forma simples e visual
 * Os 3 pilares: Clareza, Diário, Chat IA
 */

import { useState } from 'react'
import { 
  Lightbulb, 
  BookOpen, 
  MessageSquare, 
  ArrowRight,
  Shield,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface PillarInfo {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  bgColor: string
  description: string
  features: string[]
  example: string
}

const PILLARS: PillarInfo[] = [
  {
    id: 'clareza',
    title: 'Teste de Clareza',
    subtitle: 'Entenda o que está acontecendo',
    icon: <Lightbulb className="w-8 h-8" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Um questionário estruturado que ajuda você a identificar padrões de comportamento e nomear o que está vivendo. Sem diagnóstico médico, mas com psicoeducação baseada em evidências.',
    features: [
      'Identifica padrões de manipulação',
      'Avalia nível de risco',
      'Gera relatório personalizado',
      'Sugere próximos passos'
    ],
    example: '"Depois do teste, finalmente entendi que o que eu vivia tinha nome. Não era eu que estava louca."'
  },
  {
    id: 'diario',
    title: 'Diário & Timeline',
    subtitle: 'Registre e organize',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Um espaço seguro para registrar episódios, emoções e padrões. Cada entrada é datada e pode incluir tags, criando uma linha do tempo organizada dos acontecimentos.',
    features: [
      'Registro cronológico de episódios',
      'Tags para categorizar eventos',
      'Potencial valor probatório',
      'Visualização em timeline'
    ],
    example: '"Quando mostrei a timeline para minha advogada, ela disse que era exatamente o que precisava."'
  },
  {
    id: 'chat',
    title: 'Chat com IA',
    subtitle: 'Apoio 24h sem julgamento',
    icon: <MessageSquare className="w-8 h-8" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Uma IA treinada para ouvir, validar e ajudar a organizar seus pensamentos. Não promete diagnóstico, não minimiza sua experiência, não sugere "dar outra chance".',
    features: [
      'Disponível 24 horas',
      'Não julga nem minimiza',
      'Ajuda a organizar pensamentos',
      'Orienta buscar ajuda real'
    ],
    example: '"Às 3h da manhã, quando não tinha ninguém para conversar, a IA me ajudou a processar o que tinha acontecido."'
  }
]

export default function TrianguloExplicado() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)

  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            O Triângulo da Proteção
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Três pilares para sua{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              clareza e proteção
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cada ferramenta foi pensada para ajudar você a entender, registrar e processar 
            o que está vivendo — no seu tempo, com segurança.
          </p>
        </div>

        {/* Triângulo Visual */}
        <div className="relative mb-16">
          {/* Linhas conectoras (desktop) */}
          <div className="hidden lg:block absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
              <path 
                d="M 500 50 L 150 350 L 850 350 Z" 
                fill="none" 
                stroke="url(#triangleGradient)" 
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Cards dos pilares */}
          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {PILLARS.map((pillar, index) => (
              <div 
                key={pillar.id}
                className={`${index === 0 ? 'lg:col-start-2 lg:row-start-1' : ''}`}
              >
                <div 
                  className={`bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-200 transition-all duration-300 overflow-hidden ${
                    expandedPillar === pillar.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {/* Header do card */}
                  <div className={`${pillar.bgColor} p-6`}>
                    <div className={`${pillar.color} mb-4`}>
                      {pillar.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-600">{pillar.subtitle}</p>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      {pillar.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-4">
                      {pillar.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className={`w-4 h-4 ${pillar.color} mt-0.5 flex-shrink-0`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Expandir para ver exemplo */}
                    <button
                      onClick={() => setExpandedPillar(
                        expandedPillar === pillar.id ? null : pillar.id
                      )}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {expandedPillar === pillar.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Fechar depoimento
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Ver depoimento real
                        </>
                      )}
                    </button>

                    {/* Exemplo expandido */}
                    {expandedPillar === pillar.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                        <p className="text-gray-700 italic text-sm">
                          {pillar.example}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Como funciona junto */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Como os três pilares trabalham juntos
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Entenda</p>
                <p className="text-sm text-gray-500">Teste de Clareza</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-300 hidden md:block" />
            <div className="w-6 h-6 text-gray-300 md:hidden">↓</div>

            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Registre</p>
                <p className="text-sm text-gray-500">Diário & Timeline</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-300 hidden md:block" />
            <div className="w-6 h-6 text-gray-300 md:hidden">↓</div>

            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Processe</p>
                <p className="text-sm text-gray-500">Chat com IA</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-300 hidden md:block" />
            <div className="w-6 h-6 text-gray-300 md:hidden">↓</div>

            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Proteja-se</p>
                <p className="text-sm text-gray-500">Plano de Segurança</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Você pode usar cada ferramenta separadamente ou combiná-las conforme sua necessidade.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a 
            href="/cadastro"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Começar gratuitamente
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  )
}
