-- ============================================================================
-- MIGRATION: ORÁCULO WEBHOOKS
-- ETAPA 37 - Sistema de Webhooks para Eventos
-- ============================================================================
-- Executar no Supabase SQL Editor
-- ============================================================================

-- Tabela de Webhooks
CREATE TABLE IF NOT EXISTS oraculo_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Configuração
  webhook_name VARCHAR(100) NOT NULL,
  webhook_url VARCHAR(500) NOT NULL,
  secret_key VARCHAR(64), -- Para assinatura HMAC
  
  -- Eventos
  events TEXT[] DEFAULT ARRAY['oraculo.query']::TEXT[],
  -- Eventos disponíveis:
  -- oraculo.query - Quando uma pergunta é feita
  -- oraculo.response - Quando uma resposta é gerada
  -- oraculo.error - Quando ocorre um erro
  -- oraculo.limit_reached - Quando limite é atingido
  -- instance.updated - Quando instância é atualizada
  -- apikey.created - Quando API key é criada
  -- apikey.revoked - Quando API key é revogada
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
  
  -- Configurações de retry
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Headers customizados
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Estatísticas
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_error TEXT,
  consecutive_failures INTEGER DEFAULT 0,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhooks_instance ON oraculo_webhooks(instance_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON oraculo_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON oraculo_webhooks USING GIN(events);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_webhooks_updated_at ON oraculo_webhooks;
CREATE TRIGGER trigger_webhooks_updated_at
  BEFORE UPDATE ON oraculo_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Tabela de logs de entregas de webhook
CREATE TABLE IF NOT EXISTS oraculo_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES oraculo_webhooks(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Evento
  event_type VARCHAR(50) NOT NULL,
  event_id VARCHAR(64) NOT NULL, -- ID único do evento
  payload JSONB NOT NULL,
  
  -- Resposta
  status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Status
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'success', 'failed', 'retrying')),
  attempt_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Índices para deliveries
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON oraculo_webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_instance ON oraculo_webhook_deliveries(instance_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON oraculo_webhook_deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON oraculo_webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON oraculo_webhook_deliveries(created_at);

-- RLS
ALTER TABLE oraculo_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admins podem gerenciar
CREATE POLICY "Admins podem gerenciar webhooks" ON oraculo_webhooks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins podem ver deliveries" ON oraculo_webhook_deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Função para gerar secret key
CREATE OR REPLACE FUNCTION generate_webhook_secret()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE oraculo_webhooks IS 'Webhooks configurados para instâncias do Oráculo';
COMMENT ON TABLE oraculo_webhook_deliveries IS 'Logs de entregas de webhooks';
COMMENT ON FUNCTION generate_webhook_secret IS 'Gera uma chave secreta para assinatura de webhooks';
