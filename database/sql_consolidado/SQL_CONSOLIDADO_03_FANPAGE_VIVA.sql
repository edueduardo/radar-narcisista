-- ================================================================================
-- SQL_CONSOLIDADO_03_FANPAGE_VIVA.sql
-- ETAPA 8 - Fanpage Viva (Infra + Admin + Front)
-- Data: 04/12/2025
-- ================================================================================
--
-- EXECUTAR NO SUPABASE SQL EDITOR
--
-- Este arquivo cria as tabelas para:
-- - Conteúdos publicados (content_items)
-- - Sugestões da IA (content_suggestions)
-- - Insights agregados (content_insights)
-- - Trilhas de aprendizado (academy_tracks)
-- - Aulas das trilhas (academy_lessons)
-- - Progresso do usuário (academy_progress)
-- - Configuração da fanpage (fanpage_config)
--
-- ================================================================================

-- ================================================================================
-- PARTE 1: CONTENT ITEMS (Conteúdos Publicados)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  
  -- Tipo e fonte
  type TEXT NOT NULL DEFAULT 'article', -- 'article', 'news', 'faq', 'stat', 'external_link', 'video'
  source_type TEXT NOT NULL DEFAULT 'internal', -- 'internal_insight', 'external_world', 'manual'
  
  -- Metadados
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  featured_image TEXT,
  external_url TEXT,
  
  -- Visibilidade e status
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'premium', 'professional', 'admin'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived', 'scheduled'
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Controle
  created_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- Métricas
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON public.content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_published_at ON public.content_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_tags ON public.content_items USING GIN(tags);

-- RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Políticas (DROP antes para evitar erro de duplicata)
DROP POLICY IF EXISTS "content_items_public_read" ON public.content_items;
CREATE POLICY "content_items_public_read" ON public.content_items
  FOR SELECT USING (status = 'published' AND visibility = 'public');

