-- ============================================================================
-- MIGRATION: ORÁCULO USAGE LOGS
-- ETAPA 39 - Logs Detalhados de Uso
-- ============================================================================
-- Executar no Supabase SQL Editor
-- ============================================================================

-- Tabela de Logs de Uso
CREATE TABLE IF NOT EXISTS oraculo_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Identificação da requisição
  request_id VARCHAR(64) NOT NULL,
  api_key_id UUID REFERENCES oraculo_api_keys(id) ON DELETE SET NULL,
  
  -- Dados da requisição
  user_role VARCHAR(50),
  question TEXT,
  question_length INTEGER,
  
  -- Dados da resposta
  response_text TEXT,
  response_length INTEGER,
  
  -- Métricas
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  
  -- Custo estimado
  cost_cents DECIMAL(10,4) DEFAULT 0,
  
  -- Modelo usado
  model_used VARCHAR(50),
  temperature DECIMAL(3,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited', 'quota_exceeded')),
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Origem
  origin_domain VARCHAR(255),
  origin_ip VARCHAR(45),
  user_agent TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_instance ON oraculo_usage_logs(instance_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key ON oraculo_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON oraculo_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON oraculo_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_request ON oraculo_usage_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_instance_date ON oraculo_usage_logs(instance_id, created_at DESC);

-- Índice para busca por período
CREATE INDEX IF NOT EXISTS idx_usage_logs_period ON oraculo_usage_logs(instance_id, created_at) 
  WHERE created_at > NOW() - INTERVAL '30 days';

-- View para estatísticas agregadas por dia
CREATE OR REPLACE VIEW oraculo_usage_stats_daily AS
SELECT 
  instance_id,
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
  COUNT(*) FILTER (WHERE status = 'error') as failed_requests,
  COUNT(*) FILTER (WHERE status = 'rate_limited') as rate_limited_requests,
  SUM(tokens_total) as total_tokens,
  SUM(cost_cents) as total_cost_cents,
  AVG(response_time_ms)::INTEGER as avg_response_time_ms,
  AVG(tokens_total)::INTEGER as avg_tokens_per_request
FROM oraculo_usage_logs
GROUP BY instance_id, DATE(created_at);

-- View para estatísticas por API key
CREATE OR REPLACE VIEW oraculo_usage_stats_by_key AS
SELECT 
  instance_id,
  api_key_id,
  COUNT(*) as total_requests,
  SUM(tokens_total) as total_tokens,
  SUM(cost_cents) as total_cost_cents,
  MAX(created_at) as last_used_at
FROM oraculo_usage_logs
WHERE api_key_id IS NOT NULL
GROUP BY instance_id, api_key_id;

-- Função para limpar logs antigos (manter últimos 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM oraculo_usage_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular custo estimado
CREATE OR REPLACE FUNCTION calculate_token_cost(
  p_tokens_input INTEGER,
  p_tokens_output INTEGER,
  p_model VARCHAR
)
RETURNS DECIMAL AS $$
DECLARE
  input_cost DECIMAL;
  output_cost DECIMAL;
BEGIN
  -- Preços aproximados por 1M tokens (em centavos)
  -- GPT-4: $30 input, $60 output
  -- GPT-3.5: $0.50 input, $1.50 output
  
  IF p_model LIKE 'gpt-4%' THEN
    input_cost := (p_tokens_input / 1000000.0) * 3000;
    output_cost := (p_tokens_output / 1000000.0) * 6000;
  ELSE
    input_cost := (p_tokens_input / 1000000.0) * 50;
    output_cost := (p_tokens_output / 1000000.0) * 150;
  END IF;
  
  RETURN input_cost + output_cost;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE oraculo_usage_logs ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver logs
CREATE POLICY "Admins podem ver logs" ON oraculo_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Política: sistema pode inserir logs
CREATE POLICY "Sistema pode inserir logs" ON oraculo_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE oraculo_usage_logs IS 'Logs detalhados de uso do Oráculo por instância';
COMMENT ON VIEW oraculo_usage_stats_daily IS 'Estatísticas agregadas por dia';
COMMENT ON VIEW oraculo_usage_stats_by_key IS 'Estatísticas agregadas por API key';
COMMENT ON FUNCTION cleanup_old_usage_logs IS 'Remove logs com mais de 90 dias';
COMMENT ON FUNCTION calculate_token_cost IS 'Calcula custo estimado baseado em tokens';
