import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

/**
 * POST /api/chat/save-summary
 * 
 * Salva um resumo de sessão de chat como entrada no diário.
 * Cria uma entrada em journal_entries com entry_type = 'chat_summary'.
 * 
 * Body esperado:
 * {
 *   summaryText: string (obrigatório, mínimo 10 caracteres)
 *   moodIntensity?: number (0-10, default 5)
 *   tags?: string[] (default ['coach', 'reflexão', 'sessão'])
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Parse do body
    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Body inválido' },
        { status: 400 }
      )
    }
    
    const { summaryText, moodIntensity, tags } = body
    
    // Validar summaryText
    if (!summaryText || typeof summaryText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Texto do resumo é obrigatório' },
        { status: 400 }
      )
    }
    
    const trimmedText = summaryText.trim()
    
    if (trimmedText.length < 10) {
      return NextResponse.json(
        { success: false, error: 'O resumo deve ter pelo menos 10 caracteres' },
        { status: 400 }
      )
    }
    
    // Valores default
    const finalMoodIntensity = typeof moodIntensity === 'number' 
      ? Math.min(10, Math.max(0, moodIntensity)) 
      : 5
    
    const finalTags = Array.isArray(tags) && tags.length > 0 
      ? tags.filter((t: unknown) => typeof t === 'string').slice(0, 10)
      : ['coach', 'reflexão', 'sessão']
    
    // Gerar título automático com data
    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const title = `💬 Resumo da sessão com o Coach – ${dateStr}`
    
    // Inserir no journal_entries
    const { data: entry, error: insertError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: title,
        description: trimmedText,
        context: 'RELACIONAMENTO',
        entry_type: 'chat_summary',
        mood_intensity: finalMoodIntensity,
        tags: finalTags,
        from_voice: false
      })
      .select('id')
      .single()
    
    if (insertError) {
      console.error('[SAVE-SUMMARY] Erro ao inserir:', insertError)
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar resumo no diário' },
        { status: 500 }
      )
    }
    
    console.log(`[SAVE-SUMMARY] Resumo salvo com sucesso: ${entry.id} para user ${user.id}`)
    
    return NextResponse.json({
      success: true,
      entryId: entry.id,
      message: 'Resumo salvo no diário com sucesso'
    })
    
  } catch (error) {
    console.error('[SAVE-SUMMARY] Erro inesperado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao salvar resumo' },
      { status: 500 }
    )
  }
}
