-- ============================================================================
-- MIGRATION: Sistema de Conteúdo (FanPage Viva)
-- Data: 30/11/2025
-- ETAPA 8.1: Criar tabelas para gerenciar conteúdo dinâmico da frontpage
-- Objetivo: Permitir curadoria de conteúdo interno e externo via admin
-- ============================================================================

-- ============================================================================
-- TABELA: content_sources
-- Fontes externas confiáveis para curadoria de conteúdo
-- Ex: podcasts, blogs, canais YouTube, perfis Instagram, estudos acadêmicos
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  name TEXT NOT NULL,                              -- Nome da fonte (ex: "Podcast Mentes em Pauta")
  slug TEXT UNIQUE NOT NULL,                       -- Slug único para URL
  source_type TEXT NOT NULL DEFAULT 'blog',        -- 'blog', 'podcast', 'youtube', 'instagram', 'academic', 'news', 'book', 'other'
  
  -- URLs e contato
  url TEXT,                                        -- URL principal da fonte
  feed_url TEXT,                                   -- RSS/Atom feed (se disponível)
  social_handle TEXT,                              -- @handle se for rede social
  
  -- Classificação
  trust_level INTEGER DEFAULT 3,                   -- 1-5 (5 = máxima confiança)
  topics TEXT[] DEFAULT '{}',                      -- Tópicos cobertos: 'narcisismo', 'abuso', 'recuperacao', etc.
  language TEXT DEFAULT 'pt-BR',                   -- Idioma principal
  
  -- Status
  is_active BOOLEAN DEFAULT true,                  -- Se está sendo monitorada
  last_checked_at TIMESTAMPTZ,                     -- Última vez que foi verificada
  
  -- Metadados
  notes TEXT,                                      -- Notas internas do admin
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_sources_slug ON content_sources(slug);
CREATE INDEX IF NOT EXISTS idx_content_sources_type ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_content_sources_active ON content_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_content_sources_trust ON content_sources(trust_level);

-- ============================================================================
-- TABELA: content_items
-- Conteúdos publicados na frontpage (artigos, FAQs, notícias, lições)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  slug TEXT UNIQUE NOT NULL,                       -- Slug único para URL
  content_type TEXT NOT NULL DEFAULT 'article',    -- 'article', 'faq', 'news', 'lesson', 'tip', 'story', 'resource'
  
  -- Origem do conteúdo
  source_type TEXT NOT NULL DEFAULT 'internal',    -- 'internal' (criado aqui), 'external_curated' (curado de fora), 'ai_generated'
  source_id UUID REFERENCES content_sources(id),   -- Se veio de fonte externa
  original_url TEXT,                               -- URL original (se externo)
  
  -- Conteúdo (internacionalizado)
  title_pt TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  summary_pt TEXT,                                 -- Resumo curto (para cards)
  summary_en TEXT,
  summary_es TEXT,
  body_pt TEXT,                                    -- Conteúdo completo (Markdown)
  body_en TEXT,
  body_es TEXT,
  
  -- Mídia
  cover_image_url TEXT,                            -- Imagem de capa
  thumbnail_url TEXT,                              -- Thumbnail para cards
  media_type TEXT,                                 -- 'image', 'video', 'audio', 'none'
  media_url TEXT,                                  -- URL do vídeo/áudio se houver
  
  -- Classificação
  topics TEXT[] DEFAULT '{}',                      -- Tags: 'gaslighting', 'recuperacao', 'filhos', etc.
  target_audience TEXT DEFAULT 'all',              -- 'all', 'victims', 'professionals', 'supporters'
  difficulty_level TEXT DEFAULT 'beginner',        -- 'beginner', 'intermediate', 'advanced'
  reading_time_minutes INTEGER DEFAULT 5,
  
  -- Visibilidade e publicação
  visibility TEXT NOT NULL DEFAULT 'draft',        -- 'draft', 'private', 'public', 'archived'
  is_featured BOOLEAN DEFAULT false,               -- Destaque na frontpage
  is_pinned BOOLEAN DEFAULT false,                 -- Fixado no topo
  published_at TIMESTAMPTZ,                        -- Data de publicação
  expires_at TIMESTAMPTZ,                          -- Data de expiração (se temporário)
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  
  -- Engajamento (contadores)
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Metadados
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_visibility ON content_items(visibility);
CREATE INDEX IF NOT EXISTS idx_content_items_featured ON content_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_content_items_published ON content_items(published_at) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_content_items_topics ON content_items USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_content_items_source ON content_items(source_id);

