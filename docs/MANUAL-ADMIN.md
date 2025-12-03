# 🔧 Manual do Administrador - Radar Narcisista

> **Versão:** 1.2  
> **Última atualização:** 01/12/2025  
> **Público:** Administradores do sistema
> **ETAPA 24:** Manuais & Links Internos

---

## 🎯 Visão Geral

O painel administrativo do Radar Narcisista permite gerenciar todos os aspectos do sistema. Acesse em `/admin` com credenciais de administrador.

---

## 🔮 Oráculo (Visão Executiva)

### Oráculo V1 - Painel de Métricas
O **Oráculo V1** (`/admin/oraculo`) é seu ponto de partida. Ele responde 7 perguntas-chave:

1. 📈 **O produto está crescendo?** - Usuários, novos cadastros
2. 🎯 **As pessoas estão usando?** - Testes, diário, retenção
3. 💰 **Estamos ganhando dinheiro?** - MRR, conversão
4. 🔧 **O sistema está saudável?** - Erros, performance
5. 🚨 **Há situações de emergência?** - Cliques em recursos de crise
6. 💬 **O que os beta testers dizem?** - Feedbacks, rating
7. 📊 **O que está acontecendo hoje?** - Eventos recentes

### Oráculo V2 - IA de Suporte (NOVO)
O **Oráculo V2** é uma IA de suporte interno que ajuda o admin a:

- **Entender métricas** - Pergunte sobre dados do sistema
- **Resolver problemas** - Peça ajuda com erros e bugs
- **Tomar decisões** - Receba sugestões baseadas em dados
- **Aprender o produto** - Tire dúvidas sobre funcionalidades

**Como usar:**
1. Clique no botão flutuante "🔮 Oráculo" no canto inferior direito
2. Digite sua pergunta
3. Receba resposta estruturada com passos e links

**Tipos de resposta:**
- 📊 **Análise** - Dados e métricas
- 💡 **Sugestão** - Melhorias e otimizações
- ⚠️ **Alerta** - Situações que requerem atenção
- ❓ **Explicação** - Como algo funciona

**Níveis de risco:**
- 🟢 Baixo - Informação
- 🟡 Médio - Atenção necessária
- 🟠 Alto - Ação necessária
- 🔴 Crítico - Ação imediata

**Logs:**
Todas as chamadas ao Oráculo V2 são registradas em `oraculo_logs` para auditoria.

### Controle de Acesso por Plano/Perfil (ETAPA 28)

O admin pode controlar quem tem acesso ao Oráculo V2 através da tabela `oraculo_plan_settings`:

**Status:**
- `0` = Desativado (não aparece nem responde)
- `1` = Modo teste/limitado (com limites)
- `2` = Modo completo (sem limites)

**Limites por período:**
- `limite_diario` - Perguntas por dia
- `limite_semanal` - Perguntas por semana
- `limite_mensal` - Perguntas por mês

**Configurações padrão:**
| Plano | Perfil | Status | Limite Diário | Limite Mensal |
|-------|--------|--------|---------------|---------------|
| Todos | admin | 2 (completo) | Sem limite | Sem limite |
| free | usuaria | 0 (off) | 3 | 30 |
| essencial | usuaria | 0 (off) | 5 | 60 |
| premium | usuaria | 0 (off) | 10 | 150 |
| profissional | profissional | 0 (off) | 20 | 300 |
| enterprise | whitelabel | 0 (off) | Sem limite | Sem limite |

**Como habilitar:**
1. Acesse o Supabase
2. Edite a tabela `oraculo_plan_settings`
3. Altere o `status` para 1 ou 2
4. Ajuste os limites conforme necessário

**Monitoramento de uso:**
A tabela `oraculo_usage` registra o consumo por usuário/período.

---

## 📋 Menu do Admin

### Ordem Atual (defaultOrder)
| Posição | Feature | Descrição |
|---------|---------|-----------|
| 0 | 🔮 Oráculo | Visão executiva consolidada |
| 2 | 🏛️ Curadoria Central | Controle da IA Curadora |
| 1-8 | IAs | Config, API Keys, Custos, Mapa |
| 9-12 | Dados | Biblioteca, Histórias, Comunidade |
| 13-16 | Sistema | Quiz, Testes A/B, Analytics |
| 17-23 | Usuários | Gestão, Chat, Beta Testers |
| 24+ | Billing | Planos, Promoções |
| 50 | 💀 Termos | Cadeia de custódia (sensível) |

