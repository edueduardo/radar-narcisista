'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, Shield, Lock, Download, Check, 
  ArrowLeft, ArrowRight, Edit3, Save, AlertTriangle,
  Sparkles, Clock, Hash, CheckCircle, Info
} from 'lucide-react'
import { 
  createDraft, 
  getDrafts, 
  updateDraft, 
  sealLetter, 
  generateLetterPDF,
  DEFAULT_LETTER_SECTIONS,
  type SealedLetterDraft,
  type SealedLetter
} from '@/lib/sealedLetters'

export default function CartaSeloPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'edit' | 'review' | 'sealed'>('intro')
  const [draft, setDraft] = useState<SealedLetterDraft | null>(null)
  const [sealedLetter, setSealedLetter] = useState<SealedLetter | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [saving, setSaving] = useState(false)
  const [sealing, setSealing] = useState(false)

  // Mock userId - em produção viria do auth
  const userId = 'user_demo'

  useEffect(() => {
    // Carregar rascunho existente ou criar novo
    const drafts = getDrafts(userId)
    const existingDraft = drafts.find(d => d.status === 'draft')
    
    if (existingDraft) {
      setDraft(existingDraft)
    }
  }, [])

  const handleStartNew = () => {
    const newDraft = createDraft(userId)
    setDraft(newDraft)
    setStep('edit')
  }

  const handleContinue = () => {
    if (draft) {
      setStep('edit')
    }
  }

  const handleSectionChange = (content: string) => {
    if (!draft) return

    const updatedSections = [...draft.sections]
    updatedSections[currentSection] = {
      ...updatedSections[currentSection],
      content,
    }

    setDraft({
      ...draft,
      sections: updatedSections,
    })
  }

  const handleSave = async () => {
    if (!draft) return
    
    setSaving(true)
    updateDraft(draft.id, { sections: draft.sections })
    
    setTimeout(() => {
      setSaving(false)
    }, 500)
  }

  const handleNextSection = () => {
    handleSave()
    if (currentSection < draft!.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setStep('review')
    }
  }

  const handlePrevSection = () => {
    handleSave()
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSeal = async () => {
    if (!draft) return

    setSealing(true)
    
    try {
      const sealed = await sealLetter(draft)
      setSealedLetter(sealed)
      setStep('sealed')
    } catch (error) {
      console.error('Erro ao selar carta:', error)
      alert('Erro ao selar a carta. Tente novamente.')
    } finally {
      setSealing(false)
    }
  }

  const handleDownload = () => {
    if (!draft) return

    const content = generateLetterPDF(draft, sealedLetter || undefined)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carta-selo-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Tela de introdução
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Link href="/app" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Carta-Selo de Realidade
              </h1>
              <p className="text-gray-600">
                Um documento organizado e selado do que você viveu
              </p>
            </div>

            {/* O que é */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                O que é a Carta-Selo?
              </h2>
              <ul className="space-y-2 text-purple-800 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Um documento que <strong>você escreve</strong> (com ajuda de perguntas guiadas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Selado com um <strong>código de integridade</strong> (hash + data/hora)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Para usar como <strong>memória organizada</strong> – em terapia, com advogado, ou só para você</span>
                </li>
              </ul>
            </div>

            {/* Aviso importante */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Importante entender
              </h2>
              <ul className="space-y-2 text-amber-800 text-sm">
                <li>• <strong>NÃO é</strong> laudo psicológico ou diagnóstico</li>
                <li>• <strong>NÃO é</strong> prova jurídica garantida</li>
                <li>• <strong>É</strong> um registro organizado que ajuda a lembrar e contar sua história</li>
                <li>• <strong>É</strong> uma forma de manter integridade do que você escreveu naquela data</li>
              </ul>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Organização Emocional</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Ancorado no Tempo</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Lock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Integridade Verificável</p>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              {draft && draft.status === 'draft' ? (
                <>
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-5 w-5" />
                    Continuar Rascunho
                  </button>
                  <button
                    onClick={handleStartNew}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Começar Nova Carta
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartNew}
                  className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Começar Minha Carta-Selo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tela de edição
  if (step === 'edit' && draft) {
    const section = draft.sections[currentSection]
    const progress = ((currentSection + 1) / draft.sections.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Seção {currentSection + 1} de {draft.sections.length}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card de Edição */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {section.title}
            </h2>
            
            {/* Dicas por seção */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                {getSectionTip(section.title)}
              </p>
            </div>

            <textarea
              value={section.content}
              onChange={(e) => handleSectionChange(e.target.value)}
              placeholder="Escreva aqui com suas próprias palavras..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{section.content.length} caracteres</span>
              {saving && <span className="text-green-600">Salvando...</span>}
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                onClick={handlePrevSection}
                disabled={currentSection === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>

              <button
                onClick={handleNextSection}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {currentSection === draft.sections.length - 1 ? 'Revisar' : 'Próxima'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tela de revisão
  if (step === 'review' && draft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Revisar sua Carta-Selo
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Leia com calma. Você pode editar qualquer seção antes de selar.
            </p>

            {/* Seções */}
            <div className="space-y-4 mb-8">
              {draft.sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <button
                      onClick={() => {
                        setCurrentSection(index)
                        setStep('edit')
                      }}
                      className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      Editar
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {section.content || <span className="text-gray-400 italic">Seção vazia</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Aviso antes de selar */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Antes de selar:</p>
                  <p>Após selada, a carta não pode ser alterada. O selo garante que o conteúdo permanece exatamente como você escreveu nesta data.</p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentSection(0)
                  setStep('edit')
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Voltar e Editar
              </button>
              <button
                onClick={handleSeal}
                disabled={sealing}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sealing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Selando...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Selar Carta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tela de carta selada
  if (step === 'sealed' && sealedLetter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Sucesso */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Carta-Selo Criada com Sucesso!
            </h1>
            <p className="text-gray-600 mb-8">
              Sua carta foi selada e está protegida com um código de integridade.
            </p>

            {/* Informações do selo */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-500" />
                Informações do Selo
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Selagem:</span>
                  <span className="font-medium">
                    {new Date(sealedLetter.sealedAt).toLocaleDateString('pt-BR')} às {new Date(sealedLetter.sealedAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Sessão:</span>
                  <span className="font-mono text-xs">{sealedLetter.sessionId}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Hash SHA-256:</span>
                  <span className="font-mono text-xs break-all bg-gray-100 p-2 rounded block">
                    {sealedLetter.contentHash}
                  </span>
                </div>
              </div>
            </div>

            {/* Próximos passos */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-purple-900 mb-3">Próximos Passos</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Baixe sua carta e guarde em local seguro (pen drive, email pessoal)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Se precisar, compartilhe com terapeuta ou advogado(a)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Para verificar integridade no futuro, use nossa página de verificação</span>
                </li>
              </ul>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Baixar Carta-Selo
              </button>
              
              <Link
                href="/app"
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Dicas por seção
function getSectionTip(title: string): string {
  const tips: Record<string, string> = {
    'O que vem acontecendo': 'Descreva a situação geral. Não precisa de detalhes ainda, só o panorama do que você está vivendo.',
    'Como isso me faz sentir': 'Fale sobre suas emoções. Confusão, medo, culpa, dúvida... tudo é válido.',
    'Exemplos concretos': 'Liste situações específicas que aconteceram. Datas aproximadas ajudam, mas não são obrigatórias.',
    'Padrões que percebi': 'O que se repete? Ciclos, comportamentos, frases que você ouve com frequência...',
    'Por que decidi registrar isso agora': 'O que te motivou a criar este registro? O que você espera ao ter isso documentado?',
  }
  
  return tips[title] || 'Escreva com suas próprias palavras, sem pressa.'
}
