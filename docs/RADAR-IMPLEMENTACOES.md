# RADAR NARCISISTA - LOG DE IMPLEMENTAÇÕES MVP

**Data de início:** 29/11/2025  
**Desenvolvedor:** Windsurf AI (Cascade)  
**Objetivo:** Fechar MVP com funcionalidades coerentes e funcionando

---

## ETAPA 1 – Auditoria

### Rotas Principais Encontradas

| Rota | Arquivo | Status |
|------|---------|--------|
| `/` | `app/page.tsx` (97KB) | ✅ Implementada com i18n parcial |
| `/teste-clareza` | `app/teste-clareza/page.tsx` | ✅ Implementada |
| `/teste-clareza/resultado` | `app/teste-clareza/resultado/page.tsx` | ✅ Implementada + Gate de login |
| `/diario` | `app/diario/page.tsx` | ✅ Implementada |
| `/diario/novo` | `app/diario/novo/page.tsx` | ✅ Implementada |
| `/chat` | `app/chat/page.tsx` (89KB) | ✅ Implementada com contexto de clareza |
| `/dashboard` | `app/dashboard/page.tsx` | ✅ Implementada |
| `/planos` | `app/planos/page.tsx` | ✅ Implementada |
| `/loja` | `app/loja/page.tsx` | ✅ Implementada (usa AddonsStore) |
| `/profissional` | `app/profissional/page.tsx` | ✅ Implementada (waitlist) |
| `/configuracoes` | `app/configuracoes/page.tsx` | ✅ Implementada com LGPD |

### Arquivos de i18n

| Arquivo | Função |
|---------|--------|
| `lib/i18n.ts` (36KB) | Traduções PT/EN/ES |
| `hooks/useFrontpageI18n.ts` | Hook para homepage |
| `components/LanguageSelector.tsx` | Seletor de idioma |

### Arquivos de Planos

| Arquivo | Função |
|---------|--------|
| `lib/plans-config.ts` (11KB) | Configuração dos 5 planos |
| `lib/plan-limits.ts` (10KB) | Funções de verificação de limites |
| `hooks/usePlanLimits.ts` | Hook para usar limites |

### Pasta de Migrations

**Localização:** `database/migrations/`

| Arquivo | Função |
|---------|--------|
| `20241129_add_clarity_profile_base.sql` | Campos is_profile_base, user_narrative, etc. |
| `20241129_add_clarity_extra_fields.sql` | Campos category_scores, axis_scores, summary |
| `20241129_add_diary_clarity_fields.sql` | Campos entry_type, clarity_test_id |
| `20241129_create_waitlist.sql` | Tabela waitlist para /profissional |
| `004_create_document_hashes.sql` | Hashes de documentos PDF |

### Observações da Auditoria

1. **LGPD:** Já implementada em `/configuracoes` com:
   - `exportUserData()` - Exporta todos os dados do usuário
   - `deleteAccount()` - Apaga todos os dados e faz logout

2. **Limites por Plano:** Funções existem em `lib/plan-limits.ts` mas **NÃO ESTÃO SENDO USADAS** nas páginas principais (chat, diário, teste).

3. **i18n:** Parcialmente implementado na homepage. Maioria das outras páginas ainda hardcoded em PT-BR.

4. **Loja:** Usa componente `AddonsStore` - precisa verificar se itens são reais ou placeholders.

5. **Profissional:** Waitlist funcional via `/api/waitlist`.

---

## ETAPA 2 – Migrations

### Migrations Existentes

1. **20241129_add_clarity_profile_base.sql**
   - Adiciona: `is_profile_base`, `user_narrative`, `overall_percentage`, `has_physical_risk`, `test_type`
   - Cria índice e trigger para garantir um único perfil base por usuário

2. **20241129_add_clarity_extra_fields.sql**
   - Adiciona: `category_scores` (JSONB), `axis_scores` (JSONB), `ip_hash`, `summary`, `completed_at`

3. **20241129_add_diary_clarity_fields.sql**
   - Adiciona: `entry_type`, `clarity_test_id` em `journal_entries`

4. **20241129_create_waitlist.sql**
   - Cria tabela `waitlist` com RLS
   - Políticas: qualquer um pode inserir, apenas admins podem ver

### Como Executar as Migrations

