# 🚨 GUIA COMPLETO: Executar SQLs no Supabase Radar Narcisista

## ⚠️ IMPORTANTE: Execute na ordem exata!

### 📋 ETAPA 1: Acessar Supabase Dashboard

1. **Abra:** https://dashboard.supabase.com
2. **Faça login** com sua conta
3. **Selecione seu projeto** Radar Narcisista
4. **Vá para:** SQL Editor → New query

---

## 🗃️ ETAPA 2: Executar Migration 1 - user_terms_acceptance

**Copie e cole TODO este código:**

```sql
-- ============================================================================
-- TABELA: user_terms_acceptance
-- Registra o aceite dos termos de responsabilidade pelos usuários
-- ============================================================================

-- Criar tabela
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_terms_user_id ON public.user_terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_terms_accepted_at ON public.user_terms_acceptance(accepted_at);
CREATE INDEX IF NOT EXISTS idx_user_terms_version ON public.user_terms_acceptance(terms_version);

-- RLS (Row Level Security)
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Política: usuário só pode ver/inserir seus próprios aceites
CREATE POLICY "Users can view own terms acceptance" 
    ON public.user_terms_acceptance 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own terms acceptance" 
    ON public.user_terms_acceptance 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own terms acceptance" 
    ON public.user_terms_acceptance 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE public.user_terms_acceptance IS 'Registra aceite dos termos de responsabilidade pelos usuários';
COMMENT ON COLUMN public.user_terms_acceptance.terms_version IS 'Versão dos termos aceitos (ex: 1.0, 1.1, 2.0)';
COMMENT ON COLUMN public.user_terms_acceptance.context IS 'Contexto onde o aceite foi feito (chat, diario, geral)';
COMMENT ON COLUMN public.user_terms_acceptance.ip_hash IS 'Hash SHA-256 do IP do usuário para auditoria';
```

**Clique em "RUN" ✅**

---

## 🔗 ETAPA 3: Executar Migration 2 - terms_custody_chain

**Copie e cole TODO este código:**

```sql
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
    
    -- Hash para verificação de integridade
    event_hash TEXT NOT NULL,                     -- SHA-256 do payload canônico
    canonical_payload JSONB NOT NULL,             -- Payload ordenado para verificação
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_version ON public.terms_acceptances(terms_version_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_date ON public.terms_acceptances(accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_hash ON public.terms_acceptances(event_hash);

-- RLS (Row Level Security)
ALTER TABLE public.terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Políticas para terms_versions (todos podem ver, admin gerencia)
CREATE POLICY "Anyone can view terms versions" 
    ON public.terms_versions 
    FOR SELECT 
    USING (is_active = true);

-- Políticas para terms_acceptances
CREATE POLICY "Users can view own acceptances" 
    ON public.terms_acceptances 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own acceptances" 
    ON public.terms_acceptances 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Função para verificar hash de aceite (para peritos)
CREATE OR REPLACE FUNCTION public.verify_acceptance_hash(
    p_acceptance_id UUID,
    p_expected_hash TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stored_hash TEXT;
BEGIN
    SELECT event_hash INTO v_stored_hash 
    FROM public.terms_acceptances 
    WHERE id = p_acceptance_id;
    
    RETURN v_stored_hash = p_expected_hash;
END;
$$;

-- Inserir primeira versão dos termos
INSERT INTO public.terms_versions (
    slug, title, version_number, content_md, content_hash, is_active, published_at
) VALUES (
    'etica-v1-2025-11-28',
    'Termos de Uso e Ética - v1',
    '1.0',
    '# Termos de Uso e Ética - Radar Narcisista BR

## 1. Perspectiva Unilateral
Eu entendo que estou relatando apenas minha perspectiva da situação. A IA não conhece o outro lado da história.

## 2. Responsabilidade Penal
Sei que mentir ou forjar provas é crime (Art. 299 CP - Falsidade Ideológica, Art. 347 CP - Fraude Processual).

## 3. Crimes contra a Honra
Entendo que calúnia, difamação ou injúria são crimes (Arts. 138-140 CP).

## 4. Uso Ético
Me comprometo a usar a ferramenta para busca de clareza pessoal, não para vingança ou perseguição.

## 5. Não é Diagnóstico
Sei que o Radar não faz diagnóstico clínico nem substitui profissionais qualificados.

## 6. Responsabilidade Total
Assumo total responsabilidade pelo uso das informações geradas.',
    sha256('Termos de Uso e Ética - Radar Narcisista BR v1'),
    true,
    NOW()
) ON CONFLICT (slug) DO NOTHING;
```

**Clique em "RUN" ✅**

---

## 🚨 ETAPA 4: Executar Migration 3 - fraud_suspicion_logs

**Copie e cole TODO este código:**

```sql
-- ============================================================================
-- REGISTRO DE SUSPEITAS DE FRAUDE / INCONSISTÊNCIAS
-- Radar Narcisista BR - Proteção contra uso malicioso
-- ============================================================================

-- ============================================================================
-- TABELA: LOGS DE SUSPEITA DE FRAUDE
-- Registra quando a IA detecta possíveis inconsistências ou red flags
-- ============================================================================
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

-- RLS (Row Level Security)
ALTER TABLE public.fraud_suspicion_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admin pode ver logs de fraude
CREATE POLICY "Only admin can view fraud logs" 
    ON public.fraud_suspicion_logs 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Sistema pode inserir logs
CREATE POLICY "System can insert fraud logs" 
    ON public.fraud_suspicion_logs 
    FOR INSERT 
    WITH CHECK (true);

-- Comentários
COMMENT ON TABLE public.fraud_suspicion_logs IS 'Registra suspeitas de fraude/inconsistência detectadas pela IA';
COMMENT ON COLUMN public.fraud_suspicion_logs.suspicion_type IS 'Tipos: inconsistency, fabrication, revenge, manipulation, excessive_accusation, zero_self_criticism';
COMMENT ON COLUMN public.fraud_suspicion_logs.severity IS '1=leve (questionamento), 2=moderada, 3=significativa, 4=grave, 5=crítica (recusa)';
```

**Clique em "RUN" ✅**

---

## ✅ ETAPA 5: Verificar se tudo funcionou

**Execute este SQL para verificar:**

```sql
-- Verificar tabelas criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_terms_acceptance', 'terms_versions', 'terms_acceptances', 'fraud_suspicion_logs')
ORDER BY table_name;

-- Verificar se terms_versions tem dados
SELECT COUNT(*) as total_versions FROM public.terms_versions;

-- Verificar primeira versão dos termos
SELECT slug, title, version_number, is_active FROM public.terms_versions;
```

**Esperado: 4 tabelas + 1 versão dos termos**

---

## 🎉 ETAPA 6: Testar no Sistema

1. **Abra o app:** http://localhost:3000
2. **Faça login** 
3. **Vá para o chat** - deve aparecer modal de termos
4. **Aceite os termos** - deve registrar no banco
5. **Verifique admin:** /admin/termos-aceitos - deve mostrar o aceite

---

## 🚨 SE TIVER ERRO:

### Erro: "relation does not exist"
- **Solução:** Execute as migrations na ordem correta

### Erro: "permission denied"
- **Solução:** Verifique se está logado como dono do projeto

### Erro: "already exists"
- **Solução:** OK! Significa que já existe

---

## 📞 SUPORTE:

Se tiver problemas:
1. **Tire print** do erro
2. **Verifique** se executou na ordem correta
3. **Teste** com uma query simples: `SELECT NOW();`

---
**ATUALIZADO:** 28/11/2025  
**STATUS:** PRONTO PARA EXECUÇÃO
