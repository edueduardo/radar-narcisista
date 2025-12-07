/**
 * UI CORE REGISTRY - Registro Central de Interfaces
 * 
 * Este arquivo é a FONTE DA VERDADE para todas as telas do sistema.
 * A partir dele são construídos:
 * - Menu do ADMIN
 * - Dashboard da USUÁRIA
 * - Dashboard do PROFISSIONAL
 * - Painel WHITE-LABEL
 * - Painel GERADOR DE SAAS
 * 
 * REGRA: Todo novo menu/tela/dash DEVE ser registrado aqui.
 * 
 * @see docs/PATCH-UI-CORE.md para documentação completa
 */

// ============================================================================
// TIPOS
// ============================================================================

export type Audience =
  | 'admin'
  | 'user'
  | 'professional'
  | 'whitelabel'
  | 'generator'

export type InterfaceGroupId =
  // Admin Groups
  | 'admin_overview'
  | 'admin_people'
  | 'admin_plans_billing'
  | 'admin_ai_core'
  | 'admin_product'
  | 'admin_front_content'
  | 'admin_governance'
  | 'admin_lab'
  // User Groups
  | 'user_overview'
  | 'user_safety'
  | 'user_emotions'
  | 'user_clarity'
  | 'user_resources'
  // Professional Groups
  | 'pro_overview'
  | 'pro_clients'
  | 'pro_reports'
  | 'pro_learning'
  // White Label Groups
  | 'wl_overview'
  | 'wl_branding'
  | 'wl_plans'
  | 'wl_team'
  // Generator Groups
  | 'gen_overview'
  | 'gen_templates'
  | 'gen_instances'
  | 'gen_logs'

export interface InterfaceGroup {
  id: InterfaceGroupId
  label: string
  icon: string
  description?: string
  audience: Audience
  priority: number // 1 = topo da lista
}

export interface InterfaceScreen {
  id: string
  groupId: InterfaceGroupId
  audience: Audience
  route: string
  label: string
  icon?: string
  description?: string
  priority: number
  enabledByDefault: boolean
  isNew?: boolean
  isPlaceholder?: boolean
  badge?: string
  requiredPlan?: string[]
}

export interface UICoreRegistry {
  groups: InterfaceGroup[]
  screens: InterfaceScreen[]
}

// ============================================================================
// GRUPOS
// ============================================================================

const adminGroups: InterfaceGroup[] = [
  {
    id: 'admin_overview',
    label: 'admin.menu.overview',
    icon: '🎯',
    description: 'Painéis principais e monitoramento',
    audience: 'admin',
    priority: 1
  },
  {
    id: 'admin_people',
    label: 'admin.menu.people',
    icon: '👥',
    description: 'Gestão de usuários e acessos',
    audience: 'admin',
    priority: 2
  },
  {
    id: 'admin_billing',
    label: 'admin.menu.plans',
    icon: '💳',
    description: 'Planos, assinaturas e promoções',
    audience: 'admin',
    priority: 3
  },
  {
    id: 'admin_ai_core',
    label: 'admin.menu.ai',
    icon: '🤖',
    description: 'IAs, personas e orquestração',
    audience: 'admin',
    priority: 4
  },
  {
    id: 'admin_product',
    label: 'admin.menu.product',
    icon: '🚀',
    description: 'Features e funcionalidades',
    audience: 'admin',
    priority: 5
  },
  {
    id: 'admin_front',
    label: 'admin.menu.front',
    icon: '🎨',
    description: 'Frontpage, conteúdos e UI',
    audience: 'admin',
    priority: 6
  },
  {
    id: 'admin_governance',
    label: 'admin.menu.governance',
    icon: '⚖️',
    description: 'LGPD, termos e compliance',
    audience: 'admin',
    priority: 7
  },
  {
    id: 'admin_lab',
    label: 'admin.menu.lab',
    icon: '🧪',
    description: 'Laboratório de desenvolvimento',
    audience: 'admin',
    priority: 8
  }
]

