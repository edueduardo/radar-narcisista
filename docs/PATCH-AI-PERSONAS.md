# 🎭 PATCH AVATARES / PERSONAS DE IA

> **Versão:** 1.0  
> **Criado em:** 03/12/2025  
> **Prioridade:** Este PATCH define a camada de personas/avatares para IAs do Radar

---

## 📋 VISÃO GERAL

Este PATCH implementa a separação entre:
- **PROVIDERS** (visão admin): OpenAI, Claude, Together, Grok
- **PERSONAS** (visão usuário): Mentora Calma, Analista Lógico, etc.

### Regra Principal
- **Usuária/Profissional/White Label/SaaS Gerado** → Veem apenas PERSONAS (avatares)
- **Admin** → Vê TUDO: providers reais, personas, contextos, logs

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────┐
│                        VISÃO USUÁRIO                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🕊️ Mentora  │  │ 🧠 Analista │  │ 🛡️ Guardião │             │
│  │   Calma     │  │   Lógico    │  │  Segurança  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE PERSONAS                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ai_personas + ai_persona_bindings + ai_transparency      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VISÃO ADMIN                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   OpenAI    │  │   Claude    │  │  Together   │             │
│  │   GPT-4     │  │    3.5      │  │   Llama     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 MODELO DE DADOS

