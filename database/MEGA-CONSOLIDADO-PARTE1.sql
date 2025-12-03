-- ============================================================================
-- RADAR NARCISISTA - MEGA CONSOLIDADO PARTE 1
-- TODAS AS TABELAS BASE + ORÁCULO + PLANOS
-- Data: 03/12/2025
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
CREATE INDEX IF NOT EXISTS idx_waitlist_source ON waitlist(source);

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
CREATE INDEX IF NOT EXISTS idx_document_hashes_sha256 ON document_hashes(sha256_hash);

-- ============================================================================
-- SEÇÃO 3: FUTURE LETTERS (Cartas para o Futuro)
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
CREATE INDEX IF NOT EXISTS idx_future_letters_scheduled ON future_letters(scheduled_for) WHERE NOT is_delivered;

-- ============================================================================
-- SEÇÃO 4: MIRROR REFLECTIONS (Modo Espelho)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mirror_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  situation TEXT NOT NULL,
  advice TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mirror_reflections_user_id ON mirror_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_mirror_reflections_created ON mirror_reflections(created_at DESC);

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
CREATE INDEX IF NOT EXISTS idx_diary_analyses_entry_id ON diary_analyses(entry_id);
CREATE INDEX IF NOT EXISTS idx_diary_analyses_user_id ON diary_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_analyses_created_at ON diary_analyses(created_at DESC);

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
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_origin ON analysis_snapshots(origin);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_created_at ON analysis_snapshots(created_at DESC);

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
CREATE INDEX IF NOT EXISTS idx_ai_metrics_agent ON ai_agent_metrics_daily(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_agent ON ai_usage_logs(agent_id);

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
CREATE INDEX IF NOT EXISTS idx_ai_flow_edges_flow ON ai_flow_edges(flow_id);
CREATE INDEX IF NOT EXISTS idx_ai_flow_runs_flow ON ai_flow_runs(flow_id);

-- ============================================================================
-- SEÇÃO 9: ORÁCULO
-- ============================================================================
CREATE TABLE IF NOT EXISTS oraculo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'admin',
  modelo TEXT DEFAULT 'gpt-4o-mini',
  temperatura DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  prompt_sistema TEXT,
  prompt_contexto TEXT,
  ativo BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, perfil)
);

