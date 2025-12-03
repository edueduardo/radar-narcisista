-- ============================================================================
-- RADAR NARCISISTA - MEGA SQL PARTE 4
-- PROFESSIONAL + CLARITY FIELDS + ADMIN RLS
-- Data: 03/12/2025
-- ============================================================================
-- INSTRUÇÕES: Cole no Supabase SQL Editor e clique Run
-- IMPORTANTE: Execute DEPOIS das PARTES 1, 2 e 3
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: PROFESSIONAL CLIENTS (Relação Profissional ↔ Cliente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.professional_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  client_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'revoked')),
  invite_code TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  invite_accepted_at TIMESTAMPTZ,
  share_clarity_tests BOOLEAN DEFAULT FALSE,
  share_journal_entries BOOLEAN DEFAULT FALSE,
  share_chat_summaries BOOLEAN DEFAULT FALSE,
  share_safety_plan BOOLEAN DEFAULT FALSE,
  share_risk_alerts BOOLEAN DEFAULT FALSE,
  client_display_name TEXT,
  professional_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  CONSTRAINT unique_professional_client UNIQUE (professional_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_professional_clients_professional_id ON public.professional_clients(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_clients_client_id ON public.professional_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_professional_clients_status ON public.professional_clients(status);
CREATE INDEX IF NOT EXISTS idx_professional_clients_invite_code ON public.professional_clients(invite_code) WHERE invite_code IS NOT NULL;

-- ============================================================================
-- SEÇÃO 2: PROFESSIONAL BRAND (White-label)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.professional_brand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  display_name TEXT,
  brand_color TEXT DEFAULT '#7C3AED',
  logo_url TEXT,
  tagline TEXT,
  show_radar_branding BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_professional_brand UNIQUE (professional_id)
);

CREATE INDEX IF NOT EXISTS idx_professional_brand_professional_id ON public.professional_brand(professional_id);

-- ============================================================================
-- SEÇÃO 3: CAMPOS EXTRAS CLARITY_TESTS (se a tabela existir)
-- ============================================================================
DO $$
BEGIN
  -- Adicionar campos extras na tabela clarity_tests se existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clarity_tests' AND table_schema = 'public') THEN
    -- category_scores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'category_scores') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN category_scores JSONB;
    END IF;
    -- axis_scores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'axis_scores') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN axis_scores JSONB;
    END IF;
    -- ip_hash
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'ip_hash') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN ip_hash TEXT;
    END IF;
    -- summary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'summary') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN summary TEXT;
    END IF;
    -- completed_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'completed_at') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
    -- is_profile_base
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'is_profile_base') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN is_profile_base BOOLEAN DEFAULT FALSE;
    END IF;
    -- user_narrative
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'user_narrative') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN user_narrative TEXT;
    END IF;
    -- overall_percentage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'overall_percentage') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN overall_percentage DECIMAL(5,4);
    END IF;
    -- has_physical_risk
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'has_physical_risk') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN has_physical_risk BOOLEAN DEFAULT FALSE;
    END IF;
    -- test_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clarity_tests' AND column_name = 'test_type') THEN
      ALTER TABLE public.clarity_tests ADD COLUMN test_type TEXT DEFAULT 'unificado_v3';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SEÇÃO 4: CAMPOS EXTRAS JOURNAL_ENTRIES (se a tabela existir)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries' AND table_schema = 'public') THEN
    -- entry_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'entry_type') THEN
      ALTER TABLE public.journal_entries ADD COLUMN entry_type TEXT DEFAULT 'normal';
    END IF;
    -- clarity_test_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'clarity_test_id') THEN
      ALTER TABLE public.journal_entries ADD COLUMN clarity_test_id UUID;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SEÇÃO 5: RLS PROFESSIONAL
-- ============================================================================
ALTER TABLE public.professional_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_brand ENABLE ROW LEVEL SECURITY;

-- Professional Clients Policies
DROP POLICY IF EXISTS "professional_can_view_own_clients" ON public.professional_clients;
CREATE POLICY "professional_can_view_own_clients" ON public.professional_clients
  FOR SELECT USING (professional_id = auth.uid());

