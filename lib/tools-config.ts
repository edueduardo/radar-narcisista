// =============================================================================
// TOOLS CONFIG - Fonte de verdade única para todas as ferramentas do produto
// =============================================================================
// Este arquivo centraliza a configuração de todas as ferramentas do Radar Narcisista.
// O dashboard e outras páginas devem LER daqui em vez de ter listas hard-coded.
// =============================================================================

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

/** Objetivos principais que o usuário pode ter ao usar o produto */
export type MainGoal =
  | 'clareza'      // entender o que está acontecendo
  | 'registro'     // organizar episódios e provas
  | 'protecao'     // segurança e próximos passos
  | 'autocuidado'; // autoestima, bem-estar, força emocional

/** Tags de problemas que o usuário pode estar enfrentando */
export type ProblemTag =
  | 'invalidacao'
  | 'gaslighting'
  | 'criminalizacao'
  | 'manipulacao'
  | 'ameacas'
  | 'isolamento'
  | 'autoestima_baixa';

/** Onde a ferramenta pode aparecer na UI */
export type Placement =
  | 'hero_cta'          // aparece no CTA principal / hero
  | 'main_tools'        // seção "Suas Ferramentas Principais"
  | 'goals_section'     // cards "O que você veio buscar hoje?"
  | 'quick_actions'     // Atalhos Rápidos / Ações rápidas
  | 'clarity_section'   // Ferramentas de Clareza (grid de ferramentas)
  | 'security_section'  // Seção Segurança
  | 'problem_hub'       // Hubs "Estou lidando com..."
  | 'tips_section';     // Dicas rápidas / recomendações

/** IDs únicos de cada ferramenta */
export type ToolId =
  | 'teste_clareza'
  | 'diario_episodios'
  | 'diario_novo'
  | 'coach_clareza'
  | 'linha_tempo'
  | 'modo_espelho'
  | 'biblioteca_respostas'
  | 'carta_futuro'
  | 'termometro_semanal'
  | 'plano_seguranca'
  | 'plano_fuga'
  | 'seguranca_digital'
  | 'seus_direitos_lgpd'
  | 'modo_recaida'
  | 'conquistas'
  | 'ciclo_abuso'
  | 'checklist_reconhecimento'
  | 'aula_maquiagem'; // exemplo de ferramenta futura

/** Configuração completa de uma ferramenta */
export interface ToolConfig {
  id: ToolId;
  name: string;
  shortLabel?: string;
  description: string;
  href: string;
  mainGoals: MainGoal[];
  problems: ProblemTag[];
  placements: Placement[];
  icon: string;           // nome do ícone Lucide (ex: 'Target', 'PenLine')
  emoji?: string;         // emoji alternativo para grids compactos
  order?: number;         // ordem de exibição (menor = primeiro)
  color?: string;         // cor Tailwind base (ex: 'purple', 'blue')
}

// -----------------------------------------------------------------------------
// FERRAMENTAS - Fonte de verdade única
// -----------------------------------------------------------------------------

