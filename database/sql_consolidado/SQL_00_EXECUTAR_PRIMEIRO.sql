-- ================================================================================
-- SQL_00_EXECUTAR_PRIMEIRO.sql
-- ⚠️ EXECUTAR ESTE ARQUIVO ANTES DE QUALQUER OUTRO!
-- Data: 05/12/2025
-- ================================================================================

-- ================================================================================
-- 1. PLAN_CATALOG - Remover constraints NOT NULL problemáticas
-- ================================================================================

DO $$ 
BEGIN
  -- slug
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'slug' AND is_nullable = 'NO') THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN slug DROP NOT NULL;
  END IF;
  -- nome_exibicao
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'nome_exibicao' AND is_nullable = 'NO') THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN nome_exibicao DROP NOT NULL;
  END IF;
  -- descricao
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'descricao' AND is_nullable = 'NO') THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN descricao DROP NOT NULL;
  END IF;
  -- preco_mensal
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'preco_mensal' AND is_nullable = 'NO') THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN preco_mensal DROP NOT NULL;
  END IF;
  -- preco_anual
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'preco_anual' AND is_nullable = 'NO') THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN preco_anual DROP NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro em plan_catalog: %', SQLERRM;
END $$;

-- Limpar registros problemáticos
DELETE FROM public.plan_catalog WHERE plan_key IS NULL;

-- ================================================================================
-- 2. DOCUMENT_HASHES - Adicionar coluna type se não existir
-- ================================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_hashes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'document_hashes' AND column_name = 'type') THEN
      ALTER TABLE public.document_hashes ADD COLUMN type TEXT;
      RAISE NOTICE 'Coluna type adicionada em document_hashes';
    END IF;
  END IF;
END $$;

-- ================================================================================
-- 3. JOURNAL_ATTACHMENTS - Adicionar coluna type se não existir
-- ================================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'journal_attachments') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_attachments' AND column_name = 'type') THEN
      ALTER TABLE public.journal_attachments ADD COLUMN type TEXT;
      RAISE NOTICE 'Coluna type adicionada em journal_attachments';
    END IF;
  END IF;
END $$;

-- ================================================================================
-- 4. USER_PROFILES - Verificar estrutura (user_id vs id)
-- ================================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'id')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'user_id') THEN
      ALTER TABLE public.user_profiles RENAME COLUMN id TO user_id;
      RAISE NOTICE 'Coluna user_profiles.id renomeada para user_id';
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro em user_profiles: %', SQLERRM;
END $$;

-- ================================================================================
-- 5. Adicionar colunas faltantes em várias tabelas
-- ================================================================================

-- plan_catalog
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS plan_key TEXT;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS price_monthly INTEGER DEFAULT 0;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS price_yearly INTEGER DEFAULT 0;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}';
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{}';
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Criar índice único se não existir
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_catalog_plan_key ON public.plan_catalog(plan_key);

-- ================================================================================
-- 6. Sincronizar valores entre colunas PT/EN
-- ================================================================================

DO $$
BEGIN
  -- plan_key <- slug
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'slug') THEN
    UPDATE public.plan_catalog SET plan_key = slug WHERE plan_key IS NULL AND slug IS NOT NULL;
  END IF;
  -- slug <- plan_key
  UPDATE public.plan_catalog SET slug = plan_key WHERE slug IS NULL AND plan_key IS NOT NULL;
  
  -- name <- nome_exibicao
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'nome_exibicao') THEN
    UPDATE public.plan_catalog SET name = nome_exibicao WHERE name IS NULL AND nome_exibicao IS NOT NULL;
    UPDATE public.plan_catalog SET nome_exibicao = name WHERE nome_exibicao IS NULL AND name IS NOT NULL;
  END IF;
  
  -- description <- descricao
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'descricao') THEN
    UPDATE public.plan_catalog SET description = descricao WHERE description IS NULL AND descricao IS NOT NULL;
    UPDATE public.plan_catalog SET descricao = description WHERE descricao IS NULL AND description IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao sincronizar: %', SQLERRM;
