# ADMIN MENU MAP - Mapa Completo do Menu Administrativo

> Última atualização: 04/12/2025
> Arquivo fonte: `lib/admin-core-menu.ts`

## 📋 Visão Geral

O menu administrativo do Radar Narcisista é organizado em **8 grupos** com **55 itens** no total.

Esta estrutura é:
- ✅ Usada pelo RADAR (projeto mãe)
- ✅ Copiada pelo GERADOR DE SAAS
- ✅ Herdada por instâncias WHITE LABEL

---

## 🎯 GRUPO 1: Visão Geral & Controle

**ID:** `admin-core-overview`
**Ícone:** 🎯
**Descrição:** Painéis principais e monitoramento do sistema

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| Dashboard | `/admin` | Painel principal | ✅ |
| Oráculo V1 | `/admin/oraculo` | Visão executiva | ✅ |
| Oráculo Métricas | `/admin/oraculo-metricas` | Métricas detalhadas | ✅ |
| Control Tower | `/admin/control-tower` | Torre de controle | ✅ |
| Métricas Gerais | `/admin/metricas` | KPIs do sistema | ✅ |
| Analytics | `/admin/analytics` | Análise de dados | ✅ |
| Analytics Dashboard | `/admin/analytics-dashboard` | Dashboard analítico | ✅ |
| Logs | `/admin/logs` | Logs do sistema | ✅ |
| Simulação | `/admin/simulacao` | Modo impersonação | ✅ |

---

## 👥 GRUPO 2: Pessoas & Acessos

**ID:** `admin-core-people`
**Ícone:** 👥
**Descrição:** Gestão de usuários, profissionais e acessos

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| Usuários | `/admin/usuarios` | Lista de usuários | ✅ |
| Profissionais | `/admin/profissionais` | Lista de profissionais | ✅ |
| Admins | `/admin/admins` | Gestão de admins | ✅ |
| Permissões | `/admin/permissoes` | Controle de acesso | ✅ |
| Convites | `/admin/convites` | Convites pendentes | ✅ |

---

## 💳 GRUPO 3: Planos, Billing & Promoções

**ID:** `admin-core-billing`
**Ícone:** 💳
**Descrição:** Gestão financeira e planos

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| Planos | `/admin/planos` | Catálogo de planos | ✅ |
| Assinaturas | `/admin/assinaturas` | Assinaturas ativas | ✅ |
| Promoções | `/admin/promocoes` | Campanhas e cupons | ✅ |
| Add-ons | `/admin/addons` | Add-ons disponíveis | ✅ |
| Stripe | `/admin/stripe` | Configuração Stripe | ✅ |

---

## 🤖 GRUPO 4: IAs & Orquestração

**ID:** `admin-core-ai`
**Ícone:** 🤖
**Descrição:** Configuração e monitoramento de IAs

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| IAs Cadastradas | `/admin/ias` | Lista de providers | ✅ |
| IA Matrix | `/admin/ia-matrix` | Matriz feature x IA | ✅ |
| IA Planos | `/admin/ia-planos` | IAs por plano | ✅ |
| IA Analytics | `/admin/ia-analytics` | Métricas de uso | ✅ |
| IA Personas | `/admin/ia-personas` | Personas de IA | ✅ |
| IA Prompts | `/admin/ia-prompts` | Biblioteca de prompts | ✅ |
| IA Logs | `/admin/ia-logs` | Logs de chamadas | ✅ |
| IA Custos | `/admin/ia-custos` | Custos por provider | ✅ |
| IA Testes | `/admin/ia-testes` | Playground de testes | ✅ |
| IA Config | `/admin/ia-config` | Configurações gerais | ✅ |

---

## 🛠️ GRUPO 5: Produto & Funcionalidades

**ID:** `admin-core-product`
**Ícone:** 🛠️
**Descrição:** Configuração de features do produto

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| Features | `/admin/features` | Lista de features | ✅ |
| Feature Flags | `/admin/feature-flags` | Flags de ativação | ✅ |
| Testes Clareza | `/admin/testes-clareza` | Config do teste | ✅ |
| Diário | `/admin/diario` | Config do diário | ✅ |
| Chat | `/admin/chat` | Config do chat | ✅ |
| Plano Segurança | `/admin/plano-seguranca` | Config plano seg. | ✅ |
| Timeline | `/admin/timeline` | Config timeline | ✅ |

