-- ============================================================================
-- MIGRATION: user_addons
-- ETAPA 21 - Billing Sólido & Add-ons
-- Criado em: 01/12/2025
-- ============================================================================

-- Tabela para armazenar add-ons comprados pelos usuários
CREATE TABLE IF NOT EXISTS public.user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_key TEXT NOT NULL,                    -- Chave do addon (ex: 'chat-50', 'kit-seguranca')
  stripe_price_id TEXT,                       -- ID do preço no Stripe
  stripe_payment_id TEXT,                     -- ID do pagamento/checkout no Stripe
  stripe_session_id TEXT,                     -- ID da sessão de checkout
  status TEXT NOT NULL DEFAULT 'active',      -- active, expired, cancelled, refunded
  credits_total INTEGER,                      -- Total de créditos (para addons de crédito)
  credits_remaining INTEGER,                  -- Créditos restantes
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,                     -- NULL = permanente
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadados extras
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON public.user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_addon_key ON public.user_addons(addon_key);
CREATE INDEX IF NOT EXISTS idx_user_addons_status ON public.user_addons(status);
CREATE INDEX IF NOT EXISTS idx_user_addons_stripe_session ON public.user_addons(stripe_session_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_addons_updated_at ON public.user_addons;
CREATE TRIGGER trigger_user_addons_updated_at
  BEFORE UPDATE ON public.user_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_user_addons_updated_at();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.user_addons ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só vê seus próprios add-ons
DROP POLICY IF EXISTS "Users can view own addons" ON public.user_addons;
CREATE POLICY "Users can view own addons" ON public.user_addons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Apenas service_role pode inserir (via webhook)
DROP POLICY IF EXISTS "Service role can insert addons" ON public.user_addons;
CREATE POLICY "Service role can insert addons" ON public.user_addons
  FOR INSERT
  WITH CHECK (true);

-- Política: Apenas service_role pode atualizar
DROP POLICY IF EXISTS "Service role can update addons" ON public.user_addons;
CREATE POLICY "Service role can update addons" ON public.user_addons
  FOR UPDATE
  USING (true);

-- ============================================================================
-- FUNÇÃO: Verificar se usuário tem addon ativo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_active_addon(
  p_user_id UUID,
  p_addon_key TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_addons
    WHERE user_id = p_user_id
      AND addon_key = p_addon_key
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: Obter créditos restantes de um addon
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_addon_credits(
  p_user_id UUID,
  p_addon_key TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_credits
  FROM public.user_addons
  WHERE user_id = p_user_id
    AND addon_key = p_addon_key
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND credits_remaining > 0;
  
  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: Consumir crédito de addon
-- ============================================================================

CREATE OR REPLACE FUNCTION public.consume_addon_credit(
  p_user_id UUID,
  p_addon_key TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_addon_id UUID;
  v_credits INTEGER;
BEGIN
  -- Buscar addon ativo com créditos disponíveis (mais antigo primeiro)
  SELECT id, credits_remaining INTO v_addon_id, v_credits
  FROM public.user_addons
  WHERE user_id = p_user_id
    AND addon_key = p_addon_key
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
    AND credits_remaining >= p_amount
  ORDER BY purchased_at ASC
  LIMIT 1;
  
  IF v_addon_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Consumir crédito
  UPDATE public.user_addons
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = v_addon_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.user_addons IS 'Add-ons comprados pelos usuários (créditos, features, pacotes)';
COMMENT ON COLUMN public.user_addons.addon_key IS 'Chave única do addon, deve corresponder ao id em lib/addons-config.ts';
COMMENT ON COLUMN public.user_addons.status IS 'Status: active, expired, cancelled, refunded';
COMMENT ON COLUMN public.user_addons.credits_remaining IS 'Para addons de crédito, quantidade restante';
