import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@/lib/admin-auth'
import { getCuradoriaConfig, updateCuradoriaConfig } from '@/lib/curadoria-config'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ============================================================================
// API: /api/admin/curadoria/config
// GET: Retorna configuração atual da curadoria
// PATCH: Atualiza configuração (merge parcial)
// ETAPA 9: Painel de Curadoria + Semáforo de Edição
// ============================================================================

export async function GET(request: NextRequest) {
  // Verificar autenticação admin
  const authResult = await requireAdminAPI(request)
  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: authResult.error || 'Não autorizado' },
      { status: 401 }
    )
  }

  try {
    const config = await getCuradoriaConfig(supabaseAdmin)

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('[API CURADORIA CONFIG] Erro GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // Verificar autenticação admin
  const authResult = await requireAdminAPI(request)
  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: authResult.error || 'Não autorizado' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    // Validar body
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { success: false, error: 'Body inválido' },
        { status: 400 }
      )
    }

    // Atualizar config
    const result = await updateCuradoriaConfig(supabaseAdmin, body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      config: result.config,
      message: 'Configuração atualizada com sucesso'
    })
  } catch (error) {
    console.error('[API CURADORIA CONFIG] Erro PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar configuração' },
      { status: 500 }
    )
  }
}
