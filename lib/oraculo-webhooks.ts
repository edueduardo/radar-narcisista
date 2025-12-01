/**
 * ORACULO WEBHOOKS - Sistema de Webhooks para Eventos
 * ETAPA 37 - Webhooks para Whitelabel
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ============================================================================
// TIPOS
// ============================================================================

export type WebhookEventType = 
  | 'oraculo.query'
  | 'oraculo.response'
  | 'oraculo.error'
  | 'oraculo.limit_reached'
  | 'instance.updated'
  | 'apikey.created'
  | 'apikey.revoked'

export interface Webhook {
  id: string
  instance_id: string
  webhook_name: string
  webhook_url: string
  secret_key: string | null
  events: WebhookEventType[]
  status: 'active' | 'inactive' | 'failed'
  retry_count: number
  retry_delay_seconds: number
  timeout_seconds: number
  custom_headers: Record<string, string>
  total_deliveries: number
  successful_deliveries: number
  failed_deliveries: number
  last_delivery_at: string | null
  last_error: string | null
  consecutive_failures: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  instance_id: string
  event_type: WebhookEventType
  event_id: string
  payload: Record<string, unknown>
  status_code: number | null
  response_body: string | null
  response_time_ms: number | null
  delivery_status: 'pending' | 'success' | 'failed' | 'retrying'
  attempt_count: number
  next_retry_at: string | null
  error_message: string | null
  created_at: string
  delivered_at: string | null
}

export interface WebhookPayload {
  event: WebhookEventType
  event_id: string
  timestamp: string
  instance: {
    id: string
    slug: string
    name: string
  }
  data: Record<string, unknown>
}

export interface CreateWebhookInput {
  instance_id: string
  webhook_name: string
  webhook_url: string
  events?: WebhookEventType[]
  custom_headers?: Record<string, string>
  created_by?: string
}

// ============================================================================
// CLIENTE SUPABASE
// ============================================================================

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase não configurado')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ============================================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================================

/**
 * Gera um secret key para assinatura HMAC
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Gera um ID único para o evento
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
}

/**
 * Gera assinatura HMAC para o payload
 */
export function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

/**
 * Verifica assinatura HMAC
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = signPayload(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// ============================================================================
// FUNÇÕES DE CRUD
// ============================================================================

/**
 * Cria um novo webhook
 */
export async function createWebhook(input: CreateWebhookInput): Promise<Webhook | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const secretKey = generateWebhookSecret()
    
    const { data, error } = await supabase
      .from('oraculo_webhooks')
      .insert({
        instance_id: input.instance_id,
        webhook_name: input.webhook_name,
        webhook_url: input.webhook_url,
        secret_key: secretKey,
        events: input.events || ['oraculo.query', 'oraculo.response'],
        custom_headers: input.custom_headers || {},
        created_by: input.created_by || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar webhook:', error)
      return null
    }
    
    return data as Webhook
  } catch (error) {
    console.error('Erro ao criar webhook:', error)
    return null
  }
}

/**
 * Lista webhooks de uma instância
 */
export async function listWebhooks(instanceId: string): Promise<Webhook[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_webhooks')
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao listar webhooks:', error)
      return []
    }
    
    return data as Webhook[]
  } catch (error) {
    console.error('Erro ao listar webhooks:', error)
    return []
  }
}

/**
 * Busca um webhook por ID
 */
export async function getWebhook(webhookId: string): Promise<Webhook | null> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_webhooks')
      .select('*')
      .eq('id', webhookId)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as Webhook
  } catch (error) {
    console.error('Erro ao buscar webhook:', error)
    return null
  }
}

/**
 * Atualiza um webhook
 */
export async function updateWebhook(webhookId: string, updates: Partial<Webhook>): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    // Remover campos que não devem ser atualizados
    delete updates.id
    delete updates.secret_key
    delete updates.created_at
    delete updates.instance_id
    
    const { error } = await supabase
      .from('oraculo_webhooks')
      .update(updates)
      .eq('id', webhookId)
    
    if (error) {
      console.error('Erro ao atualizar webhook:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar webhook:', error)
    return false
  }
}

/**
 * Deleta um webhook
 */
export async function deleteWebhook(webhookId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('oraculo_webhooks')
      .delete()
      .eq('id', webhookId)
    
    if (error) {
      console.error('Erro ao deletar webhook:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erro ao deletar webhook:', error)
    return false
  }
}

// ============================================================================
// FUNÇÕES DE DISPARO
// ============================================================================

/**
 * Busca webhooks ativos para um evento
 */
async function getActiveWebhooksForEvent(
  instanceId: string, 
  eventType: WebhookEventType
): Promise<Webhook[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_webhooks')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('status', 'active')
      .contains('events', [eventType])
    
    if (error) {
      console.error('Erro ao buscar webhooks:', error)
      return []
    }
    
    return data as Webhook[]
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error)
    return []
  }
}

/**
 * Registra uma entrega de webhook
 */
