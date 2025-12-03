-- ============================================================================
-- RADAR NARCISISTA - MEGA SQL PARTE 2
-- AI + CONTENT + BETA + CONTROL TOWER + TELEMETRY + HELPDESK
-- Data: 03/12/2025
-- ============================================================================
-- INSTRUÇÕES: Cole no Supabase SQL Editor e clique Run
-- IMPORTANTE: Execute DEPOIS da PARTE 1
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: WAITLIST
-- ============================================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'profissional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  metadata JSONB
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_source ON waitlist(email, source);

-- ============================================================================
-- SEÇÃO 2: DOCUMENT HASHES
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  sha256_hash TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_hashes_user_id ON document_hashes(user_id);

-- ============================================================================
-- SEÇÃO 3: FUTURE LETTERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS future_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  delivery_email TEXT,
  delivery_days INTEGER DEFAULT 30,
  scheduled_for TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  is_delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_future_letters_user_id ON future_letters(user_id);

-- ============================================================================
-- SEÇÃO 4: MIRROR REFLECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mirror_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  situation TEXT NOT NULL,
  advice TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mirror_reflections_user_id ON mirror_reflections(user_id);

-- ============================================================================
-- SEÇÃO 5: DIARY ANALYSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS diary_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL,
  user_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  impact_level TEXT NOT NULL DEFAULT 'medio',
  main_problems TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  summary TEXT,
  recommendations TEXT,
  ai_raw JSONB,
  ai_models_used TEXT[] DEFAULT '{}',
  consensus_level INTEGER DEFAULT 0,
  UNIQUE(entry_id, version)
);
CREATE INDEX IF NOT EXISTS idx_diary_analyses_user_id ON diary_analyses(user_id);

-- ============================================================================
-- SEÇÃO 6: ANALYSIS SNAPSHOTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  origin TEXT NOT NULL,
  origin_ref_id UUID,
  score NUMERIC(5,2) NOT NULL,
  problem_tags TEXT[] DEFAULT '{}',
  emotions TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  evolution_comment TEXT,
  message_content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_user_id ON analysis_snapshots(user_id);

-- ============================================================================
-- SEÇÃO 7: AI AGENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  layer TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  endpoint TEXT,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]',
  scope_declared JSONB DEFAULT '[]',
  last_status TEXT DEFAULT 'HEALTHY',
  last_status_reason TEXT,
  last_heartbeat_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES ai_agents(id) ON DELETE CASCADE,
  feature_tag TEXT NOT NULL,
  route TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  latency_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(8,4) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(active);

-- ============================================================================
-- SEÇÃO 8: AI FLOWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  mode_default TEXT NOT NULL DEFAULT 'simulation',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_flow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES ai_flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  subtype TEXT NOT NULL,
  ai_agent_id UUID,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_flow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES ai_flows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL,
  source_handle TEXT NOT NULL,
  target_node_id UUID NOT NULL,
  target_handle TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_flow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES ai_flows(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  triggered_by_event JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB
);

