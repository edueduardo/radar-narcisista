-- ============================================================================
-- RADAR NARCISISTA - MEGA CONSOLIDADO PARTE 2
-- PLANOS + BILLING + CONTENT + BETA + RLS + DADOS
-- Data: 03/12/2025
-- ============================================================================

-- ============================================================================
-- SEÇÃO 16: PLANOS_CORE - FEATURES
-- ============================================================================
CREATE TABLE IF NOT EXISTS features (
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

CREATE INDEX IF NOT EXISTS idx_features_categoria ON features(categoria);
CREATE INDEX IF NOT EXISTS idx_features_ordem ON features(ordem_exibicao);

-- ============================================================================
-- SEÇÃO 17: FEATURE PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_profiles (
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

CREATE INDEX IF NOT EXISTS idx_feature_profiles_key ON feature_profiles(profile_key);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_tipo ON feature_profiles(tipo_profile);

-- ============================================================================
-- SEÇÃO 18: FEATURE PROFILE FEATURES (JOIN)
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
-- SEÇÃO 19: PLAN CATALOG
-- ============================================================================
DROP TABLE IF EXISTS plan_catalog CASCADE;
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

CREATE INDEX IF NOT EXISTS idx_plan_catalog_slug ON plan_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_plan_catalog_visivel ON plan_catalog(visivel);
CREATE INDEX IF NOT EXISTS idx_plan_catalog_ordem ON plan_catalog(ordem_exibicao);

-- ============================================================================
-- SEÇÃO 20: USER FEATURE OVERRIDES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_feature_overrides (
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

CREATE INDEX IF NOT EXISTS idx_user_overrides_user ON user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_overrides_feature ON user_feature_overrides(feature_key);
CREATE INDEX IF NOT EXISTS idx_user_overrides_ativo ON user_feature_overrides(ativo);

-- ============================================================================
-- SEÇÃO 21: USER SUBSCRIPTIONS CORE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions_core (
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

CREATE INDEX IF NOT EXISTS idx_user_subs_user ON user_subscriptions_core(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan ON user_subscriptions_core(plan_slug);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON user_subscriptions_core(status);

-- ============================================================================
-- SEÇÃO 22: BILLING PLANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  legacy_id TEXT,
  audience TEXT NOT NULL DEFAULT 'consumer',
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_mid_bridge BOOLEAN NOT NULL DEFAULT false,
  name_pt TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  tagline_pt TEXT,
  tagline_en TEXT,
  tagline_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  price_monthly_cents INTEGER DEFAULT 0,
  price_yearly_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  max_tests_per_month INTEGER DEFAULT -1,
  max_diary_entries_per_month INTEGER DEFAULT -1,
  max_chat_messages_per_day INTEGER DEFAULT -1,
  can_export_pdf BOOLEAN DEFAULT false,
  can_view_full_history BOOLEAN DEFAULT false,
  can_use_collaborative_ai BOOLEAN DEFAULT false,
  max_clients INTEGER DEFAULT 0,
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT,
  icon TEXT DEFAULT 'Shield',
  color TEXT DEFAULT 'text-gray-600',
  bg_color TEXT DEFAULT 'bg-gray-100',
  is_popular BOOLEAN DEFAULT false,
  is_coming_soon BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_plan_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES billing_plans(id) ON DELETE CASCADE,
  label_pt TEXT,
  label_en TEXT,
  label_es TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  promo_price_monthly_cents INTEGER,
  promo_price_yearly_cents INTEGER,
  discount_percent INTEGER,
  is_active BOOLEAN DEFAULT true,
  show_original_price BOOLEAN DEFAULT true,
  badge_color TEXT DEFAULT 'bg-red-500',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_plans_code ON billing_plans(code);
CREATE INDEX IF NOT EXISTS idx_billing_plans_audience ON billing_plans(audience);
CREATE INDEX IF NOT EXISTS idx_billing_plans_public ON billing_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_billing_promotions_plan ON billing_plan_promotions(plan_id);

-- ============================================================================
-- SEÇÃO 23: CONTENT SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'blog',
  url TEXT,
  feed_url TEXT,
  social_handle TEXT,
  trust_level INTEGER DEFAULT 3,
  topics TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'article',
  source_type TEXT NOT NULL DEFAULT 'internal',
  source_id UUID REFERENCES content_sources(id),
  original_url TEXT,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  summary_pt TEXT,
  summary_en TEXT,
  summary_es TEXT,
  body_pt TEXT,
  body_en TEXT,
  body_es TEXT,
  cover_image_url TEXT,
  thumbnail_url TEXT,
  media_type TEXT,
  media_url TEXT,
  topics TEXT[] DEFAULT '{}',
  target_audience TEXT DEFAULT 'all',
  difficulty_level TEXT DEFAULT 'beginner',
  reading_time_minutes INTEGER DEFAULT 5,
  visibility TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  collection_type TEXT NOT NULL DEFAULT 'trail',
  name_pt TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT 'purple',
  cover_image_url TEXT,
  target_audience TEXT DEFAULT 'all',
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_duration_minutes INTEGER,
  visibility TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  required_plan_code TEXT,
  sort_order INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS content_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES content_collections(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  unlock_after_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, content_item_id)
);

CREATE TABLE IF NOT EXISTS content_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT UNIQUE NOT NULL,
  metric_category TEXT NOT NULL DEFAULT 'general',
  value_numeric DECIMAL(15,4),
  value_text TEXT,
  value_json JSONB,
  label_pt TEXT NOT NULL,
  label_en TEXT,
  label_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  display_format TEXT DEFAULT 'number',
  display_prefix TEXT,
  display_suffix TEXT,
  decimal_places INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'BarChart',
  color TEXT DEFAULT 'blue',
  visibility TEXT NOT NULL DEFAULT 'private',
  is_featured BOOLEAN DEFAULT false,
  update_frequency TEXT DEFAULT 'daily',
  last_computed_at TIMESTAMPTZ,
  next_compute_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_sources_slug ON content_sources(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_visibility ON content_items(visibility);
CREATE INDEX IF NOT EXISTS idx_content_collections_slug ON content_collections(slug);
CREATE INDEX IF NOT EXISTS idx_content_insights_key ON content_insights(metric_key);

-- ============================================================================
-- SEÇÃO 24: BETA TESTERS
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
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_beta_events_user ON beta_events(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_events_type ON beta_events(event_type);
CREATE INDEX IF NOT EXISTS idx_beta_events_created ON beta_events(created_at);

-- ============================================================================
-- SEÇÃO 25: SAFETY PLAN & RISK ALERTS
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
CREATE INDEX IF NOT EXISTS idx_risk_alerts_nivel ON risk_alerts(nivel);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_resolvido ON risk_alerts(resolvido);

-- ============================================================================
-- SEÇÃO 26: FUNÇÕES SQL
-- ============================================================================
CREATE OR REPLACE FUNCTION get_effective_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile_id UUID;
  v_features JSONB := '{}'::jsonb;
  r RECORD;
BEGIN
  SELECT feature_profile_id INTO v_profile_id
  FROM user_subscriptions_core WHERE user_id = p_user_id AND status = 'active' LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id FROM feature_profiles WHERE profile_key = 'free_v1' LIMIT 1;
  END IF;
  
  IF v_profile_id IS NOT NULL THEN
    SELECT jsonb_object_agg(fpf.feature_key, jsonb_build_object('valor', fpf.valor, 'limite_diario', fpf.limite_diario, 'limite_semanal', fpf.limite_semanal, 'limite_mensal', fpf.limite_mensal))
    INTO v_features FROM feature_profile_features fpf WHERE fpf.profile_id = v_profile_id;
  END IF;
  
  FOR r IN SELECT feature_key, override_type, valor FROM user_feature_overrides WHERE user_id = p_user_id AND ativo = true AND (valido_ate IS NULL OR valido_ate > NOW()) LOOP
    IF r.override_type = 'grant' THEN v_features := v_features || jsonb_build_object(r.feature_key, jsonb_build_object('valor', COALESCE(r.valor, 'true'::jsonb), 'override', true));
    ELSIF r.override_type = 'revoke' THEN v_features := v_features - r.feature_key; END IF;
  END LOOP;
  
  RETURN COALESCE(v_features, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_feature(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_features JSONB; v_valor JSONB;
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
DECLARE v_features JSONB; v_limite INTEGER;
BEGIN
  v_features := get_effective_features(p_user_id);
  IF NOT v_features ? p_feature_key THEN RETURN 0; END IF;
  IF p_periodo = 'diario' THEN v_limite := (v_features -> p_feature_key ->> 'limite_diario')::integer;
  ELSIF p_periodo = 'semanal' THEN v_limite := (v_features -> p_feature_key ->> 'limite_semanal')::integer;
  ELSIF p_periodo = 'mensal' THEN v_limite := (v_features -> p_feature_key ->> 'limite_mensal')::integer; END IF;
  RETURN COALESCE(v_limite, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEÇÃO 27: HABILITAR RLS EM TODAS AS TABELAS
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
ALTER TABLE oraculo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_alerts ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_profile_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plan_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEÇÃO 28: POLICIES PRINCIPAIS
-- ============================================================================

-- Waitlist
DROP POLICY IF EXISTS "Anyone can insert waitlist" ON waitlist;
CREATE POLICY "Anyone can insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);

-- Future Letters
DROP POLICY IF EXISTS "Users can view own letters" ON future_letters;
CREATE POLICY "Users can view own letters" ON future_letters FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own letters" ON future_letters;
CREATE POLICY "Users can insert own letters" ON future_letters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mirror Reflections
DROP POLICY IF EXISTS "Users can view own reflections" ON mirror_reflections;
CREATE POLICY "Users can view own reflections" ON mirror_reflections FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own reflections" ON mirror_reflections;
CREATE POLICY "Users can insert own reflections" ON mirror_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Diary Analyses
DROP POLICY IF EXISTS "diary_analyses_select_own" ON diary_analyses;
CREATE POLICY "diary_analyses_select_own" ON diary_analyses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "diary_analyses_insert_own" ON diary_analyses;
CREATE POLICY "diary_analyses_insert_own" ON diary_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analysis Snapshots
DROP POLICY IF EXISTS "Users can view own snapshots" ON analysis_snapshots;
CREATE POLICY "Users can view own snapshots" ON analysis_snapshots FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own snapshots" ON analysis_snapshots;
CREATE POLICY "Users can insert own snapshots" ON analysis_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Oráculo
DROP POLICY IF EXISTS "Owners podem ver suas instancias" ON oraculo_instances;
CREATE POLICY "Owners podem ver suas instancias" ON oraculo_instances FOR SELECT USING (owner_id = auth.uid() OR publico = true);
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON oraculo_usage_logs;
CREATE POLICY "Sistema pode inserir logs" ON oraculo_usage_logs FOR INSERT WITH CHECK (true);

-- Support Tickets
DROP POLICY IF EXISTS "Usuario ve proprios tickets" ON support_tickets;
CREATE POLICY "Usuario ve proprios tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuario cria tickets" ON support_tickets;
CREATE POLICY "Usuario cria tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());

-- User Addons
DROP POLICY IF EXISTS "Usuario ve proprios addons" ON user_addons;
CREATE POLICY "Usuario ve proprios addons" ON user_addons FOR SELECT USING (user_id = auth.uid());

-- Frontpage Config
DROP POLICY IF EXISTS "Todos podem ver config publica" ON frontpage_config;
CREATE POLICY "Todos podem ver config publica" ON frontpage_config FOR SELECT USING (ativo = true);

-- Features (público)
DROP POLICY IF EXISTS "Todos podem ver features" ON features;
CREATE POLICY "Todos podem ver features" ON features FOR SELECT USING (true);

-- Feature Profiles (público)
DROP POLICY IF EXISTS "Todos podem ver profiles" ON feature_profiles;
CREATE POLICY "Todos podem ver profiles" ON feature_profiles FOR SELECT USING (true);

-- Feature Profile Features (público)
DROP POLICY IF EXISTS "Todos podem ver profile features" ON feature_profile_features;
CREATE POLICY "Todos podem ver profile features" ON feature_profile_features FOR SELECT USING (true);

-- Plan Catalog (público)
DROP POLICY IF EXISTS "Todos podem ver catalogo" ON plan_catalog;
CREATE POLICY "Todos podem ver catalogo" ON plan_catalog FOR SELECT USING (true);

-- User Subscriptions
DROP POLICY IF EXISTS "Usuario ve propria assinatura" ON user_subscriptions_core;
CREATE POLICY "Usuario ve propria assinatura" ON user_subscriptions_core FOR SELECT USING (user_id = auth.uid());

-- Billing Plans (público)
DROP POLICY IF EXISTS "billing_plans_select_public" ON billing_plans;
CREATE POLICY "billing_plans_select_public" ON billing_plans FOR SELECT USING (is_public = true);

-- Content Items (público)
DROP POLICY IF EXISTS "content_items_public_read" ON content_items;
CREATE POLICY "content_items_public_read" ON content_items FOR SELECT USING (visibility = 'public');

-- Content Collections (público)
DROP POLICY IF EXISTS "content_collections_public_read" ON content_collections;
CREATE POLICY "content_collections_public_read" ON content_collections FOR SELECT USING (visibility = 'public');

-- Content Insights (público)
DROP POLICY IF EXISTS "content_insights_public_read" ON content_insights;
CREATE POLICY "content_insights_public_read" ON content_insights FOR SELECT USING (visibility = 'public');

-- Telemetry (insert público)
DROP POLICY IF EXISTS "Sistema pode inserir heartbeats" ON telemetry_heartbeats;
CREATE POLICY "Sistema pode inserir heartbeats" ON telemetry_heartbeats FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Sistema pode inserir errors" ON telemetry_errors;
CREATE POLICY "Sistema pode inserir errors" ON telemetry_errors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Sistema pode inserir metrics" ON telemetry_metrics;
CREATE POLICY "Sistema pode inserir metrics" ON telemetry_metrics FOR INSERT WITH CHECK (true);

-- Beta Events
DROP POLICY IF EXISTS "beta_events_insert_authenticated" ON beta_events;
CREATE POLICY "beta_events_insert_authenticated" ON beta_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Safety Plans
DROP POLICY IF EXISTS "Users can view own safety plans" ON safety_plans;
CREATE POLICY "Users can view own safety plans" ON safety_plans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own safety plans" ON safety_plans;
CREATE POLICY "Users can manage own safety plans" ON safety_plans FOR ALL USING (auth.uid() = user_id);

-- Risk Alerts
DROP POLICY IF EXISTS "Users can view own risk alerts" ON risk_alerts;
CREATE POLICY "Users can view own risk alerts" ON risk_alerts FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SEÇÃO 29: DADOS INICIAIS - FEATURES
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
-- SEÇÃO 30: DADOS INICIAIS - FEATURE PROFILES
-- ============================================================================
INSERT INTO feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Plano gratuito básico', 'padrao'),
  ('profissional_v1', 'Profissional V1', 'Plano profissional completo', 'padrao'),
  ('defesa_v1', 'Defesa V1', 'Plano para profissionais de defesa', 'padrao'),
  ('white_label_v1', 'White Label V1', 'Plano enterprise com white label', 'padrao')
ON CONFLICT (profile_key) DO NOTHING;

-- ============================================================================
-- SEÇÃO 31: DADOS INICIAIS - PLAN CATALOG
-- ============================================================================
INSERT INTO plan_catalog (slug, nome_exibicao, descricao_curta, current_profile_id, preco_mensal_centavos, preco_anual_centavos, ordem_exibicao, tags, cor_destaque) VALUES
  ('free', 'Gratuito', 'Comece sua jornada de clareza', (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'), 0, 0, 1, ARRAY['basico'], '#6B7280'),
  ('profissional', 'Profissional', 'Para quem quer ir além', (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'), 4990, 47900, 2, ARRAY['mais_vendido', 'destacado'], '#8B5CF6'),
  ('defesa', 'Defesa', 'Para profissionais de saúde e direito', (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'), 9990, 95900, 3, ARRAY['profissional'], '#EC4899'),
  ('white-label', 'White Label', 'Sua marca, nossa tecnologia', (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'), 49900, 479000, 4, ARRAY['enterprise'], '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEÇÃO 32: DADOS INICIAIS - FEATURES POR PROFILE
-- ============================================================================

-- Free V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', '3', '10', '30'), ('teste_clareza', 'true', '1', '3', '10'), ('chat_ia', 'true', '2', '7', '20'), ('timeline', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm)
WHERE (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1') IS NOT NULL
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- Profissional V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', NULL, NULL, NULL), ('diario_ilimitado', 'true', NULL, NULL, NULL), ('teste_clareza', 'true', '5', '20', '60'), ('chat_ia', 'true', '10', '50', '150'), ('oraculo_v2', 'true', '5', '25', '75'), ('relatorios_pdf', 'true', '3', '10', '30'), ('timeline', 'true', NULL, NULL, NULL), ('plano_seguranca', 'true', NULL, NULL, NULL), ('carta_futuro', 'true', NULL, NULL, NULL), ('modo_espelho', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL), ('dashboard_avancado', 'true', NULL, NULL, NULL), ('suporte_prioritario', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm)
WHERE (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1') IS NOT NULL
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- Defesa V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', NULL, NULL, NULL), ('diario_ilimitado', 'true', NULL, NULL, NULL), ('teste_clareza', 'true', '10', '50', '150'), ('chat_ia', 'true', '20', '100', '300'), ('oraculo_v2', 'true', '10', '50', '150'), ('relatorios_pdf', 'true', '10', '50', '150'), ('timeline', 'true', NULL, NULL, NULL), ('plano_seguranca', 'true', NULL, NULL, NULL), ('carta_futuro', 'true', NULL, NULL, NULL), ('modo_espelho', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL), ('dashboard_avancado', 'true', NULL, NULL, NULL), ('suporte_prioritario', 'true', NULL, NULL, NULL), ('multi_usuarios', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm)
WHERE (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1') IS NOT NULL
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- White Label V1
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'), v.fk, v.vl::jsonb, v.ld::integer, v.ls::integer, v.lm::integer
FROM (VALUES ('diario', 'true', NULL, NULL, NULL), ('diario_ilimitado', 'true', NULL, NULL, NULL), ('teste_clareza', 'true', NULL, NULL, NULL), ('chat_ia', 'true', NULL, NULL, NULL), ('oraculo_v2', 'true', NULL, NULL, NULL), ('relatorios_pdf', 'true', NULL, NULL, NULL), ('timeline', 'true', NULL, NULL, NULL), ('plano_seguranca', 'true', NULL, NULL, NULL), ('carta_futuro', 'true', NULL, NULL, NULL), ('modo_espelho', 'true', NULL, NULL, NULL), ('conquistas', 'true', NULL, NULL, NULL), ('dashboard_avancado', 'true', NULL, NULL, NULL), ('suporte_prioritario', 'true', NULL, NULL, NULL), ('white_label', 'true', NULL, NULL, NULL), ('api_acesso', 'true', NULL, NULL, NULL), ('multi_usuarios', 'true', NULL, NULL, NULL)) AS v(fk, vl, ld, ls, lm)
WHERE (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1') IS NOT NULL
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- ============================================================================
-- FIM - VERIFICAÇÃO
-- ============================================================================
SELECT '✅ MEGA CONSOLIDADO COMPLETO!' as status;

SELECT 'Tabelas criadas:' as info, COUNT(*) as total FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Features:' as tabela, COUNT(*) as registros FROM features
UNION ALL SELECT 'Profiles:', COUNT(*) FROM feature_profiles
UNION ALL SELECT 'Plans:', COUNT(*) FROM plan_catalog;
