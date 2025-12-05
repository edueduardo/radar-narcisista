-- ================================================================================
-- SQL_00_FIX_PRIMEIRO.sql
-- EXECUTAR ANTES DE QUALQUER OUTRO SQL!
-- Adiciona colunas faltantes em tabelas existentes
-- Data: 05/12/2025
-- ================================================================================

-- ================================================================================
-- PLAN_CATALOG - Adicionar colunas faltantes
-- ================================================================================

-- Adicionar plan_key
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS plan_key TEXT;

-- Adicionar name
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS name TEXT;

-- Adicionar description
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS description TEXT;

-- Adicionar price_monthly
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS price_monthly INTEGER DEFAULT 0;

-- Adicionar price_yearly
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS price_yearly INTEGER DEFAULT 0;

-- Adicionar features
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}';

-- Adicionar limits
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{}';

-- Adicionar display_order
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Adicionar is_active
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Adicionar currency
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- Adicionar stripe_price_id_monthly
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT;

-- Adicionar stripe_price_id_yearly
ALTER TABLE public.plan_catalog ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;

-- Criar índice único em plan_key se não existir
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_catalog_plan_key ON public.plan_catalog(plan_key);

-- ================================================================================
-- USER_PROFILES - Verificar estrutura (user_id vs id)
-- ================================================================================

-- Se a tabela user_profiles existe e não tem user_id, adicionar
DO $$ 
BEGIN
  -- Verificar se tem coluna 'id' mas não 'user_id'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'user_id'
  ) THEN
    -- Renomear id para user_id
    ALTER TABLE public.user_profiles RENAME COLUMN id TO user_id;
    RAISE NOTICE 'Coluna user_profiles.id renomeada para user_id';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao verificar user_profiles: %', SQLERRM;
END $$;

-- ================================================================================
-- PROFILES - Tabela alternativa que pode existir
-- ================================================================================

-- Se existe tabela 'profiles' (sem user_), verificar estrutura
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Adicionar role se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'USER';
    END IF;
  END IF;
END $$;

-- ================================================================================
-- Mensagem de sucesso
-- ================================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ SQL_00_FIX_PRIMEIRO executado com sucesso!';
END $$;
