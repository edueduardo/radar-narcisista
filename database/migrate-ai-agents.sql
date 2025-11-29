-- Migração para criar tabelas do sistema de Mapa de IAs
-- Execute este script no Supabase SQL Editor para criar as tabelas

-- Tabela principal de IAs
CREATE TABLE IF NOT EXISTS ai_agents (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL, -- PRODUCT_CHAT, META_UX, META_COST, META_RISK, INFRA_TRANSCRIBE, etc.
  layer TEXT NOT NULL CHECK (layer IN ('produto', 'meta', 'infra')),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'local', 'together')),
  model TEXT NOT NULL,
  endpoint TEXT,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- 1=primária, 2=backup, 3=experimental
  features JSONB DEFAULT '[]', -- ["chat_usuario", "resumo_diario", "meta_insights"]
  scope_declared JSONB DEFAULT '[]', -- o que deveria fazer
  last_status TEXT DEFAULT 'HEALTHY' CHECK (last_status IN ('HEALTHY', 'DEGRADED', 'PARTIAL', 'DOWN')),
  last_status_reason TEXT,
  last_heartbeat_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas diárias por IA
CREATE TABLE IF NOT EXISTS ai_agent_metrics_daily (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calls_total INTEGER DEFAULT 0,
  calls_success INTEGER DEFAULT 0,
  calls_error INTEGER DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_estimated_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

-- Tabela de uso por feature (para detectar escopo não declarado)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
  feature_tag TEXT NOT NULL, -- "chat_usuario", "plano_7_dias", etc.
  route TEXT NOT NULL, -- "/api/ai/chat", "/api/voice/transcribe"
  success BOOLEAN DEFAULT true,
  latency_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(8,4) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de incidentes/status changes
CREATE TABLE IF NOT EXISTS ai_incidents (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sugestões da IA Guardiã
CREATE TABLE IF NOT EXISTS ai_guardian_suggestions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- "COST_OPTIMIZATION", "PERFORMANCE", "SCOPE_VIOLATION"
  agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
  suggestion TEXT NOT NULL,
  auto_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_layer ON ai_agents(layer);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_date ON ai_agent_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_agent_date ON ai_usage_logs(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_agent ON ai_incidents(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_dismissed ON ai_guardian_suggestions(dismissed_at);

-- Função para criar tabelas (chamada pela API se necessário)
CREATE OR REPLACE FUNCTION create_ai_agents_tables()
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Tenta criar as tabelas (se não existirem)
  BEGIN
    EXECUTE 'CREATE TABLE IF NOT EXISTS ai_agents (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      layer TEXT NOT NULL CHECK (layer IN (''produto'', ''meta'', ''infra'')),
      provider TEXT NOT NULL CHECK (provider IN (''openai'', ''anthropic'', ''local'', ''together'')),
      model TEXT NOT NULL,
      endpoint TEXT,
      active BOOLEAN DEFAULT true,
      priority INTEGER DEFAULT 1,
      features JSONB DEFAULT ''[]'',
      scope_declared JSONB DEFAULT ''[]'',
      last_status TEXT DEFAULT ''HEALTHY'' CHECK (last_status IN (''HEALTHY'', ''DEGRADED'', ''PARTIAL'', ''DOWN'')),
      last_status_reason TEXT,
      last_heartbeat_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS ai_agent_metrics_daily (
      id SERIAL PRIMARY KEY,
      agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      calls_total INTEGER DEFAULT 0,
      calls_success INTEGER DEFAULT 0,
      calls_error INTEGER DEFAULT 0,
      avg_latency_ms INTEGER DEFAULT 0,
      tokens_input INTEGER DEFAULT 0,
      tokens_output INTEGER DEFAULT 0,
      cost_estimated_usd DECIMAL(10,4) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(agent_id, date)
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS ai_usage_logs (
      id SERIAL PRIMARY KEY,
      agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
      feature_tag TEXT NOT NULL,
      route TEXT NOT NULL,
      success BOOLEAN DEFAULT true,
      latency_ms INTEGER,
      tokens_used INTEGER DEFAULT 0,
      cost_usd DECIMAL(8,4) DEFAULT 0,
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS ai_incidents (
      id SERIAL PRIMARY KEY,
      agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT,
      reason TEXT,
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS ai_guardian_suggestions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
      suggestion TEXT NOT NULL,
      auto_applied BOOLEAN DEFAULT false,
      applied_at TIMESTAMP WITH TIME ZONE,
      dismissed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    
    RETURN QUERY SELECT true, 'Tabelas criadas com sucesso'::TEXT;
    
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
  END;
END;
$$ LANGUAGE plpgsql;

-- Inserir dados de exemplo (opcional - pode remover depois)
INSERT INTO ai_agents (id, display_name, role, layer, provider, model, endpoint, active, priority, features, scope_declared, last_status, last_heartbeat_at) VALUES
('coach_clareza_v1', 'Coach de Clareza - v1', 'PRODUCT_CHAT', 'produto', 'openai', 'gpt-4o-mini', '/api/ai/chat', true, 1, '["chat_usuario", "sugerir_titulo_diario"]', '["chat_usuario"]', 'HEALTHY', NOW()),
('voice_transcribe_whisper_v1', 'Transcrição de Voz - Whisper', 'INFRA_TRANSCRIBE', 'infra', 'openai', 'whisper-1', '/api/voice/transcribe', true, 1, '["transcrever_audio"]', '["transcrever_audio"]', 'HEALTHY', NOW())
ON CONFLICT (id) DO NOTHING;

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_agents_updated_at ON ai_agents;
CREATE TRIGGER update_ai_agents_updated_at 
    BEFORE UPDATE ON ai_agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentário sobre as tabelas
COMMENT ON TABLE ai_agents IS 'Tabela principal para registro de todos os agentes de IA do sistema';
COMMENT ON TABLE ai_agent_metrics_daily IS 'Métricas diárias de performance e custo por IA';
COMMENT ON TABLE ai_usage_logs IS 'Logs detalhados de uso para detectar violações de escopo';
COMMENT ON TABLE ai_incidents IS 'Registro de incidentes e mudanças de status';
COMMENT ON TABLE ai_guardian_suggestions IS 'Sugestões automáticas da IA Guardiã de Operações';
