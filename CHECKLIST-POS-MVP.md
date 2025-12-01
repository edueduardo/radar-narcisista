# ✅ CHECKLIST PÓS-MVP 1.0 - Radar Narcisista

> **Versão:** 1.0  
> **Criado em:** 01/12/2025  
> **ETAPA 25:** QA Técnico + Checklist Pós-MVP

---

## 📊 Status do BLOCO 21-25

| ETAPA | Status | Descrição |
|-------|--------|-----------|
| 21 | ✅ | Billing Sólido & Add-ons |
| 22 | ✅ | Oráculo V2 Integrado |
| 23 | ✅ | Segurança Técnica & Observabilidade |
| 24 | ✅ | Manuais & Links Internos |
| 25 | 🔄 | QA Técnico + Checklist Pós-MVP |

---

## 🗄️ Migrations Pendentes

### Executar no Supabase SQL Editor:

1. **user_addons** (ETAPA 21)
   - Arquivo: `database/migrate-user-addons.sql`
   - Status: ⏳ Pendente
   - Prioridade: ALTA

2. **oraculo_logs** (ETAPA 22)
   - Arquivo: `database/migrate-oraculo-logs.sql`
   - Status: ⏳ Pendente
   - Prioridade: MÉDIA

### Verificação pós-execução:
```sql
-- Verificar se tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_addons', 'oraculo_logs');

-- Verificar RLS
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('user_addons', 'oraculo_logs');
```

---

## 🔧 Configurações Pendentes

### Stripe
- [ ] Criar Price IDs para add-ons no Stripe Dashboard
- [ ] Configurar webhook apontando para `/api/stripe/webhook`
- [ ] Testar checkout em modo teste

### Variáveis de Ambiente (Vercel)
- [ ] Verificar `STRIPE_WEBHOOK_SECRET`
- [ ] Verificar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verificar `OPENAI_API_KEY`

---

## 🧪 Testes Manuais

### Fluxo de Usuária
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Teste de Clareza completo
- [ ] Diário: criar, editar, deletar entrada
- [ ] Chat com Coach IA responde
- [ ] Plano de Segurança salva

### Fluxo de Profissional
- [ ] Dashboard profissional carrega
- [ ] Convite de cliente funciona
- [ ] Relatório de cliente gera
- [ ] Exportação CSV funciona

### Fluxo de Admin
- [ ] `/admin` carrega
- [ ] Oráculo V1 mostra métricas
- [ ] Oráculo V2 (botão) responde
- [ ] `/api/health` retorna status

### Fluxo de Pagamento
- [ ] Página de planos carrega
- [ ] Checkout Stripe abre
- [ ] Webhook processa pagamento
- [ ] Add-on registrado em `user_addons`

---

## 📋 Dívidas Técnicas (LAMPADA-RADAR.txt)

| ID | Descrição | Prioridade |
|----|-----------|------------|
| T001 | Testes automatizados | MÉDIA |
| T002 | Documentação de APIs (Swagger) | BAIXA |
| T003 | Logs estruturados em produção | MÉDIA |
| T004 | Monitoramento de erros (Sentry) | ALTA |
| T005 | Rate limiting em mais rotas | MÉDIA |

---

## 🚀 Próximos Passos (BLOCO 26-30)

### Planejado:
1. **Oráculo V2 Multiperfil** - Abrir para usuária, profissional, dev, whitelabel
2. **ORACULO_V2_CORE** - Módulo reutilizável para Gerador de SaaS
3. **Testes Automatizados** - Jest + Playwright
4. **Monitoramento** - Sentry + Logs estruturados
5. **Performance** - Otimizações de bundle e cache

---

## 📊 Métricas de Saúde

| Métrica | Valor | Status |
|---------|-------|--------|
| Build passando | Sim | ✅ |
| Páginas geradas | 163 | ✅ |
| ETAPAs concluídas | 24/25 | 🔄 |
| Bugs críticos | 0 | ✅ |
| Dívidas técnicas | 5 | 🟡 |

---

## 📝 Notas Finais

### O que foi entregue no BLOCO 21-25:
- Sistema de billing de add-ons completo
- IA de suporte interno (Oráculo V2)
- Rate limiting e logging estruturado
- Healthcheck endpoint
- Documentação atualizada e interligada

### O que fica para depois:
- Executar migrations em produção
- Criar Price IDs no Stripe
- Testes automatizados
- Monitoramento com Sentry

---

*Última atualização: 01/12/2025*
