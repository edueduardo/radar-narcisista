-- ============================================================================
-- RADAR NARCISISTA - MEGA SQL PARTE 1
-- CORE + ORÁCULO + PLANOS
-- Data: 03/12/2025
-- ============================================================================
-- INSTRUÇÕES: Cole no Supabase SQL Editor e clique Run
-- ============================================================================

-- ============================================================================
-- LIMPEZA: Dropar tabelas que podem ter sido criadas incorretamente
-- ============================================================================
DROP TABLE IF EXISTS feature_profile_features CASCADE;
DROP TABLE IF EXISTS user_feature_overrides CASCADE;
DROP TABLE IF EXISTS user_subscriptions_core CASCADE;
DROP TABLE IF EXISTS plan_catalog CASCADE;
DROP TABLE IF EXISTS feature_profiles CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS oraculo_usage_logs CASCADE;
DROP TABLE IF EXISTS oraculo_alerts CASCADE;
DROP TABLE IF EXISTS oraculo_billing CASCADE;
DROP TABLE IF EXISTS oraculo_webhooks CASCADE;
DROP TABLE IF EXISTS oraculo_api_keys CASCADE;
DROP TABLE IF EXISTS oraculo_instances CASCADE;
DROP TABLE IF EXISTS oraculo_settings CASCADE;

