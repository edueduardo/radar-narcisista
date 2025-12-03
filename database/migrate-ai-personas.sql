-- ============================================================================
-- MIGRATION: AI_PERSONAS - Sistema de Avatares/Personas de IA
-- PATCH AVATARES / PERSONAS DE IA - RADAR + GERADOR DE SAAS
-- Criado em: 03/12/2025
-- ============================================================================
-- Executar no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- ETAPA 1.1: TABELA ai_providers (Provedores Reais - Visão Admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,                        -- Ex: "openai", "anthropic", "together", "grok"
  display_name TEXT NOT NULL,                      -- Só para ADMIN: "OpenAI GPT-4", "Claude 3.5", etc.
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'testing')),
  type TEXT DEFAULT 'llm' CHECK (type IN ('llm', 'embedding', 'image', 'audio', 'multimodal')),
  api_endpoint TEXT,                               -- Endpoint base da API
  default_model TEXT,                              -- Modelo padrão
  config JSONB DEFAULT '{}'::jsonb,                -- Configurações extras
  notes TEXT,                                      -- Notas internas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_providers_key ON public.ai_providers(key);
CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON public.ai_providers(status);
CREATE INDEX IF NOT EXISTS idx_ai_providers_type ON public.ai_providers(type);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ai_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_providers_updated_at ON public.ai_providers;
CREATE TRIGGER trigger_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_providers_updated_at();

-- ============================================================================
-- ETAPA 1.2: TABELA ai_personas (Avatares - Visão Usuário)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,                       -- Ex: "mentora-calma", "analista-logico"
  display_name TEXT NOT NULL,                      -- Ex: "Mentora Calma", "Analista Lógico"
  avatar_emoji TEXT DEFAULT '🤖',                  -- Ex: "🧠", "🕊️", "🛡️"
  avatar_url TEXT,                                 -- URL de imagem custom (opcional)
  short_bio TEXT,                                  -- Texto que aparece pro usuário
  long_description TEXT,                           -- Descrição completa (para admin)
  personality_traits TEXT[],                       -- Traços de personalidade
  communication_style TEXT,                        -- Estilo de comunicação
  default_provider_key TEXT REFERENCES public.ai_providers(key),  -- Provider principal
  fallback_providers TEXT[],                       -- Lista de keys de backup
  system_prompt_template TEXT,                     -- Template de system prompt
  roles_visible TEXT[] DEFAULT ARRAY['usuaria', 'profissional', 'admin'],  -- Perfis que veem
  is_collaborative_member BOOLEAN DEFAULT false,   -- Se participa de modos multi-IA
  is_user_visible BOOLEAN DEFAULT true,            -- Se aparece pro usuário final
  is_internal_debug BOOLEAN DEFAULT false,         -- Personas só de admin/dev
  ordem_exibicao INTEGER DEFAULT 0,                -- Ordem na UI
  cor_tema TEXT,                                   -- Cor de destaque
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_personas_slug ON public.ai_personas(slug);
CREATE INDEX IF NOT EXISTS idx_ai_personas_provider ON public.ai_personas(default_provider_key);
CREATE INDEX IF NOT EXISTS idx_ai_personas_visible ON public.ai_personas(is_user_visible);
CREATE INDEX IF NOT EXISTS idx_ai_personas_ordem ON public.ai_personas(ordem_exibicao);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ai_personas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_personas_updated_at ON public.ai_personas;
CREATE TRIGGER trigger_ai_personas_updated_at
  BEFORE UPDATE ON public.ai_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_personas_updated_at();

