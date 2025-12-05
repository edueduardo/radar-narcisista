/**
 * API de Gerenciamento de API Keys
 * ETAPA 36 - Sistema de API Keys para Whitelabel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { 
  createApiKey, 
  listApiKeys, 
  revokeApiKey,
  deleteApiKey,
  maskApiKey
} from '@/lib/oraculo-api-keys'

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

// GET - Lista API keys da instância
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

    const keys = await listApiKeys(id)
    
    // Mascarar as keys para segurança
    const maskedKeys = keys.map(key => ({
      ...key,
      api_key: maskApiKey(key.api_key)
    }))

    return NextResponse.json({
      success: true,
      keys: maskedKeys,
      total: keys.length
    })

  } catch (error) {
    console.error('Erro ao listar API keys:', error)
    return NextResponse.json(
      { error: 'Erro ao listar API keys' },
      { status: 500 }
    )
  }
}

// POST - Cria nova API key
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    
    if (!body.key_name) {
      return NextResponse.json(
        { error: 'key_name é obrigatório' },
        { status: 400 }
      )
    }

    const result = await createApiKey({
      instance_id: id,
      key_name: body.key_name,
      permissions: body.permissions,
      allowed_roles: body.allowed_roles,
      rate_limit_per_minute: body.rate_limit_per_minute,
      rate_limit_per_day: body.rate_limit_per_day,
      expires_at: body.expires_at,
      created_by: user.id
    })
    
    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao criar API key' },
        { status: 400 }
      )
    }

    // Retorna a key completa apenas na criação
    return NextResponse.json({
      success: true,
      key: {
        ...result.apiKey,
        api_key: maskApiKey(result.apiKey.api_key)
      },
      full_key: result.fullKey, // Mostrar apenas uma vez!
      warning: 'Guarde esta chave em local seguro. Ela não será exibida novamente.'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar API key:', error)
    return NextResponse.json(
      { error: 'Erro ao criar API key' },
      { status: 500 }
    )
  }
}

// PATCH - Revoga uma API key
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
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
    
    if (!body.key_id) {
      return NextResponse.json(
        { error: 'key_id é obrigatório' },
        { status: 400 }
      )
    }

    const success = await revokeApiKey(body.key_id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao revogar API key' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key revogada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao revogar API key:', error)
    return NextResponse.json(
      { error: 'Erro ao revogar API key' },
      { status: 500 }
    )
  }
}

// DELETE - Deleta uma API key
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('key_id')
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'key_id é obrigatório' },
        { status: 400 }
      )
    }

    const success = await deleteApiKey(keyId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar API key' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar API key:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar API key' },
      { status: 500 }
    )
  }
}
