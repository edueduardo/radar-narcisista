import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// FRONTPAGE CONTENT - Funções para buscar conteúdo dinâmico da landing
// ETAPA 8.4: FanPage Viva
// ============================================================================

export interface PublicInsight {
  metric_key: string
  value_numeric: number
  label_pt: string
  description_pt: string | null
  display_format: string
  display_suffix: string | null
  icon: string
  color: string
}

export interface FaqItem {
  id: string
  slug: string
  title_pt: string
  summary_pt: string | null
  body_pt: string | null
}

export interface WorldNewsItem {
  id: string
  slug: string
  title_pt: string
  summary_pt: string | null
  source_type: string
  original_url: string | null
  topics: string[]
}

export interface AcademyCollection {
  id: string
  slug: string
  name_pt: string
  description_pt: string | null
  is_premium: boolean
  is_featured: boolean
  item_count: number
}

/**
 * Busca métricas públicas para "Radar em Números"
 */
export async function getPublicInsights(): Promise<PublicInsight[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_insights')
      .select('metric_key, value_numeric, label_pt, description_pt, display_format, display_suffix, icon, color')
      .eq('visibility', 'public')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(6)

    if (error) {
      console.error('[FRONTPAGE] Erro ao buscar insights:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[FRONTPAGE] Erro:', error)
    return []
  }
}

/**
 * Busca FAQs públicos para a landing
 */
export async function getPublicFaqItems(): Promise<FaqItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_items')
      .select('id, slug, title_pt, summary_pt, body_pt')
      .eq('content_type', 'faq')
      .eq('visibility', 'public')
      .order('created_at', { ascending: true })
      .limit(8)

    if (error) {
      console.error('[FRONTPAGE] Erro ao buscar FAQs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[FRONTPAGE] Erro:', error)
    return []
  }
}

/**
 * Busca conteúdo externo curado para "Radar no Mundo"
 */
export async function getWorldNewsItems(): Promise<WorldNewsItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_items')
      .select('id, slug, title_pt, summary_pt, source_type, original_url, topics')
      .in('source_type', ['external_curated', 'external_world', 'news', 'podcast', 'youtube'])
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('[FRONTPAGE] Erro ao buscar world news:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[FRONTPAGE] Erro:', error)
    return []
  }
}

/**
 * Busca coleções/trilhas para "Radar Academy"
 */
export async function getAcademyCollections(): Promise<AcademyCollection[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_collections')
      .select('id, slug, name_pt, description_pt, is_premium, is_featured, item_count')
      .eq('visibility', 'public')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) {
      console.error('[FRONTPAGE] Erro ao buscar collections:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[FRONTPAGE] Erro:', error)
    return []
  }
}

/**
 * Busca todos os dados da frontpage de uma vez (otimizado)
 */
export async function getFrontpageContent() {
  const [insights, faqItems, worldNews, academyCollections] = await Promise.all([
    getPublicInsights(),
    getPublicFaqItems(),
    getWorldNewsItems(),
    getAcademyCollections()
  ])

  return {
    insights,
    faqItems,
    worldNews,
    academyCollections
  }
}
