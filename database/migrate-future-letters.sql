-- =============================================================================
-- MIGRAÇÃO: Tabela future_letters (Cartas para o Futuro)
-- Permite que usuários escrevam cartas para si mesmos no futuro
-- =============================================================================

-- Criar tabela future_letters
CREATE TABLE IF NOT EXISTS public.future_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  delivery_email TEXT,
  delivery_days INTEGER DEFAULT 30,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  is_delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_future_letters_user_id ON public.future_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_future_letters_scheduled ON public.future_letters(scheduled_for) WHERE NOT is_delivered;

-- RLS
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own letters" ON public.future_letters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own letters" ON public.future_letters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own letters" ON public.future_letters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own letters" ON public.future_letters
  FOR DELETE USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.future_letters IS 'Cartas que usuários escrevem para si mesmos no futuro';
COMMENT ON COLUMN public.future_letters.content IS 'Conteúdo da carta';
COMMENT ON COLUMN public.future_letters.delivery_days IS 'Dias até a entrega (30, 60, 90, etc)';
COMMENT ON COLUMN public.future_letters.scheduled_for IS 'Data agendada para entrega';
COMMENT ON COLUMN public.future_letters.is_delivered IS 'Se a carta já foi entregue';
