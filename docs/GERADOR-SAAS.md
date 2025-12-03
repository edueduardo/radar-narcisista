# GERADOR DE SAAS - Documentação Completa

> **Versão:** 1.0  
> **Data:** 03/12/2025  
> **Status:** FASE 1 COMPLETA (Doc + UI Admin)

---

## 🎯 VISÃO GERAL

### O que é o GERADOR-DE-SAAS?

O GERADOR-DE-SAAS é um módulo dentro do RADAR-CORE que permite criar novos projetos SaaS completos a partir do código base do Radar Narcisista.

### Relação com RADAR-CORE

```
RADAR-CORE (Projeto Mãe)
    │
    ├── GERADOR-DE-SAAS (Módulo interno)
    │       │
    │       ├── MODO 1: SAAS-TEMATICO
    │       │       └── Projeto com tema específico
    │       │
    │       └── MODO 2: CORE-BRANCO
    │               └── Template neutro
    │
    └── Cada projeto gerado é INDEPENDENTE
```

### Diferença entre SAAS-TEMATICO e CORE-BRANCO

| Aspecto | SAAS-TEMATICO | CORE-BRANCO |
|---------|---------------|-------------|
| **Tema** | Já definido (ex: igrejas, clínicas) | Neutro, sem tema |
| **Textos** | Personalizados para o nicho | Genéricos/placeholders |
| **Uso** | Produto final pronto | Base para personalização |
| **Exemplo** | "Radar Co-Parent" | "CORE-BRANCO-001" |

---

## 🔄 FLUXO DE USO

### Passo a Passo

1. **Admin acessa** `/admin/gerador-saas`
2. **Preenche dados:**
   - Nome do projeto
   - Tipo (SAAS-TEMATICO ou CORE-BRANCO)
   - Descrição
   - Módulos a incluir
3. **Clica em "Criar Projeto"**
4. **Gerador executa:**
   - Copia código do RADAR-CORE
   - Substitui placeholders
   - Gera documentação (TUDO/ATLAS/ROADMAP/TESTES/LÂMPADA)
   - Cria ORIGEM-CORE.txt
5. **Projeto aparece na lista** com ações:
   - Ver instruções
   - Copiar `git clone`
   - Baixar .zip
6. **Projeto é 100% independente** após criação

### Interface Admin

A página `/admin/gerador-saas` contém:
- Formulário de criação
- Lista de projetos gerados (cards)
- Ações por projeto (clone, zip, instruções)
- Informações de origem e versão

---

## 📅 FASES DE IMPLEMENTAÇÃO

### FASE 1: Documentação + UI Admin ✅ COMPLETA
- [x] docs/PATCH-GERADOR-SAAS.md
- [x] docs/GERADOR-SAAS.md
- [x] Página /admin/gerador-saas (UI funcional)
- [x] API /api/gerador-saas
- [x] Serviço lib/gerador-saas-service.ts
- [x] SQL migrate-gerador-saas.sql

### FASE 2: Integração com Infra (FUTURO)
- [ ] Integração com GitHub API
- [ ] Criação automática de repositórios
- [ ] Deploy automático no Vercel
- [ ] Configuração automática do Supabase

### FASE 3: Gerador Avançado (FUTURO)
- [ ] Temas pré-configurados
- [ ] Presets de módulos
- [ ] Wizard de configuração
- [ ] Preview antes de gerar

---

## 📦 MÓDULOS CORE DISPONÍVEIS

### 1. PLANOS_CORE

**Arquivos:**
- `lib/planos-core.ts` - Classe principal e hooks React
- `database/MEGA-SQL-PARTE1.sql` - Migrations SQL

**Tabelas:**
- `features` - Funcionalidades atômicas (diario, chat_ia, relatorios_pdf, etc.)
- `feature_profiles` - Conjuntos versionados de features (free_v1, profissional_v1, etc.)
- `feature_profile_features` - Join entre profiles e features com limites
- `plan_catalog` - Planos visíveis para venda
- `user_feature_overrides` - Ajustes individuais por usuário
- `user_subscriptions_core` - Assinatura ativa do usuário

