-- ================================================================================
-- SQL_CONSOLIDADO_01_BASE.sql
-- RADAR NARCISISTA - BASE COMPLETA DO BANCO DE DADOS
-- ================================================================================
-- Versão: 1.0
-- Data: 04/12/2025
-- Autoria: Windsurf + Eduardo
-- 
-- OBJETIVO:
-- Este arquivo contém a BASE COMPLETA do banco de dados necessária para subir
-- o sistema Radar Narcisista em um ambiente novo (Supabase).
--
-- ORDEM DE EXECUÇÃO:
-- 1. Execute este arquivo PRIMEIRO
-- 2. Depois execute SQL_CONSOLIDADO_02_*.sql (quando existir)
-- 3. E assim sucessivamente
--
-- CONTEÚDO:
-- - Tipos enumerados (ENUMs)
-- - Tabelas principais do sistema
-- - Políticas de RLS (Row Level Security)
-- - Índices de performance
-- - Triggers e Functions
-- ================================================================================

-- ================================================================================
-- PARTE 1: TIPOS ENUMERADOS (ENUMs)
-- ================================================================================
-- NOTA: PostgreSQL não suporta "CREATE TYPE IF NOT EXISTS"
-- Usamos DO $$ ... $$ para verificar se o tipo já existe

-- Zonas de clareza do Teste de Clareza
DO $$ BEGIN
  CREATE TYPE clarity_zone AS ENUM ('ATENCAO', 'ALERTA', 'VERMELHA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Contextos do diário
DO $$ BEGIN
  CREATE TYPE journal_context AS ENUM ('RELACIONAMENTO', 'FAMILIA', 'TRABALHO', 'OUTRO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipos de sessão de chat
DO $$ BEGIN
  CREATE TYPE chat_session_kind AS ENUM (
    'USER_COACH', 
    'AI_STUDIO_LEVEL1', 
    'AI_STUDIO_LEVEL2', 
    'AI_STUDIO_ALL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Roles de mensagem de IA
DO $$ BEGIN
  CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system', 'meta');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Categorias de sugestão de IA
DO $$ BEGIN
  CREATE TYPE ai_suggestion_category AS ENUM ('PRODUCT', 'UX', 'RISK', 'CONTENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status de sugestão de IA
DO $$ BEGIN
  CREATE TYPE ai_suggestion_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IMPLEMENTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Roles de usuário
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipos de anexo
DO $$ BEGIN
  CREATE TYPE attachment_type AS ENUM ('IMAGE', 'AUDIO', 'PDF', 'VIDEO', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status de item do plano de segurança
DO $$ BEGIN
  CREATE TYPE safety_item_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Níveis de risco
DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Categorias de risco
DO $$ BEGIN
  CREATE TYPE risk_category AS ENUM ('PHYSICAL_VIOLENCE', 'THREATS', 'ISOLATION', 'FINANCIAL_CONTROL', 'EMOTIONAL_ABUSE', 'STALKING', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipos de documento
DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('CLARITY_TEST', 'JOURNAL', 'COMPLETE_REPORT', 'PROFESSIONAL_SUMMARY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipos de entrada no diário (incluindo safety_plan)
DO $$ BEGIN
  CREATE TYPE journal_entry_type AS ENUM ('episode', 'reflection', 'safety_plan', 'milestone');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================================
-- PARTE 2: TABELAS PRINCIPAIS
-- ================================================================================

-- Perfis de usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurações de LGPD e privacidade
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  save_history BOOLEAN NOT NULL DEFAULT TRUE,
  save_voice_audio BOOLEAN NOT NULL DEFAULT FALSE,
  allow_ai_learning_product BOOLEAN NOT NULL DEFAULT TRUE,
  allow_ai_dataset_research BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Testes de Clareza
CREATE TABLE IF NOT EXISTS public.clarity_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fog_score INTEGER,
  fear_score INTEGER,
  limits_score INTEGER,
  global_zone clarity_zone,
  raw_answers JSONB,
  summary TEXT,
  from_voice BOOLEAN NOT NULL DEFAULT FALSE
);

-- Diário de Episódios
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  title TEXT,
  context journal_context NOT NULL DEFAULT 'RELACIONAMENTO',
  content TEXT NOT NULL,
  mood_intensity INTEGER,
  highlight TEXT,
  tags TEXT[],
  from_voice BOOLEAN NOT NULL DEFAULT FALSE,
  entry_type journal_entry_type DEFAULT 'episode'
);

-- Anexos do Diário
CREATE TABLE IF NOT EXISTS public.journal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type attachment_type NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  description TEXT,
  transcription TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Plano de Segurança
CREATE TABLE IF NOT EXISTS public.safety_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  emergency_contacts JSONB DEFAULT '[]',
  important_documents JSONB DEFAULT '[]',
  emergency_bag_items JSONB DEFAULT '[]',
  safe_place JSONB,
  digital_security JSONB DEFAULT '{}',
  overall_status TEXT DEFAULT 'NOT_STARTED',
  last_reviewed_at TIMESTAMPTZ,
  notes TEXT
);

-- Alertas de Risco
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_id UUID,
  level risk_level NOT NULL,
  category risk_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurações de Notificação
CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  discretion_level TEXT DEFAULT 'MEDIUM',
  allowed_hours_start INTEGER DEFAULT 9,
  allowed_hours_end INTEGER DEFAULT 17,
  allowed_days TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri'],
  notify_diary_reminder BOOLEAN DEFAULT TRUE,
  notify_risk_alerts BOOLEAN DEFAULT TRUE,
  notify_weekly_summary BOOLEAN DEFAULT FALSE,
  neutral_title TEXT DEFAULT 'Nova atualização',
  silent_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessões de chat
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT,
  kind chat_session_kind NOT NULL DEFAULT 'USER_COACH'
);

-- Mensagens do chat
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role ai_message_role NOT NULL,
  content TEXT NOT NULL,
  from_voice BOOLEAN NOT NULL DEFAULT FALSE,
  meta JSONB
);

-- Eventos observados pelas IAs
CREATE TABLE IF NOT EXISTS public.ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  source TEXT NOT NULL,
  ref_id UUID,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sugestões das IAs para o admin
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category ai_suggestion_category NOT NULL,
  status ai_suggestion_status NOT NULL DEFAULT 'PENDING',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER,
  effort_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_by_user_id UUID REFERENCES auth.users (id)
);

-- Métricas agregadas
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  metric_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  meta JSONB,
  PRIMARY KEY (metric_date, metric_name)
);