CREATE TABLE IF NOT EXISTS oraculo_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  dominio_permitido TEXT,
  tema TEXT DEFAULT 'default',
  cor_primaria TEXT DEFAULT '#8B5CF6',
  logo_url TEXT,
  modelo TEXT DEFAULT 'gpt-4o-mini',
  temperatura DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  prompt_sistema TEXT,
  prompt_contexto TEXT,
  ativo BOOLEAN DEFAULT true,
  publico BOOLEAN DEFAULT false,
  limite_requests_dia INTEGER DEFAULT 100,
  limite_requests_mes INTEGER DEFAULT 3000,
  requests_hoje INTEGER DEFAULT 0,
  requests_mes INTEGER DEFAULT 0,
  ultimo_reset_diario TIMESTAMPTZ DEFAULT NOW(),
  ultimo_reset_mensal TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oraculo_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissoes TEXT[] DEFAULT ARRAY['chat'],
  ativo BOOLEAN DEFAULT true,
  ultimo_uso TIMESTAMPTZ,
  requests_total INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oraculo_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  eventos TEXT[] DEFAULT ARRAY['chat.completed'],
  secret TEXT,
  ativo BOOLEAN DEFAULT true,
  ultimo_disparo TIMESTAMPTZ,
  falhas_consecutivas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oraculo_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  plano TEXT DEFAULT 'free',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active',
  periodo_inicio TIMESTAMPTZ DEFAULT NOW(),
  periodo_fim TIMESTAMPTZ,
  limite_requests INTEGER DEFAULT 100,
  preco_centavos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oraculo_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  request_id VARCHAR(64) NOT NULL,
  api_key_id UUID REFERENCES oraculo_api_keys(id) ON DELETE SET NULL,
  user_role VARCHAR(50),
  question TEXT,
  question_length INTEGER,
  response_text TEXT,
  response_length INTEGER,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  cost_cents DECIMAL(10,4) DEFAULT 0,
  model_used VARCHAR(50),
  temperature DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  error_code VARCHAR(50),
  origin_domain VARCHAR(255),
  origin_ip VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oraculo_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  severidade TEXT DEFAULT 'warning',
  titulo TEXT NOT NULL,
  mensagem TEXT,
  dados JSONB DEFAULT '{}'::jsonb,
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oraculo_settings_user ON oraculo_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_instances_owner ON oraculo_instances(owner_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_instances_slug ON oraculo_instances(slug);
CREATE INDEX IF NOT EXISTS idx_api_keys_instance ON oraculo_api_keys(instance_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON oraculo_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_webhooks_instance ON oraculo_webhooks(instance_id);
CREATE INDEX IF NOT EXISTS idx_billing_instance ON oraculo_billing(instance_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_instance ON oraculo_usage_logs(instance_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON oraculo_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_instance ON oraculo_alerts(instance_id);

-- ============================================================================
-- SEÇÃO 10: CONTROL TOWER
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
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects_core(status);
CREATE INDEX IF NOT EXISTS idx_owners_project ON owners_core(project_id);

-- ============================================================================
-- SEÇÃO 11: TELEMETRY
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
CREATE INDEX IF NOT EXISTS idx_heartbeats_created ON telemetry_heartbeats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errors_project ON telemetry_errors(project_id);
CREATE INDEX IF NOT EXISTS idx_metrics_project ON telemetry_metrics(project_id);

-- ============================================================================
-- SEÇÃO 12: HELPDESK
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
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON support_ticket_messages(ticket_id);

-- ============================================================================
-- SEÇÃO 13: USER ADDONS
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
CREATE INDEX IF NOT EXISTS idx_addons_key ON user_addons(addon_key);

-- ============================================================================
-- SEÇÃO 14: FRONTPAGE CONFIG
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
-- SEÇÃO 15: IMPERSONATION
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
CREATE INDEX IF NOT EXISTS idx_impersonation_target ON support_impersonation_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_status ON support_impersonation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_session ON support_impersonation_logs(session_id);

-- ============================================================================
-- SEÇÃO 16: PLANOS_CORE - FEATURES
-- ============================================================================
DROP TABLE IF EXISTS plan_catalog CASCADE;
DROP TABLE IF EXISTS feature_profile_features CASCADE;
DROP TABLE IF EXISTS user_feature_overrides CASCADE;
DROP TABLE IF EXISTS user_subscriptions_core CASCADE;
DROP TABLE IF EXISTS feature_profiles CASCADE;
DROP TABLE IF EXISTS features CASCADE;

CREATE TABLE features (
  feature_key TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'boolean',
  categoria TEXT DEFAULT 'geral',
  metadata JSONB DEFAULT '{}'::jsonb,
  ordem_exibicao INTEGER DEFAULT 0,
  visivel_usuario BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key TEXT NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  descricao TEXT,
  tipo_profile TEXT DEFAULT 'padrao',
  cohort_label TEXT,
  marketable BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_profile_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES feature_profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES features(feature_key) ON DELETE CASCADE,
  valor JSONB NOT NULL,
  limite_diario INTEGER,
  limite_semanal INTEGER,
  limite_mensal INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, feature_key)
);

CREATE TABLE plan_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  descricao_curta TEXT,
  descricao_longa TEXT,
  current_profile_id UUID REFERENCES feature_profiles(id),
  stripe_price_id_mensal TEXT,
  stripe_price_id_anual TEXT,
  preco_mensal_centavos INTEGER DEFAULT 0,
  preco_anual_centavos INTEGER DEFAULT 0,
  moeda TEXT DEFAULT 'BRL',
  tags TEXT[] DEFAULT '{}',
  ordem_exibicao INTEGER DEFAULT 0,
  visivel BOOLEAN DEFAULT true,
  cor_destaque TEXT,
  icone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL REFERENCES features(feature_key) ON DELETE CASCADE,
  override_type TEXT NOT NULL,
  valor JSONB,
  limite_diario INTEGER,
  limite_semanal INTEGER,
  limite_mensal INTEGER,
  motivo TEXT,
  concedido_por UUID,
  valido_ate TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key)
);

CREATE TABLE user_subscriptions_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_slug TEXT NOT NULL,
  feature_profile_id UUID REFERENCES feature_profiles(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active',
  periodo TEXT DEFAULT 'mensal',
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_fim TIMESTAMPTZ,
  proximo_pagamento TIMESTAMPTZ,
  cohort_tag TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_features_categoria ON features(categoria);
CREATE INDEX idx_feature_profiles_key ON feature_profiles(profile_key);
CREATE INDEX idx_fpf_profile ON feature_profile_features(profile_id);
CREATE INDEX idx_plan_catalog_slug ON plan_catalog(slug);
CREATE INDEX idx_user_overrides_user ON user_feature_overrides(user_id);
CREATE INDEX idx_user_subs_user ON user_subscriptions_core(user_id);

-- ============================================================================
-- SEÇÃO 17: DADOS INICIAIS - FEATURES
-- ============================================================================
INSERT INTO features (feature_key, nome, descricao, tipo, categoria, ordem_exibicao) VALUES
  ('diario', 'Diário de Episódios', 'Registrar episódios', 'boolean', 'core', 1),
  ('diario_ilimitado', 'Diário Ilimitado', 'Sem limite', 'boolean', 'core', 2),
  ('teste_clareza', 'Teste de Clareza', 'Acesso ao teste', 'boolean', 'core', 3),
  ('chat_ia', 'Chat com IA', 'Conversar com IA', 'boolean', 'ia', 10),
  ('oraculo_v2', 'Oráculo V2', 'Oráculo avançado', 'boolean', 'ia', 11),
  ('relatorios_pdf', 'Relatórios PDF', 'Exportar PDF', 'boolean', 'relatorios', 20),
  ('timeline', 'Timeline', 'Timeline completa', 'boolean', 'core', 4),
  ('plano_seguranca', 'Plano Segurança', 'Criar plano', 'boolean', 'seguranca', 30),
  ('carta_futuro', 'Carta Futuro', 'Cartas', 'boolean', 'core', 5),
  ('modo_espelho', 'Modo Espelho', 'Reflexões', 'boolean', 'core', 6),
  ('conquistas', 'Conquistas', 'Gamificação', 'boolean', 'gamificacao', 40),
  ('dashboard_avancado', 'Dashboard Avançado', 'Métricas', 'boolean', 'relatorios', 21),
  ('suporte_prioritario', 'Suporte Prioritário', 'Atendimento', 'boolean', 'suporte', 50),
  ('white_label', 'White Label', 'Personalização', 'boolean', 'enterprise', 60),
  ('api_acesso', 'API', 'Acesso API', 'boolean', 'enterprise', 61),
  ('multi_usuarios', 'Multi Usuários', 'Múltiplos usuários', 'boolean', 'enterprise', 62);

-- ============================================================================
-- SEÇÃO 18: DADOS INICIAIS - FEATURE PROFILES
-- ============================================================================
INSERT INTO feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Plano gratuito', 'padrao'),
  ('profissional_v1', 'Profissional V1', 'Plano profissional', 'padrao'),
  ('defesa_v1', 'Defesa V1', 'Plano defesa', 'padrao'),
  ('white_label_v1', 'White Label V1', 'Plano enterprise', 'padrao');

-- ============================================================================
-- SEÇÃO 19: DADOS INICIAIS - PLAN CATALOG
-- ============================================================================
INSERT INTO plan_catalog (slug, nome_exibicao, descricao_curta, current_profile_id, preco_mensal_centavos, preco_anual_centavos, ordem_exibicao, tags, cor_destaque) VALUES
  ('free', 'Gratuito', 'Comece sua jornada', (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'), 0, 0, 1, ARRAY['basico'], '#6B7280'),
  ('profissional', 'Profissional', 'Para ir além', (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'), 4990, 47900, 2, ARRAY['mais_vendido'], '#8B5CF6'),
  ('defesa', 'Defesa', 'Para profissionais', (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'), 9990, 95900, 3, ARRAY['profissional'], '#EC4899'),
  ('white-label', 'White Label', 'Sua marca', (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'), 49900, 479000, 4, ARRAY['enterprise'], '#F59E0B');

-- ============================================================================
-- SEÇÃO 20: DADOS INICIAIS - FEATURES POR PROFILE
-- ============================================================================
-- Free V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', '3', '10', '30'), ('teste_clareza', 'true', '1', '3', '10'), ('chat_ia', 'true', '2', '7', '20'), ('timeline', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm);

-- Profissional V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', NULL, NULL, NULL), ('diario_ilimitado', 'true', NULL, NULL, NULL), ('teste_clareza', 'true', '5', '20', '60'), ('chat_ia', 'true', '10', '50', '150'), ('oraculo_v2', 'true', '5', '25', '75'), ('relatorios_pdf', 'true', '3', '10', '30'), ('timeline', 'true', NULL, NULL, NULL), ('plano_seguranca', 'true', NULL, NULL, NULL), ('carta_futuro', 'true', NULL, NULL, NULL), ('modo_espelho', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL), ('dashboard_avancado', 'true', NULL, NULL, NULL), ('suporte_prioritario', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm);

-- Defesa V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', NULL, NULL, NULL), ('diario_ilimitado', 'true', NULL, NULL, NULL), ('teste_clareza', 'true', '10', '50', '150'), ('chat_ia', 'true', '20', '100', '300'), ('oraculo_v2', 'true', '10', '50', '150'), ('relatorios_pdf', 'true', '10', '50', '150'), ('timeline', 'true', NULL, NULL, NULL), ('plano_seguranca', 'true', NULL, NULL, NULL), ('carta_futuro', 'true', NULL, NULL, NULL), ('modo_espelho', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL), ('dashboard_avancado', 'true', NULL, NULL, NULL), ('suporte_prioritario', 'true', NULL, NULL, NULL), ('multi_usuarios', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm);

-- White Label V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', NULL, NULL, NULL), ('diario_ilimitado', 'true', NULL, NULL, NULL), ('teste_clareza', 'true', NULL, NULL, NULL), ('chat_ia', 'true', NULL, NULL, NULL), ('oraculo_v2', 'true', NULL, NULL, NULL), ('relatorios_pdf', 'true', NULL, NULL, NULL), ('timeline', 'true', NULL, NULL, NULL), ('plano_seguranca', 'true', NULL, NULL, NULL), ('carta_futuro', 'true', NULL, NULL, NULL), ('modo_espelho', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL), ('dashboard_avancado', 'true', NULL, NULL, NULL), ('suporte_prioritario', 'true', NULL, NULL, NULL), ('white_label', 'true', NULL, NULL, NULL), ('api_acesso', 'true', NULL, NULL, NULL), ('multi_usuarios', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm);

-- ============================================================================
-- FIM DA PARTE 1 - Execute a PARTE 2 em seguida
-- ============================================================================
SELECT '✅ PARTE 1 CONCLUÍDA!' as status;
SELECT 'Features:' as tabela, COUNT(*) as total FROM features;
SELECT 'Profiles:' as tabela, COUNT(*) as total FROM feature_profiles;
SELECT 'Plans:' as tabela, COUNT(*) as total FROM plan_catalog;
