# 🔮 ORACULO_V2_CORE - Documentação Técnica

> **Versão:** 1.0  
> **Criado em:** 01/12/2025 (ETAPA 27)  
> **Arquivo:** `lib/oraculo-core.ts`

---

## 📋 Visão Geral

O `ORACULO_V2_CORE` é o núcleo reutilizável do Oráculo V2, responsável por:

- Construção de prompts personalizados por perfil
- Chamada à API da OpenAI
- Formatação padronizada de respostas
- Tratamento de erros

Este módulo foi projetado para ser:
- **Reutilizável** em diferentes partes do Radar Narcisista
- **Acoplável** ao Gerador de SaaS
- **Extensível** para novos perfis e funcionalidades

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    API /api/oraculo-v2                       │
│  (autenticação, rate limiting, logging, validações)          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   ORACULO_V2_CORE                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ buildSystemPrompt│  │ buildUserContext│  │ callOraculo │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              PROMPTS POR PERFIL                          ││
│  │  admin | usuaria | profissional | dev | whitelabel       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      OpenAI API                              │
│                    (gpt-4o-mini)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Tipos Exportados

### OraculoUserRole
```typescript
type OraculoUserRole = 'admin' | 'usuaria' | 'profissional' | 'dev' | 'whitelabel'
```

### OraculoRequest
```typescript
interface OraculoRequest {
  user_role: OraculoUserRole  // Perfil do usuário
  question: string            // Pergunta do usuário
  plan?: string               // Plano atual (free, pro, etc.)
  url_atual?: string          // Página onde a pergunta foi feita
  manual_context?: string     // Contexto adicional
  language?: string           // Idioma (default: pt-BR)
}
```

### OraculoResponse
```typescript
interface OraculoResponse {
  modo: 'analise' | 'sugestao' | 'alerta' | 'explicacao'
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  titulo_curto: string        // Max 50 caracteres
  resposta_principal: string  // Resposta detalhada
  passos: string[]            // Lista de passos sugeridos
  links_sugeridos: { label: string; url: string }[]
  mensagem_final_seguranca?: string  // Apenas se risco alto/critico
}
```

### OraculoResult
```typescript
interface OraculoResult {
  success: boolean
  response?: OraculoResponse
  error?: string
  meta?: {
    latency_ms: number
    tokens_input: number
    tokens_output: number
    model: string
  }
}
```

---

## 🔧 Funções Exportadas

### callOraculo (Principal)

Função principal que chama a IA e retorna resposta formatada.

```typescript
async function callOraculo(
  request: OraculoRequest,
  openaiApiKey: string,
  options?: {
    model?: string        // default: 'gpt-4o-mini'
    temperature?: number  // default: 0.7
    maxTokens?: number    // default: 1000
  }
): Promise<OraculoResult>
```

**Exemplo de uso:**
```typescript
import { callOraculo } from '@/lib/oraculo-core'

const result = await callOraculo(
  {
    user_role: 'admin',
    question: 'Quantos usuários ativos temos?',
    plan: 'enterprise',
    url_atual: '/admin/metricas'
  },
  process.env.OPENAI_API_KEY!
)

if (result.success) {
  console.log(result.response?.resposta_principal)
}
```

### buildSystemPrompt

Constrói o system prompt baseado no perfil.

```typescript
function buildSystemPrompt(userRole: OraculoUserRole): string
```

### buildUserContext

Constrói o contexto da pergunta do usuário.

```typescript
function buildUserContext(request: OraculoRequest): string
```

### parseOraculoResponse

Parseia a resposta da IA para o formato OraculoResponse.

```typescript
function parseOraculoResponse(responseText: string): OraculoResponse
```

---

## 👤 Prompts por Perfil

Cada perfil tem um prompt específico que ajusta o tom e foco das respostas:

| Perfil | Tom | Foco |
|--------|-----|------|
| **admin** | Técnico, direto, estratégico | Métricas, performance, decisões |
| **usuaria** | Acolhedor, empático, cuidadoso | Suporte emocional, orientação |
| **profissional** | Profissional, respeitoso | Uso clínico/jurídico, relatórios |
| **dev** | Técnico, preciso | Código, APIs, debugging |
| **whitelabel** | Profissional, prático | Customização, gestão |

---

## 🔌 Integração com API

A rota `/api/oraculo-v2` usa o core da seguinte forma:

```typescript
// 1. Preparar request
const coreRequest: CoreRequest = {
  user_role: body.user_role || 'admin',
  question: body.question,
  plan: body.plan,
  url_atual: body.url_atual,
  manual_context: body.manual_context,
  language: body.language || 'pt-BR'
}

// 2. Chamar core
const result = await callOraculo(coreRequest, openaiKey)

// 3. Retornar resposta
return NextResponse.json({
  success: true,
  response: result.response,
  meta: result.meta
})
```

---

## 🚀 Uso no Gerador de SaaS

O `ORACULO_V2_CORE` pode ser integrado em qualquer SaaS gerado:

```typescript
// Em qualquer SaaS gerado
import { callOraculo, OraculoUserRole } from '@/lib/oraculo-core'

// Mapear perfis do SaaS para roles do Oráculo
const roleMapping: Record<string, OraculoUserRole> = {
  'usuario_final': 'usuaria',
  'administrador': 'admin',
  'parceiro': 'whitelabel'
}

// Usar o core
const result = await callOraculo({
  user_role: roleMapping[userType],
  question: userQuestion,
  plan: userPlan
}, apiKey)
```

---

## ⚙️ Configurações

### Modelo de IA
- **Padrão:** `gpt-4o-mini`
- **Alternativas:** `gpt-4o`, `gpt-4-turbo`

### Temperatura
- **Padrão:** `0.7`
- **Range:** `0.0` (determinístico) a `1.0` (criativo)

### Max Tokens
- **Padrão:** `1000`
- **Recomendado:** `500-2000` dependendo do caso de uso

---

## 📊 Métricas Retornadas

Toda chamada retorna métricas úteis:

```typescript
meta: {
  latency_ms: 1234,      // Tempo de resposta
  tokens_input: 150,     // Tokens do prompt
  tokens_output: 200,    // Tokens da resposta
  model: 'gpt-4o-mini'   // Modelo usado
}
```

---

## 🔒 Segurança

- O core **NÃO** faz autenticação (responsabilidade da API)
- O core **NÃO** faz rate limiting (responsabilidade da API)
- O core **NÃO** faz logging no banco (responsabilidade da API)
- O core **APENAS** processa a pergunta e retorna resposta

---

## 📁 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `lib/oraculo-core.ts` | Núcleo do Oráculo V2 |
| `app/api/oraculo-v2/route.ts` | API que usa o core |
| `components/OraculoButton.tsx` | Componente UI |
| `docs/ORACULO-V2-PROMPT.md` | Documentação do prompt |
| `docs/PATCHES-ORACULO-COMPLETO.md` | Patches e decisões |

---

*Documentação criada na ETAPA 27 do BLOCO 26-30.*
