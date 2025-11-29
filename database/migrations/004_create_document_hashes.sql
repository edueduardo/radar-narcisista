-- Migração: Criar tabela document_hashes para armazenar hashes SHA-256 de documentos gerados
-- Data: 2024
-- Descrição: Permite verificar integridade de PDFs e outros documentos gerados pelo sistema

-- Criar tabela document_hashes
CREATE TABLE IF NOT EXISTS public.document_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'ANALISE_COLABORATIVA',
    'RELATORIO_CLAREZA',
    'EXPORTACAO_DIARIO',
    'EXPORTACAO_LGPD'
  )),
  sha256_hash TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_document_hashes_user_id ON public.document_hashes(user_id);
CREATE INDEX IF NOT EXISTS idx_document_hashes_document_type ON public.document_hashes(document_type);
CREATE INDEX IF NOT EXISTS idx_document_hashes_sha256 ON public.document_hashes(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_document_hashes_generated_at ON public.document_hashes(generated_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.document_hashes ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só pode ver seus próprios hashes
CREATE POLICY "Users can view own document hashes"
  ON public.document_hashes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário pode inserir seus próprios hashes
CREATE POLICY "Users can insert own document hashes"
  ON public.document_hashes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode deletar seus próprios hashes
CREATE POLICY "Users can delete own document hashes"
  ON public.document_hashes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE public.document_hashes IS 'Armazena hashes SHA-256 de documentos gerados para verificação de integridade';
COMMENT ON COLUMN public.document_hashes.document_type IS 'Tipo do documento: ANALISE_COLABORATIVA, RELATORIO_CLAREZA, EXPORTACAO_DIARIO, EXPORTACAO_LGPD';
COMMENT ON COLUMN public.document_hashes.sha256_hash IS 'Hash SHA-256 do conteúdo do documento para verificação de integridade';
COMMENT ON COLUMN public.document_hashes.metadata IS 'Metadados adicionais: versão do app, idioma, configurações usadas, etc.';
