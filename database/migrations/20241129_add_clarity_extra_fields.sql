-- Migration: Adicionar campos extras na tabela clarity_tests
-- Data: 2024-11-29
-- Objetivo: Completar o que é salvo do teste (TEMA 3)
-- Campos: category_scores, ip_hash, axis_scores

-- ============================================================================
-- NOVOS CAMPOS PARA COMPLETAR O SALVAMENTO DO TESTE
-- ============================================================================

-- Adicionar coluna category_scores (JSON com scores das 6 categorias)
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS category_scores JSONB;

-- Adicionar coluna axis_scores (JSON com scores dos 3 eixos detalhados)
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS axis_scores JSONB;

-- Adicionar coluna ip_hash (hash SHA-256 do IP para cadeia de custódia)
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Adicionar coluna summary (resumo gerado pela IA - opcional, pode ser preenchido depois)
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Adicionar coluna completed_at (data/hora exata de conclusão do teste)
ALTER TABLE public.clarity_tests 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON COLUMN public.clarity_tests.category_scores IS 'JSON com scores das 6 categorias: invalidacao, gaslighting, controle, isolamento, emocional, fisico';
COMMENT ON COLUMN public.clarity_tests.axis_scores IS 'JSON com scores detalhados dos 3 eixos: nevoa, medo, limites';
COMMENT ON COLUMN public.clarity_tests.ip_hash IS 'Hash SHA-256 do IP do usuário para cadeia de custódia (LGPD compliant)';
COMMENT ON COLUMN public.clarity_tests.summary IS 'Resumo gerado pela IA baseado no resultado do teste';
COMMENT ON COLUMN public.clarity_tests.completed_at IS 'Data/hora exata de conclusão do teste';

-- ============================================================================
-- EXEMPLO DE ESTRUTURA DOS JSONB
-- ============================================================================
-- category_scores: {
--   "invalidacao": {"score": 8, "percentage": 0.67, "level": "alto"},
--   "gaslighting": {"score": 10, "percentage": 0.83, "level": "alto"},
--   "controle": {"score": 5, "percentage": 0.42, "level": "moderado"},
--   "isolamento": {"score": 3, "percentage": 0.25, "level": "baixo"},
--   "emocional": {"score": 7, "percentage": 0.58, "level": "moderado"},
--   "fisico": {"score": 2, "percentage": 0.17, "level": "baixo"}
-- }
--
-- axis_scores: {
--   "nevoa": {"score": 18, "percentage": 0.75, "level": "alto"},
--   "medo": {"score": 12, "percentage": 0.50, "level": "moderado"},
--   "limites": {"score": 8, "percentage": 0.33, "level": "baixo"}
-- }
