# 💻 Manual do Desenvolvedor - Radar Narcisista

> **Versão:** 1.0  
> **Última atualização:** 01/12/2025  
> **Público:** Desenvolvedores do projeto

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | TailwindCSS 4 |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **IA** | OpenAI, Anthropic, Groq |
| **Pagamentos** | Stripe |
| **Deploy** | Vercel |
| **Repositório** | GitHub (edueduardo/radar-narcisista) |

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta Stripe (modo teste)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/edueduardo/radar-narcisista.git
cd radar-narcisista

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Rode o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# IAs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
```

---

## 📁 Estrutura do Projeto

```
radar-narcisista/
├── app/                    # App Router (Next.js 16)
│   ├── admin/              # Painel administrativo
│   ├── api/                # API Routes
│   ├── dashboard/          # Dashboard da usuária
│   ├── dashboard-profissional/  # Dashboard profissional
│   └── ...                 # Outras páginas
├── components/             # Componentes React
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários e configs
├── database/               # Migrations SQL
├── docs/                   # Documentação
├── public/                 # Assets estáticos
└── ...
```

---

## 📚 Arquivos de Referência

### Fonte da Verdade
1. **`TUDO PARA O GPT.txt`** - Histórico completo de implementações
2. **`ATLAS-RADAR-NARCISISTA.txt`** - Mapa técnico do projeto
3. **`ROADMAP-RADAR.txt`** - Roadmap e etapas
4. **`TESTES-RADAR.txt`** - Checklist de testes

### Configurações Importantes
- `app/admin/admin-features-registry.ts` - Registro de features admin
- `lib/plans-config.ts` - Configuração de planos
- `lib/addons-config.ts` - Configuração de add-ons
- `lib/stripe.ts` - Integração Stripe

---

## 🗄️ Banco de Dados

### Tabelas Principais
| Tabela | Descrição |
|--------|-----------|
| `user_profiles` | Perfis de usuários |
| `clarity_tests` | Testes de clareza |
| `journal_entries` | Entradas do diário |
| `chat_messages` | Mensagens do chat |
| `professional_clients` | Conexões profissional-cliente |
| `billing_plans` | Planos de assinatura |
| `beta_feedback` | Feedbacks de beta testers |
| `beta_events` | Eventos de tracking |

### Migrations
```bash
# Migrations ficam em database/migrations/
# Execute no Supabase SQL Editor
```

### RLS (Row Level Security)
Todas as tabelas têm RLS habilitado. Políticas em `database/migrations/`.

---

## 🔌 APIs

### Estrutura
```
app/api/
├── admin/          # APIs administrativas
├── beta/           # Beta feedback e eventos
├── chat/           # Chat com IA
├── stripe/         # Webhooks e checkout
├── professional/   # APIs do profissional
└── ...
```

### Padrão de API
```typescript
// app/api/exemplo/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Lógica da API
  // ...
  
  return NextResponse.json({ data })
}
```

---

## 🤖 Integração com IAs

### Providers
- **OpenAI:** GPT-4, GPT-3.5
- **Anthropic:** Claude
- **Groq:** Llama, Mixtral

### Uso
```typescript
import { generateChatResponse } from '@/lib/ai-chat'

const response = await generateChatResponse({
  messages: [...],
  systemPrompt: '...',
  model: 'gpt-4'
})
```

### Custos
Monitorados em `/admin/custos-ia`. Logs em `ai_usage_logs`.

### Oráculo V2 - IA de Suporte (NOVO)

**Endpoint:** `POST /api/oraculo-v2`

**Request:**
```typescript
interface OraculoRequest {
  question: string           // Pergunta do usuário (obrigatório)
  user_role?: string         // admin, usuaria, profissional, dev, whitelabel
  manual_context?: string    // Contexto adicional
  language?: string          // Idioma (default: pt-BR)
  url_atual?: string         // Página atual
  plan?: string              // Plano do usuário
}
```

**Response:**
```typescript
interface OraculoResponse {
  success: boolean
  response: {
    modo: 'analise' | 'sugestao' | 'alerta' | 'explicacao'
    risco: 'baixo' | 'medio' | 'alto' | 'critico'
    titulo_curto: string
    resposta_principal: string
    passos: string[]
    links_sugeridos: { label: string; url: string }[]
    mensagem_final_seguranca?: string
  }
  meta: {
    latency_ms: number
    tokens_used: number
    model: string
  }
}
```

**Autenticação:** Requer sessão de admin (BLOCO 21-25)

**Logs:** Todas as chamadas são registradas em `oraculo_logs`

**Componente UI:** `<OraculoButton />` em `components/OraculoButton.tsx`

---

## 💳 Stripe

### Fluxo de Checkout
1. Cliente clica em "Assinar"
2. Frontend chama `/api/stripe/checkout`
3. Backend cria Checkout Session
4. Cliente é redirecionado ao Stripe
5. Após pagamento, webhook atualiza banco

### Webhooks
```typescript
// app/api/stripe/webhook/route.ts
// Eventos tratados:
// - checkout.session.completed
// - customer.subscription.updated
// - customer.subscription.deleted
```

---

## 🧪 Testes

### Rodar Testes
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests (Playwright)
```

