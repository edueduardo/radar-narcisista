# 🚀 GUIA DE LANÇAMENTO - RADAR NARCISISTA

> **Checklist completo para colocar o sistema em produção**
> Criado em: 06/12/2025
> Status: PRONTO PARA LANÇAMENTO

---

## ✅ PRÉ-REQUISITOS CONCLUÍDOS

| Item | Status |
|------|--------|
| Ciclo 1 - Banco redondo | ✅ 100% |
| Ciclo 2 - Triângulo de Segurança | ✅ 100% |
| Ciclo 3 - FanPage Viva | ✅ 95% |
| Ciclo 4 - Billing/Planos | ✅ 90% |
| Ciclo 5 - Gerador SaaS | ✅ 100% |

---

## 📋 CHECKLIST DE LANÇAMENTO

### 1. SUPABASE (Banco de Dados)

- [ ] Verificar se todas as tabelas existem
- [ ] Executar `SEED_FANPAGE_CONTENT.sql` para dados iniciais
- [ ] Verificar RLS (Row Level Security) ativo
- [ ] Testar autenticação

**Comando para verificar tabelas:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

### 2. STRIPE (Pagamentos)

- [ ] Criar conta Stripe (se não tiver)
- [ ] Criar produtos e preços no Dashboard
- [ ] Configurar webhook
- [ ] Adicionar variáveis de ambiente no Vercel

**Produtos a criar:**

| Plano | Mensal | Anual |
|-------|--------|-------|
| Essencial | R$ 29,90 | R$ 287,00 |
| Completo | R$ 49,90 | R$ 479,00 |
| Profissional | R$ 149,90 | R$ 1.439,00 |

**Variáveis necessárias:**
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ESSENCIAL_MENSAL=price_...
STRIPE_PRICE_ESSENCIAL_ANUAL=price_...
STRIPE_PRICE_COMPLETO_MENSAL=price_...
STRIPE_PRICE_COMPLETO_ANUAL=price_...
STRIPE_PRICE_PROFISSIONAL_MENSAL=price_...
STRIPE_PRICE_PROFISSIONAL_ANUAL=price_...
```

### 3. VERCEL (Deploy)

- [ ] Verificar todas as variáveis de ambiente
- [ ] Verificar domínio configurado
- [ ] Testar build em produção

**URL do painel:** https://vercel.com/radar-narcisista-brs-projects

### 4. IAs (Chat/Oráculo)

- [ ] Configurar pelo menos uma chave de IA
- [ ] Testar chat em produção

**Opções:**
- OpenAI: `OPENAI_API_KEY`
- Groq: `GROQ_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`

### 5. TESTES FINAIS

- [ ] Criar conta de teste
- [ ] Fazer login/logout
- [ ] Criar entrada no diário
- [ ] Fazer Teste de Clareza
- [ ] Testar chat com IA
- [ ] Testar checkout (modo teste)
- [ ] Verificar AlertCenter no dashboard

**Comando para testes automatizados:**
```bash
npm run health-check
npm run test:api
```

---

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### Passo 1: Stripe Dashboard

1. Acesse https://dashboard.stripe.com
2. Vá em **Products** → **Add product**
3. Crie cada plano com preços mensal e anual
4. Copie os `price_id` de cada preço

### Passo 2: Stripe Webhook

1. Vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://radar-narcisista.vercel.app/api/stripe/webhook`
4. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copie o **Signing secret**

### Passo 3: Vercel Environment Variables

1. Acesse https://vercel.com/radar-narcisista-brs-projects
2. Vá em **Settings** → **Environment Variables**
3. Adicione todas as variáveis do Stripe
4. Clique em **Redeploy** para aplicar

### Passo 4: Executar Seed no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo de `database/seeds/SEED_FANPAGE_CONTENT.sql`
4. Execute

### Passo 5: Teste Final

```bash
# Verificar saúde do sistema
npm run health-check

# Testar APIs
npm run test:api

# Abrir em produção
open https://radar-narcisista.vercel.app
```

---

## 🎯 APÓS O LANÇAMENTO

### Monitoramento

- [ ] Configurar alertas no Vercel
- [ ] Monitorar logs de erro
- [ ] Acompanhar métricas do Stripe

### Primeiros usuários

- [ ] Criar conta admin
- [ ] Testar fluxo completo como usuário
- [ ] Coletar feedback

### Marketing

- [ ] Anunciar nas redes sociais
- [ ] Enviar para lista de espera
- [ ] Criar conteúdo de lançamento

---

## 📞 SUPORTE

### Problemas comuns

**Erro de autenticação:**
- Verificar variáveis do Supabase

**Erro no checkout:**
- Verificar variáveis do Stripe
- Verificar webhook configurado

**IA não responde:**
- Verificar chave de IA configurada
- Verificar limites de uso

### Contatos

- **Vercel:** https://vercel.com/support
- **Stripe:** https://support.stripe.com
- **Supabase:** https://supabase.com/support

---

## 🎉 PRONTO PARA LANÇAR!

O sistema está **97% completo**. 

Falta apenas:
1. Configurar Stripe com price_id reais
2. Executar seed de conteúdo
3. Testar fluxo completo

**Tempo estimado:** 30-60 minutos

---

**FIM DO GUIA**
