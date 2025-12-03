-- ============================================================================
-- RADAR NARCISISTA - MIGRATION CONSOLIDADA
-- Executar TUDO de uma vez no Supabase SQL Editor
-- Criado em: 03/12/2025
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO o conteúdo deste arquivo
-- 2. Cole no Supabase SQL Editor
-- 3. Clique em "Run"
-- 4. Aguarde a execução completa
--
-- NOTA: Este arquivo é idempotente (pode ser executado várias vezes sem erro)
-- ============================================================================

-- ============================================================================
-- PARTE 1: ORÁCULO - SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS oraculo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'admin' CHECK (perfil IN ('admin', 'usuaria', 'profissional', 'dev', 'whitelabel')),
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

CREATE INDEX IF NOT EXISTS idx_oraculo_settings_user ON oraculo_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_settings_perfil ON oraculo_settings(perfil);

ALTER TABLE oraculo_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver settings" ON oraculo_settings;
CREATE POLICY "Admins podem ver settings" ON oraculo_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Admins podem editar settings" ON oraculo_settings;
CREATE POLICY "Admins podem editar settings" ON oraculo_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- ============================================================================
-- PARTE 2: ORÁCULO - INSTANCES (Multi-instância)
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_oraculo_instances_owner ON oraculo_instances(owner_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_instances_slug ON oraculo_instances(slug);
CREATE INDEX IF NOT EXISTS idx_oraculo_instances_ativo ON oraculo_instances(ativo);

ALTER TABLE oraculo_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners podem ver suas instancias" ON oraculo_instances;
CREATE POLICY "Owners podem ver suas instancias" ON oraculo_instances
  FOR SELECT USING (owner_id = auth.uid() OR publico = true);

DROP POLICY IF EXISTS "Owners podem editar suas instancias" ON oraculo_instances;
CREATE POLICY "Owners podem editar suas instancias" ON oraculo_instances
  FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins podem ver todas instancias" ON oraculo_instances;
CREATE POLICY "Admins podem ver todas instancias" ON oraculo_instances
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- ============================================================================
-- PARTE 3: ORÁCULO - API KEYS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_api_keys_instance ON oraculo_api_keys(instance_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON oraculo_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_ativo ON oraculo_api_keys(ativo);

ALTER TABLE oraculo_api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners podem gerenciar api keys" ON oraculo_api_keys;
CREATE POLICY "Owners podem gerenciar api keys" ON oraculo_api_keys
  FOR ALL USING (
    EXISTS (SELECT 1 FROM oraculo_instances WHERE id = instance_id AND owner_id = auth.uid())
  );

-- ============================================================================
-- PARTE 4: ORÁCULO - WEBHOOKS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_webhooks_instance ON oraculo_webhooks(instance_id);

ALTER TABLE oraculo_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners podem gerenciar webhooks" ON oraculo_webhooks;
CREATE POLICY "Owners podem gerenciar webhooks" ON oraculo_webhooks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM oraculo_instances WHERE id = instance_id AND owner_id = auth.uid())
  );

-- ============================================================================
-- PARTE 5: ORÁCULO - BILLING
-- ============================================================================

CREATE TABLE IF NOT EXISTS oraculo_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'starter', 'pro', 'enterprise')),
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

CREATE INDEX IF NOT EXISTS idx_billing_instance ON oraculo_billing(instance_id);

ALTER TABLE oraculo_billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners podem ver billing" ON oraculo_billing;
CREATE POLICY "Owners podem ver billing" ON oraculo_billing
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM oraculo_instances WHERE id = instance_id AND owner_id = auth.uid())
  );

