-- ============================================================================
-- ETAPA 32 - MATRIZ ORÁCULO MULTI-INSTÂNCIA
-- ============================================================================

-- TABELA: oraculo_instances
CREATE TABLE IF NOT EXISTS oraculo_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_slug VARCHAR(50) UNIQUE NOT NULL,
  instance_name VARCHAR(100) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active',
  modelo_ia VARCHAR(50) DEFAULT 'gpt-4o-mini',
  temperatura DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  prompt_base_override TEXT,
  prompt_adicional TEXT,
  nome_assistente VARCHAR(50) DEFAULT 'Oráculo',
  tom_comunicacao VARCHAR(30) DEFAULT 'acolhedor',
  cor_primaria VARCHAR(7) DEFAULT '#8B5CF6',
  cor_secundaria VARCHAR(7) DEFAULT '#6366F1',
  logo_url TEXT,
  limite_diario_global INTEGER,
  limite_mensal_global INTEGER,
  features_enabled JSONB DEFAULT '{"analise": true, "sugestao": true, "alerta": true, "explicacao": true}'::jsonb,
  contexto_produto TEXT,
  contexto_empresa TEXT,
  dominios_permitidos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: oraculo_instance_roles
CREATE TABLE IF NOT EXISTS oraculo_instance_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  user_role VARCHAR(30) NOT NULL,
  status INTEGER DEFAULT 1,
  limite_diario INTEGER,
  limite_semanal INTEGER,
  limite_mensal INTEGER,
  modelo_ia_override VARCHAR(50),
  temperatura_override DECIMAL(2,1),
  max_tokens_override INTEGER,
  prompt_perfil TEXT,
  features_override JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, user_role)
);

-- TABELA: oraculo_instance_usage
CREATE TABLE IF NOT EXISTS oraculo_instance_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES oraculo_instances(id) ON DELETE CASCADE,
  periodo_tipo VARCHAR(20) NOT NULL,
  periodo_inicio DATE NOT NULL,
  total_perguntas INTEGER DEFAULT 0,
  total_tokens_input INTEGER DEFAULT 0,
  total_tokens_output INTEGER DEFAULT 0,
  custo_estimado_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(instance_id, periodo_tipo, periodo_inicio)
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_oi_owner ON oraculo_instances(owner_id);
CREATE INDEX IF NOT EXISTS idx_oi_status ON oraculo_instances(status);
CREATE INDEX IF NOT EXISTS idx_oir_instance ON oraculo_instance_roles(instance_id);
CREATE INDEX IF NOT EXISTS idx_oiu_instance ON oraculo_instance_usage(instance_id);

-- ============================================================================
-- RLS (Row Level Security) - CRÍTICO PARA MULTI-INSTÂNCIA
-- ============================================================================

ALTER TABLE oraculo_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_instance_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oraculo_instance_usage ENABLE ROW LEVEL SECURITY;

-- Política: Admin global vê todas as instâncias
DROP POLICY IF EXISTS "Admin global can manage all instances" ON oraculo_instances;
CREATE POLICY "Admin global can manage all instances" ON oraculo_instances
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Política: Owner vê apenas sua instância
DROP POLICY IF EXISTS "Owner can view own instance" ON oraculo_instances;
CREATE POLICY "Owner can view own instance" ON oraculo_instances
  FOR SELECT
  USING (owner_id = auth.uid());

-- Política: Owner pode atualizar sua instância
DROP POLICY IF EXISTS "Owner can update own instance" ON oraculo_instances;
CREATE POLICY "Owner can update own instance" ON oraculo_instances
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Política: Roles - Admin global gerencia todas
DROP POLICY IF EXISTS "Admin global can manage all roles" ON oraculo_instance_roles;
CREATE POLICY "Admin global can manage all roles" ON oraculo_instance_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Política: Owner pode gerenciar roles da sua instância
DROP POLICY IF EXISTS "Owner can manage own instance roles" ON oraculo_instance_roles;
CREATE POLICY "Owner can manage own instance roles" ON oraculo_instance_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM oraculo_instances
      WHERE oraculo_instances.id = oraculo_instance_roles.instance_id
      AND oraculo_instances.owner_id = auth.uid()
    )
  );