-- Assinaturas (Stripe)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  price_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'brl',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hashes de documentos para integridade
CREATE TABLE IF NOT EXISTS public.document_hashes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type document_type NOT NULL,
  sha256_hash TEXT NOT NULL,
  filename TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Sistema de referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reward_amount INTEGER,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================================
-- PARTE 3: TABELAS DE PROFISSIONAL/CLIENTE
-- ================================================================================

-- Clientes do profissional
CREATE TABLE IF NOT EXISTS public.professional_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  client_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  invite_token TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  permissions JSONB DEFAULT '{"view_clarity": true, "view_journal": false, "view_chat": false}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marca do profissional (white-label)
CREATE TABLE IF NOT EXISTS public.professional_brand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  brand_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  custom_domain TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================================
-- PARTE 4: CATÁLOGO DE PLANOS
-- ================================================================================

-- Catálogo de planos
CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE,  -- Compatibilidade com estrutura existente
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER DEFAULT 0,
  price_yearly INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir planos padrão usando DO block para compatibilidade com diferentes estruturas de tabela
DO $$
DECLARE
  has_nome_exibicao BOOLEAN;
BEGIN
  -- Verificar se a tabela tem coluna nome_exibicao
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plan_catalog' AND column_name = 'nome_exibicao'
  ) INTO has_nome_exibicao;
  
  IF has_nome_exibicao THEN
    -- Tabela com colunas em português
    INSERT INTO public.plan_catalog (plan_key, slug, name, nome_exibicao, description, price_monthly, price_yearly, features, limits, display_order)
    VALUES 
      ('free', 'free', 'Gratuito', 'Gratuito', 'Acesso básico ao sistema', 0, 0, 
       '{"clarity_test": true, "journal": true, "chat": false, "safety_plan": false}',
       '{"clarity_tests_per_month": 1, "journal_entries_per_month": 5, "chat_messages_per_month": 0}', 1),
      ('basic', 'basic', 'Básico', 'Básico', 'Para quem está começando', 2990, 29900,
       '{"clarity_test": true, "journal": true, "chat": true, "safety_plan": true}',
       '{"clarity_tests_per_month": 3, "journal_entries_per_month": 30, "chat_messages_per_month": 50}', 2),
      ('premium', 'premium', 'Premium', 'Premium', 'Acesso completo', 4990, 49900,
       '{"clarity_test": true, "journal": true, "chat": true, "safety_plan": true, "pdf_export": true, "voice_input": true}',
       '{"clarity_tests_per_month": -1, "journal_entries_per_month": -1, "chat_messages_per_month": -1}', 3),
      ('professional', 'professional', 'Profissional', 'Profissional', 'Para terapeutas e advogados', 9990, 99900,
       '{"clarity_test": true, "journal": true, "chat": true, "safety_plan": true, "pdf_export": true, "voice_input": true, "client_management": true, "reports": true}',
       '{"clarity_tests_per_month": -1, "journal_entries_per_month": -1, "chat_messages_per_month": -1, "clients_limit": 50}', 4)
    ON CONFLICT (plan_key) DO NOTHING;
  ELSE
    -- Tabela com colunas em inglês
    INSERT INTO public.plan_catalog (plan_key, slug, name, description, price_monthly, price_yearly, features, limits, display_order)
    VALUES 
      ('free', 'free', 'Gratuito', 'Acesso básico ao sistema', 0, 0, 
       '{"clarity_test": true, "journal": true, "chat": false, "safety_plan": false}',
       '{"clarity_tests_per_month": 1, "journal_entries_per_month": 5, "chat_messages_per_month": 0}', 1),
      ('basic', 'basic', 'Básico', 'Para quem está começando', 2990, 29900,
       '{"clarity_test": true, "journal": true, "chat": true, "safety_plan": true}',
       '{"clarity_tests_per_month": 3, "journal_entries_per_month": 30, "chat_messages_per_month": 50}', 2),
      ('premium', 'premium', 'Premium', 'Acesso completo', 4990, 49900,
       '{"clarity_test": true, "journal": true, "chat": true, "safety_plan": true, "pdf_export": true, "voice_input": true}',
       '{"clarity_tests_per_month": -1, "journal_entries_per_month": -1, "chat_messages_per_month": -1}', 3),
      ('professional', 'professional', 'Profissional', 'Para terapeutas e advogados', 9990, 99900,
       '{"clarity_test": true, "journal": true, "chat": true, "safety_plan": true, "pdf_export": true, "voice_input": true, "client_management": true, "reports": true}',
       '{"clarity_tests_per_month": -1, "journal_entries_per_month": -1, "chat_messages_per_month": -1, "clients_limit": 50}', 4)
    ON CONFLICT (plan_key) DO NOTHING;
  END IF;