export const TOOLS: ToolConfig[] = [
  // =========================================================================
  // CLAREZA - Ferramentas para entender o que está acontecendo
  // =========================================================================
  {
    id: 'teste_clareza',
    name: 'Teste de Clareza',
    shortLabel: 'Teste',
    description: 'Entenda se o que você vive é abuso narcisista',
    href: '/teste-clareza',
    mainGoals: ['clareza'],
    problems: ['invalidacao', 'gaslighting', 'manipulacao', 'ameacas', 'isolamento'],
    placements: ['hero_cta', 'main_tools', 'goals_section', 'quick_actions', 'clarity_section', 'problem_hub'],
    icon: 'Target',
    emoji: '🎯',
    order: 1,
    color: 'purple',
  },
  {
    id: 'modo_espelho',
    name: 'Modo Espelho',
    shortLabel: 'Espelho',
    description: 'Veja a situação de fora, como se fosse de outra pessoa',
    href: '/modo-espelho',
    mainGoals: ['clareza'],
    problems: ['invalidacao', 'gaslighting', 'manipulacao'],
    placements: ['clarity_section', 'problem_hub'],
    icon: 'Eye',
    emoji: '🪞',
    order: 10,
    color: 'indigo',
  },
  {
    id: 'biblioteca_respostas',
    name: 'Biblioteca de Respostas',
    shortLabel: 'Biblioteca',
    description: 'Frases prontas para quando você não souber o que dizer',
    href: '/biblioteca-respostas',
    mainGoals: ['clareza', 'protecao'],
    problems: ['invalidacao', 'gaslighting', 'manipulacao', 'ameacas'],
    placements: ['goals_section', 'clarity_section', 'problem_hub'],
    icon: 'BookOpen',
    emoji: '📚',
    order: 11,
    color: 'blue',
  },
  {
    id: 'ciclo_abuso',
    name: 'Ciclo do Abuso',
    shortLabel: 'Ciclo',
    description: 'Entenda as fases do ciclo de abuso narcisista',
    href: '/ciclo-abuso',
    mainGoals: ['clareza'],
    problems: ['manipulacao', 'gaslighting', 'isolamento'],
    placements: ['clarity_section', 'problem_hub', 'tips_section'],
    icon: 'RefreshCw',
    emoji: '🔄',
    order: 12,
    color: 'orange',
  },
  {
    id: 'checklist_reconhecimento',
    name: 'Checklist de Reconhecimento',
    shortLabel: 'Checklist',
    description: 'Lista de sinais para identificar comportamentos abusivos',
    href: '/checklist-reconhecimento',
    mainGoals: ['clareza'],
    problems: ['invalidacao', 'gaslighting', 'manipulacao'],
    placements: ['clarity_section', 'problem_hub'],
    icon: 'CheckSquare',
    emoji: '✅',
    order: 13,
    color: 'green',
  },

  // =========================================================================
  // REGISTRO - Ferramentas para organizar episódios e provas
  // =========================================================================
  {
    id: 'diario_episodios',
    name: 'Diário de Episódios',
    shortLabel: 'Diário',
    description: 'Registre e organize provas com segurança',
    href: '/diario',
    mainGoals: ['registro'],
    problems: ['invalidacao', 'gaslighting', 'criminalizacao', 'manipulacao', 'ameacas'],
    placements: ['main_tools', 'goals_section', 'quick_actions', 'clarity_section', 'problem_hub'],
    icon: 'BookOpen',
    emoji: '📖',
    order: 2,
    color: 'blue',
  },
  {
    id: 'diario_novo',
    name: 'Registrar Episódio',
    shortLabel: 'Novo Registro',
    description: 'Registre um novo episódio agora',
    href: '/diario/novo',
    mainGoals: ['registro'],
    problems: ['invalidacao', 'gaslighting', 'criminalizacao', 'manipulacao', 'ameacas'],
    placements: ['hero_cta', 'quick_actions', 'problem_hub'],
    icon: 'PenLine',
    emoji: '✏️',
    order: 3,
    color: 'blue',
  },
  {
    id: 'linha_tempo',
    name: 'Linha do Tempo',
    shortLabel: 'Timeline',
    description: 'Visualize a cronologia dos episódios registrados',
    href: '/linha-tempo',
    mainGoals: ['clareza', 'registro'],
    problems: ['gaslighting', 'manipulacao', 'criminalizacao'],
    placements: ['goals_section', 'clarity_section', 'problem_hub'],
    icon: 'Clock',
    emoji: '📈',
    order: 14,
    color: 'indigo',
  },
  {
    id: 'carta_futuro',
    name: 'Carta para o Futuro',
    shortLabel: 'Carta Futuro',
    description: 'Escreva uma carta para você mesma no futuro',
    href: '/carta-futuro',
    mainGoals: ['clareza', 'autocuidado'],
    problems: ['manipulacao', 'autoestima_baixa'],
    placements: ['clarity_section', 'problem_hub', 'tips_section'],
    icon: 'Mail',
    emoji: '💌',
    order: 15,
    color: 'pink',
  },

  // =========================================================================
  // APOIO - Coach IA e ferramentas de suporte emocional
  // =========================================================================
  {
    id: 'coach_clareza',
    name: 'Coach de Clareza',
    shortLabel: 'Coach IA',
    description: 'Apoio 24/7 com IA especializada em abuso narcisista',
    href: '/chat',
    mainGoals: ['clareza', 'autocuidado'],
    problems: ['invalidacao', 'gaslighting', 'manipulacao', 'ameacas', 'isolamento', 'autoestima_baixa'],
    placements: ['main_tools', 'goals_section', 'quick_actions', 'problem_hub'],
    icon: 'MessageCircle',
    emoji: '💬',
    order: 4,
    color: 'emerald',
  },
  {
    id: 'termometro_semanal',
    name: 'Termômetro Semanal',
    shortLabel: 'Termômetro',
    description: 'Acompanhe como você está se sentindo ao longo da semana',
    href: '/termometro',
    mainGoals: ['clareza', 'autocuidado'],
    problems: ['manipulacao', 'autoestima_baixa'],
    placements: ['quick_actions', 'clarity_section'],
    icon: 'BarChart3',
    emoji: '📊',
    order: 16,
    color: 'cyan',
  },

  // =========================================================================
  // PROTEÇÃO - Ferramentas de segurança e próximos passos
  // =========================================================================
  {
    id: 'plano_seguranca',
    name: 'Plano de Segurança',
    shortLabel: 'Plano',
    description: 'Crie um plano personalizado para sua proteção',
    href: '/plano-seguranca',
    mainGoals: ['protecao'],
    problems: ['criminalizacao', 'ameacas', 'isolamento'],
    placements: ['goals_section', 'security_section', 'problem_hub'],
    icon: 'Shield',
    emoji: '📋',
    order: 20,
    color: 'emerald',
  },
  {
    id: 'plano_fuga',
    name: 'Plano de Fuga Seguro',
    shortLabel: 'Plano Fuga',
    description: 'Planeje uma saída segura se precisar sair rapidamente',
    href: '/plano-fuga',
    mainGoals: ['protecao'],
    problems: ['ameacas', 'criminalizacao'],
    placements: ['goals_section', 'security_section', 'problem_hub'],
    icon: 'DoorOpen',
    emoji: '🚪',
    order: 21,
    color: 'amber',
  },
  {
    id: 'seguranca_digital',
    name: 'Segurança Digital',
    shortLabel: 'Seg. Digital',
    description: 'Proteja suas contas, senhas e privacidade online',
    href: '/seguranca-digital',
    mainGoals: ['protecao'],
    problems: ['ameacas', 'criminalizacao', 'isolamento'],
    placements: ['goals_section', 'security_section', 'problem_hub'],
    icon: 'Lock',
    emoji: '🛡️',
    order: 22,
    color: 'purple',
  },
  {
    id: 'seus_direitos_lgpd',
    name: 'Seus Direitos (LGPD)',
    shortLabel: 'Direitos',
    description: 'Conheça seus direitos de privacidade e proteção de dados',
    href: '/configuracoes',
    mainGoals: ['protecao'],
    problems: ['criminalizacao'],
    placements: ['security_section'],
    icon: 'FileText',
    emoji: '📋',
    order: 23,
    color: 'blue',
  },
  {
    id: 'modo_recaida',
    name: 'Modo Recaída',
    shortLabel: 'Recaída',
    description: 'Apoio para quando você sentir vontade de voltar',
    href: '/modo-recaida',
    mainGoals: ['protecao', 'autocuidado'],
    problems: ['manipulacao', 'autoestima_baixa', 'isolamento'],
    placements: ['security_section', 'problem_hub', 'tips_section'],
    icon: 'RefreshCcw',
    emoji: '🔄',
    order: 24,
    color: 'amber',
  },

  // =========================================================================
  // GAMIFICAÇÃO E MOTIVAÇÃO
  // =========================================================================
  {
    id: 'conquistas',
    name: 'Conquistas',
    shortLabel: 'Conquistas',
    description: 'Veja suas conquistas e progresso na jornada',
    href: '/conquistas',
    mainGoals: ['autocuidado'],
    problems: ['autoestima_baixa'],
    placements: ['clarity_section', 'tips_section'],
    icon: 'Trophy',
    emoji: '🏆',
    order: 30,
    color: 'yellow',
  },

  // =========================================================================
  // AUTOCUIDADO - Ferramentas futuras (exemplo)
  // =========================================================================
  {
    id: 'aula_maquiagem',
    name: 'Aula: Como se arrumar para voltar a se sentir bonita',
    shortLabel: 'Aula de Autoestima',
    description: 'Conteúdo de autocuidado para recuperar autoestima e se olhar com mais carinho.',
    href: '/cursos/autoestima/maquiagem',
    mainGoals: ['autocuidado'],
    problems: ['autoestima_baixa', 'isolamento'],
    placements: ['clarity_section', 'tips_section', 'problem_hub'],
    icon: 'Sparkles',
    emoji: '✨',
    order: 90,
    color: 'pink',
  },
];

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DE PROBLEMAS - Para a seção "Estou lidando com..."
// -----------------------------------------------------------------------------

