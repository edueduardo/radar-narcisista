// =============================================================================
// CLARITY UNIFIED CONFIG - Configuração Unificada do Teste de Clareza
// PLANO D: Unificação total de todos os sistemas de teste
// =============================================================================
// 
// Este arquivo unifica:
// - clarity-test-config.ts (12 perguntas, 3 eixos)
// - clarityTestConfig.ts (12 perguntas, 3 eixos)
// - teste-clareza/page.tsx (18 perguntas, 6 categorias)
//
// Resultado: 18 perguntas organizadas em 3 eixos + 6 categorias detalhadas
// =============================================================================

import { ProblemTag } from './tools-config';

// -----------------------------------------------------------------------------
// TIPOS UNIFICADOS
// -----------------------------------------------------------------------------

export type AnswerValue = 0 | 1 | 2 | 3 | 4;

export type Axis = 'nevoa' | 'medo' | 'limites';

export type Category = 
  | 'invalidacao' 
  | 'gaslighting' 
  | 'controle' 
  | 'isolamento' 
  | 'emocional' 
  | 'fisico';

export interface UnifiedQuestion {
  id: string;
  text: string;
  axis: Axis;                    // Eixo principal (névoa, medo, limites)
  category: Category;            // Categoria detalhada
  problemTags: ProblemTag[];     // Tags de problemas para integração com TOOLS
  weight: number;                // Peso da pergunta (1 = normal, 1.5+ = mais grave)
  inverted?: boolean;            // Se a pontuação é invertida
  order: number;                 // Ordem de exibição
}

export interface AnswerOption {
  value: AnswerValue;
  label: string;
  description: string;
}

