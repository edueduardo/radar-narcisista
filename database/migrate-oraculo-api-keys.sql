-- ============================================================================
-- MIGRATION: ORÁCULO API KEYS
-- ETAPA 36 - Sistema de API Keys para Whitelabel
-- ============================================================================
-- Executar no Supabase SQL Editor
-- ============================================================================

-- Tabela de API Keys
CREATE TABLE IF NOT EXISTS oraculo_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Identificação
  key_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  key_prefix VARCHAR(12) NOT NULL, -- Primeiros caracteres para identificação
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  
  -- Permissões
  permissions JSONB DEFAULT '{"read": true, "write": true}'::jsonb,
  allowed_roles TEXT[] DEFAULT ARRAY['usuaria', 'profissional'],
  
  -- Limites
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 1000,
  
  -- Uso
  total_requests INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Expiração
  expires_at TIMESTAMPTZ,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_keys_instance ON oraculo_api_keys(instance_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON oraculo_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON oraculo_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON oraculo_api_keys(key_prefix);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_api_keys_updated_at ON oraculo_api_keys;
CREATE TRIGGER trigger_api_keys_updated_at
  BEFORE UPDATE ON oraculo_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();

-- Tabela de logs de uso de API keys
CREATE TABLE IF NOT EXISTS oraculo_api_key_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES oraculo_api_keys(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  
  -- Request
  request_ip VARCHAR(45),
  request_origin VARCHAR(255),
  user_role VARCHAR(50),
  
  -- Response
  status_code INTEGER,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_api_key_logs_key ON oraculo_api_key_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_logs_instance ON oraculo_api_key_logs(instance_id);
CREATE INDEX IF NOT EXISTS idx_api_key_logs_created ON oraculo_api_key_logs(created_at);

-- RLS
ALTER TABLE oraculo_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_api_key_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admins podem gerenciar
CREATE POLICY "Admins podem gerenciar API keys" ON oraculo_api_keys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins podem ver logs de API keys" ON oraculo_api_key_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Função para gerar API key segura
CREATE OR REPLACE FUNCTION generate_api_key(p_instance_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
  v_random TEXT;
BEGIN
  -- Gerar parte aleatória (32 bytes = 64 hex chars)
  v_random := encode(gen_random_bytes(32), 'hex');
  
  -- Formato: {slug}_sk_{random}
  v_key := p_instance_slug || '_sk_' || v_random;
  
  RETURN v_key;
END;
$$ LANGUAGE plpgsql;

-- Função para validar API key
CREATE OR REPLACE FUNCTION validate_api_key(p_api_key TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  instance_id UUID,
  instance_slug TEXT,
  key_name TEXT,
  permissions JSONB,
  allowed_roles TEXT[],
  rate_limit_per_minute INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_key_record RECORD;
BEGIN
  -- Buscar key
  SELECT k.*, i.instance_slug
  INTO v_key_record
  FROM oraculo_api_keys k
  JOIN oraculo_instances i ON i.id = k.instance_id
  WHERE k.api_key = p_api_key;
  
  -- Key não encontrada
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, 
      NULL::JSONB, NULL::TEXT[], NULL::INTEGER,
      'API key inválida'::TEXT;
    RETURN;
  END IF;
  
  -- Key revogada
  IF v_key_record.status = 'revoked' THEN
    RETURN QUERY SELECT 
      FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT,
      NULL::JSONB, NULL::TEXT[], NULL::INTEGER,
      'API key revogada'::TEXT;
    RETURN;
  END IF;
  
  -- Key expirada
  IF v_key_record.expires_at IS NOT NULL AND v_key_record.expires_at < NOW() THEN
    -- Atualizar status para expired
    UPDATE oraculo_api_keys SET status = 'expired' WHERE id = v_key_record.id;
    
    RETURN QUERY SELECT 
      FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT,
      NULL::JSONB, NULL::TEXT[], NULL::INTEGER,
      'API key expirada'::TEXT;
    RETURN;
  END IF;
  
  -- Instância inativa
  IF v_key_record.status != 'active' THEN
    RETURN QUERY SELECT 
      FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT,
      NULL::JSONB, NULL::TEXT[], NULL::INTEGER,
      'Instância inativa'::TEXT;
    RETURN;
  END IF;
  
  -- Atualizar último uso
  UPDATE oraculo_api_keys 
  SET 
    last_used_at = NOW(),
    total_requests = total_requests + 1
  WHERE id = v_key_record.id;
  
  -- Retornar sucesso
  RETURN QUERY SELECT 
    TRUE,
    v_key_record.instance_id,
    v_key_record.instance_slug,
    v_key_record.key_name,
    v_key_record.permissions,
    v_key_record.allowed_roles,
    v_key_record.rate_limit_per_minute,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE oraculo_api_keys IS 'API keys para acesso ao Oráculo por instâncias whitelabel';
COMMENT ON TABLE oraculo_api_key_logs IS 'Logs de uso das API keys';
COMMENT ON FUNCTION generate_api_key IS 'Gera uma API key segura para uma instância';
COMMENT ON FUNCTION validate_api_key IS 'Valida uma API key e retorna informações da instância';
