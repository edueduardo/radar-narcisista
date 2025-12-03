# GERADOR DE SAAS - Documentação do Módulo CORE

> **Versão:** 1.0.0  
> **Última atualização:** 03/12/2025  
> **Status:** IMPLEMENTADO (BLOCO 31-35)

---

## 📋 Visão Geral

O **Gerador de SaaS** é a arquitetura que permite criar novos SaaS a partir do Radar Narcisista como blueprint. Tudo que é estrutural no Radar (admin, dashboard, planos, oráculos, logs, segurança) pode ser reaproveitado em qualquer SaaS gerado.

---

## 🏗️ Módulos CORE Disponíveis

### 1. PLANOS_CORE (BLOCO 31-35)

**Arquivos:**
- `database/migrate-planos-core.sql` - Migrations completas
- `lib/planos-core.ts` - Helpers TypeScript (a criar)
- `app/admin/planos-core/` - UI Admin (a criar)

**Tabelas:**
| Tabela | Descrição |
|--------|-----------|
| `features` | Features atômicas do sistema |
| `feature_profiles` | Perfis versionados de features |
| `feature_profile_features` | Join entre profiles e features |
| `plan_catalog` | Catálogo de planos disponíveis |
| `user_feature_overrides` | Overrides individuais por usuário |
| `user_subscriptions_core` | Assinaturas dos usuários |

**Funções SQL:**
| Função | Descrição |
|--------|-----------|
| `get_effective_features(user_id)` | Retorna features efetivas (profile + overrides) |
| `has_feature(user_id, feature_key)` | Verifica se usuário tem acesso a feature |
| `get_feature_limit(user_id, feature_key, periodo)` | Retorna limite de uma feature |

**Como usar em SaaS gerado:**
```sql
-- 1. Copiar a migration migrate-planos-core.sql
-- 2. Ajustar as features para o novo SaaS
-- 3. Criar profiles específicos do novo SaaS
-- 4. Configurar o plan_catalog com os planos do novo SaaS
```

---

### 2. ORACULO_CORE (BLOCO 26-30)

**Arquivos:**
- `lib/oraculo-core.ts` - Núcleo do Oráculo
- `lib/oraculo-settings.ts` - Configurações por perfil
- `database/migrate-oraculo-settings.sql` - Migrations

**Como usar em SaaS gerado:**
```typescript
import { OraculoCore } from '@/lib/oraculo-core'

const oraculo = new OraculoCore({
  tema: 'clinica',
  prompts: customPrompts,
  limites: customLimites
})
```

---

### 3. CONTROL_TOWER (BLOCO 32-35)

**Arquivos:**
- `database/migrate-control-tower.sql` - Migrations
- `lib/control-tower.ts` - Helpers
- `app/admin/control-tower/` - UI Admin

**Tabelas:**
| Tabela | Descrição |
|--------|-----------|
| `projects_core` | Registro central de projetos |
| `owners_core` | Donos/responsáveis por projeto |
| `project_flags_core` | Flags por projeto |

---

### 4. TELEMETRY_CORE (BLOCO 33)

**Arquivos:**
- `database/migrate-telemetry-core.sql` - Migrations
- `lib/telemetry-core.ts` - Helpers
- `app/api/core/telemetry/` - APIs

**Tabelas:**
| Tabela | Descrição |
|--------|-----------|
| `telemetry_heartbeats` | Heartbeats dos projetos |
| `telemetry_errors` | Erros capturados |
| `telemetry_metrics` | Métricas customizadas |

---

### 5. HELPDESK_CORE (BLOCO 34)

**Arquivos:**
- `database/migrate-helpdesk-core.sql` - Migrations
- `lib/helpdesk-core.ts` - Helpers
- `components/SupportTicketButton.tsx` - Componente

**Tabelas:**
| Tabela | Descrição |
|--------|-----------|
| `support_tickets` | Tickets de suporte |
| `support_ticket_messages` | Mensagens dos tickets |

---

### 6. ADDONS_CORE

**Arquivos:**
- `database/migrate-user-addons.sql` - Migrations
- `lib/addons-config.ts` - Configuração de add-ons

**Tabelas:**
| Tabela | Descrição |
|--------|-----------|
| `user_addons` | Add-ons comprados pelos usuários |

---

## 🔧 Como Criar um Novo SaaS

### Passo 1: Clonar o Repositório Base
```bash
git clone https://github.com/edueduardo/radar-narcisista.git meu-novo-saas
cd meu-novo-saas
```

