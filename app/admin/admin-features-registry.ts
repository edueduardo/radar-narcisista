// ============================================
// 🏗️ REGISTRO ÚNICO DE FUNCIONALIDADES DO ADMIN
// ============================================
// 
// ESTE É O ÚNICO LUGAR onde todas as funcionalidades do painel admin são registradas.
// 
// 🔥 REGRA DE OURO:
// Para QUALQUER nova funcionalidade admin criada no futuro:
// 1. Crie a rota /admin/...
// 2. Adicione AdminFeatureId + entrada em ADMIN_FEATURES aqui
// 
// A partir disso:
// ✅ Menu lateral já enxerga a nova tela
// ✅ /admin/menu-config já permite ordenar/ocultar  
// ✅ Mapa Sistema passa a saber que essa tela existe
// ✅ Mapa IAs pode vincular IAs às telas
// 
// NUNCA mais edite menu em múltiplos lugares!
// ============================================

export type AdminFeatureId =
  | 'config_ias'
  | 'api_keys'
  | 'novas_ias'
  | 'custos_ia'
  | 'ia_assistente'
  | 'biblioteca'
  | 'historias'
  | 'comunidade'
  | 'estados'
  | 'quiz_ia'
  | 'testes_ab'
  | 'analytics'
  | 'ia_coach'
  | 'metricas'
  | 'usuarios'
  | 'chat_admin'
  | 'frontpages'
  | 'easter_eggs'
  | 'mapa_sistema'
  | 'mapa_ias'
  | 'fluxos_ia'
  | 'checklist'
  | 'beta_testers'
  | 'termos_aceitos'

export type AdminFeatureGroup = 
  | 'IAs'
  | 'Dados' 
  | 'Usuários'
  | 'Sistema'
  | 'Outros'

export interface AdminFeature {
  id: AdminFeatureId
  label: string          // texto que aparece no menu
  description?: string   // descrição curta para mapas/tooltip
  path: string           // ex: "/admin/config-ias"
  icon?: string          // nome do ícone (lucide-react)
  group: AdminFeatureGroup
  defaultOrder: number   // ordem padrão no menu
  isExperimental?: boolean
  // Metadados para integrações
  relatedIAs?: string[]     // quais IAs esta feature usa principal
  relatedTables?: string[]  // quais tabelas do banco esta feature toca
  relatedAPIs?: string[]    // quais APIs esta feature consome
}

