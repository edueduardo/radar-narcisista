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

-- INSTÂNCIA PADRÃO (Radar Narcisista)
INSERT INTO oraculo_instances (instance_slug, instance_name, contexto_produto)
VALUES ('radar-narcisista', 'Radar Narcisista', 'SaaS brasileiro de apoio a vítimas de relacionamentos abusivos')
ON CONFLICT (instance_slug) DO NOTHING;
