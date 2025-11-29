'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowRight, BookOpen, PenLine, Shield, 
  MessageCircle, Clock, Heart, FileText, AlertCircle,
  Brain, Scale, ShieldAlert, Users, Home, Target, Eye,
  Lock, Trophy, Sparkles, BarChart3, Mail, RefreshCw,
  CheckSquare, DoorOpen, RefreshCcw
} from 'lucide-react'
import { 
  PROBLEMS, 
  getToolsByProblem, 
  type ProblemTag, 
  type ProblemConfig,
  type ToolConfig 
} from '@/lib/tools-config'

// =============================================================================
// HUB DE PROBLEMA - Página dedicada para cada tipo de problema
// REFATORADO: Agora lê ferramentas do TOOLS config
// Rota: /hub/invalidacao, /hub/gaslighting, etc.
// =============================================================================

// Mapeamento de ícones para componentes Lucide
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, PenLine, MessageCircle, BookOpen, Eye, Clock, Shield, Lock, Trophy,
  Sparkles, BarChart3, Mail, RefreshCw, CheckSquare, DoorOpen, FileText,
  RefreshCcw, Heart, AlertCircle, Brain, Scale, ShieldAlert, Users
}

// Dados estáticos por problema (descrições, mensagens de validação)
interface ProblemStaticData {
  subtitle: string
  description: string
  validationMessage: string
  bgGradient: string
  relatedContent: { title: string; href: string }[]
}

