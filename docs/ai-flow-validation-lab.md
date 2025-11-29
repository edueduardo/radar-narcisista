# AI Flow Orchestrator: Laboratório com Janela de Validação

## Visão Geral

Evolução do módulo AI Flow Orchestrator de um builder simples para um **laboratório controlado com janela de validação**, permitindo revisão de fluxos, métricas detalhadas e execução exclusivamente em modo simulação.

## Funcionalidades Implementadas

### 1. Schema de Validação

Novos campos na tabela `ai_flows`:
- `review_status` (enum): `draft`, `in_validation`, `approved`, `rejected`
- `validation_window_days` (integer): dias da janela de validação
- `validation_started_at` (timestamptz): data de início da validação
- `validation_ends_at` (timestamptz): data fim (calculada automaticamente)
- `simulation_only` (boolean, default true): força simulação

Novos campos na tabela `ai_flow_runs`:
- `error_count` (integer): total de erros na execução
- `warning_count` (integer): total de warnings na execução
- `latency_ms` (integer): latência em milissegundos

**Arquivo de migração:** `database/migrate-ai-flows-validation.sql`

### 2. UI Lista de Fluxos (`/admin/fluxos-ia`)

- Tabela com colunas: Nome, Status, Revisão, Janela de Validação, Em Validação Até, Métricas, Ações
- Dropdown inline para editar `review_status`
- Ao selecionar `in_validation`, pede `validation_window_days` e seta `validation_started_at` e `validation_ends_at`
- Métricas por fluxo: execuções, erros (%), duração média

### 3. Builder com Banner e Métricas (`/admin/fluxos-ia/[id]`)

- **Banner de contexto** (topo): exibe status de revisão, janela de validação, countdown
- **Painel de métricas**: total execuções, taxa de sucesso/erro, latência média, última execução
- **Aviso de validação** (amarelo) quando `review_status = in_validation`:
  - Inconclusivo se < 3 execuções
  - Risco se taxa de erro > 10%
  - OK se dentro dos critérios

### 4. APIs Atualizadas

- `PUT /api/admin/ai-flows/[id]`: aceita `review_status` e `validation_window_days`; calcula datas automaticamente
- `POST /api/admin/ai-flows/[id]/run`: registra `error_count`, `warning_count`, `latency_ms`
- `GET /api/admin/ai-flows/[id]/runs`: expõe novos campos e calcula latência média
- `GET /api/admin/ai-flows/analytics`: usa `latency_ms` em vez de diff de datas

### 5. Smoke Test

Script PowerShell para validar a implementação:
- Cria fluxo com novos campos
- Transiciona para `in_validation`
- Salva grafo mínimo
- Executa 3 vezes em simulação
- Verifica métricas e analytics
- Aprova fluxo
- Limpeza

**Arquivo:** `scripts/test-fluxos-ia-validation.ps1`

## Como Usar

### 1. Aplicar Migração

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: database/migrate-ai-flows-validation.sql
```

### 2. Rodar Smoke Test

```powershell
# No terminal PowerShell (na raiz do projeto)
$env:ADMIN_TOKEN = "SEU_TOKEN_ADMIN"
.\scripts\test-fluxos-ia-validation.ps1
```

### 3. Fluxo de Validação Típico

1. **Criar fluxo** → status `draft`
2. **Montar grafo** (triggers → IAs → ações)
3. **Testar** em simulação várias vezes
4. **Mudar para `in_validation`** → define janela de dias
5. **Executar durante a janela** → painel mostra warnings
6. **Aprovar** ou **rejeitar**

## Restrições de Segurança

- **Sempre simulação**: `simulation_only = true` por padrão
- **Sem impacto em produção**: não altera dados de usuários, auth, Stripe, LGPD ou RLS
- **Apenas admin**: todas as APIs exigem `requireAdminAPI`
- **Logs em `ai_flow_runs` e `ai_flow_run_logs`**: auditável

## Métricas Disponíveis

- Por fluxo: total, sucesso, erro, latência média, última execução
- Por nó: logs, erros, warnings (via `/api/admin/ai-flows/[id]/nodes-analytics`)
- Global: analytics agregados (`/api/admin/ai-flows/analytics`)

## Próximos Passos (Opicionais)

- Relatórios PDF de validação
- Notificações por email ao aprovar/rejeitar
- Dashboard de tempo real de execuções
- Integração com sistema de tickets para validação

---

**Status da implementação:** ✅ Completo (Prompt A)