CREATE INDEX IF NOT EXISTS idx_ai_flows_active ON ai_flows(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_flow_nodes_flow ON ai_flow_nodes(flow_id);

-- ============================================================================
-- SEÇÃO 9: CONTROL TOWER
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome_publico TEXT NOT NULL,
  tipo_projeto TEXT NOT NULL DEFAULT 'nucleo',
  parent_project_id UUID REFERENCES projects_core(id),
  url_publica TEXT,
  url_admin TEXT,
  status TEXT DEFAULT 'ativo',
  vinculo_nucleo TEXT DEFAULT 'independente',
  politica_suporte TEXT DEFAULT 'proprio',
  versao TEXT,
  descricao TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS owners_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects_core(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects_core(slug);

-- ============================================================================
-- SEÇÃO 10: TELEMETRY
-- ============================================================================
CREATE TABLE IF NOT EXISTS telemetry_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_core(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  status TEXT DEFAULT 'healthy',
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_core(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_core(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_unit TEXT,
  tags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_project ON telemetry_heartbeats(project_id);
CREATE INDEX IF NOT EXISTS idx_errors_project ON telemetry_errors(project_id);
CREATE INDEX IF NOT EXISTS idx_metrics_project ON telemetry_metrics(project_id);

-- ============================================================================
-- SEÇÃO 11: HELPDESK
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_slug TEXT DEFAULT 'radar-narcisista',
  assunto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT DEFAULT 'geral',
  prioridade TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'aberto',
  atribuido_a UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mensagem TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);

-- ============================================================================
-- SEÇÃO 12: USER ADDONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_key TEXT NOT NULL,
  addon_name TEXT NOT NULL,
  tipo TEXT DEFAULT 'credito',
  quantidade INTEGER DEFAULT 1,
  credits_remaining INTEGER,
  status TEXT DEFAULT 'active',
  stripe_payment_id TEXT,
  preco_centavos INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addons_user ON user_addons(user_id);

-- ============================================================================
-- SEÇÃO 13: FRONTPAGE CONFIG
-- ============================================================================
CREATE TABLE IF NOT EXISTS frontpage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frontpage_key ON frontpage_config(config_key);

-- ============================================================================
-- SEÇÃO 14: IMPERSONATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  target_user_id UUID NOT NULL,
  target_user_email TEXT NOT NULL,
  target_user_role TEXT NOT NULL,
  motivo TEXT NOT NULL,
  ticket_id UUID,
  ip_admin TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim TIMESTAMPTZ,
  duracao_segundos INTEGER,
  acoes_realizadas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES support_impersonation_sessions(id) ON DELETE CASCADE,
  tipo_acao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  url TEXT,
  metodo TEXT,
  dados_resumidos JSONB DEFAULT '{}',
  sucesso BOOLEAN DEFAULT true,
  erro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON support_impersonation_sessions(admin_id);

-- ============================================================================
-- SEÇÃO 15: BETA TESTERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL,
  page_path TEXT,
  feature_used TEXT,
  message TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  admin_notes TEXT
);

CREATE TABLE IF NOT EXISTS beta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_events_type ON beta_events(event_type);

-- ============================================================================
-- SEÇÃO 16: SAFETY PLANS & RISK ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  titulo TEXT DEFAULT 'Meu Plano de Segurança',
  contatos_emergencia JSONB DEFAULT '[]',
  sinais_alerta TEXT[] DEFAULT '{}',
  estrategias_coping TEXT[] DEFAULT '{}',
  lugares_seguros TEXT[] DEFAULT '{}',
  itens_importantes TEXT[] DEFAULT '{}',
  notas TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  nivel TEXT NOT NULL DEFAULT 'medio',
  origem TEXT NOT NULL,
  origem_id UUID,
  mensagem TEXT NOT NULL,
  dados JSONB DEFAULT '{}',
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_plans_user ON safety_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_user ON risk_alerts(user_id);

-- ============================================================================
-- SEÇÃO 17: RLS - HABILITAR
-- ============================================================================
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE frontpage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_impersonation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEÇÃO 18: POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can insert waitlist" ON waitlist;
CREATE POLICY "Anyone can insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own letters" ON future_letters;
CREATE POLICY "Users can view own letters" ON future_letters FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own letters" ON future_letters;
CREATE POLICY "Users can insert own letters" ON future_letters FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own reflections" ON mirror_reflections;
CREATE POLICY "Users can view own reflections" ON mirror_reflections FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own reflections" ON mirror_reflections;
CREATE POLICY "Users can insert own reflections" ON mirror_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "diary_analyses_select_own" ON diary_analyses;
CREATE POLICY "diary_analyses_select_own" ON diary_analyses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own snapshots" ON analysis_snapshots;
CREATE POLICY "Users can view own snapshots" ON analysis_snapshots FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario ve proprios tickets" ON support_tickets;
CREATE POLICY "Usuario ve proprios tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuario cria tickets" ON support_tickets;
CREATE POLICY "Usuario cria tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuario ve proprios addons" ON user_addons;
CREATE POLICY "Usuario ve proprios addons" ON user_addons FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Todos podem ver config publica" ON frontpage_config;
CREATE POLICY "Todos podem ver config publica" ON frontpage_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sistema pode inserir heartbeats" ON telemetry_heartbeats;
CREATE POLICY "Sistema pode inserir heartbeats" ON telemetry_heartbeats FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Sistema pode inserir errors" ON telemetry_errors;
CREATE POLICY "Sistema pode inserir errors" ON telemetry_errors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Sistema pode inserir metrics" ON telemetry_metrics;
CREATE POLICY "Sistema pode inserir metrics" ON telemetry_metrics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "beta_events_insert_authenticated" ON beta_events;
CREATE POLICY "beta_events_insert_authenticated" ON beta_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own safety plans" ON safety_plans;
CREATE POLICY "Users can view own safety plans" ON safety_plans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own safety plans" ON safety_plans;
CREATE POLICY "Users can manage own safety plans" ON safety_plans FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own risk alerts" ON risk_alerts;
CREATE POLICY "Users can view own risk alerts" ON risk_alerts FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT '✅ PARTE 2 CONCLUÍDA COM SUCESSO!' as status;

SELECT 'Tabelas criadas:' as info, COUNT(*) as total FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
