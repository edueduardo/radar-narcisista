-- ============================================================================
-- MIGRATION: AI_CONFIG_CORE (VERSÃO SIMPLIFICADA - SEM RLS)
-- BLOCO 31-35 - Configuração Dinâmica de IAs
-- Data: 03/12/2025
-- 
-- INSTRUÇÕES:
-- 1. Execute este SQL primeiro
-- 2. Depois execute migrate-ai-config-core-RLS.sql para adicionar segurança
-- ============================================================================

-- ============================================================================
-- TABELA 1: ai_providers_core
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_providers_core (
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

-- ============================================================================
-- TABELA 2: ai_features_core
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_features_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  descricao_curta TEXT,
  categoria TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA 3: ai_feature_providers_core
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
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_plan_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL,
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
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_group_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL,
  override_user_id UUID,
  plan_key_base TEXT NOT NULL,
  feature_id UUID NOT NULL REFERENCES ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers_core(id) ON DELETE CASCADE,
  perfil TEXT NOT NULL DEFAULT 'usuaria',
  papel TEXT NOT NULL DEFAULT 'geracao',
  limite_diario INTEGER,
  limite_mensal INTEGER,
  ativo BOOLEAN DEFAULT true,
  valido_ate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA 6: ai_feature_menu_map
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_feature_menu_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key TEXT NOT NULL UNIQUE,
  menu_path TEXT NOT NULL,
  menu_name TEXT NOT NULL,
  feature_id UUID REFERENCES ai_features_core(id) ON DELETE SET NULL,
  perfil_default TEXT NOT NULL DEFAULT 'usuaria',
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA 7: ai_usage_stats_daily
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  stats_user_id UUID,
  plan_key TEXT NOT NULL,
  group_key TEXT,
  perfil TEXT NOT NULL DEFAULT 'usuaria',
  feature_id UUID REFERENCES ai_features_core(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES ai_providers_core(id) ON DELETE CASCADE,
  calls INTEGER DEFAULT 0,
  tokens_input BIGINT DEFAULT 0,
  tokens_output BIGINT DEFAULT 0,
  custo_estimado NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELA 8: ai_usage_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_user_id UUID,
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

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON ai_providers_core(status);
CREATE INDEX IF NOT EXISTS idx_ai_features_categoria ON ai_features_core(categoria);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_plan ON ai_plan_matrix(plan_key);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_feature ON ai_plan_matrix(feature_id);
CREATE INDEX IF NOT EXISTS idx_ai_plan_matrix_perfil ON ai_plan_matrix(perfil);
CREATE INDEX IF NOT EXISTS idx_ai_group_overrides_group ON ai_group_overrides(group_key);
CREATE INDEX IF NOT EXISTS idx_ai_menu_map_path ON ai_feature_menu_map(menu_path);
CREATE INDEX IF NOT EXISTS idx_ai_menu_map_feature ON ai_feature_menu_map(feature_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage_stats_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_plan ON ai_usage_stats_daily(plan_key);
CREATE INDEX IF NOT EXISTS idx_ai_logs_feature ON ai_usage_logs(feature_slug);
CREATE INDEX IF NOT EXISTS idx_ai_logs_provider ON ai_usage_logs(provider_slug);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_usage_logs(created_at DESC);

-- ============================================================================
-- FUNÇÃO: ai_get_providers_for_context
-- ============================================================================

CREATE OR REPLACE FUNCTION ai_get_providers_for_context(
  p_plan_key TEXT,
  p_feature_slug TEXT,
  p_perfil TEXT,
  p_group_key TEXT DEFAULT NULL,
  p_override_user_id UUID DEFAULT NULL
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
  IF p_group_key IS NOT NULL OR p_override_user_id IS NOT NULL THEN
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
        OR (p_override_user_id IS NOT NULL AND o.override_user_id = p_override_user_id)
      );
    
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED: Provedores de IA
-- ============================================================================

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

-- ============================================================================
-- SEED: Features de IA
-- ============================================================================

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

-- ============================================================================
-- SEED: Matrix por Plano
-- ============================================================================

-- Plano FREE
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'free', f.id, p.id, 'usuaria', 'geracao', 3, 30, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai' AND f.slug IN ('diario_analise', 'teste_clareza', 'chat_usuario')
ON CONFLICT DO NOTHING;

-- Plano PROFISSIONAL
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'profissional', f.id, p.id, 'usuaria', 'geracao', 10, 200, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai'
ON CONFLICT DO NOTHING;

-- Plano PREMIUM
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'premium', f.id, p.id, 'usuaria', 'geracao', 50, 1000, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug IN ('openai', 'anthropic')
ON CONFLICT DO NOTHING;

-- Admin (Oráculo)
INSERT INTO ai_plan_matrix (plan_key, feature_id, provider_id, perfil, papel, limite_diario, limite_mensal, ativo, origem)
SELECT 'admin', f.id, p.id, 'admin', 'geracao', NULL, NULL, true, 'padrao'
FROM ai_features_core f, ai_providers_core p
WHERE p.slug = 'openai' AND f.slug = 'oraculo_admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: Mapeamento de Menus
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
-- VIEWS PARA DASHBOARD (corrigidas)
-- ============================================================================

-- View: Uso de IA por provider
DROP VIEW IF EXISTS ai_usage_by_provider;
CREATE OR REPLACE VIEW ai_usage_by_provider AS
SELECT 
  p.slug AS provider_slug,
  p.display_name AS provider_name,
  COALESCE(SUM(s.calls), 0) AS total_calls,
  COALESCE(SUM(s.tokens_input + s.tokens_output), 0) AS total_tokens,
  COALESCE(SUM(s.custo_estimado), 0) AS total_custo,
  COUNT(DISTINCT s.stats_user_id) AS unique_users
FROM ai_providers_core p
LEFT JOIN ai_usage_stats_daily s ON s.provider_id = p.id AND s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.slug, p.display_name
ORDER BY total_calls DESC;

-- View: Uso de IA por feature
DROP VIEW IF EXISTS ai_usage_by_feature;
CREATE OR REPLACE VIEW ai_usage_by_feature AS
SELECT 
  f.slug AS feature_slug,
  f.display_name AS feature_name,
  f.categoria,
  COALESCE(SUM(s.calls), 0) AS total_calls,
  COALESCE(SUM(s.tokens_input + s.tokens_output), 0) AS total_tokens,
  COALESCE(SUM(s.custo_estimado), 0) AS total_custo,
  COUNT(DISTINCT s.stats_user_id) AS unique_users
FROM ai_features_core f
LEFT JOIN ai_usage_stats_daily s ON s.feature_id = f.id AND s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY f.slug, f.display_name, f.categoria
ORDER BY total_calls DESC;

-- View: Uso de IA por plano
DROP VIEW IF EXISTS ai_usage_by_plan;
CREATE OR REPLACE VIEW ai_usage_by_plan AS
SELECT 
  s.plan_key,
  COALESCE(SUM(s.calls), 0) AS total_calls,
  COALESCE(SUM(s.tokens_input + s.tokens_output), 0) AS total_tokens,
  COALESCE(SUM(s.custo_estimado), 0) AS total_custo,
  COUNT(DISTINCT s.stats_user_id) AS unique_users
FROM ai_usage_stats_daily s
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.plan_key
ORDER BY total_calls DESC;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION AI_CONFIG_CORE (SIMPLES) CONCLUÍDA!' as status;
SELECT 'Provedores: ' || COUNT(*) FROM ai_providers_core;
SELECT 'Features: ' || COUNT(*) FROM ai_features_core;
SELECT 'Matrix: ' || COUNT(*) FROM ai_plan_matrix;
SELECT 'Menus mapeados: ' || COUNT(*) FROM ai_feature_menu_map;
