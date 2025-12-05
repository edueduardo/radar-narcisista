/**
 * API de Impersonação - "Ver Como" outro usuário
 * ETAPA 36 - BLOCO 36-40
 * 
 * Endpoints:
 * - GET: Lista sessões de impersonação
 * - POST: Inicia nova sessão
 * - DELETE: Encerra sessão ativa
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { 
  startImpersonationSession, 
  endImpersonationSession,
  getActiveSession,
  listSessions,
  getImpersonationStats,
  generateImpersonationToken,
  IMPERSONATION_COOKIE_NAME
} from '@/lib/impersonation'

// Verificar se usuário é admin
async function getAdminUser(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  const role = (profile as { role?: string } | null)?.role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return null
  }
  
  return user
}

/**
 * GET - Lista sessões de impersonação e estatísticas
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const admin = await getAdminUser(supabase)
    if (!admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas admin pode gerenciar impersonação.' },
        { status: 403 }
      )
    }
    
    // Verificar se tem sessão ativa
    const activeSession = await getActiveSession(admin.id)
    
    // Obter parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'ativa' | 'encerrada' | 'expirada' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Buscar sessões e estatísticas
    const [sessions, stats] = await Promise.all([
      listSessions({ status: status || undefined, limit, offset }),
      getImpersonationStats()
    ])
    
    return NextResponse.json({
      success: true,
      active_session: activeSession,
      sessions,
      stats
    })
    
  } catch (error) {
    console.error('Erro na API de impersonação (GET):', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados de impersonação' },
      { status: 500 }
    )
  }
}

/**
 * POST - Inicia sessão de impersonação
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const admin = await getAdminUser(supabase)
    if (!admin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas admin pode iniciar impersonação.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validar campos obrigatórios
    if (!body.target_user_id || !body.motivo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: target_user_id, motivo' },
        { status: 400 }
      )
    }
    
    // Buscar dados do usuário alvo
    const { data: targetUser } = await supabase
      .from('user_profiles')
      .select('user_id, email, role')
      .eq('user_id', body.target_user_id)
      .single()
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário alvo não encontrado' },
        { status: 404 }
      )
    }
    
    // Não permitir impersonar outro admin
    if (targetUser.role === 'ADMIN' || targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Não é permitido impersonar outro administrador' },
        { status: 403 }
      )
    }
    
    // Obter IP e User-Agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Iniciar sessão
    const sessionId = await startImpersonationSession({
      admin_id: admin.id,
      admin_email: admin.email || 'admin@unknown',
      target_user_id: body.target_user_id,
      target_user_email: targetUser.email || 'unknown',
      target_user_role: targetUser.role || 'USUARIO',
      motivo: body.motivo,
      ip_admin: ip,
      user_agent: userAgent,
      ticket_id: body.ticket_id
    })
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Erro ao iniciar sessão de impersonação' },
        { status: 500 }
      )
    }
    
    // Gerar token para cookie
    const token = generateImpersonationToken(sessionId, body.target_user_id)
    
    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      session_id: sessionId,
      target_user: {
        id: targetUser.user_id,
        email: targetUser.email,
        role: targetUser.role
      },
      message: 'Sessão de impersonação iniciada. Você agora está vendo como este usuário.'
    }, { status: 201 })
    
    // Definir cookie de impersonação
    response.cookies.set(IMPERSONATION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 horas
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Erro na API de impersonação (POST):', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar sessão de impersonação' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Encerra sessão de impersonação ativa
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const admin = await getAdminUser(supabase)
    if (!admin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    // Buscar sessão ativa
    const activeSession = await getActiveSession(admin.id)
    
    if (!activeSession) {
      return NextResponse.json(
        { error: 'Nenhuma sessão de impersonação ativa' },
        { status: 404 }
      )
    }
    
    // Encerrar sessão
    const success = await endImpersonationSession(activeSession.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao encerrar sessão' },
        { status: 500 }
      )
    }
    
    // Criar resposta removendo cookie
    const response = NextResponse.json({
      success: true,
      message: 'Sessão de impersonação encerrada'
    })
    
    // Remover cookie
    response.cookies.delete(IMPERSONATION_COOKIE_NAME)
    
    return response
    
  } catch (error) {
    console.error('Erro na API de impersonação (DELETE):', error)
    return NextResponse.json(
      { error: 'Erro ao encerrar sessão' },
      { status: 500 }
    )
  }
}