END $$;

-- ================================================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- ================================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_brand ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para user_profiles
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;

CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_delete_own" ON public.user_profiles FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para user_settings
DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;

CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para clarity_tests
DROP POLICY IF EXISTS "clarity_tests_select_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "clarity_tests_insert_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "clarity_tests_update_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "clarity_tests_delete_own" ON public.clarity_tests;

CREATE POLICY "clarity_tests_select_own" ON public.clarity_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clarity_tests_insert_own" ON public.clarity_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clarity_tests_update_own" ON public.clarity_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clarity_tests_delete_own" ON public.clarity_tests FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para journal_entries
DROP POLICY IF EXISTS "journal_select_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_insert_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_update_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_delete_own" ON public.journal_entries;

CREATE POLICY "journal_select_own" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "journal_insert_own" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update_own" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_delete_own" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para journal_attachments
DROP POLICY IF EXISTS "journal_attachments_select_own" ON public.journal_attachments;
DROP POLICY IF EXISTS "journal_attachments_insert_own" ON public.journal_attachments;
DROP POLICY IF EXISTS "journal_attachments_update_own" ON public.journal_attachments;
DROP POLICY IF EXISTS "journal_attachments_delete_own" ON public.journal_attachments;

CREATE POLICY "journal_attachments_select_own" ON public.journal_attachments FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "journal_attachments_insert_own" ON public.journal_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_attachments_update_own" ON public.journal_attachments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_attachments_delete_own" ON public.journal_attachments FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para safety_plans
DROP POLICY IF EXISTS "safety_plans_select_own" ON public.safety_plans;
DROP POLICY IF EXISTS "safety_plans_insert_own" ON public.safety_plans;
DROP POLICY IF EXISTS "safety_plans_update_own" ON public.safety_plans;