**Funções SQL:**
- `get_effective_features(user_id)` - Retorna JSON com features efetivas
- `has_feature(user_id, feature_key)` - Verifica se usuário tem acesso

**Como usar em um novo SaaS:**

```typescript
import { PlanosCore, useHasFeature } from '@/lib/planos-core'

// Verificar se usuário tem feature
const planosCore = new PlanosCore()
const hasChat = await planosCore.hasFeature(userId, 'chat_ia')

// Hook React
function MyComponent({ userId }) {
  const { hasAccess, loading } = useHasFeature(userId, 'relatorios_pdf')
  
  if (loading) return <Spinner />
  if (!hasAccess) return <UpgradePrompt />
  
  return <PDFExporter />
}
```

**Conceitos importantes:**

1. **Features atômicas**: Cada funcionalidade é uma feature independente
2. **Profiles versionados**: Permite criar promoções sem afetar clientes existentes
3. **Overrides individuais**: Admin pode dar/remover features de usuários específicos
4. **Direitos adquiridos**: Clientes mantêm o profile que compraram, mesmo que o plano mude

---

### 2. ORACULO_CORE

**Arquivos:**
- `lib/oraculo/` - Módulos do Oráculo
- `database/MEGA-SQL-PARTE1.sql` - Migrations SQL

**Tabelas:**
- `oraculo_settings` - Configurações por usuário/perfil
- `oraculo_instances` - Instâncias multi-tenant
- `oraculo_api_keys` - Chaves de API
- `oraculo_webhooks` - Webhooks configurados
- `oraculo_billing` - Billing por instância
- `oraculo_usage_logs` - Logs detalhados de uso
- `oraculo_alerts` - Alertas automáticos

**Como usar em um novo SaaS:**

O Oráculo pode ser acoplado como módulo de IA conversacional:
- Cada SaaS pode ter suas próprias instâncias
- Billing separado por instância
- Logs e métricas independentes

---

### 3. CONTROL_TOWER

**Arquivos:**
- `lib/control-tower.ts` - Gerenciamento de projetos
- `database/MEGA-SQL-PARTE2.sql` - Migrations SQL

**Tabelas:**
- `projects_core` - Registro central de projetos
- `owners_core` - Donos/responsáveis por projeto

**Uso:**
Console global para gerenciar múltiplos SaaS gerados.

---

### 4. TELEMETRY_CORE

**Arquivos:**
- `database/MEGA-SQL-PARTE2.sql` - Migrations SQL

**Tabelas:**
- `telemetry_heartbeats` - Health checks
- `telemetry_errors` - Erros capturados
- `telemetry_metrics` - Métricas customizadas

**Uso:**
Observabilidade centralizada para todos os SaaS.

---

### 5. HELPDESK_CORE

**Arquivos:**
- `database/MEGA-SQL-PARTE2.sql` - Migrations SQL

**Tabelas:**
- `support_tickets` - Tickets de suporte
- `support_ticket_messages` - Mensagens dos tickets
- `support_impersonation_sessions` - Sessões de impersonação
- `support_impersonation_logs` - Logs de ações durante impersonação

**Uso:**
Sistema de suporte unificado com auditoria completa.

---

### 6. ADDONS_CORE

**Arquivos:**
- `database/MEGA-SQL-PARTE2.sql` - Migrations SQL

**Tabelas:**
- `user_addons` - Créditos e add-ons comprados

**Uso:**
Permite vender créditos extras (ex: mais análises de IA, mais relatórios).

---

## 🏗️ COMO CRIAR UM NOVO SAAS

### Passo 1: Clonar estrutura base

```bash
# Copiar arquivos CORE
cp -r radar-narcisista/lib/planos-core.ts novo-saas/lib/
cp -r radar-narcisista/database/MEGA-SQL-*.sql novo-saas/database/
```

