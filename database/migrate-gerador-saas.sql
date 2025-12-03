-- ============================================================================
-- MIGRATION: generated_projects
-- BLOCO 41-45 - Gerador de SaaS
-- Data: 03/12/2025
-- ============================================================================

-- Tabela para armazenar projetos gerados
CREATE TABLE IF NOT EXISTS generated_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('SAAS_TEMATICO', 'CORE_BRANCO')),
  description TEXT,
  origin TEXT NOT NULL DEFAULT 'RADAR-CORE@BLOCO-45',
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'ready', 'error')),
  modules TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}'::jsonb,
  zip_path TEXT,
  github_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_generated_projects_slug ON generated_projects(slug);
CREATE INDEX IF NOT EXISTS idx_generated_projects_type ON generated_projects(type);
CREATE INDEX IF NOT EXISTS idx_generated_projects_status ON generated_projects(status);
CREATE INDEX IF NOT EXISTS idx_generated_projects_created_by ON generated_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_projects_created_at ON generated_projects(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_generated_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generated_projects_updated_at ON generated_projects;
CREATE TRIGGER trigger_generated_projects_updated_at
  BEFORE UPDATE ON generated_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_projects_updated_at();

-- RLS
ALTER TABLE generated_projects ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admin pode ver todos projetos" ON generated_projects;
CREATE POLICY "Admin pode ver todos projetos" ON generated_projects 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode criar projetos" ON generated_projects;
CREATE POLICY "Admin pode criar projetos" ON generated_projects 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode atualizar projetos" ON generated_projects;
CREATE POLICY "Admin pode atualizar projetos" ON generated_projects 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admin pode deletar projetos" ON generated_projects;
CREATE POLICY "Admin pode deletar projetos" ON generated_projects 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT '✅ MIGRATION generated_projects CONCLUÍDA!' as status;
