# 🔮 ORACULO_V2_CORE - Guia de Integração para SaaS

> **Versão:** 1.0  
> **Criado em:** 01/12/2025 (ETAPA 30)  
> **Objetivo:** Documentar como integrar o Oráculo V2 em qualquer SaaS gerado

---

## 📋 Visão Geral

O `ORACULO_V2_CORE` é um módulo reutilizável que pode ser integrado em qualquer SaaS gerado pelo Gerador de SaaS. Este documento explica como fazer essa integração.

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                    SEU SAAS GERADO                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Sua API Route   │  │ Seus Components │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                             │
│           ▼                    ▼                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              ORACULO_V2_CORE (copiado)                  ││
│  │  lib/oraculo-core.ts                                    ││
│  │  lib/oraculo-settings.ts                                ││
│  │  components/OraculoMultiperfil.tsx                      ││
│  │  components/OraculoHint.tsx                             ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              BANCO DE DADOS (Supabase)                  ││
│  │  oraculo_plan_settings                                  ││
│  │  oraculo_usage                                          ││
│  │  oraculo_logs                                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Arquivos Necessários

Para integrar o Oráculo V2 no seu SaaS, copie os seguintes arquivos:

### Core (Obrigatório)
```
lib/oraculo-core.ts          # Núcleo do Oráculo
lib/oraculo-settings.ts      # Helpers de permissões
```

### Componentes (Opcional)
```
components/OraculoMultiperfil.tsx   # Botão + modal
components/OraculoHint.tsx          # Dicas contextuais
```

### Migrations (Obrigatório)
```
database/migrate-oraculo-settings.sql   # Tabelas de configuração
database/migrate-oraculo-logs.sql       # Tabela de logs
```

---

## 🔧 Passo a Passo de Integração

### 1. Copiar Arquivos

```bash
# Copiar core
cp radar-narcisista/lib/oraculo-core.ts seu-saas/lib/
cp radar-narcisista/lib/oraculo-settings.ts seu-saas/lib/

# Copiar componentes
cp radar-narcisista/components/OraculoMultiperfil.tsx seu-saas/components/
cp radar-narcisista/components/OraculoHint.tsx seu-saas/components/

# Copiar migrations
cp radar-narcisista/database/migrate-oraculo-*.sql seu-saas/database/
```

### 2. Executar Migrations

Execute no Supabase do seu SaaS:
1. `migrate-oraculo-logs.sql`
2. `migrate-oraculo-settings.sql`

### 3. Configurar Variáveis de Ambiente

```env
# .env.local do seu SaaS
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Criar API Route

```typescript
// app/api/oraculo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { callOraculo, OraculoUserRole } from '@/lib/oraculo-core'
import { canUseOraculo, registerOraculoUsage } from '@/lib/oraculo-settings'

export async function POST(request: NextRequest) {
  // 1. Verificar autenticação
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // 2. Parsear request
  const body = await request.json()
  const userRole = body.user_role as OraculoUserRole
  const userPlan = body.plan || 'free'

  // 3. Verificar permissões
  const permission = await canUseOraculo(user.id, userRole, userPlan)
  if (!permission.allowed) {
    return NextResponse.json({ 
      error: permission.reason,
      limite: permission.limite,
      usado: permission.usado
    }, { status: 403 })
  }

  // 4. Chamar Oráculo
  const result = await callOraculo({
    user_role: userRole,
    question: body.question,
    plan: userPlan,
    url_atual: body.url_atual
  }, process.env.OPENAI_API_KEY!)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // 5. Registrar uso
  await registerOraculoUsage(user.id, userRole, userPlan)

  return NextResponse.json({
    success: true,
    response: result.response,
    meta: result.meta
  })
}
```

### 5. Usar Componentes

```tsx
// Em qualquer página do seu SaaS
import OraculoMultiperfil from '@/components/OraculoMultiperfil'
import OraculoHint from '@/components/OraculoHint'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Dica contextual */}
      <OraculoHint
        userRole="usuaria"
        message="Precisa de ajuda?"
        suggestedQuestion="Como funciona este recurso?"
        variant="banner"
      />
      
      {/* Botão flutuante */}
      <OraculoMultiperfil
        userRole="usuaria"
        userPlan="premium"
        colorScheme="rose"
      />
    </div>
  )
}
```

---

## 🎨 Customização

### Mapeamento de Perfis

Se seu SaaS usa nomes diferentes para os perfis:

```typescript
// lib/oraculo-mapping.ts
import { OraculoUserRole } from './oraculo-core'