### Passo 2: Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
# Editar com as credenciais do novo projeto
```

### Passo 3: Executar Migrations CORE
```sql
-- No Supabase SQL Editor, executar na ordem:
-- 1. migrate-planos-core.sql
-- 2. migrate-oraculo-settings.sql
-- 3. migrate-control-tower.sql
-- 4. migrate-telemetry-core.sql
-- 5. migrate-helpdesk-core.sql
-- 6. migrate-user-addons.sql
```

### Passo 4: Personalizar Features
```sql
-- Adicionar features específicas do novo SaaS
INSERT INTO features (feature_key, nome, descricao, tipo, categoria)
VALUES ('minha_feature', 'Minha Feature', 'Descrição', 'boolean', 'core');
```

### Passo 5: Criar Profiles do Novo SaaS
```sql
-- Criar profile específico
INSERT INTO feature_profiles (profile_key, nome_exibicao, descricao)
VALUES ('meu_saas_pro_v1', 'Pro V1', 'Plano profissional do Meu SaaS');
```

### Passo 6: Configurar Planos
```sql
-- Adicionar ao catálogo
INSERT INTO plan_catalog (slug, nome_exibicao, current_profile_id, preco_mensal_centavos)
VALUES ('pro', 'Profissional', (SELECT id FROM feature_profiles WHERE profile_key = 'meu_saas_pro_v1'), 4990);
```

---

## 📊 Arquitetura de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      GERADOR DE SAAS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  features   │───▶│  profiles   │───▶│  catalog    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────────────────────────────────────────┐       │
│  │           user_subscriptions_core               │       │
│  └─────────────────────────────────────────────────┘       │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │           user_feature_overrides                │       │
│  └─────────────────────────────────────────────────┘       │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────┐       │
│  │         get_effective_features(user_id)         │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Segurança

### RLS (Row Level Security)
Todas as tabelas CORE têm RLS habilitado:
- **features, profiles, catalog**: Leitura pública, escrita apenas admin
- **overrides**: Apenas admin pode ver/editar
- **subscriptions**: Usuário vê a própria, admin vê todas

### Funções SECURITY DEFINER
As funções SQL são `SECURITY DEFINER` para garantir acesso controlado:
- `get_effective_features()` - Acesso seguro às features
- `has_feature()` - Verificação de permissão
- `get_feature_limit()` - Consulta de limites

---

## 📝 Promoções e Cohorts

### Criar uma Promoção (Black Friday)
```sql
-- 1. Criar profile da promoção
INSERT INTO feature_profiles (profile_key, nome_exibicao, tipo_profile, cohort_label, data_inicio, data_fim)
VALUES ('profissional_bf_2025', 'Profissional Black Friday 2025', 'promo', 'black_friday_2025', 
        '2025-11-25', '2025-11-30');

-- 2. Copiar features do profile base com ajustes
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_diario)
SELECT 
  (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_bf_2025'),
  feature_key,
  valor,
  limite_diario * 2  -- Dobrar limites na promoção
FROM feature_profile_features
WHERE profile_id = (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1');
```

### Encerrar uma Promoção
```sql
-- Marcar como não vendável (clientes existentes mantêm o profile)
UPDATE feature_profiles
SET marketable = false
WHERE profile_key = 'profissional_bf_2025';
```

---

## 🔄 Direitos Adquiridos

O sistema garante que clientes antigos mantêm seus direitos:

1. **Profile versionado**: Cada versão de plano é um profile separado
2. **Sem alteração retroativa**: Mudanças em profiles novos não afetam antigos
3. **Overrides individuais**: Compensações podem ser dadas via overrides

---

## 📈 Próximos Passos (BLOCO 36-40)

- [ ] UI Admin completa para PLANOS_CORE
- [ ] Integração com Stripe para checkout
- [ ] Dashboard de métricas de uso de features
- [ ] Sistema de alertas de quota
- [ ] Relatórios de cohorts

---

## 📚 Referências

- `ROADMAP-RADAR.txt` - Roadmap completo do projeto
- `ATLAS-RADAR-NARCISISTA.txt` - Mapa técnico
- `LAMPADA-RADAR.txt` - Decisões e dívidas técnicas
- `docs/PATCH-ORACULO.md` - Regras do Oráculo

---

**Mantido por:** Equipe Radar Narcisista  
**Contato:** suporte@radarnarcisista.com.br