-- ============================================================================
-- PARTE 6: ORÁCULO - USAGE LOGS
-- ============================================================================

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
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited', 'quota_exceeded')),
  error_message TEXT,
  error_code VARCHAR(50),
  origin_domain VARCHAR(255),
  origin_ip VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_instance ON oraculo_usage_logs(instance_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key ON oraculo_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON oraculo_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON oraculo_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_request ON oraculo_usage_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_instance_date ON oraculo_usage_logs(instance_id, created_at DESC);

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

CREATE OR REPLACE FUNCTION cleanup_old_usage_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM oraculo_usage_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_token_cost(p_tokens_input INTEGER, p_tokens_output INTEGER, p_model VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
  input_cost DECIMAL;
  output_cost DECIMAL;
BEGIN
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

ALTER TABLE oraculo_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver logs" ON oraculo_usage_logs;
CREATE POLICY "Admins podem ver logs" ON oraculo_usage_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Sistema pode inserir logs" ON oraculo_usage_logs;
CREATE POLICY "Sistema pode inserir logs" ON oraculo_usage_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PARTE 7: ORÁCULO - ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS oraculo_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('quota_warning', 'quota_exceeded', 'error_spike', 'latency_high', 'webhook_fail')),
  severidade TEXT DEFAULT 'warning' CHECK (severidade IN ('info', 'warning', 'error', 'critical')),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  dados JSONB DEFAULT '{}'::jsonb,
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_instance ON oraculo_alerts(instance_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON oraculo_alerts(tipo);
CREATE INDEX IF NOT EXISTS idx_alerts_lido ON oraculo_alerts(lido);

ALTER TABLE oraculo_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners podem ver alertas" ON oraculo_alerts;
CREATE POLICY "Owners podem ver alertas" ON oraculo_alerts
  FOR SELECT USING (
    instance_id IS NULL OR
    EXISTS (SELECT 1 FROM oraculo_instances WHERE id = instance_id AND owner_id = auth.uid())
  );

-- ============================================================================
-- PARTE 8: CONTROL TOWER
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome_publico TEXT NOT NULL,
  tipo_projeto TEXT NOT NULL CHECK (tipo_projeto IN ('nucleo', 'filho', 'externo')),
  parent_project_id UUID REFERENCES projects_core(id),
  url_publica TEXT,
  url_admin TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'desativado', 'arquivado')),
  vinculo_nucleo TEXT DEFAULT 'independente' CHECK (vinculo_nucleo IN ('dependente', 'semi-autonomo', 'independente')),
  politica_suporte TEXT DEFAULT 'proprio' CHECK (politica_suporte IN ('nucleo', 'proprio', 'hibrido')),
  versao TEXT,
  descricao TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects_core(slug);
CREATE INDEX IF NOT EXISTS idx_projects_tipo ON projects_core(tipo_projeto);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects_core(status);
CREATE INDEX IF NOT EXISTS idx_projects_parent ON projects_core(parent_project_id);

