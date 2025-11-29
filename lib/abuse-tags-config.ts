// =============================================================================
// ABUSE TAGS CONFIG - Configuração de Tags de Tipo de Abuso
// Conectado ao TOOLS/PROBLEMS config via ProblemTag
// =============================================================================

import type { ProblemTag } from './tools-config';

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

export type AbuseTagCategoryId =
  | 'manipulacao'
  | 'controle'
  | 'agressao_verbal_emocional'
  | 'ciclo_abuso'
  | 'invalidacao';

export type AbuseTagId =
  | 'gaslighting'
  | 'love_bombing'
  | 'hoovering'
  | 'triangulacao'
  | 'projecao'
  | 'vitimizacao'
  | 'isolamento_social'
  | 'controle_financeiro'
  | 'monitoramento_excessivo'
  | 'ciumes_possessivo'
  | 'agressao_verbal'
  | 'humilhacao'
  | 'critica_destrutiva'
  | 'desprezo'
  | 'sarcasmo'
  | 'ameaca_velada'
  | 'tensao_crescente'
  | 'explosao'
  | 'lua_de_mel'
  | 'silencio_punitivo'
  | 'tratamento_de_gelo'
  | 'minimizacao'
  | 'negacao'
  | 'desqualificacao'
  | 'duplo_padrao'
  | 'desrespeito_limites';

export interface AbuseTagCategoryConfig {
  id: AbuseTagCategoryId;
  title: string;
  description: string;
  problemTag: ProblemTag;
  icon: string;
  emoji: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    bgActive: string;
  };
  order: number;
}

export interface AbuseTagConfig {
  id: AbuseTagId;
  categoryId: AbuseTagCategoryId;
  label: string;
  description: string;
  example: string;
  problemTag?: ProblemTag; // Se mais específico que o da categoria
}

// -----------------------------------------------------------------------------
// CATEGORIAS DE TAGS
// -----------------------------------------------------------------------------

export const ABUSE_TAG_CATEGORIES: AbuseTagCategoryConfig[] = [
  {
    id: 'manipulacao',
    title: 'Manipulação',
    description: 'Táticas para controlar sua percepção da realidade e suas decisões',
    problemTag: 'manipulacao',
    icon: 'Sparkles',
    emoji: '🎭',
    colorClass: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      bgActive: 'bg-rose-500',
    },
    order: 1,
  },
  {
    id: 'controle',
    title: 'Controle',
    description: 'Comportamentos que limitam sua liberdade e autonomia',
    problemTag: 'isolamento',
    icon: 'Lock',
    emoji: '🔒',
    colorClass: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      bgActive: 'bg-orange-500',
    },
    order: 2,
  },
  {
    id: 'agressao_verbal_emocional',
    title: 'Agressão Verbal/Emocional',
    description: 'Ataques diretos à sua autoestima e bem-estar emocional',
    problemTag: 'ameacas',
    icon: 'AlertTriangle',
    emoji: '💢',
    colorClass: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      bgActive: 'bg-purple-500',
    },
    order: 3,
  },
  {
    id: 'ciclo_abuso',
    title: 'Ciclo de Abuso',
    description: 'Padrões repetitivos de tensão, explosão e reconciliação',
    problemTag: 'ameacas', // TODO: revisar - poderia ser um ProblemTag específico
    icon: 'RefreshCw',
    emoji: '🔄',
    colorClass: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      bgActive: 'bg-blue-500',
    },
    order: 4,
  },
  {
    id: 'invalidacao',
    title: 'Invalidação',
    description: 'Negação ou minimização dos seus sentimentos e experiências',
    problemTag: 'invalidacao',
    icon: 'XCircle',
    emoji: '🚫',
    colorClass: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      bgActive: 'bg-gray-600',
    },
    order: 5,
  },
];

// -----------------------------------------------------------------------------
// TAGS DE ABUSO
// -----------------------------------------------------------------------------

