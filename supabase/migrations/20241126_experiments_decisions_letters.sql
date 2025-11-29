-- ============================================
-- 🧪 LOG DE EXPERIMENTOS UX
-- ============================================

CREATE TABLE IF NOT EXISTS ux_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  metrics_before JSONB NOT NULL DEFAULT '{}',
  metrics_after JSONB,
  created_by TEXT NOT NULL CHECK (created_by IN ('founder', 'ai')),
  suggested_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
  ai_suggestion_id UUID,
  result TEXT NOT NULL DEFAULT 'em_andamento' CHECK (result IN ('ganhou', 'perdeu', 'neutro', 'em_andamento')),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ux_experiments_result ON ux_experiments(result);
CREATE INDEX idx_ux_experiments_suggested_by_ai ON ux_experiments(suggested_by_ai);
CREATE INDEX idx_ux_experiments_started_at ON ux_experiments(started_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ux_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ux_experiments_updated_at
  BEFORE UPDATE ON ux_experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_ux_experiments_updated_at();

-- ============================================
-- 📝 DIÁRIO DE DECISÕES DO FOUNDER
-- ============================================

CREATE TABLE IF NOT EXISTS founder_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_suggestion_id UUID NOT NULL,
  ai_suggestion_title TEXT NOT NULL,
  ai_suggestion_category TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('ACCEPTED', 'REJECTED', 'DEFERRED')),
  reason TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_founder_decisions_decision ON founder_decisions(decision);
CREATE INDEX idx_founder_decisions_category ON founder_decisions(ai_suggestion_category);
CREATE INDEX idx_founder_decisions_created_at ON founder_decisions(created_at DESC);

-- ============================================
-- 📜 CARTA-SELO DE REALIDADE - RASCUNHOS
-- ============================================

CREATE TABLE IF NOT EXISTS sealed_letter_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Minha Carta-Selo de Realidade',
  sections JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sealed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sealed_letter_drafts_user_id ON sealed_letter_drafts(user_id);
CREATE INDEX idx_sealed_letter_drafts_status ON sealed_letter_drafts(status);

-- RLS
ALTER TABLE sealed_letter_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts"
  ON sealed_letter_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON sealed_letter_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
  ON sealed_letter_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
  ON sealed_letter_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_sealed_letter_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sealed_letter_drafts_updated_at
  BEFORE UPDATE ON sealed_letter_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_sealed_letter_drafts_updated_at();

-- ============================================
-- 📜 CARTA-SELO DE REALIDADE - SELOS
-- ============================================

CREATE TABLE IF NOT EXISTS sealed_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES sealed_letter_drafts(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- SHA-256
  sealed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sealed_letters_user_id ON sealed_letters(user_id);
CREATE INDEX idx_sealed_letters_content_hash ON sealed_letters(content_hash);
CREATE INDEX idx_sealed_letters_session_id ON sealed_letters(session_id);
CREATE INDEX idx_sealed_letters_sealed_at ON sealed_letters(sealed_at DESC);

-- RLS
ALTER TABLE sealed_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sealed letters"
  ON sealed_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sealed letters"
  ON sealed_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários NÃO podem atualizar ou deletar selos (imutabilidade)

-- ============================================
-- 📊 VIEWS PARA ADMIN
-- ============================================

-- View de estatísticas de experimentos
CREATE OR REPLACE VIEW v_experiment_stats AS
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE result = 'em_andamento') as em_andamento,
  COUNT(*) FILTER (WHERE result = 'ganhou') as ganhou,
  COUNT(*) FILTER (WHERE result = 'perdeu') as perdeu,
  COUNT(*) FILTER (WHERE result = 'neutro') as neutro,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'ganhou' AND suggested_by_ai = TRUE)::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result != 'em_andamento' AND suggested_by_ai = TRUE), 0) * 100, 
    2
  ) as taxa_acerto_ai,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'ganhou' AND suggested_by_ai = FALSE)::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result != 'em_andamento' AND suggested_by_ai = FALSE), 0) * 100, 
    2
  ) as taxa_acerto_founder
FROM ux_experiments;

-- View de estatísticas de decisões
CREATE OR REPLACE VIEW v_decision_stats AS
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE decision = 'ACCEPTED') as accepted,
  COUNT(*) FILTER (WHERE decision = 'REJECTED') as rejected,
  COUNT(*) FILTER (WHERE decision = 'DEFERRED') as deferred,
  ROUND(
    COUNT(*) FILTER (WHERE decision = 'ACCEPTED')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as acceptance_rate
FROM founder_decisions;

-- View de estatísticas de cartas seladas (sem dados sensíveis)
CREATE OR REPLACE VIEW v_sealed_letters_stats AS
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sealed_at > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE sealed_at > NOW() - INTERVAL '30 days') as last_30_days,
  ROUND(AVG((metadata->>'totalCharacters')::INTEGER), 0) as avg_characters
FROM sealed_letters;

-- ============================================
-- 🔧 FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar hash de carta
CREATE OR REPLACE FUNCTION verify_sealed_letter(p_content_hash TEXT)
RETURNS TABLE (
  found BOOLEAN,
  sealed_at TIMESTAMPTZ,
  session_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as found,
    sl.sealed_at,
    sl.session_id
  FROM sealed_letters sl
  WHERE sl.content_hash = p_content_hash
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE ux_experiments IS 'Log de experimentos UX - rastreia mudanças, hipóteses e resultados';
COMMENT ON TABLE founder_decisions IS 'Diário de decisões do founder sobre sugestões da IA';
COMMENT ON TABLE sealed_letter_drafts IS 'Rascunhos de Cartas-Selo de Realidade';
COMMENT ON TABLE sealed_letters IS 'Selos de integridade das Cartas-Selo (imutáveis)';
