# QA COMPLETO – RADAR NARCISISTA BR

> **Guia de Testes Passo a Passo**
> Criado em: 05/12/2025
> Status: PRONTO PARA EXECUÇÃO

---

## CAMADA 0 – ANTES DE QUALQUER TESTE

### 0.1 Garantir backup de código
```bash
git status
git add . && git commit -m "checkpoint antes dos testes"
```
**Por quê:** Se algo der errado, você volta ao estado anterior.

### 0.2 Verificar variáveis de ambiente
```bash
# Verificar se .env.local existe e tem as chaves necessárias
cat .env.local | grep -E "(SUPABASE|STRIPE|OPENAI|GROQ)"
```

---

## CAMADA 1 – TESTES TÉCNICOS (sem navegador)

### 1.1 Instalar dependências
```bash
npm install
```
**Status:** [ ] OK  [ ] ERRO

### 1.2 Rodar lint
```bash
npm run lint
```
**Resultado esperado:** Warnings são OK, erros críticos não.
**Status:** [ ] OK  [ ] ERRO

### 1.3 Rodar build
```bash
npm run build
```
**Resultado esperado:** Build completo sem erros.
**Status:** [ ] OK  [ ] ERRO

### 1.4 Rodar testes unitários
```bash
npm test
```
**Resultado esperado:** Maioria dos testes passando.
**Status:** [ ] OK  [ ] ERRO (anotar quais falharam)

### 1.5 Rodar testes de API
```bash
npm run test:api
```
**Resultado esperado:** Todas as APIs respondendo.
**Status:** [ ] OK  [ ] ERRO

### 1.6 Rodar health check
```bash
npm run health-check
```
**Resultado esperado:** Todos os serviços online.
**Status:** [ ] OK  [ ] ERRO

---

## CAMADA 2 – BANCO DE DADOS (Supabase)

### 2.1 Verificar conexão com Supabase
- Acessar: https://supabase.com/dashboard
- Verificar se o projeto está online
**Status:** [ ] OK  [ ] ERRO

### 2.2 Verificar tabelas principais existem
No SQL Editor do Supabase, rodar:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Tabelas essenciais que DEVEM existir:**
- [ ] user_profiles
- [ ] user_settings
- [ ] clarity_tests
- [ ] journal_entries
- [ ] risk_alerts
- [ ] safety_plans
- [ ] ai_chat_sessions
- [ ] ai_chat_messages
- [ ] subscriptions
- [ ] plan_catalog

