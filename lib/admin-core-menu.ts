/**
 * ADMIN CORE MENU - Estrutura Centralizada do Menu Administrativo
 * 
 * Este arquivo define a estrutura do menu admin que é:
 * - Usado pelo RADAR (projeto mãe)
 * - Copiado pelo GERADOR DE SAAS
 * - Herdado por instâncias WHITE LABEL
 * 
 * ORGANIZAÇÃO: 8 grupos principais por prioridade de uso
 * 
 * @see docs/MANUAL-ADMIN.md para documentação completa
 */

// ============================================================================
// TIPOS
// ============================================================================

export type AdminMenuAudience = 'admin' | 'whitelabel' | 'gerador' | 'dev'

export interface AdminMenuItem {
  id: string
  label: string
  icon: string
  route?: string
  children?: AdminMenuItem[]
  audience?: AdminMenuAudience[]
  badge?: string
  isNew?: boolean
  isPlaceholder?: boolean
  description?: string
}

export interface AdminMenuGroup {
  id: string
  label: string
  icon: string
  order: number
  items: AdminMenuItem[]
  audience?: AdminMenuAudience[]
  description?: string
}

// ============================================================================
// GRUPO 1: VISÃO GERAL & CONTROLE
// ============================================================================

const grupoVisaoGeral: AdminMenuGroup = {
  id: 'admin-core-overview',
  label: 'Visão Geral & Controle',
  icon: '🎯',
  order: 1,
  description: 'Painéis principais e monitoramento do sistema',
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      route: '/admin',
      description: 'Painel principal do admin'
    },
    {
      id: 'oraculo',
      label: 'Oráculo V1',
      icon: '🔮',
      route: '/admin/oraculo',
      description: 'Visão executiva com métricas'
    },
    {
      id: 'oraculo-metricas',
      label: 'Oráculo Métricas',
      icon: '📊',
      route: '/admin/oraculo-metricas',
      description: 'Métricas detalhadas do Oráculo'
    },
    {
      id: 'control-tower',
      label: 'Control Tower',
      icon: '🗼',
      route: '/admin/control-tower',
      description: 'Torre de controle do sistema'
    },
    {
      id: 'metricas',
      label: 'Métricas Gerais',
      icon: '📈',
      route: '/admin/metricas',
      description: 'Métricas e KPIs do sistema'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📉',
      route: '/admin/analytics',
      description: 'Análise de dados e comportamento'
    },
    {
      id: 'analytics-dashboard',
      label: 'Analytics Dashboard',
      icon: '📊',
      route: '/admin/analytics-dashboard',
      description: 'Dashboard de analytics avançado'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: '💡',
      route: '/admin/insights',
      description: 'Insights automáticos do sistema'
    },
    {
      id: 'mapa-sistema',
      label: 'Mapa do Sistema',
      icon: '🗺️',
      route: '/admin/mapa-sistema',
      description: 'Visão geral da arquitetura'
    }
  ]
}

// ============================================================================
// GRUPO 2: PESSOAS & ACESSOS
// ============================================================================

const grupoPessoas: AdminMenuGroup = {
  id: 'admin-core-people',
  label: 'Pessoas & Acessos',
  icon: '👥',
  order: 2,
  description: 'Gerenciamento de usuários e acessos',
  items: [
    {
      id: 'usuarios',
      label: 'Usuárias',
      icon: '👤',
      route: '/admin/usuarios',
      description: 'Gerenciar usuárias do sistema'
    },
    {
      id: 'comunidade',
      label: 'Comunidade',
      icon: '🤝',
      route: '/admin/comunidade',
      description: 'Gestão da comunidade'
    },
    {
      id: 'oraculo-instances',
      label: 'Instâncias',
      icon: '🏢',
      route: '/admin/oraculo-instances',
      description: 'Gerenciar instâncias white-label'
    },
    {
      id: 'profissionais',
      label: 'Profissionais',
      icon: '👔',
      route: '/admin/profissionais',
      isPlaceholder: true,
      description: 'Gerenciar profissionais cadastrados'
    },
    {
      id: 'equipe',
      label: 'Equipe Interna',
      icon: '👷',
      route: '/admin/equipe',
      isPlaceholder: true,
      description: 'Gerenciar equipe interna/staff'
    }
  ]
}

// ============================================================================
// GRUPO 3: PLANOS, BILLING & PROMOÇÕES
// ============================================================================

