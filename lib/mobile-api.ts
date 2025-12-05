/**
 * API Mobile
 * FASE 10.5 - Endpoints otimizados para apps mobile
 */

export interface MobileSession {
  userId: string
  deviceId: string
  platform: 'ios' | 'android' | 'web'
  appVersion: string
  pushToken?: string
  lastActive: string
}

export interface MobileUser {
  id: string
  email: string
  name?: string
  avatar?: string
  plan: string
  features: string[]
  stats: {
    journalEntries: number
    chatMessages: number
    clarityTests: number
    currentStreak: number
  }
}

export interface MobileSyncData {
  lastSyncAt: string
  journalEntries: any[]
  chatMessages: any[]
  notifications: any[]
  achievements: any[]
}

/**
 * Registrar dispositivo mobile
 */
export async function registerMobileDevice(
  userId: string,
  deviceInfo: {
    deviceId: string
    platform: 'ios' | 'android'
    appVersion: string
    pushToken?: string
    deviceModel?: string
    osVersion?: string
  },
  supabase: any
): Promise<{ success: boolean; sessionId: string | null }> {
  try {
    const { data, error } = await supabase
      .from('mobile_sessions')
      .upsert({
        user_id: userId,
        device_id: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        app_version: deviceInfo.appVersion,
        push_token: deviceInfo.pushToken,
        device_model: deviceInfo.deviceModel,
        os_version: deviceInfo.osVersion,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_id'
      })
      .select('id')
      .single()

    if (error) throw error

    return { success: true, sessionId: data?.id }
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error)
    return { success: false, sessionId: null }
  }
}

/**
 * Atualizar push token
 */
export async function updatePushToken(
  userId: string,
  deviceId: string,
  pushToken: string,
  supabase: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mobile_sessions')
      .update({ 
        push_token: pushToken,
        last_active: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('device_id', deviceId)

    return !error
  } catch {
    return false
  }
}

/**
 * Buscar dados do usuário para mobile
 */
export async function getMobileUserData(
  userId: string,
  supabase: any
): Promise<MobileUser | null> {
  try {
    // Buscar perfil
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Buscar subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions_core')
      .select('plan_slug, feature_flags')
      .eq('user_id', userId)
      .single()

    // Buscar stats
    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: chatCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: clarityCount } = await supabase
      .from('clarity_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Buscar progresso
    const { data: progress } = await supabase
      .from('user_progress')
      .select('current_streak')
      .eq('user_id', userId)
      .single()

    return {
      id: userId,
      email: profile?.email || '',
      name: profile?.name,
      avatar: profile?.avatar_url,
      plan: subscription?.plan_slug || 'free',
      features: subscription?.feature_flags || [],
      stats: {
        journalEntries: journalCount || 0,
        chatMessages: chatCount || 0,
        clarityTests: clarityCount || 0,
        currentStreak: progress?.current_streak || 0
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados mobile:', error)
    return null
  }
}

/**
 * Sincronizar dados offline
 */
export async function syncOfflineData(
  userId: string,
  offlineData: {
    journalEntries?: any[]
    chatMessages?: any[]
  },
  supabase: any
): Promise<{ success: boolean; synced: number; errors: string[] }> {
  const errors: string[] = []
  let synced = 0

  // Sincronizar entradas do diário
  if (offlineData.journalEntries?.length) {
    for (const entry of offlineData.journalEntries) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .upsert({
            ...entry,
            user_id: userId,
            synced_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (error) throw error
        synced++
      } catch (error: any) {
        errors.push(`Diário ${entry.id}: ${error.message}`)
      }
    }
  }

  // Sincronizar mensagens do chat
  if (offlineData.chatMessages?.length) {
    for (const message of offlineData.chatMessages) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .upsert({
            ...message,
            user_id: userId,
            synced_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (error) throw error
        synced++
      } catch (error: any) {
        errors.push(`Chat ${message.id}: ${error.message}`)
      }
    }
  }

  return { success: errors.length === 0, synced, errors }
}

/**
 * Buscar dados para sincronização
 */
export async function getSyncData(
  userId: string,
  lastSyncAt: string,
  supabase: any
): Promise<MobileSyncData> {
  // Buscar entradas do diário atualizadas
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('updated_at', lastSyncAt)
    .order('created_at', { ascending: false })
    .limit(100)

  // Buscar mensagens do chat atualizadas
  const { data: chatMessages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', lastSyncAt)
    .order('created_at', { ascending: false })
    .limit(100)

  // Buscar notificações não lidas
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(50)

  // Buscar conquistas
  const { data: progress } = await supabase
    .from('user_progress')
    .select('unlocked_achievements')
    .eq('user_id', userId)
    .single()

  return {
    lastSyncAt: new Date().toISOString(),
    journalEntries: journalEntries || [],
    chatMessages: chatMessages || [],
    notifications: notifications || [],
    achievements: progress?.unlocked_achievements || []
  }
}

/**
 * SQL para tabelas mobile
 */
export const MOBILE_SCHEMA = `
-- Sessões mobile
CREATE TABLE IF NOT EXISTS mobile_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  app_version TEXT,
  push_token TEXT,
  device_model TEXT,
  os_version TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_user ON mobile_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_push ON mobile_sessions(push_token) WHERE push_token IS NOT NULL;

-- RLS
ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their sessions" ON mobile_sessions
  FOR ALL USING (user_id = auth.uid());
`
