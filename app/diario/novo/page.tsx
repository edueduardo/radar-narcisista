'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { analyzePatternsServer } from './actions'
import Microphone from '../../../components/Microphone'
import AbuseTagsDictionary from '../../../components/diario/AbuseTagsDictionary'
import { 
  getOrderedCategories, 
  getTagsByCategory,
  AbuseTagCategoryId 
} from '../../../lib/abuse-tags-config'
import { ArrowLeft, AlertTriangle, Sparkles, X as XIcon, CheckCircle } from 'lucide-react'
import { ResponsibilityTermsModal, useTermsAcceptance } from '@/components/ResponsibilityTermsModal'
import { useClarityProfile } from '@/hooks/useClarityProfile'
import { usePlanLimits } from '@/hooks/usePlanLimits'

// =============================================================================
// TEMPLATES POR TIPO DE PROBLEMA
// Pré-preenche o formulário quando vem de /hub/[problema] com ?tipo=
// =============================================================================
const PROBLEM_TEMPLATES: Record<string, { title: string; context: string; tags: string[] }> = {
  invalidacao: {
    title: 'Episódio de invalidação',
    context: 'RELACIONAMENTO',
    tags: ['minimização', 'desqualificação', 'negação']
  },
  gaslighting: {
    title: 'Episódio de gaslighting',
    context: 'RELACIONAMENTO',
    tags: ['gaslighting', 'negação', 'inversão de culpa']
  },
  manipulacao: {
    title: 'Episódio de manipulação',
    context: 'RELACIONAMENTO',
    tags: ['vitimização', 'inversão de culpa', 'projeção']
  },
  ameaca: {
    title: 'Episódio de ameaça',
    context: 'RELACIONAMENTO',
    tags: ['ameaça velada', 'controle social']
  },
  'ameaca-legal': {
    title: 'Ameaça legal/criminalização',
    context: 'RELACIONAMENTO',
    tags: ['ameaça velada', 'controle financeiro']
  },
  isolamento: {
    title: 'Episódio de isolamento',
    context: 'RELACIONAMENTO',
    tags: ['isolamento', 'controle social', 'ciúmes excessivos']
  }
}

