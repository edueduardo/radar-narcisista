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
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION AI_CONFIG_CORE CONCLUÍDA!' as status;
SELECT 'Provedores: ' || COUNT(*) FROM ai_providers_core;
SELECT 'Features: ' || COUNT(*) FROM ai_features_core;
SELECT 'Matrix: ' || COUNT(*) FROM ai_plan_matrix;
