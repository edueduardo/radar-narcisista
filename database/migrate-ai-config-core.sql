-- ============================================================================
-- MIGRATION: AI_CONFIG_CORE
-- BLOCO 31-35 - Configuração Dinâmica de IAs
-- Data: 03/12/2025
-- ============================================================================
-- 
-- Este módulo é COMPLEMENTAR ao PLANOS_CORE:
-- - PLANOS_CORE: controla QUAIS FEATURES o usuário tem acesso
-- - AI_CONFIG_CORE: controla QUAIS IAs trabalham em cada feature
--
-- ============================================================================

-- ============================================================================
-- TABELA 1: ai_providers_core
-- Lista de provedores de IA disponíveis
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_providers_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'desativado', 'em_teste')),
  custo_relativo NUMERIC DEFAULT 1.0,
  api_key_env TEXT, -- Nome da variável de ambiente (ex: OPENAI_API_KEY)
  modelo_padrao TEXT, -- Modelo padrão (ex: gpt-4o-mini)
  max_tokens_padrao INTEGER DEFAULT 4096,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA 2: ai_features_core
-- Features que usam IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_features_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  descricao_curta TEXT,
  categoria TEXT DEFAULT 'geral', -- ex: 'analise', 'chat', 'geracao', 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA 3: ai_feature_providers_core
-- Quais IAs podem trabalhar em cada feature (configuração global)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_feature_providers_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers_core(id) ON DELETE CASCADE,
  papel TEXT NOT NULL DEFAULT 'geracao' CHECK (papel IN ('analise', 'votacao', 'consenso', 'transparencia', 'geracao', 'traducao', 'resumo')),
  peso NUMERIC DEFAULT 1.0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, provider_id, papel)
);

-- ============================================================================
-- TABELA 4: ai_plan_matrix
-- Configuração de IA por PLANO + FEATURE + PERFIL
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_plan_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL, -- ex: 'free', 'profissional', 'premium', 'promo_bf_2025'
  feature_id UUID NOT NULL REFERENCES ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers_core(id) ON DELETE CASCADE,
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

-- ============================================================================
-- TABELA 5: ai_group_overrides
-- Overrides para grupos especiais (Black Friday, beta, cliente exclusivo)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_group_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL, -- ex: 'black_friday_2025', 'grupo_beta', 'cliente_vip_123'
  user_id UUID, -- Se preenchido, override é só para este usuário
  plan_key_base TEXT NOT NULL, -- Plano base que está sendo sobrescrito
  feature_id UUID NOT NULL REFERENCES ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers_core(id) ON DELETE CASCADE,
  perfil TEXT NOT NULL DEFAULT 'usuaria',
  papel TEXT NOT NULL DEFAULT 'geracao',
  limite_diario INTEGER,
  limite_mensal INTEGER,
  ativo BOOLEAN DEFAULT true,
  valido_ate TIMESTAMPTZ, -- Data de expiração do override
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON ai_providers_core(status);
CREATE INDEX IF NOT EXISTS idx_ai_features_categoria ON ai_features_core(categoria);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_plan ON ai_plan_matrix(plan_key);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_feature ON ai_plan_matrix(feature_id);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_perfil ON ai_plan_matrix(perfil);
CREATE INDEX IF NOT EXISTS idx_ai_group_overrides_group ON ai_group_overrides(group_key);
CREATE INDEX IF NOT EXISTS idx_ai_group_overrides_user ON ai_group_overrides(user_id);

-- ============================================================================
-- TRIGGERS PARA updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ai_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_providers_updated ON ai_providers_core;
CREATE TRIGGER trigger_ai_providers_updated
  BEFORE UPDATE ON ai_providers_core
  FOR EACH ROW EXECUTE FUNCTION update_ai_config_updated_at();

DROP TRIGGER IF EXISTS trigger_ai_features_updated ON ai_features_core;
CREATE TRIGGER trigger_ai_features_updated
  BEFORE UPDATE ON ai_features_core
  FOR EACH ROW EXECUTE FUNCTION update_ai_config_updated_at();