export const ABUSE_TAGS: AbuseTagConfig[] = [
  // =========================================================================
  // MANIPULAÇÃO
  // =========================================================================
  {
    id: 'gaslighting',
    categoryId: 'manipulacao',
    label: 'Gaslighting',
    description: 'Quando a pessoa faz você duvidar da sua própria memória, percepção ou sanidade. Você começa a achar que está "ficando louco(a)".',
    example: 'Você lembra claramente de uma conversa, mas a pessoa diz: "Isso nunca aconteceu, você está inventando coisas".',
    problemTag: 'gaslighting',
  },
  {
    id: 'love_bombing',
    categoryId: 'manipulacao',
    label: 'Love Bombing',
    description: 'Excesso de atenção, presentes e declarações de amor no início do relacionamento ou após uma briga, para conquistar ou reconquistar você.',
    example: 'Após uma discussão séria, a pessoa aparece com flores, presentes caros e promete que vai mudar, mas logo volta ao comportamento anterior.',
  },
  {
    id: 'hoovering',
    categoryId: 'manipulacao',
    label: 'Hoovering',
    description: 'Tentativas de "sugar" você de volta para o relacionamento após um afastamento, usando charme, promessas ou manipulação emocional.',
    example: 'Depois de você se afastar, a pessoa aparece dizendo que mudou, que precisa de você, ou usa emergências falsas para fazer contato.',
  },
  {
    id: 'triangulacao',
    categoryId: 'manipulacao',
    label: 'Triangulação',
    description: 'Envolver uma terceira pessoa (ex, amigo, familiar) para criar ciúmes, insegurança ou competição.',
    example: 'A pessoa menciona frequentemente como o(a) ex era "mais compreensivo(a)" ou como outras pessoas a admiram.',
  },
  {
    id: 'projecao',
    categoryId: 'manipulacao',
    label: 'Projeção',
    description: 'Acusar você de fazer exatamente o que a pessoa faz. É como se ela "jogasse" os próprios defeitos em você.',
    example: 'A pessoa te acusa de ser controlador(a) ou mentiroso(a), quando na verdade é ela quem age assim.',
  },
  {
    id: 'vitimizacao',
    categoryId: 'manipulacao',
    label: 'Vitimização',
    description: 'A pessoa sempre se coloca como vítima, mesmo quando é ela quem causou o problema, fazendo você se sentir culpado(a).',
    example: 'Quando você tenta falar sobre algo que te machucou, a pessoa diz: "Você sempre me ataca, eu é que sofro nessa relação".',
  },

  // =========================================================================
  // CONTROLE
  // =========================================================================
  {
    id: 'isolamento_social',
    categoryId: 'controle',
    label: 'Isolamento Social',
    description: 'Afastar você de amigos, família ou qualquer rede de apoio, deixando você dependente apenas da pessoa.',
    example: 'A pessoa critica seus amigos, cria conflitos com sua família ou fica com raiva quando você quer sair sem ela.',
    problemTag: 'isolamento',
  },
  {
    id: 'controle_financeiro',
    categoryId: 'controle',
    label: 'Controle Financeiro',
    description: 'Controlar seu dinheiro, impedir que você trabalhe ou ter que "prestar contas" de cada gasto.',
    example: 'Você precisa pedir permissão para comprar algo ou a pessoa controla todo o dinheiro da casa.',
  },
  {
    id: 'monitoramento_excessivo',
    categoryId: 'controle',
    label: 'Monitoramento Excessivo',
    description: 'Vigiar constantemente suas mensagens, ligações, redes sociais ou localização.',
    example: 'A pessoa exige suas senhas, verifica seu celular ou quer saber onde você está a todo momento.',
  },
  {
    id: 'ciumes_possessivo',
    categoryId: 'controle',
    label: 'Ciúmes Possessivo',
    description: 'Ciúmes extremo que vai além do normal, tratando você como propriedade.',
    example: 'A pessoa fica com raiva se você conversa com alguém do sexo oposto ou questiona suas roupas e amizades.',
  },

  // =========================================================================
  // AGRESSÃO VERBAL/EMOCIONAL
  // =========================================================================
  {
    id: 'agressao_verbal',
    categoryId: 'agressao_verbal_emocional',
    label: 'Agressão Verbal',
    description: 'Usar palavras para humilhar, ofender ou diminuir você, incluindo gritos e intimidação.',
    example: 'A pessoa te chama de "burro(a)", "inútil", "louco(a)" ou usa apelidos depreciativos.',
    problemTag: 'ameacas',
  },
  {
    id: 'humilhacao',
    categoryId: 'agressao_verbal_emocional',
    label: 'Humilhação',
    description: 'Fazer piadas, críticas ou comentários que te diminuem, especialmente na frente de outras pessoas.',
    example: 'A pessoa conta seus segredos, faz piadas sobre você ou te corrige de forma constrangedora em público.',
  },
  {
    id: 'critica_destrutiva',
    categoryId: 'agressao_verbal_emocional',
    label: 'Crítica Destrutiva',
    description: 'Criticar constantemente tudo o que você faz, nunca reconhecendo seus esforços ou conquistas.',
    example: 'Não importa o que você faça, a pessoa sempre encontra algo errado ou diz que você poderia ter feito melhor.',
    problemTag: 'autoestima_baixa',
  },
  {
    id: 'desprezo',
    categoryId: 'agressao_verbal_emocional',
    label: 'Desprezo',
    description: 'Demonstrar superioridade, revirar os olhos, fazer caretas ou tratar você como inferior.',
    example: 'A pessoa suspira de impaciência quando você fala, ou age como se suas opiniões não tivessem valor.',
  },
  {
    id: 'sarcasmo',
    categoryId: 'agressao_verbal_emocional',
    label: 'Sarcasmo',
    description: 'Usar ironia e comentários ácidos disfarçados de "brincadeira" para machucar.',
    example: 'A pessoa faz comentários maldosos e depois diz "era só brincadeira, você não sabe levar uma piada".',
  },
  {
    id: 'ameaca_velada',
    categoryId: 'agressao_verbal_emocional',
    label: 'Ameaça Velada',
    description: 'Usar ameaças indiretas (de terminar, de se machucar, de tirar os filhos, etc.) para controlar você.',
    example: 'A pessoa diz: "Se você me deixar, eu me mato" ou "Você nunca mais vai ver as crianças".',
    problemTag: 'ameacas',
  },

  // =========================================================================
  // CICLO DE ABUSO
  // =========================================================================
  {
    id: 'tensao_crescente',
    categoryId: 'ciclo_abuso',
    label: 'Tensão Crescente',
    description: 'Período onde você sente que "algo vai acontecer", anda pisando em ovos.',
    example: 'Você percebe que a pessoa está ficando irritada com coisas pequenas e sente que uma explosão está chegando.',
  },
  {
    id: 'explosao',
    categoryId: 'ciclo_abuso',
    label: 'Explosão',
    description: 'O momento em que a tensão "estoura" em gritos, agressão verbal ou física.',
    example: 'A pessoa explode por algo pequeno, grita, xinga ou age de forma agressiva.',
    problemTag: 'ameacas',
  },
  {
    id: 'lua_de_mel',
    categoryId: 'ciclo_abuso',
    label: 'Lua de Mel',
    description: 'Período de "paz" após um episódio ruim, onde a pessoa é carinhosa e promete mudar.',
    example: 'Depois de uma briga intensa, a pessoa fica super atenciosa, faz promessas e vocês vivem dias "perfeitos".',
  },
  {
    id: 'silencio_punitivo',
    categoryId: 'ciclo_abuso',
    label: 'Silêncio Punitivo',
    description: 'Ignorar você completamente como forma de punição, às vezes por dias.',
    example: 'Após uma discussão, a pessoa para de falar com você, não responde mensagens e age como se você não existisse.',
  },
  {
    id: 'tratamento_de_gelo',
    categoryId: 'ciclo_abuso',
    label: 'Tratamento de Gelo',
    description: 'Similar ao silêncio punitivo, mas com frieza calculada para fazer você se sentir invisível.',
    example: 'A pessoa responde com monossílabos, evita contato visual e age como se você fosse um estranho.',
  },

  // =========================================================================
  // INVALIDAÇÃO
  // =========================================================================
  {
    id: 'minimizacao',
    categoryId: 'invalidacao',
    label: 'Minimização',
    description: 'Dizer que você está exagerando, que "não foi tão grave assim" ou que você é "sensível demais".',
    example: 'Você tenta falar sobre algo que te machucou e a pessoa diz: "Você está fazendo tempestade em copo d\'água".',
    problemTag: 'invalidacao',
  },
  {
    id: 'negacao',
    categoryId: 'invalidacao',
    label: 'Negação',
    description: 'Negar que algo aconteceu ou que a pessoa disse/fez algo, mesmo quando você tem certeza.',
    example: 'A pessoa diz: "Eu nunca disse isso" ou "Você entendeu errado" sobre algo que você lembra claramente.',
    problemTag: 'gaslighting',
  },
  {
    id: 'desqualificacao',
    categoryId: 'invalidacao',
    label: 'Desqualificação',
    description: 'Diminuir suas conquistas, opiniões, sentimentos ou capacidades.',
    example: 'A pessoa diz que seu trabalho "não é tão importante", que sua opinião "não conta" ou que você "não sabe de nada".',
    problemTag: 'autoestima_baixa',
  },
  {
    id: 'duplo_padrao',
    categoryId: 'invalidacao',
    label: 'Duplo Padrão',
    description: 'A pessoa pode fazer algo, mas você não pode fazer a mesma coisa.',
    example: 'A pessoa pode sair com amigos, mas você não. Ela pode se atrasar, mas você não pode.',
  },
  {
    id: 'desrespeito_limites',
    categoryId: 'invalidacao',
    label: 'Desrespeito a Limites',
    description: 'Ignorar ou ultrapassar seus limites pessoais repetidamente.',
    example: 'Você diz que não quer falar sobre um assunto, mas a pessoa insiste. Você pede espaço, mas ela não respeita.',
    problemTag: 'invalidacao',
  },
];

