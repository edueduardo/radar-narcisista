-- ============================================================================
-- MIGRATION: PLANOS_CORE - Sistema de Features, Profiles e Catálogo
-- BLOCO 31-35 - Arquitetura de Planos do Radar e Gerador de SaaS
-- Criado em: 03/12/2025
-- ============================================================================
-- Executar no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- ETAPA 31: TABELA features
-- Features atômicas do sistema (cada funcionalidade é uma feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.features (
  feature_key TEXT PRIMARY KEY,                    -- Ex: 'diario', 'oraculo_v2', 'relatorios_pdf'
  nome TEXT NOT NULL,                              -- Nome legível
  descricao TEXT,                                  -- Descrição da feature
  tipo TEXT NOT NULL DEFAULT 'boolean' CHECK (tipo IN ('boolean', 'number', 'text')),
  categoria TEXT DEFAULT 'geral',                  -- Categoria para agrupamento
  metadata JSONB DEFAULT '{}'::jsonb,              -- Dados extras
  ordem_exibicao INTEGER DEFAULT 0,                -- Ordem na UI
  visivel_usuario BOOLEAN DEFAULT true,            -- Se aparece para o usuário
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_features_categoria ON public.features(categoria);
CREATE INDEX IF NOT EXISTS idx_features_ordem ON public.features(ordem_exibicao);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_features_updated_at ON public.features;
CREATE TRIGGER trigger_features_updated_at
  BEFORE UPDATE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION update_features_updated_at();

-- ============================================================================
-- ETAPA 31: TABELA feature_profiles
-- Perfis versionados de features (cada plano/promoção é um profile)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feature_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key TEXT NOT NULL UNIQUE,                -- Ex: 'free_v1', 'profissional_bf_2025'
  nome_exibicao TEXT NOT NULL,                     -- Nome para exibir
  descricao TEXT,                                  -- Descrição do profile
  tipo_profile TEXT DEFAULT 'padrao' CHECK (tipo_profile IN ('padrao', 'promo', 'cohort', 'exclusivo')),
  cohort_label TEXT,                               -- Label para campanhas (ex: 'black_friday_2025')
  marketable BOOLEAN DEFAULT true,                 -- Se pode ser vendido atualmente
  ativo BOOLEAN DEFAULT true,                      -- Se está ativo no sistema
  data_inicio TIMESTAMPTZ,                         -- Início da validade (para promos)
  data_fim TIMESTAMPTZ,                            -- Fim da validade (para promos)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feature_profiles_key ON public.feature_profiles(profile_key);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_tipo ON public.feature_profiles(tipo_profile);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_marketable ON public.feature_profiles(marketable);
CREATE INDEX IF NOT EXISTS idx_feature_profiles_cohort ON public.feature_profiles(cohort_label);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_feature_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_feature_profiles_updated_at ON public.feature_profiles;
CREATE TRIGGER trigger_feature_profiles_updated_at
  BEFORE UPDATE ON public.feature_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_profiles_updated_at();

-- ============================================================================
-- ETAPA 31: TABELA feature_profile_features (JOIN)
-- Relaciona profiles com features e seus valores
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feature_profile_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.feature_profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES public.features(feature_key) ON DELETE CASCADE,
  valor JSONB NOT NULL,                            -- Valor da feature (true/false, número, texto)
  limite_diario INTEGER,                           -- Limite diário (se aplicável)
  limite_semanal INTEGER,                          -- Limite semanal (se aplicável)
  limite_mensal INTEGER,                           -- Limite mensal (se aplicável)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, feature_key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fpf_profile ON public.feature_profile_features(profile_id);
CREATE INDEX IF NOT EXISTS idx_fpf_feature ON public.feature_profile_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_fpf_profile_feature ON public.feature_profile_features(profile_id, feature_key);

-- ============================================================================
-- ETAPA 31: TABELA plan_catalog
-- Catálogo de planos disponíveis para venda
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,                       -- Ex: 'free', 'profissional', 'defesa'
  nome_exibicao TEXT NOT NULL,                     -- Nome para exibir
  descricao_curta TEXT,                            -- Descrição curta para cards
  descricao_longa TEXT,                            -- Descrição completa
  current_profile_id UUID REFERENCES public.feature_profiles(id),  -- Profile atual
  stripe_price_id_mensal TEXT,                     -- ID do preço mensal no Stripe
  stripe_price_id_anual TEXT,                      -- ID do preço anual no Stripe
  preco_mensal_centavos INTEGER DEFAULT 0,         -- Preço em centavos (para exibição)
  preco_anual_centavos INTEGER DEFAULT 0,          -- Preço anual em centavos
  moeda TEXT DEFAULT 'BRL',                        -- Moeda
  tags TEXT[] DEFAULT '{}',                        -- Tags: 'destacado', 'mais_vendido', etc.
  ordem_exibicao INTEGER DEFAULT 0,                -- Ordem na página de planos
  visivel BOOLEAN DEFAULT true,                    -- Se aparece na página de planos
  cor_destaque TEXT,                               -- Cor para destaque visual
  icone TEXT,                                      -- Ícone do plano
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plan_catalog_slug ON public.plan_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_plan_catalog_visivel ON public.plan_catalog(visivel);
CREATE INDEX IF NOT EXISTS idx_plan_catalog_ordem ON public.plan_catalog(ordem_exibicao);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_plan_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_plan_catalog_updated_at ON public.plan_catalog;
CREATE TRIGGER trigger_plan_catalog_updated_at
  BEFORE UPDATE ON public.plan_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_catalog_updated_at();

-- ============================================================================
-- ETAPA 34: TABELA user_feature_overrides
-- Overrides individuais por usuário
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                           -- ID do usuário
  feature_key TEXT NOT NULL REFERENCES public.features(feature_key) ON DELETE CASCADE,
  override_type TEXT NOT NULL CHECK (override_type IN ('grant', 'revoke', 'limit_custom')),
  valor JSONB,                                     -- Valor customizado (se aplicável)
  limite_diario INTEGER,                           -- Limite diário customizado
  limite_semanal INTEGER,                          -- Limite semanal customizado
  limite_mensal INTEGER,                           -- Limite mensal customizado
  motivo TEXT,                                     -- Motivo do override
  concedido_por UUID,                              -- Admin que concedeu
  valido_ate TIMESTAMPTZ,                          -- Data de expiração (opcional)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_overrides_user ON public.user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_overrides_feature ON public.user_feature_overrides(feature_key);
CREATE INDEX IF NOT EXISTS idx_user_overrides_ativo ON public.user_feature_overrides(ativo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_overrides_updated_at ON public.user_feature_overrides;
CREATE TRIGGER trigger_user_overrides_updated_at
  BEFORE UPDATE ON public.user_feature_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_user_overrides_updated_at();

-- ============================================================================
-- TABELA: user_subscriptions_core
-- Assinaturas dos usuários com link para feature_profile
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,                    -- ID do usuário
  plan_slug TEXT NOT NULL,                         -- Slug do plano (free, profissional, etc.)
  plan_key TEXT,                                   -- Alias para compatibilidade com AI_CONFIG_CORE
  feature_profile_id UUID REFERENCES public.feature_profiles(id),  -- Profile atual
  stripe_subscription_id TEXT,                     -- ID da assinatura no Stripe
  stripe_customer_id TEXT,                         -- ID do cliente no Stripe
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused')),
  periodo TEXT DEFAULT 'mensal' CHECK (periodo IN ('mensal', 'anual', 'lifetime')),
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_fim TIMESTAMPTZ,                            -- Data de término (se cancelado)
  proximo_pagamento TIMESTAMPTZ,
  cohort_tag TEXT,                                 -- Tag de cohort para analytics
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_subs_user ON public.user_subscriptions_core(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan ON public.user_subscriptions_core(plan_slug);
CREATE INDEX IF NOT EXISTS idx_user_subs_plan_key ON public.user_subscriptions_core(plan_key);
CREATE INDEX IF NOT EXISTS idx_user_subs_profile ON public.user_subscriptions_core(feature_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON public.user_subscriptions_core(status);
CREATE INDEX IF NOT EXISTS idx_user_subs_cohort ON public.user_subscriptions_core(cohort_tag);

-- ============================================================================
-- FUNÇÃO: get_effective_features(user_id)
-- Retorna as features efetivas do usuário (profile + overrides)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_effective_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile_id UUID;
  v_features JSONB := '{}'::jsonb;
  v_overrides JSONB := '{}'::jsonb;
  v_result JSONB := '{}'::jsonb;
  r RECORD;
BEGIN
  -- 1. Buscar o profile do usuário
  SELECT feature_profile_id INTO v_profile_id
  FROM public.user_subscriptions_core
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  -- Se não tem assinatura, usar profile 'free_v1'
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.feature_profiles
    WHERE profile_key = 'free_v1'
    LIMIT 1;
  END IF;
  
  -- 2. Buscar features do profile
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
    FROM public.feature_profile_features fpf
    WHERE fpf.profile_id = v_profile_id;
  END IF;
  
  -- 3. Aplicar overrides individuais
  FOR r IN 
    SELECT feature_key, override_type, valor, limite_diario, limite_semanal, limite_mensal
    FROM public.user_feature_overrides
    WHERE user_id = p_user_id 
      AND ativo = true
      AND (valido_ate IS NULL OR valido_ate > NOW())
  LOOP
    IF r.override_type = 'grant' THEN
      -- Adiciona ou sobrescreve a feature
      v_features := v_features || jsonb_build_object(
        r.feature_key,
        jsonb_build_object(
          'valor', COALESCE(r.valor, 'true'::jsonb),
          'limite_diario', r.limite_diario,
          'limite_semanal', r.limite_semanal,
          'limite_mensal', r.limite_mensal,
          'override', true
        )
      );
    ELSIF r.override_type = 'revoke' THEN
      -- Remove a feature
      v_features := v_features - r.feature_key;
    ELSIF r.override_type = 'limit_custom' THEN
      -- Atualiza apenas os limites
      IF v_features ? r.feature_key THEN
        v_features := jsonb_set(
          v_features,
          ARRAY[r.feature_key],
          (v_features -> r.feature_key) || jsonb_build_object(
            'limite_diario', COALESCE(r.limite_diario, (v_features -> r.feature_key ->> 'limite_diario')::integer),
            'limite_semanal', COALESCE(r.limite_semanal, (v_features -> r.feature_key ->> 'limite_semanal')::integer),
            'limite_mensal', COALESCE(r.limite_mensal, (v_features -> r.feature_key ->> 'limite_mensal')::integer),
            'override', true
          )
        );
      END IF;
    END IF;
  END LOOP;
  
  RETURN COALESCE(v_features, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: has_feature(user_id, feature_key)
-- Verifica se o usuário tem acesso a uma feature específica
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_feature(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_features JSONB;
  v_valor JSONB;
BEGIN
  v_features := public.get_effective_features(p_user_id);
  
  IF NOT v_features ? p_feature_key THEN
    RETURN FALSE;
  END IF;
  
  v_valor := v_features -> p_feature_key -> 'valor';
  
  -- Se é boolean, retorna o valor
  IF jsonb_typeof(v_valor) = 'boolean' THEN
    RETURN v_valor::boolean;
  END IF;
  
  -- Se existe, considera como true
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: get_feature_limit(user_id, feature_key, periodo)
-- Retorna o limite de uma feature para um período
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_feature_limit(
  p_user_id UUID, 
  p_feature_key TEXT, 
  p_periodo TEXT DEFAULT 'diario'
)
RETURNS INTEGER AS $$
DECLARE
  v_features JSONB;
  v_limite INTEGER;
BEGIN
  v_features := public.get_effective_features(p_user_id);
  
  IF NOT v_features ? p_feature_key THEN
    RETURN 0;
  END IF;
  
  IF p_periodo = 'diario' THEN
    v_limite := (v_features -> p_feature_key ->> 'limite_diario')::integer;
  ELSIF p_periodo = 'semanal' THEN
    v_limite := (v_features -> p_feature_key ->> 'limite_semanal')::integer;
  ELSIF p_periodo = 'mensal' THEN
    v_limite := (v_features -> p_feature_key ->> 'limite_mensal')::integer;
  END IF;
  
  RETURN COALESCE(v_limite, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Features: apenas admins podem editar
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver features" ON public.features;
CREATE POLICY "Todos podem ver features" ON public.features
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar features" ON public.features;
CREATE POLICY "Admins podem editar features" ON public.features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Feature Profiles: apenas admins podem editar
ALTER TABLE public.feature_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver profiles" ON public.feature_profiles;
CREATE POLICY "Todos podem ver profiles" ON public.feature_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar profiles" ON public.feature_profiles;
CREATE POLICY "Admins podem editar profiles" ON public.feature_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Feature Profile Features: apenas admins podem editar
ALTER TABLE public.feature_profile_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver profile features" ON public.feature_profile_features;
CREATE POLICY "Todos podem ver profile features" ON public.feature_profile_features
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar profile features" ON public.feature_profile_features;
CREATE POLICY "Admins podem editar profile features" ON public.feature_profile_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Plan Catalog: apenas admins podem editar
ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver catalogo" ON public.plan_catalog;
CREATE POLICY "Todos podem ver catalogo" ON public.plan_catalog
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem editar catalogo" ON public.plan_catalog;
CREATE POLICY "Admins podem editar catalogo" ON public.plan_catalog
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- User Overrides: apenas admins podem ver/editar
ALTER TABLE public.user_feature_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver overrides" ON public.user_feature_overrides;
CREATE POLICY "Admins podem ver overrides" ON public.user_feature_overrides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admins podem editar overrides" ON public.user_feature_overrides;
CREATE POLICY "Admins podem editar overrides" ON public.user_feature_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- User Subscriptions: usuário vê a própria, admin vê todas
ALTER TABLE public.user_subscriptions_core ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve propria assinatura" ON public.user_subscriptions_core;
CREATE POLICY "Usuario ve propria assinatura" ON public.user_subscriptions_core
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON public.user_subscriptions_core;
CREATE POLICY "Admins podem ver todas assinaturas" ON public.user_subscriptions_core
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admins podem editar assinaturas" ON public.user_subscriptions_core;
CREATE POLICY "Admins podem editar assinaturas" ON public.user_subscriptions_core
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- DADOS INICIAIS: Features do Radar Narcisista
-- ============================================================================

INSERT INTO public.features (feature_key, nome, descricao, tipo, categoria, ordem_exibicao) VALUES
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
-- DADOS INICIAIS: Feature Profiles
-- ============================================================================

INSERT INTO public.feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Plano gratuito básico', 'padrao'),
  ('profissional_v1', 'Profissional V1', 'Plano profissional completo', 'padrao'),
  ('defesa_v1', 'Defesa V1', 'Plano para profissionais de defesa', 'padrao'),
  ('white_label_v1', 'White Label V1', 'Plano enterprise com white label', 'padrao')
ON CONFLICT (profile_key) DO NOTHING;

-- ============================================================================
-- DADOS INICIAIS: Features por Profile
-- ============================================================================

-- Free V1
INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
  feature_key,
  valor::jsonb,
  limite_diario::integer,
  limite_semanal::integer,
  limite_mensal::integer
FROM (VALUES
  ('diario', 'true', '3', '10', '30'),
  ('teste_clareza', 'true', '1', '3', '10'),
  ('chat_ia', 'true', '2', '7', '20'),
  ('timeline', 'true', NULL, NULL, NULL),
  ('conquistas', 'true', NULL, NULL, NULL)
) AS t(feature_key, valor, limite_diario, limite_semanal, limite_mensal)
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- Profissional V1
INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'profissional_v1'),
  feature_key,
  valor::jsonb,
  limite_diario::integer,
  limite_semanal::integer,
  limite_mensal::integer
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

-- Defesa V1
INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'defesa_v1'),
  feature_key,
  valor::jsonb,
  limite_diario::integer,
  limite_semanal::integer,
  limite_mensal::integer
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

-- White Label V1
INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'white_label_v1'),
  feature_key,
  valor::jsonb,
  limite_diario::integer,
  limite_semanal::integer,
  limite_mensal::integer
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
-- DADOS INICIAIS: Plan Catalog
-- ============================================================================

INSERT INTO public.plan_catalog (slug, nome_exibicao, descricao_curta, current_profile_id, preco_mensal_centavos, preco_anual_centavos, ordem_exibicao, tags, cor_destaque) VALUES
  ('free', 'Gratuito', 'Comece sua jornada de clareza', 
   (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
   0, 0, 1, ARRAY['basico'], '#6B7280'),
  ('profissional', 'Profissional', 'Para quem quer ir além', 
   (SELECT id FROM public.feature_profiles WHERE profile_key = 'profissional_v1'),
   4990, 47900, 2, ARRAY['mais_vendido', 'destacado'], '#8B5CF6'),
  ('defesa', 'Defesa', 'Para profissionais de saúde e direito', 
   (SELECT id FROM public.feature_profiles WHERE profile_key = 'defesa_v1'),
   9990, 95900, 3, ARRAY['profissional'], '#EC4899'),
  ('white-label', 'White Label', 'Sua marca, nossa tecnologia', 
   (SELECT id FROM public.feature_profiles WHERE profile_key = 'white_label_v1'),
   49900, 479000, 4, ARRAY['enterprise'], '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TRIGGER: Sincronizar plan_key com plan_slug
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_plan_key()
RETURNS TRIGGER AS $$
BEGIN
  NEW.plan_key := NEW.plan_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_plan_key ON public.user_subscriptions_core;
CREATE TRIGGER trigger_sync_plan_key
  BEFORE INSERT OR UPDATE ON public.user_subscriptions_core
  FOR EACH ROW
  EXECUTE FUNCTION sync_plan_key();

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT '✅ MIGRATION PLANOS_CORE CONCLUÍDA!' as status;
SELECT 'Features: ' || COUNT(*) FROM public.features;
SELECT 'Profiles: ' || COUNT(*) FROM public.feature_profiles;
SELECT 'Planos: ' || COUNT(*) FROM public.plan_catalog;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.features IS 'Features atômicas do sistema - BLOCO 31-35 PLANOS_CORE';
COMMENT ON TABLE public.feature_profiles IS 'Perfis versionados de features - BLOCO 31-35 PLANOS_CORE';
COMMENT ON TABLE public.feature_profile_features IS 'Relacionamento entre profiles e features - BLOCO 31-35 PLANOS_CORE';
COMMENT ON TABLE public.plan_catalog IS 'Catálogo de planos disponíveis - BLOCO 31-35 PLANOS_CORE';
COMMENT ON TABLE public.user_feature_overrides IS 'Overrides individuais por usuário - BLOCO 31-35 PLANOS_CORE';
COMMENT ON TABLE public.user_subscriptions_core IS 'Assinaturas dos usuários - BLOCO 31-35 PLANOS_CORE';
COMMENT ON FUNCTION public.get_effective_features IS 'Retorna features efetivas do usuário (profile + overrides)';
COMMENT ON FUNCTION public.has_feature IS 'Verifica se usuário tem acesso a uma feature';
COMMENT ON FUNCTION public.get_feature_limit IS 'Retorna limite de uma feature para um período';

-- ============================================================================
-- FIM DA MIGRATION PLANOS_CORE
-- ============================================================================
