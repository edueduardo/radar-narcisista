// =============================================================================
// CLARITY TEST CONFIG - Configuração do Teste de Clareza
// Conectado ao TOOLS config via ProblemTag
// =============================================================================

import { ProblemTag } from './tools-config';

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

export type AnswerFrequency =
  | 'nunca'
  | 'raramente'
  | 'as_vezes'
  | 'frequentemente'
  | 'quase_sempre';

export interface ClarityQuestion {
  id: string;
  title: string;          // título curto da categoria
  question: string;       // texto da pergunta exibida
  order: number;          // posição na ordem
  problemTags: ProblemTag[]; // problemas que essa pergunta toca
  axis: 'nevoa' | 'medo' | 'limites'; // eixo para compatibilidade
  weight?: number;        // peso opcional (default 1)
  inverted?: boolean;     // se a pontuação é invertida
}

export interface AnswerScoreConfig {
  value: AnswerFrequency;
  label: string;
  score: number;
}

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DE RESPOSTAS
// -----------------------------------------------------------------------------

export const CLARITY_ANSWER_SCORES: AnswerScoreConfig[] = [
  { value: 'nunca', label: 'Nunca', score: 0 },
  { value: 'raramente', label: 'Raramente', score: 1 },
  { value: 'as_vezes', label: 'Às vezes', score: 2 },
  { value: 'frequentemente', label: 'Frequentemente', score: 3 },
  { value: 'quase_sempre', label: 'Quase sempre', score: 4 },
];

// -----------------------------------------------------------------------------
// PERGUNTAS DO TESTE - Conectadas a ProblemTags
// -----------------------------------------------------------------------------

export const CLARITY_QUESTIONS: ClarityQuestion[] = [
  // =========================================================================
  // NÉVOA MENTAL (Gaslighting/Confusão) - 4 perguntas
  // =========================================================================
  {
    id: 'nevoa_1',
    title: 'Névoa mental (gaslighting/confusão)',
    question: 'Você costuma sair de discussões se sentindo confuso(a), sem saber mais o que é verdade ou se você exagerou?',
    order: 1,
    axis: 'nevoa',
    problemTags: ['gaslighting', 'invalidacao'],
    weight: 1,
  },
  {
    id: 'nevoa_2',
    title: 'Névoa mental (gaslighting/confusão)',
    question: 'Quando você tenta falar de algo que te machucou, a outra pessoa faz você se sentir "louco(a)", "dramático(a)" ou exagerado(a)?',
    order: 2,
    axis: 'nevoa',
    problemTags: ['gaslighting', 'invalidacao'],
    weight: 1,
  },
  {
    id: 'nevoa_3',
    title: 'Névoa mental (gaslighting/confusão)',
    question: 'Você já pediu desculpas mesmo achando, no fundo, que não tinha feito nada de errado, só para acabar a briga?',
    order: 3,
    axis: 'nevoa',
    problemTags: ['gaslighting', 'manipulacao'],
    weight: 1,
  },
  {
    id: 'nevoa_4',
    title: 'Névoa mental (gaslighting/confusão)',
    question: 'Você sente dificuldade de confiar na sua própria memória dos fatos, porque a outra pessoa sempre "corrige" a história?',
    order: 4,
    axis: 'nevoa',
    problemTags: ['gaslighting'],
    weight: 1,
  },

  // =========================================================================
  // MEDO E TENSÃO CONSTANTE - 4 perguntas
  // =========================================================================
  {
    id: 'medo_1',
    title: 'Medo e tensão constante',
    question: 'Você sente medo da reação da outra pessoa quando precisa falar de um assunto delicado (dinheiro, família, ex, redes sociais, trabalho)?',
    order: 5,
    axis: 'medo',
    problemTags: ['ameacas', 'manipulacao'],
    weight: 1,
  },
  {
    id: 'medo_2',
    title: 'Medo e tensão constante',
    question: 'Você sente que vive "pisando em ovos", escolhendo cada palavra para não gerar uma explosão ou punição?',
    order: 6,
    axis: 'medo',
    problemTags: ['ameacas', 'manipulacao'],
    weight: 1,
  },
  {
    id: 'medo_3',
    title: 'Medo e tensão constante',
    question: 'Já aconteceu de você esconder coisas neutras (encontros com amigos, compras simples, mensagens normais) só para evitar problema?',
    order: 7,
    axis: 'medo',
    problemTags: ['ameacas', 'isolamento'],
    weight: 1,
  },
  {
    id: 'medo_4',
    title: 'Medo e tensão constante',
    question: 'Você sente tensão física frequente (dor no estômago, aperto no peito, insônia) ligada a essa relação?',
    order: 8,
    axis: 'medo',
    problemTags: ['ameacas', 'autoestima_baixa'],
    weight: 1,
  },

  // =========================================================================
  // DESRESPEITO A LIMITES - 4 perguntas
  // =========================================================================
  {
    id: 'limites_1',
    title: 'Desrespeito a limites',
    question: 'Quando você coloca um limite ("isso me incomoda", "não quero isso"), a outra pessoa costuma respeitar?',
    order: 9,
    axis: 'limites',
    problemTags: ['invalidacao', 'manipulacao'],
    weight: 1,
    inverted: true, // Pergunta invertida - "sim" é bom
  },
  {
    id: 'limites_2',
    title: 'Desrespeito a limites',
    question: 'Você se sente frequentemente diminuído(a), ridicularizado(a) ou tratado(a) como inferior nas conversas?',
    order: 10,
    axis: 'limites',
    problemTags: ['invalidacao', 'autoestima_baixa'],
    weight: 1,
  },
  {
    id: 'limites_3',
    title: 'Desrespeito a limites',
    question: 'A outra pessoa desconsidera ou ridiculariza conquistas suas (trabalho, estudos, cuidado com a casa, aparência)?',
    order: 11,
    axis: 'limites',
    problemTags: ['invalidacao', 'autoestima_baixa'],
    weight: 1,
  },
  {
    id: 'limites_4',
    title: 'Desrespeito a limites',
    question: 'Você sente que a relação funciona só quando você cede, engole e se adapta, e que suas necessidades quase nunca são prioridade?',
    order: 12,
    axis: 'limites',
    problemTags: ['manipulacao', 'invalidacao'],
    weight: 1,
  },
];

// -----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------------------------------------

/** Retorna perguntas ordenadas */
export function getOrderedQuestions(): ClarityQuestion[] {
  return [...CLARITY_QUESTIONS].sort((a, b) => a.order - b.order);
}

/** Retorna perguntas embaralhadas */
export function getShuffledQuestions(): ClarityQuestion[] {
  const questions = [...CLARITY_QUESTIONS];
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

/** Converte valor numérico para AnswerFrequency */
export function scoreToFrequency(score: number): AnswerFrequency {
  const mapping: Record<number, AnswerFrequency> = {
    0: 'nunca',
    1: 'raramente',
    2: 'as_vezes',
    3: 'frequentemente',
    4: 'quase_sempre',
  };
  return mapping[score] || 'nunca';
}

/** Converte AnswerFrequency para valor numérico */
export function frequencyToScore(frequency: AnswerFrequency): number {
  const config = CLARITY_ANSWER_SCORES.find(c => c.value === frequency);
  return config?.score ?? 0;
}