-- ============================================================================
-- SEÇÃO 1: ORÁCULO SETTINGS
-- ============================================================================
CREATE TABLE oraculo_settings (
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

-- ============================================================================
-- SEÇÃO 2: ORÁCULO INSTANCES
-- ============================================================================
CREATE TABLE oraculo_instances (
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

-- ============================================================================
-- SEÇÃO 3: ORÁCULO API KEYS
-- ============================================================================
CREATE TABLE oraculo_api_keys (
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

-- ============================================================================
-- SEÇÃO 4: ORÁCULO WEBHOOKS
-- ============================================================================
CREATE TABLE oraculo_webhooks (
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

-- ============================================================================
-- SEÇÃO 5: ORÁCULO BILLING
-- ============================================================================
CREATE TABLE oraculo_billing (
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

-- ============================================================================
-- SEÇÃO 6: ORÁCULO USAGE LOGS
-- ============================================================================
CREATE TABLE oraculo_usage_logs (
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

-- ============================================================================
-- SEÇÃO 7: ORÁCULO ALERTS
-- ============================================================================
CREATE TABLE oraculo_alerts (
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

-- ============================================================================
-- SEÇÃO 8: ÍNDICES ORÁCULO
-- ============================================================================
CREATE INDEX idx_oraculo_settings_user ON oraculo_settings(user_id);
CREATE INDEX idx_oraculo_instances_owner ON oraculo_instances(owner_id);
CREATE INDEX idx_oraculo_instances_slug ON oraculo_instances(slug);
CREATE INDEX idx_api_keys_instance ON oraculo_api_keys(instance_id);
CREATE INDEX idx_api_keys_hash ON oraculo_api_keys(key_hash);
CREATE INDEX idx_webhooks_instance ON oraculo_webhooks(instance_id);
CREATE INDEX idx_billing_instance ON oraculo_billing(instance_id);
CREATE INDEX idx_usage_logs_instance ON oraculo_usage_logs(instance_id);
CREATE INDEX idx_usage_logs_created ON oraculo_usage_logs(created_at DESC);
CREATE INDEX idx_alerts_instance ON oraculo_alerts(instance_id);

-- ============================================================================
-- SEÇÃO 9: FEATURES (PLANOS_CORE)
-- ============================================================================
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

CREATE INDEX idx_features_categoria ON features(categoria);

-- ============================================================================
-- SEÇÃO 10: FEATURE PROFILES
-- ============================================================================
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

CREATE INDEX idx_feature_profiles_key ON feature_profiles(profile_key);

-- ============================================================================
-- SEÇÃO 11: FEATURE PROFILE FEATURES (JOIN)
-- ============================================================================
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

CREATE INDEX idx_fpf_profile ON feature_profile_features(profile_id);
CREATE INDEX idx_fpf_feature ON feature_profile_features(feature_key);

-- ============================================================================
-- SEÇÃO 12: PLAN CATALOG
-- ============================================================================
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

CREATE INDEX idx_plan_catalog_slug ON plan_catalog(slug);
CREATE INDEX idx_plan_catalog_visivel ON plan_catalog(visivel);

-- ============================================================================
-- SEÇÃO 13: USER FEATURE OVERRIDES
-- ============================================================================
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

CREATE INDEX idx_user_overrides_user ON user_feature_overrides(user_id);
CREATE INDEX idx_user_overrides_feature ON user_feature_overrides(feature_key);

-- ============================================================================
-- SEÇÃO 14: USER SUBSCRIPTIONS CORE
-- ============================================================================
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

CREATE INDEX idx_user_subs_user ON user_subscriptions_core(user_id);
CREATE INDEX idx_user_subs_plan ON user_subscriptions_core(plan_slug);
CREATE INDEX idx_user_subs_status ON user_subscriptions_core(status);

-- ============================================================================
-- SEÇÃO 15: RLS - HABILITAR
-- ============================================================================
ALTER TABLE oraculo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_profile_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions_core ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEÇÃO 16: POLICIES ORÁCULO
-- ============================================================================
CREATE POLICY "Owners podem ver suas instancias" ON oraculo_instances 
  FOR SELECT USING (owner_id = auth.uid() OR publico = true);

CREATE POLICY "Sistema pode inserir logs" ON oraculo_usage_logs 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners podem ver alertas" ON oraculo_alerts 
  FOR SELECT USING (instance_id IS NULL OR EXISTS (SELECT 1 FROM oraculo_instances WHERE id = instance_id AND owner_id = auth.uid()));

-- ============================================================================
-- SEÇÃO 17: POLICIES PLANOS
-- ============================================================================
CREATE POLICY "Todos podem ver features" ON features FOR SELECT USING (true);
CREATE POLICY "Todos podem ver profiles" ON feature_profiles FOR SELECT USING (true);
CREATE POLICY "Todos podem ver profile features" ON feature_profile_features FOR SELECT USING (true);
CREATE POLICY "Todos podem ver catalogo" ON plan_catalog FOR SELECT USING (true);
CREATE POLICY "Usuario ve propria assinatura" ON user_subscriptions_core FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- SEÇÃO 18: DADOS - FEATURES
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
-- SEÇÃO 19: DADOS - FEATURE PROFILES
-- ============================================================================
INSERT INTO feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Plano gratuito', 'padrao'),
  ('profissional_v1', 'Profissional V1', 'Plano profissional', 'padrao'),
  ('defesa_v1', 'Defesa V1', 'Plano defesa', 'padrao'),
  ('white_label_v1', 'White Label V1', 'Plano enterprise', 'padrao');

-- ============================================================================
-- SEÇÃO 20: DADOS - PLAN CATALOG
-- ============================================================================
INSERT INTO plan_catalog (slug, nome_exibicao, descricao_curta, current_profile_id, preco_mensal_centavos, preco_anual_centavos, ordem_exibicao, tags, cor_destaque) VALUES
  ('free', 'Gratuito', 'Comece sua jornada', (SELECT id FROM feature_profiles WHERE profile_key = 'free_v1'), 0, 0, 1, ARRAY['basico'], '#6B7280'),
  ('profissional', 'Profissional', 'Para ir além', (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1'), 4990, 47900, 2, ARRAY['mais_vendido'], '#8B5CF6'),
  ('defesa', 'Defesa', 'Para profissionais', (SELECT id FROM feature_profiles WHERE profile_key = 'defesa_v1'), 9990, 95900, 3, ARRAY['profissional'], '#EC4899'),
  ('white-label', 'White Label', 'Sua marca', (SELECT id FROM feature_profiles WHERE profile_key = 'white_label_v1'), 49900, 479000, 4, ARRAY['enterprise'], '#F59E0B');

-- ============================================================================
-- SEÇÃO 21: DADOS - FEATURES POR PROFILE (FREE)
-- ============================================================================
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'diario', 'true'::jsonb, 3, 10, 30 FROM feature_profiles p WHERE p.profile_key = 'free_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'teste_clareza', 'true'::jsonb, 1, 3, 10 FROM feature_profiles p WHERE p.profile_key = 'free_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'chat_ia', 'true'::jsonb, 2, 7, 20 FROM feature_profiles p WHERE p.profile_key = 'free_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'timeline', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'free_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'conquistas', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'free_v1';

-- ============================================================================
-- SEÇÃO 22: DADOS - FEATURES POR PROFILE (PROFISSIONAL)
-- ============================================================================
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'diario', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'diario_ilimitado', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'teste_clareza', 'true'::jsonb, 5, 20, 60 FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'chat_ia', 'true'::jsonb, 10, 50, 150 FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'oraculo_v2', 'true'::jsonb, 5, 25, 75 FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT p.id, 'relatorios_pdf', 'true'::jsonb, 3, 10, 30 FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'timeline', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'plano_seguranca', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'carta_futuro', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'modo_espelho', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'conquistas', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'dashboard_avancado', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';
INSERT INTO feature_profile_features (profile_id, feature_key, valor)
SELECT p.id, 'suporte_prioritario', 'true'::jsonb FROM feature_profiles p WHERE p.profile_key = 'profissional_v1';

-- ============================================================================
-- SEÇÃO 23: FUNÇÕES SQL
-- ============================================================================
CREATE OR REPLACE FUNCTION get_effective_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile_id UUID;
  v_features JSONB := '{}'::jsonb;
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
  
  RETURN COALESCE(v_features, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_feature(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE v_features JSONB;
BEGIN
  v_features := get_effective_features(p_user_id);
  RETURN v_features ? p_feature_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT '✅ PARTE 1 CONCLUÍDA COM SUCESSO!' as status;

SELECT 'Tabelas Oráculo:' as info, COUNT(*) as total FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'oraculo%';

SELECT 'Features:' as tabela, COUNT(*) as registros FROM features
UNION ALL SELECT 'Profiles:', COUNT(*) FROM feature_profiles
UNION ALL SELECT 'Plans:', COUNT(*) FROM plan_catalog
UNION ALL SELECT 'Profile Features:', COUNT(*) FROM feature_profile_features;
