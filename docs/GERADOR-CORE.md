# GERADOR-CORE - Núcleo do Gerador de SaaS

> Última atualização: 04/12/2025
> Status: 🔲 Em desenvolvimento

## 📋 Visão Geral

O **Gerador de SaaS** é um sistema que permite criar novos SaaS a partir do núcleo do Radar Narcisista.

### Regra Fundamental

> **ADMIN + DASHBOARD = GERADOR DE SAAS**
> 
> Tudo que for verdade no ADMIN do Radar → vira matéria-prima do GERADOR DE SAAS
> 
> "No administrador, eu tenho isso" = "Isso também existe no GERADOR DE SAAS"

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     RADAR NARCISISTA (MÃE)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   ADMIN     │  │  DASHBOARD  │  │   CORE      │              │
│  │   PANEL     │  │   USUÁRIA   │  │   LIBS      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                    GERADOR DE SAAS                               │
│                          │                                       │
│         ┌────────────────┼────────────────┐                      │
│         ▼                ▼                ▼                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  SAAS #1    │  │  SAAS #2    │  │  SAAS #N    │              │
│  │ (Ansiedade) │  │ (Burnout)   │  │ (Tema X)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Módulos Core Reaproveitáveis

### 1. Sistema de Autenticação
- Login/Registro
- OAuth (Google, etc.)
- Recuperação de senha
- Sessões seguras

### 2. Sistema de Planos
- `plan_catalog` - Catálogo de planos
- `features` - Features atômicas
- `feature_profiles` - Perfis versionados
- `user_subscriptions_core` - Assinaturas

### 3. Sistema de IAs
- `ai_providers_core` - Provedores de IA
- `ai_features_core` - Features de IA
- `ai_plan_matrix` - Matriz plano x IA
- `ai_router.ts` - Roteador central

### 4. Sistema de Billing
- Integração Stripe
- Webhooks de pagamento
- Add-ons e créditos
- Promoções e cupons

### 5. Sistema de Admin
- `admin-core-menu.ts` - Menu centralizado
- `menu-help-registry.ts` - Ajuda contextual
- Painel de controle
- Logs e auditoria

### 6. Sistema de Conteúdo
- `content_items` - Conteúdos
- `content_suggestions` - Sugestões IA
- FAQ dinâmico
- Blog/Academy

### 7. Sistema de LGPD
- Termos de uso
- Política de privacidade
- Exportação de dados
- Exclusão de conta

---

## 🔧 Arquivos Core

```
lib/
├── admin-core-menu.ts      # Menu admin centralizado
├── ai-router.ts            # Roteador de IAs
├── ai-config-core.ts       # Config de IAs
├── impersonation.ts        # Modo simulação
├── menu-help-registry.ts   # Ajuda contextual
├── plans-config.ts         # Config de planos
├── stripe-config.ts        # Config Stripe
└── ui-core-registry.ts     # Registry de UI

hooks/
├── usePlanCatalog.ts       # Hook de planos
├── useFeatures.ts          # Hook de features
├── useAIProvider.ts        # Hook de IA
└── useImpersonation.ts     # Hook de simulação

types/
├── database.ts             # Tipos do banco
├── plans.ts                # Tipos de planos
└── ai.ts                   # Tipos de IA
```

---

## 🚀 Fluxo de Geração

### Passo 1: Configuração Inicial
```typescript
const config = {
  name: 'Radar Ansiedade',
  slug: 'radar-ansiedade',
  theme: 'anxiety',
  features: ['diario', 'chat', 'teste'],
  plans: ['free', 'basic', 'premium'],
  aiProviders: ['openai', 'anthropic']
}
```

### Passo 2: Geração de Arquivos
- Copia estrutura base
- Aplica tema/branding
- Configura features selecionadas
- Gera banco de dados

### Passo 3: Deploy
- Cria projeto no Vercel
- Configura domínio
- Conecta Supabase
- Ativa Stripe

---

## 📊 Tabelas do Gerador

### `saas_instances`
```sql
CREATE TABLE saas_instances (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  config JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  core_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `saas_deployments`
```sql
CREATE TABLE saas_deployments (
  id UUID PRIMARY KEY,
  instance_id UUID REFERENCES saas_instances(id),
  version TEXT NOT NULL,
  deploy_url TEXT,
  status TEXT DEFAULT 'pending',
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `saas_update_logs`
```sql
CREATE TABLE saas_update_logs (
  id UUID PRIMARY KEY,
  instance_id UUID REFERENCES saas_instances(id),
  from_version TEXT,
  to_version TEXT,
  method TEXT, -- 'auto', 'zip', 'manual'
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ,
  notes TEXT
);
```

---

## 🎨 Temas Disponíveis

| Tema | Descrição | Status |
|------|-----------|--------|
| narcisismo | Abuso narcisista (padrão) | ✅ |
| ansiedade | Transtornos de ansiedade | 🔲 |
| burnout | Esgotamento profissional | 🔲 |
| luto | Processo de luto | 🔲 |
| relacionamentos | Relacionamentos tóxicos | 🔲 |
| autoestima | Baixa autoestima | 🔲 |

---

## 🔗 Integrações

### Obrigatórias
- **Supabase** - Banco de dados e auth
- **Stripe** - Pagamentos
- **Vercel** - Deploy

### Opcionais
- **OpenAI** - IA principal
- **Anthropic** - IA alternativa
- **Resend** - Emails transacionais
- **Sentry** - Monitoramento de erros

---

## 📝 Próximos Passos

1. [ ] Criar UI do Gerador (`/admin/gerador`)
2. [ ] Implementar Modo 3 (geração completa)
3. [ ] Integrar GitHub API para criar repos
4. [ ] Criar sistema de templates
5. [ ] Implementar atualizações automáticas
6. [ ] Criar marketplace de temas

---

## 🔒 Segurança

- Cada SaaS filho tem banco isolado
- Credenciais separadas por instância
- Logs de auditoria centralizados
- Backups automáticos

---

## 📚 Documentação Relacionada

- `docs/GERADOR-SAAS.md` - Visão geral do gerador
- `docs/PATCH-GERADOR-SAAS.md` - Patches e correções
- `docs/MANUAL-WHITELABEL.md` - Manual white-label
- `FUTURO-TERMINAR-IMPLEMENTACAO.txt` - Tarefas pendentes
