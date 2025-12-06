-- ============================================================================
-- SEED: USUÁRIOS DE TESTE PARA E2E
-- ============================================================================
-- 
-- COMO USAR:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script
--
-- IMPORTANTE: Este script cria usuários APENAS para testes E2E
-- NÃO use em produção!
-- ============================================================================

-- ============================================================================
-- OPÇÃO 1: CRIAR VIA INTERFACE DO SUPABASE (RECOMENDADO)
-- ============================================================================
-- 
-- Vá em Authentication → Users → Add User e crie:
--
-- USUÁRIA DE TESTE:
--   Email: teste.usuario@radar-narcisista.com.br
--   Password: Teste123!@#
--
-- ADMIN DE TESTE:
--   Email: admin@radar-narcisista.com.br
--   Password: Admin123!@#
--
-- PROFISSIONAL DE TESTE:
--   Email: profissional@radar-narcisista.com.br
--   Password: Prof123!@#

-- ============================================================================
-- OPÇÃO 2: VERIFICAR SE USUÁRIOS EXISTEM
-- ============================================================================

-- Verificar usuários existentes
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN (
  'teste.usuario@radar-narcisista.com.br',
  'admin@radar-narcisista.com.br',
  'profissional@radar-narcisista.com.br'
);

-- ============================================================================
-- OPÇÃO 3: CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- ============================================================================
-- 
-- Se os usuários já existem no auth.users mas não têm perfil na tabela profiles:

-- Criar perfil para usuária de teste (se não existir)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Usuária de Teste E2E',
  'user',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'teste.usuario@radar-narcisista.com.br'
ON CONFLICT (id) DO NOTHING;

-- Criar perfil para admin de teste (se não existir)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin de Teste E2E',
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@radar-narcisista.com.br'
ON CONFLICT (id) DO NOTHING;

-- Criar perfil para profissional de teste (se não existir)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Profissional de Teste E2E',
  'professional',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'profissional@radar-narcisista.com.br'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- OPÇÃO 4: CRIAR DADOS DE TESTE PARA USUÁRIA
-- ============================================================================

-- Criar 3 entradas de diário para a usuária de teste
INSERT INTO public.diary_entries (user_id, title, content, mood, tags, created_at)
SELECT 
  id,
  'Dia tranquilo',
  'Hoje foi um dia relativamente calmo. Consegui focar no trabalho.',
  'neutral',
  ARRAY['trabalho', 'rotina'],
  NOW() - INTERVAL '2 days'
FROM auth.users 
WHERE email = 'teste.usuario@radar-narcisista.com.br'
ON CONFLICT DO NOTHING;

INSERT INTO public.diary_entries (user_id, title, content, mood, tags, created_at)
SELECT 
  id,
  'Situação difícil',
  'Tive uma discussão hoje. Me senti muito mal depois.',
  'sad',
  ARRAY['conflito', 'tristeza', 'manipulacao'],
  NOW() - INTERVAL '1 day'
FROM auth.users 
WHERE email = 'teste.usuario@radar-narcisista.com.br'
ON CONFLICT DO NOTHING;

INSERT INTO public.diary_entries (user_id, title, content, mood, tags, created_at)
SELECT 
  id,
  'Momento crítico - TESTE',
  'Este é um registro de teste com tags graves para verificar detecção de risco.',
  'anxious',
  ARRAY['violencia_fisica', 'ameaca', 'isolamento'],
  NOW()
FROM auth.users 
WHERE email = 'teste.usuario@radar-narcisista.com.br'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar usuários criados
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role,
  (SELECT COUNT(*) FROM public.diary_entries WHERE user_id = u.id) as diary_count
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN (
  'teste.usuario@radar-narcisista.com.br',
  'admin@radar-narcisista.com.br',
  'profissional@radar-narcisista.com.br'
);

-- ============================================================================
-- LIMPEZA (OPCIONAL - USE COM CUIDADO!)
-- ============================================================================
-- 
-- Para remover usuários de teste:
-- 
-- DELETE FROM auth.users WHERE email LIKE '%@radar-narcisista.com.br';
-- 
-- ============================================================================
