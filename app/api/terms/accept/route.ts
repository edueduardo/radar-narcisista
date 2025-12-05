import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// ============================================================================
// API: ACEITE DE TERMOS COM CADEIA DE CUSTÓDIA
// Registra o aceite com hash SHA-256 para prova pericial
// ============================================================================

type AcceptanceBody = {
  termsSlug?: string
  acceptanceContext: {
    checkboxes: Record<string, boolean>
    flow?: string
    extra?: Record<string, any>
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = (await req.json()) as AcceptanceBody
    const termsSlug = body.termsSlug || 'responsabilidade-v1-2025-11-28'

    // 1) Buscar versão dos termos
    const { data: termsVersion, error: tvError } = await supabase
      .from('terms_versions')
      .select('*')
      .eq('slug', termsSlug)
      .eq('is_active', true)
      .single()

    if (tvError || !termsVersion) {
      // Se não encontrar a tabela nova, usar a tabela antiga
      console.log('Tabela terms_versions não encontrada, usando fallback')
      return await fallbackAcceptance(supabase, user, body, req)
    }

    // 2) Coletar metadados técnicos
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const locale = req.headers.get('accept-language')?.split(',')[0] || 'pt-BR'
    const referer = req.headers.get('referer') || 'direct'
    const platform = 'web'
    const timezone = req.headers.get('x-timezone') || 'America/Sao_Paulo'

    const acceptedAt = new Date().toISOString()

    // 3) Montar contexto do aceite
    const acceptanceContext = {
      ...body.acceptanceContext,
      termsSlug,
      acceptedAt,
      termsVersionId: termsVersion.id,
      termsTitle: termsVersion.title,
    }

    // 4) Construir payload canônico para hash (ordenado alfabeticamente)
    const canonicalPayload = {
      acceptance_context: acceptanceContext,
      accepted_at: acceptedAt,
      ip_address: ip,
      locale,
      platform,
      referrer: referer,
      terms_content_hash: termsVersion.content_hash,
      terms_version_id: termsVersion.id,
      timezone,
      user_agent: userAgent,
      user_id: user.id,
    }

    // Ordenar chaves para garantir consistência
    const sortedPayload = Object.keys(canonicalPayload)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalPayload[key as keyof typeof canonicalPayload]
        return acc
      }, {} as Record<string, any>)

    const canonicalJson = JSON.stringify(sortedPayload)

    // 5) Gerar hash SHA-256
    const eventHash = crypto
      .createHash('sha256')
      .update(canonicalJson)
      .digest('hex')

    // 6) Hash do IP para LGPD
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + process.env.HASH_SALT || 'radar-narcisista-salt')
      .digest('hex')

    // 7) Salvar no banco
    const { data, error } = await supabase
      .from('terms_acceptances')
      .insert({
        user_id: user.id,
        terms_version_id: termsVersion.id,
        accepted_at: acceptedAt,
        ip_address: ip,
        ip_hash: ipHash,
        user_agent: userAgent,
        locale,
        platform,
        referrer: referer,
        timezone,
        acceptance_context: acceptanceContext,
        event_hash: eventHash,
        canonical_payload: sortedPayload,
      })
      .select('id, event_hash, accepted_at')
      .single()

    if (error) {
      console.error('Erro ao salvar aceite:', error)
      // Tentar fallback
      return await fallbackAcceptance(supabase, user, body, req)
    }

    return NextResponse.json({
      ok: true,
      acceptanceId: data.id,
      eventHash: data.event_hash,
      acceptedAt: data.accepted_at,
      message: 'Aceite registrado com cadeia de custódia'
    })

  } catch (error) {
    console.error('Erro na API de aceite:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Fallback para tabela antiga (user_terms_acceptance)
async function fallbackAcceptance(
  supabase: any, 
  user: any, 
  body: AcceptanceBody, 
  req: NextRequest
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ipHash = crypto
    .createHash('sha256')
    .update(ip + (process.env.HASH_SALT || 'radar-narcisista-salt'))
    .digest('hex')

  const { data, error } = await supabase
    .from('user_terms_acceptance')
    .upsert({
      user_id: user.id,
      terms_version: '1.0',
      accepted_at: new Date().toISOString(),
      context: body.acceptanceContext?.flow || 'geral',
      ip_hash: ipHash,
    }, {
      onConflict: 'user_id,terms_version'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Erro no fallback:', error)
    return NextResponse.json({ error: 'Erro ao registrar aceite' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    acceptanceId: data?.id || 'fallback',
    message: 'Aceite registrado (modo compatibilidade)'
  })
}

// GET: Verificar se usuário já aceitou os termos
export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ hasAccepted: false }, { status: 200 })
    }

    // Tentar tabela nova primeiro
    const { data: newAcceptance } = await supabase
      .from('terms_acceptances')
      .select('id, accepted_at')
      .eq('user_id', user.id)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single()

    if (newAcceptance) {
      return NextResponse.json({
        hasAccepted: true,
        acceptedAt: newAcceptance.accepted_at,
        acceptanceId: newAcceptance.id
      })
    }

    // Fallback para tabela antiga
    const { data: oldAcceptance } = await supabase
      .from('user_terms_acceptance')
      .select('id, accepted_at')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      hasAccepted: !!oldAcceptance,
      acceptedAt: oldAcceptance?.accepted_at,
      acceptanceId: oldAcceptance?.id
    })

  } catch (error) {
    console.error('Erro ao verificar aceite:', error)
    return NextResponse.json({ hasAccepted: false }, { status: 200 })
  }
}