CREATE POLICY "safety_plans_select_own" ON public.safety_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "safety_plans_insert_own" ON public.safety_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "safety_plans_update_own" ON public.safety_plans FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de RLS para risk_alerts
DROP POLICY IF EXISTS "risk_alerts_select_own" ON public.risk_alerts;
DROP POLICY IF EXISTS "risk_alerts_insert_own" ON public.risk_alerts;
DROP POLICY IF EXISTS "risk_alerts_update_own" ON public.risk_alerts;

CREATE POLICY "risk_alerts_select_own" ON public.risk_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "risk_alerts_insert_own" ON public.risk_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risk_alerts_update_own" ON public.risk_alerts FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de RLS para notification_settings
DROP POLICY IF EXISTS "notification_settings_select_own" ON public.notification_settings;
DROP POLICY IF EXISTS "notification_settings_insert_own" ON public.notification_settings;
DROP POLICY IF EXISTS "notification_settings_update_own" ON public.notification_settings;

CREATE POLICY "notification_settings_select_own" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_settings_insert_own" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_settings_update_own" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de RLS para ai_chat_sessions
DROP POLICY IF EXISTS "ai_chat_sessions_select_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "ai_chat_sessions_insert_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "ai_chat_sessions_update_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "ai_chat_sessions_delete_own" ON public.ai_chat_sessions;

CREATE POLICY "ai_chat_sessions_select_own" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_insert_own" ON public.ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_update_own" ON public.ai_chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_delete_own" ON public.ai_chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para ai_messages
DROP POLICY IF EXISTS "ai_messages_select_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages_insert_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages_update_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages_delete_own" ON public.ai_messages;

CREATE POLICY "ai_messages_select_own" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_messages_insert_own" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_messages_update_own" ON public.ai_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ai_messages_delete_own" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para ai_events
DROP POLICY IF EXISTS "ai_events_select_own" ON public.ai_events;
DROP POLICY IF EXISTS "ai_events_insert_own" ON public.ai_events;

CREATE POLICY "ai_events_select_own" ON public.ai_events FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "ai_events_insert_own" ON public.ai_events FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Políticas de RLS para subscriptions
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_delete_own" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Políticas de RLS para referrals
DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
DROP POLICY IF EXISTS "referrals_insert_own" ON public.referrals;

