-- ============================================
-- ETAPA 15: Sistema de Beta Testers
-- Data: 01/12/2025
-- ============================================

-- 1. Adicionar campo is_beta_tester na tabela user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;

-- 2. Adicionar campo beta_joined_at para saber quando virou beta
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS beta_joined_at TIMESTAMPTZ;

-- 3. Adicionar campo beta_group para categorizar (A, B, C)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS beta_group TEXT CHECK (beta_group IN ('A', 'B', 'C'));
-- A = Pessoas que viveram/suspeitam de abuso
-- B = Profissionais (psicólogos, advogados)
-- C = Gente neutra (usabilidade)

-- 4. Criar tabela de feedback dos beta testers
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de feedback
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'sugestao', 'elogio', 'confusao', 'medo', 'outro')),
  
  -- Contexto
  page_path TEXT,                    -- Em qual página estava
  feature_used TEXT,                 -- Qual feature estava usando
  
  -- Conteúdo
  message TEXT NOT NULL,             -- O feedback em si
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- Nota opcional (1-5)
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  admin_notes TEXT                   -- Notas do admin sobre o feedback
);

-- 5. Criar tabela de observabilidade básica (eventos importantes)
CREATE TABLE IF NOT EXISTS public.beta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Evento
  event_type TEXT NOT NULL,          -- ex: 'test_completed', 'diary_created', 'chat_started'
  event_data JSONB,                  -- dados extras do evento
  
  -- Contexto
  page_path TEXT,
  session_id TEXT,                   -- para agrupar eventos da mesma sessão
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON public.beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON public.beta_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_beta_events_user ON public.beta_events(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_events_type ON public.beta_events(event_type);
CREATE INDEX IF NOT EXISTS idx_beta_events_created ON public.beta_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_beta ON public.user_profiles(is_beta_tester) WHERE is_beta_tester = TRUE;

-- RLS para beta_feedback
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver e criar seu próprio feedback
CREATE POLICY "beta_feedback_select_own" ON public.beta_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "beta_feedback_insert_own" ON public.beta_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin pode ver todos os feedbacks
CREATE POLICY "beta_feedback_admin_all" ON public.beta_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS para beta_events
ALTER TABLE public.beta_events ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode inserir eventos (tracking)
CREATE POLICY "beta_events_insert_authenticated" ON public.beta_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Usuário pode ver seus próprios eventos
CREATE POLICY "beta_events_select_own" ON public.beta_events
  FOR SELECT USING (auth.uid() = user_id);

-- Admin pode ver todos os eventos
CREATE POLICY "beta_events_admin_select" ON public.beta_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Comentário final
COMMENT ON TABLE public.beta_feedback IS 'Feedback coletado dos beta testers durante a fase de testes';
COMMENT ON TABLE public.beta_events IS 'Eventos de observabilidade para entender uso do produto';
COMMENT ON COLUMN public.user_profiles.is_beta_tester IS 'Se o usuário é um beta tester com acesso antecipado';
COMMENT ON COLUMN public.user_profiles.beta_group IS 'Grupo do beta tester: A=vítimas, B=profissionais, C=usabilidade';
