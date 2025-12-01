-- ============================================================================
-- MIGRATION: oraculo_plan_settings + oraculo_usage
-- ETAPA 28 - Infra Multiperfil do Oráculo
-- Criado em: 01/12/2025
-- ============================================================================

-- ============================================================================
-- TABELA: oraculo_plan_settings
-- Configurações do Oráculo V2 por plano e perfil
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.oraculo_plan_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_slug TEXT NOT NULL,                    -- 'free', 'essencial', 'premium', 'profissional', 'enterprise'
  user_role TEXT NOT NULL,                    -- 'usuaria', 'profissional', 'admin', 'dev', 'whitelabel'
  
  -- Status: 0=desativado, 1=modo teste/limitado, 2=modo completo
  status INTEGER NOT NULL DEFAULT 0,
  
  -- Limites por período (NULL = sem limite)
  limite_diario INTEGER,
  limite_semanal INTEGER,
  limite_quinzenal INTEGER,
  limite_mensal INTEGER,
  
  -- Configurações adicionais
  modelo_ia TEXT DEFAULT 'gpt-4o-mini',       -- Modelo de IA a usar
  temperatura DECIMAL(2,1) DEFAULT 0.7,       -- Temperatura do modelo
  max_tokens INTEGER DEFAULT 1000,            -- Max tokens por resposta
  
  -- Metadados
  descricao TEXT,                             -- Descrição da configuração
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint única: um registro por combinação plano+perfil
  UNIQUE(plan_slug, user_role)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_oraculo_settings_plan ON public.oraculo_plan_settings(plan_slug);