---

## 🤖 Gestão de IAs

### Config IAs (`/admin`)
- Visão geral das IAs ativas
- Status de cada agente
- Métricas de uso

### API Keys (`/admin/configurar-ias`)
- Configurar chaves OpenAI, Anthropic, Groq
- Verificar saldos
- Rotacionar chaves

### Custos IA (`/admin/custos-ia`)
- Monitorar gastos por IA
- Alertas de orçamento
- Histórico de consumo

### Mapa IAs (`/admin/mapa-ias`)
- Saúde de cada IA
- Incidentes recentes
- Sugestões do Guardian

### Fluxos IA (`/admin/fluxos-ia`) ⚠️ Experimental
- Orquestrador visual tipo n8n
- Criar fluxos de automação
- Testar e debugar

---

## 👥 Gestão de Usuários

### Usuários (`/admin/usuarios`)
- Lista de todos os usuários
- Filtrar por plano, status
- Ações: bloquear, promover, deletar

### Beta Testers (`/admin/beta-testers`)
- Guia de recrutamento
- Lista de beta testers ativos
- Feedbacks recebidos

### Chat Admin (`/admin/chat`)
- Histórico de conversas
- Métricas de uso do chat
- Intervenções necessárias

---

## 💰 Billing

### Planos & Promos (`/admin/planos`)
- Criar/editar planos
- Configurar preços
- Criar promoções
- Ativar/desativar planos

### Integração Stripe
- Webhooks configurados
- Checkout funcional
- Portal do cliente

---

## 📊 Analytics

### Analytics (`/admin/analytics`)
- KPIs principais
- Funil de conversão
- Métricas de SEO
- Insights da IA Coach

### Métricas (`/admin/metricas`)
- Dashboard de métricas
- Atividade diária
- Páginas mais acessadas

### Insights (`/admin/insights`)
- Métricas críticas
- Segurança, feedback, técnico
- Sugestões da IA

---

## 📝 Conteúdo

### Sugestões (`/admin/conteudos/sugestoes`)
- Sugestões da IA Curadora
- Aprovar/rejeitar
- Editar antes de publicar

### Publicados (`/admin/conteudos/publicados`)
- Artigos, FAQs, notícias
- Editar, despublicar
- Métricas de acesso

### Coleções (`/admin/conteudos/colecoes`)
- Trilhas educacionais
- Radar Academy
- Ordenar conteúdos

---

## 🔒 Áreas Sensíveis

### 💀 Termos Aceitos (`/admin/termos-aceitos`)
**ÁREA CRÍTICA - Cadeia de Custódia**

- Registro de aceites com hash SHA-256
- Prova pericial para processos
- NÃO EDITAR registros existentes
- Exportar para documentação legal

### Segurança
- Logs de acesso admin
- Ações auditadas
- Backup automático

---

## ⚙️ Sistema

### Mapa Sistema (`/admin/mapa-sistema`)
- Arquitetura completa
- Rotas e APIs
- Tabelas do banco

### Checklist (`/admin/checklist-lancamento`)
- Itens para lançamento
- Status de cada item
- Responsáveis

### Easter Eggs (`/admin/easter-eggs`)
- Funcionalidades secretas
- Ativar/desativar
- Métricas de descoberta

### Frontpages (`/admin/frontpage`)
- Configurar homepage
- Testes A/B de landing
- Métricas de conversão

---

## 🚀 Tarefas Comuns

### Adicionar novo admin
1. Acesse `/admin/usuarios`
2. Encontre o usuário
3. Clique em "Promover a Admin"
4. Confirme a ação

### Criar promoção
1. Acesse `/admin/planos`
2. Selecione o plano
3. Clique em "Nova Promoção"
4. Configure desconto e período

### Responder feedback de beta
1. Acesse `/admin/beta-testers`
2. Veja feedbacks pendentes
3. Marque como resolvido
4. Documente a ação

### Verificar saúde do sistema
1. Acesse `/admin/oraculo`
2. Verifique todas as perguntas
3. Ações sugeridas em amarelo
4. Críticos em vermelho

---

## 🆘 Troubleshooting

### IA não responde
1. Verificar API Keys em `/admin/configurar-ias`
2. Checar saldo da conta
3. Ver logs em `/admin/mapa-ias`

### Usuário não consegue pagar
1. Verificar status no Stripe Dashboard
2. Checar webhooks
3. Verificar plano ativo

