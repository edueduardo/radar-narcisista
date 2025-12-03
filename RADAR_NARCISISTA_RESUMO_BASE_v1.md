# RADAR NARCISISTA – RESUMO BASE v1

**Data:** 02/12/2025  
**Gerado por:** Windsurf AI (Cascade)  
**Propósito:** Documento consolidado para uso em conversas com ChatGPT/Windsurf

---

## 🎯 VISÃO DO PRODUTO

**Radar Narcisista BR** é um SaaS de apoio a vítimas de relacionamentos abusivos/narcisistas.

**Público-alvo:**
- Pessoas em relacionamentos abusivos
- Profissionais (psicólogos, advogados, assistentes sociais)
- ONGs e instituições
- Empresas (white-label)

---

## 🛠️ STACK TÉCNICA

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16 + TypeScript + TailwindCSS 4 |
| Backend | Next.js API Routes (serverless) |
| Banco | Supabase (Postgres + Auth + RLS + Migrations) |
| IA | OpenAI GPT-4 / Groq / Claude / Gemini |
| Pagamentos | Stripe (checkout, subscriptions, webhooks) |
| Deploy | Vercel (automático via GitHub) |
| Domínio | radarnarcisista.com.br |

---

## 📦 MÓDULOS IMPLEMENTADOS (MVP)

### 1. Teste de Clareza
- 18 perguntas + 1 especial (texto livre)
- 3 eixos: névoa, medo, limites
- 6 categorias: invalidação, gaslighting, controle, isolamento, emocional, físico
- Escala 0-4 (Nunca → Quase sempre)
- Sistema de 3 vozes (Colinho, Profissional, Defesa)
- Resultado com zonas: Atenção, Alerta, Vermelha
- Integração com Diário e Coach IA

### 2. Diário de Episódios
- Entradas com título, descrição, tags, intensidade
- Tipos: normal, clarity_baseline, chat_summary, voice_note, safety_plan
- Timeline visual com filtros
- Badges coloridos por tipo
- Análise IA opcional

### 3. Chat/Coach IA
- Contexto de clareza injetado automaticamente
- Detecção de risco físico via regex
- Modo emergência
- Modo colaborativo (múltiplas IAs)
- Limite por plano
- Salvar resumo no diário

### 4. Dashboard Usuária
- Trilha do Herói (5 etapas)
- Card de Plano de Segurança
- Banner de risco físico
- Recomendações baseadas no perfil
- Trilhas educacionais

### 5. Dashboard Profissional
- Painel de clientes (até 20)
- Relatórios por cliente
- Exportação CSV/PDF
- Marca personalizada
- Convites e revogação de acesso

### 6. Plano de Segurança
- Contatos de emergência
- Documentos importantes
- Bolsa de emergência
- Local seguro
- Segurança digital
- Integração com Triângulo de Risco

### 7. Sistema de Planos (5 níveis)
| Plano | Preço | Limites |
|-------|-------|---------|
| Visitante | Grátis | Teste apenas |
| Radar Guardar | Grátis | 5 msgs/dia, 3 diário/mês |
| Radar Jornada | R$29,90/mês | 50 msgs/dia, ilimitado |
| Radar Defesa | R$49,90/mês | Ilimitado, IAs colaborativas |
| Radar Profissional | R$99,90/mês | Painel de clientes |

### 8. Loja de Add-ons
- Créditos extras (mensagens, diário)
- Features avulsas (PDF, relatório)
- Pacotes temáticos (Kit Segurança)
- Checkout Stripe funcional

### 9. Admin Completo
- 37+ subpastas em `/admin`
- Gestão de usuários, planos, conteúdos
- Oráculo V1 (painel de métricas)
- Termos aceitos com cadeia de custódia
- Alertas de fraude
- Control Tower (projetos filhos)
- Help Desk global

---

## 🗄️ TABELAS PRINCIPAIS (Supabase)

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (via Supabase Auth) |
| `clarity_tests` | Resultados do teste de clareza |
| `journal_entries` | Entradas do diário |
| `ai_chat_sessions` | Sessões de chat |
| `ai_messages` | Mensagens do chat |
| `safety_plans` | Planos de segurança |
| `risk_alerts` | Alertas de risco detectados |
| `user_subscriptions` | Assinaturas Stripe |
| `user_addons` | Add-ons comprados |
| `terms_acceptances` | Aceites de termos (cadeia de custódia) |
| `fraud_suspicion_logs` | Logs de fraude detectada |
| `professional_clients` | Clientes de profissionais |
| `oraculo_logs` | Logs do Oráculo V2 |
| `projects_core` | Projetos filhos (Control Tower) |
| `support_tickets_core` | Tickets de suporte |

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo 1: Teste → Perfil → Dashboard
1. Usuário faz teste de clareza
2. Resultado mostra zona (Atenção/Alerta/Vermelha)
3. Opção de salvar como "base do perfil"
4. Dashboard mostra recomendações baseadas no perfil
5. Se risco físico, banner sugere Plano de Segurança