const grupoPlanos: AdminMenuGroup = {
  id: 'admin-core-billing',
  label: 'Planos, Billing & Promoções',
  icon: '💳',
  order: 3,
  description: 'Gestão financeira e de assinaturas',
  items: [
    {
      id: 'planos',
      label: 'Planos',
      icon: '📋',
      route: '/admin/planos',
      description: 'Gerenciar planos de assinatura'
    },
    {
      id: 'planos-core',
      label: 'Planos Core',
      icon: '⚙️',
      route: '/admin/planos-core',
      description: 'Configuração avançada de planos'
    },
    {
      id: 'loja',
      label: 'Loja / Add-ons',
      icon: '🛒',
      route: '/admin/loja',
      isPlaceholder: true,
      description: 'Gerenciar loja e add-ons'
    },
    {
      id: 'promocoes',
      label: 'Promoções',
      icon: '🎁',
      route: '/admin/promocoes',
      isPlaceholder: true,
      description: 'Criar e gerenciar promoções'
    },
    {
      id: 'excecoes',
      label: 'Exceções Individuais',
      icon: '⭐',
      route: '/admin/excecoes',
      isPlaceholder: true,
      description: 'Benefícios especiais por usuário'
    }
  ]
}

// ============================================================================
// GRUPO 4: IAs & ORQUESTRAÇÃO
// ============================================================================

const grupoIAs: AdminMenuGroup = {
  id: 'admin-core-ai',
  label: 'IAs & Orquestração',
  icon: '🤖',
  order: 4,
  description: 'Configuração e monitoramento de IAs',
  items: [
    {
      id: 'ia-personas',
      label: 'IA Personas',
      icon: '🎭',
      route: '/admin/ia-personas',
      isNew: true,
      description: 'Cockpit de personas/avatares de IA'
    },
    {
      id: 'configurar-ias',
      label: 'Configurar IAs',
      icon: '🔧',
      route: '/admin/configurar-ias',
      description: 'Configurar API keys e provedores'
    },
    {
      id: 'gerenciar-ias',
      label: 'Gerenciar IAs',
      icon: '🎛️',
      route: '/admin/gerenciar-ias',
      description: 'Gerenciar IAs ativas'
    },
    {
      id: 'mapa-ias',
      label: 'Mapa de IAs',
      icon: '🗺️',
      route: '/admin/mapa-ias',
      description: 'Mapa de IAs por rota/função'
    },
    {
      id: 'ia-matrix',
      label: 'IA Matrix',
      icon: '🧮',
      route: '/admin/ia-matrix',
      description: 'Matrix de configuração de IAs'
    },
    {
      id: 'ia-mapa-menus',
      label: 'IA Mapa Menus',
      icon: '📍',
      route: '/admin/ia-mapa-menus',
      description: 'Mapeamento de IAs por menu'
    },
    {
      id: 'fluxos-ia',
      label: 'Fluxos de IA',
      icon: '🔄',
      route: '/admin/fluxos-ia',
      description: 'Orquestrador de fluxos de IA'
    },
    {
      id: 'ia-assistente',
      label: 'IA Assistente',
      icon: '💬',
      route: '/admin/ia-assistente',
      description: 'Assistente de IA para admin'
    },
    {
      id: 'custos-ia',
      label: 'Custos de IA',
      icon: '💰',
      route: '/admin/custos-ia',
      description: 'Monitoramento de custos de IA'
    },
    {
      id: 'ia-carga',
      label: 'IA Carga',
      icon: '📦',
      route: '/admin/ia-carga',
      description: 'Carga e importação de dados de IA'
    }
  ]
}

// ============================================================================
// GRUPO 5: PRODUTO & FUNCIONALIDADES
// ============================================================================

