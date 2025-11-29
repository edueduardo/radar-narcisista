import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'

// POST - Criar sugestões mock para demonstração
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    // Sugestões mock baseadas no tipo de fluxo
    const mockSuggestions = [
      {
        type: 'RISK',
        title: 'Possível loop infinito detectado',
        description: 'O fluxo pode entrar em loop se o nó de IA retornar o mesmo trigger. Considere adicionar uma condição de parada.',
        status: 'OPEN'
      },
      {
        type: 'IMPROVEMENT',
        title: 'Adicionar nó de notificação',
        description: 'Considere adicionar um nó de notificação ao usuário após a execução para melhor feedback.',
        status: 'OPEN'
      },
      {
        type: 'NEW_FLOW_IDEA',
        title: 'Fluxo complementar de follow-up',
        description: 'Crie um fluxo semelhante que execute 24h após este para acompanhamento.',
        status: 'OPEN'
      }
    ]

    const inserted = []
    for (const suggestion of mockSuggestions) {
      const { data, error } = await supabaseAdmin
        .from('ai_flow_suggestions')
        .insert({
          flow_id: id,
          ...suggestion
        })
        .select()
        .single()

      if (!error && data) {
        inserted.push(data)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Criadas ${inserted.length} sugestões mock para demonstração`,
      data: inserted
    })

  } catch (error) {
    console.error('Erro ao criar sugestões mock:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar sugestões mock' },
      { status: 500 }
    )
  }
}
