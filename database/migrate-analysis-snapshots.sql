-- ============================================
-- TABELA: analysis_snapshots
-- Guarda snapshots de cada análise para comparar evolução
-- ============================================

-- Criar tabela de snapshots de análise
CREATE TABLE IF NOT EXISTS analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Origem da análise
  origin TEXT NOT NULL CHECK (origin IN ('coach', 'diario', 'teste_clareza')),
  origin_ref_id UUID, -- ID da conversa/episódio/teste (opcional)
  
  -- Dados da análise
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  problem_tags TEXT[] DEFAULT '{}',
  emotions TEXT[] DEFAULT '{}',
  
  -- Resumo gerado pela IA
  ai_summary TEXT,
  
  -- Texto de evolução comparando com análise anterior
  evolution_comment TEXT,
  
  -- Metadados
  message_content TEXT, -- Conteúdo da mensagem (opcional, para contexto)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_user_id ON analysis_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_origin ON analysis_snapshots(origin);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_created_at ON analysis_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_snapshots_user_origin ON analysis_snapshots(user_id, origin, created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE analysis_snapshots ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê seus próprios snapshots
CREATE POLICY "Users can view own snapshots" ON analysis_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuário pode inserir seus próprios snapshots
CREATE POLICY "Users can insert own snapshots" ON analysis_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuário pode atualizar seus próprios snapshots
CREATE POLICY "Users can update own snapshots" ON analysis_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

-- Política: usuário pode deletar seus próprios snapshots
CREATE POLICY "Users can delete own snapshots" ON analysis_snapshots
  FOR DELETE USING (auth.uid() = user_id);

-- Função para obter última análise do usuário por origem
CREATE OR REPLACE FUNCTION get_previous_snapshot(
  p_user_id UUID,
  p_origin TEXT,
  p_current_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  score NUMERIC,
  problem_tags TEXT[],
  emotions TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.score,
    s.problem_tags,
    s.emotions,
    s.ai_summary,
    s.created_at
  FROM analysis_snapshots s
  WHERE s.user_id = p_user_id
    AND s.origin = p_origin
    AND (p_current_id IS NULL OR s.id != p_current_id)
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE analysis_snapshots IS 'Snapshots de análises para comparar evolução do usuário';
COMMENT ON COLUMN analysis_snapshots.origin IS 'Origem: coach, diario, teste_clareza';
COMMENT ON COLUMN analysis_snapshots.score IS 'Score de clareza/resultado (0-100)';
COMMENT ON COLUMN analysis_snapshots.problem_tags IS 'Tags de problemas detectados';
COMMENT ON COLUMN analysis_snapshots.ai_summary IS 'Resumo curto gerado pela IA';
COMMENT ON COLUMN analysis_snapshots.evolution_comment IS 'Texto de evolução comparando com análise anterior';
