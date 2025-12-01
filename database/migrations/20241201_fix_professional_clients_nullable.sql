-- ============================================================================
-- ETAPA 12.1.1: Correção da tabela professional_clients
-- Radar Narcisista - Dashboard Profissional
-- Data: 01/12/2025
-- ============================================================================
-- 
-- PROBLEMA: A coluna client_id foi criada como NOT NULL, mas quando o 
-- profissional cria um convite, ainda não temos o client_id (o cliente
-- ainda não aceitou).
--
-- SOLUÇÃO: Tornar client_id nullable e ajustar a constraint unique.
--
-- EXECUTAR APÓS: 20241201_create_professional_clients.sql
-- ============================================================================

-- Remover a constraint NOT NULL do client_id
-- (Só funciona se a tabela já existir e não tiver dados com client_id NULL)
ALTER TABLE public.professional_clients 
  ALTER COLUMN client_id DROP NOT NULL;

-- Remover a constraint unique antiga (professional_id, client_id)
-- porque agora client_id pode ser NULL durante o período de convite pendente
ALTER TABLE public.professional_clients 
  DROP CONSTRAINT IF EXISTS unique_professional_client;

-- Criar nova constraint que permite NULL no client_id
-- Quando client_id é preenchido, garante unicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_professional_client_active
  ON public.professional_clients(professional_id, client_id) 
  WHERE client_id IS NOT NULL;

-- Adicionar policy para permitir que cliente veja convites pelo invite_code
-- (necessário para validação antes do aceite)
DROP POLICY IF EXISTS "anyone_can_validate_invite_code" ON public.professional_clients;
CREATE POLICY "anyone_can_validate_invite_code"
  ON public.professional_clients
  FOR SELECT
  USING (
    -- Permite leitura se:
    -- 1. É o profissional dono
    professional_id = auth.uid()
    OR
    -- 2. É o cliente conectado
    client_id = auth.uid()
    OR
    -- 3. É um convite pendente (para validação pública do código)
    (status = 'pending' AND invite_code IS NOT NULL)
  );

-- ============================================================================
-- FIM DA MIGRATION DE CORREÇÃO
-- ============================================================================