CREATE INDEX IF NOT EXISTS idx_oraculo_settings_role ON public.oraculo_plan_settings(user_role);
CREATE INDEX IF NOT EXISTS idx_oraculo_settings_status ON public.oraculo_plan_settings(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_oraculo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_oraculo_settings_updated_at ON public.oraculo_plan_settings;
CREATE TRIGGER trigger_oraculo_settings_updated_at
  BEFORE UPDATE ON public.oraculo_plan_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_oraculo_settings_updated_at();

-- ============================================================================
-- TABELA: oraculo_usage
-- Registro de uso do Oráculo por usuário e período
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.oraculo_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL,
  plan_slug TEXT NOT NULL,
  
  -- Período de referência
  periodo_tipo TEXT NOT NULL,                 -- 'diario', 'semanal', 'quinzenal', 'mensal'
  periodo_inicio DATE NOT NULL,               -- Data de início do período
  periodo_fim DATE NOT NULL,                  -- Data de fim do período
  
  -- Contagem
  qtd_perguntas INTEGER NOT NULL DEFAULT 0,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint única: um registro por usuário+período
  UNIQUE(user_id, periodo_tipo, periodo_inicio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_oraculo_usage_user ON public.oraculo_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_usage_periodo ON public.oraculo_usage(periodo_tipo, periodo_inicio);
CREATE INDEX IF NOT EXISTS idx_oraculo_usage_user_periodo ON public.oraculo_usage(user_id, periodo_tipo, periodo_inicio);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_oraculo_usage_updated_at ON public.oraculo_usage;
CREATE TRIGGER trigger_oraculo_usage_updated_at
  BEFORE UPDATE ON public.oraculo_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_oraculo_settings_updated_at();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.oraculo_plan_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oraculo_usage ENABLE ROW LEVEL SECURITY;

-- oraculo_plan_settings: apenas admins podem ver/editar
DROP POLICY IF EXISTS "Admins can manage oraculo settings" ON public.oraculo_plan_settings;
CREATE POLICY "Admins can manage oraculo settings" ON public.oraculo_plan_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- oraculo_usage: usuário vê apenas seu próprio uso
DROP POLICY IF EXISTS "Users can view own usage" ON public.oraculo_usage;
CREATE POLICY "Users can view own usage" ON public.oraculo_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode inserir/atualizar usage
DROP POLICY IF EXISTS "Service role can manage usage" ON public.oraculo_usage;
CREATE POLICY "Service role can manage usage" ON public.oraculo_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNÇÃO: Verificar se usuário pode usar o Oráculo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_use_oraculo(
  p_user_id UUID,
  p_user_role TEXT,
  p_plan_slug TEXT
) RETURNS JSONB AS $$
DECLARE
  v_settings RECORD;
  v_usage_diario INTEGER;
  v_usage_semanal INTEGER;
  v_usage_mensal INTEGER;
  v_hoje DATE := CURRENT_DATE;
  v_inicio_semana DATE;
  v_inicio_mes DATE;
BEGIN
  -- Buscar configurações
  SELECT * INTO v_settings
  FROM public.oraculo_plan_settings
  WHERE plan_slug = p_plan_slug
    AND user_role = p_user_role;
  
  -- Se não encontrou configuração, está desabilitado
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Oráculo não configurado para este plano/perfil'
    );
  END IF;
  
  -- Se status = 0, está desabilitado
  IF v_settings.status = 0 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Oráculo desabilitado para este plano/perfil'
    );
  END IF;
  
  -- Calcular início da semana (segunda-feira)
  v_inicio_semana := v_hoje - EXTRACT(DOW FROM v_hoje)::INTEGER + 1;
  IF EXTRACT(DOW FROM v_hoje) = 0 THEN
    v_inicio_semana := v_hoje - 6;
  END IF;
  
  -- Calcular início do mês
  v_inicio_mes := DATE_TRUNC('month', v_hoje)::DATE;
  
  -- Buscar uso diário
  SELECT COALESCE(SUM(qtd_perguntas), 0) INTO v_usage_diario
  FROM public.oraculo_usage
  WHERE user_id = p_user_id
    AND periodo_tipo = 'diario'
    AND periodo_inicio = v_hoje;
  
  -- Buscar uso semanal
  SELECT COALESCE(SUM(qtd_perguntas), 0) INTO v_usage_semanal
  FROM public.oraculo_usage
  WHERE user_id = p_user_id
    AND periodo_tipo = 'semanal'
    AND periodo_inicio = v_inicio_semana;
  
  -- Buscar uso mensal
  SELECT COALESCE(SUM(qtd_perguntas), 0) INTO v_usage_mensal
  FROM public.oraculo_usage
  WHERE user_id = p_user_id
    AND periodo_tipo = 'mensal'
    AND periodo_inicio = v_inicio_mes;
  
  -- Verificar limites
  IF v_settings.limite_diario IS NOT NULL AND v_usage_diario >= v_settings.limite_diario THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Limite diário atingido',
      'limite', v_settings.limite_diario,
      'usado', v_usage_diario,
      'reset', 'amanhã'
    );
  END IF;
  
  IF v_settings.limite_semanal IS NOT NULL AND v_usage_semanal >= v_settings.limite_semanal THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Limite semanal atingido',
      'limite', v_settings.limite_semanal,
      'usado', v_usage_semanal,
      'reset', 'próxima semana'
    );
  END IF;
  
  IF v_settings.limite_mensal IS NOT NULL AND v_usage_mensal >= v_settings.limite_mensal THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Limite mensal atingido',
      'limite', v_settings.limite_mensal,
      'usado', v_usage_mensal,
      'reset', 'próximo mês'
    );
  END IF;
  
  -- Pode usar!
  RETURN jsonb_build_object(
    'allowed', true,
    'status', v_settings.status,
    'modelo', v_settings.modelo_ia,
    'uso_diario', v_usage_diario,
    'limite_diario', v_settings.limite_diario,
    'uso_semanal', v_usage_semanal,
    'limite_semanal', v_settings.limite_semanal,
    'uso_mensal', v_usage_mensal,
    'limite_mensal', v_settings.limite_mensal
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: Registrar uso do Oráculo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.register_oraculo_usage(
  p_user_id UUID,
  p_user_role TEXT,
  p_plan_slug TEXT
) RETURNS VOID AS $$
DECLARE
  v_hoje DATE := CURRENT_DATE;
  v_inicio_semana DATE;
  v_inicio_mes DATE;
  v_fim_semana DATE;
  v_fim_mes DATE;
BEGIN
  -- Calcular períodos
  v_inicio_semana := v_hoje - EXTRACT(DOW FROM v_hoje)::INTEGER + 1;
  IF EXTRACT(DOW FROM v_hoje) = 0 THEN
    v_inicio_semana := v_hoje - 6;
  END IF;
  v_fim_semana := v_inicio_semana + 6;
  
  v_inicio_mes := DATE_TRUNC('month', v_hoje)::DATE;
  v_fim_mes := (DATE_TRUNC('month', v_hoje) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Upsert uso diário
  INSERT INTO public.oraculo_usage (user_id, user_role, plan_slug, periodo_tipo, periodo_inicio, periodo_fim, qtd_perguntas)
  VALUES (p_user_id, p_user_role, p_plan_slug, 'diario', v_hoje, v_hoje, 1)
  ON CONFLICT (user_id, periodo_tipo, periodo_inicio)
  DO UPDATE SET qtd_perguntas = oraculo_usage.qtd_perguntas + 1, updated_at = NOW();
  
  -- Upsert uso semanal
  INSERT INTO public.oraculo_usage (user_id, user_role, plan_slug, periodo_tipo, periodo_inicio, periodo_fim, qtd_perguntas)
  VALUES (p_user_id, p_user_role, p_plan_slug, 'semanal', v_inicio_semana, v_fim_semana, 1)
  ON CONFLICT (user_id, periodo_tipo, periodo_inicio)
  DO UPDATE SET qtd_perguntas = oraculo_usage.qtd_perguntas + 1, updated_at = NOW();
  
  -- Upsert uso mensal
  INSERT INTO public.oraculo_usage (user_id, user_role, plan_slug, periodo_tipo, periodo_inicio, periodo_fim, qtd_perguntas)
  VALUES (p_user_id, p_user_role, p_plan_slug, 'mensal', v_inicio_mes, v_fim_mes, 1)
  ON CONFLICT (user_id, periodo_tipo, periodo_inicio)
  DO UPDATE SET qtd_perguntas = oraculo_usage.qtd_perguntas + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DADOS INICIAIS: Configurações padrão
-- ============================================================================

-- Admin sempre tem acesso completo
INSERT INTO public.oraculo_plan_settings (plan_slug, user_role, status, descricao)
VALUES 
  ('free', 'admin', 2, 'Admin sempre tem acesso completo'),
  ('essencial', 'admin', 2, 'Admin sempre tem acesso completo'),
  ('premium', 'admin', 2, 'Admin sempre tem acesso completo'),
  ('profissional', 'admin', 2, 'Admin sempre tem acesso completo'),
  ('enterprise', 'admin', 2, 'Admin sempre tem acesso completo')
ON CONFLICT (plan_slug, user_role) DO NOTHING;

-- Configurações iniciais para outros perfis (desabilitado por padrão)
-- O admin pode habilitar via painel
INSERT INTO public.oraculo_plan_settings (plan_slug, user_role, status, limite_diario, limite_semanal, limite_mensal, descricao)
VALUES 
  -- Usuária
  ('free', 'usuaria', 0, 3, 10, 30, 'Usuária free - desabilitado por padrão'),
  ('essencial', 'usuaria', 0, 5, 20, 60, 'Usuária essencial - desabilitado por padrão'),
  ('premium', 'usuaria', 0, 10, 50, 150, 'Usuária premium - desabilitado por padrão'),
  
  -- Profissional
  ('profissional', 'profissional', 0, 20, 100, 300, 'Profissional - desabilitado por padrão'),
  ('enterprise', 'profissional', 0, NULL, NULL, NULL, 'Profissional enterprise - sem limites'),
  
  -- Whitelabel
  ('enterprise', 'whitelabel', 0, NULL, NULL, NULL, 'Whitelabel enterprise - sem limites'),
  
  -- Dev
  ('enterprise', 'dev', 0, 50, 200, 500, 'Dev enterprise - limites altos')
ON CONFLICT (plan_slug, user_role) DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.oraculo_plan_settings IS 'Configurações do Oráculo V2 por plano e perfil';
COMMENT ON COLUMN public.oraculo_plan_settings.status IS '0=desativado, 1=modo teste, 2=modo completo';
COMMENT ON TABLE public.oraculo_usage IS 'Registro de uso do Oráculo por usuário e período';
COMMENT ON FUNCTION public.can_use_oraculo IS 'Verifica se usuário pode usar o Oráculo baseado em plano/perfil/limites';
COMMENT ON FUNCTION public.register_oraculo_usage IS 'Registra uso do Oráculo incrementando contadores';