END $$;

-- ================================================================================
-- 7. USER_ADDONS - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.user_addons ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.user_addons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE IF EXISTS public.user_addons ADD COLUMN IF NOT EXISTS addon_key TEXT;
ALTER TABLE IF EXISTS public.user_addons ADD COLUMN IF NOT EXISTS credits_remaining INTEGER;
ALTER TABLE IF EXISTS public.user_addons ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ================================================================================
-- 7b. AI_PROVIDERS_CORE - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.ai_providers_core ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';
ALTER TABLE IF EXISTS public.ai_providers_core ADD COLUMN IF NOT EXISTS slug TEXT;

-- ================================================================================
-- 7c. AI_USAGE_LOGS - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.ai_usage_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success';

-- ================================================================================
-- 8. USER_FEATURE_OVERRIDES - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.user_feature_overrides ADD COLUMN IF NOT EXISTS user_id UUID;

-- ================================================================================
-- 9. USER_SUBSCRIPTIONS_CORE - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.user_subscriptions_core ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.user_subscriptions_core ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE IF EXISTS public.user_subscriptions_core ADD COLUMN IF NOT EXISTS plan_slug TEXT;

-- ================================================================================
-- 10. AI_GROUP_OVERRIDES - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.ai_group_overrides ADD COLUMN IF NOT EXISTS user_id UUID;

-- ================================================================================
-- 11. AI_USAGE_LOGS - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.ai_usage_logs ADD COLUMN IF NOT EXISTS user_id UUID;

-- ================================================================================
-- 12. RISK_ALERTS - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.risk_alerts ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'MEDIUM';
ALTER TABLE IF EXISTS public.risk_alerts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'OTHER';

-- ================================================================================
-- 13. CONTENT_ITEMS - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'article';
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'internal';
ALTER TABLE IF EXISTS public.content_items ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- ================================================================================
-- 14. ACADEMY_TRACKS - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.academy_tracks ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS public.academy_tracks ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'iniciante';
ALTER TABLE IF EXISTS public.academy_tracks ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.academy_tracks ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.academy_tracks ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- ================================================================================
-- 15. CONTENT_INSIGHTS - Adicionar colunas e remover NOT NULL problemáticos
-- ================================================================================

ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS insight_key TEXT;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS show_on_frontpage BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS frontpage_order INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.content_insights ADD COLUMN IF NOT EXISTS value_json JSONB DEFAULT '{}';

-- Remover NOT NULL de colunas problemáticas em content_insights
DO $$
DECLARE
  col_name TEXT;
  cols TEXT[] := ARRAY['metric_key', 'label_pt', 'label_en', 'source_table', 'source_column', 'aggregation', 'format_type', 'icon', 'color', 'visibility', 'refresh_frequency'];
BEGIN
  FOREACH col_name IN ARRAY cols LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'content_insights' AND column_name = col_name AND is_nullable = 'NO') THEN
      EXECUTE format('ALTER TABLE public.content_insights ALTER COLUMN %I DROP NOT NULL', col_name);
      RAISE NOTICE 'NOT NULL removido de content_insights.%', col_name;
    END IF;
  END LOOP;
END $$;

-- Criar índices únicos se não existirem (só se tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_insights') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_content_insights_key ON public.content_insights(insight_key);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_items') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'academy_tracks') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_academy_tracks_slug ON public.academy_tracks(slug);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fanpage_config') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_fanpage_config_block_key ON public.fanpage_config(block_key);
  END IF;
END $$;

-- ================================================================================
-- 16. FANPAGE_CONFIG - Adicionar colunas faltantes
-- ================================================================================

ALTER TABLE IF EXISTS public.fanpage_config ADD COLUMN IF NOT EXISTS block_key TEXT;
ALTER TABLE IF EXISTS public.fanpage_config ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.fanpage_config ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- ================================================================================
-- SUCESSO
-- ================================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ SQL_00_EXECUTAR_PRIMEIRO concluído com sucesso!';
  RAISE NOTICE 'Agora execute: SQL_CONSOLIDADO_01_BASE.sql';
END $$;
