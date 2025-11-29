-- ============================================================================
-- SQL 4 - VERIFICAÇÃO FINAL (SEGURO)
-- ============================================================================

-- Verificar tabelas criadas
SELECT 
    table_name, 
    table_type,
    CASE 
        WHEN table_name IN ('user_terms_acceptance', 'terms_versions', 'terms_acceptances', 'fraud_suspicion_logs') 
        THEN '✅ CRIADA'
        ELSE '❌ NÃO ESPERADA'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_terms_acceptance', 
    'terms_versions', 
    'terms_acceptances', 
    'fraud_suspicion_logs'
)
ORDER BY table_name;

-- Verificar se terms_versions tem dados
SELECT 
    slug, 
    title, 
    version_number, 
    is_active,
    CASE 
        WHEN is_active THEN '✅ ATIVO' 
        ELSE '❌ INATIVO' 
    END as status
FROM public.terms_versions;

-- Verificar view de fraude
SELECT 
    'fraud_suspicion_summary' as view_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_schema = 'public' 
            AND table_name = 'fraud_suspicion_summary'
        ) THEN '✅ CRIADA'
        ELSE '❌ NÃO EXISTE'
    END as status;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN policyname LIKE '%user%' OR policyname LIKE '%admin%' OR policyname LIKE '%fraud%' 
        THEN '✅ POLÍTICA OK'
        ELSE '⚠️ VERIFICAR'
    END as status
FROM pg_policies 
WHERE tablename IN ('user_terms_acceptance', 'terms_versions', 'terms_acceptances', 'fraud_suspicion_logs')
ORDER BY tablename, policyname;

-- Testar função de fraude
SELECT 
    'log_fraud_suspicion' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'log_fraud_suspicion'
        ) THEN '✅ FUNÇÃO OK'
        ELSE '❌ NÃO EXISTE'
    END as status;

-- Contagem total de registros (para verificar se está vazio)
SELECT 
    'user_terms_acceptance' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) = 0 THEN '📝 TABELA VAZIA (NORMAL)'
        ELSE '📊 JÁ TEM DADOS'
    END as status
FROM public.user_terms_acceptance

UNION ALL

SELECT 
    'terms_versions' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ SEM VERSÃO (PROBLEMA)'
        ELSE '✅ VERSÃO CARREGADA'
    END as status
FROM public.terms_versions

UNION ALL

SELECT 
    'terms_acceptances' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) = 0 THEN '📝 SEM ACEITES (NORMAL)'
        ELSE '📊 JÁ TEM ACEITES'
    END as status
FROM public.terms_acceptances

UNION ALL

SELECT 
    'fraud_suspicion_logs' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) = 0 THEN '📝 SEM SUSPEITAS (NORMAL)'
        ELSE '🚨 TEM SUSPEITAS REGISTRADAS'
    END as status
FROM public.fraud_suspicion_logs;