CREATE TABLE IF NOT EXISTS owners_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects_core(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_owners_project ON owners_core(project_id);
CREATE INDEX IF NOT EXISTS idx_owners_user ON owners_core(user_id);

ALTER TABLE projects_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners_core ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver projetos" ON projects_core;
CREATE POLICY "Admins podem ver projetos" ON projects_core
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Admins podem editar projetos" ON projects_core;
CREATE POLICY "Admins podem editar projetos" ON projects_core
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- ============================================================================
-- PARTE 9: TELEMETRY CORE
-- ============================================================================

CREATE TABLE IF NOT EXISTS telemetry_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_core(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down', 'unknown')),
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_project ON telemetry_heartbeats(project_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_slug ON telemetry_heartbeats(project_slug);
CREATE INDEX IF NOT EXISTS idx_heartbeats_created ON telemetry_heartbeats(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_errors_project ON telemetry_errors(project_id);
CREATE INDEX IF NOT EXISTS idx_errors_type ON telemetry_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_created ON telemetry_errors(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_metrics_project ON telemetry_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON telemetry_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON telemetry_metrics(created_at DESC);

ALTER TABLE telemetry_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver heartbeats" ON telemetry_heartbeats;
CREATE POLICY "Admins podem ver heartbeats" ON telemetry_heartbeats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Sistema pode inserir heartbeats" ON telemetry_heartbeats;
CREATE POLICY "Sistema pode inserir heartbeats" ON telemetry_heartbeats
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins podem ver errors" ON telemetry_errors;
CREATE POLICY "Admins podem ver errors" ON telemetry_errors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Sistema pode inserir errors" ON telemetry_errors;
CREATE POLICY "Sistema pode inserir errors" ON telemetry_errors
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins podem ver metrics" ON telemetry_metrics;
CREATE POLICY "Admins podem ver metrics" ON telemetry_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Sistema pode inserir metrics" ON telemetry_metrics;
CREATE POLICY "Sistema pode inserir metrics" ON telemetry_metrics
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PARTE 10: HELPDESK CORE
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_slug TEXT DEFAULT 'radar-narcisista',
  assunto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT DEFAULT 'geral' CHECK (categoria IN ('geral', 'bug', 'feature', 'billing', 'conta', 'outro')),
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'aguardando_usuario', 'resolvido', 'fechado')),
  atribuido_a UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_project ON support_tickets(project_slug);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at DESC);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mensagem TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON support_ticket_messages(created_at);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve proprios tickets" ON support_tickets;
CREATE POLICY "Usuario ve proprios tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuario cria tickets" ON support_tickets;
CREATE POLICY "Usuario cria tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins podem ver todos tickets" ON support_tickets;
CREATE POLICY "Admins podem ver todos tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Admins podem editar tickets" ON support_tickets;
CREATE POLICY "Admins podem editar tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Usuario ve mensagens dos proprios tickets" ON support_ticket_messages;
CREATE POLICY "Usuario ve mensagens dos proprios tickets" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuario cria mensagens" ON support_ticket_messages;
CREATE POLICY "Usuario cria mensagens" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );

-- ============================================================================
-- PARTE 11: USER ADDONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_key TEXT NOT NULL,
  addon_name TEXT NOT NULL,
  tipo TEXT DEFAULT 'credito' CHECK (tipo IN ('credito', 'feature', 'pacote')),
  quantidade INTEGER DEFAULT 1,
  credits_remaining INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')),
  stripe_payment_id TEXT,
  preco_centavos INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addons_user ON user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_addons_key ON user_addons(addon_key);
CREATE INDEX IF NOT EXISTS idx_addons_status ON user_addons(status);

CREATE OR REPLACE FUNCTION get_user_addon_credits(p_user_id UUID, p_addon_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  total_credits INTEGER;
BEGIN
  SELECT COALESCE(SUM(credits_remaining), 0) INTO total_credits
  FROM user_addons
  WHERE user_id = p_user_id
    AND addon_key = p_addon_key
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW());
  RETURN total_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION consume_addon_credit(p_user_id UUID, p_addon_key TEXT, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_addon_id UUID;
  v_credits INTEGER;
BEGIN
  SELECT id, credits_remaining INTO v_addon_id, v_credits
  FROM user_addons
  WHERE user_id = p_user_id
    AND addon_key = p_addon_key
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND credits_remaining >= p_amount
  ORDER BY purchased_at ASC
  LIMIT 1;
  
  IF v_addon_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_addons SET credits_remaining = credits_remaining - p_amount WHERE id = v_addon_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve proprios addons" ON user_addons;
CREATE POLICY "Usuario ve proprios addons" ON user_addons
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins podem ver todos addons" ON user_addons;
CREATE POLICY "Admins podem ver todos addons" ON user_addons
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- ============================================================================
-- PARTE 12: FRONTPAGE CONFIG
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

ALTER TABLE frontpage_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver config publica" ON frontpage_config;
CREATE POLICY "Todos podem ver config publica" ON frontpage_config
  FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Admins podem editar config" ON frontpage_config;
CREATE POLICY "Admins podem editar config" ON frontpage_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- ============================================================================
-- PARTE 13: PLANOS_CORE - Features
-- ============================================================================

CREATE TABLE IF NOT EXISTS features (
  feature_key TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'boolean' CHECK (tipo IN ('boolean', 'number', 'text')),
  categoria TEXT DEFAULT 'geral',
  metadata JSONB DEFAULT '{}'::jsonb,
  ordem_exibicao INTEGER DEFAULT 0,
  visivel_usuario BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_categoria ON features(categoria);
CREATE INDEX IF NOT EXISTS idx_features_ordem ON features(ordem_exibicao);

-- ============================================================================
-- PARTE 14: PLANOS_CORE - Feature Profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key TEXT NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  descricao TEXT,
  tipo_profile TEXT DEFAULT 'padrao' CHECK (tipo_profile IN ('padrao', 'promo', 'cohort', 'exclusivo')),
  cohort_label TEXT,
  marketable BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_profiles_key ON feature_profiles(profile_key);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_tipo ON feature_profiles(tipo_profile);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_marketable ON feature_profiles(marketable);

-- ============================================================================
-- PARTE 15: PLANOS_CORE - Feature Profile Features (JOIN)
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_profile_features (
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

CREATE INDEX IF NOT EXISTS idx_fpf_profile ON feature_profile_features(profile_id);
CREATE INDEX IF NOT EXISTS idx_fpf_feature ON feature_profile_features(feature_key);

-- ============================================================================
-- PARTE 16: PLANOS_CORE - Plan Catalog
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_catalog (
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

CREATE INDEX IF NOT EXISTS idx_plan_catalog_slug ON plan_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_plan_catalog_visivel ON plan_catalog(visivel);

-- ============================================================================
-- PARTE 17: PLANOS_CORE - User Feature Overrides
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL REFERENCES features(feature_key) ON DELETE CASCADE,
  override_type TEXT NOT NULL CHECK (override_type IN ('grant', 'revoke', 'limit_custom')),
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

CREATE INDEX IF NOT EXISTS idx_user_overrides_user ON user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_overrides_feature ON user_feature_overrides(feature_key);

-- ============================================================================
-- PARTE 18: PLANOS_CORE - User Subscriptions
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_slug TEXT NOT NULL,
  feature_profile_id UUID REFERENCES feature_profiles(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused')),
  periodo TEXT DEFAULT 'mensal' CHECK (periodo IN ('mensal', 'anual', 'lifetime')),
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_fim TIMESTAMPTZ,
  proximo_pagamento TIMESTAMPTZ,
  cohort_tag TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subs_user ON user_subscriptions_core(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan ON user_subscriptions_core(plan_slug);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON user_subscriptions_core(status);

-- ============================================================================
-- PARTE 19: PLANOS_CORE - Funções
-- ============================================================================

CREATE OR REPLACE FUNCTION get_effective_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile_id UUID;
  v_features JSONB := '{}'::jsonb;
  r RECORD;
BEGIN
  SELECT feature_profile_id INTO v_profile_id
  FROM user_subscriptions_core
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id FROM feature_profiles WHERE profile_key = 'free_v1' LIMIT 1;
  END IF;
  
  IF v_profile_id IS NOT NULL THEN
    SELECT jsonb_object_agg(
      fpf.feature_key,
      jsonb_build_object(
        'valor', fpf.valor,
        'limite_diario', fpf.limite_diario,
        'limite_semanal', fpf.limite_semanal,
        'limite_mensal', fpf.limite_mensal
      )
    ) INTO v_features
    FROM feature_profile_features fpf
    WHERE fpf.profile_id = v_profile_id;
  END IF;
  
  FOR r IN 
    SELECT feature_key, override_type, valor, limite_diario, limite_semanal, limite_mensal
    FROM user_feature_overrides
    WHERE user_id = p_user_id AND ativo = true AND (valido_ate IS NULL OR valido_ate > NOW())
  LOOP
    IF r.override_type = 'grant' THEN
      v_features := v_features || jsonb_build_object(
        r.feature_key,
        jsonb_build_object('valor', COALESCE(r.valor, 'true'::jsonb), 'override', true)
      );
    ELSIF r.override_type = 'revoke' THEN
      v_features := v_features - r.feature_key;
    END IF;
  END LOOP;
  
  RETURN COALESCE(v_features, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_feature(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_features JSONB;
  v_valor JSONB;
BEGIN
  v_features := get_effective_features(p_user_id);
  IF NOT v_features ? p_feature_key THEN RETURN FALSE; END IF;
  v_valor := v_features -> p_feature_key -> 'valor';
  IF jsonb_typeof(v_valor) = 'boolean' THEN RETURN v_valor::boolean; END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_feature_limit(p_user_id UUID, p_feature_key TEXT, p_periodo TEXT DEFAULT 'diario')
RETURNS INTEGER AS $$
DECLARE
  v_features JSONB;
  v_limite INTEGER;
BEGIN
  v_features := get_effective_features(p_user_id);
  IF NOT v_features ? p_feature_key THEN RETURN 0; END IF;
  IF p_periodo = 'diario' THEN v_limite := (v_features -> p_feature_key ->> 'limite_diario')::integer;
  ELSIF p_periodo = 'semanal' THEN v_limite := (v_features -> p_feature_key ->> 'limite_semanal')::integer;
  ELSIF p_periodo = 'mensal' THEN v_limite := (v_features -> p_feature_key ->> 'limite_mensal')::integer;
  END IF;
  RETURN COALESCE(v_limite, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 20: PLANOS_CORE - RLS
-- ============================================================================

ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_profile_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions_core ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver features" ON features;
CREATE POLICY "Todos podem ver features" ON features FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar features" ON features;
CREATE POLICY "Admins podem editar features" ON features FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Todos podem ver profiles" ON feature_profiles;
CREATE POLICY "Todos podem ver profiles" ON feature_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar profiles" ON feature_profiles;
CREATE POLICY "Admins podem editar profiles" ON feature_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Todos podem ver profile features" ON feature_profile_features;
CREATE POLICY "Todos podem ver profile features" ON feature_profile_features FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar profile features" ON feature_profile_features;
CREATE POLICY "Admins podem editar profile features" ON feature_profile_features FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Todos podem ver catalogo" ON plan_catalog;
CREATE POLICY "Todos podem ver catalogo" ON plan_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar catalogo" ON plan_catalog;
CREATE POLICY "Admins podem editar catalogo" ON plan_catalog FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Admins podem ver overrides" ON user_feature_overrides;
CREATE POLICY "Admins podem ver overrides" ON user_feature_overrides FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Admins podem editar overrides" ON user_feature_overrides;
CREATE POLICY "Admins podem editar overrides" ON user_feature_overrides FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Usuario ve propria assinatura" ON user_subscriptions_core;
CREATE POLICY "Usuario ve propria assinatura" ON user_subscriptions_core FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON user_subscriptions_core;
CREATE POLICY "Admins podem ver todas assinaturas" ON user_subscriptions_core FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Admins podem editar assinaturas" ON user_subscriptions_core;
CREATE POLICY "Admins podem editar assinaturas" ON user_subscriptions_core FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- ============================================================================
-- PARTE 21: DADOS INICIAIS - Features
-- ============================================================================

INSERT INTO features (feature_key, nome, descricao, tipo, categoria, ordem_exibicao) VALUES
  ('diario', 'Diário de Episódios', 'Registrar episódios e reflexões', 'boolean', 'core', 1),
  ('diario_ilimitado', 'Diário Ilimitado', 'Sem limite de entradas no diário', 'boolean', 'core', 2),
  ('teste_clareza', 'Teste de Clareza', 'Acesso ao teste de clareza', 'boolean', 'core', 3),
  ('chat_ia', 'Chat com IA', 'Conversar com a IA de suporte', 'boolean', 'ia', 10),
  ('oraculo_v2', 'Oráculo V2', 'Acesso ao Oráculo V2 avançado', 'boolean', 'ia', 11),
  ('relatorios_pdf', 'Relatórios em PDF', 'Exportar relatórios em PDF', 'boolean', 'relatorios', 20),
  ('timeline', 'Timeline de Episódios', 'Visualizar timeline completa', 'boolean', 'core', 4),
  ('plano_seguranca', 'Plano de Segurança', 'Criar plano de segurança', 'boolean', 'seguranca', 30),
  ('carta_futuro', 'Carta para o Futuro', 'Escrever cartas para si mesma', 'boolean', 'core', 5),
  ('modo_espelho', 'Modo Espelho', 'Reflexões guiadas', 'boolean', 'core', 6),
  ('conquistas', 'Sistema de Conquistas', 'Gamificação e conquistas', 'boolean', 'gamificacao', 40),
  ('dashboard_avancado', 'Dashboard Avançado', 'Métricas e gráficos avançados', 'boolean', 'relatorios', 21),
  ('suporte_prioritario', 'Suporte Prioritário', 'Atendimento prioritário', 'boolean', 'suporte', 50),
  ('white_label', 'White Label', 'Personalização completa', 'boolean', 'enterprise', 60),
  ('api_acesso', 'Acesso à API', 'Acesso à API pública', 'boolean', 'enterprise', 61),
  ('multi_usuarios', 'Multi Usuários', 'Gerenciar múltiplos usuários', 'boolean', 'enterprise', 62)
ON CONFLICT (feature_key) DO NOTHING;

-- ============================================================================
-- PARTE 22: DADOS INICIAIS - Feature Profiles
-- ============================================================================

INSERT INTO feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Plano gratuito básico', 'padrao'),
  ('profissional_v1', 'Profissional V1', 'Plano profissional completo', 'padrao'),
  ('defesa_v1', 'Defesa V1', 'Plano para profissionais de defesa', 'padrao'),
  ('white_label_v1', 'White Label V1', 'Plano enterprise com white label', 'padrao')
ON CONFLICT (profile_key) DO NOTHING;

-- ============================================================================
-- PARTE 23: DADOS INICIAIS - Features por Profile (Free)
-- ============================================================================

INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'),
  feature_key, valor::jsonb, limite_diario::integer, limite_semanal::integer, limite_mensal::integer
FROM (VALUES
  ('diario', 'true', '3', '10', '30'),
  ('teste_clareza', 'true', '1', '3', '10'),
  ('chat_ia', 'true', '2', '7', '20'),
  ('timeline', 'true', NULL, NULL, NULL),
  ('conquistas', 'true', NULL, NULL, NULL)
) AS t(feature_key, valor, limite_diario, limite_semanal, limite_mensal)
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- ============================================================================
-- PARTE 24: DADOS INICIAIS - Features por Profile (Profissional)
-- ============================================================================

INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'),
  feature_key, valor::jsonb, limite_diario::integer, limite_semanal::integer, limite_mensal::integer
FROM (VALUES
  ('diario', 'true', NULL, NULL, NULL),
  ('diario_ilimitado', 'true', NULL, NULL, NULL),
  ('teste_clareza', 'true', '5', '20', '60'),
  ('chat_ia', 'true', '10', '50', '150'),
  ('oraculo_v2', 'true', '5', '25', '75'),
  ('relatorios_pdf', 'true', '3', '10', '30'),
  ('timeline', 'true', NULL, NULL, NULL),
  ('plano_seguranca', 'true', NULL, NULL, NULL),
  ('carta_futuro', 'true', NULL, NULL, NULL),
  ('modo_espelho', 'true', NULL, NULL, NULL),
  ('conquistas', 'true', NULL, NULL, NULL),
  ('dashboard_avancado', 'true', NULL, NULL, NULL),
  ('suporte_prioritario', 'true', NULL, NULL, NULL)
) AS t(feature_key, valor, limite_diario, limite_semanal, limite_mensal)
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- ============================================================================
-- PARTE 25: DADOS INICIAIS - Features por Profile (Defesa)
-- ============================================================================

INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'),
  feature_key, valor::jsonb, limite_diario::integer, limite_semanal::integer, limite_mensal::integer
FROM (VALUES
  ('diario', 'true', NULL, NULL, NULL),
  ('diario_ilimitado', 'true', NULL, NULL, NULL),
  ('teste_clareza', 'true', '10', '50', '150'),
  ('chat_ia', 'true', '20', '100', '300'),
  ('oraculo_v2', 'true', '10', '50', '150'),
  ('relatorios_pdf', 'true', '10', '50', '150'),
  ('timeline', 'true', NULL, NULL, NULL),
  ('plano_seguranca', 'true', NULL, NULL, NULL),
  ('carta_futuro', 'true', NULL, NULL, NULL),
  ('modo_espelho', 'true', NULL, NULL, NULL),
  ('conquistas', 'true', NULL, NULL, NULL),
  ('dashboard_avancado', 'true', NULL, NULL, NULL),
  ('suporte_prioritario', 'true', NULL, NULL, NULL),
  ('multi_usuarios', 'true', NULL, NULL, NULL)
) AS t(feature_key, valor, limite_diario, limite_semanal, limite_mensal)
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- ============================================================================
-- PARTE 26: DADOS INICIAIS - Features por Profile (White Label)
-- ============================================================================

INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'),
  feature_key, valor::jsonb, limite_diario::integer, limite_semanal::integer, limite_mensal::integer
FROM (VALUES
  ('diario', 'true', NULL, NULL, NULL),
  ('diario_ilimitado', 'true', NULL, NULL, NULL),
  ('teste_clareza', 'true', NULL, NULL, NULL),
  ('chat_ia', 'true', NULL, NULL, NULL),
  ('oraculo_v2', 'true', NULL, NULL, NULL),
  ('relatorios_pdf', 'true', NULL, NULL, NULL),
  ('timeline', 'true', NULL, NULL, NULL),
  ('plano_seguranca', 'true', NULL, NULL, NULL),
  ('carta_futuro', 'true', NULL, NULL, NULL),
  ('modo_espelho', 'true', NULL, NULL, NULL),
  ('conquistas', 'true', NULL, NULL, NULL),
  ('dashboard_avancado', 'true', NULL, NULL, NULL),
  ('suporte_prioritario', 'true', NULL, NULL, NULL),
  ('white_label', 'true', NULL, NULL, NULL),
  ('api_acesso', 'true', NULL, NULL, NULL),
  ('multi_usuarios', 'true', NULL, NULL, NULL)
) AS t(feature_key, valor, limite_diario, limite_semanal, limite_mensal)
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- ============================================================================
-- PARTE 27: DADOS INICIAIS - Plan Catalog
-- ============================================================================

INSERT INTO plan_catalog (slug, nome_exibicao, descricao_curta, current_profile_id, preco_mensal_centavos, preco_anual_centavos, ordem_exibicao, tags, cor_destaque) VALUES
  ('free', 'Gratuito', 'Comece sua jornada de clareza', 
   (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'),
   0, 0, 1, ARRAY['basico'], '#6B7280'),
  ('profissional', 'Profissional', 'Para quem quer ir além', 
   (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'),
   4990, 47900, 2, ARRAY['mais_vendido', 'destacado'], '#8B5CF6'),
  ('defesa', 'Defesa', 'Para profissionais de saúde e direito', 
   (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'),
   9990, 95900, 3, ARRAY['profissional'], '#EC4899'),
  ('white-label', 'White Label', 'Sua marca, nossa tecnologia', 
   (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'),
   49900, 479000, 4, ARRAY['enterprise'], '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FIM DA MIGRATION CONSOLIDADA
-- ============================================================================

-- Verificação final
SELECT 'MIGRATION COMPLETA!' as status;
SELECT 'Tabelas criadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'oraculo_settings', 'oraculo_instances', 'oraculo_api_keys', 'oraculo_webhooks',
  'oraculo_billing', 'oraculo_usage_logs', 'oraculo_alerts',
  'projects_core', 'owners_core',
  'telemetry_heartbeats', 'telemetry_errors', 'telemetry_metrics',
  'support_tickets', 'support_ticket_messages',
  'user_addons', 'frontpage_config',
  'features', 'feature_profiles', 'feature_profile_features',
  'plan_catalog', 'user_feature_overrides', 'user_subscriptions_core'
)
ORDER BY table_name;
