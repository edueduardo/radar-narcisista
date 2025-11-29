-- =============================================
-- MIGRAÇÃO COMPLETA: AI Flow Orchestrator
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. Tabela principal de fluxos
CREATE TABLE IF NOT EXISTS ai_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  mode_default TEXT DEFAULT 'simulation',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  review_status TEXT DEFAULT 'draft' CHECK (review_status IN ('draft', 'in_validation', 'approved', 'rejected')),
  validation_window_days INTEGER,
  validation_started_at TIMESTAMPTZ,
  validation_ends_at TIMESTAMPTZ,
  simulation_only BOOLEAN DEFAULT true
);

-- 2. Tabela de nós do fluxo
CREATE TABLE IF NOT EXISTS ai_flow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES ai_flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('TRIGGER', 'IA', 'ACTION')),
  subtype TEXT NOT NULL,
  ai_agent_id TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de conexões entre nós
CREATE TABLE IF NOT EXISTS ai_flow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES ai_flows(id) ON DELETE CASCADE,
  source_node_id UUID REFERENCES ai_flow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES ai_flow_nodes(id) ON DELETE CASCADE,
  source_handle TEXT DEFAULT 'output',
  target_handle TEXT DEFAULT 'input',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de execuções
CREATE TABLE IF NOT EXISTS ai_flow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES ai_flows(id) ON DELETE CASCADE,
  mode TEXT DEFAULT 'simulation' CHECK (mode IN ('simulation', 'real')),
  triggered_by_event JSONB,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'ERROR')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de logs de execução
CREATE TABLE IF NOT EXISTS ai_flow_run_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES ai_flow_runs(id) ON DELETE CASCADE,
  node_id UUID,
  level TEXT DEFAULT 'INFO' CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
  message TEXT,
  data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de templates
CREATE TABLE IF NOT EXISTS ai_flow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  definition JSONB DEFAULT '{}',
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de sugestões
CREATE TABLE IF NOT EXISTS ai_flow_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES ai_flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IMPROVEMENT', 'RISK', 'NEW_FLOW_IDEA')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACCEPTED', 'REJECTED', 'DONE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de versões de fluxo
CREATE TABLE IF NOT EXISTS ai_flow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES ai_flows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_flow_nodes_flow_id ON ai_flow_nodes(flow_id);
CREATE INDEX IF NOT EXISTS idx_ai_flow_edges_flow_id ON ai_flow_edges(flow_id);
CREATE INDEX IF NOT EXISTS idx_ai_flow_runs_flow_id ON ai_flow_runs(flow_id);
CREATE INDEX IF NOT EXISTS idx_ai_flow_runs_status ON ai_flow_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_flow_run_logs_run_id ON ai_flow_run_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_flow_suggestions_flow_id ON ai_flow_suggestions(flow_id);
CREATE INDEX IF NOT EXISTS idx_ai_flow_versions_flow_id ON ai_flow_versions(flow_id);

-- Inserir templates oficiais de exemplo
INSERT INTO ai_flow_templates (name, description, category, is_official, definition)
VALUES 
  ('Fluxo de Risco Padrão', 'Detecta padrões de risco em episódios do diário', 'Risco', true, '{"nodes": [], "edges": []}'),
  ('Fluxo de Resumo Semanal', 'Gera resumo semanal automático do diário', 'Relatório', true, '{"nodes": [], "edges": []}'),
  ('Fluxo de Alerta Emergência', 'Aciona alerta quando botão de emergência é pressionado', 'Emergência', true, '{"nodes": [], "edges": []}')
ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
SELECT 'Migração completa executada com sucesso!' as status;
