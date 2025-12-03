-- ============================================================================
-- MIGRATION: Sistema de Impersonação com Auditoria
-- ETAPA 36 - BLOCO 36-40
-- Criado em: 02/12/2025
-- ============================================================================
-- 
-- Este módulo permite que ADMIN veja o sistema como outro usuário
-- para fins de suporte, mantendo auditoria completa.
-- 
-- MÓDULO CORE: SUPORTE_VER_COMO_CORE
-- ============================================================================

-- ============================================================================
-- TABELA: support_impersonation_sessions
-- Sessões de impersonação (admin vendo como outro usuário)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem está impersonando
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  
  -- Quem está sendo impersonado
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_email TEXT NOT NULL,
  target_user_role TEXT NOT NULL,                 -- role do usuário alvo (usuaria, profissional, etc.)
  
  -- Contexto da sessão
  motivo TEXT NOT NULL,                           -- motivo da impersonação (obrigatório)
  ticket_id UUID,                                 -- referência a ticket de suporte, se houver
  
  -- Dados técnicos
  ip_admin TEXT,
  user_agent TEXT,
  
  -- Status da sessão
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada', 'expirada')),
  
  -- Timestamps
  inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim TIMESTAMPTZ,
  duracao_segundos INTEGER,
  
  -- Metadados
  acoes_realizadas JSONB DEFAULT '[]',            -- log resumido de ações
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON public.support_impersonation_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_target ON public.support_impersonation_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_status ON public.support_impersonation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_impersonation_inicio ON public.support_impersonation_sessions(inicio DESC);