export interface ProblemConfig {
  id: ProblemTag
  label: string
  icon: string
  color: string
  bgColor: string
  hoverBg: string
  borderColor: string
}

export const PROBLEMS: ProblemConfig[] = [
  { 
    id: 'invalidacao', 
    label: 'Invalidação', 
    icon: 'AlertCircle',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    hoverBg: 'hover:bg-rose-100',
    borderColor: 'hover:border-rose-200'
  },
  { 
    id: 'gaslighting', 
    label: 'Gaslighting', 
    icon: 'Brain',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverBg: 'hover:bg-purple-100',
    borderColor: 'hover:border-purple-200'
  },
  { 
    id: 'criminalizacao', 
    label: 'Criminalização', 
    icon: 'Scale',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverBg: 'hover:bg-amber-100',
    borderColor: 'hover:border-amber-200'
  },
  { 
    id: 'manipulacao', 
    label: 'Manipulação', 
    icon: 'Heart',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverBg: 'hover:bg-pink-100',
    borderColor: 'hover:border-pink-200'
  },
  { 
    id: 'ameacas', 
    label: 'Ameaças e Medo', 
    icon: 'ShieldAlert',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverBg: 'hover:bg-red-100',
    borderColor: 'hover:border-red-200'
  },
  { 
    id: 'isolamento', 
    label: 'Isolamento', 
    icon: 'Users',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    hoverBg: 'hover:bg-slate-100',
    borderColor: 'hover:border-slate-200'
  },
  { 
    id: 'autoestima_baixa', 
    label: 'Autoestima Baixa', 
    icon: 'Sparkles',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-100',
    borderColor: 'hover:border-indigo-200'
  },
]

// -----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------------------------------------

/** Filtra ferramentas por placement */
export function getToolsByPlacement(placement: Placement): ToolConfig[] {
  return TOOLS
    .filter(tool => tool.placements.includes(placement))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Filtra ferramentas por objetivo principal */
export function getToolsByGoal(goal: MainGoal): ToolConfig[] {
  return TOOLS
    .filter(tool => tool.mainGoals.includes(goal))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Filtra ferramentas por problema */
export function getToolsByProblem(problem: ProblemTag): ToolConfig[] {
  return TOOLS
    .filter(tool => tool.problems.includes(problem))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Filtra ferramentas por objetivo E placement */
export function getToolsByGoalAndPlacement(goal: MainGoal, placement: Placement): ToolConfig[] {
  return TOOLS
    .filter(tool => tool.mainGoals.includes(goal) && tool.placements.includes(placement))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Busca ferramenta por ID */
export function getToolById(id: ToolId): ToolConfig | undefined {
  return TOOLS.find(tool => tool.id === id);
}

/** Busca múltiplas ferramentas por IDs */
export function getToolsByIds(ids: ToolId[]): ToolConfig[] {
  return ids
    .map(id => getToolById(id))
    .filter((tool): tool is ToolConfig => tool !== undefined);
}