-- ============================================================================
-- TABELA: content_suggestions
-- Sugestões de conteúdo (da IA ou manual) aguardando aprovação
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Origem da sugestão
  suggestion_source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'ai_curator', 'ai_internal', 'user_submitted'
  source_id UUID REFERENCES content_sources(id),    -- Se veio de fonte externa
  
  -- Conteúdo sugerido
  original_url TEXT,                               -- URL original (se externo)
  original_title TEXT,                             -- Título original
  original_content TEXT,                           -- Conteúdo original ou trecho
  
  -- Proposta da IA/curador
  suggested_title_pt TEXT,
  suggested_summary_pt TEXT,
  suggested_body_pt TEXT,                          -- Corpo editado/resumido
  suggested_type TEXT DEFAULT 'article',           -- Tipo sugerido
  suggested_topics TEXT[] DEFAULT '{}',            -- Tags sugeridas
  
  -- Análise da IA
  ai_relevance_score DECIMAL(3,2),                 -- 0.00 a 1.00 (relevância para o Radar)
  ai_quality_score DECIMAL(3,2),                   -- 0.00 a 1.00 (qualidade do conteúdo)
  ai_reasoning TEXT,                               -- Explicação da IA sobre a sugestão
  
  -- Status do workflow
  status TEXT NOT NULL DEFAULT 'pending',          -- 'pending', 'approved', 'rejected', 'edited', 'published'
  priority TEXT DEFAULT 'normal',                  -- 'low', 'normal', 'high', 'urgent'
  
  -- Decisão do admin
  admin_notes TEXT,                                -- Notas do admin sobre a decisão
  rejection_reason TEXT,                           -- Motivo da rejeição (se rejeitado)
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Se aprovado, link para o item publicado
  published_item_id UUID REFERENCES content_items(id),
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_suggestions_status ON content_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_source ON content_suggestions(suggestion_source);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_priority ON content_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_pending ON content_suggestions(created_at) WHERE status = 'pending';

-- ============================================================================
-- TABELA: content_collections
-- Coleções/trilhas de conteúdo (ex: "Radar Academy", "Primeiros Passos")
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  slug TEXT UNIQUE NOT NULL,
  collection_type TEXT NOT NULL DEFAULT 'trail',   -- 'trail' (trilha), 'series', 'topic', 'featured'
  
  -- Conteúdo (internacionalizado)
  name_pt TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  
  -- Visual
  icon TEXT DEFAULT 'BookOpen',                    -- Ícone lucide-react
  color TEXT DEFAULT 'purple',                     -- Cor tema
  cover_image_url TEXT,
  
  -- Classificação
  target_audience TEXT DEFAULT 'all',              -- 'all', 'victims', 'professionals', 'supporters'
  difficulty_level TEXT DEFAULT 'beginner',        -- 'beginner', 'intermediate', 'advanced'
  estimated_duration_minutes INTEGER,              -- Tempo total estimado
  
  -- Visibilidade
  visibility TEXT NOT NULL DEFAULT 'draft',        -- 'draft', 'private', 'public', 'archived'
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,                -- Requer plano pago
  required_plan_code TEXT,                         -- Código do plano mínimo (se premium)
  
  -- Metadados
  sort_order INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,                    -- Cache do número de itens
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_collections_slug ON content_collections(slug);
CREATE INDEX IF NOT EXISTS idx_content_collections_type ON content_collections(collection_type);
CREATE INDEX IF NOT EXISTS idx_content_collections_visibility ON content_collections(visibility);
CREATE INDEX IF NOT EXISTS idx_content_collections_featured ON content_collections(is_featured) WHERE is_featured = true;

