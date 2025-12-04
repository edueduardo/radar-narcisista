-- ================================================================================
-- SQL_CONSOLIDADO_02_ADDONS_AI_MENUS.sql
-- TAREFAS 3, 4 e 5 - Migrations pendentes + Tabelas faltantes
-- Data: 04/12/2025
-- ================================================================================
-- 
-- EXECUTAR NO SUPABASE SQL EDITOR
-- 
-- Este arquivo consolida:
-- - TAREFA 3: migrate-user-addons.sql + migrate-planos-core.sql
-- - TAREFA 4: Unificação de ai_providers (já existe ai_providers_core)
-- - TAREFA 5: Tabelas faltantes (ai_menus, ai_menu_providers, ai_usage_logs, admin_menu_help)
--
-- ================================================================================

-- ================================================================================
-- PARTE 1: USER ADDONS (TAREFA 3)
-- ================================================================================

-- Tabela para armazenar add-ons comprados pelos usuários
CREATE TABLE IF NOT EXISTS public.user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_key TEXT NOT NULL,
  stripe_price_id TEXT,
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  credits_total INTEGER,
  credits_remaining INTEGER,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON public.user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_addon_key ON public.user_addons(addon_key);
CREATE INDEX IF NOT EXISTS idx_user_addons_status ON public.user_addons(status);
CREATE INDEX IF NOT EXISTS idx_user_addons_stripe_session ON public.user_addons(stripe_session_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_addons_updated_at ON public.user_addons;
CREATE TRIGGER trigger_user_addons_updated_at
  BEFORE UPDATE ON public.user_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_user_addons_updated_at();

-- RLS
ALTER TABLE public.user_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addons" ON public.user_addons;
CREATE POLICY "Users can view own addons" ON public.user_addons
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert addons" ON public.user_addons;
CREATE POLICY "Service role can insert addons" ON public.user_addons
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update addons" ON public.user_addons;
CREATE POLICY "Service role can update addons" ON public.user_addons
  FOR UPDATE USING (true);

-- Funções auxiliares
CREATE OR REPLACE FUNCTION public.has_active_addon(p_user_id UUID, p_addon_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_addons
    WHERE user_id = p_user_id
      AND addon_key = p_addon_key
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_addon_credits(p_user_id UUID, p_addon_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_credits
  FROM public.user_addons
  WHERE user_id = p_user_id
    AND addon_key = p_addon_key
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND credits_remaining > 0;
  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.consume_addon_credit(p_user_id UUID, p_addon_key TEXT, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_addon_id UUID;
  v_credits INTEGER;
BEGIN
  SELECT id, credits_remaining INTO v_addon_id, v_credits
  FROM public.user_addons
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
  
  UPDATE public.user_addons
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = v_addon_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================
-- PARTE 2: FEATURES E PROFILES (TAREFA 3)
-- ================================================================================

-- Features atômicas do sistema
CREATE TABLE IF NOT EXISTS public.features (
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

CREATE INDEX IF NOT EXISTS idx_features_categoria ON public.features(categoria);
CREATE INDEX IF NOT EXISTS idx_features_ordem ON public.features(ordem_exibicao);

-- Feature Profiles (perfis versionados)
CREATE TABLE IF NOT EXISTS public.feature_profiles (
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

CREATE INDEX IF NOT EXISTS idx_feature_profiles_key ON public.feature_profiles(profile_key);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_tipo ON public.feature_profiles(tipo_profile);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_marketable ON public.feature_profiles(marketable);

-- Feature Profile Features (JOIN)
CREATE TABLE IF NOT EXISTS public.feature_profile_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.feature_profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES public.features(feature_key) ON DELETE CASCADE,
  valor JSONB NOT NULL,
  limite_diario INTEGER,
  limite_semanal INTEGER,
  limite_mensal INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_fpf_profile ON public.feature_profile_features(profile_id);
CREATE INDEX IF NOT EXISTS idx_fpf_feature ON public.feature_profile_features(feature_key);

-- User Feature Overrides
CREATE TABLE IF NOT EXISTS public.user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL REFERENCES public.features(feature_key) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_user_overrides_user ON public.user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_overrides_feature ON public.user_feature_overrides(feature_key);

-- User Subscriptions Core
CREATE TABLE IF NOT EXISTS public.user_subscriptions_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_slug TEXT NOT NULL,
  plan_key TEXT,
  feature_profile_id UUID REFERENCES public.feature_profiles(id),
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

CREATE INDEX IF NOT EXISTS idx_user_subs_user ON public.user_subscriptions_core(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan ON public.user_subscriptions_core(plan_slug);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON public.user_subscriptions_core(status);

-- RLS para features
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos podem ver features" ON public.features;
CREATE POLICY "Todos podem ver features" ON public.features FOR SELECT USING (true);

ALTER TABLE public.feature_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos podem ver profiles" ON public.feature_profiles;
CREATE POLICY "Todos podem ver profiles" ON public.feature_profiles FOR SELECT USING (true);

ALTER TABLE public.feature_profile_features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos podem ver profile features" ON public.feature_profile_features;
CREATE POLICY "Todos podem ver profile features" ON public.feature_profile_features FOR SELECT USING (true);

ALTER TABLE public.user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions_core ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve propria assinatura" ON public.user_subscriptions_core;
CREATE POLICY "Usuario ve propria assinatura" ON public.user_subscriptions_core
  FOR SELECT USING (user_id = auth.uid());

-- ================================================================================
-- PARTE 3: AI CONFIG CORE (TAREFA 4 - já existe, apenas garantir)
-- ================================================================================

-- ai_providers_core (tabela unificada - TAREFA 4)
CREATE TABLE IF NOT EXISTS public.ai_providers_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'desativado', 'em_teste')),
  custo_relativo NUMERIC DEFAULT 1.0,
  api_key_env TEXT,
  modelo_padrao TEXT,
  max_tokens_padrao INTEGER DEFAULT 4096,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON public.ai_providers_core(status);

-- ai_features_core
CREATE TABLE IF NOT EXISTS public.ai_features_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  descricao_curta TEXT,
  categoria TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_features_categoria ON public.ai_features_core(categoria);

-- ai_feature_providers_core
CREATE TABLE IF NOT EXISTS public.ai_feature_providers_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.ai_providers_core(id) ON DELETE CASCADE,
  papel TEXT NOT NULL DEFAULT 'geracao' CHECK (papel IN ('analise', 'votacao', 'consenso', 'transparencia', 'geracao', 'traducao', 'resumo')),
  peso NUMERIC DEFAULT 1.0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, provider_id, papel)
);

-- ai_plan_matrix
CREATE TABLE IF NOT EXISTS public.ai_plan_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL,
  feature_id UUID NOT NULL REFERENCES public.ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.ai_providers_core(id) ON DELETE CASCADE,
  perfil TEXT NOT NULL DEFAULT 'usuaria' CHECK (perfil IN ('usuaria', 'profissional', 'admin', 'whitelabel', 'gerador')),
  papel TEXT NOT NULL DEFAULT 'geracao',
  limite_diario INTEGER,
  limite_mensal INTEGER,
  ativo BOOLEAN DEFAULT true,
  origem TEXT DEFAULT 'padrao' CHECK (origem IN ('padrao', 'promo', 'exclusivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_key, feature_id, provider_id, perfil, papel)
);

CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_plan ON public.ai_plan_matrix(plan_key);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_feature ON public.ai_plan_matrix(feature_id);

-- ai_group_overrides
CREATE TABLE IF NOT EXISTS public.ai_group_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL,
  user_id UUID,
  plan_key_base TEXT NOT NULL,
  feature_id UUID NOT NULL REFERENCES public.ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.ai_providers_core(id) ON DELETE CASCADE,
  perfil TEXT NOT NULL DEFAULT 'usuaria',
  papel TEXT NOT NULL DEFAULT 'geracao',
  limite_diario INTEGER,
  limite_mensal INTEGER,
  ativo BOOLEAN DEFAULT true,
  valido_ate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_group_overrides_group ON public.ai_group_overrides(group_key);
CREATE INDEX IF NOT EXISTS idx_ai_group_overrides_user ON public.ai_group_overrides(user_id);

-- RLS para AI config
ALTER TABLE public.ai_providers_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_features_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feature_providers_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_plan_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_group_overrides ENABLE ROW LEVEL SECURITY;

-- Policies de leitura pública para AI config
DROP POLICY IF EXISTS "Todos podem ver ai_providers" ON public.ai_providers_core;
CREATE POLICY "Todos podem ver ai_providers" ON public.ai_providers_core FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos podem ver ai_features" ON public.ai_features_core;
CREATE POLICY "Todos podem ver ai_features" ON public.ai_features_core FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos podem ver ai_feature_providers" ON public.ai_feature_providers_core;
CREATE POLICY "Todos podem ver ai_feature_providers" ON public.ai_feature_providers_core FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos podem ver ai_plan_matrix" ON public.ai_plan_matrix;
CREATE POLICY "Todos podem ver ai_plan_matrix" ON public.ai_plan_matrix FOR SELECT USING (true);

-- ================================================================================
-- PARTE 4: TABELAS FALTANTES (TAREFA 5)
-- ================================================================================

-- ai_menus: Menus/features do sistema que usam IA
CREATE TABLE IF NOT EXISTS public.ai_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  descricao TEXT,
  route TEXT,
  categoria TEXT DEFAULT 'geral',
  requer_ia BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_menus_key ON public.ai_menus(menu_key);
CREATE INDEX IF NOT EXISTS idx_ai_menus_categoria ON public.ai_menus(categoria);
CREATE INDEX IF NOT EXISTS idx_ai_menus_ativo ON public.ai_menus(ativo);

-- ai_menu_providers: Ligação menu → provider
CREATE TABLE IF NOT EXISTS public.ai_menu_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.ai_menus(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.ai_providers_core(id) ON DELETE CASCADE,
  papel TEXT NOT NULL DEFAULT 'geracao',
  peso NUMERIC DEFAULT 1.0,
  ativo BOOLEAN DEFAULT true,
  limite_diario INTEGER,
  limite_mensal INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(menu_id, provider_id, papel)
);

CREATE INDEX IF NOT EXISTS idx_ai_menu_providers_menu ON public.ai_menu_providers(menu_id);
CREATE INDEX IF NOT EXISTS idx_ai_menu_providers_provider ON public.ai_menu_providers(provider_id);

-- ai_usage_logs: Logs de uso de IA
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_slug TEXT NOT NULL,
  feature_slug TEXT,
  menu_key TEXT,
  modelo TEXT,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  custo_estimado NUMERIC DEFAULT 0,
  latencia_ms INTEGER,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  erro TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON public.ai_usage_logs(provider_slug);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature ON public.ai_usage_logs(feature_slug);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_menu ON public.ai_usage_logs(menu_key);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created ON public.ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_status ON public.ai_usage_logs(status);

-- admin_menu_help: Textos de ajuda por menu
CREATE TABLE IF NOT EXISTS public.admin_menu_help (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key TEXT NOT NULL UNIQUE,
  route TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'admin',
  menu_label TEXT NOT NULL,
  titulo TEXT NOT NULL,
  o_que_e TEXT,
  para_que_serve TEXT,
  quando_usar TEXT,
  como_funciona TEXT,
  passo_a_passo TEXT[],
  exemplos TEXT[],
  avisos TEXT[],
  ligacoes_com_outros_menus TEXT[],
  ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_menu_help_key ON public.admin_menu_help(menu_key);
CREATE INDEX IF NOT EXISTS idx_admin_menu_help_route ON public.admin_menu_help(route);
CREATE INDEX IF NOT EXISTS idx_admin_menu_help_audience ON public.admin_menu_help(audience);

-- RLS para tabelas novas
ALTER TABLE public.ai_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_menu_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_menu_help ENABLE ROW LEVEL SECURITY;

-- Policies de leitura
DROP POLICY IF EXISTS "Todos podem ver ai_menus" ON public.ai_menus;
CREATE POLICY "Todos podem ver ai_menus" ON public.ai_menus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos podem ver ai_menu_providers" ON public.ai_menu_providers;
CREATE POLICY "Todos podem ver ai_menu_providers" ON public.ai_menu_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos podem ver admin_menu_help" ON public.admin_menu_help;
CREATE POLICY "Todos podem ver admin_menu_help" ON public.admin_menu_help FOR SELECT USING (true);

-- Logs: usuário vê os próprios, admin vê todos
DROP POLICY IF EXISTS "Usuario ve proprios logs" ON public.ai_usage_logs;
CREATE POLICY "Usuario ve proprios logs" ON public.ai_usage_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service pode inserir logs" ON public.ai_usage_logs;
CREATE POLICY "Service pode inserir logs" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- ================================================================================
-- PARTE 5: SEED DATA
-- ================================================================================

-- Provedores de IA
INSERT INTO public.ai_providers_core (slug, display_name, status, custo_relativo, api_key_env, modelo_padrao) VALUES
  ('openai', 'OpenAI GPT', 'ativo', 1.0, 'OPENAI_API_KEY', 'gpt-4o-mini'),
  ('anthropic', 'Anthropic Claude', 'ativo', 1.2, 'ANTHROPIC_API_KEY', 'claude-3-haiku-20240307'),
  ('together', 'Together AI', 'ativo', 0.5, 'TOGETHER_API_KEY', 'meta-llama/Llama-3-70b-chat-hf'),
  ('groq', 'Groq', 'em_teste', 0.3, 'GROQ_API_KEY', 'llama3-70b-8192'),
  ('gemini', 'Google Gemini', 'desativado', 0.8, 'GEMINI_API_KEY', 'gemini-pro')
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  custo_relativo = EXCLUDED.custo_relativo,
  modelo_padrao = EXCLUDED.modelo_padrao;

-- Features de IA
INSERT INTO public.ai_features_core (slug, display_name, descricao_curta, categoria) VALUES
  ('diario_analise', 'Análise de Diário', 'Analisa entradas do diário emocional', 'analise'),
  ('teste_clareza', 'Teste de Clareza', 'Avalia respostas do teste de clareza', 'analise'),
  ('chat_usuario', 'Chat com Usuária', 'Conversa de suporte com a usuária', 'chat'),
  ('oraculo_admin', 'Oráculo Admin', 'IA de suporte para administradores', 'admin'),
  ('oraculo_profissional', 'Oráculo Profissional', 'IA de suporte para profissionais', 'chat'),
  ('curadoria_conteudo', 'Curadoria de Conteúdo', 'Sugere conteúdos relevantes', 'geracao'),
  ('relatorios_juridicos', 'Relatórios Jurídicos', 'Gera relatórios para advogados', 'geracao'),
  ('resumo_chat', 'Resumo de Chat', 'Resume conversas para o diário', 'resumo'),
  ('plano_seguranca', 'Plano de Segurança', 'Auxilia na criação do plano de segurança', 'analise')
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  descricao_curta = EXCLUDED.descricao_curta;

-- Menus que usam IA
INSERT INTO public.ai_menus (menu_key, display_name, descricao, route, categoria, ordem) VALUES
  ('chat', 'Chat com IA', 'Conversa com a IA de suporte', '/dashboard/chat', 'usuario', 1),
  ('diario', 'Diário', 'Registro e análise de episódios', '/dashboard/diario', 'usuario', 2),
  ('clareza', 'Teste de Clareza', 'Avaliação de clareza emocional', '/dashboard/clareza', 'usuario', 3),
  ('plano_seguranca', 'Plano de Segurança', 'Criação do plano de segurança', '/dashboard/plano-seguranca', 'usuario', 4),
  ('oraculo', 'Oráculo', 'IA de suporte para admin', '/admin/oraculo', 'admin', 1),
  ('ia_matrix', 'Matriz de IAs', 'Configuração de IAs', '/admin/ia-matrix', 'admin', 2),
  ('ia_analytics', 'IA Analytics', 'Métricas de uso de IA', '/admin/ia-analytics', 'admin', 3)
ON CONFLICT (menu_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  route = EXCLUDED.route;

-- Features do sistema
INSERT INTO public.features (feature_key, nome, descricao, tipo, categoria, ordem_exibicao) VALUES
  ('diario', 'Diário de Emoções', 'Registro de episódios emocionais', 'boolean', 'core', 1),
  ('chat', 'Chat com IA', 'Conversa com assistente de IA', 'boolean', 'core', 2),
  ('teste_clareza', 'Teste de Clareza', 'Avaliação de clareza emocional', 'boolean', 'core', 3),
  ('plano_seguranca', 'Plano de Segurança', 'Criação de plano de segurança', 'boolean', 'core', 4),
  ('pdf_export', 'Exportar PDF', 'Exportação de relatórios em PDF', 'boolean', 'premium', 5),
  ('voice_input', 'Entrada por Voz', 'Gravação de áudio para transcrição', 'boolean', 'premium', 6),
  ('ia_colaborativa', 'IA Colaborativa', 'Múltiplas IAs trabalhando juntas', 'boolean', 'premium', 7),
  ('historico_completo', 'Histórico Completo', 'Acesso a todo o histórico', 'boolean', 'premium', 8)
ON CONFLICT (feature_key) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao;

-- Feature Profiles padrão
INSERT INTO public.feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Perfil gratuito padrão', 'padrao'),
  ('basic_v1', 'Básico V1', 'Perfil básico padrão', 'padrao'),
  ('premium_v1', 'Premium V1', 'Perfil premium padrão', 'padrao'),
  ('professional_v1', 'Profissional V1', 'Perfil profissional padrão', 'padrao')
ON CONFLICT (profile_key) DO NOTHING;

-- ================================================================================
-- COMENTÁRIOS
-- ================================================================================

COMMENT ON TABLE public.user_addons IS 'Add-ons comprados pelos usuários';
COMMENT ON TABLE public.features IS 'Features atômicas do sistema';
COMMENT ON TABLE public.feature_profiles IS 'Perfis versionados de features';
COMMENT ON TABLE public.ai_menus IS 'Menus/features que usam IA';
COMMENT ON TABLE public.ai_menu_providers IS 'Ligação menu → provider de IA';
COMMENT ON TABLE public.ai_usage_logs IS 'Logs de uso de IA para analytics';
COMMENT ON TABLE public.admin_menu_help IS 'Textos de ajuda por menu do admin';

-- ================================================================================
-- FIM DO SQL_CONSOLIDADO_02
-- ================================================================================
