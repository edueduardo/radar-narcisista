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

**Limitações (BLOCO 21-25):**
- Disponível apenas para ADMIN
- Outros perfis (usuária, profissional) serão liberados no BLOCO 26-30

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