// -----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------------------------------------

/** Retorna categorias ordenadas */
export function getOrderedCategories(): AbuseTagCategoryConfig[] {
  return [...ABUSE_TAG_CATEGORIES].sort((a, b) => a.order - b.order);
}

/** Retorna tags de uma categoria */
export function getTagsByCategory(categoryId: AbuseTagCategoryId): AbuseTagConfig[] {
  return ABUSE_TAGS.filter(tag => tag.categoryId === categoryId);
}

/** Retorna tags agrupadas por categoria */
export function getTagsGroupedByCategory(): Record<AbuseTagCategoryId, AbuseTagConfig[]> {
  const grouped: Record<AbuseTagCategoryId, AbuseTagConfig[]> = {
    manipulacao: [],
    controle: [],
    agressao_verbal_emocional: [],
    ciclo_abuso: [],
    invalidacao: [],
  };
  
  ABUSE_TAGS.forEach(tag => {
    grouped[tag.categoryId].push(tag);
  });
  
  return grouped;
}

/** Retorna uma tag pelo ID */
export function getAbuseTagById(id: string): AbuseTagConfig | undefined {
  return ABUSE_TAGS.find(tag => tag.id === id);
}

/** Retorna uma categoria pelo ID */
export function getCategoryById(id: AbuseTagCategoryId): AbuseTagCategoryConfig | undefined {
  return ABUSE_TAG_CATEGORIES.find(cat => cat.id === id);
}