const userGroups: InterfaceGroup[] = [
  {
    id: 'user_overview',
    label: 'Início',
    icon: '🏠',
    description: 'Seu painel principal',
    audience: 'user',
    priority: 1
  },
  {
    id: 'user_safety',
    label: 'Segurança',
    icon: '🛡️',
    description: 'Ferramentas de proteção',
    audience: 'user',
    priority: 2
  },
  {
    id: 'user_emotions',
    label: 'Emoções',
    icon: '💜',
    description: 'Registro emocional',
    audience: 'user',
    priority: 3
  },
  {
    id: 'user_clarity',
    label: 'Clareza',
    icon: '🎯',
    description: 'Testes e análises',
    audience: 'user',
    priority: 4
  },
  {
    id: 'user_resources',
    label: 'Recursos',
    icon: '📚',
    description: 'Conteúdos e ferramentas',
    audience: 'user',
    priority: 5
  }
]

const professionalGroups: InterfaceGroup[] = [
  {
    id: 'pro_overview',
    label: 'Painel',
    icon: '🏠',
    description: 'Visão geral profissional',
    audience: 'professional',
    priority: 1
  },
  {
    id: 'pro_clients',
    label: 'Clientes',
    icon: '👥',
    description: 'Gerenciar clientes',
    audience: 'professional',
    priority: 2
  },
  {
    id: 'pro_reports',
    label: 'Relatórios',
    icon: '📄',
    description: 'Relatórios e documentos',
    audience: 'professional',
    priority: 3
  },
  {
    id: 'pro_learning',
    label: 'Aprendizado',
    icon: '📚',
    description: 'Recursos profissionais',
    audience: 'professional',
    priority: 4
  }
]

const whiteLabelGroups: InterfaceGroup[] = [
  {
    id: 'wl_overview',
    label: 'Painel',
    icon: '🏠',
    description: 'Visão geral da instância',
    audience: 'whitelabel',
    priority: 1
  },
  {
    id: 'wl_branding',
    label: 'Marca',
    icon: '🎨',
    description: 'Personalização visual',
    audience: 'whitelabel',
    priority: 2
  },
  {
    id: 'wl_plans',
    label: 'Planos',
    icon: '💳',
    description: 'Configurar planos',
    audience: 'whitelabel',
    priority: 3
  },
  {
    id: 'wl_team',
    label: 'Equipe',
    icon: '👥',
    description: 'Gerenciar equipe',
    audience: 'whitelabel',
    priority: 4
  }
]

const generatorGroups: InterfaceGroup[] = [
  {
    id: 'gen_overview',
    label: 'Painel',
    icon: '🏭',
    description: 'Visão geral do gerador',
    audience: 'generator',
    priority: 1
  },
  {
    id: 'gen_templates',
    label: 'Templates',
    icon: '📋',
    description: 'Templates de SaaS',
    audience: 'generator',
    priority: 2
  },
  {
    id: 'gen_instances',
    label: 'Instâncias',
    icon: '🏢',
    description: 'Instâncias geradas',
    audience: 'generator',
    priority: 3
  },
  {
    id: 'gen_logs',
    label: 'Logs',
    icon: '📜',
    description: 'Logs de geração',
    audience: 'generator',
    priority: 4
  }
]

// ============================================================================
// TELAS - ADMIN
// ============================================================================