### Checklist Manual
Veja `TESTES-RADAR.txt` para checklist completo.

---

## 🚀 Deploy

### Automático
Push para `main` → Vercel detecta → Build → Deploy

### Manual
```bash
# Verificar build local
npm run build

# Push para deploy
git push origin main
```

### Variáveis no Vercel
Configure em: Vercel Dashboard → Settings → Environment Variables

---

## 📝 Convenções

### Commits
```
ETAPA X: Descrição curta

- Detalhe 1
- Detalhe 2
```

### Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/xxx` - Features novas

### Código
- TypeScript strict
- ESLint + Prettier
- Componentes funcionais
- Hooks customizados em `/hooks`

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev           # Servidor local
npm run build         # Build de produção
npm run lint          # Verificar lint

# Git
git status
git add -A
git commit -m "mensagem"
git push origin main

# Supabase
npx supabase login
npx supabase db push
```

---

## 🐛 Debug

### Logs
- **Vercel:** Dashboard → Deployments → Logs
- **Supabase:** Dashboard → Logs
- **Local:** Console do navegador + terminal

### Erros Comuns
| Erro | Solução |
|------|---------|
| 401 Unauthorized | Verificar auth/sessão |
| 500 Internal | Ver logs do Vercel |
| RLS violation | Verificar políticas |
| Stripe webhook fail | Verificar secret |

---

## 📞 Suporte

- **Slack:** #dev-radar
- **GitHub Issues:** Para bugs e features
- **Documentação:** `/docs`

---

## 📚 Documentação Relacionada

### Manuais
- [Manual da Usuária](/docs/MANUAL-USUARIA.md)
- [Manual do Profissional](/docs/MANUAL-PROFISSIONAL.md)
- [Manual do Admin](/docs/MANUAL-ADMIN.md)
- [Manual White-Label](/docs/MANUAL-WHITELABEL.md)

### Referência Técnica
- [Variáveis de Ambiente](/docs/ENV-VARIABLES.md)
- [Prompt do Oráculo V2](/docs/ORACULO-V2-PROMPT.md)
- [ORACULO_V2_CORE](/docs/ORACULO-CORE.md) - Núcleo reutilizável do Oráculo
- [Patches do Oráculo](/docs/PATCHES-ORACULO-COMPLETO.md) - Decisões e regras

### Arquivos de Projeto
- `TUDO PARA O GPT.txt` - Histórico completo de implementações
- `ATLAS-RADAR-NARCISISTA.txt` - Mapa técnico do projeto
- `ROADMAP-RADAR.txt` - Roadmap e etapas
- `TESTES-RADAR.txt` - Checklist de testes
- `LAMPADA-RADAR.txt` - Bugs, dívidas técnicas e ideias

### APIs Principais
| Endpoint | Método | Descrição |
|----------|--------|----------|
| `/api/health` | GET | Healthcheck do sistema |
| `/api/oraculo-v2` | POST | IA de suporte (admin) |
| `/api/addons` | GET | Lista add-ons do usuário |
| `/api/addons/consume` | POST | Consome créditos |
| `/api/stripe/webhook` | POST | Webhooks do Stripe |
| `/api/stripe/checkout` | POST | Criar checkout |
| `/api/chat` | POST | Chat com Coach IA |
| `/api/evaluate-clarity` | POST | Avaliar teste de clareza |

---

---

## 🔮 ORACULO_V2_CORE

O núcleo reutilizável do Oráculo V2 está em `lib/oraculo-core.ts`.

### Uso Básico
```typescript
import { callOraculo } from '@/lib/oraculo-core'

const result = await callOraculo({
  user_role: 'admin',
  question: 'Como funciona o rate limiting?',
  plan: 'enterprise'
}, process.env.OPENAI_API_KEY!)

