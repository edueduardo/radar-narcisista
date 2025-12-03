# 🎨 PATCH UI CORE - Núcleo de Interfaces

> **Versão:** 1.0  
> **Criado em:** 03/12/2025  
> **Prioridade:** Este PATCH tem prioridade sobre especificações antigas de menus e dashboards

---

## 📋 VISÃO GERAL

O UI Core Registry é a **FONTE DA VERDADE** para todas as telas do sistema.
A partir dele são construídos automaticamente:

- Menu do ADMIN
- Dashboard da USUÁRIA
- Dashboard do PROFISSIONAL
- Painel WHITE-LABEL
- Painel GERADOR DE SAAS

### Regra Principal

> **Todo novo menu/tela/dash DEVE ser registrado no `ui-core-registry.ts`**

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI CORE REGISTRY                             │
│                  lib/ui-core-registry.ts                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Groups    │  │   Screens   │  │  Functions  │             │
│  │  (25 total) │  │  (96 total) │  │   helpers   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ DynamicSidebar  │ │DynamicDashboard │ │   Outros...     │
│   (Sidebar)     │ │   (Dashboard)   │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 📊 ESTATÍSTICAS

| Audience | Grupos | Telas |
|----------|--------|-------|
| **admin** | 8 | 55 |
| **user** | 5 | 17 |
| **professional** | 4 | 8 |
| **whitelabel** | 4 | 8 |
| **generator** | 4 | 8 |
| **TOTAL** | **25** | **96** |

---

## 📁 ARQUIVOS

| Arquivo | Descrição |
|---------|-----------|
| `lib/ui-core-registry.ts` | Registry central (fonte da verdade) |
| `components/layout/DynamicSidebar.tsx` | Sidebar dinâmica |
| `components/layout/DynamicDashboard.tsx` | Dashboard dinâmico |
| `docs/PATCH-UI-CORE.md` | Esta documentação |

---

## 🔧 COMO USAR

### 1. Sidebar Dinâmica

```tsx
import { DynamicSidebar } from '@/components/layout/DynamicSidebar'

// No layout do admin
<DynamicSidebar audience="admin" />

// No layout da usuária
<DynamicSidebar audience="user" />

// Com collapse
<DynamicSidebar audience="admin" collapsed={isCollapsed} onToggle={toggle} />
```

### 2. Dashboard Dinâmico

```tsx
import { DynamicDashboard } from '@/components/layout/DynamicDashboard'

// Dashboard completo
<DynamicDashboard audience="admin" showStats />

// Com título customizado
<DynamicDashboard 
  audience="user" 
  title="Bem-vinda de volta!" 
  subtitle="Continue sua jornada"
/>
```

### 3. Cards Individuais

```tsx
import { DashboardCard, DashboardGroup } from '@/components/layout/DynamicDashboard'

// Card individual
<DashboardCard screen={screen} variant="featured" />

// Grupo de cards
<DashboardGroup group={group} screens={screens} maxCards={6} />
```

### 4. Acesso Rápido

```tsx
import { QuickAccess } from '@/components/layout/DynamicDashboard'

<QuickAccess 
  audience="user" 
  screenIds={['user-diario', 'user-chat', 'user-teste-clareza']}
  title="Seus favoritos"
/>
```

### 5. Funções do Registry

```typescript
import { 
  getMenuForAudience,
  getScreensByGroup,
  getScreenByRoute,
  getRegistryStats
} from '@/lib/ui-core-registry'

// Menu completo para um audience
const adminMenu = getMenuForAudience('admin')

// Telas de um grupo específico
const aiScreens = getScreensByGroup('admin_ai_core')

// Buscar tela por rota
const screen = getScreenByRoute('/admin/ia-personas')

// Estatísticas
const stats = getRegistryStats()
```

---

## ➕ COMO ADICIONAR NOVA TELA

### Passo 1: Adicionar ao Registry

Abra `lib/ui-core-registry.ts` e adicione ao array correto:

```typescript
// Em adminScreens, userScreens, etc.
{
  id: 'admin-nova-tela',
  groupId: 'admin_ai_core',  // Grupo existente
  audience: 'admin',
  route: '/admin/nova-tela',
  label: 'Nova Tela',
  icon: '🆕',
  description: 'Descrição da nova tela',
  priority: 11,  // Ordem dentro do grupo
  enabledByDefault: true,
  isNew: true  // Marca como "Novo"
}
```

### Passo 2: Criar a Página

```bash
# Criar arquivo
app/admin/nova-tela/page.tsx
```

### Passo 3: Adicionar Help (opcional)

Em `lib/menu-help-registry.ts`:

```typescript
{
  id: 'admin-nova-tela',
  route: '/admin/nova-tela',
  audience: 'admin',
  // ... resto do help
}
```

---

## 📋 GRUPOS DISPONÍVEIS

### Admin (8 grupos)

| ID | Label | Ícone |
|----|-------|-------|
| `admin_overview` | Visão Geral & Controle | 🎯 |
| `admin_people` | Pessoas & Acessos | 👥 |
| `admin_plans_billing` | Planos, Billing & Promoções | 💳 |
| `admin_ai_core` | IAs & Orquestração | 🤖 |
| `admin_product` | Produto & Funcionalidades | 🎯 |
| `admin_front_content` | Front & Conteúdos | 🎨 |
| `admin_governance` | Governança & LGPD | ⚖️ |
| `admin_lab` | Laboratório & Dev | 🧪 |

### Usuária (5 grupos)

| ID | Label | Ícone |
|----|-------|-------|
| `user_overview` | Início | 🏠 |
| `user_safety` | Segurança | 🛡️ |
| `user_emotions` | Emoções | 💜 |
| `user_clarity` | Clareza | 🎯 |
| `user_resources` | Recursos | 📚 |

### Profissional (4 grupos)

| ID | Label | Ícone |
|----|-------|-------|
| `pro_overview` | Painel | 🏠 |
| `pro_clients` | Clientes | 👥 |
| `pro_reports` | Relatórios | 📄 |
| `pro_learning` | Aprendizado | 📚 |

### White Label (4 grupos)

| ID | Label | Ícone |
|----|-------|-------|
| `wl_overview` | Painel | 🏠 |
| `wl_branding` | Marca | 🎨 |
| `wl_plans` | Planos | 💳 |
| `wl_team` | Equipe | 👥 |

### Gerador (4 grupos)

| ID | Label | Ícone |
|----|-------|-------|
| `gen_overview` | Painel | 🏭 |
| `gen_templates` | Templates | 📋 |
| `gen_instances` | Instâncias | 🏢 |
| `gen_logs` | Logs | 📜 |

---

## ⚠️ REGRAS IMPORTANTES

1. **Nunca criar tela sem registrar** no `ui-core-registry.ts`
2. **Usar grupos existentes** sempre que possível
3. **Manter prioridades** consistentes (1 = mais importante)
4. **Marcar placeholders** com `isPlaceholder: true`
5. **Marcar novidades** com `isNew: true`

---

## 🔄 INTEGRAÇÃO COM GERADOR DE SAAS

O registry é copiado para cada SaaS gerado, permitindo:

- Customização de grupos por instância
- Ativação/desativação de telas
- Reordenação de prioridades
- Adição de telas específicas

---

*Documento criado em: 03/12/2025*
*Última atualização: 03/12/2025*
