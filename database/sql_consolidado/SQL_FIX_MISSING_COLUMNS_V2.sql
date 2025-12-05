-- ================================================================================
-- SQL_FIX_MISSING_COLUMNS_V2.sql
-- Corrige colunas faltantes em tabelas existentes (versão robusta)
-- Data: 05/12/2025
-- ================================================================================
-- 
-- ⚠️ EXECUTAR ESTE ARQUIVO PRIMEIRO antes dos outros SQLs consolidados!
-- Este script adiciona colunas que podem estar faltando em tabelas já existentes.
-- Se a tabela não existir, ela será ignorada (sem erro).
--
-- ================================================================================

-- Função auxiliar para adicionar coluna se não existir
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  p_table_name TEXT,
  p_column_name TEXT,
  p_column_definition TEXT
) RETURNS VOID AS $$
BEGIN
  -- Verificar se a tabela existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = p_table_name
  ) THEN
    RAISE NOTICE 'Tabela % não existe, pulando coluna %', p_table_name, p_column_name;
    RETURN;
  END IF;
  
  -- Verificar se a coluna já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name 
    AND column_name = p_column_name
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', p_table_name, p_column_name, p_column_definition);
    RAISE NOTICE 'Coluna %.% adicionada', p_table_name, p_column_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================================================
-- PLAN_CATALOG
-- ================================================================================
SELECT add_column_if_not_exists('plan_catalog', 'plan_key', 'TEXT');
SELECT add_column_if_not_exists('plan_catalog', 'name', 'TEXT');
SELECT add_column_if_not_exists('plan_catalog', 'description', 'TEXT');
SELECT add_column_if_not_exists('plan_catalog', 'price_monthly', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('plan_catalog', 'price_yearly', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('plan_catalog', 'features', 'JSONB DEFAULT ''{}''');
SELECT add_column_if_not_exists('plan_catalog', 'limits', 'JSONB DEFAULT ''{}''');
SELECT add_column_if_not_exists('plan_catalog', 'display_order', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('plan_catalog', 'is_active', 'BOOLEAN DEFAULT TRUE');
SELECT add_column_if_not_exists('plan_catalog', 'currency', 'TEXT DEFAULT ''BRL''');
SELECT add_column_if_not_exists('plan_catalog', 'stripe_price_id_monthly', 'TEXT');
SELECT add_column_if_not_exists('plan_catalog', 'stripe_price_id_yearly', 'TEXT');

-- ================================================================================
-- ACADEMY_TRACKS
-- ================================================================================
SELECT add_column_if_not_exists('academy_tracks', 'slug', 'TEXT');
SELECT add_column_if_not_exists('academy_tracks', 'title', 'TEXT');
SELECT add_column_if_not_exists('academy_tracks', 'description', 'TEXT');
SELECT add_column_if_not_exists('academy_tracks', 'icon', 'TEXT DEFAULT ''📚''');
SELECT add_column_if_not_exists('academy_tracks', 'color', 'TEXT DEFAULT ''purple''');
SELECT add_column_if_not_exists('academy_tracks', 'level', 'TEXT DEFAULT ''iniciante''');
SELECT add_column_if_not_exists('academy_tracks', 'is_published', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('academy_tracks', 'is_premium', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('academy_tracks', 'display_order', 'INTEGER DEFAULT 0');

-- ================================================================================
-- ACADEMY_PROGRESS
-- ================================================================================
SELECT add_column_if_not_exists('academy_progress', 'user_id', 'UUID');
SELECT add_column_if_not_exists('academy_progress', 'track_id', 'UUID');
SELECT add_column_if_not_exists('academy_progress', 'lesson_id', 'UUID');
SELECT add_column_if_not_exists('academy_progress', 'status', 'TEXT DEFAULT ''not_started''');

-- ================================================================================
-- CONTENT_ITEMS
-- ================================================================================
SELECT add_column_if_not_exists('content_items', 'slug', 'TEXT');
SELECT add_column_if_not_exists('content_items', 'title', 'TEXT');
SELECT add_column_if_not_exists('content_items', 'status', 'TEXT DEFAULT ''draft''');
SELECT add_column_if_not_exists('content_items', 'visibility', 'TEXT DEFAULT ''public''');
SELECT add_column_if_not_exists('content_items', 'type', 'TEXT DEFAULT ''article''');

-- ================================================================================
-- CONTENT_INSIGHTS
-- ================================================================================
SELECT add_column_if_not_exists('content_insights', 'insight_key', 'TEXT');
SELECT add_column_if_not_exists('content_insights', 'display_name', 'TEXT');
SELECT add_column_if_not_exists('content_insights', 'description', 'TEXT');
SELECT add_column_if_not_exists('content_insights', 'category', 'TEXT');
SELECT add_column_if_not_exists('content_insights', 'value_json', 'JSONB DEFAULT ''{}''');
SELECT add_column_if_not_exists('content_insights', 'is_public', 'BOOLEAN DEFAULT true');
SELECT add_column_if_not_exists('content_insights', 'show_on_frontpage', 'BOOLEAN DEFAULT false');
SELECT add_column_if_not_exists('content_insights', 'frontpage_order', 'INTEGER DEFAULT 0');

-- ================================================================================
-- FANPAGE_CONFIG
-- ================================================================================
SELECT add_column_if_not_exists('fanpage_config', 'block_key', 'TEXT');
SELECT add_column_if_not_exists('fanpage_config', 'title', 'TEXT');
SELECT add_column_if_not_exists('fanpage_config', 'description', 'TEXT');
SELECT add_column_if_not_exists('fanpage_config', 'icon', 'TEXT');
SELECT add_column_if_not_exists('fanpage_config', 'enabled', 'BOOLEAN DEFAULT true');
SELECT add_column_if_not_exists('fanpage_config', 'display_order', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('fanpage_config', 'max_items', 'INTEGER DEFAULT 5');
SELECT add_column_if_not_exists('fanpage_config', 'refresh_interval_minutes', 'INTEGER DEFAULT 60');
SELECT add_column_if_not_exists('fanpage_config', 'source_type', 'TEXT DEFAULT ''internal''');
SELECT add_column_if_not_exists('fanpage_config', 'config', 'JSONB DEFAULT ''{}''');

-- ================================================================================
-- USER_PROFILES - Verificar se precisa renomear id para user_id
-- ================================================================================
DO $$ 
BEGIN
  -- Se a tabela existe e tem 'id' mas não tem 'user_id', renomear
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE public.user_profiles RENAME COLUMN id TO user_id;
      RAISE NOTICE 'Coluna user_profiles.id renomeada para user_id';
    END IF;
  END IF;
END $$;

-- ================================================================================
-- Limpar função auxiliar (opcional)
-- ================================================================================
-- DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT);

DO $$ 
BEGIN
  RAISE NOTICE 'Script SQL_FIX_MISSING_COLUMNS_V2 executado com sucesso!';
END $$;
