'use client'

import { useState, useEffect } from 'react'
import RadarEmNumerosSection from './RadarEmNumerosSection'
import FaqDinamicoSection from './FaqDinamicoSection'
import RadarNoMundoSection from './RadarNoMundoSection'
import RadarAcademySection from './RadarAcademySection'
import type { PublicInsight, FaqItem, WorldNewsItem, AcademyCollection } from '@/lib/frontpage-content'

// ============================================================================
// DYNAMIC SECTIONS - Wrapper para seções dinâmicas da frontpage
// ETAPA 8.4: FanPage Viva
// ============================================================================

interface FrontpageContent {
  insights: PublicInsight[]
  faqItems: FaqItem[]
  worldNews: WorldNewsItem[]
  academyCollections: AcademyCollection[]
}

interface Props {
  theme?: 'light' | 'dark' | 'high-contrast'
}

export default function DynamicSections({ theme = 'dark' }: Props) {
  const [content, setContent] = useState<FrontpageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/frontpage/content')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setContent(data.data)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conteúdo dinâmico:', error)
      }
      setLoading(false)
    }

    fetchContent()
  }, [])

  // Não renderiza nada enquanto carrega ou se não houver conteúdo
  if (loading || !content) {
    return null
  }

  const hasInsights = content.insights && content.insights.length > 0
  const hasFaq = content.faqItems && content.faqItems.length > 0
  const hasWorldNews = content.worldNews && content.worldNews.length > 0
  const hasAcademy = content.academyCollections && content.academyCollections.length > 0

  // Se não houver nenhum conteúdo, não renderiza nada
  if (!hasInsights && !hasFaq && !hasWorldNews && !hasAcademy) {
    return null
  }

  return (
    <>
      {/* Radar em Números */}
      {hasInsights && (
        <RadarEmNumerosSection insights={content.insights} theme={theme} />
      )}

      {/* FAQ Dinâmico */}
      {hasFaq && (
        <FaqDinamicoSection items={content.faqItems} theme={theme} />
      )}

      {/* Radar no Mundo */}
      {hasWorldNews && (
        <RadarNoMundoSection items={content.worldNews} theme={theme} />
      )}

      {/* Radar Academy */}
      {hasAcademy && (
        <RadarAcademySection collections={content.academyCollections} theme={theme} />
      )}
    </>
  )
}
