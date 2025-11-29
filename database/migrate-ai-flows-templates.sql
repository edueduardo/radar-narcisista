-- Templates e Sugestões para AI Flow Orchestrator
-- Tabela ai_flow_templates
create table if not exists ai_flow_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  definition jsonb not null default '{}'::jsonb,
  is_official boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_flow_templates_category on ai_flow_templates(category);
create index if not exists idx_ai_flow_templates_official on ai_flow_templates(is_official);

-- Tabela ai_flow_suggestions
create table if not exists ai_flow_suggestions (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid references ai_flows(id) on delete cascade,
  type text not null check (type in ('IMPROVEMENT', 'RISK', 'NEW_FLOW_IDEA')),
  title text not null,
  description text,
  status text not null default 'OPEN' check (status in ('OPEN', 'ACCEPTED', 'REJECTED', 'DONE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_flow_suggestions_flow on ai_flow_suggestions(flow_id);
create index if not exists idx_ai_flow_suggestions_type on ai_flow_suggestions(type);
create index if not exists idx_ai_flow_suggestions_status on ai_flow_suggestions(status);

-- Templates oficiais mock
insert into ai_flow_templates (name, description, category, definition, is_official) values
(
  'Fluxo de Risco Padrão',
  'Detecta padrões de risco em episódios do diário e atualiza flags do usuário',
  'Risco',
  '{
    "nodes": [
      {"id": "node-1", "type": "TRIGGER", "subtype": "diario_novo", "position_x": 100, "position_y": 100, "config": {}},
      {"id": "node-2", "type": "IA", "subtype": "guardian_risco_v1", "position_x": 300, "position_y": 100, "config": {}},
      {"id": "node-3", "type": "ACTION", "subtype": "atualizar_flags_risco", "position_x": 500, "position_y": 100, "config": {}}
    ],
    "edges": [
      {"id": "edge-1", "source_node_id": "node-1", "target_node_id": "node-2", "source_handle": "output", "target_handle": "input"},
      {"id": "edge-2", "source_node_id": "node-2", "target_node_id": "node-3", "source_handle": "output", "target_handle": "input"}
    ]
  }',
  true
),
(
  'Fluxo de Resumo Semanal',
  'Gera resumo semanal dos episódios do diário para o usuário',
  'Relatório',
  '{
    "nodes": [
      {"id": "node-1", "type": "TRIGGER", "subtype": "diario_novo", "position_x": 100, "position_y": 100, "config": {}},
      {"id": "node-2", "type": "IA", "subtype": "coach_clareza_v1", "position_x": 300, "position_y": 100, "config": {}},
      {"id": "node-3", "type": "ACTION", "subtype": "gerar_carta_selo_pdf", "position_x": 500, "position_y": 100, "config": {}}
    ],
    "edges": [
      {"id": "edge-1", "source_node_id": "node-1", "target_node_id": "node-2", "source_handle": "output", "target_handle": "input"},
      {"id": "edge-2", "source_node_id": "node-2", "target_node_id": "node-3", "source_handle": "output", "target_handle": "input"}
    ]
  }',
  true
),
(
  'Fluxo de Alerta Emergência',
  'Aciona alerta quando botão de emergência é pressionado',
  'Emergência',
  '{
    "nodes": [
      {"id": "node-1", "type": "TRIGGER", "subtype": "botao_emergencia", "position_x": 100, "position_y": 100, "config": {}},
      {"id": "node-2", "type": "IA", "subtype": "guardian_risco_v1", "position_x": 300, "position_y": 100, "config": {}},
      {"id": "node-3", "type": "ACTION", "subtype": "criar_incidente", "position_x": 500, "position_y": 100, "config": {}}
    ],
    "edges": [
      {"id": "edge-1", "source_node_id": "node-1", "target_node_id": "node-2", "source_handle": "output", "target_handle": "input"},
      {"id": "edge-2", "source_node_id": "node-2", "target_node_id": "node-3", "source_handle": "output", "target_handle": "input"}
    ]
  }',
  true
);

-- Tabela para hashes SHA-256 dos episódios
create table if not exists episode_hashes (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  hash_sha256 text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_episode_hashes_episode on episode_hashes(episode_id);
create index if not exists idx_episode_hashes_hash on episode_hashes(hash_sha256);

-- Função para gerar hash SHA-256
create or replace function generate_sha256_hash(content text) returns text as $$
begin
  return encode(sha256(content::bytea), 'hex');
end;
$$ language plpgsql;
