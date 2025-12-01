import { NextResponse } from 'next/server'
import { getFrontpageContent } from '@/lib/frontpage-content'

// ============================================================================
// API: /api/frontpage/content
// Retorna conteúdo dinâmico para a landing page
// ETAPA 8.4: FanPage Viva
// ============================================================================

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache por 5 minutos

export async function GET() {
  try {
    const content = await getFrontpageContent()

    return NextResponse.json({
      success: true,
      data: content,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[API FRONTPAGE CONTENT] Erro:', error)
    return NextResponse.json({
      success: false,
      data: {
        insights: [],
        faqItems: [],
        worldNews: [],
        academyCollections: []
      },
      error: 'Erro ao carregar conteúdo'
    }, { status: 500 })
  }
}
