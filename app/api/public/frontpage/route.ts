// API pública para dados da frontpage
// /api/public/frontpage

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar dados públicos da frontpage
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Buscar configuração dos blocos ativos
    const { data: blocks } = await supabase
      .from('fanpage_config')
      .select('*')
      .eq('enabled', true)
      .order('display_order', { ascending: true })

    // Buscar insights públicos
    const { data: insights } = await supabase
      .from('content_insights')
      .select('insight_key, display_name, description, category, value_json, frontpage_order')
      .eq('is_public', true)
      .eq('show_on_frontpage', true)
      .order('frontpage_order', { ascending: true })

    // Buscar conteúdos publicados recentes
    const { data: recentContent } = await supabase
      .from('content_items')
      .select('id, slug, title, summary, type, tags, published_at, view_count, featured_image')
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order('published_at', { ascending: false })
      .limit(10)

    // Buscar trilhas publicadas
    const { data: tracks } = await supabase
      .from('academy_tracks')
      .select('id, slug, title, description, icon, color, level, is_premium, display_order')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .limit(6)

    // Buscar FAQs (conteúdos do tipo faq)
    const { data: faqs } = await supabase
      .from('content_items')
      .select('id, slug, title, summary, body')
      .eq('status', 'published')
      .eq('type', 'faq')
      .eq('visibility', 'public')
      .order('view_count', { ascending: false })
      .limit(10)

    return NextResponse.json({
      blocks: blocks || [],
      insights: insights || [],
      recentContent: recentContent || [],
      tracks: tracks || [],
      faqs: faqs || [],
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao buscar dados da frontpage:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
