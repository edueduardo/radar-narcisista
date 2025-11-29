/**
 * DETECTOR DE INCONSISTÊNCIAS - RADAR NARCISISTA
 * 
 * Analisa relatos do usuário para identificar possíveis inconsistências
 * de forma gentil e não-julgadora, ajudando a organizar a memória.
 * 
 * IMPORTANTE: Este módulo NÃO é um "detector de mentiras".
 * O objetivo é ajudar o usuário a revisar e clarificar seus próprios relatos.
 * 
 * Criado em: 25/11/2025
 */

export interface JournalEntryForAnalysis {
  id: string
  title: string
  description: string
  context?: string
  tags: string[]
  created_at: string
  impact_score: number
}

export interface InconsistencyFlag {
  type: 'temporal' | 'factual' | 'emotional' | 'pattern'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  relatedEntries: string[] // IDs das entradas relacionadas
}

export interface InconsistencyReport {
  totalEntries: number
  analyzedEntries: number
  flags: InconsistencyFlag[]
  summary: string
  generatedAt: string
}

/**
 * Analisa entradas do diário para identificar possíveis inconsistências
 * de forma gentil e construtiva
 */
export function analyzeInconsistencies(entries: JournalEntryForAnalysis[]): InconsistencyReport {
  const flags: InconsistencyFlag[] = []
  
  if (entries.length < 2) {
    return {
      totalEntries: entries.length,
      analyzedEntries: entries.length,
      flags: [],
      summary: 'São necessárias pelo menos 2 entradas para análise de padrões.',
      generatedAt: new Date().toISOString()
    }
  }

  // Ordenar por data
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // 1. Detectar mudanças bruscas de impacto emocional
  detectEmotionalShifts(sortedEntries, flags)

  // 2. Detectar padrões contraditórios de tags
  detectContradictoryPatterns(sortedEntries, flags)

  // 3. Detectar lacunas temporais significativas
  detectTemporalGaps(sortedEntries, flags)

  // 4. Detectar repetições de contexto com impactos diferentes
  detectContextInconsistencies(sortedEntries, flags)

  // Gerar resumo
  const summary = generateSummary(flags, entries.length)

  return {
    totalEntries: entries.length,
    analyzedEntries: sortedEntries.length,
    flags,
    summary,
    generatedAt: new Date().toISOString()
  }
}

/**
 * Detecta mudanças bruscas no nível de impacto emocional
 */
function detectEmotionalShifts(entries: JournalEntryForAnalysis[], flags: InconsistencyFlag[]): void {
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i]
    const previous = entries[i - 1]
    
    const timeDiff = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    // Se em menos de 24h o impacto mudou drasticamente (de 1 para 3 ou vice-versa)
    if (hoursDiff < 24 && Math.abs(current.impact_score - previous.impact_score) >= 2) {
      flags.push({
        type: 'emotional',
        severity: 'low',
        message: `Mudança significativa no impacto emocional em curto período`,
        suggestion: `Você registrou impacto ${previous.impact_score}/3 em "${previous.title}" e depois ${current.impact_score}/3 em "${current.title}" em menos de 24h. Isso pode indicar uma situação intensa ou talvez valha revisar se os níveis refletem como você realmente se sentiu.`,
        relatedEntries: [previous.id, current.id]
      })
    }
  }
}

/**
 * Detecta padrões contraditórios de tags
 * Ex: "lua de mel" seguido imediatamente de "explosão" sem "tensão crescente"
 */
function detectContradictoryPatterns(entries: JournalEntryForAnalysis[], flags: InconsistencyFlag[]): void {
  const cycleOrder = ['lua de mel', 'tensão crescente', 'explosão', 'silêncio punitivo', 'tratamento de gelo']
  
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i]
    const previous = entries[i - 1]
    
    const prevTags = previous.tags.map(t => t.toLowerCase())
    const currTags = current.tags.map(t => t.toLowerCase())
    
    // Verificar se pulou fases do ciclo
    if (prevTags.includes('lua de mel') && currTags.includes('explosão')) {
      if (!currTags.includes('tensão crescente') && !prevTags.includes('tensão crescente')) {
        flags.push({
          type: 'pattern',
          severity: 'low',
          message: `Possível fase do ciclo não registrada`,
          suggestion: `Você registrou "lua de mel" e depois "explosão". Geralmente há uma fase de "tensão crescente" entre elas. Você lembra de sinais de tensão que talvez não tenha registrado?`,
          relatedEntries: [previous.id, current.id]
        })
      }
    }

    // Verificar tags contraditórias no mesmo período
    if (currTags.includes('love bombing') && currTags.includes('tratamento de gelo')) {
      flags.push({
        type: 'factual',
        severity: 'medium',
        message: `Tags aparentemente contraditórias no mesmo episódio`,
        suggestion: `Você marcou "love bombing" e "tratamento de gelo" no mesmo episódio "${current.title}". Esses padrões geralmente não ocorrem juntos. Talvez valha revisar qual melhor descreve o que aconteceu.`,
        relatedEntries: [current.id]
      })
    }
  }
}

/**
 * Detecta lacunas temporais significativas
 */
