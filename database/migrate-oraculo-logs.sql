-- ============================================================================
-- MIGRATION: oraculo_logs
-- ETAPA 22 - Oráculo V2 Integrado
-- Criado em: 01/12/2025
-- ============================================================================

-- Tabela para registrar todas as chamadas ao Oráculo V2
CREATE TABLE IF NOT EXISTS public.oraculo_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL DEFAULT 'admin',     -- admin, usuaria, profissional, dev, whitelabel
  plan TEXT,                                    -- Plano do usuário
  url_atual TEXT,                               -- Página onde a pergunta foi feita
  question TEXT NOT NULL,                       -- Pergunta do usuário
  
  -- Resposta do Oráculo
  resposta_modo TEXT,                           -- analise, sugestao, alerta, explicacao
  resposta_risco TEXT,                          -- baixo, medio, alto, critico
  resposta_json JSONB,                          -- Resposta completa em JSON
  
  -- Flags e métricas
  flag_risco_alto BOOLEAN DEFAULT FALSE,        -- TRUE se risco = alto ou critico
  tokens_input INTEGER,                         -- Tokens de entrada
  tokens_output INTEGER,                        -- Tokens de saída
  latency_ms INTEGER,                           -- Tempo de resposta em ms
  model_used TEXT,                              -- Modelo de IA usado
  
  -- Metadados
  manual_context TEXT,                          -- Contexto adicional fornecido
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance e análise
CREATE INDEX IF NOT EXISTS idx_oraculo_logs_user_id ON public.oraculo_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_oraculo_logs_user_role ON public.oraculo_logs(user_role);
CREATE INDEX IF NOT EXISTS idx_oraculo_logs_created_at ON public.oraculo_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oraculo_logs_risco_alto ON public.oraculo_logs(flag_risco_alto) WHERE flag_risco_alto = TRUE;
CREATE INDEX IF NOT EXISTS idx_oraculo_logs_modo ON public.oraculo_logs(resposta_modo);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.oraculo_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs (via service_role ou admin check)
DROP POLICY IF EXISTS "Admins can view oraculo logs" ON public.oraculo_logs;
CREATE POLICY "Admins can view oraculo logs" ON public.oraculo_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Política: Service role pode inserir (via API)
DROP POLICY IF EXISTS "Service role can insert logs" ON public.oraculo_logs;
CREATE POLICY "Service role can insert logs" ON public.oraculo_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- VIEWS PARA ANÁLISE
-- ============================================================================

-- View: Resumo de uso do Oráculo por dia
CREATE OR REPLACE VIEW public.oraculo_usage_daily AS
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_chamadas,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  COUNT(*) FILTER (WHERE flag_risco_alto) as alertas_risco,
  AVG(latency_ms) as latencia_media_ms,
  SUM(tokens_input + tokens_output) as tokens_total
FROM public.oraculo_logs
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- View: Perguntas mais frequentes (agrupadas por modo)
CREATE OR REPLACE VIEW public.oraculo_top_questions AS
SELECT 
  resposta_modo,
  COUNT(*) as total,
  (SELECT array_agg(q) FROM (
    SELECT DISTINCT question as q 
    FROM public.oraculo_logs ol2 
    WHERE ol2.resposta_modo = ol.resposta_modo 
    ORDER BY q 
    LIMIT 5
  ) sub) as exemplos
FROM public.oraculo_logs ol
GROUP BY resposta_modo
ORDER BY total DESC;

-- ============================================================================
-- FUNÇÃO: Registrar chamada do Oráculo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_oraculo_call(
  p_user_id UUID,
  p_user_role TEXT,
  p_plan TEXT,
  p_url_atual TEXT,
  p_question TEXT,
  p_resposta_json JSONB,
  p_tokens_input INTEGER DEFAULT NULL,
  p_tokens_output INTEGER DEFAULT NULL,
  p_latency_ms INTEGER DEFAULT NULL,
  p_model_used TEXT DEFAULT NULL,
  p_manual_context TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_modo TEXT;
  v_risco TEXT;
  v_flag_risco BOOLEAN;
BEGIN
  -- Extrair modo e risco do JSON
  v_modo := p_resposta_json->>'modo';
  v_risco := p_resposta_json->>'risco';
  v_flag_risco := v_risco IN ('alto', 'critico');
  
  -- Inserir log
  INSERT INTO public.oraculo_logs (
    user_id, user_role, plan, url_atual, question,
    resposta_modo, resposta_risco, resposta_json, flag_risco_alto,
    tokens_input, tokens_output, latency_ms, model_used, manual_context
  ) VALUES (
    p_user_id, p_user_role, p_plan, p_url_atual, p_question,
    v_modo, v_risco, p_resposta_json, v_flag_risco,
    p_tokens_input, p_tokens_output, p_latency_ms, p_model_used, p_manual_context
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.oraculo_logs IS 'Logs de todas as chamadas ao Oráculo V2';
COMMENT ON COLUMN public.oraculo_logs.user_role IS 'Perfil: admin (BLOCO 21-25), outros perfis em BLOCO 26-30';
COMMENT ON COLUMN public.oraculo_logs.flag_risco_alto IS 'TRUE quando risco = alto ou critico, para alertas';
COMMENT ON VIEW public.oraculo_usage_daily IS 'Resumo de uso diário do Oráculo';