DROP POLICY IF EXISTS "professional_can_create_invites" ON public.professional_clients;
CREATE POLICY "professional_can_create_invites" ON public.professional_clients
  FOR INSERT WITH CHECK (professional_id = auth.uid());

DROP POLICY IF EXISTS "professional_can_update_own_clients" ON public.professional_clients;
CREATE POLICY "professional_can_update_own_clients" ON public.professional_clients
  FOR UPDATE USING (professional_id = auth.uid());

DROP POLICY IF EXISTS "client_can_view_own_connections" ON public.professional_clients;
CREATE POLICY "client_can_view_own_connections" ON public.professional_clients
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "client_can_update_own_connection" ON public.professional_clients;
CREATE POLICY "client_can_update_own_connection" ON public.professional_clients
  FOR UPDATE USING (client_id = auth.uid());

-- Professional Brand Policies
DROP POLICY IF EXISTS "professional_can_manage_own_brand" ON public.professional_brand;
CREATE POLICY "professional_can_manage_own_brand" ON public.professional_brand
  FOR ALL USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());

-- ============================================================================
-- SEÇÃO 6: ADMIN RLS PARA BILLING
-- ============================================================================

-- Billing Plans - Admin SELECT
DROP POLICY IF EXISTS "billing_plans_select_all_for_admins" ON billing_plans;
CREATE POLICY "billing_plans_select_all_for_admins" ON billing_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Plans - Admin INSERT
DROP POLICY IF EXISTS "billing_plans_insert_admin" ON billing_plans;
CREATE POLICY "billing_plans_insert_admin" ON billing_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Plans - Admin UPDATE
DROP POLICY IF EXISTS "billing_plans_update_admin" ON billing_plans;
CREATE POLICY "billing_plans_update_admin" ON billing_plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Plans - Admin DELETE
DROP POLICY IF EXISTS "billing_plans_delete_admin" ON billing_plans;
CREATE POLICY "billing_plans_delete_admin" ON billing_plans
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Promotions - Admin SELECT
DROP POLICY IF EXISTS "billing_promotions_select_all_for_admins" ON billing_plan_promotions;
CREATE POLICY "billing_promotions_select_all_for_admins" ON billing_plan_promotions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Promotions - Admin INSERT
DROP POLICY IF EXISTS "billing_promotions_insert_admin" ON billing_plan_promotions;
CREATE POLICY "billing_promotions_insert_admin" ON billing_plan_promotions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Promotions - Admin UPDATE
DROP POLICY IF EXISTS "billing_promotions_update_admin" ON billing_plan_promotions;
CREATE POLICY "billing_promotions_update_admin" ON billing_plan_promotions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- Billing Promotions - Admin DELETE
DROP POLICY IF EXISTS "billing_promotions_delete_admin" ON billing_plan_promotions;
CREATE POLICY "billing_promotions_delete_admin" ON billing_plan_promotions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    OR auth.jwt() ->> 'email' IN ('etailoffice@gmail.com', 'eduardo.mkt.davila@gmail.com')
  );

-- ============================================================================
-- SEÇÃO 7: FUNÇÃO PARA GARANTIR ÚNICO PROFILE BASE
-- ============================================================================
CREATE OR REPLACE FUNCTION ensure_single_profile_base()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_profile_base = TRUE THEN
    UPDATE public.clarity_tests 
    SET is_profile_base = FALSE 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_profile_base = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se a tabela clarity_tests existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clarity_tests' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trigger_ensure_single_profile_base ON public.clarity_tests;
    CREATE TRIGGER trigger_ensure_single_profile_base
      BEFORE INSERT OR UPDATE ON public.clarity_tests
      FOR EACH ROW
      EXECUTE FUNCTION ensure_single_profile_base();
  END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT '✅ PARTE 4 CONCLUÍDA COM SUCESSO!' as status;

SELECT 'Tabelas criadas:' as info, COUNT(*) as total FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Professional Clients:' as tabela, 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_clients') 
  THEN 'OK' ELSE 'FALHOU' END as status
UNION ALL
SELECT 'Professional Brand:', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'professional_brand') 
  THEN 'OK' ELSE 'FALHOU' END;