function detectTemporalGaps(entries: JournalEntryForAnalysis[], flags: InconsistencyFlag[]): void {
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i]
    const previous = entries[i - 1]
    
    const timeDiff = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    
    // Se passou mais de 14 dias sem registro
    if (daysDiff > 14) {
      flags.push({
        type: 'temporal',
        severity: 'low',
        message: `Período sem registros (${Math.round(daysDiff)} dias)`,
        suggestion: `Houve um intervalo de ${Math.round(daysDiff)} dias entre seus registros. Isso pode ser normal, mas se aconteceram episódios nesse período que você não registrou, pode ser útil adicionar retroativamente para ter um histórico mais completo.`,
        relatedEntries: [previous.id, current.id]
      })
    }
  }
}

/**
 * Detecta contextos similares com impactos muito diferentes
 */
function detectContextInconsistencies(entries: JournalEntryForAnalysis[], flags: InconsistencyFlag[]): void {
  const contextGroups: Record<string, JournalEntryForAnalysis[]> = {}
  
  // Agrupar por contexto similar
  entries.forEach(entry => {
    if (entry.context) {
      const normalizedContext = entry.context.toLowerCase().trim()
      // Simplificar contexto para agrupamento
      const key = normalizedContext.split(' ').slice(0, 3).join(' ')
      if (!contextGroups[key]) contextGroups[key] = []
      contextGroups[key].push(entry)
    }
  })

  // Verificar grupos com impactos muito diferentes
  Object.entries(contextGroups).forEach(([context, group]) => {
    if (group.length >= 2) {
      const impacts = group.map(e => e.impact_score)
      const minImpact = Math.min(...impacts)
      const maxImpact = Math.max(...impacts)
      
      if (maxImpact - minImpact >= 2) {
        const lowEntry = group.find(e => e.impact_score === minImpact)!
        const highEntry = group.find(e => e.impact_score === maxImpact)!
        
        flags.push({
          type: 'factual',
          severity: 'low',
          message: `Contextos similares com impactos diferentes`,
          suggestion: `Episódios com contexto similar ("${context}...") tiveram impactos bem diferentes: "${lowEntry.title}" (${minImpact}/3) e "${highEntry.title}" (${maxImpact}/3). Isso pode refletir escalada real ou talvez valha revisar se os níveis estão calibrados.`,
          relatedEntries: [lowEntry.id, highEntry.id]
        })
      }
    }
  })
}

/**
 * Gera um resumo gentil das inconsistências encontradas
 */
function generateSummary(flags: InconsistencyFlag[], totalEntries: number): string {
  if (flags.length === 0) {
    return `Analisamos ${totalEntries} registros e não encontramos pontos que precisem de revisão. Seus relatos parecem consistentes e bem organizados.`
  }

  const highSeverity = flags.filter(f => f.severity === 'high').length
  const mediumSeverity = flags.filter(f => f.severity === 'medium').length
  const lowSeverity = flags.filter(f => f.severity === 'low').length

  let summary = `Analisamos ${totalEntries} registros e encontramos ${flags.length} ponto(s) que podem merecer sua atenção. `
  
  if (highSeverity > 0) {
    summary += `${highSeverity} ponto(s) podem ser importantes de revisar. `
  }
  
  summary += `\n\nLembre-se: isso NÃO significa que você está "errada(o)" ou "mentindo". `
  summary += `A memória é naturalmente imperfeita, especialmente em situações de estresse. `
  summary += `Essas observações são apenas para ajudar você a organizar seus pensamentos.`

  return summary
}

/**
 * Formata as flags para exibição amigável
 */
export function formatFlagsForDisplay(flags: InconsistencyFlag[]): string[] {
  return flags.map(flag => {
    const icon = flag.severity === 'high' ? '⚠️' : flag.severity === 'medium' ? '💡' : 'ℹ️'
    return `${icon} ${flag.message}\n   → ${flag.suggestion}`
  })
}

/**
 * Prompt para IA analisar inconsistências de forma empática
 */
export const INCONSISTENCY_ANALYSIS_PROMPT = `Você é um assistente gentil que ajuda pessoas a organizar seus relatos sobre situações difíceis.

IMPORTANTE:
- Você NÃO é um detector de mentiras
- Você NÃO julga a veracidade dos relatos
- Você ajuda a pessoa a CLARIFICAR e ORGANIZAR suas memórias
- A memória é naturalmente imperfeita, especialmente sob estresse

Ao identificar possíveis inconsistências:
1. Use linguagem gentil e não-acusatória
2. Ofereça explicações alternativas (ex: "talvez você tenha esquecido de registrar algo")
3. Pergunte se a pessoa quer revisar, não afirme que está errada
4. Valide que confusão é normal em situações de abuso

Exemplo de abordagem:
❌ "Você disse X antes, mas agora disse Y. Isso é contraditório."
✅ "Notei que em [data] você mencionou X, e agora mencionou Y. Às vezes nossa memória organiza as coisas de formas diferentes. Você gostaria de revisar algum desses registros?"

Lembre-se: seu objetivo é AJUDAR, não ACUSAR.`