-- ============================================================================
-- ETAPA 1.3: TABELA ai_persona_bindings (Ligação Persona → Contexto)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_persona_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES public.ai_personas(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,                      -- Ex: "chat", "diario", "teste_clareza", "oraculo"
  context_key TEXT NOT NULL,                       -- Ex: "chat_geral", "diario_analise", "oraculo_admin"
  allowed_profiles TEXT[] DEFAULT ARRAY['usuaria', 'profissional', 'admin'],  -- Perfis permitidos
  allowed_plans TEXT[] DEFAULT ARRAY['free', 'profissional', 'defesa', 'white-label'],  -- Planos permitidos
  allowed_segments TEXT[],                         -- Ex: ["promocao_black_friday", "grupo_beta"]
  is_default BOOLEAN DEFAULT false,                -- Se é persona padrão naquele contexto
  is_active BOOLEAN DEFAULT true,                  -- Se está ativa
  weight INTEGER DEFAULT 100,                      -- Peso de participação no modo colaborativo (0-100)
  priority INTEGER DEFAULT 0,                      -- Prioridade de seleção
  config_override JSONB DEFAULT '{}'::jsonb,       -- Configurações específicas para este contexto
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, context_type, context_key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_bindings_persona ON public.ai_persona_bindings(persona_id);
CREATE INDEX IF NOT EXISTS idx_ai_bindings_context ON public.ai_persona_bindings(context_type, context_key);
CREATE INDEX IF NOT EXISTS idx_ai_bindings_active ON public.ai_persona_bindings(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_bindings_default ON public.ai_persona_bindings(is_default);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ai_bindings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ai_bindings_updated_at ON public.ai_persona_bindings;
CREATE TRIGGER trigger_ai_bindings_updated_at
  BEFORE UPDATE ON public.ai_persona_bindings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_bindings_updated_at();

-- ============================================================================
-- ETAPA 1.4: TABELA ai_persona_logs (Logs de Uso por Persona)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_persona_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                                    -- Usuário que fez a chamada
  persona_slug TEXT NOT NULL,                      -- Persona utilizada
  provider_key TEXT NOT NULL,                      -- Provider real utilizado
  context_type TEXT NOT NULL,                      -- Tipo de contexto
  context_key TEXT,                                -- Chave do contexto
  user_role TEXT,                                  -- Role do usuário
  plan_key TEXT,                                   -- Plano do usuário
  segment TEXT,                                    -- Segmento/grupo
  tokens_input INTEGER DEFAULT 0,                  -- Tokens de entrada
  tokens_output INTEGER DEFAULT 0,                 -- Tokens de saída
  response_time_ms INTEGER,                        -- Tempo de resposta em ms
  success BOOLEAN DEFAULT true,                    -- Se foi sucesso
  error_message TEXT,                              -- Mensagem de erro (se houver)
  metadata JSONB DEFAULT '{}'::jsonb,              -- Dados extras
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance de queries
CREATE INDEX IF NOT EXISTS idx_ai_persona_logs_user ON public.ai_persona_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_persona_logs_persona ON public.ai_persona_logs(persona_slug);
CREATE INDEX IF NOT EXISTS idx_ai_persona_logs_provider ON public.ai_persona_logs(provider_key);
CREATE INDEX IF NOT EXISTS idx_ai_persona_logs_context ON public.ai_persona_logs(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_persona_logs_created ON public.ai_persona_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_persona_logs_plan ON public.ai_persona_logs(plan_key);

-- ============================================================================
-- TABELA: ai_transparency_settings (Configurações de Transparência)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_transparency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'global',            -- 'global', 'plan', 'segment', 'user'
  scope_id TEXT,                                   -- ID do plano, segmento ou usuário
  show_persona_name BOOLEAN DEFAULT true,          -- Mostrar nome da persona
  show_persona_avatar BOOLEAN DEFAULT true,        -- Mostrar avatar
  show_persona_bio BOOLEAN DEFAULT true,           -- Mostrar bio curta
  show_collaborative_info BOOLEAN DEFAULT false,   -- Mostrar info de modo colaborativo
  show_provider_hint BOOLEAN DEFAULT false,        -- Mostrar dica do provider (nunca nome real)
  generic_assistant_name TEXT DEFAULT 'Assistente do Radar',  -- Nome genérico quando transparência = off
  transparency_message TEXT,                       -- Mensagem explicativa
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scope, scope_id)
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ai_providers: apenas admins
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver providers" ON public.ai_providers;
CREATE POLICY "Admins podem ver providers" ON public.ai_providers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admins podem editar providers" ON public.ai_providers;
CREATE POLICY "Admins podem editar providers" ON public.ai_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ai_personas: todos podem ver as visíveis, admins podem editar
ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios veem personas visiveis" ON public.ai_personas;
CREATE POLICY "Usuarios veem personas visiveis" ON public.ai_personas
  FOR SELECT USING (is_user_visible = true OR is_internal_debug = false);

DROP POLICY IF EXISTS "Admins podem editar personas" ON public.ai_personas;
CREATE POLICY "Admins podem editar personas" ON public.ai_personas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ai_persona_bindings: admins apenas
ALTER TABLE public.ai_persona_bindings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver bindings" ON public.ai_persona_bindings;
CREATE POLICY "Admins podem ver bindings" ON public.ai_persona_bindings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admins podem editar bindings" ON public.ai_persona_bindings;
CREATE POLICY "Admins podem editar bindings" ON public.ai_persona_bindings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ai_persona_logs: admins veem tudo, usuário vê próprios
ALTER TABLE public.ai_persona_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve proprios logs" ON public.ai_persona_logs;
CREATE POLICY "Usuario ve proprios logs" ON public.ai_persona_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins veem todos logs" ON public.ai_persona_logs;
CREATE POLICY "Admins veem todos logs" ON public.ai_persona_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ai_transparency_settings: admins apenas
ALTER TABLE public.ai_transparency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver transparency" ON public.ai_transparency_settings;
CREATE POLICY "Admins podem ver transparency" ON public.ai_transparency_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- SEED: Provedores Iniciais
-- ============================================================================

INSERT INTO public.ai_providers (key, display_name, status, type, default_model, notes) VALUES
  ('openai', 'OpenAI GPT-4', 'active', 'llm', 'gpt-4o-mini', 'Provider principal para chat e análise'),
  ('anthropic', 'Claude 3.5 Sonnet', 'active', 'llm', 'claude-3-5-sonnet-20241022', 'Provider para análises profundas'),
  ('together', 'Together AI', 'active', 'llm', 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo', 'Provider de backup e custo baixo'),
  ('grok', 'Grok (xAI)', 'testing', 'llm', 'grok-beta', 'Provider experimental'),
  ('gemini', 'Google Gemini', 'testing', 'llm', 'gemini-1.5-flash', 'Provider Google')
ON CONFLICT (key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  default_model = EXCLUDED.default_model,
  updated_at = NOW();

-- ============================================================================
-- SEED: Personas Iniciais (Avatares do Radar)
-- ============================================================================

INSERT INTO public.ai_personas (slug, display_name, avatar_emoji, short_bio, personality_traits, communication_style, default_provider_key, roles_visible, is_collaborative_member, is_user_visible, ordem_exibicao, cor_tema) VALUES
  (
    'mentora-calma',
    'Mentora Calma',
    '🕊️',
    'Sua companheira de jornada, focada em acolhimento e clareza emocional.',
    ARRAY['empática', 'paciente', 'acolhedora', 'gentil'],
    'Fala de forma suave e validadora, sempre reconhecendo os sentimentos antes de oferecer perspectivas.',
    'openai',
    ARRAY['usuaria', 'profissional'],
    true,
    true,
    1,
    '#8B5CF6'
  ),
  (
    'analista-logico',
    'Analista Lógico',
    '🧠',
    'Especialista em identificar padrões e organizar pensamentos de forma estruturada.',
    ARRAY['analítico', 'objetivo', 'estruturado', 'preciso'],
    'Apresenta informações de forma clara e organizada, com pontos e estrutura.',
    'anthropic',
    ARRAY['usuaria', 'profissional', 'admin'],
    true,
    true,
    2,
    '#3B82F6'
  ),
  (
    'guardiao-seguranca',
    'Guardião de Segurança',
    '🛡️',
    'Focado em sua proteção, alerta para sinais de risco e oferece recursos de segurança.',
    ARRAY['protetor', 'vigilante', 'direto', 'prático'],
    'Comunica-se de forma direta quando detecta riscos, sempre oferecendo ações concretas.',
    'openai',
    ARRAY['usuaria', 'profissional'],
    true,
    true,
    3,
    '#EF4444'
  ),
  (
    'curador-conteudo',
    'Curador de Conteúdo',
    '📚',
    'Especialista em encontrar e recomendar recursos educativos relevantes.',
    ARRAY['educador', 'informativo', 'curioso', 'organizado'],
    'Apresenta informações educativas de forma acessível e contextualizada.',
    'together',
    ARRAY['usuaria', 'profissional', 'admin'],
    false,
    true,
    4,
    '#10B981'
  ),
  (
    'assistente-profissional',
    'Assistente Profissional',
    '💼',
    'Suporte especializado para profissionais de saúde e direito.',
    ARRAY['técnico', 'profissional', 'preciso', 'ético'],
    'Linguagem técnica quando apropriado, sempre respeitando limites éticos.',
    'anthropic',
    ARRAY['profissional', 'admin'],
    false,
    true,
    5,
    '#F59E0B'
  ),
  (
    'oraculo-admin',
    'Oráculo do Sistema',
    '🔮',
    'IA de suporte interno para administradores do sistema.',
    ARRAY['técnico', 'analítico', 'abrangente', 'preciso'],
    'Fornece análises técnicas e métricas do sistema de forma detalhada.',
    'openai',
    ARRAY['admin'],
    false,
    false,
    10,
    '#6366F1'
  )
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  avatar_emoji = EXCLUDED.avatar_emoji,
  short_bio = EXCLUDED.short_bio,
  updated_at = NOW();

-- ============================================================================
-- SEED: Bindings Iniciais (Persona → Contexto)
-- ============================================================================

INSERT INTO public.ai_persona_bindings (persona_id, context_type, context_key, allowed_profiles, allowed_plans, is_default, weight) VALUES
  -- Chat Geral
  ((SELECT id FROM public.ai_personas WHERE slug = 'mentora-calma'), 'chat', 'chat_geral', ARRAY['usuaria', 'profissional'], ARRAY['free', 'profissional', 'defesa', 'white-label'], true, 100),
  ((SELECT id FROM public.ai_personas WHERE slug = 'analista-logico'), 'chat', 'chat_geral', ARRAY['usuaria', 'profissional'], ARRAY['profissional', 'defesa', 'white-label'], false, 80),
  ((SELECT id FROM public.ai_personas WHERE slug = 'guardiao-seguranca'), 'chat', 'chat_geral', ARRAY['usuaria', 'profissional'], ARRAY['free', 'profissional', 'defesa', 'white-label'], false, 60),
  
  -- Diário
  ((SELECT id FROM public.ai_personas WHERE slug = 'mentora-calma'), 'diario', 'diario_analise', ARRAY['usuaria', 'profissional'], ARRAY['free', 'profissional', 'defesa', 'white-label'], true, 100),
  ((SELECT id FROM public.ai_personas WHERE slug = 'analista-logico'), 'diario', 'diario_analise', ARRAY['usuaria', 'profissional'], ARRAY['profissional', 'defesa', 'white-label'], false, 70),
  
  -- Teste de Clareza
  ((SELECT id FROM public.ai_personas WHERE slug = 'analista-logico'), 'teste_clareza', 'resultado_analise', ARRAY['usuaria', 'profissional'], ARRAY['free', 'profissional', 'defesa', 'white-label'], true, 100),
  ((SELECT id FROM public.ai_personas WHERE slug = 'mentora-calma'), 'teste_clareza', 'resultado_analise', ARRAY['usuaria', 'profissional'], ARRAY['profissional', 'defesa', 'white-label'], false, 80),
  
  -- Oráculo Admin
  ((SELECT id FROM public.ai_personas WHERE slug = 'oraculo-admin'), 'oraculo', 'oraculo_admin', ARRAY['admin'], ARRAY['free', 'profissional', 'defesa', 'white-label'], true, 100),
  
  -- Biblioteca/Conteúdo
  ((SELECT id FROM public.ai_personas WHERE slug = 'curador-conteudo'), 'biblioteca', 'recomendacoes', ARRAY['usuaria', 'profissional'], ARRAY['free', 'profissional', 'defesa', 'white-label'], true, 100),
  
  -- Profissional
  ((SELECT id FROM public.ai_personas WHERE slug = 'assistente-profissional'), 'profissional', 'analise_cliente', ARRAY['profissional'], ARRAY['profissional', 'defesa', 'white-label'], true, 100)
ON CONFLICT (persona_id, context_type, context_key) DO UPDATE SET
  allowed_profiles = EXCLUDED.allowed_profiles,
  allowed_plans = EXCLUDED.allowed_plans,
  weight = EXCLUDED.weight,
  updated_at = NOW();

-- ============================================================================
-- SEED: Configuração de Transparência Padrão
-- ============================================================================

INSERT INTO public.ai_transparency_settings (scope, scope_id, show_persona_name, show_persona_avatar, show_persona_bio, show_collaborative_info, show_provider_hint, generic_assistant_name, transparency_message) VALUES
  ('global', NULL, true, true, true, false, false, 'Assistente do Radar', 'Respostas geradas por uma equipe de IAs internas do Radar, com perfis especializados para melhor te ajudar.')
ON CONFLICT (scope, scope_id) DO NOTHING;

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função: Obter personas ativas para um contexto
CREATE OR REPLACE FUNCTION get_active_personas_for_context(
  p_context_type TEXT,
  p_context_key TEXT,
  p_user_role TEXT DEFAULT 'usuaria',
  p_plan_key TEXT DEFAULT 'free',
  p_segment TEXT DEFAULT NULL
)
RETURNS TABLE (
  persona_id UUID,
  persona_slug TEXT,
  display_name TEXT,
  avatar_emoji TEXT,
  avatar_url TEXT,
  short_bio TEXT,
  provider_key TEXT,
  weight INTEGER,
  is_default BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.slug,
    p.display_name,
    p.avatar_emoji,
    p.avatar_url,
    p.short_bio,
    p.default_provider_key,
    b.weight,
    b.is_default
  FROM public.ai_personas p
  JOIN public.ai_persona_bindings b ON b.persona_id = p.id
  WHERE b.context_type = p_context_type
    AND b.context_key = p_context_key
    AND b.is_active = true
    AND p.is_user_visible = true
    AND p_user_role = ANY(b.allowed_profiles)
    AND p_plan_key = ANY(b.allowed_plans)
    AND (p_segment IS NULL OR p_segment = ANY(b.allowed_segments) OR b.allowed_segments IS NULL)
  ORDER BY b.is_default DESC, b.weight DESC, p.ordem_exibicao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Registrar log de uso de persona
CREATE OR REPLACE FUNCTION log_persona_usage(
  p_user_id UUID,
  p_persona_slug TEXT,
  p_provider_key TEXT,
  p_context_type TEXT,
  p_context_key TEXT,
  p_user_role TEXT,
  p_plan_key TEXT,
  p_segment TEXT,
  p_tokens_input INTEGER,
  p_tokens_output INTEGER,
  p_response_time_ms INTEGER,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.ai_persona_logs (
    user_id, persona_slug, provider_key, context_type, context_key,
    user_role, plan_key, segment, tokens_input, tokens_output,
    response_time_ms, success, error_message
  ) VALUES (
    p_user_id, p_persona_slug, p_provider_key, p_context_type, p_context_key,
    p_user_role, p_plan_key, p_segment, p_tokens_input, p_tokens_output,
    p_response_time_ms, p_success, p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Obter configuração de transparência
CREATE OR REPLACE FUNCTION get_transparency_settings(
  p_plan_key TEXT DEFAULT NULL,
  p_segment TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  show_persona_name BOOLEAN,
  show_persona_avatar BOOLEAN,
  show_persona_bio BOOLEAN,
  show_collaborative_info BOOLEAN,
  show_provider_hint BOOLEAN,
  generic_assistant_name TEXT,
  transparency_message TEXT
) AS $$
BEGIN
  -- Prioridade: user > segment > plan > global
  RETURN QUERY
  SELECT 
    t.show_persona_name,
    t.show_persona_avatar,
    t.show_persona_bio,
    t.show_collaborative_info,
    t.show_provider_hint,
    t.generic_assistant_name,
    t.transparency_message
  FROM public.ai_transparency_settings t
  WHERE 
    (t.scope = 'user' AND t.scope_id = p_user_id::TEXT)
    OR (t.scope = 'segment' AND t.scope_id = p_segment)
    OR (t.scope = 'plan' AND t.scope_id = p_plan_key)
    OR (t.scope = 'global' AND t.scope_id IS NULL)
  ORDER BY 
    CASE t.scope 
      WHEN 'user' THEN 1 
      WHEN 'segment' THEN 2 
      WHEN 'plan' THEN 3 
      ELSE 4 
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS PARA DASHBOARD ADMIN
-- ============================================================================

-- View: Uso por Persona (últimos 30 dias)
DROP VIEW IF EXISTS ai_persona_usage_stats;
CREATE OR REPLACE VIEW ai_persona_usage_stats AS
SELECT 
  persona_slug,
  COUNT(*) as total_calls,
  SUM(tokens_input) as total_tokens_input,
  SUM(tokens_output) as total_tokens_output,
  AVG(response_time_ms)::INTEGER as avg_response_time_ms,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*)::FLOAT * 100 as success_rate
FROM public.ai_persona_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY persona_slug
ORDER BY total_calls DESC;

-- View: Uso por Provider (últimos 30 dias)
DROP VIEW IF EXISTS ai_provider_usage_stats;
CREATE OR REPLACE VIEW ai_provider_usage_stats AS
SELECT 
  provider_key,
  COUNT(*) as total_calls,
  SUM(tokens_input) as total_tokens_input,
  SUM(tokens_output) as total_tokens_output,
  AVG(response_time_ms)::INTEGER as avg_response_time_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*)::FLOAT * 100 as success_rate
FROM public.ai_persona_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY provider_key
ORDER BY total_calls DESC;

-- View: Uso por Contexto (últimos 30 dias)
DROP VIEW IF EXISTS ai_context_usage_stats;
CREATE OR REPLACE VIEW ai_context_usage_stats AS
SELECT 
  context_type,
  context_key,
  COUNT(*) as total_calls,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT persona_slug) as personas_used
FROM public.ai_persona_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY context_type, context_key
ORDER BY total_calls DESC;

-- View: Uso por Plano (últimos 30 dias)
DROP VIEW IF EXISTS ai_plan_usage_stats;
CREATE OR REPLACE VIEW ai_plan_usage_stats AS
SELECT 
  plan_key,
  COUNT(*) as total_calls,
  SUM(tokens_input + tokens_output) as total_tokens,
  COUNT(DISTINCT user_id) as unique_users
FROM public.ai_persona_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY plan_key
ORDER BY total_calls DESC;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT '✅ MIGRATION AI_PERSONAS CONCLUÍDA!' as status;
SELECT 'Providers: ' || COUNT(*) FROM public.ai_providers;
SELECT 'Personas: ' || COUNT(*) FROM public.ai_personas;
SELECT 'Bindings: ' || COUNT(*) FROM public.ai_persona_bindings;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.ai_providers IS 'Provedores reais de IA (visão ADMIN) - PATCH AVATARES/PERSONAS';
COMMENT ON TABLE public.ai_personas IS 'Avatares/Personas de IA (visão USUÁRIO) - PATCH AVATARES/PERSONAS';
COMMENT ON TABLE public.ai_persona_bindings IS 'Ligação Persona → Contexto/Menu - PATCH AVATARES/PERSONAS';
COMMENT ON TABLE public.ai_persona_logs IS 'Logs de uso por persona - PATCH AVATARES/PERSONAS';
COMMENT ON TABLE public.ai_transparency_settings IS 'Configurações de transparência - PATCH AVATARES/PERSONAS';
COMMENT ON FUNCTION get_active_personas_for_context IS 'Retorna personas ativas para um contexto específico';
COMMENT ON FUNCTION log_persona_usage IS 'Registra uso de persona nos logs';
COMMENT ON FUNCTION get_transparency_settings IS 'Retorna configurações de transparência aplicáveis';

-- ============================================================================
-- FIM DA MIGRATION AI_PERSONAS
-- ============================================================================
