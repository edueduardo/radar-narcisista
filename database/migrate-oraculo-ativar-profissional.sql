-- ============================================================================
-- MIGRATION: Ativar Oráculo V2 para Profissional (Modo Teste)
-- Data: 02/12/2025
-- Objetivo: Liberar Oráculo V2 para perfil profissional em modo teste (status=1)
-- ============================================================================

-- ============================================================================
-- ATUALIZAR STATUS PARA PROFISSIONAL (status=1 = modo teste)
-- ============================================================================

-- Ativar para plano profissional
UPDATE public.oraculo_plan_settings
SET 
  status = 1,  -- 1 = modo teste/limitado
  limite_diario = 10,
  limite_semanal = 50,
  limite_mensal = 150,
  descricao = 'Profissional - MODO TESTE ATIVO',
  updated_at = NOW()
WHERE plan_slug = 'profissional' AND user_role = 'profissional';

-- Ativar para plano enterprise (profissional)
UPDATE public.oraculo_plan_settings
SET 
  status = 1,  -- 1 = modo teste/limitado
  limite_diario = 50,
  limite_semanal = 200,
  limite_mensal = 500,
  descricao = 'Profissional Enterprise - MODO TESTE ATIVO',
  updated_at = NOW()
WHERE plan_slug = 'enterprise' AND user_role = 'profissional';

-- ============================================================================
-- INSERIR CONFIGURAÇÕES ADICIONAIS PARA PROFISSIONAL
-- ============================================================================

-- Profissional no plano essencial (caso exista)
INSERT INTO public.oraculo_plan_settings (plan_slug, user_role, status, limite_diario, limite_semanal, limite_mensal, descricao)
VALUES ('essencial', 'profissional', 1, 5, 25, 75, 'Profissional Essencial - MODO TESTE ATIVO')
ON CONFLICT (plan_slug, user_role) 
DO UPDATE SET 
  status = 1,
  limite_diario = 5,
  limite_semanal = 25,
  limite_mensal = 75,
  descricao = 'Profissional Essencial - MODO TESTE ATIVO',
  updated_at = NOW();

-- Profissional no plano premium
INSERT INTO public.oraculo_plan_settings (plan_slug, user_role, status, limite_diario, limite_semanal, limite_mensal, descricao)
VALUES ('premium', 'profissional', 1, 15, 75, 225, 'Profissional Premium - MODO TESTE ATIVO')
ON CONFLICT (plan_slug, user_role) 
DO UPDATE SET 
  status = 1,
  limite_diario = 15,
  limite_semanal = 75,
  limite_mensal = 225,
  descricao = 'Profissional Premium - MODO TESTE ATIVO',
  updated_at = NOW();

-- ============================================================================
-- VERIFICAR CONFIGURAÇÕES ATUALIZADAS
-- ============================================================================

-- Listar todas as configurações de profissional
SELECT 
  plan_slug,
  user_role,
  status,
  CASE status
    WHEN 0 THEN 'DESATIVADO'
    WHEN 1 THEN 'MODO TESTE'
    WHEN 2 THEN 'COMPLETO'
  END as status_texto,
  limite_diario,
  limite_semanal,
  limite_mensal,
  descricao
FROM public.oraculo_plan_settings
WHERE user_role = 'profissional'
ORDER BY plan_slug;

-- ============================================================================
-- COMENTÁRIO
-- ============================================================================

COMMENT ON TABLE public.oraculo_plan_settings IS 'Configurações do Oráculo V2 por plano e perfil - Profissional ativado em modo teste (02/12/2025)';
