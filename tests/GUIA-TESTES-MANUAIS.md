# 🎯 GUIA DE TESTES MANUAIS - RADAR NARCISISTA

Este guia contém checklists e passos para você (Eduardo) testar manualmente cada parte do sistema.

---

## 📋 ÍNDICE

- [BLOCO A - Usuária Final](#bloco-a---usuária-final)
- [BLOCO B - Profissional / Admin](#bloco-b---profissional--admin)
- [BLOCO C - Backend / APIs](#bloco-c---backend--apis)
- [BLOCO D - Banco de Dados / RLS](#bloco-d---banco-de-dados--rls)
- [BLOCO E - Billing / Stripe](#bloco-e---billing--stripe)
- [BLOCO F - Gerador SaaS](#bloco-f---gerador-saas)

---

## BLOCO A - USUÁRIA FINAL

### ✅ CHECKLIST BACKEND - BLOCO A

Antes de testar, garanta que existe no banco:

- [ ] Usuária de teste: `teste.usuario@radar-narcisista.com.br` / `Teste123!@#`
- [ ] 3 entradas no diário (1 leve, 2 com tags graves)
- [ ] 1 teste de clareza respondido
- [ ] Verificar se há risk_alert gerado (se tags graves foram usadas)

### 📝 PASSO A PASSO - BLOCO A (MODO GUIA)

#### A.1 - FRONTPAGE

**O que estamos validando:** A página inicial carrega corretamente com todos os elementos.

1. **Abra** http://localhost:3000/
2. **Feche** o modal de aviso 18+ (clique em "Entendi e Aceito")
3. **Feche** o tutorial (clique em "Pular tutorial")
4. **Verifique:**
   - [ ] Logo "Radar Narcisista" ou "RN" visível no header
   - [ ] Botão "Login" visível
   - [ ] Botão "Cadastro" ou "Start Free" visível
   - [ ] Título principal visível (ex: "You're not imagining things")
   - [ ] Seção de planos visível (scroll para baixo)
   - [ ] Footer com links (Termos, Privacidade, etc.)

#### A.2 - DASHBOARD DA USUÁRIA

**O que estamos validando:** O painel da usuária mostra dados corretos.

1. **Faça login** com a usuária de teste
2. **Acesse** /dashboard
3. **Verifique:**
   - [ ] Contagem de diários está correta
   - [ ] Gráficos carregam (se houver dados)
   - [ ] Indicador de risco aparece (se tags graves foram usadas)
   - [ ] Menu lateral funciona

#### A.3 - DIÁRIO BÁSICO

**O que estamos validando:** CRUD do diário funciona.

1. **Acesse** /diario
2. **Crie** uma nova entrada:
   - Título: "Teste Manual"
   - Conteúdo: "Este é um teste manual do diário"
   - Tags: selecione algumas
3. **Verifique:**
   - [ ] Entrada aparece na lista
   - [ ] Pode editar a entrada
   - [ ] Pode excluir a entrada

#### A.4 - DIÁRIO CRÍTICO (DETECÇÃO DE RISCO)

**O que estamos validando:** Sistema detecta tags graves e gera alerta.

1. **Crie** uma entrada com tags graves:
   - Título: "Situação Grave"
   - Conteúdo: "Estou me sentindo muito mal"
   - Tags: `violencia_fisica`, `ameaca`, `isolamento`
2. **Verifique:**
   - [ ] Sistema mostra aviso de risco
   - [ ] risk_alert foi criado no banco (verificar no Supabase)
   - [ ] Contatos de emergência são exibidos

#### A.5 - ORÁCULO (COACH IA)

**O que estamos validando:** Chat com IA funciona.

1. **Acesse** /chat
2. **Envie** uma mensagem: "Olá, preciso de ajuda"
3. **Verifique:**
   - [ ] IA responde em poucos segundos
   - [ ] Resposta é empática e relevante
   - [ ] Histórico é salvo

---

## BLOCO B - PROFISSIONAL / ADMIN

### ✅ CHECKLIST BACKEND - BLOCO B

- [ ] Usuário admin: `admin@radar-narcisista.com.br` / `Admin123!@#`
- [ ] Usuário profissional: `profissional@radar-narcisista.com.br` / `Prof123!@#`
- [ ] Pelo menos 1 usuária vinculada ao profissional

### 📝 PASSO A PASSO - BLOCO B (MODO GUIA)

#### B.1 - DASHBOARD PROFISSIONAL

**O que estamos validando:** Profissional vê seus casos.

1. **Faça login** como profissional
2. **Acesse** /pro/dashboard ou /profissional
3. **Verifique:**
   - [ ] Lista de casos/clientes aparece
   - [ ] Alertas de risco são destacados
   - [ ] Pode ver detalhes de cada caso

#### B.2 - ADMIN FEATURE FLAGS

**O que estamos validando:** Admin pode ativar/desativar funcionalidades.

1. **Faça login** como admin
2. **Acesse** /admin/configuracoes ou /admin/feature-flags
3. **Verifique:**
   - [ ] Lista de flags aparece
   - [ ] Pode ativar/desativar flags
   - [ ] Mudanças são salvas

---

## BLOCO C - BACKEND / APIs

### ✅ CHECKLIST BACKEND - BLOCO C

- [ ] Servidor rodando em localhost:3000
- [ ] Variáveis de ambiente configuradas (.env.local)

### 📝 PASSO A PASSO - BLOCO C (MODO GUIA)

#### C.1 - API HEALTH

**O que estamos validando:** API está respondendo.

1. **Abra** http://localhost:3000/api/health
2. **Verifique:**
   - [ ] Retorna JSON com `status: "healthy"`

#### C.2 - API PLANS

**O que estamos validando:** API de planos funciona.

1. **Abra** http://localhost:3000/api/plans
2. **Verifique:**
   - [ ] Retorna lista de planos
   - [ ] Cada plano tem nome, preço, features

#### C.3 - API DIÁRIO (AUTENTICADA)

**O que estamos validando:** API protegida requer autenticação.

1. **Abra** http://localhost:3000/api/diario (sem login)
2. **Verifique:**
   - [ ] Retorna 401 ou 403 (não autorizado)

---

## BLOCO D - BANCO DE DADOS / RLS

### ✅ CHECKLIST BACKEND - BLOCO D

- [ ] Supabase conectado
- [ ] Tabelas principais existem (users, diary_entries, etc.)
- [ ] RLS ativado nas tabelas sensíveis

### 📝 PASSO A PASSO - BLOCO D (MODO GUIA)

#### D.1 - VERIFICAR RLS

**O que estamos validando:** Usuário não acessa dados de outros.

1. **No Supabase**, vá em SQL Editor
2. **Execute:**
   ```sql
   -- Como usuário A, tentar ver diário do usuário B
   SELECT * FROM diary_entries WHERE user_id = 'ID_DO_OUTRO_USUARIO';
   ```
3. **Verifique:**
   - [ ] Retorna vazio (RLS bloqueou)

---

## BLOCO E - BILLING / STRIPE

### ✅ CHECKLIST BACKEND - BLOCO E

- [ ] Stripe configurado (modo teste)
- [ ] Produtos/preços criados no Stripe Dashboard
- [ ] Variáveis STRIPE_* no .env.local

### 📝 PASSO A PASSO - BLOCO E (MODO GUIA)

#### E.1 - VER PLANOS

**O que estamos validando:** Planos são exibidos corretamente.

1. **Acesse** /planos
2. **Verifique:**
   - [ ] Planos Gratuito, Essencial, Completo, Profissional aparecem
   - [ ] Preços estão corretos
   - [ ] Botões de assinar funcionam

#### E.2 - FLUXO DE CHECKOUT

**O que estamos validando:** Checkout Stripe funciona.

1. **Clique** em "Assinar" em um plano pago
2. **Use** cartão de teste: `4242 4242 4242 4242`
3. **Verifique:**
   - [ ] Redireciona para Stripe Checkout
   - [ ] Após pagamento, volta para o app
   - [ ] Status de assinatura atualizado

---

## BLOCO F - GERADOR SAAS

### ✅ CHECKLIST BACKEND - BLOCO F

- [ ] GitHub token configurado
- [ ] Template de projeto existe

### 📝 PASSO A PASSO - BLOCO F (MODO GUIA)

#### F.1 - CRIAR INSTÂNCIA FILHA

**O que estamos validando:** Gerador cria projeto corretamente.

1. **Faça login** como admin
2. **Acesse** /admin/gerador-saas
3. **Preencha:**
   - Nome: "Teste SaaS"
   - Subdomínio: "teste-saas"
4. **Clique** em "Gerar"
5. **Verifique:**
   - [ ] Projeto é criado
   - [ ] Download do ZIP funciona (ou push para GitHub)

---

## 🎮 COMO RODAR TESTES AUTOMATIZADOS (MODO CINEMA)

### Rodar TUDO:

```bash
# 1. Edite tests/config/test-scenarios.config.ts
# Coloque: all: true

# 2. Inicie o servidor
npm run dev

# 3. Rode os testes
npx playwright test --headed
# ou
npx playwright test --ui
```

### Rodar SÓ PARTES:

```bash
# 1. Edite tests/config/test-scenarios.config.ts
# Coloque: all: false
# Ative apenas os cenários desejados (ex: frontpage: true)

# 2. Rode os testes
npx playwright test --headed
```

### Rodar teste específico:

```bash
npx playwright test tests/e2e/frontpage_narrado.spec.ts --headed
```

---

## 🐛 SE ALGO FALHAR

1. **Copie** o bloco `DEBUG-PARA-WINDSURF-INI ... FIM` do terminal
2. **Cole** no chat do Windsurf
3. **Eu vou analisar** e sugerir correções

---

## 📊 LEGENDA

- ✅ = Passou
- ❌ = Falhou
- ⚠️ = Aviso (funciona mas pode melhorar)
- 🔄 = Pendente de teste