const grupoProduto: AdminMenuGroup = {
  id: 'admin-core-product',
  label: 'Produto & Funcionalidades',
  icon: '🎯',
  order: 5,
  description: 'Funcionalidades principais do produto',
  items: [
    {
      id: 'teste-clareza-ia',
      label: 'Teste de Clareza IA',
      icon: '🎯',
      route: '/admin/teste-clareza-ia',
      description: 'Configurar teste de clareza'
    },
    {
      id: 'historias',
      label: 'Histórias / Jornadas',
      icon: '📖',
      route: '/admin/historias',
      description: 'Gerenciar histórias e jornadas'
    },
    {
      id: 'chat',
      label: 'Chat Admin',
      icon: '💬',
      route: '/admin/chat',
      description: 'Configurações do chat'
    },
    {
      id: 'estados',
      label: 'Estados',
      icon: '🔄',
      route: '/admin/estados',
      description: 'Gerenciar estados do sistema'
    },
    {
      id: 'quiz-generator',
      label: 'Gerador de Quiz',
      icon: '❓',
      route: '/admin/quiz-generator',
      description: 'Criar quizzes e testes'
    },
    {
      id: 'seguranca',
      label: 'Plano de Segurança',
      icon: '🛡️',
      route: '/admin/seguranca',
      isPlaceholder: true,
      description: 'Configurar planos de segurança'
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: '📄',
      route: '/admin/relatorios',
      isPlaceholder: true,
      description: 'Gerenciar relatórios'
    }
  ]
}

// ============================================================================
// GRUPO 6: FRONT & CONTEÚDOS
// ============================================================================

const grupoFront: AdminMenuGroup = {
  id: 'admin-core-front',
  label: 'Front & Conteúdos',
  icon: '🎨',
  order: 6,
  description: 'Gestão de conteúdo e aparência',
  items: [
    {
      id: 'frontpage',
      label: 'Frontpage',
      icon: '🏠',
      route: '/admin/frontpage',
      description: 'Estrutura da página inicial'
    },
    {
      id: 'frontpage-editor',
      label: 'Frontpage Editor',
      icon: '✏️',
      route: '/admin/frontpage-editor',
      description: 'Editor visual da frontpage'
    },
    {
      id: 'frontpage-visual',
      label: 'Frontpage Visual',
      icon: '👁️',
      route: '/admin/frontpage-visual',
      description: 'Preview da frontpage'
    },
    {
      id: 'builder',
      label: 'Builder',
      icon: '🔨',
      route: '/admin/builder',
      description: 'Construtor de páginas'
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca',
      icon: '📚',
      route: '/admin/biblioteca',
      description: 'Biblioteca de conteúdos'
    },
    {
      id: 'conteudos',
      label: 'Conteúdos',
      icon: '📝',
      route: '/admin/conteudos',
      description: 'Gerenciar conteúdos'
    },
    {
      id: 'curadoria',
      label: 'Curadoria',
      icon: '🎯',
      route: '/admin/curadoria',
      description: 'Curadoria de conteúdo'
    },
    {
      id: 'menu-config',
      label: 'Configurar Menu',
      icon: '📋',
      route: '/admin/menu-config',
      description: 'Configurar menus do sistema'
    }
  ]
}

// ============================================================================
// GRUPO 7: GOVERNANÇA & LGPD
// ============================================================================

const grupoGovernanca: AdminMenuGroup = {
  id: 'admin-core-governance',
  label: 'Governança & LGPD',
  icon: '⚖️',
  order: 7,
  description: 'Compliance, termos e auditoria',
  items: [
    {
      id: 'termos-aceitos',
      label: 'Termos Aceitos',
      icon: '✅',
      route: '/admin/termos-aceitos',
      description: 'Visualizar aceites de termos'
    },
    {
      id: 'auditoria-suporte',
      label: 'Auditoria Suporte',
      icon: '🔍',
      route: '/admin/auditoria-suporte',
      description: 'Auditoria de ações de suporte'
    },
    {
      id: 'privacidade',
      label: 'Privacidade',
      icon: '🔒',
      route: '/admin/privacidade',
      isPlaceholder: true,
      description: 'Configurações de privacidade'
    },
    {
      id: 'lgpd',
      label: 'LGPD / Exportar Dados',
      icon: '📤',
      route: '/admin/lgpd',
      isPlaceholder: true,
      description: 'Ferramentas LGPD'
    },
    {
      id: 'logs-legais',
      label: 'Logs Legais',
      icon: '📜',
      route: '/admin/logs-legais',
      isPlaceholder: true,
      description: 'Logs para auditoria legal'
    }
  ]
}

// ============================================================================
// GRUPO 8: LABORATÓRIO & DEV
// ============================================================================

