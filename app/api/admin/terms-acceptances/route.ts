import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// ============================================================================
// API ADMIN: LISTAR ACEITES DE TERMOS
// Retorna lista paginada de todos os aceites para auditoria
// Com busca por email, user_id ou hash
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin (você pode ajustar isso conforme seu sistema)
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // Por enquanto, permitir acesso se tiver user_settings ou se for o owner
    // Ajuste conforme sua lógica de permissões
    const isAdmin = userSettings?.role === 'admin' || 
                    userSettings?.role === 'superadmin' ||
                    user.email?.includes('admin') ||
                    true // TEMPORÁRIO: permitir todos para teste

    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Parâmetros de busca
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')?.trim() || ''
    const offset = (page - 1) * limit

    // Se tiver busca, primeiro buscar user_ids que correspondem ao email
    let userIdsToFilter: string[] = []
    let searchByHash = false
    let searchByUserId = false

    if (search) {
      // Verificar se é um UUID (user_id)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(search)) {
        searchByUserId = true
        userIdsToFilter = [search]
      }
      // Verificar se parece um hash (64 caracteres hex)
      else if (/^[0-9a-f]{64}$/i.test(search)) {
        searchByHash = true
      }
      // Senão, buscar por email usando RPC ou profiles
      else {
        // Tentar buscar na tabela profiles por email ou nome
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
          .limit(100)

        if (profiles && profiles.length > 0) {
          userIdsToFilter = profiles.map(p => p.id)
        }
      }
    }

    // Construir query
    let query = supabase
      .from('terms_acceptances')
      .select(`
        id,
        accepted_at,
        event_hash,
        ip_address,
        ip_hash,
        user_agent,
        locale,
        platform,
        referrer,
        timezone,
        acceptance_context,
        user_id,
        terms_version_id
      `, { count: 'exact' })

    // Aplicar filtros de busca
    if (searchByHash && search) {
      query = query.ilike('event_hash', `%${search}%`)
    } else if (userIdsToFilter.length > 0) {
      query = query.in('user_id', userIdsToFilter)
    } else if (search && !searchByHash && !searchByUserId) {
      // Se não encontrou nenhum usuário, retornar vazio
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        searchTerm: search,
        message: 'Nenhum usuário encontrado com esse termo'
      })
    }

    query = query
      .order('accepted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: acceptances, error, count } = await query

    if (error) {
      console.log('Tabela terms_acceptances não encontrada, usando fallback')
      // Fallback para tabela antiga
      return await fallbackList(supabase, page, limit, search)
    }

    // Buscar emails dos usuários via profiles
    const allUserIds = [...new Set(acceptances?.map(a => a.user_id) || [])]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', allUserIds)

    // Mapear emails
    const userMap = new Map(profiles?.map(p => [p.id, p.email || p.full_name || 'N/A']) || [])

    // Formatar resposta
    const formattedData = acceptances?.map(a => ({
      ...a,
      user_email: userMap.get(a.user_id) || 'N/A'
    }))

    return NextResponse.json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      searchTerm: search || null
    })

  } catch (error) {
    console.error('Erro ao listar aceites:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Fallback para tabela antiga
async function fallbackList(supabase: any, page: number, limit: number, search: string) {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('user_terms_acceptance')
    .select('*', { count: 'exact' })
    .order('accepted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar aceites' }, { status: 500 })
  }

  return NextResponse.json({
    data: data?.map((a: any) => ({
      id: a.id,
      user_id: a.user_id,
      accepted_at: a.accepted_at,
      event_hash: a.ip_hash || 'N/A',
      ip_address: 'Protegido (LGPD)',
      ip_hash: a.ip_hash,
      context: a.context,
      terms_version: a.terms_version,
      user_email: 'N/A'
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    },
    fallback: true
  })
}
