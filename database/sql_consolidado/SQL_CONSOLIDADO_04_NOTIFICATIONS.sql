-- ============================================================================
-- SQL CONSOLIDADO 04 - SISTEMA DE NOTIFICAÇÕES
-- ============================================================================
-- Tabelas para notificações in-app, push e preferências
-- ============================================================================

-- Tabela de notificações in-app
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'system',
  priority TEXT NOT NULL DEFAULT 'normal',
  data JSONB DEFAULT '{}',
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  risk_alerts BOOLEAN DEFAULT TRUE,
  journal_reminders BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para preferências
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Tabela de push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para notification_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON notification_preferences;
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Policies para push_subscriptions
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Função para criar notificação (pode ser chamada por triggers)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_category TEXT DEFAULT 'system',
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, body, category, priority, action_url, data)
  VALUES (p_user_id, p_title, p_body, p_category, p_priority, p_action_url, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificação quando risk_alert é criado
CREATE OR REPLACE FUNCTION notify_on_risk_alert() RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.user_id,
    COALESCE(NEW.title, '⚠️ Alerta de Risco'),
    COALESCE(NEW.description, 'Um novo alerta de risco foi detectado.'),
    'risk_alert',
    CASE 
      WHEN NEW.level = 'CRITICAL' THEN 'urgent'
      WHEN NEW.level = 'HIGH' THEN 'high'
      WHEN NEW.level = 'MEDIUM' THEN 'normal'
      ELSE 'low'
    END,
    '/alertas',
    jsonb_build_object('alert_id', NEW.id, 'level', NEW.level, 'category', NEW.category)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se tabela risk_alerts existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'risk_alerts') THEN
    DROP TRIGGER IF EXISTS trigger_notify_risk_alert ON risk_alerts;
    CREATE TRIGGER trigger_notify_risk_alert
      AFTER INSERT ON risk_alerts
      FOR EACH ROW
      EXECUTE FUNCTION notify_on_risk_alert();
  END IF;
END $$;

-- Comentários
COMMENT ON TABLE notifications IS 'Notificações in-app para usuários';
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação por usuário';
COMMENT ON TABLE push_subscriptions IS 'Subscriptions para Web Push Notifications';
