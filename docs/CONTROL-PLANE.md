# 🎛️ CONTROL PLANE GLOBAL

> **Versão:** 1.0  
> **Criado em:** 03/12/2025  
> **Prioridade:** Este documento define a arquitetura de administração do Radar e SaaS gerados

---

## 📋 VISÃO GERAL

O Control Plane define como o RADAR NARCISISTA é administrado em produção, incluindo:

- **Instância principal** (Radar)
- **Instâncias White Label**
- **SaaS gerados pelo GERADOR DE SAAS**
- **Painel único do dono** (Eduardo)

---

## 🏗️ TRÊS CAMADAS CLARAS

### 1. CÓDIGO (APP)
- Projeto Next.js (Radar, White Label X, SaaS Y…)
- Versão de código só muda com **DEPLOY** (Vercel)
- Arquivos: `app/`, `lib/`, `components/`

### 2. CONFIGURAÇÃO (BANCO / METADADOS)
- IA ligada/desligada por menu, plano, grupo, usuário
- Planos, promoções, grupos, limites, feature flags
- **NÃO precisa de deploy** - lidas do banco em tempo real
- Tabelas: `ai_*`, `features`, `feature_profiles`, `plan_catalog`

### 3. CONTROL PLANE (PAINEL DO DONO)
- Interface usada pelo EDUARDO para controlar tudo
- Pode existir:
  - **DENTRO** do próprio SaaS (`/admin`)
  - **EM APP SEPARADO** ("Control Hub") - futuro

---

## 🔧 MODOS DE ADMINISTRAÇÃO

### MODO A – ADMIN LOCAL POR INSTÂNCIA (ATUAL)

```
┌─────────────────────────────────────────────────────────┐
│                    RADAR-MÃE                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              /admin                              │   │
│  │  • IA por menu                                   │   │
│  │  • IA por plano                                  │   │
│  │  • IA por grupo/promoção                         │   │
│  │  • IA por usuário                                │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│              ┌──────────────────┐                       │
│              │    SUPABASE      │                       │
│              │  (Banco Radar)   │                       │
│              └──────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

**Características:**
- Cada SaaS tem seu próprio `/admin`
- Admin grava configurações no banco da instância
- Eduardo como SUPER-ADMIN acessa qualquer instância

### MODO B – CONTROL HUB EXTERNO (FUTURO)

```
┌─────────────────────────────────────────────────────────┐
│                   CONTROL HUB                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Painel Único do Dono                     │   │
│  │  • Lista de instâncias                           │   │
│  │  • Status de cada uma                            │   │
│  │  • Configuração centralizada                     │   │
│  │  • Visão consolidada de custos                   │   │
│  └─────────────────────────────────────────────────┘   │
│              │              │              │            │
│              ▼              ▼              ▼            │
│        ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│        │ Radar   │   │ White   │   │ SaaS    │        │
│        │ Mãe     │   │ Label X │   │ Filho Y │        │
│        └─────────┘   └─────────┘   └─────────┘        │
└─────────────────────────────────────────────────────────┘
```

**Planejado para:** BLOCO 46-50

---

## 🔄 COMO AS MUDANÇAS CHEGAM NA VERCEL

### 1. MUDANÇA DE CONFIGURAÇÃO (Sem Deploy)

| Exemplo | Fluxo |
|---------|-------|
| Ativar/desativar IA | Admin → Supabase → Efeito imediato |
| Criar grupo "Black Friday" | Admin → Supabase → Efeito imediato |
| Ajustar limites por plano | Admin → Supabase → Efeito imediato |
| Mudar thresholds | Admin → Supabase → Efeito imediato |

### 2. MUDANÇA DE CÓDIGO (Com Deploy)

| Exemplo | Fluxo |
|---------|-------|
| Nova página React | Código → Git → Vercel → Deploy |
| Nova rota /api | Código → Git → Vercel → Deploy |
| Nova lógica de IA | Código → Git → Vercel → Deploy |
| Migration de banco | SQL → Supabase → Código → Deploy |

### 3. ADMIN LOCAL vs ADMIN NUVEM

| Ambiente | URL | Banco |
|----------|-----|-------|
| Desenvolvimento | `localhost:3000/admin` | Supabase Dev |
| Produção | `radar-narcisista.vercel.app/admin` | Supabase Prod |

**Comportamento idêntico** - a diferença é apenas qual banco está conectado.

---

## 🔗 SIMBIOSE COM GERADOR DE SAAS

### O que é copiado para cada SaaS filho:

```
RADAR-CORE
├── Tabelas de configuração
│   ├── ai_providers_core
│   ├── ai_features_core
│   ├── ai_plan_matrix
│   ├── ai_feature_menu_map
│   ├── features
│   ├── feature_profiles
│   └── plan_catalog
├── Valores default
│   ├── Providers (OpenAI, Claude, etc.)
│   ├── Features (diário, chat, etc.)
│   └── Planos (free, profissional, etc.)
└── Painéis admin
    ├── /admin/ia-matrix
    ├── /admin/ia-mapa-menus
    └── /admin/ia-carga