### Erro 500 em produção
1. Verificar logs no Vercel
2. Checar variáveis de ambiente
3. Verificar conexão Supabase

---

## 🛡️ Segurança & Observabilidade (NOVO)

### Rate Limiting
O sistema possui proteção contra abuso:
- **IAs:** 10 requisições/minuto
- **Oráculo:** 10 requisições/minuto
- **Auth:** 5 tentativas/minuto
- **APIs gerais:** 100 requisições/minuto

Quando excedido, retorna erro 429 com header `Retry-After`.

### Healthcheck
Verifique a saúde do sistema em `/api/health`:
```json
{
  "status": "healthy",
  "version": "1.0.23",
  "uptime": 3600,
  "checks": {
    "database": "ok",
    "stripe": "ok",
    "openai": "ok"
  }
}
```

Status possíveis:
- 🟢 **healthy** - Tudo funcionando
- 🟡 **degraded** - Algum serviço com problema
- 🔴 **unhealthy** - Sistema fora do ar

### Logs Estruturados
Todos os logs são em formato JSON para fácil parsing:
- Eventos de segurança (tentativas de acesso não autorizado)
- Erros de API
- Ações de usuário

---

## 🎛️ Control Plane (NOVO)

### O que é o Control Plane?

O Control Plane é a arquitetura que permite gerenciar configurações do sistema **SEM necessidade de deploy**.

### Três Camadas

| Camada | O que muda | Como muda |
|--------|------------|-----------|
| **CÓDIGO** | Páginas, componentes, APIs | Deploy na Vercel |
| **CONFIGURAÇÃO** | IAs, planos, limites, flags | Admin → Supabase |
| **CONTROL PLANE** | Interface de gestão | /admin |

### Mudanças SEM Deploy

Você pode alterar **imediatamente** (sem deploy):
- ✅ Ativar/desativar IAs por menu
- ✅ Ajustar limites por plano
- ✅ Criar grupos/promoções
- ✅ Liberar features para usuários
- ✅ Configurar overrides individuais

### Mudanças COM Deploy

Requerem `git push` + deploy na Vercel:
- ❌ Nova página React
- ❌ Nova rota de API
- ❌ Mudança de lógica de IA
- ❌ Alteração de schema do banco

### Páginas de Configuração de IA

| Página | Função |
|--------|--------|
| `/admin/ia-matrix` | Configurar IAs por plano |
| `/admin/ia-mapa-menus` | Ver IAs por menu |
| `/admin/ia-carga` | Dashboard de uso |
| `/admin/configurar-ias` | API Keys |
| `/admin/custos-ia` | Monitorar custos |

### Arquivos Relacionados

- `lib/control-plane.ts` - Módulo de gestão
- `lib/ai-config-core.ts` - Configuração de IAs
- `docs/CONTROL-PLANE.md` - Documentação completa

---

## 🗂️ MAPA DO MENU ADMINISTRATIVO

O menu admin é organizado em **8 grupos principais** por prioridade de uso.
Esta estrutura é o **CORE** do projeto mãe e é reutilizada pelo GERADOR DE SAAS.

### Grupos do Menu

| # | Grupo | Ícone | Itens | Descrição |
|---|-------|-------|-------|-----------|
| 1 | **Visão Geral & Controle** | 🎯 | 9 | Painéis principais e monitoramento |
| 2 | **Pessoas & Acessos** | 👥 | 5 | Gerenciamento de usuários |
| 3 | **Planos, Billing & Promoções** | 💳 | 5 | Gestão financeira |
| 4 | **IAs & Orquestração** | 🤖 | 10 | Configuração de IAs |
| 5 | **Produto & Funcionalidades** | 🎯 | 7 | Funcionalidades do produto |
| 6 | **Front & Conteúdos** | 🎨 | 8 | Gestão de conteúdo |
| 7 | **Governança & LGPD** | ⚖️ | 5 | Compliance e auditoria |
| 8 | **Laboratório & Dev** | 🧪 | 6 | Ferramentas de desenvolvimento |

### Detalhamento por Grupo

#### 1. Visão Geral & Controle
- `/admin` - Dashboard principal
- `/admin/oraculo` - Oráculo V1
- `/admin/oraculo-metricas` - Métricas do Oráculo
- `/admin/control-tower` - Torre de controle
- `/admin/metricas` - Métricas gerais
- `/admin/analytics` - Analytics
- `/admin/analytics-dashboard` - Dashboard de analytics
- `/admin/insights` - Insights automáticos
- `/admin/mapa-sistema` - Mapa do sistema

