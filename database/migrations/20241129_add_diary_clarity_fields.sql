-- Migration: Adicionar campos para integração diário + clareza
-- Data: 2024-11-29
-- Objetivo: TEMA 4 - Permitir entradas de diário tipo "clarity_baseline"

-- ============================================================================
-- NOVOS CAMPOS NA TABELA journal_entries
-- ============================================================================

-- Adicionar coluna entry_type para diferenciar tipos de entrada
-- Valores: 'normal' (padrão), 'clarity_baseline' (resumo do teste)
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'normal';

-- Adicionar coluna clarity_test_id para referenciar o teste de clareza
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS clarity_test_id UUID REFERENCES public.clarity_tests(id);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índice para buscar entradas por tipo
CREATE INDEX IF NOT EXISTS idx_journal_entries_type 
ON public.journal_entries (user_id, entry_type);

-- Índice para buscar entradas vinculadas a testes de clareza
CREATE INDEX IF NOT EXISTS idx_journal_entries_clarity_test 
ON public.journal_entries (clarity_test_id) 
WHERE clarity_test_id IS NOT NULL;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON COLUMN public.journal_entries.entry_type IS 'Tipo da entrada: normal (episódio comum), clarity_baseline (resumo do teste de clareza)';
COMMENT ON COLUMN public.journal_entries.clarity_test_id IS 'Referência ao teste de clareza que originou esta entrada (se aplicável)';
