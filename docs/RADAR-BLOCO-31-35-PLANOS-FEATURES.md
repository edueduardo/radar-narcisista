# RADAR NARCISISTA – BLOCO 31–35
## PLANOS, FEATURES, COHORTS & GERADOR DE SAAS (PLANOS_CORE)

**Data de Conclusão:** 03/12/2025  
**Status:** ✅ COMPLETO

---

## RESUMO DO BLOCO

Este bloco implementou a arquitetura PLANOS_CORE:
- Features atômicas
- Feature profiles versionados
- Plan catalog
- User feature overrides
- User subscriptions core

---

## ETAPAS IMPLEMENTADAS

### ETAPA 31 – MODELAR PLANOS_CORE ✅

**Tabelas criadas:**
- `features` - Funcionalidades atômicas (16 cadastradas)
- `feature_profiles` - Perfis versionados (4 cadastrados)
- `feature_profile_features` - Join com limites
- `plan_catalog` - Planos para venda (4 cadastrados)
- `user_feature_overrides` - Ajustes individuais
- `user_subscriptions_core` - Assinaturas

**Funções SQL:**
- `get_effective_features(user_id)` - Retorna JSON com features
- `has_feature(user_id, feature_key)` - Verifica acesso

**Arquivos:**
- `database/MEGA-SQL-PARTE1.sql` (linhas 189-473)
- `lib/planos-core.ts` (605 linhas)
- `docs/GERADOR-SAAS.md` (284 linhas)

---

### ETAPA 32 – MIGRAR PLANOS ATUAIS ✅

**Profiles criados:**
| Profile Key | Nome | Tipo |
|-------------|------|------|
| `free_v1` | Gratuito V1 | padrao |
| `profissional_v1` | Profissional V1 | padrao |
| `defesa_v1` | Defesa V1 | padrao |
| `white_label_v1` | White Label V1 | padrao |

**Planos no catálogo:**
| Slug | Nome | Preço Mensal |
|------|------|--------------|
| `free` | Gratuito | R$ 0,00 |
| `profissional` | Profissional | R$ 49,90 |
| `defesa` | Defesa | R$ 99,90 |
| `white-label` | White Label | R$ 499,00 |

---

### ETAPA 33 – PROMOÇÕES, COHORTS & GRUPOS ESPECIAIS ✅

**Campos adicionados:**
- `tipo_profile`: 'padrao' | 'promo' | 'cohort' | 'exclusivo'
- `cohort_label`: String livre para campanhas
- `cohort_tag`: Em user_subscriptions_core para analytics

**Fluxo de promoções:**
1. Criar profile específico (ex: `profissional_bf_2025`)
2. Atribuir stripe_price_id da campanha
3. Quando acabar: `marketable = false`
4. Clientes mantêm o profile (direitos adquiridos)

---

### ETAPA 34 – OVERRIDES INDIVIDUAIS & UI ADMIN ✅

**Tipos de override:**
- `grant` - Concede feature mesmo que profile não tenha
- `revoke` - Remove feature mesmo que profile tenha
- `limit_custom` - Substitui limite numérico

**UI Admin criada:**
- `/admin/planos-core` - Gerenciar overrides por usuário
- `/admin/planos-core/metricas` - Dashboard de métricas

**Arquivos:**
- `app/admin/planos-core/page.tsx` (180 linhas)
- `app/admin/planos-core/metricas/page.tsx` (220 linhas)

---

### ETAPA 35 – FRONT PAGE INTELIGENTE & GERADOR DE SAAS ✅

**Hooks React criados:**
- `usePlansForFrontpage()` - Retorna planos formatados
- `useHasFeature()` - Verifica acesso a feature
- `useEffectiveFeatures()` - Retorna features do usuário

**Documentação GERADOR-SAAS.md:**
- PLANOS_CORE
- ORACULO_CORE
- CONTROL_TOWER
- TELEMETRY_CORE
- HELPDESK_CORE
- ADDONS_CORE

---

## FEATURES CADASTRADAS (16)

| Feature Key | Nome | Categoria |
|-------------|------|-----------|
| `diario` | Diário de Episódios | core |
| `diario_ilimitado` | Diário Ilimitado | core |
| `teste_clareza` | Teste de Clareza | core |
| `chat_ia` | Chat com IA | ia |
| `oraculo_v2` | Oráculo V2 | ia |
| `relatorios_pdf` | Relatórios PDF | relatorios |
| `timeline` | Timeline | core |
| `plano_seguranca` | Plano Segurança | seguranca |
| `carta_futuro` | Carta Futuro | core |
| `modo_espelho` | Modo Espelho | core |
| `conquistas` | Conquistas | gamificacao |
| `dashboard_avancado` | Dashboard Avançado | relatorios |
| `suporte_prioritario` | Suporte Prioritário | suporte |
| `white_label` | White Label | enterprise |
| `api_acesso` | API | enterprise |
| `multi_usuarios` | Multi Usuários | enterprise |

---

## ARQUIVOS CRIADOS

| Arquivo | Linhas | Função |
|---------|--------|--------|
| `database/MEGA-SQL-PARTE1.sql` | 487 | Oráculo + PLANOS_CORE |
| `lib/planos-core.ts` | 605 | Classe + Hooks React |
| `docs/GERADOR-SAAS.md` | 284 | Documentação módulos CORE |
| `app/admin/planos-core/page.tsx` | 180 | UI de overrides |
| `app/admin/planos-core/metricas/page.tsx` | 220 | Dashboard métricas |

---

## DÍVIDAS TÉCNICAS

1. Conectar frontpage real ao `plan_catalog`
2. Atualizar `stripe_price_id` nos planos
3. Criar página de comparação dinâmica
4. Implementar rate limiting real
5. Adicionar notificações de limite

---

## PRÓXIMO BLOCO SUGERIDO

**BLOCO 36-40: BILLING AVANÇADO, RATE LIMITING & MÉTRICAS**

- ETAPA 36: UI de Overrides Individuais ✅
- ETAPA 37: Rate Limiting Real ✅
- ETAPA 38: Dashboard de Métricas ✅
- ETAPA 39: Stripe Integration ✅
- ETAPA 40: Notificações de Limite ✅

---

## REGRAS PARA GERADOR DE SAAS

Este módulo PLANOS_CORE pode ser reutilizado em qualquer SaaS gerado:

1. Copiar tabelas do MEGA-SQL-PARTE1.sql
2. Copiar lib/planos-core.ts
3. Adaptar features para o novo domínio
4. Criar profiles específicos
5. Configurar plan_catalog

---

**FIM DO BLOCO 31-35**
