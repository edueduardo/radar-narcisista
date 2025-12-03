-- ============================================================================
-- MIGRATION: limit_notifications
-- BLOCO 36-40 - ETAPA 40: Notificações de Limite
-- Data: 03/12/2025
-- ============================================================================

-- Tabela para notificações de limite
CREATE TABLE IF NOT EXISTS limit_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('warning_80', 'limit_100', 'reset')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadados extras
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_limit_notifications_user ON limit_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_limit_notifications_unread ON limit_notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_limit_notifications_created ON limit_notifications(created_at DESC);

-- RLS
ALTER TABLE limit_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Usuario ve proprias notificacoes" ON limit_notifications;
CREATE POLICY "Usuario ve proprias notificacoes" ON limit_notifications 
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuario atualiza proprias notificacoes" ON limit_notifications;
CREATE POLICY "Usuario atualiza proprias notificacoes" ON limit_notifications 
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Sistema pode inserir notificacoes" ON limit_notifications;
CREATE POLICY "Sistema pode inserir notificacoes" ON limit_notifications 
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNÇÃO: Verificar e notificar limites
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_notify_limit(p_user_id UUID, p_feature_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_limit_check JSONB;
  v_percent_daily NUMERIC;
  v_percent_monthly NUMERIC;
  v_status TEXT := 'ok';
  v_existing_notification UUID;
BEGIN
  -- Verificar limite
  v_limit_check := check_feature_limit(p_user_id, p_feature_key);
  
  -- Calcular percentuais
  IF (v_limit_check->>'limite_diario')::INTEGER IS NOT NULL AND (v_limit_check->>'limite_diario')::INTEGER > 0 THEN
    v_percent_daily := ((v_limit_check->>'usage_today')::NUMERIC / (v_limit_check->>'limite_diario')::NUMERIC) * 100;
  ELSE
    v_percent_daily := 0;
  END IF;
  
  IF (v_limit_check->>'limite_mensal')::INTEGER IS NOT NULL AND (v_limit_check->>'limite_mensal')::INTEGER > 0 THEN
    v_percent_monthly := ((v_limit_check->>'usage_month')::NUMERIC / (v_limit_check->>'limite_mensal')::NUMERIC) * 100;
  ELSE
    v_percent_monthly := 0;
  END IF;
  
  -- Determinar status
  IF v_percent_daily >= 100 OR v_percent_monthly >= 100 THEN
    v_status := 'limit_reached';
  ELSIF v_percent_daily >= 80 OR v_percent_monthly >= 80 THEN
    v_status := 'warning';
  END IF;
  
  -- Criar notificação se necessário (verificar se não existe uma recente)
  IF v_status = 'warning' THEN
    SELECT id INTO v_existing_notification
    FROM limit_notifications
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND notification_type = 'warning_80'
      AND created_at > NOW() - INTERVAL '24 hours'
    LIMIT 1;
    
    IF v_existing_notification IS NULL THEN
      INSERT INTO limit_notifications (user_id, feature_key, notification_type, message)
      VALUES (p_user_id, p_feature_key, 'warning_80', 
        'Você já usou ' || GREATEST(v_percent_daily, v_percent_monthly)::INTEGER || '% do limite de ' || p_feature_key);
    END IF;
  ELSIF v_status = 'limit_reached' THEN
    SELECT id INTO v_existing_notification
    FROM limit_notifications
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND notification_type = 'limit_100'
      AND created_at > NOW() - INTERVAL '24 hours'
    LIMIT 1;
    
    IF v_existing_notification IS NULL THEN
      INSERT INTO limit_notifications (user_id, feature_key, notification_type, message)
      VALUES (p_user_id, p_feature_key, 'limit_100', 
        'Você atingiu o limite de ' || p_feature_key || '. Faça upgrade para continuar.');
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'status', v_status,
    'percent_daily', v_percent_daily,
    'percent_monthly', v_percent_monthly,
    'limit_check', v_limit_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: Obter notificações não lidas
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  feature_key TEXT,
  notification_type TEXT,
  message TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT ln.id, ln.feature_key, ln.notification_type, ln.message, ln.created_at
  FROM limit_notifications ln
  WHERE ln.user_id = p_user_id AND ln.read = false
  ORDER BY ln.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION limit_notifications CONCLUÍDA!' as status;
