-- Script para limpar e recriar o schema do Radar Narcisista
-- ATENÇÃO: Isso vai APAGAR todos os dados existentes!

-- Drop everything in reverse order
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop indexes
DROP INDEX IF EXISTS idx_referrals_status;
DROP INDEX IF EXISTS idx_referrals_referrer_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_ai_events_created_at;
DROP INDEX IF EXISTS idx_ai_events_user_id;
DROP INDEX IF EXISTS idx_ai_messages_created_at;
DROP INDEX IF EXISTS idx_ai_messages_session_id;
DROP INDEX IF EXISTS idx_journal_entries_context;
DROP INDEX IF EXISTS idx_journal_entries_created_at;
DROP INDEX IF EXISTS idx_journal_entries_user_id;
DROP INDEX IF EXISTS idx_clarity_tests_created_at;
DROP INDEX IF EXISTS idx_clarity_tests_user_id;

-- Drop policies
DROP POLICY IF EXISTS "referrals_insert_own" ON public.referrals;
DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
DROP POLICY IF EXISTS "subscriptions_delete_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "ai_events_insert_own" ON public.ai_events;
DROP POLICY IF EXISTS "ai_events_select_own" ON public.ai_events;
DROP POLICY IF EXISTS "ai_messages_delete_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages_update_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages_insert_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages_select_own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_chat_sessions_delete_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "ai_chat_sessions_update_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "ai_chat_sessions_insert_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "ai_chat_sessions_select_own" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "journal_delete_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_update_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_insert_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_select_own" ON public.journal_entries;
DROP POLICY IF EXISTS "clarity_tests_delete_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "clarity_tests_update_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "clarity_tests_insert_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "clarity_tests_select_own" ON public.clarity_tests;
DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;

-- Drop tables
DROP TABLE IF EXISTS public.referrals;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.ai_events;
DROP TABLE IF EXISTS public.ai_messages;
DROP TABLE IF EXISTS public.ai_chat_sessions;
DROP TABLE IF EXISTS public.journal_entries;
DROP TABLE IF EXISTS public.clarity_tests;
DROP TABLE IF EXISTS public.user_settings;
DROP TABLE IF EXISTS public.user_profiles;

-- Drop types (CASCADE para remover dependências)
DROP TYPE IF EXISTS ai_suggestion_status CASCADE;
DROP TYPE IF EXISTS ai_suggestion_category CASCADE;
DROP TYPE IF EXISTS ai_message_role CASCADE;
DROP TYPE IF EXISTS chat_session_kind CASCADE;
DROP TYPE IF EXISTS journal_context CASCADE;
DROP TYPE IF EXISTS clarity_zone CASCADE;

-- Now create everything fresh
-- Tipos (Enums)
CREATE TYPE clarity_zone AS ENUM ('ATENCAO', 'ALERTA', 'VERMELHA');
CREATE TYPE journal_context AS ENUM ('RELACIONAMENTO', 'FAMILIA', 'TRABALHO', 'OUTRO');
CREATE TYPE chat_session_kind AS ENUM ('USER_COACH', 'AI_STUDIO_LEVEL1', 'AI_STUDIO_LEVEL2', 'AI_STUDIO_ALL');
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system', 'meta');
CREATE TYPE ai_suggestion_category AS ENUM ('PRODUCT', 'UX', 'RISK', 'CONTENT');
CREATE TYPE ai_suggestion_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IMPLEMENTED');

-- Tabelas
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  save_history BOOLEAN DEFAULT TRUE,
  save_voice_audio BOOLEAN DEFAULT FALSE,
  allow_ai_learning_product BOOLEAN DEFAULT FALSE,
  allow_ai_dataset_research BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.clarity_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fog_score INTEGER CHECK (fog_score >= 0 AND fog_score <= 100),
  fear_score INTEGER CHECK (fear_score >= 0 AND fear_score <= 100),
  limits_score INTEGER CHECK (limits_score >= 0 AND limits_score <= 100),
  global_zone clarity_zone,
  raw_answers JSONB,
  summary TEXT,
  from_voice BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  title TEXT,
  context TEXT,
  description TEXT,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 3),
  mood_intensity INTEGER CHECK (mood_intensity >= 0 AND mood_intensity <= 10),
  highlight TEXT,
  tags TEXT[],
  from_voice BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  kind chat_session_kind DEFAULT 'USER_COACH'
);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role ai_message_role NOT NULL,
  content TEXT NOT NULL,
  from_voice BOOLEAN DEFAULT FALSE,
  meta JSONB
);

CREATE TABLE public.ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  ref_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING',
  reward_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_delete_own" ON public.user_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "clarity_tests_select_own" ON public.clarity_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clarity_tests_insert_own" ON public.clarity_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clarity_tests_update_own" ON public.clarity_tests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clarity_tests_delete_own" ON public.clarity_tests FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "journal_select_own" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "journal_insert_own" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update_own" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_delete_own" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "ai_chat_sessions_select_own" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_insert_own" ON public.ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_update_own" ON public.ai_chat_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_delete_own" ON public.ai_chat_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "ai_messages_select_own" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_messages_insert_own" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_messages_update_own" ON public.ai_messages FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_messages_delete_own" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "ai_events_select_own" ON public.ai_events FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "ai_events_insert_own" ON public.ai_events FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_delete_own" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "referrals_select_own" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert_own" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Índices para performance
CREATE INDEX idx_clarity_tests_user_id ON public.clarity_tests(user_id);
CREATE INDEX idx_clarity_tests_created_at ON public.clarity_tests(created_at DESC);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_context ON public.journal_entries(context);
CREATE INDEX idx_ai_messages_session_id ON public.ai_messages(session_id);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at DESC);
CREATE INDEX idx_ai_events_user_id ON public.ai_events(user_id);
CREATE INDEX idx_ai_events_created_at ON public.ai_events(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Functions úteis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil e configurações automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
