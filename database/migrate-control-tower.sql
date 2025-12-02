-- ============================================================================
-- MIGRATION: Control Tower - Registro Global de Projetos
-- ETAPA 32 - BLOCO 32-35
-- Criado em: 02/12/2025
-- ============================================================================

-- ============================================================================
-- TABELA: projects_core
-- Registro central de todos os projetos (Radar Mãe, White Labels, SaaS gerados)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,                      -- identificador interno único
  nome_publico TEXT NOT NULL,                     -- nome exibido
  tipo_projeto TEXT NOT NULL CHECK (tipo_projeto IN ('radar_mae', 'white_label', 'saas_tema', 'saas_branco')),
  tema TEXT,                                      -- ex: "Radar Narcisista", "Clínica", "Escola"
  parent_project_id UUID REFERENCES public.projects_core(id), -- encadeamento mãe/filho
  url_publica TEXT,                               -- URL pública do projeto
  url_admin TEXT,                                 -- URL do admin
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'desligado')),
  core_version TEXT NOT NULL DEFAULT '1.0.0',     -- versão do core usado
  
  -- ETAPA 35: Campos de vínculo
  vinculo_nucleo TEXT NOT NULL DEFAULT 'ligado' CHECK (vinculo_nucleo IN ('ligado', 'em_transicao', 'desligado')),
  politica_suporte TEXT NOT NULL DEFAULT 'monitorado' CHECK (politica_suporte IN ('monitorado', 'sob_demanda', 'sem_suporte')),
  
  -- Metadados
  config_extra JSONB DEFAULT '{}',                -- configurações extras do projeto
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_ultima_atividade TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_core_slug ON public.projects_core(slug);
CREATE INDEX IF NOT EXISTS idx_projects_core_tipo ON public.projects_core(tipo_projeto);
CREATE INDEX IF NOT EXISTS idx_projects_core_status ON public.projects_core(status);
CREATE INDEX IF NOT EXISTS idx_projects_core_parent ON public.projects_core(parent_project_id);
CREATE INDEX IF NOT EXISTS idx_projects_core_vinculo ON public.projects_core(vinculo_nucleo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_projects_core_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_core_updated_at ON public.projects_core;
CREATE TRIGGER trigger_projects_core_updated_at
  BEFORE UPDATE ON public.projects_core
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_core_updated_at();

-- ============================================================================
-- TABELA: owners_core
-- Donos/responsáveis por cada projeto
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.owners_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_core(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo_owner TEXT NOT NULL CHECK (tipo_owner IN ('cliente_final', 'parceiro', 'interno')),
  dados_contato JSONB DEFAULT '{}',               -- telefone, whatsapp, etc.
  is_primary BOOLEAN DEFAULT false,               -- owner principal do projeto
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_owners_core_project ON public.owners_core(project_id);
CREATE INDEX IF NOT EXISTS idx_owners_core_email ON public.owners_core(email);
CREATE INDEX IF NOT EXISTS idx_owners_core_tipo ON public.owners_core(tipo_owner);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_owners_core_updated_at ON public.owners_core;
CREATE TRIGGER trigger_owners_core_updated_at
  BEFORE UPDATE ON public.owners_core
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_core_updated_at();

-- ============================================================================
-- TABELA: project_flags_core
-- Flags e configurações por projeto
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_flags_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_core(id) ON DELETE CASCADE,
  flag TEXT NOT NULL,                             -- ex: "telemetria_ligada", "helpdesk_ligado"
  valor JSONB DEFAULT 'true',                     -- valor da flag (pode ser boolean, number, object)
  descricao TEXT,                                 -- descrição da flag
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, flag)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_flags_project ON public.project_flags_core(project_id);
CREATE INDEX IF NOT EXISTS idx_project_flags_flag ON public.project_flags_core(flag);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_project_flags_updated_at ON public.project_flags_core;
CREATE TRIGGER trigger_project_flags_updated_at
  BEFORE UPDATE ON public.project_flags_core
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_core_updated_at();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.projects_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_flags_core ENABLE ROW LEVEL SECURITY;

-- Apenas super-admin (ADMIN/SUPER_ADMIN) pode ver/editar projects_core
DROP POLICY IF EXISTS "Super admin can manage projects" ON public.projects_core;
CREATE POLICY "Super admin can manage projects" ON public.projects_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Apenas super-admin pode ver/editar owners_core
DROP POLICY IF EXISTS "Super admin can manage owners" ON public.owners_core;
CREATE POLICY "Super admin can manage owners" ON public.owners_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Apenas super-admin pode ver/editar project_flags_core
DROP POLICY IF EXISTS "Super admin can manage project flags" ON public.project_flags_core;
CREATE POLICY "Super admin can manage project flags" ON public.project_flags_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- SEED: Registrar Radar Mãe como primeiro projeto
-- ============================================================================

INSERT INTO public.projects_core (
  slug,
  nome_publico,
  tipo_projeto,
  tema,
  url_publica,
  url_admin,
  status,
  core_version,
  vinculo_nucleo,
  politica_suporte,
  config_extra
) VALUES (
  'radar-narcisista',
  'Radar Narcisista',
  'radar_mae',
  'Relacionamentos Abusivos e Narcisismo',
  'https://radar-narcisista.vercel.app',
  'https://radar-narcisista.vercel.app/admin',
  'ativo',
  '1.0.30',
  'ligado',
  'monitorado',
  '{"descricao": "Projeto mãe do ecossistema Radar", "modulos": ["oraculo_v1", "oraculo_v2", "planos", "billing", "diario", "chat", "clareza"]}'
) ON CONFLICT (slug) DO UPDATE SET
  nome_publico = EXCLUDED.nome_publico,
  core_version = EXCLUDED.core_version,
  updated_at = NOW();

-- Inserir owner interno (Eduardo)
INSERT INTO public.owners_core (
  project_id,
  nome,
  email,
  tipo_owner,
  is_primary,
  dados_contato
)
SELECT 
  id,
  'Eduardo (Admin)',
  'admin@radarnarcisista.com.br',
  'interno',
  true,
  '{"role": "super_admin", "responsabilidade": "Dono do ecossistema"}'
FROM public.projects_core
WHERE slug = 'radar-narcisista'
ON CONFLICT DO NOTHING;

-- Inserir flags padrão para Radar Mãe
INSERT INTO public.project_flags_core (project_id, flag, valor, descricao)
SELECT 
  id,
  'telemetria_ligada',
  'true',
  'Telemetria ativa para monitoramento'
FROM public.projects_core WHERE slug = 'radar-narcisista'
ON CONFLICT (project_id, flag) DO NOTHING;

INSERT INTO public.project_flags_core (project_id, flag, valor, descricao)
SELECT 
  id,
  'helpdesk_ligado',
  'true',
  'Help Desk ativo para suporte'
FROM public.projects_core WHERE slug = 'radar-narcisista'
ON CONFLICT (project_id, flag) DO NOTHING;

INSERT INTO public.project_flags_core (project_id, flag, valor, descricao)
SELECT 
  id,
  'oraculo_v1_ativo',
  'true',
  'Oráculo V1 (painel admin) ativo'
FROM public.projects_core WHERE slug = 'radar-narcisista'
ON CONFLICT (project_id, flag) DO NOTHING;

INSERT INTO public.project_flags_core (project_id, flag, valor, descricao)
SELECT 
  id,
  'oraculo_v2_ativo',
  'true',
  'Oráculo V2 (IA de suporte) ativo'
FROM public.projects_core WHERE slug = 'radar-narcisista'
ON CONFLICT (project_id, flag) DO NOTHING;

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter projeto por slug
CREATE OR REPLACE FUNCTION public.get_project_by_slug(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  v_project JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'nome_publico', p.nome_publico,
    'tipo_projeto', p.tipo_projeto,
    'tema', p.tema,
    'status', p.status,
    'core_version', p.core_version,
    'vinculo_nucleo', p.vinculo_nucleo,
    'politica_suporte', p.politica_suporte,
    'url_publica', p.url_publica,
    'url_admin', p.url_admin,
    'data_criacao', p.data_criacao,
    'data_ultima_atividade', p.data_ultima_atividade
  ) INTO v_project
  FROM public.projects_core p
  WHERE p.slug = p_slug;
  
  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para listar todos os projetos (para Control Tower)
CREATE OR REPLACE FUNCTION public.list_all_projects()
RETURNS TABLE (
  id UUID,
  slug TEXT,
  nome_publico TEXT,
  tipo_projeto TEXT,
  tema TEXT,
  status TEXT,
  core_version TEXT,
  vinculo_nucleo TEXT,
  politica_suporte TEXT,
  data_criacao TIMESTAMPTZ,
  data_ultima_atividade TIMESTAMPTZ,
  total_owners BIGINT,
  total_flags BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.slug,
    p.nome_publico,
    p.tipo_projeto,
    p.tema,
    p.status,
    p.core_version,
    p.vinculo_nucleo,
    p.politica_suporte,
    p.data_criacao,
    p.data_ultima_atividade,
    (SELECT COUNT(*) FROM public.owners_core o WHERE o.project_id = p.id) as total_owners,
    (SELECT COUNT(*) FROM public.project_flags_core f WHERE f.project_id = p.id) as total_flags
  FROM public.projects_core p
  ORDER BY p.data_criacao DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar última atividade de um projeto
CREATE OR REPLACE FUNCTION public.update_project_activity(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.projects_core
  SET data_ultima_atividade = NOW()
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.projects_core IS 'Registro central de todos os projetos do ecossistema (Radar Mãe, White Labels, SaaS gerados)';
COMMENT ON COLUMN public.projects_core.tipo_projeto IS 'radar_mae=projeto principal, white_label=licença customizada, saas_tema=SaaS com tema, saas_branco=SaaS neutro';
COMMENT ON COLUMN public.projects_core.vinculo_nucleo IS 'ligado=conectado ao core, em_transicao=processo de desvinculação, desligado=independente';
COMMENT ON COLUMN public.projects_core.politica_suporte IS 'monitorado=suporte ativo, sob_demanda=suporte quando solicitado, sem_suporte=sem suporte';

COMMENT ON TABLE public.owners_core IS 'Donos e responsáveis por cada projeto';
COMMENT ON TABLE public.project_flags_core IS 'Flags e configurações específicas por projeto';

COMMENT ON FUNCTION public.get_project_by_slug IS 'Retorna dados de um projeto pelo slug';
COMMENT ON FUNCTION public.list_all_projects IS 'Lista todos os projetos para a Control Tower';
COMMENT ON FUNCTION public.update_project_activity IS 'Atualiza timestamp de última atividade de um projeto';
