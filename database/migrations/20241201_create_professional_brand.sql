-- ============================================================================
-- ETAPA 13: Infra White-label Profissional (V1)
-- Radar Narcisista - Dashboard Profissional
-- Data: 01/12/2025
-- ============================================================================
-- 
-- OBJETIVO: Permitir que profissionais personalizem sua marca no sistema
-- 
-- CAMPOS:
-- - display_name: Nome público do profissional/clínica
-- - brand_color: Cor principal da marca (hex)
-- - logo_url: URL do logo (upload será V2)
-- - tagline: Slogan ou especialidade
-- 
-- ============================================================================

-- Criar tabela de brand do profissional
CREATE TABLE IF NOT EXISTS public.professional_brand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- FK para o profissional (auth.users)
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da marca
  display_name TEXT,                    -- Nome público (ex: "Clínica X", "Dra. Fulana")
  brand_color TEXT DEFAULT '#7C3AED',   -- Cor principal (hex) - padrão roxo do Radar
  logo_url TEXT,                        -- URL do logo (upload será V2)
  tagline TEXT,                         -- Slogan ou especialidade
  
  -- Configurações adicionais (V2)
  show_radar_branding BOOLEAN DEFAULT TRUE,  -- Mostrar "Powered by Radar Narcisista"
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Um profissional só pode ter uma configuração de marca
  CONSTRAINT unique_professional_brand UNIQUE (professional_id)
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_professional_brand_professional_id 
  ON public.professional_brand(professional_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_professional_brand_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_professional_brand_updated_at ON public.professional_brand;
CREATE TRIGGER trigger_professional_brand_updated_at
  BEFORE UPDATE ON public.professional_brand
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_brand_updated_at();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.professional_brand ENABLE ROW LEVEL SECURITY;

-- Profissional pode ver e editar sua própria marca
DROP POLICY IF EXISTS "professional_can_manage_own_brand" ON public.professional_brand;
CREATE POLICY "professional_can_manage_own_brand"
  ON public.professional_brand
  FOR ALL
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Clientes podem ver a marca do profissional conectado (para exibição)
DROP POLICY IF EXISTS "clients_can_view_connected_professional_brand" ON public.professional_brand;
CREATE POLICY "clients_can_view_connected_professional_brand"
  ON public.professional_brand
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.professional_clients pc
      WHERE pc.professional_id = professional_brand.professional_id
        AND pc.client_id = auth.uid()
        AND pc.status IN ('active', 'pending')
    )
  );

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.professional_brand IS 'Configurações de marca/white-label para profissionais';
COMMENT ON COLUMN public.professional_brand.display_name IS 'Nome público do profissional ou clínica';
COMMENT ON COLUMN public.professional_brand.brand_color IS 'Cor principal da marca em formato hex (#RRGGBB)';
COMMENT ON COLUMN public.professional_brand.logo_url IS 'URL do logo (upload será implementado em V2)';
COMMENT ON COLUMN public.professional_brand.tagline IS 'Slogan ou especialidade do profissional';
COMMENT ON COLUMN public.professional_brand.show_radar_branding IS 'Se deve mostrar "Powered by Radar Narcisista"';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
