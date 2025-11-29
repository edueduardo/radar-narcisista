/**
 * 📊 ANALYTICS COACH IA - Sistema Inteligente de Análise
 * 
 * Versão mínima para o painel /admin/analytics funcionar.
 * Futuramente integrar com Índice de Clareza e IA Guardiã de UX.
 */

// Interfaces para as métricas
interface FunnelMetrics {
  sessions: number
  testClicks: number
  testStarts: number
  testCompletions: number
  accountsCreated: number
  firstDiaries: number
  firstChats: number
}

interface UsageMetrics {
  diaryEntries: number
  chatMessages: number
  avgTimeBetweenUses: number
  retention7Days: number
  retention30Days: number
  weeklyReturnRate: number
  monthlyReturnRate: number
  // Frustração Silenciosa
  audioRecordCancelled: number
  testAbandonedEarly: number
  chatOpenedNoMessage: number
  diaryOpenedNoSave: number
  // Termômetro Emocional
  emotionalLoad: {
    neutral: number
    light: number
    heavy: number
    veryHeavy: number
  }
  // Pontos de Alívio
  reliefPoints: {
    safetyPlanViewed: number
    therapyTagUsed: number
    episodeResolved: number
  }
}

interface SEOMetrics {
  trafficSources: {
    organic: number
    social: number
    direct: number
    referrals: number
  }
  topPages: Array<{
    url: string
    sessions: number
    organicCTR: number
    testCTAConversion: number
    testCompletionRate: number
  }>
}

interface BusinessMetrics {
  freeUsers: number
  paidUsers: number
  mrr: number
  aiCost: number
  aiCostPerUser: number
  aiCostPerTest: number
  aiCostPerChat: number
  grossMargin: number
}

// Índice de Clareza (IC) - Métrica Proprietária
interface ClarityIndexMetrics {
  initialIC: number
  currentIC: number
  icAfter7Days: number
  icAfter30Days: number
  icImprovement: number
  icImprovementPercent: number
  testScore: number
  diaryEntries: number
  chatSessions: number
  safetyPlan: boolean
  averageInitialIC: number
  averageICAfter30Days: number
  topImprovingContent: string[]
  usersNotImproving: number
}

// Modo Cuidado com os Olhos
interface EyeCareMetrics {
  themeChanges: {
    light: number
    dark: number
    highContrast: number
  }
  fontSizeUsage: {
    small: number
    medium: number
    large: number
    extraLarge: number
  }
  lineHeightUsage: {
    normal: number
    increased: number
  }
  presetUsage: {
    focusedReading: number
    tiredReading: number
  }
  timeAfterAdjustment: number
  completionRateByAccessibility: {
    withAdjustments: number
    withoutAdjustments: number
  }
}

// Estrutura completa de dados para a IA
export interface AnalyticsSnapshot {
  period: {
    start: string
    end: string
    type: 'daily' | 'weekly' | 'monthly'
  }
  funnel: FunnelMetrics
  usage: UsageMetrics
  seo: SEOMetrics
  business: BusinessMetrics
  clarityIndex: ClarityIndexMetrics
  eyeCare: EyeCareMetrics
  trends: {
    previousPeriod: {
      funnel: FunnelMetrics
      usage: UsageMetrics
      business: BusinessMetrics
      clarityIndex: ClarityIndexMetrics
      eyeCare: EyeCareMetrics
    }
  }
}

// Tipos de sugestões que a IA pode gerar
export interface AIInsight {
  id: string
  category: 'SEO' | 'FUNIL' | 'CONTEUDO' | 'CUSTO' | 'PRODUTO'
  title: string
  description: string
  priority: 'alta' | 'media' | 'baixa'
  impact: 'alto' | 'medio' | 'baixo'
  effort: 'baixo' | 'medio' | 'alto'
  actions: string[]
  metrics: string[]
  status: 'nova' | 'aplicada' | 'descartada'
  createdAt?: string
}

