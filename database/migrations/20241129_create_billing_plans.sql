-- ============================================================================
-- MIGRATION: Sistema de Planos Administráveis
-- Data: 29/11/2025
-- Objetivo: Criar tabelas para gerenciar planos e promoções via admin
-- ============================================================================

-- ============================================================================
-- TABELA: billing_plans
-- Armazena todos os planos do sistema (B2C e B2B)
-- ============================================================================

CREATE TABLE IF NOT EXISTS billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  code TEXT UNIQUE NOT NULL,                    -- ex.: 'visitante', 'guardar', 'jornada', 'defesa', 'profissional', 'intermedio'
  legacy_id TEXT,                               -- ID legado para compatibilidade Stripe (ex.: 'gratuito', 'essencial', 'premium')
  
  -- Classificação
  audience TEXT NOT NULL DEFAULT 'consumer',    -- 'consumer' ou 'professional'
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,      -- Se aparece na frontpage e /planos
  is_mid_bridge BOOLEAN NOT NULL DEFAULT false, -- Plano intermediário oculto entre free e pro
  
  -- Textos (internacionalizados)
  name_pt TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  tagline_pt TEXT,
  tagline_en TEXT,
  tagline_es TEXT,
  description_pt TEXT,
  description_en TEXT,
  description_es TEXT,
  
  -- Preços (em centavos para evitar problemas de float)
  price_monthly_cents INTEGER DEFAULT 0,
  price_yearly_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  
  -- Limites de uso
  max_tests_per_month INTEGER DEFAULT -1,           -- -1 = ilimitado
  max_diary_entries_per_month INTEGER DEFAULT -1,   -- -1 = ilimitado
  max_chat_messages_per_day INTEGER DEFAULT -1,     -- -1 = ilimitado
  can_export_pdf BOOLEAN DEFAULT false,
  can_view_full_history BOOLEAN DEFAULT false,
  can_use_collaborative_ai BOOLEAN DEFAULT false,
  max_clients INTEGER DEFAULT 0,                    -- Para planos profissionais
  
  -- Integração Stripe
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT,
  
  -- UI/UX
  icon TEXT DEFAULT 'Shield',                       -- Nome do ícone (lucide-react)
  color TEXT DEFAULT 'text-gray-600',
  bg_color TEXT DEFAULT 'bg-gray-100',
  is_popular BOOLEAN DEFAULT false,                 -- Badge "POPULAR"
  is_coming_soon BOOLEAN DEFAULT false,             -- Badge "EM BREVE"
  sort_order INTEGER DEFAULT 0,                     -- Ordem de exibição
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_billing_plans_code ON billing_plans(code);
CREATE INDEX IF NOT EXISTS idx_billing_plans_audience ON billing_plans(audience);
CREATE INDEX IF NOT EXISTS idx_billing_plans_public ON billing_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_billing_plans_sort ON billing_plans(sort_order);

-- ============================================================================
-- TABELA: billing_plan_promotions
-- Armazena promoções temporárias para planos
-- ============================================================================