-- ============================================================================
-- TABELA: support_impersonation_logs
-- Log detalhado de ações durante impersonação
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.support_impersonation_sessions(id) ON DELETE CASCADE,
  
  -- Ação realizada
  tipo_acao TEXT NOT NULL,                        -- ex: 'page_view', 'api_call', 'form_submit'
  descricao TEXT NOT NULL,
  
  -- Contexto
  url TEXT,
  metodo TEXT,                                    -- GET, POST, etc.
  dados_resumidos JSONB DEFAULT '{}',             -- dados sem info sensível
  
  -- Resultado
  sucesso BOOLEAN DEFAULT true,
  erro TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_session ON public.support_impersonation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_tipo ON public.support_impersonation_logs(tipo_acao);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_created ON public.support_impersonation_logs(created_at DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.support_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Apenas ADMIN pode ver sessões de impersonação
DROP POLICY IF EXISTS "Admin can manage impersonation sessions" ON public.support_impersonation_sessions;
CREATE POLICY "Admin can manage impersonation sessions" ON public.support_impersonation_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Apenas ADMIN pode ver logs de impersonação
DROP POLICY IF EXISTS "Admin can view impersonation logs" ON public.support_impersonation_logs;
CREATE POLICY "Admin can view impersonation logs" ON public.support_impersonation_logs
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

-- Função para iniciar sessão de impersonação
CREATE OR REPLACE FUNCTION public.start_impersonation_session(
  p_admin_id UUID,
  p_admin_email TEXT,
  p_target_user_id UUID,
  p_target_user_email TEXT,
  p_target_user_role TEXT,
  p_motivo TEXT,
  p_ip_admin TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ticket_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Verificar se admin tem permissão
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = p_admin_id
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  ) THEN
    RAISE EXCEPTION 'Usuário não tem permissão para impersonar';
  END IF;
  
  -- Verificar se já existe sessão ativa para este admin
  UPDATE public.support_impersonation_sessions
  SET status = 'encerrada',
      fim = NOW(),
      duracao_segundos = EXTRACT(EPOCH FROM (NOW() - inicio))::INTEGER
  WHERE admin_id = p_admin_id
    AND status = 'ativa';
  
  -- Criar nova sessão
  INSERT INTO public.support_impersonation_sessions (
    admin_id,
    admin_email,
    target_user_id,
    target_user_email,
    target_user_role,
    motivo,
    ip_admin,
    user_agent,
    ticket_id
  ) VALUES (
    p_admin_id,
    p_admin_email,
    p_target_user_id,
    p_target_user_email,
    p_target_user_role,
    p_motivo,
    p_ip_admin,
    p_user_agent,
    p_ticket_id
  )
  RETURNING id INTO v_session_id;
  
  -- Log inicial
  INSERT INTO public.support_impersonation_logs (
    session_id,
    tipo_acao,
    descricao
  ) VALUES (
    v_session_id,
    'session_start',
    'Sessão de impersonação iniciada'
  );
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para encerrar sessão de impersonação
CREATE OR REPLACE FUNCTION public.end_impersonation_session(
  p_session_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.support_impersonation_sessions
  SET status = 'encerrada',
      fim = NOW(),
      duracao_segundos = EXTRACT(EPOCH FROM (NOW() - inicio))::INTEGER
  WHERE id = p_session_id
    AND status = 'ativa';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log de encerramento
  INSERT INTO public.support_impersonation_logs (
    session_id,
    tipo_acao,
    descricao
  ) VALUES (
    p_session_id,
    'session_end',
    'Sessão de impersonação encerrada'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar ação durante impersonação
CREATE OR REPLACE FUNCTION public.log_impersonation_action(
  p_session_id UUID,
  p_tipo_acao TEXT,
  p_descricao TEXT,
  p_url TEXT DEFAULT NULL,
  p_metodo TEXT DEFAULT NULL,
  p_dados_resumidos JSONB DEFAULT '{}',
  p_sucesso BOOLEAN DEFAULT true,
  p_erro TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.support_impersonation_logs (
    session_id,
    tipo_acao,
    descricao,
    url,
    metodo,
    dados_resumidos,
    sucesso,
    erro
  ) VALUES (
    p_session_id,
    p_tipo_acao,
    p_descricao,
    p_url,
    p_metodo,
    p_dados_resumidos,
    p_sucesso,
    p_erro
  )
  RETURNING id INTO v_log_id;
  
  -- Atualizar contador de ações na sessão
  UPDATE public.support_impersonation_sessions
  SET acoes_realizadas = acoes_realizadas || jsonb_build_object(
    'tipo', p_tipo_acao,
    'descricao', p_descricao,
    'timestamp', NOW()
  )
  WHERE id = p_session_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter sessão ativa de um admin
CREATE OR REPLACE FUNCTION public.get_active_impersonation_session(p_admin_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_session JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', s.id,
    'target_user_id', s.target_user_id,
    'target_user_email', s.target_user_email,
    'target_user_role', s.target_user_role,
    'motivo', s.motivo,
    'inicio', s.inicio
  ) INTO v_session
  FROM public.support_impersonation_sessions s
  WHERE s.admin_id = p_admin_id
    AND s.status = 'ativa'
  ORDER BY s.inicio DESC
  LIMIT 1;
  
  RETURN v_session;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para listar sessões recentes
CREATE OR REPLACE FUNCTION public.list_impersonation_sessions(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_admin_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  admin_id UUID,
  admin_email TEXT,
  target_user_id UUID,
  target_user_email TEXT,
  target_user_role TEXT,
  motivo TEXT,
  status TEXT,
  inicio TIMESTAMPTZ,
  fim TIMESTAMPTZ,
  duracao_segundos INTEGER,
  total_acoes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.admin_id,
    s.admin_email,
    s.target_user_id,
    s.target_user_email,
    s.target_user_role,
    s.motivo,
    s.status,
    s.inicio,
    s.fim,
    s.duracao_segundos,
    (SELECT COUNT(*) FROM public.support_impersonation_logs l WHERE l.session_id = s.id) as total_acoes
  FROM public.support_impersonation_sessions s
  WHERE 
    (p_admin_id IS NULL OR s.admin_id = p_admin_id)
    AND (p_target_user_id IS NULL OR s.target_user_id = p_target_user_id)
    AND (p_status IS NULL OR s.status = p_status)
  ORDER BY s.inicio DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- JOB: Expirar sessões antigas (rodar via cron ou trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.expire_old_impersonation_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.support_impersonation_sessions
  SET status = 'expirada',
      fim = NOW(),
      duracao_segundos = EXTRACT(EPOCH FROM (NOW() - inicio))::INTEGER
  WHERE status = 'ativa'
    AND inicio < NOW() - INTERVAL '2 hours';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.support_impersonation_sessions IS 'Sessões de impersonação - admin vendo como outro usuário para suporte';
COMMENT ON TABLE public.support_impersonation_logs IS 'Log detalhado de ações durante sessões de impersonação';

COMMENT ON FUNCTION public.start_impersonation_session IS 'Inicia uma sessão de impersonação com auditoria';
COMMENT ON FUNCTION public.end_impersonation_session IS 'Encerra uma sessão de impersonação';
COMMENT ON FUNCTION public.log_impersonation_action IS 'Registra ação durante impersonação';
COMMENT ON FUNCTION public.get_active_impersonation_session IS 'Retorna sessão ativa de um admin';
COMMENT ON FUNCTION public.list_impersonation_sessions IS 'Lista sessões de impersonação com filtros';
