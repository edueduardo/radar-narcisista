'use client'

/**
 * Control Tower - Console Dev Global
 * ETAPA 32 - BLOCO 32-35
 * 
 * Página principal da Control Tower que lista todos os projetos
 * do ecossistema (Radar Mãe, White Labels, SaaS gerados)
 */

import { useState, useEffect } from 'react'
import { 
  Building2, Server, Globe, Layers, Activity, 
  CheckCircle2, PauseCircle, XCircle, Link2, 
  Settings, Users, Flag, RefreshCw, Plus,
  ChevronRight, Zap, Shield, Clock
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

interface ProjectCore {
  id: string
  slug: string
  nome_publico: string
  tipo_projeto: 'radar_mae' | 'white_label' | 'saas_tema' | 'saas_branco'
  tema: string | null
  status: 'ativo' | 'pausado' | 'desligado'
  core_version: string
  vinculo_nucleo: 'ligado' | 'em_transicao' | 'desligado'
  politica_suporte: 'monitorado' | 'sob_demanda' | 'sem_suporte'
  url_publica: string | null
  url_admin: string | null
  data_criacao: string
  data_ultima_atividade: string | null
  total_owners?: number
  total_flags?: number
}

interface Stats {
  total_projetos: number
  por_tipo: Record<string, number>
  por_status: Record<string, number>
  por_vinculo: Record<string, number>
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: number | string
  icon: React.ElementType
  color: string 
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('border-l-4', 'bg')}`}>
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  )
}

function TipoProjetoBadge({ tipo }: { tipo: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    radar_mae: { label: 'Radar Mãe', color: 'bg-purple-100 text-purple-800', icon: Building2 },
    white_label: { label: 'White Label', color: 'bg-blue-100 text-blue-800', icon: Layers },
    saas_tema: { label: 'SaaS Tema', color: 'bg-green-100 text-green-800', icon: Globe },
    saas_branco: { label: 'SaaS Branco', color: 'bg-gray-100 text-gray-800', icon: Server }
  }
  
  const { label, color, icon: Icon } = config[tipo] || config.saas_branco
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    pausado: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
    desligado: { label: 'Desligado', color: 'bg-red-100 text-red-800', icon: XCircle }
  }
  
  const { label, color, icon: Icon } = config[status] || config.desligado
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function VinculoBadge({ vinculo }: { vinculo: string }) {
  const config: Record<string, { label: string; color: string }> = {
    ligado: { label: '🔗 Ligado', color: 'text-green-600' },
    em_transicao: { label: '⏳ Em Transição', color: 'text-yellow-600' },
    desligado: { label: '🔓 Desligado', color: 'text-gray-500' }
  }
  
  const { label, color } = config[vinculo] || config.desligado
  
  return <span className={`text-xs font-medium ${color}`}>{label}</span>
}

function SuporteBadge({ politica }: { politica: string }) {
  const config: Record<string, { label: string; icon: React.ElementType }> = {
    monitorado: { label: 'Monitorado', icon: Activity },
    sob_demanda: { label: 'Sob Demanda', icon: Clock },
    sem_suporte: { label: 'Sem Suporte', icon: Shield }
  }
  
  const { label, icon: Icon } = config[politica] || config.sem_suporte
  
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ControlTowerPage() {
  const [projects, setProjects] = useState<ProjectCore[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectCore | null>(null)

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/admin/control-tower')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar dados')
      }
      
      setProjects(data.projects || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Formatar data
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-600" />
            Control Tower
          </h1>
          <p className="text-gray-500 mt-1">
            Console Dev Global - Gerencie todos os projetos do ecossistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total de Projetos"
            value={stats.total_projetos}
            icon={Layers}
            color="border-l-4 border-purple-500"
          />
          <StatCard
            title="Projetos Ativos"
            value={stats.por_status.ativo || 0}
            icon={CheckCircle2}
            color="border-l-4 border-green-500"
          />
          <StatCard
            title="White Labels"
            value={stats.por_tipo.white_label || 0}
            icon={Building2}
            color="border-l-4 border-blue-500"
          />
          <StatCard
            title="SaaS Gerados"
            value={(stats.por_tipo.saas_tema || 0) + (stats.por_tipo.saas_branco || 0)}
            icon={Globe}
            color="border-l-4 border-orange-500"
          />
        </div>
      )}

      {/* Lista de Projetos */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Projetos Registrados</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Carregando projetos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <Server className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Nenhum projeto registrado</p>
          </div>
        ) : (
          <div className="divide-y">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Ícone do tipo */}
                    <div className={`p-3 rounded-lg ${
                      project.tipo_projeto === 'radar_mae' ? 'bg-purple-100' :
                      project.tipo_projeto === 'white_label' ? 'bg-blue-100' :
                      project.tipo_projeto === 'saas_tema' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {project.tipo_projeto === 'radar_mae' ? <Building2 className="w-6 h-6 text-purple-600" /> :
                       project.tipo_projeto === 'white_label' ? <Layers className="w-6 h-6 text-blue-600" /> :
                       project.tipo_projeto === 'saas_tema' ? <Globe className="w-6 h-6 text-green-600" /> :
                       <Server className="w-6 h-6 text-gray-600" />}
                    </div>
                    
                    {/* Info do projeto */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{project.nome_publico}</h3>
                        <TipoProjetoBadge tipo={project.tipo_projeto} />
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="font-mono">{project.slug}</span>
                        {project.tema && (
                          <span>• {project.tema}</span>
                        )}
                        <span>• v{project.core_version}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info adicional */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <VinculoBadge vinculo={project.vinculo_nucleo} />
                      <div className="mt-1">
                        <SuporteBadge politica={project.politica_suporte} />
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.total_owners || 0} owners
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Flag className="w-3 h-3" />
                        {project.total_flags || 0} flags
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-gray-400">
                      <div>Criado: {formatDate(project.data_criacao)}</div>
                      <div>Atividade: {formatDate(project.data_ultima_atividade)}</div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                {/* URLs */}
                {(project.url_publica || project.url_admin) && (
                  <div className="mt-3 flex items-center gap-4 ml-16">
                    {project.url_publica && (
                      <a 
                        href={project.url_publica}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link2 className="w-3 h-3" />
                        URL Pública
                      </a>
                    )}
                    {project.url_admin && (
                      <a 
                        href={project.url_admin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="w-3 h-3" />
                        Admin
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes (simplificado) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div>
                <h2 className="text-xl font-semibold">{selectedProject.nome_publico}</h2>
                <p className="text-purple-200 text-sm">{selectedProject.slug}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                ✕
              </button>
            </div>
            
            {/* Conteúdo */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Tipo</label>
                  <div className="mt-1">
                    <TipoProjetoBadge tipo={selectedProject.tipo_projeto} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedProject.status} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Versão Core</label>
                  <p className="mt-1 font-mono">{selectedProject.core_version}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Tema</label>
                  <p className="mt-1">{selectedProject.tema || '-'}</p>
                </div>
              </div>
              
              {/* Vínculo e Suporte */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Vínculo com Núcleo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Vínculo</label>
                    <div className="mt-1">
                      <VinculoBadge vinculo={selectedProject.vinculo_nucleo} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Política de Suporte</label>
                    <div className="mt-1">
                      <SuporteBadge politica={selectedProject.politica_suporte} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* URLs */}
              <div>
                <h3 className="font-medium mb-3">URLs</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Pública:</span>
                    {selectedProject.url_publica ? (
                      <a href={selectedProject.url_publica} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {selectedProject.url_publica}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Admin:</span>
                    {selectedProject.url_admin ? (
                      <a href={selectedProject.url_admin} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm">
                        {selectedProject.url_admin}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Datas */}
              <div className="text-sm text-gray-500">
                <p>Criado em: {formatDate(selectedProject.data_criacao)}</p>
                <p>Última atividade: {formatDate(selectedProject.data_ultima_atividade)}</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Fechar
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Editar Projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
