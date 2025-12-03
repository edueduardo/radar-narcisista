-- ============================================================================
-- MIGRATION: PLANOS_CORE (VERSÃO SIMPLIFICADA)
-- BLOCO 31-35 - Arquitetura de Planos do Radar e Gerador de SaaS
-- Criado em: 03/12/2025
-- ============================================================================
-- Esta versão não tem RLS para evitar erros de dependência
-- ============================================================================

-- ============================================================================
-- TABELA 1: features
-- ============================================================================

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

-- ============================================================================
-- TABELA 2: feature_profiles
-- ============================================================================

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

-- ============================================================================
-- TABELA 3: feature_profile_features (JOIN)
-- ============================================================================

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

-- ============================================================================
-- TABELA 4: plan_catalog
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  descricao_curta TEXT,
  descricao_longa TEXT,
  current_profile_id UUID REFERENCES public.feature_profiles(id),
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

CREATE INDEX IF NOT EXISTS idx_plan_catalog_slug ON public.plan_catalog(slug);

-- ============================================================================
-- TABELA 5: user_feature_overrides
-- ============================================================================

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

-- ============================================================================
-- TABELA 6: user_subscriptions_core
-- ============================================================================

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
-- FUNÇÃO: has_feature(user_id, feature_key)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_feature(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile_id UUID;
  v_has BOOLEAN := false;
BEGIN
  -- Buscar profile do usuário
  SELECT feature_profile_id INTO v_profile_id
  FROM public.user_subscriptions_core
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  -- Se não tem assinatura, usar profile free
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.feature_profiles
    WHERE profile_key = 'free_v1'
    LIMIT 1;
  END IF;
  
  -- Verificar se feature existe no profile
  IF v_profile_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.feature_profile_features
      WHERE profile_id = v_profile_id AND feature_key = p_feature_key
    ) INTO v_has;
  END IF;
  
  -- Verificar override
  IF EXISTS(
    SELECT 1 FROM public.user_feature_overrides
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND override_type = 'grant'
      AND ativo = true
  ) THEN
    v_has := true;
  END IF;
  
  IF EXISTS(
    SELECT 1 FROM public.user_feature_overrides
    WHERE user_id = p_user_id 
      AND feature_key = p_feature_key 
      AND override_type = 'revoke'
      AND ativo = true
  ) THEN
    v_has := false;
  END IF;
  
  RETURN v_has;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: get_feature_limit(user_id, feature_key, periodo)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_feature_limit(
  p_user_id UUID, 
  p_feature_key TEXT, 
  p_periodo TEXT DEFAULT 'diario'
)
RETURNS INTEGER AS $$
DECLARE
  v_profile_id UUID;
  v_limite INTEGER := 0;
BEGIN
  -- Buscar profile do usuário
  SELECT feature_profile_id INTO v_profile_id
  FROM public.user_subscriptions_core
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  -- Se não tem assinatura, usar profile free
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.feature_profiles
    WHERE profile_key = 'free_v1'
    LIMIT 1;
  END IF;
  
  -- Buscar limite do profile
  IF v_profile_id IS NOT NULL THEN
    IF p_periodo = 'diario' THEN
      SELECT limite_diario INTO v_limite
      FROM public.feature_profile_features
      WHERE profile_id = v_profile_id AND feature_key = p_feature_key;
    ELSIF p_periodo = 'semanal' THEN
      SELECT limite_semanal INTO v_limite
      FROM public.feature_profile_features
      WHERE profile_id = v_profile_id AND feature_key = p_feature_key;
    ELSIF p_periodo = 'mensal' THEN
      SELECT limite_mensal INTO v_limite
      FROM public.feature_profile_features
      WHERE profile_id = v_profile_id AND feature_key = p_feature_key;
    END IF;
  END IF;
  
  -- Verificar override de limite
  SELECT COALESCE(
    CASE p_periodo
      WHEN 'diario' THEN limite_diario
      WHEN 'semanal' THEN limite_semanal
      WHEN 'mensal' THEN limite_mensal
    END,
    v_limite
  ) INTO v_limite
  FROM public.user_feature_overrides
  WHERE user_id = p_user_id 
    AND feature_key = p_feature_key 
    AND override_type = 'limit_custom'
    AND ativo = true;
  
  RETURN COALESCE(v_limite, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED: Features do Radar Narcisista
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
-- SEED: Feature Profiles
-- ============================================================================

INSERT INTO public.feature_profiles (profile_key, nome_exibicao, descricao, tipo_profile) VALUES
  ('free_v1', 'Gratuito V1', 'Plano gratuito básico', 'padrao'),
  ('profissional_v1', 'Profissional V1', 'Plano profissional completo', 'padrao'),
  ('defesa_v1', 'Defesa V1', 'Plano para profissionais de defesa', 'padrao'),
  ('white_label_v1', 'White Label V1', 'Plano enterprise com white label', 'padrao')
ON CONFLICT (profile_key) DO NOTHING;

-- ============================================================================
-- SEED: Features por Profile - FREE
-- ============================================================================

INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
  'diario', 'true'::jsonb, 3, 10, 30
WHERE EXISTS (SELECT 1 FROM public.feature_profiles WHERE profile_key = 'free_v1')
ON CONFLICT (profile_id, feature_key) DO NOTHING;

INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
  'teste_clareza', 'true'::jsonb, 1, 3, 10
WHERE EXISTS (SELECT 1 FROM public.feature_profiles WHERE profile_key = 'free_v1')
ON CONFLICT (profile_id, feature_key) DO NOTHING;

INSERT INTO public.feature_profile_features (profile_id, feature_key, valor, limite_diario, limite_semanal, limite_mensal)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
  'chat_ia', 'true'::jsonb, 2, 7, 20
WHERE EXISTS (SELECT 1 FROM public.feature_profiles WHERE profile_key = 'free_v1')
ON CONFLICT (profile_id, feature_key) DO NOTHING;

INSERT INTO public.feature_profile_features (profile_id, feature_key, valor)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
  'timeline', 'true'::jsonb
WHERE EXISTS (SELECT 1 FROM public.feature_profiles WHERE profile_key = 'free_v1')
ON CONFLICT (profile_id, feature_key) DO NOTHING;

INSERT INTO public.feature_profile_features (profile_id, feature_key, valor)
SELECT 
  (SELECT id FROM public.feature_profiles WHERE profile_key = 'free_v1'),
  'conquistas', 'true'::jsonb
WHERE EXISTS (SELECT 1 FROM public.feature_profiles WHERE profile_key = 'free_v1')
ON CONFLICT (profile_id, feature_key) DO NOTHING;

-- ============================================================================
-- SEED: Plan Catalog
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
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT '✅ MIGRATION PLANOS_CORE (SIMPLES) CONCLUÍDA!' as status;
SELECT 'Features: ' || COUNT(*) FROM public.features;
SELECT 'Profiles: ' || COUNT(*) FROM public.feature_profiles;
SELECT 'Planos: ' || COUNT(*) FROM public.plan_catalog;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