-- ============================================================================
-- TABELA: content_collection_items
-- Ponte entre coleções e itens de conteúdo (N:N)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  collection_id UUID NOT NULL REFERENCES content_collections(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  
  -- Posição na coleção
  position INTEGER NOT NULL DEFAULT 0,
  
  -- Metadados específicos da relação
  is_required BOOLEAN DEFAULT false,               -- Se é obrigatório na trilha
  unlock_after_id UUID REFERENCES content_items(id), -- Desbloqueia após completar outro item
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraint única
  UNIQUE(collection_id, content_item_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON content_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_content ON content_collection_items(content_item_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_position ON content_collection_items(collection_id, position);

-- ============================================================================
-- TABELA: content_insights
-- Dados agregados para "Radar em Números" (estatísticas públicas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  metric_key TEXT UNIQUE NOT NULL,                 -- Ex: 'total_users', 'tests_completed', 'avg_clarity_score'
  metric_category TEXT NOT NULL DEFAULT 'general', -- 'general', 'engagement', 'content', 'safety', 'emotional'
  
  -- Valor
  value_numeric DECIMAL(15,4),                     -- Valor numérico (se aplicável)
  value_text TEXT,                                 -- Valor texto (se aplicável)
  value_json JSONB,                                -- Valor complexo (se aplicável)
  
  -- Exibição (internacionalizado)
  label_pt TEXT NOT NULL,
  label_en TEXT,
  label_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  
  -- Formatação
  display_format TEXT DEFAULT 'number',            -- 'number', 'percentage', 'currency', 'text', 'chart'
  display_prefix TEXT,                             -- Ex: "R$", "+"
  display_suffix TEXT,                             -- Ex: "%", " usuários"
  decimal_places INTEGER DEFAULT 0,
  
  -- Visual
  icon TEXT DEFAULT 'BarChart',
  color TEXT DEFAULT 'blue',
  
  -- Visibilidade
  visibility TEXT NOT NULL DEFAULT 'private',      -- 'private', 'public', 'admin_only'
  is_featured BOOLEAN DEFAULT false,               -- Mostrar na frontpage
  
  -- Atualização
  update_frequency TEXT DEFAULT 'daily',           -- 'realtime', 'hourly', 'daily', 'weekly', 'manual'
  last_computed_at TIMESTAMPTZ,
  next_compute_at TIMESTAMPTZ,
  
  -- Metadados
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_insights_key ON content_insights(metric_key);
CREATE INDEX IF NOT EXISTS idx_content_insights_category ON content_insights(metric_category);
CREATE INDEX IF NOT EXISTS idx_content_insights_visibility ON content_insights(visibility);
CREATE INDEX IF NOT EXISTS idx_content_insights_featured ON content_insights(is_featured) WHERE is_featured = true;

-- ============================================================================
-- TRIGGERS: updated_at automático
-- ============================================================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabela
DROP TRIGGER IF EXISTS update_content_sources_updated_at ON content_sources;
CREATE TRIGGER update_content_sources_updated_at
  BEFORE UPDATE ON content_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_suggestions_updated_at ON content_suggestions;
CREATE TRIGGER update_content_suggestions_updated_at
  BEFORE UPDATE ON content_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_collections_updated_at ON content_collections;
CREATE TRIGGER update_content_collections_updated_at
  BEFORE UPDATE ON content_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_insights_updated_at ON content_insights;
CREATE TRIGGER update_content_insights_updated_at
  BEFORE UPDATE ON content_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS: content_items (leitura pública para visibility='public')
-- ============================================================================

-- Leitura pública de conteúdos publicados
DROP POLICY IF EXISTS "content_items_public_read" ON content_items;
CREATE POLICY "content_items_public_read" ON content_items
  FOR SELECT
  USING (visibility = 'public');

-- ============================================================================
-- POLÍTICAS: content_collections (leitura pública para visibility='public')
-- ============================================================================

DROP POLICY IF EXISTS "content_collections_public_read" ON content_collections;
CREATE POLICY "content_collections_public_read" ON content_collections
  FOR SELECT
  USING (visibility = 'public');

-- ============================================================================
-- POLÍTICAS: content_collection_items (leitura se coleção é pública)
-- ============================================================================

DROP POLICY IF EXISTS "content_collection_items_public_read" ON content_collection_items;
CREATE POLICY "content_collection_items_public_read" ON content_collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_collections 
      WHERE id = collection_id AND visibility = 'public'
    )
  );

-- ============================================================================
-- POLÍTICAS: content_insights (leitura pública para visibility='public')
-- ============================================================================

DROP POLICY IF EXISTS "content_insights_public_read" ON content_insights;
CREATE POLICY "content_insights_public_read" ON content_insights
  FOR SELECT
  USING (visibility = 'public');

-- ============================================================================
-- POLÍTICAS: content_sources e content_suggestions (somente admin via app)
-- Não há política pública - acesso apenas via service_role no backend
-- ============================================================================

-- Nota: content_sources e content_suggestions não têm políticas públicas.
-- O acesso é feito via service_role key no backend (APIs admin).
-- Isso garante que apenas admins autenticados via app podem ver/editar.

-- ============================================================================
-- SEED DATA: Métricas iniciais para "Radar em Números"
-- ============================================================================

INSERT INTO content_insights (metric_key, metric_category, value_numeric, label_pt, label_en, description_pt, display_format, icon, color, visibility, is_featured, sort_order)
VALUES
  ('total_users', 'general', 0, 'Usuários', 'Users', 'Total de pessoas usando o Radar', 'number', 'Users', 'purple', 'public', true, 1),
  ('tests_completed', 'engagement', 0, 'Testes Realizados', 'Tests Completed', 'Testes de Clareza finalizados', 'number', 'ClipboardCheck', 'blue', 'public', true, 2),
  ('diary_entries', 'engagement', 0, 'Registros no Diário', 'Diary Entries', 'Episódios documentados', 'number', 'BookOpen', 'green', 'public', true, 3),
  ('chat_sessions', 'engagement', 0, 'Conversas com Coach', 'Coach Sessions', 'Sessões de apoio com IA', 'number', 'MessageCircle', 'orange', 'public', true, 4),
  ('safety_plans_created', 'safety', 0, 'Planos de Segurança', 'Safety Plans', 'Planos de proteção criados', 'number', 'Shield', 'red', 'public', true, 5),
  ('avg_clarity_improvement', 'emotional', 0, 'Melhora na Clareza', 'Clarity Improvement', 'Melhora média no score de clareza', 'percentage', 'TrendingUp', 'emerald', 'public', true, 6)
ON CONFLICT (metric_key) DO NOTHING;

-- ============================================================================
-- SEED DATA: FAQs iniciais
-- ============================================================================

INSERT INTO content_items (slug, content_type, source_type, title_pt, summary_pt, body_pt, topics, visibility, sort_order)
VALUES
  ('o-que-e-narcisismo', 'faq', 'internal', 
   'O que é narcisismo?', 
   'Entenda a diferença entre traços narcisistas e Transtorno de Personalidade Narcisista.',
   '## O que é narcisismo?

Narcisismo é um espectro. Todos temos algum grau de narcisismo saudável (autoestima, ambição). O problema surge quando esses traços se tornam extremos e prejudicam relacionamentos.

### Traços vs. Transtorno

- **Traços narcisistas**: Comportamentos ocasionais de egocentrismo, necessidade de admiração
- **Transtorno de Personalidade Narcisista (TPN)**: Padrão persistente e inflexível que causa sofrimento significativo

### Sinais de alerta

1. Falta de empatia genuína
2. Necessidade constante de admiração
3. Senso de grandiosidade
4. Manipulação emocional
5. Incapacidade de aceitar críticas

**Importante**: O Radar não diagnostica. Apenas ajuda você a identificar padrões.',
   ARRAY['narcisismo', 'basico', 'definicao'],
   'public', 1),
   
  ('o-que-e-gaslighting', 'faq', 'internal',
   'O que é gaslighting?',
   'Gaslighting é uma forma de manipulação que faz você duvidar da própria realidade.',
   '## O que é gaslighting?

Gaslighting é uma técnica de manipulação psicológica onde o abusador faz a vítima questionar sua própria memória, percepção e sanidade.

### Frases típicas de gaslighting

- "Isso nunca aconteceu"
- "Você está exagerando"
- "Você é muito sensível"
- "Eu nunca disse isso"
- "Você está ficando louca/louco"

### Como identificar

1. Você constantemente duvida de si mesma(o)
2. Você se desculpa o tempo todo
3. Você sente que está "enlouquecendo"
4. Você minimiza comportamentos abusivos
5. Você perdeu a confiança em suas próprias percepções

### O que fazer

- Documente tudo (o Diário do Radar ajuda nisso)
- Confie nas suas memórias
- Busque validação externa de pessoas de confiança',
   ARRAY['gaslighting', 'manipulacao', 'basico'],
   'public', 2),
   
  ('radar-substitui-terapia', 'faq', 'internal',
   'O Radar substitui terapia?',
   'Não. O Radar é uma ferramenta de apoio, não um substituto para acompanhamento profissional.',
   '## O Radar substitui terapia?

**Não.** O Radar Narcisista é uma ferramenta de apoio e documentação, não um substituto para acompanhamento profissional de saúde mental.

### O que o Radar faz

✅ Ajuda a identificar padrões de comportamento
✅ Oferece um espaço seguro para documentar episódios
✅ Fornece informações educativas
✅ Conecta você com recursos de emergência
✅ Oferece apoio via Coach IA (não é terapia)

### O que o Radar NÃO faz

❌ Não diagnostica transtornos
❌ Não substitui terapia ou psiquiatria
❌ Não oferece aconselhamento jurídico
❌ Não é um serviço de emergência

### Quando buscar ajuda profissional

- Se você está em perigo físico imediato
- Se está tendo pensamentos de automutilação
- Se precisa de diagnóstico ou medicação
- Se precisa de orientação jurídica

**Em emergência, ligue 190 (Polícia) ou 188 (CVV)**',
   ARRAY['limites', 'terapia', 'importante'],
   'public', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Resumo das tabelas criadas:
-- 1. content_sources: Fontes externas confiáveis
-- 2. content_items: Conteúdos publicados (artigos, FAQs, notícias, lições)
-- 3. content_suggestions: Sugestões aguardando aprovação
-- 4. content_collections: Coleções/trilhas (Radar Academy)
-- 5. content_collection_items: Ponte coleção ↔ conteúdo
-- 6. content_insights: Métricas agregadas (Radar em Números)
