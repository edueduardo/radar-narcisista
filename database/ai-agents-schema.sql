-- Tabela principal de IAs
CREATE TABLE ai_agents (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL, -- PRODUCT_CHAT, META_UX, META_COST, META_RISK, INFRA_TRANSCRIBE, etc.
  layer TEXT NOT NULL CHECK (layer IN ('produto', 'meta', 'infra')),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'local', 'together')),
  model TEXT NOT NULL,
  endpoint TEXT, -- qual rota usa essa IA
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- 1=primária, 2=backup, 3=experimental
  features JSONB, -- ["chat_usuario", "resumo_diario", "meta_insights"]
  scope_declared JSONB, -- o que deveria fazer
  last_status TEXT DEFAULT 'HEALTHY' CHECK (last_status IN ('HEALTHY', 'DEGRADED', 'PARTIAL', 'DOWN')),
  last_status_reason TEXT,
  last_heartbeat_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de métricas diárias por IA
CREATE TABLE ai_agent_metrics_daily (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id),
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
CREATE TABLE ai_usage_logs (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id),
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
CREATE TABLE ai_incidents (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id),
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sugestões da IA Guardiã
CREATE TABLE ai_guardian_suggestions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- "COST_OPTIMIZATION", "PERFORMANCE", "SCOPE_VIOLATION"
  agent_id TEXT REFERENCES ai_agents(id),
  suggestion TEXT NOT NULL,
  auto_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ai_agents_active ON ai_agents(active);
CREATE INDEX idx_ai_agents_layer ON ai_agents(layer);
CREATE INDEX idx_ai_metrics_date ON ai_agent_metrics_daily(date);
CREATE INDEX idx_ai_usage_agent_date ON ai_usage_logs(agent_id, created_at);
CREATE INDEX idx_ai_incidents_agent ON ai_incidents(agent_id, created_at);
