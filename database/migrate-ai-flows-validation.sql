-- Adicionar campos de revisão e validação à tabela ai_flows
alter table ai_flows
  add column if not exists review_status text not null default 'draft' check (review_status in ('draft', 'in_validation', 'approved', 'rejected')),
  add column if not exists validation_window_days integer,
  add column if not exists validation_started_at timestamptz,
  add column if not exists validation_ends_at timestamptz,
  add column if not exists simulation_only boolean not null default true;

-- Adicionar campos de métricas à tabela ai_flow_runs
alter table ai_flow_runs
  add column if not exists error_count integer not null default 0,
  add column if not exists warning_count integer not null default 0,
  add column if not exists latency_ms integer;

-- Índices úteis para performance
create index if not exists idx_ai_flows_review_status on ai_flows(review_status);
create index if not exists idx_ai_flows_validation_ends_at on ai_flows(validation_ends_at);
create index if not exists idx_ai_flow_runs_latency on ai_flow_runs(latency_ms);
create index if not exists idx_ai_flow_runs_error_count on ai_flow_runs(error_count);
