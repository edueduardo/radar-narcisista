import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processWhatsAppWebhook, WhatsAppConfig } from '@/lib/whatsapp-integration'

/**
 * Webhook do WhatsApp
 * Recebe mensagens e eventos do WhatsApp
 */

// Verificação do webhook (Meta/Facebook)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Receber mensagens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Criar cliente Supabase com service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Configuração do WhatsApp
    const config: WhatsAppConfig = {
      provider: (process.env.WHATSAPP_PROVIDER as any) || 'meta',
      apiKey: process.env.WHATSAPP_API_KEY || '',
      instanceId: process.env.WHATSAPP_INSTANCE_ID,
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '',
      webhookUrl: process.env.WHATSAPP_WEBHOOK_URL || ''
    }

    // Processar webhook
    const result = await processWhatsAppWebhook(body, config, supabase)

    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('WhatsApp webhook:', { body, result })
    }

    return NextResponse.json({ 
      success: result.processed,
      response: result.response 
    })

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
