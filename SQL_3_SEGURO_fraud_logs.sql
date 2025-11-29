-- ============================================================================
-- SQL 3 - fraud_suspicion_logs (SEGURO - NÃO SOBRESCREVE)
-- ============================================================================

-- TABELA: LOGS DE SUSPEITA DE FRAUDE
CREATE TABLE IF NOT EXISTS public.fraud_suspicion_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referências
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,  -- ID da sessão de chat (se aplicável)
    
    -- Tipo de suspeita detectada
    suspicion_type TEXT NOT NULL,  -- 'inconsistency', 'fabrication', 'revenge', 'manipulation', 'excessive_accusation'
    
    -- Severidade (1-5)
    severity INTEGER NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
    
    -- Descrição da suspeita
    description TEXT NOT NULL,
    
    -- Contexto que gerou a suspeita
    context JSONB NOT NULL DEFAULT '{}',
    -- Exemplo: { "message": "texto da mensagem", "previous_messages": [...], "detected_flags": [...] }
    
    -- Ação tomada pela IA
    ai_action TEXT,  -- 'questioned', 'redirected', 'warned', 'refused'
    
    -- Resposta da IA que foi dada
    ai_response_excerpt TEXT,
    
    -- Se foi resolvido/esclarecido posteriormente
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Metadados
    ip_hash TEXT,  -- Hash do IP para LGPD
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance e busca
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user ON public.fraud_suspicion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_type ON public.fraud_suspicion_logs(suspicion_type);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_severity ON public.fraud_suspicion_logs(severity DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_date ON public.fraud_suspicion_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_unresolved ON public.fraud_suspicion_logs(resolved) WHERE resolved = false;

-- RLS (Row Level Security)
ALTER TABLE public.fraud_suspicion_logs ENABLE ROW LEVEL SECURITY;

-- Políticas (só se não existirem)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admin can view fraud logs' AND tablename = 'fraud_suspicion_logs') THEN
        CREATE POLICY "Only admin can view fraud logs" 
            ON public.fraud_suspicion_logs 
            FOR SELECT 
            USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert fraud logs' AND tablename = 'fraud_suspicion_logs') THEN
        CREATE POLICY "System can insert fraud logs" 
            ON public.fraud_suspicion_logs 
            FOR INSERT 
            WITH CHECK (true);
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE public.fraud_suspicion_logs IS 'Registra suspeitas de fraude/inconsistência detectadas pela IA';
COMMENT ON COLUMN public.fraud_suspicion_logs.suspicion_type IS 'Tipos: inconsistency, fabrication, revenge, manipulation, excessive_accusation, zero_self_criticism';
COMMENT ON COLUMN public.fraud_suspicion_logs.severity IS '1=leve (questionamento), 2=moderada, 3=significativa, 4=grave, 5=crítica (recusa)';

-- FUNÇÃO PARA REGISTRAR SUSPEITA (só se não existir)
CREATE OR REPLACE FUNCTION public.log_fraud_suspicion(
    p_user_id UUID,
    p_session_id UUID,
    p_suspicion_type TEXT,
    p_severity INTEGER,
    p_description TEXT,
    p_context JSONB,
    p_ai_action TEXT,
    p_ai_response_excerpt TEXT,
    p_ip_hash TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.fraud_suspicion_logs (
        user_id,
        session_id,
        suspicion_type,
        severity,
        description,
        context,
        ai_action,
        ai_response_excerpt,
        ip_hash,
        user_agent
    ) VALUES (
        p_user_id,
        p_session_id,
        p_suspicion_type,
        p_severity,
        p_description,
        p_context,
        p_ai_action,
        p_ai_response_excerpt,
        p_ip_hash,
        p_user_agent
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- VIEW PARA ADMIN: RESUMO DE SUSPEITAS POR USUÁRIO (só se não existir)
DROP VIEW IF EXISTS public.fraud_suspicion_summary;

CREATE OR REPLACE VIEW public.fraud_suspicion_summary AS
SELECT 
    user_id,
    COUNT(*) as total_suspicions,
    COUNT(*) FILTER (WHERE severity >= 3) as high_severity_count,
    MAX(severity) as max_severity,
    array_agg(DISTINCT suspicion_type) as suspicion_types,
    MAX(created_at) as last_suspicion_at,
    COUNT(*) FILTER (WHERE resolved = false) as unresolved_count
FROM public.fraud_suspicion_logs
GROUP BY user_id;
