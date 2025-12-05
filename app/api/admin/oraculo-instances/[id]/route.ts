/**
 * API de Gerenciamento de Instância Individual
 * ETAPA 32 - Matriz Oráculo Multi-instância
 * 
 * Endpoints:
 * GET    - Busca uma instância por ID
 * PUT    - Atualiza uma instância
 * DELETE - Deleta uma instância
 * 
 * Apenas ADMIN pode acessar
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { 
  updateInstance, 
  deleteInstance,
  getInstanceRoles,
  getInstanceUsage
} from '@/lib/oraculo-instances'

// Cliente Supabase admin
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verificar se usuário é admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return false
  
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  return data?.role === 'ADMIN' || data?.role === 'SUPER_ADMIN'
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Busca uma instância com detalhes
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Erro de configuração' }, { status: 500 })
    }

    // Buscar instância
    const { data: instance, error } = await supabaseAdmin
      .from('oraculo_instances')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !instance) {
      return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 })
    }

    // Buscar roles e uso
    const [roles, usoDiario, usoMensal] = await Promise.all([
      getInstanceRoles(id),
      getInstanceUsage(id, 'diario'),
      getInstanceUsage(id, 'mensal')
    ])

    return NextResponse.json({
      success: true,
      instance,
      roles,
      usage: {
        diario: usoDiario,
        mensal: usoMensal
      }
    })

  } catch (error) {
    console.error('Erro ao buscar instância:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar instância' },
      { status: 500 }
    )
  }
}

// PUT - Atualiza uma instância
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    
    // Remover campos que não devem ser atualizados
    delete body.id
    delete body.created_at
    
    const success = await updateInstance(id, body)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao atualizar instância' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Instância atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar instância:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar instância' },
      { status: 500 }
    )
  }
}

// DELETE - Deleta uma instância
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Não permitir deletar a instância padrão
    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      const { data: instance } = await supabaseAdmin
        .from('oraculo_instances')
        .select('instance_slug')
        .eq('id', id)
        .single()
      
      if (instance?.instance_slug === 'radar-narcisista') {
        return NextResponse.json(
          { error: 'Não é possível deletar a instância padrão' },
          { status: 400 }
        )
      }
    }

    const success = await deleteInstance(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar instância' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Instância deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar instância:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar instância' },
      { status: 500 }
    )
  }
}
