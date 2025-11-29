'use server'

import { analyzePatterns } from '../../../lib/openai'

export async function analyzePatternsServer(text: string) {
  try {
    const analysis = await analyzePatterns(text)
    return { success: true, data: analysis }
  } catch (error) {
    console.error('Erro na análise:', error)
    return { success: false, error: 'Falha na análise de padrões' }
  }
}
