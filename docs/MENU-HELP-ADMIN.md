# 📚 MENU HELP - Sistema de Ajuda Embutida

> **Versão:** 1.0  
> **Criado em:** 03/12/2025  
> **Prioridade:** Este documento define o sistema de help por menu

---

## 📋 VISÃO GERAL

O sistema de Menu Help fornece ajuda contextual para cada menu do sistema, em linguagem simples para leigos.

### Públicos Atendidos

| Audience | Descrição |
|----------|-----------|
| `admin` | Administrador do Radar |
| `usuaria` | Usuária final |
| `profissional` | Psicólogo, advogado, etc. |
| `whitelabel` | Dono de instância white label |
| `gerador` | Usuário do gerador de SaaS |

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────┐
│                    MENU HELP SYSTEM                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              lib/menu-help-registry.ts                   │   │
│  │  • Tipos: MenuHelpBlock, MenuHelpAudience               │   │
│  │  • Registros: adminMenuHelp, usuariaMenuHelp, etc.      │   │
│  │  • Funções: getMenuHelp, getAllMenuHelps                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            components/MenuHelpModal.tsx                  │   │
│  │  • MenuHelpModal - Modal completo                       │   │
│  │  • MenuHelpButton - Botão de atalho                     │   │
│  │  • MenuHelpTooltip - Tooltip inline                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 ESTRUTURA DO HELP BLOCK

Cada menu tem um `MenuHelpBlock` com:

```typescript
interface MenuHelpBlock {
  id: string                          // Ex: 'admin-planos-promocoes'
  route: string                       // Ex: '/admin/planos'
  audience: MenuHelpAudience          // Público-alvo
  menuLabel: string                   // Rótulo do menu na UI
  
  titulo: string                      // Ex: "Planos e promoções"
  o_que_e: string                     // Explicação em linguagem de leigo
  para_que_serve: string              // Objetivo prático
  quando_usar: string                 // Situações típicas
  como_funciona: string               // Visão geral simples
  passo_a_passo: string[]             // Lista de passos
  exemplos: string[]                  // Exemplos concretos
  avisos: string[]                    // Alertas, riscos, limites
  ligacoes_com_outros_menus: string[] // Menus relacionados
  ultima_atualizacao?: string         // Data ISO
}
```

---

## 🎯 MENUS COBERTOS

### Admin (9 menus)

| Menu | Route | Status |
|------|-------|--------|
| Oráculo | `/admin/oraculo` | ✅ |
| IA Personas | `/admin/ia-personas` | ✅ |
| IA Matrix | `/admin/ia-matrix` | ✅ |
| Planos | `/admin/planos` | ✅ |
| Usuários | `/admin/usuarios` | ✅ |
| Custos IA | `/admin/custos-ia` | ✅ |
| Configurar IAs | `/admin/configurar-ias` | ✅ |
| Gerador SaaS | `/admin/gerador-saas` | ✅ |
| Analytics | `/admin/analytics` | ✅ |

### Usuária (5 menus)

| Menu | Route | Status |
|------|-------|--------|
| Dashboard | `/dashboard` | ✅ |
| Diário | `/diario` | ✅ |
| Chat | `/chat` | ✅ |
| Teste de Clareza | `/teste-clareza` | ✅ |
| Plano de Segurança | `/plano-seguranca` | ✅ |

### Profissional (1 menu)

| Menu | Route | Status |
|------|-------|--------|
| Painel Profissional | `/dashboard-profissional` | ✅ |

### White Label (1 menu)

| Menu | Route | Status |
|------|-------|--------|
| Painel White Label | `/admin` | ✅ |

### Gerador (1 menu)

| Menu | Route | Status |
|------|-------|--------|
| Gerador de SaaS | `/admin/gerador-saas` | ✅ |

---

## 🔧 COMO USAR

### 1. Adicionar botão de help em um menu

```tsx
import { MenuHelpButton } from '@/components/MenuHelpModal'

// No header do menu
<div className="flex items-center gap-2">
  <h1>Oráculo</h1>
  <MenuHelpButton route="/admin/oraculo" audience="admin" />
</div>
```

### 2. Usar modal completo

```tsx
import { MenuHelpModal } from '@/components/MenuHelpModal'

<MenuHelpModal 
  route="/admin/oraculo" 
  audience="admin" 
  trigger="button"  // 'icon' | 'button' | 'text'
/>
```

### 3. Usar tooltip inline

```tsx
import { MenuHelpTooltip } from '@/components/MenuHelpModal'

<MenuHelpTooltip route="/admin/oraculo" audience="admin">
  <span>Oráculo</span>
</MenuHelpTooltip>
```

### 4. Buscar help programaticamente

```typescript
import { getMenuHelp, getAllMenuHelps } from '@/lib/menu-help-registry'

// Buscar help de um menu específico
const help = getMenuHelp('admin', '/admin/oraculo')

// Buscar todos os helps de um audience
const allAdminHelps = getAllMenuHelps('admin')
```

---

## ➕ COMO ADICIONAR NOVO HELP

1. Abra `lib/menu-help-registry.ts`
2. Encontre o array do audience correto (ex: `adminMenuHelp`)
3. Adicione um novo objeto `MenuHelpBlock`:

```typescript
{
  id: 'admin-novo-menu',
  route: '/admin/novo-menu',
  audience: 'admin',
  menuLabel: '🆕 Novo Menu',
  titulo: 'Título do Novo Menu',
  o_que_e: 'Explicação simples...',
  para_que_serve: 'Objetivo...',
  quando_usar: 'Situações...',
  como_funciona: 'Funcionamento...',
  passo_a_passo: [
    'Passo 1',
    'Passo 2',
    'Passo 3'
  ],
  exemplos: [
    'Exemplo 1',
    'Exemplo 2'
  ],
  avisos: [
    'Aviso importante'
  ],
  ligacoes_com_outros_menus: ['/admin/outro-menu'],
  ultima_atualizacao: '2025-12-03'
}
```

---

## 📁 ARQUIVOS RELACIONADOS

| Arquivo | Descrição |
|---------|-----------|
| `lib/menu-help-registry.ts` | Registry central de helps |
| `components/MenuHelpModal.tsx` | Componentes de UI |
| `docs/MENU-HELP-ADMIN.md` | Esta documentação |

---

## ⚠️ REGRAS IMPORTANTES

1. **Linguagem simples**: Escreva como se estivesse explicando para alguém que nunca usou o sistema
2. **Exemplos concretos**: Sempre inclua exemplos práticos
3. **Avisos claros**: Destaque riscos e limitações
4. **Atualização**: Sempre atualize o campo `ultima_atualizacao` ao modificar

---

*Documento criado em: 03/12/2025*
*Última atualização: 03/12/2025*
