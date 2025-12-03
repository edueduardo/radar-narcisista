# AI_CONFIG_CORE - Configuração Dinâmica de IAs

> **Versão:** 1.0  
> **Data:** 03/12/2025  
> **Status:** IMPLEMENTADO

---

## 🎯 VISÃO GERAL

O **AI_CONFIG_CORE** é um módulo que permite configurar dinamicamente quais IAs trabalham em cada feature do sistema, por plano, perfil e grupo.

### Relação com PLANOS_CORE

```
PLANOS_CORE                          AI_CONFIG_CORE
    │                                     │
    ├── "Usuário tem acesso ao diário?"   ├── "Qual IA analisa o diário?"
    ├── "Quantas análises por mês?"       ├── "OpenAI ou Claude?"
    └── "Pode exportar PDF?"              └── "Votação colaborativa?"
```

**São COMPLEMENTARES, não conflitantes!**

- **PLANOS_CORE**: Controla **ACESSO** às features
- **AI_CONFIG_CORE**: Controla **QUAL IA** trabalha em cada feature

---

## 📊 TABELAS

### 1. `ai_providers_core`
Lista de provedores de IA disponíveis.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| slug | TEXT | Identificador único (ex: "openai") |
| display_name | TEXT | Nome de exibição |
| status | TEXT | "ativo", "desativado", "em_teste" |
| custo_relativo | NUMERIC | Peso de custo (1.0 = base) |
| api_key_env | TEXT | Variável de ambiente da API key |
| modelo_padrao | TEXT | Modelo padrão (ex: "gpt-4o-mini") |

### 2. `ai_features_core`
Features que usam IA.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| slug | TEXT | Identificador único (ex: "diario_analise") |
| display_name | TEXT | Nome de exibição |
| descricao_curta | TEXT | Descrição |
| categoria | TEXT | Categoria (analise, chat, geracao, admin) |

### 3. `ai_feature_providers_core`
Configuração global de quais IAs podem trabalhar em cada feature.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| feature_id | UUID | FK → ai_features_core |
| provider_id | UUID | FK → ai_providers_core |
| papel | TEXT | "analise", "votacao", "consenso", "geracao" |
| peso | NUMERIC | Peso da IA nesta feature |
| ativo | BOOLEAN | Se está ativo |

### 4. `ai_plan_matrix`
Configuração por PLANO + FEATURE + PERFIL.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| plan_key | TEXT | Plano (free, profissional, premium) |
| feature_id | UUID | FK → ai_features_core |
| provider_id | UUID | FK → ai_providers_core |
| perfil | TEXT | "usuaria", "profissional", "admin" |
| limite_diario | INTEGER | Limite de uso diário |
| limite_mensal | INTEGER | Limite de uso mensal |
| ativo | BOOLEAN | Se está ativo |
| origem | TEXT | "padrao", "promo", "exclusivo" |

### 5. `ai_group_overrides`
Overrides para grupos especiais (Black Friday, beta, VIP).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| group_key | TEXT | Identificador do grupo |
| user_id | UUID | Se preenchido, override só para este usuário |
| plan_key_base | TEXT | Plano base sendo sobrescrito |
| feature_id | UUID | FK → ai_features_core |
| provider_id | UUID | FK → ai_providers_core |
| valido_ate | TIMESTAMPTZ | Data de expiração |

---

## 🔧 FUNÇÃO SQL

### `ai_get_providers_for_context`

Retorna os provedores configurados para um contexto específico.

```sql
SELECT * FROM ai_get_providers_for_context(
  'profissional',    -- plan_key
  'diario_analise',  -- feature_slug
  'usuaria',         -- perfil
  'black_friday_2025', -- group_key (opcional)
  NULL               -- user_id (opcional)
);
```

**Retorna:**
- provider_slug
- provider_name
- papel
- peso
- limite_diario
- limite_mensal
- modelo
- origem

---

## 💻 SERVIÇO TypeScript

### `lib/ai-config-core.ts`

```typescript
import { getAIConfigCore, resolveAIForRequest } from '@/lib/ai-config-core'

// Obter IA para uma requisição
const result = await resolveAIForRequest(
  userId,
  'diario_analise',
  'profissional',
  'usuaria'
)

if (result.allowed) {
  // Usar result.provider.providerSlug
  // Usar result.provider.modelo
}
```

### Métodos disponíveis:

| Método | Descrição |
|--------|-----------|
| `getProvidersForContext()` | Lista providers para um contexto |
| `getPrimaryProvider()` | Obtém o provider principal |
| `checkLimits()` | Verifica limites de uso |
| `logUsage()` | Registra uso de IA |
| `listProviders()` | Lista todos os providers |
| `listFeatures()` | Lista todas as features |
| `updateProviderStatus()` | Atualiza status de provider |
| `updatePlanMatrix()` | Atualiza configuração na matrix |
| `createGroupOverride()` | Cria override de grupo |
| `getFullMatrix()` | Obtém matrix completa |

---

## 🚀 COMO USAR NO ORQUESTRADOR

```typescript
import { resolveAIForRequest } from '@/lib/ai-config-core'

// No handler de API
export async function POST(request: Request) {
  const { userId, planKey } = await getContext()
  
  // 1. Resolver qual IA usar
  const { provider, allowed, reason } = await resolveAIForRequest(
    userId,
    'diario_analise',
    planKey,
    'usuaria'
  )
  
  if (!allowed) {
    return Response.json({ error: reason }, { status: 403 })
  }
  
  // 2. Chamar a IA configurada
  const response = await callAI(provider.providerSlug, provider.modelo, prompt)
  
  // 3. Registrar uso
  await getAIConfigCore().logUsage({
    userId,
    featureSlug: 'diario_analise',
    providerSlug: provider.providerSlug,
    tokensUsados: response.usage.total_tokens,
    custoEstimado: calculateCost(response.usage),
    sucesso: true
  })
  
  return Response.json(response)
}
```

---

## 🔄 INTEGRAÇÃO COM GERADOR DE SAAS

O AI_CONFIG_CORE é um módulo CORE que deve ser incluído em todo SaaS gerado:

1. **Copiar migrations**: `migrate-ai-config-core.sql`
2. **Copiar serviço**: `lib/ai-config-core.ts`
3. **Configurar seed**: Ajustar providers e features para o novo SaaS

---

## 📋 SEED INICIAL

O SQL inclui seed com:

**Provedores:**
- OpenAI GPT
- Anthropic Claude
- Together AI
- xAI Grok
- Google Gemini

**Features:**
- Análise de Diário
- Teste de Clareza
- Chat com Usuária
- Oráculo Admin
- Oráculo Profissional
- Curadoria de Conteúdo
- Relatórios Jurídicos
- Resumo de Chat

**Matrix inicial:**
- Plano FREE: OpenAI, 3/dia, 30/mês
- Plano PROFISSIONAL: OpenAI, 10/dia, 200/mês
- Plano PREMIUM: OpenAI + Claude, 50/dia, 1000/mês
- Admin: Sem limites

---

## ⚠️ SEGURANÇA

- Todas as tabelas têm RLS habilitado
- Apenas ADMIN pode ler/escrever
- Usuária final não tem acesso direto
- Função SQL usa SECURITY DEFINER

---

## 📝 CHANGELOG

### v1.0.0 (03/12/2025)
- Criação das 5 tabelas
- Função `ai_get_providers_for_context`
- Serviço `lib/ai-config-core.ts`
- Seed inicial
- Documentação

---

**FIM DO DOCUMENTO AI_CONFIG_CORE**