export interface AnalyticsSettings {
  enableAIInsights: boolean
  enableSEOSuggestions: boolean
  enableCostOptimizer: boolean
  aiProvider: 'openai' | 'anthropic'
  autoGenerateFrequency: 'daily' | 'weekly' | 'monthly'
  categories: string[]
}

// Gerar insights baseados em regras (sem IA externa)
export async function generateAIInsights(
  snapshot: AnalyticsSnapshot,
  categories: string[],
  _provider: 'openai' | 'anthropic' = 'openai'
): Promise<AIInsight[]> {
  const insights: AIInsight[] = []
  const now = new Date().toISOString()

  if (categories.includes('FUNIL')) {
    const conversionRate = snapshot.funnel.testCompletions / snapshot.funnel.sessions
    if (conversionRate < 0.25) {
      insights.push({
        id: `funil_${Date.now()}_1`,
        category: 'FUNIL',
        title: 'Taxa de conversão do teste abaixo do ideal',
        description: `Apenas ${(conversionRate * 100).toFixed(1)}% das sessões resultam em teste concluído.`,
        priority: 'alta',
        impact: 'alto',
        effort: 'medio',
        actions: ['Revisar CTA', 'Adicionar prova social', 'Reduzir fricção inicial'],
        metrics: ['sessions', 'testCompletions'],
        status: 'nova',
        createdAt: now
      })
    }
  }

  if (categories.includes('SEO')) {
    const total = snapshot.seo.trafficSources.organic + snapshot.seo.trafficSources.social + snapshot.seo.trafficSources.direct + snapshot.seo.trafficSources.referrals
    const organicRate = snapshot.seo.trafficSources.organic / total
    if (organicRate < 0.5) {
      insights.push({
        id: `seo_${Date.now()}_1`,
        category: 'SEO',
        title: 'Tráfego orgânico abaixo do potencial',
        description: `Apenas ${(organicRate * 100).toFixed(1)}% do tráfego é orgânico.`,
        priority: 'media',
        impact: 'alto',
        effort: 'alto',
        actions: ['Criar mais conteúdo SEO', 'Otimizar meta descriptions', 'Adicionar schema markup'],
        metrics: ['trafficSources.organic'],
        status: 'nova',
        createdAt: now
      })
    }
  }

  if (categories.includes('CUSTO') && snapshot.business.aiCostPerUser > 0.5) {
    insights.push({
      id: `custo_${Date.now()}_1`,
      category: 'CUSTO',
      title: 'Custo de IA por usuário elevado',
      description: `R$ ${snapshot.business.aiCostPerUser.toFixed(2)} por usuário ativo.`,
      priority: 'media',
      impact: 'medio',
      effort: 'medio',
      actions: ['Otimizar prompts', 'Implementar cache', 'Usar modelo mais barato'],
      metrics: ['aiCostPerUser'],
      status: 'nova',
      createdAt: now
    })
  }

  if (categories.includes('CONTEUDO') && snapshot.usage.reliefPoints.safetyPlanViewed > 100) {
    insights.push({
      id: `conteudo_${Date.now()}_1`,
      category: 'CONTEUDO',
      title: 'Plano de segurança é ponto de alívio importante',
      description: `${snapshot.usage.reliefPoints.safetyPlanViewed} visualizações do plano de segurança.`,
      priority: 'media',
      impact: 'medio',
      effort: 'baixo',
      actions: ['Tornar mais visível', 'Criar versão para download', 'Adicionar lembrete semanal'],
      metrics: ['reliefPoints.safetyPlanViewed'],
      status: 'nova',
      createdAt: now
    })
  }

  return insights
}