**Opção 1: Via Supabase Dashboard**
1. Acesse https://app.supabase.com
2. Selecione o projeto Radar Narcisista
3. Vá em SQL Editor
4. Cole e execute cada arquivo SQL na ordem:
   - 20241129_add_clarity_profile_base.sql
   - 20241129_add_clarity_extra_fields.sql
   - 20241129_add_diary_clarity_fields.sql
   - 20241129_create_waitlist.sql

**Opção 2: Via CLI (se configurado)**
```bash
supabase db push
```

### Schema Final Esperado

**Tabela: clarity_tests**
- id, user_id, created_at
- fog_score, fear_score, limits_score (0-16)
- global_zone (ATENCAO/ALERTA/VERMELHA)
- raw_answers (JSONB)
- summary (TEXT)
- is_profile_base (BOOLEAN) - NOVO
- user_narrative (TEXT) - NOVO
- overall_percentage (DECIMAL) - NOVO
- has_physical_risk (BOOLEAN) - NOVO
- category_scores (JSONB) - NOVO
- axis_scores (JSONB) - NOVO

**Tabela: journal_entries**
- id, user_id, created_at, updated_at, deleted_at
- title, context, content, mood_intensity, highlight, tags[]
- entry_type (TEXT) - NOVO
- clarity_test_id (UUID FK) - NOVO

**Tabela: waitlist**
- id, email, source, created_at
- notified_at, converted_at, metadata (JSONB)

---

## ETAPA 3 – LGPD

### Status: ✅ JÁ IMPLEMENTADA

**Localização:** `app/configuracoes/page.tsx`

### Funcionalidades Implementadas

1. **Exportar Dados (linhas 127-171)**
   - Função: `exportUserData()`
   - Coleta: clarity_tests, journal_entries, ai_chat_sessions, ai_messages
   - Formato: JSON com download automático
   - Nome do arquivo: `radar-narcisista-export-YYYY-MM-DD.json`

2. **Apagar Conta (linhas 173-197)**
   - Função: `deleteAccount()`
   - Apaga de: ai_messages, ai_chat_sessions, journal_entries, clarity_tests, user_settings, user_profiles
   - Faz logout após apagar
   - Redireciona para homepage

3. **Solicitar Correção (linhas 199-246)**
   - Função: `handleCorrectionSubmit()`
   - Abre cliente de e-mail com template preenchido
   - Destino: privacidade@radarnarcisista.br

### Tabelas Afetadas pela Exclusão

| Tabela | Ação |
|--------|------|
| ai_messages | DELETE |
| ai_chat_sessions | DELETE |
| journal_entries | DELETE |
| clarity_tests | DELETE |
| user_settings | DELETE |
| user_profiles | DELETE |

### Recomendações de Teste

1. Criar usuário de teste
2. Fazer: 1 teste de clareza, 1 entrada no diário, 1 conversa no chat
3. Ir em `/configuracoes`
4. Clicar em "Exportar meus dados" → verificar se JSON contém tudo
5. Clicar em "Apagar minha conta" → verificar se deslogou e dados sumiram

---

## ETAPA 4 – Limites por Plano

### Status: ⚠️ PARCIALMENTE IMPLEMENTADO

### O que Existe

**Arquivo:** `lib/plan-limits.ts`

Funções implementadas:
- `countTodayMessages(userId)` - Conta mensagens de chat hoje
- `countMonthDiaryEntries(userId)` - Conta entradas do diário no mês
- `countMonthTests(userId)` - Conta testes no mês
- `checkChatLimit(planLevel, currentMessages)` - Verifica limite de chat
- `checkDiaryLimit(planLevel, currentEntries)` - Verifica limite de diário
- `checkTestLimit(planLevel, currentTests)` - Verifica limite de testes
- `checkPdfExportAccess(planLevel)` - Verifica acesso a PDF

**Hook:** `hooks/usePlanLimits.ts`
- Retorna: planLevel, planName, limits, usage, isLoading

### Implementação Concluída

As verificações de limite agora estão sendo usadas:

| Página | Hook Usado | Status |
|--------|------------|--------|
| `/chat` | `usePlanLimits().canSendMessage` | ✅ IMPLEMENTADO |
| `/diario/novo` | `usePlanLimits().canCreateEntry` | ✅ IMPLEMENTADO |
| `/teste-clareza` | `checkTestLimit()` | ⚠️ PENDENTE |