/** Retorna o ProblemTag de uma tag (usa o da categoria se não tiver específico) */
export function getProblemTagForAbuseTag(tagId: AbuseTagId): ProblemTag {
  const tag = getAbuseTagById(tagId);
  if (!tag) return 'manipulacao'; // fallback
  
  if (tag.problemTag) return tag.problemTag;
  
  const category = getCategoryById(tag.categoryId);
  return category?.problemTag || 'manipulacao';
}

/** Mapeia tags de abuso para ProblemTags (para estatísticas) */
export function mapAbuseTagsToProblemTags(tagIds: string[]): Record<ProblemTag, number> {
  const counts: Record<ProblemTag, number> = {
    invalidacao: 0,
    gaslighting: 0,
    criminalizacao: 0,
    manipulacao: 0,
    ameacas: 0,
    isolamento: 0,
    autoestima_baixa: 0,
  };
  
  tagIds.forEach(tagId => {
    const problemTag = getProblemTagForAbuseTag(tagId as AbuseTagId);
    counts[problemTag]++;
  });
  
  return counts;
}

// -----------------------------------------------------------------------------
// COMPATIBILIDADE COM CÓDIGO LEGADO
// -----------------------------------------------------------------------------

/** Converte para formato legado (usado em código existente) */
export function getLegacyTagsFormat(): Record<string, string[]> {
  return {
    manipulacao: getTagsByCategory('manipulacao').map(t => t.label.toLowerCase()),
    controle: getTagsByCategory('controle').map(t => t.label.toLowerCase()),
    agressao: getTagsByCategory('agressao_verbal_emocional').map(t => t.label.toLowerCase()),
    ciclo: getTagsByCategory('ciclo_abuso').map(t => t.label.toLowerCase()),
    invalidacao: getTagsByCategory('invalidacao').map(t => t.label.toLowerCase()),
  };
}
