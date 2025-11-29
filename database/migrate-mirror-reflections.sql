-- =============================================================================
-- MIGRAÇÃO: Tabela mirror_reflections (Modo Espelho)
-- Salva reflexões do exercício de auto-aconselhamento
-- =============================================================================

-- Criar tabela mirror_reflections
CREATE TABLE IF NOT EXISTS public.mirror_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  situation TEXT NOT NULL,
  advice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mirror_reflections_user_id ON public.mirror_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_mirror_reflections_created ON public.mirror_reflections(created_at DESC);

-- RLS
ALTER TABLE public.mirror_reflections ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own reflections" ON public.mirror_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.mirror_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON public.mirror_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.mirror_reflections IS 'Reflexões do exercício Modo Espelho';
COMMENT ON COLUMN public.mirror_reflections.situation IS 'Situação descrita pelo usuário';
COMMENT ON COLUMN public.mirror_reflections.advice IS 'Conselho que o usuário daria para um amigo';
