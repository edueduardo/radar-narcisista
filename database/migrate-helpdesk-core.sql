-- ============================================================================
-- MIGRATION: Help Desk Core - Sistema de Tickets Global
-- ETAPA 34 - BLOCO 32-35
-- Criado em: 02/12/2025
-- ============================================================================

-- ============================================================================
-- TABELA: support_tickets_core
-- Tickets de suporte de todos os projetos do ecossistema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_core(id) ON DELETE CASCADE,
  
  -- Origem do ticket
  origem TEXT NOT NULL CHECK (origem IN ('usuario_final', 'profissional', 'admin_cliente', 'interno', 'automatico')),
  user_id_local TEXT,                             -- ID do usuário no projeto filho (para referência)
  email_contato TEXT NOT NULL,
  nome_contato TEXT,
  
  -- Conteúdo do ticket
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  url_origem TEXT,                                -- URL onde o problema foi reportado
  
  -- Contexto técnico (sem dados sensíveis!)
  contexto_tecnico JSONB DEFAULT '{}',            -- browser, versão, etc.
  
  -- Classificação
  categoria TEXT DEFAULT 'geral' CHECK (categoria IN ('bug', 'duvida', 'sugestao', 'reclamacao', 'geral')),
  
  -- Status e prioridade
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'aguardando_usuario', 'resolvido', 'fechado')),
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Atribuição
  atribuido_a TEXT,                               -- email ou ID do responsável
  
  -- Resolução
  resolucao TEXT,
  resolvido_em TIMESTAMPTZ,
  
  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_support_tickets_project ON public.support_tickets_core(project_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets_core(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_prioridade ON public.support_tickets_core(prioridade);
CREATE INDEX IF NOT EXISTS idx_support_tickets_origem ON public.support_tickets_core(origem);
CREATE INDEX IF NOT EXISTS idx_support_tickets_categoria ON public.support_tickets_core(categoria);
CREATE INDEX IF NOT EXISTS idx_support_tickets_criado ON public.support_tickets_core(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON public.support_tickets_core(email_contato);

-- Trigger para atualizado_em
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_support_tickets_updated_at ON public.support_tickets_core;
CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets_core
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- ============================================================================
-- TABELA: support_ticket_messages_core
-- Mensagens/comentários nos tickets
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_ticket_messages_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets_core(id) ON DELETE CASCADE,
  
  -- Autor
  autor_tipo TEXT NOT NULL CHECK (autor_tipo IN ('usuario', 'suporte', 'sistema')),
  autor_email TEXT,
  autor_nome TEXT,
  
  -- Conteúdo
  mensagem TEXT NOT NULL,
  
  -- Anexos (referências, não os arquivos em si)
  anexos JSONB DEFAULT '[]',
  
  -- Visibilidade
  interno BOOLEAN DEFAULT false,                  -- se true, só suporte vê
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.support_ticket_messages_core(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_criado ON public.support_ticket_messages_core(criado_em);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.support_tickets_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages_core ENABLE ROW LEVEL SECURITY;

-- Apenas super-admin pode ver todos os tickets
DROP POLICY IF EXISTS "Super admin can manage tickets" ON public.support_tickets_core;
CREATE POLICY "Super admin can manage tickets" ON public.support_tickets_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Super admin can manage ticket messages" ON public.support_ticket_messages_core;
CREATE POLICY "Super admin can manage ticket messages" ON public.support_ticket_messages_core
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para criar ticket
CREATE OR REPLACE FUNCTION public.create_support_ticket(
  p_project_id UUID,
  p_origem TEXT,
  p_email_contato TEXT,
  p_titulo TEXT,
  p_descricao TEXT,
  p_nome_contato TEXT DEFAULT NULL,
  p_user_id_local TEXT DEFAULT NULL,
  p_url_origem TEXT DEFAULT NULL,
  p_contexto_tecnico JSONB DEFAULT '{}',
  p_categoria TEXT DEFAULT 'geral',
  p_prioridade TEXT DEFAULT 'media'
) RETURNS UUID AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  INSERT INTO public.support_tickets_core (
    project_id,
    origem,
    email_contato,
    nome_contato,
    user_id_local,
    titulo,
    descricao,
    url_origem,
    contexto_tecnico,
    categoria,
    prioridade
  ) VALUES (
    p_project_id,
    p_origem,
    p_email_contato,
    p_nome_contato,
    p_user_id_local,
    p_titulo,
    p_descricao,
    p_url_origem,
    p_contexto_tecnico,
    p_categoria,
    p_prioridade
  )
  RETURNING id INTO v_ticket_id;
  
  RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar mensagem ao ticket
CREATE OR REPLACE FUNCTION public.add_ticket_message(
  p_ticket_id UUID,
  p_autor_tipo TEXT,
  p_mensagem TEXT,
  p_autor_email TEXT DEFAULT NULL,
  p_autor_nome TEXT DEFAULT NULL,
  p_interno BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO public.support_ticket_messages_core (
    ticket_id,
    autor_tipo,
    autor_email,
    autor_nome,
    mensagem,
    interno
  ) VALUES (
    p_ticket_id,
    p_autor_tipo,
    p_autor_email,
    p_autor_nome,
    p_mensagem,
    p_interno
  )
  RETURNING id INTO v_message_id;
  
  -- Atualizar timestamp do ticket
  UPDATE public.support_tickets_core
  SET atualizado_em = NOW()
  WHERE id = p_ticket_id;
  
  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de tickets
CREATE OR REPLACE FUNCTION public.get_ticket_stats()
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'abertos', COUNT(*) FILTER (WHERE status = 'aberto'),
    'em_andamento', COUNT(*) FILTER (WHERE status = 'em_andamento'),
    'aguardando_usuario', COUNT(*) FILTER (WHERE status = 'aguardando_usuario'),
    'resolvidos', COUNT(*) FILTER (WHERE status = 'resolvido'),
    'fechados', COUNT(*) FILTER (WHERE status = 'fechado'),
    'criticos', COUNT(*) FILTER (WHERE prioridade = 'critica' AND status NOT IN ('resolvido', 'fechado')),
    'altos', COUNT(*) FILTER (WHERE prioridade = 'alta' AND status NOT IN ('resolvido', 'fechado'))
  ) INTO v_stats
  FROM public.support_tickets_core;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para listar tickets com filtros
CREATE OR REPLACE FUNCTION public.list_tickets(
  p_project_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_prioridade TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  project_nome TEXT,
  origem TEXT,
  email_contato TEXT,
  nome_contato TEXT,
  titulo TEXT,
  categoria TEXT,
  status TEXT,
  prioridade TEXT,
  criado_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ,
  total_mensagens BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.project_id,
    p.nome_publico as project_nome,
    t.origem,
    t.email_contato,
    t.nome_contato,
    t.titulo,
    t.categoria,
    t.status,
    t.prioridade,
    t.criado_em,
    t.atualizado_em,
    (SELECT COUNT(*) FROM public.support_ticket_messages_core m WHERE m.ticket_id = t.id) as total_mensagens
  FROM public.support_tickets_core t
  JOIN public.projects_core p ON p.id = t.project_id
  WHERE 
    (p_project_id IS NULL OR t.project_id = p_project_id)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_prioridade IS NULL OR t.prioridade = p_prioridade)
  ORDER BY 
    CASE t.prioridade 
      WHEN 'critica' THEN 1 
      WHEN 'alta' THEN 2 
      WHEN 'media' THEN 3 
      ELSE 4 
    END,
    t.criado_em DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.support_tickets_core IS 'Tickets de suporte de todos os projetos do ecossistema';
COMMENT ON TABLE public.support_ticket_messages_core IS 'Mensagens e comentários nos tickets de suporte';

COMMENT ON FUNCTION public.create_support_ticket IS 'Cria um novo ticket de suporte';
COMMENT ON FUNCTION public.add_ticket_message IS 'Adiciona mensagem a um ticket existente';
COMMENT ON FUNCTION public.get_ticket_stats IS 'Retorna estatísticas gerais de tickets';
COMMENT ON FUNCTION public.list_tickets IS 'Lista tickets com filtros e paginação';
