-- Schema SQL para Radar Narcisista BR
-- Execute no Supabase SQL Editor

-- Tipos enumerados
CREATE TYPE clarity_zone AS ENUM ('ATENCAO', 'ALERTA', 'VERMELHA');
CREATE TYPE journal_context AS ENUM ('RELACIONAMENTO', 'FAMILIA', 'TRABALHO', 'OUTRO');
CREATE TYPE chat_session_kind AS ENUM (
  'USER_COACH', 
  'AI_STUDIO_LEVEL1', 
  'AI_STUDIO_LEVEL2', 
  'AI_STUDIO_ALL'
);
CREATE TYPE ai_message_role AS ENUM ('user', 'assistant', 'system', 'meta');
CREATE TYPE ai_suggestion_category AS ENUM ('PRODUCT', 'UX', 'RISK', 'CONTENT');
CREATE TYPE ai_suggestion_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IMPLEMENTED');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- Perfis de usuário
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT,
  role user_role NOT NULL DEFAULT 'USER',  -- USER, ADMIN, SUPER_ADMIN
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurações de LGPD e privacidade
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  save_history BOOLEAN NOT NULL DEFAULT TRUE,                   -- guardar histórico de chat/diário
  save_voice_audio BOOLEAN NOT NULL DEFAULT FALSE,              -- guardar áudio (futuro)
  allow_ai_learning_product BOOLEAN NOT NULL DEFAULT TRUE,      -- dados derivados para melhorar produto
  allow_ai_dataset_research BOOLEAN NOT NULL DEFAULT FALSE,     -- uso em dataset/pesquisa
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Testes de Clareza
CREATE TABLE public.clarity_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- pontuações por eixo (0-16)
  fog_score INTEGER,         -- névoa emocional
  fear_score INTEGER,        -- medo / tensão
  limits_score INTEGER,      -- desrespeito de limites

  global_zone clarity_zone,  -- zona global (atenção/alerta/vermelha)

  -- respostas brutas (escala por pergunta)
  raw_answers JSONB,         -- ex: {"q1": 4, "q2": 2, ...}

  -- resumo em texto humano
  summary TEXT,

  from_voice BOOLEAN NOT NULL DEFAULT FALSE  -- se as respostas vieram de entrada por voz
);

-- Diário de Episódios
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  title TEXT,                           -- título curto opcional
  context journal_context NOT NULL DEFAULT 'RELACIONAMENTO',
  content TEXT NOT NULL,                -- descrição do episódio
  mood_intensity INTEGER,              -- 0–10
  highlight TEXT,                       -- frase-resumo
  tags TEXT[],                          -- ex: { "explosao", "ciumes" }

  from_voice BOOLEAN NOT NULL DEFAULT FALSE  -- veio de transcrição de voz?
);

-- Anexos do Diário (fotos, prints, áudios, PDFs)
CREATE TYPE attachment_type AS ENUM ('IMAGE', 'AUDIO', 'PDF', 'VIDEO', 'OTHER');

CREATE TABLE public.journal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  type attachment_type NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,  -- em bytes
  mime_type TEXT,
  storage_path TEXT NOT NULL,  -- caminho no Supabase Storage
  
  -- Metadados extras
  description TEXT,
  transcription TEXT,  -- para áudios transcritos
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Plano de Segurança
CREATE TYPE safety_item_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE');

CREATE TABLE public.safety_plans (
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

-- Alertas de Risco (IA SHIELD)
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE risk_category AS ENUM ('PHYSICAL_VIOLENCE', 'THREATS', 'ISOLATION', 'FINANCIAL_CONTROL', 'EMOTIONAL_ABUSE', 'STALKING', 'OTHER');

CREATE TABLE public.risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  source TEXT NOT NULL,  -- 'journal', 'chat', 'test', 'system'
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

-- Configurações de Notificação
CREATE TABLE public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Ativar/desativar
  enabled BOOLEAN DEFAULT TRUE,
  
  -- Nível de discrição
  discretion_level TEXT DEFAULT 'MEDIUM',  -- LOW, MEDIUM, HIGH, MAXIMUM
  
  -- Horários permitidos
  allowed_hours_start INTEGER DEFAULT 9,  -- 9h
  allowed_hours_end INTEGER DEFAULT 17,  -- 17h
  allowed_days TEXT[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri'],
  
  -- Tipos de notificação
  notify_diary_reminder BOOLEAN DEFAULT TRUE,
  notify_risk_alerts BOOLEAN DEFAULT TRUE,
  notify_weekly_summary BOOLEAN DEFAULT FALSE,
  
  -- Texto neutro
  neutral_title TEXT DEFAULT 'Nova atualização',
  
  -- Silencioso
  silent_mode BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessões de chat
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT,
  kind chat_session_kind NOT NULL DEFAULT 'USER_COACH'
);

-- Mensagens do chat
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role ai_message_role NOT NULL,          -- 'user' ou 'assistant' etc.
  content TEXT NOT NULL,
  from_voice BOOLEAN NOT NULL DEFAULT FALSE,

  meta JSONB                              -- ex: { "sentiment": -0.4, "topics": ["culpa","medo"] }
);

