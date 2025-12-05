import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * TEMA 11: API para verificar limites do plano
 * 
 * GET /api/limits/check
 * Query params: type (chat | diary | tests | all)
 * 
 * Retorna:
 * {
 *   allowed: boolean,
 *   currentUsage: number,
 *   limit: number,
 *   remaining: number,
 *   planLevel: string,
 *   planName: string
 * }
 */

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        allowed: false,
        planLevel: 'visitante',
        message: 'Não autenticado'
      })
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    // Obter assinatura do usuário
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    
    // Determinar nível do plano
    let planLevel = 'guardar'
    let planName = 'Radar Guardar'
    let limits = {
      mensagens_chat_dia: 5,
      entradas_diario_mes: 3,
      testes_mes: -1, // Ilimitado no Guardar
      exportar_pdf: false,
      historico_completo: false,
    }
    
    if (subscription?.status === 'active') {
      if (subscription.plan_id === 'premium' || subscription.plan_id === 'defesa') {
        planLevel = 'defesa'
        planName = 'Radar Defesa'
        limits = {
          mensagens_chat_dia: -1,
          entradas_diario_mes: -1,
          testes_mes: -1,
          exportar_pdf: true,
          historico_completo: true,
        }
      } else if (subscription.plan_id === 'essencial' || subscription.plan_id === 'jornada') {
        planLevel = 'jornada'
        planName = 'Radar Jornada'
        limits = {
          mensagens_chat_dia: 50,
          entradas_diario_mes: -1,
          testes_mes: -1,
          exportar_pdf: true,
          historico_completo: true,
        }
      }
    }
    
    // Contar uso atual
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)
    
    const results: Record<string, any> = {
      planLevel,
      planName,
    }
    
    // Verificar chat
    if (type === 'chat' || type === 'all') {
      const { count: chatCount } = await supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', today.toISOString())
      
      const currentChat = chatCount || 0
      const chatLimit = limits.mensagens_chat_dia
      
      results.chat = {
        allowed: chatLimit === -1 || currentChat < chatLimit,
        currentUsage: currentChat,
        limit: chatLimit,
        remaining: chatLimit === -1 ? -1 : Math.max(0, chatLimit - currentChat),
      }
    }
    
    // Verificar diário
    if (type === 'diary' || type === 'all') {
      const { count: diaryCount } = await supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('created_at', firstDayOfMonth.toISOString())
      
      const currentDiary = diaryCount || 0
      const diaryLimit = limits.entradas_diario_mes
      
      results.diary = {
        allowed: diaryLimit === -1 || currentDiary < diaryLimit,
        currentUsage: currentDiary,
        limit: diaryLimit,
        remaining: diaryLimit === -1 ? -1 : Math.max(0, diaryLimit - currentDiary),
      }
    }
    
    // Verificar testes
    if (type === 'tests' || type === 'all') {
      const { count: testsCount } = await supabase
        .from('clarity_tests')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())
      
      const currentTests = testsCount || 0
      const testsLimit = limits.testes_mes
      
      results.tests = {
        allowed: testsLimit === -1 || currentTests < testsLimit,
        currentUsage: currentTests,
        limit: testsLimit,
        remaining: testsLimit === -1 ? -1 : Math.max(0, testsLimit - currentTests),
      }
    }
    
    // Adicionar features booleanas
    if (type === 'all') {
      results.features = {
        exportar_pdf: limits.exportar_pdf,
        historico_completo: limits.historico_completo,
      }
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Erro ao verificar limites:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
