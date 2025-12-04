# GERADOR DE SAAS - Documentação Completa

> **Versão:** 1.1  
> **Data:** 04/12/2025  
> **Status:** FASE 1 COMPLETA (Doc + UI Admin) + REGRA GLOBAL DEFINIDA

---

## ⚠️ REGRA GLOBAL CRÍTICA

**TUDO QUE EXISTE NO RADAR = CORE DO GERADOR DE SAAS**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REGRA: O GERADOR DE SAAS herda e reaproveita TODO o design do Radar        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Quando Eduardo falar sobre:                                                 │
│ ├── Admin                                                                   │
│ ├── Dashboards (usuária, profissional, white label)                         │
│ ├── Oráculos (V1/V2)                                                        │
│ ├── Planos, limites, add-ons                                                │
│ ├── Segurança, logs, LGPD, Observabilidade                                  │
│ └── Manuais, documentação                                                   │
│                                                                             │
│ VOCÊ DEVE ASSUMIR:                                                          │
│ 1) Isso faz parte do CORE da plataforma Radar                               │
│ 2) Isso também faz parte do CORE do GERADOR DE SAAS                         │
│ 3) Isso precisa estar documentado para reuso                                │
│                                                                             │
│ NÃO trate "Gerador de SaaS" como só a ÚLTIMA coisa que ele falou.           │
│ Trate como: "O GERADOR herda TODO o design do Radar, por padrão."           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Módulos CORE Compartilhados

| Módulo | Função | Status |
|--------|--------|--------|
| **ORACULO_V2_CORE** | IA de suporte reutilizável | ✅ Definido |
| **PLANOS_CORE** | Sistema de features/perfis/cohorts | ✅ Definido |
| **CONTROL_TOWER** | Gerenciamento de projetos | ✅ Definido |
| **TELEMETRY_CORE** | Observabilidade centralizada | ✅ Definido |
| **HELPDESK_CORE** | Sistema de suporte | ✅ Definido |
| **ADDONS_CORE** | Créditos e add-ons | ✅ Definido |
| **PERSONAS_CORE** | Sistema de Avatares de IA | ✅ Definido |

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

## 🎭 SISTEMA DE PERSONAS (CORE)

Todo SaaS gerado nasce com o sistema de Personas/Avatares de IA.

### Tabelas Copiadas

```sql
-- Provedores reais (visão admin)
ai_providers (key, display_name, status, type, default_model)

-- Avatares/Personas (visão usuário)
ai_personas (slug, display_name, avatar_emoji, short_bio, default_provider_key)

-- Ligação Persona → Contexto
ai_persona_bindings (persona_id, context_type, context_key, allowed_profiles, allowed_plans)

-- Logs de uso
ai_persona_logs (persona_slug, provider_key, context_type, tokens_input, tokens_output)

-- Configurações de transparência
ai_transparency_settings (scope, show_persona_name, show_persona_avatar)
```

### Personas Padrão

| Slug | Nome | Emoji | Provider | Função |
|------|------|-------|----------|--------|
| mentora-calma | Mentora Calma | 🕊️ | OpenAI | Acolhimento |
| analista-logico | Analista Lógico | 🧠 | Claude | Análise |
| guardiao-seguranca | Guardião de Segurança | 🛡️ | OpenAI | Alertas |
| curador-conteudo | Curador de Conteúdo | 📚 | Together | Recomendações |

### O que o Admin do SaaS Filho pode fazer

- ✅ Renomear personas
- ✅ Trocar avatares (emoji ou imagem)
- ✅ Mapear quais menus usam quais personas
- ✅ Limitar personas por plano/perfil
- ✅ Criar novas personas
- ✅ Configurar transparência

### Arquivos Relacionados

- `database/migrate-ai-personas.sql` - Migration completa
- `lib/ai-personas.ts` - Serviço TypeScript
- `app/admin/ia-personas/page.tsx` - Cockpit de Personas
- `components/chat/PersonaSelector.tsx` - Seletor de persona

---

## 🚀 PRÓXIMOS PASSOS

### BLOCO 36-40 (Sugestão)
- [ ] UI avançada para admin de planos
- [ ] Relatórios de uso de features
- [ ] Integração completa com Stripe Checkout
- [ ] Webhooks de billing
- [ ] Dashboard de métricas de planos

### BLOCO 46-50 (Control Hub)
- [ ] Painel único do dono (Control Hub externo)
- [ ] APIs /api/control-plane em cada instância
- [ ] Visão consolidada de IA, planos e custos
- [ ] Billing centralizado

---

## 🔧 PATCH 6 – SAAS GERADOS (SIMBIOSE + INDEPENDÊNCIA)

### Conceito Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RADAR-CORE (Projeto Mãe)                                                    │
│ ├── Módulos CORE (ORACULO_V2_CORE, PLANOS_CORE, etc.)                       │
│ ├── Admin completo                                                          │
│ ├── Dashboards                                                              │
│ └── Docs principais (TUDO, ATLAS, ROADMAP, TESTES, LÂMPADA)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                              ↓ GERADOR DE SAAS ↓                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ SAAS GERADO (INSTÂNCIA)                                                     │
│ ├── Código PRÓPRIO                                                          │
│ ├── Docs PRÓPRIOS (TUDO, ATLAS, ROADMAP, TESTES, LÂMPADA)                   │
│ ├── Banco de dados PRÓPRIO                                                  │
│ └── INDEPENDENTE de updates automáticos do Radar                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### KIT MÍNIMO DE DOCS para cada SaaS Gerado

Cada novo SaaS gerado nasce com:

| Arquivo | Função |
|---------|--------|
| `TUDO PARA O GPT - <NOME>.txt` | Arquivo-mãe com contexto, blocos, decisões |
| `ATLAS-<NOME>.txt` | Mapa de módulos, rotas, tabelas, IAs, planos |
| `ROADMAP-<NOME>.txt` | Blocos 1-5, 6-10, etc. desse SaaS |
| `TESTES-<NOME>.txt` | Como testar rotas, fluxos, IAs, LGPD |
| `LAMPADA-<NOME>.txt` | Ideias, dívidas técnicas, insights futuros |

### Objetivo

O dono do SaaS pode:
1. Pegar só esse KIT
2. Colar no ChatGPT
3. Continuar evoluindo aquele SaaS de forma autônoma
4. Sem precisar voltar ao contexto do Radar

### Fluxo Completo

```
PASSO 1: CONFIGURAÇÃO
├── Admin acessa /admin/gerador-saas
├── Escolhe tema/vertente (ex.: "co-parent", "igrejas")
└── Define: nome, público, perfis, módulos, tom de voz

PASSO 2: GERAÇÃO
├── Clica em "Gerar SaaS"
├── Sistema copia código, substitui placeholders
├── Gera KIT DE DOCS com nome do projeto
└── Cria ORIGEM-CORE.txt (referência à versão do Radar)

PASSO 3: INDEPENDÊNCIA
├── Novo SaaS nasce com código, docs e banco próprios
└── A partir daqui, evolui separadamente do RADAR-CORE

PASSO 4: EVOLUÇÃO AUTÔNOMA
├── Dono pode pegar o KIT, colar no ChatGPT
└── Continuar evoluindo sozinho
```
