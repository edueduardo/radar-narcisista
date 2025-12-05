-- ============================================================================
-- SQL CONSOLIDADO 05 - CADEIA DE CUSTÓDIA
-- ============================================================================
-- Sistema de hash e rastreabilidade para potencial uso probatório
-- ============================================================================

-- Tabela principal de cadeia de custódia
CREATE TABLE IF NOT EXISTS custody_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL,
  entry_type TEXT NOT NULL,
  hash TEXT NOT NULL,
  previous_hash TEXT,
  hash_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadados adicionais
  ip_address TEXT,
  user_agent TEXT,
  
  -- Constraint para garantir unicidade
  UNIQUE(entry_id, entry_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_custody_chain_user_id ON custody_chain(user_id);
CREATE INDEX IF NOT EXISTS idx_custody_chain_entry_id ON custody_chain(entry_id);
CREATE INDEX IF NOT EXISTS idx_custody_chain_entry_type ON custody_chain(entry_type);
CREATE INDEX IF NOT EXISTS idx_custody_chain_hash ON custody_chain(hash);
CREATE INDEX IF NOT EXISTS idx_custody_chain_created_at ON custody_chain(created_at DESC);

-- Tabela de logs de verificação
CREATE TABLE IF NOT EXISTS custody_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_chain_id UUID REFERENCES custody_chain(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_result BOOLEAN NOT NULL,
  computed_hash TEXT,
  details TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Índice para verificações
CREATE INDEX IF NOT EXISTS idx_custody_verifications_chain_id ON custody_verifications(custody_chain_id);
CREATE INDEX IF NOT EXISTS idx_custody_verifications_user_id ON custody_verifications(user_id);

-- RLS Policies
ALTER TABLE custody_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_verifications ENABLE ROW LEVEL SECURITY;

-- Policies para custody_chain
DROP POLICY IF EXISTS "Users can view own custody records" ON custody_chain;
CREATE POLICY "Users can view own custody records" ON custody_chain
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own custody records" ON custody_chain;
CREATE POLICY "Users can insert own custody records" ON custody_chain
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para custody_verifications
DROP POLICY IF EXISTS "Users can view own verifications" ON custody_verifications;
CREATE POLICY "Users can view own verifications" ON custody_verifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own verifications" ON custody_verifications;
CREATE POLICY "Users can insert own verifications" ON custody_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para registrar hash automaticamente em journal_entries
CREATE OR REPLACE FUNCTION register_custody_hash() RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash TEXT;
  v_content TEXT;
  v_hash TEXT;
BEGIN
  -- Buscar hash anterior do usuário
  SELECT hash INTO v_previous_hash
  FROM custody_chain
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Criar conteúdo para hash
  v_content := jsonb_build_object(
    'title', NEW.title,
    'description', NEW.description,
    'tags', NEW.tags,
    'userId', NEW.user_id,
    'timestamp', NEW.created_at,
    'previousHash', v_previous_hash
  )::text;
  
  -- Gerar hash SHA-256
  v_hash := encode(sha256(v_content::bytea), 'hex');
  
  -- Inserir na cadeia de custódia
  INSERT INTO custody_chain (user_id, entry_id, entry_type, hash, previous_hash, created_at)
  VALUES (NEW.user_id, NEW.id, 'journal_entry', v_hash, v_previous_hash, NEW.created_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para journal_entries (se tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
    DROP TRIGGER IF EXISTS trigger_custody_journal ON journal_entries;
    CREATE TRIGGER trigger_custody_journal
      AFTER INSERT ON journal_entries
      FOR EACH ROW
      EXECUTE FUNCTION register_custody_hash();
  END IF;
END $$;

-- Função para verificar integridade da cadeia
CREATE OR REPLACE FUNCTION verify_custody_chain(p_user_id UUID)
RETURNS TABLE (
  entry_id UUID,
  entry_type TEXT,
  hash TEXT,
  previous_hash TEXT,
  created_at TIMESTAMPTZ,
  chain_valid BOOLEAN
) AS $$
DECLARE
  v_expected_previous TEXT := NULL;
BEGIN
  FOR entry_id, entry_type, hash, previous_hash, created_at, chain_valid IN
    SELECT 
      c.entry_id,
      c.entry_type,
      c.hash,
      c.previous_hash,
      c.created_at,
      CASE 
        WHEN c.previous_hash IS NULL AND v_expected_previous IS NULL THEN TRUE
        WHEN c.previous_hash = v_expected_previous THEN TRUE
        ELSE FALSE
      END as chain_valid
    FROM custody_chain c
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at ASC
  LOOP
    v_expected_previous := hash;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para resumo de custódia por usuário
CREATE OR REPLACE VIEW custody_summary AS
SELECT 
  user_id,
  COUNT(*) as total_entries,
  COUNT(DISTINCT entry_type) as entry_types,
  MIN(created_at) as first_entry,
  MAX(created_at) as last_entry,
  hash_version
FROM custody_chain
GROUP BY user_id, hash_version;

-- Comentários
COMMENT ON TABLE custody_chain IS 'Cadeia de custódia com hash para integridade de dados';
COMMENT ON TABLE custody_verifications IS 'Log de verificações de integridade';
COMMENT ON FUNCTION register_custody_hash() IS 'Registra hash automaticamente para novas entradas';
COMMENT ON FUNCTION verify_custody_chain(UUID) IS 'Verifica integridade da cadeia de um usuário';