DROP TRIGGER IF EXISTS trigger_ai_plan_matrix_updated ON ai_plan_matrix;
CREATE TRIGGER trigger_ai_plan_matrix_updated
  BEFORE UPDATE ON ai_plan_matrix
  FOR EACH ROW EXECUTE FUNCTION update_ai_config_updated_at();

-- ============================================================================
-- FUNÇÃO: ai_get_providers_for_context
-- Retorna lista de providers para um contexto específico
-- ============================================================================

CREATE OR REPLACE FUNCTION ai_get_providers_for_context(
  p_plan_key TEXT,
  p_feature_slug TEXT,
  p_perfil TEXT,
  p_group_key TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  provider_slug TEXT,
  provider_name TEXT,
  papel TEXT,
  peso NUMERIC,
  limite_diario INTEGER,
  limite_mensal INTEGER,
  modelo TEXT,
  origem TEXT
) AS $$
BEGIN
  -- Primeiro, tentar override de grupo
  IF p_group_key IS NOT NULL OR p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      p.slug,
      p.display_name,
      o.papel,
      COALESCE(afp.peso, 1.0),
      o.limite_diario,
      o.limite_mensal,
      p.modelo_padrao,
      'override'::TEXT
    FROM ai_group_overrides o
    JOIN ai_providers_core p ON p.id = o.provider_id
    JOIN ai_features_core f ON f.id = o.feature_id
    LEFT JOIN ai_feature_providers_core afp ON afp.feature_id = f.id AND afp.provider_id = p.id
    WHERE f.slug = p_feature_slug
      AND o.plan_key_base = p_plan_key
      AND o.perfil = p_perfil
      AND o.ativo = true
      AND p.status = 'ativo'
      AND (o.valido_ate IS NULL OR o.valido_ate > NOW())
      AND (
        (p_group_key IS NOT NULL AND o.group_key = p_group_key)
        OR (p_user_id IS NOT NULL AND o.user_id = p_user_id)
      );
    
    -- Se encontrou overrides, retorna
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Senão, usar configuração padrão da matrix
  RETURN QUERY
  SELECT 
    p.slug,
    p.display_name,
    m.papel,
    COALESCE(afp.peso, 1.0),
    m.limite_diario,
    m.limite_mensal,
    p.modelo_padrao,
    m.origem
  FROM ai_plan_matrix m
  JOIN ai_providers_core p ON p.id = m.provider_id
  JOIN ai_features_core f ON f.id = m.feature_id
  LEFT JOIN ai_feature_providers_core afp ON afp.feature_id = f.id AND afp.provider_id = p.id
  WHERE f.slug = p_feature_slug
    AND m.plan_key = p_plan_key
    AND m.perfil = p_perfil
    AND m.ativo = true
    AND p.status = 'ativo';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE ai_providers_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_features_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_providers_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plan_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_group_overrides ENABLE ROW LEVEL SECURITY;

-- Policies: Apenas admin pode ler/escrever
DROP POLICY IF EXISTS "Admin pode gerenciar ai_providers" ON ai_providers_core;
CREATE POLICY "Admin pode gerenciar ai_providers" ON ai_providers_core
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode gerenciar ai_features" ON ai_features_core;
CREATE POLICY "Admin pode gerenciar ai_features" ON ai_features_core
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode gerenciar ai_feature_providers" ON ai_feature_providers_core;
CREATE POLICY "Admin pode gerenciar ai_feature_providers" ON ai_feature_providers_core
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode gerenciar ai_plan_matrix" ON ai_plan_matrix;
CREATE POLICY "Admin pode gerenciar ai_plan_matrix" ON ai_plan_matrix
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode gerenciar ai_group_overrides" ON ai_group_overrides;
CREATE POLICY "Admin pode gerenciar ai_group_overrides" ON ai_group_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- SEED: Dados iniciais
-- ============================================================================

