-- ============================================================================
-- MIGRATION 007: Tabela frontpage_config para edição da frontpage
-- Data: 30/11/2025
-- ============================================================================

-- Tabela para armazenar configurações editáveis da frontpage
CREATE TABLE IF NOT EXISTS public.frontpage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador único da seção/configuração
  config_key TEXT NOT NULL UNIQUE,
  
  -- Valor da configuração (JSON para flexibilidade)
  config_value JSONB NOT NULL DEFAULT '{}',
  
  -- Metadados
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_frontpage_config_key ON public.frontpage_config(config_key);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_frontpage_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_frontpage_config_updated_at ON public.frontpage_config;
CREATE TRIGGER trigger_frontpage_config_updated_at
  BEFORE UPDATE ON public.frontpage_config
  FOR EACH ROW
  EXECUTE FUNCTION update_frontpage_config_updated_at();

-- RLS: Apenas admins podem editar, todos podem ler (para renderizar a página)
ALTER TABLE public.frontpage_config ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes (para permitir re-execução)
DROP POLICY IF EXISTS "frontpage_config_read_all" ON public.frontpage_config;
DROP POLICY IF EXISTS "frontpage_config_admin_all" ON public.frontpage_config;

-- Política de leitura: todos podem ler configurações ativas
CREATE POLICY "frontpage_config_read_all" ON public.frontpage_config
  FOR SELECT USING (is_active = true);

-- Política de escrita: apenas admins
CREATE POLICY "frontpage_config_admin_all" ON public.frontpage_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- DADOS INICIAIS (seed)
-- ============================================================================

-- Hero Section
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('hero', '{
  "title": "Você não está louca.",
  "subtitle": "Descubra se está em um relacionamento abusivo com nossa IA especializada em narcisismo.",
  "cta_primary": "Fazer Teste de Clareza",
  "cta_primary_link": "/teste-clareza",
  "cta_secondary": "Conhecer Ferramentas",
  "cta_secondary_link": "#ferramentas",
  "background_gradient": "from-purple-900 via-violet-900 to-indigo-900"
}', 'Seção Hero principal da frontpage')
ON CONFLICT (config_key) DO NOTHING;

-- Seção de Estatísticas
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('stats', '{
  "enabled": true,
  "items": [
    {"value": "10.000+", "label": "Mulheres ajudadas"},
    {"value": "50.000+", "label": "Testes realizados"},
    {"value": "98%", "label": "Recomendam"},
    {"value": "24/7", "label": "Disponível"}
  ]
}', 'Estatísticas exibidas na frontpage')
ON CONFLICT (config_key) DO NOTHING;

-- Seção de Ferramentas
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('tools_section', '{
  "enabled": true,
  "title": "Ferramentas para sua jornada",
  "subtitle": "Tudo que você precisa para entender, documentar e se proteger."
}', 'Título da seção de ferramentas')
ON CONFLICT (config_key) DO NOTHING;

-- FAQ
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('faq', '{
  "enabled": true,
  "title": "Perguntas Frequentes",
  "items": [
    {
      "question": "O Radar Narcisista substitui terapia?",
      "answer": "Não. Somos uma ferramenta de apoio e autoconhecimento. Recomendamos sempre buscar acompanhamento profissional."
    },
    {
      "question": "Meus dados estão seguros?",
      "answer": "Sim. Usamos criptografia de ponta a ponta e nunca compartilhamos seus dados com terceiros."
    },
    {
      "question": "Posso usar anonimamente?",
      "answer": "Sim. Você pode fazer o teste de clareza sem criar conta. Para salvar seu progresso, é necessário cadastro."
    },
    {
      "question": "Como funciona o Coach de IA?",
      "answer": "Nossa IA foi treinada especificamente para reconhecer padrões de abuso narcisista e oferecer orientação personalizada."
    }
  ]
}', 'Perguntas frequentes da frontpage')
ON CONFLICT (config_key) DO NOTHING;

-- Depoimentos
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('testimonials', '{
  "enabled": true,
  "title": "O que dizem sobre nós",
  "items": [
    {
      "name": "Maria S.",
      "location": "São Paulo, SP",
      "text": "Finalmente entendi que não era eu o problema. O teste de clareza abriu meus olhos.",
      "rating": 5
    },
    {
      "name": "Ana P.",
      "location": "Rio de Janeiro, RJ",
      "text": "O Coach de IA me ajudou a organizar meus pensamentos e tomar decisões difíceis.",
      "rating": 5
    },
    {
      "name": "Juliana M.",
      "location": "Belo Horizonte, MG",
      "text": "Recomendo para todas as mulheres. É como ter uma amiga que entende exatamente o que você está passando.",
      "rating": 5
    }
  ]
}', 'Depoimentos exibidos na frontpage')
ON CONFLICT (config_key) DO NOTHING;

-- CTA Final
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('cta_final', '{
  "enabled": true,
  "title": "Pronta para dar o primeiro passo?",
  "subtitle": "Faça o teste de clareza gratuito e descubra se você está em um relacionamento saudável.",
  "button_text": "Começar Agora",
  "button_link": "/teste-clareza"
}', 'Call-to-action final da frontpage')
ON CONFLICT (config_key) DO NOTHING;

-- Configurações gerais
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('general', '{
  "site_name": "Radar Narcisista",
  "tagline": "Clareza para quem precisa",
  "logo_text": "Radar Narcisista",
  "show_promo_banner": true,
  "promo_banner_text": "🎉 Lançamento: 50% OFF no plano anual!"
}', 'Configurações gerais do site')
ON CONFLICT (config_key) DO NOTHING;

-- Ordem das seções
INSERT INTO public.frontpage_config (config_key, config_value, description) VALUES
('sections_order', '{
  "sections": [
    {"id": "hero", "enabled": true, "order": 1},
    {"id": "stats", "enabled": true, "order": 2},
    {"id": "tools", "enabled": true, "order": 3},
    {"id": "plans", "enabled": true, "order": 4},
    {"id": "testimonials", "enabled": true, "order": 5},
    {"id": "faq", "enabled": true, "order": 6},
    {"id": "cta_final", "enabled": true, "order": 7}
  ]
}', 'Ordem e visibilidade das seções da frontpage')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