```

### Independência do SaaS filho:

- Tem seu próprio `/admin`
- Tem seu próprio banco
- Pode personalizar IAs e planos
- **NÃO depende do Radar-mãe** após geração

---

## 🏷️ WHITE LABEL

### Limites definidos pelo SUPER-ADMIN (Eduardo):

| Configuração | Quem define |
|--------------|-------------|
| Quais IAs disponíveis | Eduardo |
| Limites máximos de uso | Eduardo |
| Features visíveis no admin | Eduardo |

### O que o dono do White Label pode fazer:

| Ação | Permitido |
|------|-----------|
| Gerenciar seus usuários | ✅ |
| Ajustar planos (dentro dos limites) | ✅ |
| Personalizar visual | ✅ |
| Exceder limites de IA | ❌ |
| Acessar outras instâncias | ❌ |

---

## 📁 ARQUIVOS RELACIONADOS

| Arquivo | Descrição |
|---------|-----------|
| `lib/ai-config-core.ts` | Serviço de configuração de IAs |
| `lib/planos-core.ts` | Serviço de planos e features |
| `database/migrate-ai-config-core.sql` | Tabelas AI_CONFIG_CORE |
| `database/migrate-planos-core.sql` | Tabelas PLANOS_CORE |
| `app/admin/ia-matrix/page.tsx` | UI de configuração de IAs |
| `app/admin/ia-mapa-menus/page.tsx` | Mapa de IAs por menu |
| `app/admin/ia-carga/page.tsx` | Dashboard de uso de IAs |

---

## 🗺️ ROADMAP

### Implementado (BLOCO 31-45):
- ✅ MODO A (Admin local)
- ✅ AI_CONFIG_CORE
- ✅ PLANOS_CORE
- ✅ GERADOR DE SAAS

### Planejado (BLOCO 46-50):
- ⏳ MODO B (Control Hub externo)
- ⏳ APIs `/api/control-plane/*`
- ⏳ Visão consolidada multi-instância
- ⏳ Billing centralizado

---

## ⚠️ REGRAS PARA WINDSURF/CHATGPT

1. **Sempre que o usuário falar em "admin local":**
   - Interpretar como MODO A (atual)
   - Configurações vão para o banco da instância

2. **Sempre que sugerir novas features:**
   - Considerar impacto no Radar-mãe
   - Considerar impacto em White Labels
   - Considerar impacto em SaaS filhos

3. **Sempre que mexer em configuração:**
   - Verificar se é CÓDIGO ou CONFIGURAÇÃO
   - Se for configuração, não precisa deploy

---

*Documento criado em: 03/12/2025*
*Última atualização: 03/12/2025*