---

## 📰 GRUPO 6: Front & Conteúdos

**ID:** `admin-core-front`
**Ícone:** 📰
**Descrição:** Gestão de conteúdo e frontpage

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| Conteúdos | `/admin/conteudos` | Lista de conteúdos | ✅ |
| Sugestões | `/admin/conteudos/sugestoes` | Sugestões da IA | 🔲 |
| Publicados | `/admin/conteudos/publicados` | Conteúdos ativos | 🔲 |
| FAQ | `/admin/faq` | Perguntas frequentes | ✅ |
| Blog | `/admin/blog` | Artigos do blog | ✅ |
| Academy | `/admin/academy` | Trilhas de aprendizado | 🔲 |
| Fanpage Config | `/admin/fanpage/config` | Config da frontpage | 🔲 |
| SEO | `/admin/seo` | Configurações SEO | ✅ |

---

## 🔒 GRUPO 7: Governança & LGPD

**ID:** `admin-core-governance`
**Ícone:** 🔒
**Descrição:** Compliance, LGPD e auditoria

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| LGPD | `/admin/lgpd` | Painel LGPD | ✅ |
| Termos | `/admin/termos` | Termos de uso | ✅ |
| Auditoria | `/admin/auditoria` | Logs de auditoria | ✅ |
| Exclusões | `/admin/exclusoes` | Pedidos de exclusão | ✅ |
| Exportações | `/admin/exportacoes` | Pedidos de export | ✅ |

---

## 🧪 GRUPO 8: Laboratório & Dev

**ID:** `admin-core-lab`
**Ícone:** 🧪
**Descrição:** Ferramentas de desenvolvimento

| Item | Rota | Descrição | Status |
|------|------|-----------|--------|
| Lab | `/admin/lab` | Laboratório | ✅ |
| Webhooks | `/admin/webhooks` | Config webhooks | ✅ |
| API Keys | `/admin/api-keys` | Chaves de API | ✅ |
| Migrations | `/admin/migrations` | Status migrations | ✅ |
| Cache | `/admin/cache` | Gestão de cache | ✅ |
| Debug | `/admin/debug` | Ferramentas debug | ✅ |

---

## 📊 Resumo

| Grupo | Itens | Status |
|-------|-------|--------|
| Visão Geral & Controle | 9 | ✅ 100% |
| Pessoas & Acessos | 5 | ✅ 100% |
| Planos, Billing & Promoções | 5 | ✅ 100% |
| IAs & Orquestração | 10 | ✅ 100% |
| Produto & Funcionalidades | 7 | ✅ 100% |
| Front & Conteúdos | 8 | ⚠️ 50% |
| Governança & LGPD | 5 | ✅ 100% |
| Laboratório & Dev | 6 | ✅ 100% |
| **TOTAL** | **55** | **90%** |

---

## 🔗 Arquivos Relacionados

- `lib/admin-core-menu.ts` - Estrutura do menu
- `lib/menu-help-registry.ts` - Textos de ajuda
- `components/admin/AdminSidebar.tsx` - Componente sidebar
- `app/admin/AdminClient.tsx` - Cliente admin

---

## 📝 Notas

1. **Placeholders (🔲):** Itens que precisam de implementação real
2. **Audience:** Cada item pode ter audiência específica (admin, whitelabel, gerador, dev)
3. **Help:** Cada item pode ter texto de ajuda associado via `menu-help-registry.ts`
4. **Badges:** Itens podem ter badges como "Novo", "Beta", etc.

---

## 🚀 Próximas Implementações

1. [ ] Criar `/admin/conteudos/sugestoes` - Sugestões da IA
2. [ ] Criar `/admin/conteudos/publicados` - Conteúdos publicados
3. [ ] Criar `/admin/academy` - Trilhas de aprendizado
4. [ ] Criar `/admin/fanpage/config` - Config da frontpage
