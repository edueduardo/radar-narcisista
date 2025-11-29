create table if not exists ai_flows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  mode_default text not null default 'simulation',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_flows_active on ai_flows(is_active);
create index if not exists idx_ai_flows_created_at on ai_flows(created_at desc);

create table if not exists ai_flow_nodes (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references ai_flows(id) on delete cascade,
  type text not null,
  subtype text not null,
  ai_agent_id uuid,
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_flow_nodes_flow on ai_flow_nodes(flow_id);

create table if not exists ai_flow_edges (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references ai_flows(id) on delete cascade,
  source_node_id uuid not null,
  source_handle text not null,
  target_node_id uuid not null,
  target_handle text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_flow_edges_flow on ai_flow_edges(flow_id);

create table if not exists ai_flow_runs (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references ai_flows(id) on delete cascade,
  mode text not null,
  triggered_by_event jsonb not null default '{}'::jsonb,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_flow_runs_flow on ai_flow_runs(flow_id);
create index if not exists idx_ai_flow_runs_status on ai_flow_runs(status);
create index if not exists idx_ai_flow_runs_started_at on ai_flow_runs(started_at desc);

create table if not exists ai_flow_run_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references ai_flow_runs(id) on delete cascade,
  node_id uuid,
  timestamp timestamptz not null default now(),
  level text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_ai_flow_run_logs_run on ai_flow_run_logs(run_id);
create index if not exists idx_ai_flow_run_logs_node on ai_flow_run_logs(node_id);
create index if not exists idx_ai_flow_run_logs_timestamp on ai_flow_run_logs(timestamp desc);

create table if not exists ai_flow_versions (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references ai_flows(id) on delete cascade,
  version integer not null,
  label text,
  is_current boolean not null default false,
  stability_status text,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  created_by text
);

create unique index if not exists idx_ai_flow_versions_unique
  on ai_flow_versions(flow_id, version);

create index if not exists idx_ai_flow_versions_flow
  on ai_flow_versions(flow_id, version desc);

create index if not exists idx_ai_flow_versions_current
  on ai_flow_versions(flow_id)
  where is_current;