export interface AxisConfig {
  id: Axis;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface CategoryConfig {
  id: Category;
  label: string;
  description: string;
  axis: Axis;                    // A qual eixo pertence
  color: string;
  icon: string;
}

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DE RESPOSTAS (Escala 0-4)
// -----------------------------------------------------------------------------

export const ANSWER_OPTIONS: AnswerOption[] = [
  { value: 0, label: 'Nunca', description: 'Isso não acontece' },
  { value: 1, label: 'Raramente', description: 'Aconteceu uma ou duas vezes' },
  { value: 2, label: 'Às vezes', description: 'Acontece de vez em quando' },
  { value: 3, label: 'Frequentemente', description: 'Acontece com regularidade' },
  { value: 4, label: 'Quase sempre', description: 'É constante' },
];

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DOS EIXOS (3 eixos principais)
// -----------------------------------------------------------------------------

export const AXES_CONFIG: AxisConfig[] = [
  {
    id: 'nevoa',
    label: 'Névoa Mental',
    description: 'Confusão, gaslighting, dúvida sobre a própria percepção',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'medo',
    label: 'Medo e Tensão',
    description: 'Medo de reações, tensão constante, andar em ovos',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'limites',
    label: 'Desrespeito a Limites',
    description: 'Limites ignorados, desvalorização, isolamento',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
];

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DAS CATEGORIAS (6 categorias detalhadas)
// -----------------------------------------------------------------------------

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  {
    id: 'invalidacao',
    label: 'Invalidação',
    description: 'Suas emoções e percepções são minimizadas ou ignoradas',
    axis: 'nevoa',
    color: 'text-pink-600',
    icon: 'AlertCircle',
  },
  {
    id: 'gaslighting',
    label: 'Gaslighting',
    description: 'Manipulação que faz você duvidar da própria realidade',
    axis: 'nevoa',
    color: 'text-purple-600',
    icon: 'Brain',
  },
  {
    id: 'controle',
    label: 'Controle',
    description: 'Controle excessivo sobre suas decisões e liberdade',
    axis: 'medo',
    color: 'text-blue-600',
    icon: 'Lock',
  },
  {
    id: 'isolamento',
    label: 'Isolamento',
    description: 'Afastamento de amigos, família e rede de apoio',
    axis: 'limites',
    color: 'text-indigo-600',
    icon: 'Users',
  },
  {
    id: 'emocional',
    label: 'Abuso Emocional',
    description: 'Punições emocionais, humilhação, medo constante',
    axis: 'medo',
    color: 'text-orange-600',
    icon: 'Heart',
  },
  {
    id: 'fisico',
    label: 'Risco Físico',
    description: 'Sinais de violência física ou ameaça de agressão',
    axis: 'limites',
    color: 'text-red-600',
    icon: 'ShieldAlert',
  },
];

// -----------------------------------------------------------------------------
// 18 PERGUNTAS UNIFICADAS
// -----------------------------------------------------------------------------

export const UNIFIED_QUESTIONS: UnifiedQuestion[] = [
  // =========================================================================
  // INVALIDAÇÃO (3 perguntas) - Eixo: Névoa
  // =========================================================================
  {
    id: 'inv_1',
    text: 'Você sente que suas emoções são frequentemente minimizadas ou ignoradas?',
    axis: 'nevoa',
    category: 'invalidacao',
    problemTags: ['invalidacao'],
    weight: 1,
    order: 1,
  },
  {
    id: 'inv_2',
    text: 'Quando você expressa desconforto, a outra pessoa diz que você está exagerando?',
    axis: 'nevoa',
    category: 'invalidacao',
    problemTags: ['invalidacao', 'gaslighting'],
    weight: 1,
    order: 2,
  },
  {
    id: 'inv_3',
    text: 'Você se sente "louca(o)" ou "sensível demais" com frequência?',
    axis: 'nevoa',
    category: 'invalidacao',
    problemTags: ['invalidacao', 'gaslighting', 'autoestima_baixa'],
    weight: 1.5,
    order: 3,
  },

  // =========================================================================
  // GASLIGHTING (3 perguntas) - Eixo: Névoa
  // =========================================================================
  {
    id: 'gas_1',
    text: 'Você já duvidou da sua própria memória sobre eventos que aconteceram?',
    axis: 'nevoa',
    category: 'gaslighting',
    problemTags: ['gaslighting'],
    weight: 1.5,
    order: 4,
  },
  {
    id: 'gas_2',
    text: 'A pessoa nega ter dito ou feito coisas que você claramente lembra?',
    axis: 'nevoa',
    category: 'gaslighting',
    problemTags: ['gaslighting', 'manipulacao'],
    weight: 2,
    order: 5,
  },
  {
    id: 'gas_3',
    text: 'Você se pega pedindo desculpas por coisas que não fez?',
    axis: 'nevoa',
    category: 'gaslighting',
    problemTags: ['gaslighting', 'manipulacao'],
    weight: 1.5,
    order: 6,
  },

  // =========================================================================
  // CONTROLE (3 perguntas) - Eixo: Medo
  // =========================================================================
  {
    id: 'con_1',
    text: 'A pessoa quer saber onde você está e com quem o tempo todo?',
    axis: 'medo',
    category: 'controle',
    problemTags: ['manipulacao', 'isolamento'],
    weight: 1,
    order: 7,
  },
  {
    id: 'con_2',
    text: 'Você precisa pedir permissão para fazer coisas básicas?',
    axis: 'medo',
    category: 'controle',
    problemTags: ['manipulacao', 'isolamento'],
    weight: 1.5,
    order: 8,
  },
  {
    id: 'con_3',
    text: 'A pessoa controla o dinheiro ou suas decisões financeiras?',
    axis: 'medo',
    category: 'controle',
    problemTags: ['manipulacao'],
    weight: 1.5,
    order: 9,
  },

  // =========================================================================
  // ISOLAMENTO (3 perguntas) - Eixo: Limites
  // =========================================================================
  {
    id: 'iso_1',
    text: 'Você se afastou de amigos ou família por causa dessa pessoa?',
    axis: 'limites',
    category: 'isolamento',
    problemTags: ['isolamento'],
    weight: 1.5,
    order: 10,
  },
  {
    id: 'iso_2',
    text: 'A pessoa fala mal das pessoas próximas a você?',
    axis: 'limites',
    category: 'isolamento',
    problemTags: ['isolamento', 'manipulacao'],
    weight: 1,
    order: 11,
  },
  {
    id: 'iso_3',
    text: 'Você sente que não tem mais ninguém além dessa pessoa?',
    axis: 'limites',
    category: 'isolamento',
    problemTags: ['isolamento', 'autoestima_baixa'],
    weight: 2,
    order: 12,
  },

  // =========================================================================
  // ABUSO EMOCIONAL (3 perguntas) - Eixo: Medo
  // =========================================================================
  {
    id: 'emo_1',
    text: 'A pessoa usa o silêncio como punição?',
    axis: 'medo',
    category: 'emocional',
    problemTags: ['manipulacao', 'ameacas'],
    weight: 1,
    order: 13,
  },
  {
    id: 'emo_2',
    text: 'Você tem medo de como a pessoa vai reagir às coisas?',
    axis: 'medo',
    category: 'emocional',
    problemTags: ['ameacas', 'manipulacao'],
    weight: 1.5,
    order: 14,
  },
  {
    id: 'emo_3',
    text: 'A pessoa te humilha em público ou em particular?',
    axis: 'medo',
    category: 'emocional',
    problemTags: ['invalidacao', 'autoestima_baixa'],
    weight: 1.5,
    order: 15,
  },

  // =========================================================================
  // RISCO FÍSICO (3 perguntas) - Eixo: Limites - PESO ALTO
  // =========================================================================
  {
    id: 'fis_1',
    text: 'A pessoa já quebrou objetos ou socou paredes durante discussões?',
    axis: 'limites',
    category: 'fisico',
    problemTags: ['ameacas'],
    weight: 2,
    order: 16,
  },
  {
    id: 'fis_2',
    text: 'Você já teve medo de ser agredida(o) fisicamente?',
    axis: 'limites',
    category: 'fisico',
    problemTags: ['ameacas'],
    weight: 2.5,
    order: 17,
  },
  {
    id: 'fis_3',
    text: 'A pessoa já te empurrou, segurou com força ou te agrediu?',
    axis: 'limites',
    category: 'fisico',
    problemTags: ['ameacas'],
    weight: 3,
    order: 18,
  },
];

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DE ZONAS GLOBAIS
// -----------------------------------------------------------------------------

export type GlobalZone = 'atencao' | 'alerta' | 'vermelha';

export interface ZoneConfig {
  id: GlobalZone;
  title: string;
  description: string;
  minPercentage: number;
  maxPercentage: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const ZONES_CONFIG: ZoneConfig[] = [
  {
    id: 'atencao',
    title: 'Zona de Atenção',
    description: 'Seu resultado mostra alguns sinais que merecem atenção, mas não necessariamente indicam uma situação de risco. Continue observando e registrando episódios para ter mais clareza.',
    minPercentage: 0,
    maxPercentage: 0.33,
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'alerta',
    title: 'Zona de Alerta',
    description: 'Seu resultado indica sinais moderados de confusão, medo ou desrespeito a limites. Isso merece atenção e acompanhamento. Considere registrar episódios e buscar apoio.',
    minPercentage: 0.33,
    maxPercentage: 0.66,
    color: 'text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'vermelha',
    title: 'Zona de Alto Risco',
    description: 'Seu resultado mostra alto nível de confusão, medo e/ou desrespeito a limites. Isso é compatível com relações emocionalmente abusivas. Você não está exagerando. Considere buscar ajuda profissional e criar um plano de segurança.',
    minPercentage: 0.66,
    maxPercentage: 1,
    color: 'text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
];

// -----------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO
// -----------------------------------------------------------------------------

export interface AxisScore {
  axis: Axis;
  label: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: 'baixo' | 'moderado' | 'alto';
}

export interface CategoryScore {
  category: Category;
  label: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  questionCount: number;
}

export interface ProblemScore {
  problem: ProblemTag;
  totalScore: number;
  maxScore: number;
  percentage: number;
  questionCount: number;
}

export interface UnifiedResult {
  // Scores gerais
  overallScore: number;
  maxOverallScore: number;
  overallPercentage: number;
  globalZone: GlobalZone;
  
  // Scores por eixo (3)
  axisScores: AxisScore[];
  
  // Scores por categoria (6)
  categoryScores: CategoryScore[];
  
  // Scores por problema (para integração com TOOLS)
  problemScores: ProblemScore[];
  
  // Problemas em destaque (>= 40%)
  highlightedProblems: ProblemTag[];
  
  // Alerta de risco físico
  hasPhysicalRisk: boolean;
  physicalRiskScore: number;
}

/**
 * Calcula o resultado completo do teste unificado
 */
export function calculateUnifiedResult(answers: Record<string, number>): UnifiedResult {
  const maxScorePerQuestion = 4;
  
  // Calcular scores por eixo
  const axisScores = calculateAxisScores(answers, maxScorePerQuestion);
  
  // Calcular scores por categoria
  const categoryScores = calculateCategoryScores(answers, maxScorePerQuestion);
  
  // Calcular scores por problema
  const problemScores = calculateProblemScores(answers, maxScorePerQuestion);
  
  // Calcular score geral (com pesos)
  let totalWeightedScore = 0;
  let totalMaxScore = 0;
  
  UNIFIED_QUESTIONS.forEach(q => {
    const answer = answers[q.id] ?? 0;
    const adjustedAnswer = q.inverted ? (maxScorePerQuestion - answer) : answer;
    totalWeightedScore += adjustedAnswer * q.weight;
    totalMaxScore += maxScorePerQuestion * q.weight;
  });
  
  const overallPercentage = totalMaxScore > 0 ? totalWeightedScore / totalMaxScore : 0;
  
  // Determinar zona global
  const globalZone = getGlobalZone(overallPercentage);
  
  // Identificar problemas em destaque (>= 40%)
  const highlightedProblems = problemScores
    .filter(ps => ps.percentage >= 0.4)
    .sort((a, b) => b.percentage - a.percentage)
    .map(ps => ps.problem);
  
  // Verificar risco físico
  const physicalCategory = categoryScores.find(c => c.category === 'fisico');
  const hasPhysicalRisk = physicalCategory ? physicalCategory.percentage >= 0.3 : false;
  const physicalRiskScore = physicalCategory?.percentage ?? 0;
  
  return {
    overallScore: Math.round(totalWeightedScore),
    maxOverallScore: Math.round(totalMaxScore),
    overallPercentage,
    globalZone,
    axisScores,
    categoryScores,
    problemScores,
    highlightedProblems,
    hasPhysicalRisk,
    physicalRiskScore,
  };
}

function calculateAxisScores(answers: Record<string, number>, maxScore: number): AxisScore[] {
  return AXES_CONFIG.map(axisConfig => {
    const axisQuestions = UNIFIED_QUESTIONS.filter(q => q.axis === axisConfig.id);
    let totalScore = 0;
    let maxPossible = 0;
    
    axisQuestions.forEach(q => {
      const answer = answers[q.id] ?? 0;
      const adjustedAnswer = q.inverted ? (maxScore - answer) : answer;
      totalScore += adjustedAnswer * q.weight;
      maxPossible += maxScore * q.weight;
    });
    
    const percentage = maxPossible > 0 ? totalScore / maxPossible : 0;
    
    return {
      axis: axisConfig.id,
      label: axisConfig.label,
      totalScore: Math.round(totalScore),
      maxScore: Math.round(maxPossible),
      percentage,
      level: getAxisLevel(percentage),
    };
  });
}

function calculateCategoryScores(answers: Record<string, number>, maxScore: number): CategoryScore[] {
  return CATEGORIES_CONFIG.map(catConfig => {
    const catQuestions = UNIFIED_QUESTIONS.filter(q => q.category === catConfig.id);
    let totalScore = 0;
    let maxPossible = 0;
    
    catQuestions.forEach(q => {
      const answer = answers[q.id] ?? 0;
      const adjustedAnswer = q.inverted ? (maxScore - answer) : answer;
      totalScore += adjustedAnswer * q.weight;
      maxPossible += maxScore * q.weight;
    });
    
    const percentage = maxPossible > 0 ? totalScore / maxPossible : 0;
    
    return {
      category: catConfig.id,
      label: catConfig.label,
      totalScore: Math.round(totalScore),
      maxScore: Math.round(maxPossible),
      percentage,
      questionCount: catQuestions.length,
    };
  });
}

function calculateProblemScores(answers: Record<string, number>, maxScore: number): ProblemScore[] {
  // Coletar todos os problemas únicos
  const allProblems = new Set<ProblemTag>();
  UNIFIED_QUESTIONS.forEach(q => q.problemTags.forEach(p => allProblems.add(p)));
  
  return Array.from(allProblems).map(problem => {
    const relevantQuestions = UNIFIED_QUESTIONS.filter(q => q.problemTags.includes(problem));
    let totalScore = 0;
    let maxPossible = 0;
    
    relevantQuestions.forEach(q => {
      const answer = answers[q.id] ?? 0;
      const adjustedAnswer = q.inverted ? (maxScore - answer) : answer;
      totalScore += adjustedAnswer * q.weight;
      maxPossible += maxScore * q.weight;
    });
    
    const percentage = maxPossible > 0 ? totalScore / maxPossible : 0;
    
    return {
      problem,
      totalScore: Math.round(totalScore),
      maxScore: Math.round(maxPossible),
      percentage,
      questionCount: relevantQuestions.length,
    };
  }).sort((a, b) => b.percentage - a.percentage);
}

function getAxisLevel(percentage: number): 'baixo' | 'moderado' | 'alto' {
  if (percentage <= 0.33) return 'baixo';
  if (percentage <= 0.66) return 'moderado';
  return 'alto';
}

function getGlobalZone(percentage: number): GlobalZone {
  if (percentage <= 0.33) return 'atencao';
  if (percentage <= 0.66) return 'alerta';
  return 'vermelha';
}

// -----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------------------------------------

/** Retorna perguntas ordenadas */
export function getOrderedQuestions(): UnifiedQuestion[] {
  return [...UNIFIED_QUESTIONS].sort((a, b) => a.order - b.order);
}

/** Retorna perguntas embaralhadas */
export function getShuffledQuestions(): UnifiedQuestion[] {
  const questions = [...UNIFIED_QUESTIONS];
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

/** Retorna configuração de uma zona */
export function getZoneConfig(zone: GlobalZone): ZoneConfig {
  return ZONES_CONFIG.find(z => z.id === zone) || ZONES_CONFIG[0];
}

/** Retorna configuração de um eixo */
export function getAxisConfig(axis: Axis): AxisConfig {
  return AXES_CONFIG.find(a => a.id === axis) || AXES_CONFIG[0];
}

/** Retorna configuração de uma categoria */
export function getCategoryConfig(category: Category): CategoryConfig {
  return CATEGORIES_CONFIG.find(c => c.id === category) || CATEGORIES_CONFIG[0];
}

/** Retorna descrição do nível do eixo */
export function getAxisLevelDescription(axis: Axis, level: 'baixo' | 'moderado' | 'alto'): string {
  const descriptions: Record<Axis, Record<string, string>> = {
    nevoa: {
      baixo: 'Você parece ter clareza sobre os fatos e sua percepção da realidade.',
      moderado: 'Há alguns sinais de confusão mental que merecem atenção.',
      alto: 'Você está experimentando muita confusão sobre o que é real. Isso pode ser gaslighting.',
    },
    medo: {
      baixo: 'Você não parece viver em estado constante de medo ou tensão.',
      moderado: 'Há sinais de tensão e medo que afetam seu dia a dia.',
      alto: 'Você está vivendo com muito medo e tensão. Isso não é normal em uma relação saudável.',
    },
    limites: {
      baixo: 'Seus limites parecem ser respeitados na maior parte do tempo.',
      moderado: 'Há sinais de que seus limites não são totalmente respeitados.',
      alto: 'Seus limites estão sendo sistematicamente desrespeitados. Isso é sério.',
    },
  };
  
  return descriptions[axis]?.[level] || '';
}
