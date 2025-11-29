/**
 * 🛡️ IA GUARDIÃ DE UX - Engenheiro de UX Invisível
 * 
 * Analisa métricas de uso e sugere melhorias na experiência
 * Sem acesso a dados sensíveis - só números e comportamentos agregados
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface UXGuardianMetrics {
  // Temas e acessibilidade
  themeUsage: {
    light: number
    dark: number
    highContrast: number
  }
  fontSizeAdjustments: {
    increased: number
    decreased: number
    noChange: number
  }
  
  // Comportamento de uso
  sessionDuration: {
    withAccessibilityAdjustments: number
    withoutAccessibilityAdjustments: number
  }
  completionRates: {
    testCompletion: {
      withFontIncrease: number
      withoutFontIncrease: number
    }
    diaryUsage: {
      afterThemeChange: number
      beforeThemeChange: number
    }
  }
  
  // Padrões de frustração
  abandonmentPoints: {
    audioRecordingCancelled: number
    testAbandonedEarly: number
    chatOpenedNoMessage: number
    diaryOpenedNoSave: number
  }
  
  // Padrões de sucesso
  successPoints: {
    safetyPlanViewed: number
    therapyTagUsed: number
    episodeResolved: number
  }
  
  // Feedback direto (se houver)
  userFeedback: {
    positiveCount: number
    negativeCount: number
    commonIssues: string[]
  }
}

export interface UXGuardianInsight {
  id: string
  category: 'ACCESSIBILITY' | 'FRUSTRATION' | 'SUCCESS' | 'PERFORMANCE'
  priority: 'alta' | 'media' | 'baixa'
  title: string
  description: string
  metrics: string[]
  recommendations: string[]
  expectedImpact: string
}

/**
 * Prompt principal da IA Guardiã
 */
function getUXGuardianPrompt(metricsData: UXGuardianMetrics): string {
  return `
Você é um engenheiro de UX especializado em acessibilidade e saúde mental.
Analise as métricas abaixo e sugira melhorias na experiência do usuário.

FOQUE EM:
1. Acessibilidade visual (problemas de visão, cansaço)
2. Redução de frustração (pontos de abandono)
3. Aumentar pontos de sucesso (momentos de alívio)
4. Performance e usabilidade

DADOS:
${JSON.stringify(metricsData, null, 2)}

REGRAS IMPORTANTES:
- NUNCA sugira mudanças que possam piorar a saúde mental
- Priorize acessibilidade para pessoas com visão embaçada/cansaço
- Considere que usuários estão em situação vulnerável
- Sugira mudanças incrementais, não radicais

RETORNE JSON com array de insights:
{
  "insights": [
    {
      "category": "ACCESSIBILITY|FRUSTRATION|SUCCESS|PERFORMANCE",
      "priority": "alta|media|baixa",
      "title": "título claro",
      "description": "explicação detalhada",
      "metrics": ["métrica 1", "métrica 2"],
      "recommendations": ["ação 1", "ação 2"],
      "expectedImpact": "resultado esperado"
    }
  ]
}
`
}

/**
 * Gera insights da IA Guardiã baseados nas métricas
 */
export async function generateUXGuardianInsights(
  metrics: UXGuardianMetrics,
  _provider: 'openai' | 'anthropic' = 'openai'
): Promise<UXGuardianInsight[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um engenheiro de UX especializado em acessibilidade e saúde mental. Responda sempre com JSON válido.'
        },
        {
          role: 'user',
          content: getUXGuardianPrompt(metrics)
        }
      ],
      temperature: 0.3
    })
    
    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.insights || []
    
  } catch (error) {
    console.error('Erro ao gerar insights UX Guardian:', error)
    return []
  }
}

/**
 * Análise rápida local (sem IA) para problemas críticos
 */