CREATE TABLE IF NOT EXISTS billing_plan_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento
  plan_id UUID NOT NULL REFERENCES billing_plans(id) ON DELETE CASCADE,
  
  -- Labels (internacionalizados)
  label_pt TEXT,                                    -- ex.: "Black Friday 50% OFF"
  label_en TEXT,
  label_es TEXT,
  
  -- Período de validade
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Preços promocionais (em centavos)
  promo_price_monthly_cents INTEGER,
  promo_price_yearly_cents INTEGER,
  
  -- Desconto percentual (alternativa aos preços fixos)
  discount_percent INTEGER,                         -- ex.: 50 para 50%
  
  -- Configurações
  is_active BOOLEAN DEFAULT true,
  show_original_price BOOLEAN DEFAULT true,         -- Mostrar preço original riscado
  badge_color TEXT DEFAULT 'bg-red-500',            -- Cor do badge promocional
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_billing_promotions_plan ON billing_plan_promotions(plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_promotions_active ON billing_plan_promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_billing_promotions_dates ON billing_plan_promotions(starts_at, ends_at);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plan_promotions ENABLE ROW LEVEL SECURITY;

-- Política de SELECT público para billing_plans (todos podem ver planos públicos)
CREATE POLICY "billing_plans_select_public" ON billing_plans
  FOR SELECT
  USING (is_public = true);

-- Política de SELECT público para promoções ativas
CREATE POLICY "billing_promotions_select_active" ON billing_plan_promotions
  FOR SELECT
  USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

-- Política de acesso total para admins (via service_role)
-- Nota: Operações de INSERT/UPDATE/DELETE devem usar supabaseAdmin

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_billing_plans_updated_at
  BEFORE UPDATE ON billing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

CREATE TRIGGER trigger_billing_promotions_updated_at
  BEFORE UPDATE ON billing_plan_promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

-- ============================================================================
-- SEED: Inserir planos iniciais baseados em lib/plans-config.ts
-- ============================================================================

INSERT INTO billing_plans (
  code, legacy_id, audience, is_free, is_public, is_mid_bridge,
  name_pt, name_en, name_es,
  tagline_pt, tagline_en, tagline_es,
  description_pt,
  price_monthly_cents, price_yearly_cents,
  max_tests_per_month, max_diary_entries_per_month, max_chat_messages_per_day,
  can_export_pdf, can_view_full_history, can_use_collaborative_ai, max_clients,
  stripe_price_monthly_id, stripe_price_yearly_id,
  icon, color, bg_color, is_popular, is_coming_soon, sort_order
) VALUES
-- VISITANTE
(
  'visitante', 'visitante', 'consumer', true, false, false,
  'Visitante', 'Visitor', 'Visitante',
  'Explore sem compromisso', 'Explore without commitment', 'Explora sin compromiso',
  'Acesse o teste de clareza uma vez para entender sua situação. Sem necessidade de criar conta.',
  0, 0,
  1, 0, 0,
  false, false, false, 0,
  NULL, NULL,
  'Eye', 'text-gray-600', 'bg-gray-100', false, false, 0
),
-- RADAR GUARDAR (Gratuito)
(
  'guardar', 'gratuito', 'consumer', true, true, false,
  'Radar Guardar', 'Radar Save', 'Radar Guardar',
  'Guarde sua história com segurança', 'Save your story safely', 'Guarda tu historia con seguridad',
  'Crie sua conta gratuita para salvar seu teste, registrar episódios e ter acesso ao Coach IA básico.',
  0, 0,
  -1, 3, 5,
  false, false, false, 0,
  NULL, NULL,
  'Shield', 'text-emerald-600', 'bg-emerald-100', false, false, 1
),
-- RADAR JORNADA (Essencial)
(
  'jornada', 'essencial', 'consumer', false, true, false,
  'Radar Jornada', 'Radar Journey', 'Radar Jornada',
  'Acompanhe sua evolução', 'Track your evolution', 'Acompaña tu evolución',
  'Para quem quer documentar sua jornada com mais profundidade, exportar relatórios e ter análises de padrões.',
  2990, 29900,
  -1, -1, 50,
  true, true, false, 0,
  NULL, NULL,
  'TrendingUp', 'text-violet-600', 'bg-violet-100', false, false, 2
),
-- RADAR DEFESA (Premium)
(
  'defesa', 'premium', 'consumer', false, true, false,
  'Radar Defesa', 'Radar Defense', 'Radar Defensa',
  'Proteção completa', 'Complete protection', 'Protección completa',
  'Para quem precisa de todas as ferramentas disponíveis, com IA ilimitada e suporte prioritário.',
  4990, 49900,
  -1, -1, -1,
  true, true, true, 0,
  NULL, NULL,
  'ShieldAlert', 'text-amber-600', 'bg-amber-100', true, false, 3
),
-- PLANO INTERMEDIÁRIO (Oculto - para promoções)
(
  'intermedio', 'intermedio', 'consumer', false, false, true,
  'Radar Essencial', 'Radar Essential', 'Radar Esencial',
  'O equilíbrio perfeito', 'The perfect balance', 'El equilibrio perfecto',
  'Plano intermediário com recursos essenciais. Disponível em promoções especiais.',
  1990, 19900,
  -1, 10, 20,
  true, false, false, 0,
  NULL, NULL,
  'Zap', 'text-blue-600', 'bg-blue-100', false, false, 10
),
-- RADAR PROFISSIONAL (B2B)
(
  'profissional', 'profissional', 'professional', false, true, false,
  'Radar Profissional', 'Radar Professional', 'Radar Profesional',
  'Para terapeutas e profissionais', 'For therapists and professionals', 'Para terapeutas y profesionales',
  'Gerencie múltiplos clientes, gere relatórios profissionais e tenha ferramentas específicas para atendimento.',
  9990, 99900,
  -1, -1, -1,
  true, true, true, 20,
  NULL, NULL,
  'Users', 'text-blue-600', 'bg-blue-100', false, true, 20
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================