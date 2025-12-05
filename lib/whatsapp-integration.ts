/**
 * Integração WhatsApp
 * FASE 10.3 - Bot de WhatsApp para suporte e notificações
 */

export interface WhatsAppConfig {
  provider: 'z-api' | 'twilio' | 'meta'
  apiKey: string
  instanceId?: string
  phoneNumber: string
  webhookUrl: string
}

export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  type: 'text' | 'image' | 'audio' | 'document'
  content: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface WhatsAppContact {
  phone: string
  name?: string
  userId?: string
  optedIn: boolean
  lastMessage?: string
}

/**
 * Enviar mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  config: WhatsAppConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    let response: Response

    switch (config.provider) {
      case 'z-api':
        response = await fetch(`https://api.z-api.io/instances/${config.instanceId}/token/${config.apiKey}/send-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formatPhoneNumber(to),
            message
          })
        })
        break

      case 'twilio':
        const twilioAuth = Buffer.from(`${config.instanceId}:${config.apiKey}`).toString('base64')
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.instanceId}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: `whatsapp:${config.phoneNumber}`,
            To: `whatsapp:${formatPhoneNumber(to)}`,
            Body: message
          })
        })
        break

      case 'meta':
        response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumber}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formatPhoneNumber(to),
            type: 'text',
            text: { body: message }
          })
        })
        break

      default:
        return { success: false, error: 'Provider não suportado' }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Erro ao enviar mensagem')
    }

    const data = await response.json()
    return { 
      success: true, 
      messageId: data.messageId || data.sid || data.messages?.[0]?.id 
    }

  } catch (error: any) {
    console.error('Erro ao enviar WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Enviar template de mensagem (para notificações)
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string>,
  config: WhatsAppConfig
): Promise<{ success: boolean; error?: string }> {
  if (config.provider !== 'meta') {
    // Para outros providers, enviar como texto simples
    const message = formatTemplateMessage(templateName, variables)
    return sendWhatsAppMessage(to, message, config)
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumber}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_BR' },
          components: [
            {
              type: 'body',
              parameters: Object.entries(variables).map(([_, value]) => ({
                type: 'text',
                text: value
              }))
            }
          ]
        }
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar template')
    }

    return { success: true }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Processar webhook de mensagem recebida
 */
export async function processWhatsAppWebhook(
  payload: any,
  config: WhatsAppConfig,
  supabase: any
): Promise<{ processed: boolean; response?: string }> {
  try {
    let message: { from: string; text: string } | null = null

    // Extrair mensagem baseado no provider
    switch (config.provider) {
      case 'z-api':
        if (payload.text?.message) {
          message = {
            from: payload.phone,
            text: payload.text.message
          }
        }
        break

      case 'meta':
        const entry = payload.entry?.[0]?.changes?.[0]?.value
        const msg = entry?.messages?.[0]
        if (msg?.type === 'text') {
          message = {
            from: msg.from,
            text: msg.text.body
          }
        }
        break
    }

    if (!message) {
      return { processed: false }
    }

    // Buscar usuário pelo telefone
    const { data: user } = await supabase
      .from('user_profiles')
      .select('user_id, name')
      .eq('phone', message.from)
      .single()

    // Registrar mensagem
    await supabase.from('whatsapp_messages').insert({
      phone: message.from,
      user_id: user?.user_id,
      direction: 'incoming',
      content: message.text,
      created_at: new Date().toISOString()
    }).catch(() => {})

    // Gerar resposta automática
    const response = await generateBotResponse(message.text, user)

    // Enviar resposta
    if (response) {
      await sendWhatsAppMessage(message.from, response, config)
    }

    return { processed: true, response }

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return { processed: false }
  }
}

/**
 * Gerar resposta do bot
 */
async function generateBotResponse(
  message: string,
  user: any
): Promise<string> {
  const lowerMessage = message.toLowerCase()

  // Comandos básicos
  if (lowerMessage.includes('ajuda') || lowerMessage === 'oi' || lowerMessage === 'olá') {
    return `Olá${user?.name ? ` ${user.name}` : ''}! 👋

Sou o assistente do Radar Narcisista. Como posso ajudar?

📱 *Comandos disponíveis:*
• *status* - Ver seu progresso
• *emergencia* - Recursos de emergência
• *ajuda* - Ver este menu

Para acessar todas as funcionalidades, use nosso app: https://radarnarcisista.com.br`
  }

  if (lowerMessage.includes('emergencia') || lowerMessage.includes('emergência') || lowerMessage.includes('perigo')) {
    return `🆘 *Recursos de Emergência*

📞 *Ligue agora:*
• *180* - Central de Atendimento à Mulher
• *190* - Polícia Militar
• *192* - SAMU
• *188* - CVV (apoio emocional)

Se você está em perigo imediato, ligue para 190 ou vá até a delegacia mais próxima.

Você não está sozinha. 💜`
  }

  if (lowerMessage.includes('status') || lowerMessage.includes('progresso')) {
    if (!user) {
      return `Para ver seu status, você precisa ter uma conta no Radar Narcisista.

Crie sua conta gratuita: https://radarnarcisista.com.br/cadastro`
    }

    return `📊 *Seu Status*

Acesse seu dashboard completo no app para ver:
• Seu progresso
• Entradas do diário
• Conquistas

🔗 https://radarnarcisista.com.br/dashboard`
  }

  // Resposta padrão
  return `Entendi sua mensagem. Para uma conversa mais completa, acesse nosso chat no app:

🔗 https://radarnarcisista.com.br/chat

Se precisar de ajuda imediata, digite *emergencia*.`
}

// Templates de mensagem
const MESSAGE_TEMPLATES: Record<string, string> = {
  welcome: 'Olá {{name}}! Bem-vinda ao Radar Narcisista. Estamos aqui para ajudar você. 💜',
  risk_alert: '⚠️ {{name}}, detectamos sinais de risco no seu registro. Acesse seu plano de segurança: {{link}}',
  reminder: '📝 {{name}}, que tal registrar como você está se sentindo hoje? Seu diário te espera: {{link}}',
  achievement: '🎉 Parabéns {{name}}! Você desbloqueou a conquista "{{achievement}}"!'
}

function formatTemplateMessage(templateName: string, variables: Record<string, string>): string {
  let message = MESSAGE_TEMPLATES[templateName] || ''
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return message
}

function formatPhoneNumber(phone: string): string {
  // Remover caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '')
  
  // Adicionar código do Brasil se não tiver
  if (cleaned.length === 11 && !cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }
  
  return cleaned
}

/**
 * SQL para tabelas WhatsApp
 */
export const WHATSAPP_SCHEMA = `
-- Mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  direction TEXT CHECK (direction IN ('incoming', 'outgoing')),
  content TEXT,
  template_name TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contatos WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  opted_in BOOLEAN DEFAULT false,
  opted_in_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_user ON whatsapp_contacts(user_id);
`
