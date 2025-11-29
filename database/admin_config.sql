-- ============================================
-- TABELA DE CONFIGURAÇÕES DO ADMIN
-- Execute no Supabase SQL Editor
-- Criado em: 24/11/2025 22:28
-- ============================================

-- Tabela para configurações de IAs do admin
CREATE TABLE IF NOT EXISTS public.admin_ia_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IAs ativas (array de nomes)
  ias_ativas TEXT[] DEFAULT ARRAY['openai'],
  
  -- Etapas - quais IAs em cada etapa
  etapa1_analise TEXT[] DEFAULT ARRAY['openai'],
  etapa2_votacao TEXT[] DEFAULT ARRAY['openai'],
  etapa3_consenso TEXT[] DEFAULT ARRAY['openai'],
  etapa4_transparencia TEXT[] DEFAULT ARRAY['openai'],
  
  -- Controle de qualidade
  threshold_votacao INTEGER DEFAULT 80,
  min_consenso INTEGER DEFAULT 2,
  exigir_consenso_total BOOLEAN DEFAULT FALSE,
  
  -- Relatórios do administrador
  relatorio_pontual_pessoas BOOLEAN DEFAULT TRUE,
  relatorio_global_sistema BOOLEAN DEFAULT TRUE,
  rastrear_problemas_juridicos BOOLEAN DEFAULT TRUE,
  detectar_possiveis_mentiras BOOLEAN DEFAULT TRUE,
  evitar_prognosticos_errados BOOLEAN DEFAULT TRUE,
  
  -- Configuração do Coach
  coach_tom TEXT DEFAULT 'empatico',
  coach_foco TEXT DEFAULT 'validacao',
  temperatura_ia DECIMAL(2,1) DEFAULT 0.7,
  max_tokens_resposta INTEGER DEFAULT 1000,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para conteúdo gerenciado (biblioteca, histórias, etc)
CREATE TABLE IF NOT EXISTS public.admin_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  tipo TEXT NOT NULL, -- 'biblioteca', 'historia', 'comunidade', 'recurso'
  categoria TEXT,
  titulo TEXT,
  conteudo JSONB NOT NULL,
  
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado'
  criado_por TEXT DEFAULT 'admin', -- 'admin', 'ia', 'usuario'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Tabela para recursos por estado
CREATE TABLE IF NOT EXISTS public.recursos_estado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  estado TEXT NOT NULL,
  sigla TEXT NOT NULL,
  
  recursos JSONB NOT NULL, -- Array de {nome, telefone, tipo}
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_content_tipo ON public.admin_content(tipo);
CREATE INDEX IF NOT EXISTS idx_admin_content_status ON public.admin_content(status);
CREATE INDEX IF NOT EXISTS idx_recursos_estado_sigla ON public.recursos_estado(sigla);

-- RLS (Row Level Security)
ALTER TABLE public.admin_ia_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_estado ENABLE ROW LEVEL SECURITY;

-- Políticas - Admin pode tudo, usuários podem ler recursos
CREATE POLICY "admin_ia_config_all" ON public.admin_ia_config FOR ALL USING (true);
CREATE POLICY "admin_content_all" ON public.admin_content FOR ALL USING (true);
CREATE POLICY "recursos_estado_select" ON public.recursos_estado FOR SELECT USING (true);
CREATE POLICY "recursos_estado_admin" ON public.recursos_estado FOR ALL USING (true);

-- Inserir configuração padrão
INSERT INTO public.admin_ia_config (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Comentários
COMMENT ON TABLE public.admin_ia_config IS 'Configurações de IAs do painel admin';
COMMENT ON TABLE public.admin_content IS 'Conteúdo gerenciado pelo admin (biblioteca, histórias, etc)';
COMMENT ON TABLE public.recursos_estado IS 'Recursos de apoio por estado brasileiro';
