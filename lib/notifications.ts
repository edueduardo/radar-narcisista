/**
 * Sistema de Notificações
 * Suporta: Email (Resend), Push (Web Push API), In-App
 */

import { createClient } from '@supabase/supabase-js'

// Tipos
export type NotificationType = 'email' | 'push' | 'in_app' | 'all'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationCategory = 
  | 'risk_alert' 
  | 'safety_plan' 
  | 'journal_reminder' 
  | 'chat_summary' 
  | 'system' 
  | 'marketing'

export interface NotificationPayload {
  userId: string
  title: string
  body: string
  category: NotificationCategory
  priority?: NotificationPriority
  type?: NotificationType
  data?: Record<string, any>
  actionUrl?: string
}

export interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  risk_alerts: boolean
  journal_reminders: boolean
  weekly_summary: boolean
  marketing: boolean
}

// Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

/**
 * Enviar notificação para usuário
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  
  try {
    // Buscar preferências do usuário
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', payload.userId)
      .single()

    const preferences: NotificationPreferences = prefs || {
      email_enabled: true,
      push_enabled: true,
      in_app_enabled: true,
      risk_alerts: true,
      journal_reminders: true,
      weekly_summary: true,
      marketing: false
    }

    // Verificar se categoria está habilitada
    if (payload.category === 'risk_alert' && !preferences.risk_alerts) return false
    if (payload.category === 'journal_reminder' && !preferences.journal_reminders) return false
    if (payload.category === 'marketing' && !preferences.marketing) return false

    const notificationType = payload.type || 'all'
    const results: boolean[] = []

    // 1. Notificação In-App (sempre salva no banco)
    if (notificationType === 'in_app' || notificationType === 'all') {
      if (preferences.in_app_enabled) {
        const inAppResult = await createInAppNotification(payload)
        results.push(inAppResult)
      }
    }

    // 2. Email
    if (notificationType === 'email' || notificationType === 'all') {
      if (preferences.email_enabled) {
        const emailResult = await sendEmailNotification(payload)
        results.push(emailResult)
      }
    }

    // 3. Push
    if (notificationType === 'push' || notificationType === 'all') {
      if (preferences.push_enabled) {
        const pushResult = await sendPushNotification(payload)
        results.push(pushResult)
      }
    }

    return results.some(r => r === true)

  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return false
  }
}

/**
 * Criar notificação in-app (salva no banco)
 */
async function createInAppNotification(payload: NotificationPayload): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        title: payload.title,
        body: payload.body,
        category: payload.category,
        priority: payload.priority || 'normal',
        data: payload.data || {},
        action_url: payload.actionUrl,
        is_read: false,
        created_at: new Date().toISOString()
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao criar notificação in-app:', error)
    return false
  }
}

/**
 * Enviar email via Resend
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    // Verificar se Resend está configurado
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY não configurada')
      return false
    }

    // Buscar email do usuário
    const supabase = getSupabaseAdmin()
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email, name')
      .eq('user_id', payload.userId)
      .single()

    let userEmail = userProfile?.email

    if (!userEmail) {
      // Tentar buscar do auth
      const { data: authUser } = await supabase.auth.admin.getUserById(payload.userId)
      if (!authUser?.user?.email) return false
      userEmail = authUser.user.email
    }

    // Enviar via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Radar Narcisista <noreply@radarnarcisista.com.br>',
        to: userEmail,
        subject: payload.title,
        html: generateEmailHtml(payload)
      })
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return false
  }
}

/**
 * Enviar push notification via Web Push
 * NOTA: Requer instalação de web-push: npm install web-push
 * Por enquanto, retorna false se não configurado
 */
async function sendPushNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    // Verificar se web-push está configurado
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys não configuradas - push notifications desabilitadas')
      return false
    }

    const supabase = getSupabaseAdmin()
    
    // Buscar subscriptions do usuário
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', payload.userId)

    if (!subscriptions || subscriptions.length === 0) {
      console.warn('Nenhuma subscription encontrada para o usuário')
      return false
    }

    // TODO: Implementar envio real quando web-push for instalado
    // Por enquanto, apenas loga que tentaria enviar
    console.log('[Push] Tentaria enviar para', subscriptions.length, 'subscriptions:', {
      title: payload.title,
      body: payload.body,
      userId: payload.userId
    })

    // Retorna true para indicar que "processou" (em dev)
    // Em produção com web-push instalado, faria o envio real
    return true
  } catch (error) {
    console.error('Erro ao enviar push:', error)
    return false
  }
}

/**
 * Gerar HTML do email
 */
function generateEmailHtml(payload: NotificationPayload): string {
  const priorityColors: Record<NotificationPriority, string> = {
    low: '#6B7280',
    normal: '#3B82F6',
    high: '#F59E0B',
    urgent: '#EF4444'
  }

  const color = priorityColors[payload.priority || 'normal']

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🔮 Radar Narcisista</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      <div style="border-left: 4px solid ${color}; padding-left: 16px; margin-bottom: 24px;">
        <h2 style="color: #1F2937; margin: 0 0 8px 0; font-size: 20px;">${payload.title}</h2>
        <p style="color: #4B5563; margin: 0; font-size: 16px; line-height: 1.6;">${payload.body}</p>
      </div>
      
      ${payload.actionUrl ? `
      <a href="${payload.actionUrl}" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Ver detalhes →
      </a>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div style="background: #F9FAFB; padding: 16px 32px; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        Você recebeu este email porque está cadastrado no Radar Narcisista.
        <br>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/configuracoes" style="color: #7C3AED;">Gerenciar preferências</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Enviar notificação de risk_alert
 */
export async function notifyRiskAlert(
  userId: string, 
  alertTitle: string, 
  alertDescription: string,
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): Promise<boolean> {
  const priorityMap: Record<string, NotificationPriority> = {
    LOW: 'low',
    MEDIUM: 'normal',
    HIGH: 'high',
    CRITICAL: 'urgent'
  }

  return sendNotification({
    userId,
    title: `⚠️ ${alertTitle}`,
    body: alertDescription,
    category: 'risk_alert',
    priority: priorityMap[level] || 'high',
    type: 'all',
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/alertas`
  })
}

/**
 * Enviar lembrete do diário
 */
export async function notifyJournalReminder(userId: string): Promise<boolean> {
  return sendNotification({
    userId,
    title: '📔 Hora de registrar',
    body: 'Como foi seu dia? Registre seus pensamentos e emoções no diário.',
    category: 'journal_reminder',
    priority: 'normal',
    type: 'all',
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/diario/novo`
  })
}

/**
 * Enviar resumo semanal
 */
export async function notifyWeeklySummary(
  userId: string, 
  stats: { entries: number; avgMood: number; topTags: string[] }
): Promise<boolean> {
  return sendNotification({
    userId,
    title: '📊 Seu resumo semanal',
    body: `Esta semana: ${stats.entries} registros, humor médio ${stats.avgMood}/10. Tags mais frequentes: ${stats.topTags.join(', ')}`,
    category: 'chat_summary',
    priority: 'normal',
    type: 'email',
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  })
}
