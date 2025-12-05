// API pública para Clima Emocional do Radar (Radar Pulse)
// /api/public/radar-pulse
// Ideia Diamante #1: "Clima Emocional do Radar, Hoje"

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface RadarPulseData {
  // Temperatura emocional geral (0-100)
  temperature: number
  temperatureLabel: string
  temperatureTrend: 'up' | 'down' | 'stable'
  
  // Estatísticas agregadas
  activeUsersToday: number
  journalEntriesToday: number
  chatSessionsToday: number
  
  // Top emoções/tags do dia
  topEmotions: { emotion: string; count: number; percentage: number }[]
  topTags: { tag: string; count: number }[]
  
  // Sinais de alerta em alta
  alertSignals: { signal: string; count: number; trend: 'up' | 'down' | 'stable' }[]
  
  // Última atualização
  lastUpdated: string
}

// GET - Buscar dados do Radar Pulse
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayISO = yesterday.toISOString()

    // Tentar buscar dados agregados da tabela radar_pulse
    const { data: pulseData } = await supabase
      .from('radar_pulse')
      .select('*')
      .gte('created_at', todayISO)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (pulseData) {
      return NextResponse.json(pulseData)
    }

    // Se não há dados pré-calculados, calcular em tempo real
    // (Em produção, isso seria um job agendado)
    
    // Contar entradas do diário hoje
    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    // Contar sessões de chat hoje
    const { count: chatCount } = await supabase
      .from('ai_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    // Buscar tags mais frequentes (últimos 7 dias)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('tags, impact_score')
      .gte('created_at', sevenDaysAgo.toISOString())
      .not('tags', 'is', null)

    // Agregar tags
    const tagCounts: Record<string, number> = {}
    let totalImpact = 0
    let impactCount = 0

    if (recentEntries) {
      for (const entry of recentEntries) {
        if (entry.tags && Array.isArray(entry.tags)) {
          for (const tag of entry.tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        }
        if (entry.impact_score) {
          totalImpact += entry.impact_score
          impactCount++
        }
      }
    }

    // Top tags
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // Calcular temperatura emocional (baseado no impacto médio)
    const avgImpact = impactCount > 0 ? totalImpact / impactCount : 1.5
    // Impacto vai de 1-3, converter para 0-100 (invertido: menor impacto = melhor)
    const temperature = Math.round(100 - ((avgImpact - 1) / 2) * 100)

    // Determinar label da temperatura
    let temperatureLabel = 'Estável'
    if (temperature >= 70) temperatureLabel = 'Positivo'
    else if (temperature >= 50) temperatureLabel = 'Neutro'
    else if (temperature >= 30) temperatureLabel = 'Tenso'
    else temperatureLabel = 'Crítico'

    // Sinais de alerta (tags graves)
    const alertTags = ['ameaça', 'violência', 'agressão', 'medo', 'perigo']
    const alertSignals = alertTags
      .map(signal => ({
        signal,
        count: Object.entries(tagCounts)
          .filter(([tag]) => tag.toLowerCase().includes(signal))
          .reduce((sum, [_, count]) => sum + count, 0),
        trend: 'stable' as const
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count)

    // Top emoções (simplificado)
    const emotionTags = ['ansiedade', 'tristeza', 'raiva', 'medo', 'confusão', 'alívio', 'esperança']
    const topEmotions = emotionTags
      .map(emotion => {
        const count = Object.entries(tagCounts)
          .filter(([tag]) => tag.toLowerCase().includes(emotion))
          .reduce((sum, [_, c]) => sum + c, 0)
        return { emotion, count, percentage: 0 }
      })
      .filter(e => e.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calcular percentagens
    const totalEmotions = topEmotions.reduce((sum, e) => sum + e.count, 0)
    topEmotions.forEach(e => {
      e.percentage = totalEmotions > 0 ? Math.round((e.count / totalEmotions) * 100) : 0
    })

    const pulseResponse: RadarPulseData = {
      temperature,
      temperatureLabel,
      temperatureTrend: 'stable',
      activeUsersToday: 0, // Seria calculado com dados de sessão
      journalEntriesToday: journalCount || 0,
      chatSessionsToday: chatCount || 0,
      topEmotions,
      topTags,
      alertSignals,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(pulseResponse)

  } catch (error) {
    console.error('Erro ao buscar Radar Pulse:', error)
    
    // Retornar dados padrão em caso de erro
    return NextResponse.json({
      temperature: 50,
      temperatureLabel: 'Neutro',
      temperatureTrend: 'stable',
      activeUsersToday: 0,
      journalEntriesToday: 0,
      chatSessionsToday: 0,
      topEmotions: [],
      topTags: [],
      alertSignals: [],
      lastUpdated: new Date().toISOString()
    })
  }
}
