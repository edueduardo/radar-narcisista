-- ============================================================================
-- MIGRATION: ORÁCULO BILLING
-- ETAPA 38 - Sistema de Billing por Instância
-- ============================================================================
-- Executar no Supabase SQL Editor
-- ============================================================================

-- Tabela de Planos de Instância
CREATE TABLE IF NOT EXISTS oraculo_instance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  plan_slug VARCHAR(50) UNIQUE NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Stripe
  stripe_product_id VARCHAR(100),
  stripe_price_id VARCHAR(100),
  
  -- Limites
  max_queries_per_month INTEGER DEFAULT 1000,
  max_tokens_per_month INTEGER DEFAULT 500000,
  max_api_keys INTEGER DEFAULT 5,
  max_webhooks INTEGER DEFAULT 3,
  max_roles INTEGER DEFAULT 5,
  
  -- Features
  features JSONB DEFAULT '[]'::jsonb,
  -- Ex: ["custom_branding", "priority_support", "advanced_analytics"]
  
  -- Preço
  price_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  billing_period VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Assinaturas de Instância
CREATE TABLE IF NOT EXISTS oraculo_instance_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES oraculo_instance_plans(id),
  
  -- Stripe
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
  
  -- Período
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Uso atual
  queries_used INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Faturas
CREATE TABLE IF NOT EXISTS oraculo_instance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES oraculo_instance_subscriptions(id),
  
  -- Stripe
  stripe_invoice_id VARCHAR(100),
  stripe_payment_intent_id VARCHAR(100),
  
  -- Valores
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  
  -- Período
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- Detalhes
  description TEXT,
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Uso para Billing
CREATE TABLE IF NOT EXISTS oraculo_billing_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES oraculo_instance_subscriptions(id),
  
  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Métricas
  total_queries INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_api_calls INTEGER DEFAULT 0,
  
  -- Custo calculado
  estimated_cost_cents INTEGER DEFAULT 0,
  
  -- Detalhes por dia
  daily_breakdown JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(instance_id, period_start, period_end)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_instance_subs_instance ON oraculo_instance_subscriptions(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_subs_status ON oraculo_instance_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_instance_invoices_instance ON oraculo_instance_invoices(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_invoices_status ON oraculo_instance_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_usage_instance ON oraculo_billing_usage(instance_id);
CREATE INDEX IF NOT EXISTS idx_billing_usage_period ON oraculo_billing_usage(period_start, period_end);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_plans_updated_at ON oraculo_instance_plans;
CREATE TRIGGER trigger_plans_updated_at
  BEFORE UPDATE ON oraculo_instance_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

DROP TRIGGER IF EXISTS trigger_subs_updated_at ON oraculo_instance_subscriptions;
CREATE TRIGGER trigger_subs_updated_at
  BEFORE UPDATE ON oraculo_instance_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

DROP TRIGGER IF EXISTS trigger_usage_updated_at ON oraculo_billing_usage;
CREATE TRIGGER trigger_usage_updated_at
  BEFORE UPDATE ON oraculo_billing_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

-- RLS
ALTER TABLE oraculo_instance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_instance_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_instance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_billing_usage ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admins podem gerenciar
CREATE POLICY "Admins podem gerenciar planos" ON oraculo_instance_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins podem gerenciar subscriptions" ON oraculo_instance_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins podem ver invoices" ON oraculo_instance_invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins podem ver usage" ON oraculo_billing_usage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Inserir planos padrão
INSERT INTO oraculo_instance_plans (plan_slug, plan_name, description, max_queries_per_month, max_tokens_per_month, max_api_keys, max_webhooks, price_cents, features, is_default)
VALUES 
  ('free', 'Free', 'Plano gratuito para testes', 100, 50000, 1, 1, 0, '["basic_support"]'::jsonb, true),
  ('starter', 'Starter', 'Para pequenos projetos', 1000, 500000, 3, 2, 4900, '["basic_support", "email_support"]'::jsonb, false),
  ('pro', 'Pro', 'Para projetos em produção', 10000, 5000000, 10, 5, 14900, '["priority_support", "custom_branding", "advanced_analytics"]'::jsonb, false),
  ('enterprise', 'Enterprise', 'Para grandes operações', -1, -1, -1, -1, 49900, '["priority_support", "custom_branding", "advanced_analytics", "dedicated_support", "sla"]'::jsonb, false)
ON CONFLICT (plan_slug) DO NOTHING;

-- Comentários
COMMENT ON TABLE oraculo_instance_plans IS 'Planos disponíveis para instâncias do Oráculo';
COMMENT ON TABLE oraculo_instance_subscriptions IS 'Assinaturas de instâncias';
COMMENT ON TABLE oraculo_instance_invoices IS 'Faturas de instâncias';
COMMENT ON TABLE oraculo_billing_usage IS 'Uso mensal para billing';
