'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  FileText, 
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Hash,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarTag,
  RadarAlertBanner,
  RadarModal,
  RadarStepper,
} from '@/components/ui/design-system'

// ============================================================================
// DOCUMENTOS PREMIUM - RADAR NARCISISTA BR
// Geração de PDF com modal de responsabilidade
// ============================================================================

interface GeneratedPDF {
  id: string
  name: string
  period: string
  entries_count: number
  hash: string
  created_at: string
}

export default function DocumentosPremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pdfs, setPdfs] = useState<GeneratedPDF[]>([])
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  
  // Form state
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [includeOptions, setIncludeOptions] = useState({
    diary: true,
    timeline: true,
    stats: true,
    test: false,
  })
  const [confirmChecks, setConfirmChecks] = useState({
    perspective: false,
    notProof: false,
    responsibility: false,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Simular PDFs gerados anteriormente
      setPdfs([
        {
          id: '1',
          name: 'Relatório Novembro 2025',
          period: 'Últimos 30 dias',
          entries_count: 12,
          hash: 'a1b2c3d4e5f6...',
          created_at: new Date().toISOString(),
        }
      ])
      
      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleGenerate = async () => {
    setGenerating(true)
    
    // Simular geração
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newPdf: GeneratedPDF = {
      id: crypto.randomUUID(),
      name: `Relatório ${new Date().toLocaleDateString('pt-BR')}`,
      period: selectedPeriod === '7d' ? 'Últimos 7 dias' : 
              selectedPeriod === '30d' ? 'Últimos 30 dias' : 
              selectedPeriod === '90d' ? 'Últimos 90 dias' : 'Personalizado',
      entries_count: Math.floor(Math.random() * 20) + 5,
      hash: crypto.randomUUID().substring(0, 16) + '...',
      created_at: new Date().toISOString(),
    }
    
    setPdfs(prev => [newPdf, ...prev])
    setGenerating(false)
    setShowGenerateModal(false)
    resetForm()
  }

  const resetForm = () => {
    setCurrentStep(0)
    setSelectedPeriod('30d')
    setIncludeOptions({ diary: true, timeline: true, stats: true, test: false })
    setConfirmChecks({ perspective: false, notProof: false, responsibility: false })
  }

  const canProceedStep1 = selectedPeriod !== null
  const canProceedStep2 = Object.values(includeOptions).some(v => v)
  const canProceedStep3 = Object.values(confirmChecks).every(v => v)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Documentos</h1>
                  <p className="text-xs text-gray-500">{pdfs.length} PDFs gerados</p>
                </div>
              </div>
            </div>
            
            <RadarButton onClick={() => setShowGenerateModal(true)}>
              <Plus className="w-4 h-4" />
              Gerar PDF
            </RadarButton>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <RadarAlertBanner type="warning" title="Importante">
          Os PDFs gerados contêm <strong>apenas sua perspectiva</strong>. 
          Não são laudos técnicos, diagnósticos ou provas judiciais.
          Mentir ou forjar provas é crime (Art. 299 e 347 do CP).
        </RadarAlertBanner>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {pdfs.length === 0 ? (
          <RadarCard variant="soft" padding="lg">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Nenhum documento gerado
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Gere um PDF para ter um registro organizado dos seus episódios.
              </p>
              <RadarButton onClick={() => setShowGenerateModal(true)}>
                <Plus className="w-4 h-4" />
                Gerar primeiro PDF
              </RadarButton>
            </div>
          </RadarCard>
        ) : (
          <div className="space-y-4">
            {pdfs.map((pdf) => (
              <RadarCard key={pdf.id} variant="default" padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{pdf.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {pdf.period}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {pdf.entries_count} registros
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <RadarTag tone="info" size="sm">
                          <Hash className="w-3 h-3" />
                          {pdf.hash}
                        </RadarTag>
                        <span className="text-xs text-gray-600">
                          {formatDate(pdf.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </RadarCard>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Geração */}
      <RadarModal
        isOpen={showGenerateModal}
        onClose={() => { setShowGenerateModal(false); resetForm(); }}
        title="Gerar novo PDF"
        size="lg"
      >
        <div className="space-y-6">
          {/* Stepper */}
          <RadarStepper
            steps={['Período', 'Conteúdo', 'Confirmação']}
            currentStep={currentStep}
          />

          {/* Step 1: Período */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Selecione o período que deseja incluir no relatório:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: '90d', label: 'Últimos 90 dias' },
                  { value: 'custom', label: 'Personalizado' },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPeriod === option.value
                        ? 'bg-violet-600/20 border-violet-500 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Conteúdo */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Selecione o que deseja incluir no PDF:
              </p>
              <div className="space-y-3">
                {[
                  { key: 'diary', label: 'Registros do Diário', desc: 'Todos os episódios registrados' },
                  { key: 'timeline', label: 'Linha do Tempo', desc: 'Visualização cronológica resumida' },
                  { key: 'stats', label: 'Estatísticas', desc: 'Gráficos e números agregados' },
                  { key: 'test', label: 'Teste de Clareza', desc: 'Resultado do último teste' },
                ].map((option) => (
                  <label
                    key={option.key}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      includeOptions[option.key as keyof typeof includeOptions]
                        ? 'bg-violet-600/20 border-violet-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={includeOptions[option.key as keyof typeof includeOptions]}
                      onChange={(e) => setIncludeOptions(prev => ({
                        ...prev,
                        [option.key]: e.target.checked
                      }))}
                      className="mt-1 w-4 h-4 text-violet-600 rounded focus:ring-violet-500 bg-slate-700 border-slate-600"
                    />
                    <div>
                      <span className="font-medium text-white">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirmação */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <RadarAlertBanner type="danger" title="Atenção: Leia com cuidado">
                Antes de gerar o PDF, você precisa confirmar que entende as condições abaixo.
              </RadarAlertBanner>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  confirmChecks.perspective ? 'bg-green-950/30 border-green-900/50' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={confirmChecks.perspective}
                    onChange={(e) => setConfirmChecks(prev => ({ ...prev, perspective: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-gray-300">
                    Entendo que este documento contém <strong>apenas minha perspectiva</strong> dos fatos. 
                    A IA não conhece o outro lado da história.
                  </span>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  confirmChecks.notProof ? 'bg-green-950/30 border-green-900/50' : 'bg-red-950/30 border-red-900/50'
                }`}>
                  <input
                    type="checkbox"
                    checked={confirmChecks.notProof}
                    onChange={(e) => setConfirmChecks(prev => ({ ...prev, notProof: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-gray-300">
                    Entendo que este documento <strong>não é prova judicial</strong>, laudo técnico ou diagnóstico clínico. 
                    <strong className="text-red-400"> Mentir para prejudicar alguém é crime</strong> (Art. 299 e 347 do CP).
                  </span>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  confirmChecks.responsibility ? 'bg-green-950/30 border-green-900/50' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={confirmChecks.responsibility}
                    onChange={(e) => setConfirmChecks(prev => ({ ...prev, responsibility: e.target.checked }))}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm text-gray-300">
                    <strong>Assumo total responsabilidade</strong> pelo uso que fizer deste documento.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <RadarButton
              variant="ghost"
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setShowGenerateModal(false)}
            >
              {currentStep === 0 ? 'Cancelar' : 'Voltar'}
            </RadarButton>

            {currentStep < 2 ? (
              <RadarButton
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 0 ? !canProceedStep1 : !canProceedStep2}
              >
                Próximo
              </RadarButton>
            ) : (
              <RadarButton
                onClick={handleGenerate}
                disabled={!canProceedStep3}
                isLoading={generating}
              >
                <CheckCircle className="w-4 h-4" />
                Gerar PDF
              </RadarButton>
            )}
          </div>
        </div>
      </RadarModal>
    </div>
  )
}
