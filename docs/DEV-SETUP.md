# 🛠️ DEV SETUP GUIDE – Radar Narcisista

> Guia completo para rodar o projeto localmente.

---

## 📋 Pré-requisitos

### Software Necessário

| Software | Versão | Link |
|----------|--------|------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (vem com Node) |
| Git | 2.30+ | https://git-scm.com |

### Contas Necessárias

| Serviço | Uso | Link |
|---------|-----|------|
| Supabase | Banco + Auth | https://supabase.com |
| Stripe | Pagamentos | https://stripe.com |
| OpenAI ou Anthropic | IA | https://openai.com |

---

## 🚀 Instalação Rápida

```bash
# 1. Clonar repositório
git clone https://github.com/edueduardo/radar-narcisista.git
cd radar-narcisista

# 2. Instalar dependências
npm install

# 3. Copiar arquivo de ambiente
cp .env.example .env.local

# 4. Editar .env.local com suas chaves
# (veja seção abaixo)

# 5. Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 🔐 Configuração de Variáveis de Ambiente

### Arquivo `.env.local`

```env
# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# STRIPE
# ===========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ===========================================
# IA (escolha um)
# ===========================================
OPENAI_API_KEY=sk-...
# ou
ANTHROPIC_API_KEY=sk-ant-...

# ===========================================
# APP
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Onde Encontrar as Chaves

#### Supabase
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em Settings → API
4. Copie `URL`, `anon key` e `service_role key`

#### Stripe
1. Acesse https://dashboard.stripe.com
2. Vá em Developers → API keys
3. Copie as chaves de teste

#### OpenAI
1. Acesse https://platform.openai.com
2. Vá em API Keys
3. Crie uma nova chave

---

## 🗄️ Configuração do Banco de Dados

### Opção 1: Usar Migrações (Recomendado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref SEU_PROJECT_REF

# Rodar migrações
supabase db push
```

### Opção 2: SQL Manual

1. Acesse o SQL Editor do Supabase
2. Execute os scripts em `database/` na ordem:
   - `schema.sql` (se existir)
   - `seeds/*.sql`

### Opção 3: Usar Backup

Se você recebeu um backup do banco, restaure via Supabase Dashboard.

---

## 👤 Criar Usuários de Teste

### Via Supabase Dashboard

1. Vá em Authentication → Users
2. Clique em "Add User"
3. Crie:

```
Usuária: teste.usuario@radar-narcisista.com.br / Teste123!@#
Admin: admin@radar-narcisista.com.br / Admin123!@#
Pro: profissional@radar-narcisista.com.br / Prof123!@#
```

### Via SQL

Execute o script `database/seeds/SEED_TEST_USERS.sql` no SQL Editor.

---

## 🧪 Rodar Testes

### Testes E2E (Playwright)

```bash
# Instalar browsers do Playwright
npx playwright install

# Rodar testes (modo headless)
npm run test:e2e

# Rodar testes (modo visual)
npx playwright test --headed

# Rodar testes com UI
npx playwright test --ui
```

### Verificar Lint

```bash
npm run lint
```

### Build de Produção

```bash
npm run build
```

---

## 📁 Estrutura de Pastas

```
radar-narcisista/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── recuperar-senha/
│   ├── (dashboard)/       # Área logada
│   │   ├── dashboard/
│   │   ├── diario/
│   │   ├── oraculo/
│   │   └── teste-clareza/
│   ├── admin/             # Painel admin
│   ├── api/               # API Routes
│   └── profissional/      # Área profissional
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   ├── frontpage/        # Componentes da landing
│   └── dashboard/        # Componentes do dashboard
├── lib/                   # Utilitários
│   ├── supabase/         # Cliente Supabase
│   ├── stripe-*.ts       # Lógica Stripe
│   └── utils.ts          # Helpers gerais
├── hooks/                 # React hooks
├── database/              # Scripts SQL
├── supabase/              # Migrações
├── docs/                  # Documentação
├── tests/                 # Testes E2E
└── public/                # Assets estáticos
```

---

## 🔧 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Verifica código |
| `npm run test:e2e` | Roda testes E2E |

---

## 🐛 Troubleshooting

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Supabase connection error"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo

### "Stripe webhook error"
- Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` para testes locais

### "Build failed"
```bash
npm run lint
# Corrija os erros apontados
npm run build
```

---

## 📞 Suporte

Dúvidas técnicas? Entre em contato:

- **Email**: [SEU_EMAIL_AQUI]
- **GitHub**: https://github.com/edueduardo

---

## 🔗 Links Relacionados

- [README (PT)](../README.md)
- [README (EN)](../README-EN.md)
- [Demo Guide](DEMO-GUIDE.md)
- [Asset Data Room](ASSET-DATA-ROOM.md)
- [Manual do Dev](MANUAL-DEV.md)
