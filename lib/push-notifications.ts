/**
 * Sistema de Notificações Push Nativas
 * FASE 10.2 - Push notifications para iOS e Android
 */

export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: number
  sound?: string
  data?: Record<string, any>
  clickAction?: string
  priority?: 'high' | 'normal'
}

export interface PushSubscription {
  userId: string
  deviceId: string
  platform: 'ios' | 'android' | 'web'
  token: string
  active: boolean
  createdAt: string
}

export interface PushResult {
  success: boolean
  sent: number
  failed: number
  errors: string[]
}

/**
 * Enviar push notification para um usuário
 */
export async function sendPushToUser(
  userId: string,
  notification: PushNotification,
  supabase: any
): Promise<PushResult> {
  // Buscar tokens do usuário
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)

  if (!subscriptions || subscriptions.length === 0) {
    return { success: false, sent: 0, failed: 0, errors: ['Usuário sem dispositivos registrados'] }
  }

  const results: PushResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: []
  }

  for (const sub of subscriptions) {
    try {
      await sendPushToDevice(sub.token, sub.platform, notification)
      results.sent++
    } catch (error: any) {
      results.failed++
      results.errors.push(`${sub.platform}: ${error.message}`)

      // Desativar token inválido
      if (error.message.includes('invalid') || error.message.includes('unregistered')) {
        await supabase
          .from('push_subscriptions')
          .update({ active: false })
          .eq('id', sub.id)
      }
    }
  }

  results.success = results.failed === 0

  return results
}

/**
 * Enviar push para dispositivo específico
 */
async function sendPushToDevice(
  token: string,
  platform: 'ios' | 'android' | 'web',
  notification: PushNotification
): Promise<void> {
  const fcmKey = process.env.FIREBASE_SERVER_KEY
  const apnsKey = process.env.APNS_KEY

  if (platform === 'web' || platform === 'android') {
    // Usar Firebase Cloud Messaging
    if (!fcmKey) {
      throw new Error('FIREBASE_SERVER_KEY não configurada')
    }

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon-192.png',
          badge: notification.badge,
          sound: notification.sound || 'default',
          click_action: notification.clickAction
        },
        data: notification.data,
        priority: notification.priority || 'high'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.results?.[0]?.error || 'Erro FCM')
    }

  } else if (platform === 'ios') {
    // Usar APNs (Apple Push Notification service)
    if (!apnsKey) {
      // Fallback para FCM se APNs não configurado
      throw new Error('APNS_KEY não configurada')
    }

    // Implementação APNs (requer certificado)
    const response = await fetch(`https://api.push.apple.com/3/device/${token}`, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${apnsKey}`,
        'apns-topic': process.env.APNS_BUNDLE_ID || 'com.radarnarcisista.app',
        'apns-push-type': 'alert',
        'apns-priority': notification.priority === 'high' ? '10' : '5'
      },
      body: JSON.stringify({
        aps: {
          alert: {
            title: notification.title,
            body: notification.body
          },
          badge: notification.badge,
          sound: notification.sound || 'default'
        },
        ...notification.data
      })
    })

    if (!response.ok) {
      throw new Error(`APNs error: ${response.status}`)
    }
  }
}

/**
 * Enviar push para múltiplos usuários
 */
export async function sendPushToUsers(
  userIds: string[],
  notification: PushNotification,
  supabase: any
): Promise<PushResult> {
  const results: PushResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: []
  }

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, notification, supabase)
    results.sent += result.sent
    results.failed += result.failed
    results.errors.push(...result.errors)
  }

  results.success = results.failed === 0

  return results
}

/**
 * Enviar push para todos os usuários de um tenant
 */
export async function sendPushToTenant(
  tenantId: string,
  notification: PushNotification,
  supabase: any
): Promise<PushResult> {
  // Buscar usuários do tenant
  const { data: tenantUsers } = await supabase
    .from('tenant_users')
    .select('user_id')
    .eq('tenant_id', tenantId)

  if (!tenantUsers || tenantUsers.length === 0) {
    return { success: false, sent: 0, failed: 0, errors: ['Nenhum usuário no tenant'] }
  }

  const userIds = tenantUsers.map((tu: any) => tu.user_id)
  return sendPushToUsers(userIds, notification, supabase)
}

/**
 * Templates de notificação
 */
export const PUSH_TEMPLATES = {
  riskAlert: (level: string): PushNotification => ({
    title: level === 'critical' ? '🆘 Alerta de Segurança' : '⚠️ Atenção',
    body: level === 'critical' 
      ? 'Detectamos sinais de risco. Acesse recursos de emergência.'
      : 'Identificamos padrões que merecem atenção. Confira seu dashboard.',
    priority: 'high',
    data: { type: 'risk_alert', level },
    clickAction: '/plano-seguranca'
  }),

  achievement: (name: string): PushNotification => ({
    title: '🎉 Nova Conquista!',
    body: `Você desbloqueou: ${name}`,
    data: { type: 'achievement', name },
    clickAction: '/conquistas'
  }),

  reminder: (type: string): PushNotification => ({
    title: '📝 Lembrete',
    body: type === 'journal' 
      ? 'Que tal registrar como você está se sentindo hoje?'
      : 'Você tem atividades pendentes no Radar.',
    data: { type: 'reminder', reminderType: type },
    clickAction: type === 'journal' ? '/diario/novo' : '/dashboard'
  }),

  weeklyReport: (): PushNotification => ({
    title: '📊 Seu Resumo Semanal',
    body: 'Confira seu progresso da semana no Radar.',
    data: { type: 'weekly_report' },
    clickAction: '/estatisticas'
  }),

  newContent: (title: string): PushNotification => ({
    title: '📚 Novo Conteúdo',
    body: title,
    data: { type: 'new_content' },
    clickAction: '/biblioteca'
  })
}

/**
 * Agendar notificação
 */
export async function schedulePush(
  userId: string,
  notification: PushNotification,
  scheduledFor: Date,
  supabase: any
): Promise<{ id: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('scheduled_notifications')
      .insert({
        user_id: userId,
        notification: notification,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) throw error

    return { id: data.id, error: null }

  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

/**
 * Processar notificações agendadas (chamar via cron)
 */
export async function processScheduledNotifications(supabase: any): Promise<number> {
  const now = new Date().toISOString()

  // Buscar notificações pendentes
  const { data: scheduled } = await supabase
    .from('scheduled_notifications')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(100)

  if (!scheduled || scheduled.length === 0) {
    return 0
  }

  let processed = 0

  for (const item of scheduled) {
    try {
      await sendPushToUser(item.user_id, item.notification, supabase)

      await supabase
        .from('scheduled_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', item.id)

      processed++

    } catch (error) {
      await supabase
        .from('scheduled_notifications')
        .update({ status: 'failed', error: String(error) })
        .eq('id', item.id)
    }
  }

  return processed
}

/**
 * SQL para tabelas de push
 */
export const PUSH_SCHEMA = `
-- Subscriptions de push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  token TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Notificações agendadas
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_token ON push_subscriptions(token);
CREATE INDEX IF NOT EXISTS idx_scheduled_status ON scheduled_notifications(status, scheduled_for);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their push subs" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());
`
