-- ============================================================================
-- MIGRATION: analytics_events
-- BLOCO 41-45 - ETAPA 45: Analytics Avançado
-- Data: 03/12/2025
-- ============================================================================

-- Tabela para armazenar eventos de analytics (provider: custom)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID,
  properties JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON analytics_events(event_name, created_at DESC);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Sistema pode inserir eventos" ON analytics_events;
CREATE POLICY "Sistema pode inserir eventos" ON analytics_events 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode ver todos eventos" ON analytics_events;
CREATE POLICY "Admin pode ver todos eventos" ON analytics_events 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- VIEWS PARA DASHBOARD DE ANALYTICS
-- ============================================================================

-- View: Eventos por dia
CREATE OR REPLACE VIEW analytics_events_daily AS
SELECT 
  DATE(created_at) as date,
  event_name,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_name
ORDER BY date DESC, count DESC;

-- View: Top eventos
CREATE OR REPLACE VIEW analytics_top_events AS
SELECT 
  event_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24_hours
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY total_count DESC
LIMIT 20;

-- View: Usuários ativos
CREATE OR REPLACE VIEW analytics_active_users AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as daily_active_users
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND user_id IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função: Obter métricas de um evento
CREATE OR REPLACE FUNCTION get_event_metrics(p_event_name TEXT, p_days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'event_name', p_event_name,
    'total_count', COUNT(*),
    'unique_users', COUNT(DISTINCT user_id),
    'avg_per_day', ROUND(COUNT(*)::NUMERIC / p_days, 2),
    'first_occurrence', MIN(created_at),
    'last_occurrence', MAX(created_at)
  )
  INTO v_result
  FROM analytics_events
  WHERE event_name = p_event_name
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Obter funil de conversão
CREATE OR REPLACE FUNCTION get_conversion_funnel(p_events TEXT[], p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  step_number INTEGER,
  event_name TEXT,
  user_count BIGINT,
  conversion_rate NUMERIC
) AS $$
DECLARE
  v_first_step_count BIGINT;
BEGIN
  -- Contar primeiro passo
  SELECT COUNT(DISTINCT user_id)
  INTO v_first_step_count
  FROM analytics_events
  WHERE event_name = p_events[1]
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    row_number() OVER ()::INTEGER as step_number,
    e.event_name,
    COUNT(DISTINCT ae.user_id) as user_count,
    CASE 
      WHEN v_first_step_count > 0 
      THEN ROUND((COUNT(DISTINCT ae.user_id)::NUMERIC / v_first_step_count) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM unnest(p_events) WITH ORDINALITY AS e(event_name, ord)
  LEFT JOIN analytics_events ae ON ae.event_name = e.event_name
    AND ae.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY e.event_name, e.ord
  ORDER BY e.ord;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION analytics_events CONCLUÍDA!' as status;
