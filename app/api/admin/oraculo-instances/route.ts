/**
 * API de Gerenciamento de Instâncias do Oráculo
 * ETAPA 32 - Matriz Oráculo Multi-instância
 * 
 * Endpoints:
 * GET    - Lista todas as instâncias
 * POST   - Cria nova instância
 * 
 * Apenas ADMIN pode acessar
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { 
  listInstances, 
  createInstance,
  OraculoInstance 
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

// GET - Lista todas as instâncias
export async function GET(request: NextRequest) {
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

    const instances = await listInstances()
    
    return NextResponse.json({
      success: true,
      instances,
      total: instances.length
    })

  } catch (error) {
    console.error('Erro ao listar instâncias:', error)
    return NextResponse.json(
      { error: 'Erro ao listar instâncias' },
      { status: 500 }
    )
  }
}

// POST - Cria nova instância
export async function POST(request: NextRequest) {
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
    
    // Validar campos obrigatórios
    if (!body.instance_slug || !body.instance_name) {
      return NextResponse.json(
        { error: 'instance_slug e instance_name são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar slug (apenas letras, números e hífens)
    if (!/^[a-z0-9-]+$/.test(body.instance_slug)) {
      return NextResponse.json(
        { error: 'instance_slug deve conter apenas letras minúsculas, números e hífens' },
        { status: 400 }
      )
    }

    const instanceData: Partial<OraculoInstance> = {
      instance_slug: body.instance_slug,
      instance_name: body.instance_name,
      owner_id: body.owner_id || null,
      status: body.status || 'active',
      modelo_ia: body.modelo_ia || 'gpt-4o-mini',
      temperatura: body.temperatura || 0.7,
      max_tokens: body.max_tokens || 1000,
      prompt_base_override: body.prompt_base_override || null,
      prompt_adicional: body.prompt_adicional || null,
      nome_assistente: body.nome_assistente || 'Oráculo',
      tom_comunicacao: body.tom_comunicacao || 'acolhedor',
      cor_primaria: body.cor_primaria || '#8B5CF6',
      cor_secundaria: body.cor_secundaria || '#6366F1',
      logo_url: body.logo_url || null,
      limite_diario_global: body.limite_diario_global || null,
      limite_mensal_global: body.limite_mensal_global || null,
      features_enabled: body.features_enabled || { analise: true, sugestao: true, alerta: true, explicacao: true },
      contexto_produto: body.contexto_produto || null,
      contexto_empresa: body.contexto_empresa || null,
      dominios_permitidos: body.dominios_permitidos || null
    }

    const instance = await createInstance(instanceData)
    
    if (!instance) {
      return NextResponse.json(
        { error: 'Erro ao criar instância. Verifique se o slug já existe.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      instance
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar instância:', error)
    return NextResponse.json(
      { error: 'Erro ao criar instância' },
      { status: 500 }
    )
  }
}
