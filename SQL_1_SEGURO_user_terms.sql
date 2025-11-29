-- ============================================================================
-- SQL 1 - user_terms_acceptance (SEGURO - NÃO SOBRESCREVE)
-- ============================================================================
-- Criar tabela (só se não existir)
CREATE TABLE IF NOT EXISTS public.user_terms_acceptance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    context VARCHAR(50), -- 'chat', 'diario', 'geral', etc.
    ip_hash VARCHAR(64), -- Hash do IP para auditoria (não o IP real)
    user_agent TEXT, -- Navegador/dispositivo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir um aceite por usuário (pode ter múltiplos por versão)
    CONSTRAINT unique_user_terms UNIQUE (user_id, terms_version)
);

-- Índices para performance (só se não existirem)
CREATE INDEX IF NOT EXISTS idx_user_terms_user_id ON public.user_terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_terms_accepted_at ON public.user_terms_acceptance(accepted_at);
CREATE INDEX IF NOT EXISTS idx_user_terms_version ON public.user_terms_acceptance(terms_version);

-- RLS (Row Level Security)
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Políticas (só se não existirem)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own terms acceptance' AND tablename = 'user_terms_acceptance') THEN
        CREATE POLICY "Users can view own terms acceptance" 
            ON public.user_terms_acceptance 
            FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own terms acceptance' AND tablename = 'user_terms_acceptance') THEN
        CREATE POLICY "Users can insert own terms acceptance" 
            ON public.user_terms_acceptance 
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own terms acceptance' AND tablename = 'user_terms_acceptance') THEN
        CREATE POLICY "Users can update own terms acceptance" 
            ON public.user_terms_acceptance 
            FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE public.user_terms_acceptance IS 'Registra aceite dos termos de responsabilidade pelos usuários';
COMMENT ON COLUMN public.user_terms_acceptance.terms_version IS 'Versão dos termos aceitos (ex: 1.0, 1.1, 2.0)';
COMMENT ON COLUMN public.user_terms_acceptance.context IS 'Contexto onde o aceite foi feito (chat, diario, geral)';
COMMENT ON COLUMN public.user_terms_acceptance.ip_hash IS 'Hash SHA-256 do IP do usuário para auditoria';