// 📋 REGISTRO COMPLETO DE FUNCIONALIDADES ADMIN
// Baseado no que existe hoje no projeto + novas implementações
export const ADMIN_FEATURES: AdminFeature[] = [
  // 🤖 GRUPO: IAs
  {
    id: 'config_ias',
    label: 'Config IAs',
    description: 'Painel principal de configuração das IAs do sistema',
    path: '/admin',
    icon: 'Bot',
    group: 'IAs',
    defaultOrder: 1,
    relatedIAs: ['coach_clareza_v1', 'voice_transcribe_whisper_v1'],
    relatedAPIs: ['/api/ai/chat', '/api/voice/transcribe']
  },
  {
    id: 'api_keys',
    label: 'API Keys',
    description: 'Gerenciar chaves de API das IAs (OpenAI, Anthropic, etc)',
    path: '/admin/configurar-ias',
    icon: 'Settings',
    group: 'IAs',
    defaultOrder: 2,
    relatedIAs: ['coach_clareza_v1', 'voice_transcribe_whisper_v1', 'guardian_ux_v1'],
    relatedAPIs: ['/api/ai/chat', '/api/voice/transcribe', '/api/ai/guardian/ux']
  },
  {
    id: 'novas_ias',
    label: '+ Novas IAs',
    description: 'Adicionar e configurar novas IAs no sistema',
    path: '/admin/gerenciar-ias',
    icon: 'Zap',
    group: 'IAs',
    defaultOrder: 3,
    relatedIAs: ['*'],
    relatedTables: ['ai_agents']
  },
  {
    id: 'custos_ia',
    label: 'Custos IA',
    description: 'Monitorar custos e consumo das APIs de IA',
    path: '/admin/custos-ia',
    icon: 'Scale',
    group: 'IAs',
    defaultOrder: 4,
    relatedIAs: ['*'],
    relatedTables: ['ai_agent_metrics_daily', 'ai_usage_logs']
  },
  {
    id: 'ia_assistente',
    label: 'IA Assistente',
    description: 'Assistente de IA para configurações e suporte',
    path: '/admin/ia-assistente',
    icon: 'Brain',
    group: 'IAs',
    defaultOrder: 5,
    relatedIAs: ['admin_assistant_v1'],
    relatedAPIs: ['/api/ai/admin-assistant']
  },
  {
    id: 'mapa_ias',
    label: '🤖 Mapa IAs',
    description: 'Monitoramento completo de saúde e status das IAs',
    path: '/admin/mapa-ias',
    icon: 'Network',
    group: 'IAs',
    defaultOrder: 6,
    relatedIAs: ['*'],
    relatedTables: ['ai_agents', 'ai_agent_metrics_daily', 'ai_incidents', 'ai_guardian_suggestions'],
    relatedAPIs: ['/api/admin/ai-map']
  },
  {
    id: 'fluxos_ia',
    label: '⚙️ Fluxos IA',
    description: 'Orquestrador visual de fluxos de IA (tipo n8n)',
    path: '/admin/fluxos-ia',
    icon: 'GitBranch',
    group: 'IAs',
    defaultOrder: 7,
    relatedIAs: ['*'],
    relatedTables: ['ai_flows', 'ai_flow_nodes', 'ai_flow_edges', 'ai_flow_runs', 'ai_flow_run_logs'],
    relatedAPIs: ['/api/admin/ai-flows'],
    isExperimental: true
  },
  {
    id: 'ia_coach',
    label: '📊 IA Coach',
    description: 'Insights e métricas do IA Coach',
    path: '/admin/insights',
    icon: 'TrendingUp',
    group: 'IAs',
    defaultOrder: 8,
    relatedIAs: ['coach_clareza_v1'],
    relatedTables: ['journal_entries', 'ai_usage_logs'],
    relatedAPIs: ['/api/ai/chat']
  },

  // 📊 GRUPO: Dados
  {
    id: 'biblioteca',
    label: 'Biblioteca',
    description: 'Gerenciar biblioteca de respostas e conteúdos',
    path: '/admin/biblioteca',
    icon: 'BookOpen',
    group: 'Dados',
    defaultOrder: 9,
    relatedTables: ['biblioteca_respostas']
  },
  {
    id: 'historias',
    label: 'Histórias',
    description: 'Aprovar/rejeitar histórias da comunidade',
    path: '/admin/historias',
    icon: 'MessageSquare',
    group: 'Dados',
    defaultOrder: 10,
    relatedTables: ['community_stories']
  },
  {
    id: 'comunidade',
    label: 'Comunidade',
    description: 'Gerenciar conteúdo e denúncias da comunidade',
    path: '/admin/comunidade',
    icon: 'Users',
    group: 'Dados',
    defaultOrder: 11,
    relatedTables: ['community_stories', 'community_reports']
  },
  {
    id: 'estados',
    label: 'Estados',
    description: 'Gerenciar estados emocionais e classificações',
    path: '/admin/estados',
    icon: 'MapPin',
    group: 'Dados',
    defaultOrder: 12,
    relatedTables: ['emotion_states', 'classifications']
  },

  // 🧪 GRUPO: Sistema (Testes e Analytics)
  {
    id: 'quiz_ia',
    label: '🧠 Quiz IA',
    description: 'Gerador de quiz com IA',
    path: '/admin/quiz-generator',
    icon: 'TestTube',
    group: 'Sistema',
    defaultOrder: 13,
    relatedIAs: ['quiz_generator_v1'],
    relatedAPIs: ['/api/ai/quiz']
  },
  {
    id: 'testes_ab',
    label: 'Testes A/B',
    description: 'Configurar e monitorar testes A/B',
    path: '/admin/ab-testing',
    icon: 'TestTube',
    group: 'Sistema',
    defaultOrder: 14,
    relatedTables: ['ab_tests', 'ab_test_results']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Análise de dados e métricas do sistema',
    path: '/admin/analytics',
    icon: 'BarChart3',
    group: 'Sistema',
    defaultOrder: 15,
    relatedTables: ['analytics_events', 'user_sessions']
  },
  {
    id: 'metricas',
    label: 'Métricas',
    description: 'Métricas detalhadas do sistema',
    path: '/admin/metricas',
    icon: 'Activity',
    group: 'Sistema',
    defaultOrder: 16,
    relatedTables: ['system_metrics', 'performance_logs']
  },

  // 👥 GRUPO: Usuários
  {
    id: 'usuarios',
    label: 'Usuários',
    description: 'Gerenciar usuários e permissões',
    path: '/admin/usuarios',
    icon: 'Users',
    group: 'Usuários',
    defaultOrder: 17,
    relatedTables: ['profiles', 'user_subscriptions']
  },
  {
    id: 'chat_admin',
    label: 'Chat Admin',
    description: 'Painel de administração do chat',
    path: '/admin/chat',
    icon: 'MessageCircle',
    group: 'Usuários',
    defaultOrder: 18,
    relatedIAs: ['coach_clareza_v1'],
    relatedTables: ['chat_messages', 'chat_sessions'],
    relatedAPIs: ['/api/ai/chat']
  },

  // 🎛️ GRUPO: Sistema (Configurações)
  {
    id: 'frontpages',
    label: 'Frontpages',
    description: 'Configurar páginas front-end e testes',
    path: '/admin/frontpage',
    icon: 'Layout',
    group: 'Sistema',
    defaultOrder: 19,
    relatedTables: ['frontpage_configs']
  },
  {
    id: 'easter_eggs',
    label: '🥚 Easter Eggs',
    description: 'Configurar easter eggs e funcionalidades secretas',
    path: '/admin/easter-eggs',
    icon: 'Sparkles',
    group: 'Sistema',
    defaultOrder: 20,
    relatedTables: ['easter_eggs']
  },
  {
    id: 'mapa_sistema',
    label: '🗺️ Mapa Sistema',
    description: 'Mapa completo do sistema e arquitetura',
    path: '/admin/mapa-sistema',
    icon: 'Globe',
    group: 'Sistema',
    defaultOrder: 21,
    relatedTables: ['*'] // todas as tabelas
  },
  {
    id: 'checklist',
    label: '🚀 Checklist',
    description: 'Checklist de lançamento e configurações',
    path: '/admin/checklist-lancamento',
    icon: 'CheckSquare',
    group: 'Sistema',
    defaultOrder: 22,
    relatedTables: ['launch_checklists']
  },
  {
    id: 'beta_testers',
    label: '👥 Beta Testers',
    description: 'Gerenciar programa de beta testers',
    path: '/admin/beta-testers',
    icon: 'UserPlus',
    group: 'Usuários',
    defaultOrder: 23,
    relatedTables: ['beta_testers', 'beta_feedback']
  },
  // 💀 ÁREA SENSÍVEL: TERMOS ACEITOS (Cadeia de Custódia)
  {
    id: 'termos_aceitos',
    label: '💀 TERMOS ACEITOS',
    description: 'Cadeia de custódia - Registro de aceites de termos com hash SHA-256 para prova pericial',
    path: '/admin/termos-aceitos',
    icon: 'Skull',
    group: 'Sistema',
    defaultOrder: 0, // Primeiro no menu (área crítica)
    relatedTables: ['terms_versions', 'terms_acceptances', 'user_terms_acceptance'],
    relatedAPIs: ['/api/terms/accept', '/api/admin/terms-acceptances']
  }
]

