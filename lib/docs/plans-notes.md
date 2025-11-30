# MAPEAMENTO DO SISTEMA DE PLANOS - Radar Narcisista
> Gerado em: 29/11/2025 19:30 (UTC-5)
> Objetivo: Documentar estrutura atual antes de implementar sistema administrável

---

## 1. PLANOS EXISTENTES HOJE

### Arquivo: `lib/plans-config.ts`

| Slug | Nome Display | Tipo | Preço | legacyId (Stripe) |
|------|--------------|------|-------|-------------------|
| `visitante` | Visitante | B2C Free | R$ 0 | visitante |
| `guardar` | Radar Guardar | B2C Free | R$ 0 | gratuito |
| `jornada` | Radar Jornada | B2C Pago | R$ 29,90/mês | essencial |
| `defesa` | Radar Defesa | B2C Pago | R$ 49,90/mês | premium |
| `profissional` | Radar Profissional | B2B | R$ 99,90/mês | profissional |

### Campos de cada plano (`PlanConfig`):
```typescript
interface PlanConfig {
  id: PlanLevel                    // 'visitante' | 'guardar' | 'jornada' | 'defesa' | 'profissional'
  legacyId: string                 // ID antigo para compatibilidade Stripe
  name: string                     // Nome de exibição
  tagline: string                  // Subtítulo
  description: string              // Descrição longa
  price: number                    // Preço mensal
  priceAnnual?: number             // Preço anual (opcional)
  stripePriceIdMonthly?: string    // ID do Stripe mensal
  stripePriceIdAnnual?: string     // ID do Stripe anual
  period: 'forever' | 'month' | 'year'
  popular?: boolean                // Badge "POPULAR"
  comingSoon?: boolean             // Badge "EM BREVE"
  features: PlanFeature[]          // Lista de features
  limits: PlanLimit                // Limites de uso
  color: string                    // Cor do texto
  bgColor: string                  // Cor de fundo
  icon: string                     // Nome do ícone (lucide-react)
}
```

---

## 2. LIMITES POR PLANO

### Arquivo: `lib/plans-config.ts` (interface `PlanLimit`)

| Plano | Testes/mês | Diário/mês | Chat/dia | PDF | Histórico | IAs Colab |
|-------|------------|------------|----------|-----|-----------|-----------|
| visitante | 1 | 0 | 0 | ❌ | ❌ | ❌ |
| guardar | ∞ (-1) | 3 | 5 | ❌ | ❌ | ❌ |
| jornada | ∞ (-1) | ∞ (-1) | 50 | ✅ | ✅ | ❌ |
| defesa | ∞ (-1) | ∞ (-1) | ∞ (-1) | ✅ | ✅ | ✅ |
| profissional | ∞ (-1) | ∞ (-1) | ∞ (-1) | ✅ | ✅ | ✅ + 20 clientes |

### Arquivo: `lib/plan-limits.ts`
Contém funções de verificação:
- `checkChatLimit(planLevel, currentMessages)`
- `checkDiaryLimit(planLevel, currentEntries)`
- `checkTestLimit(planLevel, currentTests)`
- `checkPdfExportAccess(planLevel)`
- `checkHistoryAccess(planLevel)`
- `checkCollaborativeAIAccess(planLevel)`

---

## 3. ONDE OS PLANOS SÃO CONSUMIDOS

### 3.1 Homepage (`app/page.tsx`)
- **Linha 14:** `import { getDisplayPlans } from '../lib/plans-config'`
- **Linha 29:** `const displayPlans = getDisplayPlans(false, false).filter(p => !p.comingSoon)`
- **Linhas 690-850:** Seção "SEÇÃO DE PLANOS" com 3 cards
- **Comportamento:** Lê diretamente de `plans-config.ts` (hardcoded)

### 3.2 Página /planos (`app/planos/page.tsx`)
- **Linha 21:** `import { PLANS, getDisplayPlans, formatPrice, getAnnualSavings, type PlanConfig } from '@/lib/plans-config'`
- **Linha 31:** `const displayPlans = getDisplayPlans(false, true)` (inclui profissional)
- **Comportamento:** Lê diretamente de `plans-config.ts` (hardcoded)

### 3.3 Hook usePlanLimits (`hooks/usePlanLimits.ts`)
- Usa `PLANS` de `lib/plans-config.ts`
- Determina nível do plano baseado em `subscriptions.plan_id`
- Retorna: `canSendMessage`, `canCreateEntry`, `canCreateTest`, etc.

### 3.4 Verificação de limites
- `app/chat/page.tsx` - verifica `canSendMessage`
- `app/diario/novo/page.tsx` - verifica `canCreateEntry`

---

## 4. FUNÇÕES AUXILIARES EXISTENTES

### Em `lib/plans-config.ts`:
```typescript
getDisplayPlans(includeVisitante, includeProfissional) // Retorna lista de planos para UI
getPlanByLegacyId(legacyId)                            // Busca plano por ID legado
getUserPlanLevel(subscriptionStatus, planId)           // Determina nível do usuário
hasFeatureAccess(userPlan, feature)                    // Verifica acesso a feature
getFeatureLimit(userPlan, feature)                     // Retorna limite numérico
formatPrice(price)                                     // Formata preço em BRL
getAnnualSavings(plan)                                 // Calcula economia anual
```

---

## 5. INTEGRAÇÃO COM STRIPE

### Variáveis de ambiente (não visíveis, mas referenciadas):
- `STRIPE_PRICE_ESSENCIAL_MENSAL`
- `STRIPE_PRICE_ESSENCIAL_ANUAL`
- `STRIPE_PRICE_PREMIUM_MENSAL`
- `STRIPE_PRICE_PREMIUM_ANUAL`

### Mapeamento legacyId → Stripe:
- `gratuito` → sem Stripe (free)
- `essencial` → `STRIPE_PRICE_ESSENCIAL_*`
- `premium` → `STRIPE_PRICE_PREMIUM_*`
- `profissional` → ainda não implementado

---

## 6. O QUE NÃO EXISTE HOJE

1. **Tabela de planos no banco** - tudo está em código
2. **Sistema de promoções** - não existe
3. **Plano intermediário oculto** - não existe
4. **Labels promocionais** (Black Friday, etc.) - não existe
5. **Tela admin para gerenciar planos** - não existe
6. **Datas de validade de promoções** - não existe
7. **Preços promocionais temporários** - não existe

---

## 7. PADRÃO DO ADMIN EXISTENTE

### Registry de features: `app/admin/admin-features-registry.ts`
- Todas as features admin são registradas aqui
- Menu lateral lê automaticamente do registry
- Para adicionar nova feature: adicionar ao registry + criar rota

### Grupos de features:
- IAs
- Dados
- Usuários
- Sistema
- Outros

### Para adicionar `/admin/planos`:
1. Adicionar `AdminFeatureId` no type
2. Adicionar entrada em `ADMIN_FEATURES[]`
3. Criar rota `app/admin/planos/page.tsx`

---

## 8. PRÓXIMOS PASSOS (ETAPA 2+)

1. Criar migration `billing_plans` + `billing_plan_promotions`
2. Criar seed com planos atuais
3. Criar `lib/plan-service.ts` com funções server-side
4. Criar `/admin/planos` para gerenciar
5. Migrar frontpage e /planos para usar serviço
6. Manter compatibilidade com Stripe existente

---

*Este documento serve como referência para a implementação do sistema administrável de planos.*