-- Política: Usage - Admin global vê tudo
DROP POLICY IF EXISTS "Admin global can view all usage" ON oraculo_instance_usage;
CREATE POLICY "Admin global can view all usage" ON oraculo_instance_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Política: Owner pode ver uso da sua instância
DROP POLICY IF EXISTS "Owner can view own instance usage" ON oraculo_instance_usage;
CREATE POLICY "Owner can view own instance usage" ON oraculo_instance_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM oraculo_instances
      WHERE oraculo_instances.id = oraculo_instance_usage.instance_id
      AND oraculo_instances.owner_id = auth.uid()
    )
  );

-- Service role pode inserir/atualizar usage
DROP POLICY IF EXISTS "Service role can manage usage" ON oraculo_instance_usage;
CREATE POLICY "Service role can manage usage" ON oraculo_instance_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNÇÃO: get_instance_config (para lib/oraculo-instances.ts)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_instance_config(
  p_instance_slug TEXT,
  p_user_role TEXT
) RETURNS JSONB AS $$
DECLARE
  v_instance RECORD;
  v_role RECORD;
BEGIN
  -- Buscar instância
  SELECT * INTO v_instance
  FROM oraculo_instances
  WHERE instance_slug = p_instance_slug
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Instância não encontrada');
  END IF;
  
  -- Buscar role
  SELECT * INTO v_role
  FROM oraculo_instance_roles
  WHERE instance_id = v_instance.id
    AND user_role = p_user_role;
  
  -- Retornar config completa
  RETURN jsonb_build_object(
    'instance_id', v_instance.id,
    'instance_slug', v_instance.instance_slug,
    'instance_name', v_instance.instance_name,
    'modelo_ia', COALESCE(v_role.modelo_ia_override, v_instance.modelo_ia),
    'temperatura', COALESCE(v_role.temperatura_override, v_instance.temperatura),
    'max_tokens', COALESCE(v_role.max_tokens_override, v_instance.max_tokens),
    'nome_assistente', v_instance.nome_assistente,
    'tom_comunicacao', v_instance.tom_comunicacao,
    'cor_primaria', v_instance.cor_primaria,
    'cor_secundaria', v_instance.cor_secundaria,
    'prompt_base_override', v_instance.prompt_base_override,
    'prompt_adicional', v_instance.prompt_adicional,
    'prompt_perfil', v_role.prompt_perfil,
    'contexto_produto', v_instance.contexto_produto,
    'contexto_empresa', v_instance.contexto_empresa,
    'features_enabled', COALESCE(v_role.features_override, v_instance.features_enabled),
    'limite_diario', v_role.limite_diario,
    'limite_semanal', v_role.limite_semanal,
    'limite_mensal', v_role.limite_mensal,
    'role_status', COALESCE(v_role.status, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: register_instance_usage
-- ============================================================================

CREATE OR REPLACE FUNCTION public.register_instance_usage(
  p_instance_id UUID,
  p_tokens_input INTEGER,
  p_tokens_output INTEGER
) RETURNS VOID AS $$
DECLARE
  v_hoje DATE := CURRENT_DATE;
  v_inicio_semana DATE;
  v_inicio_mes DATE;
  v_custo_cents INTEGER;
BEGIN
  -- Calcular custo estimado (GPT-4o-mini: $0.15/1M input, $0.60/1M output)
  v_custo_cents := ((p_tokens_input * 0.015) + (p_tokens_output * 0.06))::INTEGER;
  
  -- Calcular início da semana
  v_inicio_semana := v_hoje - EXTRACT(DOW FROM v_hoje)::INTEGER + 1;
  IF EXTRACT(DOW FROM v_hoje) = 0 THEN
    v_inicio_semana := v_hoje - 6;
  END IF;
  
  -- Calcular início do mês
  v_inicio_mes := DATE_TRUNC('month', v_hoje)::DATE;
  
  -- Upsert uso diário
  INSERT INTO oraculo_instance_usage (instance_id, periodo_tipo, periodo_inicio, total_perguntas, total_tokens_input, total_tokens_output, custo_estimado_cents)
  VALUES (p_instance_id, 'diario', v_hoje, 1, p_tokens_input, p_tokens_output, v_custo_cents)
  ON CONFLICT (instance_id, periodo_tipo, periodo_inicio)
  DO UPDATE SET 
    total_perguntas = oraculo_instance_usage.total_perguntas + 1,
    total_tokens_input = oraculo_instance_usage.total_tokens_input + p_tokens_input,
    total_tokens_output = oraculo_instance_usage.total_tokens_output + p_tokens_output,
    custo_estimado_cents = oraculo_instance_usage.custo_estimado_cents + v_custo_cents,
    updated_at = NOW();
  
  -- Upsert uso semanal
  INSERT INTO oraculo_instance_usage (instance_id, periodo_tipo, periodo_inicio, total_perguntas, total_tokens_input, total_tokens_output, custo_estimado_cents)
  VALUES (p_instance_id, 'semanal', v_inicio_semana, 1, p_tokens_input, p_tokens_output, v_custo_cents)
  ON CONFLICT (instance_id, periodo_tipo, periodo_inicio)
  DO UPDATE SET 
    total_perguntas = oraculo_instance_usage.total_perguntas + 1,
    total_tokens_input = oraculo_instance_usage.total_tokens_input + p_tokens_input,
    total_tokens_output = oraculo_instance_usage.total_tokens_output + p_tokens_output,
    custo_estimado_cents = oraculo_instance_usage.custo_estimado_cents + v_custo_cents,
    updated_at = NOW();
  
  -- Upsert uso mensal
  INSERT INTO oraculo_instance_usage (instance_id, periodo_tipo, periodo_inicio, total_perguntas, total_tokens_input, total_tokens_output, custo_estimado_cents)
  VALUES (p_instance_id, 'mensal', v_inicio_mes, 1, p_tokens_input, p_tokens_output, v_custo_cents)
  ON CONFLICT (instance_id, periodo_tipo, periodo_inicio)
  DO UPDATE SET 
    total_perguntas = oraculo_instance_usage.total_perguntas + 1,
    total_tokens_input = oraculo_instance_usage.total_tokens_input + p_tokens_input,
    total_tokens_output = oraculo_instance_usage.total_tokens_output + p_tokens_output,
    custo_estimado_cents = oraculo_instance_usage.custo_estimado_cents + v_custo_cents,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE oraculo_instances IS 'Instâncias do Oráculo para multi-tenant (whitelabel, SaaS gerado)';
COMMENT ON TABLE oraculo_instance_roles IS 'Configurações de perfil por instância';
COMMENT ON TABLE oraculo_instance_usage IS 'Uso do Oráculo por instância e período';
COMMENT ON FUNCTION public.get_instance_config IS 'Retorna configuração completa de uma instância para um perfil';
COMMENT ON FUNCTION public.register_instance_usage IS 'Registra uso do Oráculo por instância';

-- ============================================================================
-- INSTÂNCIA PADRÃO (Radar Narcisista)
-- ============================================================================

INSERT INTO oraculo_instances (instance_slug, instance_name, contexto_produto)
VALUES ('radar-narcisista', 'Radar Narcisista', 'SaaS brasileiro de apoio a vítimas de relacionamentos abusivos')
ON CONFLICT (instance_slug) DO NOTHING;

-- Roles padrão para a instância Radar Narcisista
INSERT INTO oraculo_instance_roles (instance_id, user_role, status, limite_diario, limite_semanal, limite_mensal)
SELECT id, 'admin', 2, NULL, NULL, NULL FROM oraculo_instances WHERE instance_slug = 'radar-narcisista'
ON CONFLICT (instance_id, user_role) DO NOTHING;

INSERT INTO oraculo_instance_roles (instance_id, user_role, status, limite_diario, limite_semanal, limite_mensal)
SELECT id, 'usuaria', 0, 5, 20, 60 FROM oraculo_instances WHERE instance_slug = 'radar-narcisista'
ON CONFLICT (instance_id, user_role) DO NOTHING;

INSERT INTO oraculo_instance_roles (instance_id, user_role, status, limite_diario, limite_semanal, limite_mensal)
SELECT id, 'profissional', 0, 10, 50, 150 FROM oraculo_instances WHERE instance_slug = 'radar-narcisista'
ON CONFLICT (instance_id, user_role) DO NOTHING;
