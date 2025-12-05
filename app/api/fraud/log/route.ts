import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// ============================================================================
// API: REGISTRAR SUSPEITA DE FRAUDE / INCONSISTÊNCIA
// Chamada pela IA quando detecta red flags no relato
// ============================================================================

type FraudLogBody = {
  sessionId?: string
  suspicionType: 'inconsistency' | 'fabrication' | 'revenge' | 'manipulation' | 'excessive_accusation' | 'zero_self_criticism'
  severity: 1 | 2 | 3 | 4 | 5
  description: string
  context: {
    message?: string
    previousMessages?: string[]
    detectedFlags?: string[]
    [key: string]: any
  }
  aiAction: 'questioned' | 'redirected' | 'warned' | 'refused'
  aiResponseExcerpt?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = (await req.json()) as FraudLogBody

    // Validar campos obrigatórios
    if (!body.suspicionType || !body.severity || !body.description || !body.aiAction) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Validar severidade
    if (body.severity < 1 || body.severity > 5) {
      return NextResponse.json({ error: 'Severidade deve ser entre 1 e 5' }, { status: 400 })
    }

    // Coletar metadados
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Tentar inserir na tabela
    const { data, error } = await supabase
      .from('fraud_suspicion_logs')
      .insert({
        user_id: user.id,
        session_id: body.sessionId || null,
        suspicion_type: body.suspicionType,
        severity: body.severity,
        description: body.description,
        context: body.context,
        ai_action: body.aiAction,
        ai_response_excerpt: body.aiResponseExcerpt || null,
        ip_hash: ipHash,
        user_agent: userAgent
      })
      .select('id')
      .single()

    if (error) {
      // Se a tabela não existir, logar no console mas não falhar
      console.warn('Erro ao registrar suspeita de fraude (tabela pode não existir):', error)
      return NextResponse.json({ 
        ok: true, 
        logged: false, 
        reason: 'Tabela não disponível' 
      })
    }

    console.log(`[FRAUD LOG] Suspeita registrada: ${body.suspicionType} (severidade ${body.severity}) para usuário ${user.id}`)

    return NextResponse.json({
      ok: true,
      logged: true,
      logId: data?.id
    })

  } catch (error) {
    console.error('Erro ao registrar suspeita de fraude:', error)
    // Não falhar a requisição principal por causa do log
    return NextResponse.json({ ok: true, logged: false, reason: 'Erro interno' })
  }
}

// GET: Listar suspeitas (apenas para admin)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Parâmetros de busca
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const minSeverity = parseInt(searchParams.get('minSeverity') || '1')
    const offset = (page - 1) * limit

    // Construir query
    let query = supabase
      .from('fraud_suspicion_logs')
      .select('*', { count: 'exact' })
      .gte('severity', minSeverity)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error, count } = await query

    if (error) {
      console.warn('Erro ao buscar logs de fraude:', error)
      return NextResponse.json({ 
        data: [], 
        pagination: { page, limit, total: 0, totalPages: 0 },
        error: 'Tabela não disponível'
      })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao listar suspeitas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