function NovoDiarioPageContent() {
  const searchParams = useSearchParams()
  const tipoProblema = searchParams.get('tipo')
  // ETAPA 2 - TRIÂNGULO: Aceitar parâmetros de origem do Teste de Clareza
  const fromClarityResult = searchParams.get('from') === 'clarity_result'
  const clarityTestIdParam = searchParams.get('clarity_test_id')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context: '',
    impact_score: 2,
    tags: [] as string[],
    // ETAPA 2 - TRIÂNGULO: Campos de integração
    entry_type: 'normal' as string,
    clarity_test_id: null as string | null
  })
  
  // Aplicar template se vier com ?tipo=
  useEffect(() => {
    if (tipoProblema && PROBLEM_TEMPLATES[tipoProblema]) {
      const template = PROBLEM_TEMPLATES[tipoProblema]
      setFormData(prev => ({
        ...prev,
        title: template.title,
        context: template.context,
        tags: template.tags
      }))
    }
  }, [tipoProblema])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [reminderText, setReminderText] = useState('')
  const [isRecordingReminder, setIsRecordingReminder] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<AbuseTagCategoryId | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // Hook para verificar aceite dos termos
  const { hasAccepted: hasAcceptedTerms, isLoading: isLoadingTerms, markAsAccepted } = useTermsAcceptance()
  
  // Hook para perfil de clareza
  const { profile: clarityProfile, hasProfile: hasClarityProfile, isLoading: isLoadingProfile } = useClarityProfile()
  const [showClarityCard, setShowClarityCard] = useState(true)
  const [usedClarityAsBase, setUsedClarityAsBase] = useState(false)
  const [hasDiaryEntries, setHasDiaryEntries] = useState<boolean | null>(null)
  
  // Hook para limites de plano
  const { planLevel, planName, usage, diaryLimit, canCreateEntry, isLoading: isLoadingPlan } = usePlanLimits()
  const [showLimitReached, setShowLimitReached] = useState(false)
  
  // Mapear categorias do perfil para tags do diário
  const categoryToTags: Record<string, string[]> = {
    invalidacao: ['minimização', 'desqualificação'],
    gaslighting: ['gaslighting', 'negação'],
    controle: ['controle', 'ciúmes excessivos'],
    isolamento: ['isolamento', 'controle social'],
    emocional: ['humilhação', 'punição emocional'],
    fisico: ['ameaça velada', 'violência física']
  }
  
  // Verificar se usuário já tem entradas no diário
  useEffect(() => {
    const checkDiaryEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { count } = await supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null)
        setHasDiaryEntries((count || 0) > 0)
      }
    }
    checkDiaryEntries()
  }, [supabase])
  
  // ETAPA 2 - TRIÂNGULO: Pré-preencher quando vier do resultado do Teste de Clareza
  useEffect(() => {
    if (fromClarityResult && clarityProfile && !isLoadingProfile) {
      const suggestedTags: string[] = []
      clarityProfile.topCategories.forEach(cat => {
        if (categoryToTags[cat]) {
          suggestedTags.push(...categoryToTags[cat])
        }
      })
      
      // Determinar impacto baseado na zona (GlobalZone: 'atencao' | 'alerta' | 'vermelha')
      let impactScore = 2
      if (clarityProfile.globalZone === 'vermelha') {
        impactScore = 3
      } else if (clarityProfile.globalZone === 'alerta') {
        impactScore = 2
      } else if (clarityProfile.globalZone === 'atencao') {
        impactScore = 1
      }
      
      setFormData(prev => ({
        ...prev,
        title: `Minha situação após o Teste de Clareza`,
        context: 'RELACIONAMENTO',
        tags: [...new Set(suggestedTags)].slice(0, 5),
        description: clarityProfile.userNarrative || clarityProfile.summary || '',
        impact_score: impactScore,
        entry_type: clarityTestIdParam ? 'clarity_baseline' : 'normal',
        clarity_test_id: clarityTestIdParam || null
      }))
      
      setUsedClarityAsBase(true)
      setShowClarityCard(false)
    }
  }, [fromClarityResult, clarityProfile, isLoadingProfile, clarityTestIdParam])
  
  // Função para usar teste de clareza como base (preenche formulário)
  const useClarityAsBase = () => {
    if (!clarityProfile) return
    
    const suggestedTags: string[] = []
    clarityProfile.topCategories.forEach(cat => {
      if (categoryToTags[cat]) {
        suggestedTags.push(...categoryToTags[cat])
      }
    })
    
    // Preencher formulário
    setFormData(prev => ({
      ...prev,
      title: `Resumo inicial – Teste de Clareza`,
      context: 'RELACIONAMENTO',
      tags: [...new Set(suggestedTags)].slice(0, 5),
      description: clarityProfile.userNarrative || ''
    }))
    
    setUsedClarityAsBase(true)
    setShowClarityCard(false)
  }
  
  // TEMA 4: Criar entrada automática tipo clarity_baseline
  const [isCreatingBaseline, setIsCreatingBaseline] = useState(false)
  
  const createClarityBaselineEntry = async () => {
    if (!clarityProfile) return
    
    setIsCreatingBaseline(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Gerar tags baseadas nas categorias do perfil
      const suggestedTags: string[] = []
      clarityProfile.topCategories.forEach(cat => {
        if (categoryToTags[cat]) {
          suggestedTags.push(...categoryToTags[cat])
        }
      })
      
      // Gerar descrição baseada no perfil
      const zoneLabels: Record<string, string> = {
        atencao: 'Zona de Atenção',
        alerta: 'Zona de Alerta',
        vermelha: 'Zona de Alto Risco'
      }
      
      const axisLabels: Record<string, string> = {
        nevoa: 'Névoa Mental',
        medo: 'Medo e Tensão',
        limites: 'Desrespeito a Limites'
      }
      
      const categoryLabels: Record<string, string> = {
        invalidacao: 'Invalidação',
        gaslighting: 'Gaslighting',
        controle: 'Controle',
        isolamento: 'Isolamento',
        emocional: 'Abuso Emocional',
        fisico: 'Risco Físico'
      }
      
      // Construir descrição automática
      let description = `📊 RESUMO DO TESTE DE CLAREZA\n`
      description += `Data do teste: ${new Date(clarityProfile.createdAt).toLocaleDateString('pt-BR')}\n\n`
      description += `🎯 Resultado geral: ${zoneLabels[clarityProfile.globalZone] || clarityProfile.globalZone}\n`
      description += `📈 Percentual: ${Math.round(clarityProfile.overallPercentage * 100)}%\n\n`
      
      if (clarityProfile.hasPhysicalRisk) {
        description += `⚠️ ALERTA: Sinais de possível risco físico detectados.\n\n`
      }
      
      description += `📌 Eixos mais impactados:\n`
      clarityProfile.topAxes.forEach((axis, i) => {
        description += `${i + 1}. ${axisLabels[axis.axis] || axis.axis}: ${axis.score} pontos\n`
      })
      
      if (clarityProfile.topCategories.length > 0) {
        description += `\n🏷️ Categorias principais:\n`
        clarityProfile.topCategories.forEach((cat, i) => {
          description += `${i + 1}. ${categoryLabels[cat] || cat}\n`
        })
      }
      
      if (clarityProfile.userNarrative) {
        description += `\n📝 O que você escreveu no teste:\n"${clarityProfile.userNarrative}"\n`
      }
      
      description += `\n---\nEste é um resumo automático gerado a partir do seu Teste de Clareza. Use-o como ponto de partida para registrar episódios futuros.`
      
      // Criar entrada no diário com tipo especial
      const { error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        title: `Resumo inicial – Teste de Clareza de ${new Date(clarityProfile.createdAt).toLocaleDateString('pt-BR')}`,
        description: description,
        context: 'RELACIONAMENTO',
        impact_score: clarityProfile.globalZone === 'vermelha' ? 3 : clarityProfile.globalZone === 'alerta' ? 2 : 1,
        tags: [...new Set(suggestedTags)].slice(0, 5),
        from_voice: false,
        entry_type: 'clarity_baseline', // TEMA 4: tipo especial
        clarity_test_id: clarityProfile.id // Referência ao teste
      })
      
      if (error) {
        console.error('Erro ao criar entrada baseline:', error)
        // Se o campo entry_type não existir, tentar sem ele
        if (error.message?.includes('entry_type') || error.message?.includes('clarity_test_id')) {
          const { error: error2 } = await supabase.from('journal_entries').insert({
            user_id: user.id,
            title: `Resumo inicial – Teste de Clareza de ${new Date(clarityProfile.createdAt).toLocaleDateString('pt-BR')}`,
            description: description,
            context: 'RELACIONAMENTO',
            impact_score: clarityProfile.globalZone === 'vermelha' ? 3 : clarityProfile.globalZone === 'alerta' ? 2 : 1,
            tags: [...new Set(suggestedTags)].slice(0, 5),
            from_voice: false
          })
          if (error2) throw error2
        } else {
          throw error
        }
      }
      
      // Redirecionar para o diário
      router.push('/diario')
      
    } catch (error) {
      console.error('Erro ao criar entrada baseline:', error)
      alert('Erro ao criar resumo inicial. Tente novamente.')
    } finally {
      setIsCreatingBaseline(false)
    }
  }

  // Tags organizadas por categoria - USANDO CONFIG
  const categories = getOrderedCategories()
  
  // Lista plana para compatibilidade com análise IA
  const predefinedTags = categories.flatMap(cat => 
    getTagsByCategory(cat.id).map(tag => tag.label.toLowerCase())
  )

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTranscription = (text: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + (prev.description ? ' ' : '') + text
    }))
  }

  const handleTranscriptionError = (error: string) => {
    console.error('Erro na transcrição:', error)
    alert(`Erro na transcrição: ${error}`)
  }

  const handleReminderTranscription = (text: string) => {
    setReminderText(prev => prev + (prev ? ' ' : '') + text)
  }

  const handleReminderTranscriptionError = (error: string) => {
    console.error('Erro na transcrição do lembrete:', error)
    alert(`Erro na transcrição: ${error}`)
  }

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generateAnalysisPDF = async (analysisData: any) => {
    setIsGeneratingPDF(true)
    try {
      // Tentar gerar PDF real via API
      const response = await fetch('/api/user/analysis-report/pdf-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisData })
      })

      if (response.ok) {
        // Download do PDF
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const hash = response.headers.get('X-SHA256-Hash')
        link.download = `analise-colaborativa-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        alert(`✅ PDF gerado com sucesso!\n\n🔐 Hash SHA-256 para verificação:\n${hash?.substring(0, 32)}...`)
      } else {
        // Fallback para TXT se PDF falhar
        generateAnalysisTXT(analysisData)
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      // Fallback para TXT
      generateAnalysisTXT(analysisData)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generateAnalysisTXT = (analysisData: any) => {
    const currentDate = new Date().toLocaleDateString('pt-BR')
    const currentTime = new Date().toLocaleTimeString('pt-BR')
    
    const txtContent = `
====================================
RELATÓRIO DE ANÁLISE EMOCIONAL
Radar Narcisista - ${currentDate} ${currentTime}
====================================

TÍTULO DO EPISÓDIO: ${formData.title || 'Não informado'}

RESUMO DA ANÁLISE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PADRÕES IDENTIFICADOS:
${analysisData.themes?.join(', ') || 'Nenhum padrão específico detectado'}

😔 ESTADO EMOCIONAL:
${analysisData.emotions?.join(', ') || 'Emoções não especificadas'}

⚡ NÍVEL DE IMPACTO EMOCIONAL:
${(analysisData.intensity * 100).toFixed(0)}% - ${
  analysisData.intensity < 0.3 ? 'BAIXO' :
  analysisData.intensity < 0.7 ? 'MÉDIO' : 'ALTO'
}

${analysisData.intensity < 0.3 ? '🟢 Episódio leve, com efeitos emocionais limitados' :
  analysisData.intensity < 0.7 ? '🟡 Episódio moderado, com efeitos emocionais significativos' :
  '🔴 Episódio severo, com efeitos emocionais intensos e duradouros'}

${analysisData.risk_flags && analysisData.risk_flags.length > 0 ? `
⚠️ PONTOS DE ATENÇÃO:
${analysisData.risk_flags.join('\n')}
` : ''}

💡 RECOMENDAÇÕES:
${analysisData.suggestions?.join('\n') || 'Continue monitorando seus padrões emocionais.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESCRIÇÃO COMPLETA DO EPISÓDIO:
${formData.description || 'Não informado'}

${reminderText ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEMBRETE REGISTRADO:
${reminderText}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO: ${formData.context || 'Não informado'}
TAGS: ${formData.tags.join(', ') || 'Nenhuma tag'}
IMPACTO REGISTRADO: ${formData.impact_score === 1 ? 'Baixo' : formData.impact_score === 2 ? 'Médio' : 'Alto'}

====================================
AVISO IMPORTANTE:
Este relatório é educacional e não substitui
atendimento profissional de psicologia,
psiquiatria ou terapia.
====================================
`

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analise-emocional-${currentDate.replace(/\//g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('✅ Relatório salvo como TXT (PDF não disponível no momento)')
  }

  const analyzeEntry = async () => {
    // Pode analisar descrição ou lembrete
    const textToAnalyze = formData.description.trim() || reminderText.trim()
    
    if (!textToAnalyze) {
      alert('Escreva algo, grave uma transcrição ou crie um lembrete antes de analisar.')
      return
    }

    console.log('🎛️ INICIANDO ANÁLISE COLABORATIVA ADMINISTRATIVA')
    console.log('Texto:', textToAnalyze.substring(0, 100) + '...')
    
    setIsAnalyzing(true)
    try {
      // 🎯 USANDO SISTEMA ADMINISTRATIVO COMPLETO VIA API SERVER-SIDE
      const response = await fetch('/api/diario/analisar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textToAnalyze })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Erro na API /api/diario/analisar:', errorData || response.statusText)

        if (response.status === 502) {
          alert('❌ Nenhuma IA conseguiu analisar. Verifique suas chaves de API no painel do administrador.')
        } else {
          alert('Erro na análise colaborativa. Tente novamente.')
        }
        return
      }

      const data = await response.json()
      const resultadoColaborativo = data.resultado
      console.log('🎛️ RESULTADO COLABORATIVO:', resultadoColaborativo)
      
      // 📊 Processar resultado colaborativo
      if (resultadoColaborativo.etapa_1_analises.length > 0) {
        // 🎯 Obter análise consensual (média de todas as IAs)
        const analiseConsensual = processarResultadoColaborativo(resultadoColaborativo)
        
        console.log('📊 Análise consensual:', analiseConsensual)
        
        // Add suggested tags AUTOMATICAMENTE
        if (analiseConsensual.themes && analiseConsensual.themes.length > 0) {
          const suggestedTags = analiseConsensual.themes
            .filter((theme: any) => predefinedTags.includes(theme.toLowerCase()))
            .slice(0, 3)
          
          console.log('Tags sugeridas:', suggestedTags)
          
          // ADICIONAR TAGS AUTOMATICAMENTE
          const newTags = [...formData.tags]
          suggestedTags.forEach((tag: string) => {
            if (!newTags.includes(tag)) {
              newTags.push(tag)
            }
          })
          
          setFormData(prev => ({
            ...prev,
            tags: newTags
          }))
          
          setSuggestions(suggestedTags)
        }

        // Suggest impact based on intensity
        if (analiseConsensual.intensity && analiseConsensual.intensity > 0.7) {
          console.log('Alta intensidade detectada:', analiseConsensual.intensity)
          setFormData(prev => ({
            ...prev,
            impact_score: 3
          }))
        } else if (analiseConsensual.intensity && analiseConsensual.intensity < 0.3) {
          console.log('Baixa intensidade detectada:', analiseConsensual.intensity)
          setFormData(prev => ({
            ...prev,
            impact_score: 1
          }))
        }

        // Show success message COMPLETA
        const numIAs = resultadoColaborativo.etapa_1_analises.length
        const consensoRate = calcularTaxaConsenso(resultadoColaborativo)
        
        alert(`✅ ANÁLISE COLABORATIVA CONCLUÍDA!\n\n🎛️ RELATÓRIO ADMINISTRATIVO:\n• ${numIAs} IAs analisaram\n• Taxa de consenso: ${(consensoRate * 100).toFixed(0)}%\n• ${resultadoColaborativo.etapa_2_votacoes.length} validações\n• ${resultadoColaborativo.etapa_3_consensos.length} consensos\n\n🎯 Veja o resultado completo ABAIXO!`)
        
        // Guardar resultado COLABORATIVO para mostrar
        setAnalysisResult({
          ...analiseConsensual,
          metadados_colaborativos: {
            total_ias: resultadoColaborativo.etapa_1_analises.length,
            taxa_consenso: consensoRate,
            validacoes: resultadoColaborativo.etapa_2_votacoes.length,
            consensos: resultadoColaborativo.etapa_3_consensos.length,
            relatorio_admin: resultadoColaborativo.relatorio_global_sistema,
            analise_juridica: resultadoColaborativo.analise_juridica,
            deteccao_veracidade: resultadoColaborativo.deteccao_veracidade
          }
        })
      } else {
        alert('❌ Nenhuma IA conseguiu analisar. Verifique suas chaves de API.')
      }
    } catch (error) {
      console.error('Erro na análise colaborativa:', error)
      alert('Erro na análise colaborativa. Tente novamente.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 📊 Função para processar resultado colaborativo
  const processarResultadoColaborativo = (resultado: any) => {
    if (resultado.etapa_1_analises.length === 0) {
      return { themes: [], emotions: [], intensity: 0, risk_flags: [], suggestions: [] }
    }
    
    // 🎯 Calcular média consensual de todas as IAs
    const analises = resultado.etapa_1_analises.map((a: any) => a.resultado)
    
    // Themes mais comuns
    const allThemes = analises.flatMap((a: any) => a.themes || [])
    const themeCounts = allThemes.reduce((acc: any, theme: string) => {
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {})
    
    const consensualThemes = Object.entries(themeCounts)
      .filter(([_, count]: any) => count >= Math.ceil(analises.length * 0.5))
      .map(([theme]) => theme)
    
    // Emotions mais comuns
    const allEmotions = analises.flatMap((a: any) => a.emotions || [])
    const emotionCounts = allEmotions.reduce((acc: any, emotion: string) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {})
    
    const consensualEmotions = Object.entries(emotionCounts)
      .filter(([_, count]: any) => count >= Math.ceil(analises.length * 0.5))
      .map(([emotion]) => emotion)
    
    // Intensity média
    const intensities = analises.map((a: any) => a.intensity || 0).filter((i: number) => i > 0)
    const avgIntensity = intensities.length > 0 
      ? intensities.reduce((sum: number, i: number) => sum + i, 0) / intensities.length 
      : 0
    
    // Risk flags consolidados
    const allRisks = analises.flatMap((a: any) => a.risk_flags || [])
    const uniqueRisks = [...new Set(allRisks)]
    
    // Suggestions consolidados
    const allSuggestions = analises.flatMap((a: any) => a.suggestions || [])
    const uniqueSuggestions = [...new Set(allSuggestions)]
    
    return {
      themes: consensualThemes,
      emotions: consensualEmotions,
      intensity: avgIntensity,
      risk_flags: uniqueRisks,
      suggestions: uniqueSuggestions.slice(0, 5) // Limitar a 5 sugestões
    }
  }

  // 📊 Calcular taxa de consenso
  const calcularTaxaConsenso = (resultado: any) => {
    if (resultado.etapa_1_analises.length === 0) return 0
    
    const validacoesAprovadas = resultado.etapa_2_votacoes.filter((v: any) => v.votacao.aprovado).length
    const consensosAprovados = resultado.etapa_3_consensos.filter((c: any) => c.consenso.consenso_final).length
    
    return (validacoesAprovadas + consensosAprovados) / (resultado.etapa_2_votacoes.length + resultado.etapa_3_consensos.length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Preencha título do episódio.')
      return
    }

    // VERIFICAR LIMITE DE ENTRADAS DO PLANO
    if (!canCreateEntry && diaryLimit) {
      setShowLimitReached(true)
      return
    }

    // Descrição é opcional - pode usar apenas lembrete ou deixar vazio
    setIsSubmitting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('allow_ai_learning_product')
        .eq('user_id', user.id)
        .single()

      // Create journal entry
      // ETAPA 2 - TRIÂNGULO: Incluir entry_type e clarity_test_id se aplicável
      const { data: newEntry, error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        context: formData.context || null,
        impact_score: formData.impact_score,
        tags: formData.tags,
        from_voice: false,
        entry_type: formData.entry_type || 'normal',
        clarity_test_id: formData.clarity_test_id || null
      }).select().single()

      if (error) throw error

      // =========================================================================
      // DETECÇÃO VIA DIÁRIO - Tags Graves → Criar risk_alert automaticamente
      // Tags que indicam risco: ameaça velada, explosão, agressão verbal, ameaças
      // =========================================================================
      const GRAVE_TAGS = [
        'ameaça velada', 'ameaca velada',
        'explosão', 'explosao',
        'agressão verbal', 'agressao verbal',
        'ameaças', 'ameacas',
        'violência física', 'violencia fisica',
        'agressão física', 'agressao fisica',
        'estrangulamento',
        'empurrão', 'empurrao',
        'soco', 'tapa', 'chute'
      ]
      
      const tagsLower = formData.tags.map(t => t.toLowerCase())
      const hasGraveTags = tagsLower.some(tag => 
        GRAVE_TAGS.some(grave => tag.includes(grave) || grave.includes(tag))
      )
      
      // Se tem tags graves OU impacto alto (3), criar risk_alert
      if (hasGraveTags || formData.impact_score === 3) {
        try {
          // Determinar nível de risco
          const riskLevel = hasGraveTags ? 'HIGH' : 'MEDIUM'
          const riskCategory = hasGraveTags ? 'PHYSICAL_VIOLENCE' : 'EMOTIONAL_ABUSE'
          
          await supabase.from('risk_alerts').insert({
            user_id: user.id,
            source: 'journal_entry',
            source_id: newEntry?.id,
            level: riskLevel,
            category: riskCategory,
            title: hasGraveTags 
              ? '⚠️ Episódio com sinais de risco detectado'
              : '⚡ Episódio de alto impacto registrado',
            description: `Entrada no diário "${formData.title}" contém ${hasGraveTags ? 'tags que indicam possível risco físico' : 'impacto emocional alto'}. Tags: ${formData.tags.join(', ')}`,
            recommended_action: hasGraveTags
              ? 'Revise seu Plano de Segurança e considere buscar ajuda profissional.'
              : 'Monitore seus padrões emocionais e considere conversar com alguém de confiança.',
            is_read: false,
            is_dismissed: false
          })
          
          console.log('🚨 Risk alert criado automaticamente via diário')
        } catch (riskError) {
          console.error('Erro ao criar risk_alert:', riskError)
          // Não bloquear o fluxo se falhar
        }
      }

      // Analyze patterns if user allowed
      if (settings?.allow_ai_learning_product && formData.description) {
        try {
          const result = await analyzePatternsServer(formData.description)
          
          if (result.success && result.data) {
            // Save analysis as AI event (without the original text)
            await supabase.from('ai_events').insert({
              user_id: user.id,
              event_type: 'pattern_analysis',
              event_data: result.data,
              created_at: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error('Erro ao salvar análise:', error)
        }
      }

      router.push('/diario')
      
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
      alert('Ocorreu um erro ao salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Botão Voltar */}
          <Link 
            href="/diario" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Diário</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Nova Entrada no Diário
            </h1>
            <p className="text-gray-600">
              Registre o episódio para organizar seus pensamentos e identificar padrões
            </p>
          </div>

          {/* Card: Usar Teste de Clareza como base (só aparece se tem perfil e é primeiro diário) */}
          {!isLoadingProfile && hasClarityProfile && hasDiaryEntries === false && showClarityCard && !usedClarityAsBase && (
            <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-violet-100 rounded-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-violet-900 mb-1">
                    Usar seu Teste de Clareza como ponto de partida
                  </h3>
                  <p className="text-sm text-violet-700 mb-3">
                    Você já fez o Teste de Clareza. Podemos usar aquele resultado para te ajudar a registrar seu primeiro episódio.
                  </p>
                  
                  {/* TEMA 4: Duas opções - automático ou preencher formulário */}
                  <div className="flex flex-col gap-3">
                    {/* Opção 1: Criar resumo automático */}
                    <div className="p-3 bg-white/80 rounded-lg border border-violet-200">
                      <p className="text-xs text-violet-600 mb-2 font-medium">✨ Opção rápida</p>
                      <button
                        type="button"
                        onClick={createClarityBaselineEntry}
                        disabled={isCreatingBaseline}
                        className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isCreatingBaseline ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Criando resumo...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Criar resumo inicial automaticamente
                          </>
                        )}
                      </button>
                      <p className="text-xs text-violet-500 mt-1.5">
                        Cria uma entrada com seu resultado do teste, pronta para consulta.
                      </p>
                    </div>
                    
                    {/* Opção 2: Preencher formulário */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={useClarityAsBase}
                        className="px-4 py-2 bg-white hover:bg-violet-50 text-violet-700 text-sm font-medium rounded-lg border border-violet-300 transition-colors"
                      >
                        Preencher formulário com dados do teste
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClarityCard(false)}
                        className="px-4 py-2 text-violet-500 hover:text-violet-700 text-sm font-medium transition-colors"
                      >
                        Não agora
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClarityCard(false)}
                  className="p-1 text-violet-400 hover:text-violet-600"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Badge: Usando teste de clareza como base */}
          {usedClarityAsBase && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">
                Usando seu Teste de Clareza como base. Você pode editar livremente.
              </span>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Lembrete Section */}
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-3">📝 Área de Lembretes (Opcional)</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Grave um lembrete rápido de até 2 minutos para não esquecer detalhes importantes antes de escrever a história completa.
              </p>
              
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    placeholder="Use o microfone para gravar um lembrete rápido ou digite aqui..."
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isSubmitting || isRecordingReminder}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Microphone
                      onTranscription={handleReminderTranscription}
                      onError={handleReminderTranscriptionError}
                      disabled={isSubmitting || isRecordingReminder}
                    />
                  </div>
                </div>
                
                {reminderText && (
                  <div className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                    <span className="text-sm text-yellow-800">Lembrete salvo!</span>
                    <button
                      type="button"
                      onClick={() => setReminderText('')}
                      className="text-xs text-yellow-600 hover:text-yellow-800"
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Episódio *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Discussão sobre finanças"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que aconteceu? <span className="text-gray-400">(opcional)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Você pode: 1) Escrever diretamente, 2) Usar o microfone para transcrever, ou 3) Deixar em branco e usar apenas o lembrete acima"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={6}
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Microphone
                      onTranscription={handleTranscription}
                      onError={handleTranscriptionError}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Escreva, grave para transcrever, ou deixe em branco
                  </p>
                  {reminderText && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          description: prev.description + (prev.description ? '\n\n--- Lembrete ---\n' : '') + reminderText
                        }))
                      }}
                      className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Usar lembrete
                    </button>
                  )}
                </div>
                
                {/* Microaviso de responsabilidade */}
                <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
                  ⚠️ Lembre-se: você está registrando <strong>sua perspectiva</strong>. A IA analisa apenas o que você relata. 
                  Seja honesto(a) consigo mesmo(a) para obter clareza real.
                </p>
              </div>

              {/* Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexto (opcional)
                </label>
                <input
                  type="text"
                  value={formData.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  placeholder="Ex: Em casa, durante o jantar, com as crianças presentes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Impact Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de impacto emocional
                </label>
                <div className="flex space-x-4">
                  {[1, 2, 3].map((score) => (
                    <label key={score} className="flex items-center">
                      <input
                        type="radio"
                        name="impact"
                        value={score}
                        checked={formData.impact_score === score}
                        onChange={(e) => handleInputChange('impact_score', parseInt(e.target.value))}
                        className="mr-2"
                        disabled={isSubmitting}
                      />
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        score === 1 ? 'bg-green-100 text-green-800' :
                        score === 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {score === 1 ? 'Baixo' : score === 2 ? 'Médio' : 'Alto'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags - LAYOUT DE DUAS COLUNAS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags de Tipo de Abuso
                  </label>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    Isso é opcional, mas ajuda a organizar seus episódios. Clique em uma categoria para ver explicações e exemplos.
                  </p>
                </div>

                {/* GRID DE DUAS COLUNAS: Tags à esquerda, Explicações à direita */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                  {/* COLUNA ESQUERDA - Categorias + Chips */}
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const tags = getTagsByCategory(category.id)
                      const colors = category.colorClass
                      const isSelected = selectedCategoryId === category.id
                      
                      return (
                        <div 
                          key={category.id} 
                          className={`p-3 rounded-lg border transition-all ${
                            isSelected 
                              ? `${colors.bg} ${colors.border} ring-2 ring-purple-300 ring-offset-1` 
                              : `${colors.bg} ${colors.border} hover:ring-1 hover:ring-purple-200`
                          }`}
                        >
                          {/* Header da categoria - clicável */}
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryId(isSelected ? null : category.id)}
                            className={`w-full flex items-center justify-between text-left mb-2 ${colors.text}`}
                          >
                            <span className="text-xs font-semibold flex items-center gap-1">
                              {category.emoji} {category.title}
                            </span>
                            <span className="text-xs opacity-70 hidden sm:inline">
                              {isSelected ? '✓ Ver explicações →' : 'Clique para ver explicações'}
                            </span>
                          </button>
                          
                          {/* Chips de tags */}
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => addTag(tag.label.toLowerCase())}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  formData.tags.includes(tag.id) || formData.tags.includes(tag.label.toLowerCase())
                                    ? `${colors.bgActive} text-white`
                                    : `bg-white ${colors.text} border ${colors.border} hover:opacity-80`
                                }`}
                                disabled={isSubmitting}
                              >
                                {tag.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Custom tag input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag(newTag)
                          }
                        }}
                        placeholder="Adicionar tag personalizada"
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => addTag(newTag)}
                        className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                        disabled={isSubmitting}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* COLUNA DIREITA - Explicações e Exemplos (modo side) */}
                  <div className="hidden lg:block sticky top-4 self-start max-h-[600px]">
                    <AbuseTagsDictionary
                      mode="side"
                      focusedCategoryId={selectedCategoryId}
                      selectedTags={formData.tags}
                      onSelectTag={(tagId) => addTag(tagId)}
                    />
                  </div>
                </div>

                {/* Em mobile: mostrar dicionário abaixo quando categoria selecionada */}
                {selectedCategoryId && (
                  <div className="mt-4 lg:hidden">
                    <AbuseTagsDictionary
                      mode="side"
                      focusedCategoryId={selectedCategoryId}
                      selectedTags={formData.tags}
                      onSelectTag={(tagId) => addTag(tagId)}
                    />
                  </div>
                )}

                {/* Selected tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm flex items-center"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-500 hover:text-purple-700"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Sugestões da IA:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 bg-purple-200 text-purple-800 rounded-md text-sm hover:bg-purple-300"
                        disabled={isSubmitting}
                      >
                        + #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Entrada'}
                </button>
                
                <button
                  type="button"
                  onClick={analyzeEntry}
                  disabled={isSubmitting || isAnalyzing || (!formData.description.trim() && !reminderText.trim())}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
                </button>
              </div>

              {/* RESULTADO DA ANÁLISE - EXATAMENTE ABAIXO DO BOTÃO */}
              {analysisResult && (
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  {/* 🎛️ PAINEL ADMINISTRATIVO */}
                  <div className="mb-4 p-3 bg-gray-900 text-white rounded-lg">
                    <h3 className="font-bold text-lg mb-3">🎛️ PAINEL ADMINISTRATIVO DE IAS</h3>
                    
                    {/* 📊 Gráfico de Importância das Etapas */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">📊 IMPORTÂNCIA DAS ETAPAS:</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-xs w-32">Etapa 1 - Análise:</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-4">
                            <div className="bg-red-500 h-4 rounded-full" style={{ width: '95%' }}></div>
                          </div>
                          <span className="text-xs ml-2">95% 🔴</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs w-32">Etapa 2 - Votação:</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-4">
                            <div className="bg-yellow-500 h-4 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                          <span className="text-xs ml-2">70% 🟡</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs w-32">Etapa 3 - Consenso:</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-4">
                            <div className="bg-orange-500 h-4 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-xs ml-2">85% 🟠</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs w-32">Etapa 4 - Transpar:</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                          <span className="text-xs ml-2">40% 🟢</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 🎯 Controles do Administrador */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-xs">
                        <p>🔍 Etapa 1: {analysisResult.metadados_colaborativos?.total_ias || 0} IAs</p>
                        <p>🗳️ Etapa 2: {analysisResult.metadados_colaborativos?.validacoes || 0} Validações</p>
                      </div>
                      <div className="text-xs">
                        <p>🤝 Etapa 3: {analysisResult.metadados_colaborativos?.consensos || 0} Consensos</p>
                        <p>📊 Taxa: {((analysisResult.metadados_colaborativos?.taxa_consenso || 0) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    
                    {/* 🚨 Indicadores de Segurança */}
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.metadados_colaborativos?.taxa_consenso > 0.8 && (
                        <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">✅ Alto Consenso</span>
                      )}
                      {analysisResult.risk_flags && analysisResult.risk_flags.length > 0 && (
                        <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">⚠️ Riscos Detectados</span>
                      )}
                      {analysisResult.metadados_colaborativos?.analise_juridica && (
                        <span className="px-2 py-1 bg-yellow-600 text-white rounded text-xs">⚖️ Análise Jurídica</span>
                      )}
                      {analysisResult.metadados_colaborativos?.deteccao_veracidade && (
                        <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">🔍 Veracidade</span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-blue-900 mb-3 text-lg">📊 RESULTADO DA ANÁLISE COLABORATIVA</h3>
                  
                  {/* Tags detectadas */}
                  {analysisResult.themes && analysisResult.themes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">🏷️ Tags detectadas (Consenso das IAs):</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.themes.map((theme: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm">
                            #{theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emoções detectadas */}
                  {analysisResult.emotions && analysisResult.emotions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">😔 Emoções detectadas (Consenso das IAs):</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.emotions.map((emotion: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intensidade */}
                  {analysisResult.intensity && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">⚡ Nível de impacto emocional detectado (Média das IAs):</p>
                      <div className="flex items-center mb-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-3 rounded-full"
                            style={{ width: `${analysisResult.intensity * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-blue-900">
                          {(analysisResult.intensity * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {analysisResult.intensity < 0.3 ? "🟢 Baixo impacto - Episódio leve, com efeitos emocionais limitados" :
                         analysisResult.intensity < 0.7 ? "🟡 Médio impacto - Episódio moderado, com efeitos emocionais significativos" :
                         "🔴 Alto impacto - Episódio severo, com efeitos emocionais intensos e duradouros"}
                      </p>
                    </div>
                  )}

                  {/* RESUMO COMPLETO DA ANÁLISE */}
                  <div className="mb-4 p-3 bg-white border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-800 mb-2">📋 RESUMO DA ANÁLISE COLABORATIVA:</p>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p><strong>Padrões identificados:</strong> {analysisResult.themes?.join(', ') || 'Nenhum padrão específico detectado'}</p>
                      <p><strong>Estado emocional:</strong> {analysisResult.emotions?.join(', ') || 'Emoções não especificadas'}</p>
                      <p><strong>Nível de impacto:</strong> {(analysisResult.intensity * 100).toFixed(0)}% - {
                        analysisResult.intensity < 0.3 ? 'Baixo' :
                        analysisResult.intensity < 0.7 ? 'Médio' : 'Alto'
                      } ({analysisResult.metadados_colaborativos?.total_ias || 0} IAs)</p>
                      {analysisResult.risk_flags && analysisResult.risk_flags.length > 0 && (
                        <p><strong>⚠️ Pontos de atenção:</strong> {analysisResult.risk_flags.join(', ')}</p>
                      )}
                      <p><strong>Recomendações:</strong> {analysisResult.suggestions?.join('. ') || 'Continue monitorando seus padrões emocionais.'}</p>
                      <p><strong>🎛️ Confiabilidade do sistema:</strong> {((analysisResult.metadados_colaborativos?.taxa_consenso || 0) * 100).toFixed(0)}% de consenso entre IAs</p>
                    </div>
                  </div>

                  {/* Botão para gerar PDF */}
                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => generateAnalysisPDF(analysisResult)}
                      disabled={isGeneratingPDF}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Gerando PDF...
                        </>
                      ) : (
                        <>📄 GERAR PDF DA ANÁLISE COLABORATIVA</>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      PDF com hash SHA-256 para verificação de integridade
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      Este documento é para uso pessoal e não tem valor jurídico automático
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dicas:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seja específico sobre o que aconteceu</li>
              <li>• Inclue citações diretas se lembrar</li>
              <li>• Descreva como você se sentiu durante e depois</li>
              <li>• Use tags para encontrar padrões depois</li>
              <li>• A IA pode sugerir tags baseadas na sua descrição</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Termos Obrigatório - Agora com verificação inteligente via CUC */}
      {!isLoadingTerms && (
        <ResponsibilityTermsModal 
          onAccept={markAsAccepted} 
          context="diario"
          autoCheck={true}
          forceShow={hasAcceptedTerms === false}
        />
      )}

      {/* Modal de Limite de Entradas Atingido */}
      {showLimitReached && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Limite de entradas atingido</h2>
                  <p className="text-violet-200 text-sm">Plano: {planName}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Você atingiu o limite de <strong>{diaryLimit?.limit}</strong> entradas no diário este mês.
              </p>
              <p className="text-gray-600 text-sm">
                Para continuar registrando episódios, você pode:
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">📅</span>
                  Aguardar o próximo mês (o limite reseta no dia 1)
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  Fazer upgrade para um plano com mais entradas
                </li>
              </ul>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLimitReached(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Entendi
                </button>
                <Link
                  href="/planos"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-center"
                >
                  Ver Planos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Wrapper com Suspense para useSearchParams
export default function NovoDiarioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Carregando formulário...</p>
        </div>
      </div>
    }>
      <NovoDiarioPageContent />
    </Suspense>
  )
}