-- Eventos observados pelas IAs (aprendizado de produto)
CREATE TABLE public.ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,          -- pode ser null se for só agregados
  source TEXT NOT NULL,  -- 'chat' | 'journal' | 'clarity_test' | 'system'
  ref_id UUID,           -- id da mensagem / diário / teste relacionado (opcional)

  event_type TEXT NOT NULL,  -- 'theme_detected', 'risk_flag', 'feature_request', etc.
  payload JSONB NOT NULL,    -- ex: { "themes": ["gaslighting","culpa"], "intensity": 0.8 }

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sugestões das IAs para o admin
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  category ai_suggestion_category NOT NULL,
  status ai_suggestion_status NOT NULL DEFAULT 'PENDING',

  title TEXT NOT NULL,
  description TEXT NOT NULL,

  impact_score INTEGER,  -- 1–5
  effort_score INTEGER,  -- 1–5

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  decided_by_user_id UUID REFERENCES auth.users (id)  -- admin que decidiu
);

-- Métricas agregadas
CREATE TABLE public.daily_metrics (
  metric_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  meta JSONB,

  PRIMARY KEY (metric_date, metric_name)
);

-- Assinaturas (Stripe)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
  price_id TEXT,
  amount INTEGER, -- em centavos
  currency TEXT DEFAULT 'brl',
  
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hashes de documentos (PDFs) para integridade
CREATE TYPE document_type AS ENUM ('CLARITY_TEST', 'JOURNAL', 'COMPLETE_REPORT', 'PROFESSIONAL_SUMMARY');

CREATE TABLE public.document_hashes (
  id TEXT PRIMARY KEY,  -- ID único do documento (ex: RN-XXXXX-YYYY)
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  type document_type NOT NULL,
  sha256_hash TEXT NOT NULL,  -- Hash SHA-256 do PDF
  filename TEXT NOT NULL,
  
  generated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  metadata JSONB  -- Dados extras (período, filtros, etc.)
);

-- Sistema de referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE, -- quem convidou
  referred_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,         -- quem foi convidado
  referral_code TEXT UNIQUE NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'REWARDED'
  
  reward_amount INTEGER, -- em centavos
  rewarded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- user_profiles
CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_delete_own" ON public.user_profiles FOR DELETE USING (auth.uid() = user_id);

-- user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- clarity_tests
CREATE POLICY "clarity_tests_select_own" ON public.clarity_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clarity_tests_insert_own" ON public.clarity_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clarity_tests_update_own" ON public.clarity_tests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clarity_tests_delete_own" ON public.clarity_tests FOR DELETE USING (auth.uid() = user_id);

-- journal_entries
CREATE POLICY "journal_select_own" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "journal_insert_own" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update_own" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_delete_own" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- ai_chat_sessions
CREATE POLICY "ai_chat_sessions_select_own" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_insert_own" ON public.ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_update_own" ON public.ai_chat_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_chat_sessions_delete_own" ON public.ai_chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- ai_messages
CREATE POLICY "ai_messages_select_own" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_messages_insert_own" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_messages_update_own" ON public.ai_messages FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_messages_delete_own" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

-- ai_events (usuário vê só os próprios, admin vê todos)
CREATE POLICY "ai_events_select_own" ON public.ai_events FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "ai_events_insert_own" ON public.ai_events FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_delete_own" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- referrals
CREATE POLICY "referrals_select_own" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert_own" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- document_hashes
CREATE POLICY "document_hashes_select_own" ON public.document_hashes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "document_hashes_insert_own" ON public.document_hashes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- journal_attachments
CREATE POLICY "journal_attachments_select_own" ON public.journal_attachments FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "journal_attachments_insert_own" ON public.journal_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_attachments_update_own" ON public.journal_attachments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_attachments_delete_own" ON public.journal_attachments FOR DELETE USING (auth.uid() = user_id);

-- safety_plans
CREATE POLICY "safety_plans_select_own" ON public.safety_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "safety_plans_insert_own" ON public.safety_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "safety_plans_update_own" ON public.safety_plans FOR UPDATE USING (auth.uid() = user_id);

-- risk_alerts
CREATE POLICY "risk_alerts_select_own" ON public.risk_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "risk_alerts_insert_own" ON public.risk_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risk_alerts_update_own" ON public.risk_alerts FOR UPDATE USING (auth.uid() = user_id);

-- notification_settings
CREATE POLICY "notification_settings_select_own" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_settings_insert_own" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_settings_update_own" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);

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
CREATE INDEX idx_document_hashes_user_id ON public.document_hashes(user_id);
CREATE INDEX idx_document_hashes_type ON public.document_hashes(type);
CREATE INDEX idx_document_hashes_generated_at ON public.document_hashes(generated_at DESC);
CREATE INDEX idx_journal_attachments_entry_id ON public.journal_attachments(journal_entry_id);
CREATE INDEX idx_journal_attachments_user_id ON public.journal_attachments(user_id);
CREATE INDEX idx_safety_plans_user_id ON public.safety_plans(user_id);
CREATE INDEX idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX idx_risk_alerts_level ON public.risk_alerts(level);
CREATE INDEX idx_risk_alerts_created_at ON public.risk_alerts(created_at DESC);

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