const ROLE_MAPPING: Record<string, OraculoUserRole> = {
  // Seu SaaS → Oráculo
  'cliente': 'usuaria',
  'vendedor': 'profissional',
  'gerente': 'admin',
  'desenvolvedor': 'dev',
  'franqueado': 'whitelabel'
}

export function mapToOraculoRole(yourRole: string): OraculoUserRole {
  return ROLE_MAPPING[yourRole] || 'usuaria'
}
```

### Customizar Prompts

Edite `lib/oraculo-core.ts` para ajustar os prompts ao contexto do seu SaaS:

```typescript
const PROMPT_BASE = `Você é o ORÁCULO V2, a IA de suporte do [NOME DO SEU SAAS].

CONTEXTO DO PRODUTO:
- [Descrição do seu SaaS]
- [Funcionalidades principais]
- [Stack tecnológico]

// ... resto do prompt
`
```

### Customizar Sugestões

Edite `components/OraculoMultiperfil.tsx`:

```typescript
const PERFIL_CONFIG: Record<UserRole, {...}> = {
  usuaria: {
    label: 'Assistente',
    description: 'Tire dúvidas sobre o sistema',
    sugestoes: [
      'Como fazer X?',
      'O que significa Y?',
      'Como configurar Z?'
    ],
    colorScheme: 'rose'
  },
  // ...
}
```

---

## 📊 Configurações Recomendadas

### Para SaaS B2C (consumidor final)

```sql
-- Habilitar para usuários premium
UPDATE oraculo_plan_settings 
SET status = 1, limite_diario = 5, limite_mensal = 50
WHERE user_role = 'usuaria' AND plan_slug = 'premium';
```

### Para SaaS B2B (empresas)

```sql
-- Habilitar para todos os planos pagos
UPDATE oraculo_plan_settings 
SET status = 2
WHERE user_role = 'profissional' AND plan_slug IN ('pro', 'enterprise');
```

### Para Whitelabel

```sql
-- Cada parceiro controla seus próprios limites
UPDATE oraculo_plan_settings 
SET status = 2, limite_diario = NULL, limite_mensal = NULL
WHERE user_role = 'whitelabel';
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] API Key da OpenAI em variável de ambiente (nunca no código)
- [ ] Autenticação obrigatória na API route
- [ ] Rate limiting implementado
- [ ] Logs de uso habilitados
- [ ] RLS configurado no Supabase

### Rate Limiting

```typescript
// Adicionar rate limiting na API
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const rateLimit = withRateLimit(request, RATE_LIMITS.ORACULO, user.id)
if (!rateLimit.success) {
  return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })
}
```

---

## 📈 Monitoramento

### Métricas Importantes

1. **Uso por perfil** - Quantas perguntas cada perfil faz
2. **Latência** - Tempo de resposta do Oráculo
3. **Tokens** - Consumo de tokens por pergunta
4. **Erros** - Taxa de erros e tipos

### Query de Exemplo

```sql
-- Uso diário por perfil
SELECT 
  user_role,
  DATE(created_at) as dia,
  COUNT(*) as perguntas,
  AVG(latency_ms) as latencia_media,
  SUM(tokens_input + tokens_output) as tokens_total
FROM oraculo_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_role, DATE(created_at)
ORDER BY dia DESC, perguntas DESC;
```

---

## 🚀 Checklist de Deploy

- [ ] Migrations executadas no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] API route criada e testada
- [ ] Componentes integrados nas páginas
- [ ] Configurações de plano/perfil ajustadas
- [ ] Rate limiting configurado
- [ ] Logs habilitados
- [ ] Testes manuais realizados

---

## 📚 Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `lib/oraculo-core.ts` | Núcleo do Oráculo |
| `lib/oraculo-settings.ts` | Helpers de permissões |
| `components/OraculoMultiperfil.tsx` | UI multiperfil |
| `components/OraculoHint.tsx` | Dicas contextuais |
| `database/migrate-oraculo-settings.sql` | Tabelas de config |
| `database/migrate-oraculo-logs.sql` | Tabela de logs |
| `docs/ORACULO-CORE.md` | Documentação técnica |

---

*Este guia foi criado na ETAPA 30 do BLOCO 26-30 do Radar Narcisista.*