#### 2. Pessoas & Acessos
- `/admin/usuarios` - Usuárias
- `/admin/comunidade` - Comunidade
- `/admin/oraculo-instances` - Instâncias white-label
- `/admin/profissionais` - Profissionais (placeholder)
- `/admin/equipe` - Equipe interna (placeholder)

#### 3. Planos, Billing & Promoções
- `/admin/planos` - Planos
- `/admin/planos-core` - Planos Core
- `/admin/loja` - Loja/Add-ons (placeholder)
- `/admin/promocoes` - Promoções (placeholder)
- `/admin/excecoes` - Exceções individuais (placeholder)

#### 4. IAs & Orquestração
- `/admin/ia-personas` - IA Personas 🆕
- `/admin/configurar-ias` - Configurar IAs
- `/admin/gerenciar-ias` - Gerenciar IAs
- `/admin/mapa-ias` - Mapa de IAs
- `/admin/ia-matrix` - IA Matrix
- `/admin/ia-mapa-menus` - IA Mapa Menus
- `/admin/fluxos-ia` - Fluxos de IA
- `/admin/ia-assistente` - IA Assistente
- `/admin/custos-ia` - Custos de IA
- `/admin/ia-carga` - IA Carga

#### 5. Produto & Funcionalidades
- `/admin/teste-clareza-ia` - Teste de Clareza IA
- `/admin/historias` - Histórias/Jornadas
- `/admin/chat` - Chat Admin
- `/admin/estados` - Estados
- `/admin/quiz-generator` - Gerador de Quiz
- `/admin/seguranca` - Plano de Segurança (placeholder)
- `/admin/relatorios` - Relatórios (placeholder)

#### 6. Front & Conteúdos
- `/admin/frontpage` - Frontpage
- `/admin/frontpage-editor` - Frontpage Editor
- `/admin/frontpage-visual` - Frontpage Visual
- `/admin/builder` - Builder
- `/admin/biblioteca` - Biblioteca
- `/admin/conteudos` - Conteúdos
- `/admin/curadoria` - Curadoria
- `/admin/menu-config` - Configurar Menu

#### 7. Governança & LGPD
- `/admin/termos-aceitos` - Termos Aceitos
- `/admin/auditoria-suporte` - Auditoria Suporte
- `/admin/privacidade` - Privacidade (placeholder)
- `/admin/lgpd` - LGPD/Exportar Dados (placeholder)
- `/admin/logs-legais` - Logs Legais (placeholder)

#### 8. Laboratório & Dev
- `/admin/gerador-saas` - Gerador de SaaS
- `/admin/beta-testers` - Beta Testers
- `/admin/ab-testing` - A/B Testing
- `/admin/easter-eggs` - Easter Eggs
- `/admin/checklist-lancamento` - Checklist Lançamento
- `/admin/repair-env` - Repair Env (placeholder)

### Arquivo de Configuração

A estrutura do menu está centralizada em:
```
lib/admin-core-menu.ts
```

Este arquivo é usado pelo:
- RADAR (projeto mãe)
- GERADOR DE SAAS (copia como base)
- Instâncias WHITE LABEL (herdam estrutura)

---

## 📞 Contatos

- **Suporte Técnico:** dev@radarnarcisista.com.br
- **Emergências:** Slack #emergencias
- **Vercel Dashboard:** vercel.com/radar-narcisista-brs-projects

---

## 📚 Links Úteis

### Documentação Interna
- [Manual da Usuária](/docs/MANUAL-USUARIA.md)
- [Manual do Profissional](/docs/MANUAL-PROFISSIONAL.md)
- [Manual do Desenvolvedor](/docs/MANUAL-DEV.md)
- [Manual White-Label](/docs/MANUAL-WHITELABEL.md)
- [Variáveis de Ambiente](/docs/ENV-VARIABLES.md)
- [Prompt do Oráculo V2](/docs/ORACULO-V2-PROMPT.md)

### Arquivos de Referência
- `TUDO PARA O GPT.txt` - Histórico completo
- `ATLAS-RADAR-NARCISISTA.txt` - Mapa técnico
- `ROADMAP-RADAR.txt` - Roadmap
- `TESTES-RADAR.txt` - Checklist de testes
- `LAMPADA-RADAR.txt` - Bugs e pendências

---

*Este manual é atualizado regularmente. Última versão: 01/12/2025*