**Comportamento:**
- Quando limite é atingido → Modal aparece com:
  - Mensagem clara sobre o limite
  - Opção de aguardar reset
  - Botão para ver planos (upgrade)

### Limites Configurados por Plano

| Plano | Testes/mês | Diário/mês | Chat/dia | PDF |
|-------|------------|------------|----------|-----|
| Visitante | 1 | 0 | 0 | ❌ |
| Guardar | ∞ | 3 | 5 | ❌ |
| Jornada | ∞ | ∞ | 50 | ✅ |
| Defesa | ∞ | ∞ | ∞ | ✅ |

### PENDÊNCIA: Implementar verificação de limites

Precisa adicionar verificação em:
1. `app/chat/page.tsx` - Antes de enviar mensagem
2. `app/diario/novo/page.tsx` - Antes de criar entrada
3. `app/teste-clareza/page.tsx` - Antes de iniciar teste (para visitante)

---

## ETAPA 5 – Idiomas, Loja, Profissional

### 5.1 i18n

**Status:** ⚠️ PARCIAL

| Página | i18n | Observação |
|--------|------|------------|
| Homepage (`/`) | ✅ Parcial | Hero, Como Funciona, Ferramentas, Planos |
| Teste de Clareza | ❌ | Hardcoded PT-BR |
| Resultado | ❌ | Hardcoded PT-BR |
| Diário | ❌ | Hardcoded PT-BR |
| Chat | ❌ | Hardcoded PT-BR |
| Dashboard | ❌ | Hardcoded PT-BR |
| Planos | ❌ | Hardcoded PT-BR |

**Seletor de Idioma:** Existe em `components/LanguageSelector.tsx`

### 5.2 Loja

**Status:** ✅ IMPLEMENTADA

- Página: `app/loja/page.tsx`
- Componente: `components/AddonsStore.tsx`
- Usa hook `usePlanLimits` para mostrar plano atual
- Banner promocional com cupom BEMVINDA
- FAQ sobre créditos

**PENDÊNCIA:** Verificar se AddonsStore tem itens reais ou placeholders.

### 5.3 Profissional

**Status:** ✅ IMPLEMENTADA (Waitlist)

- Página: `app/profissional/page.tsx`
- API: `/api/waitlist`
- Coleta: email, source='profissional'
- Grava na tabela `waitlist`
- Texto claro: "Em breve", "Lista de interesse"

---

## ETAPA 6 – Testes Manuais

### Pendente

Fluxos a testar:
- [ ] Homepage em PT/EN/ES
- [ ] Criar conta → Teste de clareza → Resultado → Guardar como base
- [ ] Dashboard com recomendações
- [ ] Criar diário a partir da base
- [ ] Chat com contexto do teste
- [ ] Exportar dados (LGPD)
- [ ] Apagar conta (LGPD)
- [ ] Limites por plano (após implementação)

---

## RESUMO DO STATUS

| Área | Status | Observação |
|------|--------|------------|
| Migrations | ✅ Prontas | Precisam ser executadas no Supabase |
| LGPD | ✅ Implementada | Exportar + Apagar funcionais |
| Limites por Plano | ⚠️ Parcial | Funções existem, mas não são usadas |
| i18n | ⚠️ Parcial | Só homepage tem tradução |
| Loja | ✅ Implementada | Verificar itens reais |
| Profissional | ✅ Implementada | Waitlist funcional |
| Gate de Login | ✅ Implementada | Bloqueia resultado sem conta |

---

## PRÓXIMOS PASSOS

1. **CRÍTICO:** Executar migrations no Supabase
2. **IMPORTANTE:** Implementar verificação de limites nas páginas
3. **DESEJÁVEL:** Expandir i18n para outras páginas
4. **DESEJÁVEL:** Verificar itens da loja

---

## ARQUIVOS MODIFICADOS NESTA SESSÃO

| Arquivo | Alteração |
|---------|-----------|
| `app/chat/page.tsx` | Adicionado verificação de limite + modal |
| `app/diario/novo/page.tsx` | Adicionado verificação de limite + modal |
| `app/teste-clareza/resultado/page.tsx` | Gate de login (sessão anterior) |
| `docs/RADAR-IMPLEMENTACOES.md` | Criado |

---

*Última atualização: 29/11/2025 18:45 (UTC-5)*