if (result.success) {
  console.log(result.response?.resposta_principal)
}
```

### Perfis Suportados
- `admin` - Administrador/dono do produto
- `usuaria` - Usuária final
- `profissional` - Psicólogo, advogado, etc.
- `dev` - Desenvolvedor
- `whitelabel` - Parceiro whitelabel

Ver documentação completa: [docs/ORACULO-CORE.md](/docs/ORACULO-CORE.md)

---

## 🎭 SISTEMA DE PERSONAS / AVATARES DE IA

O Radar usa um sistema de **Personas** para separar a visão do usuário da visão do admin.

### Conceito Principal

| Camada | Quem vê | Exemplo |
|--------|---------|---------|
| **PROVIDERS** | Admin | OpenAI, Claude, Together, Grok |
| **PERSONAS** | Usuário | Mentora Calma, Analista Lógico |

### Tabelas do Banco

```sql
-- Provedores reais (visão admin)
ai_providers (key, display_name, status, type)

-- Avatares/Personas (visão usuário)
ai_personas (slug, display_name, avatar_emoji, short_bio, default_provider_key)

-- Ligação Persona → Contexto
ai_persona_bindings (persona_id, context_type, context_key, allowed_profiles, allowed_plans)

-- Logs de uso
ai_persona_logs (persona_slug, provider_key, context_type, tokens_input, tokens_output)

-- Configurações de transparência
ai_transparency_settings (scope, show_persona_name, show_persona_avatar)
```

### Uso no Código

```typescript
import { getActivePersonasForContext, resolveProviderForPersona } from '@/lib/ai-personas'

// Obter personas para o chat
const personas = await getActivePersonasForContext({
  contextType: 'chat',
  contextKey: 'chat_geral',
  userRole: 'usuaria',
  planKey: 'profissional'
})

// Resolver provider real para uma persona
const provider = await resolveProviderForPersona('mentora-calma')
// Retorna: { key: 'openai', display_name: 'OpenAI GPT-4', ... }
```

### Componentes React

```tsx
import { PersonaSelector, PersonaAvatar, usePersona } from '@/components/chat/PersonaSelector'

// Seletor de persona
<PersonaSelector 
  contextType="chat" 
  contextKey="chat_geral"
  onPersonaChange={(persona) => setSelectedPersona(persona)}
/>

// Avatar da persona em mensagens
<PersonaAvatar persona={selectedPersona} size="md" showName />

// Hook para usar persona
const { persona, loading } = usePersona('chat', 'chat_geral')
```

### Personas Padrão

| Slug | Nome | Emoji | Provider | Função |
|------|------|-------|----------|--------|
| mentora-calma | Mentora Calma | 🕊️ | OpenAI | Acolhimento |
| analista-logico | Analista Lógico | 🧠 | Claude | Análise |
| guardiao-seguranca | Guardião de Segurança | 🛡️ | OpenAI | Alertas |
| curador-conteudo | Curador de Conteúdo | 📚 | Together | Recomendações |
| oraculo-admin | Oráculo do Sistema | 🔮 | OpenAI | Admin only |

### Transparência

- **Transparência LIGADA**: Usuário vê nome + avatar + bio da persona
- **Transparência DESLIGADA**: Usuário vê apenas "Assistente do Radar"
- **Admin SEMPRE vê**: Provider real + persona + logs completos

Ver documentação completa: [docs/PATCH-AI-PERSONAS.md](/docs/PATCH-AI-PERSONAS.md)

---

## 📊 SISTEMA DE PLANOS E FEATURES

O sistema de planos usa **Feature Profiles** para controlar acesso.

### Tabelas do Banco

```sql
-- Features atômicas
features (feature_key, nome, tipo, categoria)

-- Perfis de features
feature_profiles (profile_key, nome_exibicao, tipo_profile)

-- Relacionamento
feature_profile_features (profile_id, feature_key, valor, limite_diario)

-- Catálogo de planos
plan_catalog (slug, nome_exibicao, current_profile_id, preco_mensal_centavos)

-- Assinaturas
user_subscriptions_core (user_id, plan_slug, feature_profile_id, status)

-- Overrides individuais
user_feature_overrides (user_id, feature_key, override_type, valor)
```

### Uso no Código

```typescript
// Verificar se usuário tem feature
const hasFeature = await supabase.rpc('has_feature', {
  p_user_id: userId,
  p_feature_key: 'oraculo_v2'
})

// Obter limite de feature
const limit = await supabase.rpc('get_feature_limit', {
  p_user_id: userId,
  p_feature_key: 'chat_ia',
  p_periodo: 'diario'
})
```

Ver documentação completa: [docs/CONTROL-PLANE.md](/docs/CONTROL-PLANE.md)

---

*Este manual é atualizado regularmente. Última versão: 03/12/2025*
