# SQL Migration Status - Radar Narcisista BR

## ⚠️ PENDENTE: Executar no Supabase Dashboard

### Migration 1: user_terms_acceptance
**Arquivo:** `supabase/migrations/20241128_user_terms_acceptance.sql`
**Status:** ❌ NÃO EXECUTADO
**Ação necessária:** 
1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Copiar e colar o conteúdo do arquivo
4. Executar

### Migration 2: terms_custody_chain  
**Arquivo:** `supabase/migrations/20241128_terms_custody_chain.sql`
**Status:** ❌ NÃO EXECUTADO
**Ação necessária:**
1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Copiar e colar o conteúdo do arquivo
4. Executar

## Impacto de NÃO executar:
- ❌ Modal de termos não funciona
- ❌ Sistema de aceite não registra no banco
- ❌ Admin não pode visualizar aceites
- ❌ Sem proteção jurídica da plataforma

## Comandos SQL prontos para executar:

### Migration 1 (57 linhas):
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

### Migration 2 (199 linhas):
Ver arquivo completo em: `supabase/migrations/20241128_terms_custody_chain.sql`

---
**ATUALIZADO:** 28/11/2025
**STATUS:** AGUARDANDO EXECUÇÃO MANUAL
