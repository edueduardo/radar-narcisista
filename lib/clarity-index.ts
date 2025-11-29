/**
 * 🎯 ÍNDICE DE CLAREZA (IC) - Métrica Proprietária do Radar Narcisista
 * 
 * Escala 0-100 que mede a evolução da clareza emocional da pessoa
 * Componentes:
 * - Teste de Clareza: 0-40 pontos
 * - Diário: 0-20 pontos  
 * - Chat IA: 0-20 pontos
 * - Plano de Segurança: 0-20 pontos
 */

export interface UserClarityData {
  testScore: number         // 0-40 (baseado no Teste de Clareza)
  diaryEntries: number      // 0-20 (1 ponto por episódio, max 20)
  chatSessions: number      // 0-20 (1 ponto por sessão, max 20)
  hasSafetyPlan: boolean    // 0-20 (20 se tem, 0 se não tem)
}

export interface ClarityIndexResult {
  ic: number                // Índice final (0-100)
  components: {
    test: number
    diary: number
    chat: number
    safety: number
  }
  level: 'Muito Baixo' | 'Baixo' | 'Moderado' | 'Bom' | 'Excelente'
  interpretation: string
  nextSteps: string[]
}

/**
 * Calcula o Índice de Clareza (IC) de um usuário
 */
export function calculateClarityIndex(data: UserClarityData): ClarityIndexResult {
  // Componentes do IC
  const testScore = Math.min(data.testScore, 40)
  const diaryScore = Math.min(data.diaryEntries, 20)
  const chatScore = Math.min(data.chatSessions, 20)
  const safetyScore = data.hasSafetyPlan ? 20 : 0
  
  // IC total
  const ic = testScore + diaryScore + chatScore + safetyScore
  
  // Determinar nível
  let level: ClarityIndexResult['level']
  let interpretation: string
  let nextSteps: string[]
  
  if (ic >= 80) {
    level = 'Excelente'
    interpretation = 'Você tem uma clareza muito boa sobre sua situação e está tomando ações concretas.'
    nextSteps = [
      'Continue usando as ferramentas para manter sua clareza',
      'Considere compartilhar sua experiência com alguém de confiança',
      'Explore conteúdos avançados sobre relacionamentos saudáveis'
    ]
  } else if (ic >= 60) {
    level = 'Bom'
    interpretation = 'Você está no caminho certo, com boa clareza e começando a agir.'
    nextSteps = [
      'Use o diário para registrar seus progressos',
      'Continue as conversas com a IA para aprofundar insights',
      'Monte seu plano de segurança se ainda não tiver'
    ]
  } else if (ic >= 40) {
    level = 'Moderado'
    interpretation = 'Você está começando a entender a situação, mas há espaço para evoluir.'
    nextSteps = [
      'Faça o Teste de Clareza novamente para identificar padrões',
      'Use o chat IA para explorar suas dúvidas',
      'Comece a registrar episódios no diário'
    ]
  } else if (ic >= 20) {
    level = 'Baixo'
    interpretation = 'Você está no início do processo de entendimento. Continue persistindo.'
    nextSteps = [
      'Faça o Teste de Clareza completo',
      'Converse com a IA sobre suas dúvidas',
      'Leia os artigos sobre sinais de abuso'
    ]
  } else {
    level = 'Muito Baixo'
    interpretation = 'Você está começando a perceber que algo não está certo. Isso já é um passo importante.'
    nextSteps = [
      'Faça o Teste de Clareza',
      'Converse com a IA sobre o que está sentindo',
      'Leia sobre os primeiros sinais de relacionamentos abusivos'
    ]
  }
  
  return {
    ic,
    components: {
      test: testScore,
      diary: diaryScore,
      chat: chatScore,
      safety: safetyScore
    },
    level,
    interpretation,
    nextSteps
  }
}

/**
 * Calcula a evolução do IC ao longo do tempo
 */