DROP POLICY IF EXISTS "content_items_admin_all" ON public.content_items;
CREATE POLICY "content_items_admin_all" ON public.content_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_items_updated_at ON public.content_items;
CREATE TRIGGER trigger_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 2: CONTENT SUGGESTIONS (Sugestões da IA)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fonte original
  suggestion_source TEXT NOT NULL DEFAULT 'ai_curator', -- 'ai_curator', 'manual', 'rss', 'api'
  original_url TEXT,
  original_title TEXT,
  original_content TEXT,
  
  -- Sugestões da IA
  suggested_title_pt TEXT,
  suggested_summary_pt TEXT,
  suggested_body_pt TEXT,
  suggested_type TEXT DEFAULT 'article',
  suggested_topics TEXT[] DEFAULT '{}',
  suggested_tags TEXT[] DEFAULT '{}',
  
  -- Análise da IA
  ai_relevance_score NUMERIC(3,2), -- 0.00 a 1.00
  ai_reasoning TEXT,
  ai_model TEXT,
  ai_processed_at TIMESTAMPTZ,
  
  -- Status de revisão
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'converted'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Revisão
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Ligação com content_items (quando aprovado)
  linked_content_id UUID REFERENCES public.content_items(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_suggestions_status ON public.content_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_priority ON public.content_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_source ON public.content_suggestions(suggestion_source);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_relevance ON public.content_suggestions(ai_relevance_score DESC);

-- RLS
ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_suggestions_admin_all" ON public.content_suggestions;
CREATE POLICY "content_suggestions_admin_all" ON public.content_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_content_suggestions_updated_at ON public.content_suggestions;
CREATE TRIGGER trigger_content_suggestions_updated_at
  BEFORE UPDATE ON public.content_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 3: CONTENT INSIGHTS (Agregações Internas)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.content_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador único do insight
  insight_key TEXT UNIQUE NOT NULL,
  
  -- Valor do insight (JSON flexível)
  value_json JSONB NOT NULL DEFAULT '{}',
  
  -- Metadados
  category TEXT DEFAULT 'general', -- 'users', 'tests', 'engagement', 'content', 'general'
  display_name TEXT,
  description TEXT,
  
  -- Controle de computação
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  computation_duration_ms INTEGER,
  next_computation_at TIMESTAMPTZ,
  computation_interval_minutes INTEGER DEFAULT 60,
  
  -- Visibilidade
  is_public BOOLEAN DEFAULT false,
  show_on_frontpage BOOLEAN DEFAULT false,
  frontpage_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_insights_key ON public.content_insights(insight_key);
CREATE INDEX IF NOT EXISTS idx_content_insights_category ON public.content_insights(category);
CREATE INDEX IF NOT EXISTS idx_content_insights_frontpage ON public.content_insights(show_on_frontpage, frontpage_order);

-- RLS
ALTER TABLE public.content_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_insights_public_read" ON public.content_insights;
CREATE POLICY "content_insights_public_read" ON public.content_insights
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "content_insights_admin_all" ON public.content_insights;
CREATE POLICY "content_insights_admin_all" ON public.content_insights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_content_insights_updated_at ON public.content_insights;
CREATE TRIGGER trigger_content_insights_updated_at
  BEFORE UPDATE ON public.content_insights
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 4: ACADEMY TRACKS (Trilhas de Aprendizado)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.academy_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Visual
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT 'purple',
  featured_image TEXT,
  
  -- Classificação
  level TEXT NOT NULL DEFAULT 'iniciante', -- 'iniciante', 'intermediario', 'avancado'
  category TEXT DEFAULT 'geral',
  tags TEXT[] DEFAULT '{}',
  
  -- Configuração
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Métricas calculadas
  estimated_hours NUMERIC(4,1) DEFAULT 0,
  lesson_count INTEGER DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  
  -- Controle
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_academy_tracks_slug ON public.academy_tracks(slug);
CREATE INDEX IF NOT EXISTS idx_academy_tracks_published ON public.academy_tracks(is_published);
CREATE INDEX IF NOT EXISTS idx_academy_tracks_level ON public.academy_tracks(level);
CREATE INDEX IF NOT EXISTS idx_academy_tracks_order ON public.academy_tracks(display_order);

-- RLS
ALTER TABLE public.academy_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academy_tracks_public_read" ON public.academy_tracks;
CREATE POLICY "academy_tracks_public_read" ON public.academy_tracks
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "academy_tracks_admin_all" ON public.academy_tracks;
CREATE POLICY "academy_tracks_admin_all" ON public.academy_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_academy_tracks_updated_at ON public.academy_tracks;
CREATE TRIGGER trigger_academy_tracks_updated_at
  BEFORE UPDATE ON public.academy_tracks
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 5: ACADEMY LESSONS (Aulas)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relação com trilha
  track_id UUID NOT NULL REFERENCES public.academy_tracks(id) ON DELETE CASCADE,
  
  -- Identificação
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Tipo e conteúdo
  type TEXT NOT NULL DEFAULT 'article', -- 'video', 'article', 'quiz', 'exercise'
  content TEXT, -- Markdown ou HTML
  video_url TEXT,
  video_duration_seconds INTEGER,
  
  -- Configuração
  duration_minutes INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  
  -- Quiz (se type = 'quiz')
  quiz_questions JSONB DEFAULT '[]',
  quiz_passing_score INTEGER DEFAULT 70,
  
  -- Exercício (se type = 'exercise')
  exercise_instructions TEXT,
  exercise_template TEXT,
  
  -- Recursos
  resources JSONB DEFAULT '[]', -- [{title, url, type}]
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint único por trilha
  UNIQUE(track_id, slug)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_academy_lessons_track ON public.academy_lessons(track_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_order ON public.academy_lessons(track_id, order_index);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_type ON public.academy_lessons(type);

-- RLS
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academy_lessons_public_read" ON public.academy_lessons;
CREATE POLICY "academy_lessons_public_read" ON public.academy_lessons
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.academy_tracks 
      WHERE id = track_id AND is_published = true
    )
  );

