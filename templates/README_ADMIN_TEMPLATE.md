# 🎯 Admin Template - Reutilizável para SaaS

## 📋 O que é este template?

Sistema administrativo completo e genérico, desenvolvido para o Radar Narcisista BR e 100% reutilizável para qualquer projeto SaaS.

### ✅ Recursos Inclusos

- **🔐 Sistema de Autenticação** com Supabase
- **📱 Layout Responsivo** (sidebar collapsible, header, painéis)
- **⚙️ Menu Dinâmico** com configuração visual
- **🔔 Sistema de Badges/Notificações**
- **📊 Dashboard com Cards e Métricas**
- **📝 CRUDs Genéricos** (listar, criar, editar, deletar)
- **🎨 UI Components** (tabelas, forms, modais, alerts)
- **💾 Cache Local** com localStorage
- **🌙 Dark Theme** profissional

## 🚀 Como Usar em Novos Projetos

### 1. Copiar Estrutura
```bash
# Copiar pasta admin para novo projeto
cp -r app/admin /novo-projeto/app/
cp -r lib/admin-* /novo-projeto/lib/
cp -r components/admin-* /novo-projeto/components/
```

### 2. Instalar Dependências
```bash
npm install @supabase/auth-helpers-nextjs lucide-react
```

### 3. Configurar Supabase
- Copiar variáveis de ambiente `.env.local`
- Criar tabela `users` se não existir
- Configurar RLS para admin

### 4. Personalizar Menu
Editar `lib/admin-menu-config.ts`:
```typescript
export const DEFAULT_MENU_ITEMS: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Layout', enabled: true, order: 1 },
  { id: 'users', label: 'Usuários', icon: 'Users', enabled: true, order: 2 },
  { id: 'products', label: 'Produtos', icon: 'Package', enabled: true, order: 3 },
  // ... adicionar itens específicos do seu negócio
]
```

### 5. Adaptar Conteúdo
- Trocar textos "Narcisista" pelo nome do seu SaaS
- Ajustar cores tema (se desejar)
- Modificar badges e lógicas específicas

## 📁 Estrutura de Arquivos

```
app/
├── admin/
│   ├── page.tsx                 # Dashboard principal
│   ├── AdminClient.tsx          # Componente admin principal
│   └── menu-config/
│       └── page.tsx             # Configuração visual do menu
├── login/
│   └── page.tsx                 # Login admin
└── api/
    └── admin/                   # APIs admin

lib/
├── admin-menu-config.ts         # Configuração centralizada do menu
├── admin-storage.ts             # Funções de storage/cache
└── ia-registry.ts               # Registro de recursos (adaptável)

components/
├── AdminSidebar.tsx             # Sidebar menu
└── [outros componentes admin]
```

## 🎨 Customização

### Cores do Tema
Em `AdminClient.tsx`:
```typescript
// Mudar cor principal
text-purple-400 → text-blue-400 (ou qualquer cor)
bg-purple-600/20 → bg-blue-600/20
```

### Ícones
Adicionar novos ícones em `AdminClient.tsx`:
```typescript
import { Package, ShoppingCart, Store } from 'lucide-react'

const iconMap = {
  // ... ícones existentes
  Package, ShoppingCart, Store  // novos ícones
}
```

### Badges/Notificações
Em `getBadge()` function:
```typescript
const getBadge = (itemId: string): number => {
  switch (itemId) {
    case 'orders': return pendingOrders
    case 'support': return supportTickets
    default: return 0
  }
}
```

## 🔧 Funcionalidades Extensíveis

### 1. Novas Páginas Admin
```typescript
// Adicionar em admin-menu-config.ts
{ id: 'nova-pagina', label: 'Nova Funcionalidade', icon: 'Star', enabled: true, order: 10 }
```

### 2. APIs Personalizadas
Criar em `app/api/admin/`:
```typescript
// app/api/admin/nova-funcionalidade/route.ts
export async function GET() {
  // sua lógica
}
```

### 3. Componentes Específicos
Adicionar abas no `AdminClient.tsx`:
```typescript
{activeTab === 'nova-funcionalidade' && (
  <NovaFuncionalidadeTab data={data} />
)}
```

## 📊 Exemplos de Adaptação

### Para E-commerce
```typescript
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Layout' },
  { id: 'products', label: 'Produtos', icon: 'Package' },
  { id: 'orders', label: 'Pedidos', icon: 'ShoppingCart' },
  { id: 'customers', label: 'Clientes', icon: 'Users' },
  { id: 'inventory', label: 'Estoque', icon: 'Archive' },
]
```

### Para Clínica/Hospital
```typescript
const menuItems = [
  { id: 'dashboard', label: 'Painel', icon: 'Layout' },
  { id: 'patients', label: 'Pacientes', icon: 'Users' },
  { id: 'appointments', label: 'Consultas', icon: 'Calendar' },
  { id: 'medical-records', label: 'Prontuários', icon: 'FileText' },
  { id: 'billing', label: 'Faturamento', icon: 'CreditCard' },
]
```

### Para Escola/Curso
```typescript
const menuItems = [
  { id: 'dashboard', label: 'Painel', icon: 'Layout' },
  { id: 'students', label: 'Alunos', icon: 'Users' },
  { id: 'courses', label: 'Cursos', icon: 'BookOpen' },
  { id: 'classes', label: 'Turmas', icon: 'Calendar' },
  { id: 'grades', label: 'Notas', icon: 'BarChart3' },
]
```

## 🚀 Deploy

O template funciona em qualquer plataforma Next.js:
- **Vercel** (recomendado)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 📈 Economia de Tempo

Usando este template você economiza:
- **~40 horas** de desenvolvimento admin
- **~20 componentes** prontos
- **~10 APIs** básicas implementadas
- **Sistema completo** de autenticação e layout

## 🔄 Manutenção

O template foi projetado para:
- **Fácil atualização** de menus sem código
- **Componentes modulares** e reutilizáveis
- **Código limpo** e bem documentado
- **Performance** otimizada

## 📝 Licença de Uso

Este template foi desenvolvido para o Radar Narcisista BR e pode ser:
- ✅ Reutilizado em projetos comerciais
- ✅ Modificado livremente
- ✅ Distribuído para equipe
- ❌ Não vendido como template separado

---

**Desenvolvido com Next.js 16 + TypeScript + TailwindCSS + Supabase**