-- Provedores de IA
INSERT INTO ai_providers_core (slug, display_name, status, custo_relativo, api_key_env, modelo_padrao) VALUES
  ('openai', 'OpenAI GPT', 'ativo', 1.0, 'OPENAI_API_KEY', 'gpt-4o-mini'),
  ('anthropic', 'Anthropic Claude', 'ativo', 1.2, 'ANTHROPIC_API_KEY', 'claude-3-haiku-20240307'),
  ('together', 'Together AI', 'ativo', 0.5, 'TOGETHER_API_KEY', 'meta-llama/Llama-3-70b-chat-hf'),
  ('grok', 'xAI Grok', 'em_teste', 1.5, 'GROK_API_KEY', 'grok-beta'),
  ('gemini', 'Google Gemini', 'desativado', 0.8, 'GEMINI_API_KEY', 'gemini-pro')
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  custo_relativo = EXCLUDED.custo_relativo,
  modelo_padrao = EXCLUDED.modelo_padrao;

-- Features de IA
INSERT INTO ai_features_core (slug, display_name, descricao_curta, categoria) VALUES
  ('diario_analise', 'Análise de Diário', 'Analisa entradas do diário emocional', 'analise'),
  ('teste_clareza', 'Teste de Clareza', 'Avalia respostas do teste de clareza', 'analise'),
  ('chat_usuario', 'Chat com Usuária', 'Conversa de suporte com a usuária', 'chat'),
  ('oraculo_admin', 'Oráculo Admin', 'IA de suporte para administradores', 'admin'),
  ('oraculo_profissional', 'Oráculo Profissional', 'IA de suporte para profissionais', 'chat'),
  ('curadoria_conteudo', 'Curadoria de Conteúdo', 'Sugere conteúdos relevantes', 'geracao'),
  ('relatorios_juridicos', 'Relatórios Jurídicos', 'Gera relatórios para advogados', 'geracao'),
  ('resumo_chat', 'Resumo de Chat', 'Resume conversas para o diário', 'resumo')
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  descricao_curta = EXCLUDED.descricao_curta;

-- Configuração de feature x provider (global)
INSERT INTO ai_feature_providers_core (feature_id, provider_id, papel, peso, ativo)
SELECT f.id, p.id, 'geracao', 1.0, true
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai'
ON CONFLICT DO NOTHING;

-- Matrix: Plano FREE
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'free', f.id, p.id, 'usuaria', 'geracao', 3, 30, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai' AND f.slug IN ('diario_analise', 'teste_clareza', 'chat_usuario')
ON CONFLICT DO NOTHING;

-- Matrix: Plano PROFISSIONAL
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'profissional', f.id, p.id, 'usuaria', 'geracao', 10, 200, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai'
ON CONFLICT DO NOTHING;

-- Matrix: Plano PREMIUM (múltiplas IAs)
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'premium', f.id, p.id, 'usuaria', 'geracao', 50, 1000, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug IN ('openai', 'anthropic')
ON CONFLICT DO NOTHING;

-- Matrix: Admin (Oráculo)
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'admin', f.id, p.id, 'admin', 'geracao', NULL, NULL, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai' AND f.slug = 'oraculo_admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TABELA 6: ai_feature_menu_map (PATCH 31-35)
-- Mapeia cada menu/tela para uma feature de IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_feature_menu_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key TEXT NOT NULL UNIQUE, -- ex: "admin.config-ias", "app.diario"
  menu_path TEXT NOT NULL, -- ex: "/admin/configurar-ias", "/diario"
  menu_name TEXT NOT NULL, -- Nome de exibição
  feature_id UUID REFERENCES ai_features_core(id) ON DELETE SET NULL,
  perfil_default TEXT NOT NULL DEFAULT 'usuaria',
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_menu_map_path ON ai_feature_menu_map(menu_path);
CREATE INDEX IF NOT EXISTS idx_ai_menu_map_feature ON ai_feature_menu_map(feature_id);

-- ============================================================================
-- TABELA 7: ai_usage_stats_daily (PATCH 31-35)
-- Estatísticas diárias de uso de IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID,
  plan_key TEXT NOT NULL,
  group_key TEXT,
  perfil TEXT NOT NULL DEFAULT 'usuaria',
  feature_id UUID REFERENCES ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES ai_providers_core(id) ON DELETE CASCADE,
  calls INTEGER DEFAULT 0,
  tokens_input BIGINT DEFAULT 0,
  tokens_output BIGINT DEFAULT 0,
  custo_estimado NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, user_id, plan_key, group_key, perfil, feature_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage_stats_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_stats_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_plan ON ai_usage_stats_daily(plan_key);