const PROBLEM_STATIC_DATA: Record<ProblemTag, ProblemStaticData> = {
  invalidacao: {
    subtitle: 'Quando tudo o que você sente é minimizado ou ridicularizado',
    description: 'A invalidação emocional acontece quando seus sentimentos, pensamentos ou experiências são descartados, ignorados ou julgados. Frases como "você está exagerando", "isso não é nada", "você é muito sensível" são exemplos clássicos.',
    validationMessage: 'Você não está exagerando. O que você sente é real e válido. Sua percepção importa.',
    bgGradient: 'from-rose-500 to-pink-600',
    relatedContent: [
      { title: 'O que é invalidação emocional?', href: '/biblioteca-respostas?tema=invalidacao' },
      { title: 'Como responder à invalidação', href: '/biblioteca-respostas?tema=respostas-invalidacao' },
      { title: 'Diferença entre invalidação e crítica construtiva', href: '/biblioteca-respostas?tema=invalidacao-vs-critica' },
    ]
  },
  gaslighting: {
    subtitle: 'Quando fazem você duvidar da própria memória e percepção',
    description: 'Gaslighting é uma forma de manipulação psicológica onde a pessoa faz você questionar sua própria realidade, memória e sanidade. "Isso nunca aconteceu", "você está inventando", "eu nunca disse isso" são táticas comuns.',
    validationMessage: 'Você não está ficando louca. Sua memória está certa. Confie no que você viveu.',
    bgGradient: 'from-purple-500 to-indigo-600',
    relatedContent: [
      { title: 'O que é gaslighting?', href: '/biblioteca-respostas?tema=gaslighting' },
      { title: 'Sinais de que você está sofrendo gaslighting', href: '/biblioteca-respostas?tema=sinais-gaslighting' },
      { title: 'Como documentar gaslighting', href: '/biblioteca-respostas?tema=documentar-gaslighting' },
    ]
  },
  criminalizacao: {
    subtitle: 'Quando usam a lei ou ameaças jurídicas para te controlar',
    description: 'Algumas pessoas usam ameaças de processos, guarda de filhos, ou acusações falsas como forma de controle e intimidação. Isso é uma tática de abuso que visa paralisar você pelo medo.',
    validationMessage: 'Você tem direitos. Documente tudo com segurança. Não está sozinha.',
    bgGradient: 'from-amber-500 to-orange-600',
    relatedContent: [
      { title: 'Criminalização como tática de abuso', href: '/biblioteca-respostas?tema=criminalizacao' },
      { title: 'Como se proteger de falsas acusações', href: '/biblioteca-respostas?tema=falsas-acusacoes' },
      { title: 'Documentação para proteção legal', href: '/biblioteca-respostas?tema=documentacao-legal' },
    ]
  },
  manipulacao: {
    subtitle: 'Quando usam culpa, chantagem ou vitimismo para te controlar',
    description: 'A manipulação emocional usa seus sentimentos contra você. Chantagem emocional, culpa, vitimismo, love bombing seguido de punição - são táticas para manter controle sobre suas decisões e emoções.',
    validationMessage: 'Reconhecer a manipulação é o primeiro passo para se libertar. Você não é responsável pelas emoções dele.',
    bgGradient: 'from-pink-500 to-rose-600',
    relatedContent: [
      { title: 'O que é manipulação emocional?', href: '/biblioteca-respostas?tema=manipulacao' },
      { title: 'Ciclo do abuso narcisista', href: '/biblioteca-respostas?tema=ciclo-abuso' },
      { title: 'Como sair do ciclo de manipulação', href: '/biblioteca-respostas?tema=sair-ciclo' },
    ]
  },
  ameacas: {
    subtitle: 'Quando você sente medo real pela sua segurança',
    description: 'Se você sente medo físico, emocional ou financeiro, isso é sério. Ameaças diretas ou veladas, intimidação, destruição de objetos, ou qualquer comportamento que te faça sentir em perigo precisa ser tratado com prioridade.',
    validationMessage: 'Sua segurança é prioridade absoluta. Você não está sozinha. Existe ajuda.',
    bgGradient: 'from-red-500 to-rose-600',
    relatedContent: [
      { title: 'Sinais de perigo em relacionamentos', href: '/biblioteca-respostas?tema=sinais-perigo' },
      { title: 'Como criar um plano de fuga', href: '/biblioteca-respostas?tema=plano-fuga' },
      { title: 'Recursos de emergência', href: '/biblioteca-respostas?tema=recursos-emergencia' },
    ]
  },
  isolamento: {
    subtitle: 'Quando te afastam de amigos, família e rede de apoio',
    description: 'O isolamento é uma tática de controle onde a pessoa te afasta gradualmente de amigos, família e qualquer rede de apoio. Pode ser sutil ("sua família não te entende") ou direto (proibições, ciúmes extremos).',
    validationMessage: 'Você merece conexões saudáveis. O isolamento é uma tática, não uma escolha sua. Não está sozinha.',
    bgGradient: 'from-slate-500 to-gray-600',
    relatedContent: [
      { title: 'O que é isolamento em relacionamentos abusivos?', href: '/biblioteca-respostas?tema=isolamento' },
      { title: 'Como reconectar com sua rede de apoio', href: '/biblioteca-respostas?tema=reconectar-rede' },
      { title: 'Sinais de controle e ciúmes excessivos', href: '/biblioteca-respostas?tema=controle-ciumes' },
    ]
  },
  autoestima_baixa: {
    subtitle: 'Quando você perdeu a conexão consigo mesma',
    description: 'Relacionamentos abusivos frequentemente destroem a autoestima. Você pode ter perdido a noção de quem é, do que gosta, do que merece. Isso não é fraqueza - é resultado de manipulação sistemática.',
    validationMessage: 'Você é valiosa. O que aconteceu não define quem você é. Sua força está em reconhecer isso.',
    bgGradient: 'from-indigo-500 to-purple-600',
    relatedContent: [
      { title: 'Como o abuso afeta a autoestima', href: '/biblioteca-respostas?tema=autoestima' },
      { title: 'Reconectando com quem você é', href: '/biblioteca-respostas?tema=reconectar-identidade' },
      { title: 'Pequenos passos para se fortalecer', href: '/biblioteca-respostas?tema=fortalecer-autoestima' },
    ]
  }
}

// Função para obter ícone do problema
function getProblemIcon(problemConfig: ProblemConfig) {
  const IconComponent = ICON_MAP[problemConfig.icon] || AlertCircle
  return <IconComponent className="w-8 h-8" />
}