// 🛠️ FUNÇÕES UTILITÁRIAS PARA O REGISTRY

// Obter feature por ID
export function getAdminFeature(id: AdminFeatureId): AdminFeature | undefined {
  return ADMIN_FEATURES.find(f => f.id === id)
}

// Obter features por grupo
export function getAdminFeaturesByGroup(group: AdminFeatureGroup): AdminFeature[] {
  return ADMIN_FEATURES.filter(f => f.group === group).sort((a, b) => a.defaultOrder - b.defaultOrder)
}

// Obter features que usam uma IA específica
export function getFeaturesUsingAI(aiId: string): AdminFeature[] {
  return ADMIN_FEATURES.filter(f => f.relatedIAs?.includes(aiId) || f.relatedIAs?.includes('*'))
}

// Obter features que tocam uma tabela específica
export function getFeaturesUsingTable(table: string): AdminFeature[] {
  return ADMIN_FEATURES.filter(f => f.relatedTables?.includes(table) || f.relatedTables?.includes('*'))
}

// Verificar se feature é experimental
export function isExperimentalFeature(id: AdminFeatureId): boolean {
  const feature = getAdminFeature(id)
  return feature?.isExperimental || false
}

// Obter todas as features ordenadas
export function getAllAdminFeatures(): AdminFeature[] {
  return ADMIN_FEATURES.sort((a, b) => a.defaultOrder - b.defaultOrder)
}

// Obter apenas features não-experimentais
export function getProductionAdminFeatures(): AdminFeature[] {
  return ADMIN_FEATURES.filter(f => !f.isExperimental).sort((a, b) => a.defaultOrder - b.defaultOrder)
}

// 🔄 COMPATIBILIDADE COM LEGADO (menu antigo)
// Converte AdminFeature para AdminMenuItem (para compatibilidade com código existente)
export function featureToMenuItem(feature: AdminFeature, customOrder?: number, enabled: boolean = true) {
  return {
    id: feature.id,
    label: feature.label,
    icon: feature.icon || 'Settings',
    href: feature.path,
    isLink: true,
    enabled,
    order: customOrder !== undefined ? customOrder : feature.defaultOrder
  }
}

// Converter todas as features para formato de menu (compatibilidade)
export function getAllFeaturesAsMenuItems() {
  return ADMIN_FEATURES.map(f => featureToMenuItem(f))
}

// 📝 ESTATÍSTICAS DO REGISTRY
export function getRegistryStats() {
  const groups = {} as Record<AdminFeatureGroup, number>
  const experimental = ADMIN_FEATURES.filter(f => f.isExperimental).length
  
  ADMIN_FEATURES.forEach(f => {
    groups[f.group] = (groups[f.group] || 0) + 1
  })
  
  return {
    totalFeatures: ADMIN_FEATURES.length,
    experimentalFeatures: experimental,
    productionFeatures: ADMIN_FEATURES.length - experimental,
    featuresByGroup: groups,
    groups: Object.keys(groups) as AdminFeatureGroup[]
  }
}

// 🔍 VALIDAÇÃO
// Verificar se não há IDs duplicados
export function validateRegistry(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const ids = new Set<string>()
  
  ADMIN_FEATURES.forEach((feature, index) => {
    if (ids.has(feature.id)) {
      errors.push(`ID duplicado: ${feature.id} (índice ${index})`)
    }
    ids.add(feature.id)
    
    if (!feature.path.startsWith('/admin/')) {
      errors.push(`Path inválido para ${feature.id}: ${feature.path} (deve começar com /admin/)`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