### Fluxo 2: Chat → Detecção → Alerta
1. Usuário conversa com Coach IA
2. Regex detecta palavras de risco físico
3. Banner de alerta aparece
4. `risk_alert` criado no banco
5. Dashboard mostra banner de risco

### Fluxo 3: Plano de Segurança → Diário
1. Usuário cria/atualiza plano de segurança
2. Entrada automática criada no diário
3. Badge 🛡️ aparece na lista e timeline

### Fluxo 4: Profissional → Cliente
1. Profissional envia convite por email
2. Cliente aceita e vincula conta
3. Profissional vê dados do cliente (com consentimento)
4. Pode gerar relatórios e exportar

---

## 📋 BLOCOS DO ROADMAP

| Bloco | Status | Descrição |
|-------|--------|-----------|
| 1-9 | ✅ Concluído | MVP Core (Teste, Diário, Chat, Dashboard) |
| 10-13 | ✅ Concluído | Planos, Add-ons, Front Page |
| 14-20 | ✅ Concluído | Dashboard Profissional, Clientes |
| 21-25 | ✅ Concluído | Oráculo V1, Admin, Termos |
| 26-30 | ✅ Concluído | Oráculo V2 Multiperfil |
| 31-35 | 🔄 Em andamento | Control Tower, Telemetria, Help Desk |
| 36-40 | 🔜 Futuro | Gerador de SaaS, White-label |

---

## ⚠️ PENDÊNCIAS CONHECIDAS

### Alta Prioridade
1. Rodar migrations pendentes no Supabase
2. Webhook Stripe para entrega automática de add-ons
3. Testes automatizados (Jest/Playwright)

### Média Prioridade
4. Documentação de APIs (Swagger/OpenAPI)
5. Logs estruturados (Sentry/LogRocket)
6. Rate limiting (Arcjet)

### Baixa Prioridade (V2/V3)
7. App Mobile (PWA ou React Native)
8. Integração WhatsApp
9. Comunidade/Fórum
10. Gamificação avançada

---

## 📁 ARQUIVOS DE REFERÊNCIA

| Arquivo | Conteúdo |
|---------|----------|
| `TUDO PARA O GPT.txt` | Histórico completo de implementações |
| `ATLAS-RADAR-NARCISISTA.txt` | Mapa técnico do projeto |
| `ROADMAP-RADAR.txt` | Cronograma e blocos |
| `LAMPADA-RADAR.txt` | Bugs, decisões, ideias |
| `ANALISE-ETAPA-7.2-IMPLEMENTACAO.md` | Auditoria detalhada da ETAPA 7.2 |
| `docs/PATCH-ORACULO.md` | Correção conceitual do Oráculo |
| `docs/REGRAS-COMUNICACAO-IA.md` | Regras para respostas da IA |

---

## 🎯 PRÓXIMAS AÇÕES SUGERIDAS

1. **Testar fluxo completo** de Plano de Segurança
2. **Rodar migrations** pendentes no Supabase
3. **Implementar webhook Stripe** para add-ons
4. **Completar BLOCO 31-35** (Control Tower)
5. **Iniciar testes automatizados**

---

## 💡 REGRAS PARA IA (ChatGPT/Windsurf)

1. **NUNCA usar "opcional"** - sempre dizer "pode" ou "se quiser"
2. **NUNCA fazer diagnósticos** médicos/psicológicos/legais
3. **NUNCA usar termos** como "narcisista" ou "abusador" para o parceiro
4. **SEMPRE validar sentimentos** sem julgar
5. **SEMPRE oferecer contatos de emergência** quando detectar risco
6. **SEMPRE verificar** `TUDO PARA O GPT.txt` e `ATLAS-RADAR-NARCISISTA.txt` antes de qualquer tarefa

---

## 📊 MÉTRICAS DE SAÚDE DO PROJETO

| Métrica | Valor |
|---------|-------|
| Linhas de código | ~50.000+ |
| Arquivos TypeScript | ~200+ |
| Rotas API | ~50+ |
| Páginas | ~40+ |
| Componentes | ~80+ |
| Tabelas Supabase | ~25+ |
| Build status | ✅ Passando |
| Deploy | ✅ Automático (Vercel) |

---

**FIM DO RESUMO BASE v1**
