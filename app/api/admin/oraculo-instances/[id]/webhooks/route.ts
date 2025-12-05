/**
 * API de Gerenciamento de Webhooks
 * ETAPA 37 - Sistema de Webhooks para Eventos
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { 
  createWebhook, 
  listWebhooks, 
  updateWebhook,
  deleteWebhook,
  listWebhookDeliveries,
  WebhookEventType
} from '@/lib/oraculo-webhooks'

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

// GET - Lista webhooks da instância
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

    // Verificar se quer deliveries de um webhook específico
    const webhookId = request.nextUrl.searchParams.get('webhook_id')
    
    if (webhookId) {
      const deliveries = await listWebhookDeliveries(webhookId, 50)
      return NextResponse.json({
        success: true,
        deliveries,
        total: deliveries.length
      })
    }

    const webhooks = await listWebhooks(id)
    
    // Mascarar secret keys
    const maskedWebhooks = webhooks.map(w => ({
      ...w,
      secret_key: w.secret_key ? `${w.secret_key.slice(0, 8)}...` : null
    }))

    return NextResponse.json({
      success: true,
      webhooks: maskedWebhooks,
      total: webhooks.length
    })

  } catch (error) {
    console.error('Erro ao listar webhooks:', error)
    return NextResponse.json(
      { error: 'Erro ao listar webhooks' },
      { status: 500 }
    )
  }
}

// POST - Cria novo webhook
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
    
    if (!body.webhook_name || !body.webhook_url) {
      return NextResponse.json(
        { error: 'webhook_name e webhook_url são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar URL
    try {
      new URL(body.webhook_url)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }

    // Validar eventos
    const validEvents: WebhookEventType[] = [
      'oraculo.query',
      'oraculo.response',
      'oraculo.error',
      'oraculo.limit_reached',
      'instance.updated',
      'apikey.created',
      'apikey.revoked'
    ]
    
    if (body.events) {
      const invalidEvents = body.events.filter((e: string) => !validEvents.includes(e as WebhookEventType))
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Eventos inválidos: ${invalidEvents.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const webhook = await createWebhook({
      instance_id: id,
      webhook_name: body.webhook_name,
      webhook_url: body.webhook_url,
      events: body.events,
      custom_headers: body.custom_headers,
      created_by: user.id
    })
    
    if (!webhook) {
      return NextResponse.json(
        { error: 'Erro ao criar webhook' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      webhook: {
        ...webhook,
        secret_key: webhook.secret_key // Mostrar secret apenas na criação
      },
      warning: 'Guarde o secret_key em local seguro. Ele não será exibido novamente.'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao criar webhook' },
      { status: 500 }
    )
  }
}

// PATCH - Atualiza webhook
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
    
    if (!body.webhook_id) {
      return NextResponse.json(
        { error: 'webhook_id é obrigatório' },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    
    if (body.webhook_name) updates.webhook_name = body.webhook_name
    if (body.webhook_url) {
      try {
        new URL(body.webhook_url)
        updates.webhook_url = body.webhook_url
      } catch {
        return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
      }
    }
    if (body.events) updates.events = body.events
    if (body.status) updates.status = body.status
    if (body.custom_headers) updates.custom_headers = body.custom_headers

    const success = await updateWebhook(body.webhook_id, updates)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao atualizar webhook' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar webhook' },
      { status: 500 }
    )
  }
}

// DELETE - Deleta webhook
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

    const webhookId = request.nextUrl.searchParams.get('webhook_id')
    
    if (!webhookId) {
      return NextResponse.json(
        { error: 'webhook_id é obrigatório' },
        { status: 400 }
      )
    }

    const success = await deleteWebhook(webhookId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao deletar webhook' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar webhook' },
      { status: 500 }
    )
  }
}
