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

*Este manual é atualizado regularmente. Última versão: 01/12/2025*
