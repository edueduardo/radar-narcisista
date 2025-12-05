/**
 * API de Billing para Instâncias
 * ETAPA 38 - Sistema de Billing por Instância
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { 
  listPlans,
  getInstanceSubscription,
  createFreeSubscription,
  createCheckoutSession,
  listInstanceInvoices,
  getCurrentUsage
} from '@/lib/oraculo-billing'

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

// GET - Busca billing info da instância
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

    // Buscar subscription
    let subscription = await getInstanceSubscription(id)
    
    // Se não tem subscription, criar uma free
    if (!subscription) {
      subscription = await createFreeSubscription(id)
    }

    // Buscar planos disponíveis
    const plans = await listPlans()

    // Buscar invoices
    const invoices = await listInstanceInvoices(id)

    // Buscar uso atual
    const usage = await getCurrentUsage(id)

    return NextResponse.json({
      success: true,
      subscription,
      plans,
      invoices,
      usage
    })

  } catch (error) {
    console.error('Erro ao buscar billing:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar billing' },
      { status: 500 }
    )
  }
}

// POST - Cria checkout session para upgrade
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
    
    if (!body.plan_slug) {
      return NextResponse.json(
        { error: 'plan_slug é obrigatório' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://radar-narcisista.vercel.app'
    
    const result = await createCheckoutSession(
      id,
      body.plan_slug,
      `${baseUrl}/admin/oraculo-instances/${id}?billing=success`,
      `${baseUrl}/admin/oraculo-instances/${id}?billing=canceled`
    )
    
    if (!result.url) {
      return NextResponse.json(
        { error: result.error || 'Erro ao criar checkout' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      checkout_url: result.url
    })

  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao criar checkout' },
      { status: 500 }
    )
  }
}
