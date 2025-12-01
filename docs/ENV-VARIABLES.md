# 🔐 Variáveis de Ambiente - Radar Narcisista

> **Versão:** 1.0  
> **Última atualização:** 01/12/2025  
> **ETAPA 21:** Billing Sólido & Add-ons

---

## 📋 Variáveis Obrigatórias

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe
```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### App
```env
NEXT_PUBLIC_APP_URL=https://radarnarcisista.com.br
```

---

## 💳 Variáveis de Planos (Stripe)

### Plano Essencial
```env
STRIPE_PRICE_ESSENCIAL_MENSAL=price_xxx
STRIPE_PRICE_ESSENCIAL_ANUAL=price_xxx
```

### Plano Premium
```env
STRIPE_PRICE_PREMIUM_MENSAL=price_xxx
STRIPE_PRICE_PREMIUM_ANUAL=price_xxx
```

---

## 🛒 Variáveis de Add-ons (Stripe)

> **IMPORTANTE:** Criar estes Price IDs no Stripe Dashboard como "one-time" (pagamento único)

```env
# Créditos de Chat
STRIPE_PRICE_ADDON_CHAT_50=price_xxx      # +50 mensagens - R$9,90
STRIPE_PRICE_ADDON_CHAT_200=price_xxx     # +200 mensagens - R$29,90

# Créditos de Diário
STRIPE_PRICE_ADDON_DIARIO_10=price_xxx    # +10 entradas - R$4,90

# Features Avulsas
STRIPE_PRICE_ADDON_PDF_EXPORT=price_xxx   # Exportar PDF - R$4,90
STRIPE_PRICE_ADDON_RELATORIO=price_xxx    # Relatório Completo - R$19,90

# Pacotes
STRIPE_PRICE_ADDON_KIT_SEGURANCA=price_xxx      # Kit Segurança - R$14,90
STRIPE_PRICE_ADDON_KIT_DOCUMENTACAO=price_xxx   # Kit Documentação - R$24,90
```

---

## 🤖 Variáveis de IA

```env
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GROQ_API_KEY=gsk_xxx
```

---

## 📊 Mapeamento addon_key ↔ Stripe Price ID

| addon_key | Nome | Preço | Stripe Price ID |
|-----------|------|-------|-----------------|
| `chat-50` | +50 Mensagens Coach IA | R$9,90 | `STRIPE_PRICE_ADDON_CHAT_50` |
| `chat-200` | +200 Mensagens Coach IA | R$29,90 | `STRIPE_PRICE_ADDON_CHAT_200` |
| `diario-10` | +10 Entradas no Diário | R$4,90 | `STRIPE_PRICE_ADDON_DIARIO_10` |
| `pdf-export` | Exportar PDF (Avulso) | R$4,90 | `STRIPE_PRICE_ADDON_PDF_EXPORT` |
| `relatorio-completo` | Relatório Completo | R$19,90 | `STRIPE_PRICE_ADDON_RELATORIO` |
| `kit-seguranca` | Kit Segurança | R$14,90 | `STRIPE_PRICE_ADDON_KIT_SEGURANCA` |
| `kit-documentacao` | Kit Documentação Legal | R$24,90 | `STRIPE_PRICE_ADDON_KIT_DOCUMENTACAO` |

---

## 🔄 Fluxo de Compra de Add-on

1. Usuário clica em "Comprar" na loja
2. Frontend chama `POST /api/stripe/addon-checkout` com `{ addonId }`
3. Backend cria Checkout Session no Stripe (mode: 'payment')
4. Usuário é redirecionado para Stripe Checkout
5. Após pagamento, Stripe envia webhook `checkout.session.completed`
6. Webhook processa e insere registro em `user_addons`
7. Usuário é redirecionado para `/loja/sucesso`

---

## 🗄️ Tabela user_addons

```sql
CREATE TABLE user_addons (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  addon_key TEXT NOT NULL,           -- Corresponde ao id em addons-config.ts
  stripe_price_id TEXT,
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'active',      -- active, expired, cancelled, refunded
  credits_total INTEGER,
  credits_remaining INTEGER,
  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,            -- NULL = permanente
  metadata JSONB
);
```

---

## ✅ Checklist de Configuração

- [ ] Criar Price IDs no Stripe Dashboard para cada add-on
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Executar migration `migrate-user-addons.sql` no Supabase
- [ ] Configurar webhook no Stripe apontando para `/api/stripe/webhook`
- [ ] Testar fluxo de compra em modo teste

---

*Este documento é atualizado conforme novas variáveis são adicionadas.*
