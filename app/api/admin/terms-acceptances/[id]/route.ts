import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// ============================================================================
// API ADMIN: DETALHE DE UM ACEITE DE TERMOS
// Retorna todos os dados para cadeia de custódia e prova pericial
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id: acceptanceId } = await params

    // Tentar buscar da tabela nova primeiro
    const { data: acceptance, error } = await supabase
      .from('terms_acceptances')
      .select(`
        *,
        terms_versions (
          id,
          slug,
          title,
          version_number,
          content_md,
          content_hash,
          published_at
        )
      `)
      .eq('id', acceptanceId)
      .single()

    if (error) {
      console.log('Tentando fallback para tabela antiga')
      // Fallback para tabela antiga
      const { data: oldAcceptance, error: oldError } = await supabase
        .from('user_terms_acceptance')
        .select('*')
        .eq('id', acceptanceId)
        .single()

      if (oldError || !oldAcceptance) {
        return NextResponse.json({ error: 'Aceite não encontrado' }, { status: 404 })
      }

      return NextResponse.json({
        data: {
          id: oldAcceptance.id,
          user_id: oldAcceptance.user_id,
          accepted_at: oldAcceptance.accepted_at,
          ip_hash: oldAcceptance.ip_hash,
          context: oldAcceptance.context,
          terms_version: oldAcceptance.terms_version,
          event_hash: oldAcceptance.ip_hash || 'N/A',
          terms_versions: {
            title: `Termos v${oldAcceptance.terms_version}`,
            version_number: oldAcceptance.terms_version,
            content_hash: 'N/A (versão antiga)'
          },
          fallback: true
        }
      })
    }

    // Buscar email do usuário (a função RPC pode não existir)
    let userEmail = 'N/A'
    try {
      const { data: userData } = await supabase
        .rpc('get_user_email', { user_id: acceptance.user_id })
        .single()
      userEmail = (userData as any)?.email || 'N/A'
    } catch {
      // RPC não existe, usar N/A
      userEmail = 'N/A'
    }

    return NextResponse.json({
      data: {
        ...acceptance,
        user_email: userEmail
      }
    })

  } catch (error) {
    console.error('Erro ao buscar detalhe do aceite:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
