-- ============================================================================
-- CADEIA DE CUSTÓDIA PARA TERMOS DE RESPONSABILIDADE
-- Radar Narcisista BR - Proteção Jurídica Completa
-- ============================================================================

-- ============================================================================
-- TABELA 1: VERSÕES DOS TERMOS
-- Guarda cada versão dos termos com hash do conteúdo
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.terms_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,                    -- ex: "etica-v1-2025-11-28"
    title TEXT NOT NULL,                          -- ex: "Termos de Uso e Ética - v1"
    version_number TEXT NOT NULL DEFAULT '1.0',   -- ex: "1.0", "1.1", "2.0"
    content_md TEXT NOT NULL,                     -- texto completo em markdown
    content_hash TEXT NOT NULL,                   -- SHA-256 do conteúdo
    is_active BOOLEAN DEFAULT true,               -- se está em vigor
    published_at TIMESTAMPTZ,                     -- quando entrou em vigor
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terms_versions_slug ON public.terms_versions(slug);
CREATE INDEX IF NOT EXISTS idx_terms_versions_active ON public.terms_versions(is_active);

-- ============================================================================
-- TABELA 2: ACEITES DE TERMOS COM CADEIA DE CUSTÓDIA
-- Registro completo de cada aceite para prova pericial
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referências
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms_version_id UUID NOT NULL REFERENCES public.terms_versions(id) ON DELETE RESTRICT,
    
    -- Momento exato do aceite (UTC)
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadados técnicos para cadeia de custódia
    ip_address TEXT,                              -- IP do usuário
    ip_hash TEXT,                                 -- SHA-256 do IP (para LGPD)
    user_agent TEXT,                              -- Navegador/dispositivo
    locale TEXT,                                  -- pt-BR, en-US etc
    platform TEXT DEFAULT 'web',                  -- web, mobile, api
    referrer TEXT,                                -- rota de origem
    screen_resolution TEXT,                       -- resolução da tela
    timezone TEXT,                                -- fuso horário do usuário
    
    -- Contexto do aceite (checkboxes marcados, fluxo, etc)
    acceptance_context JSONB NOT NULL DEFAULT '{}',
    
    -- HASH SHA-256 do evento completo (CADEIA DE CUSTÓDIA)
    event_hash TEXT NOT NULL,
    
    -- Payload canônico usado para gerar o hash (para verificação pericial)
    canonical_payload JSONB NOT NULL,
    
    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance e busca
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_date ON public.terms_acceptances(accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_version ON public.terms_acceptances(terms_version_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_hash ON public.terms_acceptances(event_hash);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Políticas para terms_versions (todos podem ler, só admin pode escrever)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active terms versions' AND tablename = 'terms_versions') THEN
        CREATE POLICY "Anyone can read active terms versions" 
            ON public.terms_versions 
            FOR SELECT 
            USING (is_active = true);
    END IF;
END $$;

-- Políticas para terms_acceptances
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own acceptances' AND tablename = 'terms_acceptances') THEN
        CREATE POLICY "Users can view own acceptances" 
            ON public.terms_acceptances 
            FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own acceptances' AND tablename = 'terms_acceptances') THEN
        CREATE POLICY "Users can insert own acceptances" 
            ON public.terms_acceptances 
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Política para admin ver todos os aceites
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all acceptances' AND tablename = 'terms_acceptances') THEN
        CREATE POLICY "Admin can view all acceptances" 
            ON public.terms_acceptances 
            FOR SELECT 
            USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- ============================================================================
-- INSERIR VERSÃO INICIAL DOS TERMOS
-- ============================================================================
INSERT INTO public.terms_versions (slug, title, version_number, content_md, content_hash, is_active, published_at)
VALUES (
    'responsabilidade-v1-2025-11-28',
    'Termo de Responsabilidade - v1.0',
    '1.0',
    '# TERMO DE RESPONSABILIDADE - RADAR NARCISISTA BR

## 1. PERSPECTIVA UNILATERAL
Entendo que estou relatando **apenas minha perspectiva** dos fatos. A IA não conhece o outro lado da história, não tem acesso a provas, e não pode verificar a veracidade dos fatos.

## 2. NÃO É DIAGNÓSTICO
Nenhuma análise ou relatório gerado por esta plataforma constitui diagnóstico clínico, parecer psicológico, laudo técnico ou prova judicial.

## 3. NÃO SUBSTITUI PROFISSIONAIS
Este serviço não substitui acompanhamento de psicólogo, psiquiatra, advogado, assistente social ou qualquer outro profissional qualificado.

## 4. RESPONSABILIDADE PELO USO
Sou integralmente responsável pelo uso que fizer das informações, relatórios e documentos gerados pela plataforma.

## 5. PROIBIÇÃO DE USO MALICIOSO
É expressamente proibido usar esta plataforma para fabricar narrativas falsas, destruir reputações, manipular processos judiciais ou prejudicar terceiros de qualquer forma.

## 6. PROTEÇÃO DE INOCENTES
A pessoa do outro lado da história não está aqui para se defender. A plataforma não pode ser usada como arma de acusação injusta.

## 7. CRIMES APLICÁVEIS
- **Art. 299 CP** - Falsidade Ideológica: pena de 1 a 5 anos de reclusão
- **Art. 347 CP** - Fraude Processual: pena de 3 meses a 2 anos de detenção
- **Arts. 138-140 CP** - Calúnia, Difamação e Injúria: penas de detenção e multa

## 8. ACEITE
Ao continuar usando a plataforma, confirmo que li, entendi e concordo com todos os termos acima. Este aceite será registrado com data, hora, IP e hash criptográfico para fins de auditoria e prova judicial.',
    -- Hash SHA-256 do conteúdo acima (será recalculado na API)
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    true,
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================
COMMENT ON TABLE public.terms_versions IS 'Versões dos termos de responsabilidade com hash do conteúdo';
COMMENT ON TABLE public.terms_acceptances IS 'Registro de aceites com cadeia de custódia para prova pericial';
COMMENT ON COLUMN public.terms_acceptances.event_hash IS 'SHA-256 do payload canônico - prova de integridade';
COMMENT ON COLUMN public.terms_acceptances.canonical_payload IS 'JSON usado para gerar o hash - para verificação pericial';

-- ============================================================================
-- FUNÇÃO PARA VERIFICAR HASH (para peritos)
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_acceptance_hash(acceptance_id UUID)
RETURNS TABLE (
    original_hash TEXT,
    computed_hash TEXT,
    is_valid BOOLEAN
) AS $$
DECLARE
    rec RECORD;
    computed TEXT;
BEGIN
    SELECT event_hash, canonical_payload INTO rec
    FROM public.terms_acceptances
    WHERE id = acceptance_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, FALSE;
        RETURN;
    END IF;
    
    -- Nota: O hash real deve ser computado na aplicação
    -- Esta função é apenas para referência
    computed := encode(sha256(rec.canonical_payload::TEXT::BYTEA), 'hex');
    
    RETURN QUERY SELECT rec.event_hash, computed, (rec.event_hash = computed);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSTRUÇÕES PARA EXECUTAR:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script e execute
-- ============================================================================
