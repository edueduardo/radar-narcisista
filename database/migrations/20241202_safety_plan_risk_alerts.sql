-- ============================================================================
-- MIGRATION: ETAPA 7 – PLANO DE SEGURANÇA E ALERTAS DE RISCO
-- Data: 02/12/2025
-- Descrição: Cria tabelas safety_plans e risk_alerts com RLS e índices
-- ============================================================================

-- Verificar se os tipos existem antes de criar
DO $$ BEGIN
  CREATE TYPE safety_item_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_category AS ENUM ('PHYSICAL_VIOLENCE', 'THREATS', 'ISOLATION', 'FINANCIAL_CONTROL', 'EMOTIONAL_ABUSE', 'STALKING', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABELA: safety_plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contatos de emergência
  emergency_contacts JSONB DEFAULT '[]',  -- [{name, phone, relationship, is_primary}]
  
  -- Documentos importantes
  important_documents JSONB DEFAULT '[]',  -- [{name, location, has_copy}]
  
  -- Itens de saída de emergência
  emergency_bag_items JSONB DEFAULT '[]',  -- [{item, packed, location}]
  
  -- Local seguro
  safe_place JSONB,  -- {address, contact_name, contact_phone, notes}
  
  -- Segurança digital
  digital_security JSONB DEFAULT '{}',  -- {changed_passwords, removed_tracking_apps, uses_private_browsing}
  
  -- Status geral
  overall_status TEXT DEFAULT 'NOT_STARTED',  -- NOT_STARTED, IN_PROGRESS, READY
  last_reviewed_at TIMESTAMPTZ,
  
  notes TEXT
);

-- ============================================================================
-- TABELA: risk_alerts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  source TEXT NOT NULL,  -- 'journal', 'chat', 'clarity_test', 'system'
  source_id UUID,  -- ID do episódio/mensagem que gerou o alerta
  
  level risk_level NOT NULL,
  category risk_category NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,  -- O que a IA sugere fazer
  
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para safety_plans
DROP POLICY IF EXISTS "safety_plans_select_own" ON public.safety_plans;
DROP POLICY IF EXISTS "safety_plans_insert_own" ON public.safety_plans;
DROP POLICY IF EXISTS "safety_plans_update_own" ON public.safety_plans;

CREATE POLICY "safety_plans_select_own" ON public.safety_plans 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "safety_plans_insert_own" ON public.safety_plans 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "safety_plans_update_own" ON public.safety_plans 
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para risk_alerts
DROP POLICY IF EXISTS "risk_alerts_select_own" ON public.risk_alerts;
DROP POLICY IF EXISTS "risk_alerts_insert_own" ON public.risk_alerts;
DROP POLICY IF EXISTS "risk_alerts_update_own" ON public.risk_alerts;

CREATE POLICY "risk_alerts_select_own" ON public.risk_alerts 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "risk_alerts_insert_own" ON public.risk_alerts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risk_alerts_update_own" ON public.risk_alerts 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_safety_plans_user_id ON public.safety_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_level ON public.risk_alerts(level);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created_at ON public.risk_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_source ON public.risk_alerts(source);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE public.safety_plans IS 'Planos de segurança das usuárias - ETAPA 7';
COMMENT ON TABLE public.risk_alerts IS 'Alertas de risco detectados via chat, diário ou teste de clareza - ETAPA 7';

COMMENT ON COLUMN public.safety_plans.overall_status IS 'Status: NOT_STARTED, IN_PROGRESS, READY';
COMMENT ON COLUMN public.risk_alerts.source IS 'Origem do alerta: chat, journal, clarity_test, system';
COMMENT ON COLUMN public.risk_alerts.level IS 'Nível de risco: LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN public.risk_alerts.category IS 'Categoria: PHYSICAL_VIOLENCE, THREATS, ISOLATION, etc.';
