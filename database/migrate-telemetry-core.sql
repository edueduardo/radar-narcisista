-- ============================================================================
-- MIGRATION: Telemetria Core - Monitoramento Global de Projetos
-- ETAPA 33 - BLOCO 32-35
-- Criado em: 02/12/2025
-- ============================================================================

-- ============================================================================
-- TABELA: telemetry_heartbeats_core
-- Heartbeats de todos os projetos do ecossistema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.telemetry_heartbeats_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_core(id) ON DELETE CASCADE,
  core_version TEXT NOT NULL,                     -- versão do core que enviou
  ambiente TEXT NOT NULL CHECK (ambiente IN ('dev', 'staging', 'prod')),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  
  -- Métricas resumidas
  info_resumida JSONB DEFAULT '{}',               -- dados agregados (usuários ativos, rotas mais usadas, etc.)
  
  -- Métricas de performance
  latency_ms INTEGER,                             -- latência média
  memory_usage_mb INTEGER,                        -- uso de memória
  cpu_usage_percent DECIMAL(5,2),                 -- uso de CPU
  
  -- Contadores
  requests_last_hour INTEGER DEFAULT 0,
  errors_last_hour INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_telemetry_heartbeats_project ON public.telemetry_heartbeats_core(project_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_heartbeats_status ON public.telemetry_heartbeats_core(status);
CREATE INDEX IF NOT EXISTS idx_telemetry_heartbeats_created ON public.telemetry_heartbeats_core(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_heartbeats_ambiente ON public.telemetry_heartbeats_core(ambiente);

-- ============================================================================
-- TABELA: telemetry_errors_core
-- Erros reportados por todos os projetos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.telemetry_errors_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_core(id) ON DELETE CASCADE,
  tipo_erro TEXT NOT NULL CHECK (tipo_erro IN ('api', 'banco', 'third_party', 'front_end', 'auth', 'unknown')),
  codigo_erro TEXT,                               -- código do erro (ex: 500, ECONNREFUSED)
  mensagem_resumida TEXT NOT NULL,                -- mensagem sem dados sensíveis
  
  -- Contexto (sem dados sensíveis!)
  contexto JSONB DEFAULT '{}',                    -- rota, método, user_agent, etc.
  
  -- Severidade
  nivel_severidade TEXT NOT NULL CHECK (nivel_severidade IN ('baixo', 'medio', 'alto', 'critico')),
  
  -- Agrupamento
  error_hash TEXT,                                -- hash para agrupar erros similares
  ocorrencias INTEGER DEFAULT 1,                  -- quantas vezes esse erro ocorreu
  
  -- Status de resolução
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMPTZ,
  notas_resolucao TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_project ON public.telemetry_errors_core(project_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_tipo ON public.telemetry_errors_core(tipo_erro);
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_severidade ON public.telemetry_errors_core(nivel_severidade);
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_created ON public.telemetry_errors_core(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_hash ON public.telemetry_errors_core(error_hash);
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_resolvido ON public.telemetry_errors_core(resolvido);

-- ============================================================================
-- TABELA: telemetry_metrics_core
-- Métricas agregadas por período
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.telemetry_metrics_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_core(id) ON DELETE CASCADE,
  periodo_tipo TEXT NOT NULL CHECK (periodo_tipo IN ('hora', 'dia', 'semana', 'mes')),
  periodo_inicio TIMESTAMPTZ NOT NULL,
  periodo_fim TIMESTAMPTZ NOT NULL,
  
  -- Métricas
  total_requests INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  total_users_ativos INTEGER DEFAULT 0,
  avg_latency_ms DECIMAL(10,2),
  max_latency_ms INTEGER,
  
  -- Métricas de negócio (específicas por projeto)
  metricas_negocio JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, periodo_tipo, periodo_inicio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_telemetry_metrics_project ON public.telemetry_metrics_core(project_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_metrics_periodo ON public.telemetry_metrics_core(periodo_tipo, periodo_inicio);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.telemetry_heartbeats_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_errors_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_metrics_core ENABLE ROW LEVEL SECURITY;

-- Apenas super-admin pode ver telemetria
DROP POLICY IF EXISTS "Super admin can view heartbeats" ON public.telemetry_heartbeats_core;
CREATE POLICY "Super admin can view heartbeats" ON public.telemetry_heartbeats_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Super admin can view errors" ON public.telemetry_errors_core;
CREATE POLICY "Super admin can view errors" ON public.telemetry_errors_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Super admin can view metrics" ON public.telemetry_metrics_core;
CREATE POLICY "Super admin can view metrics" ON public.telemetry_metrics_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para registrar heartbeat
CREATE OR REPLACE FUNCTION public.register_heartbeat(
  p_project_id UUID,
  p_core_version TEXT,
  p_ambiente TEXT,
  p_status TEXT,
  p_info_resumida JSONB DEFAULT '{}',
  p_latency_ms INTEGER DEFAULT NULL,
  p_memory_usage_mb INTEGER DEFAULT NULL,
  p_requests_last_hour INTEGER DEFAULT 0,
  p_errors_last_hour INTEGER DEFAULT 0,
  p_active_users INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_heartbeat_id UUID;
BEGIN
  INSERT INTO public.telemetry_heartbeats_core (
    project_id,
    core_version,
    ambiente,
    status,
    info_resumida,
    latency_ms,
    memory_usage_mb,
    requests_last_hour,
    errors_last_hour,
    active_users
  ) VALUES (
    p_project_id,
    p_core_version,
    p_ambiente,
    p_status,
    p_info_resumida,
    p_latency_ms,
    p_memory_usage_mb,
    p_requests_last_hour,
    p_errors_last_hour,
    p_active_users
  )
  RETURNING id INTO v_heartbeat_id;
  
  -- Atualizar última atividade do projeto
  UPDATE public.projects_core
  SET data_ultima_atividade = NOW()
  WHERE id = p_project_id;
  
  RETURN v_heartbeat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar erro
CREATE OR REPLACE FUNCTION public.register_telemetry_error(
  p_project_id UUID,
  p_tipo_erro TEXT,
  p_mensagem_resumida TEXT,
  p_nivel_severidade TEXT,
  p_codigo_erro TEXT DEFAULT NULL,
  p_contexto JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_error_id UUID;
  v_error_hash TEXT;
BEGIN
  -- Gerar hash para agrupar erros similares
  v_error_hash := md5(p_project_id::TEXT || p_tipo_erro || p_mensagem_resumida);
  
  -- Verificar se já existe erro similar nas últimas 24h
  UPDATE public.telemetry_errors_core
  SET ocorrencias = ocorrencias + 1
  WHERE error_hash = v_error_hash
    AND created_at > NOW() - INTERVAL '24 hours'
    AND resolvido = false
  RETURNING id INTO v_error_id;
  
  -- Se não existe, criar novo
  IF v_error_id IS NULL THEN
    INSERT INTO public.telemetry_errors_core (
      project_id,
      tipo_erro,
      codigo_erro,
      mensagem_resumida,
      contexto,
      nivel_severidade,
      error_hash
    ) VALUES (
      p_project_id,
      p_tipo_erro,
      p_codigo_erro,
      p_mensagem_resumida,
      p_contexto,
      p_nivel_severidade,
      v_error_hash
    )
    RETURNING id INTO v_error_id;
  END IF;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter último heartbeat de um projeto
CREATE OR REPLACE FUNCTION public.get_last_heartbeat(p_project_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_heartbeat JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', h.id,
    'status', h.status,
    'ambiente', h.ambiente,
    'core_version', h.core_version,
    'latency_ms', h.latency_ms,
    'active_users', h.active_users,
    'requests_last_hour', h.requests_last_hour,
    'errors_last_hour', h.errors_last_hour,
    'created_at', h.created_at
  ) INTO v_heartbeat
  FROM public.telemetry_heartbeats_core h
  WHERE h.project_id = p_project_id
  ORDER BY h.created_at DESC
  LIMIT 1;
  
  RETURN v_heartbeat;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter resumo de telemetria de todos os projetos
CREATE OR REPLACE FUNCTION public.get_telemetry_summary()
RETURNS TABLE (
  project_id UUID,
  project_slug TEXT,
  project_nome TEXT,
  ultimo_heartbeat TIMESTAMPTZ,
  ultimo_status TEXT,
  total_erros_24h BIGINT,
  erros_criticos_24h BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.slug as project_slug,
    p.nome_publico as project_nome,
    (SELECT MAX(h.created_at) FROM public.telemetry_heartbeats_core h WHERE h.project_id = p.id) as ultimo_heartbeat,
    (SELECT h.status FROM public.telemetry_heartbeats_core h WHERE h.project_id = p.id ORDER BY h.created_at DESC LIMIT 1) as ultimo_status,
    (SELECT COUNT(*) FROM public.telemetry_errors_core e WHERE e.project_id = p.id AND e.created_at > NOW() - INTERVAL '24 hours') as total_erros_24h,
    (SELECT COUNT(*) FROM public.telemetry_errors_core e WHERE e.project_id = p.id AND e.created_at > NOW() - INTERVAL '24 hours' AND e.nivel_severidade = 'critico') as erros_criticos_24h
  FROM public.projects_core p
  WHERE p.status = 'ativo'
  ORDER BY p.nome_publico;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.telemetry_heartbeats_core IS 'Heartbeats de todos os projetos do ecossistema';
COMMENT ON TABLE public.telemetry_errors_core IS 'Erros reportados por todos os projetos (sem dados sensíveis)';
COMMENT ON TABLE public.telemetry_metrics_core IS 'Métricas agregadas por período';

COMMENT ON FUNCTION public.register_heartbeat IS 'Registra heartbeat de um projeto e atualiza última atividade';
COMMENT ON FUNCTION public.register_telemetry_error IS 'Registra erro de telemetria com agrupamento automático';
COMMENT ON FUNCTION public.get_last_heartbeat IS 'Retorna último heartbeat de um projeto';
COMMENT ON FUNCTION public.get_telemetry_summary IS 'Retorna resumo de telemetria de todos os projetos';