### Tabela: `ai_providers`
Provedores reais de IA (visão ADMIN apenas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| key | TEXT | Ex: "openai", "anthropic" |
| display_name | TEXT | Ex: "OpenAI GPT-4" |
| status | TEXT | active, disabled, testing |
| type | TEXT | llm, embedding, image |
| default_model | TEXT | Modelo padrão |

### Tabela: `ai_personas`
Avatares/Personas (visão USUÁRIO)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| slug | TEXT | Ex: "mentora-calma" |
| display_name | TEXT | Ex: "Mentora Calma" |
| avatar_emoji | TEXT | Ex: "🕊️" |
| short_bio | TEXT | Descrição curta |
| default_provider_key | TEXT | FK para ai_providers |
| roles_visible | TEXT[] | Perfis que veem |
| is_user_visible | BOOLEAN | Se aparece pro usuário |

### Tabela: `ai_persona_bindings`
Ligação Persona → Contexto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| persona_id | UUID | FK para ai_personas |
| context_type | TEXT | Ex: "chat", "diario" |
| context_key | TEXT | Ex: "chat_geral" |
| allowed_profiles | TEXT[] | Perfis permitidos |
| allowed_plans | TEXT[] | Planos permitidos |
| is_default | BOOLEAN | Se é padrão no contexto |
| weight | INTEGER | Peso no modo colaborativo |

### Tabela: `ai_persona_logs`
Logs de uso por persona

| Campo | Tipo | Descrição |
|-------|------|-----------|
| persona_slug | TEXT | Persona utilizada |
| provider_key | TEXT | Provider real |
| context_type | TEXT | Tipo de contexto |
| user_role | TEXT | Role do usuário |
| plan_key | TEXT | Plano do usuário |
| tokens_input | INTEGER | Tokens de entrada |
| tokens_output | INTEGER | Tokens de saída |

### Tabela: `ai_transparency_settings`
Configurações de transparência

| Campo | Tipo | Descrição |
|-------|------|-----------|
| scope | TEXT | global, plan, segment, user |
| show_persona_name | BOOLEAN | Mostrar nome |
| show_persona_avatar | BOOLEAN | Mostrar avatar |
| generic_assistant_name | TEXT | Nome genérico |

---

## 🎭 PERSONAS PADRÃO

| Slug | Nome | Emoji | Provider | Função |
|------|------|-------|----------|--------|
| mentora-calma | Mentora Calma | 🕊️ | OpenAI | Acolhimento emocional |
| analista-logico | Analista Lógico | 🧠 | Claude | Análise estruturada |
| guardiao-seguranca | Guardião de Segurança | 🛡️ | OpenAI | Alertas de risco |
| curador-conteudo | Curador de Conteúdo | 📚 | Together | Recomendações |
| assistente-profissional | Assistente Profissional | 💼 | Claude | Suporte técnico |
| oraculo-admin | Oráculo do Sistema | 🔮 | OpenAI | Admin only |

---

## 🔧 CONFIGURAÇÃO DE TRANSPARÊNCIA

### Modo Transparência LIGADA
```
Usuário vê:
- Avatar + Nome da persona
- Bio curta
- Mensagem: "Respostas geradas por uma equipe de IAs internas"
```

### Modo Transparência DESLIGADA
```
Usuário vê:
- "Assistente do Radar" (nome genérico)
- Sem detalhes de personas
```

### Admin SEMPRE vê
```
- Provider real (OpenAI, Claude, etc.)
- Persona utilizada
- Logs completos
- Tokens, tempo, erros
```

---

## 📁 ARQUIVOS CRIADOS

| Arquivo | Descrição |
|---------|-----------|
| `database/migrate-ai-personas.sql` | Migration completa |
| `lib/ai-personas.ts` | Serviço TypeScript |
| `app/admin/ia-personas/page.tsx` | Cockpit de Personas |
| `docs/PATCH-AI-PERSONAS.md` | Esta documentação |

---

## 🔗 INTEGRAÇÃO COM GERADOR DE SAAS

### O que é copiado para cada SaaS filho:

```
PERSONAS_CORE
├── Tabelas
│   ├── ai_providers
│   ├── ai_personas
│   ├── ai_persona_bindings
│   ├── ai_persona_logs
│   └── ai_transparency_settings
├── Personas padrão
│   ├── Mentora Calma
│   ├── Analista Lógico
│   ├── Guardião de Segurança
│   └── Curador de Conteúdo
└── Configurações
    └── Transparência padrão
```

### Independência do SaaS filho:
- Pode renomear personas
- Pode trocar avatares
- Pode mapear diferentes providers
- Pode criar novas personas

---

## 📊 VIEWS DE ESTATÍSTICAS

| View | Descrição |
|------|-----------|
| `ai_persona_usage_stats` | Uso por persona (30 dias) |
| `ai_provider_usage_stats` | Uso por provider (30 dias) |
| `ai_context_usage_stats` | Uso por contexto (30 dias) |
| `ai_plan_usage_stats` | Uso por plano (30 dias) |

---

## 🚀 COMO USAR

### 1. Obter personas para um contexto
```typescript
import { getActivePersonasForContext } from '@/lib/ai-personas'

const personas = await getActivePersonasForContext({
  contextType: 'chat',
  contextKey: 'chat_geral',
  userRole: 'usuaria',
  planKey: 'profissional'
})
```

### 2. Resolver provider para persona
```typescript
import { resolveProviderForPersona } from '@/lib/ai-personas'

const provider = await resolveProviderForPersona('mentora-calma')
// Retorna: { key: 'openai', display_name: 'OpenAI GPT-4', ... }
```

### 3. Formatar persona para exibição
```typescript
import { formatPersonaForUser } from '@/lib/ai-personas'

const display = await formatPersonaForUser(persona)
// Retorna: { name: 'Mentora Calma', avatar: '🕊️', bio: '...' }
```

### 4. Registrar uso
```typescript
import { logPersonaUsage } from '@/lib/ai-personas'

await logPersonaUsage({
  persona_slug: 'mentora-calma',
  provider_key: 'openai',
  context_type: 'chat',
  tokens_input: 150,
  tokens_output: 300,
  response_time_ms: 1200,
  success: true
})
```

---

## ⚠️ REGRAS IMPORTANTES

1. **NUNCA** mostrar nomes de providers para usuários finais
2. **SEMPRE** usar personas/avatares na interface do usuário
3. **ADMIN** sempre tem visão completa
4. **LOGS** devem registrar tanto persona quanto provider
5. **GERADOR DE SAAS** deve copiar este modelo como CORE

---

*Documento criado em: 03/12/2025*
*Última atualização: 03/12/2025*
