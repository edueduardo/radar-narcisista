'use client'

/**
 * Wizard de Configuração para Novos SaaS
 * Interface guiada passo-a-passo para criar e configurar um novo SaaS
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
  Palette,
  Database,
  CreditCard,
  Globe,
  Shield,
  Settings,
  FileCode,
  Github,
  Download,
  Sparkles
} from 'lucide-react'

// Tipos
interface WizardData {
  // Step 1: Básico
  projectName: string
  projectSlug: string
  projectDescription: string
  projectType: 'SAAS_TEMATICO' | 'CORE_BRANCO'
  
  // Step 2: Tema
  primaryColor: string
  secondaryColor: string
  logo: string
  favicon: string
  
  // Step 3: Features
  features: {
    auth: boolean
    billing: boolean
    admin: boolean
    analytics: boolean
    notifications: boolean
    ai: boolean
  }
  
  // Step 4: Banco de dados
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  
  // Step 5: Integrações
  stripeSecretKey: string
  stripeWebhookSecret: string
  openaiApiKey: string
  resendApiKey: string
  
  // Step 6: Deploy
  deployTarget: 'vercel' | 'netlify' | 'manual'
  githubRepo: string
  customDomain: string
}

const INITIAL_DATA: WizardData = {
  projectName: '',
  projectSlug: '',
  projectDescription: '',
  projectType: 'SAAS_TEMATICO',
  primaryColor: '#7C3AED',
  secondaryColor: '#4F46E5',
  logo: '',
  favicon: '',
  features: {
    auth: true,
    billing: true,
    admin: true,
    analytics: false,
    notifications: false,
    ai: true
  },
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseServiceKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  openaiApiKey: '',
  resendApiKey: '',
  deployTarget: 'vercel',
  githubRepo: '',
  customDomain: ''
}

const STEPS = [
  { id: 1, title: 'Básico', icon: FileCode },
  { id: 2, title: 'Tema', icon: Palette },
  { id: 3, title: 'Features', icon: Settings },
  { id: 4, title: 'Banco', icon: Database },
  { id: 5, title: 'APIs', icon: Shield },
  { id: 6, title: 'Deploy', icon: Rocket }
]

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>(INITIAL_DATA)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<any[] | null>(null)

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const updateFeature = (feature: keyof WizardData['features'], value: boolean) => {
    setData(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: value }
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const generateProject = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: data.projectName,
          projectSlug: data.projectSlug,
          projectType: data.projectType,
          projectDescription: data.projectDescription,
          modules: Object.entries(data.features)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => key),
          config: {
            theme: {
              primaryColor: data.primaryColor,
              secondaryColor: data.secondaryColor
            },
            env: {
              supabaseUrl: data.supabaseUrl,
              supabaseAnonKey: data.supabaseAnonKey,
              stripeSecretKey: data.stripeSecretKey ? '***' : '',
              openaiApiKey: data.openaiApiKey ? '***' : ''
            }
          }
        })
      })

      const result = await response.json()
      if (result.files) {
        setGeneratedFiles(result.files)
      }
    } catch (error) {
      console.error('Erro ao gerar projeto:', error)
      alert('Erro ao gerar projeto')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadProject = () => {
    if (!generatedFiles) return
    
    const content = generatedFiles.map(f => 
      `=== ${f.path} ===\n${f.content}\n`
    ).join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.projectSlug || 'projeto'}-saas.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Auto-gerar slug
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    updateData({ projectName: name, projectSlug: slug })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/gerador-saas" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Wizard de Configuração
              </h1>
              <p className="text-sm text-gray-400">Configure seu novo SaaS passo a passo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-slate-700 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-purple-600 text-white' 
                        : isCompleted 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-slate-600'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Básico */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Informações Básicas</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Projeto</label>
              <input
                type="text"
                value={data.projectName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Ex: Radar Co-Parent, Clínica Saúde Mental..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug (URL)</label>
              <input
                type="text"
                value={data.projectSlug}
                onChange={e => updateData({ projectSlug: e.target.value })}
                placeholder="radar-co-parent"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={data.projectDescription}
                onChange={e => updateData({ projectDescription: e.target.value })}
                placeholder="Descreva o propósito do seu SaaS..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Projeto</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateData({ projectType: 'SAAS_TEMATICO' })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    data.projectType === 'SAAS_TEMATICO'
                      ? 'bg-purple-500/20 border-purple-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Palette className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="font-medium">SaaS Temático</p>
                  <p className="text-xs text-gray-400">Com tema e personalização</p>
                </button>
                <button
                  onClick={() => updateData({ projectType: 'CORE_BRANCO' })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    data.projectType === 'CORE_BRANCO'
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <FileCode className="w-6 h-6 text-cyan-400 mb-2" />
                  <p className="font-medium">Core Branco</p>
                  <p className="text-xs text-gray-400">Template neutro</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Tema */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Personalização Visual</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.primaryColor}
                    onChange={e => updateData({ primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.primaryColor}
                    onChange={e => updateData({ primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.secondaryColor}
                    onChange={e => updateData({ secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.secondaryColor}
                    onChange={e => updateData({ secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 rounded-xl border border-slate-600" style={{ background: `linear-gradient(135deg, ${data.primaryColor}20 0%, ${data.secondaryColor}20 100%)` }}>
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: data.primaryColor }}>
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{data.projectName || 'Seu Projeto'}</h3>
                  <p className="text-gray-400">{data.projectDescription || 'Descrição do projeto'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Features */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Módulos e Features</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'auth', label: 'Autenticação', desc: 'Login, cadastro, recuperação de senha', icon: Shield },
                { key: 'billing', label: 'Billing/Planos', desc: 'Sistema de assinaturas com Stripe', icon: CreditCard },
                { key: 'admin', label: 'Painel Admin', desc: 'Dashboard administrativo completo', icon: Settings },
                { key: 'analytics', label: 'Analytics', desc: 'Métricas e relatórios', icon: Globe },
                { key: 'notifications', label: 'Notificações', desc: 'Email, push e in-app', icon: Sparkles },
                { key: 'ai', label: 'Integração IA', desc: 'OpenAI, Anthropic, etc', icon: Sparkles }
              ].map(feature => {
                const Icon = feature.icon
                const isEnabled = data.features[feature.key as keyof WizardData['features']]
                
                return (
                  <button
                    key={feature.key}
                    onClick={() => updateFeature(feature.key as keyof WizardData['features'], !isEnabled)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isEnabled
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                      {isEnabled && <Check className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="font-medium">{feature.label}</p>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Banco de Dados */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configuração do Supabase</h2>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 Crie um projeto em <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a> e copie as credenciais.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Supabase URL</label>
              <input
                type="text"
                value={data.supabaseUrl}
                onChange={e => updateData({ supabaseUrl: e.target.value })}
                placeholder="https://xxxxx.supabase.co"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Anon Key (pública)</label>
              <input
                type="text"
                value={data.supabaseAnonKey}
                onChange={e => updateData({ supabaseAnonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service Role Key (secreta)</label>
              <input
                type="password"
                value={data.supabaseServiceKey}
                onChange={e => updateData({ supabaseServiceKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 5: APIs */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Chaves de API</h2>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-300">
                ⚠️ Estas chaves são opcionais. Você pode configurá-las depois no .env.local
              </p>
            </div>

            {data.features.billing && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
                  <input
                    type="password"
                    value={data.stripeSecretKey}
                    onChange={e => updateData({ stripeSecretKey: e.target.value })}
                    placeholder="sk_live_..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stripe Webhook Secret</label>
                  <input
                    type="password"
                    value={data.stripeWebhookSecret}
                    onChange={e => updateData({ stripeWebhookSecret: e.target.value })}
                    placeholder="whsec_..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                  />
                </div>
              </>
            )}

            {data.features.ai && (
              <div>
                <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                <input
                  type="password"
                  value={data.openaiApiKey}
                  onChange={e => updateData({ openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                />
              </div>
            )}

            {data.features.notifications && (
              <div>
                <label className="block text-sm font-medium mb-2">Resend API Key (emails)</label>
                <input
                  type="password"
                  value={data.resendApiKey}
                  onChange={e => updateData({ resendApiKey: e.target.value })}
                  placeholder="re_..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 6: Deploy */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Deploy e Finalização</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Plataforma de Deploy</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'vercel', label: 'Vercel', icon: '▲' },
                  { key: 'netlify', label: 'Netlify', icon: '◆' },
                  { key: 'manual', label: 'Manual', icon: '⚙️' }
                ].map(platform => (
                  <button
                    key={platform.key}
                    onClick={() => updateData({ deployTarget: platform.key as any })}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      data.deployTarget === platform.key
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{platform.icon}</span>
                    <p className="font-medium">{platform.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Repositório GitHub (opcional)</label>
              <input
                type="text"
                value={data.githubRepo}
                onChange={e => updateData({ githubRepo: e.target.value })}
                placeholder="usuario/repositorio"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Domínio Customizado (opcional)</label>
              <input
                type="text"
                value={data.customDomain}
                onChange={e => updateData({ customDomain: e.target.value })}
                placeholder="meuapp.com.br"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Resumo */}
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <h3 className="font-semibold mb-4">📋 Resumo da Configuração</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Projeto:</p>
                  <p className="font-medium">{data.projectName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Tipo:</p>
                  <p className="font-medium">{data.projectType === 'SAAS_TEMATICO' ? 'SaaS Temático' : 'Core Branco'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Features:</p>
                  <p className="font-medium">{Object.entries(data.features).filter(([_, v]) => v).length} módulos</p>
                </div>
                <div>
                  <p className="text-gray-400">Deploy:</p>
                  <p className="font-medium">{data.deployTarget}</p>
                </div>
              </div>
            </div>

            {/* Botão Gerar */}
            {!generatedFiles ? (
              <button
                onClick={generateProject}
                disabled={isGenerating || !data.projectName}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando projeto...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Gerar Projeto
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 font-medium flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Projeto gerado com sucesso! ({generatedFiles.length} arquivos)
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={downloadProject}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Baixar Projeto
                  </button>
                  <Link
                    href="/admin/gerador-saas"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {currentStep < 6 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
