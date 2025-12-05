-- ================================================================================
-- SQL_00_FIX_PLAN_CATALOG.sql
-- Corrige a tabela plan_catalog que tem estrutura diferente
-- Data: 05/12/2025
-- ================================================================================

-- Remover constraint NOT NULL de todas as colunas que podem causar problema
DO $$ 
BEGIN
  -- slug
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'slug' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN slug DROP NOT NULL;
    RAISE NOTICE 'NOT NULL removido de slug';
  END IF;
  
  -- nome_exibicao
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'nome_exibicao' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN nome_exibicao DROP NOT NULL;
    RAISE NOTICE 'NOT NULL removido de nome_exibicao';
  END IF;
  
  -- descricao
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'descricao' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN descricao DROP NOT NULL;
    RAISE NOTICE 'NOT NULL removido de descricao';
  END IF;
  
  -- preco_mensal
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'preco_mensal' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN preco_mensal DROP NOT NULL;
    RAISE NOTICE 'NOT NULL removido de preco_mensal';
  END IF;
  
  -- preco_anual
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'preco_anual' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.plan_catalog ALTER COLUMN preco_anual DROP NOT NULL;
    RAISE NOTICE 'NOT NULL removido de preco_anual';
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro: %', SQLERRM;
END $$;

-- Copiar valores entre colunas com nomes diferentes
DO $$ 
BEGIN
  -- Se tem slug, copiar para plan_key
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'slug') THEN
    UPDATE public.plan_catalog SET plan_key = slug WHERE plan_key IS NULL AND slug IS NOT NULL;
  END IF;
  
  -- Se tem nome_exibicao, copiar para name
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'nome_exibicao') THEN
    UPDATE public.plan_catalog SET name = nome_exibicao WHERE name IS NULL AND nome_exibicao IS NOT NULL;
  END IF;
  
  -- Se tem descricao, copiar para description
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'descricao') THEN
    UPDATE public.plan_catalog SET description = descricao WHERE description IS NULL AND descricao IS NOT NULL;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao copiar valores: %', SQLERRM;
END $$;

-- Limpar registros com plan_key nulo
DELETE FROM public.plan_catalog WHERE plan_key IS NULL;

-- Atualizar campos reversos para manter consistência (só se as colunas existirem)
UPDATE public.plan_catalog SET slug = plan_key WHERE slug IS NULL AND plan_key IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'nome_exibicao') THEN
    EXECUTE 'UPDATE public.plan_catalog SET nome_exibicao = name WHERE nome_exibicao IS NULL AND name IS NOT NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'descricao') THEN
    EXECUTE 'UPDATE public.plan_catalog SET descricao = description WHERE descricao IS NULL AND description IS NOT NULL';
  END IF;
END $$;

-- ================================================================================
-- DOCUMENT_HASHES - Adicionar coluna type se não existir
-- ================================================================================

ALTER TABLE public.document_hashes ADD COLUMN IF NOT EXISTS type TEXT;

-- ================================================================================
-- Mensagem de sucesso
-- ================================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ SQL_00_FIX_PLAN_CATALOG executado com sucesso!';
END $$;