export function generateQuickUXInsights(metrics: UXGuardianMetrics): UXGuardianInsight[] {
  const insights: UXGuardianInsight[] = []
  
  // Problemas de acessibilidade
  if (metrics.fontSizeAdjustments.increased > metrics.fontSizeAdjustments.noChange * 0.5) {
    insights.push({
      id: `accessibility_font_${Date.now()}`,
      category: 'ACCESSIBILITY',
      priority: 'alta',
      title: 'Muitos usuários aumentam a fonte',
      description: `${metrics.fontSizeAdjustments.increased} usuários aumentaram a fonte vs ${metrics.fontSizeAdjustments.noChange} que não alteraram. A fonte padrão pode ser pequena demais.`,
      metrics: ['fontSizeAdjustments'],
      recommendations: [
        'Aumentar o tamanho da fonte padrão em 10%',
        'Adicionar botão de "Aumentar Fonte" mais visível',
        'Testar fontes com melhor legibilidade'
      ],
      expectedImpact: 'Redução de 30% na taxa de abandono por dificuldade de leitura'
    })
  }
  
  // Problemas de tema claro
  if (metrics.themeUsage.light < metrics.themeUsage.dark * 0.3) {
    insights.push({
      id: `theme_light_${Date.now()}`,
      category: 'ACCESSIBILITY',
      priority: 'media',
      title: 'Modo claro pouco utilizado',
      description: `Apenas ${metrics.themeUsage.light} usuários usam modo claro vs ${metrics.themeUsage.dark} no modo escuro. O modo claro pode estar ofuscando.`,
      metrics: ['themeUsage'],
      recommendations: [
        'Reduzir brilho do modo claro',
        'Testar cores mais suaves',
        'Adicionar opção "Modo Leitura" com contraste reduzido'
      ],
      expectedImpact: 'Melhora na experiência de usuários sensíveis à luz'
    })
  }
  
  // Frustração com gravação de áudio
  if (metrics.abandonmentPoints.audioRecordingCancelled > 50) {
    insights.push({
      id: `audio_frustration_${Date.now()}`,
      category: 'FRUSTRATION',
      priority: 'alta',
      title: 'Alta taxa de cancelamento de gravação',
      description: `${metrics.abandonmentPoints.audioRecordingCancelled} usuários cancelaram gravação de áudio. Pode indicar dificuldade técnica ou medo.`,
      metrics: ['abandonmentPoints.audioRecordingCancelled'],
      recommendations: [
        'Adicionar tutorial rápido de como usar o áudio',
        'Oferecer opção de texto como alternativa',
        'Melhorar feedback visual durante gravação'
      ],
      expectedImpact: 'Redução de 40% na frustração com gravação'
    })
  }
  
  // Abandono precoce do teste
  if (metrics.abandonmentPoints.testAbandonedEarly > metrics.abandonmentPoints.testAbandonedEarly * 0.3) {
    insights.push({
      id: `test_abandonment_${Date.now()}`,
      category: 'FRUSTRATION',
      priority: 'alta',
      title: 'Usuários abandonam teste cedo',
      description: `${metrics.abandonmentPoints.testAbandonedEarly} usuários saíram antes da pergunta 3. As primeiras perguntas podem ser muito intensas.`,
      metrics: ['abandonmentPoints.testAbandonedEarly'],
      recommendations: [
        'Revisar as 3 primeiras perguntas do teste',
        'Adicionar mensagem de incentivo após pergunta 2',
        'Oferecer opção "Fazer depois" no meio do teste'
      ],
      expectedImpact: 'Aumento de 25% na conclusão do teste'
    })
  }
  
  // Sucesso com plano de segurança
  if (metrics.successPoints.safetyPlanViewed > 100) {
    insights.push({
      id: `safety_success_${Date.now()}`,
      category: 'SUCCESS',
      priority: 'media',
      title: 'Plano de segurança sendo bem utilizado',
      description: `${metrics.successPoints.safetyPlanViewed} visualizações do plano de segurança. Este é um ponto de alívio importante.`,
      metrics: ['successPoints.safetyPlanViewed'],
      recommendations: [
        'Tornar o plano de segurança mais visível',
        'Adicionar lembrete semanal do plano',
        'Criar templates personalizados de plano'
      ],
      expectedImpact: 'Aumento no sentimento de segurança e controle'
    })
  }
  
  return insights
}

/**
 * Salva insights da UX Guardiã no localStorage
 */
export function saveUXGuardianInsights(insights: UXGuardianInsight[]): void {
  const existing = JSON.parse(localStorage.getItem('ux_guardian_insights') || '[]')
  const newInsights = insights.map(insight => ({
    ...insight,
    id: insight.id || `ux_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'nova'
  }))
  
  localStorage.setItem('ux_guardian_insights', JSON.stringify([...existing, ...newInsights]))
}

/**
 * Carrega insights da UX Guardiã
 */
export function loadUXGuardianInsights(): UXGuardianInsight[] {
  return JSON.parse(localStorage.getItem('ux_guardian_insights') || '[]')
}

/**
 * Gera métricas simuladas para desenvolvimento
 */
export function generateMockUXMetrics(): UXGuardianMetrics {
  return {
    themeUsage: {
      light: 89,
      dark: 234,
      highContrast: 45
    },
    fontSizeAdjustments: {
      increased: 156,
      decreased: 23,
      noChange: 189
    },
    sessionDuration: {
      withAccessibilityAdjustments: 12.5, // minutos
      withoutAccessibilityAdjustments: 8.3
    },
    completionRates: {
      testCompletion: {
        withFontIncrease: 0.78,
        withoutFontIncrease: 0.65
      },
      diaryUsage: {
        afterThemeChange: 0.89,
        beforeThemeChange: 0.72
      }
    },
    abandonmentPoints: {
      audioRecordingCancelled: 67,
      testAbandonedEarly: 45,
      chatOpenedNoMessage: 123,
      diaryOpenedNoSave: 89
    },
    successPoints: {
      safetyPlanViewed: 234,
      therapyTagUsed: 78,
      episodeResolved: 56
    },
    userFeedback: {
      positiveCount: 45,
      negativeCount: 12,
      commonIssues: ['Fonte pequena', 'Modo claro ofuscando', 'Dificuldade com áudio']
    }
  }
}

/**
 * Configurações da UX Guardiã
 */
export interface UXGuardianSettings {
  enabled: boolean
  aiProvider: 'openai' | 'anthropic'
  autoGenerateFrequency: 'daily' | 'weekly' | 'monthly'
  categories: ('ACCESSIBILITY' | 'FRUSTRATION' | 'SUCCESS' | 'PERFORMANCE')[]
  alertThresholds: {
    fontIncreaseRate: number    // % de usuários que aumentam fonte
    testAbandonmentRate: number // % de abandono do teste
    audioCancelRate: number     // % de cancelamento de áudio
  }
}

export function getUXGuardianSettings(): UXGuardianSettings {
  return {
    enabled: true,
    aiProvider: 'openai',
    autoGenerateFrequency: 'weekly',
    categories: ['ACCESSIBILITY', 'FRUSTRATION', 'SUCCESS', 'PERFORMANCE'],
    alertThresholds: {
      fontIncreaseRate: 0.3,
      testAbandonmentRate: 0.2,
      audioCancelRate: 0.1
    }
  }
}

export function saveUXGuardianSettings(settings: UXGuardianSettings): void {
  localStorage.setItem('ux_guardian_settings', JSON.stringify(settings))
}

console.log('🛡️ UX Guardian AI initialized')