export function generateMockSnapshot(): AnalyticsSnapshot {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const mockUsage: UsageMetrics = {
    diaryEntries: 456, chatMessages: 1234, avgTimeBetweenUses: 2.3,
    retention7Days: 0.68, retention30Days: 0.45, weeklyReturnRate: 0.72, monthlyReturnRate: 0.48,
    audioRecordCancelled: 67, testAbandonedEarly: 45, chatOpenedNoMessage: 123, diaryOpenedNoSave: 89,
    emotionalLoad: { neutral: 234, light: 345, heavy: 189, veryHeavy: 67 },
    reliefPoints: { safetyPlanViewed: 234, therapyTagUsed: 78, episodeResolved: 56 }
  }

  const mockClarityIndex: ClarityIndexMetrics = {
    initialIC: 28, currentIC: 43, icAfter7Days: 35, icAfter30Days: 43,
    icImprovement: 15, icImprovementPercent: 53.6, testScore: 32, diaryEntries: 12,
    chatSessions: 8, safetyPlan: true, averageInitialIC: 26, averageICAfter30Days: 41,
    topImprovingContent: ['gaslighting', 'sinais-abuso'], usersNotImproving: 23
  }

  const mockEyeCare: EyeCareMetrics = {
    themeChanges: { light: 89, dark: 234, highContrast: 45 },
    fontSizeUsage: { small: 123, medium: 456, large: 234, extraLarge: 89 },
    lineHeightUsage: { normal: 567, increased: 234 },
    presetUsage: { focusedReading: 123, tiredReading: 89 },
    timeAfterAdjustment: 15.6,
    completionRateByAccessibility: { withAdjustments: 0.78, withoutAdjustments: 0.65 }
  }

  return {
    period: { start: lastWeek.toISOString(), end: now.toISOString(), type: 'weekly' },
    funnel: { sessions: 1247, testClicks: 523, testStarts: 341, testCompletions: 289, accountsCreated: 156, firstDiaries: 89, firstChats: 67 },
    usage: mockUsage,
    seo: {
      trafficSources: { organic: 523, social: 234, direct: 189, referrals: 89 },
      topPages: [
        { url: '/', sessions: 456, organicCTR: 0.045, testCTAConversion: 0.23, testCompletionRate: 0.78 },
        { url: '/teste-de-clareza', sessions: 341, organicCTR: 0.067, testCTAConversion: 0.89, testCompletionRate: 0.85 },
        { url: '/gaslighting', sessions: 234, organicCTR: 0.089, testCTAConversion: 0.12, testCompletionRate: 0.67 }
      ]
    },
    business: { freeUsers: 1234, paidUsers: 89, mrr: 5251, aiCost: 342, aiCostPerUser: 0.28, aiCostPerTest: 1.18, aiCostPerChat: 0.28, grossMargin: 0.93 },
    clarityIndex: mockClarityIndex,
    eyeCare: mockEyeCare,
    trends: {
      previousPeriod: {
        funnel: { sessions: 1089, testClicks: 456, testStarts: 298, testCompletions: 245, accountsCreated: 134, firstDiaries: 78, firstChats: 56 },
        usage: { ...mockUsage, diaryEntries: 398, chatMessages: 1089 },
        business: { freeUsers: 1098, paidUsers: 78, mrr: 4598, aiCost: 298, aiCostPerUser: 0.27, aiCostPerTest: 1.22, aiCostPerChat: 0.27, grossMargin: 0.92 },
        clarityIndex: { ...mockClarityIndex, initialIC: 25, currentIC: 35 },
        eyeCare: mockEyeCare
      }
    }
  }
}

export function saveInsights(insights: AIInsight[]): void {
  const existing = JSON.parse(localStorage.getItem('ai_insights') || '[]')
  localStorage.setItem('ai_insights', JSON.stringify([...existing, ...insights]))
}

export function loadInsights(): AIInsight[] {
  return JSON.parse(localStorage.getItem('ai_insights') || '[]')
}

export function getAnalyticsSettings(): AnalyticsSettings {
  return {
    enableAIInsights: true,
    enableSEOSuggestions: true,
    enableCostOptimizer: true,
    aiProvider: 'openai',
    autoGenerateFrequency: 'weekly',
    categories: ['SEO', 'FUNIL', 'CUSTO', 'CONTEUDO']
  }
}

export function saveAnalyticsSettings(settings: AnalyticsSettings): void {
  localStorage.setItem('analytics_settings', JSON.stringify(settings))
}

console.log('📊 Analytics Coach IA initialized')
