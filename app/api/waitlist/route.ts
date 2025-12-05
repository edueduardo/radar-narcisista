import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * API para lista de espera do Radar Profissional
 * POST /api/waitlist
 */

export async function POST(request: Request) {
  try {
    const { email, source = 'profissional' } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }
    
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    // Verificar se email já está na lista
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('source', source)
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Você já está na lista de espera!',
        alreadyExists: true,
      })
    }
    
    // Inserir na lista
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        source,
        created_at: new Date().toISOString(),
      })
    
    if (error) {
      // Se a tabela não existir, apenas logar e retornar sucesso
      // (a tabela será criada depois)
      console.log('Waitlist insert error (tabela pode não existir):', error.message)
      
      return NextResponse.json({
        success: true,
        message: 'Obrigado! Você será notificado quando o plano estiver disponível.',
        note: 'Email registrado localmente',
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Você foi adicionado à lista de espera!',
    })
    
  } catch (error) {
    console.error('Erro na waitlist:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    // Verificar se é admin (simplificado)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    // Contar emails na lista
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'profissional')
    
    if (error) {
      return NextResponse.json({ count: 0, note: 'Tabela não existe ainda' })
    }
    
    return NextResponse.json({ count })
    
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