const adminScreens: InterfaceScreen[] = [
  // Visão Geral & Controle
  { id: 'admin-dashboard', groupId: 'admin_overview', audience: 'admin', route: '/admin', label: 'Dashboard', icon: '🏠', priority: 1, enabledByDefault: true },
  { id: 'admin-oraculo', groupId: 'admin_overview', audience: 'admin', route: '/admin/oraculo', label: 'Oráculo V1', icon: '🔮', priority: 2, enabledByDefault: true },
  { id: 'admin-oraculo-metricas', groupId: 'admin_overview', audience: 'admin', route: '/admin/oraculo-metricas', label: 'Oráculo Métricas', icon: '📊', priority: 3, enabledByDefault: true },
  { id: 'admin-control-tower', groupId: 'admin_overview', audience: 'admin', route: '/admin/control-tower', label: 'Control Tower', icon: '🗼', priority: 4, enabledByDefault: true },
  { id: 'admin-metricas', groupId: 'admin_overview', audience: 'admin', route: '/admin/metricas', label: 'Métricas Gerais', icon: '📈', priority: 5, enabledByDefault: true },
  { id: 'admin-analytics', groupId: 'admin_overview', audience: 'admin', route: '/admin/analytics', label: 'Analytics', icon: '📉', priority: 6, enabledByDefault: true },
  { id: 'admin-analytics-dashboard', groupId: 'admin_overview', audience: 'admin', route: '/admin/analytics-dashboard', label: 'Analytics Dashboard', icon: '📊', priority: 7, enabledByDefault: true },
  { id: 'admin-insights', groupId: 'admin_overview', audience: 'admin', route: '/admin/insights', label: 'Insights', icon: '💡', priority: 8, enabledByDefault: true },
  { id: 'admin-mapa-sistema', groupId: 'admin_overview', audience: 'admin', route: '/admin/mapa-sistema', label: 'Mapa do Sistema', icon: '🗺️', priority: 9, enabledByDefault: true },

  // Pessoas & Acessos
  { id: 'admin-usuarios', groupId: 'admin_people', audience: 'admin', route: '/admin/usuarios', label: 'Usuárias', icon: '👤', priority: 1, enabledByDefault: true },
  { id: 'admin-comunidade', groupId: 'admin_people', audience: 'admin', route: '/admin/comunidade', label: 'Comunidade', icon: '🤝', priority: 2, enabledByDefault: true },
  { id: 'admin-oraculo-instances', groupId: 'admin_people', audience: 'admin', route: '/admin/oraculo-instances', label: 'Instâncias', icon: '🏢', priority: 3, enabledByDefault: true },
  { id: 'admin-profissionais', groupId: 'admin_people', audience: 'admin', route: '/admin/profissionais', label: 'Profissionais', icon: '👔', priority: 4, enabledByDefault: false, isPlaceholder: true },
  { id: 'admin-equipe', groupId: 'admin_people', audience: 'admin', route: '/admin/equipe', label: 'Equipe Interna', icon: '👷', priority: 5, enabledByDefault: false, isPlaceholder: true },

  // Planos, Billing & Promoções
  { id: 'admin-planos', groupId: 'admin_plans_billing', audience: 'admin', route: '/admin/planos', label: 'Planos', icon: '📋', priority: 1, enabledByDefault: true },
  { id: 'admin-planos-core', groupId: 'admin_plans_billing', audience: 'admin', route: '/admin/planos-core', label: 'Planos Core', icon: '⚙️', priority: 2, enabledByDefault: true },
  { id: 'admin-loja', groupId: 'admin_plans_billing', audience: 'admin', route: '/admin/loja', label: 'Loja / Add-ons', icon: '🛒', priority: 3, enabledByDefault: false, isPlaceholder: true },
  { id: 'admin-promocoes', groupId: 'admin_plans_billing', audience: 'admin', route: '/admin/promocoes', label: 'Promoções', icon: '🎁', priority: 4, enabledByDefault: false, isPlaceholder: true },
  { id: 'admin-excecoes', groupId: 'admin_plans_billing', audience: 'admin', route: '/admin/excecoes', label: 'Exceções Individuais', icon: '⭐', priority: 5, enabledByDefault: false, isPlaceholder: true },

  // IAs & Orquestração
  { id: 'admin-ia-personas', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/ia-personas', label: 'IA Personas', icon: '🎭', priority: 1, enabledByDefault: true, isNew: true },
  { id: 'admin-configurar-ias', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/configurar-ias', label: 'Configurar IAs', icon: '🔧', priority: 2, enabledByDefault: true },
  { id: 'admin-gerenciar-ias', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/gerenciar-ias', label: 'Gerenciar IAs', icon: '🎛️', priority: 3, enabledByDefault: true },
  { id: 'admin-mapa-ias', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/mapa-ias', label: 'Mapa de IAs', icon: '🗺️', priority: 4, enabledByDefault: true },
  { id: 'admin-ia-matrix', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/ia-matrix', label: 'IA Matrix', icon: '🧮', priority: 5, enabledByDefault: true },
  { id: 'admin-ia-mapa-menus', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/ia-mapa-menus', label: 'IA Mapa Menus', icon: '📍', priority: 6, enabledByDefault: true },
  { id: 'admin-fluxos-ia', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/fluxos-ia', label: 'Fluxos de IA', icon: '🔄', priority: 7, enabledByDefault: true },
  { id: 'admin-ia-assistente', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/ia-assistente', label: 'IA Assistente', icon: '💬', priority: 8, enabledByDefault: true },
  { id: 'admin-custos-ia', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/custos-ia', label: 'Custos de IA', icon: '💰', priority: 9, enabledByDefault: true },
  { id: 'admin-ia-carga', groupId: 'admin_ai_core', audience: 'admin', route: '/admin/ia-carga', label: 'IA Carga', icon: '📦', priority: 10, enabledByDefault: true },

  // Produto & Funcionalidades
  { id: 'admin-teste-clareza-ia', groupId: 'admin_product', audience: 'admin', route: '/admin/teste-clareza-ia', label: 'Teste de Clareza IA', icon: '🎯', priority: 1, enabledByDefault: true },
  { id: 'admin-historias', groupId: 'admin_product', audience: 'admin', route: '/admin/historias', label: 'Histórias / Jornadas', icon: '📖', priority: 2, enabledByDefault: true },
  { id: 'admin-chat', groupId: 'admin_product', audience: 'admin', route: '/admin/chat', label: 'Chat Admin', icon: '💬', priority: 3, enabledByDefault: true },
  { id: 'admin-estados', groupId: 'admin_product', audience: 'admin', route: '/admin/estados', label: 'Estados', icon: '🔄', priority: 4, enabledByDefault: true },
  { id: 'admin-quiz-generator', groupId: 'admin_product', audience: 'admin', route: '/admin/quiz-generator', label: 'Gerador de Quiz', icon: '❓', priority: 5, enabledByDefault: true },
  { id: 'admin-seguranca', groupId: 'admin_product', audience: 'admin', route: '/admin/seguranca', label: 'Plano de Segurança', icon: '🛡️', priority: 6, enabledByDefault: false, isPlaceholder: true },
  { id: 'admin-relatorios', groupId: 'admin_product', audience: 'admin', route: '/admin/relatorios', label: 'Relatórios', icon: '📄', priority: 7, enabledByDefault: false, isPlaceholder: true },

  // Front & Conteúdos
  { id: 'admin-frontpage', groupId: 'admin_front_content', audience: 'admin', route: '/admin/frontpage', label: 'Frontpage', icon: '🏠', priority: 1, enabledByDefault: true },
  { id: 'admin-frontpage-editor', groupId: 'admin_front_content', audience: 'admin', route: '/admin/frontpage-editor', label: 'Frontpage Editor', icon: '✏️', priority: 2, enabledByDefault: true },
  { id: 'admin-frontpage-visual', groupId: 'admin_front_content', audience: 'admin', route: '/admin/frontpage-visual', label: 'Frontpage Visual', icon: '👁️', priority: 3, enabledByDefault: true },
  { id: 'admin-builder', groupId: 'admin_front_content', audience: 'admin', route: '/admin/builder', label: 'Builder', icon: '🔨', priority: 4, enabledByDefault: true },
  { id: 'admin-biblioteca', groupId: 'admin_front_content', audience: 'admin', route: '/admin/biblioteca', label: 'Biblioteca', icon: '📚', priority: 5, enabledByDefault: true },
  { id: 'admin-conteudos', groupId: 'admin_front_content', audience: 'admin', route: '/admin/conteudos', label: 'Conteúdos', icon: '📝', priority: 6, enabledByDefault: true },
  { id: 'admin-curadoria', groupId: 'admin_front_content', audience: 'admin', route: '/admin/curadoria', label: 'Curadoria', icon: '🎯', priority: 7, enabledByDefault: true },
  { id: 'admin-menu-config', groupId: 'admin_front_content', audience: 'admin', route: '/admin/menu-config', label: 'Configurar Menu', icon: '📋', priority: 8, enabledByDefault: true },

  // Governança & LGPD
  { id: 'admin-termos-aceitos', groupId: 'admin_governance', audience: 'admin', route: '/admin/termos-aceitos', label: 'Termos Aceitos', icon: '✅', priority: 1, enabledByDefault: true },
  { id: 'admin-auditoria-suporte', groupId: 'admin_governance', audience: 'admin', route: '/admin/auditoria-suporte', label: 'Auditoria Suporte', icon: '🔍', priority: 2, enabledByDefault: true },
  { id: 'admin-privacidade', groupId: 'admin_governance', audience: 'admin', route: '/admin/privacidade', label: 'Privacidade', icon: '🔒', priority: 3, enabledByDefault: false, isPlaceholder: true },
  { id: 'admin-lgpd', groupId: 'admin_governance', audience: 'admin', route: '/admin/lgpd', label: 'LGPD / Exportar Dados', icon: '📤', priority: 4, enabledByDefault: false, isPlaceholder: true },
  { id: 'admin-logs-legais', groupId: 'admin_governance', audience: 'admin', route: '/admin/logs-legais', label: 'Logs Legais', icon: '📜', priority: 5, enabledByDefault: false, isPlaceholder: true },

  // Laboratório & Dev
  { id: 'admin-gerador-saas', groupId: 'admin_lab', audience: 'admin', route: '/admin/gerador-saas', label: 'Gerador de SaaS', icon: '🏭', priority: 1, enabledByDefault: true },
  { id: 'admin-beta-testers', groupId: 'admin_lab', audience: 'admin', route: '/admin/beta-testers', label: 'Beta Testers', icon: '🧪', priority: 2, enabledByDefault: true },
  { id: 'admin-ab-testing', groupId: 'admin_lab', audience: 'admin', route: '/admin/ab-testing', label: 'A/B Testing', icon: '🔬', priority: 3, enabledByDefault: true },
  { id: 'admin-easter-eggs', groupId: 'admin_lab', audience: 'admin', route: '/admin/easter-eggs', label: 'Easter Eggs', icon: '🥚', priority: 4, enabledByDefault: true },
  { id: 'admin-checklist-lancamento', groupId: 'admin_lab', audience: 'admin', route: '/admin/checklist-lancamento', label: 'Checklist Lançamento', icon: '✅', priority: 5, enabledByDefault: true },
  { id: 'admin-repair-env', groupId: 'admin_lab', audience: 'admin', route: '/admin/repair-env', label: 'Repair Env', icon: '🔧', priority: 6, enabledByDefault: false, isPlaceholder: true }
]

// ============================================================================
// TELAS - USUÁRIA
// ============================================================================

const userScreens: InterfaceScreen[] = [
  // Início
  { id: 'user-dashboard', groupId: 'user_overview', audience: 'user', route: '/dashboard', label: 'Meu Painel', icon: '🏠', priority: 1, enabledByDefault: true },
  { id: 'user-perfil', groupId: 'user_overview', audience: 'user', route: '/perfil', label: 'Meu Perfil', icon: '👤', priority: 2, enabledByDefault: true },
  { id: 'user-conquistas', groupId: 'user_overview', audience: 'user', route: '/conquistas', label: 'Conquistas', icon: '🏆', priority: 3, enabledByDefault: true },

  // Segurança
  { id: 'user-plano-seguranca', groupId: 'user_safety', audience: 'user', route: '/plano-seguranca', label: 'Plano de Segurança', icon: '🛡️', priority: 1, enabledByDefault: true },
  { id: 'user-contatos-emergencia', groupId: 'user_safety', audience: 'user', route: '/contatos-emergencia', label: 'Contatos de Emergência', icon: '📞', priority: 2, enabledByDefault: true },
  { id: 'user-documentos', groupId: 'user_safety', audience: 'user', route: '/documentos', label: 'Documentos', icon: '📁', priority: 3, enabledByDefault: true },

  // Emoções
  { id: 'user-diario', groupId: 'user_emotions', audience: 'user', route: '/diario', label: 'Diário', icon: '📔', priority: 1, enabledByDefault: true },
  { id: 'user-diario-timeline', groupId: 'user_emotions', audience: 'user', route: '/diario/timeline', label: 'Timeline', icon: '📅', priority: 2, enabledByDefault: true },
  { id: 'user-chat', groupId: 'user_emotions', audience: 'user', route: '/chat', label: 'Chat com IA', icon: '💬', priority: 3, enabledByDefault: true },
  { id: 'user-modo-espelho', groupId: 'user_emotions', audience: 'user', route: '/modo-espelho', label: 'Modo Espelho', icon: '🪞', priority: 4, enabledByDefault: true },
  { id: 'user-carta-futuro', groupId: 'user_emotions', audience: 'user', route: '/carta-futuro', label: 'Carta para o Futuro', icon: '✉️', priority: 5, enabledByDefault: true },

  // Clareza
  { id: 'user-teste-clareza', groupId: 'user_clarity', audience: 'user', route: '/teste-clareza', label: 'Teste de Clareza', icon: '🎯', priority: 1, enabledByDefault: true },
  { id: 'user-meu-radar', groupId: 'user_clarity', audience: 'user', route: '/meu-radar', label: 'Meu Radar', icon: '📡', priority: 2, enabledByDefault: true },
  { id: 'user-evolucao', groupId: 'user_clarity', audience: 'user', route: '/evolucao', label: 'Minha Evolução', icon: '📈', priority: 3, enabledByDefault: true },

  // Recursos
  { id: 'user-biblioteca', groupId: 'user_resources', audience: 'user', route: '/biblioteca', label: 'Biblioteca', icon: '📚', priority: 1, enabledByDefault: true },
  { id: 'user-hub', groupId: 'user_resources', audience: 'user', route: '/hub', label: 'Hub de Ferramentas', icon: '🧰', priority: 2, enabledByDefault: true },
  { id: 'user-ajuda', groupId: 'user_resources', audience: 'user', route: '/ajuda', label: 'Ajuda', icon: '❓', priority: 3, enabledByDefault: true }
]

// ============================================================================
// TELAS - PROFISSIONAL
// ============================================================================

const professionalScreens: InterfaceScreen[] = [
  // Painel
  { id: 'pro-dashboard', groupId: 'pro_overview', audience: 'professional', route: '/dashboard-profissional', label: 'Meu Painel', icon: '🏠', priority: 1, enabledByDefault: true },
  { id: 'pro-oraculo', groupId: 'pro_overview', audience: 'professional', route: '/profissional/oraculo', label: 'Oráculo Profissional', icon: '🔮', priority: 2, enabledByDefault: true },

  // Clientes
  { id: 'pro-clientes', groupId: 'pro_clients', audience: 'professional', route: '/profissional/clientes', label: 'Meus Clientes', icon: '👥', priority: 1, enabledByDefault: true },
  { id: 'pro-vincular', groupId: 'pro_clients', audience: 'professional', route: '/profissional/vincular', label: 'Vincular Cliente', icon: '🔗', priority: 2, enabledByDefault: true },

  // Relatórios
  { id: 'pro-relatorios', groupId: 'pro_reports', audience: 'professional', route: '/profissional/relatorios', label: 'Relatórios', icon: '📄', priority: 1, enabledByDefault: true },
  { id: 'pro-laudos', groupId: 'pro_reports', audience: 'professional', route: '/profissional/laudos', label: 'Laudos', icon: '📋', priority: 2, enabledByDefault: true },

  // Aprendizado
  { id: 'pro-biblioteca', groupId: 'pro_learning', audience: 'professional', route: '/profissional/biblioteca', label: 'Biblioteca', icon: '📚', priority: 1, enabledByDefault: true },
  { id: 'pro-cursos', groupId: 'pro_learning', audience: 'professional', route: '/profissional/cursos', label: 'Cursos', icon: '🎓', priority: 2, enabledByDefault: true }
]

// ============================================================================
// TELAS - WHITE LABEL
// ============================================================================

const whiteLabelScreens: InterfaceScreen[] = [
  // Painel
  { id: 'wl-dashboard', groupId: 'wl_overview', audience: 'whitelabel', route: '/whitelabel', label: 'Meu Painel', icon: '🏠', priority: 1, enabledByDefault: true },
  { id: 'wl-metricas', groupId: 'wl_overview', audience: 'whitelabel', route: '/whitelabel/metricas', label: 'Métricas', icon: '📊', priority: 2, enabledByDefault: true },

  // Marca
  { id: 'wl-branding', groupId: 'wl_branding', audience: 'whitelabel', route: '/whitelabel/branding', label: 'Personalização', icon: '🎨', priority: 1, enabledByDefault: true },
  { id: 'wl-logo', groupId: 'wl_branding', audience: 'whitelabel', route: '/whitelabel/logo', label: 'Logo e Cores', icon: '🖼️', priority: 2, enabledByDefault: true },

  // Planos
  { id: 'wl-planos', groupId: 'wl_plans', audience: 'whitelabel', route: '/whitelabel/planos', label: 'Planos', icon: '💳', priority: 1, enabledByDefault: true },
  { id: 'wl-billing', groupId: 'wl_plans', audience: 'whitelabel', route: '/whitelabel/billing', label: 'Faturamento', icon: '💰', priority: 2, enabledByDefault: true },

  // Equipe
  { id: 'wl-usuarios', groupId: 'wl_team', audience: 'whitelabel', route: '/whitelabel/usuarios', label: 'Usuários', icon: '👥', priority: 1, enabledByDefault: true },
  { id: 'wl-convites', groupId: 'wl_team', audience: 'whitelabel', route: '/whitelabel/convites', label: 'Convites', icon: '✉️', priority: 2, enabledByDefault: true }
]

// ============================================================================
// TELAS - GERADOR DE SAAS
// ============================================================================

const generatorScreens: InterfaceScreen[] = [
  // Painel
  { id: 'gen-dashboard', groupId: 'gen_overview', audience: 'generator', route: '/admin/gerador-saas', label: 'Painel do Gerador', icon: '🏭', priority: 1, enabledByDefault: true },
  { id: 'gen-status', groupId: 'gen_overview', audience: 'generator', route: '/admin/gerador-saas/status', label: 'Status', icon: '📊', priority: 2, enabledByDefault: true },

  // Templates
  { id: 'gen-templates', groupId: 'gen_templates', audience: 'generator', route: '/admin/gerador-saas/templates', label: 'Templates', icon: '📋', priority: 1, enabledByDefault: true },
  { id: 'gen-novo', groupId: 'gen_templates', audience: 'generator', route: '/admin/gerador-saas/novo', label: 'Novo Projeto', icon: '➕', priority: 2, enabledByDefault: true },

  // Instâncias
  { id: 'gen-instancias', groupId: 'gen_instances', audience: 'generator', route: '/admin/gerador-saas/instancias', label: 'Instâncias', icon: '🏢', priority: 1, enabledByDefault: true },
  { id: 'gen-monitorar', groupId: 'gen_instances', audience: 'generator', route: '/admin/gerador-saas/monitorar', label: 'Monitorar', icon: '👁️', priority: 2, enabledByDefault: true },

  // Logs
  { id: 'gen-logs', groupId: 'gen_logs', audience: 'generator', route: '/admin/gerador-saas/logs', label: 'Logs', icon: '📜', priority: 1, enabledByDefault: true },
  { id: 'gen-erros', groupId: 'gen_logs', audience: 'generator', route: '/admin/gerador-saas/erros', label: 'Erros', icon: '❌', priority: 2, enabledByDefault: true }
]

// ============================================================================
// REGISTRY COMPLETO
// ============================================================================

export const uiCoreRegistry: UICoreRegistry = {
  groups: [
    ...adminGroups,
    ...userGroups,
    ...professionalGroups,
    ...whiteLabelGroups,
    ...generatorGroups
  ],
  screens: [
    ...adminScreens,
    ...userScreens,
    ...professionalScreens,
    ...whiteLabelScreens,
    ...generatorScreens
  ]
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Retorna grupos por audience
 */
export function getGroupsByAudience(audience: Audience): InterfaceGroup[] {
  return uiCoreRegistry.groups
    .filter(g => g.audience === audience)
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Retorna telas por audience
 */
export function getScreensByAudience(audience: Audience): InterfaceScreen[] {
  return uiCoreRegistry.screens
    .filter(s => s.audience === audience && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Retorna telas por grupo
 */
export function getScreensByGroup(groupId: InterfaceGroupId): InterfaceScreen[] {
  return uiCoreRegistry.screens
    .filter(s => s.groupId === groupId && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Retorna tela por rota
 */
export function getScreenByRoute(route: string): InterfaceScreen | null {
  return uiCoreRegistry.screens.find(s => s.route === route) || null
}

/**
 * Retorna tela por ID
 */
export function getScreenById(id: string): InterfaceScreen | null {
  return uiCoreRegistry.screens.find(s => s.id === id) || null
}

/**
 * Retorna grupo por ID
 */
export function getGroupById(id: InterfaceGroupId): InterfaceGroup | null {
  return uiCoreRegistry.groups.find(g => g.id === id) || null
}

/**
 * Retorna menu completo para audience (grupos + telas)
 */
export function getMenuForAudience(audience: Audience): { group: InterfaceGroup; screens: InterfaceScreen[] }[] {
  const groups = getGroupsByAudience(audience)
  return groups.map(group => ({
    group,
    screens: getScreensByGroup(group.id)
  }))
}

/**
 * Conta estatísticas
 */
export function getRegistryStats() {
  const totalGroups = uiCoreRegistry.groups.length
  const totalScreens = uiCoreRegistry.screens.length
  const enabledScreens = uiCoreRegistry.screens.filter(s => s.enabledByDefault).length
  const placeholderScreens = uiCoreRegistry.screens.filter(s => s.isPlaceholder).length
  const newScreens = uiCoreRegistry.screens.filter(s => s.isNew).length

  return {
    totalGroups,
    totalScreens,
    enabledScreens,
    placeholderScreens,
    newScreens,
    byAudience: {
      admin: uiCoreRegistry.screens.filter(s => s.audience === 'admin').length,
      user: uiCoreRegistry.screens.filter(s => s.audience === 'user').length,
      professional: uiCoreRegistry.screens.filter(s => s.audience === 'professional').length,
      whitelabel: uiCoreRegistry.screens.filter(s => s.audience === 'whitelabel').length,
      generator: uiCoreRegistry.screens.filter(s => s.audience === 'generator').length
    }
  }
}

// ============================================================================
// FUNÇÕES ESPECÍFICAS POR AUDIENCE (ATALHOS)
// ============================================================================

/**
 * Retorna árvore de menu do ADMIN (grupos + itens)
 */
export function getAdminMenuTree() {
  const groups = uiCoreRegistry.groups
    .filter(g => g.audience === 'admin')
    .sort((a, b) => a.priority - b.priority)

  const screens = uiCoreRegistry.screens
    .filter(s => s.audience === 'admin' && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)

  return groups.map(group => ({
    ...group,
    items: screens.filter(s => s.groupId === group.id)
  }))
}

/**
 * Retorna seções do dashboard da USUÁRIA
 */
export function getUserDashboardSections() {
  const groups = uiCoreRegistry.groups
    .filter(g => g.audience === 'user')
    .sort((a, b) => a.priority - b.priority)

  const screens = uiCoreRegistry.screens
    .filter(s => s.audience === 'user' && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)

  return groups.map(group => ({
    ...group,
    items: screens.filter(s => s.groupId === group.id)
  }))
}

/**
 * Retorna seções do dashboard do PROFISSIONAL
 */
export function getProfessionalDashboardSections() {
  const groups = uiCoreRegistry.groups
    .filter(g => g.audience === 'professional')
    .sort((a, b) => a.priority - b.priority)

  const screens = uiCoreRegistry.screens
    .filter(s => s.audience === 'professional' && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)

  return groups.map(group => ({
    ...group,
    items: screens.filter(s => s.groupId === group.id)
  }))
}

/**
 * Retorna seções do painel WHITE LABEL
 */
export function getWhiteLabelSections() {
  const groups = uiCoreRegistry.groups
    .filter(g => g.audience === 'whitelabel')
    .sort((a, b) => a.priority - b.priority)

  const screens = uiCoreRegistry.screens
    .filter(s => s.audience === 'whitelabel' && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)

  return groups.map(group => ({
    ...group,
    items: screens.filter(s => s.groupId === group.id)
  }))
}

/**
 * Retorna seções do GERADOR DE SAAS
 */
export function getGeneratorSections() {
  const groups = uiCoreRegistry.groups
    .filter(g => g.audience === 'generator')
    .sort((a, b) => a.priority - b.priority)

  const screens = uiCoreRegistry.screens
    .filter(s => s.audience === 'generator' && s.enabledByDefault)
    .sort((a, b) => a.priority - b.priority)

  return groups.map(group => ({
    ...group,
    items: screens.filter(s => s.groupId === group.id)
  }))
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const UICoreRegistry = {
  registry: uiCoreRegistry,
  getGroupsByAudience,
  getScreensByAudience,
  getScreensByGroup,
  getScreenByRoute,
  getScreenById,
  getGroupById,
  getMenuForAudience,
  getRegistryStats,
  // Atalhos por audience
  getAdminMenuTree,
  getUserDashboardSections,
  getProfessionalDashboardSections,
  getWhiteLabelSections,
  getGeneratorSections
}

export default UICoreRegistry