async function logDelivery(
  webhookId: string,
  instanceId: string,
  eventType: WebhookEventType,
  eventId: string,
  payload: Record<string, unknown>,
  result: {
    success: boolean
    statusCode?: number
    responseBody?: string
    responseTimeMs?: number
    errorMessage?: string
  }
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    
    await supabase
      .from('oraculo_webhook_deliveries')
      .insert({
        webhook_id: webhookId,
        instance_id: instanceId,
        event_type: eventType,
        event_id: eventId,
        payload,
        status_code: result.statusCode || null,
        response_body: result.responseBody?.slice(0, 1000) || null,
        response_time_ms: result.responseTimeMs || null,
        delivery_status: result.success ? 'success' : 'failed',
        attempt_count: 1,
        error_message: result.errorMessage || null,
        delivered_at: result.success ? new Date().toISOString() : null
      })
    
    // Atualizar estatísticas do webhook - buscar valores atuais primeiro
    const { data: currentWebhook } = await supabase
      .from('oraculo_webhooks')
      .select('total_deliveries, successful_deliveries, failed_deliveries, consecutive_failures')
      .eq('id', webhookId)
      .single()
    
    if (!currentWebhook) return
    
    if (result.success) {
      await supabase
        .from('oraculo_webhooks')
        .update({
          total_deliveries: (currentWebhook.total_deliveries || 0) + 1,
          successful_deliveries: (currentWebhook.successful_deliveries || 0) + 1,
          consecutive_failures: 0,
          last_delivery_at: new Date().toISOString(),
          last_error: null
        })
        .eq('id', webhookId)
    } else {
      const newConsecutiveFailures = (currentWebhook.consecutive_failures || 0) + 1
      
      await supabase
        .from('oraculo_webhooks')
        .update({
          total_deliveries: (currentWebhook.total_deliveries || 0) + 1,
          failed_deliveries: (currentWebhook.failed_deliveries || 0) + 1,
          consecutive_failures: newConsecutiveFailures,
          last_delivery_at: new Date().toISOString(),
          last_error: result.errorMessage || 'Erro desconhecido',
          // Desativar webhook se muitas falhas consecutivas
          status: newConsecutiveFailures >= 10 ? 'failed' : undefined
        })
        .eq('id', webhookId)
    }
  } catch (error) {
    console.error('Erro ao registrar delivery:', error)
  }
}

/**
 * Envia um webhook
 */
async function sendWebhook(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const startTime = Date.now()
  
  try {
    const payloadString = JSON.stringify(payload)
    
    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Oraculo-Webhook/1.0',
      'X-Webhook-Event': payload.event,
      'X-Webhook-Event-Id': payload.event_id,
      'X-Webhook-Timestamp': payload.timestamp,
      ...webhook.custom_headers
    }
    
    // Adicionar assinatura se tiver secret
    if (webhook.secret_key) {
      headers['X-Webhook-Signature'] = signPayload(payloadString, webhook.secret_key)
    }
    
    // Fazer requisição
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000)
    
    const response = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const responseTimeMs = Date.now() - startTime
    const responseBody = await response.text().catch(() => '')
    
    // Registrar delivery
    await logDelivery(
      webhook.id,
      webhook.instance_id,
      payload.event,
      payload.event_id,
      payload as unknown as Record<string, unknown>,
      {
        success: response.ok,
        statusCode: response.status,
        responseBody,
        responseTimeMs,
        errorMessage: response.ok ? undefined : `HTTP ${response.status}`
      }
    )
    
    return {
      success: response.ok,
      statusCode: response.status
    }
  } catch (error) {
    const responseTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    // Registrar falha
    await logDelivery(
      webhook.id,
      webhook.instance_id,
      payload.event,
      payload.event_id,
      payload as unknown as Record<string, unknown>,
      {
        success: false,
        responseTimeMs,
        errorMessage
      }
    )
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Dispara um evento para todos os webhooks configurados
 */
export async function triggerWebhookEvent(
  instanceId: string,
  instanceSlug: string,
  instanceName: string,
  eventType: WebhookEventType,
  data: Record<string, unknown>
): Promise<{ triggered: number; successful: number }> {
  try {
    // Buscar webhooks ativos para este evento
    const webhooks = await getActiveWebhooksForEvent(instanceId, eventType)
    
    if (webhooks.length === 0) {
      return { triggered: 0, successful: 0 }
    }
    
    // Preparar payload
    const eventId = generateEventId()
    const payload: WebhookPayload = {
      event: eventType,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      instance: {
        id: instanceId,
        slug: instanceSlug,
        name: instanceName
      },
      data
    }
    
    // Disparar webhooks em paralelo (com limite)
    const results = await Promise.allSettled(
      webhooks.map(webhook => sendWebhook(webhook, payload))
    )
    
    const successful = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length
    
    return {
      triggered: webhooks.length,
      successful
    }
  } catch (error) {
    console.error('Erro ao disparar webhooks:', error)
    return { triggered: 0, successful: 0 }
  }
}

/**
 * Lista entregas recentes de um webhook
 */
export async function listWebhookDeliveries(
  webhookId: string,
  limit: number = 20
): Promise<WebhookDelivery[]> {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('oraculo_webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Erro ao listar deliveries:', error)
      return []
    }
    
    return data as WebhookDelivery[]
  } catch (error) {
    console.error('Erro ao listar deliveries:', error)
    return []
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ORACULO_WEBHOOKS = {
  generateWebhookSecret,
  generateEventId,
  signPayload,
  verifySignature,
  createWebhook,
  listWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  triggerWebhookEvent,
  listWebhookDeliveries
}

export default ORACULO_WEBHOOKS