CREATE POLICY "referrals_select_own" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert_own" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Políticas de RLS para document_hashes
DROP POLICY IF EXISTS "document_hashes_select_own" ON public.document_hashes;
DROP POLICY IF EXISTS "document_hashes_insert_own" ON public.document_hashes;

CREATE POLICY "document_hashes_select_own" ON public.document_hashes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "document_hashes_insert_own" ON public.document_hashes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de RLS para professional_clients
DROP POLICY IF EXISTS "professional_clients_select" ON public.professional_clients;
DROP POLICY IF EXISTS "professional_clients_insert" ON public.professional_clients;
DROP POLICY IF EXISTS "professional_clients_update" ON public.professional_clients;
DROP POLICY IF EXISTS "professional_clients_delete" ON public.professional_clients;

CREATE POLICY "professional_clients_select" ON public.professional_clients FOR SELECT 
  USING (auth.uid() = professional_id OR auth.uid() = client_id);
CREATE POLICY "professional_clients_insert" ON public.professional_clients FOR INSERT 
  WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "professional_clients_update" ON public.professional_clients FOR UPDATE 
  USING (auth.uid() = professional_id OR auth.uid() = client_id);
CREATE POLICY "professional_clients_delete" ON public.professional_clients FOR DELETE 
  USING (auth.uid() = professional_id);

-- Políticas de RLS para professional_brand
DROP POLICY IF EXISTS "professional_brand_select_own" ON public.professional_brand;
DROP POLICY IF EXISTS "professional_brand_insert_own" ON public.professional_brand;
DROP POLICY IF EXISTS "professional_brand_update_own" ON public.professional_brand;

CREATE POLICY "professional_brand_select_own" ON public.professional_brand FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "professional_brand_insert_own" ON public.professional_brand FOR INSERT WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "professional_brand_update_own" ON public.professional_brand FOR UPDATE USING (auth.uid() = professional_id);

-- ================================================================================
-- PARTE 6: ÍNDICES DE PERFORMANCE
-- ================================================================================

CREATE INDEX IF NOT EXISTS idx_clarity_tests_user_id ON public.clarity_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_clarity_tests_created_at ON public.clarity_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_context ON public.journal_entries(context);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_type ON public.journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON public.ai_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_events_user_id ON public.ai_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_created_at ON public.ai_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_document_hashes_user_id ON public.document_hashes(user_id);
CREATE INDEX IF NOT EXISTS idx_document_hashes_type ON public.document_hashes(type);
CREATE INDEX IF NOT EXISTS idx_document_hashes_generated_at ON public.document_hashes(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_attachments_entry_id ON public.journal_attachments(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_attachments_user_id ON public.journal_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_user_id ON public.safety_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_level ON public.risk_alerts(level);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created_at ON public.risk_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_professional_clients_professional_id ON public.professional_clients(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_clients_client_id ON public.professional_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_professional_clients_status ON public.professional_clients(status);
CREATE INDEX IF NOT EXISTS idx_plan_catalog_plan_key ON public.plan_catalog(plan_key);

-- ================================================================================
-- PARTE 7: FUNCTIONS E TRIGGERS
-- ================================================================================

-- Function para criar perfil e configurações automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON public.journal_entries;
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_safety_plans_updated_at ON public.safety_plans;
CREATE TRIGGER update_safety_plans_updated_at
  BEFORE UPDATE ON public.safety_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_clients_updated_at ON public.professional_clients;
CREATE TRIGGER update_professional_clients_updated_at
  BEFORE UPDATE ON public.professional_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_brand_updated_at ON public.professional_brand;
CREATE TRIGGER update_professional_brand_updated_at
  BEFORE UPDATE ON public.professional_brand
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================================
-- FIM DO SQL_CONSOLIDADO_01_BASE.sql
-- ================================================================================
-- 
-- PRÓXIMO PASSO:
-- Após executar este arquivo, execute SQL_CONSOLIDADO_02_*.sql (quando existir)
-- para aplicar as alterações incrementais.
-- ================================================================================