DROP POLICY IF EXISTS "academy_lessons_admin_all" ON public.academy_lessons;
CREATE POLICY "academy_lessons_admin_all" ON public.academy_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_academy_lessons_updated_at ON public.academy_lessons;
CREATE TRIGGER trigger_academy_lessons_updated_at
  BEFORE UPDATE ON public.academy_lessons
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 6: ACADEMY PROGRESS (Progresso do Usuário)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relações
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.academy_tracks(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  
  -- Progresso
  progress_percent NUMERIC(5,2) DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Quiz
  quiz_score INTEGER,
  quiz_attempts INTEGER DEFAULT 0,
  quiz_passed BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint único
  UNIQUE(user_id, track_id, lesson_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_academy_progress_user ON public.academy_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_track ON public.academy_progress(track_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_lesson ON public.academy_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_status ON public.academy_progress(status);

-- RLS
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academy_progress_own" ON public.academy_progress;
CREATE POLICY "academy_progress_own" ON public.academy_progress
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "academy_progress_admin_read" ON public.academy_progress;
CREATE POLICY "academy_progress_admin_read" ON public.academy_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_academy_progress_updated_at ON public.academy_progress;
CREATE TRIGGER trigger_academy_progress_updated_at
  BEFORE UPDATE ON public.academy_progress
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 7: FANPAGE CONFIG (Configuração da Frontpage)
-- ================================================================================

CREATE TABLE IF NOT EXISTS public.fanpage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador do bloco
  block_key TEXT UNIQUE NOT NULL,
  
  -- Configuração
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📦',
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Limites
  max_items INTEGER DEFAULT 5,
  refresh_interval_minutes INTEGER DEFAULT 60, -- 0 = manual
  
  -- Fonte de dados
  source TEXT DEFAULT 'internal', -- 'internal', 'external', 'mixed'
  
  -- Configuração específica (JSON flexível)
  config JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.fanpage_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fanpage_config_public_read" ON public.fanpage_config;
CREATE POLICY "fanpage_config_public_read" ON public.fanpage_config
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "fanpage_config_admin_all" ON public.fanpage_config;
CREATE POLICY "fanpage_config_admin_all" ON public.fanpage_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_fanpage_config_updated_at ON public.fanpage_config;
CREATE TRIGGER trigger_fanpage_config_updated_at
  BEFORE UPDATE ON public.fanpage_config
  FOR EACH ROW EXECUTE FUNCTION update_content_items_updated_at();

-- ================================================================================
-- PARTE 8: FUNÇÕES AUXILIARES
-- ================================================================================

-- Função para atualizar métricas da trilha
CREATE OR REPLACE FUNCTION update_track_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.academy_tracks
  SET 
    lesson_count = (
      SELECT COUNT(*) FROM public.academy_lessons 
      WHERE track_id = COALESCE(NEW.track_id, OLD.track_id) AND is_published = true
    ),
    estimated_hours = (
      SELECT COALESCE(SUM(duration_minutes), 0) / 60.0 
      FROM public.academy_lessons 
      WHERE track_id = COALESCE(NEW.track_id, OLD.track_id) AND is_published = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.track_id, OLD.track_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_track_metrics ON public.academy_lessons;
CREATE TRIGGER trigger_update_track_metrics
  AFTER INSERT OR UPDATE OR DELETE ON public.academy_lessons
  FOR EACH ROW EXECUTE FUNCTION update_track_metrics();

-- Função para buscar insights públicos para frontpage
CREATE OR REPLACE FUNCTION get_frontpage_insights()
RETURNS TABLE (
  insight_key TEXT,
  display_name TEXT,
  value_json JSONB,
  computed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.insight_key,
    ci.display_name,
    ci.value_json,
    ci.computed_at
  FROM public.content_insights ci
  WHERE ci.is_public = true AND ci.show_on_frontpage = true
  ORDER BY ci.frontpage_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar conteúdos publicados por tipo
CREATE OR REPLACE FUNCTION get_published_content(
  p_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  summary TEXT,
  type TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.slug,
    ci.title,
    ci.summary,
    ci.type,
    ci.tags,
    ci.published_at,
    ci.view_count
  FROM public.content_items ci
  WHERE ci.status = 'published' 
    AND ci.visibility = 'public'
    AND (p_type IS NULL OR ci.type = p_type)
  ORDER BY ci.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================
-- PARTE 9: SEED DATA
-- ================================================================================

-- Criar índices únicos necessários para ON CONFLICT (se não existirem)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanpage_config_block_key ON public.fanpage_config(block_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_insights_insight_key ON public.content_insights(insight_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_academy_tracks_slug ON public.academy_tracks(slug);

-- Configuração padrão da fanpage
INSERT INTO public.fanpage_config (block_key, title, description, icon, enabled, display_order, max_items, refresh_interval_minutes, source, config) VALUES
  ('radar_numeros', 'Radar em Números', 'Estatísticas agregadas anônimas do sistema', '📊', true, 1, 4, 60, 'internal', '{"showTotalUsers": true, "showTotalTests": true, "showAverageScore": true, "showActiveToday": true}'),
  ('faq_dinamico', 'Perguntas Frequentes', 'FAQ dinâmico baseado em perguntas reais do chat', '❓', true, 2, 5, 1440, 'internal', '{"minOccurrences": 3, "showCategories": true}'),
  ('radar_mundo', 'Radar no Mundo', 'Notícias e conteúdos externos curados', '🌍', true, 3, 4, 720, 'external', '{"showSource": true, "showDate": true, "types": ["news", "article", "study"]}'),
  ('radar_academy', 'Radar Academy', 'Trilhas de aprendizado e conteúdo educativo', '🎓', false, 4, 3, 0, 'internal', '{"showProgress": true, "showDuration": true}'),
  ('depoimentos', 'Histórias de Superação', 'Depoimentos anônimos aprovados', '💜', true, 5, 3, 0, 'internal', '{"requireApproval": true, "anonymize": true}'),
  ('clima_emocional', 'Clima Emocional do Radar', 'Temperatura agregada do dia', '🌡️', false, 6, 1, 60, 'internal', '{"showTrend": true, "showComparison": false}')
ON CONFLICT (block_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  config = EXCLUDED.config;

-- Insights iniciais
INSERT INTO public.content_insights (insight_key, display_name, description, category, value_json, is_public, show_on_frontpage, frontpage_order) VALUES
  ('total_users', 'Usuários', 'Total de usuários cadastrados', 'users', '{"value": 0, "trend": "up", "change": 0}', true, true, 1),
  ('total_tests', 'Testes Realizados', 'Total de testes de clareza', 'tests', '{"value": 0, "trend": "up", "change": 0}', true, true, 2),
  ('active_today', 'Ativos Hoje', 'Usuários ativos nas últimas 24h', 'engagement', '{"value": 0, "trend": "stable", "change": 0}', true, true, 3),
  ('avg_clarity_score', 'Clareza Média', 'Score médio de clareza', 'tests', '{"value": 0, "trend": "stable", "change": 0}', true, true, 4),
  ('percent_physical_risk', '% Risco Físico', 'Percentual com risco físico alto', 'tests', '{"value": 0, "trend": "down", "change": 0}', false, false, 0),
  ('top_tags_30d', 'Tags Populares', 'Tags mais usadas nos últimos 30 dias', 'content', '{"tags": []}', false, false, 0)
ON CONFLICT (insight_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- Trilha de exemplo
INSERT INTO public.academy_tracks (slug, title, description, icon, color, level, is_published, is_premium, display_order) VALUES
  ('entendendo-narcisismo', 'Entendendo o Narcisismo', 'Aprenda os fundamentos do transtorno narcisista e como identificar padrões de comportamento.', '🎯', 'purple', 'iniciante', true, false, 1),
  ('recuperando-autoestima', 'Recuperando sua Autoestima', 'Exercícios práticos para reconstruir sua autoestima após um relacionamento abusivo.', '💪', 'green', 'intermediario', true, true, 2),
  ('limites-saudaveis', 'Estabelecendo Limites Saudáveis', 'Aprenda a definir e manter limites em relacionamentos.', '🛡️', 'blue', 'avancado', false, true, 3)
ON CONFLICT (slug) DO NOTHING;

-- ================================================================================
-- COMENTÁRIOS
-- ================================================================================

COMMENT ON TABLE public.content_items IS 'Conteúdos publicados na frontpage e blog';
COMMENT ON TABLE public.content_suggestions IS 'Sugestões de conteúdo da IA para curadoria';
COMMENT ON TABLE public.content_insights IS 'Métricas e insights agregados para exibição';
COMMENT ON TABLE public.academy_tracks IS 'Trilhas de aprendizado do Radar Academy';
COMMENT ON TABLE public.academy_lessons IS 'Aulas individuais das trilhas';
COMMENT ON TABLE public.academy_progress IS 'Progresso do usuário nas trilhas';
COMMENT ON TABLE public.fanpage_config IS 'Configuração dos blocos da frontpage';

-- ================================================================================
-- FIM DO SQL_CONSOLIDADO_03
-- ================================================================================
