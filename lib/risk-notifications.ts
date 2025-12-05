/**
 * Sistema de Notificações de Risco
 * Envia alertas por email e push quando risco é detectado
 */

export interface RiskNotification {
  userId: string
  userEmail: string
  userName?: string
  riskLevel: 'medium' | 'high' | 'critical'
  riskType: string
  source: 'chat' | 'diary' | 'clarity_test' | 'manual'
  details?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  emailSent: boolean
  pushSent: boolean
  inAppCreated: boolean
  errors: string[]
}

// Templates de email por nível de risco
const EMAIL_TEMPLATES = {
  critical: {
    subject: '🆘 Alerta de Segurança - Radar Narcisista',
    getBody: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
    .emergency { background: #fef2f2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🆘 Alerta de Segurança</h1>
    </div>
    <div class="content">
      <p>Olá${name ? ` ${name}` : ''},</p>
      
      <p>Detectamos sinais que indicam que você pode estar em uma situação de risco.</p>
      
      <div class="emergency">
        <h3>📞 Recursos de Emergência</h3>
        <ul>
          <li><strong>180</strong> - Central de Atendimento à Mulher (24h)</li>
          <li><strong>190</strong> - Polícia Militar</li>
          <li><strong>192</strong> - SAMU</li>
          <li><strong>188</strong> - CVV - Centro de Valorização da Vida</li>
        </ul>
      </div>
      
      <p>Se você está em perigo imediato, por favor ligue para um desses números ou vá até a delegacia mais próxima.</p>
      
      <p>
        <a href="https://radarnarcisista.com.br/plano-seguranca" class="button">
          Acessar Plano de Segurança
        </a>
      </p>
      
      <p>Você não está sozinha. Estamos aqui para ajudar.</p>
    </div>
    <div class="footer">
      <p>Radar Narcisista - Sua segurança é nossa prioridade</p>
      <p>Este é um email automático. Para ajustar suas preferências de notificação, acesse suas configurações.</p>
    </div>
  </div>
</body>
</html>
`
  },

  high: {
    subject: '⚠️ Atenção - Sinais de Risco Detectados',
    getBody: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
    .tip { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Atenção</h1>
    </div>
    <div class="content">
      <p>Olá${name ? ` ${name}` : ''},</p>
      
      <p>Identificamos alguns padrões em seus registros que merecem atenção.</p>
      
      <div class="tip">
        <h3>💡 Sugestão</h3>
        <p>Considere revisar ou criar seu Plano de Segurança. É uma ferramenta importante para sua proteção.</p>
      </div>
      
      <p>Lembre-se: você não precisa passar por isso sozinha. Existem recursos disponíveis para te ajudar.</p>
      
      <p>
        <a href="https://radarnarcisista.com.br/dashboard" class="button">
          Acessar Dashboard
        </a>
      </p>
    </div>
    <div class="footer">
      <p>Radar Narcisista</p>
    </div>
  </div>
</body>
</html>
`
  },

  medium: {
    subject: '📊 Atualização do seu Radar',
    getBody: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Atualização do seu Radar</h1>
    </div>
    <div class="content">
      <p>Olá${name ? ` ${name}` : ''},</p>
      
      <p>Notamos algumas atualizações nos seus registros que podem ser úteis para sua jornada de autoconhecimento.</p>
      
      <p>Que tal dar uma olhada no seu dashboard para ver suas estatísticas e insights?</p>
      
      <p>
        <a href="https://radarnarcisista.com.br/dashboard" class="button">
          Ver Dashboard
        </a>
      </p>
    </div>
    <div class="footer">
      <p>Radar Narcisista</p>
    </div>
  </div>
</body>
</html>
`
  }
}

/**
 * Envia notificações de risco
 */
export async function sendRiskNotifications(
  notification: RiskNotification,
  supabase: any
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: false,
    emailSent: false,
    pushSent: false,
    inAppCreated: false,
    errors: []
  }

  try {
    // 1. Verificar preferências do usuário
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', notification.userId)
      .single()

    const emailEnabled = prefs?.email_enabled !== false
    const pushEnabled = prefs?.push_enabled !== false
    const inAppEnabled = prefs?.in_app_enabled !== false

    // 2. Criar notificação in-app
    if (inAppEnabled) {
      try {
        await supabase.from('notifications').insert({
          user_id: notification.userId,
          type: 'risk_alert',
          title: getRiskTitle(notification.riskLevel),
          message: getRiskMessage(notification.riskLevel, notification.riskType),
          data: {
            riskLevel: notification.riskLevel,
            riskType: notification.riskType,
            source: notification.source
          },
          read: false,
          created_at: new Date().toISOString()
        })
        result.inAppCreated = true
      } catch (error: any) {
        result.errors.push(`In-app: ${error.message}`)
      }
    }

    // 3. Enviar email (apenas para high e critical)
    if (emailEnabled && ['high', 'critical'].includes(notification.riskLevel)) {
      try {
        const emailResult = await sendRiskEmail(notification)
        result.emailSent = emailResult
      } catch (error: any) {
        result.errors.push(`Email: ${error.message}`)
      }
    }

    // 4. Enviar push notification
    if (pushEnabled) {
      try {
        const pushResult = await sendRiskPush(notification, supabase)
        result.pushSent = pushResult
      } catch (error: any) {
        result.errors.push(`Push: ${error.message}`)
      }
    }

    // 5. Registrar log
    await supabase.from('notification_logs').insert({
      user_id: notification.userId,
      notification_type: 'risk_alert',
      risk_level: notification.riskLevel,
      channels: {
        email: result.emailSent,
        push: result.pushSent,
        in_app: result.inAppCreated
      },
      errors: result.errors,
      created_at: new Date().toISOString()
    }).catch(() => {}) // Silently fail if table doesn't exist

    result.success = result.inAppCreated || result.emailSent || result.pushSent

  } catch (error: any) {
    result.errors.push(`Geral: ${error.message}`)
  }

  return result
}

/**
 * Envia email de risco via Resend API
 */
async function sendRiskEmail(notification: RiskNotification): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY não configurada')
    return false
  }

  const template = EMAIL_TEMPLATES[notification.riskLevel]
  if (!template) return false

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Radar Narcisista <alertas@radarnarcisista.com.br>',
        to: notification.userEmail,
        subject: template.subject,
        html: template.getBody(notification.userName || '')
      })
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return false
  }
}

/**
 * Envia push notification
 */
async function sendRiskPush(
  notification: RiskNotification,
  supabase: any
): Promise<boolean> {
  // Buscar subscriptions do usuário
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', notification.userId)

  if (!subscriptions || subscriptions.length === 0) {
    return false
  }

  // Em produção, usar web-push ou serviço de push
  // Por enquanto, apenas log
  console.log(`[Push] Enviando para ${subscriptions.length} dispositivos:`, {
    title: getRiskTitle(notification.riskLevel),
    body: getRiskMessage(notification.riskLevel, notification.riskType)
  })

  return true
}

// Helpers
function getRiskTitle(level: string): string {
  switch (level) {
    case 'critical': return '🆘 Alerta de Segurança'
    case 'high': return '⚠️ Atenção Necessária'
    case 'medium': return '📊 Atualização do Radar'
    default: return 'Notificação'
  }
}

function getRiskMessage(level: string, type: string): string {
  switch (level) {
    case 'critical':
      return 'Detectamos sinais de risco. Sua segurança é prioridade. Acesse recursos de emergência.'
    case 'high':
      return 'Identificamos padrões que merecem atenção. Considere revisar seu Plano de Segurança.'
    case 'medium':
      return 'Há atualizações nos seus registros. Confira seu dashboard.'
    default:
      return 'Você tem uma nova notificação.'
  }
}
