-- ============================================================================
-- MIGRATION: feature_usage_logs
-- BLOCO 36-40 - ETAPA 37: Rate Limiting Real
-- Data: 03/12/2025
-- ============================================================================

-- Tabela para registrar uso de features (para rate limiting)
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL REFERENCES features(feature_key) ON DELETE CASCADE,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Campos para analytics
  ip_hash TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'web' -- web, api, mobile
);

-- Índices para performance (CRÍTICO para rate limiting)
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage_logs(user_id, feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_usage_used_at ON feature_usage_logs(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature_date ON feature_usage_logs(user_id, feature_key, used_at);

-- NOTA: Índice parcial com CURRENT_DATE não é permitido (não é IMMUTABLE)
-- O índice idx_feature_usage_user_feature_date já cobre queries por data

-- RLS
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON feature_usage_logs;
CREATE POLICY "Sistema pode inserir logs" ON feature_usage_logs 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuario ve proprio uso" ON feature_usage_logs;
CREATE POLICY "Usuario ve proprio uso" ON feature_usage_logs 
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para contar uso diário
CREATE OR REPLACE FUNCTION get_feature_usage_today(p_user_id UUID, p_feature_key TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM feature_usage_logs 
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND used_at >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar uso semanal
CREATE OR REPLACE FUNCTION get_feature_usage_week(p_user_id UUID, p_feature_key TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM feature_usage_logs 
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND used_at >= date_trunc('week', CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar uso mensal
CREATE OR REPLACE FUNCTION get_feature_usage_month(p_user_id UUID, p_feature_key TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM feature_usage_logs 
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND used_at >= date_trunc('month', CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função completa para verificar limite
CREATE OR REPLACE FUNCTION check_feature_limit(p_user_id UUID, p_feature_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_limits RECORD;
  v_usage_today INTEGER;
  v_usage_week INTEGER;
  v_usage_month INTEGER;
  v_allowed BOOLEAN := true;
  v_message TEXT := '';
  v_remaining INTEGER := 999;
BEGIN
  -- Buscar limites do usuário (considerando overrides)
  SELECT 
    COALESCE(ufo.limite_diario, fpf.limite_diario) as limite_diario,
    COALESCE(ufo.limite_semanal, fpf.limite_semanal) as limite_semanal,
    COALESCE(ufo.limite_mensal, fpf.limite_mensal) as limite_mensal,
    ufo.override_type
  INTO v_limits
  FROM user_subscriptions_core usc
  LEFT JOIN feature_profile_features fpf ON fpf.profile_id = usc.feature_profile_id AND fpf.feature_key = p_feature_key
  LEFT JOIN user_feature_overrides ufo ON ufo.user_id = p_user_id AND ufo.feature_key = p_feature_key AND ufo.ativo = true
  WHERE usc.user_id = p_user_id AND usc.status = 'active';

  -- Se não encontrou, usar free_v1
  IF v_limits IS NULL THEN
    SELECT fpf.limite_diario, fpf.limite_semanal, fpf.limite_mensal, NULL as override_type
    INTO v_limits
    FROM feature_profiles fp
    JOIN feature_profile_features fpf ON fpf.profile_id = fp.id AND fpf.feature_key = p_feature_key
    WHERE fp.profile_key = 'free_v1';
  END IF;

  -- Se override é revoke, negar
  IF v_limits.override_type = 'revoke' THEN
    RETURN jsonb_build_object('allowed', false, 'message', 'Feature revogada', 'remaining', 0);
  END IF;

  -- Contar uso
  v_usage_today := get_feature_usage_today(p_user_id, p_feature_key);
  v_usage_week := get_feature_usage_week(p_user_id, p_feature_key);
  v_usage_month := get_feature_usage_month(p_user_id, p_feature_key);

  -- Verificar limites
  IF v_limits.limite_diario IS NOT NULL AND v_usage_today >= v_limits.limite_diario THEN
    v_allowed := false;
    v_message := 'Limite diário atingido';
    v_remaining := 0;
  ELSIF v_limits.limite_semanal IS NOT NULL AND v_usage_week >= v_limits.limite_semanal THEN
    v_allowed := false;
    v_message := 'Limite semanal atingido';
    v_remaining := 0;
  ELSIF v_limits.limite_mensal IS NOT NULL AND v_usage_month >= v_limits.limite_mensal THEN
    v_allowed := false;
    v_message := 'Limite mensal atingido';
    v_remaining := 0;
  ELSE
    -- Calcular remaining
    IF v_limits.limite_diario IS NOT NULL THEN
      v_remaining := LEAST(v_remaining, v_limits.limite_diario - v_usage_today);
    END IF;
    IF v_limits.limite_semanal IS NOT NULL THEN
      v_remaining := LEAST(v_remaining, v_limits.limite_semanal - v_usage_week);
    END IF;
    IF v_limits.limite_mensal IS NOT NULL THEN
      v_remaining := LEAST(v_remaining, v_limits.limite_mensal - v_usage_month);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'message', v_message,
    'remaining', v_remaining,
    'usage_today', v_usage_today,
    'usage_week', v_usage_week,
    'usage_month', v_usage_month,
    'limite_diario', v_limits.limite_diario,
    'limite_semanal', v_limits.limite_semanal,
    'limite_mensal', v_limits.limite_mensal
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- LIMPEZA AUTOMÁTICA (opcional - rodar via cron)
-- ============================================================================

-- Função para limpar logs antigos (mais de 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_feature_usage_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM feature_usage_logs 
  WHERE used_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION feature_usage_logs CONCLUÍDA!' as status;
SELECT COUNT(*) as total_features FROM features;
