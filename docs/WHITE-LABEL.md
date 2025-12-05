# White Label - Documentação

## Visão Geral

O sistema White Label permite que outras organizações usem o Radar Narcisista com sua própria marca, configurações e domínio.

## Arquitetura Multi-tenant

### Estrutura de Dados

```
tenants
├── id (UUID)
├── slug (único)
├── name
├── domain
├── custom_domain
├── settings (JSONB)
├── branding (JSONB)
├── limits (JSONB)
├── status (active/suspended/trial/cancelled)
├── owner_id
└── created_at/updated_at
```

### Resolução de Tenant

O sistema resolve o tenant em ordem:

1. **Header X-Tenant-ID** - Para chamadas de API
2. **Domínio customizado** - Ex: `meusite.com.br`
3. **Subdomínio** - Ex: `cliente.radarnarcisista.com.br`
4. **Padrão** - Radar Narcisista original

## Configuração de Tenant

### Settings

```typescript
{
  features: {
    chat: boolean,
    diary: boolean,
    clarityTest: boolean,
    safetyPlan: boolean,
    riskAlerts: boolean,
    gamification: boolean,
    academy: boolean,
    professionalMode: boolean
  },
  ai: {
    provider: string,
    model: string,
    maxTokensPerDay: number
  },
  email: {
    fromName: string,
    fromEmail: string
  },
  security: {
    mfaRequired: boolean,
    sessionTimeout: number
  }
}
```

### Branding

```typescript
{
  logo: string,
  logoLight: string,
  favicon: string,
  primaryColor: string,      // #RRGGBB
  secondaryColor: string,
  accentColor: string,
  fontFamily: string,
  appName: string,
  tagline: string,
  welcomeMessage: string,
  termsUrl: string,
  privacyUrl: string,
  supportUrl: string
}
```

### Limites

```typescript
{
  maxUsers: number,           // -1 = ilimitado
  maxStorageGB: number,
  maxAIRequestsPerDay: number,
  maxProfessionalClients: number,
  customDomainAllowed: boolean,
  apiAccessAllowed: boolean,
  whitelabelAllowed: boolean
}
```

## Planos White Label

| Plano | Preço/mês | Usuários | Storage | IA/dia | Custom Domain |
|-------|-----------|----------|---------|--------|---------------|
| Starter | R$ 97 | 100 | 5 GB | 1.000 | ❌ |
| Professional | R$ 297 | 500 | 25 GB | 5.000 | ✅ |
| Enterprise | R$ 997 | ∞ | 100 GB | ∞ | ✅ |

## API

### Criar Tenant

```bash
POST /api/admin/tenants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Minha Empresa",
  "slug": "minha-empresa",
  "branding": {
    "primaryColor": "#3b82f6",
    "appName": "Meu App"
  }
}
```

### Atualizar Tenant

```bash
PATCH /api/admin/tenants
Authorization: Bearer <token>

{
  "id": "uuid-do-tenant",
  "branding": {
    "logo": "https://..."
  }
}
```

### Listar Tenants

```bash
GET /api/admin/tenants
Authorization: Bearer <token>
```

## Customização Visual

O sistema gera CSS dinâmico baseado no branding:

```css
:root {
  --color-primary: #7c3aed;
  --color-secondary: #ec4899;
}
```

### Presets de Tema

- `purple` - Roxo (padrão)
- `blue` - Azul
- `green` - Verde
- `rose` - Rosa
- `amber` - Âmbar
- `slate` - Cinza

## Domínio Customizado

### Configuração

1. Adicionar domínio no painel admin
2. Configurar DNS:
   - CNAME: `app.radarnarcisista.com.br`
   - Ou A: IP do servidor
3. Aguardar propagação (até 48h)
4. SSL é gerado automaticamente

### Verificação

O sistema verifica:
- DNS configurado corretamente
- SSL válido
- Domínio não em uso por outro tenant

## Billing

### Stripe Integration

Cada tenant pode ter:
- `stripe_customer_id` - Cliente no Stripe
- `subscription_id` - Assinatura ativa
- `plan_slug` - Plano atual

### Webhooks

Eventos processados:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Segurança

### Isolamento de Dados

- RLS (Row Level Security) por tenant
- Dados nunca vazam entre tenants
- Logs separados por tenant

### Permissões

| Role | Pode |
|------|------|
| owner | Tudo no tenant |
| admin | Gerenciar usuários e config |
| member | Usar o sistema |

## Monitoramento

### Métricas por Tenant

- Usuários ativos
- Requisições de IA
- Storage usado
- Custo estimado

### Alertas

- Limite de usuários atingido
- Quota de IA esgotada
- Trial expirando
- Pagamento falhou

## Migração

### Importar Dados

```bash
POST /api/admin/tenants/:id/import
Content-Type: multipart/form-data

file: dados.json
```

### Exportar Dados

```bash
GET /api/admin/tenants/:id/export
```

## Suporte

- Email: suporte@radarnarcisista.com.br
- Documentação: /docs
- Status: /status