### 2.3 Verificar RLS está ativo
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```
**Resultado esperado:** Tabelas sensíveis com RLS ativo.

---

## CAMADA 3 – SMOKE TEST (navegador)

### 3.1 Subir o app localmente
```bash
npm run dev
```
Abrir: http://localhost:3000

**Status:** [ ] App subiu  [ ] ERRO

### 3.2 Testar páginas públicas
| Página | URL | Status |
|--------|-----|--------|
| Home | / | [ ] OK [ ] ERRO |
| Login | /login | [ ] OK [ ] ERRO |
| Cadastro | /cadastro | [ ] OK [ ] ERRO |
| Manifesto | /manifesto | [ ] OK [ ] ERRO |
| Planos | /planos | [ ] OK [ ] ERRO |
| Termos | /termos | [ ] OK [ ] ERRO |
| Privacidade | /privacidade | [ ] OK [ ] ERRO |

### 3.3 Testar fluxo de autenticação
| Ação | Status |
|------|--------|
| Criar conta nova | [ ] OK [ ] ERRO |
| Fazer login | [ ] OK [ ] ERRO |
| Fazer logout | [ ] OK [ ] ERRO |
| Recuperar senha | [ ] OK [ ] ERRO |

### 3.4 Testar Dashboard (logado)
| Funcionalidade | Status |
|----------------|--------|
| Dashboard carrega | [ ] OK [ ] ERRO |
| AlertCenter aparece | [ ] OK [ ] ERRO |
| Menu lateral funciona | [ ] OK [ ] ERRO |
| Tema claro/escuro | [ ] OK [ ] ERRO |

---

## CAMADA 4 – FUNCIONALIDADES CORE

### 4.1 Diário
| Ação | Status |
|------|--------|
| Criar entrada simples | [ ] OK [ ] ERRO |
| Criar entrada com tags | [ ] OK [ ] ERRO |
| Editar entrada | [ ] OK [ ] ERRO |
| Excluir entrada | [ ] OK [ ] ERRO |
| Ver timeline | [ ] OK [ ] ERRO |

### 4.2 Teste de Clareza
| Ação | Status |
|------|--------|
| Iniciar teste | [ ] OK [ ] ERRO |
| Responder perguntas | [ ] OK [ ] ERRO |
| Ver resultado | [ ] OK [ ] ERRO |
| Resultado salvo no histórico | [ ] OK [ ] ERRO |

### 4.3 Chat/Oráculo
| Ação | Status |
|------|--------|
| Abrir chat | [ ] OK [ ] ERRO |
| Enviar mensagem | [ ] OK [ ] ERRO |
| Receber resposta da IA | [ ] OK [ ] ERRO |
| Histórico de conversas | [ ] OK [ ] ERRO |

### 4.4 Plano de Segurança
| Ação | Status |
|------|--------|
| Acessar plano | [ ] OK [ ] ERRO |
| Criar/editar itens | [ ] OK [ ] ERRO |
| Marcar como concluído | [ ] OK [ ] ERRO |

### 4.5 Triângulo de Segurança (AlertCenter)
| Ação | Status |
|------|--------|
| Criar diário com tag grave | [ ] OK [ ] ERRO |
| Alerta aparece no dashboard | [ ] OK [ ] ERRO |
| Marcar alerta como resolvido | [ ] OK [ ] ERRO |

---

## CAMADA 5 – ADMIN

### 5.1 Acesso Admin
| Ação | Status |
|------|--------|
| Acessar /admin | [ ] OK [ ] ERRO |
| Toggle Demo/Real funciona | [ ] OK [ ] ERRO |

### 5.2 Painéis Admin
| Painel | Status |
|--------|--------|
| /admin/dashboard | [ ] OK [ ] ERRO |
| /admin/usuarios | [ ] OK [ ] ERRO |
| /admin/curadoria | [ ] OK [ ] ERRO |
| /admin/ia-analytics | [ ] OK [ ] ERRO |
| /admin/gerador-saas | [ ] OK [ ] ERRO |

---

## CAMADA 6 – APIs

### 6.1 APIs Públicas
| API | Método | Status |
|-----|--------|--------|
| /api/health | GET | [ ] OK [ ] ERRO |
| /api/status | GET | [ ] OK [ ] ERRO |
| /api/plan-catalog | GET | [ ] OK [ ] ERRO |

### 6.2 APIs Autenticadas
| API | Método | Status |
|-----|--------|--------|
| /api/diario | GET/POST | [ ] OK [ ] ERRO |
| /api/clarity-test | GET/POST | [ ] OK [ ] ERRO |
| /api/chat | POST | [ ] OK [ ] ERRO |
| /api/safety-plan | GET/POST | [ ] OK [ ] ERRO |
| /api/user/profile | GET/PATCH | [ ] OK [ ] ERRO |

---

## CAMADA 7 – TESTES E2E (Playwright)

### 7.1 Rodar testes E2E
```bash
npm run test:e2e
```

### 7.2 Resultados
| Suite | Status |
|-------|--------|
| public-pages.spec.ts | [ ] OK [ ] ERRO |
| auth-flow.spec.ts | [ ] OK [ ] ERRO |
| navigation.spec.ts | [ ] OK [ ] ERRO |
| api-responses.spec.ts | [ ] OK [ ] ERRO |

---

## RESUMO FINAL

### Contagem
- **Testes OK:** ___
- **Testes com ERRO:** ___
- **Testes não executados:** ___

### Erros críticos encontrados:
1. ___
2. ___
3. ___

### Próximas ações:
1. ___
2. ___
3. ___

---

**Data do teste:** ___/___/______
**Testador:** _______________
