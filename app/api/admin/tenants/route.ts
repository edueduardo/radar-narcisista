import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { createTenant, updateTenant } from '@/lib/multi-tenant'

/**
 * API de Gerenciamento de Tenants
 * 
 * GET /api/admin/tenants - Lista todos os tenants
 * POST /api/admin/tenants - Cria novo tenant
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar tenants
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar tenants:', error)
      return NextResponse.json({ error: 'Erro ao buscar tenants' }, { status: 500 })
    }

    return NextResponse.json({ tenants })

  } catch (error) {
    console.error('Erro na API de tenants:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, domain, branding, settings, limits } = body

    // Validações
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 })
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }

    // Criar tenant
    const result = await createTenant(
      { name, slug, domain, branding, settings, limits },
      user.id,
      supabase
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      tenant: result.tenant 
    })

  } catch (error) {
    console.error('Erro ao criar tenant:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do tenant é obrigatório' }, { status: 400 })
    }

    // Verificar permissão
    const { data: tenant } = await supabase
      .from('tenants')
      .select('owner_id')
      .eq('id', id)
      .single()

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'ADMIN'
    const isOwner = tenant?.owner_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Atualizar tenant
    const result = await updateTenant(id, updates, supabase)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao atualizar tenant:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
