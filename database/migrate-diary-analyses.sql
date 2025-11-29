-- =============================================================================
-- MIGRAÇÃO: Tabela diary_analyses para histórico de análises de IA
-- Execute no Supabase SQL Editor
-- =============================================================================

-- Tabela de histórico de análises de IA por episódio do diário
CREATE TABLE IF NOT EXISTS public.diary_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  version INTEGER NOT NULL DEFAULT 1,  -- Incrementa a cada nova análise
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Resultado da análise
  impact_level TEXT NOT NULL DEFAULT 'medio',  -- 'baixo' | 'medio' | 'alto'
  main_problems TEXT[] DEFAULT '{}',  -- ProblemTag[] ex: {'manipulacao', 'invalidacao'}
  tags TEXT[] DEFAULT '{}',  -- Tags de abuso detectadas
  
  -- Textos gerados
  summary TEXT,  -- Resumo curto (2-3 frases)
  recommendations TEXT,  -- Recomendações da IA
  
  -- Dados brutos da IA (para auditoria e futuro)
  ai_raw JSONB,  -- JSON completo retornado pela análise colaborativa
  
  -- Metadados
  ai_models_used TEXT[] DEFAULT '{}',  -- Quais IAs participaram
  consensus_level INTEGER DEFAULT 0,  -- 0-100, nível de consenso entre IAs
  
  UNIQUE(entry_id, version)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_diary_analyses_entry_id ON public.diary_analyses(entry_id);
CREATE INDEX IF NOT EXISTS idx_diary_analyses_user_id ON public.diary_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_analyses_created_at ON public.diary_analyses(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.diary_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS - usuário só vê suas próprias análises
CREATE POLICY "diary_analyses_select_own" 
  ON public.diary_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "diary_analyses_insert_own" 
  ON public.diary_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diary_analyses_update_own" 
  ON public.diary_analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diary_analyses_delete_own" 
  ON public.diary_analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para obter próxima versão de análise
CREATE OR REPLACE FUNCTION get_next_analysis_version(p_entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO max_version
  FROM public.diary_analyses
  WHERE entry_id = p_entry_id;
  
  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE public.diary_analyses IS 'Histórico de análises de IA para episódios do diário';
COMMENT ON COLUMN public.diary_analyses.version IS 'Versão da análise (incrementa a cada nova análise do mesmo episódio)';
COMMENT ON COLUMN public.diary_analyses.impact_level IS 'Nível de impacto: baixo, medio, alto';
COMMENT ON COLUMN public.diary_analyses.main_problems IS 'ProblemTags principais detectados (ex: manipulacao, invalidacao)';
COMMENT ON COLUMN public.diary_analyses.ai_raw IS 'JSON completo retornado pela análise colaborativa para auditoria';
