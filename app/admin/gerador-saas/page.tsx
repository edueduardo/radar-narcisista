'use client'

/**
 * Gerador de SaaS - UI Admin
 * ETAPA 46 - Interface para criar novos SaaS a partir do RADAR-CORE
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Rocket,
  Box,
  FileCode,
  Copy,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Trash2,
  Settings,
  Globe,
  Palette,
  Database,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  CreditCard,
  Info,
  Github,
  Key,
  Building
} from 'lucide-react'

// Tipos
type ProjectType = 'SAAS_TEMATICO' | 'CORE_BRANCO'
type ProjectStatus = 'creating' | 'ready' | 'error'

interface GeneratedProject {
  id: string
  name: string
  type: ProjectType
  description: string
  origin: string
  createdAt: string
  status: ProjectStatus
  features: string[]
}

// Módulos disponíveis para incluir
const AVAILABLE_MODULES = [
  { id: 'oraculo_v1', name: 'Oráculo V1 (Painel Admin)', icon: BarChart3, default: true },
  { id: 'oraculo_v2', name: 'Oráculo V2 (IA Suporte)', icon: MessageSquare, default: true },
  { id: 'planos', name: 'Sistema de Planos', icon: CreditCard, default: true },
  { id: 'auth', name: 'Autenticação Supabase', icon: Shield, default: true },
  { id: 'admin', name: 'Painel Admin Completo', icon: Settings, default: true },
  { id: 'analytics', name: 'Analytics Dashboard', icon: BarChart3, default: false },
  { id: 'webhooks', name: 'Sistema de Webhooks', icon: Zap, default: false },
  { id: 'multi_tenant', name: 'Multi-tenant (Whitelabel)', icon: Users, default: false },
]

export default function GeradorSaasPage() {
  const [projects, setProjects] = useState<GeneratedProject[]>([
    // Projeto de exemplo
    {
      id: 'demo-1',
      name: 'Radar Co-Parent',
      type: 'SAAS_TEMATICO',
      description: 'SaaS para co-parentalidade saudável',
      origin: 'RADAR-CORE@BLOCO-44',
      createdAt: '2025-12-01',
      status: 'ready',
      features: ['oraculo_v1', 'oraculo_v2', 'planos', 'auth', 'admin']
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'SAAS_TEMATICO' as ProjectType,
    description: '',
    selectedModules: ['oraculo_v1', 'oraculo_v2', 'planos', 'auth', 'admin']
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadReady, setDownloadReady] = useState<{ name: string; files: any[] } | null>(null)
  
  // GitHub integration
  const [showGitHubModal, setShowGitHubModal] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [githubConnected, setGithubConnected] = useState(false)
  const [githubUser, setGithubUser] = useState<{ login: string; name: string; avatar: string } | null>(null)
  const [githubOrgs, setGithubOrgs] = useState<{ login: string; avatar: string }[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [isCreatingRepo, setIsCreatingRepo] = useState(false)
  const [selectedProjectForGithub, setSelectedProjectForGithub] = useState<GeneratedProject | null>(null)

  const handleCreate = async () => {
    setIsGenerating(true)
    
    try {
      // Chamar API para criar projeto
      const response = await fetch('/api/admin/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          modules: formData.selectedModules
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar projeto')
      }

      // Adicionar projeto à lista local
      const newProject: GeneratedProject = {
        id: data.project?.id || `proj-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        origin: 'RADAR-CORE@BLOCO-44',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'creating',
        features: formData.selectedModules
      }

      setProjects(prev => [newProject, ...prev])
      setShowCreateModal(false)
      setFormData({
        name: '',
        type: 'SAAS_TEMATICO',
        description: '',
        selectedModules: ['oraculo_v1', 'oraculo_v2', 'planos', 'auth', 'admin']
      })

      // Simular finalização (em produção, seria via webhook/polling)
      setTimeout(() => {
        setProjects(prev => prev.map(p => 
          p.id === newProject.id ? { ...p, status: 'ready' as ProjectStatus } : p
        ))
      }, 3000)

    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      alert('Erro ao criar projeto. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Gerar e baixar Core Branco
  const handleDownloadCoreBranco = async (project: GeneratedProject) => {
    try {
      const response = await fetch('/api/admin/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          projectSlug: project.name.toLowerCase().replace(/\s+/g, '-'),
          projectType: project.type,
          projectDescription: project.description,
          modules: project.features
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar código')
      }

      setDownloadReady({ name: project.name, files: data.files })
    } catch (error) {
      console.error('Erro ao gerar código:', error)
      alert('Erro ao gerar código. Tente novamente.')
    }
  }

  // Baixar como ZIP (simulado - em produção usaria JSZip)
  const handleDownloadZip = () => {
    if (!downloadReady) return
    
    // Criar conteúdo do ZIP como texto (simulado)
    const content = downloadReady.files.map(f => 
      `=== ${f.path} ===\n${f.content}\n`
    ).join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${downloadReady.name.toLowerCase().replace(/\s+/g, '-')}-core.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setDownloadReady(null)
  }

  // Verificar conexão GitHub
  const handleConnectGitHub = async () => {
    if (!githubToken) {
      alert('Digite seu token do GitHub')
      return
    }

    try {
      const response = await fetch(`/api/admin/generator/github?token=${encodeURIComponent(githubToken)}`)
      const data = await response.json()

      if (data.connected) {
        setGithubConnected(true)
        setGithubUser(data.user)
        setGithubOrgs(data.organizations || [])
      } else {
        alert(data.error || 'Erro ao conectar com GitHub')
      }
    } catch (error) {
      console.error('Erro ao conectar GitHub:', error)
      alert('Erro ao conectar com GitHub')
    }
  }

  // Criar repositório no GitHub
  const handleCreateGitHubRepo = async () => {
    if (!selectedProjectForGithub || !githubToken) return

    setIsCreatingRepo(true)

    try {
      // Primeiro, gerar os arquivos
      const generateResponse = await fetch('/api/admin/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: selectedProjectForGithub.name,
          projectSlug: selectedProjectForGithub.name.toLowerCase().replace(/\s+/g, '-'),
          projectType: selectedProjectForGithub.type,
          projectDescription: selectedProjectForGithub.description,
          modules: selectedProjectForGithub.features
        })
      })

      const generateData = await generateResponse.json()
      if (!generateResponse.ok) throw new Error(generateData.error)

      // Criar repo no GitHub
      const repoResponse = await fetch('/api/admin/generator/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: selectedProjectForGithub.name.toLowerCase().replace(/\s+/g, '-'),
          description: selectedProjectForGithub.description,
          isPrivate: true,
          files: generateData.files,
          githubToken,
          organization: selectedOrg || undefined
        })
      })

      const repoData = await repoResponse.json()
      if (!repoResponse.ok) throw new Error(repoData.error || repoData.details)

      alert(`✅ Repositório criado com sucesso!\n\n${repoData.repo.url}`)
      setShowGitHubModal(false)
      setSelectedProjectForGithub(null)

    } catch (error: any) {
      console.error('Erro ao criar repo:', error)
      alert(`Erro ao criar repositório: ${error.message}`)
    } finally {
      setIsCreatingRepo(false)
    }
  }

  // Abrir modal GitHub para um projeto
  const handleOpenGitHubModal = (project: GeneratedProject) => {
    setSelectedProjectForGithub(project)
    setShowGitHubModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este projeto da lista?')) {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  const toggleModule = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(m => m !== moduleId)
        : [...prev.selectedModules, moduleId]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="w-6 h-6 text-purple-400" />
              Gerador de SaaS
            </h1>
            <p className="text-gray-400">Crie novos projetos a partir do RADAR-CORE</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Rocket className="w-4 h-4" />
          Criar Novo Projeto
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400">Como funciona o Gerador de SaaS</h3>
            <p className="text-sm text-gray-300 mt-1">
              O Gerador usa o <strong>RADAR-CORE</strong> como blueprint para criar novos projetos independentes.
              Cada projeto gerado possui seu próprio código, banco de dados e documentação.
              Após criado, o projeto é <strong>100% independente</strong> e não recebe atualizações automáticas do RADAR-CORE.
            </p>
          </div>
        </div>
      </div>

      {/* Tipos de Projeto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold">SaaS Temático</h3>
          </div>
          <p className="text-sm text-gray-400">
            Projeto completo com tema específico (ex: igrejas, clínicas, escolas).
            Inclui textos, cores e configurações personalizadas para o nicho.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Box className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold">Core Branco</h3>
          </div>
          <p className="text-sm text-gray-400">
            Template neutro sem tema definido. Ideal para personalização manual
            ou para servir como base de uma nova linhagem de SaaS.
          </p>
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-purple-400" />
          Projetos Gerados ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum projeto gerado ainda</p>
            <p className="text-sm">Clique em "Criar Novo Projeto" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      project.type === 'SAAS_TEMATICO' 
                        ? 'bg-purple-500/20' 
                        : 'bg-cyan-500/20'
                    }`}>
                      {project.type === 'SAAS_TEMATICO' 
                        ? <Palette className="w-5 h-5 text-purple-400" />
                        : <Box className="w-5 h-5 text-cyan-400" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {project.origin}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.createdAt}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          project.status === 'ready' ? 'text-green-400' :
                          project.status === 'creating' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {project.status === 'ready' && <CheckCircle className="w-3 h-3" />}
                          {project.status === 'creating' && <Clock className="w-3 h-3 animate-spin" />}
                          {project.status === 'ready' ? 'Pronto' : 
                           project.status === 'creating' ? 'Criando...' : 'Erro'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.features.map(f => (
                          <span key={f} className="px-2 py-0.5 bg-slate-600 rounded text-xs">
                            {AVAILABLE_MODULES.find(m => m.id === f)?.name || f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.status === 'ready' && (
                      <>
                        <button
                          onClick={() => setShowInstructionsModal(project.id)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Ver instruções"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `git clone https://github.com/sua-org/${project.name.toLowerCase().replace(/\s+/g, '-')}.git`
                            )
                          }}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Copiar comando clone"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadCoreBranco(project)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Gerar e Baixar Código"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenGitHubModal(project)}
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Criar Repositório no GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar Projeto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                Criar Novo Projeto
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Projeto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Radar Co-Parent, Clínica Saúde Mental..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Projeto</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, type: 'SAAS_TEMATICO' }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.type === 'SAAS_TEMATICO'
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="font-medium">SaaS Temático</p>
                    <p className="text-xs text-gray-400">Com tema e personalização</p>
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, type: 'CORE_BRANCO' }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.type === 'CORE_BRANCO'
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <Box className="w-5 h-5 text-cyan-400 mb-2" />
                    <p className="font-medium">Core Branco</p>
                    <p className="text-xs text-gray-400">Template neutro</p>
                  </button>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito deste SaaS..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Módulos */}
              <div>
                <label className="block text-sm font-medium mb-2">Módulos Incluídos</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_MODULES.map(module => {
                    const Icon = module.icon
                    const isSelected = formData.selectedModules.includes(module.id)
                    return (
                      <button
                        key={module.id}
                        onClick={() => toggleModule(module.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                        <span>{module.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name || isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Criar Projeto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Instruções */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold">Instruções de Uso</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">1. Clone o repositório</h3>
                <code className="block bg-slate-900 p-3 rounded-lg text-sm text-green-400">
                  git clone https://github.com/sua-org/projeto.git
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Instale as dependências</h3>
                <code className="block bg-slate-900 p-3 rounded-lg text-sm text-green-400">
                  cd projeto && npm install
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Configure o ambiente</h3>
                <code className="block bg-slate-900 p-3 rounded-lg text-sm text-green-400">
                  cp .env.example .env.local
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Abra no Windsurf</h3>
                <p className="text-sm text-gray-400">
                  Abra a pasta do projeto no Windsurf e use os arquivos TUDO-PARA-O-GPT.txt
                  e ATLAS.txt como contexto para continuar o desenvolvimento.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setShowInstructionsModal(null)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal GitHub */}
      {showGitHubModal && selectedProjectForGithub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Github className="w-5 h-5" />
                Criar Repositório no GitHub
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Projeto: {selectedProjectForGithub.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {!githubConnected ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Token de Acesso Pessoal (PAT)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={e => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Crie um token em: GitHub → Settings → Developer settings → Personal access tokens
                    </p>
                  </div>

                  <button
                    onClick={handleConnectGitHub}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    Conectar ao GitHub
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <img 
                      src={githubUser?.avatar} 
                      alt={githubUser?.login}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-green-400">Conectado como {githubUser?.login}</p>
                      <p className="text-sm text-gray-400">{githubUser?.name}</p>
                    </div>
                  </div>

                  {githubOrgs.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Criar em (opcional)
                      </label>
                      <select
                        value={selectedOrg}
                        onChange={e => setSelectedOrg(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Minha conta pessoal</option>
                        {githubOrgs.map(org => (
                          <option key={org.login} value={org.login}>
                            {org.login}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Será criado:</p>
                    <p className="text-green-400 font-mono">
                      {selectedOrg || githubUser?.login}/{selectedProjectForGithub.name.toLowerCase().replace(/\s+/g, '-')}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowGitHubModal(false)
                  setSelectedProjectForGithub(null)
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              {githubConnected && (
                <button
                  onClick={handleCreateGitHubRepo}
                  disabled={isCreatingRepo}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCreatingRepo ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      Criar Repositório
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Download Pronto */}
      {downloadReady && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Código Gerado!
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                O código do projeto <strong>{downloadReady.name}</strong> foi gerado com sucesso!
              </p>
              
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Arquivos gerados:</p>
                <ul className="text-sm text-green-400 space-y-1 max-h-40 overflow-y-auto">
                  {downloadReady.files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <FileCode className="w-3 h-3" />
                      {f.path}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  💡 <strong>Dica:</strong> Após baixar, extraia os arquivos e abra no Windsurf.
                  Use os arquivos TUDO-PARA-O-GPT.txt e ATLAS.txt como contexto para continuar.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setDownloadReady(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleDownloadZip}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar Código
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