CREATE INDEX IF NOT EXISTS idx_ai_usage_group ON ai_usage_stats_daily(group_key);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage_stats_daily(feature_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON ai_usage_stats_daily(provider_id);

-- ============================================================================
-- TABELA 8: ai_usage_logs (PATCH 31-35)
-- Logs detalhados de cada chamada de IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  feature_slug TEXT NOT NULL,
  provider_slug TEXT NOT NULL,
  menu_key TEXT,
  plan_key TEXT,
  group_key TEXT,
  perfil TEXT DEFAULT 'usuaria',
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  custo_estimado NUMERIC DEFAULT 0,
  latencia_ms INTEGER,
  sucesso BOOLEAN DEFAULT true,
  erro TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_feature ON ai_usage_logs(feature_slug);
CREATE INDEX IF NOT EXISTS idx_ai_logs_provider ON ai_usage_logs(provider_slug);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_date ON ai_usage_logs(DATE(created_at));

-- ============================================================================
-- FUNÇÃO: ai_get_menu_config (PATCH 31-35)
-- Retorna configuração de IA para um menu específico
-- ============================================================================

CREATE OR REPLACE FUNCTION ai_get_menu_config(
  p_menu_key TEXT,
  p_plan_key TEXT,
  p_perfil TEXT
)
RETURNS TABLE (
  menu_key TEXT,
  menu_path TEXT,
  menu_name TEXT,
  feature_slug TEXT,
  feature_name TEXT,
  provider_slug TEXT,
  provider_name TEXT,
  papel TEXT,
  peso NUMERIC,
  limite_diario INTEGER,
  limite_mensal INTEGER,
  ativo BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.menu_key,
    m.menu_path,
    m.menu_name,
    f.slug AS feature_slug,
    f.display_name AS feature_name,
    p.slug AS provider_slug,
    p.display_name AS provider_name,
    pm.papel,
    COALESCE(afp.peso, 1.0) AS peso,
    pm.limite_diario,
    pm.limite_mensal,
    pm.ativo
  FROM ai_feature_menu_map m
  JOIN ai_features_core f ON f.id = m.feature_id
  JOIN ai_plan_matrix pm ON pm.feature_id = f.id
  JOIN ai_providers_core p ON p.id = pm.provider_id
  LEFT JOIN ai_feature_providers_core afp ON afp.feature_id = f.id AND afp.provider_id = p.id
  WHERE m.menu_key = p_menu_key
    AND pm.plan_key = p_plan_key
    AND pm.perfil = p_perfil
    AND pm.ativo = true
    AND p.status = 'ativo'
    AND m.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: ai_get_user_ia_profile (PATCH 31-35)
-- Retorna perfil completo de IA de um usuário
-- NOTA: Função robusta que funciona mesmo sem user_subscriptions_core
-- ============================================================================

CREATE OR REPLACE FUNCTION ai_get_user_ia_profile(p_user_id UUID)
RETURNS TABLE (
  out_user_id UUID,
  out_plan_key TEXT,
  out_perfil TEXT,
  out_feature_slug TEXT,
  out_feature_name TEXT,
  out_provider_slug TEXT,
  out_provider_name TEXT,
  out_limite_diario INTEGER,
  out_limite_mensal INTEGER,
  out_uso_hoje INTEGER,
  out_uso_mes INTEGER
) AS $$
DECLARE
  v_plan_key TEXT := 'free';
  v_perfil TEXT := 'usuaria';
  v_role TEXT;
BEGIN
  -- Obter role do usuário (se user_profiles existir)
  BEGIN
    SELECT up.role::TEXT INTO v_role
    FROM user_profiles up
    WHERE up.user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'USER';
  END;

  -- Tentar obter plano (se user_subscriptions_core existir)
  BEGIN
    EXECUTE 'SELECT plan_key FROM user_subscriptions_core WHERE user_id = $1 AND status = ''active'' LIMIT 1'
    INTO v_plan_key
    USING p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_plan_key := 'free';
  END;

  -- Garantir valor padrão
  v_plan_key := COALESCE(v_plan_key, 'free');

  -- Converter role para perfil
  v_perfil := CASE 
    WHEN v_role IN ('ADMIN', 'SUPER_ADMIN') THEN 'admin'
    WHEN v_role = 'PROFESSIONAL' THEN 'profissional'
    ELSE 'usuaria'
  END;

  RETURN QUERY
  SELECT 
    p_user_id,
    v_plan_key,
    v_perfil,
    f.slug,
    f.display_name,
    pr.slug,
    pr.display_name,
    pm.limite_diario,
    pm.limite_mensal,
    COALESCE((
      SELECT SUM(s.calls)::INTEGER 
      FROM ai_usage_stats_daily s
      WHERE s.user_id = p_user_id 
        AND s.feature_id = f.id 
        AND s.provider_id = pr.id
        AND s.date = CURRENT_DATE
    ), 0),
    COALESCE((
      SELECT SUM(s.calls)::INTEGER 
      FROM ai_usage_stats_daily s
      WHERE s.user_id = p_user_id 
        AND s.feature_id = f.id 
        AND s.provider_id = pr.id
        AND s.date >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0)
  FROM ai_plan_matrix pm
  JOIN ai_features_core f ON f.id = pm.feature_id
  JOIN ai_providers_core pr ON pr.id = pm.provider_id
  WHERE pm.plan_key = v_plan_key
    AND pm.perfil = v_perfil
    AND pm.ativo = true
    AND pr.status = 'ativo';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: ai_consolidate_daily_stats (PATCH 31-35)
-- Consolida logs em estatísticas diárias
-- ============================================================================

CREATE OR REPLACE FUNCTION ai_consolidate_daily_stats(p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO ai_usage_stats_daily (
    date, user_id, plan_key, group_key, perfil, feature_id, provider_id,
    calls, tokens_input, tokens_output, custo_estimado
  )
  SELECT 
    p_date,
    l.user_id,
    COALESCE(l.plan_key, 'free'),
    l.group_key,
    COALESCE(l.perfil, 'usuaria'),
    f.id,
    p.id,
    COUNT(*),
    SUM(l.tokens_input),
    SUM(l.tokens_output),
    SUM(l.custo_estimado)
  FROM ai_usage_logs l
  JOIN ai_features_core f ON f.slug = l.feature_slug
  JOIN ai_providers_core p ON p.slug = l.provider_slug
  WHERE DATE(l.created_at) = p_date
  GROUP BY l.user_id, l.plan_key, l.group_key, l.perfil, f.id, p.id
  ON CONFLICT (date, user_id, plan_key, group_key, perfil, feature_id, provider_id)
  DO UPDATE SET
    calls = ai_usage_stats_daily.calls + EXCLUDED.calls,
    tokens_input = ai_usage_stats_daily.tokens_input + EXCLUDED.tokens_input,
    tokens_output = ai_usage_stats_daily.tokens_output + EXCLUDED.tokens_output,
    custo_estimado = ai_usage_stats_daily.custo_estimado + EXCLUDED.custo_estimado;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS PARA DASHBOARD (PATCH 31-35)
-- ============================================================================

-- View: Uso de IA por provider
CREATE OR REPLACE VIEW ai_usage_by_provider AS
SELECT 
  p.slug AS provider_slug,
  p.display_name AS provider_name,
  SUM(s.calls) AS total_calls,
  SUM(s.tokens_input + s.tokens_output) AS total_tokens,
  SUM(s.custo_estimado) AS total_custo,
  COUNT(DISTINCT s.user_id) AS unique_users
FROM ai_usage_stats_daily s
JOIN ai_providers_core p ON p.id = s.provider_id
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.slug, p.display_name
ORDER BY total_calls DESC;

-- View: Uso de IA por feature
CREATE OR REPLACE VIEW ai_usage_by_feature AS
SELECT 
  f.slug AS feature_slug,
  f.display_name AS feature_name,
  f.categoria,
  SUM(s.calls) AS total_calls,
  SUM(s.tokens_input + s.tokens_output) AS total_tokens,
  SUM(s.custo_estimado) AS total_custo,
  COUNT(DISTINCT s.user_id) AS unique_users
FROM ai_usage_stats_daily s
JOIN ai_features_core f ON f.id = s.feature_id
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY f.slug, f.display_name, f.categoria
ORDER BY total_calls DESC;

-- View: Uso de IA por plano
CREATE OR REPLACE VIEW ai_usage_by_plan AS
SELECT 
  s.plan_key,
  SUM(s.calls) AS total_calls,
  SUM(s.tokens_input + s.tokens_output) AS total_tokens,
  SUM(s.custo_estimado) AS total_custo,
  COUNT(DISTINCT s.user_id) AS unique_users
FROM ai_usage_stats_daily s
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.plan_key
ORDER BY total_calls DESC;

-- ============================================================================
-- RLS PARA NOVAS TABELAS (PATCH 31-35)
-- ============================================================================

ALTER TABLE ai_feature_menu_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies para ai_feature_menu_map
DROP POLICY IF EXISTS "Admin pode gerenciar ai_menu_map" ON ai_feature_menu_map;
CREATE POLICY "Admin pode gerenciar ai_menu_map" ON ai_feature_menu_map
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Policies para ai_usage_stats_daily
DROP POLICY IF EXISTS "Admin pode ver stats" ON ai_usage_stats_daily;
CREATE POLICY "Admin pode ver stats" ON ai_usage_stats_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Policies para ai_usage_logs
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON ai_usage_logs;
CREATE POLICY "Sistema pode inserir logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode ver logs" ON ai_usage_logs;
CREATE POLICY "Admin pode ver logs" ON ai_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- SEED: Mapeamento de Menus (PATCH 31-35)
-- ============================================================================

INSERT INTO ai_feature_menu_map (menu_key, menu_path, menu_name, feature_id, perfil_default, descricao) VALUES
  ('app.diario', '/diario', 'Diário Emocional', (SELECT id FROM ai_features_core WHERE slug = 'diario_analise'), 'usuaria', 'Análise de entradas do diário'),
  ('app.teste_clareza', '/teste-clareza', 'Teste de Clareza', (SELECT id FROM ai_features_core WHERE slug = 'teste_clareza'), 'usuaria', 'Avaliação do teste de clareza'),
  ('app.chat', '/chat', 'Chat com IA', (SELECT id FROM ai_features_core WHERE slug = 'chat_usuario'), 'usuaria', 'Conversa com a IA'),
  ('admin.oraculo', '/admin/oraculo', 'Oráculo Admin', (SELECT id FROM ai_features_core WHERE slug = 'oraculo_admin'), 'admin', 'IA de suporte para admin'),
  ('admin.config_ias', '/admin/configurar-ias', 'Configurar IAs', NULL, 'admin', 'Configuração de IAs'),
  ('admin.ia_matrix', '/admin/ia-matrix', 'IA Matrix', NULL, 'admin', 'Matrix de configuração de IAs'),
  ('admin.custos_ia', '/admin/custos-ia', 'Custos de IA', NULL, 'admin', 'Monitoramento de custos'),
  ('prof.oraculo', '/dashboard-profissional', 'Oráculo Profissional', (SELECT id FROM ai_features_core WHERE slug = 'oraculo_profissional'), 'profissional', 'IA para profissionais')
ON CONFLICT (menu_key) DO UPDATE SET
  menu_path = EXCLUDED.menu_path,
  menu_name = EXCLUDED.menu_name,
  feature_id = EXCLUDED.feature_id,
  descricao = EXCLUDED.descricao;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION AI_CONFIG_CORE CONCLUÍDA!' as status;
SELECT 'Provedores: ' || COUNT(*) FROM ai_providers_core;
SELECT 'Features: ' || COUNT(*) FROM ai_features_core;
SELECT 'Matrix: ' || COUNT(*) FROM ai_plan_matrix;
SELECT 'Menus mapeados: ' || COUNT(*) FROM ai_feature_menu_map;
