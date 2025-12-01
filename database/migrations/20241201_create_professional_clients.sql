-- ============================================================================
-- ETAPA 12.1: Infra de Clientes Profissionais
-- Radar Narcisista - Dashboard Profissional
-- Data: 01/12/2025
-- ============================================================================
-- 
-- Esta migration cria a tabela para gerenciar a relação entre profissionais
-- (psicólogos, advogados, assistentes sociais) e seus clientes no Radar.
--
-- MODELO DE CONSENTIMENTO:
-- - O profissional convida o cliente por email/código
-- - O cliente aceita compartilhar dados específicos
-- - O profissional só vê o que o cliente autorizou
--
-- LGPD:
-- - Dados mínimos necessários
-- - Consentimento explícito do cliente
-- - Cliente pode revogar a qualquer momento
-- ============================================================================

-- Tabela principal: relação profissional ↔ cliente
CREATE TABLE IF NOT EXISTS public.professional_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem é o profissional (dono do painel)
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Quem é o cliente (usuária do Radar)
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status da conexão
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'revoked')),
  -- pending: convite enviado, aguardando aceite
  -- active: cliente aceitou, compartilhamento ativo
  -- paused: cliente pausou temporariamente
  -- revoked: cliente revogou acesso
  
  -- Código de convite (para o cliente aceitar)
  invite_code TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  invite_accepted_at TIMESTAMPTZ,
  
  -- O que o cliente autorizou compartilhar
  share_clarity_tests BOOLEAN DEFAULT FALSE,
  share_journal_entries BOOLEAN DEFAULT FALSE,
  share_chat_summaries BOOLEAN DEFAULT FALSE,
  share_safety_plan BOOLEAN DEFAULT FALSE,
  share_risk_alerts BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  client_display_name TEXT, -- Nome que o profissional vê (pode ser pseudônimo)
  professional_notes TEXT,  -- Notas privadas do profissional sobre o cliente
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  
  -- Constraint: um cliente só pode estar conectado uma vez a cada profissional
  CONSTRAINT unique_professional_client UNIQUE (professional_id, client_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_professional_clients_professional_id 
  ON public.professional_clients(professional_id);

CREATE INDEX IF NOT EXISTS idx_professional_clients_client_id 
  ON public.professional_clients(client_id);

CREATE INDEX IF NOT EXISTS idx_professional_clients_status 
  ON public.professional_clients(status);

CREATE INDEX IF NOT EXISTS idx_professional_clients_invite_code 
  ON public.professional_clients(invite_code) WHERE invite_code IS NOT NULL;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_professional_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_professional_clients_updated_at ON public.professional_clients;
CREATE TRIGGER trigger_professional_clients_updated_at
  BEFORE UPDATE ON public.professional_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_clients_updated_at();

-- ============================================================================
-- RLS (Row Level Security) - CRÍTICO PARA SEGURANÇA
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.professional_clients ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes (para evitar erro de duplicação)
DROP POLICY IF EXISTS "professional_can_view_own_clients" ON public.professional_clients;
DROP POLICY IF EXISTS "professional_can_create_invites" ON public.professional_clients;
DROP POLICY IF EXISTS "professional_can_update_own_clients" ON public.professional_clients;
DROP POLICY IF EXISTS "client_can_view_own_connections" ON public.professional_clients;
DROP POLICY IF EXISTS "client_can_update_own_connection" ON public.professional_clients;
DROP POLICY IF EXISTS "professional_can_delete_pending_invites" ON public.professional_clients;

-- Policy 1: Profissional pode ver seus próprios clientes
CREATE POLICY "professional_can_view_own_clients"
  ON public.professional_clients
  FOR SELECT
  USING (professional_id = auth.uid());

-- Policy 2: Profissional pode criar convites para clientes
CREATE POLICY "professional_can_create_invites"
  ON public.professional_clients
  FOR INSERT
  WITH CHECK (professional_id = auth.uid());

-- Policy 3: Profissional pode atualizar seus próprios registros
CREATE POLICY "professional_can_update_own_clients"
  ON public.professional_clients
  FOR UPDATE
  USING (professional_id = auth.uid());

-- Policy 4: Cliente pode ver conexões onde é o cliente
CREATE POLICY "client_can_view_own_connections"
  ON public.professional_clients
  FOR SELECT
  USING (client_id = auth.uid());

-- Policy 5: Cliente pode atualizar status/permissões da própria conexão
CREATE POLICY "client_can_update_own_connection"
  ON public.professional_clients
  FOR UPDATE
  USING (client_id = auth.uid());

-- Policy 6: Profissional pode deletar convites pendentes
CREATE POLICY "professional_can_delete_pending_invites"
  ON public.professional_clients
  FOR DELETE
  USING (professional_id = auth.uid() AND status = 'pending');

-- ============================================================================
-- Comentários para documentação
-- ============================================================================

COMMENT ON TABLE public.professional_clients IS 
  'Relação entre profissionais (psicólogos, advogados) e seus clientes no Radar Narcisista';

COMMENT ON COLUMN public.professional_clients.status IS 
  'pending=aguardando aceite, active=ativo, paused=pausado pelo cliente, revoked=revogado';

COMMENT ON COLUMN public.professional_clients.share_clarity_tests IS 
  'Cliente autorizou compartilhar resultados do Teste de Clareza';

COMMENT ON COLUMN public.professional_clients.share_journal_entries IS 
  'Cliente autorizou compartilhar entradas do Diário';

COMMENT ON COLUMN public.professional_clients.share_chat_summaries IS 
  'Cliente autorizou compartilhar resumos do Chat com IA';

COMMENT ON COLUMN public.professional_clients.share_safety_plan IS 
  'Cliente autorizou compartilhar Plano de Segurança';

COMMENT ON COLUMN public.professional_clients.share_risk_alerts IS 
  'Cliente autorizou compartilhar Alertas de Risco';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================