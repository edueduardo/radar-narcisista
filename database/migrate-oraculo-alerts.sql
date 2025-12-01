-- =====================================================
-- MIGRATION: Sistema de Alertas do Oráculo
-- ETAPA 43 - Alertas Automáticos
-- =====================================================

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS oraculo_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Tipo e severidade
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'quota_warning',
    'quota_exceeded', 
    'error_spike',
    'latency_high',
    'api_key_expiring',
    'billing_issue',
    'instance_inactive',
    'webhook_failing'
  )),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_oraculo_alerts_instance ON oraculo_alerts(instance_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_alerts_type ON oraculo_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_oraculo_alerts_severity ON oraculo_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_oraculo_alerts_unread ON oraculo_alerts(instance_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_oraculo_alerts_unresolved ON oraculo_alerts(instance_id, is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_oraculo_alerts_created ON oraculo_alerts(created_at DESC);

-- Tabela de regras de alerta (configuração por instância)
CREATE TABLE IF NOT EXISTS oraculo_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Configuração
  alert_type TEXT NOT NULL,
  threshold NUMERIC NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Notificações
  notification_email TEXT,
  notification_webhook TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(instance_id, alert_type)
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_oraculo_alert_rules_instance ON oraculo_alert_rules(instance_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_oraculo_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_oraculo_alerts_updated_at ON oraculo_alerts;
CREATE TRIGGER trigger_oraculo_alerts_updated_at
  BEFORE UPDATE ON oraculo_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_oraculo_alerts_updated_at();

DROP TRIGGER IF EXISTS trigger_oraculo_alert_rules_updated_at ON oraculo_alert_rules;
CREATE TRIGGER trigger_oraculo_alert_rules_updated_at
  BEFORE UPDATE ON oraculo_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_oraculo_alerts_updated_at();

-- RLS
ALTER TABLE oraculo_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_alert_rules ENABLE ROW LEVEL SECURITY;

-- Policies para alertas
DROP POLICY IF EXISTS "Admins podem ver todos os alertas" ON oraculo_alerts;
CREATE POLICY "Admins podem ver todos os alertas" ON oraculo_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Sistema pode criar alertas" ON oraculo_alerts;
CREATE POLICY "Sistema pode criar alertas" ON oraculo_alerts
  FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins podem atualizar alertas" ON oraculo_alerts;
CREATE POLICY "Admins podem atualizar alertas" ON oraculo_alerts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Policies para regras
DROP POLICY IF EXISTS "Admins podem gerenciar regras" ON oraculo_alert_rules;
CREATE POLICY "Admins podem gerenciar regras" ON oraculo_alert_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- View para resumo de alertas por instância
CREATE OR REPLACE VIEW oraculo_alerts_summary AS
SELECT 
  instance_id,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE is_resolved = FALSE) as unresolved_count,
  COUNT(*) FILTER (WHERE severity = 'critical' AND is_resolved = FALSE) as critical_count,
  COUNT(*) FILTER (WHERE severity = 'error' AND is_resolved = FALSE) as error_count,
  COUNT(*) FILTER (WHERE severity = 'warning' AND is_resolved = FALSE) as warning_count,
  MAX(created_at) as last_alert_at
FROM oraculo_alerts
GROUP BY instance_id;

-- Função para limpar alertas antigos resolvidos (> 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM oraculo_alerts
  WHERE is_resolved = TRUE
  AND resolved_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE oraculo_alerts IS 'Alertas automáticos do sistema Oráculo';
COMMENT ON TABLE oraculo_alert_rules IS 'Regras de configuração de alertas por instância';
COMMENT ON VIEW oraculo_alerts_summary IS 'Resumo de alertas por instância';