export function calculateClarityEvolution(
  initialData: UserClarityData,
  currentData: UserClarityData,
  daysPassed: number
): {
  initialIC: number
  currentIC: number
  improvement: number
  improvementPercent: number
  rate: number // pontos por dia
  interpretation: string
} {
  const initial = calculateClarityIndex(initialData)
  const current = calculateClarityIndex(currentData)
  
  const improvement = current.ic - initial.ic
  const improvementPercent = initial.ic > 0 ? (improvement / initial.ic) * 100 : 0
  const rate = daysPassed > 0 ? improvement / daysPassed : 0
  
  let interpretation = ''
  
  if (improvement > 20) {
    interpretation = `Excelente progresso! Você ganhou ${improvement} pontos de clareza em ${daysPassed} dias.`
  } else if (improvement > 10) {
    interpretation = `Bom progresso! Você melhorou ${improvement} pontos em ${daysPassed} dias.`
  } else if (improvement > 0) {
    interpretation = `Você está evoluindo! Ganhou ${improvement} pontos de clareza.`
  } else if (improvement === 0) {
    interpretation = 'Seu IC permaneceu estável. Continue usando as ferramentas para evoluir.'
  } else {
    interpretation = `Seu IC diminuiu ${Math.abs(improvement)} pontos. Isso é normal - processos emocionais têm altos e baixos.`
  }
  
  return {
    initialIC: initial.ic,
    currentIC: current.ic,
    improvement,
    improvementPercent,
    rate,
    interpretation
  }
}

/**
 * Gera insights baseados no IC para o Analytics Coach
 */
export function generateClarityInsights(
  userProgressData: Array<{
    userId: string
    initialIC: number
    currentIC: number
    daysActive: number
    components: UserClarityData
  }>
): string[] {
  const insights: string[] = []
  
  // Média de evolução
  const avgImprovement = userProgressData.reduce((sum, user) => 
    sum + (user.currentIC - user.initialIC), 0) / userProgressData.length
  
  // Usuários que não melhoraram
  const notImproving = userProgressData.filter(user => 
    user.currentIC <= user.initialIC).length
  
  // Componentes mais fortes
  const avgComponents = {
    test: userProgressData.reduce((sum, user) => sum + user.components.testScore, 0) / userProgressData.length,
    diary: userProgressData.reduce((sum, user) => sum + user.components.diaryEntries, 0) / userProgressData.length,
    chat: userProgressData.reduce((sum, user) => sum + user.components.chatSessions, 0) / userProgressData.length,
    safety: userProgressData.filter(user => user.components.hasSafetyPlan).length / userProgressData.length * 20
  }
  
  // Gerar insights
  if (avgImprovement > 15) {
    insights.push(`📈 Os usuários estão melhorando em média ${avgImprovement.toFixed(1)} pontos de clareza. O funil está funcionando bem!`)
  } else if (avgImprovement > 5) {
    insights.push(`📊 Melhoria moderada de ${avgImprovement.toFixed(1)} pontos. Considere incentivar mais uso do diário.`)
  } else {
    insights.push(`⚠️ Baixa melhoria média (${avgImprovement.toFixed(1)} pontos). Reveja a experiência inicial.`)
  }
  
  if (notImproving > userProgressData.length * 0.3) {
    insights.push(`🚨 ${notImproving} usuários (${((notImproving/userProgressData.length)*100).toFixed(1)}%) não melhoraram. Precisam de atenção especial.`)
  }
  
  const strongest = Object.entries(avgComponents).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  const weakest = Object.entries(avgComponents).reduce((a, b) => a[1] < b[1] ? a : b)[0]
  
  insights.push(`💪 Componente mais forte: ${strongest === 'test' ? 'Teste de Clareza' : strongest === 'diary' ? 'Diário' : strongest === 'chat' ? 'Chat IA' : 'Plano de Segurança'}`)
  insights.push(`🔍 Componente que precisa atenção: ${weakest === 'test' ? 'Teste de Clareza' : weakest === 'diary' ? 'Diário' : weakest === 'chat' ? 'Chat IA' : 'Plano de Segurança'}`)
  
  return insights
}

/**
 * Formata o IC para exibição no dashboard
 */
export function formatICForDisplay(ic: number): {
  value: string
  color: string
  bgColor: string
  level: string
} {
  let color = ''
  let bgColor = ''
  let level = ''
  
  if (ic >= 80) {
    color = 'text-green-600'
    bgColor = 'bg-green-100'
    level = 'Excelente'
  } else if (ic >= 60) {
    color = 'text-blue-600'
    bgColor = 'bg-blue-100'
    level = 'Bom'
  } else if (ic >= 40) {
    color = 'text-yellow-600'
    bgColor = 'bg-yellow-100'
    level = 'Moderado'
  } else if (ic >= 20) {
    color = 'text-orange-600'
    bgColor = 'bg-orange-100'
    level = 'Baixo'
  } else {
    color = 'text-red-600'
    bgColor = 'bg-red-100'
    level = 'Muito Baixo'
  }
  
  return {
    value: ic.toString(),
    color,
    bgColor,
    level
  }
}

console.log('🎯 Clarity Index system initialized')
