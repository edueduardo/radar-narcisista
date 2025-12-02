# CONTROL TOWER - Console Dev Global

**Versão:** 1.0  
**BLOCO:** 32-35  
**Data:** 02/12/2025

---

## 1. VISÃO GERAL

A **Control Tower** é o console central de gerenciamento de todos os projetos do ecossistema Radar:

- **Radar Mãe** (projeto principal)
- **White Labels** (licenças customizadas)
- **SaaS Temáticos** (projetos com tema específico)
- **SaaS Brancos** (projetos neutros/template)

---

## 2. ARQUITETURA

### 2.1 Tabelas Principais

```
projects_core
├── id (UUID)
├── slug (identificador único)
├── nome_publico
├── tipo_projeto (radar_mae | white_label | saas_tema | saas_branco)
├── tema
├── parent_project_id (encadeamento mãe/filho)
├── url_publica
├── url_admin
├── status (ativo | pausado | desligado)
├── core_version
├── vinculo_nucleo (ligado | em_transicao | desligado)
├── politica_suporte (monitorado | sob_demanda | sem_suporte)
└── config_extra (JSONB)

owners_core
├── id
├── project_id (FK)
├── nome
├── email
├── tipo_owner (cliente_final | parceiro | interno)
└── is_primary

project_flags_core
├── id
├── project_id (FK)
├── flag (ex: telemetria_ligada, helpdesk_ligado)
└── valor (JSONB)
```

### 2.2 Telemetria

```
telemetry_heartbeats_core
├── project_id
├── core_version
├── ambiente (dev | staging | prod)
├── status (healthy | degraded | down)
├── info_resumida
├── latency_ms, memory_usage_mb
├── requests_last_hour, errors_last_hour
└── active_users

telemetry_errors_core
├── project_id
├── tipo_erro (api | banco | third_party | front_end | auth | unknown)
├── mensagem_resumida
├── nivel_severidade (baixo | medio | alto | critico)
├── error_hash (agrupamento)
└── ocorrencias
```

### 2.3 Help Desk

```
support_tickets_core
├── project_id
├── origem (usuario_final | profissional | admin_cliente | interno | automatico)
├── email_contato
├── titulo, descricao
├── categoria (bug | duvida | sugestao | reclamacao | geral)
├── status (aberto | em_andamento | aguardando_usuario | resolvido | fechado)
├── prioridade (baixa | media | alta | critica)
└── contexto_tecnico

support_ticket_messages_core
├── ticket_id
├── autor_tipo (usuario | suporte | sistema)
├── mensagem
└── interno (boolean)
```

---

## 3. ROTAS E APIS

### 3.1 Páginas Admin

| Rota | Descrição |
|------|-----------|
| `/admin/control-tower` | Lista de projetos e estatísticas |
| `/admin/control-tower/helpdesk` | Help Desk Global |

### 3.2 APIs

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/admin/control-tower` | GET | Lista projetos e stats |
| `/api/admin/control-tower` | POST | Cria projeto |
| `/api/admin/control-tower` | PATCH | Atualiza projeto |
| `/api/admin/control-tower/[id]` | GET | Detalhes do projeto |
| `/api/admin/control-tower/[id]` | DELETE | Remove projeto |
| `/api/core/telemetry/heartbeat` | POST | Registra heartbeat |
| `/api/core/telemetry/error` | POST | Registra erro |
| `/api/core/support-ticket` | POST | Cria ticket |
| `/api/core/support-ticket` | GET | Lista tickets (admin) |

---

## 4. ESTADOS DE VÍNCULO

### 4.1 vinculo_nucleo

| Estado | Descrição |
|--------|-----------|
| `ligado` | Projeto conectado ao core, recebe telemetria e suporte |
| `em_transicao` | Processo de desvinculação em andamento |
| `desligado` | Projeto independente, sem conexão com o core |

### 4.2 politica_suporte

| Política | Descrição |
|----------|-----------|
| `monitorado` | Suporte ativo, monitoramento contínuo |
| `sob_demanda` | Suporte apenas quando solicitado |
| `sem_suporte` | Sem suporte do core |

---

## 5. INTEGRAÇÃO COM GERADOR DE SAAS

Quando o GERADOR DE SAAS cria um novo projeto:

1. **Registro em projects_core**
   - tipo_projeto: `saas_tema` ou `saas_branco`
   - parent_project_id: ID do Radar Mãe
   - vinculo_nucleo: `ligado`
   - politica_suporte: `monitorado`

2. **Flags padrão**
   - `telemetria_ligada: true`
   - `helpdesk_ligado: true`

3. **Owner**
   - Registra o cliente como owner do projeto

4. **Configuração do filho**
   - Gera `project_id` único
   - Configura endpoints de telemetria
   - Inclui componente `SupportTicketButton`

---

## 6. COMPONENTES REUTILIZÁVEIS

### 6.1 SupportTicketButton

```tsx
import SupportTicketButton from '@/components/SupportTicketButton'

<SupportTicketButton
  projectId="uuid-do-projeto"
  userEmail="usuario@email.com"
  userName="Nome do Usuário"
  userId="user-123"
  origem="usuario_final"
  position="bottom-right"
/>
```

---

## 7. LIBS DISPONÍVEIS

| Lib | Descrição |
|-----|-----------|
| `lib/control-tower.ts` | CRUD de projetos, owners, flags |
| `lib/telemetry-core.ts` | Heartbeats, erros, métricas |
| `lib/helpdesk-core.ts` | Tickets, mensagens, estatísticas |

---

## 8. MIGRATIONS

| Arquivo | Descrição |
|---------|-----------|
| `database/migrate-control-tower.sql` | Tabelas de projetos |
| `database/migrate-telemetry-core.sql` | Tabelas de telemetria |
| `database/migrate-helpdesk-core.sql` | Tabelas de help desk |

---

## 9. PRÓXIMOS PASSOS (BLOCO 36-40)

- Dashboard de telemetria com gráficos
- Alertas automáticos por email/WhatsApp
- Sistema de SLA para tickets
- Integração com Crisp/Tawk.to
- Painel de métricas por projeto
- Automação de desvinculação
