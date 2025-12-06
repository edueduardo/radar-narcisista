# VARIÁVEIS DE AMBIENTE - RADAR NARCISISTA

> **Guia completo de configuração**
> Copie este conteúdo para seu `.env.local`

---

## SUPABASE (OBRIGATÓRIO)

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave de serviço (service role key) - NUNCA expor no frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## STRIPE (OBRIGATÓRIO PARA PAGAMENTOS)

```env
# Chave secreta do Stripe
STRIPE_SECRET_KEY=sk_live_...

# Chave pública do Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook secret (para processar eventos)
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs dos planos (criar no Stripe Dashboard)
STRIPE_PRICE_ESSENCIAL_MENSAL=price_...
STRIPE_PRICE_ESSENCIAL_ANUAL=price_...
STRIPE_PRICE_COMPLETO_MENSAL=price_...
STRIPE_PRICE_COMPLETO_ANUAL=price_...
STRIPE_PRICE_PROFISSIONAL_MENSAL=price_...
STRIPE_PRICE_PROFISSIONAL_ANUAL=price_...
```

---

## IAs (PELO MENOS UMA OBRIGATÓRIA)

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Groq (alternativa mais barata)
GROQ_API_KEY=gsk_...

# Anthropic Claude (opcional)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## APP (OBRIGATÓRIO)

```env
# URL base da aplicação
NEXT_PUBLIC_APP_URL=https://radar-narcisista.vercel.app

# Nome do app
NEXT_PUBLIC_APP_NAME=Radar Narcisista

# Ambiente
NODE_ENV=production
```

---

## COMO CONFIGURAR O STRIPE

### 1. Criar conta no Stripe
- Acesse https://dashboard.stripe.com
- Crie uma conta ou faça login

### 2. Criar produtos e preços
No Stripe Dashboard:
1. Vá em **Products** → **Add product**
2. Crie os seguintes produtos:

| Produto | Preço Mensal | Preço Anual |
|---------|--------------|-------------|
| Essencial | R$ 29,90/mês | R$ 287,00/ano |
| Completo | R$ 49,90/mês | R$ 479,00/ano |
| Profissional | R$ 149,90/mês | R$ 1.439,00/ano |

3. Para cada preço, copie o `price_id` (começa com `price_`)

### 3. Configurar webhook
1. Vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://seu-dominio.com/api/stripe/webhook`
4. Eventos para ouvir:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. Copie o `Signing secret` (começa com `whsec_`)

### 4. Adicionar variáveis no Vercel
1. Acesse https://vercel.com/radar-narcisista-brs-projects
2. Vá em **Settings** → **Environment Variables**
3. Adicione todas as variáveis acima

---

## VERIFICAR CONFIGURAÇÃO

Após configurar, rode:

```bash
npm run health-check
```

Ou acesse:
- https://radar-narcisista.vercel.app/api/health

---

## MODO TESTE vs PRODUÇÃO

### Stripe Teste
- Chaves começam com `sk_test_` e `pk_test_`
- Use cartão de teste: `4242 4242 4242 4242`

### Stripe Produção
- Chaves começam com `sk_live_` e `pk_live_`
- Processa pagamentos reais

---

**FIM DO GUIA**