### Passo 2: Executar migrations

```sql
-- No Supabase SQL Editor do novo projeto
-- Executar na ordem:
-- 1. MEGA-SQL-PARTE1.sql
-- 2. MEGA-SQL-PARTE2.sql
-- 3. MEGA-SQL-PARTE3.sql
-- 4. MEGA-SQL-PARTE4.sql
```

### Passo 3: Customizar features

```sql
-- Adicionar features específicas do novo SaaS
INSERT INTO features (feature_key, nome, descricao, tipo, categoria) VALUES
  ('minha_feature', 'Minha Feature', 'Descrição', 'boolean', 'core');

-- Criar profiles específicos
INSERT INTO feature_profiles (profile_key, nome_exibicao, tipo_profile) VALUES
  ('meu_plano_v1', 'Meu Plano', 'padrao');
```

### Passo 4: Configurar Stripe

```typescript
// Atualizar plan_catalog com IDs do Stripe
await supabase.from('plan_catalog').update({
  stripe_price_id_mensal: 'price_xxx',
  stripe_price_id_anual: 'price_yyy'
}).eq('slug', 'meu_plano')
```

---

## 📊 ARQUITETURA DE PLANOS

```
┌─────────────────────────────────────────────────────────────┐
│                      PLAN_CATALOG                           │
│  (Planos visíveis: free, profissional, defesa, white-label) │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FEATURE_PROFILES                         │
│  (Versões: free_v1, profissional_v1, profissional_bf_2025)  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                FEATURE_PROFILE_FEATURES                     │
│  (Join: profile_id + feature_key + valor + limites)         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       FEATURES                              │
│  (Atômicas: diario, chat_ia, relatorios_pdf, etc.)          │
└─────────────────────────────────────────────────────────────┘

                    + OVERRIDES INDIVIDUAIS
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 USER_FEATURE_OVERRIDES                      │
│  (grant, revoke, limit_custom por user_id)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PROMOÇÕES E COHORTS

### Criar promoção Black Friday:

```sql
-- 1. Criar profile promocional
INSERT INTO feature_profiles (profile_key, nome_exibicao, tipo_profile, cohort_label) VALUES
  ('profissional_bf_2025', 'Profissional Black Friday 2025', 'promo', 'bf_2025');

-- 2. Copiar features do profile original com ajustes
INSERT INTO feature_profile_features (profile_id, feature_key, valor, limite_mensal)
SELECT 
  (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_bf_2025'),
  feature_key,
  valor,
  limite_mensal * 2  -- Dobro de limites na promo
FROM feature_profile_features
WHERE profile_id = (SELECT id FROM feature_profiles WHERE profile_key = 'profissional_v1');

-- 3. Quando a promo acabar, apenas marcar como não-marketable
UPDATE feature_profiles SET marketable = false WHERE profile_key = 'profissional_bf_2025';
-- Clientes que já compraram CONTINUAM com esse profile!
```

---

## 🔒 SEGURANÇA

### RLS (Row Level Security)

Todas as tabelas CORE têm RLS habilitado:
- `features`, `feature_profiles`, `plan_catalog`: SELECT público
- `user_feature_overrides`: Apenas admin
- `user_subscriptions_core`: Usuário vê apenas sua assinatura

### Overrides

Mudanças em overrides são logadas para auditoria.

---

## 📝 CHANGELOG

### v1.0.0 (03/12/2025)
- PLANOS_CORE implementado
- ORACULO_CORE implementado
- CONTROL_TOWER implementado
- TELEMETRY_CORE implementado
- HELPDESK_CORE implementado
- ADDONS_CORE implementado
- Documentação inicial

---

## 🚀 PRÓXIMOS PASSOS

### BLOCO 36-40 (Sugestão)
- [ ] UI avançada para admin de planos
- [ ] Relatórios de uso de features
- [ ] Integração completa com Stripe Checkout
- [ ] Webhooks de billing
- [ ] Dashboard de métricas de planos
