-- Migration: Criar tabela de lista de espera
-- Data: 2024-11-29
-- Objetivo: Armazenar emails interessados no Radar Profissional

-- ============================================================================
-- TABELA WAITLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'profissional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  metadata JSONB
);

-- Índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_source 
ON public.waitlist (email, source);

-- Índice para buscar por source
CREATE INDEX IF NOT EXISTS idx_waitlist_source 
ON public.waitlist (source);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.waitlist IS 'Lista de espera para novos recursos e planos';
COMMENT ON COLUMN public.waitlist.email IS 'Email do interessado';
COMMENT ON COLUMN public.waitlist.source IS 'Origem: profissional, feature_x, etc';
COMMENT ON COLUMN public.waitlist.notified_at IS 'Data em que foi notificado sobre disponibilidade';
COMMENT ON COLUMN public.waitlist.converted_at IS 'Data em que se tornou cliente';

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Dropar políticas existentes para permitir re-execução
DROP POLICY IF EXISTS "Anyone can insert waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Only admins can view waitlist" ON public.waitlist;

-- Política: Qualquer um pode inserir (para o formulário público)
CREATE POLICY "Anyone can insert waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Política: Apenas admins podem ver
CREATE POLICY "Only admins can view waitlist" ON public.waitlist
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('admin@radarnarcisista.com.br', 'teste@teste.com')
    )
  );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT 'Tabela waitlist criada com sucesso!' as status;