// Função para obter ícone da ferramenta
function getToolIcon(tool: ToolConfig) {
  const IconComponent = ICON_MAP[tool.icon] || Target
  return <IconComponent className="w-5 h-5" />
}

export default function ProblemHubPage() {
  const params = useParams()
  const router = useRouter()
  const problema = params.problema as string

  // Buscar configuração do problema no PROBLEMS config
  const problemConfig = PROBLEMS.find(p => p.id === problema)
  const staticData = PROBLEM_STATIC_DATA[problema as ProblemTag]
  
  // Buscar ferramentas recomendadas do TOOLS config
  const tools = getToolsByProblem(problema as ProblemTag)
  
  if (!problemConfig || !staticData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Problema não encontrado</h1>
          <p className="text-gray-500 mb-6">O tipo de problema &quot;{problema}&quot; não existe.</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Aviso de Responsabilidade - Topo Fixo */}
      <div className="sticky top-0 z-40 bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <p className="text-xs text-amber-800 text-center">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            <strong>Aviso:</strong> Informações educativas baseadas na sua perspectiva. Não é diagnóstico. 
            Mentir para prejudicar alguém é crime. Você é responsável pelo que relata.
          </p>
        </div>
      </div>

      {/* Header com gradiente */}
      <div className={`bg-gradient-to-r ${staticData.bgGradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Navegação */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
            </Link>
          </div>

          {/* Título - usa dados do PROBLEMS config */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              {getProblemIcon(problemConfig)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{problemConfig.label}</h1>
              <p className="text-white/80 text-sm sm:text-base">{staticData.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Mensagem de validação */}
        <div className={`${problemConfig.bgColor} border ${problemConfig.borderColor.replace('hover:', '')} rounded-2xl p-6 mb-8`}>
          <p className={`${problemConfig.color} font-medium text-center text-lg`}>
            💜 {staticData.validationMessage}
          </p>
        </div>

        {/* Descrição */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">O que é isso?</h2>
          <p className="text-gray-600 leading-relaxed">{staticData.description}</p>
        </div>

        {/* Ferramentas recomendadas - AGORA LÊ DO TOOLS CONFIG */}
        <div className="mb-8">
          <h2 className="font-bold text-gray-900 text-lg mb-4">
            Ferramentas recomendadas para você
            <span className="text-sm font-normal text-gray-500 ml-2">({tools.length} disponíveis)</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool: ToolConfig, i: number) => {
              const isPrimary = i === 0 // Primeira ferramenta é destacada
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`flex items-center gap-4 p-5 rounded-xl transition-all group ${
                    isPrimary 
                      ? `bg-gradient-to-r ${staticData.bgGradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02]` 
                      : 'bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${isPrimary ? 'bg-white/20' : 'bg-purple-50'}`}>
                    <span className={isPrimary ? 'text-white' : 'text-purple-600'}>
                      {getToolIcon(tool)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
                      {tool.name}
                    </p>
                    <p className={`text-sm ${isPrimary ? 'text-white/80' : 'text-gray-500'}`}>
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                    isPrimary ? 'text-white' : 'text-purple-400'
                  }`} />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Conteúdos relacionados */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Conteúdos relacionados</h2>
          <div className="space-y-2">
            {staticData.relatedContent.map((content: { title: string; href: string }, i: number) => (
              <Link
                key={i}
                href={content.href}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{content.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Precisa de apoio imediato?</p>
          <Link
            href={`/chat?contexto=${problema}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Conversar com Coach IA agora
          </Link>
        </div>

        {/* Aviso de Responsabilidade */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-amber-800 font-medium">
                ⚠️ Aviso de Responsabilidade
              </p>
              <p className="text-xs text-amber-700">
                As informações aqui são educativas e baseadas <strong>apenas na sua perspectiva</strong>. 
                A IA não conhece o outro lado da história. Não substitui avaliação profissional. 
                Mentir para prejudicar alguém é crime (Art. 299 CP). Você é responsável pelo que relata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
