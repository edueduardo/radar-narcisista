import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/frontpage-editor
 * Retorna todas as configurações da frontpage
 */
export async function GET(request: NextRequest) {
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
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    // Buscar todas as configurações
    const { data: configs, error } = await supabase
      .from('frontpage_config')
      .select('*')
      .order('config_key')
    
    if (error) {
      console.error('[FRONTPAGE-EDITOR] Erro ao buscar configs:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }
    
    // Transformar em objeto para facilitar uso no frontend
    const configMap: Record<string, any> = {}
    configs?.forEach(config => {
      configMap[config.config_key] = {
        id: config.id,
        value: config.config_value,
        description: config.description,
        is_active: config.is_active,
        updated_at: config.updated_at
      }
    })
    
    return NextResponse.json({
      success: true,
      configs: configMap,
      raw: configs
    })
    
  } catch (error) {
    console.error('[FRONTPAGE-EDITOR] Erro inesperado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/frontpage-editor
 * Atualiza uma configuração específica
 * Body: { config_key: string, config_value: object }
 */
export async function PUT(request: NextRequest) {
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
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    // Parse do body
    const body = await request.json().catch(() => null)
    
    if (!body || !body.config_key) {
      return NextResponse.json(
        { success: false, error: 'config_key é obrigatório' },
        { status: 400 }
      )
    }
    
    const { config_key, config_value, is_active } = body
    
    // Atualizar configuração
    const updateData: any = {}
    if (config_value !== undefined) updateData.config_value = config_value
    if (is_active !== undefined) updateData.is_active = is_active
    
    const { data: updated, error } = await supabase
      .from('frontpage_config')
      .update(updateData)
      .eq('config_key', config_key)
      .select()
      .single()
    
    if (error) {
      console.error('[FRONTPAGE-EDITOR] Erro ao atualizar:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar configuração' },
        { status: 500 }
      )
    }
    
    console.log(`[FRONTPAGE-EDITOR] Config "${config_key}" atualizada por ${user.email}`)
    
    return NextResponse.json({
      success: true,
      config: updated
    })
    
  } catch (error) {
    console.error('[FRONTPAGE-EDITOR] Erro inesperado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/frontpage-editor
 * Cria uma nova configuração
 * Body: { config_key: string, config_value: object, description?: string }
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
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    // Parse do body
    const body = await request.json().catch(() => null)
    
    if (!body || !body.config_key || !body.config_value) {
      return NextResponse.json(
        { success: false, error: 'config_key e config_value são obrigatórios' },
        { status: 400 }
      )
    }
    
    const { config_key, config_value, description } = body
    
    // Criar configuração
    const { data: created, error } = await supabase
      .from('frontpage_config')
      .insert({
        config_key,
        config_value,
        description: description || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('[FRONTPAGE-EDITOR] Erro ao criar:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao criar configuração' },
        { status: 500 }
      )
    }
    
    console.log(`[FRONTPAGE-EDITOR] Config "${config_key}" criada por ${user.email}`)
    
    return NextResponse.json({
      success: true,
      config: created
    })
    
  } catch (error) {
    console.error('[FRONTPAGE-EDITOR] Erro inesperado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}
