// =============================================================================
// CLARITY TEST UTILS - Funções de cálculo do Teste de Clareza
// Calcula scores por problema (ProblemTag) e geral
// =============================================================================

import { ProblemTag } from './tools-config';
import { 
  CLARITY_QUESTIONS, 
  CLARITY_ANSWER_SCORES, 
  AnswerFrequency,
  ClarityQuestion 
} from './clarity-test-config';

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

export interface ProblemScore {
  problem: ProblemTag;
  totalScore: number;
  maxScore: number;
  percentage: number; // 0 a 1
  questionCount: number;
}

export interface AxisScore {
  axis: 'nevoa' | 'medo' | 'limites';
  label: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: 'baixo' | 'moderado' | 'alto';
}

export interface ClarityResultSummary {
  overallScore: number;
  maxOverallScore: number;
  overallPercentage: number; // 0 a 1
  globalZone: 'atencao' | 'alerta' | 'vermelha';
  problemScores: ProblemScore[];
  axisScores: AxisScore[];
  highlightedProblems: ProblemTag[]; // Problemas com percentage >= 0.4
}

// -----------------------------------------------------------------------------
// CONSTANTES
// -----------------------------------------------------------------------------

const MAX_SCORE_PER_QUESTION = 4; // Máximo possível por pergunta

const AXIS_LABELS: Record<string, string> = {
  nevoa: 'Névoa Mental (Gaslighting)',
  medo: 'Medo e Tensão',
  limites: 'Desrespeito a Limites',
};

// -----------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO
// -----------------------------------------------------------------------------

/**
 * Calcula o resultado completo do teste de clareza
 * @param answers - Mapa de respostas { questionId: AnswerFrequency | number }
 */
export function calculateClarityResult(
  answers: Record<string, AnswerFrequency | number | null>
): ClarityResultSummary {
  // Converter respostas numéricas para AnswerFrequency se necessário
  const normalizedAnswers: Record<string, number> = {};
  
  for (const [questionId, answer] of Object.entries(answers)) {
    if (answer === null) continue;
    
    if (typeof answer === 'number') {
      normalizedAnswers[questionId] = answer;
    } else {
      const config = CLARITY_ANSWER_SCORES.find(c => c.value === answer);
      normalizedAnswers[questionId] = config?.score ?? 0;
    }
  }

  // Calcular scores por eixo
  const axisScores = calculateAxisScores(normalizedAnswers);
  
  // Calcular scores por problema
  const problemScores = calculateProblemScores(normalizedAnswers);
  
  // Calcular score geral
  const overallScore = axisScores.reduce((sum, axis) => sum + axis.totalScore, 0);
  const maxOverallScore = CLARITY_QUESTIONS.length * MAX_SCORE_PER_QUESTION;
  const overallPercentage = maxOverallScore > 0 ? overallScore / maxOverallScore : 0;
  
  // Determinar zona global
  const globalZone = getGlobalZone(overallScore);
  
  // Identificar problemas em destaque (>= 40%)
  const highlightedProblems = problemScores
    .filter(ps => ps.percentage >= 0.4)
    .sort((a, b) => b.percentage - a.percentage)
    .map(ps => ps.problem);

  return {
    overallScore,
    maxOverallScore,
    overallPercentage,
    globalZone,
    problemScores,
    axisScores,
    highlightedProblems,
  };
}

/**
 * Calcula scores por eixo (névoa, medo, limites)
 */
function calculateAxisScores(answers: Record<string, number>): AxisScore[] {
  const axes: Array<'nevoa' | 'medo' | 'limites'> = ['nevoa', 'medo', 'limites'];
  
  return axes.map(axis => {
    const axisQuestions = CLARITY_QUESTIONS.filter(q => q.axis === axis);
    let totalScore = 0;
    
    for (const question of axisQuestions) {
      const rawScore = answers[question.id] ?? 0;
      // Aplicar inversão se necessário
      const score = question.inverted ? (MAX_SCORE_PER_QUESTION - rawScore) : rawScore;
      totalScore += score * (question.weight ?? 1);
    }
    
    const maxScore = axisQuestions.length * MAX_SCORE_PER_QUESTION;
    const percentage = maxScore > 0 ? totalScore / maxScore : 0;
    
    return {
      axis,
      label: AXIS_LABELS[axis] || axis,
      totalScore,
      maxScore,
      percentage,
      level: getAxisLevel(totalScore),
    };
  });
}

/**
 * Calcula scores por problema (ProblemTag)
 */
function calculateProblemScores(answers: Record<string, number>): ProblemScore[] {
  // Coletar todos os problemas únicos
  const allProblems = new Set<ProblemTag>();
  CLARITY_QUESTIONS.forEach(q => q.problemTags.forEach(p => allProblems.add(p)));
  
  return Array.from(allProblems).map(problem => {
    // Encontrar perguntas que tocam esse problema
    const relevantQuestions = CLARITY_QUESTIONS.filter(q => 
      q.problemTags.includes(problem)
    );
    
    let totalScore = 0;
    
    for (const question of relevantQuestions) {
      const rawScore = answers[question.id] ?? 0;
      const score = question.inverted ? (MAX_SCORE_PER_QUESTION - rawScore) : rawScore;
      totalScore += score * (question.weight ?? 1);
    }
    
    const maxScore = relevantQuestions.length * MAX_SCORE_PER_QUESTION;
    const percentage = maxScore > 0 ? totalScore / maxScore : 0;
    
    return {
      problem,
      totalScore,
      maxScore,
      percentage,
      questionCount: relevantQuestions.length,
    };
  }).sort((a, b) => b.percentage - a.percentage);
}

/**
 * Determina o nível do eixo baseado no score
 */
function getAxisLevel(score: number): 'baixo' | 'moderado' | 'alto' {
  if (score <= 5) return 'baixo';
  if (score <= 10) return 'moderado';
  return 'alto';
}

/**
 * Determina a zona global baseada no score total
 */
function getGlobalZone(score: number): 'atencao' | 'alerta' | 'vermelha' {
  if (score <= 15) return 'atencao';
  if (score <= 31) return 'alerta';
  return 'vermelha';
}

// -----------------------------------------------------------------------------
// FUNÇÕES DE FORMATAÇÃO
// -----------------------------------------------------------------------------

/**
 * Retorna texto descritivo para a zona global
 */
export function getZoneDescription(zone: 'atencao' | 'alerta' | 'vermelha'): {
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const descriptions = {
    atencao: {
      title: 'Zona de Atenção',
      description: 'Seu resultado mostra alguns sinais que merecem atenção, mas não necessariamente indicam uma situação de risco. Continue observando e registrando episódios para ter mais clareza.',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    alerta: {
      title: 'Zona de Alerta',
      description: 'Seu resultado indica sinais moderados de confusão, medo ou desrespeito a limites. Isso merece atenção e acompanhamento. Considere registrar episódios e buscar apoio.',
      color: 'text-orange-800',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    vermelha: {
      title: 'Zona de Alto Risco',
      description: 'Seu resultado mostra alto nível de confusão, medo e/ou desrespeito a limites. Isso é compatível com relações emocionalmente abusivas. Você não está exagerando. Considere buscar ajuda profissional e criar um plano de segurança.',
      color: 'text-red-800',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  };
  
  return descriptions[zone];
}

/**
 * Retorna texto descritivo para o nível do eixo
 */
export function getAxisLevelDescription(
  axis: 'nevoa' | 'medo' | 'limites',
  level: 'baixo' | 'moderado' | 'alto'
): string {
  const descriptions: Record<string, Record<string, string>> = {
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
