-- ================================================================================
-- SQL_FIX_MISSING_COLUMNS.sql
-- Corrige colunas faltantes em tabelas existentes
-- Data: 05/12/2025
-- ================================================================================
-- 
-- ⚠️ EXECUTAR ESTE ARQUIVO PRIMEIRO antes dos outros SQLs consolidados!
-- Este script adiciona colunas que podem estar faltando em tabelas já existentes.
-- Se a tabela não existir, ela será ignorada (sem erro).
--
-- ================================================================================

-- ================================================================================
-- PLAN_CATALOG - Adicionar colunas faltantes (só se a tabela existir)
-- ================================================================================

-- Primeiro verificar se a tabela existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plan_catalog') THEN
    RAISE NOTICE 'Tabela plan_catalog não existe, pulando...';
    RETURN;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'plan_key'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN plan_key TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_catalog_plan_key ON public.plan_catalog(plan_key);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN name TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN description TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'price_monthly'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN price_monthly INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'price_yearly'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN price_yearly INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN features JSONB DEFAULT '{}';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'limits'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN limits JSONB DEFAULT '{}';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN currency TEXT DEFAULT 'BRL';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'stripe_price_id_monthly'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN stripe_price_id_monthly TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_catalog' 
    AND column_name = 'stripe_price_id_yearly'
  ) THEN
    ALTER TABLE public.plan_catalog ADD COLUMN stripe_price_id_yearly TEXT;
  END IF;
END $$;

-- ================================================================================
-- ACADEMY_TRACKS - Adicionar colunas faltantes
-- ================================================================================

-- Adicionar slug se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN slug TEXT;
    -- Criar índice único
    CREATE UNIQUE INDEX IF NOT EXISTS idx_academy_tracks_slug_unique ON public.academy_tracks(slug);
  END IF;
END $$;

-- Adicionar title se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN title TEXT;
  END IF;
END $$;

-- Adicionar description se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN description TEXT;
  END IF;
END $$;

-- Adicionar icon se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN icon TEXT DEFAULT '📚';
  END IF;
END $$;

-- Adicionar color se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'color'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN color TEXT DEFAULT 'purple';
  END IF;
END $$;

-- Adicionar level se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'level'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN level TEXT DEFAULT 'iniciante';
  END IF;
END $$;

-- Adicionar is_published se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Adicionar is_premium se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN is_premium BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Adicionar display_order se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_tracks' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.academy_tracks ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- ================================================================================
-- CONTENT_ITEMS - Adicionar colunas faltantes
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_items' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.content_items ADD COLUMN slug TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_content_items_slug_unique ON public.content_items(slug);
  END IF;
END $$;

-- ================================================================================
-- USER_PROFILES - Verificar estrutura
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'user_id'
  ) THEN
    -- Se não tem user_id, provavelmente a tabela tem estrutura diferente
    -- Verificar se tem 'id' como PK
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles' 
      AND column_name = 'id'
    ) THEN
      -- Renomear id para user_id
      ALTER TABLE public.user_profiles RENAME COLUMN id TO user_id;
    END IF;
  END IF;
END $$;

-- ================================================================================
-- FANPAGE_CONFIG - Adicionar colunas faltantes
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'block_key'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN block_key TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_fanpage_config_block_key ON public.fanpage_config(block_key);
  END IF;
END $$;

-- ================================================================================
-- CONTENT_INSIGHTS - Adicionar colunas faltantes
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'insight_key'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN insight_key TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_content_insights_key_unique ON public.content_insights(insight_key);
  END IF;
END $$;

-- ================================================================================
-- ACADEMY_PROGRESS - Adicionar user_id se não existir
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_progress' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.academy_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_progress' 
    AND column_name = 'track_id'
  ) THEN
    ALTER TABLE public.academy_progress ADD COLUMN track_id UUID;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_progress' 
    AND column_name = 'lesson_id'
  ) THEN
    ALTER TABLE public.academy_progress ADD COLUMN lesson_id UUID;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'academy_progress' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.academy_progress ADD COLUMN status TEXT DEFAULT 'not_started';
  END IF;
END $$;

-- ================================================================================
-- CONTENT_ITEMS - Adicionar mais colunas faltantes
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_items' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.content_items ADD COLUMN title TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_items' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.content_items ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_items' 
    AND column_name = 'visibility'
  ) THEN
    ALTER TABLE public.content_items ADD COLUMN visibility TEXT DEFAULT 'public';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_items' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.content_items ADD COLUMN type TEXT DEFAULT 'article';
  END IF;
END $$;

-- ================================================================================
-- CONTENT_INSIGHTS - Adicionar mais colunas faltantes
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN display_name TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN description TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN category TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'value_json'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN value_json JSONB DEFAULT '{}';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'show_on_frontpage'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN show_on_frontpage BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_insights' 
    AND column_name = 'frontpage_order'
  ) THEN
    ALTER TABLE public.content_insights ADD COLUMN frontpage_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- ================================================================================
-- FANPAGE_CONFIG - Adicionar mais colunas faltantes
-- ================================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN title TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN description TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN icon TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'enabled'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'max_items'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN max_items INTEGER DEFAULT 5;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'refresh_interval_minutes'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN refresh_interval_minutes INTEGER DEFAULT 60;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'source_type'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN source_type TEXT DEFAULT 'internal';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fanpage_config' 
    AND column_name = 'config'
  ) THEN
    ALTER TABLE public.fanpage_config ADD COLUMN config JSONB DEFAULT '{}';
  END IF;
END $$;

-- ================================================================================
-- Mensagem de sucesso
-- ================================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Colunas faltantes adicionadas com sucesso!';
END $$;