const grupoLab: AdminMenuGroup = {
  id: 'admin-core-lab',
  label: 'Laboratório & Dev',
  icon: '🧪',
  order: 8,
  audience: ['admin', 'dev'],
  description: 'Ferramentas de desenvolvimento e testes',
  items: [
    {
      id: 'gerador-saas',
      label: 'Gerador de SaaS',
      icon: '🏭',
      route: '/admin/gerador-saas',
      description: 'Gerar novos projetos SaaS'
    },
    {
      id: 'beta-testers',
      label: 'Beta Testers',
      icon: '🧪',
      route: '/admin/beta-testers',
      description: 'Gerenciar beta testers'
    },
    {
      id: 'ab-testing',
      label: 'A/B Testing',
      icon: '🔬',
      route: '/admin/ab-testing',
      description: 'Configurar testes A/B'
    },
    {
      id: 'easter-eggs',
      label: 'Easter Eggs',
      icon: '🥚',
      route: '/admin/easter-eggs',
      description: 'Gerenciar easter eggs'
    },
    {
      id: 'checklist-lancamento',
      label: 'Checklist Lançamento',
      icon: '✅',
      route: '/admin/checklist-lancamento',
      description: 'Checklist para lançamento'
    },
    {
      id: 'repair-env',
      label: 'Repair Env',
      icon: '🔧',
      route: '/admin/repair-env',
      isPlaceholder: true,
      description: 'Ferramentas de reparo'
    }
  ]
}

// ============================================================================
// MENU COMPLETO
// ============================================================================

export const adminCoreMenu: AdminMenuGroup[] = [
  grupoVisaoGeral,
  grupoPessoas,
  grupoPlanos,
  grupoIAs,
  grupoProduto,
  grupoFront,
  grupoGovernanca,
  grupoLab
]

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Retorna todos os grupos do menu
 */
export function getAllMenuGroups(): AdminMenuGroup[] {
  return adminCoreMenu
}

/**
 * Retorna um grupo específico pelo ID
 */
export function getMenuGroup(groupId: string): AdminMenuGroup | null {
  return adminCoreMenu.find(g => g.id === groupId) || null
}

/**
 * Retorna um item de menu pelo ID
 */
export function getMenuItem(itemId: string): AdminMenuItem | null {
  for (const group of adminCoreMenu) {
    const item = group.items.find(i => i.id === itemId)
    if (item) return item
  }
  return null
}

/**
 * Retorna um item de menu pela rota
 */
export function getMenuItemByRoute(route: string): AdminMenuItem | null {
  for (const group of adminCoreMenu) {
    const item = group.items.find(i => i.route === route)
    if (item) return item
  }
  return null
}

/**
 * Retorna o grupo de um item
 */
export function getGroupForItem(itemId: string): AdminMenuGroup | null {
  for (const group of adminCoreMenu) {
    if (group.items.some(i => i.id === itemId)) {
      return group
    }
  }
  return null
}

/**
 * Filtra menu por audience
 */
export function getMenuForAudience(audience: AdminMenuAudience): AdminMenuGroup[] {
  return adminCoreMenu
    .filter(g => !g.audience || g.audience.includes(audience))
    .map(g => ({
      ...g,
      items: g.items.filter(i => !i.audience || i.audience.includes(audience))
    }))
}

/**
 * Retorna todos os itens (flat)
 */
export function getAllMenuItems(): AdminMenuItem[] {
  return adminCoreMenu.flatMap(g => g.items)
}

/**
 * Retorna itens que são placeholders
 */
export function getPlaceholderItems(): AdminMenuItem[] {
  return getAllMenuItems().filter(i => i.isPlaceholder)
}

/**
 * Retorna itens novos
 */
export function getNewItems(): AdminMenuItem[] {
  return getAllMenuItems().filter(i => i.isNew)
}

/**
 * Conta total de itens
 */
export function getTotalItemsCount(): number {
  return getAllMenuItems().length
}

/**
 * Conta itens implementados (não placeholder)
 */
export function getImplementedItemsCount(): number {
  return getAllMenuItems().filter(i => !i.isPlaceholder).length
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

export const menuStats = {
  totalGroups: adminCoreMenu.length,
  totalItems: getTotalItemsCount(),
  implementedItems: getImplementedItemsCount(),
  placeholderItems: getPlaceholderItems().length,
  newItems: getNewItems().length
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const AdminCoreMenu = {
  groups: adminCoreMenu,
  getAllMenuGroups,
  getMenuGroup,
  getMenuItem,
  getMenuItemByRoute,
  getGroupForItem,
  getMenuForAudience,
  getAllMenuItems,
  getPlaceholderItems,
  getNewItems,
  getTotalItemsCount,
  getImplementedItemsCount,
  stats: menuStats
}

export default AdminCoreMenu
