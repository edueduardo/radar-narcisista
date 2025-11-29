-- Migration: Adicionar campo is_profile_base na tabela clarity_tests
-- Data: 2024-11-29
-- Objetivo: Permitir marcar um teste como "base do perfil" do usuário
-- Isso permite que o resultado do teste alimente diário, IAs, curso, etc.

-- Adicionar coluna is_profile_base
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS is_profile_base BOOLEAN DEFAULT FALSE;

-- Adicionar coluna user_narrative para guardar a pergunta 19 (texto livre)
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS user_narrative TEXT;

-- Adicionar coluna overall_percentage para facilitar consultas
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS overall_percentage DECIMAL(5,4);

-- Adicionar coluna has_physical_risk para alertas rápidos
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS has_physical_risk BOOLEAN DEFAULT FALSE;

-- Adicionar coluna test_type para diferenciar versões do teste
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS test_type TEXT DEFAULT 'unificado_v3';

-- Criar índice para buscar rapidamente o perfil base de um usuário
CREATE INDEX IF NOT EXISTS idx_clarity_tests_profile_base 
ON public.clarity_tests (user_id, is_profile_base) 
WHERE is_profile_base = TRUE;

-- Criar índice para ordenar por data
CREATE INDEX IF NOT EXISTS idx_clarity_tests_user_date 
ON public.clarity_tests (user_id, created_at DESC);

-- Função para garantir que só existe UM teste marcado como base por usuário
CREATE OR REPLACE FUNCTION ensure_single_profile_base()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_profile_base = TRUE THEN
    -- Desmarcar todos os outros testes do mesmo usuário
    UPDATE public.clarity_tests 
    SET is_profile_base = FALSE 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_profile_base = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para garantir unicidade do perfil base
DROP TRIGGER IF EXISTS trigger_ensure_single_profile_base ON public.clarity_tests;
CREATE TRIGGER trigger_ensure_single_profile_base
BEFORE INSERT OR UPDATE ON public.clarity_tests
FOR EACH ROW
EXECUTE FUNCTION ensure_single_profile_base();

-- Comentários para documentação
COMMENT ON COLUMN public.clarity_tests.is_profile_base IS 'Se TRUE, este teste é usado como base do perfil do usuário para diário, IAs, etc.';
COMMENT ON COLUMN public.clarity_tests.user_narrative IS 'Resposta da pergunta 19 (texto livre) - história contada pela usuária';
COMMENT ON COLUMN public.clarity_tests.overall_percentage IS 'Percentual geral do teste (0.0 a 1.0)';
COMMENT ON COLUMN public.clarity_tests.has_physical_risk IS 'Se TRUE, o teste detectou sinais de risco físico';
COMMENT ON COLUMN public.clarity_tests.test_type IS 'Tipo/versão do teste (unificado_v3, etc.)';
