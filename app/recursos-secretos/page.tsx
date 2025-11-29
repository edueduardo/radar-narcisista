'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Shield, 
  Search, 
  Users, 
  Hammer,
  Eye,
  Download,
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react'

interface SecretResource {
  id: string
  name: string
  description: string
  icon: any
  category: string
  status: 'locked' | 'unlocked' | 'premium'
  action?: string
  warning?: string
}

export default function RecursosSecretosPage() {
  const [resources, setResources] = useState<SecretResource[]>([
    {
      id: 'laudos-medicos',
      name: 'Gerador de Laudos Médicos',
      description: 'Crie laudos profissionais para perícia psicológica com base em seus registros do diário',
      icon: FileText,
      category: 'Jurídico',
      status: 'unlocked',
      warning: 'Use apenas para fins legítimos e com acompanhamento profissional'
    },
    {
      id: 'simulador-audiencia',
      name: 'Simulador de Audiência',
      description: 'Pratique seu discurso para juiz, advogados e testemunhas com IA especializada',
      icon: Users,
      category: 'Jurídico',
      status: 'unlocked'
    },
    {
      id: 'banco-provas',
      name: 'Banco de Provas Automático',
      description: 'Organize evidências, cronologias e padrões de comportamento automaticamente',
      icon: Shield,
      category: 'Investigação',
      status: 'unlocked'
    },
    {
      id: 'detector-mentiras',
      name: 'Detector de Mentiras por IA',
      description: 'Analise padrões de linguagem, contradições e manipulações em conversas',
      icon: Search,
      category: 'Análise',
      status: 'unlocked',
      warning: 'Ferramenta de apoio, não substitui avaliação profissional'
    },
    {
      id: 'portal-ongs',
      name: 'Portal ONGs Parceiras',
      description: 'Acesso direto a organizações de apoio jurídico gratuito e psicoterapia',
      icon: Users,
      category: 'Apoio',
      status: 'unlocked'
    },
    {
      id: 'dossier-completo',
      name: 'Gerador de Dossier',
      description: 'Crie relatório completo para advogados com todas as evidências organizadas',
      icon: FileText,
      category: 'Jurídico',
      status: 'premium'
    },
    {
      id: 'rastreamento-digital',
      name: 'Rastreamento Digital',
      description: 'Monitore atividades digitais suspeitas e colete provas admissíveis',
      icon: Eye,
      category: 'Investigação',
      status: 'premium',
      warning: 'Use conforme legislação local sobre privacidade'
    },
    {
      id: 'rede-protecao',
      name: 'Rede de Proteção Internacional',
      description: 'Conecte-se com redes de apoio global para casos extremos',
      icon: Shield,
      category: 'Apoio',
      status: 'premium'
    },
    {
      id: 'pericia-forense',
      name: 'Análise Forense Digital',
      description: 'Análise técnica de dispositivos para recuperação de evidências',
      icon: Search,
      category: 'Investigação',
      status: 'locked'
    },
    {
      id: 'esquema-seguranca',
      name: 'Esquema de Segurança Pessoal',
      description: 'Plano completo de segurança pessoal e fuga para emergências',
      icon: Hammer,
      category: 'Proteção',
      status: 'premium'
    }
  ])

  const [selectedResource, setSelectedResource] = useState<SecretResource | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Easter egg ativado - marcar como descoberto
    localStorage.setItem('rn_secret_resources_unlocked', 'true')
    
    // Animação de revelação
    const timer = setTimeout(() => {
      setResources(prev => prev.map(r => 
        r.status === 'locked' ? { ...r, status: 'unlocked' as const } : r
      ))
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleResourceClick = (resource: SecretResource) => {
    if (resource.warning) {
      setSelectedResource(resource)
      setShowWarning(true)
    } else {
      activateResource(resource)
    }
  }

  const activateResource = (resource: SecretResource) => {
    // Simular ativação
    alert(`🔓 ${resource.name} ativado!\n\nEm produção, isso abriria a funcionalidade completa.`)
    
    // Marcar como usado
    const used = JSON.parse(localStorage.getItem('rn_secret_resources_used') || '[]')
    used.push({
      id: resource.id,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('rn_secret_resources_used', JSON.stringify(used))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unlocked': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'premium': return <Lock className="w-5 h-5 text-yellow-400" />
      default: return <Lock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unlocked': return 'Disponível'
      case 'premium': return 'Premium'
      default: return 'Bloqueado'
    }
  }

  const categories = Array.from(new Set(resources.map(r => r.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header Secreto */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Recursos Secretos</h1>
                <p className="text-sm text-purple-400">Ferramentas exclusivas desbloqueadas</p>
              </div>
            </div>
            
            <Link 
              href="/"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Fechar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Mensagem de Boas-vindas */}
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">🌟 Portal Secreto Aberto!</h2>
              <p className="text-purple-200 mb-4">
                Você descobriu o acesso exclusivo às ferramentas avançadas do Radar Narcisista. 
                Estes recursos foram desenvolvidos para situações críticas que exigem intervenção jurídica, 
                proteção pessoal ou coleta de evidências.
              </p>
              <div className="flex items-center gap-4 text-sm text-purple-300">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {resources.filter(r => r.status === 'unlocked').length} disponíveis
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  {resources.filter(r => r.status === 'premium').length} premium
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros por Categoria */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grade de Recursos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <div
                key={resource.id}
                className={`bg-slate-900 rounded-xl p-6 border transition-all hover:shadow-lg hover:shadow-purple-500/20 ${
                  resource.status === 'unlocked' 
                    ? 'border-purple-500/50 cursor-pointer' 
                    : resource.status === 'premium'
                      ? 'border-yellow-500/50 cursor-pointer'
                      : 'border-slate-800 opacity-50'
                }`}
                onClick={() => handleResourceClick(resource)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${
                      resource.status === 'unlocked' ? 'text-purple-400' :
                      resource.status === 'premium' ? 'text-yellow-400' :
                      'text-slate-400'
                    }`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(resource.status)}
                    <span className="text-xs text-slate-400">
                      {getStatusText(resource.status)}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {resource.name}
                </h3>
                
                <p className="text-slate-400 text-sm mb-4">
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {resource.category}
                  </span>
                  
                  {resource.status !== 'locked' && (
                    <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
                      Ativar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {resource.warning && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-yellow-300 text-xs">
                        {resource.warning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Aviso Legal */}
        <div className="mt-12 p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Aviso Importante</h3>
              <p className="text-red-300 text-sm mb-3">
                Estes recursos são ferramentas de apoio e não substituem orientação jurídica ou psicológica profissional. 
                Use-os de forma ética e em conformidade com a legislação local.
              </p>
              <p className="text-red-300 text-sm">
                O Radar Narcisista não se responsabiliza pelo uso indevido destas funcionalidades. 
                Em caso de emergência, ligue 190 (Polícia) ou 188 (CVV).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Aviso */}
      {showWarning && selectedResource && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-yellow-500/50">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Aviso de Uso
                </h3>
                <p className="text-slate-300 text-sm">
                  {selectedResource.warning}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  activateResource(selectedResource)
                  setShowWarning(false)
                  setSelectedResource(null)
                }}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Entendido, Ativar
              </button>
              <button
                onClick={() => {
                  setShowWarning(false)
                  setSelectedResource(null)
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
